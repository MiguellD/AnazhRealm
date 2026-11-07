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
//   node scripts/lib/zug-auswahl.cjs --messen [n …]       misst die Schritte der vollen Batterie (Nummern, sonst alle) unter CI_WIRKUNG
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
const relPfad = (p) => {
    const r = path.relative(ROOT, path.resolve(ROOT, p)).replace(/\\/g, "/");
    return r && !r.startsWith("..") && !/^(node_modules|\.git)\//.test(r) ? r : null;
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
    });
    const art = () => {
        const alt = Error.stackTraceLimit;
        Error.stackTraceLimit = 30;
        const st = new Error().stack;
        Error.stackTraceLimit = alt;
        if (/_http_server/.test(st)) return "geliefert";
        if (/internal\/modules\/|\bfadenScope\b/.test(st)) return "lade";
        return "gelesen";
    };
    const merke = (wie, p) => {
        const r = typeof p === "string" || p instanceof URL ? relPfad(p instanceof URL ? p.pathname : p) : null;
        if (!r) return;
        const a = wie || art();
        if (a === "lade" && !/\.json$/.test(r)) return; // der Modul-Lader: die Abdeckung zählt, eine geladene .json wirkt als Text
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
async function messen(nummern, bahnen = 1, fristS = 2700) {
    const alle = vollSchritte();
    const liste = nummern.length ? nummern.map((n) => alle[n]) : alle;
    let i = 0;
    const bahn = async () => {
        while (i < liste.length) await messeSchritt(liste[i++], fristS);
    };
    await Promise.all(Array.from({ length: bahnen }, bahn));
}

module.exports = { haken, vollSchritte };

if (require.main === module) {
    const a = process.argv.slice(2);
    const zahl = (n) => +(a[a.indexOf(n) + 1] || 0);
    if (a[0] === "--messen") messen(a.slice(1).filter((x) => /^\d+$/.test(x) && a[a.indexOf(x) - 1] !== "--parallel").map(Number), zahl("--parallel") || 1); // prettier-ignore
}
