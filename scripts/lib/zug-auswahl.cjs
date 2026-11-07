// zug-auswahl.cjs — DIE ZUG-AUSWAHL: ein Zug fährt nur die Schritte der vollen Batterie, deren Urteil von den geänderten Gliedern
// abhängen KANN (Test-Auswahl nach Wirkung, deterministisch). Die WIRKUNGS-KARTE (spec/ci/wirkung-karte.json) trägt je Schritt, was
// er wirklich ausführt und liest — gemessen, nie geraten:
//   · jede Seite und jeder Worker über die EINE CDP-Sitzung des Browsers (auto-attach, angehalten bis die Precise Coverage läuft:
//     kein Glied läuft ungezählt; RenderDocument aus, sonst tauscht ein Reload den Prozess und die Zählung der alten Seite stirbt),
//     dazu jeder `Function.prototype.toString` der Seite (`__codeOf`, `__fehlt`: die Absenz liest Text, ohne ihn auszuführen);
//   · jeder Node-Prozess über NODE_V8_COVERAGE (Kerne im vm-Faden, Linsen, Server) und die Lese-Spur (fs: Text, Liste, Probe —
//     was ein HTTP-Server ausliefert oder der Modul-Lader lädt, zählt die Abdeckung).
// Eingeschaltet NUR über `CI_WIRKUNG=<ordner>` (welt-boot ruft `haken()`, NODE_OPTIONS lädt diese Datei vor) — sonst null Kosten.
//   node scripts/lib/zug-auswahl.cjs <basis> <kopf>       die Auswahl: Zeile 1 die JSON-Liste, je ausgelassenem Schritt eine Zeile
//   node scripts/lib/zug-auswahl.cjs --messen [n …] [--gruppe g] [--parallel n]   misst Schritte der vollen Batterie unter CI_WIRKUNG
//   node scripts/lib/zug-auswahl.cjs --karte              die Roh-Spuren → spec/ci/wirkung-karte.json
//   node scripts/lib/zug-auswahl.cjs --geschichte         der Richter: Treffer und Ersparnis an den Zügen (spec/ci/zug-geschichte.json)
"use strict";
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..", "..");
const MESS = process.env.CI_WIRKUNG;
const KARTE = "spec/ci/wirkung-karte.json";
const ROH = path.join(require("os").tmpdir(), "anazh-wirkung");
// der Pfad im Baum (ab der Wurzel `w`), außerhalb, in node_modules und .git: null
const relPfad = (p, w = ROOT) => {
    const r = path.relative(w, path.resolve(w, p)).replace(/\\/g, "/");
    return r && !r.startsWith("..") && !/^(node_modules|\.git)\//.test(r) ? r : null;
};
const merk = (m, r, k) => (m.get(r) || m.set(r, new Set()).get(r)).add(k);
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

