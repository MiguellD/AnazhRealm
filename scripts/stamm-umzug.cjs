"use strict";
/* global process, console, __dirname */
// scripts/stamm-umzug.cjs — der Umzug des Stamms in stamm/NN[x].js (Stamm-Zerlegung, plan 13.10. §3–§5). Der Schnitt S und
// seine Umkehrung leben in scripts/lib/stamm.cjs; dieses Werkzeug setzt Marker, schneidet, prüft und beweist.
//
//   --marker [--setzen] [--decke 4000] [--ziel-zeilen 3000]
//        schlägt die Unter-Schnitte vor (je Datei > Decke: k = ⌈Zeilen/Ziel⌉ Teile; die Block-Grenze der Modul-Karte
//        spec/stamm/modul-karte.json im Fenster ±30 % um den Gleichteil-Punkt, sonst die nächste Glied-Grenze, §26 an
//        Anweisungs-Grenzen; dazu VERSION allein in §26a). --setzen schreibt die Marker in den Stamm (C1).
//   --schnitt --ziel <wurzel> [--quelle <datei|wurzel>] [--im-repo]
//        S: Marker → stamm/NN[x].js, die Naht, die index.html-Tags; anazhRealm.js fällt im Ziel. Ohne --im-repo nie im Repo.
//   --pruef [--rev HEAD~1]
//        Zonen-Baum: S(Stamm an rev) = Baum Byte für Byte, Tags = S, text() sha = rev. Datei-Layout: S∘S⁻¹ = id, und mit
//        --rev die Token-Folge ohne Kommentare gleich (der Beweis des Marker-Commits C1).
//   --beweis [--rev <rev>]
//        vm-Fingerabdruck alt (EIN Skript) ↔ neu (die Zonen-Dateien): Schlüssel-Ordnung, Deskriptor-Art, toString-sha,
//        name/length, Datenwerte — 0 Abweichungen außer dem Klassen-Text.
//   --teile §NN <methode>      setzt einen Unter-Marker vor die Methode und schneidet neu (Buchstaben der Zone neu gezählt)
//   --leser [--trocken]        der Codemod (idempotent): kanonische Stamm-Leser → stamm.text(root), Rest benannt
//   --selftest
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const stamm = require("./lib/stamm.cjs");

const ROOT = path.resolve(__dirname, "..");
const argv = process.argv.slice(2);
const opt = (n, d) => (argv.includes(n) ? argv[argv.indexOf(n) + 1] : d);
const acorn = require("acorn");

// ── Zeilen-Helfer ─────────────────────────────────────────────────────────────────────────────────────────────────
const zeilenBis = (t, at) => {
    let n = 0;
    for (let i = t.indexOf("\n"); i >= 0 && i < at; i = t.indexOf("\n", i + 1)) n++;
    return n; // 0-basierte Zeile von `at`
};

// Die Spannen der S-Dateien im Stamm (0-basierte Zeilen [a, b)) samt Dateizeilen.
function spannen(T) {
    const mk = stamm.marker(T);
    const S = stamm.schneide(T);
    const n = zeilenBis(T, T.length);
    const z = mk.map((m) => zeilenBis(T, m.at));
    const erstAussen = mk.findIndex((m) => !m.eingerueckt);
    return mk.map((m, j) => ({
        m,
        a: z[j],
        b: j === erstAussen - 1 ? z[erstAussen] - 2 : j + 1 < mk.length ? z[j + 1] - 1 : n,
        datei: S[j].pfad,
        zeilen: S[j].text.split("\n").length - 1,
    }));
}

