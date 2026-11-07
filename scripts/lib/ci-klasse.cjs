// ci-klasse.cjs — DIE KLASSE EINES CI-SCHRITTS: braucht er einen Echt-Renderer? Der run-Text wird über package.json bis
// auf die Befehle aufgelöst, jedes `node <datei>` samt seinen lokalen `require` nach dem Rezept an der Weiche durchsucht
// (welt-boot `starteBrowser({ art })`): ein Echt-Rezept (GPU_REZEPTE) ohne Bedingung macht ihn `gpu`; im Zweig
// (`art: X ? "linse" : "null"`) entscheidet der Befehl, ob er X setzt (Schalter oder Umgebung) — sonst `bedingt`. Der Richter
// ist die Laufzeit: die Weiche nennt ein Echt-Rezept in einer CPU-Gruppe ROT und eines, das nie zeichnet.
"use strict";
const { GPU_REZEPTE, ausDatei, path, fs, ROOT } = require("./welt-boot.cjs");

const ART = /\bart:\s*([^\n,}]+)/g;
const REZEPT_RE = new RegExp(`["'](${GPU_REZEPTE.join("|")})["']`);

// die Befehle eines run-Texts: `npm run x` wird über die Skripte aufgelöst (&& · ; · Zeilen trennen)
function befehle(text, skripte, tiefe = 0) {
    const out = [];
    for (const b of String(text || "")
        .split(/&&|\|\||;|\n/)
        .map((x) => x.trim())
        .filter(Boolean)) {
        const m = /^npm run ([\w:.-]+)/.exec(b);
        if (m && typeof skripte[m[1]] === "string" && tiefe < 16)
            out.push(...befehle(skripte[m[1]], skripte, tiefe + 1));
        else out.push(b);
    }
    return out;
}

