"use strict";
/* global process, console, __dirname, Buffer, TextEncoder, TextDecoder, URL */
// scripts/lib/stamm.cjs — DIE EINE Lese-Schnittstelle des Stamms (Stamm-Zerlegung).
//
// Jedes Werkzeug, das den Stamm als TEXT liest, liest ihn hier: `text(root)` ist der virtuelle Stamm — die Umkehrung der
// Dateien unter stamm/. Die Layout-Weiche ist laut: trägt der Baum die alte Datei `ALT` (die Form vor der Zerlegung) oder
// kein stamm/*.js, wirft sie; ein Text unter 5 MB wirft („Probe blind"). Der Name der alten Datei steht als Lese-Ziel NUR
// hier (Absenz-Linse in diag-altlasten).
//
// Der Schnitt S ist eine REINE Funktion des Texts an den ATLAS-Markern (`schneide`), seine Umkehrung `fuege`; beide
// leben in dieser Datei, damit es EIN Gesetz gibt. Die DOMÄNE (D2, `ordne` nach spec/stamm/modul-karte.json):
//   stamm/<kern>.js     Kopf + `class AnazhRealm {` + die erste Zone (Konstruktor) + `}` + die Naht-Funktion `_stammZonen`
//   stamm/<modul>.js    `class AnazhRealm_<modul> {` + die Zone `ATLAS · Modul[/teil]` + `}` + ihr Naht-Ruf, dahinter ihre
//                       Außen-Anweisungen (`AnazhRealm.X = …`) ab ihrem Außen-Marker; Datei-Name = Modul[-teil]
// Die LAGE (stamm/NN[x].js je Marker §NN[x], vor D2) fiel mit dem Register-Treiber (scripts/bump-version.cjs): seit dem 20.10.
// trägt sie kein Zweig, und jeder Zweig der Domäne merged über git.
// Die Leerzeile vor jedem Marker trägt die Umkehrung; S verlangt sie (sonst wirft S).
//
//   node scripts/lib/stamm.cjs --selftest     beweist Umkehrung, Ordnung, Layout-Weiche, 5-MB-Wand, Kanon, ort, liefere
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ALT = "anazhRealm.js";
const DIR = "stamm";
const KARTE = "spec/stamm/modul-karte.json";
const MIN_BYTES = 5 * 1024 * 1024;
const KLASSE_AUF = "class AnazhRealm {";
// DER ÜBERSETZUNGS-HINWEIS (Pflicht-OFFEN B, w4-b-code): die erste Zeile jeder Stamm-Datei — V8 übersetzt jede ihrer Funktionen
// beim Streamen im Hintergrund-Faden statt lazy im Haupt-Faden beim ersten Ruf (Kalt-Spur bis zum Weltbild: V8.CompileCode
// 1 255 → 221 ms). S schreibt ihn, S⁻¹ nimmt ihn; eine Datei ohne ihn ist nicht kanonisch, ein Stand von vor ihm liest sich gehoben.
const HINWEIS = "//# allFunctionsCalledOnLoad\n";
const DOMAENE_RX = /^( {4})?\/\/ ===== ATLAS · ([A-Z][a-z]+(?:\/[a-z][a-z0-9]*)?) — (.+?) =====\s*$/;
const ZONEN_DATEI_RX = /^stamm\/[a-z0-9]+(?:-[a-z0-9]+)?\.js$/;
// ein Stamm-Tag lädt früh (`defer`, vor dem Boot) oder spät (`type="spaet"`: träge, bis der Lader ihn nach dem ersten Weltbild
// weckt — die Karte nennt ihn `spät` in ihrer Ordnung, `spaeteVon`)
const STAMM_TAG_RX =
    /^([ \t]*)<script src="(stamm\/[a-z0-9]+(?:-[a-z0-9]+)?\.js)(\?v=[^"]*)?" (defer|type="spaet")><\/script>[ \t]*$/;
// die Domäne „Modul/teil" heißt in der Datei modul-teil, ihre Klasse AnazhRealm_modul_teil
const stammName = (s) => s.toLowerCase().replace("/", "-");
const pfadVon = (s) => `${DIR}/${stammName(s)}.js`;
const klasseVon = (s) => `AnazhRealm_${stammName(s).replace("-", "_")}`;
const zonenRuf = (k) => `_stammZonen(AnazhRealm, [${k}]);\n`;

const sha = (s) => crypto.createHash("sha256").update(s).digest("hex");

// Die Naht (Kern-Ende in der ersten Stamm-Datei). S schreibt sie, die Umkehrung verlangt sie Zeile für Zeile.
const NAHT_FN = [
    "",
    "// DIE NAHT (scripts/lib/stamm.cjs schreibt und liest sie): jede Datei unter stamm/ trägt mit ihrem Naht-Ruf die Glieder",
    "// ihrer Zonen-Klasse auf AnazhRealm — je Glied sein Deskriptor; erst die Methoden und Accessoren, dann die statischen",
    "// Felder (wie die Klassen-Auswertung). Ein Zwilling bricht laut.",
    "/* exported _stammZonen */",
    "function _stammZonen(Ziel, zonen) {",
    "    const tragen = (quelle, ziel, aus, felder) => {",
    "        for (const k of Reflect.ownKeys(quelle)) {",
    "            if (aus.includes(k)) continue;",
    "            const d = Object.getOwnPropertyDescriptor(quelle, k);",
    "            if (felder !== (d.enumerable === true)) continue;",
    "            if (Object.prototype.hasOwnProperty.call(ziel, k))",
    "                throw new Error(`Stamm-Zwilling: ${String(k)} (${quelle.name || quelle.constructor.name})`);",
    "            Object.defineProperty(ziel, k, d);",
    "        }",
    "    };",
    '    const statisch = ["length", "name", "prototype"];',
    "    for (const Z of zonen) {",
    '        tragen(Z.prototype, Ziel.prototype, ["constructor"], false);',
    "        tragen(Z, Ziel, statisch, false);",
    "    }",
    "    for (const Z of zonen) tragen(Z, Ziel, statisch, true);",
    "}",
];

// ── S: der Schnitt ────────────────────────────────────────────────────────────────────────────────────────────────
// Auf Zeichen-Positionen, nie auf Zeilen-Feldern (108k Zeilen spalten und fügen kostete 0,5 s je Richtung).
const zeilenIn = (s) => {
    let n = 0;
    for (let i = s.indexOf("\n"); i >= 0; i = s.indexOf("\n", i + 1)) n++;
    return n;
};

// Die Marker der DOMÄNE (`· Modul[/teil] — themen`, `schluessel`).
function marker(t) {
    const out = [];
    const nadel = "// ===== ATLAS ";
    for (let i = t.indexOf(nadel); i >= 0; i = t.indexOf(nadel, i + nadel.length)) {
        const a = t.lastIndexOf("\n", i) + 1;
        const e = t.indexOf("\n", i);
        const d = DOMAENE_RX.exec(t.slice(a, e < 0 ? t.length : e));
        if (d) out.push({ at: a, eingerueckt: !!d[1], schluessel: d[2], themen: d[3].trim() });
    }
    return out;
}

// S(text) → [{ pfad, text, klasse? }] in Lade-Ordnung. Wirft bei jedem Text, den die Umkehrung nicht trüge.
function schneide(t) {
    if (!t.endsWith("\n")) throw new Error("S: der Stamm endet nicht mit einem Zeilenumbruch");
    const auf = KLASSE_AUF + "\n";
    const k = t.startsWith(auf) ? 0 : t.indexOf("\n" + auf) + 1;
    if (k <= 0 && !t.startsWith(auf)) throw new Error(`S: \`${KLASSE_AUF}\` fehlt`);
    if (t.indexOf("\n" + auf, k) >= 0) throw new Error(`S: \`${KLASSE_AUF}\` steht mehr als einmal`);
    const mk = marker(t);
    const innen = mk.filter((m) => m.eingerueckt);
    const aussen = mk.filter((m) => !m.eingerueckt);
    if (!innen.length || innen[0].at !== k + auf.length)
        throw new Error("S: der erste Marker steht nicht direkt unter der Klasse");
    if (!aussen.length) throw new Error("S: kein Marker außerhalb der Klasse (§26)");
    const zu = aussen[0].at - 3;
    if (t.slice(zu - 1, zu + 3) !== "\n}\n\n")
        throw new Error("S: vor dem §26-Marker stehen nicht `}` und eine Leerzeile");
    if (innen.some((m) => m.at > zu) || aussen.some((m) => m.at < zu))
        throw new Error("S: Marker-Ordnung innen/außen bricht");
    for (const m of mk.slice(1))
        if (t.slice(m.at - 2, m.at) !== "\n\n")
            throw new Error(`S: vor dem Marker in Zeile ${zeilenIn(t.slice(0, m.at)) + 1} fehlt die Leerzeile`);
    const ende01 = innen.length > 1 ? innen[1].at - 1 : zu;
    const zone = (L, j, ende) => t.slice(L[j].at, j + 1 < L.length ? L[j + 1].at - 1 : ende);
    // je Schlüssel eine Datei — die Zone samt Naht-Ruf, dahinter die Außen-Zone desselben Schlüssels
    const si = innen.map((m) => m.schluessel);
    const sa = aussen.map((m) => m.schluessel);
    const doppelt = [si, sa].map((l) => l.find((s, i) => l.indexOf(s) !== i)).find(Boolean);
    if (doppelt) throw new Error(`S: die Zone ${doppelt} steht zweimal`);
    const reihe = si.concat(sa.filter((s) => !si.includes(s)));
    if (reihe.filter((s) => sa.includes(s)).join() !== sa.join())
        throw new Error("S: die Außen-Zonen stehen nicht in der Datei-Ordnung der Zonen");
    return reihe.map((s) => {
        const i = si.indexOf(s);
        const a = sa.indexOf(s);
        const aus = a < 0 ? "" : (i < 0 ? "" : "\n") + zone(aussen, a, t.length);
        if (i <= 0) return { pfad: pfadVon(s), text: HINWEIS + (i < 0 ? aus : t.slice(0, ende01) + "}\n" + NAHT_FN.join("\n") + "\n" + aus) };
        const klasse = klasseVon(s);
        return { pfad: pfadVon(s), klasse, text: `${HINWEIS}class ${klasse} {\n${zone(innen, i, zu)}}\n${zonenRuf(klasse)}${aus}` };
    });
}

