// zug-auswahl.cjs — DER ZUG NACH WIRKUNG: der VORLAUF hält den Zug (die Fänger echter Fehler, die Schritte der Karte ohne
// Takt-Wirkungen, der Puls), der NACHLAUF fährt den Rest nach der Landung, das HAUPTBUCH hält die Schuld, die BISEKTION nennt den
// Täter (V.). Die WIRKUNGS-KARTE (koordination zug/wirkung-karte.json) trägt je Schritt, was er wirklich ausführt und liest —
// gemessen, nie geraten:
//   · jede Seite und jeder Worker über die EINE CDP-Sitzung des Browsers (auto-attach, angehalten bis die Precise Coverage läuft:
//     kein Glied läuft ungezählt; RenderDocument aus, sonst tauscht ein Reload den Prozess und die Zählung der alten Seite stirbt),
//     dazu jeder `Function.prototype.toString` der Seite (`__codeOf`, `__fehlt`: die Absenz liest Text, ohne ihn auszuführen);
//   · jeder Node-Prozess über NODE_V8_COVERAGE (Kerne im vm-Faden, Linsen, Server) und die Lese-Spur (fs: Text, Liste, Probe —
//     was ein HTTP-Server ausliefert oder der Modul-Lader lädt, zählt die Abdeckung).
// Eingeschaltet NUR über `CI_WIRKUNG=<ordner>` (welt-boot ruft `haken()`, NODE_OPTIONS lädt diese Datei vor) — sonst null Kosten.
//   node scripts/lib/zug-auswahl.cjs --kopf                der Zug-Kopf (check.yml `kopf`): Vorlauf, Nachlauf oder alles
//   node scripts/lib/zug-auswahl.cjs --hauptbuch           der Nachlauf bucht (check.yml `nachlauf`): Hauptbuch, Bisektion, Fänger
//   node scripts/lib/zug-auswahl.cjs --messen [n …] [--gruppe g] [--parallel n]   misst Schritte der vollen Batterie unter CI_WIRKUNG
//   node scripts/lib/zug-auswahl.cjs --karte               die Roh-Spuren → koordination zug/wirkung-karte.json
//   node scripts/lib/zug-auswahl.cjs --laeufe <tage> <f>   die Läufe von check.yml (API) → <f>; --faenger <f> die Fänger → koordination
//   node scripts/lib/zug-auswahl.cjs --beweis <f> [ab]     der Beweis an den Zügen ab dem SHA `ab`
"use strict";
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..", "..");
// der Text als Glieder, je Schlüssel einmal; was acorn nicht liest: "kaputt"
const gliederMerk = (cache, k, text) => {
    if (!cache.has(k)) {
        let g = null;
        try {
            const s = text();
            g = s == null ? null : glieder(s);
        } catch {
            g = "kaputt";
        }
        cache.set(k, g);
    }
    return cache.get(k);
};

// ─── I. DIE SCHRITTE der vollen Batterie (check.yml, Job voll): je Schritt sein run-Text, seine Gruppe und Klasse
function vollSchritte(text = fs.readFileSync(path.join(ROOT, ".github/workflows/check.yml"), "utf8")) {
    const J = require("js-yaml").load(text).jobs.voll;
    const klasse = new Map(J.strategy.matrix.include.map((x) => [x.gruppe, x.klasse]));
    return J.steps
        .filter((s) => s.name && s.run && /matrix\.gruppe == \d+/.test(String(s.if)))
        .map((s, nr) => {
            const gruppe = +/matrix\.gruppe == (\d+)/.exec(s.if)[1];
            return { nr, name: s.name, run: s.run, gruppe, klasse: klasse.get(gruppe) };
        });
}

