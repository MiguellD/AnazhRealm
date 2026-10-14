"use strict";
/* global process, console, __dirname, Buffer, TextEncoder, TextDecoder, URL */
// scripts/lib/stamm.cjs — DIE EINE Lese-Schnittstelle des Stamms (Stamm-Zerlegung, plan 13.10. §3).
//
// Jedes Werkzeug, das den Stamm als TEXT liest, liest ihn hier: `text(root)` ist der virtuelle Stamm — heute die eine
// Datei anazhRealm.js, nach dem Schnitt die Umkehrung der Zonen-Dateien stamm/NN[x].js, sha-gleich zum Vorgänger. Die
// Layout-Weiche ist laut: liegen beide Formen oder keine im Baum, wirft sie; ein Text unter 5 MB wirft („Probe blind").
// Der Name der alten Datei steht als Lese-Ziel NUR hier (Absenz-Linse in diag-altlasten).
//
// Der Schnitt S ist eine REINE Funktion des Texts an den ATLAS-Markern (`schneide`), seine Umkehrung `fuege`; beide
// leben in dieser Datei, damit es EIN Gesetz gibt:
//   stamm/01.js   Kopf + `class AnazhRealm {` + §01 + `}` + die Naht-Funktion `_stammZonen`
//   stamm/NN.js   `class AnazhRealm_ZNN {` + die Zone ab ihrem Marker, Byte für Byte + `}` (Unter-Marker §NNb → NNa/NNb)
//   stamm/26.js   der Naht-Ruf `_stammZonen(AnazhRealm, [...])` + §26 ab dem Marker (Unter-Marker §26b → 26a/26b …)
// Die Leerzeile vor jedem Marker trägt die Umkehrung; S verlangt sie (sonst wirft S).
//
//   node scripts/lib/stamm.cjs --selftest     beweist Umkehrung, Layout-Weiche, 5-MB-Wand, Kanon-Prüfung, ort, liefere
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ALT = "anazhRealm.js";
const DIR = "stamm";
const MIN_BYTES = 5 * 1024 * 1024;
const KLASSE_AUF = "class AnazhRealm {";
const MARKER_RX = /^( {4})?\/\/ ===== ATLAS §(\d\d)([a-z]?) · ([^—]+?) — (.+?) =====\s*$/;
const ZONEN_DATEI_RX = /^stamm\/\d\d[a-z]?\.js$/;
const STAMM_TAG_RX =
    /^([ \t]*)<script src="((?:anazhRealm\.js|stamm\/\d\d[a-z]?\.js))(\?v=[^"]*)?" defer><\/script>[ \t]*$/;

const sha = (s) => crypto.createHash("sha256").update(s).digest("hex");

