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
//      `[schlüssel, werte]`).
// Wort-Text: nach Abzug von `${…}`, Markup und Entitäten ein Wort aus ≥ 2 Buchstaben UND ein Zeichen der Sprache
// (Großbuchstabe, Umlaut, …!?:) oder zwei kleine Wörter; ein Bezeichner ist ein Name.
// DIE LEBENDE HÄLFTE (`--lebend [--port P] [--json AUS]`, der Befehl der Station spielgang.K5#1 — EINE Zählung; bis
// w5-spielgang-k5 zählte die Station selbst jeden Text-Knoten, 707 an 5fba36ea): die Welt am Null-Renderer in `?sprache=pseudo`
// (`_t` setzt jedes Stück der Tafel in ⟦ ⟧, jeden Wert in ⁨ ⁩). Hart ist jedes Wort aus ≥ 2 Buchstaben außerhalb der Marken im
// DOM (Text-Knoten aus index.html und Stamm, der Titel, title · placeholder · aria-label · alt), auch eine Zeile der Tafel in
// einem Daten-Bereich (`translate="no"`: Spieler-Inhalt, Befehls-Wörter, Schlüssel, das Logbuch — gezählt als `daten`); jede
// steht beim Namen ihres Erzeugers (`ZEUGE`). Danach der Wechsel am Ort (`_spracheSetzen("en")`): jede Zeile mit ⟦ steht
// (`stehen`). Je Lauf pflanzt der Selbsttest eine harte und eine stehende Zeile; fehlt eine im Befund, ist die Zählung blind.
// Selbst-Test: --selftest injiziert je Klasse einen Täter in eine Kopie und beweist, dass die Wand ihn beim Namen nennt.
// ============================================================================
"use strict";
/* global process, console, window, document, Node, Element, CharacterData, HTMLElement, Document, NodeFilter */
const { ausDatei, stammLib, ROOT, SELBSTTEST, selbsttestEnde, wandEnde } = require("./lib/welt-boot.cjs");

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
const ETIKETT = /^(label|hint|lab|titel|title|tip|desc|description|beschreibung|text|name)$/;
const DATEN_ATTR = /^(value|class|className|klasse|sprecherKlasse|id|type|name|href|src|for|role|key|style)$/;
const CHAT = /^(_chatEcho|appendChatOutput|_spielerSagt)$/;
const nameVon = (c) =>
    c.type === "MemberExpression" ? !c.computed && c.property.name : c.key ? c.key.name || c.key.value : c.name;

// die Senke, die einen Knoten trägt (am AST, die Ahnen von innen nach außen): eine Zuweisung an ein Text-Feld (rechts),
// ein Senken-Ruf (in seinen Argumenten), setAttribute mit einem Text-Attribut (sein Wert); ein Daten-Attribut schweigt
function senke(n, ahnen) {
    for (let i = ahnen.length - 1, kind = n; i >= 0; kind = ahnen[i--]) {
        const a = ahnen[i];
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
    const familien = new Set();
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
            if (quasi && quasi.length > 1 && /^[a-z0-9]+(\.[a-z0-9-]+)*\.$/.test(quasi[0])) familien.add(quasi[0]);
            if (quasi || !(SCHLUESSEL.test(s) || (nameVon(vater.callee || {}) === "_t" && vater.arguments[0] === n)))
                return;
            genutzt.add(s);
            if (!(s in Z)) rot.push(`K: ${ort} der Schlüssel „${s}“ fehlt in der Tafel`);
        });
    for (const k of html.matchAll(/\sdata-t(?:-[a-z-]+)?="([^"]*)"/g))
        if (k[1] in Z) genutzt.add(k[1]);
        else rot.push(`K: index.html:${html.slice(0, k.index).split("\n").length} der Schlüssel „${k[1]}“ fehlt`);
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
const baum = () => lies(stammLib.teileVon(ROOT), ausDatei("index.html"));
const befund = (b) => (b.T ? [b.T] : pruefe(b)); // ohne Tafel ist nur T der Befund

