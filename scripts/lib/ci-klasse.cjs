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
        if (m && typeof skripte[m[1]] === "string" && tiefe < 16) out.push(...befehle(skripte[m[1]], skripte, tiefe + 1));
        else out.push(b);
    }
    return out;
}

// das Rezept einer Datei und ihrer lokalen requires: { klasse: "gpu" | "bedingt" | null, wo }
// trägt der Befehl die Bedingung X des Zweigs? true · false · null (nicht zu lesen)
// (der Schalter der Weiche `SELBSTTEST` aus welt-boot IST `--selftest`, direkt im Zweig oder über einen Namen)
function bedingungIm(t, ausdruck, befehl) {
    const m = /^\s*\(?\s*([A-Za-z_$][\w$]*)\s*\?/.exec(ausdruck);
    const def = m && (m[1] === "SELBSTTEST" ? [, m[1]] : new RegExp(`(?:const|let|var)\\s+${m[1]}\\s*=\\s*([^;\\n]+)`).exec(t));
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
        if (k.klasse === "gpu") return { klasse: "gpu", wo: `${path.relative(ROOT, datei).replace(/\\/g, "/")} → ${k.wo}` };
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
const R6_ZUSATZ =
    /diag-(haus-welt|koerper-stand|studio-begehen|klang-zensus|pruefbuehne|weltgrenze|boot-rettung|persistence)\./;
const r6Immer = (e) =>
    !e.GITHUB_ACTIONS
        ? "lokal"
        : /^(schedule|workflow_dispatch)$/.test(e.GITHUB_EVENT_NAME)
          ? e.GITHUB_EVENT_NAME
          : e.GITHUB_REF === "refs/heads/main" && "main";
const git = (...a) =>
    require("child_process").execFileSync("git", a, { cwd: ROOT, encoding: "utf8", maxBuffer: 1 << 30 });
// der Diff des Kandidaten gegen die Merge-Basis mit origin/main: je Datei ihre geänderten Zeilen (- und +); `bekannt` fragt,
// ob der Grund den Aufruf schon trug (ein neuer Aufruf läuft)
function r6Diff(g = git) {
    const basis = g("merge-base", "origin/main", "HEAD").trim();
    const [diff, alt] = [
        new Map(),
        g("show", basis + ":package.json") + g("show", basis + ":.github/workflows/check.yml"),
    ];
    let f;
    for (const z of g("diff", "-U0", "--no-renames", basis, "HEAD").split("\n"))
        if (z.startsWith("diff --git ")) diff.set((f = z.slice(13, 13 + (z.length - 16) / 2)), []);
        else if (/^[-+](?!(--|\+\+) )/.test(z)) diff.get(f).push(z.slice(1));
    return { diff, bekannt: (b) => alt.includes(b) };
}
const NAME_RE = /(?<![\w$])_[A-Za-z]\w{3,}/g;
const LIT_RE = /(["'`])((?:(?!\1)[^\\\n]){24,})\1/g;
// der require-Graph einer Datei: Pfad → Text
const graph = (f, lies, s = new Map()) => {
    const t = s.has(f) ? null : lies(path.join(ROOT, f));
    if (t != null) s.set(f, t);
    for (const m of t == null ? [] : t.matchAll(/require\(\s*["'](\.{1,2}\/[^"']+)["']/g))
        graph(path.posix.join(path.posix.dirname(f), m[1]).replace(/^(?!.*\.(?:c?js|json)$)(.*)$/, "$1.cjs"), lies, s);
    return s;
};
// DIE ABHÄNGIGKEIT EINER LINSE (die EINE Quelle; das Schulden-Hauptbuch liest sie mit): ihr require-Graph (`code`), dazu die
// Anker ihres Täters aus ihren EIGENEN Dateien (der Graph der geteilten Boot-Bibliothek welt-boot.cjs trägt keinen): die Datei-
// Namen, die sie nennt (`text`), die Glieder (`_name`) und die Zeilen (Literal ≥ 24 Zeichen), in die sie ihn einspielt
function r6Abhaengig(linse, lies = liesPlatte) {
    const [code, boot] = [graph(linse, lies), graph("scripts/lib/welt-boot.cjs", lies)];
    const text = [...code]
        .filter(([f]) => !boot.has(f))
        .map(([, t]) => t)
        .join("\n");
    return {
        code,
        text,
        namen: new Set(text.match(NAME_RE)),
        zeilen: [...text.matchAll(LIT_RE)].map((m) => m[2]).filter((l) => !l.includes("${")),
    };
}
// läuft der Selbsttest dieses Aufrufs? { laeuft, grund } — der Grund nennt die Datei (die Laufzeit package-lock und vendor/
// weckt jeden)
function r6Urteil(b, kx, abh = r6Abhaengig) {
    const ja = (grund) => ({ laeuft: true, grund });
    if (kx.immer || !kx.diff) return ja(kx.immer || "kein Diff: " + kx.fehler);
    if (!kx.bekannt(b)) return ja("neuer Aufruf");
    const a = abh((/node\s+([\w./-]+\.c?js)/.exec(b) || [, ""])[1]);
    for (const [f, zz] of kx.diff) {
        if (/^(package-lock\.json|vendor\/)/.test(f) || a.code.has(f) || a.text.includes(f)) return ja(f);
        const t =
            !/^(scripts|\.github)\/|\.md$/.test(f) &&
            zz
                .map((z) => (z.match(NAME_RE) || []).find((n) => a.namen.has(n)) || a.zeilen.find((l) => z.includes(l)))
                .find(Boolean);
        if (t) return ja(`${f} ändert „${t.slice(0, 60)}"`);
    }
    return { laeuft: false, grund: `${a.code.size} Dateien, ${a.namen.size} Glieder, ${a.zeilen.length} Zeilen` };
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
                const s = tiefe < 16 && skripte[(/^npm run ([\w:.-]+)$/.exec(b) || [])[1]];
                const neu = typeof s === "string" && r6Text(s, skripte, urteil, bericht, tiefe + 1);
                const [u, ohne] = neu || !SELBST_RE.test(b) ? [] : [urteil(b), b.replace(SELBST_RE, "")];
                const ruht = u && !u.laeuft && (roh.includes(ohne) || R6_ZUSATZ.test(b));
                if (u)
                    bericht.push(
                        `R6 ${ruht ? "ruht" : "läuft"}: ${b} — ${u.laeuft || ruht ? u.grund : "EIN Aufruf mit dem Hauptlauf"}`
                    );
                out.push(neu && neu !== s ? `( ${neu} )` : !ruht ? b : roh.includes(ohne) ? null : ohne);
            }
            const neu = out.filter((x) => x !== null).join(" && ");
            return neu === roh.join(" && ") ? zeile : neu;
        })
        .join("\n");
}
// SCHNITT B — EINE ZUG-STELLE JE WAND: im Zug (Push auf integ-probe) urteilt der echt-Job eine Wand auf der GTX; derselbe
// Schritt der vollen Batterie fährt dort nicht noch einmal auf swiftshader (der echte Renderer ist der stärkere Richter,
// Lehre 17). Nachts, auf main und auf einem Zweig mit [ci voll] (dort läuft kein echt) fährt die swiftshader-Fassung.
const r6ZugStelle = (run, doc, e) =>
    e.GITHUB_EVENT_NAME === "push" &&
    e.GITHUB_REF === "refs/heads/integ-probe" &&
    doc.jobs.echt.steps.find((s) => s.run && s.run.trim() === run.trim());
// als Shell: `node scripts/lib/ci-klasse.cjs <skript>` (check.yml `voll`)
if (require.main === module) {
    const [f, text, e] = [process.argv[2], ausDatei(process.argv[2]), process.env];
    const echt =
        /^npm run gate:\S+$/.test(text.trim()) &&
        r6ZugStelle(text, require("js-yaml").load(ausDatei(path.join(ROOT, ".github/workflows/check.yml"))), e);
    const b = echt ? [`R6 ruht: ${text.trim()} — die Zug-Stelle der Wand ist der echt-Job („${echt.name}")`] : [];
    let kx;
    const kontext = () => {
        try {
            return r6Immer(e) ? { immer: r6Immer(e) } : r6Diff();
        } catch (x) {
            return { fehler: x.message.split("\n")[0] };
        }
    };
    fs.writeFileSync(
        f + ".r6",
        echt
            ? ""
            : r6Text(
                  text,
                  JSON.parse(ausDatei(path.join(ROOT, "package.json"))).scripts,
                  (x) => r6Urteil(x, (kx ||= kontext())),
                  b
              )
    );
    if (b.length) console.log(b.join("\n"));
    process.exit(require("child_process").spawnSync("bash", ["-e", f + ".r6"], { stdio: "inherit" }).status ?? 1);
}

module.exports = {
    GROSS_S,
    LAEUFER_PLAETZE,
    PULS_S,
    klasseDesLaufs,
    ueber,
    R6_SHELL,
    r6Urteil,
    r6Text,
    r6Immer,
    r6ZugStelle,
};