// ─── II. DIE GLIEDER ────────────────────────────────────────────────────────────────────────────────────────────────────────
// Ein GLIED ist eine Funktion, die einen Namen trägt (Deklaration, Methode, Eigenschaft, Variable, Zuweisung); sein Schlüssel der
// Pfad der Namen von außen (`AnazhRealm_kreatur_leben/removeCreature`). Eine namenlose Funktion (ein Rückruf) gehört dem Glied um
// sie. Je Glied zwei Abdrücke: `sig` die Token ohne Kommentare (ein inneres Glied als ⟨Name⟩) — was ausgeführt wird; `roh` der Text,
// wie `toString` ihn liefert — was eine Absenz liest. Der Rest der Datei ist `§<Subjekt>` je Anweisung (`AnazhRealm.TOD_LAGE = …`),
// ohne Subjekt `§` — `§` heißt auch: die Datei ist geladen.
const OPT = { ecmaVersion: "latest", allowHashBang: true, allowReturnOutsideFunction: true, allowAwaitOutsideFunction: true };
const IST_FN = (n) => n && /^(FunctionExpression|ArrowFunctionExpression)$/.test(n.type);
const abdruck = (s) => require("crypto").createHash("sha1").update(s).digest("base64").slice(0, 11);
function nameVon(t, n) {
    const schluessel = () => (n.computed ? t.slice(n.key.start, n.key.end) : n.key.name ?? String(n.key.value));
    const art = () => (/^[gs]et$/.test(n.kind) ? n.kind + " " : "") + (n.static ? "static " : "");
    switch (n.type) {
        case "FunctionDeclaration":
        case "ClassDeclaration":
        case "ClassExpression":
            return n.id && [n.id.name, n.type === "FunctionDeclaration"];
        case "MethodDefinition":
        case "PropertyDefinition":
        case "Property":
            return [art() + schluessel(), n.type === "MethodDefinition" || IST_FN(n.value)];
        case "VariableDeclarator":
            return n.id.type === "Identifier" && [n.id.name, IST_FN(n.init)];
        case "AssignmentExpression":
            return /^(Identifier|MemberExpression)$/.test(n.left.type) && [t.slice(n.left.start, n.left.end), IST_FN(n.right)];
    }
}
function glieder(t) {
    const acorn = require("acorn");
    let [baum, art, kommentar] = [null, "script", []];
    const onComment = (block, text, s, e) => kommentar.push([s, e]);
    try {
        baum = acorn.parse(t, { ...OPT, sourceType: art, onComment });
    } catch {
        kommentar = [];
        baum = acorn.parse(t, { ...OPT, sourceType: (art = "module"), onComment });
    }
    const G = [];
    const geh = (n, pfad, eltern, klasse = false) => {
        const x = nameVon(t, n);
        const p = x ? [...pfad, x[0]] : pfad;
        klasse ||= /^Class/.test(n.type);
        let g = eltern;
        if (x && x[1]) {
            // wo `toString` beginnt: eine Methode bei `async`/`get`/`*`/Name (ohne `static`), sonst die Funktion selbst
            const methode = n.type === "MethodDefinition" || n.method || /^[gs]et$/.test(n.kind);
            const ts = methode ? n.start + (n.static ? /^static\s*/.exec(t.slice(n.start))[0].length : 0) : (n.value || n.init || n.right || n).start; // prettier-ignore
            G.push((g = { k: p.join("/"), s: n.start, e: n.end, ts, eltern, klasse, sig: [] }));
        }
        require("./stamm.cjs").kinder(n, (c) => geh(c, p, g, klasse));
    };
    geh(baum, [], null);
    // die Anweisungen der Wurzel und ihr Subjekt — eine IIFE (`(function () { … })()`, UMD) trägt ihre Anweisungen wie die Wurzel,
    // ihre Subjekte gelten nur in der Datei (`lokal`)
    const iife = (n) => {
        let e = n.type === "ExpressionStatement" ? n.expression : null;
        while (e && /^(UnaryExpression|SequenceExpression)$/.test(e.type)) e = e.argument || e.expressions.at(-1);
        return e?.type === "CallExpression" ? [e.callee, ...e.arguments].filter((f) => IST_FN(f) && f.body.type === "BlockStatement") : [];
    };
    const flach = (body, lokal) => body.flatMap((n) => (iife(n).length ? iife(n).flatMap((f) => flach(f.body.body, true)) : [{ n, lokal }]));
    const satz = flach(baum.body, false).map(({ n, lokal }) => {
        const e = n.type === "ExpressionStatement" ? n.expression : n;
        const x = e.type === "VariableDeclaration" ? [e.declarations.map((d) => t.slice(d.id.start, d.id.end)).join(",")] : nameVon(t, e);
        return { s: n.start, e: n.end, k: "§" + (e.type === "ClassDeclaration" ? "class " : "") + ((x && x[0]) || ""), lokal, sig: [] };
    });
    satz.push({ s: Infinity, e: Infinity, k: "§", sig: [] }); // was zwischen den Anweisungen steht (die Hülle einer IIFE)
    // die Token ohne Kommentare in ihr innerstes Glied (ein inneres Glied hinterlässt ⟨Name⟩), sonst in ihre Anweisung
    const stapel = [];
    let [gi, si] = [0, 0];
    for (const tok of acorn.tokenizer(t, { ...OPT, sourceType: art })) {
        const p = tok.start;
        while (stapel.length && stapel.at(-1).e <= p) stapel.pop();
        while (gi < G.length && G[gi].s <= p) {
            const g = G[gi++];
            while (stapel.length && stapel.at(-1).e <= g.s) stapel.pop();
            if (stapel.length) stapel.at(-1).sig.push("⟨" + g.k.slice(g.k.lastIndexOf("/") + 1) + "⟩");
            stapel.push(g);
        }
        const text = t.slice(tok.start, tok.end);
        if (stapel.length) stapel.at(-1).sig.push(text);
        else {
            while (si < satz.length - 1 && satz[si].e <= p) si++;
            (satz[si].s <= p ? satz[si] : satz.at(-1)).sig.push(text);
        }
    }
    const tafel = new Map();
    for (const g of [...G, ...satz]) {
        const a = tafel.get(g.k) || { sig: "", roh: "", lokal: !!(g.eltern || g.lokal), klasse: !!g.klasse };
        a.sig += g.sig.join(" ") + "\n";
        if (g.ts != null) a.roh += t.slice(g.ts, g.e) + "\n";
        tafel.set(g.k, a);
    }
    for (const a of tafel.values()) [a.sig, a.roh] = [abdruck(a.sig), a.roh && abdruck(a.roh)];
    return { G, satz, tafel, t, kommentar };
}
// das innerste Glied um [s, e] — für eine Funktion der Abdeckung das Glied mit demselben Ende, sonst das umschließende; außerhalb `§`
function gliedUm(gl, s, e) {
    let [lo, hi] = [0, gl.G.length - 1];
    while (lo < hi) {
        const m = (lo + hi + 1) >> 1;
        if (gl.G[m].s <= s) lo = m;
        else hi = m - 1;
    }
    for (let g = gl.G[lo]; g; g = g.eltern) if (g.s <= s && e <= g.e) return g.k;
    return "§";
}
// die Anweisung (oder das Glied) an einer Stelle — für die Namens-Treffer
function satzUm(gl, i) {
    const k = gliedUm(gl, i, i + 1);
    return k !== "§" ? k : (gl.satz.find((x) => x.s <= i && i < x.e) || { k: "§" }).k;
}
// der Name eines Glieds: zu kurz für die Suche (`U`), wirkt er auf jeden, der die Datei lädt
const KURZ = (n) => !/^[\w$]{3,}$/.test(n);
const JS = /\.(c|m)?js$/;

// die Bitfelder der Karte (je Schritt `fn` über die EINE Tafel `glieder`)
const bits = {
    aus: (idx, n) => {
        const b = Buffer.alloc((n + 7) >> 3);
        for (const i of idx) b[i >> 3] |= 1 << (i & 7);
        return b.toString("base64");
    },
    hat: (b64, i) => {
        const b = (bits.puffer[b64] ||= Buffer.from(b64, "base64"));
        return !!(b[i >> 3] & (1 << (i & 7)));
    },
    puffer: {},
};