// ─── I. DIE MESSUNG ─────────────────────────────────────────────────────────────────────────────────────────────────────────
// a) der Browser: `haken()` legt sich um puppeteer.launch (welt-boot, jeder Start); die Spur je Browser in `<MESS>/b-<pid>-<n>.json`
const TEXT_SPUR = `(() => { const roh = Function.prototype.toString, t = (window.__wirkungTexte = []), s = new Set();
Function.prototype.toString = function () { const x = roh.call(this); if (!s.has(x)) (s.add(x), t.push(x)); return x; }; })();`;
const AN_TYP = /^(page|iframe|worker|shared_worker|service_worker)$/;
let browserZahl = 0;
function haken() {
    const p = require("puppeteer");
    const roh = p.launch;
    p.launch = async (o = {}) => {
        const args = [...(o.args || [])];
        const i = args.findIndex((a) => a.startsWith("--disable-features="));
        if (i < 0) args.push("--disable-features=RenderDocument");
        else args[i] += ",RenderDocument";
        return anBrowser(await roh({ ...o, args }));
    };
}
async function anBrowser(browser) {
    const s = await browser.target().createCDPSession();
    const [conn, sitz, fn, texte] = [s.connection(), new Set(), new Map(), new Set()];
    const datei = path.join(MESS, `b-${process.pid}-${browserZahl++}.json`);
    const nimm = async (c) => {
        try {
            for (const sc of (await c.send("Profiler.takePreciseCoverage")).result) {
                if (!/^https?:\/\/(127\.0\.0\.1|localhost)[:/]/.test(sc.url)) continue;
                const u = fn.get(sc.url) || fn.set(sc.url, new Set()).get(sc.url);
                for (const f of sc.functions)
                    if (f.ranges[0].count > 0) u.add(f.ranges[0].startOffset + "," + f.ranges[0].endOffset);
            }
            if (c.seite) for (const x of (await c.send("Runtime.evaluate", { expression: "(window.__wirkungTexte || []).splice(0)", returnByValue: true })).result.value || []) texte.add(x); // prettier-ignore
        } catch {
            sitz.delete(c); // das Ziel ist fort
        }
    };
    const ernte = async () => {
        await Promise.all([...sitz].map(nimm));
        const o = { fn: Object.fromEntries([...fn].map(([u, m]) => [u, [...m]])), text: [...texte] };
        fs.writeFileSync(datei, JSON.stringify(o));
    };
    const an = async ({ sessionId, targetInfo }) => {
        const c = conn.session(sessionId);
        if (!c) return;
        c.on("Target.attachedToTarget", an);
        try {
            if (AN_TYP.test(targetInfo.type)) {
                await c.send("Profiler.enable");
                await c.send("Profiler.startPreciseCoverage", { callCount: false, detailed: false });
                c.seite = /^(page|iframe)$/.test(targetInfo.type);
                if (c.seite) await c.send("Page.addScriptToEvaluateOnNewDocument", { source: TEXT_SPUR });
                sitz.add(c);
            }
            await c.send("Target.setAutoAttach", { autoAttach: true, waitForDebuggerOnStart: true, flatten: true });
        } catch {
            // ein Ziel, das beim Anheften stirbt
        }
        c.send("Runtime.runIfWaitingForDebugger").catch(() => {});
    };
    s.on("Target.attachedToTarget", an);
    await s.send("Target.setAutoAttach", { autoAttach: true, waitForDebuggerOnStart: true, flatten: true });
    // ein Worker stirbt mit seiner Seite: je 1,5 s geerntet, vor jedem Schließen ganz
    const uhr = setInterval(ernte, 1500);
    uhr.unref();
    const seite = (await browser.pages())[0];
    if (seite) {
        const P = Object.getPrototypeOf(seite);
        if (!P.__wirkung) {
            const zu = P.close;
            P.close = async function (...a) {
                await Promise.all(alleErnten.map((f) => f()));
                return zu.apply(this, a);
            };
            P.__wirkung = true;
        }
    }
    alleErnten.push(ernte);
    const zu = browser.close.bind(browser);
    browser.close = async (...a) => (clearInterval(uhr), await ernte(), zu(...a));
    browser.on("disconnected", () => clearInterval(uhr));
    return browser;
}
const alleErnten = [];

