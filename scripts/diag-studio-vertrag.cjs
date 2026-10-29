const { ausDatei } = require("./lib/welt-boot.cjs");
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
//   §4 G4.1 must-ignore: beweist gate:nervensystem-labs am echten Ingest (0 Auto-Blueprints
//       der Policy-losen kinds, keine Seiten-Fehler)
//   §4 G4.3 Version: der Kern deklariert STUDIO_VERTRAG = 1
//   + SELBST-TEST: eine injizierte Verletzung (Rezept ohne kind) wird erkannt
//     — das Gate ist nicht vakuös.
// Eine neue Domäne (vehicle-core/porta-core) trägt sich in CORES ein und wird
// automatisch mitvalidiert (§5 Andock-Sequenz Schritt 5).
//   node scripts/diag-studio-vertrag.cjs
const vm = require("vm");
const fs = require("fs");
const path = require("path");
const stammLib = require("./lib/stamm.cjs");
const { kanalImVm, ersteAbweichung, DATEN_KANAELE } = require("./lib/asset-worker-harness.cjs");

const root = path.resolve(__dirname, "..");

// Die registrierten Studio-Kerne — N2 (Nervensystem-Plan, „Runtime = Validator"): die Liste
// kommt aus cores.manifest.json, der EINEN Kern-Quelle (Worker-Boot `_ensureAssetFoundry` +
// Platten-Stempel der Transport-Schale `_foundrySchale` + dieser Validator lesen sie). Je Eintrag: file = `vertrag`
// (das Skript, das die Manifest-Blöcke trägt), deps = die übrigen scripts davor (z. B.
// phyto-core vor foundry-core), ns = Namensraum-Kern (Vertrag v1.1 §7, Entscheid E-A): der
// ZWEIT-Kern einer Laufzeit trägt seine Manifest-Blöcke namensgleich unter EINEM Objekt
// statt top-level — löst die const-Kollision mit foundry-core
// (STUDIO_VERTRAG/PORTAL_RENDER_CONFIG/PRESETS) ohne dessen Edit.
const MANIFEST = ausDatei(path.join(root, "cores.manifest.json"), true);
const CORES = MANIFEST.map((c) => ({
    id: c.id,
    file: c.vertrag,
    deps: (Array.isArray(c.scripts) ? c.scripts : []).filter((s) => s !== c.vertrag),
    ns: c.ns || undefined,
    funktion: c.funktion === true,
}));

const REZEPT_ID = /^[a-z0-9_-]+$/;
const { errs, check, wandEnde } = require("./lib/welt-boot.cjs").pruefer();

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

// Alle Kerne in EINEM Kontext wie im Main-Thread — die Seh-Klassen (BUDGET_GESETZ.seh, S3) und die Linse EIN WERT lesen sie.
const KERNE = (() => {
    const ctx = vm.createContext({
        THREE: absorber(),
        console: { log() {}, warn() {}, error() {} },
        performance: { now: () => 0 },
    });
    ctx.self = ctx;
    ctx.globalThis = ctx;
    for (const f of new Set(MANIFEST.flatMap((c) => c.scripts || [])))
        vm.runInContext(ausDatei(path.join(root, f)), ctx, { filename: f, timeout: 30000 });
    return Object.fromEntries(
        Object.keys(ctx)
            .filter((k) => /^__\w+Core$/.test(k))
            .map((k) => [k, ctx[k]])
    );
})();
const SEH_KLASSEN = KERNE.__phytoCore.BUDGET_GESETZ.seh.slice();

