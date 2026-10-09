// DIE QUELL-WAND (AST, wie die Box-Wand in diag-blocker-netz): je Methode die Namen, die am BESTAND hängen (`this.state.architectures`,
// ein Name für `this.state`, eine Destrukturierung, `|| []`, eine Kopie, `_blockerNetz().liste`), und die Namen, die an einem ZIEL
// hängen (`.affordances`, `.chimney`, `.rauchQuelle` — auch verschachtelt und über einen Namen). Rot:
//   (a) ein Takt der Klasse läuft über den Bestand: for-of/for-in, eine for-Schleife bis `.length`, eine Iterations-Methode
//       (filter, forEach, map, some, find, every, reduce, slice, indexOf, …), ein Spread, `Array.from`/`Object.values`;
//   (b) ein Schreiber eines Ziels ohne Stempel: Zuweisung, ++/--, delete, eine mutierende Methode, `Object.assign`/
//       `defineProperty` — erlaubt nur in `spawnArchitecture` (vor dem Eintritt) und in Methoden, die `_blockerNetzSetzen` rufen;
//       ebenso ein Ersatz von `.userData` durch etwas anderes als ein Literal ohne `rauchQuelle`/Spread oder `x.userData || {}`
//       (ein Kamin kann darin reisen), und `Object.assign` in ein `.userData` mit einer solchen Quelle;
//   (c) ein Schreiber von `.heatBuildup` außerhalb des Brennglas-Takts (er führt die warme Menge) und ohne Stempel.
// Grenze: ein Name, der als Parameter ein Ziel oder den Bestand empfängt, hängt für die Wand an nichts (kein Datenfluss über Rufe).
const TAKTE = [
    "_tickFocusingAffordances",
    "_tickRadiatingAffordances",
    "_tickBalancingAffordances",
    "_tickLiftingAffordances",
    "_findNearestAffordanceEntry",
    "_updateDorfRauch",
    "tickPlayerBoosts",
    "_lofiNearResonantArchitecture",
];
const ZIELE = new Set(["affordances", "chimney", "rauchQuelle"]);
const ITER = new Set([
    "filter",
    "forEach",
    "map",
    "some",
    "find",
    "every",
    "reduce",
    "reduceRight",
    "findIndex",
    "findLast",
    "findLastIndex",
    "flatMap",
    "includes",
    "indexOf",
    "lastIndexOf",
    "slice",
    "concat",
    "entries",
    "values",
    "keys",
    "join",
    "sort",
    "reverse",
    "toSorted",
    "toReversed",
]);
const KOPIE = new Set(["slice", "concat", "toSorted", "toReversed"]);
const MUT = new Set([
    "push",
    "pop",
    "shift",
    "unshift",
    "splice",
    "sort",
    "reverse",
    "fill",
    "copyWithin",
    "set",
    "add",
    "delete",
    "clear",
]);
function quellWand(quelle) {
    const acorn = require("acorn");
    const ast = acorn.parse(quelle, { ecmaVersion: "latest", sourceType: "script", locations: true });
    const kinder = (n) => {
        const out = [];
        for (const k in n) {
            if (k === "type" || k === "start" || k === "end" || k === "loc") continue;
            const v = n[k];
            if (Array.isArray(v)) {
                for (const x of v) if (x && typeof x.type === "string") out.push(x);
            } else if (v && typeof v.type === "string") out.push(v);
        }
        return out;
    };
    const lauf = (n, f) => {
        f(n);
        for (const k of kinder(n)) lauf(k, f);
    };
    const feld = (m) =>
        m.computed ? (m.property.type === "Literal" ? String(m.property.value) : null) : m.property.name;
    const text = (n) => quelle.slice(n.start, n.end).replace(/\s+/g, "");
    const befunde = [];
    const gesehen = new Set();
    lauf(ast, (m) => {
        if (m.type !== "MethodDefinition" || !m.value || !m.value.body) return;
        const name = m.key.name || String(m.key.value);
        const body = m.value.body;
        const zustand = new Set(),
            netz = new Set(),
            bestand = new Set(),
            ziel = new Map();
        const istThis = (n) => n && n.type === "ThisExpression";
        const istZustand = (n) => {
            if (!n) return false;
            if (n.type === "Identifier") return zustand.has(n.name);
            if (n.type === "MemberExpression") return istThis(n.object) && feld(n) === "state";
            if (n.type === "LogicalExpression") return istZustand(n.left) || istZustand(n.right);
            return false;
        };
        const istNetz = (n) => {
            if (!n) return false;
            if (n.type === "Identifier") return netz.has(n.name);
            if (n.type === "CallExpression" && n.callee.type === "MemberExpression")
                return istThis(n.callee.object) && feld(n.callee) === "_blockerNetz";
            if (n.type === "MemberExpression") return istThis(n.object) && feld(n) === "_blockerNetzStand";
            if (n.type === "LogicalExpression") return istNetz(n.left) || istNetz(n.right);
            return false;
        };
        const istBestand = (n) => {
            if (!n) return false;
            if (n.type === "Identifier") return bestand.has(n.name);
            if (n.type === "ChainExpression") return istBestand(n.expression);
            if (n.type === "LogicalExpression") return istBestand(n.left) || istBestand(n.right);
            if (n.type === "ConditionalExpression") return istBestand(n.consequent) || istBestand(n.alternate);
            if (n.type === "MemberExpression") {
                const f = feld(n);
                if (f === "architectures") return istZustand(n.object);
                if (f === "liste") return istNetz(n.object);
                return false;
            }
            if (n.type === "CallExpression" && n.callee.type === "MemberExpression")
                return KOPIE.has(feld(n.callee)) && istBestand(n.callee.object);
            if (n.type === "ArrayExpression")
                return n.elements.some((e) => e && e.type === "SpreadElement" && istBestand(e.argument));
            return false;
        };
        // das Ziel eines Ausdrucks (der Feld-Name, an dem er hängt) oder null
        const zielVon = (n) => {
            if (!n) return null;
            if (n.type === "Identifier") return ziel.get(n.name) || null;
            if (n.type === "ChainExpression") return zielVon(n.expression);
            if (n.type === "LogicalExpression") return zielVon(n.left) || zielVon(n.right);
            if (n.type === "ConditionalExpression") return zielVon(n.consequent) || zielVon(n.alternate);
            if (n.type === "MemberExpression") {
                const f = feld(n);
                if (ZIELE.has(f)) return f;
                return zielVon(n.object);
            }
            return null;
        };
        const binde = (id, init) => {
            if (!id || !init) return;
            if (id.type === "Identifier") {
                if (istZustand(init)) zustand.add(id.name);
                if (istNetz(init)) netz.add(id.name);
                if (istBestand(init)) bestand.add(id.name);
                const z = zielVon(init);
                if (z) ziel.set(id.name, z);
            } else if (id.type === "ObjectPattern") {
                for (const p of id.properties) {
                    if (p.type !== "Property") continue;
                    const k = p.key.type === "Identifier" ? p.key.name : String(p.key.value);
                    const wert = p.value.type === "AssignmentPattern" ? p.value.left : p.value;
                    if (wert.type !== "Identifier") continue;
                    if (k === "architectures" && istZustand(init)) bestand.add(wert.name);
                    if (k === "state" && istThis(init)) zustand.add(wert.name);
                    if (k === "liste" && istNetz(init)) bestand.add(wert.name);
                    if (ZIELE.has(k)) ziel.set(wert.name, k);
                    else if (zielVon(init)) ziel.set(wert.name, zielVon(init));
                }
            }
        };
        let stempelt = false;
        for (let d = 0; d < 3; d++)
            lauf(body, (n) => {
                if (n.type === "VariableDeclarator") binde(n.id, n.init);
                if (n.type === "AssignmentExpression" && n.operator === "=" && n.left.type === "Identifier")
                    binde(n.left, n.right);
                if (
                    (n.type === "ForOfStatement" || n.type === "ForInStatement") &&
                    n.left.type === "VariableDeclaration"
                ) {
                    const z = zielVon(n.right);
                    const id = n.left.declarations[0].id;
                    if (z && id.type === "Identifier") ziel.set(id.name, z);
                }
                if (
                    n.type === "CallExpression" &&
                    n.callee.type === "MemberExpression" &&
                    feld(n.callee) === "_blockerNetzSetzen"
                )
                    stempelt = true;
            });
        const meld = (n, art) => befunde.push(`${name} Zeile ${n.loc.start.line}: ${art} — ${text(n).slice(0, 70)}`);
        if (TAKTE.includes(name)) {
            gesehen.add(name);
            lauf(body, (n) => {
                if ((n.type === "ForOfStatement" || n.type === "ForInStatement") && istBestand(n.right))
                    meld(n, "läuft über den Bestand (for-of)");
                if (n.type === "ForStatement" && n.test) {
                    let hit = false;
                    lauf(n.test, (x) => {
                        if (x.type === "MemberExpression" && feld(x) === "length" && istBestand(x.object)) hit = true;
                    });
                    if (hit) meld(n, "läuft über den Bestand (bis .length)");
                }
                if (n.type === "CallExpression" && n.callee.type === "MemberExpression") {
                    const f = feld(n.callee);
                    if (ITER.has(f) && istBestand(n.callee.object)) meld(n, `läuft über den Bestand (.${f})`);
                    const o = n.callee.object;
                    if (
                        o.type === "Identifier" &&
                        ((o.name === "Array" && f === "from") ||
                            (o.name === "Object" && /^(keys|values|entries)$/.test(f || ""))) &&
                        istBestand(n.arguments[0])
                    )
                        meld(n, `läuft über den Bestand (${o.name}.${f})`);
                }
                if (n.type === "SpreadElement" && istBestand(n.argument)) meld(n, "läuft über den Bestand (Spread)");
            });
        }
        const darfZiel = name === "spawnArchitecture" || stempelt;
        const darfHitze = name === "_tickFocusingAffordances" || stempelt;
        const harmlosUserData = (links, rechts) => {
            if (rechts.type === "ObjectExpression")
                return !rechts.properties.some(
                    (p) =>
                        p.type === "SpreadElement" ||
                        (p.key && (p.key.name === "rauchQuelle" || p.key.value === "rauchQuelle"))
                );
            return (
                rechts.type === "LogicalExpression" &&
                rechts.operator === "||" &&
                text(rechts.left) === text(links) &&
                rechts.right.type === "ObjectExpression" &&
                rechts.right.properties.length === 0
            );
        };
        lauf(body, (n) => {
            let zielFeld = null,
                hitze = false,
                wie = "";
            if (n.type === "AssignmentExpression" && n.left.type === "MemberExpression") {
                const f = feld(n.left);
                if (f === "heatBuildup") hitze = true;
                else if (ZIELE.has(f)) zielFeld = f;
                else if (f === "userData") {
                    if (!harmlosUserData(n.left, n.right)) zielFeld = "userData (ein Kamin kann darin reisen)";
                } else zielFeld = zielVon(n.left.object);
                wie = "schreibt";
            } else if (
                (n.type === "UpdateExpression" || (n.type === "UnaryExpression" && n.operator === "delete")) &&
                n.argument.type === "MemberExpression"
            ) {
                const f = feld(n.argument);
                if (f === "heatBuildup") hitze = true;
                else zielFeld = ZIELE.has(f) ? f : zielVon(n.argument.object);
                wie = n.type === "UpdateExpression" ? "zählt" : "löscht";
            } else if (n.type === "CallExpression" && n.callee.type === "MemberExpression") {
                const f = feld(n.callee);
                if (MUT.has(f) && zielVon(n.callee.object)) {
                    zielFeld = zielVon(n.callee.object);
                    wie = `ruft .${f} auf`;
                }
                const o = n.callee.object;
                if (
                    o.type === "Identifier" &&
                    o.name === "Object" &&
                    /^(assign|defineProperty|defineProperties)$/.test(f || "")
                ) {
                    const a0 = n.arguments[0];
                    if (a0) {
                        const z = zielVon(a0);
                        if (z) {
                            zielFeld = z;
                            wie = `Object.${f} in`;
                        } else if (
                            a0.type === "MemberExpression" &&
                            feld(a0) === "userData" &&
                            n.arguments.slice(1).some((q) => !harmlosUserData(a0, q))
                        ) {
                            zielFeld = "userData (ein Kamin kann darin reisen)";
                            wie = `Object.${f} in`;
                        }
                    }
                }
            }
            if (hitze && !darfHitze) meld(n, "schreibt .heatBuildup außerhalb des Brennglas-Takts");
            if (zielFeld && !darfZiel) meld(n, `${wie} .${zielFeld} ohne Stempel (\`_blockerNetzSetzen\`)`);
        });
    });
    for (const t of TAKTE) if (!gesehen.has(t)) befunde.push(`STUMPF: die Wand sieht den Takt ${t} nicht`);
    return befunde;
}
module.exports = { quellWand, TAKTE };
if (require.main === module) {
    const fs = require("fs");
    const b = quellWand(fs.readFileSync(process.argv[2], "utf8"));
    console.log(b.length + " Befunde");
    for (const x of b) console.log("  " + x);
}