// ── --marker ──────────────────────────────────────────────────────────────────────────────────────────────────────
function markerVorschlag(T, decke, ziel) {
    const karte = JSON.parse(fs.readFileSync(path.join(ROOT, "spec", "stamm", "modul-karte.json"), "utf8")).mod;
    const ast = acorn.parse(T, { ecmaVersion: "latest", sourceType: "script", locations: true });
    const cls = ast.body.find((n) => n.type === "ClassDeclaration" && n.id && n.id.name === "AnazhRealm");
    const name = (g) => (g.key && (g.key.name || g.key.value)) || "?";
    // Grenzen (0-basierte Zeile, an der der Marker eingesetzt wird): je Glied ab dem zweiten die Zeile nach dem Vorgänger
    const glieder = cls.body.body;
    const grenzen = [];
    let letztes = null; // das Modul des letzten kartierten Glieds: ein Wechsel ist eine Block-Grenze
    for (let i = 0; i < glieder.length; i++) {
        const mod = karte[name(glieder[i])] || null;
        const block = !!(mod && letztes && mod !== letztes);
        if (mod) letztes = mod;
        if (i > 0)
            grenzen.push({
                zeile: glieder[i - 1].loc.end.line,
                art: block ? "Block" : "Glied",
                modul: mod,
                glied: name(glieder[i]),
            });
    }
    const draussen = ast.body.filter((s) => s.loc.start.line > cls.loc.end.line);
    const ziel26 = (s) => {
        const e =
            s.type === "ExpressionStatement" && s.expression.type === "AssignmentExpression" ? s.expression.left : null;
        return e && e.type === "MemberExpression"
            ? `AnazhRealm.${e.property.name || e.property.value}`
            : s.type === "FunctionDeclaration"
              ? s.id.name
              : s.type;
    };
    const anweisungen = [];
    for (let i = 1; i < draussen.length; i++)
        anweisungen.push({
            zeile: draussen[i - 1].loc.end.line,
            art: "Anweisung",
            glied: ziel26(draussen[i]),
            vorher: ziel26(draussen[i - 1]),
        });
    const sp = spannen(T);
    const schnitte = [];
    const bericht = [];
    for (const s of sp) {
        const kand = (s.m.eingerueckt ? grenzen : anweisungen).filter((g) => g.zeile > s.a + 1 && g.zeile < s.b);
        // VERSION allein: in der ersten §26-Datei der Schnitt direkt nach der VERSION-Anweisung
        const vers =
            !s.m.eingerueckt && s === sp.find((x) => !x.m.eingerueckt)
                ? kand.find((g) => g.vorher === "AnazhRealm.VERSION")
                : null;
        const cuts = [];
        let a = s.a;
        if (vers && kand.some((g) => g.zeile > vers.zeile)) {
            cuts.push(Object.assign({}, vers, { art: "VERSION" }));
            a = vers.zeile;
        }
        const len = s.b - a;
        if (len + 2 > decke) {
            const k = Math.ceil(len / ziel);
            let vor = a;
            for (let j = 1; j < k; j++) {
                const soll = a + Math.round((len * j) / k);
                const tol = (len / k) * 0.3;
                const offen = kand.filter((g) => g.zeile > vor + 1 && g.zeile < s.b);
                const nah = (xs) =>
                    xs.reduce(
                        (best, g) => (!best || Math.abs(g.zeile - soll) < Math.abs(best.zeile - soll) ? g : best),
                        null
                    );
                const c = nah(offen.filter((g) => g.art === "Block" && Math.abs(g.zeile - soll) <= tol)) || nah(offen);
                if (!c) throw new Error(`--marker: keine Grenze in ${s.datei} um Zeile ${soll + 1}`);
                cuts.push(c);
                vor = c.zeile;
            }
        }
        if (cuts.length) {
            const punkte = [s.a, ...cuts.map((c) => c.zeile), s.b];
            bericht.push(
                `${s.datei} ${s.zeilen} Z. → ${punkte
                    .slice(1)
                    .map((p, i) => p - punkte[i] + 2)
                    .join(" / ")} (${cuts.map((c) => c.art).join(", ")})`
            );
        }
        for (const c of cuts)
            schnitte.push(Object.assign({ nn: s.m.nn, zone: s.m.name, eingerueckt: s.m.eingerueckt }, c));
    }
    return { schnitte, bericht, spannen: sp };
}

