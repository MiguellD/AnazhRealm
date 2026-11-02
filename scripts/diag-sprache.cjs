#!/usr/bin/env node
// ============================================================================
// DIE SPRACH-WAND — gate:sprache (spielgang.K5 „Die Welt spricht die Sprache des Spielers“)
//
// Jede UI-Zeile liest EINE Quelle: die Tafel `AnazhRealm.TEXTE` (stamm/daten.js, je Schlüssel eine Spalte je Sprache) über
// den EINEN Leser `_t(schluessel, werte)` (stamm/dienst.js); index.html trägt nur Schlüssel (`data-t`, `data-t-<attribut>`),
// `_sprachDom` füllt sie beim Boot. Die Wand ist ROT beim Namen (Datei:Zeile und der Text), wenn
//   T) die Tafel eine Zeile ohne jede Sprache trägt, ein `{wert}` nicht in jeder Spalte steht oder ein Schlüssel Wort-Text
//      ist (er darf selbst nie wie eine Zeile aussehen);
//   C) eine UI-Senke im Code des Stamms (ohne Kommentare, der EINE Stripper) ein Literal mit Wort-Text trägt — die Senken der
//      Station (`.textContent/.innerText/.innerHTML/.title/.placeholder =`, `_hudSchreib(`, `_chatEcho(`, `alert(`,
//      `confirm(`, `prompt(`) und dazu der EINE DOM-Bauer `_el(`, `appendChatOutput(`, `_spielerSagt(`, `_ladeschirmStand(`,
//      `setAttribute("title"|"placeholder"|"aria-label"|"alt", …)`;
//   K) ein Schlüssel im Code (`_t("…")`) oder in index.html fehlt in der Tafel;
//   H) index.html im <body> (und im <title>) einen Text-Knoten oder ein Attribut (title · placeholder · aria-label · alt)
//      mit Wort-Text trägt.
// Wort-Text heißt, was die Station zählt: nach Abzug von `${…}`, Markup und Entitäten ein Wort aus ≥ 2 Buchstaben UND ein
// Zeichen der Sprache (Großbuchstabe, Umlaut, …!?:).
//
// Selbst-Test: --selftest injiziert je Klasse einen Täter in eine Kopie und beweist, dass die Wand ihn beim Namen nennt.
// ============================================================================
"use strict";
const fs = require("fs");
const path = require("path");
const stammLib = require("./lib/stamm.cjs");

const ROOT = path.resolve(__dirname, "..");
const SELBSTTEST = process.argv.includes("--selftest");

// ── Wort-Text (die Regel der Station spielgang.K5#1) ──
const LIT = /"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`/g;
function wort(l) {
    const t = l
        .slice(1, -1)
        .replace(/\$\{[^}]*\}/g, " ")
        .replace(/<[^>]*>/g, " ")
        .replace(/&\w+;/g, " ");
    return /[A-Za-zÄÖÜäöüß]{2,}/.test(t) && /[A-ZÄÖÜäöüß…!?:]/.test(t);
}
const WORT_DOM = /[A-Za-zÄÖÜäöüß]{2,}/;

// ── T: die Tafel ──
function tafelAus(daten) {
    const a = daten.indexOf("// SPRACH-ZEILEN AUF");
    const e = daten.indexOf("// SPRACH-ZEILEN ZU");
    if (a < 0 || e < a) throw new Error("die Tafel trägt ihre Marker nicht (SPRACH-ZEILEN AUF/ZU in stamm/daten.js)");
    const block = daten.slice(a, e);
    const z = block.slice(block.indexOf("const Z = {") + "const Z = ".length, block.lastIndexOf("}") + 1);
    return JSON.parse(z.replace(/,(\s*)\}$/, "$1}"));
}
function pruefeTafel(Z, rot) {
    const SPALTEN = 2;
    for (const [k, zeile] of Object.entries(Z)) {
        if (wort(JSON.stringify(k))) rot(`T: der Schlüssel „${k}“ ist selbst Wort-Text`);
        if (!Array.isArray(zeile) || zeile.length !== SPALTEN || zeile.some((t) => typeof t !== "string" || !t))
            rot(`T: die Zeile „${k}“ trägt nicht jede Sprache (de · en)`);
        else {
            const werte = (t) => (t.match(/\{\w+\}/g) || []).sort().join(" ");
            if (werte(zeile[0]) !== werte(zeile[1]))
                rot(
                    `T: die Zeile „${k}“ trägt ihre Werte nicht in jeder Spalte (${werte(zeile[0])} ≠ ${werte(zeile[1])})`
                );
        }
    }
}

