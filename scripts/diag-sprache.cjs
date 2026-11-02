#!/usr/bin/env node
// ============================================================================
// DIE SPRACH-WAND — gate:sprache (spielgang.K5 „Die Welt spricht die Sprache des Spielers“)
//
// Jede UI-Zeile liest EINE Quelle: die Tafel `AnazhRealm.TEXTE` (stamm/daten.js, je Schlüssel eine Spalte je Sprache — ihr
// Getter hält das Gesetz der Zeile selbst: Schlüssel-Form, jede Sprache, dieselben Werte) über den EINEN Leser `_t`
// (stamm/dienst.js); index.html trägt nur Schlüssel (`data-t`, `data-t-<attribut>`), `_sprachDom` füllt sie beim Boot. ROT
// beim Namen (Datei:Zeile und der Text), wenn
//   T) der Getter der Tafel wirft (die Tafel lädt über den Stamm, `stammLib.ladeKlasse`);
//   C) eine UI-Senke im Code des Stamms (ohne Kommentare, der EINE Stripper) ein Literal mit Wort-Text trägt — die Senken der
//      Station (`.textContent/.innerText/.innerHTML/.title/.placeholder =`, `_hudSchreib(`, `_chatEcho(`, `alert(`, `confirm(`,
//      `prompt(`) und dazu der DOM-Bauer `_el(` (ohne seine Daten-Attribute), `append(`, `appendChatOutput(`, `_spielerSagt(`,
//      `_ladeschirmStand(`, `setAttribute("title"|"placeholder"|"aria-label"|"alt", …)`; eine Zuweisung liest über die Zeile
//      hinaus, wenn die nächste sie fortsetzt (`? :`, `+`, `.`, `||`, `&&`);
//   K) ein Schlüssel (ein Literal mit dem Präfix einer Tafel-Zeile, `_t("…")`, `data-t…="…"`) in der Tafel fehlt;
//   U) eine Zeile der Tafel keinen Leser hat (kein Literal, keine Familie `` `präfix.${…}` ``);
//   H) index.html im <body> oder <title> einen Text-Knoten oder ein Attribut (title · placeholder · aria-label · alt) mit
//      Wort-Text trägt.
// Wort-Text heißt, was die Station zählt: nach Abzug von `${…}`, Markup und Entitäten ein Wort aus ≥ 2 Buchstaben UND ein
// Zeichen der Sprache (Großbuchstabe, Umlaut, …!?:); im DOM jedes Wort aus ≥ 2 Buchstaben. Die lebende Hälfte (das DOM nach
// dem Boot) misst die Station spielgang.K5#1 in der Linsen-Sprache `?sprache=pseudo` (jedes Stück der Tafel steht in ⟦ ⟧,
// Wort-Text außerhalb ist hart; `translate="no"` trägt nur Spieler-Inhalt, Befehls-Wörter und das Logbuch).
// Selbst-Test: --selftest injiziert je Klasse einen Täter in eine Kopie und beweist, dass die Wand ihn beim Namen nennt.
// ============================================================================
"use strict";
const { fs, path, stammLib, SELBSTTEST } = require("./lib/welt-boot.cjs");