// Setzt die Schnitte als Unter-Marker; danach zählt je Zone die Buchstaben neu (b, c, …).
function markerSetzen(T, schnitte) {
    const L = T.split("\n");
    for (const c of [...schnitte].sort((x, y) => y.zeile - x.zeile)) {
        const themen = c.art === "Block" ? `Block ${c.modul}` : c.art === "VERSION" ? `ab ${c.glied}` : `ab ${c.glied}`;
        const zeile = `${c.eingerueckt ? "    " : ""}// ===== ATLAS §${c.nn}z · ${c.zone} — ${themen} =====`;
        if (L[c.zeile - 1] === "") L.splice(c.zeile, 0, zeile);
        else if (L[c.zeile] === "") L.splice(c.zeile + 1, 0, zeile);
        else L.splice(c.zeile, 0, "", zeile);
    }
    return buchstaben(L.join("\n"));
}

function buchstaben(T) {
    const L = T.split("\n");
    const zaehler = {};
    for (let i = 0; i < L.length; i++) {
        const m = stamm.MARKER_RX.exec(L[i]);
        if (!m) continue;
        if (!m[3]) {
            zaehler[m[2]] = "a";
            continue;
        }
        const x = String.fromCharCode(zaehler[m[2]].charCodeAt(0) + 1);
        zaehler[m[2]] = x;
        L[i] = L[i].replace(`§${m[2]}${m[3]} ·`, `§${m[2]}${x} ·`);
    }
    return L.join("\n");
}

// ── Schreiben eines Stamms in einen Baum (beide Layouts) ──────────────────────────────────────────────────────────
function schreibeZonen(ziel, T) {
    const S = stamm.schneide(T);
    fs.mkdirSync(path.join(ziel, stamm.DIR), { recursive: true });
    const soll = new Set(S.map((x) => x.pfad));
    for (const f of fs.readdirSync(path.join(ziel, stamm.DIR)))
        if (f.endsWith(".js") && !soll.has(`${stamm.DIR}/${f}`)) fs.unlinkSync(path.join(ziel, stamm.DIR, f));
    for (const x of S) fs.writeFileSync(path.join(ziel, x.pfad), x.text);
    const html = path.join(ziel, "index.html");
    fs.writeFileSync(
        html,
        stamm.tagsSetzen(
            fs.readFileSync(html, "utf8"),
            S.map((x) => x.pfad)
        )
    );
    if (fs.existsSync(path.join(ziel, stamm.ALT))) fs.unlinkSync(path.join(ziel, stamm.ALT));
    return S;
}
function schreibe(root, T) {
    if (stamm.layout(root) === "datei") fs.writeFileSync(path.join(root, stamm.ALT), T);
    else schreibeZonen(root, T);
}

// ── --pruef ───────────────────────────────────────────────────────────────────────────────────────────────────────
function tokenSha(T) {
    const h = require("crypto").createHash("sha256");
    for (const t of acorn.tokenizer(T, { ecmaVersion: "latest", sourceType: "script" }))
        h.update(`${t.type.label}\u0001${t.value === undefined ? "" : String(t.value)}\u0002`);
    return h.digest("hex").slice(0, 16);
}
function pruefe(root, rev) {
    const fehler = [];
    if (stamm.layout(root) === "datei") {
        const T = stamm.text(root);
        const S = stamm.schneide(T);
        if (stamm.fuege(S) !== T) fehler.push("S⁻¹∘S ≠ id");
        const zeilen = [
            `Datei-Layout: S∘S⁻¹ = id über ${S.length} Dateien (größte ${Math.max(...S.map((x) => x.text.split("\n").length - 1))} Z.)`,
        ];
        if (rev) {
            const a = tokenSha(stamm.textAusRev(root, rev));
            const b = tokenSha(T);
            zeilen.push(`Token ohne Kommentare: ${rev} ${a} ↔ Baum ${b}`);
            if (a !== b) fehler.push(`Token-Folge ≠ ${rev}`);
        }
        return { fehler, zeilen };
    }
    return pruefeBaum(root, stamm.textAusRev(root, rev || "HEAD~1"), rev || "HEAD~1");
}
// Der Zonen-Baum `root` gegen S(Tr): Tags, jede Datei Byte für Byte, die alte Datei fehlt, text() sha.
function pruefeBaum(root, Tr, wer) {
    const fehler = [];
    const S = stamm.schneide(Tr);
    if (fs.existsSync(path.join(root, stamm.ALT))) fehler.push(`${stamm.ALT} lebt noch`);
    const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
    const liste = stamm.tagsVon(html).map((t) => t.pfad);
    if (liste.join("\n") !== S.map((x) => x.pfad).join("\n"))
        fehler.push(`Tags ≠ S(${wer}) (${liste.length} ↔ ${S.length})`);
    for (const x of S) {
        const p = path.join(root, x.pfad);
        if (!fs.existsSync(p)) fehler.push(`fehlt: ${x.pfad}`);
        else if (fs.readFileSync(p, "utf8") !== x.text) fehler.push(`abweichend: ${x.pfad}`);
    }
    let sT = "?";
    try {
        sT = stamm.sha(stamm.text(root)).slice(0, 16);
    } catch (e) {
        fehler.push(`text(): ${e.message}`);
    }
    const sR = stamm.sha(Tr).slice(0, 16);
    if (sT !== sR) fehler.push(`text() ${sT} ≠ ${wer} ${sR}`);
    return { fehler, zeilen: [`Zonen-Baum: ${S.length} Dateien gegen S(${wer}), text() sha ${sT} ↔ ${sR}`] };
}

