// zug-werkzeug.cjs (Zweig koordination, zug/) — DER MESSPLATZ DER WIRKUNGS-KARTE und DER BEWEIS DES VORLAUFS (w23-vorlauf): beide
// laufen nie in der CI und schreiben, was der Zug liest, hierher (zug/wirkung-karte.json, zug/faenger.json). Die Wahl, das Hauptbuch
// und die Bisektion leben in main (scripts/lib/zug-auswahl.cjs); dieses Werkzeug fährt aus der Wurzel eines Klons von main:
//   node <koord>/zug/zug-werkzeug.cjs --messen [n …] [--gruppe g] [--parallel n]   misst Schritte der vollen Batterie unter CI_WIRKUNG
//   node <koord>/zug/zug-werkzeug.cjs --karte                die Roh-Spuren → koordination zug/wirkung-karte.json
//   node <koord>/zug/zug-werkzeug.cjs --laeufe <tage> <f>    die Läufe von check.yml (API) → <f>
//   node <koord>/zug/zug-werkzeug.cjs --faenger <f>          die Fänger aus <f> → koordination zug/faenger.json
//   node <koord>/zug/zug-werkzeug.cjs --beweis <f> [ab]      der Beweis an den Zügen ab dem SHA `ab` (Fänger und Karte aus koordination)
// Die Messung jedes Node-Prozesses lädt diese Datei vor (NODE_OPTIONS --require), die jedes Browsers legt sie um puppeteer.launch.
"use strict";
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const za = require(path.resolve("scripts/lib/zug-auswahl.cjs"));
const { ROOT, ZUG, TAG, vollSchritte, gliederMerk, gliedUm, bits, git, zeige, kurz, zeit, koord, koordSchreib, laeufe, apiMit, faenger, vorlauf, zugSchritte, zweigeIm } = za; // prettier-ignore
const MESS = process.env.CI_WIRKUNG;
const ROH = path.join(require("os").tmpdir(), "anazh-wirkung");
// der Pfad im Baum (ab der Wurzel `w`), außerhalb, in node_modules und .git: null
const relPfad = (p, w = ROOT) => {
    const r = path.relative(w, path.resolve(w, p)).replace(/\\/g, "/");
    return r && !r.startsWith("..") && !/^(node_modules|\.git)\//.test(r) ? r : null;
};
const merk = (m, r, k) => (m.get(r) || m.set(r, new Set()).get(r)).add(k);

// ─── I. DIE MESSUNG ─────────────────────────────────────────────────────────────────────────────────────────────────────────
// a) der Browser: `haken()` legt sich um puppeteer.launch (welt-boot, jeder Start); die Spur je Browser in `<MESS>/b-<pid>-<n>.json`
const TEXT_SPUR = `(() => { const roh = Function.prototype.toString, t = (window.__wirkungTexte = []), s = new Set();
Function.prototype.toString = function () { const x = roh.call(this); if (!s.has(x)) (s.add(x), t.push(x)); return x; }; })();`;
const AN_TYP = /^(page|iframe|worker|shared_worker|service_worker)$/;
let browserZahl = 0;
function haken() {
    const p = require(require.resolve("puppeteer", { paths: [process.cwd()] }));
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
if (MESS) {
    nodeSpur();
    if (/[\\/]scripts[\\/]/.test(process.argv[1] || "")) haken(); // eine Linse startet ihren Browser (vorher: welt-boot rief haken)
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


// ─── III. DIE KARTE ─────────────────────────────────────────────────────────────────────────────────────────────────────────
// Je Schritt aus seiner Roh-Spur: `fn` die ausgeführten Glieder (Bitfeld über die EINE Tafel `glieder`), `txt` die als Text
// gelesenen, `datei` was er als Datei liest (Text, ausgelieferte Nicht-Skripte, ausgelieferte Skripte, die keine Seite ausführt),
// `verz` die gelisteten Ordner, `probe` die erfragten Pfade, `fege` die Dateien, deren Glieder er zur Hälfte und mehr als Text las.
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
        quelle: "scripts/lib/zug-auswahl.cjs --karte",
        kopf,
        erzeugt: new Date().toISOString().slice(0, 10),
        glieder: glieder_,
        schritte: Object.fromEntries(
            Object.entries(schritte)
                .sort()
                .map(([n, x]) => [n, { gruen: x.gruen, s: x.s, fn: bits.aus(nach(x.fn), idx.size), txt: nach(x.txt).sort((a, b) => a - b), datei: x.datei, verz: x.verz, probe: x.probe, fege: x.fege, suche: x.suche }]) // prettier-ignore
        ),
    };
    return { out, zaehler };
}


