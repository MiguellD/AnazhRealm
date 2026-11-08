#!/usr/bin/env node
"use strict";
// bump-version.cjs — DIE VERSIONS-STUFE und der MERGE-TREIBER ihrer Register.
//   node scripts/bump-version.cjs 18.492.0         (npm run bump -- x.y.z) setzt ALLE Versions-Träger in EINEM Schritt
//   node scripts/bump-version.cjs %O %A %B %P %L   der Treiber, git ruft ihn je beidseitig geänderter Register-Datei
//                                                  (.gitattributes `merge=register`, eingerichtet von npm run setup:merge)
//   node scripts/bump-version.cjs --selftest
// DIE STUFE — die Klasse, die sie schliesst: 18 stale ?v=-Buster + ein stale CLAUDE.md-Stand-Kopf (V18.491.52–.637 wurden
// von Hand gestempelt, die Hälfte der Träger blieb liegen — gate:altlasten fing es erst hinterher). Träger: package.json ·
// package-lock.json · AnazhRealm.VERSION · jedes ?v= in index.html + worlds/*/index.html · der CLAUDE.md-Stand-Kopf (nur die
// Versionszahl, der Text bleibt) · der Korpus-Stand der Stufe.
// DER TREIBER — ein Register trägt viele Namen auf wenigen Zeilen (die Modul-Karte je Modul EINE Zeile, die Stamm-Tags EINEN
// Block, jede versionierte Datei ihren ?v=-Stempel), darum kollidierten zwei Zweige an der Zeile, nie am Namen (seit 16.10.:
// 110 von 258 Konflikt-Merges an Karte oder index.html, 56 nur dort). Er vereint je NAME in drei Wegen — Basis · ours ·
// theirs: wer änderte, gewinnt, dieselbe Änderung beidseitig ist eine — und schreibt über den Erzeuger, den es gibt; ein
// Streit (derselbe Name beidseitig verschieden) bleibt Konflikt wie gits binary-Treiber: ours steht, der Name auf stderr, Exit 1.
//   spec/stamm/modul-karte.json       je Name sein Modul (strich eine Seite ihn und zog die andere ihn um, lebt er im neuen —
//                                     der Code-Merge trägt ihn ebenso), die Ordnung je Datei-Schlüssel → stamm.karteText
//   index.html, worlds/*/index.html   der ?v=-Stempel → der Stempel dieser Stufe, die Stamm-Tags je Pfad → stamm.tagsSetzen,
//                                     der übrige Text über git merge-file
// Die Reihe einer Liste ist die von ours, ein Eintrag, den nur theirs trägt, steht hinter seinem Vorgänger; stellte theirs
// um, ist das der Streit „Reihe". git merge-tree liest .gitattributes aus dem ARBEITSBAUM, nie aus den Köpfen — die
// Paar-Probe in einem Baum ohne diese Zeilen: `git -c attr.tree=origin/main merge-tree --write-tree A B`.
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const stamm = require("./lib/stamm.cjs");

const root = path.join(__dirname, "..");
// DER STEMPEL der HTML-Träger: jedes ?v= trägt die Version — die Stufe setzt ihn, der Treiber vereint ihn
const STEMPEL = /\?v=[0-9]+\.[0-9]+(?:\.[0-9]+)?/g;
const stempeln = (s, ziel) => s.replace(STEMPEL, `?v=${ziel}`);