// ── C/K: der Code ──
const SENKE =
    /\.(textContent|innerText|innerHTML|title|placeholder)\s*=(?!=)\s*|\b(_hudSchreib|_chatEcho|alert|confirm|prompt|_el|append|appendChatOutput|_spielerSagt|_ladeschirmStand)\s*\(|\bsetAttribute\(\s*["'](title|placeholder|aria-label|alt)["']\s*,/g;
function ausdruck(code, i, ruf) {
    let tiefe = 0;
    let q = null;
    for (let k = i; k < code.length; k++) {
        const c = code[k];
        if (q) {
            if (c === "\\") k++;
            else if (c === q) q = null;
            continue;
        }
        if (c === '"' || c === "'" || c === "`") q = c;
        else if ("([{".includes(c)) tiefe++;
        else if (")]}".includes(c)) {
            if (tiefe === 0) return code.slice(i, k);
            tiefe--;
        } else if (!ruf && tiefe === 0 && c === ";") return code.slice(i, k);
        // eine Zuweisung endet an der Zeile — außer die nächste setzt sie fort (mehrzeiliges `? :`, `+`, `.`, `||`, `&&`)
        else if (!ruf && tiefe === 0 && c === "\n" && !/^\s*(?:[?:+.]|\|\||&&)/.test(code.slice(k + 1, k + 200)))
            return code.slice(i, k);
    }
    return code.slice(i);
}
const DATEN_ATTR = /\b(?:value|class|className|id|type|name|href|src|for|role|key|style)\s*:\s*$/;
const zeileVon = (code, i) => code.slice(0, i).split("\n").length;
function pruefeCode(dateien, Z, rot) {
    const gesehen = new Set();
    let senken = 0;
    for (const { pfad, text } of dateien) {
        // die Tafel selbst liest sich nie: ihr Block fällt (Zeilen bleiben)
        const a = text.indexOf("// SPRACH-ZEILEN AUF");
        const e = text.indexOf("// SPRACH-ZEILEN ZU");
        const ohneTafel =
            a >= 0 && e > a ? text.slice(0, a) + text.slice(a, e).replace(/[^\n]/g, " ") + text.slice(e) : text;
        const code = stammLib.ohneKommentare(ohneTafel);
        for (const m of code.matchAll(SENKE)) {
            senken++;
            const ruf = !!m[2] || !!m[3];
            const start = m.index + m[0].length;
            const arg = ausdruck(code, start, ruf);
            for (const t of arg.matchAll(LIT)) {
                const l = t[0];
                if (!wort(l)) continue;
                // im DOM-Bauer sind Werte der Daten-Attribute kein Text (`value:` einer <option>, `class:`, `id:` …)
                if (m[2] === "_el" && DATEN_ATTR.test(arg.slice(Math.max(0, t.index - 40), t.index))) continue;
                const key = `${pfad}:${zeileVon(code, start)}|${l}`;
                if (gesehen.has(key)) continue;
                gesehen.add(key);
                rot(
                    `C: ${pfad}:${zeileVon(code, start + arg.indexOf(l))} ${m[1] || m[2] || "setAttribute " + m[3]}: ${l.slice(0, 90)}`
                );
            }
        }
        // K: jedes Literal, das wie ein Schlüssel der Tafel aussieht (ihr Präfix, dann [a-z0-9.-]), steht in ihr — auch in
        // Ternären und Tafeln (`_t(an ? "a.x" : "a.y")`, `_t(label)`); U zählt, welche Zeilen ein Leser trägt
        for (const m of code.matchAll(/\b_t\(\s*(["'])([^"']+)\1/g))
            if (!(m[2] in Z)) rot(`K: ${pfad}:${zeileVon(code, m.index)} der Schlüssel „${m[2]}“ fehlt in der Tafel`);
        for (const m of code.matchAll(SCHLUESSEL_LIT(Z))) {
            genutzt.add(m[2]);
            if (!(m[2] in Z) && !/\b_t\(\s*$/.test(code.slice(Math.max(0, m.index - 12), m.index)))
                rot(`K: ${pfad}:${zeileVon(code, m.index)} der Schlüssel „${m[2]}“ fehlt in der Tafel`);
        }
    }
    return senken;
}
const SCHLUESSEL_LIT = (Z) => {
    const praefix = [...new Set(Object.keys(Z).map((k) => k.split(".")[0]))].join("|") || "ui";
    return new RegExp(`(["'])((?:${praefix})\\.[a-z0-9][a-z0-9.-]*)\\1`, "g");
};
const genutzt = new Set();

// ── H: index.html ──
function pruefeHtml(html, Z, rot) {
    const zeile = (i) => html.slice(0, i).split("\n").length;
    const body = html.indexOf("<body");
    const titel = html.indexOf("<title");
    // der INHALT der Roh-Blöcke und die Kommentare fallen (Zeilen bleiben) — der öffnende Tag bleibt: auch ein <textarea>
    // trägt Attribute (placeholder)
    const ROH = /(<(script|style|textarea)\b[^>]*>)([\s\S]*?)(<\/\2>)|<!--[\s\S]*?-->/g;
    const blank = (t) => t.replace(/[^\n]/g, " ");
    const flach = html.replace(ROH, (s, auf, _n, innen, zu) => (auf ? auf + blank(innen) + zu : blank(s)));
    const TAG = /<\/?[a-zA-Z][^>]*>/g;
    let letzte = 0;
    let n = 0;
    const text = (a, e) => {
        if (a < body && !(a > titel && a < html.indexOf("</title>"))) return;
        const t = flach.slice(a, e).replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
        if (WORT_DOM.test(t)) rot(`H: index.html:${zeile(a)} Text-Knoten „${t.slice(0, 80)}“`);
    };
    for (const m of flach.matchAll(TAG)) {
        text(letzte, m.index);
        letzte = m.index + m[0].length;
        n++;
        const tag = m[0];
        for (const a of ["title", "placeholder", "aria-label", "alt"]) {
            const v = new RegExp(`\\s${a}="([^"]*)"`).exec(tag);
            if (v && WORT_DOM.test(v[1]) && m.index > body)
                rot(`H: index.html:${zeile(m.index)} Attribut ${a}="${v[1].slice(0, 60)}"`);
        }
        for (const k of tag.matchAll(/\sdata-t(?:-[a-z-]+)?="([^"]*)"/g))
            if (!(k[1] in Z)) rot(`K: index.html:${zeile(m.index)} der Schlüssel „${k[1]}“ fehlt in der Tafel`);
            else genutzt.add(k[1]);
    }
    text(letzte, flach.length);
    return n;
}

function pruefe({ dateien, html, daten }) {
    genutzt.clear();
    const befund = [];
    const rot = (s) => befund.push(s);
    let Z = {};
    try {
        Z = tafelAus(daten);
    } catch (e) {
        rot(`T: ${e.message}`);
    }
    pruefeTafel(Z, rot);
    const senken = pruefeCode(dateien, Z, rot);
    const tags = pruefeHtml(html, Z, rot);
    // U: eine Zeile, die kein Leser trägt, ist toter Text (ein Abschied nimmt seine Zeilen mit)
    for (const k of Object.keys(Z))
        if (!genutzt.has(k)) rot(`U: die Zeile „${k}“ trägt keinen Leser (Stamm, index.html)`);
    return { befund, zeilen: Object.keys(Z).length, senken, tags };
}

function lies(root) {
    const dateien = stammLib.dateien(root).map((p) => ({ pfad: p, text: fs.readFileSync(path.join(root, p), "utf8") }));
    return {
        dateien,
        html: fs.readFileSync(path.join(root, "index.html"), "utf8"),
        daten: fs.readFileSync(path.join(root, "stamm/daten.js"), "utf8"),
    };
}

function bericht(r) {
    for (const b of r.befund.slice(0, 60)) console.log("  ROT " + b);
    if (r.befund.length > 60) console.log(`  … und ${r.befund.length - 60} weitere`);
    const je = {};
    for (const b of r.befund) je[b[0]] = (je[b[0]] || 0) + 1;
    console.log(
        `gate:sprache — Tafel ${r.zeilen} Zeilen (de · en), ${r.senken} UI-Senken im Stamm, ${r.tags} Tags in index.html: ` +
            (r.befund.length
                ? `${r.befund.length} ROT (${Object.entries(je)
                      .map(([k, n]) => k + " " + n)
                      .join(" · ")})`
                : "GRÜN")
    );
}

if (SELBSTTEST) {
    const echt = lies(ROOT);
    const basis = pruefe(echt);
    let fehl = 0;
    const fall = (name, mut, klasse) => {
        const r = pruefe(mut(JSON.parse(JSON.stringify(echt))));
        const neu = r.befund.filter((b) => !basis.befund.includes(b));
        const ok = neu.length > 0 && neu.every((b) => b.startsWith(klasse));
        console.log(`  ${ok ? "ok " : "ROT"} ${name} → ${neu[0] || "keine Meldung"}`);
        if (!ok) fehl++;
    };
    const stammMit = (zeile) => (e) => ((e.dateien[0].text += `\nfunction __probe(el) { ${zeile} }\n`), e);
    fall("hartes textContent", stammMit('el.textContent = "Hallo Welt";'), "C");
    fall("harter Chat", stammMit("this._chatEcho(`Die Welt hört dich, ${name}!`);"), "C");
    fall("hartes _el", stammMit('this._el("button", { text: "Speichern" });'), "C");
    fall("mehrzeiliges ? :", stammMit('el.textContent = an\n        ? "Ein"\n        : "Aus";'), "C");
    fall("harter title", stammMit('el.setAttribute("title", "Schließen");'), "C");
    fall("fremder Schlüssel", stammMit('el.textContent = this._t("gibt.es.nicht");'), "K");
    fall("harter DOM-Text", (e) => ((e.html = e.html.replace("<body", "<body><p>Hallo Welt</p")), e), "H");
    fall("hartes Attribut", (e) => ((e.html = e.html.replace("<body", '<body><i title="Schließen"></i')), e), "H");
    fall("Zeile ohne en", (e) => ((e.daten = e.daten.replace(/("ui\.[^"]+": \["[^"]*"), "[^"]*"\]/, "$1]")), e), "T");
    fall(
        "Zeile ohne Leser",
        (e) => (
            (e.daten = e.daten.replace("const Z = {\n", 'const Z = {\n"ui.niemand-liest": ["Niemand", "Nobody"],\n')),
            e
        ),
        "U"
    );
    fall("Wert nur in de", (e) => ((e.daten = e.daten.replace(/("ui\.[^"]+": \["[^"]*)", /, '$1 {n}", ')), e), "T");
    const sauber = (e) => e;
    const r = pruefe(sauber(echt));
    console.log(`  ok  Echt-Lauf ohne Mutante: ${r.befund.length} Befunde (die Wand am Baum)`);
    console.log(
        fehl ? `gate:sprache --selftest: ${fehl} ROT` : "gate:sprache --selftest: GRÜN (jede Mutante beim Namen)"
    );
    process.exit(fehl ? 1 : 0);
}

// ── W: die Welt (`--welt`): der Boot am Null-Renderer in der Sprache der Linse (`?sprache=pseudo`, jedes Stück der Tafel in
// ⟦ ⟧) — jeder Text-Knoten und jedes Attribut (title · placeholder · aria-label · alt) des lebenden DOM mit Wort-Text AUSSERHALB
// der Klammern ist hart, beim Namen (der Pfad zum nächsten id). `translate="no"` (das Logbuch, die Entwickler-Sicht) zählt
// nicht. Dazu die Zählung der Station (spielgang.K5#1) in der Spieler-Sprache: sie zählt jeden Wort-Knoten, auch den aus der
// Tafel.
async function welt() {
    const WB = require("./lib/welt-boot.cjs");
    const lauf = async (sprache) => {
        const server = WB.statikServer();
        await server.lausche(0);
        const { browser, page } = await WB.nullSeite({ frist: 300000 });
        try {
            await server.zeige(page, 120000, `index.html?sprache=${sprache}`);
            await page.evaluate(() => window.__weltDa((r) => r.state._weltbildDa > 0));
            return await page.evaluate(() => {
                const WORT = /[A-Za-zÄÖÜäöüß]{2,}/;
                const ohne = (t) => t.replace(/⟦[^⟧]*⟧/g, " ").trim();
                const pfad = (el) => {
                    const s = [];
                    for (let e = el; e && e !== document.documentElement; e = e.parentElement) {
                        if (e.id) {
                            s.unshift("#" + e.id);
                            break;
                        }
                        s.unshift(e.tagName.toLowerCase());
                    }
                    return s.join(">");
                };
                const hart = new Map();
                const alle = new Set();
                const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
                for (let n = tw.nextNode(); n; n = tw.nextNode()) {
                    const p = n.parentElement;
                    if (!p || /^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE)$/.test(p.tagName)) continue;
                    const roh = n.textContent.trim();
                    if (WORT.test(roh)) alle.add(roh.slice(0, 80));
                    if (p.closest('[translate="no"]')) continue;
                    const t = ohne(n.textContent);
                    if (WORT.test(t) && !hart.has(t)) hart.set(t, pfad(p) + " „" + t.slice(0, 80) + "“");
                }
                for (const el of document.querySelectorAll("[title],[placeholder],[aria-label],[alt]"))
                    for (const a of ["title", "placeholder", "aria-label", "alt"]) {
                        const t = ohne(el.getAttribute(a) || "");
                        if (WORT.test(t) && !el.closest('[translate="no"]') && !hart.has(a + t))
                            hart.set(a + t, pfad(el) + " " + a + "=„" + t.slice(0, 60) + "“");
                    }
                if (WORT.test(ohne(document.title))) hart.set("title", "<title> „" + document.title + "“");
                return { hart: [...hart.values()], wortKnoten: alle.size, sprache: document.documentElement.lang };
            });
        } finally {
            await browser.close().catch(() => {});
            server.close();
        }
    };
    const p = await lauf("pseudo");
    for (const h of p.hart.slice(0, process.argv.includes("--alle") ? 1e9 : 80)) console.log("  ROT W: " + h);
    if (p.hart.length > 80) console.log(`  … und ${p.hart.length - 80} weitere`);
    console.log(
        `gate:sprache --welt — ${p.hart.length} harte Zeilen im lebenden DOM (pseudo, ${p.wortKnoten} Wort-Knoten)`
    );
    console.log("SPRACHE-WELT " + JSON.stringify({ hart: p.hart.length, wortKnoten: p.wortKnoten }));
    return p.hart.length;
}

if (process.argv.includes("--welt")) {
    welt().then(
        (n) => process.exit(n ? 1 : 0),
        (e) => {
            console.error("gate:sprache --welt brach: " + ((e && e.stack) || e));
            process.exit(2);
        }
    );
    return;
}

const r = pruefe(lies(ROOT));
bericht(r);
if (process.argv.includes("--json"))
    console.log("SPRACHE " + JSON.stringify({ rot: r.befund.length, befund: r.befund }));
process.exit(r.befund.length ? 1 : 0);