const ROOT = path.resolve(__dirname, "..");
const LIT = /"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`/g;
const wort = (l) => {
    const t = l.slice(1, -1).replace(/\$\{[^}]*\}|<[^>]*>|&\w+;/g, " ");
    return /[A-Za-zÄÖÜäöüß]{2,}/.test(t) && /[A-ZÄÖÜäöüß…!?:]/.test(t);
};
const SENKE =
    /\.(textContent|innerText|innerHTML|title|placeholder)\s*=(?!=)\s*|\b(_hudSchreib|_chatEcho|alert|confirm|prompt|_el|append|appendChatOutput|_spielerSagt|_ladeschirmStand)\s*\(|\bsetAttribute\(\s*["'](title|placeholder|aria-label|alt)["']\s*,/g;
const DATEN_ATTR = /\b(?:value|class|className|id|type|name|href|src|for|role|key|style)\s*:\s*$/;
const WEITER = /^\s*(?:[?:+.]|\|\||&&)/;
const zeileVon = (t, i) => t.slice(0, i).split("\n").length;

// der Ausdruck hinter der Senke: bis zur schließenden Klammer (Ruf) bzw. zum Ende der Anweisung (Zuweisung)
function ausdruck(code, i, ruf) {
    for (let k = i, tiefe = 0, q = null; k < code.length; k++) {
        const c = code[k];
        if (q) {
            if (c === "\\") k++;
            else if (c === q) q = null;
        } else if ("\"'`".includes(c)) q = c;
        else if ("([{".includes(c)) tiefe++;
        else if (")]}".includes(c) && tiefe-- === 0) return code.slice(i, k);
        else if (!ruf && tiefe === 0 && (c === ";" || (c === "\n" && !WEITER.test(code.slice(k + 1, k + 200)))))
            return code.slice(i, k);
    }
    return code.slice(i);
}

function pruefe({ dateien, html, Z }) {
    const rot = [];
    const genutzt = new Set();
    const familien = new Set();
    const praefix = [...new Set(Object.keys(Z).map((k) => k.split(".")[0]))].join("|") || "ui";
    const SCHLUESSEL = new RegExp(`(["'])((?:${praefix})\\.[a-z0-9][a-z0-9.-]*)\\1`, "g");
    for (const { pfad, text } of dateien) {
        // die Tafel liest sich nie selbst: ihr Block fällt (Zeilen bleiben)
        const [a, e] = [text.indexOf("// SPRACH-ZEILEN AUF"), text.indexOf("// SPRACH-ZEILEN ZU")];
        const ohneTafel = a < 0 ? text : text.slice(0, a) + text.slice(a, e).replace(/[^\n]/g, " ") + text.slice(e);
        const code = stammLib.ohneKommentare(ohneTafel);
        for (const m of code.matchAll(SENKE)) {
            const start = m.index + m[0].length;
            const arg = ausdruck(code, start, !m[1]);
            for (const l of arg.matchAll(LIT))
                if (wort(l[0]) && !(m[2] === "_el" && DATEN_ATTR.test(arg.slice(Math.max(0, l.index - 40), l.index))))
                    rot.push(
                        `C: ${pfad}:${zeileVon(code, start + l.index)} ${m[1] || m[2] || m[3]}: ${l[0].slice(0, 90)}`
                    );
        }
        for (const m of code.matchAll(/`([a-z0-9]+(?:\.[a-z0-9-]+)*\.)\$\{/g)) familien.add(m[1]);
        for (const m of [...code.matchAll(/\b_t\(\s*(["'])([^"']+)\1/g), ...code.matchAll(SCHLUESSEL)]) {
            genutzt.add(m[2]);
            if (!(m[2] in Z))
                rot.push(`K: ${pfad}:${zeileVon(code, m.index)} der Schlüssel „${m[2]}“ fehlt in der Tafel`);
        }
    }
    // index.html: der Inhalt der Roh-Blöcke und die Kommentare fallen (Zeilen und die öffnenden Tags bleiben)
    const leer = (t) => t.replace(/[^\n]/g, " ");
    const ROH = /(<(script|style|textarea)\b[^>]*>)([\s\S]*?)(<\/\2>)|<!--[\s\S]*?-->/g;
    const flach = html.replace(ROH, (s, auf, _n, innen, zu) => (auf ? auf + leer(innen) + zu : leer(s)));
    const body = flach.indexOf("<body");
    const titel = [flach.indexOf("<title"), flach.indexOf("</title>")];
    let vor = 0;
    for (const m of [...flach.matchAll(/<\/?[a-zA-Z][^>]*>/g), { index: flach.length, 0: "" }]) {
        const t = flach.slice(vor, m.index).replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
        if ((vor > body || (vor > titel[0] && vor < titel[1])) && /[A-Za-zÄÖÜäöüß]{2,}/.test(t))
            rot.push(`H: index.html:${zeileVon(flach, vor)} Text-Knoten „${t.slice(0, 80)}“`);
        vor = m.index + m[0].length;
        const attr =
            m.index > body
                ? m[0].matchAll(/\s(title|placeholder|aria-label|alt)="([^"]*[A-Za-zÄÖÜäöüß]{2,}[^"]*)"/g)
                : [];
        for (const x of attr)
            rot.push(`H: index.html:${zeileVon(flach, m.index)} Attribut ${x[1]}="${x[2].slice(0, 60)}"`);
        for (const k of m[0].matchAll(/\sdata-t(?:-[a-z-]+)?="([^"]*)"/g))
            if (k[1] in Z) genutzt.add(k[1]);
            else rot.push(`K: index.html:${zeileVon(flach, m.index)} der Schlüssel „${k[1]}“ fehlt in der Tafel`);
    }
    const inFamilie = (k) => [...familien].some((f) => k.startsWith(f) && k.split(".").length === f.split(".").length);
    for (const k of Object.keys(Z))
        if (!genutzt.has(k) && !inFamilie(k)) rot.push(`U: die Zeile „${k}“ trägt keinen Leser`);
    return rot;
}

// der Baum: die Stamm-Dateien in Lade-Ordnung, index.html, die Tafel über ihren Getter (T: wirft er, ist das der Befund)
function lies(dateien, html) {
    try {
        const { AnazhRealm } = stammLib.ladeKlasse(ROOT, { teile: dateien });
        return { dateien, html, Z: { ...AnazhRealm.TEXTE.de } };
    } catch (e) {
        return { dateien, html, Z: {}, T: `T: die Tafel lädt nicht — ${String(e.message).split("\n")[0]}` };
    }
}
const baum = () =>
    lies(
        stammLib.dateien(ROOT).map((p) => ({ pfad: p, text: fs.readFileSync(path.join(ROOT, p), "utf8") })),
        fs.readFileSync(path.join(ROOT, "index.html"), "utf8")
    );
const befund = (b) => (b.T ? [b.T] : pruefe(b)); // ohne Tafel ist nur T der Befund

if (SELBSTTEST) {
    const echt = baum();
    const basis = new Set(befund(echt));
    const mit = (zeile) => (b) => lies([...b.dateien, { pfad: "stamm/probe.js", text: zeile }], b.html);
    const daten = (alt, neu) => (b) =>
        lies(
            b.dateien.map((d) => (d.pfad === "stamm/daten.js" ? { ...d, text: d.text.replace(alt, neu) } : d)),
            b.html
        );
    const html = (neu) => (b) => lies(b.dateien, b.html.replace("<body", neu));
    const FAELLE = [
        ["hartes textContent", "C", mit('function p(el) { el.textContent = "Hallo Welt"; }')],
        ["mehrzeiliges ? :", "C", mit('function p(el, an) { el.title = an\n    ? "Ein"\n    : "Aus"; }')],
        ["harter Chat", "C", mit("function p(n) { this._chatEcho(`Die Welt hört dich, ${n}!`); }")],
        ["hartes _el", "C", mit('function p() { this._el("button", { text: "Speichern" }); }')],
        ["harter title", "C", mit('function p(el) { el.setAttribute("title", "Schließen"); }')],
        ["fremder Schlüssel", "K", mit('function p(el) { el.textContent = this._t("gibt.es.nicht"); }')],
        ["harter DOM-Text", "H", html("<body><p>Hallo Welt</p")],
        ["hartes Attribut", "H", html('<body><i title="Schließen"></i')],
        ["Zeile ohne Leser", "U", daten("const Z = {\n", 'const Z = {\n"ui.niemand-liest": ["Niemand", "Nobody"],\n')],
        ["Zeile ohne en", "T", daten(/("ui\.[^"]+": \["[^"]*"), "[^"]*"\]/, "$1]")],
        ["Wert nur in de", "T", daten(/("ui\.[^"]+": \["[^"]*)", /, '$1 {n}", ')],
    ];
    let fehl = 0;
    for (const [name, klasse, mut] of FAELLE) {
        const neu = befund(mut(echt)).filter((x) => !basis.has(x));
        const ok = neu.length > 0 && neu.every((x) => x.startsWith(klasse));
        if (!ok) fehl++;
        console.log(`  ${ok ? "ok " : "ROT"} ${name} → ${neu[0] || "keine Meldung"}`);
    }
    console.log(`gate:sprache --selftest: ${fehl ? fehl + " ROT" : `GRÜN (${FAELLE.length} Mutanten beim Namen)`}`);
    process.exit(fehl ? 1 : 0);
}

const b = baum();
const rot = befund(b);
for (const x of rot.slice(0, 60)) console.log("  ROT " + x);
console.log(
    `gate:sprache — Tafel ${Object.keys(b.Z).length} Zeilen, ${b.dateien.length} Stamm-Dateien: ${rot.length ? rot.length + " ROT" : "GRÜN"}`
);
process.exit(rot.length ? 1 : 0);
