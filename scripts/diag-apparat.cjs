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
// Fünfte Aufgabe (Klinge 5, K60-N5): keine Linse hält eine Taste über einen Zeitgeber statt bis zu ihrem Ereignis — und keine
// schläft fest ab 1 s, ehe sie liest (zweite Schneide, abdruck-am-takt: die Tafel `SCHLAF_REST` nennt jede bleibende Stelle).
// Sechste Aufgabe (Klinge 6, D2-N1/N2): jede Linse schneidet einen Block über den EINEN Schneider (stammLib.rumpf) und
// trifft eine Stelle des Stamms über die EINE Engstelle (stammLib.ersetze/treffer), nie am ersten Text-Treffer.
// Siebte Aufgabe (Klinge 7, w22-gpu-probe, w26-probe-zeit, Umsatz 24.11.): der Einlass der GPU-Probe lässt nur gate:, zeit:gate:,
// bild: und station: (Sprossen der Karte 2 am Ref, gegen eine gestellte Karte; der Durchreicher des Schlosses in bash gefahren)
// durch, zeit: und station: nur auf die Band-Geräte; ihr Artefakt trägt den Versuch im Namen, der Post urteilt am jüngsten je Bein; der
// Stempel ohne Inhalt erbt die Probe seines grün geprobten Elters (ERB_FAELLE gegen eine gestellte API, je Bedingung eine Mutante).
// Achte Aufgabe (Klinge 8, w27-gpu-wahl-heil): jede Linse liest einen GPU-Puffer über die EINE Puffer-Lesung, nie am Rohen.
// Neunte Aufgabe (Klinge 9, w28-probe-urteil, Lehre 6): eine gedruckte ROTE Zeile ist Urteil — der Kopf der GPU-Probe urteilt Log UND
// Exit über scripts/lib/urteil-zeile.cjs (BEKANNT heißt nur die Ratsche des Messorts, sichtbar im Kopf; die Station je Sprosse,
// OFFEN ist ROT), die Wache am
// Prozess-Ende macht aus ❌ bei Exit 0 Exit 1; Mutanten: die alte Zeile `elif RC=0 → GRÜN`, der Kopf ohne Grund, BEKANNT still.
//
// Selbst-Test: --selftest beweist alle acht Klingen (kein vakuöses Grün; der Grün-Satz nennt nur die Zahl, die Klingen
// stehen hier — Ratchet, Katalog, Parameter-Anker beim Namen, Kopf-Muster am AST, Taste nach der Wanduhr, eigener Schneider
// und erster Treffer im ganzen Stamm, GPU-Probe; Kommentare zählen nicht):
// (1) eine injizierte typeof-Probe hebt den Zähler über den Ratchet, ein Kommentar nicht; (2) ein erfundenes Katalog-Symbol
// feuert die Katalog-Prüfung; (3) ein Regex- und ein Text-Anker mit Parameter-Liste
// werden mit Datei:Zeile genannt, der Name allein, ein Aufruf und eine fremde Methode schweigen;
// (4) jede Form des Kopf-Musters fällt mit Datei:Zeile, Kopf am Namen, Schlüssel und Zugriff schweigen;
// (5) der alte Lauf von gate:mp-sync (W 1,6 s nach der Uhr) fällt mit Datei:Zeile, das Halten bis zum Ereignis schweigt;
// (6) ein eigener Klammer-Zähler und ein roher erster Treffer auf dem ganzen Stamm fallen mit Datei:Zeile, die Engstelle
//     und ihre Nachbarn (includes, Startpunkt, /g, fremder Text, überschatteter Name, Kommentar) schweigen;
// (7) die echte gpu-probe.yml beantwortet jeden Ruf von PROBE_RUFE, je Mutante (pull_request, Injektion, Läufer und Matrix
//     neben dem Einlass, ein Einlass, der alles durchlässt) fällt sie beim Namen.
// ============================================================================
"use strict";
const {
    urteilEnde,
    ausDatei,
    taeterFaelle,
    rotListe,
    SELBSTTEST,
    ROOT,
    path,
    fs,
    stammLib,
    pufferLesen,
} = require("./lib/welt-boot.cjs");

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
    if (!entries || !entries.length) {
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
    [
        "scripts/stamm-rehome.cjs",
        "^ {4}(?:static\\s+)?(?:async\\s+)?(?:get\\s+|set\\s+)?\\*?([A-Za-z_$][\\w$]*)\\s*\\(",
    ],
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
// KLINGE 8 (w27-gpu-wahl-heil): jede Linse liest einen GPU-Puffer über die EINE Puffer-Lesung (welt-boot `pufferLesen`), die Leser
// und Puffer nennt, wenn er nicht auf der GPU liegt — r184 `getArrayBufferAsync` am Rohen brach anonym („reading 'size'": der
// Draw-Zähler las die Liste der Wahl, die seit w25-gpu-wahl-2 eine Karte je Kamera ist; haar.K5 und vegetation.K1 ROT ohne Täter).
const LESUNG_FREI = "scripts/lib/welt-boot.cjs";
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
    for (const [i, t] of toks.entries()) {
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
        } else if (t.value === "getArrayBufferAsync" && toks[i - 1]?.type.label === "." && name !== LESUNG_FREI) {
            errs.push(`${z} liest am Rohen — die EINE Puffer-Lesung: window.__pufferLesen (Klinge 8)`);
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
    return dateien.map((p) => ({ name: path.relative(root, p).replace(/\\/g, "/"), src: ausDatei(p) }));
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
// Der Code einer Linse ohne Kommentare (Leerzeichen an ihrer Stelle, die Zeilen bleiben) und die Frage, ob eine Stelle IN einer
// Zeichenkette steht — der EINE Leser beider Schneiden der Klinge 5; null: nicht lesbar (das nennt Klinge 3 beim Namen).
function codeOhneKommentare(src) {
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
        return null;
    }
    const teile = [];
    let bis = 0;
    for (const [a, b] of kommentare) {
        teile.push(src.slice(bis, a), src.slice(a, b).replace(/[^\n]/g, " "));
        bis = b;
    }
    teile.push(src.slice(bis));
    // ein Druck IN einer Zeichenkette ist Text, kein Code (die Proben des Selbsttests unten)
    return { code: teile.join(""), imText: (i) => texte.some((t) => t.start <= i && i < t.end) };
}
function tasteNachWanduhr(name, src) {
    const gelesen = codeOhneKommentare(src);
    if (!gelesen) return [];
    const { code, imText } = gelesen;
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
// KLINGE 5, ZWEITE SCHNEIDE (abdruck-am-takt) — DER FESTE SCHLAF: eine Linse wartet auf ihr Ereignis (welt-boot `waitFor` ·
// `__weltDa` · `__gebautNach`, die Schranke des Speicher-Fadens `_speicherStill`) oder zählt Takte — nie `await sleep(≥ 1 s)`
// mit fester Zahl: was sie danach liest, hängt an der Last des Geräts. Zensus 20.11.: 20 Stellen in 14 Linsen (gate:takt T8
// fällt in takt-t8-geist, 15 fielen in abdruck-am-takt auf ihr Ereignis oder ihre Takt-Zahl). Was bleibt, steht in
// `SCHLAF_REST` je Datei mit Zahl und Grund — ein Messfenster, der Abstand einer Ereignis-Frage, ein Werkzeug —, die Zahl sinkt
// nur; eine Stelle über der Tafel nennt jede feste Stelle ihrer Datei.
const SCHLAF_FEST = /\bawait\s+(?:sleep|warte|warten|pause)\s*\(\s*(\d[\d_]*)\s*\)|\.waitForTimeout\s*\(\s*(\d[\d_]*)\s*\)/g;
const SCHLAF_AB_MS = 1000;
const SCHLAF_REST = {
    "scripts/diag-hitch-telemetrie.cjs": [1, "das Messfenster des Flugschreibers — seine Ringe falten je echter Sekunde (die Schleife führt spec/ci/frist-rest.json)"],
    "scripts/diag-takt.cjs": [1, "T8 — fällt mit takt-t8-geist auf sein Ereignis"],
    "scripts/lib/speicher-proben.cjs": [1, "der Abstand der Frage in der gezählten Warte auf `__einschwingOffen` — kein Urteil nach ihm"],
    "scripts/lib/welt-boot.cjs": [1, "Selbsttest der Todes-Wache — das Fenster, in dem eine gesunde Seite keinen Alarm auslösen darf"],
    "scripts/omen-messfolge.cjs": [2, "Werkzeug — die Frist, in der ein beendeter Prozess fort sein muss (`warte` meldet sein Ereignis)"],
    "scripts/werkbank.cjs": [1, "Werkzeug — 2 s Anlauf vor der Spur der leeren Leinwand (das Boden-Maß der Belegung)"],
};
function festerSchlaf(src) {
    const gelesen = codeOhneKommentare(src);
    if (!gelesen) return [];
    const { code, imText } = gelesen;
    const out = [];
    for (const m of code.matchAll(SCHLAF_FEST)) {
        const ms = Number((m[1] || m[2]).replace(/_/g, ""));
        if (ms >= SCHLAF_AB_MS && !imText(m.index))
            out.push({ zeile: code.slice(0, m.index).split("\n").length, ms, text: m[0].replace(/\s+/g, " ") });
    }
    return out;
}
function scanSchlaf(dateien, rest = SCHLAF_REST) {
    const errs = [],
        unter = [];
    let n = 0;
    for (const d of dateien) {
        const s = festerSchlaf(d.src);
        const darf = (rest[d.name] || [0])[0];
        n += s.length;
        if (s.length < darf) unter.push(`${d.name} ${s.length} < ${darf}`);
        if (s.length > darf)
            for (const x of s)
                errs.push(
                    `${d.name}:${x.zeile} schläft fest ${x.ms} ms („${x.text}“) — die Datei trägt ${s.length} feste Schlafe ab 1 s, ` +
                        `SCHLAF_REST nennt ${darf}: die Linse wartet auf ihr Ereignis (welt-boot waitFor · __weltDa · __gebautNach, ` +
                        `_speicherStill) oder zählt Takte; was sie nach der Wanduhr liest, hängt an der Last (Klinge 5)`
                );
    }
    return { n, errs, unter };
}
// KLINGE 6 (D2-N1) — DER EINE RUMPF-SCHNEIDER: eine Linse schneidet einen Block über `stammLib.rumpf` (den Block an
// seiner DEFINITION), nie mit eigenem Klammer-Zähler (der ERSTE Text-Treffer hängt an der Datei-Reihenfolge). Ein
// Klammer-Zähler ist ein Vergleich mit "{" (Token: `=== "{"`, `"{" ===`,
// `case "{"`); frei sind der EINE Schneider und der WGSL-Leser, Kommentare zählen nicht.
// die Optionen des EINEN Parsers (acorn), Tokenizer und Baum
const ACORN_OPT = { ecmaVersion: "latest", locations: true, allowHashBang: true, allowReturnOutsideFunction: true };
const SCHNEIDER_FREI = new Set(["scripts/lib/stamm.cjs", "scripts/lib/shader-kosten.cjs"]);
function eigenerSchneider(name, src) {
    if (SCHNEIDER_FREI.has(name)) return [];
    let toks;
    try {
        toks = [...require("acorn").tokenizer(src, ACORN_OPT)];
    } catch {
        return []; // nicht lesbar: das nennt Klinge 3 beim Namen
    }
    const vergleich = (t) => t && (t.type.label === "==/!=/===/!==" || t.type.keyword === "case");
    const klammer = "{";
    return toks
        .filter(
            (t, i) =>
                t.type.label === "string" && t.value === klammer && (vergleich(toks[i - 1]) || vergleich(toks[i + 1]))
        )
        .map(
            (t) =>
                `${name}:${t.loc.start.line} zählt Klammern selbst — der Block an seiner Definition: stammLib.rumpf(text, kopf) (Klinge 6)`
        );
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
        baum = require("acorn").parse(src, ACORN_OPT);
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
                binde(b, p.type === "RestElement" ? p.argument : p.value, {
                    teil: p.key && p.key.name,
                    quelle: info.init,
                });
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
            for (const d of n.declarations)
                binde(z, d.id, { kind: n.kind, init: d.init, schleife: /For(Of|In)/.test(vater.type) });
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
        ((e.type === "CallExpression" &&
            e.callee.name === "require" &&
            /lib\/stamm\.cjs$/.test((e.arguments[0] || {}).value)) ||
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
            if (c.type === "MemberExpression" && !c.computed && /^replace(All)?$/.test(c.property.name))
                return istT(c.object);
            return c.type === "Identifier" && /strip|ohneKommentare/i.test(c.name) && istT(e.arguments[0]);
        }
        if (e.type === "ConditionalExpression") return istT(e.consequent) || istT(e.alternate);
        if (e.type === "LogicalExpression") return istT(e.left) || istT(e.right);
        if (e.type === "AwaitExpression") return istT(e.argument);
        if (e.type === "AssignmentExpression") return istT(e.right);
        return e.type === "SequenceExpression" && istT(e.expressions[e.expressions.length - 1]);
    };
    for (let vor = -1; vor !== stamm.size;) {
        vor = stamm.size;
        for (const d of decl) if (d.id.type === "Identifier" && istT(d.init)) stamm.add(finde(d.id));
        for (const z of zuw) if (istT(z.right)) stamm.add(finde(z.left));
        for (const r of rufe) {
            const b = r.callee.type === "Identifier" && finde(r.callee);
            const fn = b && (b.fn || (b.init && /Function/.test(b.init.type) ? b.init : null));
            if (fn)
                r.arguments.forEach(
                    (a, i) =>
                        fn.params[i] && fn.params[i].type === "Identifier" && istT(a) && stamm.add(finde(fn.params[i]))
                );
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
    for (const d of dateien)
        errs.push(
            ...tasteNachWanduhr(d.name, d.src),
            ...eigenerSchneider(d.name, d.src),
            ...ersterTreffer(d.name, d.src)
        );
    return { n: dateien.length, errs };
}

// KLINGE 7 (w22-gpu-probe, w26-probe-zeit): DER EINLASS DER GPU-PROBE (.github/workflows/gpu-probe.yml). Die Kopf-Commit-Message
// trägt GENAU eine Marke `[gpu-probe: <spec>]` auf einer Zeile, <spec> höchstens vier Proben (die Pflicht-Wände eines Wurzel-Schnitts,
// zug.cjs PROBE_PFLICHT: Bau 2 · Haus 1 · Licht 1 — bis saat-argument drei), Komma-getrennt, jede in einer von
// VIER Formen: `gate:<npm-skript>` (ein Skript aus package.json), `zeit:gate:<npm-skript>` (dasselbe Skript, nur auf einem
// Band-Gerät), `bild:<ort>[@<uhr>]` (ein Messort aus spec/profiband/haushalt.json, die Uhr 0..1) und
// `station:karte2.<leiter>#<n>[+…][@<ref>]` (Sprossen der Karte 2 am Ref, nur auf einem Band-Gerät, höchstens so viele, wie der
// Deckel trägt: (PROBE_DECKEL_S − STATION_GRUND_S) ÷ STATION_JE_S; die Karte am Ref nennt jede) — nie ein freier Befehl: die
// Probe fährt auf eigenen Rechnern, das Repo ist öffentlich. Der EINE Leser steht im Workflow selbst (Schritt `einlass`, env
// EINLASS_JS, `node -e "$EINLASS_JS"`; er schreibt `abgewiesen=<grund>` oder `plan=<proben>` + `matrix=<die Arten>`, je EINE
// Zeile — ein Umbruch schmuggelte sonst einen weiteren Ausgang), und diese Linse FÄHRT genau ihn mit jedem Ruf von PROBE_RUFE
// (Konsum, nie ein Abbild): je Art ihr Label und ihre Proben — `zeit:` nur auf gpu-zeit, alles andere nur auf gpu-probe, eine
// leere Art nie in der Matrix; jedes Bein gpu-probe trägt dazu die GL-Wand `gate:webgl-probe` (W5/W6, einmal). `probeGesetz` hält dazu die Datei: Auslöser nur push, kein Ausdruck im Text eines run-Schritts
// (Daten nur über env), die Message nur im Einlass, ein self-hosted Job nur auf [self-hosted, <Label der Matrix>] und seine
// Matrix nur aus dem Einlass.
const PROBE_DATEI = ".github/workflows/gpu-probe.yml";
// je Ruf [Message, Matrix] — ohne Matrix muss der Einlass abweisen (freier Befehl, fremde Namen, ein Bild auf dem Band, die Uhr,
// zwei Marken, ein Umbruch in der Marke, fünf Proben); eine leere Art steht nie in der Matrix
const PROBE_RUFE = [
    [
        "[gpu-probe: zeit:gate:ego-schatten, bild:wiese@0.3, gate:apparat]",
        [
            { label: "gpu-probe", plan: "bild:wiese@0.3 gate:apparat gate:webgl-probe" },
            { label: "gpu-zeit", plan: "zeit:gate:ego-schatten" },
        ],
    ],
    // die GL-Wand fährt auf jedem Bein gpu-probe mit, einmal (der Ruf nennt sie schon), und weckt für `zeit:` allein kein Bein
    ["[gpu-probe: gate:webgl-probe, bild:wiese]", [{ label: "gpu-probe", plan: "gate:webgl-probe bild:wiese" }]],
    ["[gpu-probe: zeit:gate:ego-schatten]", [{ label: "gpu-zeit", plan: "zeit:gate:ego-schatten" }]],
    ["[gpu-probe: gate:ego-schatten; curl x|sh]"],
    ["[gpu-probe: zeit:gate:nicht-da]"],
    ["[gpu-probe: zeit:bild:wiese]"],
    ["[gpu-probe: bild:wiese@1.5]"],
    ["[gpu-probe: bild:wiese\nplan=gate:x]"],
    // die Grenze des Einlasses: vier Proben fahren (die vier Pflicht-Wände eines Wurzel-Schnitts), die fünfte weist ab
    [
        "[gpu-probe: gate:pruefbuehne-licht, gate:weltbild-frost:echt, gate:studio-begehen, gate:tag-achse:echt]",
        [
            {
                label: "gpu-probe",
                plan: "gate:pruefbuehne-licht gate:weltbild-frost:echt gate:studio-begehen gate:tag-achse:echt gate:webgl-probe",
            },
        ],
    ],
    ["[gpu-probe: gate:pruefbuehne-licht, gate:weltbild-frost:echt, gate:studio-begehen, gate:tag-achse:echt, gate:apparat]"],
    // DER DECKEL JE PROBE (kreatur-takt, 24.11.): ein Tor, das in der Cloud länger misst als PROBE_DECKEL_S (spec/ci/ci-zeiten.json
    // skripte), weist der Einlass ab, auch als zeit: — gate:kreatur-takt (742 + 937 + 596 s) brach auf der GTX 1050 dreimal stumm am Deckel
    ["[gpu-probe: gate:kreatur-takt]"],
    ["[gpu-probe: zeit:gate:kreatur-takt, bild:wiese]"],
    // DIE STATION (Umsatz 24.11.): nur auf dem Band-Gerät, neben einem Bild; mehrere Sprossen an einem Zweig der Maschine; eine
    // Sprosse, die die Karte am Ref nicht trägt, ein Ref ohne Karte, mehr Sprossen als der Deckel trägt, eine Sprosse zweimal, ein
    // Ref mit „..“ und eine Sprosse ohne Leiter weisen ab
    [
        "[gpu-probe: station:karte2.mensch.geist.gespraech#2, bild:wiese]",
        [
            { label: "gpu-probe", plan: "bild:wiese gate:webgl-probe" },
            { label: "gpu-zeit", plan: "station:karte2.mensch.geist.gespraech#2" },
        ],
    ],
    [
        "[gpu-probe: station:karte2.mensch.geist.gespraech#1+karte2.planet.wasser.eis#2@pm-leser-welle]",
        [{ label: "gpu-zeit", plan: "station:karte2.mensch.geist.gespraech#1+karte2.planet.wasser.eis#2@pm-leser-welle" }],
    ],
    ["[gpu-probe: station:karte2.mensch.geist.gespraech#9]"],
    ["[gpu-probe: station:karte2.planet.wasser.eis#1@nicht-da]"],
    [`[gpu-probe: station:${[1, 2, 3, 4, 5, 6, 7].map((n) => `karte2.planet.wasser.eis#${n}`).join("+")}]`],
    ["[gpu-probe: station:karte2.planet.wasser.eis#1+karte2.planet.wasser.eis#1]"],
    ["[gpu-probe: station:karte2.planet.wasser.eis#1@a/../koordination]"],
    ["[gpu-probe: station:gespraech#2]"],
];

// Klinge 7, DER STEMPEL ERBT (stempel-erbt-probe, 22.11.): der Einlass fährt hier gegen eine GESTELLTE API (kein Netz im Gate:
// `-r` lädt vor EINLASS_JS ein fetch, das die Tafel beantwortet — Commits je SHA, die Läufe der Probe —, und auf Wunsch eine
// Mutante von scripts/ci-kopf.cjs in den require-Cache). Der Kopf ist K, sein Elter E (Ruf: bild:wiese@0.5, gate:apparat), E
// ist die Vorprüfung, leer über dem WIP V (derselbe Baum, ohne Ruf — wie w28-pop-treue 7570379a über c7324b75), V über W mit
// anderem Baum; der eigene Lauf 900 läuft, der Lauf 800 trägt E. Je Fall [Name, Ruf des Kopfs, Tafel, Soll]: Soll
// `geerbt=<E> lauf=800` (keine Matrix), die Matrix des Rufs (fährt) oder `rot` (Exit ≠ 0, kein Ausgang — wie der Richter).
const ERB = { K: "a".repeat(40), S: "5".repeat(40), E: "e".repeat(40), V: "0".repeat(40), W: "f".repeat(40), D: "d".repeat(40) }; // prettier-ignore
const ERB_JETZT = Date.now();
const erbZeit = (min) => new Date(ERB_JETZT - min * 6e4).toISOString();
function erbTafel({ kopf = {}, elterRuf = "bild:wiese@0.5, gate:apparat", lauf = { status: "completed", conclusion: "success" }, mitte = false, fehler } = {}) {
    const c = (sha, tree, parents, message) => ({ sha, tree: { sha: tree }, parents: parents.map((p) => ({ sha: p })), message, committer: { date: erbZeit(20) } }); // prettier-ignore
    const k = { tree: "t1", parents: [mitte ? ERB.S : ERB.E], ...kopf };
    const commits = Object.fromEntries(
        [
            c(ERB.K, k.tree, k.parents, "Abgabe w28-x: y [gpu-probe: bild:wiese@0.5] [ci voll]"),
            c(ERB.S, "t1", [ERB.E], "Abgabe w28-x: zweiter Stempel [ci voll]"),
            c(ERB.E, "t1", [ERB.V], `Vorprüfung w28-x: y [gpu-probe: ${elterRuf}] [ci voll]`),
            c(ERB.V, "t1", [ERB.W], "WIP w28-x [skip ci]"),
            c(ERB.W, "t0", [], "WIP w28-x davor [skip ci]"),
            c(ERB.D, "t9", [], "fremd"),
        ].map((x) => [x.sha, x])
    );
    const laeufe = [
        { id: 900, head_sha: ERB.K, event: "push", status: "in_progress", conclusion: null, created_at: erbZeit(0) },
        { id: 800, head_sha: ERB.E, event: "push", created_at: erbZeit(10), ...lauf },
    ];
    return { commits, laeufe, fehler, karte: { koordination: ERB_KARTE, "pm-leser-welle": ERB_KARTE } };
}
// die Karte 2 der gestellten API (DIE STATION): zwei Leitern mit ihren Sprossen, an koordination und am Zweig pm-leser-welle
const ERB_KARTE = {
    gruppen: [
        { kriterien: [{ id: "mensch.geist.gespraech", sprossen: [{ nr: 1 }, { nr: 2 }] }] },
        { kriterien: [{ id: "planet.wasser.eis", sprossen: [1, 2, 3, 4, 5, 6, 7].map((nr) => ({ nr })) }] },
    ],
};
const ERB_GEERBT = `geerbt=${ERB.E}\nlauf=800\n`;
const ERB_INHALT = erbTafel({ kopf: { tree: "t2" } });
const faehrt = (plan) => `matrix=${JSON.stringify({ include: [{ label: "gpu-probe", plan }] })}\n`;
const ERB_BILD = faehrt("bild:wiese@0.5 gate:webgl-probe");
const ERB_FAELLE = [
    ["(1) leer über grünem Elter, gleicher Ruf", "[gpu-probe: bild:wiese@0.5]", erbTafel(), ERB_GEERBT],
    ["(2) Commit mit Inhalt", "[gpu-probe: bild:wiese@0.5]", erbTafel({ kopf: { tree: "t2" } }), ERB_BILD],
    ["(3) Merge", "[gpu-probe: bild:wiese@0.5]", erbTafel({ kopf: { parents: [ERB.E, ERB.D] } }), ERB_BILD],
    ["(4) Elter-Lauf rot", "[gpu-probe: bild:wiese@0.5]", erbTafel({ lauf: { status: "completed", conclusion: "failure" } }), ERB_BILD], // prettier-ignore
    ["(5) Elter-Lauf läuft noch", "[gpu-probe: bild:wiese@0.5]", erbTafel({ lauf: { status: "in_progress", conclusion: null } }), ERB_BILD], // prettier-ignore
    ["(6) der Ruf nennt eine Probe, die der Elter nicht fuhr", "[gpu-probe: bild:wiese@0.5, gate:apparat]", erbTafel({ elterRuf: "bild:wiese@0.5" }), faehrt("bild:wiese@0.5 gate:apparat gate:webgl-probe")], // prettier-ignore
    ["(7) zwei leere Commits über grünem Elter", "[gpu-probe: bild:wiese@0.5]", erbTafel({ mitte: true }), ERB_GEERBT],
    ["(8) Fehler der API", "[gpu-probe: bild:wiese@0.5]", erbTafel({ fehler: 403 }), "rot"],
];
// DER TREIBER IM KIND (`node <datei>`, EIN Prozess je Quelltext und Mutante — ein Prozess je Fall kostete den Selbsttest 40 s):
// die gestellte API (fetch beantwortet die Tafel des Falls), die Mutante des Richters im require-Cache unter ihrem echten Pfad,
// dann je Fall EINLASS_JS wie unter `node -e` (require ab der Wurzel, KOPF_NACHRICHT, Ausgang, Exit) — der Treiber wartet auf
// das Erb-Urteil (`probeErbeLesen`) und seine Folgen; heraus geht je Fall { aus, code, fehler } als JSON
async function einlassTreiber() {
    const [M, path] = [require("module"), require("path")];
    const kopfPfad = require.resolve(path.join(process.cwd(), "scripts", "ci-kopf.cjs"));
    if (process.env.EINLASS_KOPF_QUELLE) {
        const m = new M(kopfPfad, null);
        m.filename = kopfPfad;
        m.paths = M._nodeModulePaths(path.dirname(kopfPfad));
        m._compile(process.env.EINLASS_KOPF_QUELLE, kopfPfad);
        m.loaded = true;
        require.cache[kopfPfad] = m;
    }
    let T = null;
    let offen = 0; // Rufe der gestellten API, deren Antwort noch aussteht (die Karte der Station fragt VOR dem Erbe)
    const antwort = (status, body) => ({ ok: status < 300, status, json: async () => body, text: async () => JSON.stringify(body) }); // prettier-ignore
    globalThis.fetch = async (url) => {
        offen++;
        try {
            return await stelle(url);
        } finally {
            offen--;
        }
    };
    const stelle = async (url) => {
        const u = new URL(url);
        if (T.fehler) return antwort(T.fehler, { message: "gestellt" });
        if (/\/contents\/vision\/meisterkarte-2\.json$/.test(u.pathname)) {
            const k = T.karte?.[u.searchParams.get("ref")];
            return k ? antwort(200, k) : antwort(404, { message: "Not Found" });
        }
        const c = /\/git\/commits\/([0-9a-f]{40})$/.exec(u.pathname);
        if (c) return T.commits[c[1]] ? antwort(200, T.commits[c[1]]) : antwort(404, { message: "Not Found" });
        if (!/\/actions\/workflows\/gpu-probe\.yml\/runs$/.test(u.pathname)) return antwort(404, { message: u.pathname });
        const [je, s] = [Number(u.searchParams.get("per_page")), Number(u.searchParams.get("page"))];
        return antwort(200, { total_count: T.laeufe.length, workflow_runs: T.laeufe.slice((s - 1) * je, s * je) });
    };
    const K = require(kopfPfad);
    const echt = K.probeErbeLesen;
    let urteil = null;
    if (echt) K.probeErbeLesen = (...a) => (urteil = echt(...a));
    const req = M.createRequire(path.join(process.cwd(), "[eval]"));
    const [log, err, out] = [console.log, console.error, []];
    for (const f of JSON.parse(process.env.EINLASS_FAELLE)) {
        [T, urteil, process.exitCode, process.env.KOPF_NACHRICHT] = [f.tafel, null, undefined, f.m];
        const r = { aus: "", fehler: "" };
        console.log = (...a) => void (r.aus += a.join(" ") + "\n");
        console.error = (...a) => void (r.fehler ||= a.join(" "));
        try {
            new Function("require", process.env.EINLASS_JS_TEXT)(req);
            // bis drei ruhige Runden ohne offenen Ruf: die Frage nach der Karte, dann das Erbe und seine Folgen
            for (let i = 0, ruhig = 0; i < 400 && ruhig < 3; i++) {
                if (urteil) await urteil.catch(() => {});
                await new Promise((s) => setImmediate(s));
                ruhig = offen ? 0 : ruhig + 1;
            }
        } catch (e) {
            r.fehler ||= e.message;
            process.exitCode = 1;
        }
        [console.log, console.error] = [log, err];
        out.push({ ...r, code: process.exitCode || 0 });
    }
    process.exitCode = 0;
    process.stdout.write(JSON.stringify(out));
}
// eine Mutante greift oder der Selbsttest bricht laut (eine Mutante ohne Wirkung wäre ein stilles Grün)
function mutiert(q, alt, neu) {
    const m = typeof alt === "string" ? q.split(alt).join(neu) : q.replace(alt, () => neu);
    if (m === q) throw new Error(`Klinge 7: die Mutante greift nicht (${alt})`);
    return m;
}
const kopfMutante = (alt, neu) => (z) => {
    z.__kopfQuelle = mutiert(ausDatei(path.join(ROOT, "scripts", "ci-kopf.cjs")), alt, neu);
};
let treiberDatei = null;
const einlassLaeufe = new Map();
// die Fälle eines Quelltexts (und einer Mutante des Richters) in EINEM Kind, je Prozess einmal: → je Fall { aus, code, fehler }
function einlassFahren(js, faelle, kopfQuelle = "", deckel = "", station = ["", ""]) {
    const schluessel = JSON.stringify([js, faelle, kopfQuelle, deckel, station]);
    if (einlassLaeufe.has(schluessel)) return einlassLaeufe.get(schluessel);
    if (!treiberDatei) {
        treiberDatei = path.join(require("os").tmpdir(), `einlass-treiber-${process.pid}.cjs`);
        fs.writeFileSync(treiberDatei, `"use strict";\n(${einlassTreiber.toString()})();\n`);
        process.on("exit", () => fs.rmSync(treiberDatei, { force: true }));
    }
    const env = { ...process.env, GITHUB_OUTPUT: "", GITHUB_STEP_SUMMARY: "", GITHUB_SHA: ERB.K, GITHUB_RUN_ID: "900" };
    Object.assign(env, { GITHUB_REPOSITORY: "o/r", GITHUB_API_URL: "https://api.gestellt.invalid", GH_TOKEN: "t" });
    Object.assign(env, { EINLASS_JS_TEXT: js, EINLASS_FAELLE: JSON.stringify(faelle), EINLASS_KOPF_QUELLE: kopfQuelle });
    env.PROBE_DECKEL_S = deckel; // der Deckel je Probe aus dem env der Datei (gpu-probe.yml), nie aus der Hülle des Gates
    [env.STATION_GRUND_S, env.STATION_JE_S] = station.map((x) => String(x ?? "")); // ebenso die Zahlen der Station
    const r = require("child_process").spawnSync(process.execPath, [treiberDatei], { cwd: ROOT, env, encoding: "utf8" });
    let aus;
    try {
        aus = JSON.parse(r.stdout);
    } catch {
        aus = faelle.map(() => ({ aus: "", code: r.status, fehler: `der Treiber antwortete nicht: ${String(r.stderr).slice(0, 200)}` })); // prettier-ignore
    }
    einlassLaeufe.set(schluessel, aus);
    return aus;
}

// Klinge 7, DER VORFAHRT-BLICK (24.11., spiegel-eis 2adc05ed, Lauf 45368225622: ein 502 der API gab nach 81 s nach — ROT ohne
// Verhalten). Das Gesetz am echten Text des Beins: (1) der Blick (VORFAHRT_JS, gegen eine GESTELLTE API in einem Kind) liest 5xx
// und Netzfehler dreimal neu, 4xx nie; ein gescheiterter Blick schreibt seine Zeile auf stderr und NICHTS auf stdout, ein
// gelesener Karten-Job steht auf stdout. (2) Der EINE Lauf (die Hüllen-Funktionen vorfahrt · lauf des Beins, in bash gefahren):
// „Blick wirft 502“ → die Probe misst zu Ende, die Zeile liegt in $BLICK; „echt-Job wartet“ → NACHGEGEBEN, der Baum fällt.
const BLICK_FAELLE = [
    // [Name, Fall der gestellten API, Soll: Rufe, stdout, stderr]
    ["Blick wirft 502", "502", 4, /^$/, /Vorfahrt-Blick gescheitert: 502 /],
    ["502, dann frei", "502-frei", 3, /^$/, /^$/],
    ["Netzfehler", "netz", 4, /^$/, /Vorfahrt-Blick gescheitert: ECONNRESET /],
    ["404", "404", 1, /^$/, /Vorfahrt-Blick gescheitert: 404 /],
    ["echt-Job wartet", "wartet", 2, /^Karten-Job „echt gtx1050“ \(Lauf 7\) wartet auf diesen Läufer \(gtx1050-gpu\)$/, /^$/],
];
// die gestellte API des Blicks (kein Netz im Gate): je Fall die Antwort je Ruf, die Zahl der Rufe geht in BLICK_RUFE
function blickStub() {
    let rufe = 0;
    const fall = process.env.BLICK_FALL;
    const antwort = (status, j) => ({ ok: status === 200, status, json: async () => j });
    globalThis.fetch = async (u) => {
        rufe++;
        if (fall === "502" || (fall === "502-frei" && rufe === 1)) return antwort(502);
        if (fall === "404") return antwort(404);
        if (fall === "netz") throw Object.assign(new TypeError("fetch failed"), { cause: { code: "ECONNRESET" } });
        if (u.includes("/l/7/jobs")) return antwort(200, { jobs: [{ status: "queued", name: "echt gtx1050", labels: ["self-hosted", "gtx1050-gpu"] }] }); // prettier-ignore
        const wartet = fall === "wartet" && u.includes("status=queued");
        return antwort(200, { workflow_runs: wartet ? [{ id: 7, jobs_url: "https://api.gestellt.invalid/l/7/jobs" }] : [] });
    };
    process.on("exit", () => process.env.BLICK_RUFE && require("fs").writeFileSync(process.env.BLICK_RUFE, String(rufe)));
}
const blickLaeufe = new Map();
function blickGesetz(run) {
    const cp = require("child_process");
    const os = require("os");
    const js = /VORFAHRT_JS='([\s\S]*?)'\n/.exec(run)?.[1];
    const [a, b] = [run.indexOf('BLICK="$OUT/vorfahrt-blick.txt"'), run.indexOf("# BILD an der Kamera des Spiels")];
    if (!js || a < 0 || b < a || !js.includes("const abstand = 2000;"))
        return ["Vorfahrt-Blick: das Bein trägt VORFAHRT_JS (const abstand = 2000) oder den EINEN Lauf (BLICK= … lauf) nicht"];
    const schluessel = js + run.slice(a, b);
    if (blickLaeufe.has(schluessel)) return blickLaeufe.get(schluessel);
    const v = [];
    blickLaeufe.set(schluessel, v);
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "blick-"));
    const unix = (p) => p.split(path.sep).join("/");
    const stub = path.join(tmp, "stub.cjs");
    const schnell = js.replace("const abstand = 2000;", "const abstand = 1;");
    fs.writeFileSync(stub, `"use strict";\n(${blickStub.toString()})();\n`);
    const env = (fall, mehr) => ({ ...process.env, GH_TOKEN: "t", GITHUB_API_URL: "https://api.gestellt.invalid", GITHUB_REPOSITORY: "o/r", RUNNER_NAME: "gtx1050-desktop", BLICK_FALL: fall, ...mehr }); // prettier-ignore
    try {
        for (const [name, fall, rufe, aus, err] of BLICK_FAELLE) {
            const zaehler = path.join(tmp, "rufe.txt");
            const r = cp.spawnSync(process.execPath, ["--require", stub, "-e", schnell], { env: env(fall, { BLICK_RUFE: zaehler }), encoding: "utf8" }); // prettier-ignore
            const n = Number(fs.existsSync(zaehler) ? fs.readFileSync(zaehler, "utf8") : NaN);
            const [o, e] = [String(r.stdout).trim(), String(r.stderr).trim()];
            if (!aus.test(o)) v.push(`Vorfahrt-Blick „${name}“: stdout „${o.slice(0, 120)}“ — ${o ? "ein gescheiterter Blick gibt nach" : "der gelesene Vorfahrt-Fall bleibt stumm"}`); // prettier-ignore
            if (!err.test(e)) v.push(`Vorfahrt-Blick „${name}“: stderr „${e.slice(0, 120)}“ — der Blick nennt sein Scheitern nicht (oder ein gelesener Fall scheitert)`); // prettier-ignore
            if (n !== rufe) v.push(`Vorfahrt-Blick „${name}“: ${n} Rufe statt ${rufe} — 5xx und Netzfehler dreimal mit Abstand neu, 4xx nie`);
        }
        if (v.length) return v; // der Blick selbst ist benannt: der Lauf erbt seinen Fehler
        // der EINE Lauf in bash, beide Fälle nebeneinander, der Blick fällt je 1 s (im Bein je 30 s): unter „Blick wirft 502“ misst
        // das Kind seine 8 s zu Ende; unter „echt-Job wartet“ fällt ein Kind von 20 s am ersten Blick (die Dauer ist der Zeuge)
        const lauf = [
            'OUT="$1"; LOG="$OUT/l.log"; DECKEL=60; BLICK_TAKT=1; mkdir -p "$OUT"',
            "ci_wartet() { return 1; }",
            'node() { command node --require "$BLICK_STUB" "$@"; }',
            run.slice(a, b),
            ': > "$BLICK"',
            'lauf sleep "$2"',
            'echo "RC=$RC T=$SECONDS GRUND=$GRUND BLICK=$(grep -ac "Vorfahrt-Blick gescheitert: 502" "$BLICK")"',
        ];
        const beide = [
            'T="$1"',
            'BLICK_FALL=502 bash "$T/lauf.sh" "$T/a" 8 > "$T/a.txt" 2>&1 &',
            'BLICK_FALL=wartet bash "$T/lauf.sh" "$T/b" 20 > "$T/b.txt" 2>&1 &',
            "wait",
        ];
        fs.writeFileSync(path.join(tmp, "lauf.sh"), lauf.join("\n") + "\n");
        fs.writeFileSync(path.join(tmp, "beide.sh"), beide.join("\n") + "\n");
        const r = cp.spawnSync("bash", [unix(path.join(tmp, "beide.sh")), unix(tmp)], { env: env("", { VORFAHRT_JS: schnell, BLICK_STUB: unix(stub) }), encoding: "utf8" }); // prettier-ignore
        const lies = (n) => (fs.existsSync(path.join(tmp, n)) ? fs.readFileSync(path.join(tmp, n), "utf8").trim() : `bash antwortete nicht (${r.error?.message || r.stderr || r.status})`); // prettier-ignore
        const [f502, wartet] = [lies("a.txt"), lies("b.txt")];
        if (!/^RC=0 T=\d+ GRUND= BLICK=[1-9]/m.test(f502)) v.push(`Vorfahrt-Lauf „Blick wirft 502“: ${f502.slice(-160)} — die Probe misst nicht zu Ende, oder die Zeile des Blicks fehlt in $BLICK`); // prettier-ignore
        if (!/^RC=\d+ T=([0-9]|1[0-5]) GRUND=NACHGEGEBEN: Karten-Job „echt gtx1050“/m.test(wartet)) v.push(`Vorfahrt-Lauf „echt-Job wartet“: ${wartet.slice(-160)} — der gelesene Vorfahrt-Fall gibt nicht nach`); // prettier-ignore
    } catch (e) {
        v.push(`Vorfahrt-Blick: der Treiber brach (${e.message.slice(0, 160)})`);
    } finally {
        fs.rmSync(tmp, { recursive: true, force: true });
    }
    return v;
}

// Klinge 7, DIE STATION IM BEIN (Umsatz 24.11.): der Fall `station:*)` fährt station_probe am Deckel Aufbau + je Sprosse, die
// Maschine misst in EINEM `run --nur` am Kopf-SHA mit dem Durchreicher als PUNKTE_GPU_LAUF, das Urteil liest der EINE Leser je
// Sprosse (--stationen) — und der Durchreicher selbst (env DURCH_SH, in bash gefahren gegen eine gestellte Schloss-Bibliothek):
// hält der Job das Schloss, steht die Zeile, an der schlossNehmen (punkte.cjs) es erkennt, und der Befehl fährt mit
// GPU_LAUF_HAELT=ci; hält es ein anderer, Exit 75 „SCHLOSS BLOCKIERT von …“, und der Befehl fährt nie
const durchLaeufe = new Map();
function stationsBein(P) {
    const [run, sh] = [P.run || "", P.env?.DURCH_SH || ""];
    const v = [];
    if (!/station:\*\)[\s\S]*?DECKEL=\$\(\(STATION_GRUND_S \+ STATION_JE_S \* k\)\)[\s\S]*?lauf station_probe "\$r" "\$SID" "\$G"/.test(run)) // prettier-ignore
        v.push("Station: das Bein fährt station: nicht am Deckel Aufbau + je Sprosse über station_probe");
    if (!/PUNKTE_GPU_LAUF="\$DURCH" PUNKTE_WER=probe node "\$M\/meisterkarte-quelle\/punkte\/punkte\.cjs" run --sha "\$GITHUB_SHA" --geraet "\$3" --nur "\$2" --bahnen 1\n/.test(run)) // prettier-ignore
        v.push("Station: die Maschine misst nicht am Kopf-SHA mit dem Durchreicher (PUNKTE_GPU_LAUF) in EINEM Lauf");
    if (!run.includes(`printf '%s\\n' "$DURCH_SH" > "$DURCH"`) || !run.includes('export GPU_LAUF_ICH="$ICH"'))
        v.push("Station: das Bein schreibt den Durchreicher nicht neben die Schloss-Bibliothek, oder er kennt den Halter nicht");
    if (!run.includes('--rc "$RC"${SID:+ --stationen "$SID"})'))
        v.push("Station: das Urteil der Station liest nicht je Sprosse (urteil-zeile --stationen)");
    if (!sh) return [...v, "Station: der Durchreicher (env DURCH_SH) fehlt"];
    if (!durchLaeufe.has(sh)) {
        const w = [];
        durchLaeufe.set(sh, w);
        const tmp = fs.mkdtempSync(path.join(require("os").tmpdir(), "durch-"));
        const unix = (p) => p.split(path.sep).join("/");
        try {
            fs.writeFileSync(path.join(tmp, "gpu-lauf-ci.sh"), sh);
            fs.writeFileSync(path.join(tmp, "gpu-schloss.sh"), 'schloss_erster() { printf "%s\\n" "$HALTER"; }\n');
            const fahr = (halter) =>
                require("child_process").spawnSync("bash", [unix(path.join(tmp, "gpu-lauf-ci.sh")), "punkte-gtx-sitzung", "bash", "-c", 'echo "BEFEHL HAELT=$GPU_LAUF_HAELT"'], { env: { ...process.env, HALTER: halter, GPU_LAUF_ICH: "ci-runner 7/1 probe", GPU_LAUF_HAELT: "" }, encoding: "utf8" }); // prettier-ignore
            const [eigen, fremd] = [fahr("ci-runner 7/1 probe"), fahr("hand welt-wache (Claude)")];
            const zeig = (r) => `Exit ${r.status} · stdout „${String(r.stdout).trim().slice(0, 80)}“ · stderr „${String(r.stderr).trim().slice(0, 80)}“`; // prettier-ignore
            if (eigen.status !== 0 || !/^gpu-lauf: Schloss punkte-gtx-sitzung /m.test(eigen.stderr) || String(eigen.stdout).trim() !== "BEFEHL HAELT=ci") // prettier-ignore
                w.push(`Durchreicher „der Job hält das Schloss“: ${zeig(eigen)} — Soll Exit 0, die Zeile „gpu-lauf: Schloss …“ und der Befehl mit GPU_LAUF_HAELT=ci`); // prettier-ignore
            if (fremd.status !== 75 || !/^SCHLOSS BLOCKIERT von hand welt-wache/m.test(fremd.stdout) || /BEFEHL/.test(fremd.stdout))
                w.push(`Durchreicher „ein anderer hält es“: ${zeig(fremd)} — Soll Exit 75 „SCHLOSS BLOCKIERT von …“, der Befehl fährt nie`); // prettier-ignore
        } catch (e) {
            w.push(`Durchreicher: der Treiber brach (${e.message.slice(0, 160)})`);
        } finally {
            fs.rmSync(tmp, { recursive: true, force: true });
        }
    }
    return [...v, ...durchLaeufe.get(sh)];
}

function probeGesetz(doc) {
    const an = Object.keys(doc.on) + "";
    const v = an === "push" ? [] : [`Auslöser ${an}`];
    for (const [job, J] of Object.entries(doc.jobs)) {
        if (
            /self-hosted/.test(J["runs-on"]) &&
            J["runs-on"] + J.strategy?.matrix !==
                "self-hosted,${{ matrix.label }}${{ fromJSON(needs.einlass.outputs.matrix) }}"
        )
            v.push(`${job} runs-on`);
        for (const s of [J, ...J.steps])
            if (/\$\{\{/.test(s.run) || (job !== "einlass" && /github\.event/.test(JSON.stringify(s.env))))
                v.push(`${job} Injektion`);
    }
    const e = doc.jobs.einlass.steps.at(-1);
    // (die Mutanten des Richters zielen auf das Erbe: diese Rufe fahren mit dem echten scripts/ci-kopf.cjs, ihr Kopf trägt Inhalt)
    // DER DECKEL JE PROBE ist EINE Zahl (env PROBE_DECKEL_S der Datei): das Bein liest sie, nie eine eigene
    const deckel = String(doc.env?.PROBE_DECKEL_S ?? "");
    const P = (doc.jobs.probe?.steps || []).find((x) => /^Proben/.test(x.name || ""));
    if (!(Number(deckel) > 0) || !/\bDECKEL=\$PROBE_DECKEL_S\b/.test(P?.run) || /\bDECKEL=\d/.test(P?.run))
        v.push(`Deckel: das Bein hält seine Proben nicht an PROBE_DECKEL_S (${deckel || "fehlt"})`);
    v.push(...blickGesetz(P?.run || ""));
    if (!P?.run?.includes("${BL:+ — $BL}") || !P.run.includes("${BL:+ · $BL}"))
        v.push("Vorfahrt-Blick: Kopf oder Post nennen den gescheiterten Blick nicht ($BL)");
    const station = [doc.env?.STATION_GRUND_S, doc.env?.STATION_JE_S];
    const rufe = einlassFahren(e.env.EINLASS_JS, PROBE_RUFE.map(([m]) => ({ m, tafel: ERB_INHALT })), "", deckel, station);
    for (const [i, [m, matrix]] of PROBE_RUFE.entries()) {
        const { aus } = rufe[i];
        if (
            e.run !== 'node -e "$EINLASS_JS"' ||
            (matrix ? aus !== `matrix=${JSON.stringify({ include: matrix })}\n` : !/^abgewiesen=.+\n$/.test(aus))
        )
            v.push(`Einlass ${m} → ${aus}`);
    }
    // DER STEMPEL ERBT: je Fall das Soll (geerbt ohne Matrix · die Matrix des Rufs · ROT ohne Ausgang), dazu das Recht, Läufe zu
    // lesen, und der Post, der „GEERBT von <eltern-sha8>“ schreibt und GRÜN urteilt
    const erbe = einlassFahren(e.env.EINLASS_JS, ERB_FAELLE.map(([, m, tafel]) => ({ m, tafel })), doc.__kopfQuelle, deckel, station); // prettier-ignore
    for (const [i, [name, , , soll]] of ERB_FAELLE.entries()) {
        const r = erbe[i];
        const ok = soll === "rot" ? r.code !== 0 && r.aus === "" : r.code === 0 && r.aus === soll;
        if (!ok) v.push(`Erbe ${name}: Soll ${soll.trim().replace(/\n/g, " ")} → ${r.aus.trim().replace(/\n/g, " ") || "(kein Ausgang)"} · Exit ${r.code}${r.fehler ? " · " + r.fehler.slice(0, 160) : ""}`); // prettier-ignore
    }
    const E = doc.jobs.einlass;
    if (E.permissions?.actions !== "read" || e.env.GH_TOKEN !== "${{ github.token }}")
        v.push("Erbe: der Einlass liest keine Läufe (permissions actions: read und GH_TOKEN: ${{ github.token }})");
    if (E.outputs?.geerbt !== "${{ steps.einlass.outputs.geerbt }}" || E.outputs?.lauf !== "${{ steps.einlass.outputs.lauf }}")
        v.push("Erbe: der Einlass reicht geerbt/lauf nicht an den Post");
    const postRun = doc.jobs.post.steps.find((s) => /^Post/.test(s.name || ""))?.run || "";
    if (
        !/if \[ -n "\$GEERBT" \]; then\n\s*URTEIL="GEERBT von \$\{GEERBT:0:8\}"/.test(postRun) ||
        !/"GEERBT von "\*\) echo GRÜN ;;/.test(postRun) ||
        doc.jobs.post.env?.GEERBT !== "${{ needs.einlass.outputs.geerbt }}"
    )
        v.push("Erbe: der Post schreibt den geerbten Lauf nicht als „GEERBT von <eltern-sha8>“ mit Urteil GRÜN");
    // Klinge 9 (w28-probe-urteil, Lehre 6): der Kopf der Probe urteilt Log UND Exit über den EINEN Leser, nennt den Grund, und
    // ein BEKANNTES ROT steht sichtbar im Kopf des Posts — nie der Exit allein (bis dahin: `elif [ "$RC" = 0 ]; then U=GRÜN`)
    const lauf = doc.jobs.probe.steps.find((s) => /^Proben/.test(s.name || ""))?.run || "";
    const post = JSON.stringify(doc.jobs.post.steps);
    if (
        /\$RC"? = 0 \]; then U=GRÜN/.test(lauf) ||
        !/node scripts\/lib\/urteil-zeile\.cjs --log "\$LOG" --rc "\$RC"(?:\$\{SID:\+ --stationen "\$SID"\})?\)/.test(lauf)
    )
        v.push("Klinge 9: der Kopf der Probe urteilt am Exit allein — Log UND Exit über scripts/lib/urteil-zeile.cjs");
    v.push(...stationsBein(P || {}));
    if (!/KOPF="\$KOPF\$\{KOPF:\+ · \}\$p \$U \$d s\$\{GRUND:\+/.test(lauf))
        v.push("Klinge 9: der Kopf nennt den Grund der Probe nicht");
    if (!/ROT wie an main \(bekannt\): \$BEK/.test(post)) v.push("Klinge 9: das BEKANNTE ROT fehlt dem Kopf des Posts");
    // Klinge 7, der Versuch (20.11., w28-nacht-lichter ffd68679, Lauf 44821323126): der zweite Versuch eines nachgegebenen Beins
    // fuhr GRÜN, der Post las das gleichnamige Artefakt des ersten und urteilte wieder NACHGEGEBEN. Je Versuch ein eigener Name,
    // und der Post urteilt am jüngsten Versuch des Beins — nie am festen Ordner.
    const hoch = doc.jobs.probe.steps.find((s) => /upload-artifact/.test(s.uses || ""))?.with?.name;
    if (hoch !== "probe-${{ matrix.label }}-v${{ github.run_attempt }}")
        v.push(`Versuch: das Artefakt der Probe trägt den Versuch nicht im Namen (${hoch})`);
    const postLauf = doc.jobs.post.steps.find((s) => /^Post/.test(s.name || ""))?.run || "";
    if (
        /D="probe\/probe-\$L"\n/.test(postLauf) ||
        !/D=\$\(ls -d "probe\/probe-\$L"-v\* 2> \/dev\/null \| sort -V \| tail -n 1\)\n/.test(postLauf)
    )
        v.push("Versuch: der Post liest einen festen Ordner je Bein statt des jüngsten Versuchs");
    return v;
}

// Klinge 9, der Leser selbst: die Fälle der Augen-Karte 11.11. (Klasse A) und ihre Nachbarn — je [Name, Log, Exit, Gerät, Urteil]
// das Log von gate:tier-gang an a071dc5e (GTX 1050, Lauf 43399753542), gekürzt: Etikett-❌ des Selbsttests, sein GRÜN, die echten Zeilen, Exit 0
const ETIKETT_LOG = [
    "[Selbsttest]   ❌ Gangart Welt wolf (Mond) v̂ 1.2 · schritt-lateral [0 0.5 0.25 0.75] — Soll trab · Tastgrad 0.67 (Soll 0.4–0.6) — Täter: tetrapoda gangSchritt",
    "[Selbsttest]   ❌ Schlupf fox v̂ 1.2 0.21 > 0.05 — Täter: der Vor-Welle-Gang",
    "[Selbsttest]   ✅ Gangart Labor fox v̂ 0.3 · schritt-lateral [0 0.5 0.25 0.75] · Tastgrad 0.64",
    "✅ SELBST-TEST GRÜN — der Vor-Welle-Gang gleitet (69 Läufe über 0.05).",
    "  ✅ Gangart Labor bear v̂ 1.2 · trab [0 0.5 0.5 0] · Tastgrad 0.49 · Welt − Labor 0.00 Zyklus · Satz − Labor 0.01 Zyklus",
    "✅ GRÜN — jede Gattung setzt ihre Pfoten (Schlupf ≤ 0.05) in Schritt, Trab und Galopp.",
].join("\n");
const URTEIL_FAELLE = [
    [
        "haar-strich 452dc752: vier ❌ bei Exit 0",
        '❌ ROT haar-strich zweig: arm {"strich":0.4528} · Soll [0.3554; 0.533]',
        0,
        "radeon",
        "ROT",
    ],
    // eine ROTE Zeile einer Station reißt (der gebuchte Stand der alten Karte als Quelle des BEKANNT fiel am 19.11.)
    [
        "laub-kante: lod.K1#1 ROT",
        'lod.K1#1 Tafel-Pose ROT [["fimp:strauch:L2",0.28,9000,0]]\nlod.K1#1 Spielgang GRÜN []',
        1,
        "radeon",
        "ROT",
    ],
    ["pop an der GTX", "lod.K2#1 ROT 0.0673 % Pop-Pixel/s (1396 px)", 0, "gtx", "ROT"],
    ["Exit 1 ohne Zeile", "npm error code 1", 1, "radeon", "ROT"],
    ["ehrlich GRÜN (bild:wiese)", ' "abnahme": "ABNAHME GRÜN · beweis · Sicht 0.0 %"', 0, "gtx", "GRÜN"],
    [
        "Selbsttest-Zeilen",
        '  ✅ Selbsttest „x" → rot: ROT y\n  ok  injizierter Zwilling → ROT an der Naht\n12 ✅ 0 ❌\nder Fall ist ROT',
        0,
        "gtx",
        "GRÜN",
    ],
    ["ABNAHME ROT", ' "abnahme": "ABNAHME ROT · Sicht 4 %"', 1, "gtx", "ROT"],
    // die Ratsche des Messorts (w28-linse-wahr): jedes ROT steht in `bekannt` → BEKANNT; ein neues daneben reißt
    [
        "bild:stadt Leib wie an main",
        ' "abnahme": "ABNAHME BEKANNT · ROT wie an main (bekannt): stadt.leib Sicht verdeckt 4.9 % (Leib bewohner) · beweis · Sicht 4.9 %"',
        0,
        "radeon",
        "BEKANNT",
    ],
    [
        "bild:stadt neu neben bekannt",
        ' "fehler": "ABNAHME ROT [kein bauSatz im Bild: 0.1 % < 2.0 %] · ROT wie an main (bekannt): stadt.leib Sicht verdeckt 4.9 %"',
        1,
        "radeon",
        "ROT",
    ],
    [
        "Ratsche ohne Schlüssel",
        ' "abnahme": "ABNAHME BEKANNT · ROT wie an main (bekannt): Sicht verdeckt 4.9 %"',
        0,
        "radeon",
        "ROT",
    ],
    // z399: der bestandene Fall urteilt an seinem Kopf (OK groß wie ok), der erwartete Fang heißt GEFANGEN — die ROTE Kopf-Zeile bleibt ROT
    [
        "OK-Kopf mit Mutante (mp-sync)",
        "  OK   (d) Selbsttest: die alte Kappe je Frame macht (d) ROT am Gesetz\n  Scharf · roh      GEFANGEN  ROH vorbei",
        0,
        "gtx",
        "GRÜN",
    ],
    ["ROT-Kopf (mp-sync)", "  ROT  (b) Tür: kein Rejoin geplant (enabled=false)", 0, "gtx", "ROT"],
    // GPU-Probe a071dc5e (gate:tier-gang): die Zeilen des Selbsttests tragen ihr Etikett, ihr ❌ ist das Soll — das Urteil des
    // Selbsttests steht ohne Etikett und reißt, Exit ≠ 0 reißt
    ["tier-gang a071dc5e: Etikett-❌ im Selbsttest", ETIKETT_LOG, 0, "gtx", "GRÜN"],
    [
        "tier-gang: Selbsttest vakuös",
        ETIKETT_LOG.replace(/✅ SELBST-TEST GRÜN[^\n]*/, "❌ SELBST-TEST ROT — gang ist vakuös."),
        0,
        "gtx",
        "ROT",
    ],
    ["tier-gang: Etikett-Zeilen bei Exit 1", ETIKETT_LOG.replace(/\n[^\n]*$/, ""), 1, "gtx", "ROT"],
];
// Klinge 9, DIE STATION (stationsUrteil): je [Name, Log der Maschine, Exit, Urteil] an den Sprossen a.b#1 und a.b#2 — GRÜN nur, wenn
// JEDE ihre GRÜN-Zeile trägt (ihre Zahl darf „ROT“ als Maß nennen) und sonst nichts ROT ist; OFFEN (ungemessen) und eine fehlende
// Zeile sind ROT beim Namen
const STATION_IDS = ["karte2.a.b#1", "karte2.a.b#2"];
const STATION_KOPF = "Punkte-Maschine: 2 Station(en) in 1 Läufen auf gtx am 0123abcd · Sitzung";
// je [Name, Log, Exit, Urteil, was der Grund nennt]
const STATION_FAELLE = [
    ["beide GRÜN, die Zahl nennt ROT als Maß", `${STATION_KOPF}\n  GRÜN karte2.a.b#1 · 3 von 3 · Sitzung · Exit 0 · 1.2 min\n  GRÜN karte2.a.b#2 · ROT-Anteil 0.0 % · Sitzung · Exit 0 · 0.9 min`, 0, "GRÜN", /^GRÜN karte2\.a\.b#1 \(3 von 3\) · GRÜN karte2\.a\.b#2 /], // prettier-ignore
    ["eine OFFEN", `${STATION_KOPF}\n  GRÜN karte2.a.b#1 · 3 von 3 · Sitzung · Exit 0 · 1.2 min\n  OFFEN karte2.a.b#2 · GPU-Schloss blockiert · Sitzung · ungemessen, \`run --offen\` misst neu`, 0, "ROT", /OFFEN karte2\.a\.b#2 \(GPU-Schloss blockiert\)/], // prettier-ignore
    ["eine ohne Zeile", `${STATION_KOPF}\n  GRÜN karte2.a.b#1 · 3 von 3 · Sitzung · Exit 0 · 1.2 min`, 0, "ROT", /OHNE ZEILE karte2\.a\.b#2/],
    ["eine ROT", `${STATION_KOPF}\n  ROT  karte2.a.b#1 · pop 0.4 % · Sitzung · Exit 1 · 1 min\n  GRÜN karte2.a.b#2 · x · Sitzung · Exit 0 · 1 min`, 1, "ROT", /^ROT karte2\.a\.b#1 \(pop 0\.4 %\)/], // prettier-ignore
    ["beide GRÜN, ein Wurf daneben", `${STATION_KOPF}\n  GRÜN karte2.a.b#1 · x · Sitzung · Exit 0 · 1 min\n  GRÜN karte2.a.b#2 · x · Sitzung · Exit 0 · 1 min\n❌ die Sitzung starb beim Abbau`, 0, "ROT", /^❌ die Sitzung starb beim Abbau — GRÜN karte2\.a\.b#1/], // prettier-ignore
    ["beide GRÜN, Exit 1", `${STATION_KOPF}\n  GRÜN karte2.a.b#1 · x · Sitzung · Exit 0 · 1 min\n  GRÜN karte2.a.b#2 · x · Sitzung · Exit 0 · 1 min`, 1, "ROT", /^Exit 1 ohne ROTE Zeile/], // prettier-ignore
    ["die Maschine kam nicht an", "ROT: der Ref pm-x ist nicht holbar", 1, "ROT", /^ROT: der Ref pm-x ist nicht holbar — OHNE ZEILE karte2\.a\.b#1 · OHNE ZEILE karte2\.a\.b#2$/], // prettier-ignore
];
function stationsFall(U) {
    if (typeof U.stationsUrteil !== "function") return ["Klinge 9: der Leser kennt die Station nicht (stationsUrteil)"];
    const v = [];
    for (const [name, text, rc, soll, nennt] of STATION_FAELLE) {
        const r = U.stationsUrteil({ text, rc, ids: STATION_IDS });
        if (r.u !== soll || !nennt.test(r.grund))
            v.push(`Klinge 9: Station „${name}“ → ${r.u} (${String(r.grund).slice(0, 160)}) statt ${soll} mit ${nennt}`);
    }
    return v;
}
// je Leser (der echte, im Selbsttest die Mutante): der Fall a071dc5e urteilt GRÜN — sonst steht die Wolf-Zeile als Grund
function etikettFall(U) {
    const r = U.probeUrteil({ text: ETIKETT_LOG, rc: 0 });
    return r.u === "GRÜN"
        ? []
        : [`Klinge 9: die Etikett-Zeile des Selbsttests urteilt → ${r.u} (${r.grund.slice(0, 160)})`];
}
function urteilFaelle() {
    const U = require("./lib/urteil-zeile.cjs");
    const v = [];
    for (const [name, text, rc, , soll] of URTEIL_FAELLE) {
        const r = U.probeUrteil({ text, rc });
        if (r.u !== soll || (soll !== "GRÜN" && !r.grund))
            v.push(`Klinge 9: ${name} → ${r.u} (${r.grund}) statt ${soll}`);
    }
    if (U.probeUrteil({ text: "lod.K1#1 ROT", rc: 0 }).u !== "ROT")
        v.push("Klinge 9: die ROTE Zeile einer Station gilt als bekannt");
    // der Aufruf, den gpu-probe.yml fährt (w28-tor-bruch c7d0aad4 strich den CLI-Block: der Leser schwieg, jede Probe wäre ROT
    // „antwortete nicht“): ein Log mit ❌ → `ROT\t…`, die Meldung des Maßes allein → `GRÜN\t`
    const cli = (z, ...mehr) => {
        const f = require("path").join(require("os").tmpdir(), `urteil-cli-${process.pid}.log`);
        require("fs").writeFileSync(f, z);
        const o = require("child_process").spawnSync(process.execPath, [require.resolve("./lib/urteil-zeile.cjs"), "--log", f, "--rc", "0", ...mehr], { encoding: "utf8" }).stdout; // prettier-ignore
        require("fs").rmSync(f, { force: true });
        return o;
    };
    if (!/^ROT\t/.test(cli("  ❌ Q kaputt\n")) || !/^GRÜN\t/.test(cli("  MELDET Maß 1 am Lande-Tor — ZEIT ROT x\n")))
        v.push("Klinge 9: der CLI-Leser (node scripts/lib/urteil-zeile.cjs --log …) antwortet nicht `<U>\\t<grund>`");
    v.push(...stationsFall(U));
    // der Aufruf der Station (gpu-probe.yml `--stationen "$SID"`): beide GRÜN → GRÜN, eine OFFEN → ROT
    const sCli = (z) => cli(z, "--stationen", STATION_IDS.join(","));
    if (!/^GRÜN\t/.test(sCli(STATION_FAELLE[0][1])) || !/^ROT\t.*OFFEN karte2\.a\.b#2/.test(sCli(STATION_FAELLE[1][1])))
        v.push("Klinge 9: der CLI-Leser urteilt die Station nicht je Sprosse (--stationen)");
    // die Wache am Prozess-Ende: ❌ bei Exit 0 wird 1, ohne ROTE Zeile bleibt 0, im Selbsttest wacht sie nicht
    const w = (z, ...a) =>
        require("child_process").spawnSync(process.execPath, [
            "-e",
            `require(${JSON.stringify(require.resolve("./lib/urteil-zeile.cjs"))}).wache(); console.log(${JSON.stringify(z)}); process.exit(0)`,
            "--",
            ...a,
        ]).status;
    if (w("❌ zwei Zeilen ROT") !== 1 || w("GRÜN 3 von 3") !== 0 || w("❌ Mutante", "--selftest") !== 0)
        v.push("Klinge 9: die Urteils-Wache macht aus ❌ bei Exit 0 kein ROT");
    // die Ratsche des Orts hat geurteilt: ihre Zeile bleibt Exit 0 (GPU-Probe 00d6624d: die Wache der Werkbank machte daraus Exit 1), ein ROT daneben nicht
    if (w('"abnahme": "ABNAHME BEKANNT · ROT wie an main (bekannt): stadt.leib Sicht 3.6 %"') !== 0 || w('"fehler": "ABNAHME ROT [x] · ROT wie an main (bekannt): stadt.leib"') !== 1) v.push("Klinge 9: die Wache liest die Ratsche des Orts falsch"); // prettier-ignore
    // eine Linse, die ein ROTES Urteil druckt, steht unter der Wache (welt-boot lädt sie, sonst urteil-zeile selbst)
    if (
        !wacheLuecken({ "x.cjs": 'console.log("❌ " + f);\nprocess.exit(0);' }).length ||
        wacheLuecken({ "x.cjs": 'require("./lib/welt-boot.cjs");\nconsole.log("❌")' }).length
    )
        v.push("Klinge 9: die Linse ohne Wache bleibt ungenannt");
    return v;
}
// je Linse in scripts/ (Name → Text): die ROT/❌ druckt, ohne die Wache zu laden
function wacheLuecken(texte) {
    return Object.entries(texte)
        .filter(
            ([, t]) =>
                /❌|⛔|"[^"\n]*\bROT\b/.test(stripComments(t)) &&
                !/require\("\.\/lib\/(?:welt-boot|urteil-zeile)\.cjs"\)/.test(t)
        )
        .map(
            ([n]) => `Klinge 9: ${n} druckt ROT/❌ ohne die Urteils-Wache — require("./lib/urteil-zeile.cjs").wache()`
        );
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
    // Klinge 5, zweite Schneide: der Save vor dem Reload nach der Uhr (gate:nervensystem bis abdruck-am-takt), ein
    // `waitForTimeout` und die Grenze 1 s fallen mit Datei:Zeile; unter 1 s, eine gerechnete Dauer, ein Rennen ohne `await`, ein
    // Kommentar und eine Zeichenkette schweigen; in der Tafel schweigt genau ihre Zahl, eine Stelle mehr nennt jede der Datei.
    const schlaf = (q, rest = {}) => scanSchlaf([{ name: "probe.cjs", src: q }], rest);
    const schlafRot = [
        "r.saveState();\nawait sleep(1500);\nawait page.reload();\n",
        "await page.waitForTimeout(2_000);\n",
        "await warte(1000);\n",
    ];
    for (const q of schlafRot) {
        const e = schlaf(q).errs;
        if (e.length !== 1 || !/^probe\.cjs:\d+ schläft fest \d+ ms/.test(e[0])) fails.push(`Klinge 5 nennt den festen Schlaf nicht: ${q}`);
    }
    const schlafStill = [
        "await sleep(999);\n",
        "await sleep(sek * 1000);\n",
        "const wort = await Promise.race([frage, sleep(15000)]);\n",
        "// await sleep(1500);\nconst a = 1;\n",
        "const probe = 'await sleep(1500);';\n",
    ];
    for (const q of schlafStill) if (schlaf(q).errs.length) fails.push(`Klinge 5 feuert ohne festen Schlaf: ${q}`);
    const tafel = { "probe.cjs": [1, "Probe"] };
    if (schlaf(schlafRot[0], tafel).errs.length) fails.push("Klinge 5 feuert an einer Stelle der Tafel SCHLAF_REST");
    if (schlaf(schlafRot[0] + schlafRot[2], tafel).errs.length !== 2) fails.push("Klinge 5 nennt die Stelle über der Tafel nicht");
    if (schlaf("const a = 1;\n", tafel).unter.join() !== "probe.cjs 0 < 1") fails.push("Klinge 5 meldet die gesunkene Zahl der Tafel nicht");
    // Klinge 6: der Schneider von gate:vehicle-drive bis D2-N1 und ein `case "{"` fallen mit Datei:Zeile; der EINE Schneider,
    // ein JSON-Text, ein Kommentar und dieselbe Probe im freien Schneider schweigen.
    const schneiderRot = [
        [
            5,
            'function fnBody(src, re) {\n    const m = re.exec(src);\n    let d = 0;\n    for (let i = src.indexOf("{", m.index); ; i++)\n        if (src[i] === "{") d++;\n}\n',
        ],
        [2, 'for (const c of s) switch (c) {\n    case "{": t++;\n}\n'],
    ];
    for (const [zeile, q] of schneiderRot) {
        const e = eigenerSchneider("probe.cjs", q);
        if (e.length !== 1 || !e[0].startsWith(`probe.cjs:${zeile} zählt Klammern selbst`))
            fails.push(`Klinge 6 nennt den Schneider nicht: ${q}`);
    }
    for (const [datei, q] of [
        [
            "probe.cjs",
            'const b = stammLib.rumpf(src, "_x");\nconst ok = r.data === \'{"x":7}\';\n// if (c === "{") d++;\n',
        ],
        ["scripts/lib/stamm.cjs", schneiderRot[0][1]],
    ])
        if (eigenerSchneider(datei, q).length) fails.push(`Klinge 6 feuert ohne eigenen Schneider: ${datei} ${q}`);
    // Klinge 6, zweite Schneide: der Täter von gate:werkstatt-weg, ein indexOf am kommentarfreien Stamm, ein Bruch-Helfer, ein
    // exec und eine Patch-Tafel fallen mit Datei:Zeile; die Engstelle, includes, ein Startpunkt, ein /g-Muster, ein Kopf am
    // Namen, ein fremder Text, ein überschatteter Name, ein Kommentar und die freie Engstelle selbst schweigen.
    const L = 'const stammLib = require("./lib/stamm.cjs");\n';
    const ersterRot = [
        [3, L + 'const quelle = stammLib.text(root);\nconst b = quelle.replace(\'this._bauSame("fraktal")\', "x");\n'],
        [
            3,
            'const S = require("../lib/stamm.cjs");\nconst nc = S.ohneKommentare(S.text(r));\nconst i = nc.indexOf("x");\n',
        ],
        [2, L + "const bruch = (q, alt, neu) => q.replace(alt, neu);\nbruch(stammLib.text(r), 'a', 'b');\n"],
        [2, L + "const m = /V = (\\d+);/.exec(stammLib.text(r));\n"],
        [
            3,
            'const { text } = require("./lib/stamm.cjs");\nlet t = text(r);\nfor (const [a, b] of tafel) t = t.replace(a, b);\n',
        ],
    ];
    for (const [zeile, q] of ersterRot) {
        const e = ersterTreffer("probe.cjs", q);
        if (e.length !== 1 || !e[0].startsWith(`probe.cjs:${zeile} `))
            fails.push(`Klinge 6 nennt den ersten Treffer nicht: ${q}`);
    }
    const ersterStill =
        L +
        "const quelle = stammLib.text(root);\nstammLib.ersetze(quelle, \"chatDslPatterns\", 'x', 'y');\nstammLib.treffer(quelle, null, /V/);\n" +
        'quelle.includes("x");\nquelle.indexOf("x", 9);\nquelle.replace(/x/g, "");\nquelle.indexOf(`\\n    ${name}(`);\n' +
        'ausDatei(p).replace("x", "y");\nfunction f(src) {\n    return src.replace("x", "y");\n}\n' +
        '{\n    const quelle = ausDatei(p);\n    quelle.replace("x", "y");\n}\n// quelle.replace("x", "y");\n';
    for (const [datei, q] of [
        ["probe.cjs", ersterStill],
        ["scripts/lib/stamm.cjs", ersterRot[0][1]],
    ])
        if (ersterTreffer(datei, q).length)
            fails.push(`Klinge 6 nennt einen ersten Treffer ohne Täter: ${datei} ${ersterTreffer(datei, q)}`);
    // Klinge 7: die echte gpu-probe.yml hält das Gesetz (ihr Einlass beantwortet jeden Ruf), und je Mutante — pull_request, die
    // Message im Text von run, ein Läufer außerhalb der Matrix, eine Matrix neben dem Einlass, ein Einlass, der alles durchlässt,
    // einer, der zeit: auf den Probe-Läufer schickt — fällt sie beim Namen.
    taeterFaelle(
        [
            ["pull_request", ["on.pull_request=", 0], /pull_request/],
            ["Injektion", ["jobs.probe.steps.1.run=", "echo ${{ github.event.head_commit.message }}"], /Injektion/],
            ["runs-on", ["jobs.probe.runs-on=", "self-hosted"], /runs-on/],
            ["Matrix", ["jobs.probe.strategy"], /runs-on/],
            [
                "curl",
                ["jobs.einlass.steps.1.env.EINLASS_JS=", "console.log(`plan=${process.env.KOPF_NACHRICHT}`)"],
                /curl/,
            ],
            // die GL-Wand (22.11., z662): der Einlass bis dahin — das Bein gpu-probe fährt nur die Proben des Rufs
            ["ohne GL-Wand", (z) => { const e = z.jobs.einlass.steps.at(-1).env; e.EINLASS_JS = e.EINLASS_JS.replace("aufProbe.push(GL)", "0"); }, /Einlass \[gpu-probe: zeit:gate:ego-schatten, bild:wiese@0\.3, gate:apparat\] → matrix=/], // prettier-ignore
            // der Deckel je Probe (kreatur-takt, 24.11.): der Einlass bis dahin — jedes Tor fuhr, auch eines, das kein Deckel hält
            ["Einlass ohne Deckel", (z) => { const e = z.jobs.einlass.steps.at(-1).env; e.EINLASS_JS = e.EINLASS_JS.replace("cloud[s[1]]?.s > deckel", "false"); }, /Einlass \[gpu-probe: gate:kreatur-takt\] → m/], // prettier-ignore
            ["Deckel als Zahl im Bein", (z) => { const s = z.jobs.probe.steps.find((x) => /^Proben/.test(x.name)); s.run = s.run.replace("DECKEL=$PROBE_DECKEL_S", "DECKEL=480"); }, /Deckel: das Bein/], // prettier-ignore
            // der Vorfahrt-Blick (24.11.): der Stand bis dahin — ein 502 stand auf stdout und gab nach; dazu ein Blick ohne Geduld,
            // ein Lauf, der den gelesenen Fall überhört, und ein Kopf, der den gescheiterten Blick verschweigt
            ["Blick gibt bei 502 nach", (z) => { const s = z.jobs.probe.steps.find((x) => /^Proben/.test(x.name)); s.run = mutiert(s.run, "console.error(`Vorfahrt-Blick gescheitert", "console.log(`Vorfahrt-Blick gescheitert"); }, /Vorfahrt-Blick „Blick wirft 502“: stdout .* ein gescheiterter Blick gibt nach/], // prettier-ignore
            ["Blick ohne Geduld", (z) => { const s = z.jobs.probe.steps.find((x) => /^Proben/.test(x.name)); s.run = mutiert(s.run, "for (let n = 0; n <= 3; n++)", "for (let n = 0; n <= 0; n++)"); }, /Vorfahrt-Blick „Blick wirft 502“: 1 Rufe statt 4/], // prettier-ignore
            ["Lauf überhört die Vorfahrt", (z) => { const s = z.jobs.probe.steps.find((x) => /^Proben/.test(x.name)); s.run = mutiert(s.run, '[ -n "$v" ] && GRUND="NACHGEGEBEN: $v"', ":"); }, /Vorfahrt-Lauf „echt-Job wartet“/], // prettier-ignore
            ["Kopf verschweigt den Blick", (z) => { const s = z.jobs.probe.steps.find((x) => /^Proben/.test(x.name)); s.run = mutiert(s.run, "${BL:+ — $BL}", ""); }, /Vorfahrt-Blick: Kopf oder Post nennen/], // prettier-ignore
            // Klinge 9: die alte Zeile bis w28-probe-urteil — der Exit allein urteilt, der Kopf ohne Grund, kein BEKANNT im Post
            ["Exit allein", (z) => { const s = z.jobs.probe.steps.find((x) => /^Proben/.test(x.name)); s.run = s.run.replace(/UG=\$\(node scripts\/lib\/urteil-zeile[\s\S]*?esac\n/, 'elif [ "$RC" = 0 ]; then U=GRÜN; else U=ROT; fi\n'); }, /Klinge 9: der Kopf der Probe urteilt am Exit allein/], // prettier-ignore
            ["Kopf ohne Grund", (z) => { const s = z.jobs.probe.steps.find((x) => /^Proben/.test(x.name)); s.run = mutiert(s.run, /\$\{GRUND:\+ — \$\{GRUND:0:\$GL\}\}/, ""); }, /Klinge 9: der Kopf nennt den Grund/], // prettier-ignore
            ["bekannt still", (z) => { const s = z.jobs.post.steps.find((x) => /^Post/.test(x.name || "")); s.run = s.run.replace(/ROT wie an main \(bekannt\): \$BEK/, ""); }, /Klinge 9: das BEKANNTE ROT/], // prettier-ignore
            // der Versuch: der Stand bis 20.11. — EIN Name je Bein über alle Versuche, der Post am festen Ordner
            ["Artefakt ohne Versuch", (z) => { z.jobs.probe.steps.find((x) => /upload-artifact/.test(x.uses || "")).with.name = "probe-${{ matrix.label }}"; }, /Versuch: das Artefakt/], // prettier-ignore
            ["Post am festen Ordner", (z) => { const s = z.jobs.post.steps.find((x) => /^Post/.test(x.name || "")); s.run = s.run.replace(/D=\$\(ls -d [^\n]*\n/, 'D="probe/probe-$L"\n'); }, /Versuch: der Post/], // prettier-ignore
            // DER STEMPEL ERBT (stempel-erbt-probe): je Bedingung des Erbes eine Mutante des Richters scripts/ci-kopf.cjs (im
            // require-Cache des Kinds) oder des Einlasses — jede fällt an ihrem Fall
            ["Erbe ohne Baum-Vergleich", kopfMutante("e.tree.sha !== c.tree.sha", "false"), /Erbe \(2\) Commit mit Inhalt/],
            ["Erbe über den Merge", kopfMutante("parents.length === 1", "parents.length >= 1"), /Erbe \(3\) Merge/],
            ["Erbe ohne Schluss des Laufs", kopfMutante('l.conclusion === "success"', "true"), /Erbe \(4\) Elter-Lauf rot/],
            ["Erbe, solange nichts rot ist", kopfMutante('l.status === "completed" && l.conclusion === "success"', 'l.conclusion !== "failure"'), /Erbe \(5\) Elter-Lauf läuft noch/], // prettier-ignore
            ["Erbe ohne Ruf-Vergleich", kopfMutante("proben.filter((p) => !ruf.includes(p))", "[]"), /Erbe \(6\) der Ruf nennt/],
            ["Erbe nur vom nächsten Elter", kopfMutante("kette.slice(1)", "kette.slice(1, 2)"), /Erbe \(7\) zwei leere Commits/],
            ["Erbe still bei Fehler der API", (z) => { const e = z.jobs.einlass.steps.at(-1).env; e.EINLASS_JS = mutiert(e.EINLASS_JS, /console\.error\(`❌ Einlass[^\n]*\n\s*process\.exitCode = 1;/, "aus(`matrix=${JSON.stringify({ include: arten })}`);"); }, /Erbe \(8\) Fehler der API/], // prettier-ignore
            ["Einlass ohne Erbe (der Stand bis stempel-erbt-probe)", (z) => { const e = z.jobs.einlass.steps.at(-1).env; e.EINLASS_JS = mutiert(e.EINLASS_JS, "if (u.erbt) {", "if (false) {"); }, /Erbe \(1\) leer über grünem Elter/], // prettier-ignore
            ["Einlass ohne Recht auf die Läufe", ["jobs.einlass.permissions"], /Erbe: der Einlass liest keine Läufe/],
            ["Post ohne Erbe", (z) => { const s = z.jobs.post.steps.find((x) => /^Post/.test(x.name || "")); s.run = mutiert(s.run, 'if [ -n "$GEERBT" ]; then', "if false; then"); }, /Erbe: der Post schreibt/], // prettier-ignore
            // DIE STATION (Umsatz 24.11.): auf dem Probe-Bein, ohne die Karte am Ref, ohne die Grenze des Deckels, ein Durchreicher ohne
            // Blick auf den Halter, ein Urteil am Exit statt je Sprosse, ein Deckel ohne die Sprossen
            ["Station auf dem Probe-Bein", (z) => { const e = z.jobs.einlass.steps.at(-1).env; e.EINLASS_JS = mutiert(e.EINLASS_JS, '(p) => p.startsWith("zeit:") || p.startsWith("station:")', '(p) => p.startsWith("zeit:")'); }, /Einlass \[gpu-probe: station:karte2\.mensch\.geist\.gespraech#2, bild:wiese\] → matrix=/], // prettier-ignore
            ["Station ohne Karte", (z) => { const e = z.jobs.einlass.steps.at(-1).env; e.EINLASS_JS = mutiert(e.EINLASS_JS, "const fremd = ids.find((id) => !karte.has(id));", "const fremd = null;"); }, /Einlass \[gpu-probe: station:karte2\.mensch\.geist\.gespraech#9\] → matrix=/], // prettier-ignore
            ["Station ohne Grenze", (z) => { const e = z.jobs.einlass.steps.at(-1).env; e.EINLASS_JS = mutiert(e.EINLASS_JS, "ids.length > sMax", "false"); }, /Einlass \[gpu-probe: station:karte2\.planet\.wasser\.eis#1\+karte2\.planet\.wasser\.eis#2\+[^\]]*#7\] → matrix=/], // prettier-ignore
            ["Durchreicher ohne Halter", (z) => { const s = z.jobs.probe.steps.find((x) => /^Proben/.test(x.name)); s.env.DURCH_SH = mutiert(s.env.DURCH_SH, '[ "$w" != "$GPU_LAUF_ICH" ]', "false"); }, /Durchreicher „ein anderer hält es“/], // prettier-ignore
            ["Station am Exit", (z) => { const s = z.jobs.probe.steps.find((x) => /^Proben/.test(x.name)); s.run = mutiert(s.run, '${SID:+ --stationen "$SID"}', ""); }, /Station: das Urteil der Station liest nicht je Sprosse/], // prettier-ignore
            ["Station am Deckel der Probe", (z) => { const s = z.jobs.probe.steps.find((x) => /^Proben/.test(x.name)); s.run = mutiert(s.run, "DECKEL=$((STATION_GRUND_S + STATION_JE_S * k))", ":"); }, /Station: das Bein fährt station: nicht am Deckel/], // prettier-ignore
        ],
        probeGesetz,
        { fehler: fails, gruen: require("js-yaml").load(ausDatei(PROBE_DATEI)) }
    );
    // Klinge 8: der Leser von haar.K5 und vegetation.K1 bis w27-gpu-wahl-heil (die Liste der Wahl am Rohen) fällt mit Datei:Zeile, die
    // EINE Puffer-Lesung, ein Kommentar, ein Text und die Lesung selbst schweigen; die Lesung nennt Leser und Puffer (die Karte je Kamera)
    const roh = "\nr.getArrayBufferAsync(q.liste); // r.getArrayBufferAsync(q)";
    const e8 = parameterAnker("probe.cjs", roh, stammFake);
    let wort = "";
    try {
        pufferLesen(new Map(), "z", { backend: { has: () => false } });
    } catch (e) {
        wort = e.message;
    }
    if (
        !/^probe\.cjs:2 liest am Rohen/.test(e8) ||
        e8.length !== 1 ||
        parameterAnker(LESUNG_FREI, roh, stammFake).length ||
        !/\(z\): Map /.test(wort)
    )
        // prettier-ignore
        fails.push("Klinge 8 nennt den rohen Leser oder den Puffer nicht");
    fails.push(...urteilFaelle());
    // Klinge 9, die Mutante des Lesers: `istRotZeile` ohne die Etikett-Ausnahme (der Stand bis a071dc5e) macht den Fall ROT beim Namen
    const lesPfad = require.resolve("./lib/urteil-zeile.cjs");
    const lesQ = ausDatei(lesPfad);
    const ohneEtikett = lesQ.replace(" && !/^\\s*\\[Selbsttest\\]/.test(s)", "");
    const mutante = new module.constructor(lesPfad);
    if (ohneEtikett !== lesQ) mutante._compile(ohneEtikett, lesPfad);
    const mRot = ohneEtikett !== lesQ ? etikettFall(mutante.exports) : [];
    if (mRot.length !== 1 || !/Gangart Welt wolf \(Mond\)/.test(mRot[0]) || etikettFall(require(lesPfad)).length)
        fails.push(
            `Klinge 9: die Mutante ohne die Etikett-Ausnahme bleibt GRÜN oder ungenannt (${mRot.join(" · ") || "Anker fehlt"})`
        );
    else console.log(`  ✅ Selbsttest „ohne Etikett-Ausnahme" → rot: ${mRot[0]}`);
    // Klinge 9, die Mutante der Station: OFFEN zählt wie GRÜN (ungemessen als Vorurteil) — der Fall „eine OFFEN“ nennt sie beim Namen
    const offenGruen = lesQ.replace('ids.every((id) => je.get(id)?.u === "GRÜN")', 'ids.every((id) => je.get(id)?.u !== "ROT")');
    const sMutante = new module.constructor(lesPfad);
    if (offenGruen !== lesQ) sMutante._compile(offenGruen, lesPfad);
    const sRot = offenGruen !== lesQ ? stationsFall(sMutante.exports) : [];
    if (sRot.length !== 2 || !sRot.some((z) => /Station „eine OFFEN“ → GRÜN/.test(z)) || stationsFall(require(lesPfad)).length)
        fails.push(`Klinge 9: die Mutante „OFFEN wie GRÜN“ bleibt GRÜN oder ungenannt (${sRot.join(" · ") || "Anker fehlt"})`);
    else console.log(`  ✅ Selbsttest „OFFEN wie GRÜN" → rot: ${sRot[0]}`);
    urteilEnde(fails.length, "❌ SELBST-TEST: " + fails.join(" · "), "✅ SELBST-TEST: alle neun Klingen feuern");
}

function main() {
    if (SELBSTTEST) selftest();
    const root = path.join(__dirname, "..");
    const richter = [
        "playtest.cjs",
        ...fs.readdirSync(path.join(root, "scripts", "playtest")).map((f) => "playtest/" + f),
    ];
    const playtestSrc = richter.map((f) => ausDatei(path.join(root, "scripts", f))).join("\n");
    const stammSrc = stammLib.text(root);
    const ratchet = scanRatchet(playtestSrc);
    const anker = scanAnker(playtestSrc, stammSrc);
    const dateien = linsenDateien(root);
    const param = scanParameterAnker(dateien, stammSrc);
    const tasten = scanTasten(dateien);
    const schlaf = scanSchlaf(dateien);
    const probe = probeGesetz(require("js-yaml").load(ausDatei(PROBE_DATEI))).map((e) => `${PROBE_DATEI}: ${e}`);
    const linsen = Object.fromEntries(
        fs
            .readdirSync(path.join(root, "scripts"))
            .filter((f) => f.endsWith(".cjs"))
            .map((f) => ["scripts/" + f, ausDatei(path.join(root, "scripts", f))])
    );
    const errs = ratchet.errs.concat(anker.errs, param.errs, tasten.errs, schlaf.errs, probe, urteilFaelle(), wacheLuecken(linsen));
    // die EINE rote Liste (welt-boot rotListe) statt einer eigenen Schleife daneben
    rotListe(errs);
    if (ratchet.nT < FROZEN_TYPEOF)
        console.log(
            `ℹ️  Der typeof-Bestand sank (${ratchet.nT} < ${FROZEN_TYPEOF}) — FROZEN_TYPEOF nachziehen (der Ratchet darf enger).`
        );
    if (schlaf.unter.length)
        console.log(`ℹ️  Der Bestand fester Schlafe sank (${schlaf.unter.join(" · ")}) — SCHLAF_REST nachziehen (die Tafel darf enger).`);
    // der Grün-Satz nennt die Zahlen: typeof-Existenz-Proben gegen den Ratchet (nur sinkend), Anker auf lebendem Stamm-Code
    // (__consumes + __anker installiert), Linsen ohne Parameter-Anker, Kopf-Muster, Taste nach der Wanduhr, eigenen Schneider und
    // ersten Treffer im ganzen Stamm, die festen Schlafe ab 1 s gegen ihre Tafel (nur sinkend), die Rufe am Einlass der GPU-Probe
    const schlafTafel = Object.values(SCHLAF_REST).reduce((a, [n]) => a + n, 0);
    console.log(
        `✅ DIE APPARAT-LINSE steht — typeof ${ratchet.nT}/${FROZEN_TYPEOF} · ${anker.entries.length} Anker · ${param.n} Linsen sauber (0 von ${tasten.n}) · feste Schlafe ab 1 s ${schlaf.n} von ${schlafTafel} der Tafel · GPU-Probe ${PROBE_RUFE.length} Rufe + ${ERB_FAELLE.length} Erb-Fälle · ${URTEIL_FAELLE.length} Urteils-Fälle · ${Object.keys(linsen).length} Linsen unter der Urteils-Wache`
    );
}

main();
