#!/usr/bin/env node
// ============================================================================
// DIE APPARAT-LINSE — gate:apparat
//
// Gesetz #0: nach der Fehler-Klasse die LINSE bauen. Rohe `.toString()`-Quelltext-Zitate wacht seit D3d die
// Quelltext-Wand (gate:source-probes); hier steht der typeof-Ratchet — der Bestand darf nur SINKEN.
//
// Zweite Aufgabe: der ANKER-KATALOG (window.__anker in playtest.cjs) ist nur
// wahr, wenn jedes katalogisierte Symbol im lebenden Stamm-CODE existiert —
// zieht ein Symbol um, wird HIER die eine Katalog-Zeile rot, nie N Proben.
//
// Dritte Aufgabe (Klinge 3, K38-N2): jede Linse findet eine Methode am NAMEN, nie an ihrer Parameter-Liste.
// Vierte Aufgabe (Klinge 4, K38-N2 Runde 3): jede Linse ordnet Code seiner Methode am AST zu, nie an einem Kopf-Muster.
// Fünfte Aufgabe (Klinge 5, K60-N5): keine Linse hält eine Taste über einen Zeitgeber statt bis zu ihrem Ereignis.
// Sechste Aufgabe (Klinge 6, D2-N1/N2): jede Linse schneidet einen Block über den EINEN Schneider (stammLib.rumpf) und
// trifft eine Stelle des Stamms über die EINE Engstelle (stammLib.ersetze/treffer), nie am ersten Text-Treffer.
//
// Selbst-Test: --selftest beweist alle sechs Klingen (kein vakuöses Grün):
// (1) eine injizierte typeof-Probe hebt den Zähler über den Ratchet, ein Kommentar nicht; (2) ein erfundenes Katalog-Symbol
// feuert die Katalog-Prüfung; (3) ein Regex- und ein Text-Anker mit Parameter-Liste
// werden mit Datei:Zeile genannt, der Name allein, ein Aufruf und eine fremde Methode schweigen;
// (4) jede Form des Kopf-Musters fällt mit Datei:Zeile, Kopf am Namen, Schlüssel und Zugriff schweigen;
// (5) der alte Lauf von gate:mp-sync (W 1,6 s nach der Uhr) fällt mit Datei:Zeile, das Halten bis zum Ereignis schweigt;
// (6) ein eigener Klammer-Zähler und ein roher erster Treffer auf dem ganzen Stamm fallen mit Datei:Zeile, die Engstelle
//     und ihre Nachbarn (includes, Startpunkt, /g, fremder Text, überschatteter Name, Kommentar) schweigen.
// ============================================================================
"use strict";
const { urteilEnde } = require("./lib/welt-boot.cjs");
const fs = require("fs");
const path = require("path");
const stammLib = require("./lib/stamm.cjs");

// Kommentare strippen, Strings BEWAHREN (der EINE Stripper, scripts/lib/stamm.cjs).
const stripComments = stammLib.ohneKommentare;

// DER typeof-RATCHET (die Voll-Wanderung ist
// tabellen-getrieben offen): die namens-verankerten `typeof … === "function"`-
// Existenz-Proben leben im Apparat. Der Bestand darf NUR SINKEN — jede neue
// Probe liest den Anker-Katalog (window.__anker) oder beweist KONSUM
// (window.__consumes); wandert eine Probe, sinkt die Zahl hier mit.
const FROZEN_TYPEOF = 873;

function countTypeof(src) {
    return (stripComments(src).match(/typeof [^=\n]{1,80}=== "function"/g) || []).length;
}

function scanRatchet(playtestSrc) {
    const errs = [];
    const nT = countTypeof(playtestSrc);
    if (nT > FROZEN_TYPEOF)
        errs.push(
            `typeof-Ratchet: ${nT} namens-verankerte typeof-Existenz-Proben in scripts/playtest.cjs ` +
                `(eingefroren: ${FROZEN_TYPEOF}). Neue Proben lesen window.__anker/__consumes — der Bestand darf nur sinken ` +
                `(sinkt er, FROZEN_TYPEOF mitsenken: der Ratchet klemmt nach unten nach).`
        );
    return { nT, errs };
}

// Den ANKER-KATALOG aus playtest.cjs lesen (die EINE frozen Tabelle).
function parseAnker(playtestSrc) {
    const m = playtestSrc.match(/window\.__anker = Object\.freeze\(\{([\s\S]*?)\}\);/);
    if (!m) return null;
    const entries = [];
    const re = /([A-Za-z_$][\w$]*):\s*"([^"]+)"/g;
    let e;
    while ((e = re.exec(m[1]))) entries.push({ anker: e[1], symbol: e[2] });
    return entries;
}

