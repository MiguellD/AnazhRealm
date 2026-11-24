// ci-klasse.cjs — DIE KLASSE EINES CI-SCHRITTS: braucht er einen Echt-Renderer? Der run-Text wird über package.json bis
// auf die Befehle aufgelöst, jedes `node <datei>` samt seinen lokalen `require` nach dem Rezept an der Weiche durchsucht
// (welt-boot `starteBrowser({ art })`): ein Echt-Rezept (GPU_REZEPTE) ohne Bedingung macht ihn `gpu`; im Zweig
// (`art: X ? "linse" : "null"`) entscheidet der Befehl, ob er X setzt (Schalter oder Umgebung) — sonst `bedingt`. Die Werkbank
// startet ihre Welt an der Weiche vorbei (`startePuppeteer` mit `linsenWebGpuArgs`): ihr Start (`werkbank.cjs start`, `--eigen`,
// `werkbankTor(` in einer Linse) ist `gpu` — bis w27-swift-raus zeichneten gate:nah-fern und gate:schatten-terminator so still
// auf swiftshader in CPU-Gruppen. Der Richter ist die Laufzeit: die Weiche und `werkbank start` nennen ein Echt-Rezept in einer
// CPU-Gruppe ROT, die Weiche eines, das nie zeichnet.
"use strict";
const { GPU_REZEPTE, OFEN_KERNE, fadenQuellen, ausDatei, path, fs, ROOT } = require("./welt-boot.cjs");

