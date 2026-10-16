#!/usr/bin/env node
// ============================================================================
// DIE APPARAT-LINSE — gate:apparat (ULTRAGUSS U1, V18.452)
//
// Gesetz #0: nach der Fehler-Klasse die LINSE bauen. Die Klasse: rohe
// `.toString()`-Quelltext-Zitate im Playtest brechen bei jeder Kern-Wanderung
// trotz identischem Verhalten UND umgehen den __codeOf-Kommentar-Stripper
// (ein zitierender Kommentar hält sie stumm grün — falsch-positiv). U1 hat den
// Bestand auf den legitimen Rest gesenkt (der Node-seitige Stream-Chunk);
// diese Linse friert ihn ein — der Bestand darf nur SINKEN (Ratchet).
//
// Zweite Aufgabe: der ANKER-KATALOG (window.__anker in playtest.cjs) ist nur
// wahr, wenn jedes katalogisierte Symbol im lebenden Stamm-CODE existiert —
// zieht ein Symbol um, wird HIER die eine Katalog-Zeile rot, nie N Proben.
//
// Dritte Aufgabe (Klinge 3, K38-N2): jede Linse findet eine Methode am NAMEN, nie an ihrer Parameter-Liste.
// Vierte Aufgabe (Klinge 4, K38-N2 Runde 3): jede Linse ordnet Code seiner Methode am AST zu, nie an einem Kopf-Muster.
// Fünfte Aufgabe (Klinge 5, K60-N5): keine Linse hält eine Taste über einen Zeitgeber statt bis zu ihrem Ereignis.
// Sechste Aufgabe (Klinge 6, D2-N1): jede Linse schneidet einen Block über den EINEN Schneider (stammLib.rumpf).
//
// Selbst-Test: --selftest beweist alle sechs Klingen (kein vakuöses Grün):
// (1) eine injizierte .toString()-Probe hebt den Zähler über den Ratchet,
//     ein bloßer Kommentar hebt ihn NICHT; (2) ein erfundenes Katalog-Symbol
// feuert die Katalog-Prüfung; (3) ein Regex- und ein Text-Anker mit Parameter-Liste
// werden mit Datei:Zeile genannt, der Name allein, ein Aufruf und eine fremde Methode schweigen;
// (4) jede Form des Kopf-Musters fällt mit Datei:Zeile, Kopf am Namen, Schlüssel und Zugriff schweigen;
// (5) der alte Lauf von gate:mp-sync (W 1,6 s nach der Uhr) fällt mit Datei:Zeile, das Halten bis zum Ereignis schweigt;
// (6) ein eigener Klammer-Zähler fällt mit Datei:Zeile, der EINE Schneider, JSON-Text und Kommentar schweigen.
// ============================================================================
"use strict";
const fs = require("fs");
const path = require("path");
const stammLib = require("./lib/stamm.cjs");

// Der eingefrorene Bestand (die U1-Nachher-Zahl, kommentar-bereinigt gezählt).
// Der EINE legitime Rest: `chunk.toString()` am Node-Stream (kein Quelltext-
// Zitat einer Realm-Methode). Sinkt der Bestand, wird diese Zahl GESENKT —
// nie erhöht (eine Erhöhung wäre ein begründeter Vertrags-Akt im Commit).
const FROZEN_TOSTRING = 1;