// b) Node (über NODE_OPTIONS vorgeladen): die Lese-Spur je Prozess `<MESS>/n-<pid>.json` — gelesen (Text), geliefert (ein
// HTTP-Server liefert: was die Seite nicht ausführt, wirkt als Datei), verz (eine Liste), probe (gibt es die Datei?); die
// Abdeckung (NODE_V8_COVERAGE) schreibt Node am Ende, ein Signal schreibt sie vorher, ein Server alle 5 s (SIGKILL schreibt nichts)
function nodeSpur() {
    if (globalThis.__wirkungNode) return;
    const spur = (globalThis.__wirkungNode = {
        gelesen: new Set(),
        geliefert: new Set(),
        verz: new Set(),
        probe: new Set(),
        text: new Set(),
        suche: new Set(),
    });
    // was Node als Text reicht (`page.evaluate(fn)`, `${fn}` in einer Seiten-Vorlage): ausgeführt wird es in der Seite, gemessen hier
    const roh = Function.prototype.toString;
    Function.prototype.toString = function () {
        const x = roh.call(this);
        spur.text.add(x);
        return x;
    };
    const art = () => {
        const alt = Error.stackTraceLimit;
        Error.stackTraceLimit = 30;
        const st = new Error().stack;
        Error.stackTraceLimit = alt;
        if (/_http_server/.test(st)) return "geliefert";
        if (/\b(dateiMit|fehlt)\b/.test(st)) return "suche"; // stamm.cjs nennt die Stelle (das Muster) selbst
        if (/internal\/modules\/|\b(fadenScope|ladeKlasse)\b/.test(st)) return "lade";
        return "gelesen";
    };
    const merke = (wie, p) => {
        const r = typeof p === "string" || p instanceof URL ? relPfad(p instanceof URL ? p.pathname : p) : null;
        if (!r) return;
        const a = wie || art();
        if (a === "suche" || (a === "lade" && !/\.json$/.test(r))) return; // der Modul-Lader: die Abdeckung zählt, eine .json wirkt als Text
        spur[a === "lade" ? "gelesen" : a].add(r);
    };
    const um = (o, name, wie) => {
        const f = o[name];
        o[name] = function (p, ...a) {
            merke(wie, p);
            return f.call(this, p, ...a);
        };
    };
    for (const n of ["readFileSync", "readFile", "createReadStream"]) um(fs, n);
    um(fs.promises, "readFile");
    for (const n of ["readdirSync", "readdir", "opendirSync"]) um(fs, n, "verz");
    um(fs.promises, "readdir", "verz");
    um(fs, "existsSync", "probe");
    const v8 = require("v8");
    const schreib = () => {
        const o = Object.fromEntries(Object.entries(spur).map(([k, v]) => [k, [...v]]));
        fs.writeFileSync(path.join(MESS, `n-${process.pid}.json`), JSON.stringify(o));
    };
    process.on("exit", schreib);
    for (const sig of ["SIGTERM", "SIGINT", "SIGHUP"])
        process.once(sig, () => {
            try {
                v8.takeCoverage();
                schreib();
            } catch {}
            if (!process.listenerCount(sig)) process.kill(process.pid, sig);
        });
    if (!/[\\/]scripts[\\/]/.test(process.argv[1] || "") && /\.js$/.test(process.argv[1] || ""))
        setInterval(() => (v8.takeCoverage(), schreib()), 5000).unref();
}
if (MESS) nodeSpur();