const ART = /\bart:\s*([^\n,}]+)/g;
const REZEPT_RE = new RegExp(`["'](${GPU_REZEPTE.join("|")})["']`);
// DIE WERKBANK ZEICHNET: ihr Start als Befehl (`start`, oder `--eigen`: die Welt als Kind) und als Ruf einer Linse (welt-boot
// `werkbankTor`, nie seine Definition); jeder andere Werkbank-Befehl spricht mit einer laufenden Werkbank oder prüft sich selbst
const WERKBANK_BEFEHL = /\bscripts\/werkbank\.cjs\b/;
const WERKBANK_START = /\bwerkbank\.cjs\s+start\b|\s--eigen(?=\s|$)/;
const WERKBANK_TOR = /(?<!function\s)\bwerkbankTor\(/;

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
    const rel = path.relative(ROOT, datei).replace(/\\/g, "/");
    if (WERKBANK_TOR.test(t)) return { klasse: "gpu", wo: `${rel} (werkbankTor: die Werkbank zeichnet)` };
    let bedingt = null;
    for (const m of t.matchAll(ART)) {
        if (!REZEPT_RE.test(m[1])) continue;
        // DER LAUF HINTER EINEM SCHALTER (`if (argv.includes("--licht")) return lichtLauf();`): ein Start in der Funktion, die nur
        // der Schalter ruft, gilt nur dem Befehl mit ihm — gate:pruefbuehne (ohne --licht, Rezept standard) zeichnet nie
        const fn = [...t.slice(0, m.index).matchAll(/\bfunction\s+([\w$]+)\s*\(/g)].pop();
        const tor = fn && new RegExp(`\\bargv\\.includes\\(\\s*["'](--[\\w-]+)["']\\s*\\)\\s*\\)\\s*return\\s+${fn[1]}\\(`).exec(t);
        if (tor && !String(befehl).split(/\s+/).includes(tor[1])) continue;
        const wo = `${rel} (art: ${m[1].trim()})`;
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
        if (k.klasse === "gpu") return { klasse: "gpu", wo: `${rel} → ${k.wo}` };
        if (k.klasse === "bedingt") bedingt = bedingt || k;
    }
    return bedingt || { klasse: null };
}

const liesPlatte = (f) => (fs.existsSync(f) ? ausDatei(f) : null);

// die Klasse eines Schritts (run-Text): "gpu" schlägt "bedingt" schlägt "cpu"
function klasseDesLaufs(run, skripte, lies = liesPlatte, root = ROOT) {
    let bedingt = null;
    for (const b of befehle(run, skripte)) {
        if (WERKBANK_BEFEHL.test(b)) {
            if (WERKBANK_START.test(b)) return { klasse: "gpu", wo: `„${b}" (die Werkbank startet ihre Welt)` };
            continue;
        }
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
// DIE KERNE, DURCH DIE EINE LINSE BAUT (anatomie-r4-heil): eine Linse, die ihre Welt im Faden der Boot-Bibliothek gießt
// (welt-boot `fadenScope` · `studioKern`), hängt an JEDEM Kern, den dieser Ruf lädt — auch an dem, den ihr Text nie beim
// Datei-Namen nennt: die Liste trägt die Bibliothek (`OFEN_KERNE`), der Samen-Baum und die Kerne, die ein Kern liest, kommen
// im Ruf dazu (`fadenQuellen`, dieselbe Liste, die der Faden lädt), ein Ruf über die Skripte des Manifests (`c.scripts`) lädt
// jeden. Bis hier trug der Schlüssel nur, was im Text der Linse stand: w28-mensch-nah (85aec8c18: foundry-core.js +254 Zeilen,
// `__hautUnterStoff`) landete, während der Selbsttest der Mensch-Anatomie ruhte („15 Dateien, 19 Glieder, 124 Zeilen“) — ihre
// Mutante R4 war ab da stumpf, und main fiel erst rot, als ein anderer Diff den Selbsttest weckte. `blind` nennt die Rufe
// einer Linse, deren Liste der Schlüssel nicht lesen kann (kein Literal, keine Liste im Text oder in der Bibliothek, kein
// Kern und kein Manifest im Text) — gate:ci-deckung (Z) nennt sie ROT, nie ruht ihr Selbsttest still.
const KERN_LISTEN = { OFEN_KERNE };
const BAU_RUF = /\b(?:fadenScope|studioKern)\(\s*([^,)]*)/g;
const manifestKerne = (lies) => JSON.parse(lies(path.join(ROOT, "cores.manifest.json"))).flatMap((c) => c.scripts || []);
function r6Kerne(text, lies = liesPlatte) {
    const rufe = [...text.matchAll(BAU_RUF)].map((m) => m[1].trim());
    if (!rufe.length) return { kerne: new Set(), blind: [] };
    // offen: der Ruf nennt seine Liste nicht selbst (kein Literal, keine Liste der Bibliothek, keine `const X = [` im Text)
    const imText = (r) => /^[\w$]+$/.test(r) && new RegExp(`\\bconst ${r.replace(/\$/g, "\\$")} = \\[`).test(text);
    const offen = rufe.filter((r) => !/^["'`[]/.test(r) && !KERN_LISTEN[r] && !imText(r));
    const alle = manifestKerne(lies);
    const genannt = alle.filter((k) => text.includes(k));
    for (const [n, liste] of Object.entries(KERN_LISTEN)) if (new RegExp(`\\b${n}\\b`).test(text)) genannt.push(...liste);
    if (offen.length && text.includes("cores.manifest.json")) genannt.push(...alle);
    return { kerne: new Set(fadenQuellen([...new Set(genannt)])), blind: genannt.length ? [] : offen };
}
// DAS WELT-TOR (ruhe-gesetz, Entscheid des Koordinators 24.11.): eine Linse, deren SEITE die Welt lädt (Stamm, Kerne, Studios,
// index.html), hängt an JEDEM Laufzeit-Byte — ihr echter Leser steht in keinem require-Graphen. Bis hier weckte sie nur ein
// Diff, dessen Zeile eines ihrer Glieder beim Namen nennt: der Selbsttest-Zusatz von gate:koerper-stand ruhte beim Diff von
// w28-auge-der-art (stamm/bild-kosten.js, drei weitere Stamm-Dateien, tetrapoda-core.js — „15 Dateien, 0 Kerne, 67 Glieder,
// 24 Zeilen“). Regel statt Schlüssel: ein Welt-Tor ruht NUR, wenn der Diff kein Laufzeit-Byte trägt. Die Türen zur Welt liest
// der Schlüssel aus der Boot-Bibliothek selbst (jede ihrer Funktionen, die — auch über andere — den Browser startet); eine
// Linse ist Welt-Tor, wenn ihr eigener Text eine Tür ruft, die sie nicht selbst unter diesem Namen baut.
const LAUFZEIT_RE = /^(?:stamm\/|worlds\/|index\.html$|cores\.manifest\.json$|[^/]+\.js$)/;
const TUER_SAAT = ["starteBrowser", "startePuppeteer", "werkbankTor"];
function weltTueren(lies = liesPlatte) {
    const t = lies(path.join(ROOT, "scripts/lib/welt-boot.cjs")) || "";
    const koepfe = [...t.matchAll(/^(?:async )?function ([\w$]+)\(/gm)];
    // der Rumpf endet an seiner Klammer in Spalte 0 (prettier), Kommentar-Zeilen zählen nicht: sie dürfen eine Tür zitieren
    const rumpf = koepfe.map((m) => {
        const ab = m.index + m[0].length;
        const zu = t.indexOf("\n}", ab);
        return [m[1], t.slice(ab, zu < 0 ? t.length : zu).replace(/^\s*\/\/.*$/gm, "")];
    });
    // Tür wird nur, was die Bibliothek unter dem eigenen Namen ausführt (ein Schlüssel `name: …` ist ein anderes Ding)
    const aus = t.slice(t.lastIndexOf("module.exports = {"));
    const gibtAus = (n) => new RegExp(`^\\s*${n},?\\s*$`, "m").test(aus);
    const tuer = new Set(TUER_SAAT);
    for (let neu = 1; neu; ) {
        neu = 0;
        for (const [n, r] of rumpf)
            if (!tuer.has(n) && gibtAus(n) && [...tuer].some((d) => new RegExp(`(?<![\\w$.])${d}\\(`).test(r)))
                neu = tuer.add(n).size;
    }
    return tuer;
}
const istWeltTor = (text, tueren) =>
    [...tueren].some(
        (d) =>
            new RegExp(`(?<![\\w$])${d}\\(`).test(text) &&
            !new RegExp(`\\b(?:function|const|let|var)\\s+${d}\\b(?!\\s*[,}])`).test(text)
    );
// DIE ABHÄNGIGKEIT EINER LINSE (die EINE Quelle; das Schulden-Hauptbuch liest sie mit): ihr require-Graph (`code`), dazu die
// Anker ihres Täters aus ihren EIGENEN Dateien (der Graph der geteilten Boot-Bibliothek welt-boot.cjs trägt keinen): die Datei-
// Namen, die sie nennt (`text`), die Glieder (`_name`) und die Zeilen (Literal ≥ 24 Zeichen), in die sie ihn einspielt — und
// die Kerne, durch die sie baut (`kerne`, oben)
function r6Abhaengig(linse, lies = liesPlatte) {
    const [code, boot] = [graph(linse, lies), graph("scripts/lib/welt-boot.cjs", lies)];
    const text = [...code]
        .filter(([f]) => !boot.has(f))
        .map(([, t]) => t)
        .join("\n");
    return {
        code,
        text,
        ...r6Kerne(text, lies),
        welt: istWeltTor(text, weltTueren(lies)),
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
        if (/^(package-lock\.json|vendor\/)/.test(f) || a.code.has(f) || a.kerne.has(f) || a.text.includes(f)) return ja(f);
        if (a.welt && LAUFZEIT_RE.test(f)) return ja(`${f} (Laufzeit-Byte: die Seite der Linse lädt die Welt)`);
        const t =
            !/^(scripts|\.github)\/|\.md$/.test(f) &&
            zz
                .map((z) => (z.match(NAME_RE) || []).find((n) => a.namen.has(n)) || a.zeilen.find((l) => z.includes(l)))
                .find(Boolean);
        if (t) return ja(`${f} ändert „${t.slice(0, 60)}"`);
    }
    return { laeuft: false, grund: `${a.code.size} Dateien, ${a.kerne.size} Kerne, ${a.namen.size} Glieder, ${a.zeilen.length} Zeilen` }; // prettier-ignore
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
// (SCHNITT B — die Zug-Stelle einer Wand, die der echt-Job auf der Karte UND die volle Batterie auf swiftshader trug — fiel mit
// w27-swift-raus: die GPU-Klasse fährt nur noch auf der Karte, jede Wand an GENAU einer Stelle, gate:ci-deckung (D) (K) (E).)
// als Shell: `node scripts/lib/ci-klasse.cjs <skript>` (check.yml `voll`)
if (require.main === module) {
    const [f, text, e] = [process.argv[2], ausDatei(process.argv[2]), process.env];
    const b = [];
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
        r6Text(
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
    r6Abhaengig,
    r6Kerne,
    weltTueren,
    istWeltTor,
    LAUFZEIT_RE,
    r6Text,
    r6Immer,
};
