#!/usr/bin/env node
// ============================================================================
// DIE SPRACH-WAND — gate:sprache (spielgang.K5 „Die Welt spricht die Sprache des Spielers“)
//
// Jede UI-Zeile liest EINE Quelle: die Tafel `AnazhRealm.TEXTE` (stamm/daten.js, je Schlüssel eine Spalte je Sprache — ihr
// Getter hält das Gesetz der Zeile selbst: Schlüssel-Form, jede Sprache, dieselben Werte) über den EINEN Leser `_t`
// (stamm/dienst.js); index.html trägt nur Schlüssel (`data-t`, `data-t-<attribut>`), `_sprachDom` füllt sie beim Boot. ROT
// beim Namen (Datei:Zeile und der Text), wenn
//   T) der Getter der Tafel wirft (die Tafel lädt über den Stamm, `stammLib.ladeKlasse`);
//   C) eine UI-Senke im Code des Stamms (am AST, stammLib.ast) ein Literal mit Wort-Text trägt — die Senken der
//      Station (`.textContent/.innerText/.innerHTML/.title/.placeholder =`, `_hudSchreib(`, `_chatEcho(`, `alert(`, `confirm(`,
//      `prompt(`) und dazu der DOM-Bauer `_el(` (ohne seine Daten-Attribute), `append(`, `appendChatOutput(`, `_spielerSagt(`,
//      `_ladeschirmStand(`, `setAttribute("title"|"placeholder"|"aria-label"|"alt", …)`; die Senke trägt jedes Literal in
//      ihrem Ausdruck, ein Daten-Attribut (`class:`, `value:` …) schweigt;
//   K) ein Schlüssel (ein Literal mit dem Präfix einer Tafel-Zeile, `_t("…")`, `data-t…="…"`) in der Tafel fehlt;
//   U) eine Zeile der Tafel keinen Leser hat (kein Literal, keine Familie `` `präfix.${…}` ``);
//   Z) eine aufgelöste Zeile `_t(…)` an einer Chat-Senke steht (sie wechselt nie mit der Sprache: die Senke nimmt
//      `[schlüssel, werte]`);
//   F) ein Schlüssel einer FAMILIE (`` `präfix.${…}` ``, zur Laufzeit gesetzt) fehlt: je Familie zählt ihre Quelle jede id auf —
//      die Bücher des Manifests (der Kanal get-book im vm: je Rezept `gestalt.<id>`, je Kern `studio.<kern>`, je Art
//      `art.<art>`; ohne Zeile spräche es nur das deutsche Wort seines Buchs, `_buchWort`) und die Befund-Arten der
//      Speicher-Kette (`art:` in `befund`); eine Familie ohne Quelle steht selbst beim Namen.
// DER WERT-TEXT (spielgang.K5#2): ein Satz, den der Spieler als WERT einer Zeile liest, ist selbst eine Senke — die Antwort des
// Chat-Satzes (`describe:`), die Absage eines Gesetzes (`absage:`) und jede Rückgabe eines Satz-Bauers (SATZ: die Tat in Worten,
// der Satz des Ergebnisses, die Stimme des Felds, die Absage, die Hilfe, die Antwort auf das Wetter). Bis w8-sprache sah die Wand
// sie nicht (der Wert reiste als Datum): die KI antwortete im englischen Chat „(World changed: Grok lässt das Wetter …)“.
// Wort-Text: nach Abzug von `${…}`, Markup und Entitäten ein Wort aus ≥ 2 Buchstaben UND ein Zeichen der Sprache
// (Großbuchstabe, Umlaut, …!?:) oder zwei kleine Wörter; ein Bezeichner ist ein Name.
// DIE LEBENDE HÄLFTE ist die Station spielgang.K5#1 (punkte-maschine, stationen/g5.js `sprachLauf`): die Welt am Null-Renderer
// in `?sprache=pseudo`, jedes Wort außerhalb der Marken ⟦ ⟧ ⁨ ⁩ im DOM hart beim Namen seines Erzeugers, der Wechsel am Ort auf en
// (jede Zeile mit ⟦ steht), der Selbsttest im Lauf; den Code zählt sie mit DIESER Wand (`befund(baum())`, per require) — EINE
// Zählung je Hälfte. Bis w5-spielgang-k5 zählte die Station Code und DOM selbst (707 an 5fba36ea); die Wand hier zählte
// index.html statisch (H) — das fiel an die lebende Hälfte, die das DOM nach dem Boot sieht.
// Selbst-Test: --selftest injiziert je Klasse einen Täter in eine Kopie und beweist, dass die Wand ihn beim Namen nennt.
// ============================================================================
"use strict";
const { ausDatei, stammLib, ROOT, SELBSTTEST, selbsttestEnde, wandEnde } = require("./lib/welt-boot.cjs");
const { kanalImVm } = require("./lib/asset-worker-harness.cjs");