// h) DER BEWEIS an der Geschichte (die Läufe aus `laeufe`, die Fänger): je Zug ab `ab` die Rechenzeit heute (Versuch 1, jeder Job)
// gegen den Vorlauf (Puls, Kopf, je Gruppe mit gewähltem Schritt ihr Rahmen und die gewählten Schritte, am selben Lauf gemessen); je
// echter Fang: im Vorlauf (die Zeit heute) oder erst im Nachlauf — Landung nach dem Vorlauf, Kopf, die Gruppen auf 8 Plätzen, die
// Schuld vor ihm in seiner Gruppe, er selbst; der Täter nach der Bisektion über die Merges des Zugs (je Probe der Schritt + 0,5 min)
function beweis(L, F, karte, ab, kopfMin = 1) {
    const min = (a, b) => (zeit(b) - zeit(a)) / 6e4;
    const [gesehen, echt, Z, fang] = [new Set(), new Map(F.ereignisse.filter((e) => e.kl === "echt").map((e) => [e.sha + "|" + e.k, e.taeter.join("+")])), [], []]; // prettier-ignore
    const zuege = Object.values(L).filter((l) => l.zweig === "integ-probe" && l.ev === "push" && !gesehen.has(l.sha) && gesehen.add(l.sha)).sort((a, b) => zeit(a.t) - zeit(b.t)); // prettier-ignore
    for (const l of zuege.slice(zuege.findIndex((x) => x.sha.startsWith(ab)))) {
        const [zw, basis] = [zweigeIm(l.sha), git(["log", "--first-parent", "--format=%H %s", "-n", "40", l.sha]).split("\n").find((z, i) => i && !/^\w+ Merge \S+ in integ-probe/.test(z)).slice(0, 40)]; // prettier-ignore
        const { wahl } = vorlauf(basis, l.sha, karte, F, zeit(l.t), zugSchritte(zeige(l.sha, ".github/workflows/check.yml") ?? undefined));
        const key = (j, s) => (j.n[0] === "e" ? "echt: " : "") + kurz(s[0]);
        const J = l.jobs.filter((j) => j.att === 1 && j.a && j.e).map((j) => {
            const s = j.s.filter((x) => x[2] && x[3]);
            const [rahmen, gew] = [min(j.a, j.e) - s.reduce((a, x) => a + min(x[2], x[3]), 0), s.filter((x) => wahl.has(key(j, x)))];
            const voll = /^(voll|echt)/.test(j.n);
            return { j, rahmen, heute: min(j.a, j.e), vor: !voll ? min(j.a, j.e) : gew.length ? rahmen + gew.reduce((a, x) => a + min(x[2], x[3]), 0) : 0, nach: voll ? rahmen + s.filter((x) => !wahl.has(key(j, x))).reduce((a, x) => a + min(x[2], x[3]), 0) : 0 }; // prettier-ignore
        });
        const [heute, vor] = [J.reduce((a, x) => a + x.heute, 0), J.reduce((a, x) => a + x.vor + (/^kopf/.test(x.j.n) ? kopfMin : 0), 0)];
        const wand = kopfMin + Math.max(...J.filter((x) => /^(voll|echt)/.test(x.j.n)).map((x) => x.vor));
        // der Nachlauf: die Gruppen der Reihe nach auf 8 Plätze (echt auf seinem Läufer), je Gruppe ihr Beginn
        const [platz, beginn] = [Array(8).fill(0), new Map()];
        for (const x of J.filter((y) => /^voll/.test(y.j.n) && y.nach > y.rahmen)) {
            const i = platz.indexOf(Math.min(...platz));
            beginn.set(x.j, platz[i]);
            platz[i] += x.nach;
        }
        const rot = new Map();
        for (const j of l.jobs) if (/^(voll|echt)/.test(j.n)) for (const s of j.s) if (s[1] === "failure" && s[2] && s[3] && !rot.has(key(j, s))) rot.set(key(j, s), [j, s]);
        const imV = [...rot.keys()].filter((k) => wahl.has(k));
        // je echter Fehler (Täter am Kandidaten) seine roten Schritte: im Vorlauf, wenn einer von ihnen dort fährt
        const fehler = new Map();
        for (const [k, [j, s]] of [...rot].filter(([k]) => echt.has(l.sha + "|" + k))) {
            const x = J.find((y) => y.j.n === j.n) || { rahmen: 1 };
            const schuld = j.s.slice(0, j.s.indexOf(s)).filter((y) => y[2] && y[3] && !wahl.has(key(j, y))).reduce((a, y) => a + min(y[2], y[3]), 0);
            const nach = wand + kopfMin + (beginn.get(x.j) || 0) + x.rahmen + schuld + min(s[2], s[3]);
            const f = fehler.get(echt.get(l.sha + "|" + k)) || fehler.set(echt.get(l.sha + "|" + k), []).get(echt.get(l.sha + "|" + k));
            f.push({ k, vorlauf: wahl.has(k), heute: min(l.t, s[3]), nach, taeter: nach + Math.ceil(Math.log2(zw.length + 2)) * (min(s[2], s[3]) + 0.5) }); // prettier-ignore
        }
        for (const [taeter, f] of fehler) {
            const v = f.filter((x) => x.vorlauf);
            const b = (a, p) => Math.min(...a.map((x) => x[p]));
            fang.push({ z: l.sha.slice(0, 8), taeter, k: f.map((x) => x.k).join(" · "), vorlauf: !!v.length, heute: b(f, "heute"), nach: v.length ? b(v, "heute") : b(f, "nach"), taeterMin: v.length ? b(v, "heute") : b(f, "taeter") }); // prettier-ignore
        }
        const wandHeute = (Math.max(...J.map((x) => zeit(x.j.e))) - Math.min(...J.map((x) => zeit(x.j.a)))) / 6e4;
        Z.push({ z: l.sha.slice(0, 8), t: l.t, heute, vor, wand, wandHeute, tilgung: wand + kopfMin + Math.max(...platz), n: wahl.size, rotHeute: rot.size, rotV: imV.length, echt: [...rot.keys()].filter((k) => echt.has(l.sha + "|" + k)).length }); // prettier-ignore
    }
    return { Z, fang };
}


