// ============================================================================
// DIE EINE ZÄHLUNG DER SPRACHE (spielgang.K5) — gate:sprache (statisch, am AST) und die Station spielgang.K5#1 (lebend, im DOM)
// lesen DIESE Datei; zwei Zählungen derselben Wahrheit gibt es nicht mehr (bis w5-spielgang-k5: die Station zählte jeden
// Text-Knoten als hart, 707 an 5fba36ea; die Wand in pseudo 19 — dieselbe Welt, zwei Zahlen).
//
// DAS GESETZ (Pseudo-Lokalisierung, wie in AAA-Pipelines): in der Linsen-Sprache `?sprache=pseudo` trägt jedes Stück der Tafel
// eine Marke (⟦ … ⟧, `_t` in stamm/dienst.js). Ein Wort aus ≥ 2 Buchstaben AUSSERHALB jeder Marke ist eine harte Zeile — im
// Text-Knoten, im Titel des Dokuments, in den Text-Attributen (title · placeholder · aria-label · alt). Nur ein Bereich mit
// `translate="no"` trägt Daten statt Sprache (Spieler-Inhalt, DSL-Befehle, Schlüssel, die Diagnose des Logbuchs); er wird
// gezählt und gezeigt (`daten`), nie verschwiegen. Jede harte Zeile steht beim Namen ihres ERZEUGERS: die Erzeuger-Wache
// (`ZEUGE`, vor dem Boot) merkt sich an jedem Schreiber (textContent · innerText · innerHTML · nodeValue · data ·
// createTextNode · append · setAttribute · title · document.title) den ersten Rahmen in stamm/, der ungezeichneten
// Wort-Text schrieb; ein Knoten ohne Zeugen kam aus index.html.
// DER WECHSEL AM ORT: danach `_spracheSetzen("en")` — jede Zeile, die dann noch eine Marke trägt, wechselte nicht (`stehen`).
// DER SELBSTTEST IM LAUF: nach der Zählung pflanzt `PFLANZE` eine harte Zeile und eine stehende; nennt die Zählung sie nicht
// beim Namen, ist sie blind (`blind`), und das Urteil ist ROT.
// ============================================================================
"use strict";

// Wort-Text im Code (die Senken am AST): ein Wort aus ≥ 2 Buchstaben UND ein Zeichen der Sprache (Großbuchstabe, Umlaut,
// Satzzeichen)
const wort = (t) => {
    t = String(t)
        .replace(/<[^>]*>|&\w+;/g, " ")
        .trim();
    // camelCase und ein Bezeichner ohne Leerzeichen in Kleinbuchstaben („szene:tiefenabbild“, „stein_block“) sind Namen
    // Sprache ist auch die kleine Zeile aus zwei Wörtern („kahl (0) ↔ voll (1)“, „glatt ↔ bruchig“)
    const satz = /[A-ZÄÖÜäöüß…!?:]/.test(t) || /[a-zäöüß]{2,}[\s(),↔·–—/]+[^\s]*[a-zäöüß]{2,}/.test(t);
    return /[A-Za-zÄÖÜäöüß]{2,}/.test(t) && satz && !/^[a-z]+[A-Z]\w*$/.test(t) && !/^[a-z][\w.:/-]*$/.test(t);
};

