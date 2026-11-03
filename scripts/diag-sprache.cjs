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
//   H) index.html im <body> oder <title> einen Text-Knoten oder ein Attribut (title · placeholder · aria-label · alt) mit
//      Wort-Text trägt.
// Wort-Text heißt, was die Station zählt: nach Abzug von `${…}`, Markup und Entitäten ein Wort aus ≥ 2 Buchstaben UND ein
// Zeichen der Sprache (Großbuchstabe, Umlaut, …!?:); im DOM jedes Wort aus ≥ 2 Buchstaben. Die lebende Hälfte (das DOM nach
// dem Boot) misst die Station spielgang.K5#1 in der Linsen-Sprache `?sprache=pseudo` (jedes Stück der Tafel steht in ⟦ ⟧,
// Wort-Text außerhalb ist hart; `translate="no"` trägt nur Spieler-Inhalt, Befehls-Wörter und das Logbuch).
// Selbst-Test: --selftest injiziert je Klasse einen Täter in eine Kopie und beweist, dass die Wand ihn beim Namen nennt.
// ============================================================================
"use strict";
const { ausDatei, stammLib, ROOT, SELBSTTEST, selbsttestEnde, wandEnde } = require("./lib/welt-boot.cjs");

const { wort, ZEUGE, ZAEHLE, PFLANZE } = require("./lib/sprach-zaehlung.cjs"); // die EINE Zählung (Code UND lebendes DOM)
const SENKE_RUF =
    /^(_hudSchreib|_chatEcho|alert|confirm|prompt|_el|append|appendChatOutput|_spielerSagt|_ladeschirmStand)$/;