// ── --beweis ──────────────────────────────────────────────────────────────────────────────────────────────────────
function vergleiche(fa, fb) {
    const a = fa.zeilen.map((z) => z.split("|"));
    const b = fb.zeilen.map((z) => z.split("|"));
    const n = {
        schluessel: a.length,
        P: a.filter((x) => x[0] === "P").length,
        S: a.filter((x) => x[0] === "S").length,
    };
    const ab = { ordnung: 0, art: 0, quelle: 0, namelen: 0, daten: 0, nurAlt: 0, nurNeu: 0 };
    const namen = [];
    for (let i = 0; i < Math.min(a.length, b.length); i++)
        if (a[i][0] + a[i][1] !== b[i][0] + b[i][1]) (ab.ordnung++, namen.push(`Ordnung@${i} ${a[i][1]}↔${b[i][1]}`));
    const mb = new Map(b.map((x) => [x[0] + "|" + x[1], x]));
    const ma = new Map(a.map((x) => [x[0] + "|" + x[1], x]));
    for (const x of a) {
        const y = mb.get(x[0] + "|" + x[1]);
        if (!y) {
            (ab.nurAlt++, namen.push(`nur alt: ${x[1]}`));
            continue;
        }
        for (const [k, i] of [
            ["art", 2],
            ["quelle", 3],
            ["namelen", 4],
            ["daten", 5],
        ])
            if (x[i] !== y[i]) (ab[k]++, namen.push(`${k}: ${x[1]}`));
    }
    for (const y of b) if (!ma.has(y[0] + "|" + y[1])) (ab.nurNeu++, namen.push(`nur neu: ${y[1]}`));
    const summe = Object.values(ab).reduce((s, v) => s + v, 0);
    return { n, ab, summe, namen };
}
function beweise(root, T, teile) {
    const alt = stamm.ladeKlasse(root, { monolith: T });
    const neu = stamm.ladeKlasse(root, { teile });
    const fa = stamm.fingerabdruck(alt.AnazhRealm);
    const fb = stamm.fingerabdruck(neu.AnazhRealm);
    return Object.assign(vergleiche(fa, fb), {
        alt: fa.sha,
        neu: fb.sha,
        msAlt: alt.ms,
        msNeu: neu.ms,
        dateien: teile.length,
    });
}
const beweisZeile = (r) =>
    `Fingerabdruck alt ${r.alt} ↔ neu ${r.neu} · Schlüssel ${r.n.schluessel} (P ${r.n.P}, S ${r.n.S}) · Abweichungen ${r.summe} ` +
    `(Ordnung ${r.ab.ordnung}, Art ${r.ab.art}, Quelle ${r.ab.quelle}, name/length ${r.ab.namelen}, Daten ${r.ab.daten}, nur alt ${r.ab.nurAlt}, nur neu ${r.ab.nurNeu}) · ` +
    `${r.dateien} Dateien · vm-Laden ${r.msAlt.toFixed(0)} ↔ ${r.msNeu.toFixed(0)} ms`;