// DIE ERZEUGER-WACHE — läuft im Fenster vor jedem Skript (evaluateOnNewDocument). Reine Funktion ohne freie Namen.
function ZEUGE() {
    const zeugen = new WeakMap();
    window.__sprachZeugen = zeugen;
    // jeder Schreiber von Sprache (mit oder ohne Marke): die harte Zeile und die stehende tragen beide ihren Erzeuger
    const hart = (v) => typeof v === "string" && /[A-Za-zÄÖÜäöüß]{2,}/.test(v);
    const rahmen = () => {
        const zeilen = String(new Error().stack || "").split("\n");
        for (const z of zeilen) {
            const m = /(?:at\s+(?:[\w.$<>]+\s+)?\(?)?[^\s(]*\/((?:stamm|worlds)\/[^\s:)?]+)(?:\?[^:)]*)?:(\d+)/.exec(z);
            if (m && !/at\s+(?:async\s+)?(?:AnazhRealm[\w$]*\.)?(_el|_elAppend)\s/.test(z)) {
                const fn = /at\s+(?:async\s+)?([\w.$]+)\s+\(/.exec(z);
                return m[1] + ":" + m[2] + (fn ? " " + fn[1].replace(/^AnazhRealm[\w$]*\./, "") : "");
            }
        }
        return null;
    };
    const merke = (ziel, v) => {
        if (!ziel || !hart(v)) return;
        const r = rahmen();
        if (r) zeugen.set(ziel, r);
    };
    const haken = (proto, feld, ziel) => {
        const d = Object.getOwnPropertyDescriptor(proto, feld);
        if (!d || !d.set) return;
        Object.defineProperty(proto, feld, {
            configurable: true,
            enumerable: d.enumerable,
            get: d.get,
            set(v) {
                merke(ziel ? ziel(this) : this, v);
                return d.set.call(this, v);
            },
        });
    };
    haken(Node.prototype, "textContent");
    haken(HTMLElement.prototype, "innerText");
    haken(Element.prototype, "innerHTML");
    haken(Node.prototype, "nodeValue", (n) => n.parentElement || n);
    haken(CharacterData.prototype, "data", (n) => n.parentElement || n);
    haken(HTMLElement.prototype, "title");
    haken(HTMLInputElement.prototype, "placeholder");
    haken(HTMLTextAreaElement.prototype, "placeholder");
    haken(Document.prototype, "title", () => document.documentElement);
    const ctn = Document.prototype.createTextNode;
    Document.prototype.createTextNode = function (v) {
        const n = ctn.call(this, v);
        merke(n, v);
        return n;
    };
    const sa = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function (a, v) {
        if (/^(title|placeholder|aria-label|alt)$/.test(a)) merke(this, v);
        return sa.call(this, a, v);
    };
    for (const proto of [Element.prototype, DocumentFragment.prototype])
        for (const f of ["append", "prepend"]) {
            const alt = proto[f];
            proto[f] = function (...k) {
                for (const x of k) if (typeof x === "string") merke(this, x);
                return alt.apply(this, k);
            };
        }
}

// DIE ZÄHLUNG IM FENSTER — reine Funktion ohne freie Namen; `stufe` „zaehle“ (die Welt in pseudo) oder „wechsel“ (nach dem
// Wechsel auf en: jede Zeile mit Marke steht)
function ZAEHLE(stufe) {
    const MARKE = /⟦[^⟧]*⟧/g;
    const hartIn = (t) => /[A-Za-zÄÖÜäöüß]{2,}/.test(String(t).replace(MARKE, " "));
    const zeugen = window.__sprachZeugen || new WeakMap();
    const ort = (el) => {
        const p = [];
        for (let e = el; e && e.nodeType === 1 && e !== document.documentElement; e = e.parentElement) {
            p.unshift(
                e.id
                    ? "#" + e.id
                    : e.tagName.toLowerCase() +
                          (typeof e.className === "string" && e.className
                              ? "." + e.className.trim().split(/\s+/)[0]
                              : "")
            );
            if (e.id) break;
        }
        return p.slice(-3).join(">") || "html";
    };
    const erzeuger = (n, el) => zeugen.get(n) || (el && zeugen.get(el)) || "index.html";
    const zeilen = [];
    const zeile = (n, el, wo, text) => {
        const t = String(text).replace(/\s+/g, " ").trim();
        if (!t) return;
        zeilen.push({
            wo: ort(el) + wo,
            text: t.slice(0, 90),
            hart: hartIn(t),
            erzeuger: erzeuger(n, el),
            daten: !!(el && el.closest('[translate="no"]')),
            marke: t.includes("⟦"),
        });
    };
    const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = tw.nextNode(); n; n = tw.nextNode()) {
        const p = n.parentElement;
        if (!p || /^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE)$/.test(p.tagName)) continue;
        zeile(n, p, "", n.textContent);
    }
    zeile(document.documentElement, document.documentElement, " <title>", document.title);
    for (const el of document.body.querySelectorAll("[title],[placeholder],[aria-label],[alt]"))
        for (const a of ["title", "placeholder", "aria-label", "alt"])
            if (el.hasAttribute(a)) zeile(el, el, " @" + a, el.getAttribute(a));
    const sprache = zeilen.filter((z) => /[A-Za-zÄÖÜäöüß]{2,}/.test(z.text));
    const name = (z) => z.erzeuger + " · " + z.wo + ": " + z.text;
    if (stufe === "wechsel") {
        const stehen = sprache.filter((z) => z.marke && !z.daten);
        const jeErzeuger = {};
        for (const z of stehen)
            jeErzeuger[z.erzeuger.replace(/:\d+/, "")] = (jeErzeuger[z.erzeuger.replace(/:\d+/, "")] || 0) + 1;
        return { stehen: stehen.length, stehenNamen: stehen.map(name), jeErzeuger, zeilen: sprache.length };
    }
    // hart: Wort-Text ohne Marke außerhalb der Daten — und eine Zeile der Tafel IM Daten-Bereich (sie gibt sich als Daten
    // aus und wechselt nie mit der Sprache)
    const hart = sprache.filter((z) => (z.daten ? z.marke : z.hart));
    const daten = sprache.filter((z) => z.daten);
    const jeErzeuger = {};
    for (const z of hart)
        jeErzeuger[z.erzeuger.replace(/:\d+/, "")] = (jeErzeuger[z.erzeuger.replace(/:\d+/, "")] || 0) + 1;
    const jeDaten = {};
    for (const z of daten) jeDaten[z.wo.split(">")[0]] = (jeDaten[z.wo.split(">")[0]] || 0) + 1;
    // die EINE Text-Quelle: eine Tafel mit de und en (je ≥ 10 Zeilen, dieselben Schlüssel) am Stamm
    const r = window.anazhRealm;
    const C = r && r.constructor;
    let quelle = null;
    const T = C && C.TEXTE;
    if (T && T.de && T.en && Object.keys(T.de).length >= 10 && Object.keys(T.de).every((k) => k in T.en))
        quelle = "AnazhRealm.TEXTE (de " + Object.keys(T.de).length + ", en " + Object.keys(T.en).length + ")";
    let glieder = 0;
    if (C)
        for (const o of [C.prototype, C])
            for (const k of Object.getOwnPropertyNames(o))
                if (k !== "constructor" && typeof Object.getOwnPropertyDescriptor(o, k).value === "function") glieder++;
    return {
        sprache: C && C._sprache ? C._sprache() : null,
        zeilen: sprache.length,
        markiert: sprache.filter((z) => z.marke && !z.hart).length,
        dom: hart.length,
        hart: hart.map(name),
        jeErzeuger,
        daten: daten.length,
        jeDaten,
        quelle,
        glieder,
    };
}

// DER SELBSTTEST IM LAUF — pflanzt eine harte Zeile (ein Text-Knoten am Leib) und eine stehende (eine Zeile der Tafel, die beim
// Wechsel niemand neu liest); `weg()` nimmt beide wieder heraus
function PFLANZE() {
    const C = window.anazhRealm.constructor;
    const hart = document.createElement("div");
    hart.id = "sprach-mutante-hart";
    hart.hidden = true;
    hart.textContent = "Hallo Welt";
    const steht = document.createElement("div");
    steht.id = "sprach-mutante-steht";
    steht.hidden = true;
    steht.textContent = C._t(
        Object.keys(C.TEXTE.de).find((k) => /[A-Za-z]{2,}/.test(C.TEXTE.de[k]) && !/\{/.test(C.TEXTE.de[k]))
    );
    document.body.append(hart, steht);
    return 1;
}

module.exports = { wort, ZEUGE, ZAEHLE, PFLANZE };