// S⁻¹: die Zonen-Dateien → der Stamm — der Kern bis zur Naht, je Zonen-Datei die Klasse bis zu ihrem Naht-Ruf, danach alle
// Außen-Zonen in Datei-Ordnung (je nach einer Leerzeile). `stuecke` (optional) bekommt je Stück [pfad, ersteDateiZeile,
// zeilen, ersteStammZeile].
function fuege(teile, stuecke) {
    const out = [];
    let zeile = 1;
    // der Übersetzungs-Hinweis steht in jeder Datei eines Stands oder in keiner (ein Stand von vor ihm); gemischt bricht S∘S⁻¹
    const h = +!!teile[0]?.text.startsWith(HINWEIS);
    teile = teile.map((x) => ({ pfad: x.pfad, text: x.text.slice(h * HINWEIS.length) }));
    const nimm = (pfad, s, ab) => {
        if (stuecke) stuecke.push([pfad, ab + h, zeilenIn(s), zeile]);
        zeile += zeilenIn(s);
        out.push(s);
    };
    for (const x of teile)
        if (!x.text.endsWith("\n")) throw new Error(`S⁻¹: ${x.pfad} endet nicht mit einem Zeilenumbruch`);
    if (!teile.length) throw new Error("S⁻¹: keine Stamm-Datei");
    const kern = teile[0].text;
    const naht = "\n}\n" + NAHT_FN.join("\n") + "\n";
    const n = kern.indexOf(naht);
    if (n < 0) throw new Error(`S⁻¹: ${teile[0].pfad} trägt nicht \`}\` und die Naht`);
    const aussen = [];
    const rest = (p, z, nach) => {
        const r = z.slice(nach.length);
        if (r && !r.startsWith("\n")) throw new Error(`S⁻¹: ${p}: vor der Außen-Zone fehlt die Leerzeile`);
        if (r) aussen.push([p, r.slice(1), zeilenIn(nach) + 2]);
    };
    nimm(teile[0].pfad, kern.slice(0, n + 1), 1);
    rest(teile[0].pfad, kern, kern.slice(0, n + naht.length));
    let zu = [teile[0].pfad, zeilenIn(kern.slice(0, n + 1)) + 1];
    for (const x of teile.slice(1)) {
        const z = x.text;
        const m = /^class (AnazhRealm_\w+) \{\n/.exec(z);
        if (!m) {
            aussen.push([x.pfad, z, 1]);
            continue;
        }
        const e = z.indexOf("\n}\n" + zonenRuf(m[1]));
        if (e < 0) throw new Error(`S⁻¹: ${x.pfad} schließt nicht mit \`}\` und dem Naht-Ruf ihrer Klasse`);
        nimm(x.pfad, "\n", 1);
        nimm(x.pfad, z.slice(m[0].length, e + 1), 2);
        rest(x.pfad, z, z.slice(0, e + 3 + zonenRuf(m[1]).length));
        zu = [x.pfad, zeilenIn(z.slice(0, e + 1)) + 1];
    }
    nimm(zu[0], "}\n", zu[1]);
    for (const [p, z, ab] of aussen) {
        nimm(p, "\n", Math.max(1, ab - 1));
        nimm(p, z, ab);
    }
    return out.join("");
}

// ── DIE ORDNUNG NACH DOMÄNE ──────────────────────────────────────────────────────────────────────────────────────
// `ordne(T, karte)` stellt jedes Glied der Klasse und jede Außen-Anweisung in die Zone ihres Schlüssels aus der Karte
// (spec/stamm/modul-karte.json: `mod` Name → „Modul[/teil]", ein Außen-Ziel als „AnazhRealm.X"; `ordnung` [[Schlüssel,
// Themen], …] die Datei-Ordnung, ihr erster trägt den Konstruktor). Rein und ein Fixpunkt: gleiche Karte und gleicher Text
// geben denselben Text, ordne(ordne(T)) = ordne(T). In der Zone bleibt die Ordnung des Texts; Rumpf und Vorlauf-Kommentar
// wandern Byte für Byte, die Marker-Zeilen fallen und entstehen neu. Ein Name ohne Karte und eine Anweisung ohne Namen
// (`_bootAnazhRealm();`) folgen ihrem Vorgänger (`neu`); `fremd` nennt jedes Glied außerhalb seiner Zone, `tot` jeden
// Karten-Namen ohne Glied.
// Die Karte auf der Platte: je Datei-Schlüssel EINE Zeile mit seinen Namen (sortiert, `karteText`); im Speicher `mod`
// Name → Schlüssel. Ein Name in zwei Modulen wirft.
function karteAus(text) {
    const j = JSON.parse(text);
    const mod = {};
    for (const [s, namen] of Object.entries(j.module))
        for (const n of namen) {
            if (Object.hasOwn(mod, n)) throw new Error(`Karte: ${n} steht in ${mod[n]} und ${s}`);
            mod[n] = s;
        }
    return { quelle: j.quelle, ordnung: j.ordnung, mod };
}
const karteVon = (root) => karteAus(fs.readFileSync(path.join(root, KARTE), "utf8"));
// DIE SPÄTEN MODULE (Pflicht-OFFEN B): `spät` als drittes Feld ihres Eintrags der Ordnung — ihre Datei-Pfade
const spaeteVon = (K) => new Set(K.ordnung.filter((o) => o[2] === "spät").map((o) => pfadVon(o[0])));
function aussenName(s) {
    const e = s.type === "ExpressionStatement" ? s.expression : null;
    const an = (n) => n && n.type === "MemberExpression" && n.object.type === "Identifier" && n.object.name === "AnazhRealm";
    const feld = (n) => (n.computed ? n.property.value : n.property.name);
    if (e && e.type === "AssignmentExpression" && an(e.left)) return `AnazhRealm.${feld(e.left)}`;
    // Object.defineProperty(AnazhRealm, "X", …) und Object.defineProperties(AnazhRealm, { X: …, … }) heißen nach ihrem ersten Ziel
    const [z, o] = e && e.type === "CallExpression" && e.callee.type === "MemberExpression" ? e.arguments : [];
    if (z && z.type === "Identifier" && z.name === "AnazhRealm" && o && (o.type === "Literal" || o.type === "ObjectExpression"))
        return `AnazhRealm.${o.type === "Literal" ? o.value : o.properties[0].key.name || o.properties[0].key.value}`;
    return s.type === "FunctionDeclaration" || s.type === "ClassDeclaration" ? s.id.name : null;
}
function ordne(T, karte) {
    const baum = require("acorn").parse(T, { ecmaVersion: "latest", sourceType: "script", allowHashBang: true });
    const cls = baum.body.find((n) => n.type === "ClassDeclaration" && n.id && n.id.name === "AnazhRealm");
    if (!cls) throw new Error("ordne: `class AnazhRealm` fehlt");
    const reihe = karte.ordnung.map((o) => o[0]);
    const zonen = new Map(reihe.map((s) => [s, { innen: [], aussen: [] }]));
    const ende = (i) => (T.indexOf("\n", i) < 0 ? T.length : T.indexOf("\n", i) + 1);
    const anfang = (i) => T.lastIndexOf("\n", i - 1) + 1;
    const r = { neu: [], fremd: [], namen: new Set() };
    let ist = null;
    let vor = reihe[0];
    const stueck = (a, n, name, seite) => {
        const b = anfang(n.start);
        const vorlauf = T.slice(a, b).split("\n").filter((z) => {
            const d = DOMAENE_RX.exec(z);
            if (d) ist = d[2];
            return !d;
        });
        const bekannt = name != null && Object.hasOwn(karte.mod, name);
        const soll = bekannt ? karte.mod[name] : vor;
        if (!zonen.has(soll)) throw new Error(`ordne: ${name} → „${soll}" steht nicht in der Ordnung der Karte`);
        if (name != null) r.namen.add(name);
        if (name != null && !bekannt) r.neu.push({ name, soll });
        if (name != null && ist !== soll) r.fremd.push({ name, ist, soll });
        zonen.get(soll)[seite].push(vorlauf.join("\n") + T.slice(b, ende(n.end - 1)));
        vor = soll;
        return ende(n.end - 1);
    };
    let a = ende(cls.body.start);
    const kopf = T.slice(0, a);
    for (const g of cls.body.body) a = stueck(a, g, g.computed ? null : g.key.name ?? String(g.key.value), "innen");
    const schwanz = T.slice(a, anfang(cls.end - 1));
    a = ende(cls.end - 1);
    for (const s of baum.body.filter((n) => n.start >= cls.end)) a = stueck(a, s, aussenName(s), "aussen");
    const block = (einzug, s, th, liste) =>
        `${einzug}// ===== ATLAS · ${s} — ${th} =====\n` + liste.map((x, i) => (i ? x : x.replace(/^\n+/, ""))).join("");
    const mitInnen = reihe.filter((s) => zonen.get(s).innen.length);
    if (mitInnen[0] !== karte.mod.constructor || mitInnen[0] !== reihe[0])
        throw new Error(`ordne: der Konstruktor gehört in die erste Zone der Ordnung (${reihe[0]})`);
    const innen = mitInnen.map((s) => block("    ", s, karte.ordnung[reihe.indexOf(s)][1], zonen.get(s).innen));
    const aussen = mitInnen
        .concat(reihe.filter((s) => !zonen.get(s).innen.length))
        .filter((s) => zonen.get(s).aussen.length)
        .map((s) => "\n" + block("", s, "Außen-Konstanten", zonen.get(s).aussen));
    r.text = kopf + innen.join("\n") + schwanz + "}\n" + aussen.join("") + T.slice(a);
    r.tot = Object.keys(karte.mod).filter((n) => !r.namen.has(n));
    return r;
}
// Die Karte heilt benannt (stamm-umzug --nach-karte, stamm-rehome): ein Name ohne Karte nimmt die Zone seines Vorgängers,
// ein toter Name fällt; die Namen stehen sortiert — gleiche Eingabe, gleiche Datei (`karteText`). `text` ist der Stamm nach
// der Karte (ordne): gleich T, so ist der Stamm ihr Fixpunkt (gate:betriebsgesetz liest die Karte dann als Werkzeug-Ausgabe).
function heileKarte(T, K) {
    const r = ordne(T, K);
    const mod = Object.assign({}, K.mod);
    for (const n of r.neu) mod[n.name] = n.soll;
    for (const n of r.tot) delete mod[n];
    const sortiert = {};
    for (const n of Object.keys(mod).sort()) sortiert[n] = mod[n];
    return { karte: Object.assign({}, K, { mod: sortiert }), neu: r.neu, tot: r.tot, text: r.text };
}
function karteText(K) {
    const je = new Map(K.ordnung.map(([s]) => [s, []]));
    for (const n of Object.keys(K.mod).sort()) {
        if (!je.has(K.mod[n])) throw new Error(`Karte: ${n} → „${K.mod[n]}" steht nicht in der Ordnung`);
        je.get(K.mod[n]).push(n);
    }
    const reihe = (x) => JSON.stringify(x).replace(/","/g, '", "');
    const ordnung = K.ordnung.map((o) => `  ${reihe(o)}`).join(",\n");
    const module = [...je].map(([s, ns]) => `  ${JSON.stringify(s)}: ${reihe(ns)}`).join(",\n");
    return `{\n "quelle": ${JSON.stringify(K.quelle)},\n "ordnung": [\n${ordnung}\n ],\n "module": {\n${module}\n }\n}\n`;
}

// ── der Baum ──────────────────────────────────────────────────────────────────────────────────────────────────────
// Die Layout-Weiche ist laut: die alte Datei im Baum (die Form vor dem Schnitt) oder kein stamm/*.js wirft.
function layout(root) {
    if (fs.existsSync(path.join(root, ALT))) throw new Error(`Stamm-Layout: ${root} trägt ${ALT} — die Form vor dem Schnitt`);
    if (!fs.existsSync(path.join(root, DIR)) || !fs.readdirSync(path.join(root, DIR)).some((f) => /\.js$/.test(f)))
        throw new Error(`Stamm-Layout: ${root} trägt kein ${DIR}/*.js`);
}

// Die Stamm-Tags einer index.html, in Lade-Ordnung.
function tagsVon(html) {
    const out = [];
    html.split("\n").forEach((z, i) => {
        const m = STAMM_TAG_RX.exec(z.replace(/\r$/, ""));
        if (m) out.push({ zeile: i, einzug: m[1], pfad: m[2], v: m[3] || "", spaet: m[4] !== "defer" });
    });
    return out;
}

// DIE EINE LISTE: die Stamm-Dateien, wie index.html sie lädt.
function dateien(root) {
    layout(root);
    const html = path.join(root, "index.html");
    if (!fs.existsSync(html)) throw new Error(`Stamm-Liste: ${html} fehlt (die Tags sind die EINE Liste)`);
    const liste = tagsVon(fs.readFileSync(html, "utf8")).map((t) => t.pfad);
    const platte = fs
        .readdirSync(path.join(root, DIR))
        .filter((f) => f.endsWith(".js"))
        .map((f) => `${DIR}/${f}`)
        .sort();
    const fremd = platte.filter((p) => !liste.includes(p));
    const fehlt = liste.filter((p) => !platte.includes(p));
    if (fremd.length || fehlt.length)
        throw new Error(
            `Stamm-Liste: Tags ≠ ${DIR}/ (ohne Tag: ${fremd.join(", ") || "-"} · ohne Datei: ${fehlt.join(", ") || "-"})`
        );
    return liste;
}

function blind(t, wo) {
    if (Buffer.byteLength(t, "utf8") < MIN_BYTES)
        throw new Error(`Stamm-Text aus ${wo}: ${t.length} Zeichen < 5 MB — Probe blind (ein Teil statt des Stamms)`);
    return t;
}

// DER EINE Leser der Stamm-Dateien [{ pfad, text }] in Lade-Ordnung: im Baum, mit `rev` an einer Revision (ohne Arbeitsbaum).
const gitIn = (root, args) =>
    require("child_process").execFileSync("git", ["-C", root, ...args], { encoding: "utf8", maxBuffer: 1 << 30 });
function teileVon(root, rev) {
    const lies = (p) => (rev ? gitIn(root, ["show", `${rev}:${p}`]) : fs.readFileSync(path.join(root, p), "utf8"));
    return (rev ? tagsVon(lies("index.html")).map((t) => t.pfad) : dateien(root)).map((p) => ({ pfad: p, text: lies(p) }));
}

// Der Text der Zonen-Dateien, geprüft: nur ein Baum im Bild von S trägt (S(S⁻¹(teile)) = teile, Datei für Datei).
function ausZonen(teile, stuecke) {
    const t = fuege(teile, stuecke);
    const s = schneide(t);
    // ein Stand von vor dem Übersetzungs-Hinweis (keine Datei trägt ihn) liest sich gehoben; eine einzelne ohne ihn bricht
    const alt = teile[0].text.startsWith(HINWEIS) ? "" : HINWEIS;
    const abweichung =
        s.length !== teile.length
            ? `${s.length} statt ${teile.length} Dateien`
            : (s.find((x, i) => x.pfad !== teile[i].pfad || x.text !== alt + teile[i].text) || {}).pfad;
    if (abweichung) throw new Error(`Stamm-Baum nicht kanonisch (S∘S⁻¹ ≠ id): ${abweichung}`);
    return t;
}

// DER virtuelle Stamm. `pfad` = Wurzel eines Baums (Layout-Weiche) ODER ausdrücklich eine Stamm-Datei (der virtuelle Text
// als EINE Datei: git-Archiv, A/B-Basis, werkbank --quelle).
function text(pfad) {
    const p = path.resolve(pfad);
    if (fs.statSync(p).isFile()) return blind(fs.readFileSync(p, "utf8"), p);
    return blind(ausZonen(teileVon(p)), p);
}

// Der Stamm-Text an einer git-Revision, ohne Arbeitsbaum (die Liste aus ihren Tags).
function textAusRev(root, rev) {
    const teile = teileVon(root, rev);
    if (!teile.length) throw new Error(`Stamm-Layout an ${rev}: kein Stamm-Tag (eine Form vor dem Schnitt)`);
    return blind(ausZonen(teile), rev);
}

// Eine Stamm-Zeile (1-basiert, im virtuellen Text) → `datei:zeile` im Baum.
function ort(root, zeile) {
    const st = [];
    ausZonen(teileVon(root), st);
    const s = st.find(([, , n, ab]) => zeile >= ab && zeile < ab + n);
    return s ? `${s[0]}:${s[1] + zeile - s[3]}` : `${DIR}/?:${zeile}`;
}

// Die Datei, die eine Methode (oder einen statischen Getter) definiert; null, wenn keine.
function dateiVon(root, methode) {
    const name = methode.replace(/[$]/g, "\\$");
    const rx = new RegExp(`^ {4}(?:static\\s+)?(?:async\\s+)?(?:get\\s+|set\\s+)?\\*?${name}\\s*\\(`, "m");
    for (const t of teileVon(root)) if (rx.test(t.text)) return t.pfad;
    return null;
}

// Der Kopf einer Klassen-Methode am NAMEN: der Index des Zeilenumbruchs vor `    [static ][async ][get |set ]name(`, ab
// `ab`; -1 ohne Treffer. Eine Linse findet eine Methode an ihrem Namen, nie an ihrer Parameter-Liste — ein neuer Parameter
// bricht keine Linse, die ihn nicht prüft (gate:apparat, Klinge 3).
const kopfRx = (methode) =>
    new RegExp(`\\n {4}(?:static\\s+)?(?:async\\s+)?(?:get\\s+|set\\s+)?\\*?${methode.replace(/[$]/g, "\\$")}\\(`, "g");
function kopf(t, methode, ab = 0) {
    const rx = kopfRx(methode);
    rx.lastIndex = ab;
    const m = rx.exec(t);
    return m ? m.index : -1;
}

// DER RUMPF AM KOPF (D2-N1) — der EINE Rumpf-Schneider jeder Linse: `rumpf(t, kopf)` gibt den Block `{…}`, der DIREKT an
// einem Kopf hängt (ein Name sucht das Klassen-Glied wie `kopf`, ein Regex jeden Kopf): nach dem Treffer höchstens die
// Parameter-Liste, ein `=>` und Leerraum, dann `{`. Ein Aufruf (`this._x(a);`, `if (this._x(a)) {`) trägt keinen eigenen
// Block und zählt nie (der erste TEXT-Treffer hängt an der Datei-Reihenfolge). null ohne
// Definition; der Zähler liest Klammern blind wie jeder Schneider vor ihm (Linsen lesen kommentar-gestrippten Text), mit
// `{ zitate: true }` überspringt er "…" und '…' (die Zeilen eines Daten-Literals tragen Klammern in Zeichenketten).
function blockAm(t, a, e) {
    if (t[e - 1] === "{") return e - 1;
    let tiefe = 0,
        i = e;
    for (let j = a; j < e; j++) tiefe += t[j] === "(" ? 1 : t[j] === ")" ? -1 : 0;
    const leer = () => {
        while (i < t.length && /\s/.test(t[i])) i++;
    };
    if (tiefe < 0) return -1;
    if (tiefe === 0) leer();
    if (tiefe === 0 && t[i] === "(") (tiefe = 1), i++;
    for (; tiefe > 0 && i < t.length; i++) tiefe += t[i] === "(" ? 1 : t[i] === ")" ? -1 : 0;
    leer();
    if (t.startsWith("=>", i)) (i += 2), leer();
    return t[i] === "{" ? i : -1;
}
function rumpf(t, k, { zitate = false } = {}) {
    const rx = typeof k === "string" ? kopfRx(k) : new RegExp(k.source, k.flags.replace("g", "") + "g");
    for (let m; (m = rx.exec(t)); ) {
        if (!m[0]) {
            rx.lastIndex++;
            continue;
        }
        const b = blockAm(t, m.index, m.index + m[0].length);
        if (b < 0) continue;
        for (let i = b, tiefe = 0, zitat = null; i < t.length; i++) {
            const c = t[i];
            if (zitat) {
                if (c === "\\") i++;
                else if (c === zitat) zitat = null;
            } else if (zitate && (c === '"' || c === "'")) zitat = c;
            else if (c === "{") tiefe++;
            else if (c === "}" && --tiefe === 0) return t.slice(b, i + 1);
        }
        return null;
    }
    return null;
}

// DIE GLIEDER AM AST (K38-N2, Prüfer Runde 3) — eine Linse, die Code einer Methode zuordnet, liest die Glieder der Klassen
// am AST (acorn), nie an einem Kopf-Muster: ein Kopf mit Default-Parametern (`_x(a = f()) {`), ein umbrochener Kopf, ein
// Getter oder ein `async`-Kopf machten jedes Muster blind, und der Aufruf fiel still der Methode davor zu (gate:apparat,
// Klinge 4, nennt jedes Kopf-Muster). `glieder(t)` liefert jedes äußerste Glied einer Klasse (Methode, Getter, Feld) mit
// Bereich und Zeilen, `gliedAn(gl, i)` das Glied um einen Index, `rufe(t)` jeden Aufruf mit seinem Glied, dem Gerufenen
// als Text und den Argument-Knoten (ein Argument ist ein Knoten — `s.cam || s.camera` und `f(a, b)` sind je EINES).
// `wandere(n, f)` geht jeden Knoten mit seinen Ahnen (f gibt false: nicht tiefer). Je Text EINMAL geparst.
let astMerk = { t: null };
function ast(t) {
    if (astMerk.t !== t) {
        const acorn = require("acorn");
        const baum = acorn.parse(t, { ecmaVersion: "latest", sourceType: "script", allowHashBang: true, allowReturnOutsideFunction: true });
        const zeilenAb = [0];
        for (let i = t.indexOf("\n"); i !== -1; i = t.indexOf("\n", i + 1)) zeilenAb.push(i + 1);
        astMerk = { t, baum, zeilenAb, glieder: null, rufe: null };
    }
    return astMerk.baum;
}
// Die Zeile (1-basiert) eines Index im zuletzt geparsten Text.
function zeileVon(t, i) {
    ast(t);
    const z = astMerk.zeilenAb;
    let lo = 0,
        hi = z.length - 1;
    while (lo < hi) {
        const mid = (lo + hi + 1) >> 1;
        if (z[mid] <= i) lo = mid;
        else hi = mid - 1;
    }
    return lo + 1;
}
// DER EINE Kinder-Gang eines AST-Knotens (jedes Kind, das ein Knoten ist, ohne `loc`) — wandere und jede Linse lesen ihn
function kinder(n, f) {
    for (const k in n) {
        const v = n[k];
        if (Array.isArray(v)) {
            for (const c of v) if (c && typeof c.type === "string") f(c);
        } else if (v && typeof v.type === "string" && k !== "loc") f(v);
    }
}
function wandere(n, f, ahnen = []) {
    if (f(n, ahnen) === false) return;
    ahnen.push(n);
    kinder(n, (c) => wandere(c, f, ahnen));
    ahnen.pop();
}
const schluesselVon = (t, n) =>
    !n.computed && (n.key.type === "Identifier" || n.key.type === "PrivateIdentifier")
        ? n.key.name
        : n.key.type === "Literal"
          ? String(n.key.value)
          : t.slice(n.key.start, n.key.end);
function glieder(t) {
    ast(t);
    if (astMerk.glieder) return astMerk.glieder;
    const out = [];
    wandere(astMerk.baum, (n) => {
        if (n.type !== "MethodDefinition" && n.type !== "PropertyDefinition") return true;
        out.push({
            name: schluesselVon(t, n),
            art: n.kind || "feld",
            statisch: !!n.static,
            start: n.start,
            ende: n.end,
            zeile: zeileVon(t, n.start),
            bisZeile: zeileVon(t, n.end - 1),
            knoten: n,
        });
        return false; // das äußerste Glied: was in ihm steht (auch eine innere Klasse), gehört ihm
    });
    out.sort((a, b) => a.start - b.start);
    return (astMerk.glieder = out);
}
function gliedAn(gl, i) {
    let lo = 0,
        hi = gl.length - 1,
        g = null;
    while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (gl[mid].start <= i) {
            g = gl[mid];
            lo = mid + 1;
        } else hi = mid - 1;
    }
    return g && i < g.ende ? g : null;
}
function rufe(t) {
    const gl = glieder(t);
    if (astMerk.rufe) return astMerk.rufe;
    const out = [];
    wandere(astMerk.baum, (n) => {
        if (n.type !== "CallExpression") return true;
        const c = n.callee;
        const name =
            c.type === "Identifier"
                ? c.name
                : c.type === "MemberExpression" && !c.computed
                  ? c.property.name
                  : c.type === "MemberExpression" && c.property.type === "Literal"
                    ? String(c.property.value)
                    : null;
        const g = gliedAn(gl, n.start);
        out.push({
            ziel: t.slice(c.start, c.end),
            name,
            glied: g ? g.name : null,
            args: n.arguments,
            start: n.start,
            ende: n.end,
            knoten: n,
        });
        return true;
    });
    return (astMerk.rufe = out);
}