// ── --leser: der Codemod ──────────────────────────────────────────────────────────────────────────────────────────
// Kanonisch: (fs|require("fs")) .readFileSync( path.(join|resolve)( <wurzel>, "anazhRealm.js" ), "utf8" ) mit <wurzel> = ein
// Bezeichner (root, ROOT, PK.ROOT …) oder `__dirname, ".."` → stammLib.text(<wurzel>). Der Import heißt `stammLib` (29
// Skripte tragen schon eine Variable `stamm` — den gelesenen Text). Idempotent: ein zweiter Lauf findet keine kanonische
// Stelle mehr und ändert nichts. Was er nicht kennt, nennt die Absenz-Linse (diag-altlasten, Stamm-Leser-Wand).
const LIB_NAME = "stammLib";
const KANON = [
    [
        /\b(?:fs|require\("fs"\))\s*\.readFileSync\(\s*(path|require\("path"\))\.(?:join|resolve)\(\s*__dirname,\s*"\.\.",\s*"anazhRealm\.js"\s*\),\s*"utf8"\s*\)/g,
        (_m, p) => `${LIB_NAME}.text(${p}.join(__dirname, ".."))`,
    ],
    [
        /\b(?:fs|require\("fs"\))\s*\.readFileSync\(\s*(?:path|require\("path"\))\.(?:join|resolve)\(\s*([A-Za-z_$][\w$.]*),\s*"anazhRealm\.js"\s*\),\s*"utf8"\s*\)/g,
        (_m, w) => `${LIB_NAME}.text(${w})`,
    ],
];
function codemodDatei(datei, src) {
    let neu = src;
    for (const [rx, f] of KANON) neu = neu.replace(rx, f);
    if (neu === src) return {};
    if (/\.mjs$/.test(datei)) return { hand: "ein ES-Modul (kein require)" };
    const rel = path
        .relative(path.dirname(datei), path.join(ROOT, "scripts", "lib", "stamm.cjs"))
        .split(path.sep)
        .join("/");
    const req = `require("${rel.startsWith(".") ? rel : "./" + rel}")`;
    if (!neu.includes(`const ${LIB_NAME} = ${req};`)) {
        if (new RegExp(`\\b${LIB_NAME}\\b`).test(src)) return { hand: `der Name \`${LIB_NAME}\` ist belegt` };
        const L = neu.split("\n");
        let at = -1;
        for (let i = 0; i < Math.min(L.length, 200); i++) if (/^const \w+ = require\("[^"]+"\);$/.test(L[i])) at = i;
        if (at < 0) at = L.findIndex((z) => z === '"use strict";');
        if (at < 0 && L[0].startsWith("#!")) at = 0;
        L.splice(at + 1, 0, `const ${LIB_NAME} = ${req};`);
        neu = L.join("\n");
    }
    // ein `fs`, das nur der Stamm-Leser brauchte, fällt mit (eslint no-unused-vars)
    const fsZeile = /^\s*const fs = require\("fs"\);\s*$/;
    const rest = neu.split("\n").filter((z) => !fsZeile.test(z));
    if (/\bconst fs = require\("fs"\)/.test(neu) && !rest.some((z) => /\bfs\b/.test(z.replace(/\/\/.*$/, ""))))
        neu = rest.join("\n");
    return { neu };
}
function lesbareDateien(dir) {
    const out = [];
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) out.push(...lesbareDateien(p));
        else if (/\.(c|m)?js$/.test(e.name)) out.push(p);
    }
    return out;
}
function codemod(trocken) {
    const aus = new Set(
        ["lib/stamm.cjs", "stamm-umzug.cjs", "stamm-rehome.cjs"].map((f) => path.join(ROOT, "scripts", f))
    );
    const geaendert = [];
    const hand = [];
    let stellen = 0;
    for (const f of lesbareDateien(path.join(ROOT, "scripts"))) {
        if (aus.has(f)) continue;
        const src = fs.readFileSync(f, "utf8");
        const r = codemodDatei(f, src);
        const rel = path.relative(ROOT, f).split(path.sep).join("/");
        if (r.hand) hand.push(`${rel}: ${r.hand}`);
        if (!r.neu) continue;
        stellen += KANON.reduce((s, [rx]) => s + (src.match(rx) || []).length, 0);
        geaendert.push(rel);
        if (!trocken) fs.writeFileSync(f, r.neu);
    }
    return { geaendert, stellen, hand };
}