function stufe(ziel) {
    if (!/^\d+\.\d+\.\d+$/.test(ziel)) {
        console.error(`Version "${ziel}" ist kein x.y.z`);
        process.exit(2);
    }
    const befunde = [];
    function traeger(rel, ersetzen) {
        const p = path.join(root, rel);
        if (!fs.existsSync(p)) return;
        const alt = fs.readFileSync(p, "utf8");
        const neu = ersetzen(alt);
        if (neu !== alt) {
            befunde.push(rel);
            fs.writeFileSync(p, neu);
        }
    }
    traeger("package.json", (s) => s.replace(/("version":\s*")[^"]+(")/, `$1${ziel}$2`));
    traeger("package-lock.json", (s) => {
        const j = JSON.parse(s);
        j.version = ziel;
        if (j.packages && j.packages[""]) j.packages[""].version = ziel;
        return JSON.stringify(j, null, 4) + "\n";
    });
    // der VERSION-Träger: genau EINE Stamm-Datei mit genau EINER Zeile, sonst wirft scripts/lib/stamm.cjs (ein fehlender
    // Träger war hier still übersprungen — ein stale ?v= der Worker wäre die Folge)
    traeger(stamm.versionsDatei(root), (s) => s.replace(/(AnazhRealm\.VERSION = ")[0-9.]+(";)/, `$1${ziel}$2`));
    for (const d of ["", ...fs.readdirSync(path.join(root, "worlds")).map((w) => `worlds/${w}/`)]) traeger(`${d}index.html`, (s) => stempeln(s, ziel));
    traeger("CLAUDE.md", (s) => s.replace(/^(## Stand \(V)[0-9.]+/m, `$1${ziel}`));
    console.log(`Version ${ziel} gesetzt in: ${befunde.join(", ") || "(nichts zu tun)"}`);
    // der Korpus-Stand (speicher.K5): die neue Version lädt den jüngsten und legt ihren in den Index, ROT bei Verlust
    const o = { cwd: root, stdio: "inherit", env: { ...process.env, PERSISTENCE_PORT: "0" } };
    const lauf = (...a) => spawnSync(a.shift(), a, o).status !== 0;
    return lauf("node", "scripts/diag-persistence.cjs", "--stufe") || lauf("git", "add", `spec/speicher-korpus/${ziel}.json.br`) ? 1 : 0;
}

// ── der Treiber ───────────────────────────────────────────────────────────────────────────────────────────────────────
let L = 7; // die Marker-Länge (%L; ein Merge der Basen fährt längere)
const gleich = (x, y) => JSON.stringify(x) === JSON.stringify(y);
// DIE DREI WEGE eines Werts (undefined: der Name fehlt) → { a, streit }: wer änderte, gewinnt; wo beide verschieden
// änderten, entscheidet `beide` (sonst Streit beim Namen, ours steht)
function drei(o, a, b, name, beide) {
    if (gleich(a, b) || gleich(b, o)) return { a, streit: [] };
    if (gleich(a, o)) return { a: b, streit: [] };
    return beide ? beide(o, a, b) : { a, streit: [name] };
}
// DIE LISTE je Schlüssel: jeder Eintrag in drei Wegen, in der Reihe von ours
function liste(O, A, B, schl, beide) {
    const M = [O, A, B].map((X) => new Map(X.map((x) => [schl(x), x])));
    const reihe = (X, m) => X.map(schl).filter((k) => m.has(k)).join("\n");
    const r = { streit: reihe(B, M[0]) === reihe(O, M[2]) ? [] : ["Reihe"] };
    const w = new Map();
    for (const k of new Set(M.flatMap((m) => [...m.keys()]))) {
        const x = drei(...M.map((m) => m.get(k)), k, beide);
        if (x.a !== undefined) w.set(k, x.a);
        r.streit.push(...x.streit);
    }
    const ord = A.map(schl).filter((k) => w.has(k));
    let vor = -1;
    for (const k of B.map(schl))
        if (ord.includes(k)) vor = ord.indexOf(k);
        else if (w.has(k)) ord.splice(++vor, 0, k);
    r.a = ord.map((k) => w.get(k));
    return r;
}

function karte(...T) {
    const K = T.map((t) => (t.trim() ? stamm.karteAus(t) : { ordnung: [], mod: {} }));
    const q = drei(...K.map((k) => k.quelle), "quelle");
    const ord = liste(...K.map((k) => k.ordnung), (e) => e[0]);
    // ein Name, den eine Seite strich und die andere umzog, lebt im neuen Modul
    const mod = liste(...K.map((k) => Object.entries(k.mod).sort()), (e) => e[0], (o, a, b) => ({ a: a || b, streit: a && b ? [a[0]] : [] }));
    const streit = [...q.streit, ...ord.streit, ...mod.streit];
    return { a: stamm.karteText({ quelle: q.a, ordnung: ord.a, mod: Object.fromEntries(mod.a) }), streit };
}
const PLATZ = "stamm/0.js"; // EIN Tag hält im Rahmen den Platz des Blocks, ?v=0.0.0 den des Stempels
function stempelDatei(...T) {
    const v = drei(...T.map((t) => (t.match(STEMPEL) || [""])[0].slice(3)), "?v=");
    const tags = T.map((t) => stamm.tagsVon(t).map((x) => x.pfad));
    const m = textMerge(...[1, 0, 2].map((i) => (tags[i].length ? stamm.tagsSetzen(stempeln(T[i], "0.0.0"), [PLATZ]) : stempeln(T[i], "0.0.0"))));
    const r = liste(...tags, (p) => p);
    const z = m.text.split("\n").map((x) => ((stamm.tagsVon(x)[0] || {}).pfad === PLATZ ? stamm.tagsSetzen(x, r.a) : x));
    return { a: v.a ? stempeln(z.join("\n"), v.a) : z.join("\n"), streit: [...v.streit, ...r.streit], n: m.n };
}
const ARTEN = [
    [/^spec\/stamm\/modul-karte\.json$/, karte],
    [/^(?:worlds\/[^/]+\/)?index\.html$/, stempelDatei],
];
const textMerge = (a, o, b) => stamm.textMerge(a, o, b, { groesse: L });

// der Ruf von git: das Ergebnis nach %A; im Streit steht ours (die vereinte Datei mit der Wahl von ours)
function treiber([fo, fa, fb, p, l = "7"]) {
    const [O, A, B] = [fo, fa, fb].map((f) => fs.readFileSync(f, "utf8"));
    L = Number(l);
    const art = ARTEN.find(([rx]) => rx.test(p));
    try {
        if (!art) throw new Error("kein Register dieses Treibers");
        const r = art[1](O, A, B);
        fs.writeFileSync(fa, r.a);
        if (r.streit.length) console.error(`register-merge: ${p} — Streit beim Namen: ${r.streit.join(", ")} (ours steht)`);
        return r.streit.length || r.n ? 1 : 0;
    } catch (e) {
        // ein Register, das nicht trägt (eine kaputte Seite, Marker in der Basis eines Basen-Merges): gits eigener
        // Text-Merge, laut benannt — nie schlechter als git ohne Treiber
        const m = textMerge(A, O, B);
        fs.writeFileSync(fa, m.text);
        console.error(`register-merge: ${p} — ${e.message.split("\n")[0]}; git merge-file, ${m.n} Konflikt(e)`);
        return m.n ? 1 : 0;
    }
}

// ── Selbsttest ────────────────────────────────────────────────────────────────────────────────────────────────────────
// Je Register ein Fall, an dem git merge-file ROT ist (die Zeile) und der Treiber je Name vereint — gerufen wie von git
// (%O %A %B %P); die Mutante „derselbe Name in zwei Modulen" bleibt Streit beim Namen. Die echte Karte und die echte
// index.html sind ihr eigener Fixpunkt (der Erzeuger trägt sie Byte für Byte).
function selbsttest() {
    const pruef = stamm.pruefZaehler();
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "register-"));
    const fall = (name, p, o, a, b, soll) => {
        const f = [o, a, b].map((t, i) => (fs.writeFileSync(path.join(tmp, "oab"[i]), t), path.join(tmp, "oab"[i])));
        const exit = treiber([...f, p]);
        pruef(name, textMerge(a, o, b).n > 0 && exit === +!soll && (!soll || fs.readFileSync(f[1], "utf8") === soll), `git merge-file ROT, Exit ${exit}`);
    };
    const K = (mod, ...m) => stamm.karteText({ quelle: "q", ordnung: ["W", ...m, "B"].map((s) => [s, s]), mod });
    const kO = K({ a: "W", b: "B", c: "B" });
    fall("Karte je Name: neu, umgezogen, gestrichen gegen umgezogen, neues Modul", stamm.KARTE, kO, K({ a: "W", b: "W", d: "W" }), K({ a: "W", b: "B", c: "W", e: "S", f: "B" }, "S"), K({ a: "W", b: "W", c: "W", d: "W", e: "S", f: "B" }, "S"));
    const [mA, mB] = ["W", "B"].map((n) => K({ a: "W", b: "B", c: "B", n }));
    fall("Mutante: derselbe Name in zwei Modulen", stamm.KARTE, kO, mA, mB, null);
    pruef("Mutante: der Streit beim Namen", karte(kO, mA, mB).streit.join() === "n");
    // die Versions-Stufe stempelt (ours), der Zweig bringt eine Stamm-Datei und ändert den Text (theirs)
    const html = (v, p, ...s) => [...["a.js", "stamm/x.js", ...s, "stamm/y.js"].map((x) => `<script src="${x}?v=${v}" defer></script>`), p, ""].join("\n");
    const hB = html("1.0.0", "<b>", "stamm/z.js");
    fall("index.html: ?v=, Stamm-Tag, Text", "index.html", html("1.0.0", "<p>"), html("1.0.1", "<p>"), hB, stempeln(hB, "1.0.1"));
    for (const [p, f] of [[stamm.KARTE, karte], ["index.html", stempelDatei]]) {
        const t = fs.readFileSync(path.join(root, p), "utf8");
        pruef(`Fixpunkt ${p}`, f(t, t, t).a === t);
    }
    fs.rmSync(tmp, { recursive: true, force: true });
    return pruef.ende("register-merge");
}

const arg = process.argv.slice(2);
if (require.main === module) process.exit(arg[0] === "--selftest" ? Math.sign(selbsttest()) : arg.length > 1 ? treiber(arg) : stufe(arg[0]));