// DIE STELLE IM STAMM (D2-N2) — die EINE Engstelle jeder Probe und jeder Mutation am Stamm-Text: `x` (Text oder Regex)
// steht höchstens EINMAL im benannten Glied (`glied` = Name einer Methode, eines Getters oder Felds, am AST) oder — `null`
// — im ganzen Stamm; mehrere wirft, keiner gibt der Probe null und wirft der Mutation (sie wäre vakuös). Der erste TEXT-
// Treffer im ganzen Stamm hängt an der Datei-Reihenfolge; gate:apparat Klinge 6 nennt jeden rohen ersten Treffer.
// `treffer` gibt den Treffer wie `exec` (Index im ganzen Text), `ersetze` den ganzen Text mit der EINEN Stelle ersetzt
// (`neu` wie bei `replace`); die Glieder-Tafel des Ergebnisses wandert verschoben mit (eine Kette parst den Stamm einmal).
const tafeln = new Map();
function merkeTafel(t, tafel) {
    tafeln.set(t, tafel);
    while (tafeln.size > 8) tafeln.delete(tafeln.keys().next().value);
    return tafel;
}
const gliedTafel = (t) => tafeln.get(t) || merkeTafel(t, glieder(t).map(({ name, start, ende }) => ({ name, start, ende })));
function stelleIm(t, glied, x, muss) {
    const g = glied == null ? [{ start: 0, ende: t.length }] : gliedTafel(t).filter((e) => e.name === glied);
    if (g.length > 1 || (muss && !g.length)) throw new Error(`stammLib.treffer: Glied „${glied}" steht ${g.length}× im Stamm`);
    if (!g.length) return null;
    const b = t.slice(g[0].start, g[0].ende);
    const rx = typeof x === "string" ? null : new RegExp(x.source, x.flags.replace(/[gy]/g, "") + "g");
    const alle = [];
    if (rx) for (const m of b.matchAll(rx)) alle.push(m);
    else for (let i = b.indexOf(x); i >= 0 && alle.length < 2; i = b.indexOf(x, i + 1)) alle.push(Object.assign([x], { index: i }));
    if (alle.length > 1 || (muss && !alle.length))
        throw new Error(
            `stammLib.treffer: „${String(x).slice(0, 70)}" steht ${alle.length}× in ${glied == null ? "dem ganzen Stamm" : glied} — ` +
                (alle.length ? "der erste Treffer hinge an der Reihenfolge" : "die Mutation wäre vakuös")
        );
    return alle.length ? { a: g[0].start, b, rx, m: alle[0] } : null;
}
function treffer(t, glied, x) {
    const s = stelleIm(t, glied, x, false);
    return s && Object.assign(s.m, { index: s.m.index + s.a });
}
function ersetze(t, glied, x, neu) {
    if (Array.isArray(glied)) return glied.reduce((r, [g, x2, n2]) => ersetze(r, g, x2, n2), t); // die Kette: [[glied, x, neu], …]
    const { a, b, rx, m } = stelleIm(t, glied, x, true);
    const r = t.slice(0, a) + b.replace(rx ? new RegExp(rx.source, rx.flags.replace("g", "")) : x, neu) + t.slice(a + b.length);
    if (tafeln.has(t)) {
        const i = a + m.index;
        const d = r.length - t.length;
        merkeTafel(r, tafeln.get(t).map((e) => ({ name: e.name, start: e.start > i ? e.start + d : e.start, ende: e.ende > i ? e.ende + d : e.ende })));
    }
    return r;
}