// Die Naht (Kern-Ende in stamm/01.js). S schreibt sie, die Umkehrung verlangt sie Zeile für Zeile.
const NAHT_FN = [
    "",
    "// DIE NAHT (scripts/stamm-umzug.cjs schreibt sie, scripts/lib/stamm.cjs liest sie zurück): die Zonen-Klassen",
    "// stamm/NN.js tragen ihre Glieder auf AnazhRealm — in Datei-Ordnung, je Glied sein Deskriptor; erst alle Methoden",
    "// und Accessoren, dann die statischen Felder (wie die Klassen-Auswertung). Ein Zwilling bricht laut.",
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
const nahtRuf = (klassen) => ["_stammZonen(AnazhRealm, [", ...klassen.map((k) => `    ${k},`), "]);", ""];

// ── S: der Schnitt ────────────────────────────────────────────────────────────────────────────────────────────────
// Auf Zeichen-Positionen, nie auf Zeilen-Feldern (108k Zeilen spalten und fügen kostete 0,5 s je Richtung).
const zeilenIn = (s) => {
    let n = 0;
    for (let i = s.indexOf("\n"); i >= 0; i = s.indexOf("\n", i + 1)) n++;
    return n;
};

function marker(t) {
    const out = [];
    const nadel = "// ===== ATLAS §";
    for (let i = t.indexOf(nadel); i >= 0; i = t.indexOf(nadel, i + nadel.length)) {
        const a = t.lastIndexOf("\n", i) + 1;
        const e = t.indexOf("\n", i);
        const m = MARKER_RX.exec(t.slice(a, e < 0 ? t.length : e));
        if (m) out.push({ at: a, eingerueckt: !!m[1], nn: m[2], x: m[3], name: m[4].trim(), themen: m[5].trim() });
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
    // Namen: eine Zone mit Unter-Markern heißt NNa, NNb, …; die Nummern steigen streng, die Buchstaben ebenso.
    const ids = [];
    for (let j = 0; j < mk.length; j++) {
        const m = mk[j];
        const teilt = mk.some((n) => n.nn === m.nn && n.x);
        if (m.x && (j === 0 || mk[j - 1].nn !== m.nn))
            throw new Error(`S: Unter-Marker §${m.nn}${m.x} ohne seine Zone davor`);
        const id = m.nn + (m.x || (teilt ? "a" : ""));
        if (j > 0) {
            const v = mk[j - 1];
            if (v.nn === m.nn ? !(m.x && (v.x || "a") < m.x) : !(Number(m.nn) > Number(v.nn)))
                throw new Error(`S: Marker-Ordnung bricht bei §${id} (Zeile ${zeilenIn(t.slice(0, m.at)) + 1})`);
            if (t.slice(m.at - 2, m.at) !== "\n\n")
                throw new Error(
                    `S: vor dem Marker §${id} (Zeile ${zeilenIn(t.slice(0, m.at)) + 1}) fehlt die Leerzeile`
                );
        }
        ids.push(id);
    }
    const nI = innen.length;
    const teile = [];
    const klassen = [];
    const ende01 = nI > 1 ? innen[1].at - 1 : zu;
    teile.push({ pfad: `${DIR}/${ids[0]}.js`, text: t.slice(0, ende01) + "}\n" + NAHT_FN.join("\n") + "\n" });
    for (let j = 1; j < nI; j++) {
        const b = j + 1 < nI ? innen[j + 1].at - 1 : zu;
        const klasse = `AnazhRealm_Z${ids[j]}`;
        klassen.push(klasse);
        teile.push({
            pfad: `${DIR}/${ids[j]}.js`,
            klasse,
            text: `class ${klasse} {\n` + t.slice(innen[j].at, b) + "}\n",
        });
    }
    for (let j = 0; j < aussen.length; j++) {
        const b = j + 1 < aussen.length ? aussen[j + 1].at - 1 : t.length;
        const kopf = j === 0 ? nahtRuf(klassen).join("\n") + "\n" : "";
        teile.push({ pfad: `${DIR}/${ids[nI + j]}.js`, text: kopf + t.slice(aussen[j].at, b) });
    }
    return teile;
}

// S⁻¹: die Zonen-Dateien → der Stamm. `stuecke` (optional) bekommt je Stück [pfad, ersteDateiZeile, zeilen, ersteStammZeile].
function fuege(teile, stuecke) {
    const out = [];
    let zeile = 1;
    const nimm = (pfad, s, ab) => {
        if (stuecke) stuecke.push([pfad, ab, zeilenIn(s), zeile]);
        zeile += zeilenIn(s);
        out.push(s);
    };
    for (const x of teile)
        if (!x.text.endsWith("\n")) throw new Error(`S⁻¹: ${x.pfad} endet nicht mit einem Zeilenumbruch`);
    if (!teile.length || !/\/01\.js$/.test(teile[0].pfad))
        throw new Error("S⁻¹: die erste Datei ist nicht stamm/01.js");
    const kern = teile[0].text;
    const naht = "}\n" + NAHT_FN.join("\n") + "\n";
    if (!kern.endsWith("\n" + naht)) throw new Error("S⁻¹: stamm/01.js endet nicht mit `}` und der Naht");
    nimm(teile[0].pfad, kern.slice(0, kern.length - naht.length), 1);
    const klassen = [];
    let j = 1;
    for (; j < teile.length; j++) {
        const z = teile[j].text;
        const m = /^class (AnazhRealm_Z\d\d[a-z]?) \{\n/.exec(z);
        if (!m) break;
        if (!z.endsWith("\n}\n")) throw new Error(`S⁻¹: ${teile[j].pfad} schließt nicht mit \`}\``);
        klassen.push(m[1]);
        nimm(teile[j].pfad, "\n", 1);
        nimm(teile[j].pfad, z.slice(m[0].length, -2), 2);
    }
    if (j >= teile.length) throw new Error("S⁻¹: keine §26-Datei nach den Zonen");
    nimm(teile[j - 1].pfad, "}\n\n", zeilenIn(teile[j - 1].text));
    for (let e = j; e < teile.length; e++) {
        const z = teile[e].text;
        if (e === j) {
            const ruf = nahtRuf(klassen).join("\n") + "\n";
            if (!z.startsWith(ruf))
                throw new Error(
                    `S⁻¹: ${teile[e].pfad} beginnt nicht mit dem Naht-Ruf über die ${klassen.length} Zonen`
                );
            nimm(teile[e].pfad, z.slice(ruf.length), zeilenIn(ruf) + 1);
        } else {
            if (/^class AnazhRealm_Z/.test(z)) throw new Error(`S⁻¹: Zonen-Klasse ${teile[e].pfad} nach §26`);
            nimm(teile[e].pfad, "\n", 1);
            nimm(teile[e].pfad, z, 1);
        }
    }
    return out.join("");
}

// ── der Baum ──────────────────────────────────────────────────────────────────────────────────────────────────────
function layout(root) {
    const datei = fs.existsSync(path.join(root, ALT));
    const zonen = fs.existsSync(path.join(root, DIR, "01.js"));
    if (datei && zonen)
        throw new Error(`Stamm-Layout: ${root} trägt ${ALT} UND ${DIR}/ — beide Formen, keine Wahrheit`);
    if (!datei && !zonen) throw new Error(`Stamm-Layout: ${root} trägt weder ${ALT} noch ${DIR}/01.js`);
    return datei ? "datei" : "zonen";
}

// Die Stamm-Tags einer index.html, in Lade-Ordnung.
function tagsVon(html) {
    const out = [];
    html.split("\n").forEach((z, i) => {
        const m = STAMM_TAG_RX.exec(z.replace(/\r$/, ""));
        if (m) out.push({ zeile: i, einzug: m[1], pfad: m[2], v: m[3] || "" });
    });
    return out;
}

// DIE EINE LISTE: die Stamm-Dateien, wie index.html sie lädt (vor dem Schnitt: die eine Datei).
function dateien(root) {
    if (layout(root) === "datei") return [ALT];
    const html = path.join(root, "index.html");
    if (!fs.existsSync(html)) throw new Error(`Stamm-Liste: ${html} fehlt (die Tags sind die EINE Liste)`);
    const liste = tagsVon(fs.readFileSync(html, "utf8")).map((t) => t.pfad);
    if (liste.includes(ALT)) throw new Error(`Stamm-Liste: index.html lädt ${ALT} neben ${DIR}/`);
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

function teileVon(root) {
    return dateien(root).map((p) => ({ pfad: p, text: fs.readFileSync(path.join(root, p), "utf8") }));
}

// Der Text der Zonen-Dateien, geprüft: nur ein Baum im Bild von S trägt (S(S⁻¹(teile)) = teile, Datei für Datei).
function ausZonen(teile, stuecke) {
    const t = fuege(teile, stuecke);
    const s = schneide(t);
    const abweichung =
        s.length !== teile.length
            ? `${s.length} statt ${teile.length} Dateien`
            : (s.find((x, i) => x.pfad !== teile[i].pfad || x.text !== teile[i].text) || {}).pfad;
    if (abweichung) throw new Error(`Stamm-Baum nicht kanonisch (S∘S⁻¹ ≠ id): ${abweichung}`);
    return t;
}

// DER virtuelle Stamm. `pfad` = Wurzel eines Baums (Layout-Weiche) ODER ausdrücklich eine Stamm-Datei (ein Stand vor dem
// Umzug: git-Archiv, A/B-Basis, werkbank --quelle).
function text(pfad) {
    const p = path.resolve(pfad);
    if (fs.statSync(p).isFile()) return blind(fs.readFileSync(p, "utf8"), p);
    if (layout(p) === "datei") return blind(fs.readFileSync(path.join(p, ALT), "utf8"), p);
    return blind(ausZonen(teileVon(p)), p);
}

// Der Stamm-Text an einer git-Revision (beide Layouts), ohne Arbeitsbaum.
function textAusRev(root, rev) {
    const { execFileSync } = require("child_process");
    const git = (args) => execFileSync("git", ["-C", root, ...args], { encoding: "utf8", maxBuffer: 1 << 30 });
    // ls-tree mit `stamm/` nennt die Dateien darin (stamm/01.js …), nie das Verzeichnis
    const namen = git(["ls-tree", "--name-only", rev, "--", ALT, `${DIR}/`])
        .split("\n")
        .filter(Boolean);
    const zonen = namen.includes(`${DIR}/01.js`);
    if (namen.includes(ALT)) {
        if (zonen) throw new Error(`Stamm-Layout an ${rev}: ${ALT} UND ${DIR}/`);
        return blind(git(["show", `${rev}:${ALT}`]), rev);
    }
    if (!zonen) throw new Error(`Stamm-Layout an ${rev}: weder ${ALT} noch ${DIR}/01.js`);
    const liste = tagsVon(git(["show", `${rev}:index.html`])).map((t) => t.pfad);
    return blind(ausZonen(liste.map((p) => ({ pfad: p, text: git(["show", `${rev}:${p}`]) }))), rev);
}

// Eine Stamm-Zeile (1-basiert, im virtuellen Text) → `datei:zeile` im Baum.
function ort(root, zeile) {
    if (layout(root) === "datei") return `${ALT}:${zeile}`;
    const st = [];
    ausZonen(teileVon(root), st);
    const s = st.find(([, , n, ab]) => zeile >= ab && zeile < ab + n);
    return s ? `${s[0]}:${s[1] + zeile - s[3]}` : `${DIR}/?:${zeile}`;
}

// Die Datei, die eine Methode (oder einen statischen Getter) definiert; null, wenn keine.
function dateiVon(root, methode) {
    const name = methode.replace(/[$]/g, "\\$");
    const rx = new RegExp(`^ {4}(?:static\\s+)?(?:async\\s+)?(?:get\\s+|set\\s+)?\\*?${name}\\s*\\(`, "m");
    for (const p of dateien(root)) if (rx.test(fs.readFileSync(path.join(root, p), "utf8"))) return p;
    return null;
}

// Der Kopf einer Klassen-Methode am NAMEN: der Index des Zeilenumbruchs vor `    [static ][async ][get |set ]name(`, ab
// `ab`; -1 ohne Treffer. Eine Linse findet eine Methode an ihrem Namen, nie an ihrer Parameter-Liste — ein neuer Parameter
// bricht keine Linse, die ihn nicht prüft (gate:apparat, Klinge 3).
function kopf(t, methode, ab = 0) {
    const name = methode.replace(/[$]/g, "\\$");
    const rx = new RegExp(`\\n {4}(?:static\\s+)?(?:async\\s+)?(?:get\\s+|set\\s+)?\\*?${name}\\(`, "g");
    rx.lastIndex = ab;
    const m = rx.exec(t);
    return m ? m.index : -1;
}

// Die Stamm-Datei, die den Text `stelle` trägt (ein Server-Patcher fragt, wohin seine Zeile gehört): genau eine → ihr
// Pfad; keine → null; mehrere → wirft (der Patch wäre mehrdeutig).
function dateiMit(root, stelle) {
    const mit = dateien(root).filter((p) => fs.readFileSync(path.join(root, p), "utf8").includes(stelle));
    if (mit.length > 1) throw new Error(`dateiMit: ${mit.join(", ")} tragen „${String(stelle).slice(0, 60)}"`);
    return mit[0] || null;
}

const istStammDatei = (rel) => rel === ALT || ZONEN_DATEI_RX.test(rel);

// Ist die URL (Server-Pfad, „/…") eine Stamm-Datei dieses Baums?
function istStammUrl(root, urlPfad) {
    const rel = String(urlPfad).replace(/^\//, "");
    return layout(root) === "datei" ? rel === ALT : ZONEN_DATEI_RX.test(rel);
}

// Server-Patcher: die Bytes einer Stamm-URL aus einem (gepatchten) virtuellen Stamm `t` — die Datei, die die Zeile
// trägt, im Layout des Baums. Keine Stamm-URL → null; eine Stamm-URL, die S(t) nicht kennt, wirft.
const lieferCache = { t: null, teile: null };
function liefere(root, urlPfad, t) {
    if (!istStammUrl(root, urlPfad)) return null;
    if (layout(root) === "datei") return Buffer.from(t, "utf8");
    if (lieferCache.t !== t) Object.assign(lieferCache, { t, teile: schneide(t) });
    const rel = String(urlPfad).replace(/^\//, "");
    const teil = lieferCache.teile.find((x) => x.pfad === rel);
    if (!teil) throw new Error(`liefere: ${rel} ist keine Datei von S(Stamm)`);
    return Buffer.from(teil.text, "utf8");
}

// Der Träger von AnazhRealm.VERSION: genau EINE Stamm-Datei mit genau EINER Zeile — sonst wirft er.
function versionsDatei(root) {
    const rx = /^AnazhRealm\.VERSION = "[0-9.]+";$/gm;
    const treffer = dateien(root).map((p) => [p, (fs.readFileSync(path.join(root, p), "utf8").match(rx) || []).length]);
    const mit = treffer.filter(([, n]) => n > 0);
    if (mit.length !== 1 || mit[0][1] !== 1)
        throw new Error(
            `VERSION-Träger: ${mit.map(([p, n]) => `${p}×${n}`).join(", ") || "keiner"} statt genau einer Zeile`
        );
    return mit[0][0];
}

// index.html: der Stamm-Tag-Block → die Tags für `pfade` (Einzug und ?v= vom alten Block).
function tagsSetzen(html, pfade) {
    const tags = tagsVon(html);
    if (!tags.length) throw new Error("tagsSetzen: index.html trägt keinen Stamm-Tag");
    for (let i = 1; i < tags.length; i++)
        if (tags[i].zeile !== tags[i - 1].zeile + 1)
            throw new Error("tagsSetzen: die Stamm-Tags stehen nicht als ein Block");
    const z = html.split("\n");
    const { einzug, v } = tags[0];
    const neu = pfade.map((p) => `${einzug}<script src="${p}${v}" defer></script>`);
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
    g.window = g;
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

module.exports = {
    ALT,
    DIR,
    MIN_BYTES,
    MARKER_RX,
    NAHT_FN,
    nahtRuf,
    sha,
    marker,
    schneide,
    fuege,
    layout,
    tagsVon,
    tagsSetzen,
    dateien,
    text,
    textAusRev,
    ort,
    dateiVon,
    kopf,
    dateiMit,
    istStammDatei,
    istStammUrl,
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
    let rot = 0;
    const pruef = (name, ok, info) => {
        console.log(`${ok ? "  ok " : "  ROT"} ${name}${info ? " — " + info : ""}`);
        if (!ok) rot++;
    };
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
        const lay = layout(root);
        const T = text(root);
        // 1) heute: text() = die Datei, Byte für Byte
        if (lay === "datei")
            pruef(
                "text(root) = anazhRealm.js (sha)",
                sha(T) === sha(fs.readFileSync(path.join(root, ALT), "utf8")),
                sha(T).slice(0, 16)
            );
        // 2) die Umkehrung am Kopf: S⁻¹(S(T)) = T und S(S⁻¹(S(T))) = S(T)
        const t0 = Date.now();
        const S = schneide(T);
        const T2 = fuege(S);
        pruef("S⁻¹∘S = id am Kopf", T2 === T, `${S.length} Dateien, ${Date.now() - t0} ms`);
        pruef(
            "S∘S⁻¹ = id am Kopf",
            schneide(T2).every((x, i) => x.pfad === S[i].pfad && x.text === S[i].text)
        );
        // 3) ein Fixture mit Unter-Markern in einer Zone und in §26
        const fx = [
            "// Kopf",
            KLASSE_AUF,
            "    // ===== ATLAS §01 · KERN — a =====",
            "    constructor() {}",
            "",
            "    // ===== ATLAS §02 · ZWEI — b =====",
            "    zwei() {}",
            "",
            "    // ===== ATLAS §02b · ZWEI — Block X =====",
            "    zweiB() {}",
            "}",
            "",
            "// ===== ATLAS §26 · AUSSEN — c =====",
            'AnazhRealm.VERSION = "1.2.3";',
            "",
            "// ===== ATLAS §26b · AUSSEN — Block Y =====",
            "AnazhRealm.X = 1;",
            "",
        ].join("\n");
        const fS = schneide(fx);
        pruef(
            "Fixture: Namen 01 · 02a · 02b · 26a · 26b, Umkehrung",
            fS.map((x) => x.pfad.slice(6, -3)).join(",") === "01,02a,02b,26a,26b" && fuege(fS) === fx,
            fS.map((x) => x.pfad).join(" ")
        );
        pruef(
            "S wirft ohne Leerzeile vor dem Marker",
            wirft(() => schneide(fx.replace("\n\n    // ===== ATLAS §02b", "\n    // ===== ATLAS §02b")), /Leerzeile/)
        );
        pruef(
            "S wirft bei fallender Marker-Ordnung",
            wirft(() => schneide(fx.replace("§02b", "§01b")), /Ordnung|ohne seine Zone/)
        );
        // 4) die Layout-Weiche: keins / beides wirft; unter 5 MB wirft
        const leer = path.join(tmp, "leer");
        fs.mkdirSync(leer);
        pruef(
            "Layout: keine Form → wirft",
            wirft(() => text(leer), /weder/)
        );
        const klein = path.join(tmp, "klein");
        fs.mkdirSync(klein);
        fs.writeFileSync(path.join(klein, ALT), fx);
        pruef(
            "text() unter 5 MB → wirft (Probe blind)",
            wirft(() => text(klein), /Probe blind/)
        );
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
                dateiMit(root, T.split("\n")[zeileV - 1]) === (lay === "datei" ? ALT : versionsDatei(root)),
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
        // im Datei-Layout liefert die alte URL den ganzen Text, im Zonen-Baum ist sie keine Stamm-URL mehr (null → 404 laut)
        pruef(
            lay === "datei" ? "liefere(Datei) = der ganze Text" : "liefere(alte URL) im Zonen-Baum = null",
            lay === "datei"
                ? liefere(root, "/" + ALT, T).length === Buffer.byteLength(T)
                : liefere(root, "/" + ALT, T) === null
        );
        // 6) ein Zonen-Baum, der nicht im Bild von S liegt, wirft: Datei ohne Tag · fehlende Datei · Rahmen verändert · beide Formen
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
        fs.writeFileSync(p7, S[7].text.replace(/^(class \w+ \{\n)/, "$1    // vor dem Marker\n"));
        pruef(
            "Zeile vor dem Marker einer Zone → wirft",
            wirft(() => text(z), /nicht kanonisch|Leerzeile/)
        );
        fs.writeFileSync(p7, S[7].text.replace(/^class \w+/, "class AnazhRealm_Z99"));
        pruef(
            "Klassen-Name ≠ Naht-Ruf → wirft",
            wirft(() => text(z), /Naht-Ruf/)
        );
        fs.writeFileSync(p7, S[7].text);
        fs.writeFileSync(path.join(z, ALT), T);
        pruef(
            "beide Formen → wirft",
            wirft(() => text(z), /beide Formen/)
        );
        fs.unlinkSync(path.join(z, ALT));
        pruef("der Zonen-Baum trägt wieder", sha(text(z)) === sha(T));
    } catch (e) {
        pruef("Selbsttest lief durch", false, e.stack);
    } finally {
        fs.rmSync(tmp, { recursive: true, force: true });
    }
    console.log(rot ? `stamm-lib: ${rot} ROT` : "stamm-lib: Selbsttest grün");
    process.exit(rot ? 1 : 0);
}
