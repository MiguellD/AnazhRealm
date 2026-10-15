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
// Dritte Aufgabe (K60-N5): keine Probe in scripts/ hält eine Taste über einen
// Zeitgeber statt bis zu ihrem Ereignis (halteBis, scripts/lib/welt-boot.cjs).
//
// Selbst-Test: --selftest beweist alle drei Klingen (kein vakuöses Grün):
// (1) eine injizierte .toString()-Probe hebt den Zähler über den Ratchet,
//     ein bloßer Kommentar hebt ihn NICHT; (2) ein erfundenes Katalog-Symbol
// feuert die Katalog-Prüfung; (3) der alte Lauf von gate:mp-sync (W 1,6 s nach
// der Uhr) feuert, das Halten bis zum Ereignis und ein bloßer Druck nicht.
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
// `maske`: Kommentare werden Leerzeichen (Zeilenumbrüche bleiben) — Index und Zeile stimmen mit der Quelle überein.
function stripComments(src, maske = false) {
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
                if (maske) out += "  ";
                i += 2;
                continue;
            }
            if (c === "/" && c2 === "*") {
                mode = "block";
                if (maske) out += "  ";
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
            } else if (maske) out += " ";
            i++;
            continue;
        }
        if (mode === "block") {
            if (c === "*" && c2 === "/") {
                mode = "code";
                if (maske) out += "  ";
                i += 2;
                continue;
            }
            if (maske) out += c === "\n" ? c : " ";
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

// K60-N5 — DIE TASTE NACH DER WANDUHR (Klinge 3): eine Probe hält eine Taste über einen Zeitgeber statt bis zu ihrem
// Ereignis. Auf dem CPU-Raster der CI läuft der Spieler in derselben Zeit einen Bruchteil des Wegs (gate:mp-sync (d) LEER:
// „A lief 0.77 m“ nach 1,6 s W, CI 38683406115; die Garage fuhr in 1,8 s 1,1 m/s). Zwischen dem Druck (`keyboard.down`,
// `KeyboardEvent("keydown")`) und dem Loslassen steht kein Zeitgeber — das Halten geht über `halteBis`
// (scripts/lib/welt-boot.cjs), das am Ereignis loslässt. Gelesen wird jede Probe in scripts/ und scripts/lib/.
const TASTE_DRUCK = /\.keyboard\.down\(|KeyboardEvent\(\s*["'`]keydown["'`]/g;
const TASTE_LOS = /\.keyboard\.up\(|KeyboardEvent\(\s*["'`]keyup["'`]/g;
const ZEITGEBER = /\bawait\s+(?:sleep|warte|warten|pause)\s*\(|\.waitForTimeout\s*\(|\bsetTimeout\s*\(/;

// Die Taste eines Drucks bzw. Loslassens: die Zeichenketten des Aufrufs bis zu seiner Klammer („KeyW“ heißt „w“) —
// gehalten ist eine Taste nur, wenn dieselbe später losgelassen wird; ein Druck ohne Loslassen (Enter, Strg+K) hält nichts.
function tastenVon(code, m) {
    const ende = code.indexOf(")", m.index + m[0].length);
    const seg = code.slice(m.index + m[0].length, ende < 0 ? m.index + 200 : ende);
    const tasten = new Set(
        [...seg.matchAll(/["'`]([^"'`\n]{1,24})["'`]/g)].map((t) =>
            (/^Key[A-Z]$/.test(t[1]) ? t[1].slice(3) : t[1]).toLowerCase()
        )
    );
    if (!tasten.size && seg.trim()) tasten.add(seg.trim()); // die Taste als Name (`keyboard.down(taste)`)
    return tasten;
}

function tasteNachWanduhr(src) {
    const code = stripComments(src, true);
    const los = [...code.matchAll(TASTE_LOS)].map((m) => ({ i: m.index, tasten: tastenVon(code, m) }));
    const funde = [];
    for (const m of code.matchAll(TASTE_DRUCK)) {
        const tasten = tastenVon(code, m);
        const ende = los.find((l) => l.i > m.index && [...l.tasten].some((t) => tasten.has(t)));
        if (!ende) continue; // ein Druck, kein Halten
        const fenster = code.slice(m.index, ende.i);
        const z = fenster.match(ZEITGEBER);
        if (z) funde.push({ zeile: code.slice(0, m.index).split("\n").length, zeitgeber: z[0].replace(/\s+/g, " ") });
    }
    return funde;
}

function scanTasten(root) {
    const errs = [];
    const dateien = [];
    for (const dir of ["scripts", path.join("scripts", "lib")])
        for (const f of fs.readdirSync(path.join(root, dir)))
            if (/\.(c|m)?js$/.test(f) && f !== "diag-apparat.cjs") dateien.push(path.join(dir, f));
    for (const rel of dateien)
        for (const f of tasteNachWanduhr(fs.readFileSync(path.join(root, rel), "utf8")))
            errs.push(
                `Taste nach Wanduhr: ${rel.replace(/\\/g, "/")}:${f.zeile} hält die Taste über „${f.zeitgeber}“ statt bis zu ` +
                    `ihrem Ereignis — Täter der Lauf dieser Probe; halteBis (scripts/lib/welt-boot.cjs) lässt am Ereignis los.`
            );
    return { dateien: dateien.length, errs };
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

function selftest() {
    const fails = [];
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
    // Klinge 3: der alte Lauf von gate:mp-sync (W 1,6 s nach der Uhr) und der Druck im Rahmen samt `warte` feuern; das
    // Halten bis zum Ereignis, ein Kommentar und ein Zeitgeber NACH dem Loslassen nicht.
    const sw = (s) => tasteNachWanduhr(s).length;
    if (sw('await pageA.keyboard.down("w");\nawait sleep(1600);\nawait pageA.keyboard.up("w");\n') !== 1)
        fails.push("Klinge 3 feuert nicht am alten Lauf (keyboard.down + sleep)");
    const rahmen =
        'await fr.evaluate(() => window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyW" })));\nawait warte(1600);\n' +
        'await fr.evaluate(() => window.dispatchEvent(new KeyboardEvent("keyup", { code: "KeyW" })));\n';
    if (sw(rahmen) !== 1) fails.push("Klinge 3 feuert nicht am Druck im Rahmen (keydown + warte)");
    if (
        sw(
            'await page.keyboard.down("w");\nawait page.waitForFunction(() => weit(), { polling: 100 });\nawait page.keyboard.up("w");\nawait sleep(800);\n'
        ) !== 0
    )
        fails.push("Klinge 3 feuert am Halten bis zum Ereignis");
    if (sw('// keyboard.down("w"); await sleep(1600); keyboard.up("w")\nconst a = 1;\n') !== 0)
        fails.push("Klinge 3 zählt Kommentare mit");
    if (
        sw(
            'el.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));\nawait sleep(300);\nawait page.keyboard.up("w");\n'
        ) !== 0
    )
        fails.push("Klinge 3 liest einen Druck ohne Loslassen als Halten");
    if (sw("await seite.keyboard.down(taste);\nawait sleep(900);\nawait seite.keyboard.up(taste);\n") !== 1)
        fails.push("Klinge 3 feuert nicht an einer Taste mit Namen");
    if (fails.length) {
        console.log("❌ SELBST-TEST: " + fails.join(" · "));
        process.exit(1);
    }
    console.log(
        "✅ SELBST-TEST: alle drei Klingen feuern (Ratchet + Katalog + Taste nach Wanduhr), Kommentare zählen nicht"
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
    const tasten = scanTasten(root);
    const errs = ratchet.errs.concat(anker.errs, tasten.errs);
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
            `${tasten.dateien} Proben halten keine Taste nach der Wanduhr.`
    );
}

main();