// DIE LEBENDE HÄLFTE — die Erzeuger-Wache (vor jedem Skript der Seite): je Schreiber von Sprache der erste Rahmen in stamm/
// ohne die Helfer (`_el`, `_tSetze`, `_chatEcho`)
function ZEUGE() {
    const zeugen = (window.__sprachZeugen = new WeakMap());
    const merke = (o, v) => {
        if (!o || typeof v !== "string" || !/[A-Za-zÄÖÜäöüß]{2,}/.test(v)) return;
        for (const z of String(new Error().stack).split("\n")) {
            const m = /\/((?:stamm|worlds)\/[^\s:)?]+)[^:]*:(\d+)/.exec(z);
            const fn = (/at (?:async )?([\w.$]+) \(/.exec(z) || [])[1] || "";
            if (m && !/(^|\.)(_el|_elAppend|_tSetze|_chatEcho)$/.test(fn))
                return zeugen.set(o, `${m[1]}:${m[2]} ${fn.replace(/^AnazhRealm[\w$]*\./, "")}`.trim());
        }
    };
    const haken = (proto, feld, ziel = (o) => o) => {
        const d = Object.getOwnPropertyDescriptor(proto, feld);
        Object.defineProperty(proto, feld, { ...d, set(v) { merke(ziel(this), v); d.set.call(this, v); } }); // prettier-ignore
    };
    haken(Node.prototype, "textContent");
    haken(Element.prototype, "innerHTML");
    haken(CharacterData.prototype, "data", (n) => n.parentElement || n);
    haken(HTMLElement.prototype, "title");
    const [ctn, sa] = [Document.prototype.createTextNode, Element.prototype.setAttribute];
    Document.prototype.createTextNode = function (v) {
        const n = ctn.call(this, v);
        merke(n, v);
        return n;
    };
    Element.prototype.setAttribute = function (a, v) {
        merke(this, v);
        return sa.call(this, a, v);
    };
}
// die Zählung im Fenster: je Zeile Erzeuger · Ort · Text, Daten, Marke; `wechsel` gibt die stehenden
function ZAEHLE(wechsel) {
    const zeugen = window.__sprachZeugen || new WeakMap();
    const ort = (el) => (el.closest("[id]") ? "#" + el.closest("[id]").id + " " : "") + el.tagName.toLowerCase();
    const zeilen = [];
    const zeile = (n, el, wo, t) => {
        t = String(t).replace(/\s+/g, " ").trim();
        if (!/[A-Za-zÄÖÜäöüß]{2,}/.test(t)) return;
        const name = `${zeugen.get(n) || zeugen.get(el) || "index.html"} · ${ort(el)}${wo}: ${t.slice(0, 90)}`;
        const daten = !!el.closest('[translate="no"]');
        const marke = t.includes("⟦");
        zeilen.push({ name, daten, marke, hart: daten ? marke : /[A-Za-zÄÖÜäöüß]{2,}/.test(t.replace(/⟦[^⟧]*⟧|⁨[^⁩]*⁩/g, " ")) }); // prettier-ignore
    };
    const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = tw.nextNode(); n; n = tw.nextNode())
        if (!/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE)$/.test(n.parentElement.tagName))
            zeile(n, n.parentElement, "", n.textContent);
    zeile(document.documentElement, document.documentElement, " <title>", document.title);
    for (const el of document.body.querySelectorAll("[title],[placeholder],[aria-label],[alt]"))
        for (const a of ["title", "placeholder", "aria-label", "alt"]) if (el.hasAttribute(a)) zeile(el, el, " @" + a, el.getAttribute(a)); // prettier-ignore
    if (wechsel) return zeilen.filter((z) => z.marke && !z.daten).map((z) => z.name);
    const C = window.anazhRealm.constructor;
    const [de, en] = [C.TEXTE.de, C.TEXTE.en || {}];
    return {
        sprache: C._sprache(),
        glieder: Object.getOwnPropertyNames(C.prototype).length,
        zeilen: zeilen.length,
        markiert: zeilen.filter((z) => z.marke && !z.hart).length,
        hart: zeilen.filter((z) => z.hart).map((z) => z.name),
        daten: zeilen.filter((z) => z.daten).length,
        quelle:
            Object.keys(de).every((k) => k in en) &&
            `AnazhRealm.TEXTE (de ${Object.keys(de).length}, en ${Object.keys(en).length})`,
    };
}