// c) der Läufer: je Schritt der vollen Batterie (check.yml, Job voll) sein run-Text wie in der CI (bash -eo pipefail, CI=true,
// CI_KLASSE der Gruppe) unter der Messung, die Roh-Spur in ROH/<nr>/ samt status.json (Exit, Sekunden); `--parallel n` Bahnen
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
function messeSchritt(x, fristS) {
    const d = path.join(ROH, String(x.nr));
    fs.rmSync(d, { recursive: true, force: true });
    fs.mkdirSync(path.join(d, "node"), { recursive: true });
    const env = {
        ...process.env,
        CI: "true",
        CI_KLASSE: x.klasse,
        CI_WIRKUNG: d,
        NODE_V8_COVERAGE: path.join(d, "node"),
        NODE_OPTIONS: `${process.env.NODE_OPTIONS || ""} --require ${__filename}`.trim(),
    };
    const log = fs.openSync(path.join(d, "log.txt"), "w");
    const t0 = Date.now();
    const p = require("child_process").spawn("bash", ["--noprofile", "--norc", "-eo", "pipefail", "-c", x.run], { cwd: ROOT, env, stdio: ["ignore", log, log], detached: true }); // prettier-ignore
    const uhr = setTimeout(() => process.kill(-p.pid, "SIGKILL"), fristS * 1000);
    return new Promise((ok) =>
        p.on("exit", (code, signal) => {
            clearTimeout(uhr);
            fs.closeSync(log);
            const s = Math.round((Date.now() - t0) / 1000);
            fs.writeFileSync(path.join(d, "status.json"), JSON.stringify({ name: x.name, code, signal, s }));
            console.log(
                `[messen] ${x.nr} ${code === 0 ? "GRÜN" : `ROT (${code ?? signal})`} ${s} s — ${x.name.slice(0, 70)}`
            );
            ok(code);
        })
    );
}
async function messen(nummern, bahnen = 1, gruppe = 0, fristS = 2700) {
    const alle = vollSchritte();
    const liste = gruppe ? alle.filter((x) => x.gruppe === gruppe) : nummern.length ? nummern.map((n) => alle[n]) : alle;
    let [i, rot] = [0, 0];
    const bahn = async () => {
        while (i < liste.length) rot += (await messeSchritt(liste[i++], fristS)) !== 0;
    };
    await Promise.all(Array.from({ length: bahnen }, bahn));
    process.exitCode = rot ? 1 : 0;
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
        for (const k in n) {
            const v = n[k];
            if (k === "loc" || !v || typeof v !== "object") continue;
            for (const c of Array.isArray(v) ? v : [v]) if (c && typeof c.type === "string") geh(c, p, g, klasse);
        }
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

// ─── III. DIE KARTE ─────────────────────────────────────────────────────────────────────────────────────────────────────────
// Je Schritt aus seiner Roh-Spur: `fn` die ausgeführten Glieder (Bitfeld über die EINE Tafel `glieder`), `txt` die als Text
// gelesenen, `datei` was er als Datei liest (Text, ausgelieferte Nicht-Skripte, ausgelieferte Skripte, die keine Seite ausführt),
// `verz` die gelisteten Ordner, `probe` die erfragten Pfade, `fege` die Dateien, deren Glieder er zur Hälfte und mehr als Text las.
const JS = /\.(c|m)?js$/;
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
function karteBauen(wurzel = ROOT) {
    const gl = new Map();
    const gliederVon = (r) => {
        const g = gliederMerk(gl, r, () => fs.readFileSync(path.join(wurzel, r), "utf8"));
        return g === "kaputt" ? null : g;
    };
    const vonUrl = (u) =>
        relPfad(/^https?:/.test(u) ? decodeURIComponent(new URL(u).pathname).slice(1) : u.startsWith("file:") ? new URL(u).pathname : u, wurzel); // prettier-ignore
    const schritte = {};
    const zaehler = { text: 0, textFrei: 0 };
    for (const nr of fs.readdirSync(ROH)) {
        const d = path.join(ROH, nr);
        if (!fs.existsSync(path.join(d, "status.json"))) continue;
        const st = JSON.parse(fs.readFileSync(path.join(d, "status.json"), "utf8"));
        const [fn, txt, datei, verz, probe, gefuehrt, geliefert, suche] = [new Map(), new Map(), new Set(), new Set(), new Set(), new Set(), new Set(), new Set()]; // prettier-ignore
        const lauf = (r, s, e) => {
            const g = gliederVon(r);
            if (!g) return datei.add(r);
            gefuehrt.add(r);
            merk(fn, r, gliedUm(g, s, e));
        };
        const texte = [];
        for (const f of fs.readdirSync(d)) {
            const j = () => JSON.parse(fs.readFileSync(path.join(d, f), "utf8"));
            if (f.startsWith("b-")) {
                const b = j();
                for (const [u, liste] of Object.entries(b.fn)) {
                    const r = vonUrl(u);
                    if (r) for (const x of liste) lauf(r, ...x.split(",").map(Number));
                }
                texte.push(...b.text);
            } else if (f.startsWith("n-")) {
                const n = j();
                for (const r of n.gelesen) datei.add(r);
                for (const r of n.geliefert) geliefert.add(r);
                for (const r of n.verz) verz.add(r);
                for (const r of n.probe) probe.add(r);
                texte.push(...(n.text || []));
                for (const s of n.suche || []) suche.add(s);
            }
        }
        for (const f of fs.readdirSync(path.join(d, "node"))) {
            for (const sc of JSON.parse(fs.readFileSync(path.join(d, "node", f), "utf8")).result) {
                const r = vonUrl(sc.url);
                if (r && JS.test(r)) for (const x of sc.functions) if (x.ranges[0].count > 0) lauf(r, x.ranges[0].startOffset, x.ranges[0].endOffset);
            }
        }
        for (const r of geliefert) if (!gefuehrt.has(r)) datei.add(r);
        // die gelesenen Texte: das Glied, dessen Text `toString` liefert, sonst die Stelle in einer geführten Datei
        // — und jedes Glied IN dem Text (ein Pfeil an evaluateOnNewDocument trägt `window.__wasserOrt`: sein Text reist mit)
        const roh = new Map();
        for (const r of gefuehrt) {
            const g = gliederVon(r);
            for (const x of g.G) roh.set(g.t.slice(x.ts, x.e), [r, x.ts]);
        }
        for (const t of new Set(texte)) {
            let hit = roh.get(t);
            if (!hit && t.length >= 40)
                for (const r of gefuehrt) {
                    const i = gl.get(r).t.indexOf(t);
                    if (i >= 0 && (hit = [r, i])) break;
                }
            if (hit) {
                const [r, i] = hit;
                merk(txt, r, gliedUm(gl.get(r), i, i + t.length));
                for (const x of gl.get(r).G) if (x.s >= i && x.e <= i + t.length) merk(txt, r, x.k);
            }
            zaehler[hit ? "text" : "textFrei"]++;
        }
        const fege = [...txt].filter(([r, ks]) => ks.size * 2 >= new Set(gl.get(r).G.map((x) => x.k)).size).map(([r]) => r);
        schritte[st.name] = { gruen: st.code === 0, s: st.s, fn, txt, datei: [...datei].sort(), verz: [...verz].sort(), probe: [...probe].sort(), fege, suche: [...suche] }; // prettier-ignore
    }
    // die EINE Tafel: je Datei die Schlüssel, die ein Schritt ausführt oder liest
    const tafel = new Map();
    for (const x of Object.values(schritte)) for (const m of [x.fn, x.txt]) for (const [r, ks] of m) for (const k of ks) merk(tafel, r, k);
    const dateien = [...tafel.keys()].sort();
    const idx = new Map();
    const glieder_ = {};
    for (const r of dateien) {
        glieder_[r] = [...tafel.get(r)].sort();
        for (const k of glieder_[r]) idx.set(r + "\0" + k, idx.size);
    }
    const nach = (m) => [...m].flatMap(([r, ks]) => [...ks].map((k) => idx.get(r + "\0" + k)));
    const kopf = spawnSync("git", ["rev-parse", "HEAD"], { cwd: wurzel, encoding: "utf8" }).stdout.trim();
    const out = {
        quelle: "scripts/lib/zug-auswahl.cjs --karte: je Schritt der vollen Batterie, was er ausführt (fn, Bitfeld über glieder), als Text liest (txt), als Datei liest (datei), listet (verz), erfragt (probe) und zur Hälfte als Text fegt (fege)",
        kopf,
        erzeugt: new Date().toISOString().slice(0, 10),
        glieder: glieder_,
        schritte: Object.fromEntries(
            Object.entries(schritte)
                .sort()
                .map(([n, x]) => [n, { gruen: x.gruen, s: x.s, fn: bits.aus(nach(x.fn), idx.size), txt: nach(x.txt).sort((a, b) => a - b), datei: x.datei, verz: x.verz, probe: x.probe, fege: x.fege, suche: x.suche }]) // prettier-ignore
        ),
    };
    fs.writeFileSync(path.join(ROOT, KARTE), JSON.stringify(out, null, 1) + "\n");
    return { out, zaehler };
}

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
    [/^spec\/ci\/wirkung-karte\.json$/, "die Karte selbst"],
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
// Die Wahl ist rein (Karte · Wirkungen → Schritte), die Linse (gate:ci-deckung, Z) prüft sie gegen ihr eigenes Orakel
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
function auswahl(basis, kopf, karte = JSON.parse(fs.readFileSync(path.join(ROOT, KARTE), "utf8"))) {
    const namen = vollSchritte(zeige(kopf, ".github/workflows/check.yml") ?? undefined).map((s) => s.name);
    const W = wirkungen(basis, kopf, karte);
    return { ...waehle(namen, karte, W), W, namen };
}

// ─── V. DER RICHTER ─────────────────────────────────────────────────────────────────────────────────────────────────────────
// An den Zügen seit z280 (spec/ci/zug-geschichte.json): je Zug die Zweige, die er neu trug (die Merges „Merge <zweig> in
// integ-probe" auf dem Erst-Eltern-Pfad bis zum letzten gelandeten Kopf), je Zweig die Auswahl über SEINEN Merge (Eltern 1 → Merge).
// TREFFER: jeder rote Schritt eines Täters ist gewählt (echt ist Kern); ERSPARNIS: gewählte Rechenzeit gegen voll, mit den
// Schritt- und Vorbereitungs-Zeiten des Laufs `zeiten_lauf` (die Vorbereitung einer Gruppe zählt, wenn sie einen Schritt fährt).
async function geschichte() {
    const G = JSON.parse(fs.readFileSync(path.join(ROOT, "spec/ci/zug-geschichte.json"), "utf8"));
    const karte = JSON.parse(fs.readFileSync(path.join(ROOT, KARTE), "utf8"));
    const token = process.env.GITHUB_TOKEN || /password=(.*)/.exec(spawnSync("git", ["credential", "fill"], { input: "protocol=https\nhost=github.com\n\n", encoding: "utf8" }).stdout || "")?.[1]; // prettier-ignore
    const api = require("../ci-kopf.cjs").apiMit("https://api.github.com/repos/MiguellD/AnazhRealm", token);
    const jobs = (await api(`/actions/runs/${G.zeiten_lauf}/attempts/1/jobs?per_page=100`)).jobs;
    const sek = (a, b) => (new Date(b) - new Date(a)) / 1000;
    const [zeit, gruppeVon, vorb] = [new Map(), new Map(), new Map()];
    let kern = 0;
    for (const j of jobs) {
        const voll = /^voll (\d+)/.exec(j.name);
        let schritte = 0;
        for (const s of j.steps) {
            if (!voll || s.conclusion === "skipped" || /^(Set up|Run actions|Cache|System-Libs|Dependencies|Urteil|Post |Complete)/.test(s.name)) continue; // prettier-ignore
            zeit.set(s.name, sek(s.started_at, s.completed_at));
            gruppeVon.set(s.name, +voll[1]);
            schritte += zeit.get(s.name);
        }
        if (voll) vorb.set(+voll[1], sek(j.started_at, j.completed_at) - schritte);
        else kern += sek(j.started_at, j.completed_at);
    }
    const voll = kern + [...zeit.values(), ...vorb.values()].reduce((a, b) => a + b, 0);
    const kosten = (gewaehlt) => {
        const gr = new Set([...gewaehlt].map((n) => gruppeVon.get(n)));
        return kern + [...gewaehlt].reduce((a, n) => a + (zeit.get(n) || 0), 0) + [...gr].reduce((a, g) => a + (vorb.get(g) || 0), 0);
    };
    const gelandet = (h) => spawnSync("git", ["merge-base", "--is-ancestor", h, "origin/main"], { cwd: ROOT }).status === 0;
    const [merges, wahl] = [[], new Map()];
    let L = G.basis;
    for (const [zn, kopf] of G.zuege) {
        for (const l of git(["log", "--first-parent", "--format=%H %s", "-n", "80", kopf]).split("\n").filter(Boolean)) {
            const [h, s] = [l.slice(0, 40), l.slice(41)];
            if (spawnSync("git", ["merge-base", "--is-ancestor", h, L], { cwd: ROOT }).status === 0) break;
            const m = /^Merge (\S+) in integ-probe/.exec(s);
            if (m) merges.push({ z: zn, zweig: m[1], m: h });
        }
        if (gelandet(kopf)) L = kopf;
    }
    const waehleM = (m) => wahl.get(m) || wahl.set(m, auswahl(m + "^1", m, karte)).get(m);
    let treffer = 0;
    for (const [z, zweig, schritt] of G.taeter) {
        const m = merges.find((x) => x.z === z && x.zweig === zweig);
        const a = m && waehleM(m.m);
        const n = a && a.namen.find((x) => x.startsWith(schritt));
        const ok = schritt.startsWith("echt: ") ? "Kern (echt)" : n && a.gewaehlt.get(n);
        treffer += !!ok;
        console.log(`${ok ? "TREFFER" : "LÜCKE  "} z${z} ${zweig} → ${schritt}${ok ? ` — ${ok}` : m ? "" : " (kein Merge)"}`);
    }
    // je Zweig seine letzte Fassung im Zeitraum (ein Zweig, der in mehreren Zügen fuhr, zählt einmal)
    const anteile = [];
    for (const m of [...new Map(merges.map((x) => [x.zweig, x])).values()]) {
        const a = waehleM(m.m);
        const q = kosten(new Set(a.namen.filter((n) => a.gewaehlt.has(n)))) / voll;
        anteile.push(q);
        console.log(`  z${m.z} ${m.zweig.padEnd(24)} ${(100 * q).toFixed(1).padStart(5)} %  ${a.alle.length ? a.alle[0] : `${a.gewaehlt.size}/${a.namen.length} Schritte`}`); // prettier-ignore
    }
    anteile.sort((a, b) => a - b);
    const q = (p) => (100 * anteile[Math.min(anteile.length - 1, Math.floor(p * anteile.length))]).toFixed(1);
    console.log(`TREFFER ${treffer}/${G.taeter.length} · voll ${Math.round(voll / 60)} min Rechenzeit · je Zweig (${anteile.length} Zweige): Median ${q(0.5)} % · p25 ${q(0.25)} % · p75 ${q(0.75)} % · min ${q(0)} % · max ${q(1)} % · ALLE ${anteile.filter((x) => x > 0.999).length}`); // prettier-ignore
    return { treffer, anteile };
}

module.exports = { KARTE, haken, vollSchritte, glieder, gliedUm, satzUm, wirkungen, waehle, karteIndex, bits, auswahl };

if (require.main === module) {
    const a = process.argv.slice(2);
    const zahl = (n) => +(a[a.indexOf(n) + 1] || 0);
    if (a[0] === "--messen") messen(a.slice(1).filter((x, i) => /^\d+$/.test(x) && !/^--(parallel|gruppe)$/.test(a[i])).map(Number), zahl("--parallel") || 1, zahl("--gruppe")); // prettier-ignore
    else if (a[0] === "--karte") {
        const { out, zaehler } = karteBauen(a[1] || ROOT);
        console.log(`[karte] ${Object.keys(out.schritte).length} Schritte, ${Object.values(out.glieder).reduce((s, x) => s + x.length, 0)} Glieder in ${Object.keys(out.glieder).length} Dateien · Texte ${zaehler.text} zugeordnet, ${zaehler.textFrei} frei`); // prettier-ignore
    } else if (a[0] === "--geschichte") geschichte().catch((e) => (console.error(e), process.exit(1)));
    else if (a.length === 2) {
        const { alle, gewaehlt, aus, namen } = auswahl(a[0], a[1]);
        const liste = namen.filter((n) => gewaehlt.has(n));
        console.log(JSON.stringify(liste));
        // für check.yml: die Liste, die Gruppen mit einem gewählten Schritt (die Matrix), ob alle fahren
        const gruppen = [...new Set(vollSchritte().filter((s) => gewaehlt.has(s.name)).map((s) => s.gruppe))].sort((x, y) => x - y);
        if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `liste=${JSON.stringify(liste)}\ngruppen=${JSON.stringify(gruppen)}\nalle=${alle.length ? "ja" : "nein"}\n`); // prettier-ignore
        if (alle.length) console.log(`# ALLE: ${alle.join(" · ")}`);
        for (const n of aus) console.log(`# aus: ${n} — seine Karte trägt keine der Wirkungen von ${a[0].slice(0, 12)}..${a[1].slice(0, 12)}`);
    } else {
        console.error("node scripts/lib/zug-auswahl.cjs <basis> <kopf> | --messen [n …] [--gruppe g] [--parallel n] | --karte [wurzel] | --geschichte");
        process.exit(2);
    }
}