// F: die ids jeder Familie aus ihrer Quelle — das Buch der Kerne des Manifests (der Kanal im vm, ~0,2 s)
const { book, stammbaum } = kanalImVm()({ type: "get-book" });
const QUELLE = {
    "gestalt.": Object.keys(book).map((id) => id.replace(/_/g, "-")),
    "studio.": stammbaum.kerne.map((k) => k.kern),
    "art.": stammbaum.kerne.flatMap((k) => Object.keys(k.arten)),
};

const wort = (t) => {
    t = String(t)
        .replace(/<[^>]*>|&\w+;/g, " ")
        .trim();
    const satz = /[A-ZÄÖÜäöüß…!?:]/.test(t) || /[a-zäöüß]{2,}[\s(),↔·–—/]+\S*[a-zäöüß]{2,}/.test(t);
    return /[A-Za-zÄÖÜäöüß]{2,}/.test(t) && satz && !/^[a-z]+[A-Z]\w*$/.test(t) && !/^[a-z][\w.:/-]*$/.test(t);
};
const SENKE_RUF =
    /^(_hudSchreib|_chatEcho|alert|confirm|prompt|_el|append|appendChatOutput|_spielerSagt|_ladeschirmStand|journalAppend|journalAppendOnce)$/;
const SENKE_FELD = /^(textContent|innerText|innerHTML|title|placeholder)$/;
const SENKE_ATTR = /^(title|placeholder|aria-label|alt)$/;
const ETIKETT = /^(label|hint|lab|titel|title|tip|desc|description|beschreibung|text|name|describe|absage)$/;
const SATZ =
    /^(describeProgram|_describeDslPosition|_describeDslCondition|_dslDescriptionTable|_describeCreatureTaskArg|_ergebnisSatz|_feldStimmeZeile|_tatSchreiber|_studioSatzAbsage|_regelAusSatz|_hilfeZeilen|_dslAbsageSatz|_wetterWarum|_wetterSchreiberZeile)$/;
const DATEN_ATTR = /^(value|class|className|klasse|sprecherKlasse|id|type|name|href|src|for|role|key|style)$/;
const CHAT = /^(_chatEcho|appendChatOutput|_spielerSagt)$/;
const nameVon = (c) =>
    c.type === "MemberExpression" ? !c.computed && c.property.name : c.key ? c.key.name || c.key.value : c.name;

// die Senke, die einen Knoten trägt (am AST, die Ahnen von innen nach außen): eine Zuweisung an ein Text-Feld (rechts),
// ein Senken-Ruf (in seinen Argumenten), setAttribute mit einem Text-Attribut (sein Wert); ein Daten-Attribut schweigt
function senke(n, ahnen) {
    let rueck = false;
    for (let i = ahnen.length - 1, kind = n; i >= 0; kind = ahnen[i--]) {
        const a = ahnen[i];
        // die Rückgabe eines Satz-Bauers (ein `return`, der Leib eines Pfeils) — sein Name an der Methode, der Funktion, der Eigenschaft
        if (a.type === "ReturnStatement" || (a.type === "ArrowFunctionExpression" && a.body === kind)) rueck = true;
        if (rueck && /^(MethodDefinition|FunctionDeclaration)$/.test(a.type) && SATZ.test(nameVon(a.key || a.id || {})))
            return "satz " + nameVon(a.key || a.id) + ":";
        if (a.type === "Property" && kind === a.value && DATEN_ATTR.test(nameVon(a))) return null;
        // das DATEN-ETIKETT (w5-spielgang-k5): ein Name oder Hinweis in einem Datensatz (`label:`, `hint:`, `lab:`, `title:`,
        // `text:` …) fließt später in eine Senke, die kein Literal mehr sieht (`bp.label`, `d.hint`) — er ist selbst die Senke
        if (a.type === "Property" && kind === a.value && ETIKETT.test(nameVon(a))) return nameVon(a) + ":";
        const feld = a.type === "AssignmentExpression" && kind === a.right && nameVon(a.left);
        if (a.left?.type === "MemberExpression" && SENKE_FELD.test(feld)) return feld;
        const ruf = a.type === "CallExpression" && kind !== a.callee && nameVon(a.callee);
        if (ruf && (SENKE_RUF.test(ruf) || (ruf === "setAttribute" && SENKE_ATTR.test(a.arguments[0]?.value))))
            return ruf;
    }
    return null;
}