// Die Stamm-Datei, die den Text `stelle` trägt (ein Server-Patcher fragt, wohin seine Zeile gehört): genau eine → ihr
// Pfad; keine → null; mehrere → wirft (der Patch wäre mehrdeutig).
function dateiMit(root, stelle) {
    const mit = teileVon(root)
        .filter((t) => t.text.includes(stelle))
        .map((t) => t.pfad);
    if (mit.length > 1) throw new Error(`dateiMit: ${mit.join(", ")} tragen „${String(stelle).slice(0, 60)}"`);
    return mit[0] || null;
}

const istStammDatei = (rel) => rel === ALT || ZONEN_DATEI_RX.test(rel);

// Server-Patcher: die Bytes einer Stamm-URL („/stamm/…") aus einem (gepatchten) virtuellen Stamm `t` — die Datei, die die
// Zeile trägt. Keine Stamm-URL → null; eine Stamm-URL, die S(t) nicht kennt, wirft.
const lieferCache = { t: null, teile: null };
function liefere(root, urlPfad, t) {
    if (!ZONEN_DATEI_RX.test(String(urlPfad).replace(/^\//, ""))) return null;
    if (lieferCache.t !== t) Object.assign(lieferCache, { t, teile: schneide(t) });
    const rel = String(urlPfad).replace(/^\//, "");
    const teil = lieferCache.teile.find((x) => x.pfad === rel);
    if (!teil) throw new Error(`liefere: ${rel} ist keine Datei von S(Stamm)`);
    return Buffer.from(teil.text, "utf8");
}

// Der Träger von AnazhRealm.VERSION: genau EINE Stamm-Datei mit genau EINER Zeile — sonst wirft er.
function versionsDatei(root) {
    const rx = /^AnazhRealm\.VERSION = "[0-9.]+";$/gm;
    const treffer = teileVon(root).map((t) => [t.pfad, (t.text.match(rx) || []).length]);
    const mit = treffer.filter(([, n]) => n > 0);
    if (mit.length !== 1 || mit[0][1] !== 1)
        throw new Error(
            `VERSION-Träger: ${mit.map(([p, n]) => `${p}×${n}`).join(", ") || "keiner"} statt genau einer Zeile`
        );
    return mit[0][0];
}

// index.html: der Stamm-Tag-Block → die Tags für `pfade` (Einzug und ?v= vom alten Block); ein Eintrag ist ein Pfad (früh) oder
// { pfad, spaet }.
function tagsSetzen(html, pfade) {
    const tags = tagsVon(html);
    if (!tags.length) throw new Error("tagsSetzen: index.html trägt keinen Stamm-Tag");
    for (let i = 1; i < tags.length; i++)
        if (tags[i].zeile !== tags[i - 1].zeile + 1)
            throw new Error("tagsSetzen: die Stamm-Tags stehen nicht als ein Block");
    const z = html.split("\n");
    const { einzug, v } = tags[0];
    const neu = pfade.map((p) => `${einzug}<script src="${p.pfad || p}${v}" ${p.spaet ? 'type="spaet"' : "defer"}></script>`);
    z.splice(tags[0].zeile, tags.length, ...neu);
    return z.join("\n");
}

// ── die Klasse im vm (Beweis-Lader) ───────────────────────────────────────────────────────────────────────────────
// Lädt die klassischen Skripte, die index.html VOR dem Stamm lädt, dann den Stamm — als EIN Skript (`monolith`) oder je
// Datei (`teile`, sonst der Baum). Derselbe globale lexikalische Raum wie <script defer>. Der Boot pollt window.THREE
// über setTimeout (hier stumm) — er ruft den Konstruktor nie. window.THREE setzt im Browser der Modul-Bootstrap; im vm
// trägt das UMD-Bündel vendor/three.min.js die Top-Level-Symbole der Kerne (für alt und neu dasselbe).
function ladeKlasse(root, opt = {}) {
    const vm = require("vm");
    const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
    const vor = ["vendor/three.min.js"];
    for (const m of html.matchAll(/<script(?![^>]*type="module")[^>]*\ssrc="([^"?:]+)(?:\?[^"]*)?"[^>]*><\/script>/g)) {
        if (istStammDatei(m[1])) break;
        vor.push(m[1]);
    }
    const stumm = () => {};
    const g = { console: { log: stumm, warn: stumm, error: stumm, info: stumm, debug: stumm } };
    Object.assign(g, { setTimeout: stumm, clearTimeout: stumm, setInterval: stumm, clearInterval: stumm });
    Object.assign(g, { requestAnimationFrame: stumm, performance: { now: () => 0 }, TextEncoder, TextDecoder, URL });
    // Der Boot (`_bootAnazhRealm`) wartet auf `window.THREE` — im vm trägt das UMD-Bündel THREE als globales Symbol, und der
    // Boot rief den Konstruktor samt init() (das DOM fehlt: die Ablehnung beendete jeden Lader-Prozess mit Exit 1, K55). Das
    // Fenster des vm ist darum das Global ohne THREE: der Boot pollt stumm, die Kerne und der Stamm lesen THREE frei.
    g.window = new Proxy(g, { get: (t, k) => (k === "THREE" ? undefined : t[k]), has: (t, k) => k !== "THREE" && k in t });
    g.self = g;
    g.globalThis = g;
    const ctx = vm.createContext(g);
    for (const f of vor) new vm.Script(fs.readFileSync(path.join(root, f), "utf8"), { filename: f }).runInContext(ctx);
    const skripte = opt.monolith != null ? [{ pfad: ALT, text: opt.monolith }] : opt.teile || teileVon(root);
    const t0 = process.hrtime.bigint();
    for (const s of skripte) new vm.Script(s.text, { filename: s.pfad }).runInContext(ctx);
    const ms = Number(process.hrtime.bigint() - t0) / 1e6;
    return { AnazhRealm: vm.runInContext("AnazhRealm", ctx), ctx, ms, vor };
}

// Der Klassen-Fingerabdruck: geordnete Reflect.ownKeys von Prototyp und Konstruktor, Deskriptor-Art, sha256 von
// toString je Glied, name/length, Datenwerte (util.inspect). Der Klassen-Text selbst (`constructor` auf P, toString von
// A) ist ausgenommen — er IST, was der Schnitt ändert.
function fingerabdruck(A) {
    const util = require("util");
    const zeilen = [];
    const art = (d) =>
        ("value" in d
            ? typeof d.value === "function"
                ? "fn"
                : "daten"
            : (d.get ? "get" : "") + (d.set ? "set" : "")) +
        `|e${+!!d.enumerable}c${+!!d.configurable}w${d.writable === undefined ? "-" : +!!d.writable}`;
    for (const [seite, o] of [
        ["P", A.prototype],
        ["S", A],
    ]) {
        for (const k of Reflect.ownKeys(o)) {
            if (k === "prototype" || (seite === "P" && k === "constructor")) {
                zeilen.push([seite, String(k), "ref"].join("|"));
                continue;
            }
            const d = Object.getOwnPropertyDescriptor(o, k);
            const fn = d.get || d.set || (typeof d.value === "function" ? d.value : null);
            const q = fn ? sha(Function.prototype.toString.call(fn)).slice(0, 16) : "";
            const nl = fn ? `${fn.name}/${fn.length}` : "";
            let daten = "";
            if ("value" in d && typeof d.value !== "function" && k !== "length" && k !== "name")
                daten = sha(
                    util.inspect(d.value, {
                        depth: 12,
                        maxArrayLength: 1e7,
                        maxStringLength: 1e8,
                        breakLength: Infinity,
                    })
                ).slice(0, 16);
            zeilen.push([seite, String(k), art(d), q, nl, daten].join("|"));
        }
    }
    return { zeilen, sha: sha(zeilen.join("\n")).slice(0, 16) };
}

// DER EINE KOMMENTAR-STRIPPER (PFLICHT-OFFEN D3): der Code eines Quelltexts ohne Kommentare, zeichenweise wie ein
// Tokenizer — Strings, Template-Literale (samt Code in `${…}`), Regex-Literale und URLs bleiben stehen, nur `//`- und
// `/* */`-Kommentare fallen, jeder Zeilenumbruch bleibt (Zeilennummern eines Befunds = die der Datei). `ohneLiterale`
// leert dazu jedes Literal bis auf ein Leerzeichen (der Proben-Leser von gate:source-probes sucht nur Code-Tokens). Bis
// D3a trug der Apparat 171 Stripper-Stellen in 65 Dateien mit verschiedener Semantik: `//.*$` schnitt `"https://…"` samt
// Rest der Zeile, der Block-Regex fraß ab einem `"/*"` im String bis zum nächsten Kommentar-Ende. Selbstgenügsam (kein
// Name von außerhalb des Rumpfs): welt-boot.cjs trägt ihn als Text in jede Seite (`window.__codeOf`). Die Wand:
// gate:betriebsgesetz STRIPPER-WAND — ein Stripper außerhalb dieser Datei ist ROT; die Tafel: `--selftest`.
function ohneKommentare(src, ohneLiterale = false) {
    const s = String(src);
    const n = s.length;
    const VOR_REGEX = "(,=:[!&|?{};+-*%<>~^";
    const WORT_VOR_REGEX = /(?:^|[^\w$])(?:return|typeof|instanceof|case|in|of|delete|void|throw|new|else|do|yield|await)\s*$/;
    const CODE = /[/'"`{}]/g; // wo im Code etwas beginnt oder eine `${…}`-Ebene schließt
    const ENDE = { "'": /['\\\n\r]/g, '"': /["\\\n\r]/g, "`": /[`\\$]/g, re: /[/\\[\]\n\r]/g, zeile: /[\n\r]/g };
    const umbrueche = (t) => t.replace(/[^\n\r]/g, "");
    const lit = (t) => (ohneLiterale ? umbrueche(t) : t);
    const teile = [];
    let modus = s.startsWith("#!") ? "zeile" : "code"; // code · zeile · block · ' · " · ` · re
    let prev = ""; // das letzte bedeutsame Code-Zeichen; '"' = ein Literal endete (ein Operand, danach teilt `/`)
    let klasse = false; // im Regex-Literal innerhalb `[…]` (dort schließt `/` nicht)
    const ebenen = []; // je offenem `${` eines Template-Literals die Zahl offener `{` darin
    let i = 0;
    while (i < n) {
        if (modus === "block") {
            const j = s.indexOf("*/", i);
            teile.push(umbrueche(s.slice(i, j < 0 ? n : j)));
            i = j < 0 ? n : j + 2;
            modus = "code";
            continue;
        }
        const rx = modus === "code" ? CODE : ENDE[modus];
        rx.lastIndex = i;
        const m = rx.exec(s);
        const j = m ? m.index : n;
        if (j > i) {
            const lauf = s.slice(i, j);
            if (modus === "code") {
                teile.push(lauf);
                const t = lauf.trimEnd();
                if (t) prev = t[t.length - 1];
            } else if (modus !== "zeile") teile.push(lit(lauf));
            i = j;
            if (!m) break;
        }
        const c = s[i];
        const d = i + 1 < n ? s[i + 1] : "";
        if (modus === "zeile") {
            modus = "code"; // der Umbruch bleibt, der Code-Lauf trägt ihn
            continue;
        }
        if (modus === "code") {
            if (c === "/" && (d === "/" || d === "*")) {
                modus = d === "/" ? "zeile" : "block";
                i += 2;
                continue;
            }
            const regex =
                c === "/" &&
                (prev === "" ||
                    VOR_REGEX.includes(prev) ||
                    (/[\w$]/.test(prev) && WORT_VOR_REGEX.test(s.slice(Math.max(0, i - 32), i))));
            if (regex || c === "'" || c === '"' || c === "`") {
                modus = regex ? "re" : c;
                klasse = false;
                teile.push(ohneLiterale ? " " : c);
            } else if (ebenen.length && c === "}" && ebenen[ebenen.length - 1] === 0) {
                ebenen.pop();
                modus = "`";
                teile.push(lit(c));
            } else {
                if (ebenen.length && (c === "{" || c === "}")) ebenen[ebenen.length - 1] += c === "{" ? 1 : -1;
                teile.push(c);
                prev = c;
            }
            i++;
            continue;
        }
        // in einem Literal: String (' "), Template (`) oder Regex (re)
        if (c === "\\") {
            teile.push(lit(c + d));
            i += 2;
        } else if (modus === "`" && c === "$") {
            if (d === "{") {
                ebenen.push(0);
                modus = "code";
                prev = "{";
                teile.push(lit("${"));
                i += 2;
            } else {
                teile.push(lit(c));
                i++;
            }
        } else if (c === "\n" || c === "\r") {
            modus = "code"; // ein String oder Regex endet nie über die Zeile — war es keiner, fängt sich der Zustand hier
        } else if (modus === "re" && (c !== "/" || klasse)) {
            if (c === "[" || c === "]") klasse = c === "[";
            teile.push(lit(c));
            i++;
        } else {
            modus = "code"; // das schließende Zeichen
            prev = '"';
            teile.push(lit(c));
            i++;
        }
    }
    return teile.join("");
}

// Die Tafel des EINEN Strippers (gate:betriebsgesetz STRIPPER-WAND fährt sie in jedem `npm run check`): echte Zeilen des
// Stamms, an denen die alten Kopien rissen, dazu die Ränder — [Herkunft, Eingabe, Soll, ohneLiterale].
const STRIPPER_TAFEL = [
    [
        "stamm/02b.js Ollama-Basis (Regex mit `\\//` und `[^/]`)",
        "if (/\\/(api|v1)\\//.test(base) || /\\/(api|v1)\\/[^/]+$/.test(base)) { // Basis",
        "if (/\\/(api|v1)\\//.test(base) || /\\/(api|v1)\\/[^/]+$/.test(base)) { ",
    ],
    [
        "stamm/03a.js Raum-Adresse (Regex endet auf `\\//i`, String mit URL)",
        'if (/^anazh:\\/\\//i.test(normalized)) normalized = normalized.replace(/^anazh:\\/\\//i, "ws://"); // tolerant',
        'if (/^anazh:\\/\\//i.test(normalized)) normalized = normalized.replace(/^anazh:\\/\\//i, "ws://"); ',
    ],
    [
        "stamm/14.js Einladung (Template mit Regex im `${…}`)",
        'const code = `anazh://${addr.broker.replace(/^wss?:\\/\\//i, "")}/${addr.roomId}`; /* Einladung */',
        'const code = `anazh://${addr.broker.replace(/^wss?:\\/\\//i, "")}/${addr.roomId}`; ',
    ],
    [
        "stamm/02b.js KI-Endpunkt (URL im String)",
        'endpoint: () => "https://api.anthropic.com/v1/messages", // Anthropic',
        'endpoint: () => "https://api.anthropic.com/v1/messages", ',
    ],
    [
        "stamm/11c.js Feld-Shader (WGSL-Kommentar ist String)",
        '"    // DER SCHWUND: dieselbe Interleaved-Gradient-Blende (__phytoCore.lodDitherIGN)\\n" +',
        '"    // DER SCHWUND: dieselbe Interleaved-Gradient-Blende (__phytoCore.lodDitherIGN)\\n" +',
    ],
    ["Teilung ist kein Regex", "const h = a / b / 2; // halb", "const h = a / b / 2; "],
    ["Block über Zeilen behält die Umbrüche", "x = 1; /* a\n b */ y = 2;", "x = 1; \n y = 2;"],
    ['"/*" im String frisst keinen Code', 'const g = "scripts/*.cjs"; /* Muster */ f(g); // */ h();', 'const g = "scripts/*.cjs";  f(g); '],
    ["Regex nach Schlüsselwort", "return /\\/\\//.test(s); // zwei Striche", "return /\\/\\//.test(s); "],
    ["ohneLiterale leert jedes Literal, Code im `${…}` bleibt", 'f("a//b", /c/g, `d${e}`); // z', "f( ,  g,  e); ", true],
];
// → die Befunde (leer = grün); mit `root` dazu der ganze Stamm gegen acorn: dieselbe Token-Folge ohne einen Kommentar,
// dieselbe Zeilenzahl.
function stripperTafel(root) {
    const rot = [];
    for (const [wo, ein, soll, ohneLit] of STRIPPER_TAFEL) {
        const ist = ohneKommentare(ein, !!ohneLit);
        if (ist !== soll) rot.push(`${wo}: ${JSON.stringify(ist)} statt ${JSON.stringify(soll)}`);
    }
    if (!root) return rot;
    const acorn = require("acorn");
    const folge = (t) => {
        const z = { tok: [], kom: 0 };
        const opt = { ecmaVersion: "latest", allowHashBang: true, onComment: () => z.kom++ };
        for (const k of acorn.tokenizer(t, opt)) z.tok.push(t.slice(k.start, k.end));
        return z;
    };
    const T = text(root);
    const a = folge(T);
    const S = ohneKommentare(T);
    const b = folge(S);
    const k = a.tok.findIndex((x, j) => x !== b.tok[j]);
    if (b.kom || k >= 0 || a.tok.length !== b.tok.length || T.split("\n").length !== S.split("\n").length)
        rot.push(
            `der Stamm gegen acorn: ${b.kom} Kommentare übrig, Token ${k} ${JSON.stringify(a.tok[k])} → ${JSON.stringify(b.tok[k])}, ` +
                `Zeilen ${T.split("\n").length} → ${S.split("\n").length}`
        );
    return rot;
}

// DER EINE ABSENZ-HELFER in Node (PFLICHT-OFFEN D3d), der Zwilling von `window.__fehlt` (welt-boot.cjs): true = `re` fehlt
// im Code ohne Kommentare. `glied` ein Name (das Klassen-Glied wie `rumpf`), ein Kopf-Regex, eine Liste davon oder null (der
// ganze Text); `quelle` der Text — ohne ihn der virtuelle Stamm der Wurzel, als Funktion gewandelt (der Vor-Stand eines
// Selbsttests), als `{ datei, wandel, wurzel }` eine Datei (Kern, Studio, Worker, index.html) oder der Stamm einer anderen
// Wurzel. Ein Glied ohne Definition wirft: eine Absenz an einem Toten misst nichts (gate:source-probes, Quelltext-Wand).
const fehltMerk = { basis: new Map(), roh: null, nc: null };
function fehlt(glied, re, quelle) {
    const q = quelle != null && typeof quelle === "object" ? quelle : { wandel: quelle };
    const wurzel = q.wurzel || path.resolve(__dirname, "..", "..");
    const basis = (k = path.join(wurzel, q.datei || "")) => {
        if (!fehltMerk.basis.has(k)) fehltMerk.basis.set(k, q.datei ? fs.readFileSync(k, "utf8") : text(wurzel));
        return fehltMerk.basis.get(k);
    };
    const roh = typeof q.wandel === "string" ? q.wandel : typeof q.wandel === "function" ? q.wandel(basis()) : basis();
    if (fehltMerk.roh !== roh) Object.assign(fehltMerk, { roh, nc: ohneKommentare(roh) });
    const nc = fehltMerk.nc;
    // der Leib eines Glieds und seine Lage im Text (die Zeile des Täters bleibt die der Quelle)
    const leib = (t, g) => {
        const b = rumpf(t, g);
        if (b == null) throw new Error(`stammLib.fehlt: das Glied ${g} hat keine Definition — die Absenz misst nichts`);
        return [b, t.indexOf(b, Math.max(0, typeof g === "string" ? kopf(t, g) : t.search(g)))];
    };
    // `{ ausser }`: der ganze Text, der Leib der Engstelle(n) geleert — die Invariante lebt NUR im Chokepoint (Lehre 2)
    const ohne = (t, a) => {
        const [b, i] = leib(t, a);
        return t.slice(0, i) + b.replace(/[^\n]/g, " ") + t.slice(i + b.length);
    };
    fehlt.wo = null;
    return [].concat(glied).every((g) => {
        const [b, at] = g == null ? [nc, 0] : g.ausser ? [[].concat(g.ausser).reduce(ohne, nc), 0] : leib(nc, g);
        re.lastIndex = 0;
        const m = re.exec(b);
        if (!m) return true;
        // der Täter beim Namen: `fehlt.wo` = Datei:Zeile und der Treffer
        const z = nc.slice(0, at + m.index).split("\n").length;
        fehlt.wo = `${q.datei ? `${q.datei}:${z}` : q.wandel == null ? ort(wurzel, z) : `Zeile ${z}`} \`${m[0].slice(0, 60)}\``;
        return false;
    });
}

// DER EINE Text-Merge: git merge-file auf drei Texten → { text, n Konflikte } — der Rahmen um die Register (der Treiber,
// scripts/bump-version.cjs) und der virtuelle Stamm des Re-Home (`histogram`, der Algorithmus von merge-ort, ab git 2.44)
function textMerge(a, o, b, { labels = ["ours", "base", "theirs"], groesse = 7, histogram = false } = {}) {
    const d = fs.mkdtempSync(path.join(require("os").tmpdir(), "text-merge-"));
    const f = [a, o, b].map((t, i) => (fs.writeFileSync(path.join(d, "aob"[i]), t), path.join(d, "aob"[i])));
    const args = ["merge-file", "-p", `--marker-size=${groesse}`, ...(histogram ? ["--diff-algorithm=histogram"] : [])];
    try {
        const o2 = { encoding: "utf8", maxBuffer: 1 << 30, stdio: ["ignore", "pipe", "pipe"] };
        return { text: require("child_process").execFileSync("git", [...args, ...labels.flatMap((l) => ["-L", l]), ...f], o2), n: 0 };
    } catch (e) {
        if (!(e.status > 0 && e.status < 128) || typeof e.stdout !== "string") throw e;
        return { text: e.stdout, n: e.status };
    } finally {
        fs.rmSync(d, { recursive: true, force: true });
    }
}

// DER PRÜFER der Stamm-Werkzeuge (stamm-lib · stamm-umzug · stamm-rehome): `pruef(name, ok, info)` je Zeile, `pruef.ende(wer)`
// nennt das Urteil des Selbsttests und liefert die Zahl der Roten
function pruefZaehler() {
    let rot = 0;
    const pruef = (name, ok, info) => {
        console.log(`${ok ? "  ok " : "  ROT"} ${name}${info ? " — " + info : ""}`);
        if (!ok) rot++;
    };
    pruef.ende = (wer) => (console.log(rot ? `${wer}: ${rot} ROT` : `${wer}: Selbsttest grün`), rot);
    return pruef;
}

module.exports = {
    HINWEIS,
    spaeteVon,
    pruefZaehler,
    textMerge,
    kinder,
    ohneKommentare,
    fehlt,
    stripperTafel,
    ALT,
    DIR,
    KARTE,
    sha,
    marker,
    pfadVon,
    klasseVon,
    karteVon,
    karteAus,
    aussenName,
    ordne,
    heileKarte,
    karteText,
    schneide,
    fuege,
    tagsVon,
    tagsSetzen,
    dateien,
    teileVon,
    gitIn,
    text,
    textAusRev,
    ort,
    dateiVon,
    kopf,
    rumpf,
    treffer,
    ersetze,
    ast,
    zeileVon,
    wandere,
    glieder,
    gliedAn,
    rufe,
    dateiMit,
    istStammDatei,
    liefere,
    versionsDatei,
    ladeKlasse,
    fingerabdruck,
};

// ── Selbsttest ────────────────────────────────────────────────────────────────────────────────────────────────────
if (require.main === module && process.argv.includes("--selftest")) {
    const os = require("os");
    const root = path.resolve(__dirname, "..", "..");
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "stamm-lib-"));
    const pruef = pruefZaehler();
    const wirft = (fn, rx) => {
        try {
            fn();
            return false;
        } catch (e) {
            return rx.test(e.message);
        }
    };
    const baum = (name, teile, html) => {
        const d = path.join(tmp, name);
        fs.mkdirSync(path.join(d, DIR), { recursive: true });
        for (const t of teile) fs.writeFileSync(path.join(d, t.pfad), t.text);
        fs.writeFileSync(path.join(d, "index.html"), html);
        return d;
    };
    try {
        // R) der Rumpf an der Definition: steht der Aufruf VOR der Definition (die Lage nach dem Umzug, gate:vehicle-drive A5),
        // schneidet er die Definition — am Regex wie am Namen; ein Default-Parameter `{}` ist kein Block; zitate überspringt "{".
        const R = 'class B {\n    _a() {\n        if (this._p(e)) return this._p(e);\n    }\n}\nclass C {\n    _p(e, o = {}) {\n        return { x: "}" };\n    }\n}\n';
        const soll = '{\n        return { x: "}" };\n    }';
        pruef("rumpf: die Definition, nie der Aufruf davor", rumpf(R, /_p\(/, { zitate: true }) === soll, JSON.stringify(rumpf(R, /_p\(/, { zitate: true })));
        pruef("rumpf: am Namen die Definition, quote-sicher", rumpf(R, "_p", { zitate: true }) === soll);
        pruef("rumpf: nur Aufrufe → null, nie der Block danach", rumpf(R, /_p\(e\)\s*/) === null && rumpf(R, /_q\(/) === null);
        // R2) die Stelle im Stamm (D2-N2): im benannten Glied, nie am ersten Text-Treffer; zwei Treffer werfen, keiner gibt
        // der Probe null und wirft der Mutation; die Kette trägt die Glieder-Tafel weiter
        const R2 = ersetze(R, [["_p", 'x: "}"', 'x: "{"'], ["_a", /return (this)/, "return $1"]]);
        pruef("ersetze: im Glied, als Kette", R2 === R.replace('x: "}"', 'x: "{"') && treffer(R2, "_p", "x:").index === R2.indexOf("x:"));
        pruef("treffer: zwei Treffer werfen, keiner ist null", wirft(() => treffer(R, "_a", "this._p(e)"), /2×/) && treffer(R, "_p", "fehlt") === null);
        pruef("ersetze: vakuös und mehrdeutig werfen", wirft(() => ersetze(R, "_p", "fehlt", ""), /vakuös/) && wirft(() => ersetze(R, null, "_p(e", ""), /Reihenfolge/));
        // R3) der EINE Absenz-Helfer: im Glied, außerhalb der Engstelle, gewandelt; ein Toter wirft, nie still wahr
        const F = (g, re, q) => fehlt(g, re, q === undefined ? R : q);
        pruef(
            "fehlt: im Glied mit dem Täter beim Namen · ausser der Engstelle · gewandelt · ein Toter wirft",
            !F("_p", /x:/) && fehlt.wo === "Zeile 8 `x:`" && F("_a", /x:/) && fehlt.wo === null && F({ ausser: "_p" }, /x:/) && !F({ ausser: "_a" }, /x:/) && !F(null, /y:/, R.replace("x:", "y:")) &&
                wirft(() => F("_q", /x/), /keine Definition/) && wirft(() => F({ ausser: "_q" }, /x/), /keine Definition/)
        );
        // 0) die Glieder am AST: ein Kopf mit Default-Parameter, ein umbrochener, ein Getter und ein async-Kopf behalten
        // ihren Aufruf; ein zusammengesetztes Argument ist EIN Argument (die Täter der Kopf- und Argument-Muster, K38-N2).
        const G = [
            "class A {",
            "    _a() { x.render(s, c); }",
            "    _b(k, o = f(1), cb = () => {}) { s.renderer.render(s.scene, s.cam || s.camera); }",
            "    _c(",
            "        a,",
            "        b",
            "    ) { r.render(q ? s : t, h(c, d)); }",
            "    get d() { return this._z(1); }",
            "    async _e() { await y.render(a, b); }",
            "}",
        ].join("\n");
        const rs = rufe(G).filter((r) => r.name === "render" || r.ziel === "this._z");
        pruef(
            "rufe/glieder: jeder Aufruf bei seinem Glied, Argumente als Knoten",
            rs.map((r) => `${r.glied}:${r.args.length}`).join(",") === "_a:2,_b:2,_c:2,d:1,_e:2" &&
                glieder(G)
                    .map((g) => `${g.name}@${g.zeile}-${g.bisZeile}`)
                    .join(",") === "_a@2-2,_b@3-3,_c@4-7,d@8-8,_e@9-9" &&
                gliedAn(glieder(G), G.indexOf("class A")) === null,
            rs.map((r) => `${r.glied}:${r.args.length}`).join(",")
        );
        const tafel = stripperTafel(root);
        pruef("der EINE Kommentar-Stripper hält seine Tafel und den Stamm gegen acorn", !tafel.length, tafel.join(" · "));
        const T = text(root);
        // 2) die Umkehrung am Kopf: S⁻¹(S(T)) = T und S(S⁻¹(S(T))) = S(T)
        const t0 = Date.now();
        const S = schneide(T);
        const T2 = fuege(S);
        pruef("S⁻¹∘S = id am Kopf", T2 === T, `${S.length} Dateien, ${Date.now() - t0} ms`);
        pruef(
            "S∘S⁻¹ = id am Kopf",
            schneide(T2).every((x, i) => x.pfad === S[i].pfad && x.text === S[i].text)
        );
        // 3) ein Fixture: zwei Zonen, je mit Außen-Zone
        const fx = [
            "// Kopf",
            KLASSE_AUF,
            "    // ===== ATLAS · Dirigent/kern — a =====",
            "    constructor() {}",
            "",
            "    // ===== ATLAS · Wasser — b =====",
            "    zwei() {}",
            "}",
            "",
            "// ===== ATLAS · Dirigent/kern — c =====",
            'AnazhRealm.VERSION = "1.2.3";',
            "",
            "// ===== ATLAS · Wasser — d =====",
            "AnazhRealm.X = 1;",
            "",
        ].join("\n");
        const fS = schneide(fx);
        pruef("Fixture: dirigent-kern · wasser, Umkehrung", fS.map((x) => x.pfad).join() === "stamm/dirigent-kern.js,stamm/wasser.js" && fuege(fS) === fx, fS.map((x) => x.pfad).join(" "));
        pruef("S wirft ohne Leerzeile vor dem Marker", wirft(() => schneide(fx.replace("\n\n    // ===== ATLAS · Wasser", "\n    // ===== ATLAS · Wasser")), /Leerzeile/));
        pruef("S wirft bei einer Zone zweimal", wirft(() => schneide(fx.replace("ATLAS · Wasser — b", "ATLAS · Dirigent/kern — b")), /zweimal/));
        // 4) die Layout-Weiche: keins / beides wirft; unter 5 MB wirft
        const leer = path.join(tmp, "leer");
        fs.mkdirSync(leer);
        pruef(
            "Layout: keine Form → wirft",
            wirft(() => text(leer), /kein stamm/)
        );
        fs.writeFileSync(path.join(tmp, "klein.js"), fx);
        pruef("text() unter 5 MB → wirft (Probe blind)", wirft(() => text(path.join(tmp, "klein.js")), /Probe blind/));
        // 5) der Zonen-Baum: text() = T, ort, dateiVon, liefere, versionsDatei
        const htmlAlt = fs.readFileSync(path.join(root, "index.html"), "utf8");
        const z = baum(
            "zonen",
            S,
            tagsSetzen(
                htmlAlt,
                S.map((x) => x.pfad)
            )
        );
        const t1 = Date.now();
        const Tz = text(z);
        pruef("text(Zonen-Baum) = T (sha)", sha(Tz) === sha(T), `${dateien(z).length} Tags, ${Date.now() - t1} ms`);
        const zeileV = T.split("\n").findIndex((l) => /^AnazhRealm\.VERSION = /.test(l)) + 1;
        const o = ort(z, zeileV);
        const [od, oz] = o.split(":");
        pruef(
            "ort(VERSION-Zeile) trifft die Zeile in ihrer Datei",
            fs.readFileSync(path.join(z, od), "utf8").split("\n")[oz - 1] === T.split("\n")[zeileV - 1],
            `${zeileV} → ${o}`
        );
        pruef("versionsDatei = die Datei aus ort()", versionsDatei(z) === od, versionsDatei(z));
        pruef(
            "dateiMit(VERSION-Zeile) = dieselbe Datei; ein fehlender Text → null; ein mehrdeutiger wirft",
            dateiMit(z, T.split("\n")[zeileV - 1]) === od &&
                dateiMit(z, "// diese Zeile steht nirgends\u0001") === null &&
                wirft(() => dateiMit(z, "\n    }\n"), /tragen/) &&
                dateiMit(root, T.split("\n")[zeileV - 1]) === versionsDatei(root),
            od
        );
        const dv = dateiVon(z, "_bodenSichtAt");
        pruef(
            "dateiVon(_bodenSichtAt) trägt die Methode",
            !!dv && /\n {4}_bodenSichtAt\(/.test(fs.readFileSync(path.join(z, dv), "utf8")),
            dv
        );
        const url = "/" + S[3].pfad;
        pruef(
            "liefere(Zonen) = die Datei aus S",
            liefere(z, url, T).toString("utf8") === S[3].text && liefere(z, "/index.html", T) === null,
            url
        );
        // die alte URL ist keine Stamm-URL (null → 404 laut)
        pruef("liefere(alte URL) = null", liefere(root, "/" + ALT, T) === null);
        // 6) ein Zonen-Baum, der nicht im Bild von S liegt, wirft: Datei ohne Tag · fehlende Datei · Rahmen verändert · die alte Datei
        fs.writeFileSync(path.join(z, DIR, "99.js"), "// fremd\n");
        pruef(
            "Datei ohne Tag → wirft",
            wirft(() => text(z), /ohne Tag: stamm\/99\.js/)
        );
        fs.unlinkSync(path.join(z, DIR, "99.js"));
        const weg = S[5].pfad;
        fs.renameSync(path.join(z, weg), path.join(tmp, "weg.js"));
        pruef(
            "fehlende Zone → wirft",
            wirft(() => text(z), /ohne Datei/)
        );
        fs.renameSync(path.join(tmp, "weg.js"), path.join(z, weg));
        const p7 = path.join(z, S[7].pfad);
        fs.writeFileSync(p7, S[7].text.replace(/(class \w+ \{\n)/, "$1    // vor dem Marker\n"));
        pruef(
            "Zeile vor dem Marker einer Zone → wirft",
            wirft(() => text(z), /nicht kanonisch|Leerzeile/)
        );
        fs.writeFileSync(p7, S[7].text.slice(HINWEIS.length));
        pruef("eine Zone ohne den Übersetzungs-Hinweis → wirft", wirft(() => text(z), /nicht kanonisch|^S: /));
        fs.writeFileSync(p7, S[7].text.replace(/class \w+/, "class AnazhRealm_Z99"));
        pruef(
            "Klassen-Name ≠ Naht-Ruf → wirft",
            wirft(() => text(z), /Naht-Ruf/)
        );
        fs.writeFileSync(p7, S[7].text);
        fs.writeFileSync(path.join(z, ALT), T);
        pruef(
            "die alte Datei im Baum → wirft",
            wirft(() => text(z), /Form vor dem Schnitt/)
        );
        fs.unlinkSync(path.join(z, ALT));
        pruef("der Zonen-Baum trägt wieder", sha(text(z)) === sha(T));
    } catch (e) {
        pruef("Selbsttest lief durch", false, e.stack);
    } finally {
        fs.rmSync(tmp, { recursive: true, force: true });
    }
    process.exit(pruef.ende("stamm-lib") ? 1 : 0);
}