async function lebend() {
    const WB = require("./lib/welt-boot.cjs");
    const arg = (n) => process.argv[process.argv.indexOf(n) + 1];
    const statisch = befund(baum());
    const out = { glieder: 0, code: statisch.length, beispiele: statisch.slice(0, 3) };
    const server = WB.statikServer();
    await server.lausche(Number(process.argv.includes("--port") ? arg("--port") : 0));
    const { browser, page } = await WB.nullSeite({ frist: 300000 });
    try {
        await page.evaluateOnNewDocument(ZEUGE);
        await server.zeige(page, 120000, "index.html?sprache=pseudo");
        await page.evaluate(() => window.__weltDa((r) => r.state._weltbildDa > 0));
        Object.assign(out, await page.evaluate(ZAEHLE, false));
        // der Selbsttest im Lauf: eine harte Zeile am Leib, eine Zeile der Tafel, die beim Wechsel niemand neu liest
        const [mit, stehen] = await page.evaluate((f) => {
            const C = window.anazhRealm.constructor;
            const zeile = (id, t) => document.body.appendChild(Object.assign(document.createElement("i"), { id, hidden: true, textContent: t })); // prettier-ignore
            zeile("sprach-mutante-hart", "Hallo Welt");
            zeile("sprach-mutante-steht", C._t(Object.keys(C.TEXTE.de).find((k) => /^[A-Za-zÄÖÜäöüß ]{4,}$/.test(C.TEXTE.de[k])))); // prettier-ignore
            const Z = new Function("return " + f)();
            const mit = Z(false).hart;
            document.getElementById("sprach-mutante-hart").remove();
            window.anazhRealm._spracheSetzen("en");
            return [mit, Z(true)];
        }, String(ZAEHLE));
        const muss = (liste, id) => liste.some((h) => h.includes("#" + id));
        out.blind = ["sprach-mutante-hart", "sprach-mutante-steht"].filter((id, i) => !muss(i ? stehen : mit, id));
        out.stehenNamen = stehen.filter((h) => !h.includes("#sprach-mutante-steht"));
        out.stehen = out.stehenNamen.length;
        out.dom = out.hart.length;
    } catch (e) {
        out.fehler = String(e.message).split("\n")[0].slice(0, 300);
    } finally {
        await browser.close().catch(() => {});
        server.close();
    }
    if (process.argv.includes("--json")) require("fs").writeFileSync(arg("--json"), JSON.stringify(out));
    console.log("TEXTE " + JSON.stringify(out));
    const rot = [...statisch, ...(out.hart || []), ...(out.stehenNamen || []).map((t) => "STEHT: " + t), ...(out.blind || []).map((t) => "BLIND: " + t), ...(out.fehler ? ["FEHLER: " + out.fehler] : []), ...(out.quelle ? [] : ["keine Tafel"])]; // prettier-ignore
    wandEnde(rot, `spielgang.K5 lebend — ${out.zeilen} Zeilen im DOM (${out.markiert} aus der Tafel, ${out.daten} Daten), keine hart, der Wechsel auf en ließ keine stehen.`); // prettier-ignore
}

if (process.argv.includes("--lebend")) {
    lebend();
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
        ["harter title", "C", mit('function p(el) { el.setAttribute("title", "Schließen"); }')],
        ["fremder Schlüssel", "K", mit('function p(el) { el.textContent = this._t("gibt.es.nicht"); }')],
        ["aufgelöste Chat-Zeile", "Z", mit('function p() { this._chatEcho(this._t("ui.abbrechen")); }')],
        ["fremder Schlüssel im DOM", "K", html('<body data-t="gibt.es.nicht"')],
        ["Zeile ohne Leser", "U", daten("const Z = {\n", 'const Z = {\n"ui.niemand-liest": ["Niemand", "Nobody"],\n')],
        ["Zeile ohne en", "T", daten(/("ui\.[^"]+": \["[^"]*"), "[^"]*"\]/, "$1]")],
        ["Wert nur in de", "T", daten(/("ui\.[^"]+": \["[^"]*)", /, '$1 {n}", ')],
    ];
    const fehler = [];
    for (const [name, klasse, mut] of FAELLE) {
        const neu = befund(mut(echt)).filter((x) => !basis.has(x));
        if (!neu.length || !neu.every((x) => x.startsWith(klasse))) fehler.push(`${name} → ${neu[0] || "stumm"}`);
    }
    selbsttestEnde(fehler, `gate:sprache nennt ${FAELLE.length} Mutanten beim Namen (C · K · U · Z · T).`);
} else {
    const b = baum();
    wandEnde(
        befund(b),
        `gate:sprache — die Tafel trägt ${Object.keys(b.Z).length} Zeilen, kein Text geht an ihr vorbei.`
    );
}