function scanAnker(playtestSrc, stammSrc) {
    const errs = [];
    if (!/window\.__consumes\s*=/.test(playtestSrc))
        errs.push("Apparat-Schlüssel fehlt: window.__consumes ist nicht mehr in scripts/playtest.cjs definiert.");
    const entries = parseAnker(playtestSrc);
    if (!entries || entries.length === 0) {
        errs.push(
            "Apparat-Schlüssel fehlt: der ANKER-KATALOG (window.__anker) ist nicht mehr in scripts/playtest.cjs."
        );
        return { entries: [], errs };
    }
    const code = stripComments(stammSrc);
    for (const { anker, symbol } of entries) {
        const re = new RegExp(`\\b${symbol.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`);
        if (!re.test(code))
            errs.push(
                `Anker-Katalog: __anker.${anker} zeigt auf "${symbol}", aber der Stamm-CODE trägt das Symbol nicht mehr ` +
                    `— die EINE Katalog-Zeile wandert auf die neue Wahrheit (nie die Probe aufweichen).`
            );
    }
    return { entries, errs };
}

// KLINGE 3 — die Linse findet eine Methode an ihrem NAMEN, nie an ihrer Parameter-Liste. Ein Anker, der
// die Liste festnagelt (im Regex `_x\(a, b\)\s*\{`, als Text "    _x(a, b) {"), bricht bei jedem neuen Parameter, obwohl das
// geprüfte Gesetz steht. Der Name wandert mit: im Regex `_x\([^)]*\)`, im Text `stammLib.kopf(text, "_x")`. Die Klinge
// liest JEDE Linse
// (scripts/, spec/) Token für Token (acorn) und nennt jede Stelle mit Datei:Zeile; der Bestand ist 0 und bleibt 0.
const PARAM_ANKER_RX = /(_[\w$]+)\\\(((?:[^\\)\n]|\\[^()])*?)\\\)(?:\\s\*|\\s\+| )?\\\{/g;
const PARAM_FREI = "[^)]*";
const KOPF_TEXT_RX = /^\n?[ ]*(?:static\s+|async\s+)*([A-Za-z_$][\w$]*)\(([^()]*)\)\s*\{\s*$/;
// KLINGE 4 (K38-N2, Prüfer Runde 3) — eine Linse ordnet Code seiner Methode am AST zu (stammLib.glieder · gliedAn · rufe),
// nie an einem KOPF-MUSTER: ein Regex, der Methoden-Köpfe an einem Namens-Muster sucht (Einzug der Klasse + `\w` oder eine
// Zeichenklasse + `\(`), übersieht still jeden Kopf mit `)` im Default-Parameter, jeden umbrochenen, jeden Getter — der
// Aufruf fiel der Methode davor zu (N4.1 und W2 bis Runde 3; am Kopf von haus-fenster 14163541 neun Stellen in acht
// Linsen). Ein Kopf am NAMEN (`_x\([^)]*\)`) ist Klinge 3. Gelesen wird jedes Regex-Literal, Token für Token.
const KOPF_EINZUG_RX = /(?:\\n|\^)(?: \{4\}| {4}|\\s\{4\}|\[ \]\{4\})/g;
const NAMENS_MUSTER_RX = /\\w|\[[^\]]*(?:a-z|A-Z)[^\]]*\]/;
// Die EINE Stelle ohne AST: die Rehome-Benennung liest Text mit Konflikt-Markern (<<<<<<<), den kein Parser liest, und
// urteilt nicht (sie benennt Hunks für den Menschen). Frei ist genau dieses Muster in genau dieser Datei.
const KOPF_MUSTER_FREI = new Map([
    ["scripts/stamm-rehome.cjs", "^ {4}(?:static\\s+)?(?:async\\s+)?(?:get\\s+|set\\s+)?\\*?([A-Za-z_$][\\w$]*)\\s*\\("],
]);
function kopfMuster(pattern) {
    const out = [];
    for (const m of pattern.matchAll(KOPF_EINZUG_RX)) {
        const rest = pattern.slice(m.index + m[0].length);
        const k = rest.indexOf("\\(");
        if (k < 0) continue;
        const name = rest.slice(0, k);
        // ein Schlüssel (`(\w+): …`) oder ein Zugriff (`a\.b\(`) ist kein Kopf
        if (/:|\\\./.test(name.replace(/\(\?:/g, ""))) continue;
        if (NAMENS_MUSTER_RX.test(name)) out.push(m[0] + name + "\\(");
    }
    return out;
}
function parameterAnker(name, src, stammSrc) {
    const acorn = require("acorn");
    let toks;
    try {
        toks = [
            ...acorn.tokenizer(src, {
                ecmaVersion: "latest",
                locations: true,
                allowHashBang: true,
                allowReturnOutsideFunction: true,
            }),
        ];
    } catch (e) {
        return [`${name}: nicht lesbar (${e.message}) — die Klinge urteilt über jede Linse`];
    }
    const errs = [];
    for (const t of toks) {
        const z = `${name}:${t.loc.start.line}`;
        if (t.type.label === "regexp") {
            for (const m of t.value.pattern.matchAll(PARAM_ANKER_RX))
                if (m[2] !== PARAM_FREI)
                    errs.push(
                        `${z} nagelt die Parameter-Liste von ${m[1]} fest (/${m[0]}/) — am Namen: ${m[1]}\\(${PARAM_FREI}\\)`
                    );
            if (KOPF_MUSTER_FREI.get(name) !== t.value.pattern)
                for (const k of kopfMuster(t.value.pattern))
                    errs.push(
                        `${z} ordnet Methoden an einem Kopf-Muster zu (/${k}/) — am AST: stammLib.glieder · gliedAn · rufe (Klinge 4)`
                    );
        } else if (t.type.label === "string" || t.type.label === "template") {
            const k = KOPF_TEXT_RX.exec(String(t.value));
            if (k && stammLib.kopf(stammSrc, k[1]) >= 0)
                errs.push(
                    `${z} sucht ${k[1]} an seinem Kopf-Text (${JSON.stringify(String(t.value).trim())}) — am Namen: stammLib.kopf(text, "${k[1]}")`
                );
        }
    }
    return errs;
}
// Jede Linse (scripts/, spec/) — die EINE Dateiliste der Klingen 3 bis 5.
function linsenDateien(root) {
    const dateien = [];
    const lauf = (d) => {
        for (const e of fs.readdirSync(d, { withFileTypes: true })) {
            if (e.name === "node_modules" || e.name.startsWith(".")) continue;
            const p = path.join(d, e.name);
            if (e.isDirectory()) lauf(p);
            else if (/\.(c?js|mjs)$/.test(e.name)) dateien.push(p);
        }
    };
    for (const d of ["scripts", "spec"]) if (fs.existsSync(path.join(root, d))) lauf(path.join(root, d));
    return dateien.map((p) => ({ name: path.relative(root, p).replace(/\\/g, "/"), src: fs.readFileSync(p, "utf8") }));
}
function scanParameterAnker(dateien, stammSrc) {
    const errs = [];
    for (const d of dateien) errs.push(...parameterAnker(d.name, d.src, stammSrc));
    return { n: dateien.length, errs };
}

// KLINGE 5 — DIE TASTE NACH DER WANDUHR: eine Linse hält eine Taste über einen Zeitgeber statt bis zu
// ihrem Ereignis (auf dem CPU-Raster der CI läuft der Spieler in derselben Zeit einen Bruchteil des Wegs). Gehalten
// ist eine Taste,
// die gedrückt (`keyboard.down`, `KeyboardEvent("keydown")`) und später DIESELBE losgelassen wird; dazwischen steht kein
// Zeitgeber — das Halten geht über `halteBis` (scripts/lib/welt-boot.cjs), das am Ereignis loslässt. Ein Druck ohne
// Loslassen (Enter, Strg+K) hält nichts. Kommentare zählen nicht (acorn, `onComment`); der Bestand ist 0 und bleibt 0.
const TASTE_DRUCK = /\.keyboard\.down\(|KeyboardEvent\(\s*["'`]keydown["'`]/g;
const TASTE_LOS = /\.keyboard\.up\(|KeyboardEvent\(\s*["'`]keyup["'`]/g;
const ZEITGEBER = /\bawait\s+(?:sleep|warte|warten|pause)\s*\(|\.waitForTimeout\s*\(|\bsetTimeout\s*\(/;
// Die Taste eines Drucks bzw. Loslassens: die Zeichenketten des Aufrufs bis zu seiner Klammer („KeyW“ heißt „w“), ohne
// Zeichenkette der Name des Arguments (`keyboard.down(taste)`).
function tastenVon(code, m) {
    const ende = code.indexOf(")", m.index + m[0].length);
    const seg = code.slice(m.index + m[0].length, ende < 0 ? m.index + 200 : ende);
    const tasten = new Set(
        [...seg.matchAll(/["'`]([^"'`\n]{1,24})["'`]/g)].map((t) =>
            (/^Key[A-Z]$/.test(t[1]) ? t[1].slice(3) : t[1]).toLowerCase()
        )
    );
    if (!tasten.size && seg.trim()) tasten.add(seg.trim());
    return tasten;
}
function tasteNachWanduhr(name, src) {
    const acorn = require("acorn");
    const kommentare = [];
    let texte;
    try {
        texte = [
            ...acorn.tokenizer(src, {
                ecmaVersion: "latest",
                allowHashBang: true,
                allowReturnOutsideFunction: true,
                onComment: (_block, _text, a, b) => kommentare.push([a, b]),
            }),
        ].filter((t) => t.type.label === "string" || t.type.label === "template");
    } catch {
        return []; // nicht lesbar: das nennt Klinge 3 beim Namen
    }
    const teile = [];
    let bis = 0;
    for (const [a, b] of kommentare) {
        teile.push(src.slice(bis, a), src.slice(a, b).replace(/[^\n]/g, " "));
        bis = b;
    }
    teile.push(src.slice(bis));
    const code = teile.join("");
    // ein Druck IN einer Zeichenkette ist Text, kein Code (die Proben des Selbsttests unten)
    const imText = (i) => texte.some((t) => t.start <= i && i < t.end);
    const los = [...code.matchAll(TASTE_LOS)].map((m) => ({ i: m.index, tasten: tastenVon(code, m) }));
    const errs = [];
    for (const m of code.matchAll(TASTE_DRUCK)) {
        if (imText(m.index)) continue;
        const tasten = tastenVon(code, m);
        const ende = los.find((l) => l.i > m.index && [...l.tasten].some((t) => tasten.has(t)));
        if (!ende) continue; // ein Druck, kein Halten
        const z = code.slice(m.index, ende.i).match(ZEITGEBER);
        if (z)
            errs.push(
                `${name}:${code.slice(0, m.index).split("\n").length} hält die Taste über „${z[0].replace(/\s+/g, " ")}“ ` +
                    `statt bis zu ihrem Ereignis — Täter der Lauf dieser Linse; halteBis (scripts/lib/welt-boot.cjs) lässt am ` +
                    `Ereignis los (Klinge 5)`
            );
    }
    return errs;
}
// KLINGE 6 (D2-N1) — DER EINE RUMPF-SCHNEIDER: eine Linse schneidet einen Block über `stammLib.rumpf` (den Block an
// seiner DEFINITION), nie mit eigenem Klammer-Zähler (der ERSTE Text-Treffer hängt an der Datei-Reihenfolge). Ein
// Klammer-Zähler ist ein Vergleich mit "{" (Token: `=== "{"`, `"{" ===`,
// `case "{"`); frei sind der EINE Schneider und der WGSL-Leser, Kommentare zählen nicht.
const SCHNEIDER_FREI = new Set(["scripts/lib/stamm.cjs", "scripts/lib/shader-kosten.cjs"]);
function eigenerSchneider(name, src) {
    if (SCHNEIDER_FREI.has(name)) return [];
    let toks;
    try {
        const opt = { ecmaVersion: "latest", locations: true, allowHashBang: true, allowReturnOutsideFunction: true };
        toks = [...require("acorn").tokenizer(src, opt)];
    } catch {
        return []; // nicht lesbar: das nennt Klinge 3 beim Namen
    }
    const vergleich = (t) => t && (t.type.label === "==/!=/===/!==" || t.type.keyword === "case");
    const klammer = "{";
    return toks
        .filter((t, i) => t.type.label === "string" && t.value === klammer && (vergleich(toks[i - 1]) || vergleich(toks[i + 1])))
        .map((t) => `${name}:${t.loc.start.line} zählt Klammern selbst — der Block an seiner Definition: stammLib.rumpf(text, kopf) (Klinge 6)`);
}
// Klinge 6, zweite Schneide (D2-N2): kein ERSTER TEXT-TREFFER auf dem ganzen Stamm (er hängt an der Datei-Reihenfolge,
// eine Mutation wird vakuös). Die Herkunft wird am Gültigkeitsbereich verfolgt: stammLib.text/textAusRev, durch
// ohneKommentare, replace,
// ersetze, Zuweisung und Parameter einer gerufenen Funktion; ROT sind dort replace · indexOf · lastIndexOf (ohne Startpunkt) ·
// search · match · exec mit festem Ziel (Literal, Konstante, Parameter, Schleifen-Variable; ein /g-Muster trifft alle).
function ersterTreffer(name, src) {
    if (SCHNEIDER_FREI.has(name) || !/lib\/stamm\.cjs/.test(src)) return [];
    let baum;
    try {
        const opt = { ecmaVersion: "latest", locations: true, allowHashBang: true, allowReturnOutsideFunction: true };
        baum = require("acorn").parse(src, opt);
    } catch {
        return [];
    }
    const bereichVon = new Map();
    const [decl, zuw, rufe] = [[], [], []];
    const neu = (eltern, fn) => ({ namen: new Map(), eltern, fn });
    const binde = (b, id, info) => {
        if (id.type === "Identifier") b.namen.set(id.name, info);
        else if (id.type === "ObjectPattern")
            for (const p of id.properties)
                binde(b, p.type === "RestElement" ? p.argument : p.value, { teil: p.key && p.key.name, quelle: info.init });
        else if (id.type === "ArrayPattern") for (const e of id.elements) e && binde(b, e, { schleife: info.schleife });
        else if (id.type === "AssignmentPattern" || id.type === "RestElement") binde(b, id.left || id.argument, info);
    };
    const lauf = (n, b, vater) => {
        if (/Function/.test(n.type)) {
            if (n.type === "FunctionDeclaration" && n.id) binde(b, n.id, { fn: n });
            b = neu(b, true);
            n.params.forEach((p, i) => binde(b, p, { param: i }));
        } else if (/^(BlockStatement|For(?:Of|In)?Statement|CatchClause|StaticBlock)$/.test(n.type)) {
            b = neu(b, false);
            if (n.type === "CatchClause" && n.param) binde(b, n.param, {});
        }
        bereichVon.set(n, b);
        if (n.type === "VariableDeclaration") {
            let z = b;
            if (n.kind === "var") while (!z.fn && z.eltern) z = z.eltern;
            for (const d of n.declarations) binde(z, d.id, { kind: n.kind, init: d.init, schleife: /For(Of|In)/.test(vater.type) });
            decl.push(...n.declarations);
        }
        if (n.type === "AssignmentExpression" && n.left.type === "Identifier") zuw.push(n);
        if (n.type === "CallExpression") rufe.push(n);
        for (const k in n) {
            const v = n[k];
            if (Array.isArray(v)) for (const x of v) x && typeof x.type === "string" && lauf(x, b, n);
            else if (v && typeof v.type === "string" && k !== "loc") lauf(v, b, n);
        }
    };
    lauf(baum, neu(null, true), {});
    const finde = (id) => {
        for (let b = bereichVon.get(id); b; b = b.eltern) if (b.namen.has(id.name)) return b.namen.get(id.name);
        return null;
    };
    const istLib = (e) =>
        !!e &&
        ((e.type === "CallExpression" && e.callee.name === "require" && /lib\/stamm\.cjs$/.test((e.arguments[0] || {}).value)) ||
            (e.type === "Identifier" && istLib((finde(e) || {}).init)));
    const libTeil = (e) => {
        if (e.type === "MemberExpression" && !e.computed && istLib(e.object)) return e.property.name;
        const b = e.type === "Identifier" && finde(e);
        return !b ? null : b.teil && istLib(b.quelle) ? b.teil : b.init && b.kind === "const" ? libTeil(b.init) : null;
    };
    const stamm = new Set();
    const istT = (e) => {
        if (!e) return false;
        if (e.type === "Identifier") return stamm.has(finde(e));
        if (e.type === "CallExpression") {
            const c = e.callee;
            const teil = libTeil(c);
            if (teil === "text" || teil === "textAusRev") return true;
            if (teil === "ohneKommentare" || teil === "ersetze") return istT(e.arguments[0]);
            if (c.type === "MemberExpression" && !c.computed && /^replace(All)?$/.test(c.property.name)) return istT(c.object);
            return c.type === "Identifier" && /strip|ohneKommentare/i.test(c.name) && istT(e.arguments[0]);
        }
        if (e.type === "ConditionalExpression") return istT(e.consequent) || istT(e.alternate);
        if (e.type === "LogicalExpression") return istT(e.left) || istT(e.right);
        if (e.type === "AwaitExpression") return istT(e.argument);
        if (e.type === "AssignmentExpression") return istT(e.right);
        return e.type === "SequenceExpression" && istT(e.expressions[e.expressions.length - 1]);
    };
    for (let vor = -1; vor !== stamm.size; ) {
        vor = stamm.size;
        for (const d of decl) if (d.id.type === "Identifier" && istT(d.init)) stamm.add(finde(d.id));
        for (const z of zuw) if (istT(z.right)) stamm.add(finde(z.left));
        for (const r of rufe) {
            const b = r.callee.type === "Identifier" && finde(r.callee);
            const fn = b && (b.fn || (b.init && /Function/.test(b.init.type) ? b.init : null));
            if (fn) r.arguments.forEach((a, i) => fn.params[i] && fn.params[i].type === "Identifier" && istT(a) && stamm.add(finde(fn.params[i])));
        }
    }
    stamm.delete(null);
    // fest: ein Literal, ein Text ohne Einsatz, eine Konstante darauf, ein Parameter, eine Schleifen-Variable (sie tragen das
    // Literal ihres Rufers bzw. ihrer Tafel); null: berechnet (ein Kopf am Namen) oder ein /g-Muster
    const fest = (a) => {
        if (!a) return false;
        if (a.type === "Literal") return a.regex ? !/[gy]/.test(a.regex.flags) : typeof a.value === "string";
        if (a.type === "TemplateLiteral") return !a.expressions.length;
        const b = a.type === "Identifier" && finde(a);
        return !!b && (b.param != null || !!b.schleife || (b.kind === "const" && fest(b.init)));
    };
    const out = [];
    for (const r of rufe) {
        const c = r.callee;
        const p = c.type === "MemberExpression" && !c.computed && c.property.name;
        const roh =
            p === "exec"
                ? fest(c.object) && istT(r.arguments[0])
                : /^(replace|indexOf|lastIndexOf|search|match)$/.test(p) &&
                  istT(c.object) &&
                  fest(r.arguments[0]) &&
                  (!/indexOf$/i.test(p) || r.arguments.length === 1);
        if (roh)
            out.push(
                `${name}:${r.loc.start.line} ${p} zielt auf den ersten Treffer im ganzen Stamm — die EINE Stelle im benannten Glied: stammLib.ersetze(t, glied, x, neu) · stammLib.treffer(t, glied, x) (Klinge 6)`
            );
    }
    return out;
}
function scanTasten(dateien) {
    const errs = [];
    for (const d of dateien) errs.push(...tasteNachWanduhr(d.name, d.src), ...eigenerSchneider(d.name, d.src), ...ersterTreffer(d.name, d.src));
    return { n: dateien.length, errs };
}

function selftest() {
    const fails = [];
    // Klinge 3: ein Regex-Anker mit Parameter-Liste und ein Kopf-Text einer Stamm-Methode feuern beim Namen, der Name
    // allein, ein Aufruf und der Kopf einer fremden Methode schweigen.
    const stammFake = "class A {\n    _echt(a, b) {\n        return a;\n    }\n}\n";
    const rot = [
        "const r = /\\n {4}_echt\\(a, b\\)\\s*\\{/;",
        'const k = s.indexOf("    _echt(a, b) {");',
        "const r = /_echt\\(\\) \\{/;",
    ];
    for (const q of rot) {
        const e = parameterAnker("probe.cjs", q, stammFake);
        if (e.length !== 1 || !/probe\.cjs:1 .*_echt/.test(e[0])) fails.push(`Klinge 3 nennt den Anker nicht: ${q}`);
    }
    const gruen = [
        "const r = /\\n {4}_echt\\([^)]*\\)\\s*\\{/;",
        "const r = /this\\._echt\\(a, b\\);/;",
        'const k = stammLib.kopf(s, "_echt");',
        'const k = s.indexOf("    _fremd(a, b) {");',
        "// const r = /\\n {4}_echt\\(a, b\\) \\{/;",
    ];
    for (const q of gruen)
        if (parameterAnker("probe.cjs", q, stammFake).length) fails.push(`Klinge 3 feuert am Namen-Anker: ${q}`);
    // Klinge 4: jedes Kopf-Muster der Klasse (die Formen der neun Stellen bis Runde 3) fällt mit Datei:Zeile; der Kopf am
    // Namen, ein Objekt-Schlüssel, ein Zugriff und die eine freie Stelle in ihrer Datei schweigen — in fremder Datei nicht.
    const kopfRot = [
        "const r = /\\n {4}(?:static |async )*([A-Za-z_$][\\w$]*)\\([^)\\n]*\\) \\{/g;",
        "const r = /\\n {4}(_foundry\\w*|_heldFoundryGroup)\\([^)\\n]*\\) \\{/g;",
        "const r = /^\\n {4}\\w+\\([^)\\n]*\\) \\{/;",
        "const r = /\\n    (_buildTree\\w*|_stampFoliage\\w*)\\(/g;",
        "const r = /^    (?:static |async |get |set )*([A-Za-z_$][\\w$]*)\\s*\\(/;",
        "const r = /^ {4}(?:static\\s+)?(?:async\\s+)?([A-Za-z_$][\\w$]*)\\s*\\([^)]*\\)\\s*\\{\\s*$/;",
        "const r = /\\n {4}[_A-Za-z$][\\w$]*\\([^)]*\\) \\{\\n/;",
        "const r = /^\\s{4}([A-Za-z_$][\\w$]*)\\(/;",
        "const r = /\\n[ ]{4}(\\w+)\\(/;",
    ];
    for (const q of kopfRot) {
        const e = parameterAnker("probe.cjs", q, stammFake).filter((x) => /Klinge 4/.test(x));
        if (e.length !== 1 || !/^probe\.cjs:1 ordnet Methoden an einem Kopf-Muster/.test(e[0]))
            fails.push(`Klinge 4 nennt das Kopf-Muster nicht: ${q}`);
    }
    const frei = [...KOPF_MUSTER_FREI][0];
    const kopfStill = [
        ["probe.cjs", "const r = /\\n {4}_echt\\([^)]*\\)\\s*\\{/;"],
        ["probe.cjs", "const r = /\\n    (\\w+): Object\\.freeze\\(\\{/;"],
        ["probe.cjs", "const r = /\\n {4}this\\.(\\w+)\\(/;"],
        ["probe.cjs", "const r = /^(?:_foundry\\w*|_karte\\w*)$/;"],
        ["probe.cjs", "const g = stammLib.gliedAn(stammLib.glieder(t), i);"],
        [frei[0], `const r = /${frei[1]}/;`],
    ];
    for (const [datei, q] of kopfStill)
        if (parameterAnker(datei, q, stammFake).length) fails.push(`Klinge 4 feuert ohne Kopf-Muster: ${datei} ${q}`);
    if (!parameterAnker("probe.cjs", `const r = /${frei[1]}/;`, stammFake).some((x) => /Klinge 4/.test(x)))
        fails.push("Klinge 4: die freie Stelle schweigt auch in fremder Datei");
    // Klinge 1: der typeof-Ratchet feuert bei Injektion über den Bestand.
    const injectT = 'typeof r.probe === "function";\n'.repeat(FROZEN_TYPEOF + 1);
    if (!scanRatchet(injectT).errs.some((e) => /typeof-Ratchet/.test(e)))
        fails.push("typeof-Ratchet feuert nicht bei Injektion");
    if (countTypeof('// typeof r.x === "function" im Kommentar\n'.repeat(9)) !== 0)
        fails.push("typeof-Ratchet zählt Kommentare mit (soll: 0)");
    // Klinge 2: ein erfundenes Katalog-Symbol feuert die Katalog-Prüfung.
    const fakePlaytest =
        'window.__consumes = () => {};\nwindow.__anker = Object.freeze({\n    phantom: "_esGibtMichNicht9x7",\n});\n';
    const r = scanAnker(fakePlaytest, "class A { echteMethode() {} }");
    if (r.errs.length !== 1 || !/phantom/.test(r.errs[0]))
        fails.push("Katalog-Prüfung feuert nicht bei Phantom-Symbol");
    // Klinge 5: der alte Lauf von gate:mp-sync (W 1,6 s nach der Uhr), der Druck im Rahmen samt `warte` und eine Taste mit
    // Namen fallen mit Datei:Zeile; das Halten bis zum Ereignis, ein Kommentar und ein Druck ohne Loslassen schweigen.
    const tasteRot = [
        'await pageA.keyboard.down("w");\nawait sleep(1600);\nawait pageA.keyboard.up("w");\n',
        'await fr.evaluate(() => window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyW" })));\nawait warte(1600);\n' +
            'await fr.evaluate(() => window.dispatchEvent(new KeyboardEvent("keyup", { code: "KeyW" })));\n',
        "await seite.keyboard.down(taste);\nawait sleep(900);\nawait seite.keyboard.up(taste);\n",
    ];
    for (const q of tasteRot) {
        const e = tasteNachWanduhr("probe.cjs", q);
        if (e.length !== 1 || !/^probe\.cjs:1 hält die Taste/.test(e[0]))
            fails.push(`Klinge 5 nennt den Lauf nicht: ${q}`);
    }
    const tasteStill = [
        'await page.keyboard.down("w");\nawait page.waitForFunction(() => weit(), { polling: 100 });\nawait page.keyboard.up("w");\nawait sleep(800);\n',
        '// await page.keyboard.down("w"); await sleep(1600); await page.keyboard.up("w");\nconst a = /"/;\n',
        'el.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));\nawait sleep(300);\nawait page.keyboard.up("w");\n',
        'const probe = \'await pageA.keyboard.down("w");\\nawait sleep(1600);\\nawait pageA.keyboard.up("w");\';\n',
    ];
    for (const q of tasteStill)
        if (tasteNachWanduhr("probe.cjs", q).length) fails.push(`Klinge 5 feuert ohne Lauf nach der Uhr: ${q}`);
    // Klinge 6: der Schneider von gate:vehicle-drive bis D2-N1 und ein `case "{"` fallen mit Datei:Zeile; der EINE Schneider,
    // ein JSON-Text, ein Kommentar und dieselbe Probe im freien Schneider schweigen.
    const schneiderRot = [
        [5, 'function fnBody(src, re) {\n    const m = re.exec(src);\n    let d = 0;\n    for (let i = src.indexOf("{", m.index); ; i++)\n        if (src[i] === "{") d++;\n}\n'],
        [2, 'for (const c of s) switch (c) {\n    case "{": t++;\n}\n'],
    ];
    for (const [zeile, q] of schneiderRot) {
        const e = eigenerSchneider("probe.cjs", q);
        if (e.length !== 1 || !e[0].startsWith(`probe.cjs:${zeile} zählt Klammern selbst`))
            fails.push(`Klinge 6 nennt den Schneider nicht: ${q}`);
    }
    for (const [datei, q] of [
        ["probe.cjs", 'const b = stammLib.rumpf(src, "_x");\nconst ok = r.data === \'{"x":7}\';\n// if (c === "{") d++;\n'],
        ["scripts/lib/stamm.cjs", schneiderRot[0][1]],
    ])
        if (eigenerSchneider(datei, q).length) fails.push(`Klinge 6 feuert ohne eigenen Schneider: ${datei} ${q}`);
    // Klinge 6, zweite Schneide: der Täter von gate:werkstatt-weg, ein indexOf am kommentarfreien Stamm, ein Bruch-Helfer, ein
    // exec und eine Patch-Tafel fallen mit Datei:Zeile; die Engstelle, includes, ein Startpunkt, ein /g-Muster, ein Kopf am
    // Namen, ein fremder Text, ein überschatteter Name, ein Kommentar und die freie Engstelle selbst schweigen.
    const L = 'const stammLib = require("./lib/stamm.cjs");\n';
    const ersterRot = [
        [3, L + "const quelle = stammLib.text(root);\nconst b = quelle.replace('this._bauSame(\"insel\")', \"x\");\n"],
        [3, 'const S = require("../lib/stamm.cjs");\nconst nc = S.ohneKommentare(S.text(r));\nconst i = nc.indexOf("x");\n'],
        [2, L + "const bruch = (q, alt, neu) => q.replace(alt, neu);\nbruch(stammLib.text(r), 'a', 'b');\n"],
        [2, L + "const m = /V = (\\d+);/.exec(stammLib.text(r));\n"],
        [3, 'const { text } = require("./lib/stamm.cjs");\nlet t = text(r);\nfor (const [a, b] of tafel) t = t.replace(a, b);\n'],
    ];
    for (const [zeile, q] of ersterRot) {
        const e = ersterTreffer("probe.cjs", q);
        if (e.length !== 1 || !e[0].startsWith(`probe.cjs:${zeile} `)) fails.push(`Klinge 6 nennt den ersten Treffer nicht: ${q}`);
    }
    const ersterStill =
        L +
        "const quelle = stammLib.text(root);\nstammLib.ersetze(quelle, \"chatDslPatterns\", 'x', 'y');\nstammLib.treffer(quelle, null, /V/);\n" +
        'quelle.includes("x");\nquelle.indexOf("x", 9);\nquelle.replace(/x/g, "");\nquelle.indexOf(`\\n    ${name}(`);\n' +
        'fs.readFileSync(p, "utf8").replace("x", "y");\nfunction f(src) {\n    return src.replace("x", "y");\n}\n' +
        '{\n    const quelle = fs.readFileSync(p, "utf8");\n    quelle.replace("x", "y");\n}\n// quelle.replace("x", "y");\n';
    for (const [datei, q] of [["probe.cjs", ersterStill], ["scripts/lib/stamm.cjs", ersterRot[0][1]]])
        if (ersterTreffer(datei, q).length) fails.push(`Klinge 6 nennt einen ersten Treffer ohne Täter: ${datei} ${ersterTreffer(datei, q)}`);
    urteilEnde(fails.length, "❌ SELBST-TEST: " + fails.join(" · "), "✅ SELBST-TEST: alle sechs Klingen feuern (Ratchet + Katalog + Parameter-Anker beim Namen + Kopf-Muster am AST + Taste nach der Wanduhr + eigener Schneider + erster Treffer im ganzen Stamm), Kommentare zählen nicht");
}

function main() {
    if (process.argv.includes("--selftest")) selftest();
    const root = path.join(__dirname, "..");
    const richter = ["playtest.cjs", ...fs.readdirSync(path.join(root, "scripts", "playtest")).map((f) => "playtest/" + f)];
    const playtestSrc = richter.map((f) => fs.readFileSync(path.join(root, "scripts", f), "utf8")).join("\n");
    const stammSrc = stammLib.text(root);
    const ratchet = scanRatchet(playtestSrc);
    const anker = scanAnker(playtestSrc, stammSrc);
    const dateien = linsenDateien(root);
    const param = scanParameterAnker(dateien, stammSrc);
    const tasten = scanTasten(dateien);
    const errs = ratchet.errs.concat(anker.errs, param.errs, tasten.errs);
    if (errs.length) {
        console.log("⛔ DIE APPARAT-LINSE:");
        for (const e of errs) console.log("   ❌ " + e);
        process.exit(1);
    }
    if (ratchet.nT < FROZEN_TYPEOF)
        console.log(
            `ℹ️  Der typeof-Bestand sank (${ratchet.nT} < ${FROZEN_TYPEOF}) — FROZEN_TYPEOF nachziehen (der Ratchet darf enger).`
        );
    console.log(
        `✅ DIE APPARAT-LINSE steht — ${ratchet.nT}/${FROZEN_TYPEOF} typeof-Existenz-Proben (Ratchet nur-sinkend), ` +
            `${anker.entries.length} Anker zeigen auf lebenden Stamm-Code, __consumes + __anker installiert, ` +
            `${param.n} Linsen finden jede Methode am Namen (0 Parameter-Anker) und ordnen Code am AST zu (0 Kopf-Muster), ` +
            `keine hält eine Taste nach der Wanduhr und keine zählt Klammern selbst oder zielt auf den ersten Treffer im ganzen Stamm (0 von ${tasten.n}).`
    );
}

main();