// ── --teile ───────────────────────────────────────────────────────────────────────────────────────────────────────
function teile(T, zone, methode) {
    const nn = zone.replace(/^§/, "");
    const sp = spannen(T).filter((s) => s.m.nn === nn);
    if (!sp.length) throw new Error(`--teile: keine Zone §${nn}`);
    const L = T.split("\n");
    const rx = new RegExp(
        `^ {4}(?:static\\s+)?(?:async\\s+)?(?:get\\s+|set\\s+)?\\*?${methode.replace(/[$]/g, "\\$")}\\s*\\(`
    );
    const i = L.findIndex((z, k) => rx.test(z) && sp.some((s) => k > s.a && k < s.b));
    if (i < 0) throw new Error(`--teile: ${methode} steht nicht in §${nn}`);
    let a = i; // vor die führenden Kommentare der Methode
    while (a > 0 && /^ {4}\/\//.test(L[a - 1])) a--;
    return markerSetzen(T, [{ zeile: a, nn, zone: sp[0].m.name, eingerueckt: true, art: "Glied", glied: methode }]);
}

// ── Selbsttest ────────────────────────────────────────────────────────────────────────────────────────────────────
function selbsttest() {
    const os = require("os");
    let rot = 0;
    const pruef = (name, ok, info) => {
        console.log(`${ok ? "  ok " : "  ROT"} ${name}${info ? " — " + info : ""}`);
        if (!ok) rot++;
    };
    const T = stamm.text(ROOT);
    const S = stamm.schneide(T);
    // 1) S∘text = id am Kopf
    if (stamm.layout(ROOT) === "datei") pruef("S⁻¹∘S = id am Kopf", stamm.fuege(S) === T, `${S.length} Dateien`);
    else pruef("S∘text = id am Kopf", pruefeBaum(ROOT, T, "text(root)").fehler.length === 0, `${S.length} Dateien`);
    // 2) die 40 letzten Stamm-Commits byte-genau
    const revs = execFileSync("git", ["-C", ROOT, "log", "-40", "--format=%H", "--", stamm.ALT], { encoding: "utf8" })
        .split("\n")
        .filter(Boolean);
    let gleich = 0;
    const t0 = Date.now();
    for (const r of revs) {
        try {
            const Tr = stamm.textAusRev(ROOT, r);
            if (stamm.fuege(stamm.schneide(Tr)) === Tr) gleich++;
            else console.log(`    ✗ ${r.slice(0, 8)} S⁻¹∘S ≠ id`);
        } catch (e) {
            console.log(`    ✗ ${r.slice(0, 8)} ${e.message}`);
        }
    }
    pruef(
        `die ${revs.length} letzten Stamm-Commits: S⁻¹∘S = id byte-genau`,
        revs.length === 40 && gleich === 40,
        `${gleich}/${revs.length}, ${Date.now() - t0} ms`
    );
    // 3) --beweis positiv: der Schnitt ist dieselbe Klasse
    const b = beweise(ROOT, T, S);
    pruef("--beweis: S(Kopf) = dieselbe Klasse", b.summe === 0 && b.alt === b.neu, beweisZeile(b));
    // 4) der injizierte Zwilling wirft an der Naht
    const zw = S.map((x) => Object.assign({}, x));
    const quelleZw = zw.findIndex((x) => /\n {4}_bodenSichtAt\(/.test(x.text));
    const m = /\n( {4}_bodenSichtAt\([\s\S]*?\n {4}\}\n)/.exec(zw[quelleZw].text);
    const zielZw = quelleZw === 2 ? 3 : 2;
    zw[zielZw] = Object.assign({}, zw[zielZw], { text: zw[zielZw].text.replace(/\n\}\n$/, "\n\n" + m[1] + "}\n") });
    let wurf = "";
    try {
        stamm.ladeKlasse(ROOT, { teile: zw });
    } catch (e) {
        wurf = e.message;
    }
    pruef("injizierter Zwilling → ROT an der Naht", /Stamm-Zwilling: _bodenSichtAt/.test(wurf), wurf);
    // 5) die fehlende Zone: der Lader wirft (ReferenceError), die Umkehrung wirft (Naht-Ruf)
    const ohne = S.filter((_, i) => i !== 4);
    wurf = "";
    try {
        stamm.ladeKlasse(ROOT, { teile: ohne });
    } catch (e) {
        wurf = `${e.name}: ${e.message}`;
    }
    let wurf2 = "";
    try {
        stamm.fuege(ohne);
    } catch (e) {
        wurf2 = e.message;
    }
    pruef(
        "fehlende Zone → ROT beim Laden und in der Umkehrung",
        /ReferenceError: AnazhRealm_Z\w+ is not defined/.test(wurf) && /Naht-Ruf/.test(wurf2),
        `${wurf} · ${wurf2}`
    );
    // 6) das verschobene statische Feld: --pruef nennt die Dateien; eine Naht, die Felder an Ort trägt, kippt die Ordnung
    const feldZone = S.findIndex((x) => /\n {4}static FUSION_STRATEGIES = /.test(x.text));
    const feldZeile = /\n( {4}static FUSION_STRATEGIES = [^\n]*\n)/.exec(S[feldZone].text)[1];
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "stamm-umzug-"));
    try {
        const verschoben = S.map((x, i) =>
            i === feldZone
                ? Object.assign({}, x, { text: x.text.replace(feldZeile, "") })
                : i === 1
                  ? Object.assign({}, x, { text: x.text.replace(/\n\}\n$/, "\n\n" + feldZeile + "}\n") })
                  : x
        );
        const d = path.join(tmp, "baum");
        fs.mkdirSync(path.join(d, stamm.DIR), { recursive: true });
        for (const x of verschoben) fs.writeFileSync(path.join(d, x.pfad), x.text);
        fs.writeFileSync(
            path.join(d, "index.html"),
            stamm.tagsSetzen(
                fs.readFileSync(path.join(ROOT, "index.html"), "utf8"),
                S.map((x) => x.pfad)
            )
        );
        const gut = pruefeBaum(d, stamm.fuege(verschoben), "sich selbst").fehler;
        const abw = pruefeBaum(d, T, "Kopf").fehler;
        pruef(
            "verschobenes Feld → --pruef nennt die Dateien",
            gut.length === 0 && abw.filter((f) => /^abweichend/.test(f)).length === 2,
            abw.join(" · ")
        );
        const naiv = verschoben.map((x, i) =>
            i === 0
                ? Object.assign({}, x, {
                      text: x.text
                          .replace("    for (const Z of zonen) tragen(Z, Ziel, statisch, true);\n", "")
                          .replace(
                              "tragen(Z, Ziel, statisch, false);",
                              "tragen(Z, Ziel, statisch, false);\n        tragen(Z, Ziel, statisch, true);"
                          ),
                  })
                : x
        );
        const r = beweise(ROOT, T, naiv);
        pruef(
            "verschobenes Feld + Naht an Ort → --beweis ROT (Ordnung)",
            r.ab.ordnung > 0 && r.namen.some((n) => /FUSION_STRATEGIES/.test(n)),
            r.namen.slice(0, 2).join(" · ")
        );
        // 7) --marker auf dem Kopf: jede Datei ≤ Decke, und S trägt die gesetzten Marker
        const v = markerVorschlag(T, 4000, 3000);
        const T1 = markerSetzen(T, v.schnitte);
        const S1 = stamm.schneide(T1);
        const groesste = Math.max(...S1.map((x) => x.text.split("\n").length - 1));
        pruef(
            "--marker: jede Datei ≤ 4 000 Z., Token gleich, Umkehrung",
            groesste <= 4000 && stamm.fuege(S1) === T1 && tokenSha(T1) === tokenSha(T),
            `${S1.length} Dateien, größte ${groesste} Z., ${v.schnitte.filter((c) => c.art === "Block").length} Block-Schnitte`
        );
    } finally {
        fs.rmSync(tmp, { recursive: true, force: true });
    }
    console.log(rot ? `stamm-umzug: ${rot} ROT` : "stamm-umzug: Selbsttest grün");
    return rot;
}