// das Rezept einer Datei und ihrer lokalen requires: { klasse: "gpu" | "bedingt" | null, wo }
// trägt der Befehl die Bedingung X des Zweigs? true · false · null (nicht zu lesen)
// (der Schalter der Weiche `SELBSTTEST` aus welt-boot IST `--selftest`, direkt im Zweig oder über einen Namen)
function bedingungIm(t, ausdruck, befehl) {
    const m = /^\s*\(?\s*([A-Za-z_$][\w$]*)\s*\?/.exec(ausdruck);
    const def =
        m && (m[1] === "SELBSTTEST" ? [, m[1]] : new RegExp(`(?:const|let|var)\\s+${m[1]}\\s*=\\s*([^;\\n]+)`).exec(t));
    if (!def) return null;
    const text = def[1].replace(/\bSELBSTTEST\b/g, '"--selftest"');
    const schalter = [...text.matchAll(/["'](--[\w-]+)["']/g)].map((x) => x[1]);
    const env = [...text.matchAll(/process\.env\.(\w+)/g)].map((x) => x[1]);
    if (!schalter.length && !env.length) return null;
    const worte = String(befehl || "").split(/\s+/);
    return schalter.some((x) => worte.includes(x)) || env.some((x) => worte.some((w) => w.startsWith(x + "=")));
}

function klasseDerDatei(datei, lies, gesehen = new Set(), befehl = "") {
    if (gesehen.has(datei)) return { klasse: null };
    gesehen.add(datei);
    const t = lies(datei);
    if (t == null) return { klasse: null };
    let bedingt = null;
    for (const m of t.matchAll(ART)) {
        if (!REZEPT_RE.test(m[1])) continue;
        const wo = `${path.relative(ROOT, datei).replace(/\\/g, "/")} (art: ${m[1].trim()})`;
        // jeder Zweig ein Echt-Rezept (`ECHT ? "echt" : "linse"`) ist so fest wie keiner
        const zweige = [...m[1].matchAll(/["']([\w-]+)["']/g)].map((x) => x[1]);
        if (!/\?/.test(m[1]) || zweige.every((z) => GPU_REZEPTE.includes(z))) return { klasse: "gpu", wo };
        // der Zweig `X ? <Echt> : "null"` (oder `X ? "null" : <Echt>`): der Befehl entscheidet X
        const dann = /\?\s*["'](null|standard)["']\s*:/.test(m[1]);
        const an = dann || /:\s*["'](null|standard)["']\s*\)?\s*$/.test(m[1]) ? bedingungIm(t, m[1], befehl) : null;
        if (an !== null && an !== dann) return { klasse: "gpu", wo: wo + " — der Befehl entscheidet die Bedingung" };
        if (an !== null) continue;
        bedingt = bedingt || { klasse: "bedingt", wo };
    }
    for (const m of t.matchAll(/require\(\s*["'](\.{1,2}\/[^"']+)["']\s*\)/g)) {
        let f = path.resolve(path.dirname(datei), m[1]);
        if (!/\.c?js$/.test(f)) f += ".cjs";
        const k = klasseDerDatei(f, lies, gesehen, befehl);
        if (k.klasse === "gpu")
            return { klasse: "gpu", wo: `${path.relative(ROOT, datei).replace(/\\/g, "/")} → ${k.wo}` };
        if (k.klasse === "bedingt") bedingt = bedingt || k;
    }
    return bedingt || { klasse: null };
}

const liesPlatte = (f) => (fs.existsSync(f) ? ausDatei(f) : null);

// die Klasse eines Schritts (run-Text): "gpu" schlägt "bedingt" schlägt "cpu"
function klasseDesLaufs(run, skripte, lies = liesPlatte, root = ROOT) {
    let bedingt = null;
    for (const b of befehle(run, skripte)) {
        const m = /\bnode\s+(?:--\S+\s+)*([\w./-]+\.c?js)\b/.exec(b);
        if (!m) continue;
        const k = klasseDerDatei(path.resolve(root, m[1]), lies, new Set(), b);
        if (k.klasse === "gpu") return k;
        if (k.klasse === "bedingt") bedingt = bedingt || k;
    }
    return bedingt || { klasse: "cpu" };
}

// DIE LÄUFER-PLÄTZE des Kontos: höchstens 20 Jobs zugleich — die EINE Zahl für die Waage und das Verteilen.
const LAEUFER_PLAETZE = 20;
// DER GROSSE SCHRITT (CW): über 5 min Median braucht er eine eigene Karte, nie die Waage (sie nennt ihn beim Namen)
const GROSS_S = 300;
// DER DECKEL DES PULSES: 2 min je Push samt Vorbereitung — die EINE Zahl für die Waage (gate:ci-deckung) und das Verteilen
// (ci-zeiten.cjs nimmt, was eine Puls-Gruppe darüber trägt, in die volle Stufe); gewogen in Zehntel-Minuten, der Einheit der
// Anzeige (ein Job-Median streut über die Läufe ±10 s)
const PULS_S = 120;
const ueber = (s, deckel) => Math.round(s / 6) > Math.round(deckel / 6);

// ── R6: DER SELBSTTEST RUHT, WO SEINE LINSE RUHT (Schöpfer 07.11.: „wird nicht viel zu viel unnötig gemessen?") ──
// Ein Selbsttest beweist die LINSE, nicht das Spiel: auf einem Zweig, einem PR und integ-probe läuft er nur, wenn der Kandidat
// gegen die Merge-Basis mit origin/main etwas ändert, woran er hängt — sonst fährt nur der echte Lauf. Nachts, auf Abruf, bei
// jedem Push auf main und außerhalb der CI läuft jeder (das Netz; die Ratsche hält gebuchtes Grün). Die EINE Stelle ist die
// Shell der vollen Batterie (check.yml `voll`: defaults.run.shell = R6_SHELL): sie liest den Schritt, nennt je Selbsttest
// beim Namen, warum er läuft oder ruht (die Datei), und fährt den Rest unter `bash -e` wie die Standard-Shell.
const R6_SHELL = "node scripts/lib/ci-klasse.cjs {0}";
const SELBST_RE = / --(?:selftest|selbsttest)(?=\s|$)/;
// Hier ist --selftest ein ZUSATZ zum Hauptlauf im selben Aufruf (die Täter-Welten neben den Hauptwelten, der Täter nach der
// Messung in derselben Welt): ruht er, fährt der Aufruf ohne den Schalter. Jeder andere Aufruf ohne Begleiter läuft ganz.
const R6_ZUSATZ = [
    "haus-welt",
    "koerper-stand",
    "studio-begehen",
    "klang-zensus",
    "pruefbuehne",
    "weltgrenze",
    "boot-rettung",
    "persistence",
].map((n) => `scripts/diag-${n}.cjs`);
// die Laufzeit jeder Linse (Chromium, three): ihr Wechsel weckt jeden Selbsttest
const R6_LAUFZEIT = /^(package-lock\.json|vendor\/)/;
const r6Immer = (env) =>
    !env.GITHUB_ACTIONS
        ? "außerhalb der CI"
        : /^(schedule|workflow_dispatch)$/.test(env.GITHUB_EVENT_NAME)
          ? `Ereignis ${env.GITHUB_EVENT_NAME}`
          : env.GITHUB_REF === "refs/heads/main"
            ? "Push auf main"
            : null;
const gitIn = (args) =>
    require("child_process").execFileSync("git", args, {
        cwd: ROOT,
        encoding: "utf8",
        maxBuffer: 1 << 30,
        stdio: ["ignore", "pipe", "pipe"],
    });
// der Diff des Kandidaten gegen die Merge-Basis mit origin/main: je Datei ihre geänderten Zeilen (- und +); `bekannt` fragt,
// ob der Grund den Aufruf schon trug (ein neuer Aufruf läuft)
function r6Diff(git = gitIn, gegen = "origin/main", kopf = "HEAD") {
    const basis = git(["merge-base", gegen, kopf]).trim();
    const diff = new Map();
    let f = null;
    for (const z of git(["-c", "core.quotePath=false", "diff", "-U0", "--no-color", "--no-renames", basis, kopf]).split(
        "\n"
    ))
        if (z.startsWith("diff --git ")) diff.set((f = z.slice(13, 13 + (z.length - 16) / 2)), []);
        else if (/^[-+]/.test(z) && !/^(---|\+\+\+) /.test(z)) diff.get(f).push(z.slice(1));
    const alt = ["package.json", ".github/workflows/check.yml"].map((p) => git(["show", `${basis}:${p}`])).join("\n");
    return { basis, diff, bekannt: (b) => alt.includes(b) };
}
const NAME_RE = /(?<![\w$])_[A-Za-z]\w{3,}/g;
const LIT_RE = /(["'`])((?:(?!\1)[^\\\n]){24,})\1/g;
// die Abhängigkeit einer Linse: sie und ihr require-Graph (Code), dazu die Anker ihres Täters aus ihren EIGENEN Dateien (eine
// Bibliothek mit mehr als drei Lesern ist geteilt und trägt keinen Täter): die Spiel-Dateien, die sie nennt, die Glieder
// (`_name`) und die Zeilen (Literal ≥ 24 Zeichen), in die sie ihn einspielt
function r6Abhaengig(linse, lies = liesPlatte) {
    const [code, eigen] = [new Set(), []];
    const geh = (f, teilt) => {
        const t = code.has(f) ? null : lies(path.join(ROOT, f));
        if (t == null) return;
        code.add(f);
        teilt = teilt || r6Geteilt().get(f) > 3;
        if (!teilt) eigen.push(t);
        for (const m of t.matchAll(/require\(\s*["'](\.{1,2}\/[^"']+)["']\s*\)/g))
            geh(path.posix.join(path.posix.dirname(f), m[1]).replace(/^(?!.*\.(?:c?js|json)$)(.*)$/, "$1.cjs"), teilt);
    };
    geh(linse);
    const text = eigen.join("\n");
    const zeilen = [...text.matchAll(LIT_RE)].map((m) => m[2]).filter((l) => !l.includes("${"));
    const pfade = new Set(
        [...text.matchAll(/["'`]\/?([\w.-]+(?:\/[\w.-]+)*\.(?:c?js|json|html|wgsl))["'`]/g)].map((m) => m[1])
    );
    return { code, namen: new Set(text.match(NAME_RE)), zeilen, pfade };
}
let geteilt = null;
function r6Geteilt() {
    if (geteilt) return geteilt;
    geteilt = new Map();
    for (const f of gitIn(["ls-files", "scripts"])
        .split("\n")
        .filter((x) => /\.c?js$/.test(x)))
        for (const m of (liesPlatte(path.join(ROOT, f)) || "").matchAll(/require\(\s*["'](\.{1,2}\/[^"']+)["']/g)) {
            const g = path.posix.join(path.posix.dirname(f), m[1]);
            geteilt.set(g, (geteilt.get(g) || 0) + 1);
        }
    return geteilt;
}
// läuft der Selbsttest dieses Aufrufs? { laeuft, grund } — der Grund nennt die Datei
function r6Urteil(aufruf, kx, abh = r6Abhaengig) {
    const m = /\bnode\s+(?:--\S+\s+)*([\w./-]+\.c?js)\b/.exec(aufruf);
    const ja = (grund) => ({ laeuft: true, grund });
    if (kx.immer) return ja(kx.immer);
    if (!m) return ja("keine Linse im Aufruf");
    if (!kx.diff) return ja(`kein Diff (${kx.fehler})`);
    const g = [...kx.diff.keys()];
    const lz = g.find((f) => R6_LAUFZEIT.test(f));
    if (lz) return ja(`Laufzeit ${lz}`);
    if (!kx.bekannt(aufruf)) return ja("neuer Aufruf (am Grund trägt ihn weder check.yml noch package.json)");
    const a = abh(m[1].replace(/^\.\//, ""));
    const c = g.find((f) => a.code.has(f) || a.pfade.has(f));
    if (c) return ja(`${a.code.has(c) ? "Code" : "Spiel-Datei"} ${c}`);
    for (const [f, zz] of kx.diff)
        if (!/^(scripts\/|\.github\/)|\.md$/.test(f))
            for (const z of zz) {
                const t = (z.match(NAME_RE) || []).find((n) => a.namen.has(n)) || a.zeilen.find((l) => z.includes(l));
                if (t) return ja(`${f} ändert „${t.slice(0, 60)}"`);
            }
    return {
        laeuft: false,
        grund: `${a.code.size} Code-Dateien, ${a.namen.size} Glieder, ${a.zeilen.length} Zeilen gegen ${g.length} geänderte Dateien`,
    };
}
// der Schritt unter R6: jede &&-Kette mit einem Selbsttest (auch über `npm run`) wird gelesen; ein ruhender Selbsttest fällt
// aus seiner Kette, wo sein Begleiter (derselbe Aufruf ohne Schalter) mitfährt, sonst fährt R6_ZUSATZ ohne Schalter
function r6Text(text, skripte, urteil, bericht, tiefe = 0) {
    return String(text)
        .split("\n")
        .map((zeile) => {
            const roh = zeile.split("&&").map((x) => x.trim());
            const out = [];
            for (const b of roh) {
                const n = /^npm run ([\w:.-]+)$/.exec(b);
                const s = n && tiefe < 16 && skripte[n[1]];
                const neu = typeof s === "string" && r6Text(s, skripte, urteil, bericht, tiefe + 1);
                if (neu && neu !== s) out.push(`( ${neu} )`);
                else if (!SELBST_RE.test(b)) out.push(b);
                else {
                    const [u, ohne] = [urteil(b), b.replace(SELBST_RE, "")];
                    const begleiter = roh.includes(ohne);
                    const ruht = !u.laeuft && (begleiter || R6_ZUSATZ.some((z) => b.includes(z)));
                    bericht.push(
                        `R6 ${ruht ? "ruht" : "läuft"}: ${b} — ${u.laeuft || ruht ? u.grund : "Hauptlauf und Selbsttest sind EIN Aufruf"}`
                    );
                    if (!ruht) out.push(b);
                    else if (!begleiter) out.push(ohne);
                }
            }
            return out.join(" && ") === roh.join(" && ") ? zeile : out.join(" && ");
        })
        .join("\n");
}
function r6Kontext(env = process.env) {
    const immer = r6Immer(env);
    if (immer) return { immer };
    try {
        return r6Diff();
    } catch (e) {
        return { fehler: String(e.message).split("\n")[0] };
    }
}
// SCHNITT B — EINE ZUG-STELLE JE WAND: im Zug (Push auf integ-probe) urteilt der echt-Job eine Wand auf der GTX; derselbe
// Schritt der vollen Batterie fährt dort nicht noch einmal auf swiftshader (der echte Renderer ist der stärkere Richter,
// Lehre 17). Nachts, auf main und auf einem Zweig mit [ci voll] (dort läuft kein echt) fährt die swiftshader-Fassung.
const r6ZugStelle = (run, doc, env) =>
    env.GITHUB_EVENT_NAME === "push" && env.GITHUB_REF === "refs/heads/integ-probe"
        ? (doc.jobs.echt.steps || []).find((s) => s.run && s.run.trim() === String(run).trim()) || null
        : null;
// als Shell: `node scripts/lib/ci-klasse.cjs <skript>` (check.yml `voll`)
if (require.main === module) {
    const [datei, text] = [process.argv[2], ausDatei(process.argv[2])];
    const echt =
        /^npm run gate:[\w:.-]+$/.test(text.trim()) &&
        r6ZugStelle(
            text,
            require("js-yaml").load(ausDatei(path.join(ROOT, ".github/workflows/check.yml"))),
            process.env
        );
    if (echt) console.log(`R6 ruht: ${text.trim()} — die Zug-Stelle der Wand ist der echt-Job („${echt.name}")`);
    if (echt) process.exit(0);
    let kx = null;
    const bericht = [];
    const neu = r6Text(
        text,
        JSON.parse(ausDatei(path.join(ROOT, "package.json"))).scripts,
        (b) => r6Urteil(b, (kx = kx || r6Kontext())),
        bericht
    );
    if (bericht.length) console.log(bericht.join("\n"));
    fs.writeFileSync(datei + ".r6", neu);
    process.exit(require("child_process").spawnSync("bash", ["-e", datei + ".r6"], { stdio: "inherit" }).status ?? 1);
}

module.exports = {
    GROSS_S,
    LAEUFER_PLAETZE,
    PULS_S,
    klasseDesLaufs,
    ueber,
    R6_SHELL,
    R6_ZUSATZ,
    SELBST_RE,
    r6Urteil,
    r6Text,
    r6Abhaengig,
    r6Immer,
    r6Diff,
    r6ZugStelle,
};