// EIN WERT, EINE STELLE (K2): `ersatz` = ein Literal hinter einer Quelle (Konstante des Stamms, Kern, Gesetz-Ruf, Alias; ein
// dynamischer Schlüssel ist eine Tafel-Frage) · `gesetz-ersatz` · `stiller-catch` im Gesetz-Leser · `zwilling` = ein Stamm-Objekt
// mit ≥ 2 markanten Zahlen (eine Reihe zählt doppelt) unter den Schlüsseln eines Kern-Objekts — ein MUSTER, nie ein Name (Lehre 7).
function einWertTaeter(dateien, kerne) {
    const { kinder } = stammLib;
    const asts = dateien.map((d) => ({
        ...d,
        ast: require("acorn").parse(d.src, { ecmaVersion: "latest", locations: true }),
    }));
    const istAR = (n) => n.type === "Identifier" && n.name === "AnazhRealm";
    const istGesetz = (m) => m.type === "MemberExpression" && istAR(m.object) && m.property.name === "Gesetz";
    const KONST = new Set();
    const sammle = (n) => {
        if (n.type === "AssignmentExpression" && n.left.type === "MemberExpression" && istAR(n.left.object))
            KONST.add(n.left.property.name);
        if ((n.type === "PropertyDefinition" || n.kind === "get") && n.static && n.key) KONST.add(n.key.name);
        const dp =
            n.type === "CallExpression" &&
            n.callee.property &&
            n.callee.property.name === "defineProperty" &&
            n.arguments;
        if (dp && istAR(dp[0]) && dp[1].type === "Literal") KONST.add(dp[1].value); // auch eine Getter-Konstante ist definiert
        kinder(n, sammle);
    };
    asts.forEach((a) => sammle(a.ast));
    const konst = (p) => KONST.has(p) && /^[A-Z][A-Z0-9_]*$/.test(p);
    const zahl = (n) =>
        n.type === "Literal" && typeof n.value === "number"
            ? n.value
            : n.type === "UnaryExpression" && n.operator === "-" && n.argument.type === "Literal"
              ? -n.argument.value
              : null;
    const literal = (n) =>
        zahl(n) != null ||
        (n.type === "Literal" && n.value !== null && !n.regex) ||
        (n.type === "TemplateLiteral" && !n.expressions.length) ||
        (n.type === "ArrayExpression" && n.elements.every((e) => e && literal(e))) ||
        (n.type === "ObjectExpression" && n.properties.every((p) => p.type === "Property" && literal(p.value)));
    const quelle = (n, al) => {
        if (n.type === "UnaryExpression" && n.operator === "+") return quelle(n.argument, al);
        if (n.type === "Identifier") return al.get(n.name) || (/^__\w+Core$/.test(n.name) ? n.name : null);
        if (n.type === "LogicalExpression")
            return n.operator === "&&"
                ? quelle(n.right, al)
                : literal(n.right) || n.right.raw === "null"
                  ? quelle(n.left, al)
                  : null;
        if (n.type === "CallExpression") return istGesetz(n.callee) ? "Gesetz" : null;
        if (n.type !== "MemberExpression" || n.computed) return null;
        const [o, p] = [n.object, n.property.name];
        if (
            istAR(o) ||
            (o.type === "MemberExpression" && o.object.type === "ThisExpression" && o.property.name === "constructor")
        )
            return konst(p) ? "AnazhRealm." + p : null;
        if (o.type === "Identifier" && /^(globalThis|window|self)$/.test(o.name))
            return /^(__\w+Core|[A-Z][A-Z0-9_]*)$/.test(p) ? p : null;
        const q = quelle(o, al);
        return q && q + "." + p;
    };
    const nennt = (t, q, al) => {
        const qq = quelle(t, al);
        let ja = !!qq && (qq === q || q.startsWith(qq + "."));
        if (!ja) kinder(t, (c) => (ja = ja || nennt(c, q, al)));
        return ja;
    };
    const [tafeln, gesehen] = [[], new Set()];
    (function w(o, weg, t) {
        if (!o || typeof o !== "object" || gesehen.has(o) || t > 6 || ArrayBuffer.isView(o)) return;
        gesehen.add(o);
        if (Object.keys(o).filter((k) => typeof o[k] === "number").length > 1) tafeln.push({ weg: weg.slice(1), o });
        for (const k of Object.keys(o)) w(o[k], weg + "." + k, t + 1);
    })(kerne, "", 0);
    const gleich = (a, b) => (Array.isArray(a) ? Array.isArray(b) && a.join() === b.join() : a === b);
    const taeter = [];
    for (const { name, src, ast } of asts) {
        const melde = (n, art, q) =>
            taeter.push(
                `${name}:${n.loc.start.line} ${art} ${q} — ${src.slice(n.start, n.end).replace(/\s+/g, " ").slice(0, 80)}`
            );
        const w = (n, al) => {
            if (/^(FunctionDeclaration|FunctionExpression|ArrowFunctionExpression)$/.test(n.type)) al = new Map(al);
            if (n.type === "VariableDeclarator" && n.id.type === "Identifier" && n.init && quelle(n.init, al))
                al.set(n.id.name, quelle(n.init, al));
            const kette = (k) =>
                quelle(k, al) || (k.type === "LogicalExpression" && k.operator !== "&&" ? kette(k.right) : null);
            const qe = n.type === "LogicalExpression" && n.operator !== "&&" && literal(n.right) && kette(n.left);
            if (qe) melde(n, "ersatz", qe); // auch am Ende einer Kette (a || K || "")
            const qk = n.type === "ConditionalExpression" && literal(n.alternate) && quelle(n.consequent, al);
            if (qk && nennt(n.test, qk, al)) melde(n, "ersatz", qk);
            const fb = n.type === "CallExpression" && quelle(n, al) === "Gesetz" && n.arguments[1];
            if (fb && !(fb.type === "Literal" && fb.value === null)) melde(n, "gesetz-ersatz", "Gesetz");
            if (n.type === "CatchClause" && !n.body.body.length && al.get("\0in") === "Gesetz")
                melde(n, "stiller-catch", "AnazhRealm.Gesetz");
            if (n.type === "AssignmentExpression" && istGesetz(n.left))
                return w(n.right, new Map(al).set("\0in", "Gesetz"));
            if (n.type === "ObjectExpression") {
                const z = [];
                for (const p of n.properties) {
                    const k = p.type === "Property" && p.key && (p.key.name || p.key.value);
                    const reihe =
                        k && p.value.type === "ArrayExpression" && p.value.elements.length > 2 && p.value.elements;
                    if (reihe && reihe.every((e) => e && zahl(e) != null))
                        z.push([k, reihe.map(zahl)], [k, reihe.map(zahl)]);
                    else if (
                        k &&
                        zahl(p.value) != null &&
                        ![0, 1, -1, 0.5, 2].includes(zahl(p.value)) &&
                        !/^(min|max|step|lo|hi)$/.test(k)
                    )
                        z.push([k, zahl(p.value)]);
                }
                for (const T of z.length > 1 ? tafeln : []) {
                    const g = z.filter(([k, v]) => gleich(v, T.o[k]));
                    if (g.length > 1)
                        melde(n, "zwilling", T.weg + " {" + [...new Set(g.map((e) => e[0]))].join(", ") + "}");
                }
            }
            kinder(n, (c) => w(c, al));
        };
        w(ast, new Map());
    }
    return taeter;
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
    for (const dep of entry.deps || []) code += ausDatei(path.join(root, dep)) + "\n;";
    code += entry.quelle != null ? entry.quelle : ausDatei(path.join(root, entry.file)); // quelle: der Selbsttest
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
            " funktion: N.FUNKTION === 1," + // §9 (K09a) — Gesetz-Kern: reine Funktionen, keine Rezepte
            " api: Object.keys(N).filter(function (k) { return typeof N[k] === 'function'; })," +
            " oberflaeche: Object.keys(N)," +
            // §9 — ein Rezept unter JEDEM Namen: ein Schlüssel aus PRESET/REZEPT/RECIPE oder eine Liste (Feld/Objekt) von
            // Einträgen mit regler, kind oder Dials s (die benannte Landschaft hieß LANDFORM_PRESETS — die Wand sah nur PRESETS)
            " rezeptig: Object.keys(N).filter(function (k) { var v = N[k];" +
            " if (/PRESET|REZEPT|RECIPE/i.test(k)) return true;" +
            " if (!v || typeof v !== 'object') return false;" +
            " var e = Array.isArray(v) ? v : Object.keys(v).map(function (q) { return v[q]; });" +
            " return e.some(function (x) { return !!x && typeof x === 'object' && !Array.isArray(x) &&" +
            " ('regler' in x || 'kind' in x || (!!x.s && typeof x.s === 'object')); }); })," +
            " zweit: true," + // W8 — ein Zweit-Kern zählt die Gestalten seiner Rezepte selbst (B2c)
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

// §9 — DER GESETZ-KERN (reiner Funktions-Kern): er trägt ein GESETZ als reine Funktionen (die Gelände-Höhe),
// keine Rezepte, keine Gestalt, keine Regler. Der Namensraum erklärt FUNKTION = 1 (und STUDIO_VERTRAG = 1), die
// Manifest-Zeile `"funktion": true` — beide Seiten stimmen überein. Die Brücke liest ihn generisch (kein PRESETS → kein
// Buch-Eintrag, kein build-asset-Dispatch). → Verletzungsliste.
// `erklaert`: die Schlüssel, die §9 „Stand der Gesetz-Kerne" nennt (`gesetzKernErklaert`) — jeder Schlüssel des Namensraums
// steht dort, sonst trägt der Kern, was der Vertrag nicht kennt (K16b legte Bedienung und Landschaften still hinein).
function validateFunktionsKern(m, entry, erklaert) {
    const v = [];
    for (const k of m.rezeptig || []) v.push(`§9: ein Gesetz-Kern trägt keine Rezepte (${k})`);
    if (erklaert)
        for (const k of m.oberflaeche || [])
            if (!erklaert.has(k))
                v.push(`§9: ${k} steht nicht in der Erklärung (studio-vertrag §9 „Stand der Gesetz-Kerne")`);
    if (m.vertrag !== 1) v.push(`G4.3: STUDIO_VERTRAG fehlt oder != 1 (ist: ${m.vertrag})`);
    if (!m.funktion) v.push("§9: der Namensraum erklärt FUNKTION = 1 nicht");
    if (!(entry && entry.funktion === true)) v.push('§9: die Manifest-Zeile erklärt "funktion": true nicht');
    if (!(entry && entry.ns)) v.push("§9: ein Gesetz-Kern trägt einen Namensraum (ns)");
    if (m.presets) v.push("§9: ein Gesetz-Kern trägt keine Rezepte (PRESETS)");
    if (typeof m.build === "function") v.push("§9: ein Gesetz-Kern trägt keine Gestalt (buildInstance)");
    if (m.meshfrei) v.push("§9: MESHFREI gilt Rezept-Kernen ohne Gestalt, nie einem Gesetz-Kern");
    if (m.paramsByKind) v.push("§9: ein Gesetz-Kern trägt keine Regler (PARAMS_BY_KIND)");
    if (!Array.isArray(m.api) || m.api.length < 1) v.push("§9: der Gesetz-Kern trägt keine Funktion");
    return v;
}

// §9 — DIE ERKLÄRUNG der Gesetz-Kerne: jeder Name in Backticks im Absatz „Stand der Gesetz-Kerne" (bis zur Leerzeile).
function gesetzKernErklaert(doc) {
    const i = doc.indexOf("**Stand der Gesetz-Kerne:**");
    if (i < 0) return new Set();
    const e = doc.indexOf("\n\n", i);
    return new Set([...doc.slice(i, e < 0 ? doc.length : e).matchAll(/`([A-Za-z_$][\w$]*)/g)].map((m) => m[1]));
}

// Reine Validierungs-Funktion (auch der Selbst-Test ruft sie) → Verletzungsliste.
// B4 `uniform: true` — DER GESETZ-WERT (studios.K2: ein Griff zeigt ihn ≤ 200 ms, ohne Neubau): nur `true`, und der Byte-Beweis
// steht in der Ratsche — die Zeile bewegt an keinem Rezept ihrer Art ein Bau-Byte (spec/vertraege/ratsche.json reglerGesetz, gemessen
// von gate:regler-wirkt, das dort auch ihren Leser der Welt misst). Eine Zeile, die Bytes bewegt, braucht den Neubau und trägt die Schranke von 1 s.
const REGLER_OHNE_BYTE = new Set(
    Object.keys(ausDatei(path.join(root, "spec/vertraege/ratsche.json"), true).reglerGesetz.zeilen)
);
function validateManifest(m, kern) {
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
    // B2 — kindStages: die Stufen-Wahrheit je Art als Daten (SOLL, wenn
    // vorhanden): nicht-leere, aufsteigende Arrays aus Stufen 0..3 — die Stufe 3 ist NUR-WURF (S3 haus: nie Anzeige, sie
    // wirft für die Art und trägt die Fernform; ihre Budget-Zeile trägt `nurWurf: true`, unten).
    const lodC = m.cfg && m.cfg.lod;
    if (lodC && lodC.kindStages) {
        for (const k in lodC.kindStages) {
            const s = lodC.kindStages[k];
            if (!Array.isArray(s) || !s.length || s.some((x) => !Number.isInteger(x) || x < 0 || x > 3)) {
                v.push(`B2: lod.kindStages.${k} muss ein nicht-leeres Array aus Stufen 0..3 sein`);
            } else {
                for (let i = 1; i < s.length; i++)
                    if (s[i] <= s[i - 1]) v.push(`B2: lod.kindStages.${k} muss strikt aufsteigend sein`);
            }
        }
    }
    // B2c — DAS BUDGET je Art × Stufe (docs/studio-vertrag.md B2c): trägt ein Kern `lod.budget`, dann
    // VOLLSTÄNDIG — jede Art aus seinen kindStages × jede deklarierte Stufe hat eine Zeile {tris, draws,
    // schatten}; tris ganzzahlig > 0, draws ganzzahlig ≥ 1, schatten = eine deklarierte Stufe der Art oder
    // false; MONOTON — tris fällt je Stufe streng, draws steigt nie; die Karten-Stufe (karte: true) ist die
    // letzte Stufe und wirft nicht. Die DARF-Regler (blattKarte endlich > 0, deckung ein Band [lo<=1<=hi]) halten
    // ihre Form. Die Konsum-Wand (gebaute Stufen) steht in gate:asset-contract. S3: die Baum-Zeile des Haupt-Kerns
    // trägt ihre Kosten-Regler als PFLICHT — lagen · geruest · blattKarte · wedel je Stufe 0/1, quote und der Wurf-Teil
    // (wurf.teil "schatten") an der Stufe 1 —, die Nadel-Karte (nadelKarte) und der Blatt-Stride (dichte.laub/nadel) sind
    // gefallen, der Fels bleibt einstufig.
    if (lodC && lodC.budget) {
        const ks = lodC.kindStages || {};
        const B = lodC.budget;
        for (const k in B) {
            // B2c — DIE GESTALTEN je Art (Samen-Zahl je Preset, '*' = jede Art ohne Zeile): ganze Zahlen >= 1,
            // die '*'-Zeile ist Pflicht im HAUPT-Kern (die Welt-Varianten-Wahl liest sie für jede Art ohne Zeile).
            // W8 — ein ZWEIT-Kern zählt die Gestalten SEINER Rezepte selbst (das Wirts-16 gehört dem Gesetzbuch):
            // VOLLSTÄNDIG je eigenem Rezept, kein fremdes Rezept, keine '*'-Zeile (die gehört dem Haupt-Kern).
            if (k === "gestalten") {
                const g = B.gestalten;
                if (!g || typeof g !== "object") v.push("B2c: lod.budget.gestalten ist kein Objekt");
                else {
                    if (!m.zweit && !("*" in g)) v.push("B2c: lod.budget.gestalten trägt keine '*'-Zeile");
                    for (const sp in g)
                        if (!(Number.isInteger(g[sp]) && g[sp] >= 1))
                            v.push(`B2c: lod.budget.gestalten.${sp} muss eine ganze Zahl >= 1 sein`);
                    if (m.zweit) {
                        const P = m.presets || {};
                        for (const sp in g)
                            if (!(sp in P)) v.push(`B2c: lod.budget.gestalten.${sp} — kein Rezept dieses Kerns`);
                        for (const id in P)
                            if (!(id in g)) v.push(`B2c: lod.budget.gestalten.${id} fehlt (je Rezept eine Zahl)`);
                    }
                }
                continue;
            }
            if (!ks[k]) {
                v.push(`B2c: lod.budget.${k} — Art ohne kindStages`);
                continue;
            }
            for (const st in B[k]) {
                if (st === "fernform" || st === "hyst") continue; // Felder der Art (unten), keine Stufe
                if (ks[k].indexOf(Number(st)) < 0) v.push(`B2c: lod.budget.${k}[${st}] — keine gelieferte Stufe`);
            }
            // S3 (DARF, Art-Ebene): die Hysterese der Stufen-Grenze `ab` — 0 < hyst < 0,5 (fern erst jenseits (1+h)·ab,
            // zurück erst innerhalb (1−h)·ab; ab 0,5 läge die Rück-Kante bei der Hälfte der Grenze).
            if ("hyst" in B[k] && !(typeof B[k].hyst === "number" && B[k].hyst > 0 && B[k].hyst < 0.5))
                v.push(`B2c: lod.budget.${k}.hyst muss in (0, 0,5) liegen`);
            // DIE FERNFORM: was die Art jenseits der Nah-Grenze des Wirts ist — "karte" (ihre Karten-Stufe),
            // "gesetz" (ihr Satz im Welt-March) oder "boden" (keine Geometrie). "karte" genau dann, wenn die letzte Stufe
            // Karte ist. PFLICHT je Budget-Art (B2c vollständig): der Host-Leser (_foundryFernForm) liest sie für jede
            // gestreute Art im Zellen-Chokepoint — ein Vertrag ohne sie wäre grün, während der Spielpfad KERN-PFLICHT
            // wirft. Der Schlüssel heißt `fernform`, nie `fern` (der Name der Farn-Art).
            {
                const fern = B[k].fernform;
                const st = Array.isArray(ks[k]) ? ks[k] : [];
                const letzte = st.length ? B[k][st[st.length - 1]] : null;
                const karte = !!(letzte && letzte.karte === true);
                // S3 haus: "huelle" — die Liste der NUR-WURF-Stufe in der Hüllen-Form (N5, Beipack `__fern`); genau dann, wenn
                // die Art eine NUR-WURF-Stufe trägt (sie ist der Träger von `__fern`, die Konsum-Wand in gate:asset-contract),
                // außer ihre Ferne ist das Gesetz
                const nurWurf = st.some((x) => B[k][x] && B[k][x].nurWurf === true);
                if (fern !== "gesetz" && fern !== "boden" && fern !== "karte" && fern !== "huelle")
                    v.push(`B2c: lod.budget.${k}.fernform muss "gesetz", "boden", "karte" oder "huelle" sein`);
                else if ((fern === "karte") !== karte)
                    v.push(`B2c: lod.budget.${k}.fernform — "karte" genau dann, wenn die letzte Stufe Karte ist`);
                else if (fern === "huelle" ? !nurWurf : nurWurf && fern !== "gesetz")
                    v.push(
                        `B2c: lod.budget.${k}.fernform — "huelle" genau dann, wenn eine NUR-WURF-Stufe den Beipack __fern trägt`
                    );
            }
        }
        for (const k in ks) {
            const stufen = Array.isArray(ks[k]) ? ks[k] : [];
            let vor = null;
            let abVor = null;
            for (const st of stufen) {
                const zv = (t) => v.push(`B2c: lod.budget.${k}[${st}]${t}`); // die Zeile beim Namen
                const z = B[k] && B[k][st];
                if (!z || typeof z !== "object") {
                    zv(` fehlt (jede deklarierte Stufe trägt eine Zeile)`);
                    vor = null;
                    continue;
                }
                if (!(Number.isInteger(z.tris) && z.tris > 0)) zv(`.tris muss eine ganze Zahl > 0 sein`);
                if (!(Number.isInteger(z.draws) && z.draws >= 1)) zv(`.draws muss eine ganze Zahl ≥ 1 sein`);
                if (!(z.schatten === false || (Number.isInteger(z.schatten) && stufen.indexOf(z.schatten) >= 0)))
                    zv(`.schatten muss eine deklarierte Stufe oder false sein`);
                // Der Zwilling wirft selbst (der Host zieht ihn als Schatten-Gestalt; ein Kreis 0→1→0 liefe endlos).
                else if (
                    z.schatten !== false &&
                    z.schatten !== st &&
                    !(B[k][z.schatten] && B[k][z.schatten].schatten === z.schatten)
                )
                    zv(`.schatten — der Zwilling (Stufe ${z.schatten}) wirft nicht selbst`);
                if ("karte" in z) {
                    if (z.karte !== true) zv(`.karte ist nur als true erlaubt`);
                    else if (st !== stufen[stufen.length - 1] || z.schatten !== false)
                        zv(`.karte — nur die letzte Stufe ist Karte, und sie wirft nicht`);
                }
                // S3 haus — DIE NUR-WURF-STUFE (B2): nur `true`, nur an der Stufe 3, sie wirft selbst, nie Karte; eine Stufe 3
                // ohne `nurWurf` wäre eine gezeigte Stufe jenseits der Grob-Stufe
                if ("nurWurf" in z) {
                    if (z.nurWurf !== true) zv(`.nurWurf ist nur als true erlaubt`);
                    else if (st !== 3) zv(`.nurWurf — nur die Stufe 3 ist NUR-WURF`);
                    else {
                        if (z.schatten !== st) zv(`.nurWurf — die Stufe wirft selbst (schatten ${st})`);
                        if ("karte" in z) zv(`.nurWurf mit karte — die Wurf-Stufe ist nie Karte`);
                    }
                } else if (st === 3) v.push(`B2: lod.kindStages.${k} — die Stufe 3 trägt nurWurf (nie Anzeige)`);
                if (
                    "blattKarte" in z &&
                    !(typeof z.blattKarte === "number" && z.blattKarte > 0 && isFinite(z.blattKarte))
                )
                    zv(`.blattKarte muss endlich > 0 sein`);
                // S3: die Kosten-Regler der Krone — lagen (Quad-Lagen je Kronen-Pixel, > 0), quote (Dreiecke der
                // Stufe / der Nah-Stufe, in (0, 1)), geruest (Röhren ab geruest·trunkR, in (0, 1)), wedel (der Nadel-Ast als
                // Strähne: ab in [0, 1), teile ganz >= 1, breite > 0, nadel > 0 m, rand >= 0 Nadel-Größen, winkel in (0°, 45°),
                // holz in [0, 1) — Gegenprüfung R1: der Wedel kreuzt ±winkel aus der Lotrechten, seine Breite ist die Hülle der
                // Nadel-Wolke, seine Farbe das Mittel aus Nadel und Holz).
                if ("lagen" in z && !(typeof z.lagen === "number" && z.lagen > 0 && isFinite(z.lagen)))
                    zv(`.lagen muss endlich > 0 sein`);
                if ("quote" in z && !(typeof z.quote === "number" && z.quote > 0 && z.quote < 1))
                    zv(`.quote muss in (0, 1) liegen`);
                if ("geruest" in z && !(typeof z.geruest === "number" && z.geruest > 0 && z.geruest < 1))
                    zv(`.geruest muss in (0, 1) liegen`);
                if ("wedel" in z) {
                    const w = z.wedel;
                    if (
                        !w ||
                        !(w.ab >= 0 && w.ab < 1) ||
                        !(Number.isInteger(w.teile) && w.teile >= 1) ||
                        !(w.breite > 0 && isFinite(w.breite)) ||
                        !(w.nadel > 0 && isFinite(w.nadel)) ||
                        !(w.rand >= 0 && isFinite(w.rand)) ||
                        !(w.winkel > 0 && w.winkel < 45) ||
                        !(w.spalte > 0 && isFinite(w.spalte)) ||
                        !(w.holz >= 0 && w.holz < 1)
                    )
                        zv(
                            `.wedel muss ab in [0, 1), teile (ganz >= 1), breite (> 0), nadel (> 0), rand (>= 0), winkel in (0, 45), spalte (> 0) und holz in [0, 1) tragen`
                        );
                }
                // W5: der Anteil der gewachsenen Blattstellen je Kronen-Art, die eine Karte/Strähne tragen — (0, 1].
                if ("dichte" in z) {
                    const d = z.dichte;
                    if (!d || typeof d !== "object" || !Object.keys(d).length)
                        zv(`.dichte muss ein Objekt je Kronen-Art sein`);
                    else
                        for (const art of Object.keys(d))
                            if (!(typeof d[art] === "number" && d[art] > 0 && d[art] <= 1))
                                zv(`.dichte.${art} muss in (0, 1] liegen`);
                }
                // S7: die Regler der Nahkrone — rinde {ast, reisig} in trunkR (0 < reisig < ast < 1), straehne {teile
                // ganz >= 1, breite > 0} in Blattlaengen (die Baum-Zeilen dazu holz in [0, 1): der Holz-Anteil an der Farbe der
                // Strähne, Gegenprüfung R1), boden in [0, 1) Baumhoehen.
                if ("rinde" in z) {
                    const r = z.rinde;
                    if (!r || !(r.reisig > 0 && r.reisig < r.ast && r.ast < 1))
                        zv(`.rinde muss 0 < reisig < ast < 1 tragen`);
                }
                if ("straehne" in z) {
                    const r = z.straehne;
                    if (
                        !r ||
                        !(Number.isInteger(r.teile) && r.teile >= 1) ||
                        !(r.breite > 0 && isFinite(r.breite)) ||
                        (k === "tree" && !(r.holz >= 0 && r.holz < 1))
                    )
                        zv(`.straehne muss teile (ganz >= 1), breite (> 0) und am Baum holz in [0, 1) tragen`);
                }
                if ("boden" in z && !(typeof z.boden === "number" && z.boden >= 0 && z.boden < 1))
                    zv(`.boden muss in [0, 1) liegen`);
                // S3: die Rispe des Grases — Grannen (ganz >= 1) und Segmente je Rispe (ganz 1..3: die Stufe tastet
                // die EINE Kurve der Granne in 3 Segmenten ab, sie verfeinert nie), die Breite der Granne in Einheiten der
                // vollen (> 0); emitGrass liest sie je gelieferter Stufe.
                if ("rispe" in z) {
                    const r = z.rispe;
                    const ganz = (x) => Number.isInteger(x) && x >= 1;
                    if (
                        !r ||
                        !ganz(r.grannen) ||
                        !ganz(r.segmente) ||
                        r.segmente > 3 ||
                        !(r.breite > 0 && isFinite(r.breite))
                    )
                        zv(`.rispe muss grannen, segmente (ganz, 1..3) und breite (> 0) tragen`);
                }
                // W6: die Bahn der L1-Aeste — ein Ring faellt, wenn Mitte und Radius hoechstens so viele
                // Baumhoehen von der Strecke seiner Nachbarn abweichen (foundry-core __ringBahn): 0 < ringToleranz < 0,01.
                if (
                    "ringToleranz" in z &&
                    !(typeof z.ringToleranz === "number" && z.ringToleranz > 0 && z.ringToleranz < 0.01)
                )
                    zv(`.ringToleranz muss in (0, 0,01) Baumhoehen liegen`);
                // W6: der Wurf-Teil — Straenge ab durchmesserM Welt-Durchmesser werfen (der Kaskaden-Texel k0);
                // nur eine Stufe, die selbst wirft, kann einen Wurf-Teil nennen.
                // S3 — das EINE Wurf-Gesetz in zwei Formen, dieselbe Regel (nur eine Stufe, die selbst wirft, nennt ihn):
                // die Gelenk-Gestalt nennt ihren Wurf-Teil als Seh-Klassen (`wurf.seh` — eine nicht-leere Teilmenge von
                // phyto-core BUDGET_GESETZ.seh ohne Doppel); der Baum (E1) als eigenes Gitter `teil` ("schatten") mit
                // höchstens `tris` Dreiecken, seine Karten auf höchstens `lagen` Lagen; durchmesserM bleibt die Texel-Grenze.
                if ("wurf" in z) {
                    const w = z.wurf;
                    const sehForm = !!w && typeof w === "object" && "seh" in w;
                    if (sehForm) {
                        const s = w.seh;
                        if (
                            !Array.isArray(s) ||
                            !s.length ||
                            s.some((x) => SEH_KLASSEN.indexOf(x) < 0) ||
                            new Set(s).size !== s.length
                        )
                            zv(`.wurf.seh muss eine Teilmenge der Seh-Klassen sein`);
                    } else if (
                        !w ||
                        !(typeof w.durchmesserM === "number" && w.durchmesserM > 0 && isFinite(w.durchmesserM))
                    )
                        zv(`.wurf.durchmesserM muss endlich > 0 sein`);
                    if (w && z.schatten !== Number(st))
                        zv(`.wurf — nur eine Stufe, die selbst wirft, nennt einen Wurf-Teil`);
                    if (w && "teil" in w && w.teil !== "schatten") zv(`.wurf.teil muss "schatten" sein`);
                    if (
                        w &&
                        "teil" in w &&
                        !(Number.isInteger(w.tris) && w.tris > 0 && w.lagen > 0 && isFinite(w.lagen))
                    )
                        zv(`.wurf mit teil trägt tris (ganz > 0) und lagen (> 0)`);
                }
                // S3 (DARF): die Stufen-Grenze — ab `ab` m × Körpergröße trägt die Stufe das Bild (die Gelenk-Gestalt
                // liest sie, `_gelenkStufe`): endlich > 0, nie an der ersten Stufe, streng steigend über die Stufen.
                if ("ab" in z) {
                    if (!(typeof z.ab === "number" && z.ab > 0 && isFinite(z.ab))) zv(`.ab muss endlich > 0 sein`);
                    else if (st === stufen[0]) zv(`.ab — die erste Stufe beginnt bei 0`);
                    else if (abVor !== null && !(z.ab > abVor)) zv(`.ab steigt nicht streng (${abVor} → ${z.ab})`);
                    if (typeof z.ab === "number") abVor = z.ab;
                }
                // das Reisig des Strauchs — schnitt (Radius-Schnitt der Stufe in trunkR:
                // duennere Straenge fallen) < rute (in trunkR: darunter Vierkant-Roehre auf jedem 3. Ring) < 1.
                if (("schnitt" in z || "rute" in z) && !(z.schnitt > 0 && z.rute > z.schnitt && z.rute < 1))
                    zv(` muss 0 < schnitt < rute < 1 tragen`);
                // W8 — `band` = das Profi-Band-Ziel der Stufe, solange die gebaute Huelle (`tris`) darueber liegt:
                // ganze Zahl > 0 und < tris (erreicht die Stufe das Band, faellt das Feld und tris IST das Band).
                if (
                    "band" in z &&
                    !(Number.isInteger(z.band) && z.band > 0 && Number.isInteger(z.tris) && z.band < z.tris)
                )
                    zv(`.band muss eine ganze Zahl > 0 und < tris sein`);
                if ("deckung" in z) {
                    const d = z.deckung;
                    if (!Array.isArray(d) || d.length !== 2 || !(d[0] > 0 && d[0] <= 1 && d[1] >= 1 && isFinite(d[1])))
                        zv(`.deckung muss ein Band [lo<=1<=hi] sein`);
                }
                if (vor) {
                    if (!(z.tris < vor.z.tris))
                        v.push(
                            `B2c: lod.budget.${k} — tris fällt nicht streng (${vor.st}: ${vor.z.tris} → ${st}: ${z.tris})`
                        );
                    if (z.draws > vor.z.draws)
                        v.push(`B2c: lod.budget.${k} — draws steigt (${vor.st}: ${vor.z.draws} → ${st}: ${z.draws})`);
                }
                vor = { st, z };
            }
        }
        // K43 (Studio-Welle 1, DIE TOR-STUFEN) — PFLICHT, wo die Art gate lebt: die Kosten liegen im Asset, nicht im Wirt. Das Tor
        // trägt die Kette L0 → L1 → Fernform: Stufe 0, Stufe 1 mit ihrer Grenze `ab` (die Distanz im Kern) und der Hysterese der
        // Art, die NUR-WURF-Stufe 3 (Wurf und Fernform "huelle"), jede mit Zeile, tris streng fallend (L0 > L1 > Fern).
        // K64 (die Stufe 2): die Kette L0 → L1 → L2 → Fernform, die Grenze der Stufe 2 jenseits der Stufe 1, tris streng fallend.
        if (ks.gate) {
            const G = B.gate || {};
            const st = ks.gate;
            const kette =
                st.length === 4 &&
                st[0] === 0 &&
                st[1] === 1 &&
                st[2] === 2 &&
                st[3] === 3 &&
                G[0] &&
                G[1] &&
                G[2] &&
                G[3] &&
                G[3].nurWurf === true &&
                G.fernform === "huelle" &&
                typeof G[1].ab === "number" &&
                typeof G[2].ab === "number" &&
                G[2].ab > G[1].ab &&
                typeof G.hyst === "number" &&
                G[0].tris > G[1].tris &&
                G[1].tris > G[2].tris &&
                G[2].tris > G[3].tris;
            if (!kette)
                v.push(
                    "B2c: lod.budget.gate trägt die Stufen-Kette nicht (K43/K64: kindStages [0, 1, 2, 3], Zeilen 0 · 1 und 2 mit steigendem ab · 3 nurWurf, hyst, fernform huelle, tris L0 > L1 > L2 > Fern)"
                );
        }
        // S3 — PFLICHT im Haupt-Kern: die Baum-Stufen 0/1 tragen ihre Kosten-Regler, der Fels ist
        // einstufig (eine Fels-L1 spart an der Mess-Wiese < 3k Dreiecke: formationen 10 240 / Haushalt 30 000).
        if (!m.zweit && B.tree) {
            for (const st of [0, 1]) {
                const z = B.tree[st];
                if (!z) continue;
                for (const f of ["lagen", "geruest", "blattKarte", "wedel"])
                    if (!(f in z)) v.push(`B2c: lod.budget.tree[${st}].${f} fehlt (S3-Pflicht)`);
                for (const f of ["nadelKarte"])
                    if (f in z) v.push(`B2c: lod.budget.tree[${st}].${f} ist gefallen (S3: der Wedel)`);
                if (z.dichte && ("laub" in z.dichte || "nadel" in z.dichte))
                    v.push(`B2c: lod.budget.tree[${st}].dichte.laub/nadel ist gefallen (S3: die Lagen-Wahl)`);
            }
            if (B.tree[1] && !("quote" in B.tree[1])) v.push("B2c: lod.budget.tree[1].quote fehlt (S3-Pflicht)");
            if (B.tree[1] && !(B.tree[1].wurf && B.tree[1].wurf.teil === "schatten"))
                v.push('B2c: lod.budget.tree[1].wurf.teil "schatten" fehlt (S3-Pflicht: der Schatten-Teil)');
        }
        if (!m.zweit && ks.rock && (ks.rock.length !== 1 || ks.rock[0] !== 0 || (B.rock && 1 in B.rock)))
            v.push("B2c: lod.kindStages.rock ist [0] (S3: die Fels-L1 ist FINAL GESTRICHEN)");
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
        // B3b — DAS BODEN-GESETZ (placement.boden): jede Zeile ist eine Studio-Art DIESES Kerns,
        // deren kind Stufen UND für jede Stufe eine Budget-Zeile trägt (die Nah-Streu der Welt baut sie über die
        // Foundry) und die eine eigene Gestalten-Zeile hat (nie '*' = 16); ring ∈ {nah, wald}, dichte > 0,
        // skala [min ≤ max] > 0, jedes Band ein Trapez [a ≤ b ≤ c ≤ d].
        if (pl.boden) {
            const L = (m.cfg && m.cfg.lod) || {};
            const ksB = L.kindStages || {};
            const BB = L.budget || {};
            for (const id in pl.boden) {
                const z = pl.boden[id] || {};
                const bv = (t) => v.push(`B3b: placement.boden.${id}${t}`);
                const pre = m.presets && m.presets[id];
                if (!pre) {
                    bv(` — kein Preset dieses Kerns`);
                    continue;
                }
                const st = ksB[pre.kind];
                if (!Array.isArray(st) || !st.length) bv(` — kind ${pre.kind} ohne kindStages`);
                else
                    for (const sv of st)
                        if (!(BB[pre.kind] && BB[pre.kind][sv])) bv(` — Budget ${pre.kind}[${sv}] fehlt`);
                if (!(BB.gestalten && Number.isInteger(BB.gestalten[id]) && BB.gestalten[id] >= 1))
                    bv(` — keine eigene Gestalten-Zeile`);
                if (z.ring !== "nah" && z.ring !== "wald") bv(`.ring muss nah|wald sein`);
                if (!(typeof z.dichte === "number" && z.dichte > 0)) bv(`.dichte muss Zahl > 0 sein`);
                if (z.weite !== undefined && !(typeof z.weite === "number" && z.weite > 0))
                    bv(`.weite muss Zahl > 0 sein`);
                if (!Array.isArray(z.skala) || z.skala.length !== 2 || !(z.skala[0] > 0 && z.skala[0] <= z.skala[1]))
                    bv(`.skala muss [min ≤ max] > 0 sein`);
                for (const band of ["licht", "feucht", "ufer", "fels"]) {
                    const t = z[band];
                    if (t === undefined) continue;
                    if (!Array.isArray(t) || t.length !== 4 || !(t[0] <= t[1] && t[1] <= t[2] && t[2] <= t[3]))
                        bv(`.${band} muss ein Trapez [a ≤ b ≤ c ≤ d] sein`);
                }
            }
        }
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
                    else if (p.uniform !== undefined && p.uniform !== true)
                        v.push(`B4: PARAMS_BY_KIND.${kind} "${p.id}" uniform ist nur true`);
                    else if (p.uniform && !REGLER_OHNE_BYTE.has(`${kern}:${kind}:${p.id}`))
                        v.push(
                            `B4: PARAMS_BY_KIND.${kind} "${p.id}" uniform ohne Byte-Beweis (${kern}:${kind}:${p.id} fehlt in reglerGesetz — die Zeile baut neu)`
                        );
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
    // DIE GEFÜHLS-BLÖCKE sind VERTRAG, nicht mehr nur
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
        // SPIEGEL-ZENSUS 17.07. (BEWEGUNG-Rest) — die gereisten Boden-Blöcke
        // sind Vertrag (dieselben Felder, die die _bewegungsBlock-Wand des
        // Wirts prüft: EIN fehlendes Feld → ganz Fallback, nie Misch-Gesetz).
        if (p && Number.isFinite(p.kletterV) && !Number.isFinite(p.kontaktFrischeSec))
            v.push("§8.2+ parkour.kontaktFrischeSec fehlt (das EINE Wandkontakt-Fenster)");
        const lf = fxB.luft;
        if (!lf || !Number.isFinite(lf.kAcc) || !Number.isFinite(lf.kAccLuft) || !Number.isFinite(lf.kBrakeLuft))
            v.push("§8.2+ fx.bewegung.luft unvollständig (kAcc/kAccLuft/kBrake/kBrakeLuft)");
        const spg = fxB.sprung;
        if (!spg || !Number.isFinite(spg.coyoteSec) || !Number.isFinite(spg.bufferSec))
            v.push("§8.2+ fx.bewegung.sprung unvollständig (coyoteSec/bufferSec)");
        if (!fxB.schritt || !Number.isFinite(fxB.schritt.taktCompound) || !Number.isFinite(fxB.schritt.klangTempoMin))
            v.push("§8.2+ fx.bewegung.schritt unvollständig (taktCompound/klangTempoMin)");
        // K07: die Zweibeiner-Zeile des EINEN Gang-Gesetzes (tetrapoda gangSchritt/gangFuss)
        const gz = fxB.gang;
        const GANG_FELDER = [
            "schrittBasis",
            "schrittFroude",
            "tastgrad",
            "tastgradLauf",
            "laufFroude",
            "maxWinkel",
            "hub",
            "hubLauf",
            "hubForm",
            "beckenHub",
        ];
        if (!gz || !GANG_FELDER.every((k) => Number.isFinite(gz[k])))
            v.push(`§8.2+ fx.bewegung.gang unvollständig (${GANG_FELDER.join("/")})`);
        if (!Number.isFinite(fxB.aktionAusdauer)) v.push("§8.2+ fx.bewegung.aktionAusdauer fehlt (Maus-Arm-Aktion)");
    }
    if (m.arena) {
        const a = m.arena;
        // SPIEGEL-ZENSUS 17.07. — die gereisten Zensus-Zeilen sind Vertrag:
        // je Block deckt EIN Wander-Feld mit (windupFrac = Hieb-Geometrie,
        // wucht = die Wucht des Stoßes (das EINE Impuls-Gesetz, 0710-2), muendungM = Pfeil-Flug — dieselben
        // Felder, die die _arenaGesetz-Gültigkeits-Wand des Wirts prüft).
        if (
            !a.schwung ||
            !Number.isFinite(a.schwung.dauerProSqrtIKg) ||
            !Number.isFinite(a.schwung.windupFrac) ||
            !a.gefuehl ||
            !Number.isFinite(a.gefuehl.keRefJ) ||
            !Number.isFinite(a.gefuehl.wucht) ||
            !Number.isFinite(a.gefuehl.pProKb) ||
            !a.bogen ||
            !Number.isFinite(a.bogen.mArrow) ||
            !Number.isFinite(a.bogen.muendungM)
        )
            v.push(
                "§B6+ ARENA unvollständig (schwung.dauerProSqrtIKg/windupFrac · gefuehl.keRefJ/wucht/pProKb · bogen.mArrow/muendungM)"
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
        // SCHLUSS-WELLE 17.07.: "schwellen" ist die Schwellen-DATEN-Zeile der
        // Stimmungs-Tabelle (keine Stimmung) — die Zeilen-Prüfung überspringt sie.
        const sOk =
            V.stimmung &&
            typeof V.stimmung === "object" &&
            Object.entries(V.stimmung).every(
                ([sk, st]) =>
                    sk === "schwellen" ||
                    (st && Array.isArray(st.aktionen) && Array.isArray(st.alle) && st.alle.length === 2)
            );
        if (!aOk || !sOk) v.push("§B6+ VERHALTEN unvollständig (aktionen ≥8 / stimmung{aktionen,alle[2]})");
        else {
            for (const k in V.stimmung) {
                if (k === "schwellen") continue;
                for (const an of V.stimmung[k].aktionen)
                    if (!V.aktionen[an]) v.push(`§B6+ VERHALTEN: Stimmung "${k}" nennt unbekannte Aktion "${an}"`);
            }
        }
        // SPIEGEL-ZENSUS 17.07. — die KREATUR-SEELE ist Vertrag: die vier
        // gereisten Verhaltens-Blöcke (jagd/furcht/temperament/wandern) —
        // dieselben Felder, die die _verhaltenGesetz-Gültigkeits-Wand des
        // Wirts prüft (je Block EIN Wander-Feld; alter Kern → ganz byte-alt).
        const seeleOk =
            V.jagd &&
            Number.isFinite(V.jagd.strikeCooldownSec) &&
            // DER BISS IST DER ANSPRUNG (Welle LF kampf): die Reichweite um die Mitten und der feste
            // Pirsch-Stopp kehren nicht zurueck (die Reichweite ist der Weg des Ansprungs, der Halt das Maul am Leib).
            V.jagd.strikeRange === undefined &&
            V.jagd.pirschStoppM === undefined &&
            V.furcht &&
            Number.isFinite(V.furcht.fleeThreshold) &&
            V.temperament &&
            V.temperament.profile &&
            // DAS TEMPERAMENT DER GATTUNG: die Gattungs-Zeile (diet × die EINE Masse des Leibs in kg) und der Mut
            // der Natur sind Vertrag; die Substanz-Signaturen, ihr Floor und die Substanz-Gewichte der Furcht kehren nicht
            // zurueck (die Tiere sind tag-gleich, Lehre 8).
            V.temperament.gattung &&
            Number.isFinite(V.temperament.gattung.fleischDiet) &&
            Number.isFinite(V.temperament.gattung.pflanzDiet) &&
            Number.isFinite(V.temperament.gattung.jagdKg) &&
            Number.isFinite(V.temperament.gattung.wehrKg) &&
            Number.isFinite(V.temperament.gattung.kolossKg) &&
            V.temperament.gattung.jagdMasse === undefined && // die Dial-Masse (size × Größe) kehrt nicht zurück
            V.temperament.signaturen === undefined &&
            V.temperament.floor === undefined &&
            Number.isFinite(V.furcht.mutGewicht) &&
            V.furcht.boldFromDichte === undefined &&
            V.furcht.shyFromLebendig === undefined &&
            V.wandern &&
            Number.isFinite(V.wandern.leashBaseM) &&
            // SCHLUSS-WELLE 17.07. — die neun heimgekehrten Blöcke sind Vertrag
            // (dieselben Felder, die die _verhaltenGesetz-Wand des Wirts prüft):
            // DIE JAGD SCHLIESST SICH: der Ring der Hetze, die Pirsch-Sicht und die
            // Beute-Masse sind Vertrag; der Gradienten-Schritt der Witterung und der Trab der Flucht kehren nicht zurueck
            // (die Flucht ist der Sprint der Gestalt, STEUER_GESETZ.sprint).
            Number.isFinite(V.jagd.hetzM) &&
            Number.isFinite(V.jagd.pirschSichtM) &&
            Number.isFinite(V.jagd.beuteMasse) &&
            V.jagd.scentProbeM === undefined &&
            V.jagd.radius === undefined && // die Spieler-Reichweite ohne Wind kehrt nicht zurueck (oekologie.K4)
            V.furcht.fleeSpeedBoost === undefined &&
            V.stimmung &&
            V.stimmung.schwellen &&
            Number.isFinite(V.stimmung.schwellen.weideDiet) &&
            V.freude &&
            Number.isFinite(V.freude.tempoMul) &&
            // DAS SPRUNG-GESETZ: die Huepf-Hoehen sind die EINE Quelle eines Sprungs,
            // eine Aktion traegt nur `hop: true` (der Abflug in m/s und sprung.impulsProM fielen).
            Number.isFinite(V.freude.hopHochM) &&
            Number.isFinite(V.freude.hopBasisM) &&
            V.sprung === undefined &&
            Object.values(V.aktionen || {}).every((a) => a.hop === undefined || a.hop === true) &&
            Array.isArray(V.groessen) &&
            V.groessen.length >= 2 &&
            V.separation &&
            // DER PERSOENLICHE RAUM: der Raum je Leib (raumKugel × Koerper-Kugel), das
            // Herden-Fenster im Paar-Raum; der feste Paar-Radius, das feste Fenster und der Neugier-Stopp kehren nicht zurueck.
            Number.isFinite(V.separation.raumKugel) &&
            V.separation.radiusBaseM === undefined &&
            V.furcht.neugierStoppM === undefined &&
            V.aufgaben &&
            Number.isFinite(V.aufgaben.followTempo) &&
            V.herde &&
            Number.isFinite(V.herde.gewicht) &&
            Number.isFinite(V.herde.fensterRaum) &&
            V.herde.minAbstSq === undefined &&
            V.herde.fensterSq === undefined &&
            V.wasser &&
            Number.isFinite(V.wasser.uferBias);
        if (!seeleOk)
            v.push(
                "§B6+ VERHALTEN unvollständig (KREATUR-SEELE: jagd.strikeCooldownSec/hetzM/pirschSichtM/beuteMasse ohne Gradienten-Schritt und Spieler-Radius, Reichweite um die Mitten und festen Pirsch-Stopp · furcht.fleeThreshold ohne Trab-Flucht · temperament{gattung,profile} ohne Substanz-Signaturen, furcht.mutGewicht ohne Substanz-Gewichte · wandern.leashBaseM · stimmung.schwellen · freude{tempoMul,hopHochM,hopBasisM} ohne sprung-Zwilling, hop nur true · groessen/separation{raumKugel}/aufgaben/herde{fensterRaum} ohne festen Paar-Radius, Fenster und Neugier-Stopp/wasser)"
            );
    }
    return v;
}

(function main() {
    console.log("=== DER STUDIO-VERTRAG — Manifest-Validator (docs/studio-vertrag.md) ===");

    // §0 — das Vertrags-Dokument selbst steht + trägt die sechs Blöcke.
    const docPath = path.join(root, "docs/studio-vertrag.md");
    const doc = fs.existsSync(docPath) ? ausDatei(docPath) : "";
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
    const budgets = {}; // B2c: lod.budget je Kern (Datei → Budget), für die Karten-Linse unten
    const ohneBudget = []; // W8: ein Kern mit Gestalt (kindStages) ohne Budget ist ein Vertrags-Bruch
    const ohneGestalten = []; // W8: ein Zweit-Kern mit Gestalt ohne lod.budget.gestalten ebenso
    for (const entry of CORES) {
        console.log(`\n--- Kern: ${entry.file} ---`);
        let m = null;
        try {
            m = loadCore(entry);
        } catch (e) {
            check(`${entry.file}: lädt im vm (THREE-Stub)`, false, (e && e.message) || String(e));
            continue;
        }
        const funktionsKern = m.funktion || entry.funktion === true;
        const viol = funktionsKern
            ? validateFunktionsKern(m, entry, gesetzKernErklaert(doc))
            : validateManifest(m, entry.id);
        const lodM = m.cfg && m.cfg.lod;
        if (lodM && lodM.budget) budgets[entry.file] = { budget: lodM.budget, kindStages: lodM.kindStages || {} };
        else if (lodM && lodM.kindStages) ohneBudget.push(entry.file);
        if (entry.ns && lodM && lodM.kindStages && !(lodM.budget && lodM.budget.gestalten))
            ohneGestalten.push(entry.file);
        check(`${entry.file}: 0 Vertrags-Verletzungen`, viol.length === 0, viol[0] || "");
        for (let i = 1; i < viol.length; i++) console.log(`      ↳ ${viol[i]}`);
        const n = m.presets ? Object.keys(m.presets).length : 0;
        const kinds = m.presets ? [...new Set(Object.values(m.presets).map((r) => r && r.kind))] : [];
        console.log(`      ${n} Rezepte · kinds: ${kinds.join(", ")}`);
        if (funktionsKern)
            check(
                `${entry.file}: §9 Gesetz-Kern (${m.api.length} Funktionen: ${m.api.join(" · ")})`,
                viol.length === 0 && n === 0
            );
        else
            check(
                `${entry.file}: B1+B2 MUSS erfüllt (Rezepte + build | MESHFREI §8)`,
                n >= 1 && (typeof m.build === "function" || m.meshfrei === true)
            );
    }

    // W8 — JEDER Kern mit Gestalt trägt sein Budget (B2c), jeder Zweit-Kern seine Gestalten je Rezept: die
    // Studio-Übertragung ist kein offener Rest mehr. Klang trägt keine Gestalt (keine kindStages) und kein Budget.
    check(
        "B2c: jeder Kern mit Gestalt (kindStages) trägt lod.budget",
        ohneBudget.length === 0 && Object.keys(budgets).length >= 7,
        ohneBudget.length ? "Budget fehlt: " + ohneBudget.join(", ") : Object.keys(budgets).join(", ")
    );
    check(
        "B2c: jeder Zweit-Kern mit Gestalt zählt seine Gestalten (lod.budget.gestalten — Gesetzbuch statt Wirts-16)",
        ohneGestalten.length === 0,
        ohneGestalten.join(", ")
    );

    // U — DER EINGEFRORENE UMSCHLAG IM PULS: was ein Kern deklariert (Rezepte · Welt-Palette · Stufen und
    // Budget jeder Art), reist im EINEN Umschlag (get-book) zum Wirt; seine drei Daten-Kanäle sind eingefroren
    // (spec/asset-contract/v1/golden, Re-Mint = Vertrags-Akt). Hier antwortet DERSELBE Kanal der Brücke im Node-vm
    // (umschlagImVm, dieselben Dateien wie der Worker) und jede Abweichung steht beim Schlüssel; gate:asset-contract
    // bleibt der Beweis im Browser.
    const umschlagBefunde = (quellen) => {
        const u = kanalImVm(quellen)({ type: "get-book" });
        const out = [];
        for (const [feld, key] of DATEN_KANAELE) {
            const gold = ausDatei(path.join(root, "spec", "asset-contract", "v1", "golden", key + ".json"));
            if (JSON.stringify(u[feld]) === gold.trim()) continue;
            const a = ersteAbweichung(u[feld], JSON.parse(gold));
            out.push(`${key} ${a ? `${a.pfad}: Kern ${a.ist} ≠ eingefroren ${a.soll}` : "weicht ab"}`);
        }
        return out;
    };
    const umschlag = umschlagBefunde();
    check(
        "U: der Umschlag der Kerne (recipes · world-params · render-config) trifft die eingefrorenen JSONs byte-genau",
        umschlag.length === 0,
        umschlag.length
            ? umschlag.join(" · ") + " — Vertrags-Akt: MINT_NUR_DATEN=1 node scripts/mint-asset-goldens.cjs"
            : `${DATEN_KANAELE.length}/${DATEN_KANAELE.length} byte-gleich`
    );
    // Selbsttest: eine Budget-Zeile eines Zweit-Kerns und ein Rezept-Regler des Haupt-Kerns, nach dem Laden verschoben —
    // die Wand nennt beide Schlüssel.
    {
        const lese = (f) => ausDatei(path.join(root, f));
        const st = umschlagBefunde({
            "porta-core.js":
                lese("porta-core.js") + "\n;__portaCore.PORTAL_RENDER_CONFIG.lod.budget.gate[2].tris += 1;",
            "foundry-core.js": lese("foundry-core.js") + "\n;PRESETS.eiche.s[Object.keys(PRESETS.eiche.s)[0]] += 0.5;",
        });
        check(
            "SELBST-TEST U: ein verschobenes Tor-Budget und ein verschobener Eichen-Regler fallen beim Schlüssel",
            st.some((z) => z.startsWith("render-config lod.zusatzBudget.porta.gate.2.tris:")) &&
                st.some((z) => /^recipes eiche\.s\.\w+:/.test(z)),
            st.join(" · ")
        );
    }
    console.log(`      Budget (B2c) trägt: ${Object.keys(budgets).join(", ") || "—"}`);

    // W8 — DIE SIPPE IST EINE REGEL (Absenz): Flatten und Starr-Bindung gruppieren nach der Sippe des Gesetzes, nie nach
    // einer eigenen Attribut-Signatur (kein Zwilling). Die Leser des Budget-Gesetzes beweisen gate:sippen-wirt,
    // gate:asset-contract und gate:kreatur-kosten am Verhalten.
    // (über den EINEN Absenz-Helfer; ein totes Glied wirft beim Namen)
    check(
        "W8: Flatten und Starr-Bindung tragen keine eigene Attribut-Signatur (die Sippe des Gesetzes gruppiert)",
        stammLib.fehlt(["_foundryFlatVerschmelzen", "_ofenStarrBinden"], /Object\.keys\(g\.attributes\)\s*\.sort\(\)/),
        stammLib.fehlt.wo
    );

    // DIE PFLICHT JE KERN: die Gefühls-Blöcke der V18.483/485-Wellen sind Vertrag. Fehlt der Block im
    // tragenden Kern, ist das ROT.
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
        "tetrapoda-core.js": (m) =>
            !!(
                m.verhalten &&
                m.verhalten.aktionen &&
                m.verhalten.stimmung &&
                m.verhalten.jagd &&
                m.verhalten.furcht &&
                m.verhalten.temperament &&
                m.verhalten.wandern &&
                // SCHLUSS-WELLE 17.07. — die neun heimgekehrten Blöcke:
                m.verhalten.stimmung.schwellen &&
                m.verhalten.freude &&
                // (sprung fiel mit dem Sprung-Gesetz)
                m.verhalten.groessen &&
                m.verhalten.separation &&
                m.verhalten.aufgaben &&
                m.verhalten.herde &&
                m.verhalten.wasser
            ),
    };
    for (const entry of CORES) {
        if (!pflicht[entry.file]) continue;
        let m = null;
        try {
            m = loadCore(entry);
        } catch {}
        check(
            `PFLICHT ${entry.file}: trägt seinen Gefühls-Block (fx.bewegung/ARENA/FAHR.lenkung/VERHALTEN)`,
            !!m && pflicht[entry.file](m)
        );
    }
    // EIN WERT, EINE STELLE (K2) — die Linse (`einWertTaeter`) über dem Code-Baum des Stamms; Kommentare zitieren straflos.
    (function einWertEineStelle() {
        const dateien = stammLib
            .dateien(root)
            .map((d) => ({ name: d, src: ausDatei(path.join(root, d)) }));
        const taeter = einWertTaeter(dateien, KERNE);
        check(
            "EIN WERT, EINE STELLE: kein Ersatz-Literal auf eine Konstante, kein Gesetz-Ersatz, kein stiller catch im Gesetz-Leser, kein Zahlen-Zwilling eines Kerns",
            dateien.length > 40 && Object.keys(KERNE).length >= 9 && taeter.length === 0,
            taeter.length ? taeter.length + " Täter: " + taeter.join(" | ") : dateien.length + " Dateien sauber"
        );
        const probe =
            "AnazhRealm.EINS = 1; AnazhRealm.T = { x: 2 }; AnazhRealm.W = { cell: 12, pack: 1.16 }; AnazhRealm.Gesetz = function (p) { try { return p; } catch (_e) {} };\n" +
            "Object.defineProperty(AnazhRealm, 'DP', { get() { const k = globalThis.__koerperCore || null; return (k && k.DIAL_MAP) || []; } });\n" +
            "class Z { f() { const D = AnazhRealm.T; return [AnazhRealm.EINS || 3, Number.isFinite(D.x) ? D.x : 4, (AnazhRealm.T || {}).x, AnazhRealm.Gesetz('t:X', 7), globalThis.HIMMEL_GESETZ || { projY: 0.16 }, this.u || AnazhRealm.DP || '']; } }";
        const arten = einWertTaeter([{ name: "probe.js", src: probe }], KERNE).map((t) =>
            t.split(" ").slice(1, 3).join(" ")
        );
        check(
            "SELBST-TEST: neun Formen (||, Kette, Getter-Konstante, isFinite, (K || {}), Gesetz-Ersatz, stiller catch, globalThis, Zahlen-Zwilling) feuern beim Namen",
            "ersatz AnazhRealm.EINS|ersatz AnazhRealm.DP|ersatz __koerperCore.DIAL_MAP|ersatz AnazhRealm.T|ersatz AnazhRealm.T.x|ersatz HIMMEL_GESETZ|gesetz-ersatz Gesetz|stiller-catch AnazhRealm.Gesetz|zwilling __phytoCore.FOREST_PACK"
                .split("|")
                .every((s) => arten.includes(s)),
            arten.join(" · ")
        );
        (function inlineAbsenz() {
            // K09a — DAS GELÄNDE-GESETZBUCH ist ein Gesetz-Kern des Manifests (§9); dass Main und Worker dasselbe Buch
            // lesen, beweist gate:worker-dichte Wort für Wort am Dichte-Gitter.
            check(
                "§9: das Manifest trägt gelaende als Gesetz-Kern (ns __gelaendeCore, funktion)",
                MANIFEST.some((c) => c.id === "gelaende" && c.ns === "__gelaendeCore" && c.funktion === true)
            );
            const schlecht = validateFunktionsKern(
                { vertrag: 1, funktion: true, presets: { x: { kind: "k" } }, api: [] },
                { funktion: true, ns: "__x" }
            );
            check(
                "SELBST-TEST: ein Gesetz-Kern mit Rezept und ohne Funktion feuert §9",
                schlecht.length === 2,
                schlecht.join(" · ")
            );
            // Das Rezept unter einem anderen Namen und der unerklärte Schlüssel — durch den echten Lader (vm, Namensraum): die
            // Landschaften als LANDFORM_PRESETS (der Name) und als LANDSCHAFTEN (nur die Gestalt: Einträge mit regler) und
            // eine Zahl ohne Erklärung MÜSSEN je beim Namen rot werden.
            const fremd = { file: "selbsttest-gesetz.js", ns: "__selbstGesetz", funktion: true };
            fremd.quelle =
                "self.__selbstGesetz = { STUDIO_VERTRAG: 1, FUNKTION: 1, hoehe: function () { return 0; }," +
                " LANDFORM_PRESETS: [{ id: 'tafelland', regler: { tafel: 1 } }]," +
                " LANDSCHAFTEN: { kueste: { name: 'Küste', regler: { land: 0.25 } } }, SCHWELLE: 3 };";
            const fv = validateFunktionsKern(loadCore(fremd), fremd, new Set(["STUDIO_VERTRAG", "FUNKTION", "hoehe"]));
            const nennt = (t) => fv.some((s) => s.includes(t));
            check(
                "SELBST-TEST: ein Rezept unter fremdem Namen (LANDFORM_PRESETS, LANDSCHAFTEN) und ein unerklärter Schlüssel feuern §9 beim Namen",
                fv.length === 5 &&
                    nennt("keine Rezepte (LANDFORM_PRESETS)") &&
                    nennt("keine Rezepte (LANDSCHAFTEN)") &&
                    nennt("SCHWELLE steht nicht in der Erklärung"),
                fv.join(" · ")
            );
        })();
    })();

    // SELBST-TEST — das Gate ist nicht vakuös: eine injizierte Verletzung
    // (Rezept ohne kind + kaputte rarity) MUSS erkannt werden.
    const broken = {
        vertrag: 1,
        presets: { testkaputt: { s: { a: 0.5 } }, "BÖSE ID": { kind: "tree" } },
        build: function () {},
        cfg: {
            placement: {
                rarity: { x: 7 },
                boden: {
                    geist: { ring: "nah", dichte: 1, skala: [1, 2] },
                    "BÖSE ID": { ring: "fern", dichte: 0, skala: [2, 1], licht: [0.5, 0.2, 1, 2], weite: -3 },
                },
            },
            lod: {
                kindStages: { kaputt: [9], falschrum: [2, 1], tree: [0, 1, 2] },
                budget: {
                    geist: { 0: {} },
                    tree: {
                        3: {},
                        0: { tris: 100, draws: 1, schatten: false },
                        1: { tris: 200, draws: 0, schatten: "ja", karte: true, blattKarte: -1, deckung: [1.2, 0.9] },
                        fernform: "nebel",
                    },
                    gestalten: { eiche: 0 },
                },
            },
        },
        params: null,
        lehren: null,
    };
    const bv = validateManifest(broken);
    // B4 uniform — eine Zeile, die Bytes bewegt (porta:gate:k ist nicht in reglerGesetz), als Gesetz-Wert erklärt, und ein falscher Wert.
    const bvU = validateManifest(
        {
            vertrag: 1,
            presets: { a: { kind: "gate" } },
            build: function () {},
            paramsByKind: {
                gate: [
                    { id: "k", lab: "Spitze", min: 1, max: 3.4, uniform: true },
                    { id: "wave", lab: "Welle", min: 0, max: 1, uniform: 1 },
                    { id: "swirl", lab: "Sog", min: 0, max: 1, uniform: true },
                ],
            },
        },
        "porta"
    );
    check(
        "SELBST-TEST B4 uniform: der Neubau als Gesetz-Wert und uniform ≠ true werden erkannt, die Ratschen-Zeile nicht",
        bvU.some((s) => s.includes('"k" uniform ohne Byte-Beweis')) &&
            bvU.some((s) => s.includes('"wave" uniform ist nur true')) &&
            !bvU.some((s) => s.includes('"swirl"')),
        bvU.join(" | ")
    );
    // B2c — ein zweites Budget: Regler-Form (nadelKarte) und steigende draws.
    const bvB = validateManifest({
        vertrag: 1,
        zweit: true,
        presets: { a: { kind: "shrub" } },
        build: function () {},
        cfg: {
            lod: {
                kindStages: { shrub: [1, 2], rock: [0, 1] },
                budget: {
                    shrub: {
                        1: {
                            tris: 10,
                            draws: 1,
                            schatten: 1,
                            blattKarte: -2,
                            lagen: 0,
                            quote: 1.2,
                            geruest: 0,
                            wedel: { ab: 1, teile: 0, breite: 0 },
                            dichte: { laub: 1.5 },
                            rinde: { ast: 0.1, reisig: 0.3 },
                            straehne: { teile: 0, breite: 1 },
                            rispe: { grannen: 0, segmente: 2, breite: 1 },
                            schnitt: 0.2,
                            rute: 0.1,
                            boden: 1.5,
                            band: 10,
                        },
                        2: { tris: 5, draws: 2, schatten: false },
                        fernform: "karte",
                    },
                    // ein Zwillings-Kreis 0 → 1 → 0 — und ohne Fernform (Pflicht je Budget-Art)
                    rock: { 0: { tris: 10, draws: 1, schatten: 1 }, 1: { tris: 5, draws: 1, schatten: 0 } },
                    // W8 — Gestalten eines Zweit-Kerns: eine 0 und ein fremdes Rezept.
                    gestalten: { a: 0, geist: 2 },
                },
            },
        },
    });
    bvB.push(
        ...validateManifest({
            vertrag: 1,
            zweit: true,
            presets: { a: { kind: "shrub" }, b: { kind: "shrub" } },
            build: function () {},
            // W8 — ein Zweit-Kern ohne Zahl für Rezept b und mit der '*'-Zeile des Haupt-Kerns.
            cfg: {
                lod: {
                    kindStages: { shrub: [1] },
                    budget: { shrub: { 1: { tris: 9, draws: 1, schatten: false } }, gestalten: { a: 1, "*": 3 } },
                },
            },
        })
    );
    // S3 haus — die NUR-WURF-Stufe: eine Stufe 3 ohne nurWurf · "huelle" ohne NUR-WURF-Stufe (kein Träger von __fern) ·
    // nurWurf mit karte
    const bvS3h = validateManifest({
        vertrag: 1,
        zweit: true,
        presets: { h: { kind: "haus" }, a: { kind: "aus" }, k: { kind: "karto" }, t: { kind: "gate" } },
        build: function () {},
        cfg: {
            lod: {
                kindStages: { haus: [0, 3], aus: [0, 1], karto: [0, 3], gate: [0, 3] },
                budget: {
                    haus: {
                        0: { tris: 100, draws: 2, schatten: 3 },
                        3: { tris: 10, draws: 1, schatten: 3 },
                        fernform: "huelle",
                    },
                    aus: {
                        0: { tris: 100, draws: 1, schatten: 0 },
                        1: { tris: 50, draws: 1, schatten: 1 },
                        fernform: "huelle",
                    },
                    karto: {
                        0: { tris: 100, draws: 1, schatten: 3 },
                        3: { tris: 10, draws: 1, schatten: 3, nurWurf: true, karte: true },
                        fernform: "huelle",
                    },
                    // K43: das Tor in seiner alten Form (nur Stufe 0 gezeigt, keine Stufe 1) — die Tor-Stufen-Wand MUSS feuern
                    gate: {
                        0: { tris: 100, draws: 2, schatten: 3 },
                        3: { tris: 10, draws: 1, schatten: 3, nurWurf: true },
                        fernform: "huelle",
                    },
                    gestalten: { h: 1, a: 1, k: 1, t: 1 },
                },
            },
        },
    });
    // S3 — die Gelenk-Gestalt: eine Stufen-Grenze an der ersten Stufe, eine fallende Grenze, eine Hysterese über 0,5, ein
    // Wurf-Teil mit fremder Seh-Klasse und einer an einer Stufe, die nicht selbst wirft.
    const bvS3 = validateManifest({
        vertrag: 1,
        zweit: true,
        meshfrei: true,
        presets: { a: { kind: "kreatur" } },
        cfg: {
            lod: {
                kindStages: { kreatur: [0, 1, 2] },
                budget: {
                    kreatur: {
                        0: { tris: 30, draws: 3, schatten: 1, ab: 5 },
                        1: { tris: 20, draws: 2, schatten: 1, ab: 40, wurf: { seh: ["haar", "fell"] } },
                        2: { tris: 10, draws: 1, schatten: 1, ab: 30, wurf: { seh: ["haar"] } },
                        hyst: 0.7,
                        fernform: "gesetz",
                    },
                    gestalten: { a: 1 },
                },
            },
        },
    });
    const bvVer = validateManifest({ vertrag: null, presets: { a: { kind: "tree" } }, build: function () {} });
    // §8 — ein MESHFREI-Kern mit buildInstance ist widersprüchlich (die Linse feuert).
    const bvMesh = validateManifest({
        vertrag: 1,
        presets: { a: { kind: "klang" } },
        build: function () {},
        meshfrei: true,
    });
    // auch die Gefühls-Block-Prüfungen feuern auf Injektion:
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
        "SELBST-TEST: injizierte Verletzungen werden erkannt (kein-kind · Namensraum · rarity · Boden-Gesetz · kindStages · Budget · Fernform · NUR-WURF-Stufe · Gelenk-Gestalt ab/hyst/wurf.seh · Version · MESHFREI-Widerspruch · Gefühls-Blöcke)",
        bv.some((s) => s.includes("kein kind")) &&
            bv.some((s) => s.includes("Namensraum")) &&
            bv.some((s) => s.includes("rarity")) &&
            bv.some((s) => s.includes("kindStages.kaputt")) &&
            bv.some((s) => s.includes("kindStages.falschrum")) &&
            bv.some((s) => s.includes("budget.geist")) &&
            bv.some((s) => s.includes("budget.tree[3] — keine gelieferte Stufe")) &&
            bv.some((s) => s.includes("budget.tree[2] fehlt")) &&
            bv.some((s) => s.includes("tris fällt nicht streng")) &&
            bv.some((s) => s.includes("tree[1].draws muss")) &&
            bv.some((s) => s.includes("tree[1].schatten muss")) &&
            bv.some((s) => s.includes("tree[1].karte — nur die letzte Stufe")) &&
            bv.some((s) => s.includes("blattKarte muss")) &&
            bv.some((s) => s.includes("deckung muss")) &&
            bv.some((s) => s.includes("gestalten trägt keine")) &&
            bv.some((s) => s.includes("gestalten.eiche muss")) &&
            bv.some((s) => s.includes("placement.boden.geist — kein Preset")) &&
            bv.some((s) => s.includes("placement.boden.BÖSE ID — keine eigene Gestalten-Zeile")) &&
            bv.some((s) => s.includes("placement.boden.BÖSE ID.ring muss")) &&
            bv.some((s) => s.includes("placement.boden.BÖSE ID.dichte muss")) &&
            bv.some((s) => s.includes("placement.boden.BÖSE ID.skala muss")) &&
            bv.some((s) => s.includes("placement.boden.BÖSE ID.licht muss ein Trapez")) &&
            bv.some((s) => s.includes("placement.boden.BÖSE ID.weite muss")) &&
            bvB.some((s) => s.includes("shrub[1].blattKarte muss")) &&
            bvB.some((s) => s.includes("lagen muss")) &&
            bvB.some((s) => s.includes("quote muss")) &&
            bvB.some((s) => s.includes("geruest muss")) &&
            bvB.some((s) => s.includes("wedel muss")) &&
            bvB.some((s) => s.includes("dichte.laub muss")) &&
            bvB.some((s) => s.includes("rinde muss")) &&
            bvB.some((s) => s.includes("straehne muss")) &&
            bvB.some((s) => s.includes("rispe muss")) &&
            bvB.some((s) => s.includes("schnitt < rute")) &&
            bvB.some((s) => s.includes("boden muss")) &&
            bvB.some((s) => s.includes("draws steigt")) &&
            bv.some((s) => s.includes("tree.fernform muss")) &&
            bvB.some((s) => s.includes('shrub.fernform — "karte" genau dann')) &&
            bvB.some((s) => s.includes("rock.fernform muss")) &&
            bvB.some((s) => s.includes("rock[0].schatten — der Zwilling (Stufe 1) wirft nicht selbst")) &&
            bvB.some((s) => s.includes("shrub[1].band muss")) &&
            bvB.some((s) => s.includes("gestalten.a muss")) &&
            bvB.some((s) => s.includes("gestalten.geist — kein Rezept")) &&
            bvB.some((s) => s.includes("gestalten.* — kein Rezept")) &&
            bvB.some((s) => s.includes("gestalten.b fehlt")) &&
            bvS3h.some((s) => s.includes("kindStages.haus — die Stufe 3 trägt nurWurf")) &&
            bvS3h.some((s) => s.includes('aus.fernform — "huelle" genau dann')) &&
            bvS3h.some((s) => s.includes("karto[3].nurWurf mit karte")) &&
            bvS3h.some((s) => s.includes("lod.budget.gate trägt die Stufen-Kette nicht")) &&
            bvS3.some((s) => s.includes("kreatur.hyst muss in (0, 0,5)")) &&
            bvS3.some((s) => s.includes("kreatur[0].ab — die erste Stufe beginnt bei 0")) &&
            bvS3.some((s) => s.includes("kreatur[2].ab steigt nicht streng")) &&
            bvS3.some((s) => s.includes("kreatur[1].wurf.seh muss eine Teilmenge")) &&
            bvS3.some((s) => s.includes("kreatur[2].wurf — nur eine Stufe, die selbst wirft")) &&
            !bvS3.some((s) => s.includes("kreatur[1].wurf — nur eine Stufe")) &&
            bvVer.some((s) => s.includes("G4.3")) &&
            bvMesh.some((s) => s.includes("MESHFREI")) &&
            bvFx.some((s) => s.includes("schwimmen unvollständig")) &&
            bvFx.some((s) => s.includes("parkour unvollständig")) &&
            bvFx.some((s) => s.includes("ARENA unvollständig")) &&
            bvFx.some((s) => s.includes("FAHR.lenkung unvollständig")) &&
            bvFx.some((s) => s.includes("VERHALTEN unvollständig")),
        `${bv.length + bvS3.length + bvVer.length + bvMesh.length + bvFx.length} erkannt`
    );
    // DAS SPRUNG-GESETZ: der echte tetrapoda-Kern, einmal mit dem Abflug in m/s einer
    // Aktion (der alte bound-Zwilling 3,2) und einmal mit dem linearen sprung-Faktor — beide feuern die VERHALTEN-Wand.
    {
        const tEntry = CORES.find((c) => c.file === "tetrapoda-core.js");
        const tm = tEntry ? loadCore(tEntry) : null;
        const mitZwilling = (fn) => {
            const V = JSON.parse(JSON.stringify(tm.verhalten));
            fn(V);
            return validateManifest(Object.assign({}, tm, { verhalten: V }));
        };
        const echt = tm ? validateManifest(tm).filter((s) => s.includes("VERHALTEN")) : ["kein Kern"];
        const hopMs = tm ? mitZwilling((V) => (V.aktionen.bound.hop = 3.2)) : [];
        const faktor = tm ? mitZwilling((V) => (V.sprung = { impulsProM: 2.2 })) : [];
        check(
            "SELBST-TEST: der Sprung-Zwilling (Abflug in m/s einer Aktion · sprung.impulsProM) feuert die VERHALTEN-Wand",
            echt.length === 0 &&
                hopMs.some((s) => s.includes("ohne sprung-Zwilling")) &&
                faktor.some((s) => s.includes("ohne sprung-Zwilling")),
            `echt ${echt.length} · m/s ${hopMs.length} · Faktor ${faktor.length}`
        );
        // DAS TEMPERAMENT DER GATTUNG: die Substanz-Signaturen kehren zurueck, oder die
        // Gattungs-Zeile fehlt — beide feuern die VERHALTEN-Wand.
        const sig = tm ? mitZwilling((V) => (V.temperament.signaturen = { wehrhaft: { dichte: 1 } })) : [];
        const ohneG = tm ? mitZwilling((V) => delete V.temperament.gattung) : [];
        check(
            "SELBST-TEST: der Substanz-Zwilling des Temperaments (Signaturen · fehlende Gattungs-Zeile) feuert die VERHALTEN-Wand",
            sig.some((s) => s.includes("ohne Substanz-Signaturen")) &&
                ohneG.some((s) => s.includes("ohne Substanz-Signaturen")),
            `Signaturen ${sig.length} · ohne Gattung ${ohneG.length}`
        );
    }
    // S3 — DIE ABSENZ-WAND DER FINAL GESTRICHENEN: (a) budgetErzwingen faltet nur Zweit-Kern-Gestalten
    // (die Pflanzen-Zeile IST der Bau-Regler — ein Ausgangs-Falten wäre ein Zwilling), (b) die Seh-Klasse `laub` existiert
    // nicht (ihr einziger Leser wäre dieses Falten: Konsum 0), (c) die Baum-Zeile trägt ihre S3-Pflicht und der Fels ist
    // einstufig (validateManifest oben; hier der Selbsttest).
    {
        // die Absenzen über den EINEN Helfer (kommentarfrei, der Täter mit Datei und Zeile); `pgW`/`pcW` wandeln Brücke
        // (K42: __replyBuildAsset lebt in der Brücke) und phyto-core im Selbsttest
        const absenz = (pgW, pcW) => {
            const v = [];
            if (
                !stammLib.fehlt({ ausser: /if \(isZweitKern\) \{/ }, /budgetErzwingen\(/, {
                    datei: "foundry-bruecke.js",
                    wandel: pgW,
                })
            )
                v.push(
                    `budgetErzwingen faltet außerhalb des Zweit-Kern-Zweigs (${stammLib.fehlt.wo}) — die Pflanzen-Zeile ist der Bau-Regler`
                );
            if (!stammLib.fehlt(null, /seh: Object\.freeze\(\[[^\]]*"laub"/, { datei: "phyto-core.js", wandel: pcW }))
                v.push(`die Seh-Klasse laub lebt in BUDGET_GESETZ.seh (${stammLib.fehlt.wo})`);
            return v;
        };
        const echt = absenz();
        check(
            "B2c S3-Absenz: kein Pflanzen-Falten (budgetErzwingen nur im Zweit-Kern-Zweig), keine Seh-Klasse laub",
            echt.length === 0,
            echt.join(" · ")
        );
        const pflicht = validateManifest({
            vertrag: 1,
            presets: { a: { kind: "tree" } },
            build: function () {},
            cfg: {
                lod: {
                    kindStages: { tree: [0, 1], rock: [0, 1] },
                    budget: {
                        tree: {
                            0: { tris: 100, draws: 1, schatten: 1, nadelKarte: 2, dichte: { laub: 0.4 } },
                            1: { tris: 50, draws: 1, schatten: 1, wurf: { durchmesserM: 0.17 } },
                            fernform: "gesetz",
                        },
                        rock: {
                            0: { tris: 10, draws: 1, schatten: 0 },
                            1: { tris: 5, draws: 1, schatten: 1 },
                            fernform: "gesetz",
                        },
                        gestalten: { "*": 1 },
                    },
                },
            },
        });
        const falten = absenz((t) =>
            t.replace(
                "const isZweitKern = !!zweit;",
                "const isZweitKern = !!zweit;\n            PC.budgetErzwingen(meshes, null);"
            )
        );
        const laub = absenz(undefined, (t) =>
            t.replace('seh: Object.freeze(["stoff",', 'seh: Object.freeze(["laub", "stoff",')
        );
        check(
            "SELBST-TEST: die S3-Wand feuert (Baum-Zeile ohne lagen/geruest/blattKarte/wedel/quote/wurf.teil, mit nadelKarte und dichte.laub · Fels zweistufig · Pflanzen-Falten · Seh-Klasse laub)",
            [
                "tree[0].lagen fehlt",
                "tree[0].geruest fehlt",
                "tree[0].blattKarte fehlt",
                "tree[0].wedel fehlt",
                "tree[0].nadelKarte ist gefallen",
                "dichte.laub/nadel ist gefallen",
                "tree[1].quote fehlt",
                'wurf.teil "schatten" fehlt',
                "rock ist [0]",
            ].every((t) => pflicht.some((s) => s.includes(t))) &&
                falten.length > 0 &&
                laub.length > 0,
            `${pflicht.length} Zeilen-Befunde · Falten ${falten.length} · laub ${laub.length}`
        );
    }

    wandEnde(errs, "der Studio-Vertrag steht als Struktur: jeder registrierte Kern erfüllt die MUSS-Blöcke, die SOLL-Blöcke validieren wo vorhanden, und der Selbst-Test beweist die Linse feuert.");
})();