// ─── IV. DIE AUSWAHL ────────────────────────────────────────────────────────────────────────────────────────────────────────
// Der Diff wird zu WIRKUNGEN: `alle` (beim Namen) · `glied` [Datei, Schlüssel] mit fn (die Token änderten sich) / txt (der Text) /
// jung (die Karte kennt das Glied nicht: wer die Datei lädt) · `laden` (wer die Datei lädt) · `datei` · `verz` · `fege`. Ein
// neues oder gefallenes Glied und ein geändertes Subjekt (`AnazhRealm.X = …`) wirken über ihren NAMEN: jedes Glied, das den Namen
// trägt (git grep -w, am Grund und am Kopf; ein Subjekt, das ihn trägt, gibt seinen Namen weiter) — ein bewachter Ruf
// (`typeof this._x === "function"`) und jeder Leser einer Konstante. SICHER, nie still: alles, was die Karte nicht sieht, wählt ALLE.
const ALLE = [
    [/^package(-lock)?\.json$/, "Abhängigkeiten"],
    [/^\.github\//, "Workflow"],
    [/^scripts\/lib\//, "Linsen-Bibliothek"],
    [/^index\.html$/, "Kern-Boot (die Seite der Welt)"],
];
const KERN_GLIED = /^AnazhRealm(_dirigent_takt)?\/(constructor|_gameLoopTick)$/; // der Kern-Boot und der Haupt-Takt
const git = (args) => {
    const r = spawnSync("git", args, { cwd: ROOT, encoding: "utf8", maxBuffer: 1 << 30 });
    if (r.status > 1 || (r.status === 1 && args[0] !== "grep")) throw new Error(`git ${args.slice(0, 3).join(" ")}: ${r.stderr.trim()}`);
    return r.stdout;
};
const zeige = (rev, r) => {
    const x = spawnSync("git", ["show", `${rev}:${r}`], { cwd: ROOT, encoding: "utf8", maxBuffer: 1 << 30 });
    return x.status ? null : x.stdout;
};
const LEER = { tafel: new Map() };
// die Namen eines Glieds oder Subjekts: das letzte Glied des Pfads, einer Kette (`AnazhRealm.TOD_LAGE` → TOD_LAGE), jedes einer Liste
const namenVon = (k) => k.replace(/^§(class )?/, "").split("/").pop().replace(/^(get |set )?(static )?/, "").split(",").map((n) => n.trim().split(".").pop()).filter(Boolean); // prettier-ignore
function wirkungen(basis, kopf, karte, diff = null) {
    const W = [];
    const cache = new Map();
    const gl = (rev, r) => gliederMerk(cache, rev + ":" + r, () => zeige(rev, r));
    const kennt = new Map(Object.entries(karte.glieder).map(([r, ks]) => [r, new Set(ks)]));
    // jünger als die Karte: kein Schritt kennt das Glied, und am Kopf der Karte gab es es nicht (dort hieße es: nie ausgeführt)
    const jung = (r, k) => !kennt.get(r)?.has(k) && !(gl(karte.kopf, r) || LEER).tafel?.has(k);
    // ein Subjekt der Wurzel: `module.exports` wirkt auf jeden, der die Datei lädt, sonst über seine Namen (Herkunft: seine Datei)
    const namen = new Map();
    const nenne = (n, r, modul) => !namen.has(n) && namen.set(n, { r, modul: modul || /\.cjs$/.test(r) });
    const subjekt = (k, r, lokal) => {
        if (/^§((module\.)?exports\b|class )/.test(k) || namenVon(k).some(KURZ) || !namenVon(k).length) W.push({ laden: r, warum: `die Datei ändert ${k}` });
        else for (const n of namenVon(k)) nenne(n, r, lokal);
    };
    const z = diff || git(["diff", "--name-status", "--no-renames", "-z", basis, kopf]).split("\0").filter(Boolean);
    for (let i = 0; i < z.length; i += 2) {
        const [st, r] = [z[i][0], z[i + 1]];
        const a = ALLE.find(([re]) => re.test(r));
        if (a) W.push({ alle: `${a[1]}: ${r}` });
        else if (st === "A" && zeige(karte.kopf, r) == null) W.push({ alle: `Datei ohne Karte: ${r} (neu, die Karte kennt sie nicht)` });
        if (a || W.at(-1)?.alle?.includes(r)) continue;
        W.push({ datei: r });
        if (st !== "M") W.push({ verz: path.posix.dirname(r) });
        if (!JS.test(r)) continue;
        const [g0, g1] = [st === "A" ? LEER : gl(basis, r), st === "D" ? LEER : gl(kopf, r)];
        if (g0 === "kaputt" || g1 === "kaputt" || !g0 || !g1) {
            W.push({ alle: `nicht lesbar: ${r}` });
            continue;
        }
        const geaendert = [...new Set([...g0.tafel.keys(), ...g1.tafel.keys()])].filter((k) => g0.tafel.get(k)?.roh !== g1.tafel.get(k)?.roh).flatMap(namenVon); // prettier-ignore
        W.push({ suche: r, t: [g0.t || "", g1.t || ""], namen: geaendert }); // wer eine Stelle sucht (`dateiMit`, `fehlt`), hängt an jeder Datei, die sie trägt
        for (const k of new Set([...g0.tafel.keys(), ...g1.tafel.keys()])) {
            const [a0, a1] = [g0.tafel.get(k), g1.tafel.get(k)];
            const [fn, txt] = [!a0 || !a1 || a0.sig !== a1.sig, !a0 || !a1 || a0.roh !== a1.roh];
            if (!fn && !txt) continue;
            if (KERN_GLIED.test(k)) W.push({ alle: `Kern-Boot: ${r} ${k}` });
            else if (k === "§") W.push({ laden: r, warum: "die Datei ändert eine Anweisung ohne Subjekt" });
            else if (k.startsWith("§")) subjekt(k, r, (a0 || a1).lokal);
            else {
                W.push({ glied: [r, k], fn, txt, jung: !!a0 && jung(r, k) }); // ein neues Glied wirkt über seine Rufer und seinen Namen
                // ein lokales Glied nennt nur sein Eltern-Glied; ein Modul (.cjs) teilt nur Klassen-Glieder über den Namen
                if (!(a0 || a1).lokal && (!a0 || !a1) && ((a0 || a1).klasse || !/\.cjs$/.test(r)))
                    for (const n of namenVon(k)) KURZ(n) ? W.push({ laden: r, warum: `${k} trägt einen kurzen Namen` }) : nenne(n, r);
                if (txt || !a0 || !a1) W.push({ fege: r });
            }
        }
    }
    // die Namen: jedes Glied, das sie trägt, am Grund und am Kopf — außer in einer fremden Datei, die den Namen an ihrer Wurzel
    // selbst bindet (ihr eigenes `const lin` ist nicht das geänderte); ein Subjekt gibt seinen Namen weiter (höchstens 4 Runden)
    const bindet = (g, n) => g.tafel.has(n) || [...g.tafel.keys()].some((k) => k[0] === "§" && k.slice(1).split(",").includes(n));
    const fertig = new Set();
    const imKommentar = (g, i) => g.kommentar.some(([s, e]) => s <= i && i < e);
    const modul = (n) => namen.get(n).modul; // ein Name aus einem Modul oder einer IIFE gilt nur in ihrer Datei
    for (let runde = 0; runde < 4; runde++) {
        const neu = [...namen.keys()].filter((n) => !fertig.has(n));
        if (!neu.length) break;
        const global = [...fertig, ...neu].filter((n) => !modul(n));
        if (global.length > 60) {
            W.push({ alle: `Namens-Flut: ${global.length} Namen wirken (${global.slice(-5).join(", ")} …)` });
            break;
        }
        neu.forEach((n) => fertig.add(n));
        for (const rev of [basis, kopf]) {
            const out = git(["grep", "-n", "-w", "-F", ...neu.flatMap((n) => ["-e", n]), rev, "--", "*.js", "*.cjs", "*.mjs", "*.html", ":!vendor"]); // prettier-ignore
            for (const zl of out.split("\n").filter(Boolean)) {
                const [, r, zeile, text] = /^[^:]+:([^:]+):(\d+):(.*)$/.exec(zl) || [];
                const g = r && JS.test(r) && gl(rev, r);
                if (r && (!g || g === "kaputt")) W.push({ datei: r });
                if (!g || g === "kaputt") continue;
                const ab = g.zeilen || (g.zeilen = [0, ...[...g.t.matchAll(/\n/g)].map((m) => m.index + 1)]);
                for (const n of neu.filter((x) => new RegExp(`(^|[^\\w$])${x.replace(/\$/g, "\\$")}([^\\w$]|$)`).test(text))) {
                    const i = ab[zeile - 1] + Math.max(0, text.indexOf(n));
                    if (r !== namen.get(n).r && (modul(n) || bindet(g, n))) continue;
                    if (imKommentar(g, i)) continue;
                    const k = satzUm(g, i);
                    if (k === "§") W.push({ laden: r, warum: `eine Anweisung trägt ${n}` });
                    else if (k[0] === "§") subjekt(k, r, g.tafel.get(k)?.lokal);
                    else if (!(rev === kopf && !gl(basis, r)?.tafel?.has(k))) W.push({ glied: [r, k], fn: true, txt: false, jung: jung(r, k), nennt: n }); // ein neues Glied ruft nur Neues
                }
            }
        }
    }
    return W;
}
// Die Wahl ist rein (Karte · Wirkungen → Schritte), die Linse (gate:ci-deckung, L) prüft sie gegen ihr eigenes Orakel
function karteIndex(karte) {
    if (karte.__idx) return karte.__idx;
    const idx = new Map();
    let i = 0;
    for (const r of Object.keys(karte.glieder).sort()) idx.set(r, new Map(karte.glieder[r].map((k) => [k, i++])));
    Object.defineProperty(karte, "__idx", { value: idx });
    return idx;
}
function grundIm(x, w, idx) {
    const bei = (r, k) => idx.get(r)?.get(k);
    const laedt = (r) => bei(r, "§") != null && bits.hat(x.fn, bei(r, "§"));
    if (w.glied) {
        const i = bei(...w.glied);
        if (i != null && w.fn && bits.hat(x.fn, i)) return `führt ${w.glied.join(" ")} aus${w.nennt ? ` (nennt ${w.nennt})` : ""}`;
        if (i != null && w.txt && x.txt.includes(i)) return `liest ${w.glied.join(" ")} als Text`;
        if (w.jung && laedt(w.glied[0])) return `lädt ${w.glied[0]} (${w.glied[1]} ist jünger als die Karte)`;
    }
    if (w.laden && laedt(w.laden)) return `lädt ${w.laden} (${w.warum})`;
    if (w.datei && (x.datei.includes(w.datei) || x.probe.includes(w.datei))) return `liest ${w.datei}`;
    if (w.fege && x.fege.includes(w.fege)) return `fegt ${w.fege} als Text`;
    if (w.verz && x.verz.includes(w.verz)) return `listet ${w.verz}/`;
    const s = w.suche && (x.suche || []).find((y) => sucht(y, w));
    if (s) return `sucht „${s.slice(0, 50)}" in ${w.suche}`;
    return null;
}
// eine Suche: die Stelle von `dateiMit` (ein Text) oder die Absenz von `fehlt` ([Muster, Flags, Ort, Glieder]): sie trifft eine
// geänderte Datei, wenn deren Text sie trägt (vorher oder nachher, ohne Kommentare) oder die Datei ein genanntes Glied ändert
function sucht(y, w) {
    if (y[0] !== "[") return w.t.some((t) => t.includes(y));
    const [quelle, flags, ort, glieder] = JSON.parse(y);
    if (ort.endsWith("/") ? !w.suche.startsWith(ort) : w.suche !== ort) return false;
    const re = new RegExp(quelle, flags.replace("g", ""));
    return w.t.some((t) => re.test(require("./stamm.cjs").ohneKommentare(t))) || glieder.some((g) => w.namen.includes(g));
}
function waehle(namen, karte, W) {
    const [idx, gewaehlt] = [karteIndex(karte), new Map()];
    const alle = W.filter((w) => w.alle).map((w) => w.alle);
    for (const n of namen) {
        const x = karte.schritte[n];
        if (alle.length) gewaehlt.set(n, `ALLE — ${alle[0]}`);
        else if (!x || !x.gruen) gewaehlt.set(n, x ? "ohne Karte (ihre Messung war ROT)" : "ohne Karte");
        else
            for (const w of W) {
                const g = grundIm(x, w, idx);
                if (g) {
                    gewaehlt.set(n, g);
                    break;
                }
            }
    }
    return { alle, gewaehlt, aus: namen.filter((n) => !gewaehlt.has(n)) };
}

// ─── V. DER ZUG: VORLAUF · NACHLAUF · HAUPTBUCH · BISEKTION ─────────────────────────────────────────────────────────────────
// Der Zug hält auf dem VORLAUF: (a) die FÄNGER — jeder Schritt, der in TAGE Tagen einen ECHTEN Fehler fing; (b) was die Karte für
// die Wirkungen des Kandidaten wählt, außer einer TAKT-Wirkung (sie trifft die Hälfte der gemessenen Schritte und mehr: der
// Welt-Takt, `alle` — die Karte trägt dort ihr Tal, 392 Glieder zwischen 40 und 59 von 113 Schritten); (c) den Puls (Job `puls`).
// Der NACHLAUF (Push auf main, nachts) fährt jeden Schritt, der am Kopf in keinem Lauf grün steht; wartet ein Zug, weicht er nach
// dem laufenden Schritt (der Rest bleibt Schuld). Das HAUPTBUCH (koordination ZUG.buch) trägt je Schritt sein letztes Grün, die
// SCHULD sind die Landungen seitdem; ein roter Nachlauf-Schritt bisektiert über die Merges seiner offenen Landungen (höchstens
// SCHULD_MAX) und nennt den Täter-Zweig in ZUG.rot. Die Karte und die Fänger liegen im Zweig koordination, nie in spec/.
const ZUG = { karte: "zug/wirkung-karte.json", faenger: "zug/faenger.json", buch: "zug/hauptbuch.json", rot: "zug/nachlauf-rot.txt" };
const [TAGE, SCHULD_MAX, TAG] = [14, 4, 864e5];
const SPIEL = /^(stamm\/|worlds\/(?!.*\/lib\/)|index\.html$|[^/]+\.js$)/; // die Spiel-Pfade der Wachstums-Wand (diag-betriebsgesetz)
const kurz = (n) => n.replace(/\s*\(.*$/s, "").trim(); // der Schlüssel eines Schritts: sein Name bis zur Klammer
const zeit = (x) => +new Date(x);
const schlaf = (ms) => require("timers/promises").setTimeout(ms);

// a) die API: EINE Anfrage (ein 5xx oder Abriss ist ein Wackler, bis 5 Versuche; sonst ROT) und die Läufe
function apiMit(basis = `https://api.github.com/repos/${process.env.GITHUB_REPOSITORY || "MiguellD/AnazhRealm"}`, token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN) {
    const api = async (p, v = 1) => {
        const r = await fetch(basis + p, { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" } }).catch((e) => (v < 3 ? null : Promise.reject(e))); // prettier-ignore
        if ((!r || r.status >= 500) && v < 5) return schlaf(3000 * v).then(() => api(p, v + 1));
        if (!r.ok) throw new Error(`${p}: ${r.status} ${await r.text()}`);
        return r.json();
    };
    return api;
}
// die Läufe, neueste zuerst: `nimm` wählt, `seit` endet; eine kurze Seite wird bis 3× neu gefragt — sonst ROT, nie leer (ci-zeiten)
async function alleLaeufe(api, pfad, { nimm = () => true, seit = 0, hoechstens = Infinity, traegt = (rs) => rs.length > 0, pause = 2000 } = {}) {
    const [out, je, neu] = [[], 30, (x) => new Date(x.created_at) >= seit];
    let [gesamt, gelesen] = [0, 0];
    for (let seite = 1; ; seite++) {
        let r;
        for (let v = 1; ; v++) {
            r = await api(`${pfad}?per_page=${je}&page=${seite}`);
            gesamt = Math.max(gesamt, r.total_count);
            if (r.workflow_runs.length >= Math.min(je, gesamt - gelesen) && (seite > 1 || traegt(r.workflow_runs))) break;
            if (v === 3) throw new Error(`ROT: ${pfad} Seite ${seite} trägt ${r.workflow_runs.length} Läufe von ${gesamt} nach 3 Versuchen`);
            await schlaf(pause * v);
        }
        gelesen += r.workflow_runs.length;
        out.push(...r.workflow_runs.filter((x) => nimm(x) && neu(x)));
        if (!r.workflow_runs.every(neu) || out.length >= hoechstens || r.workflow_runs.length < je) return out.slice(0, hoechstens);
    }
}
// je Lauf von check.yml (ab `seit`, je Tag gefragt: die API trägt je Frage höchstens 1000; `frage` = eine Frage-Zeile) seine Jobs
// aller Versuche — ein Job je id, je Schritt [Name, Schluss, Anfang, Ende]; ein abgeschlossener Lauf aus `alt` wird nicht neu gefragt
async function laeufe(api, seit, alt = {}, frage = null) {
    const R = [];
    const fragen = frage ? [frage] : [];
    for (let d = new Date(seit); !frage && d < new Date(); d = new Date(+d + TAG)) fragen.push("created=" + d.toISOString().slice(0, 10));
    for (const q of fragen)
        for (let p = 1, r = []; p === 1 || r.length === 100; p++) R.push(...(r = (await api(`/actions/workflows/check.yml/runs?per_page=100&page=${p}&${q}`)).workflow_runs).filter((x) => zeit(x.created_at) >= seit)); // prettier-ignore
    const jobs = async (id, je = 100) => {
        const out = [];
        for (let p = 1; ; p++) {
            const j = (await api(`/actions/runs/${id}/jobs?filter=all&per_page=${je}&page=${p}`).catch((e) => (je > 30 ? null : Promise.reject(e))))?.jobs; // prettier-ignore
            if (!j) return jobs(id, 30); // die volle Seite riss mit 502
            out.push(...j.filter((x) => !out.some((y) => y.id === x.id)));
            if (j.length < je) return out;
        }
    };
    const out = {};
    const bahn = async () => {
        for (let r; (r = R.shift()); ) {
            const a = alt[r.id];
            out[r.id] = a?.att === r.run_attempt && r.status === "completed" ? a : { sha: r.head_sha, zweig: r.head_branch, ev: r.event, att: r.run_attempt, st: r.status, t: r.created_at, jobs: (await jobs(r.id)).map((j) => ({ id: j.id, att: j.run_attempt, n: j.name, st: j.status, a: j.started_at, e: j.completed_at, s: (j.steps || []).map((s) => [s.name, s.conclusion, s.started_at, s.completed_at]) })) }; // prettier-ignore
        }
    };
    await Promise.all(Array.from({ length: 8 }, bahn));
    return out;
}
const VORB = /^(Set up|Run actions|Cache|System-Libs|Dependencies|Urteil der Gruppe|Post |Complete|Ein Urteil|Zug-Wahl)/;
// die Schritte eines Laufs (voll und echt): f(Schlüssel, Schluss, Schritt, Job) — die Echt-Gruppe trägt „echt: " vor dem Namen
const schritteIm = (l, f) => l.jobs.forEach((j) => /^(voll|echt)/.test(j.n) && j.s.forEach((s) => VORB.test(s[0]) || f((j.n[0] === "e" ? "echt: " : "") + kurz(s[0]), s[1], s, j))); // prettier-ignore

// b) die Schritte am Stand: die volle Batterie (vollSchritte) und die Echt-Gruppe, je mit ihrem Schlüssel
function zugSchritte(text = fs.readFileSync(path.join(ROOT, ".github/workflows/check.yml"), "utf8")) {
    const echt = require("js-yaml").load(text).jobs.echt?.steps || [];
    const v = vollSchritte(text).map((s) => ({ ...s, key: kurz(s.name), job: "voll" }));
    const zwilling = (e) => v.find((s) => s.run.trim() === e.run.trim());
    return v.concat(echt.filter((s) => s.name && s.run && !VORB.test(s.name)).map((s) => ({ name: s.name, run: s.run, key: "echt: " + kurz(s.name), job: "echt", klasse: "gpu", zwilling: zwilling(s)?.key }))); // prettier-ignore
}

// c) der Zweig koordination: lesen (ohne Blobs geholt, je Datei nachgeholt) und schreiben (ein Commit über den Index, bis 8 Versuche)
let koordDa = false;
function koord(datei) {
    if (!koordDa) git(["fetch", "-q", "--depth=1", "--filter=blob:none", "origin", "+refs/heads/koordination:refs/remotes/origin/koordination"]); // prettier-ignore
    koordDa = true;
    return zeige("origin/koordination", datei);
}
async function koordSchreib(dateien, botschaft) {
    for (let v = 1; ; v++) {
        koordDa = false;
        koord("README.md");
        const idx = path.join(require("os").tmpdir(), `koord-${process.pid}`);
        const wer = { GIT_AUTHOR_NAME: "zug-nachlauf", GIT_AUTHOR_EMAIL: "41898282+github-actions[bot]@users.noreply.github.com" };
        const g = (a, input) => spawnSync("git", a, { cwd: ROOT, input, encoding: "utf8", env: { ...wer, GIT_COMMITTER_NAME: wer.GIT_AUTHOR_NAME, GIT_COMMITTER_EMAIL: wer.GIT_AUTHOR_EMAIL, ...process.env, GIT_INDEX_FILE: idx } }).stdout.trim(); // prettier-ignore
        g(["read-tree", "origin/koordination"]);
        for (const [d, t] of Object.entries(dateien)) g(["update-index", "--add", "--cacheinfo", `100644,${g(["hash-object", "-w", "--stdin"], t)},${d}`]); // prettier-ignore
        const c = g(["commit-tree", g(["write-tree"]), "-p", "origin/koordination", "-m", botschaft]);
        if (spawnSync("git", ["push", "-q", "origin", `${c}:refs/heads/koordination`], { cwd: ROOT }).status === 0) return c;
        if (v === 8) throw new Error(`koordination: der Push wurde 8× abgewiesen (${botschaft})`);
        await schlaf(2000 * v);
    }
}

// d) die Geschichte von main (Erst-Eltern): je Zweig seine gelandeten Köpfe, je Landung (Versions-Stufe) ihr Kopf und ihre Merges
function mainGeschichte(kopf = "origin/main") {
    const M = { landung: new Map(), staende: [] };
    for (const z of git(["log", "--first-parent", "--format=%H %P|%ct|%s", "-n", "3000", kopf]).trim().split("\n").reverse()) {
        const [hp, ct, s] = z.split("|");
        const t = new Date(ct * 1000).toISOString();
        const [h, , p2] = hp.split(" ");
        const zweig = /^Merge (\S+) in integ-probe/.exec(s)?.[1];
        M.staende.push({ h, t, zweig, landung: /Versions-Stufe/.test(s) });
        if (zweig && p2) (M.landung.get(zweig) || M.landung.set(zweig, []).get(zweig)).push({ kopf: p2, t });
    }
    return M;
}
// die Zweige eines Kandidaten (integ-probe): die Merges auf dem Erst-Eltern-Pfad bis zum Stand davor
function zweigeIm(x) {
    const out = [];
    for (const [i, z] of git(["log", "--first-parent", "--format=%P|%s", "-n", "40", x]).trim().split("\n").entries()) {
        const m = /^\S+ (\S+)\|Merge (\S+) in integ-probe/.exec(z);
        if (m) out.push({ kopf: m[1], zweig: m[2] });
        else if (i) break;
    }
    return out;
}

// e) DIE FÄNGER (a): je roter Schritt die HEILUNG — im Zug jeder Zweig des Kandidaten, der danach ANDERS landete (seine eigenen
// Commits bis zur Landung), auf einem Zweig seine eigenen Commits bis zum nächsten Grün des Schritts (sonst bis zur Landung). Die
// Methode der Regel-Inventur vom 07.11. (im Zweig `koordination`, bericht/regel-inventur-0711) als Werkzeug: REIBUNG ist bewiesen, wenn derselbe SHA im
// Schritt grün wurde (wackler), sein echt-Zwilling am SHA grün stand (gpu: nur swiftshader), der Schritt ohne Urteil abbrach
// (abbruch) oder die Heilung kein Spiel änderte, das der Schritt nach seiner Karte ausführt (ohne Karte: kein Spiel); ECHT, wenn
// sie es änderte; OFFEN, solange keine Heilung landet. `bekannt` = die Landung der Heilung (ab dann zählt der Fang im Vorlauf).
function faenger(L, karte, M = mainGeschichte(), alt = []) {
    const [gruen, rot, zahl, W] = [new Set(), new Map(), { wackler: 0, gpu: 0, abbruch: 0, echt: 0, reibung: 0, offen: 0 }, new Map()];
    const liste = Object.values(L).sort((a, b) => zeit(a.t) - zeit(b.t));
    for (const l of liste)
        schritteIm(l, (k, c) => {
            if (c === "success") gruen.add(l.sha + "|" + k);
            const e = (c === "failure" || c === "cancelled") && (rot.get(l.sha + "|" + k) || rot.set(l.sha + "|" + k, { k, sha: l.sha, zweig: l.zweig, t: l.t }).get(l.sha + "|" + k)); // prettier-ignore
            if (e) e.urteil ||= c === "failure";
        });
    for (const e of alt.filter((x) => x.kl === "offen")) rot.has(e.sha + "|" + e.k) || rot.set(e.sha + "|" + e.k, { ...e, urteil: true }); // prettier-ignore
    const da = (s) => spawnSync("git", ["cat-file", "-e", s], { cwd: ROOT }).status === 0 || spawnSync("git", ["fetch", "-q", "origin", s], { cwd: ROOT }).status === 0; // prettier-ignore
    const name = (k) => Object.keys(karte.schritte).find((n) => kurz(n) === k && karte.schritte[n].gruen);
    // führt der Schritt die Spiel-Änderungen der eigenen Commits a..b aus? (je Spanne EINE Wirkungs-Liste)
    const spielWirkt = (a, b, k) => {
        if (!da(a) || !da(b)) return null;
        if (!W.has(a + b)) {
            const f = [...new Set(git(["log", "--first-parent", "--no-merges", "--format=", "--name-only", `${a}..${b}`]).split("\n"))].filter((p) => SPIEL.test(p)); // prettier-ignore
            const w = f.length && wirkungen(a, b, karte, git(["diff", "--name-status", "--no-renames", "-z", a, b, "--", ...f]).split("\0").filter(Boolean)); // prettier-ignore
            W.set(a + b, w && new Set(waehle(Object.keys(karte.schritte), karte, w).gewaehlt.keys()));
        }
        return !!W.get(a + b) && (!name(k) || W.get(a + b).has(name(k)));
    };
    const naechst = (e) => liste.find((l) => l.zweig === e.zweig && zeit(l.t) > zeit(e.t) && l.sha !== e.sha && l.jobs.some((j) => j.s.some((s) => s[1] === "success" && (j.n[0] === "e" ? "echt: " : "") + kurz(s[0]) === e.k))); // prettier-ignore
    const landet = (z, t) => (M.landung.get(z) || []).find((x) => zeit(x.t) >= zeit(t));
    const out = [];
    for (const [id, e] of rot) {
        let kl = gruen.has(id) ? "wackler" : !e.k.startsWith("echt") && gruen.has(`${e.sha}|echt: ${e.k} auf der Karte`) ? "gpu" : !e.urteil ? "abbruch" : null; // prettier-ignore
        const [heil, taeter] = [[], []];
        if (!kl) {
            const y = e.zweig !== "integ-probe" && naechst(e);
            const zw = e.zweig === "integ-probe" ? (da(e.sha) ? zweigeIm(e.sha) : []) : [{ zweig: e.zweig, kopf: e.sha }];
            for (const b of zw) {
                const z = y ? { kopf: y.sha, t: y.t } : landet(b.zweig, e.t);
                if (!z) heil.push(null);
                else if (z.kopf !== b.kopf) heil.push([b.zweig, b.kopf, z.kopf, z.t]);
            }
            for (const h of heil.filter(Boolean)) if (spielWirkt(h[1], h[2], e.k)) taeter.push(h);
            kl = taeter.length ? "echt" : heil.some(Boolean) ? "reibung" : heil.length ? "offen" : "reibung";
            out.push({ k: e.k, sha: e.sha, zweig: e.zweig, t: e.t, kl, taeter: taeter.map((h) => h[0]), bekannt: taeter.map((h) => h[3]).sort().at(-1) }); // prettier-ignore
        }
        zahl[kl]++;
    }
    return { zahl, ereignisse: out };
}
// die echten FEHLER zur Zeit t: aus den letzten TAGE Tagen, deren Heilung vor t landete — EIN Fehler je Täter und Heilung, gefangen von
// jedem seiner roten Schritte: id → die Schlüssel, die ihn fingen
const fehlerAm = (F, t) => F.ereignisse.filter((e) => e.kl === "echt" && zeit(e.t) >= t - TAGE * TAG && zeit(e.bekannt) < t).reduce((m, e) => m.set(e.taeter + " " + e.bekannt, (m.get(e.taeter + " " + e.bekannt) || new Set()).add(e.k)), new Map()); // prettier-ignore
// die Sekunden je Schlüssel aus der EINEN Tafel spec/ci/ci-zeiten.json (die Echt-Gruppe ohne „echt: ")
// (`.puls` die Summe der ganzen Tafel, `.vorb(echt)` die Vorbereitung eines Jobs)
function sekunden() {
    const z = JSON.parse(fs.readFileSync(path.join(ROOT, "spec/ci/ci-zeiten.json"), "utf8"));
    const m = new Map(Object.entries(z.schritte).map(([n, x]) => [kurz(n), x.s]));
    return Object.assign((k) => m.get(k.replace(/^echt: /, "")) || 0, { puls: [...m.values()].reduce((a, s) => a + s, 0), vorb: (e) => (e ? z.echt.vorbereitung_s : z.vorbereitung_s) }); // prettier-ignore
}

// f) DIE WAHL des Vorlaufs — ein BUDGET: VORLAUF_ANTEIL der Batterie (die Sekunden der Tafel; der Puls, der Kopf und die Vorbereitung
// jeder Gruppe, die er öffnet, zahlen mit), gefüllt nach
// erwarteten echten Fehlern je Sekunde. (a) ein Schritt zählt die Fehler der Fänger-Tafel, die er als erster der Wahl deckt; (b) die
// E Fehler des Fensters verteilen sich gleich auf die Wirkungen des Diffs außer der Takt-Wirkung (sie trifft die Hälfte der gemessenen
// Schritte und mehr), jede gleich auf ihre Schritte — beide in Fehlern je Zug. Was am SHA schon grün steht, fährt nie noch einmal; im
// Zug urteilt der echt-Job eine Wand, deren Text er wörtlich fährt (EINE Zug-Stelle: ihr swiftshader-Lauf bleibt Schuld des Nachlaufs).
// der Schöpfer, 08.11.: der Vorlauf trägt höchstens ein Viertel der heutigen Rechenzeit — die Tafel wiegt p90, der Zug misst Läufe:
// 0,25 der Tafel trug 27,1 % der Rechenzeit (Median, 35 Züge 60e60d09…ef667956), 0,23 trägt das Viertel (zug-werkzeug --beweis)
const VORLAUF_ANTEIL = 0.23;
function vorlauf(basis, kopf, karte, F, t = Date.now(), S = zugSchritte(zeige(kopf, ".github/workflows/check.yml") ?? undefined), sek = sekunden()) { // prettier-ignore
    const [fehler, idx, gemessen, b, stelle] = [fehlerAm(F, t), karteIndex(karte), Object.keys(karte.schritte).filter((n) => karte.schritte[n].gruen), new Map(), (k) => S.find((s) => s.zwilling === k)?.key ?? k]; // prettier-ignore
    let [n, takt] = [0, 0];
    for (const w of wirkungen(basis, kopf, karte)) {
        const s = w.alle ? gemessen : gemessen.filter((x) => grundIm(karte.schritte[x], w, idx));
        if (s.length * 2 >= gemessen.length) takt++;
        else if (s.length && ++n) for (const x of s) b.set(stelle(kurz(x)), (b.get(stelle(kurz(x))) || 0) + 1 / s.length);
    }
    const [E, wahl] = [fehler.size, new Map()];
    const kann = S.filter((s) => !S.some((e) => e.zwilling === s.key));
    const [offen, preis] = [new Set(), (s) => sek(s.key) + (offen.has(s.gruppe ?? "echt") ? 0 : sek.vorb(!s.gruppe))];
    const puls = sek.puls - S.reduce((a, s) => a + sek(s.key), 0); // der Puls und der Kopf: was die Tafel außer voll und echt trägt
    let rest = VORLAUF_ANTEIL * sek.puls - puls;
    for (;;) {
        const wert = (k) => [...fehler.values()].filter((f) => f.has(k)).length + (E * (b.get(k) || 0)) / Math.max(1, n);
        const [s] = kann.filter((x) => !wahl.has(x.key) && preis(x) <= rest && wert(x.key) > 0).sort((x, y) => wert(y.key) / preis(y) - wert(x.key) / preis(x)); // prettier-ignore
        if (!s) break;
        const k = s.key;
        rest -= preis(s);
        offen.add(s.gruppe ?? "echt");
        const f = [...fehler].filter(([, s]) => s.has(k)).map(([id]) => (fehler.delete(id), id.split(" ")[0]));
        wahl.set(k, `${f.length ? `deckt ${f.length} echte Fehler (${f.join(", ")})` : ""}${f.length && b.has(k) ? " · " : ""}${b.has(k) ? `Karte ${(E * b.get(k) / Math.max(1, n)).toFixed(3)} Fehler je Zug` : ""} · ${sek(k)} s`); // prettier-ignore
    }
    return { wahl, takt, n, E, rest };
}
// grün und rot am Kopf: jeder Lauf von check.yml mit diesem SHA, jeder Versuch — grün zählt nur, was die Zug-Liste seines Laufs fahren
// ließ (die Annotation „Zug-Liste" des Kopfs) und nicht dem Zug wich („Zug-Vorrang"): ein ruhender Schritt endet grün, ohne zu laufen
// lief der Schritt `k` in diesem Lauf (seine Jobs `{ id, n|name }`)? (die Zeiten von ci-zeiten.cjs zählen nur, was lief)
async function liefen(api, jobs) {
    const a = (await Promise.all(jobs.filter((j) => /^(kopf|voll|echt)/.test(j.n || j.name)).map((j) => api(`/check-runs/${j.id}/annotations`)))).flat(); // prettier-ignore
    const [liste, wich] = [a.find((x) => x?.title === "Zug-Liste"), new Set(a.filter((x) => x?.title === "Zug-Vorrang").map((x) => x.message))]; // prettier-ignore
    return (k) => (!liste || JSON.parse(liste.message).includes(k)) && !wich.has(k);
}
async function amKopf(api, sha) {
    const [gruen, rot] = [new Set(), new Set()];
    for (const l of Object.values(await laeufe(api, 0, {}, `head_sha=${sha}`))) {
        const lief = await liefen(api, l.jobs);
        schritteIm(l, (k, c) => (c === "success" ? lief(k) && gruen.add(k) : c === "failure" && rot.add(k)));
    }
    return { gruen, rot: new Set([...rot].filter((k) => !gruen.has(k))) };
}
// DER ZUG-KOPF (Job `kopf`): die Art des Laufs, seine Liste (Schlüssel), die Gruppen der vollen Batterie, ob voll und echt fahren
async function zugKopf(e = process.env, api = apiMit()) {
    const art = e.GITHUB_EVENT_NAME === "workflow_dispatch" ? "alle" : e.GITHUB_EVENT_NAME === "schedule" || e.GITHUB_REF === "refs/heads/main" ? "nachlauf" : "vorlauf"; // prettier-ignore
    const S = zugSchritte();
    const { gruen } = await amKopf(api, e.GITHUB_SHA);
    let grund = new Map(S.map((s) => [s.key, art]));
    if (art === "vorlauf") {
        const lies = (d) => JSON.parse(koord(d) ?? (() => { throw new Error(`ROT: koordination ${d} fehlt — der Vorlauf hat keine ${d === ZUG.karte ? "Karte" : "Fänger"}`); })()); // prettier-ignore
        const basis = git(["merge-base", "origin/main", "HEAD"]).trim();
        const v = vorlauf(basis, "HEAD", lies(ZUG.karte), lies(ZUG.faenger), Date.now(), S);
        grund = v.wahl;
        console.log(`Vorlauf ${basis.slice(0, 8)}..${e.GITHUB_SHA?.slice(0, 8)}: ${grund.size} von ${S.length} Schritten, ${v.takt} Takt-Wirkungen fahren im Nachlauf`); // prettier-ignore
    }
    const liste = S.filter((s) => grund.has(s.key) && !gruen.has(s.key));
    for (const s of S) console.log(`  ${liste.includes(s) ? "fährt" : gruen.has(s.key) ? "grün am Kopf" : "Schuld"}: ${s.key}${grund.has(s.key) && art === "vorlauf" ? ` — ${grund.get(s.key)}` : ""}`); // prettier-ignore
    const aus = { art, liste: JSON.stringify(liste.map((s) => s.key)), gruppen: JSON.stringify([...new Set(liste.filter((s) => s.gruppe).map((s) => s.gruppe))]), voll: liste.some((s) => s.job === "voll") ? "ja" : "nein", echt: liste.some((s) => s.job === "echt") ? "ja" : "nein" }; // prettier-ignore
    console.log(`::notice title=Zug-Liste::${aus.liste}`);
    if (e.GITHUB_OUTPUT) fs.appendFileSync(e.GITHUB_OUTPUT, Object.entries(aus).map(([k, v]) => `${k}=${v}\n`).join(""));
    return aus;
}
// DER VORRANG des Zugs: wartet ein Lauf auf integ-probe, weicht der Nachlauf nach seinem laufenden Schritt
const zugWartet = async (api = apiMit()) => (await api("/actions/workflows/check.yml/runs?branch=integ-probe&per_page=5")).workflow_runs.some((r) => r.status !== "completed"); // prettier-ignore

// g) DAS HAUPTBUCH (rein): je Schritt `gruen` (der SHA seines letzten Grüns) und `schuld` (die Landungen seitdem, null: nie grün
// gebucht); rot am Kopf nennt das Fenster der Bisektion: die Landungen ab dem letzten Grün, höchstens SCHULD_MAX
function buchNach(buch, kopf, schluessel, gruen, rot, landungen) {
    const [pos, n] = [new Map(landungen.map((h, i) => [h, i])), landungen.indexOf(kopf)];
    const schritte = {};
    const bisekt = [];
    for (const k of schluessel) {
        const g = gruen.has(k) ? kopf : buch.schritte?.[k]?.gruen;
        schritte[k] = { gruen: g ?? null, schuld: pos.has(g) ? n - pos.get(g) : null };
        if (rot.has(k)) bisekt.push({ k, fenster: landungen.slice(Math.max(pos.get(g) ?? 0, n - SCHULD_MAX), n + 1), gruen: g ?? null }); // prettier-ignore
    }
    return { kopf, schritte, bisekt };
}
// DIE BISEKTION (rein): die Stände alt → neu, der letzte ist rot; `probe(stand)` → true = rot. Der erste rote Stand, je Probe die Mitte
function bisekt(staende, probe) {
    let [lo, hi] = [-1, staende.length - 1];
    while (hi - lo > 1) {
        const m = (lo + hi) >> 1;
        if (probe(staende[m])) hi = m;
        else lo = m;
    }
    return { stand: staende[hi], ab: lo < 0 };
}
// die Probe eines Schritts an einem Stand: sein run-Text DORT (fehlt der Schritt, ist er grün), im eigenen Arbeitsbaum, dieselbe Klasse
function probe(h, k, frist = 3600) {
    const s = zugSchritte(zeige(h, ".github/workflows/check.yml") ?? undefined).find((x) => x.key === k);
    if (!s) return false;
    const d = path.join(require("os").tmpdir(), "probe-" + h.slice(0, 8));
    git(["worktree", "add", "-f", "--detach", d, h]);
    try {
        if (zeige(h, "package-lock.json") === fs.readFileSync(path.join(ROOT, "package-lock.json"), "utf8")) fs.symlinkSync(path.join(ROOT, "node_modules"), path.join(d, "node_modules")); // prettier-ignore
        else spawnSync("npm", ["ci", "--no-audit", "--no-fund"], { cwd: d, stdio: "inherit" });
        const r = spawnSync("bash", ["--noprofile", "--norc", "-eo", "pipefail", "-c", s.run], { cwd: d, stdio: "inherit", timeout: frist * 1000, env: { ...process.env, CI: "true", CI_KLASSE: s.klasse } }); // prettier-ignore
        console.log(`[probe] ${h.slice(0, 8)} ${r.status === 0 ? "GRÜN" : "ROT"} — ${k}`);
        return r.status !== 0;
    } finally {
        git(["worktree", "remove", "--force", d]);
    }
}
// DER NACHLAUF bucht (Job `nachlauf`, nach voll und echt): das Hauptbuch am Kopf, je roter Schritt die Bisektion über die Merges
// der offenen Landungen (der Täter-Zweig beim Namen in ZUG.rot), die Fänger frisch — alles in EINEM Commit nach koordination
async function hauptbuch(e = process.env, api = apiMit()) {
    const [kopf, M, S] = [e.GITHUB_SHA, mainGeschichte(e.GITHUB_SHA), zugSchritte()];
    const landungen = M.staende.filter((s) => s.landung).map((s) => s.h);
    if (!landungen.includes(kopf)) landungen.push(kopf);
    const { gruen, rot } = await amKopf(api, kopf);
    const B = buchNach(JSON.parse(koord(ZUG.buch) ?? '{"schritte":{}}'), kopf, S.map((s) => s.key), gruen, rot, landungen);
    const zeilen = [];
    for (const b of B.bisekt) {
        const von = M.staende.findIndex((s) => s.h === b.fenster[0]);
        const staende = M.staende.slice(von + 1, M.staende.findIndex((s) => s.h === kopf) + 1).filter((s) => s.zweig || s.h === kopf);
        const r = bisekt(staende, (s) => probe(s.h, b.k));
        const wer = r.stand.zweig ? `Täter ${r.stand.zweig} (Merge ${r.stand.h.slice(0, 8)})` : `Täter die Versions-Stufe ${r.stand.h.slice(0, 8)}`;
        zeilen.push(`${new Date().toISOString()} ROT „${b.k}" am ${kopf.slice(0, 8)} — ${r.ab && b.gruen !== b.fenster[0] ? `älter als ${SCHULD_MAX} Landungen (letztes Grün ${b.gruen?.slice(0, 8) ?? "nie"})` : wer} · ${staende.length} Stände, letztes Grün ${b.gruen?.slice(0, 8) ?? "nie gebucht"}`); // prettier-ignore
    }
    const schuld = Object.entries(B.schritte).filter(([, x]) => x.schuld !== 0);
    console.log(`Hauptbuch ${kopf.slice(0, 8)}: ${S.length - schuld.length} grün am Kopf, Schuld bei ${schuld.length} (höchstens ${Math.max(0, ...schuld.map(([, x]) => x.schuld ?? Infinity))} Landungen)`); // prettier-ignore
    zeilen.forEach((z) => console.log("::error title=Nachlauf ROT::" + z));
    const F0 = JSON.parse(koord(ZUG.faenger) ?? '{"ereignisse":[]}');
    const F = { bis: new Date().toISOString(), ...faenger(await laeufe(api, zeit(F0.bis ?? Date.now() - 2 * TAG) - TAG / 24), JSON.parse(koord(ZUG.karte)), M, F0.ereignisse) }; // prettier-ignore
    const neu = new Set(F.ereignisse.map((x) => x.sha + x.k));
    F.ereignisse = [...F0.ereignisse.filter((x) => !neu.has(x.sha + x.k) && zeit(x.t) > Date.now() - (TAGE + 1) * TAG), ...F.ereignisse];
    const rotAlt = koord(ZUG.rot) ?? "";
    await koordSchreib({ [ZUG.buch]: JSON.stringify(B, null, 1) + "\n", [ZUG.faenger]: JSON.stringify(F, null, 1) + "\n", ...(zeilen.length && { [ZUG.rot]: zeilen.join("\n") + "\n" + rotAlt }) }, `Hauptbuch ${kopf.slice(0, 8)}: Schuld bei ${schuld.length} Schritten${zeilen.length ? `, ${zeilen.length} ROT` : ""}`); // prettier-ignore
    if (zeilen.length) process.exitCode = 1;
}
module.exports = { ROOT, ZUG, TAG, probe, vollSchritte, zugSchritte, gliederMerk, glieder, gliedUm, satzUm, wirkungen, waehle, karteIndex, grundIm, bits, git, zeige, apiMit, alleLaeufe, laeufe, schritteIm, kurz, zeit, koord, koordSchreib, liefen, faenger, fehlerAm, sekunden, vorlauf, buchNach, bisekt, mainGeschichte, zweigeIm, zugWartet }; // prettier-ignore

// der Zug-Kopf (check.yml `kopf`) und der Nachlauf (check.yml `nachlauf`); der Messplatz der Karte und der Beweis leben im Zweig
// `koordination` (zug/zug-werkzeug.cjs, neben der Karte, die er schreibt)
if (require.main === module) require("./welt-boot.cjs").hauptLauf(() => ({ "--kopf": zugKopf, "--hauptbuch": hauptbuch })[process.argv[2]]?.() ?? Promise.reject(new Error("zug-auswahl.cjs --kopf | --hauptbuch"))); // prettier-ignore