const SENKE_FELD = /^(textContent|innerText|innerHTML|title|placeholder)$/;
const SENKE_ATTR = /^(title|placeholder|aria-label|alt)$/;
const ETIKETT = /^(label|hint|lab|titel|title|tip|desc|beschreibung|text|name)$/;
const DATEN_ATTR = /^(value|class|className|id|type|name|href|src|for|role|key|style)$/;
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
    // index.html: der Inhalt der Roh-Blöcke und die Kommentare fallen (Zeilen und die öffnenden Tags bleiben)
    const leer = (t) => t.replace(/[^\n]/g, " ");
    const ROH = /(<(script|style|textarea)\b[^>]*>)([\s\S]*?)(<\/\2>)|<!--[\s\S]*?-->/g;
    const flach = html.replace(ROH, (s, auf, _n, innen, zu) => (auf ? auf + leer(innen) + zu : leer(s)));
    const zeile = (i) => flach.slice(0, i).split("\n").length;
    const body = flach.indexOf("<body");
    const titel = [flach.indexOf("<title"), flach.indexOf("</title>")];
    let vor = 0;
    for (const m of [...flach.matchAll(/<\/?[a-zA-Z][^>]*>/g), { index: flach.length, 0: "" }]) {
        const t = flach.slice(vor, m.index).replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
        if ((vor > body || (vor > titel[0] && vor < titel[1])) && /[A-Za-zÄÖÜäöüß]{2,}/.test(t))
            rot.push(`H: index.html:${zeile(vor)} Text-Knoten „${t.slice(0, 80)}“`);
        vor = m.index + m[0].length;
        const attr =
            m.index > body
                ? m[0].matchAll(/\s(title|placeholder|aria-label|alt)="([^"]*[A-Za-zÄÖÜäöüß]{2,}[^"]*)"/g)
                : [];
        for (const x of attr) rot.push(`H: index.html:${zeile(m.index)} Attribut ${x[1]}="${x[2].slice(0, 60)}"`);
        for (const k of m[0].matchAll(/\sdata-t(?:-[a-z-]+)?="([^"]*)"/g))
            if (k[1] in Z) genutzt.add(k[1]);
            else rot.push(`K: index.html:${zeile(m.index)} der Schlüssel „${k[1]}“ fehlt in der Tafel`);
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
const baum = () => lies(stammLib.teileVon(ROOT), ausDatei("index.html"));
const befund = (b) => (b.T ? [b.T] : pruefe(b)); // ohne Tafel ist nur T der Befund

// DIE LEBENDE HÄLFTE (`--lebend [--port P] [--json AUS]`, der Befehl der Station spielgang.K5#1): die Welt am Null-Renderer in
// `?sprache=pseudo`, die Erzeuger-Wache vor dem Boot, die Zählung (`ZAEHLE`), der Selbsttest im Lauf (`PFLANZE`), der Wechsel am
// Ort auf en; dazu der statische Befund oben (C · K · U · H · T) als `code`. Die Zeile `TEXTE {…}` liest das Urteil der Station.
async function lebend() {
    const WB = require("./lib/welt-boot.cjs");
    const arg = (n) => (process.argv.indexOf(n) > 0 ? process.argv[process.argv.indexOf(n) + 1] : null);
    const aus = arg("--json");
    const statisch = befund(baum());
    const out = { glieder: 0, code: statisch.length, gliederMit: 0, senken: {}, beispiele: statisch.slice(0, 3) };
    for (const v of statisch) out.senken[v[0]] = (out.senken[v[0]] || 0) + 1;
    const server = WB.statikServer();
    await server.lausche(Number(arg("--port") || 0));
    const { browser, page } = await WB.nullSeite({ frist: 300000 });
    try {
        await page.evaluateOnNewDocument(ZEUGE);
        await server.zeige(page, 120000, "index.html?sprache=pseudo");
        await page.evaluate(() => window.__weltDa((r) => r.state._weltbildDa > 0));
        const z = await page.evaluate(ZAEHLE, "zaehle");
        await page.evaluate(PFLANZE);
        const mit = await page.evaluate(ZAEHLE, "zaehle");
        await page.evaluate(() => document.getElementById("sprach-mutante-hart").remove());
        const w = await page.evaluate(
            (zaehle) => (window.anazhRealm._spracheSetzen("en"), new Function("return (" + zaehle + ")")()("wechsel")),
            String(ZAEHLE)
        );
        const blind = [];
        if (!mit.hart.some((h) => h.includes("#sprach-mutante-hart: Hallo Welt")))
            blind.push("die gepflanzte harte Zeile fehlt in der Zählung");
        if (!w.stehenNamen.some((h) => h.includes("#sprach-mutante-steht")))
            blind.push("die gepflanzte stehende Zeile fehlt im Wechsel");
        Object.assign(out, z, {
            stehen: w.stehen - 1,
            stehenNamen: w.stehenNamen.filter((h) => !h.includes("#sprach-mutante-steht")).slice(0, 200),
            hart: z.hart.slice(0, 200),
            nachWechsel: w.zeilen,
            stehenJeErzeuger: w.jeErzeuger,
            blind,
        });
        out.beispiele = [
            ...out.beispiele,
            ...z.hart.slice(0, 3).map((t) => "DOM: " + t),
            ...out.stehenNamen.slice(0, 2).map((t) => "STEHT: " + t),
        ];
    } catch (e) {
        out.fehler = String(e.message).split("\n")[0].slice(0, 300);
    } finally {
        await browser.close().catch(() => {});
        server.close();
    }
    if (aus) require("fs").writeFileSync(aus, JSON.stringify(out));
    console.log("TEXTE " + JSON.stringify(out));
    const rot = [
        ...statisch,
        ...(out.hart || []).map((t) => "DOM: " + t),
        ...(out.stehenNamen || []).map((t) => "STEHT: " + t),
        ...(out.blind || []).map((t) => "BLIND: " + t),
        ...(out.fehler ? ["FEHLER: " + out.fehler] : []),
        ...(out.quelle ? [] : ["die Tafel AnazhRealm.TEXTE fehlt im Fenster"]),
    ];
    for (const v of rot.slice(0, 60)) console.log("   • " + v);
    wandEnde(
        rot.length > 60 ? [...rot.slice(0, 60), `… ${rot.length - 60} weitere`] : rot,
        `spielgang.K5 lebend — ${out.zeilen} Zeilen im DOM, jede aus der Tafel (${out.markiert} markiert, ${out.daten} Daten), der Wechsel auf en ließ keine stehen.`
    );
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
        ["harter DOM-Text", "H", html("<body><p>Hallo Welt</p")],
        ["hartes Attribut", "H", html('<body><i title="Schließen"></i')],
        ["Zeile ohne Leser", "U", daten("const Z = {\n", 'const Z = {\n"ui.niemand-liest": ["Niemand", "Nobody"],\n')],
        ["Zeile ohne en", "T", daten(/("ui\.[^"]+": \["[^"]*"), "[^"]*"\]/, "$1]")],
        ["Wert nur in de", "T", daten(/("ui\.[^"]+": \["[^"]*)", /, '$1 {n}", ')],
    ];
    const fehler = [];
    for (const [name, klasse, mut] of FAELLE) {
        const neu = befund(mut(echt)).filter((x) => !basis.has(x));
        if (!neu.length || !neu.every((x) => x.startsWith(klasse))) fehler.push(`${name} → ${neu[0] || "stumm"}`);
    }
    selbsttestEnde(fehler, `gate:sprache nennt ${FAELLE.length} Mutanten beim Namen (C · K · U · H · T).`);
} else {
    const b = baum();
    wandEnde(
        befund(b),
        `gate:sprache — die Tafel trägt ${Object.keys(b.Z).length} Zeilen, kein Text geht an ihr vorbei.`
    );
}