// Kommentare strippen, Strings BEWAHREN (die diag-source-probes-Methode:
// zeichenweise, string-bewusst — ein naiver Regex frisst echten Code).
function stripComments(src) {
    let out = "";
    let i = 0;
    const n = src.length;
    let mode = "code"; // code | line | block | sq | dq | tpl
    while (i < n) {
        const c = src[i];
        const c2 = src[i + 1];
        if (mode === "code") {
            if (c === "/" && c2 === "/") {
                mode = "line";
                i += 2;
                continue;
            }
            if (c === "/" && c2 === "*") {
                mode = "block";
                i += 2;
                continue;
            }
            if (c === "'") mode = "sq";
            else if (c === '"') mode = "dq";
            else if (c === "`") mode = "tpl";
            out += c;
            i++;
            continue;
        }
        if (mode === "line") {
            if (c === "\n") {
                mode = "code";
                out += c;
            }
            i++;
            continue;
        }
        if (mode === "block") {
            if (c === "*" && c2 === "/") {
                mode = "code";
                i += 2;
                continue;
            }
            i++;
            continue;
        }
        // String-Modi: Escapes überspringen, Ende erkennen.
        if (c === "\\") {
            out += c + (src[i + 1] || "");
            i += 2;
            continue;
        }
        if ((mode === "sq" && c === "'") || (mode === "dq" && c === '"') || (mode === "tpl" && c === "`"))
            mode = "code";
        out += c;
        i++;
    }
    return out;
}

function countToString(src) {
    return (stripComments(src).match(/\.toString\(\)/g) || []).length;
}

// V18.462 — DER typeof-RATCHET (ultraguss U1-Folge, die Voll-Wanderung ist
// tabellen-getrieben offen): 878 namens-verankerte `typeof … === "function"`-
// Existenz-Proben leben im Apparat. Der Bestand darf NUR SINKEN — jede neue
// Probe liest den Anker-Katalog (window.__anker) oder beweist KONSUM
// (window.__consumes); wandert eine Probe, sinkt die Zahl hier mit.
// Welle 5 Klang: 878 → 874 (die Proben auf _buildHydroAudioLayer · _tickHydrosphereAudio · _pointSegDist2D ·
// _tagToFrequency fielen mit ihren Methoden); Integration W5-Klang: 874 → 873 (_playCreatureTaskPing fiel — das Tier
// antwortet mit seiner Stimme).
const FROZEN_TYPEOF = 873;

function countTypeof(src) {
    return (stripComments(src).match(/typeof [^=\n]{1,80}=== "function"/g) || []).length;
}