// ── CLI ───────────────────────────────────────────────────────────────────────────────────────────────────────────
function main() {
    if (argv.includes("--selftest")) return selbsttest() ? 1 : 0;
    if (argv.includes("--marker")) {
        const T = stamm.text(ROOT);
        const v = markerVorschlag(T, Number(opt("--decke", 4000)), Number(opt("--ziel-zeilen", 3000)));
        for (const z of v.bericht) console.log("  " + z);
        const T1 = markerSetzen(T, v.schnitte);
        const S1 = stamm.schneide(T1);
        console.log(
            `${v.schnitte.length} Unter-Marker (${v.schnitte.filter((c) => c.art === "Block").length} Block · ${v.schnitte.filter((c) => c.art === "Glied").length} Glied · ${v.schnitte.filter((c) => c.art === "Anweisung").length} Anweisung · ${v.schnitte.filter((c) => c.art === "VERSION").length} VERSION) → ${S1.length} Dateien, größte ${Math.max(...S1.map((x) => x.text.split("\n").length - 1))} Z.`
        );
        if (argv.includes("--setzen")) (schreibe(ROOT, T1), console.log("Marker gesetzt."));
        return 0;
    }
    if (argv.includes("--schnitt")) {
        const ziel = opt("--ziel");
        if (!ziel) throw new Error("--schnitt braucht --ziel <wurzel>");
        const z = path.resolve(ziel);
        if (z === ROOT && !argv.includes("--im-repo"))
            throw new Error("--schnitt ins Repo nur mit --im-repo (das Fenster)");
        const T = stamm.text(opt("--quelle") ? path.resolve(opt("--quelle")) : z);
        const t0 = Date.now();
        const S = schreibeZonen(z, T);
        console.log(
            `S: ${S.length} Dateien in ${Date.now() - t0} ms, größte ${Math.max(...S.map((x) => x.text.split("\n").length - 1))} Z., sha ${stamm.sha(T).slice(0, 16)}`
        );
        return 0;
    }
    if (argv.includes("--pruef")) {
        const r = pruefe(ROOT, opt("--rev"));
        for (const z of r.zeilen) console.log(z);
        for (const f of r.fehler) console.log("  ✗ " + f);
        return r.fehler.length ? 1 : 0;
    }
    if (argv.includes("--beweis")) {
        const lay = stamm.layout(ROOT);
        const T = lay === "datei" ? stamm.text(ROOT) : stamm.textAusRev(ROOT, opt("--rev", "HEAD~1"));
        const teileNeu =
            lay === "datei"
                ? stamm.schneide(T)
                : stamm.dateien(ROOT).map((p) => ({ pfad: p, text: fs.readFileSync(path.join(ROOT, p), "utf8") }));
        const r = beweise(ROOT, T, teileNeu);
        console.log(beweisZeile(r));
        for (const n of r.namen.slice(0, 20)) console.log("  ✗ " + n);
        return r.summe ? 1 : 0;
    }
    if (argv.includes("--teile")) {
        const i = argv.indexOf("--teile");
        schreibe(ROOT, teile(stamm.text(ROOT), argv[i + 1], argv[i + 2]));
        console.log(
            `§${argv[i + 1].replace(/^§/, "")} geteilt vor ${argv[i + 2]}: ${stamm.dateien(ROOT).length} Dateien`
        );
        return 0;
    }
    if (argv.includes("--leser")) {
        const r = codemod(argv.includes("--trocken"));
        console.log(
            `Codemod: ${r.stellen} kanonische Leser in ${r.geaendert.length} Dateien${argv.includes("--trocken") ? " (trocken)" : ""}`
        );
        for (const f of r.geaendert) console.log("  " + f);
        for (const f of r.hand) console.log("  VON HAND " + f);
        return r.hand.length ? 1 : 0;
    }
    console.log(
        "stamm-umzug: --marker [--setzen] | --schnitt --ziel <wurzel> | --pruef [--rev] | --beweis [--rev] | --teile §NN <methode> | --leser [--trocken] | --selftest"
    );
    return 2;
}

if (require.main === module) process.exit(main());
module.exports = {
    markerVorschlag,
    markerSetzen,
    schreibeZonen,
    pruefe,
    beweise,
    vergleiche,
    codemod,
    codemodDatei,
    tokenSha,
    teile,
};
