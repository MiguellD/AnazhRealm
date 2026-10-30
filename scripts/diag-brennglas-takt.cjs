#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-brennglas-takt.cjs — DER TAKT KOSTET, WAS IHN BETRIFFT: der Brennglas-Takt, die Affordanz-Takte (Strahlen,
// Balancieren, Heben, das Portal), der Dorf-Rauch, die Resonanz der Boosts und das Lofi-Pad laufen nie über den ganzen Bestand.
// Die Nachbarschaft (`_blockerNetz`) trägt ein VERZEICHNIS je Name (Affordanz-Schlüssel, „rauch"), die Takte
// fragen es (`_blockerMit`) oder die Plätze um ihre Wirker (`_blockerUmPlatz`); der Brennglas-Takt führt seine warmen Einträge.
// Die Wand (Null-Renderer, eine echte Welt mit Dörfern, Brenngläsern und Brennbarem in ihren Brennpunkten):
//   (T) DER TAG: Morgen, Mittag, Wolken (Regen, Sturm), Mittag, Nachmittag, Abend, Nacht — je Schritt laufen der alte Takt (das
//       Orakel unten, der Takt von main V18.536 im Wortlaut) und der neue auf demselben Stand: dieselbe Hitze je Eintrag
//       (byte-gleich), dieselben Sätze und Journal-Zeilen in derselben Folge, dasselbe Feuer; mitten im Tag fällt ein warmer
//       Eintrag, kommt ein neues Array, treten neue Ziele ein; der Tag ist nicht vakuös (Erwärmen, Glimmen, Zünden, Abkühlen);
//       jeder warme Eintrag des Bestands steht in der warmen Menge;
//   (V) DAS VERZEICHNIS: je Affordanz-Schlüssel und „rauch" dieselbe Liste wie der Filter über den Bestand (Mitglieder und
//       Ordnung) — nach dem Tag, nach Spawn, Abriss, einem nachgezogenen Tor (`setBlueprintAsPortal`) und einem neuen Array;
//   (R) DIE RESONANZ: die Plätze um den Spieler tragen jeden Eintrag in Reichweite (Boosts, Lofi-Pad 24 m), in der Ordnung
//       des Bestands;
//   (D) DER DORF-RAUCH: dieselben Quellen wie die Schleife über den Bestand;
//   (H) DIE HAUS-TÜR: ein Haus mit Tür, das nach dem letzten Scan in die Nähe kommt, steht 2 s später in der Nähe-Liste
//       des Tür-Takts (`_tickHausTueren`) und trägt sein Tür-Gedächtnis; die Liste ist der Filter über den Bestand, in seiner
//       Ordnung;
//   (A) ARBEIT: der Brennglas-Takt fasst je Takt höchstens die Betroffenen an — die warmen Einträge und, wenn die Sonne durch ein
//       Glas scheint, die Plätze in Reichweite der Gläser;
//   (N) DIE NÄHE: Strahlen, Balancieren, Heben und die nächste Affordanz (der Portal-Takt) urteilen wie die Schleife
//       über ihr Verzeichnis und kosten die Nähe — eine
//       ferne Menge derselben Namen (300–3 000 je Name) greift kein Takt an (WELTGRÖSSE rot ab dem ersten Griff je Ruf, gezählt
//       an ihrem Platz und ihrer Zellen-Marke, nie an der Uhr), die Gegenprobe (das Orakel) greift jeden ihres Namens (sonst BLIND);
//   (Q) QUELLE: keiner der Takte läuft über `state.architectures`; jeder Schreiber von Affordanzen und Kaminen steht beim Namen
//       (Spawn, Tor), die Hitze schreibt nur der Brennglas-Takt; die Familie des Spiegel-Takts (D10,
//       `_spiegel…`) gehört der Klasse, dazu jeder Leser der Welt im Takt, die mit dem Weg wächst (w4-takt-drift: Idle-Takt,
//       Kaskaden-Werfer, Status-Zähler, Kronen-Gitter, Dach, Dorf-Haus, Tore, Lupe, Stau-Werke, Grundriss-Gitter);
//   (W) DER WUCHS: kein Takt der Klasse leitet ein Skelett im Haupt-Faden ab — die Krone reist als Beipack aus dem Worker;
//   (P) kein Page-Error — der EINE Sammler (welt-boot) macht den Lauf ROT mit Namen.
// SELBSTTEST (--selftest, ohne Browser, in `npm run check`): die Quell-Wand ist am Stamm grün und fällt bei einer eingeschleusten
// Schleife, einem Schreiber ohne Stempel und einem fremden Hitze-Schreiber rot.
//   node scripts/diag-brennglas-takt.cjs [--selftest]   (npm run gate:brennglas-takt)
// ─────────────────────────────────────────────────────────────────────────
"use strict";
const { statikServer, ROOT: root, hauptLauf, nullWeltProbe, selbsttestEnde, wandEnde } = require("./lib/welt-boot.cjs");
const stammLib = require("./lib/stamm.cjs");


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
    "_tickHausTueren",
    "_spiegelFeldTakt",
    "_spiegelKronen",
    // DIE WELT IST EINE FUNKTION, KEIN SACK (w4-takt-drift, Gebot 7): der Bestand wächst mit jedem gefahrenen Meter — der
    // gesetzte Wald bleibt als Daten (profiband.K5#1, GTX: Takt p95 16,7 → 19,7 ms über 5,4 km; headless nach dem Gang
    // 2 552 → 27 958 Einträge, Takt p95 der letzten 5 min ×1,45). Diese Leser fragen die Mesh-Zone (`_cullWache().mesh`),
    // die Takt-Nähe (`_blockerUmPlatz`) oder das Verzeichnis (`_blockerMit`: „isPortal", „stauwerk", „grundriss",
    // „magnifying"); bis dahin ging jeder je Takt, je Änderung oder je Status-Bild den ganzen Bestand
    "tickArchitectures",
    "_kaskadenWerferOben",
    "countArchitecturesNearPlayer",
    "_rebuildOcclusionGrid",
    "_dachTakt",
    "_dorfHaus",
    "_tickPortalMembranes",
    "_genesisPortalRing",
    "_portalApproachPrefetch",
    "_hasMagnifyingInSight",
    "_stauWorkClusters",
    "_grundrissStand",
];
// DIE FAMILIE DES SPIEGEL-TAKTS (D10): jede Methode `_spiegel…` läuft im Takt des Spiegel-Felds oder seines Passes — sie
// gehört der Klasse wie die Takte oben (der Bestand nur über die Plätze, `_blockerUmPlatz`).
const istTakt = (name) => TAKTE.includes(name) || /^_spiegel[A-Z]/.test(name);
// (W) DER WUCHS IM TAKT (D10-n1, Lehre 14): kein Takt der Klasse leitet ein Skelett im Haupt-Faden ab — die Ableitung einer
// Gestalt kostete 4–39 ms je Gestalt (Tanne, Radeon), am See bis 68 ms in einem Bild. Die Krone eines gezeichneten Baums
// reist als Beipack aus dem Foundry-Worker (`__krone` → das Kronen-Buch `_foundryBaumKrone`).
const WUCHS = new Set(["_growTreeBlueprintRich", "_gestaltTeile", "_baumGestaltTeile", "skelettDerGestalt"]);
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
// Benannte Ausnahmen (je mit Grund); eine Ausnahme ohne Befund in ihrer Methode ist tot und fällt rot.
const FREI = {
    _chunkSatzMesh: "Object.assign in das userData des Meshes eines Chunk-Satzes — nie ein Eintrag des Bestands",
};
function quellWand(quelle) {
    const feld = (m) =>
        m.computed ? (m.property.type === "Literal" ? String(m.property.value) : null) : m.property.name;
    const text = (n) => quelle.slice(n.start, n.end).replace(/\s+/g, "");
    const befunde = [];
    const gesehen = new Set();
    // je Methode einer Klasse aus der EINEN Glieder-Tafel (`stammLib.glieder`, je Text einmal geparst)
    stammLib.glieder(quelle).forEach(({ name, knoten: m }) => {
        if (m.type !== "MethodDefinition") return;
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
        for (let d = 0; d < 3; d++)
            stammLib.wandere(body, (n) => {
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
            });
        const meld = (n, art) => befunde.push(`${name} Zeile ${stammLib.zeileVon(quelle, n.start)}: ${art} — ${text(n).slice(0, 70)}`);
        if (istTakt(name)) {
            gesehen.add(name);
            stammLib.wandere(body, (n) => {
                if (n.type === "CallExpression" && n.callee.type === "MemberExpression" && WUCHS.has(feld(n.callee)))
                    meld(n, `leitet ein Skelett im Haupt-Faden ab (.${feld(n.callee)})`);
                if ((n.type === "ForOfStatement" || n.type === "ForInStatement") && istBestand(n.right))
                    meld(n, "läuft über den Bestand (for-of)");
                if (n.type === "ForStatement" && n.test) {
                    let hit = false;
                    stammLib.wandere(n.test, (x) => {
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
        // die Schreiber beim Namen (D3c: der Freibrief „ruft _blockerNetzSetzen" am Rumpf fiel; dass das Tor das Verzeichnis
        // nachzieht, beweist (V) am Aufruf)
        const darfZiel = name === "spawnArchitecture" || name === "setBlueprintAsPortal" || name === "_hausHuelleSetzen"; // der Kamin aus der Hülle, gestempelt
        const darfHitze = name === "_tickFocusingAffordances";
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
        stammLib.wandere(body, (n) => {
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
    const frei = (b) => Object.keys(FREI).find((m) => b.startsWith(m + " Zeile "));
    for (const m of Object.keys(FREI))
        if (!befunde.some((b) => frei(b) === m))
            befunde.push(`TOTE AUSNAHME: ${m} trägt keinen Befund mehr (${FREI[m]})`);
    return befunde.filter((b) => !frei(b));
}

if (process.argv.includes("--selftest")) {
    console.log("=== BRENNGLAS-TAKT — Selbsttest der Quell-Wand (ohne Browser) ===");
    const v = [];
    const stamm = quellWand(stammLib.text(root));
    for (const b of stamm) v.push("STAMM: " + b);
    // eine Klasse mit allen Takten (leer, bis auf den geprüften) und der benannten Ausnahme
    const AUSNAHME = "_chunkSatzMesh(mesh, spec) { Object.assign(mesh.userData, spec.userData); }";
    const takt = (name, rumpf) =>
        `class X { ${TAKTE.filter((x) => x !== name)
            .map((x) => `${x}() {}`)
            .join(" ")} ${AUSNAHME} ${name}() { ${rumpf} } }`;
    const klasse = (rumpf) => `class X { ${TAKTE.map((x) => `${x}() {}`).join(" ")} ${AUSNAHME} ${rumpf} }`;
    const BESTAND = "läuft über den Bestand";
    const STEMPEL = "ohne Stempel";
    const WUCHS_SATZ = "leitet ein Skelett im Haupt-Faden ab";
    const proben = [
        ["Filter", takt("_tickFocusingAffordances", "this.state.architectures.filter((e) => e.affordances);"), BESTAND],
        ["for-of", takt("_updateDorfRauch", "for (const e of this.state.architectures) e.x = 1;"), BESTAND],
        [
            "Alias",
            takt(
                "_tickFocusingAffordances",
                "const bestand = this.state.architectures; for (const e of bestand) e.x = 1;"
            ),
            BESTAND,
        ],
        [
            "forEach über Alias",
            takt("_updateDorfRauch", "const st = this.state; const b = st.architectures || []; b.forEach((e) => e);"),
            BESTAND,
        ],
        [
            "Index bis .length",
            takt(
                "_tickLiftingAffordances",
                "const a = this.state.architectures; for (let i = 0; i < a.length; i++) a[i];"
            ),
            BESTAND,
        ],
        [
            "Destrukturierung",
            takt("tickPlayerBoosts", "const { architectures } = this.state; architectures.some((e) => e);"),
            BESTAND,
        ],
        ["Spread", takt("_tickRadiatingAffordances", "const k = [...this.state.architectures];"), BESTAND],
        [
            "Kopie",
            takt("_tickBalancingAffordances", "const k = this.state.architectures.slice(); for (const e of k) e;"),
            BESTAND,
        ],
        [
            "die Liste des Netzes",
            takt("_findNearestAffordanceEntry", "for (const e of this._blockerNetz().liste) e;"),
            BESTAND,
        ],
        ["Affordanz ersetzt", klasse("tor(e) { e.affordances = {}; }"), STEMPEL],
        ["Affordanz verschachtelt", klasse("tor(e) { e.affordances.focusing = true; }"), STEMPEL],
        ["Affordanz über Alias", klasse("tor(e) { const a = e.affordances; a.focusing = true; }"), STEMPEL],
        [
            "Affordanz per Object.assign",
            klasse("tor(e) { Object.assign(e.affordances, { focusing: true }); }"),
            STEMPEL,
        ],
        ["Affordanz gelöscht", klasse("tor(e) { delete e.affordances.focusing; }"), STEMPEL],
        ["Kamin verschachtelt", klasse("kamin(e) { e.userData.rauchQuelle = {}; }"), STEMPEL],
        ["userData-Ersatz mit Kamin", klasse("kamin(e, t) { e.userData = { rauchQuelle: t }; }"), STEMPEL],
        ["userData-Ersatz über Namen", klasse("kamin(e, u) { e.userData = u; }"), STEMPEL],
        [
            "userData per Object.assign",
            klasse("kamin(e, t) { Object.assign(e.userData, { rauchQuelle: t }); }"),
            STEMPEL,
        ],
        ["fremde Hitze", klasse("feuer(e) { e.heatBuildup = 0.4; }"), "außerhalb des Brennglas-Takts"],
        ["fremde Hitze +=", klasse("feuer(e) { e.heatBuildup += 0.1; }"), "außerhalb des Brennglas-Takts"],
        ["fremde Hitze ++", klasse("feuer(e) { e.heatBuildup++; }"), "außerhalb des Brennglas-Takts"],
        ["tote Ausnahme", `class X { ${TAKTE.map((x) => `${x}() {}`).join(" ")} }`, "TOTE AUSNAHME"],
        [
            "Spiegel-Kronen über den Bestand",
            takt("_spiegelKronen", "for (const e of this.state.architectures) e;"),
            BESTAND,
        ],
        [
            "Spiegel-Familie über den Bestand",
            klasse("_spiegelHilfe() { (this.state.architectures || []).some((e) => e); }"),
            BESTAND,
        ],
        ["Wuchs im Takt", takt("_spiegelKronen", "this._gestaltTeile(p, g, null, []);"), WUCHS_SATZ],
        [
            "Wuchs in der Spiegel-Familie",
            klasse("_spiegelGestalt(z) { return this._growTreeBlueprintRich(z.art, null, {}); }"),
            WUCHS_SATZ,
        ],
        [
            "Skelett im Takt",
            takt("_spiegelFeldTakt", "globalThis.__terrainCore.skelettDerGestalt('eiche', 1, 0);"),
            WUCHS_SATZ,
        ],
    ];
    for (const [was, src, satz] of proben) {
        const b = quellWand(src);
        if (!b.some((x) => x.includes(satz))) v.push(`${was} fällt nicht rot (${JSON.stringify(b)})`);
    }
    const gruen = [
        [
            "gestempelter Schreiber",
            klasse("setBlueprintAsPortal(e) { e.affordances = {}; e.affordances.focusing = true; this._blockerNetzSetzen(e); }"),
        ],
        ["harmloses userData", klasse("m(mesh) { mesh.userData = { a: 1 }; mesh.userData = mesh.userData || {}; }")],
        [
            "Verzeichnis bis .length",
            takt(
                "_updateDorfRauch",
                "const archs = Array.isArray(this.state.architectures) ? this._blockerMit('rauch') : null; for (let i = 0; i < archs.length; i++) archs[i];"
            ),
        ],
        [
            "Kronen aus dem Buch um die Plätze",
            takt(
                "_spiegelKronen",
                "const nah = this._blockerUmPlatz(x, z, w, []); for (const e of nah) this._foundryBaumKrone(p, e);"
            ),
        ],
    ];
    for (const [was, src] of gruen) {
        const b = quellWand(src);
        if (b.length) v.push(`${was} fällt rot (${JSON.stringify(b)})`);
    }
    selbsttestEnde(
        v,
        `kein Takt der Klasse läuft über den Bestand, jeder Schreiber stempelt; ${proben.length} eingeschleuste ` +
            `Brüche fallen rot (Alias, forEach, Index, Destrukturierung, Spread, Kopie, Netz-Liste, verschachtelte und userData-Schreiber, ` +
            `fremde Hitze, tote Ausnahme, Spiegel-Familie, Wuchs im Takt), ${gruen.length} harmlose Formen bleiben grün.`
    );
    process.exit(0);
}

const server = statikServer();

async function probe() {
    const AR = r.constructor;
    const P = Object.getPrototypeOf(r);
    // DAS ORAKEL: der Brennglas-Takt von main V18.536 — die Schleife über den ganzen Bestand, je Ziel dasselbe Wärme-Gesetz
    // (`_brennWaerme`, stoffe.K1)
    const orakel = (dt) => {
        if (!r._buehneSteht()) return;
        const archs = st.architectures || [];
        const focusing = archs.filter((e) => e.affordances && e.affordances.focusing);
        const sonne = st.weather === "sunny" ? r._sonnenRichtung() : null;
        const licht = sonne && sonne.y > 0 ? sonne : null;
        const punkte = [];
        if (licht) for (const fa of focusing) for (const p of r._brennpunkte(fa, licht)) punkte.push({ fa, p });
        const name = (e) => {
            const b = e && st.blueprints ? st.blueprints[e.type] : null;
            return String((b && b.label) || (e && e.type) || "?").split(/\s[·—(]/)[0];
        };
        const ignitions = [];
        const riddenId = st.player ? st.player.mountedArch : null;
        for (const target of archs) {
            const vorher = target.heatBuildup || 0;
            if (!(vorher > 0) && !punkte.length) continue;
            if (target.affordances && target.affordances.focusing) continue;
            if (riddenId != null && target.id === riddenId) continue;
            const w = r._brennWaerme(target, punkte, focusing, dt);
            if (!w) continue;
            target.heatBuildup = w.dT;
            if (!w.quelle) continue;
            if (vorher < w.zuend / 2 && w.dT >= w.zuend / 2 && w.dT < w.zuend)
                r._spielerSagt(
                    `„${name(target)}" glimmt im Brennpunkt von „${name(w.quelle)}" — rück es aus dem Licht, sonst fängt es Feuer.`
                );
            if (w.dT >= w.zuend) ignitions.push({ t: target, quelle: w.quelle });
        }
        const pm = st.playerMesh && st.playerMesh.position;
        for (const { t, quelle } of ignitions) {
            const d = pm ? Math.hypot(t.position.x - pm.x, t.position.z - pm.z) : null;
            r._spielerSagt(
                `Die Sonne entzündete durch „${name(quelle)}" „${name(t)}"${d != null ? ` (${Math.round(d)} m von dir)` : ""}.`
            );
            if (r.journalAppend)
                r.journalAppend("loss", AR._datum`Die Sonne entzündete durch „${name(quelle)}" „${name(t)}".`, {
                    type: t.type,
                    linse: quelle.type,
                });
            r.removeArchitecture(t);
        }
    };
    // ein Lauf eines Takts mit gebuchten Wirkungen (Sätze, Journal, Abriss) — das Feuer wirkt erst danach
    const buche = (fn, dt) => {
        const b = { saetze: [], journal: [], feuer: [] };
        r._spielerSagt = (t) => b.saetze.push(t);
        r.journalAppend = (...a) => b.journal.push(JSON.stringify(a));
        r.removeArchitecture = (e) => {
            b.feuer.push(e);
            return true;
        };
        try {
            fn(dt);
        } finally {
            delete r._spielerSagt;
            delete r.journalAppend;
            delete r.removeArchitecture;
        }
        return b;
    };
    let s = 0x6c61;
    const rng = () => {
        s = (s + 0x6d2b79f5) | 0;
        let x = Math.imul(s ^ (s >>> 15), 1 | s);
        x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
        return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
    // der Spieler je Ruf frisch (`st.playerMesh` wird während der Probe ersetzt — der Avatar baut neu; ein gemerktes Mesh
    // bewegte eine Leiche, die Tür-Probe stand am alten Ort)
    const stelle = (x, z) => st.playerMesh.position.set(x, r.getTerrainHeightAt(x, z) + 1.2, z);
    st.weatherEffectTime = 0;
    // DIE WELT: zwei Dörfer abseits der Gläser (der Bestand wächst, die Kamine rauchen)
    let laeuft = null;
    const ss = r.spawnSettlement;
    r.spawnSettlement = function (o) {
        laeuft = ss.call(this, o);
        return laeuft;
    };
    const ox = -1400,
        oz = 1400;
    stelle(ox + 160, oz);
    r.dslRun(["spawn_village", ["at_player"], 4911], { source: "human" });
    if (laeuft) await laeuft;
    laeuft = null;
    r.dslRun(["spawn_village", ["near_player", 40], 4912], { source: "human" });
    if (laeuft) await laeuft;
    stelle(ox, oz);
    // DIE BÜHNE: Brenngläser am Ort, Brennbares in ihren Brennpunkten und ringsum
    const bps = st.blueprints;
    const glasArten = Object.keys(bps).filter((n) => {
        try {
            const a = r.computeBlueprintAffordances(bps[n]);
            return a && a.focusing;
        } catch {
            return false;
        }
    });
    const brennArten = Object.keys(bps).filter((n) => {
        try {
            return (
                Array.isArray(bps[n].parts) &&
                bps[n].parts.length > 0 &&
                bps[n].parts.some((p) => !!st.materials[p.material] && r._stoff(p.material).tZuend > 0) &&
                !(r.computeBlueprintAffordances(bps[n]) || {}).focusing
            );
        } catch {
            return false;
        }
    });
    const aus = { glasArten: glasArten.slice(0, 6), brennArten: brennArten.length, verzeichnis: [] };
    const setze = (typ, x, z) =>
        r.spawnArchitecture(typ, { x, y: r.getTerrainHeightAt(x, z) + 0.5, z }, { silent: true, rotationY: 0 });
    const glaeser = [];
    for (let k = 0; k < Math.min(4, glasArten.length); k++) {
        const e = setze(glasArten[k], ox + k * 14, oz);
        if (e) glaeser.push(e);
    }
    aus.glaeser = glaeser.length;
    // Brennbares genau in die Brennpunkte (der Körper trägt den Punkt): die Mitte seiner Hülle auf dem Punkt
    const setzeTimeOfDay = (t) => {
        st.timeOfDay = t;
        if (st.world) st.world.timeOfDay = t;
    };
    const indiePunkte = (zeit, je) => {
        setzeTimeOfDay(zeit);
        const licht = r._sonnenRichtung();
        let n = 0;
        if (!(licht.y > 0)) return n;
        for (const fa of glaeser)
            for (const p of r._brennpunkte(fa, licht))
                for (let k = 0; k < je; k++) {
                    const typ = brennArten[(n + k * 7) % brennArten.length];
                    const bb = r._compoundBoundingBox(bps[typ]);
                    if (!bb) continue;
                    const e = setze(typ, p.x - (bb.min.x + bb.max.x) / 2, p.z - (bb.min.z + bb.max.z) / 2);
                    if (!e) continue;
                    e.position.y = p.y - (bb.min.y + bb.max.y) / 2;
                    if (r._traegtPunkt(e, bps[typ], p)) n++;
                }
        return n;
    };
    aus.imPunkt = indiePunkte(0.5, 3);
    // DAS FERNZIEL (ein halber Radius blieb grün): ein fünftes Glas 5,9 m hinter einer Zellgrenze, ein
    // gestrecktes Brennbares, dessen Position 3,9 m daneben in der NACHBAR-Zelle steht — sein Körper trägt den Brennpunkt, sein
    // Platz (Position ± Blocker-Reichweite) liegt außerhalb der halben Frage: nur die volle Reichweite findet ihn. Die Art sucht
    // die Wand unter den brennbaren (Probe-Spawn, die Blocker-Reichweite unter 1,6 m — eine Eiche trägt 10 m Krone als Blocker)
    const ZELLE = AR.BLOCKER_ZELLE;
    const RW = AR.FOCUSING_HEAT_RANGE_M;
    aus.fern = { gesetzt: false, versucht: 0 };
    const fx = Math.floor((ox + 60) / ZELLE) * ZELLE + 5.9,
        fz = oz + 4;
    const fernGlas = glasArten.length ? setze(glasArten[0], fx, fz) : null;
    let fernZiel = null;
    const fp = fernGlas ? r._brennpunkte(fernGlas, r._sonnenRichtung())[0] : null;
    if (fp) {
        const px = fx + 3.9,
            pz = fz;
        for (const art of brennArten) {
            if (aus.fern.versucht >= 40) break;
            const bb = r._compoundBoundingBox(bps[art]);
            if (!bb) continue;
            const mx = (bb.min.x + bb.max.x) / 2,
                mz = (bb.min.z + bb.max.z) / 2,
                halb = Math.max(bb.extent.x, bb.extent.z) / 2;
            if (!(halb > 0.05)) continue;
            // die kleinste Streckung, mit der der Körper den Punkt trägt (die Mitte wandert mit der Streckung)
            let g = 0;
            for (let s = 0.5; s <= 12; s += 0.05)
                if (Math.hypot(px + mx * s - fp.x, pz + mz * s - fp.z) <= halb * s - 0.1) {
                    g = s;
                    break;
                }
            if (!g) continue;
            aus.fern.versucht++;
            const e = r.spawnArchitecture(art, { x: px, y: 0, z: pz }, { silent: true, rotationY: 0, scale: g });
            if (!e) continue;
            e.position.y = fp.y - ((bb.min.y + bb.max.y) / 2) * g;
            // wie ein Studio-Baum im Spiel: Blocker nur am Stamm (die Krone trägt den Punkt, sie blockt nicht) — über den
            // Stempel des Spiels (`_blockerStampReach`); headless trägt die Probe sonst Blocker über den ganzen Körper
            e.blockerAABBs = [
                {
                    minX: px - 0.4,
                    maxX: px + 0.4,
                    minZ: pz - 0.4,
                    maxZ: pz + 0.4,
                    botY: e.position.y - 2,
                    topY: e.position.y + 2,
                },
            ];
            r._blockerStampReach(e);
            const traegt = r._traegtPunkt(e, bps[art], fp);
            const voll = r._blockerUmPlatz(fx, fz, RW + 1e-6, []).includes(e);
            const halbF = r._blockerUmPlatz(fx, fz, RW / 2 + 1e-6, []).includes(e);
            if ((aus.fern.proben = aus.fern.proben || []).length < 10)
                aus.fern.proben.push({
                    art,
                    g: +g.toFixed(2),
                    reichweite: +(e._blockerReach || 0).toFixed(2),
                    traegt,
                    voll,
                    halb: halbF,
                });
            if (traegt && voll && !halbF) {
                fernZiel = e;
                aus.fern = {
                    gesetzt: true,
                    versucht: aus.fern.versucht,
                    art,
                    skala: +g.toFixed(2),
                    abstand: +Math.hypot(e.position.x - fx, e.position.z - fz).toFixed(2),
                    reichweite: +(e._blockerReach || 0).toFixed(2),
                    traegt,
                    voll,
                    halb: halbF,
                    heiz: 0,
                    halbRadius: RW / 2,
                };
                break;
            }
            r.removeArchitecture(e);
        }
    }
    // DER BEWEGER (ohne die Beweger blieb die Wand grün): ein Brennbares, weit weg gestempelt, dann in
    // einen Brennpunkt getragen (`_blockerBewegt`, wie das gerittene Werk) — sein Platz steht noch am alten Ort
    aus.beweger = { gesetzt: false };
    let bewegt = null;
    if (glaeser.length) {
        const licht = r._sonnenRichtung();
        const p = r._brennpunkte(glaeser[0], licht)[0];
        const typ = brennArten[11 % brennArten.length];
        const bb = r._compoundBoundingBox(bps[typ]);
        if (p && bb) {
            bewegt = setze(typ, ox - 120, oz + 90);
            if (bewegt) {
                bewegt.position.x = p.x - (bb.min.x + bb.max.x) / 2;
                bewegt.position.z = p.z - (bb.min.z + bb.max.z) / 2;
                bewegt.position.y = p.y - (bb.min.y + bb.max.y) / 2;
                r._blockerBewegt(bewegt);
                const N0 = r._blockerNetz();
                const ohne = [];
                // die Frage ohne die Beweger: nur die Platz-Zellen um das Glas
                const voll = r._blockerUmPlatz(glaeser[0].position.x, glaeser[0].position.z, RW + 1e-6, []);
                N0.beweger.delete(bewegt);
                r._blockerUmPlatz(glaeser[0].position.x, glaeser[0].position.z, RW + 1e-6, ohne);
                r._blockerBewegt(bewegt);
                aus.beweger = {
                    gesetzt: true,
                    traegt: r._traegtPunkt(bewegt, bps[typ], p),
                    istBeweger: N0.beweger.has(bewegt),
                    mitBewegern: voll.includes(bewegt),
                    ohneBeweger: ohne.includes(bewegt),
                    heiz: 0,
                };
            }
        }
    }
    for (let k = 0; k < 40; k++)
        setze(brennArten[(k * 3) % brennArten.length], ox - 30 + (k % 8) * 9, oz - 24 + Math.floor(k / 8) * 9);
    // der Nachmittag: die Zeit mit hoher Sonne, an der neue Ziele eintreten
    let nachmittag = 0.7;
    for (const z of [0.7, 0.68, 0.66, 0.64, 0.62, 0.6]) {
        setzeTimeOfDay(z);
        if (r._sonnenRichtung().y > 0.2) {
            nachmittag = z;
            break;
        }
    }
    // DER TAG (dt = 1 s je Schritt; 20 s im Brennpunkt zünden)
    const plan = [];
    const strecke = (name, von, bis, n, wetter, tat) => {
        for (let i = 0; i < n; i++)
            plan.push({ name, zeit: von + ((bis - von) * i) / n, wetter: wetter(i), tat: i === 0 ? tat : null });
    };
    const sonnig = () => "sunny";
    strecke("Morgen", 0.15, 0.45, 20, sonnig);
    strecke("Mittag", 0.495, 0.5, 12, sonnig);
    strecke("Wolken", 0.5, 0.505, 10, (i) => (i % 3 === 2 ? "stormy" : "rainy"), "abriss");
    strecke("Mittag II", 0.505, 0.515, 26, sonnig, "array");
    strecke("Nachmittag", nachmittag, nachmittag + 0.004, 12, sonnig, "eintritt");
    strecke("Abend", 0.74, 0.8, 10, sonnig);
    strecke("Nacht", 0.8, 1.0, 20, sonnig);
    const dt = 1.0;
    const T = { schritte: plan.length, heiz: 0, glimm: 0, feuer: 0, kuehl: 0, abw: 0, abweichung: [], phasen: {} };
    T.angefasst = 0;
    T.bestand = 0;
    T.betroffen = 0;
    T.zuViel = 0;
    T.zuVielBeispiel = null;
    T.warmFehlt = 0;
    T.taten = [];
    for (const sch of plan) {
        if (sch.tat === "abriss") {
            const w = st.architectures.find((e) => e && e.heatBuildup > 0);
            if (w) {
                r.removeArchitecture(w);
                T.taten.push(`Abriss eines warmen Eintrags (${w.type}#${w.id})`);
            }
        } else if (sch.tat === "array") {
            st.architectures = st.architectures.slice();
            T.taten.push(`neues Array (${st.architectures.filter((e) => e && e.heatBuildup > 0).length} warm)`);
        } else if (sch.tat === "eintritt") {
            const n = indiePunkte(nachmittag, 1);
            T.taten.push(`${n} neue Ziele im Brennpunkt des Nachmittags`);
        }
        setzeTimeOfDay(sch.zeit);
        st.weather = sch.wetter;
        const archs = st.architectures.slice();
        const vor = new Map(archs.map((e) => [e, e.heatBuildup]));
        // die Betroffenen vor dem Schritt: die warmen und, wenn die Sonne durch ein Glas scheint, die Plätze in Reichweite
        const N = r._blockerNetz();
        const sonne = st.weather === "sunny" ? r._sonnenRichtung() : null;
        const gl = archs.filter((e) => e && e.affordances && e.affordances.focusing && e.position);
        const scheint = !!(sonne && sonne.y > 0 && gl.some((fa) => r._brennpunkte(fa, sonne).length));
        const R = AR.FOCUSING_HEAT_RANGE_M + AR.BLOCKER_ZELLE;
        let betroffen = 0;
        for (const e of archs) {
            if (!e) continue;
            const reich = R + (e._blockerReach || 0);
            if (
                e.heatBuildup > 0 ||
                (N && N.beweger && N.beweger.has(e)) ||
                (scheint &&
                    e.position &&
                    gl.some(
                        (fa) =>
                            Math.abs(fa.position.x - e.position.x) <= reich &&
                            Math.abs(fa.position.z - e.position.z) <= reich
                    ))
            )
                betroffen++;
        }
        const soll = buche(orakel, dt);
        const sollHitze = archs.map((e) => e.heatBuildup);
        for (const [e, h] of vor) {
            if (h === undefined) delete e.heatBuildup;
            else e.heatBuildup = h;
        }
        if (r._brennZiele) r._brennZiele.length = 0;
        const ist = buche((d) => P._tickFocusingAffordances.call(r, d), dt);
        const istHitze = archs.map((e) => e.heatBuildup);
        let gleich =
            soll.saetze.join("\n") === ist.saetze.join("\n") &&
            soll.journal.join("\n") === ist.journal.join("\n") &&
            soll.feuer.length === ist.feuer.length &&
            soll.feuer.every((e, k) => e === ist.feuer[k]);
        let hk = -1;
        for (let k = 0; k < archs.length; k++)
            if (!Object.is(sollHitze[k], istHitze[k])) {
                hk = k;
                break;
            }
        if (!gleich || hk >= 0) {
            T.abw++;
            if (T.abweichung.length < 3)
                T.abweichung.push({
                    phase: sch.name,
                    zeit: +sch.zeit.toFixed(3),
                    wetter: sch.wetter,
                    eintrag: hk >= 0 ? `${archs[hk].type}#${archs[hk].id} ${sollHitze[hk]} ≠ ${istHitze[hk]}` : null,
                    saetze: [soll.saetze.length, ist.saetze.length],
                    feuer: [soll.feuer.length, ist.feuer.length],
                });
        }
        const ph = (T.phasen[sch.name] = T.phasen[sch.name] || {
            heiz: 0,
            kuehl: 0,
            glimm: 0,
            feuer: 0,
            angefasst: 0,
            betroffen: 0,
            n: 0,
        });
        let heiz = 0,
            kuehl = 0;
        for (const e of archs) {
            const a = vor.get(e) || 0,
                b = e.heatBuildup || 0;
            if (b > a) heiz++;
            else if (b < a) kuehl++;
            if (b > a && e === fernZiel) aus.fern.heiz++;
            if (b > a && e === bewegt) aus.beweger.heiz++;
        }
        const glimm = ist.saetze.filter((t) => t.includes("glimmt")).length;
        T.heiz += heiz;
        T.kuehl += kuehl;
        T.glimm += glimm;
        T.feuer += ist.feuer.length;
        ph.heiz += heiz;
        ph.kuehl += kuehl;
        ph.glimm += glimm;
        ph.feuer += ist.feuer.length;
        // ARBEIT: was der neue Takt anfasste (seine Ziele; der alte: den Bestand)
        const angefasst = r._brennZiele ? r._brennZiele.length : archs.length;
        T.angefasst += angefasst;
        T.bestand += archs.length;
        T.betroffen += betroffen;
        ph.angefasst += angefasst;
        ph.betroffen += betroffen;
        ph.n++;
        if (angefasst > betroffen) {
            T.zuViel++;
            if (!T.zuVielBeispiel)
                T.zuVielBeispiel = `${sch.name} ${sch.wetter}: angefasst ${angefasst}, betroffen ${betroffen}`;
        }
        // das Feuer wirkt jetzt (wie im Takt nach der Schleife)
        for (const e of ist.feuer) P.removeArchitecture.call(r, e);
        // jeder warme Eintrag des Bestands steht in der warmen Menge
        const N2 = r._blockerNetz();
        if (N2 && N2.warm)
            for (const e of st.architectures) if (e && e.heatBuildup > 0 && !N2.warm.has(e)) T.warmFehlt++;
    }
    aus.tag = T;
    aus.nachmittag = nachmittag;
    // DAS VERZEICHNIS gegen den Filter, nach Mutationen
    const schluessel = () => {
        const k = new Set(["rauch", "focusing", "radiating", "broadcasting", "balancing", "lifting", "isPortal"]);
        for (const e of st.architectures)
            if (e && e.affordances) for (const a in e.affordances) if (e.affordances[a]) k.add(a);
        return [...k];
    };
    const filter = (k) =>
        k === "rauch"
            ? st.architectures.filter((e) => e && ((e.userData && e.userData.rauchQuelle) || e.chimney))
            : st.architectures.filter((e) => e && e.affordances && e.affordances[k]);
    const vergleiche = (name) => {
        const f = [];
        let mitglieder = 0;
        for (const k of schluessel()) {
            const a = filter(k),
                b = r._blockerMit(k);
            mitglieder += a.length;
            if (a.length !== b.length || a.some((e, i) => e !== b[i]))
                f.push(`${k}: Filter ${a.length}, Verzeichnis ${b.length}`);
        }
        return { name, schluessel: schluessel().length, mitglieder, fehler: f.slice(0, 6) };
    };
    aus.verzeichnis.push(vergleiche("nach dem Tag"));
    stelle(ox - 200, oz);
    laeuft = null;
    r.dslRun(["spawn_village", ["at_player"], 4913], { source: "human" });
    if (laeuft) await laeuft;
    stelle(ox, oz);
    aus.verzeichnis.push(vergleiche("Spawn (Dorf)"));
    const weg = st.architectures
        .filter((e) => e && e.affordances && Object.values(e.affordances).some(Boolean))
        .slice(0, 3);
    const wegRauch = st.architectures.filter((e) => e && e.chimney).slice(0, 2);
    for (const e of weg.concat(wegRauch)) r.removeArchitecture(e);
    aus.verzeichnis.push(vergleiche("Abriss"));
    // ein Tor wird nachgezogen: der Klon eines Brennglases (focusing), zwei stehende Einträge, dann `setBlueprintAsPortal` —
    // sie verlassen „focusing" und treten in „isPortal" ein
    aus.tor = { klon: false, eintraege: 0, vorher: 0, nachher: 0 };
    const vomTor = (k) =>
        st.architectures.filter((e) => e && e.type === "glas_tor_probe" && e.affordances && e.affordances[k]).length;
    if (glasArten.length && r.cloneBlueprint(glasArten[0], "glas_tor_probe")) {
        aus.tor.klon = true;
        const a = setze("glas_tor_probe", ox + 20, oz + 30),
            b = setze("glas_tor_probe", ox + 26, oz + 30);
        aus.tor.eintraege = [a, b].filter(Boolean).length;
        aus.tor.vorher = vomTor("focusing");
        aus.verzeichnis.push(vergleiche("Tor gesetzt"));
        r.setBlueprintAsPortal("glas_tor_probe", { world: "worlds/portale/index.html", label: "Probe" });
        aus.tor.nachher = vomTor("isPortal");
    }
    aus.verzeichnis.push(vergleiche("Tor nachgezogen"));
    st.architectures = st.architectures.slice();
    aus.verzeichnis.push(vergleiche("neues Array"));
    // DIE RESONANZ: die Plätze um den Spieler gegen den Filter über den Bestand — im Radius der Boosts und des Lofi-Pads (24 m)
    const res = {
        proben: 0,
        abweichungen: 0,
        fehler: [],
        kandidaten: 0,
        inReichweite: 0,
        bestand: st.architectures.length,
    };
    for (let i = 0; i < 300; i++) {
        const x = ox - 260 + rng() * 460,
            z = oz - 80 + rng() * 160;
        const weite = i % 2 ? 24 : AR.BOOST_RESONANCE_RADIUS;
        const R2 = weite * weite;
        const nah = (e) => e && e.position && (e.position.x - x) ** 2 + (e.position.z - z) ** 2 <= R2;
        const alt = st.architectures.filter(nah);
        const kand = r._blockerUmPlatz(x, z, weite + 1e-6, []);
        const neu = kand.filter(nah);
        res.proben++;
        res.kandidaten += kand.length;
        res.inReichweite += alt.length;
        if (alt.length !== neu.length || alt.some((e, k) => e !== neu[k])) {
            res.abweichungen++;
            if (res.fehler.length < 3)
                res.fehler.push(`${alt.length} ≠ ${neu.length} bei ${x.toFixed(1)}/${z.toFixed(1)}`);
        }
    }
    aus.resonanz = res;
    // DER DORF-RAUCH: die Quellen gegen die Schleife über den Bestand
    const rauchAlt = () => {
        const q = [];
        for (const e of st.architectures) {
            if (!e || !e.position) continue;
            const tip =
                (e.userData && e.userData.rauchQuelle) ||
                (e.chimney && Number.isFinite(e.chimney.x) ? e.chimney : null);
            if (!tip || !Number.isFinite(tip.x) || !Number.isFinite(tip.y) || !Number.isFinite(tip.z)) continue;
            const phi = Number.isFinite(e.rotationY) ? e.rotationY : 0;
            const c = Math.cos(phi),
                sn = Math.sin(phi);
            const ex = e.position.x || 0,
                ez = e.position.z || 0,
                ey = (Number.isFinite(e.position.y) ? e.position.y : 0) - 0.5;
            q.push({ id: e.id, x: ex + tip.x * c + tip.z * sn, y: ey + tip.y, z: ez - tip.x * sn + tip.z * c });
        }
        return q;
    };
    r._updateDorfRauch(0.016);
    const qa = JSON.stringify(rauchAlt()),
        qn = JSON.stringify((st.dorfRauch && st.dorfRauch.quellen) || []);
    aus.rauch = { quellen: JSON.parse(qa).length, gleich: qa === qn };
    // (H) DIE HAUS-TÜR: fern von jedem Haus scannt der Tür-Takt (nichts), dann 5 m vor ein Haus mit Tür — 2 s Frames später
    // steht es in der Nähe-Liste und trägt sein Tür-Gedächtnis (`_tuerRec`); die Liste ist der Filter über den Bestand
    const haeuser = st.architectures.filter((e) => e && e.tuer && e.position);
    const echt = { x: st.playerMesh.position.x, y: st.playerMesh.position.y, z: st.playerMesh.position.z };
    // wie ein Spieler: zum Haus gehen, bis die Mesh-Zone es zeichnet (`tickArchitectureCulling` → seine Instanz, asynchron
    // über die Werkstatt; das EINE Warten auf den Bau, welt-boot `__gebautNach`)
    let haus = haeuser.find((e) => e.instSlots) || null;
    if (!haus && haeuser.length) {
        const ziel = haeuser[0];
        stelle(ziel.position.x + 5, ziel.position.z);
        await window.__gebautNach(ziel, { fertig: () => !!ziel.instSlots, bau: () => r.tickArchitectureCulling() });
        haus = ziel;
    }
    aus.tuer = { haeuser: haeuser.length, mitInstanz: haeuser.filter((e) => e.instSlots).length };
    if (haus) {
        stelle(ox + 900, oz + 900);
        r._hausTuerScanT = 0;
        r._hausTuerNah = null;
        const t0 = 5000; // Sekunden wie der Loop
        P._tickHausTueren.call(r, t0);
        const fernListe = (r._hausTuerNah || []).length;
        stelle(haus.position.x + 5, haus.position.z);
        delete haus._tuerRec;
        for (let i = 1; i <= 120; i++) P._tickHausTueren.call(r, t0 + i / 60);
        const nah = r._hausTuerNah || [];
        const q = st.playerMesh.position;
        const soll = st.architectures.filter(
            (e) =>
                e && e.tuer && e.position && e.instSlots && (e.position.x - q.x) ** 2 + (e.position.z - q.z) ** 2 < 1600
        );
        Object.assign(aus.tuer, {
            fernListe,
            drin: nah.includes(haus),
            rec: !!haus._tuerRec,
            liste: nah.length,
            soll: soll.length,
            gleich: nah.length === soll.length && nah.every((e, k) => e === soll[k]),
        });
        st.playerMesh.position.set(echt.x, echt.y, echt.z);
    }
    // (N) DIE NÄHE: die Takte, die nur den Spieler treffen — Strahlen (mit dem Relais der Masten), Balancieren, Heben und die
    // nächste Affordanz (der Portal-Takt je Frame) — urteilen wie die Schleife über ihr Verzeichnis (das ORAKEL, der Takt von main
    // 9fb869a5 im Wortlaut) und kosten die NÄHE: eine ferne Menge derselben Namen (Strahler, Masten, …) ändert ihre Zeit nicht.
    aus.naehe = window.__naeheProbe(r, st, AR, P, setze, stelle, ox - 700, oz);
    aus.bestand = st.architectures.length;
    return aus;
}

// (N) DIE NÄHE — läuft in der Seite (Teil von `probe`, über toString mitgereicht).
function naeheProbe(r, st, AR, P, setze, stelle, cx, cz) {
    const aus = { proben: 0, abw: 0, fehler: [], wirkung: {}, arbeit: {}, menge: 0 };
    // DAS ORAKEL: die vier Takte von main 9fb869a5 (der Stamm dort) im Wortlaut — je Takt jeder Eintrag des Verzeichnisses
    const O = {
        _tickRadiatingAffordances(dt) {
            const radiating = this._blockerMit("radiating");
            if (radiating.length === 0) return;
            const pm = this.state.playerMesh && this.state.playerMesh.position;
            if (!pm) return;
            const emo = this.state.player && this.state.player.emotions;
            if (!emo) return;
            const baseRange2 = AR.RADIATING_RANGE_M * AR.RADIATING_RANGE_M;
            const baseStep = AR.RADIATING_EMOTION_RATE_PER_SEC * dt;
            const broadcasting = this._blockerMit("broadcasting").filter((e) => e.position);
            const relayRange2 = AR.BROADCAST_RELAY_RANGE_M * AR.BROADCAST_RELAY_RANGE_M;
            const maxMult = AR.BROADCAST_RANGE_MULT;
            const strengthOf = (e, key) => {
                const s = e.affordanceStrength && e.affordanceStrength[key];
                return typeof s === "number" ? s : 1;
            };
            for (const ra of radiating) {
                if (!ra.position) continue;
                let bestMastStrength = 0;
                for (const bc of broadcasting) {
                    const bdx = bc.position.x - ra.position.x;
                    const bdz = bc.position.z - ra.position.z;
                    if (bdx * bdx + bdz * bdz <= relayRange2) {
                        const ms = strengthOf(bc, "broadcasting");
                        if (ms > bestMastStrength) bestMastStrength = ms;
                    }
                }
                const mult = 1 + bestMastStrength * (maxMult - 1);
                const range2 = baseRange2 * mult * mult;
                const dx = ra.position.x - pm.x;
                const dz = ra.position.z - pm.z;
                if (dx * dx + dz * dz > range2) continue;
                const step = baseStep * strengthOf(ra, "radiating");
                emo.awe = Math.max(0, Math.min(1, (emo.awe || 0) + step));
                emo.peace = Math.max(0, Math.min(1, (emo.peace || 0) + step));
                this.journalAppendOnce(`radiating:${ra.id}`, "growth", "strahlt", { architecture: ra.type });
            }
        },
        _tickBalancingAffordances(dt) {
            const balancing = this._blockerMit("balancing");
            if (balancing.length === 0) return;
            const pm = this.state.playerMesh && this.state.playerMesh.position;
            if (!pm) return;
            const emo = this.state.player && this.state.player.emotions;
            if (!emo) return;
            const range2 = AR.BALANCING_RANGE_M * AR.BALANCING_RANGE_M;
            const baseStep = AR.BALANCING_CHAOS_DRAIN_PER_SEC * dt;
            for (const ba of balancing) {
                if (!ba.position) continue;
                const dx = ba.position.x - pm.x;
                const dz = ba.position.z - pm.z;
                if (dx * dx + dz * dz > range2) continue;
                const s = ba.affordanceStrength && ba.affordanceStrength.balancing;
                const strength = typeof s === "number" ? s : 1;
                emo.chaos = Math.max(0, Math.min(1, (emo.chaos || 0) - baseStep * strength));
                this.journalAppendOnce(`balancing:${ba.id}`, "growth", "gruendet", { architecture: ba.type });
            }
        },
        _tickLiftingAffordances() {
            const pl = this.state.player;
            if (!pl) return;
            const lifting = this._blockerMit("lifting");
            const pm = this.state.playerMesh && this.state.playerMesh.position;
            if (!pm || lifting.length === 0) {
                pl.liftingField = { active: false, strength: 0 };
                return;
            }
            const range2 = AR.LIFTING_RANGE_M * AR.LIFTING_RANGE_M;
            let best = 0;
            for (const li of lifting) {
                if (!li.position) continue;
                const dx = li.position.x - pm.x;
                const dz = li.position.z - pm.z;
                if (dx * dx + dz * dz > range2) continue;
                const s = li.affordanceStrength && li.affordanceStrength.lifting;
                const strength = typeof s === "number" ? s : 1;
                if (strength > best) best = strength;
            }
            pl.liftingField = { active: best > 0, strength: best };
        },
        _findNearestAffordanceEntry(affordanceKey, radiusM) {
            const pm = this.state.playerMesh && this.state.playerMesh.position;
            if (!pm) return null;
            const r2 = radiusM * radiusM;
            let best = null;
            let bestD2 = r2;
            for (const entry of this._blockerMit(affordanceKey)) {
                const dx = entry.position.x - pm.x;
                const dy = entry.position.y - pm.y;
                const dz = entry.position.z - pm.z;
                const d2 = dx * dx + dy * dy + dz * dz;
                if (d2 <= bestD2) {
                    bestD2 = d2;
                    best = entry;
                }
            }
            return best;
        },
    };
    const art = st.blueprints.stein_block ? "stein_block" : Object.keys(st.blueprints)[0];
    const markiere = (x, z, a, s) => {
        const e = setze(art, x, z);
        if (!e) return null;
        e.affordances = Object.assign({}, e.affordances, a);
        e.affordanceStrength = Object.assign({}, e.affordanceStrength, s);
        r._blockerNetzSetzen(e); // ein Schreiber der Affordanzen stempelt (Q)
        return e;
    };
    // DIE NÄHE: Strahler A im Grund-Umkreis, Strahler B jenseits davon (22 m) mit einem Mast in Relais-Reichweite (er reicht
    // nur durch den Mast), Strahler C (24 m) ohne Mast, ein Mast beim Spieler ohne Strahler, Balancieren, Heben, zwei Portale
    markiere(cx + 5, cz, { radiating: true }, { radiating: 0.7 });
    markiere(cx + 22, cz, { radiating: true }, { radiating: 0.5 });
    markiere(cx + 30, cz + 2, { broadcasting: true }, { broadcasting: 0.9 });
    markiere(cx, cz + 24, { radiating: true }, { radiating: 0.9 });
    markiere(cx - 3, cz - 3, { broadcasting: true }, { broadcasting: 0.4 });
    markiere(cx - 6, cz + 3, { balancing: true }, { balancing: 0.8 });
    markiere(cx + 2, cz - 4, { lifting: true }, { lifting: 0.6 });
    markiere(cx + 1, cz + 1, { isPortal: true }, {});
    markiere(cx + 2.5, cz + 0.5, { isPortal: true }, {});
    const lauf = (T, x, z) => {
        stelle(x, z);
        const emo = st.player.emotions;
        emo.awe = 0.3;
        emo.peace = 0.3;
        emo.chaos = 0.6;
        const seen = [];
        r.journalAppendOnce = (k) => seen.push(k);
        try {
            T._tickRadiatingAffordances.call(r, 0.5);
            T._tickBalancingAffordances.call(r, 0.5);
            T._tickLiftingAffordances.call(r);
            const tor = T._findNearestAffordanceEntry.call(r, "isPortal", AR.PORTAL_REACH_M);
            const lf = st.player.liftingField || {};
            return JSON.stringify([emo.awe, emo.peace, emo.chaos, lf.active, lf.strength, tor ? tor.id : null, seen]);
        } finally {
            delete r.journalAppendOnce;
        }
    };
    const vergleiche = (wo) => {
        for (let i = 0; i < 49; i++) {
            const x = cx - 36 + (i % 7) * 12,
                z = cz - 36 + Math.floor(i / 7) * 12;
            const alt = lauf(O, x, z),
                neu = lauf(P, x, z);
            aus.proben++;
            if (alt !== neu) {
                aus.abw++;
                if (aus.fehler.length < 3) aus.fehler.push(`${wo} ${x - cx}/${z - cz}: alt ${alt} · neu ${neu}`);
            }
        }
    };
    vergleiche("nah");
    // die Wirkung am Platz (nicht vakuös): A und B (nur durch den Mast) strahlen, C nicht; Balancieren, Heben, das Portal
    const w = JSON.parse(lauf(P, cx, cz));
    aus.wirkung = {
        awe: w[0],
        chaos: w[2],
        heben: w[4],
        tor: w[5] != null,
        strahler: w[6].filter((k) => /^radiating/.test(k)).length,
    };
    // DIE ARBEIT je Ruf am Platz (Lehre 26: gezählt, nie gestoppt — die Uhr urteilt unter Last falsch): jeder Griff eines
    // Takts an einen Eintrag der fernen Menge — sein
    // Platz (`position`) oder die Marke der Zellen-Frage (`_blockerFrage`) — zählt; ein Ruf nach einem Ruf zum Anwärmen.
    let griffe = 0;
    const arbeit = (T) => {
        stelle(cx, cz);
        const glieder = {
            strahlen: () => T._tickRadiatingAffordances.call(r, 1 / 60),
            balancieren: () => T._tickBalancingAffordances.call(r, 1 / 60),
            heben: () => T._tickLiftingAffordances.call(r),
            portal: () => T._findNearestAffordanceEntry.call(r, "isPortal", AR.PORTAL_REACH_M),
        };
        const out = {};
        r.journalAppendOnce = () => {};
        try {
            for (const [name, f] of Object.entries(glieder)) {
                f();
                griffe = 0;
                f();
                out[name] = griffe;
            }
        } finally {
            delete r.journalAppendOnce;
        }
        return out;
    };
    // DIE FERNE MENGE, 300–900 m vom Platz (jenseits jeder Reichweite): je 300 Strahler und Masten, 1 500 Balancierer, je 3 000
    // Heber und Portale — jeder Eintrag zählt seine Griffe
    const fern = [];
    for (let i = 0; i < 3000; i++) {
        const x = cx - 300 - (i % 60) * 10,
            z = cz - 250 + Math.floor(i / 60) * 10;
        const neu = [
            markiere(x - 4, z + 3, { lifting: true }, { lifting: 0.5 }),
            markiere(x + 5, z - 2, { isPortal: true }, {}),
        ];
        if (i < 1500) neu.push(markiere(x + 3, z - 4, { balancing: true }, { balancing: 0.5 }));
        if (i < 300)
            neu.push(
                markiere(x, z, { radiating: true }, { radiating: 0.5 }),
                markiere(x + 7, z + 7, { broadcasting: true }, { broadcasting: 0.8 })
            );
        for (const e of neu) if (e) fern.push(e);
    }
    aus.menge = fern.length;
    aus.fern = { strahlen: 300, balancieren: 1500, heben: 3000, portal: 3000 };
    vergleiche("mit der fernen Menge");
    for (const e of fern)
        for (const k of ["position", "_blockerFrage"]) {
            let v = e[k];
            Object.defineProperty(e, k, { configurable: true, enumerable: true, get: () => (griffe++, v), set: (x) => void (v = x) });
        }
    aus.arbeit.takt = arbeit(P);
    aus.arbeit.orakel = arbeit(O); // die Gegenprobe: der Takt von main greift jeden fernen Eintrag seines Namens (sonst ist die Linse blind)
    aus.verzeichnis = {
        radiating: r._blockerMit("radiating").length,
        broadcasting: r._blockerMit("broadcasting").length,
    };
    return aus;
}

const NAEHE_RUFER = {
    strahlen: "_tickRadiatingAffordances",
    balancieren: "_tickBalancingAffordances",
    heben: "_tickLiftingAffordances",
    portal: "_findNearestAffordanceEntry (der Portal-Takt)",
};

function urteil(S, stamm) {
    const rot = [];
    const T = S.tag;
    if (T.abw)
        rot.push(
            `(T) DER TAG: ${T.abw} von ${T.schritte} Schritten urteilen anders als der alte Takt — ${JSON.stringify(T.abweichung)}`
        );
    if (!(S.glaeser >= 1 && S.imPunkt >= 1))
        rot.push(`(T) keine Bühne: ${S.glaeser} Gläser, ${S.imPunkt} Körper im Brennpunkt`);
    if (!(T.heiz > 0 && T.glimm > 0 && T.feuer > 0 && T.kuehl > 0))
        rot.push(
            `(T) der Tag ist vakuös: erwärmt ${T.heiz}, geglimmt ${T.glimm}, gezündet ${T.feuer}, gekühlt ${T.kuehl}`
        );
    const W = T.phasen.Wolken || {},
        Na = T.phasen.Nacht || {},
        Nm = T.phasen.Nachmittag || {};
    if (!(W.kuehl > 0 && Na.kuehl > 0 && Nm.heiz > 0))
        rot.push(
            `(T) der Tag ist vakuös: Wolken kühlen ${W.kuehl || 0}, Nacht kühlt ${Na.kuehl || 0}, Nachmittag erwärmt ${Nm.heiz || 0}`
        );
    if (T.warmFehlt) rot.push(`(T) ${T.warmFehlt}× stand ein warmer Eintrag nicht in der warmen Menge`);
    const F = S.fern;
    if (!(F.gesetzt && F.traegt && F.voll && !F.halb && F.heiz > 0 && F.abstand > F.halbRadius))
        rot.push(
            `(T) das FERNZIEL prüft die Reichweite nicht (es muss den Punkt tragen, von der vollen Frage gefunden, von der halben ` +
                `verfehlt und erwärmt werden): ${JSON.stringify(F)}`
        );
    const B = S.beweger;
    if (!(B.gesetzt && B.traegt && B.istBeweger && B.mitBewegern && !B.ohneBeweger && B.heiz > 0))
        rot.push(
            `(T) der BEWEGER prüft die Beweger nicht (er muss den Punkt tragen, nur über die Beweger gefunden und erwärmt ` +
                `werden): ${JSON.stringify(B)}`
        );
    if (T.zuViel)
        rot.push(
            `(A) ARBEIT: in ${T.zuViel} von ${T.schritte} Takten fasste der Brennglas-Takt mehr an als die Betroffenen — ` +
                `${T.zuVielBeispiel} (Bestand ${(T.bestand / T.schritte).toFixed(0)}) — Rufer _tickFocusingAffordances`
        );
    for (const v of S.verzeichnis) for (const f of v.fehler) rot.push(`(V) VERZEICHNIS ${v.name}: ${f}`);
    if (!(S.tor.eintraege >= 1 && S.tor.vorher === S.tor.eintraege && S.tor.nachher === S.tor.eintraege))
        rot.push(`(V) das Tor ist vakuös: ${JSON.stringify(S.tor)}`);
    if (S.resonanz.abweichungen)
        rot.push(
            `(R) RESONANZ: ${S.resonanz.abweichungen} von ${S.resonanz.proben} Proben anders — ${S.resonanz.fehler.join(" · ")}`
        );
    if (!(S.resonanz.inReichweite > 0)) rot.push(`(R) RESONANZ: kein Eintrag in Reichweite einer Probe (vakuös)`);
    if (!S.rauch.gleich) rot.push(`(D) DORF-RAUCH: die Quellen weichen von der Schleife über den Bestand ab`);
    const H = S.tuer || {};
    if (!(H.haeuser > 0 && H.mitInstanz > 0))
        rot.push(`(H) DIE HAUS-TÜR: kein Haus mit Tür und Instanz in der Welt (vakuös) — ${JSON.stringify(H)}`);
    else {
        if (H.fernListe !== 0)
            rot.push(`(H) DIE HAUS-TÜR: die Probe stand nicht fern (${H.fernListe} Häuser in der Liste)`);
        if (!H.drin || !H.rec)
            rot.push(
                `(H) DIE HAUS-TÜR bleibt zu: 2 s nach der Annäherung fehlt das Haus in der Nähe-Liste des Tür-Takts ` +
                    `(_tickHausTueren) — ${JSON.stringify(H)}`
            );
        if (!H.gleich)
            rot.push(`(H) die Nähe-Liste der Türen ist nicht der Filter über den Bestand (${H.liste} ≠ ${H.soll})`);
    }
    if (!(S.rauch.quellen > 0)) rot.push(`(D) DORF-RAUCH: kein Kamin in der Welt (vakuös)`);
    const Nn = S.naehe || { fehler: [], arbeit: {}, wirkung: {} };
    if (Nn.abw)
        rot.push(
            `(N) DIE NÄHE: ${Nn.abw} von ${Nn.proben} Proben urteilen anders als die Schleife über das Verzeichnis — ` +
                Nn.fehler.join(" · ")
        );
    const Wk = Nn.wirkung || {};
    if (!(Wk.strahler === 2 && Wk.awe > 0.3 && Wk.chaos < 0.6 && Wk.heben > 0 && Wk.tor))
        rot.push(
            `(N) DIE NÄHE ist vakuös (zwei Strahler am Platz, einer nur durch den Mast; Balancieren, Heben, ein Portal): ` +
                JSON.stringify(Wk)
        );
    const Z = Nn.arbeit || {};
    for (const g of Object.keys(Z.takt || {})) {
        if (Z.takt[g] > 0)
            rot.push(
                `(N) WELTGRÖSSE: der Takt „${g}" greift die ferne Menge (${Nn.menge} Einträge jenseits jeder Reichweite): ` +
                    `${Z.takt[g]} Griffe je Ruf — Rufer ${NAEHE_RUFER[g]}`
            );
        if (!(Z.orakel[g] >= Nn.fern[g]))
            rot.push(
                `(N) BLIND: die Gegenprobe (der Takt von main) greift für „${g}" ${Z.orakel[g]} von ${Nn.fern[g]} fernen ` +
                    `Einträgen seines Namens — die Linse sähe den Täter nicht`
            );
    }
    if (!Object.keys(Z.takt || {}).length) rot.push(`(N) DIE NÄHE lief nicht (keine Arbeit gezählt)`);
    for (const b of stamm) rot.push(`(Q) QUELLE: ${b}`);
    return rot;
}

hauptLauf(async () => {
    const stamm = quellWand(stammLib.text(root));
    const S = await nullWeltProbe(server, probe, (page) => page.evaluate(`window.__naeheProbe = ${naeheProbe};`));
    const T = S.tag;
    console.log(
        "=== DER BRENNGLAS-TAKT UND SEINE KLASSE — der Takt kostet, was ihn betrifft (Null-Renderer, eine echte Welt) ==="
    );
    console.log(
        `  Bühne: ${S.glaeser} Brenngläser (${S.glasArten.join(", ")}), ${S.imPunkt} Körper im Brennpunkt des Mittags, ` +
            `${S.brennArten} brennbare Arten · Bestand ${S.bestand}`
    );
    console.log(
        `  Tag: ${T.schritte} Schritte · erwärmt ${T.heiz}, geglimmt ${T.glimm}, gezündet ${T.feuer}, gekühlt ${T.kuehl} · ` +
            `Abweichungen ${T.abw} · ${T.taten.join(" · ")}`
    );
    for (const [name, ph] of Object.entries(T.phasen))
        console.log(
            `    ${name.padEnd(11)} erwärmt ${ph.heiz}, gekühlt ${ph.kuehl}, geglimmt ${ph.glimm}, gezündet ${ph.feuer} · ` +
                `angefasst je Takt ${(ph.angefasst / ph.n).toFixed(1)} (betroffen ${(ph.betroffen / ph.n).toFixed(1)})`
        );
    console.log(
        `  Arbeit je Brennglas-Takt: angefasst ${(T.angefasst / T.schritte).toFixed(1)} · ` +
            `betroffen ${(T.betroffen / T.schritte).toFixed(1)} · Bestand ${(T.bestand / T.schritte).toFixed(1)}`
    );
    for (const v of S.verzeichnis)
        console.log(
            `  Verzeichnis ${v.name.padEnd(16)} ${v.schluessel} Namen, ${v.mitglieder} Mitglieder · Fehler ${v.fehler.length}`
        );
    console.log(`  Tor: ${JSON.stringify(S.tor)}`);
    console.log(
        `  Resonanz: ${S.resonanz.proben} Proben, je Probe ${(S.resonanz.kandidaten / S.resonanz.proben).toFixed(1)} Kandidaten ` +
            `(${(S.resonanz.inReichweite / S.resonanz.proben).toFixed(1)} in Reichweite, Bestand ${S.resonanz.bestand}) · ` +
            `Abweichungen ${S.resonanz.abweichungen}`
    );
    console.log(`  Dorf-Rauch: ${S.rauch.quellen} Quellen, gleich ${S.rauch.gleich}`);
    const Ht = S.tuer || {};
    console.log(
        `  Haus-Tür: ${Ht.haeuser} Häuser mit Tür (${Ht.mitInstanz} mit Instanz) · fern ${Ht.fernListe} in der Liste · 2 s nach der ` +
            `Annäherung drin ${Ht.drin}, Tür-Gedächtnis ${Ht.rec} · Liste = Filter ${Ht.gleich} (${Ht.liste}/${Ht.soll})`
    );
    const F = S.fern,
        B = S.beweger;
    console.log(
        `  Fernziel: ${F.art} ×${F.skala}, ${F.abstand} m vom Glas, Platz ±${F.reichweite} m · volle Frage ${F.voll}, ` +
            `halbe ${F.halb} · erwärmt ${F.heiz}× · Beweger: nur über die Beweger ${B.mitBewegern && !B.ohneBeweger} · erwärmt ${B.heiz}×`
    );
    const Nz = (S.naehe && S.naehe.arbeit) || {};
    console.log(
        `  Nähe: ${S.naehe ? S.naehe.proben : 0} Proben gegen das Orakel, Abweichungen ${S.naehe ? S.naehe.abw : "?"} · ` +
            `Wirkung ${JSON.stringify(S.naehe && S.naehe.wirkung)} · ferne Menge ${S.naehe ? S.naehe.menge : 0} ` +
            `(Verzeichnis ${JSON.stringify(S.naehe && S.naehe.verzeichnis)})`
    );
    for (const g of Object.keys(Nz.takt || {}))
        console.log(
            `    ${g.padEnd(11)} Griffe je Ruf an die ferne Menge: Takt ${Nz.takt[g]} · main ${Nz.orakel[g]} (${S.naehe.fern[g]} ihres Namens)`
        );
    const rot = urteil(S, stamm);
    wandEnde(
        rot,
        "der Brennglas-Takt urteilt byte-gleich wie die Schleife über den Bestand und fasst nur seine Betroffenen an; " +
            "die Klasse fragt das Verzeichnis."
    );
});