function scanRatchet(playtestSrc) {
    const n = countToString(playtestSrc);
    const errs = [];
    if (n > FROZEN_TOSTRING)
        errs.push(
            `Ratchet: ${n} rohe .toString()-Quelltext-Zitate in scripts/playtest.cjs (eingefroren: ${FROZEN_TOSTRING}). ` +
                `Neue Proben lesen window.__codeOf (kommentar-gestrippt), beweisen KONSUM via window.__consumes ` +
                `oder proben Katalog-Existenz via window.__anker — nie rohes .toString().`
        );
    const nT = countTypeof(playtestSrc);
    if (nT > FROZEN_TYPEOF)
        errs.push(
            `typeof-Ratchet: ${nT} namens-verankerte typeof-Existenz-Proben in scripts/playtest.cjs ` +
                `(eingefroren: ${FROZEN_TYPEOF}). Neue Proben lesen window.__anker/__consumes — der Bestand darf nur sinken ` +
                `(sinkt er, FROZEN_TYPEOF mitsenken: der Ratchet klemmt nach unten nach).`
        );
    return { n, nT, errs };
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

// KLINGE 3 (K38-N2, 15.10.) — die Linse findet eine Methode an ihrem NAMEN, nie an ihrer Parameter-Liste. Ein Anker, der
// die Liste festnagelt (im Regex `_x\(a, b\)\s*\{`, als Text "    _x(a, b) {"), bricht bei jedem neuen Parameter, obwohl das
// geprüfte Gesetz steht: gate:foundry-crossfade fiel so an `_foundryBaumHoehe(preset, entry, wer)` (Zweig-CI 38651527401,
// voll 4/11). Der Name wandert mit: im Regex `_x\([^)]*\)`, im Text `stammLib.kopf(text, "_x")`. Die Klinge liest JEDE Linse
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

// KLINGE 5 (K60-N5, 15.10.) — DIE TASTE NACH DER WANDUHR: eine Linse hält eine Taste über einen Zeitgeber statt bis zu
// ihrem Ereignis. Auf dem CPU-Raster der CI läuft der Spieler in derselben Zeit einen Bruchteil des Wegs (gate:mp-sync (d)
// „LEER: A lief 0.77 m“ nach 1,6 s W, Zweig-CI 38683406115; die Garage fuhr in 1,8 s 1,1 m/s). Gehalten ist eine Taste,
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
// KLINGE 6 (D2-N1, 16.10.) — DER EINE RUMPF-SCHNEIDER: eine Linse schneidet einen Block über `stammLib.rumpf` (den Block an
// seiner DEFINITION), nie mit eigenem Klammer-Zähler. Zweiundzwanzig Schneider in zwanzig Linsen setzten am ERSTEN Text-
// Treffer an; nach dem Umzug nach Domäne schnitt gate:vehicle-drive A5 den Aufruf in siedlung-ort.js statt der Definition
// (Zweig-CI 38894453753, voll 11/18). Ein Klammer-Zähler ist ein Vergleich mit "{" (Token: `=== "{"`, `"{" ===`,
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
function scanTasten(dateien) {
    const errs = [];
    for (const d of dateien) errs.push(...tasteNachWanduhr(d.name, d.src), ...eigenerSchneider(d.name, d.src));
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
    // Klinge 1a: eine injizierte Probe hebt den Zähler über den Ratchet.
    const inject = "const x = 1;\n" + "y.toString();\n".repeat(FROZEN_TOSTRING + 1);
    if (scanRatchet(inject).errs.length !== 1) fails.push("Ratchet feuert nicht bei Injektion");
    // Klinge 1b: ein bloßer Kommentar zählt NICHT (die __codeOf-Disziplin).
    const comment = "const x = 1;\n" + "// y.toString() im Kommentar\n".repeat(FROZEN_TOSTRING + 5);
    if (countToString(comment) !== 0) fails.push("Ratchet zählt Kommentare mit (soll: 0)");
    // Klinge 1c (V18.462): der typeof-Ratchet feuert bei Injektion über den Bestand.
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
    if (fails.length) {
        console.log("❌ SELBST-TEST: " + fails.join(" · "));
        process.exit(1);
    }
    console.log(
        "✅ SELBST-TEST: alle sechs Klingen feuern (Ratchet + Katalog + Parameter-Anker beim Namen + Kopf-Muster am AST + Taste nach der Wanduhr + eigener Schneider), Kommentare zählen nicht"
    );
    process.exit(0);
}

function main() {
    if (process.argv.includes("--selftest")) selftest();
    const root = path.join(__dirname, "..");
    const playtestSrc = fs.readFileSync(path.join(root, "scripts", "playtest.cjs"), "utf8");
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
    if (ratchet.n < FROZEN_TOSTRING)
        console.log(
            `ℹ️  Der Bestand sank (${ratchet.n} < ${FROZEN_TOSTRING}) — FROZEN_TOSTRING in scripts/diag-apparat.cjs nachziehen (der Ratchet darf enger).`
        );
    if (ratchet.nT < FROZEN_TYPEOF)
        console.log(
            `ℹ️  Der typeof-Bestand sank (${ratchet.nT} < ${FROZEN_TYPEOF}) — FROZEN_TYPEOF nachziehen (der Ratchet darf enger).`
        );
    console.log(
        `✅ DIE APPARAT-LINSE steht — ${ratchet.n}/${FROZEN_TOSTRING} rohe .toString()-Zitate + ` +
            `${ratchet.nT}/${FROZEN_TYPEOF} typeof-Existenz-Proben (beide Ratchets nur-sinkend), ` +
            `${anker.entries.length} Anker zeigen auf lebenden Stamm-Code, __consumes + __anker installiert, ` +
            `${param.n} Linsen finden jede Methode am Namen (0 Parameter-Anker) und ordnen Code am AST zu (0 Kopf-Muster), ` +
            `keine hält eine Taste nach der Wanduhr und keine zählt Klammern selbst (0 von ${tasten.n}).`
    );
}

main();