function pruefe({ dateien, html, Z }) {
    const rot = [];
    const genutzt = new Set();
    const familien = new Map();
    const praefix = [...new Set(Object.keys(Z).map((k) => k.split(".")[0]))].join("|") || "ui";
    const SCHLUESSEL = new RegExp(`^(?:${praefix})\\.[a-z0-9][a-z0-9.-]*$`);
    for (const { pfad, text } of dateien)
        stammLib.wandere(stammLib.ast(text), (n, ahnen) => {
            const vater = ahnen[ahnen.length - 1];
            const chat = nameVon(n.callee || {}) === "_t" && ahnen.findLast((a) => CHAT.test(nameVon(a.callee || {})));
            if (chat && chat.arguments[0]?.start <= n.start && n.end <= chat.arguments[0].end)
                rot.push(`Z: ${pfad}:${stammLib.zeileVon(text, n.start)} ${text.slice(n.start, n.end).slice(0, 90)}`);
            const quasi = n.type === "TemplateLiteral" && n.quasis.map((q) => q.value.cooked);
            const s = quasi ? quasi.join(" ") : n.type === "Literal" && typeof n.value === "string" && n.value;
            if (s === false || (vater.type === "Property" && vater.key === n)) return;
            const ort = `${pfad}:${stammLib.zeileVon(text, n.start)}`;
            const wo = wort(s) && senke(n, ahnen);
            if (wo) rot.push(`C: ${ort} ${wo}: ${text.slice(n.start, n.end).slice(0, 90)}`);
            if (quasi && quasi.length > 1 && /^[a-z0-9]+(\.[a-z0-9-]+)*\.$/.test(quasi[0])) familien.set(quasi[0], ort);
            if (quasi || !(SCHLUESSEL.test(s) || (nameVon(vater.callee || {}) === "_t" && vater.arguments[0] === n)))
                return;
            genutzt.add(s);
            if (!(s in Z)) rot.push(`K: ${ort} der Schlüssel „${s}“ fehlt in der Tafel`);
        });
    for (const k of html.matchAll(/\sdata-t(?:-[a-z-]+)?="([^"]*)"/g))
        if (k[1] in Z) genutzt.add(k[1]);
        else rot.push(`K: index.html:${html.slice(0, k.index).split("\n").length} der Schlüssel „${k[1]}“ fehlt`);
    // eine Familie liest genau die Zeilen ihrer Quelle (eine ohne Quelle nennt sich selbst: „präfix.…“)
    for (const [f, ort] of familien)
        if (SCHLUESSEL.test(f + "x"))
            for (const id of QUELLE[f] || ["…"])
                if (genutzt.add(f + id) && !(f + id in Z)) rot.push(`F: ${ort} „${f + id}“ fehlt in der Tafel`);
    for (const k of Object.keys(Z)) if (!genutzt.has(k)) rot.push(`U: die Zeile „${k}“ trägt keinen Leser`);
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
const baum = () => lies(stammLib.teileVon(ROOT), ausDatei("index.html"));
const befund = (b) => (b.T ? [b.T] : pruefe(b)); // ohne Tafel ist nur T der Befund

if (require.main !== module) {
    module.exports = { befund, baum }; // die lebende Hälfte (die Station spielgang.K5#1) zählt den Code mit DIESER Wand
} else if (SELBSTTEST) {
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
        ["mehrzeiliger Ausdruck", "C", mit('function p(el, an) { el.innerHTML = an +\n    zeile("Impostor"); }')],
        ["harter Chat", "C", mit("function p(n) { this._chatEcho(`Die Welt hört dich, ${n}!`); }")],
        ["hartes _el", "C", mit('function p() { this._el("button", { text: "Speichern" }); }')],
        ["harter Chat-Satz (describe)", "C", mit('function p() { return { program: [], describe: "Baum gepflanzt" }; }')],
        ["harte Rückgabe eines Satz-Bauers", "C", mit("class X { describeProgram(a) { return `lässt das Wetter zu ${a} wechseln`; } }")],
        ["harter Satz im Pfeil des Satz-Bauers", "C", mit('class X { _dslDescriptionTable() { return { abbau: () => "baut ein Bauwerk ab" }; } }')],
        ["harter title", "C", mit('function p(el) { el.setAttribute("title", "Schließen"); }')],
        ["fremder Schlüssel", "K", mit('function p(el) { el.textContent = this._t("gibt.es.nicht"); }')],
        ["aufgelöste Chat-Zeile", "Z", mit('function p() { this._chatEcho(this._t("ui.abbrechen")); }')],
        ["fremder Schlüssel im DOM", "K", html('<body data-t="gibt.es.nicht"')],
        ["Zeile ohne Leser", "U", daten("const Z = {\n", 'const Z = {\n"ui.niemand-liest": ["Niemand", "Nobody"],\n')],
        ["Zeile ohne en", "T", daten(/("ui\.[^"]+": \["[^"]*"), "[^"]*"\]/, "$1]")],
        ["Wert nur in de", "T", daten(/("ui\.[^"]+": \["[^"]*)", /, '$1 {n}", ')],
        ["Rezept ohne Zeile", "F", daten('"gestalt.eiche": ["Eiche", "Oak"],', "")],
        ["Familie ohne Quelle", "F", mit("(x) => `hud.neu.${x}`")],
    ];
    const fehler = [];
    for (const [name, klasse, mut] of FAELLE) {
        const neu = befund(mut(echt)).filter((x) => !basis.has(x));
        if (!neu.length || !neu.every((x) => x.startsWith(klasse))) fehler.push(`${name} → ${neu[0] || "stumm"}`);
    }
    selbsttestEnde(fehler, `gate:sprache nennt ${FAELLE.length} Mutanten beim Namen (C · K · U · Z · T · F).`);
} else {
    const b = baum();
    wandEnde(
        befund(b),
        `gate:sprache — die Tafel trägt ${Object.keys(b.Z).length} Zeilen, kein Text geht an ihr vorbei.`
    );
}