module.exports = { haken, messen, karteBauen, beweis };

if (require.main === module) {
    const a = process.argv.slice(2);
    const zahl = (n) => +(a[a.indexOf(n) + 1] || 0);
    const datei = (n) => JSON.parse(fs.readFileSync(a[a.indexOf(n) + 1], "utf8"));
    const lauf = require(path.resolve("scripts/lib/welt-boot.cjs")).hauptLauf;
    if (a[0] === "--messen") messen(a.slice(1).filter((x, i) => /^\d+$/.test(x) && !/^--(parallel|gruppe)$/.test(a[i])).map(Number), zahl("--parallel") || 1, zahl("--gruppe")); // prettier-ignore
    else if (a[0] === "--karte")
        lauf(async () => {
            const { out, zaehler } = karteBauen(a[1] || ROOT);
            console.log(`[karte] ${Object.keys(out.schritte).length} Schritte, ${Object.values(out.glieder).reduce((s, x) => s + x.length, 0)} Glieder in ${Object.keys(out.glieder).length} Dateien · Texte ${zaehler.text} zugeordnet, ${zaehler.textFrei} frei`); // prettier-ignore
            console.log(await koordSchreib({ [ZUG.karte]: JSON.stringify(out, null, 1) + "\n" }, `Wirkungs-Karte am Kopf ${out.kopf.slice(0, 8)} (zug-auswahl --karte)`));
        });
    else if (a[0] === "--kopf") lauf(() => zugKopf());
    else if (a[0] === "--hauptbuch") lauf(() => hauptbuch());
    // die Fänger von Hand: `--faenger <läufe.json>` (aus `--laeufe <tage> <datei>`) → koordination
    else if (a[0] === "--laeufe") lauf(async () => fs.writeFileSync(a[2], JSON.stringify(await laeufe(apiMit(), Date.now() - zahl("--laeufe") * TAG))));
    else if (a[0] === "--faenger")
        lauf(async () => {
            const F = { bis: new Date().toISOString(), ...faenger(datei("--faenger"), JSON.parse(koord(ZUG.karte))) };
            console.log(JSON.stringify(F.zahl), await koordSchreib({ [ZUG.faenger]: JSON.stringify(F, null, 1) + "\n" }, `Fänger bis ${F.bis} (zug-auswahl --faenger)`)); // prettier-ignore
        });
    else if (a[0] === "--beweis") {
        const { Z, fang } = beweis(datei("--beweis"), JSON.parse(koord(ZUG.faenger)), JSON.parse(koord(ZUG.karte)), a[2] || "60e60d09");
        const q = (x, p) => [...x].sort((m, n) => m - n)[Math.floor(p * (x.length - 1))]?.toFixed(1);
        for (const z of Z) console.log(`${z.t.slice(5, 16)} ${z.z} heute ${z.heute.toFixed(0)} min · Vorlauf ${z.vor.toFixed(0)} min (${((100 * z.vor) / z.heute).toFixed(0)} %, ${z.n} Schritte, Wand ${z.wand.toFixed(1)} min) · rot ${z.rotHeute} → im Vorlauf ${z.rotV} · echt ${z.echt}`); // prettier-ignore
        for (const f of fang) console.log(`FEHLER ${f.z} ${f.taeter} („${f.k}") ${f.vorlauf ? `im Vorlauf nach ${f.nach.toFixed(1)} min (heute ${f.heute.toFixed(1)})` : `erst im Nachlauf nach ${f.nach.toFixed(1)} min (heute ${f.heute.toFixed(1)}), Täter nach ${f.taeterMin.toFixed(1)} min`}`); // prettier-ignore
        const n = fang.filter((f) => !f.vorlauf);
        const pz = Z.map((z) => (100 * z.vor) / z.heute);
        console.log(`BEWEIS ${Z.length} Züge: heute Median ${q(Z.map((z) => z.heute), 0.5)} min · Vorlauf Median ${q(Z.map((z) => z.vor), 0.5)} min = ${q(pz, 0.5)} % (min ${q(pz, 0)}, p90 ${q(pz, 0.9)}, max ${q(pz, 1)}) · Wand heute Median ${q(Z.map((z) => z.wandHeute), 0.5)} → Vorlauf ${q(Z.map((z) => z.wand), 0.5)} min · Nachlauf tilgt nach Median ${q(Z.map((z) => z.tilgung), 0.5)} (max ${q(Z.map((z) => z.tilgung), 1)}) min · Zug-Abstand Median ${q(Z.slice(1).map((z, i) => (zeit(z.t) - zeit(Z[i].t)) / 6e4), 0.5)} min · rot heute ${Z.filter((z) => z.rotHeute).length} Züge, im Vorlauf ${Z.filter((z) => z.rotV).length} · echte Fehler ${fang.length}: Vorlauf ${fang.length - n.length}, Nachlauf ${n.length}`); // prettier-ignore
    } else {
        console.error("zug-auswahl.cjs --kopf | --hauptbuch | --messen [n …] [--gruppe g] [--parallel n] | --karte [wurzel] | --laeufe <tage> <datei> | --faenger <läufe.json> | --beweis <läufe.json> [ab]"); // prettier-ignore
        process.exit(2);
    }
}
