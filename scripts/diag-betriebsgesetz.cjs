#!/usr/bin/env node
"use strict";
const { wandEnde } = require("./lib/welt-boot.cjs");
// gate:betriebsgesetz — die Maschine zum BETRIEBSGESETZ (CLAUDE.md).
// Der Agenten-Betriebsmodus (früh „fertig" melden · Scope still verkleinern · OFFEN
// umbenennen · nächste Welle erfinden) fällt nicht durch Vorsatz, sondern durch WÄNDE:
//   1) SIEGEL-WORT-WAND: solange docs/PFLICHT-OFFEN.md Einträge trägt, ist ein
//      HEAD-Commit mit fertig/RUND/vollendet/vollzogen/Schluss/SCOPE ZU rot.
//   2) FROZEN-LISTEN-WAND: max 5 Einträge (A–E), wohlgeformt — Scope wächst nie still;
//      dazu die LOGBUCH-WAND (kein „Stand-Stempel:", max 40 Zeilen).
//   3) STAND-WAND: der CLAUDE.md-Stand bleibt ≤ 40 Zeilen (Chronik = git log, Lehre 15).
//   4) ABSENZ-WAND: BETRIEBSGESETZ in CLAUDE.md + Pflicht-Output in champion.md — ein stilles Streichen ist rot.
//   6) WACHSTUMS-WAND + DECKE: scripts/ sinkt nur, in Code-Atomen ohne Kommentare (PFLICHT-OFFEN D); 7) ZITAT-WAND: jede .md steht in der Karte, nennt nur Lebendes;
//   8) STRIPPER-WAND: EIN Kommentar-Stripper (scripts/lib/stamm.cjs), EIN __codeOf (scripts/lib/welt-boot.cjs).
// Selbsttest feuert (Lehre 1: die Linse beweist sich selbst, nie Wachsamkeit).
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.join(__dirname, "..");

// RUND bewusst case-sensitiv („rund 60 Assets" bleibt legal); die übrigen Siegel sind als ganze Wörter verboten.
const SIEGEL_CI = /\b(fertig|vollendet|vollzogen|schluss)\b|scope\s+zu/i;
const SIEGEL_CS = /\bRUND\b/;

function eintraege(text) {
    return text.split("\n").filter((z) => /^[A-E]\)\s+\S/.test(z));
}

// 2b) LOGBUCH-WAND: die Frozen-Liste ist eine LISTE, kein Logbuch (Chronik = git log, Lehre 15).
const LISTE_MAX_ZEILEN = 40;
function logbuchBefund(text) {
    const zeilen = text.split("\n");
    const stempel = zeilen.filter((z) => /^>?\s*Stand-Stempel:/.test(z)).length;
    const out = [];
    if (stempel > 0) out.push(`PFLICHT-OFFEN trägt ${stempel} „Stand-Stempel:"-Zeilen — die Chronik ist git log`);
    if (zeilen.length > LISTE_MAX_ZEILEN)
        out.push(`PFLICHT-OFFEN trägt ${zeilen.length} Zeilen (max ${LISTE_MAX_ZEILEN}) — Liste, kein Logbuch`);
    return out;
}

function siegelBefund(commitMsg, eintragZahl) {
    if (!eintragZahl) return null; // leere Liste = SCOPE ZU legal
    const m = commitMsg.match(SIEGEL_CI) || commitMsg.match(SIEGEL_CS);
    return m ? m[0] : null;
}

function standZeilen(claudeText) {
    const zeilen = claudeText.split("\n");
    const kopf = zeilen.findIndex((z) => /^## Stand \(V[0-9.]+/.test(z));
    if (kopf < 0) return -1;
    const ende = zeilen.findIndex((z, i) => i > kopf && /^## /.test(z));
    const inhalt = zeilen.slice(kopf + 1, ende < 0 ? zeilen.length : ende);
    while (inhalt.length && !inhalt[inhalt.length - 1].trim()) inhalt.pop();
    return inhalt.length;
}

function archivBefund(dateien) {
    if (!dateien.length) return [];
    const ordner = [...new Set(dateien.map((d) => d.split("/").slice(0, 3).join("/")))].slice(0, 6);
    return [
        `${dateien.length} verfolgte Dateien, die .gitignore ausschließt (${ordner.join(", ")}) — Rohdaten gehören nicht in den Baum (Lehre 15), \`git rm -r --cached\``,
    ];
}

// 6) WACHSTUMS-WAND + DIE DECKE (PFLICHT-OFFEN D): scripts/ wächst nie — Code und Dateien
//    sinken oder stehen, eine neue Linse zahlt mit gestrichenen; scripts/ + spec/ zusammen höchstens um die Hälfte des
//    Spiel-Wachstums. Gemessen JE ZWEIG (`wachstumsStaende`), nie gegen einen festen Grund (der summierte fremde Zweige):
//    je geänderter Datei die ATOME (Wort oder Satzzeichen) am Kopf − am Grund, Code (.js .cjs .mjs .html .css) ohne
//    Kommentare über den EINEN Stripper (`ohneKommentare`) — ein Kommentar kostet nichts und zahlt nichts (bis 24.10.
//    zählte jede Diff-Zeile: parallele Zweige strichen für ihre Decke dieselben Kommentare und ernteten Konflikte),
//    Pressen zahlt nichts; dazu Dateien neu − weg. Dasselbe Maß gilt der Spiel-Seite (sonst kaufte ein Kommentar im
//    Spiel Prüf-Budget). Beide Texte je Datei liest EIN Diff mit voller Umgebung (`-U` über jede Länge): Umgebung und
//    „-" sind der Grund, Umgebung und „+" der Kopf. `--grund <rev>` / `--kopf <rev>` messen zwischen zwei Ständen, ohne
//    `--kopf` der Arbeitsbaum; kein Grund = ROT.
const PRUEF_PFADE = ["scripts", "spec", ":(exclude)spec/profiband/ratsche-*"]; // Ratschen = Messdaten des Werkzeugs
const SPIEL_PFADE = ["stamm", ":(glob)*.js", "index.html", "worlds", ":(exclude)worlds/**/lib/**"];
const stamm = require("./lib/stamm.cjs");
function git(args) {
    return execFileSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 1 << 28 });
}
const deckeMass = (text) => (text.match(/[\p{L}\p{N}_$]+|[^\s\p{L}\p{N}_$]/gu) || []).length;
const atome = (p, t) => deckeMass(/\.(?:[cm]?js|html|css)$/.test(p) ? stamm.ohneKommentare(t) : t);
// Kopfzeilen (--- / +++) stehen vor dem ersten @@, eine Binärdatei trägt keinen Hunk
function wachstumAusDiff(text, je = new Map(), datei = new Map()) {
    const seiten = new Map();
    let [pfad, hunk] = [null, false];
    for (const z of text.split("\n")) {
        if (z.startsWith("diff --git ")) {
            [pfad, hunk] = [z.slice(13, 13 + (z.length - 16) / 2), false];
            seiten.set(pfad, [[], []]);
        } else if (!hunk && /^(new|deleted) file mode/.test(z)) datei.set(pfad, z[0] === "n" ? 1 : -1);
        else if (z.startsWith("@@")) hunk = true;
        else if (hunk) for (const k of [0, 1]) if (z[0] !== "+-"[k]) seiten.get(pfad)[k].push(z.slice(1));
    }
    for (const [p, [alt, neu]] of seiten) je.set(p, atome(p, neu.join("\n")) - atome(p, alt.join("\n")));
    return { je, datei };
}
const summe = (m, vor = "") => [...m].reduce((s, [p, d]) => (p.startsWith(vor) ? s + d : s), 0);
function wachstumZwischen(grund, kopf, pfade) {
    const args = ["-c", "core.quotePath=false", "diff", "-U9999999", "--no-color", "--no-renames", grund];
    return wachstumAusDiff(git([...args, ...(kopf ? [kopf] : []), "--", ...pfade]));
}
const taeterVon = (je) =>
    [...je]
        .filter(([p, d]) => p.startsWith("scripts/") && d > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([p, d]) => `, ${p} +${d}`)
        .join("");
// Die Stände, an denen die Wand misst — je Stand [grund, kopf (null = Arbeitsbaum), Name]. Ein Karten-Zweig misst sich
// ganz ab der Merge-Basis mit origin/integ-probe. integ-probe misst seinen PUSH (WACHSTUM_VORHER = der Kopf vor dem Push,
// nach einem Force-Push dessen Merge-Basis mit HEAD, sonst der letzte Commit): der Integrator merget eine Karte oder
// spult integ-probe auf ihren Kopf vor — dann geht der erste Eltern-Pfad durch die Karte, und je Commit gemessen träfe ihr „Merge integ-probe in <karte>" die Summe fremder
// Karten. Nie die Summe seit main: eine Karte, die Spiel-Code streicht, machte sonst eine fremde rot. main nimmt nur den
// Vorlauf von integ-probe, dessen jeder Push an dieser Wand stand — main misst nichts zweimal.
function wachstumsStaende(zweig, kopfRev) {
    if (zweig === "main") return [];
    if (zweig === "integ-probe") {
        const vorher = process.env.WACHSTUM_VORHER;
        const grund = vorher && !/^0+$/.test(vorher) ? git(["merge-base", vorher, "HEAD"]).trim() : "HEAD~1";
        return [[grund, "HEAD", `Push ${grund.slice(0, 8)}..HEAD`]];
    }
    return [[git(["merge-base", "HEAD", "origin/integ-probe"]).trim(), kopfRev, "Merge-Basis mit origin/integ-probe"]];
}
function wachstumBefund(dP, dS, name = "Zweig", dSkript = 0, dDatei = 0, taeter = "") {
    const erlaubt = Math.floor(Math.max(0, dS) / 2);
    return [
        ...(dSkript > 0 || dDatei > 0
            ? [
                  `DECKE (${name}): scripts/ wuchs um ${dSkript} Atome / ${dDatei} Dateien${taeter} — sie sinkt nur, Kommentare und Pressen zahlen nichts`,
              ]
            : []),
        ...(dP > erlaubt
            ? [
                  `WACHSTUMS-WAND (${name}): scripts/ + spec/ +${dP} Atome bei Spiel ${dS} — erlaubt die Hälfte (${erlaubt})`,
              ]
            : []),
    ];
}

// 7) ZITAT-WAND (V1 Prüf-Diät N1): ein Dokument nennt nur, was der Baum trägt, und die
//    EINE Karte docs/README.md nennt jedes Dokument. Die Diät strich gate:tier-gang und gate:weltgrenze, während
//    docs/studio-vertrag.md sie weiter als Beweis nannte; die Wurzel-README schickte nach dem Stamm-Schnitt zur
//    toten Monolith-Datei. ROT je Fund beim Namen: a) ein gate:<name>, das package.json nicht trägt · b) ein Pfad, den kein
//    verfolgter Pfad trägt (ab Wurzel oder Ordner des Dokuments; ein nackter Datei-Name über irgendeinen Ordner; eine von
//    .gitignore gedeckte Laufzeit-Datei zählt) · c) ein `_name`, den kein Code trägt · d) eine .md, die die Karte nicht
//    nennt · e) ein Code-Kommentar, der auf eine .md zeigt, die es nicht gibt, oder den Monolithen außerhalb seiner Wache
//    nennt (das Literal als Lese-Ziel wacht gate:altlasten, Stamm-Leser-Wand). Ein SATZ, der das Genannte als gefallen
//    benennt (fiel · gefallen · tot), ist Chronik und bleibt legal — im Code die Zeile.
const ZITAT_GATE = /gate:([a-z0-9][a-z0-9-]*[a-z0-9])/g;
const ZITAT_CHRONIK = /\b(fiel|fielen|gefallen|gefallene[nmrs]?|tot|tote[nmrs]?)\b/i;
const ZITAT_PFAD = /(?<![\w.:/@-])((?:\.github|\.claude|[a-z][\w-]*)\/[\w./-]*)/g;
const ZITAT_DATEI = /(?<![\w.:/@-])([A-Za-z][\w.-]*\.(?:js|cjs|mjs|md|html))(?![\w/-])/g;
const ZITAT_NAME = /(?<![\w$])(_{1,2}[A-Za-z][\w$]{2,})/g;
const ZITAT_DIAG = /(?<![\w./-])(diag-[a-z0-9][a-z0-9-]*[a-z0-9])(?![\w.-])/g;
const ZITAT_PLATZHALTER = /^(?!\*\*)[[<*{…$]/; // `**_name**` ist Fettdruck, kein Platzhalter
const ZITAT_DATEI_ENDUNG = /\.(?:js|cjs|mjs|md|html|json)$/;
const ZITAT_ZWEIG = /Zweig `[\w-]+`/;
const ZITAT_FREMD = new Set(["Three.js", "Node.js"]);
const ZITAT_BLOCK = /^\s*(?:$|#|\||[-*+] |\d+\. |```)/;
const ZITAT_SATZ = /[.;!?](?=\s)|\s·\s/g;
const ZITAT_MD_IM_CODE = /(?<![\w./-])((?:[\w.-]+\/)*[\w.-]+\.md)(?![\w/-])/g;
// Die Wache des Monolithen-Namens: die EINE Lese-Schnittstelle (`ALT`), die Absenz-Wand und diese Linse.
const MONOLITH_WACHE = ["scripts/lib/stamm.cjs", "scripts/diag-altlasten.cjs", "scripts/diag-betriebsgesetz.cjs"];
// Ein Dokument in Blöcke (Absatz, Listen- und Tabellen-Zeile, Überschrift): je Block der Text, die Zeilen-Anfänge und die
// Satz-Grenzen — der Fund fragt seinen Satz, nicht seine Zeile (ein Absatz bricht den Satz über Zeilen).
function zitatBloecke(text) {
    const zeilen = text.split("\n");
    const bloecke = [];
    zeilen.forEach((zeile, i) => {
        const neu = !bloecke.length || ZITAT_BLOCK.test(zeile) || /^\s*(?:$|#|\||```)/.test(zeilen[i - 1]);
        if (neu) bloecke.push({ text: zeile, anfang: [0], erste: i });
        else {
            const b = bloecke[bloecke.length - 1];
            b.anfang.push(b.text.length + 1);
            b.text += "\n" + zeile;
        }
    });
    for (const b of bloecke)
        b.grenzen = [0, ...[...b.text.matchAll(ZITAT_SATZ)].map((m) => m.index + 1), b.text.length];
    return bloecke;
}
function zitatBefund(dokumente, welt) {
    const out = [];
    const da = (p) => welt.pfade.has(p.replace(/\/+$/, ""));
    for (const { pfad, text } of dokumente) {
        const ordner = path.posix.dirname(pfad);
        if (welt.karte != null && !welt.karte.includes("`" + pfad + "`"))
            out.push(`ZITAT-WAND: ${pfad} fehlt in der EINEN Karte docs/README.md`);
        for (const b of zitatBloecke(text)) {
            const ort = (i) => `${pfad}:${b.erste + b.anfang.filter((a) => a <= i).length}`;
            const satz = (i) => {
                const k = b.grenzen.findIndex((g) => g > i);
                return b.text.slice(b.grenzen[k - 1], b.grenzen[k]);
            };
            const chronik = (i) => ZITAT_CHRONIK.test(satz(i));
            const danach = (m) => b.text.slice(m.index + m[0].length);
            for (const m of b.text.matchAll(ZITAT_GATE))
                if (!welt.gates.has(`gate:${m[1]}`) && !chronik(m.index))
                    out.push(`ZITAT-WAND: ${ort(m.index)} nennt gate:${m[1]} — package.json trägt es nicht`);
            for (const m of b.text.matchAll(ZITAT_PFAD)) {
                const p = m[1].replace(/[.]+$/, "");
                const kopf = p.split("/")[0];
                const wurzel = welt.pfade.has(kopf);
                const nah = welt.pfade.has(path.posix.join(ordner, kopf));
                // Einheit km/h und Platzhalter schweigen; eine DATEI unter fremder Wurzel (archiv/x.md) nicht — es sei denn,
                // ihr Satz nennt den Zweig, der sie trägt (Aufträge und Berichte leben im Zweig `koordination`)
                const lose = !ZITAT_DATEI_ENDUNG.test(p) || welt.namen.has(path.posix.basename(p));
                if ((!wurzel && !nah && (lose || ZITAT_ZWEIG.test(satz(m.index)))) || ZITAT_PLATZHALTER.test(danach(m)))
                    continue;
                if ((wurzel && da(p)) || (nah && da(path.posix.join(ordner, p))) || welt.ignoriert(p)) continue;
                if (!chronik(m.index))
                    out.push(`ZITAT-WAND: ${ort(m.index)} nennt den Pfad ${p} — der Baum trägt ihn nicht`);
            }
            for (const m of b.text.matchAll(ZITAT_DATEI)) {
                const d = m[1];
                if (welt.namen.has(d) || ZITAT_FREMD.has(d) || ZITAT_PLATZHALTER.test(danach(m)) || welt.ignoriert(d))
                    continue;
                if (!chronik(m.index))
                    out.push(`ZITAT-WAND: ${ort(m.index)} nennt die Datei ${d} — keine verfolgte Datei heißt so`);
            }
            for (const m of b.text.matchAll(ZITAT_DIAG))
                if (!welt.namen.has(m[1] + ".cjs") && !chronik(m.index))
                    out.push(`ZITAT-WAND: ${ort(m.index)} nennt ${m[1]} — scripts/ trägt kein ${m[1]}.cjs`);
            for (const m of b.text.matchAll(ZITAT_NAME))
                if (!welt.kennung.has(m[1]) && !ZITAT_PLATZHALTER.test(danach(m)) && !chronik(m.index))
                    out.push(`ZITAT-WAND: ${ort(m.index)} nennt \`${m[1]}\` — kein Code trägt den Namen`);
        }
    }
    for (const { pfad, text } of welt.code || [])
        text.split("\n").forEach((zeile, i) => {
            // nur der Kommentar spricht über die Doku; ein Literal ist ein Lese-Ziel (Absenz-Proben fragen Gefallene)
            const k = zeile.trimStart().startsWith("*") ? 0 : zeile.search(/\/[/*]/);
            if (k < 0 || ZITAT_CHRONIK.test(zeile)) return;
            const kommentar = zeile.slice(k);
            for (const m of kommentar.matchAll(ZITAT_MD_IM_CODE)) {
                const p = m[1];
                const lebt = p.includes("/") ? da(p) : welt.namen.has(p);
                if (!lebt && !welt.ignoriert(p))
                    out.push(`ZITAT-WAND: ${pfad}:${i + 1} verweist auf ${p} — die Doku gibt es nicht`);
            }
            if (welt.monolith && kommentar.includes(welt.monolith) && !MONOLITH_WACHE.includes(pfad))
                out.push(`ZITAT-WAND: ${pfad}:${i + 1} nennt ${welt.monolith} — der Stamm lebt in stamm/ (Lehre 12)`);
        });
    return out;
}
// Die Welt der Linse aus dem Index: verfolgte Pfade samt Ordnern, Dateinamen, Code-Kennungen, Karte, Code-Texte.
function zitatWelt(dateien, lies, gates, ignoriert, monolith) {
    const pfade = new Set();
    const namen = new Set();
    for (const f of dateien) {
        namen.add(path.posix.basename(f));
        for (let p = f; p && p !== "."; p = path.posix.dirname(p)) pfade.add(p);
    }
    const kennung = new Set();
    const code = [];
    for (const f of dateien) {
        if (!/\.(?:c?js|mjs|html|json|yml|sh|bat|css)$/.test(f) || /(?:^|\/)lib\/three|\.min\.js$/.test(f)) continue;
        const text = lies(f);
        if (f !== "scripts/diag-betriebsgesetz.cjs") code.push({ pfad: f, text }); // sie trägt ihre Täter als Selbsttest
        if (f === "scripts/diag-altlasten.cjs" || f === "scripts/diag-betriebsgesetz.cjs") continue; // Absenz-Listen
        for (const m of text.matchAll(/[A-Za-z_$][\w$]*/g)) kennung.add(m[0]);
    }
    const karte = dateien.includes("docs/README.md") ? lies("docs/README.md") : "";
    return { gates, pfade, namen, kennung, karte, code, ignoriert, monolith };
}

// 8) STRIPPER-WAND (PFLICHT-OFFEN D3): es gibt EINEN Kommentar-Stripper (`ohneKommentare` in
//    scripts/lib/stamm.cjs) und EIN `__codeOf` (scripts/lib/welt-boot.cjs trägt es in jede Seite). Bis D3a lebten 171
//    Stripper-Stellen in 65 Dateien mit verschiedener Semantik — dieselbe Quelle wurde je Linse anders bereinigt. Ein
//    Kommentar-Regex in einem replace, ein Zeichen-Automat auf Schrägstrich-Paare oder ein eigener __codeOf-Einbau
//    außerhalb seines Heims ist ROT beim Namen; die Tafel des EINEN (echte Stamm-Zeilen, der Stamm gegen acorn) fährt mit.
const STRIPPER_MUSTER = [
    ["Block-Kommentar-Regex", /\\\/\\\*\[(?:\\s\\S|\^)\]\*\??\\\*\\\//, "scripts/lib/stamm.cjs"],
    [
        "Zeilen-Kommentar-Regex",
        /\.replace\(\s*\/(?:\((?:\?:)?\^\|\[\^[^\]]*\]\))?\\\/\\\/(?:\.\*|\[\^\\n\]\*)/,
        "scripts/lib/stamm.cjs",
    ],
    ["Zeichen-Automat", /===\s*(["'])\/\1\s*&&\s*[\w$.[\]+ ]+?\s*===\s*(["'])[/*]\2/, "scripts/lib/stamm.cjs"],
    ["__codeOf-Einbau", /window\.__codeOf\s*=(?!=)/, "scripts/lib/welt-boot.cjs"],
];
function stripperBefund(dateien) {
    const out = [];
    for (const { pfad, text } of dateien)
        text.split("\n").forEach((z, i) => {
            for (const [art, rx, heim] of STRIPPER_MUSTER)
                if (pfad !== heim && rx.test(z))
                    out.push(`STRIPPER-WAND: ${pfad}:${i + 1} trägt einen eigenen ${art} — der EINE lebt in ${heim}`);
        });
    return out;
}

// 6b) DIE DECKE JE DATEI: keine Datei in scripts/ trägt über 4 000 Zeilen — der Richter
//     lebt nach Domäne (scripts/playtest/<domaene>.cjs, `stamm-umzug --richter`), eine Linse teilt am selben Tag; ROT beim Namen.
const DATEI_DECKE = 4000;
const dateiDeckeBefund = (dateien) =>
    dateien
        .map(({ pfad, text }) => [pfad, (text.match(/\n/g) || []).length])
        .filter(([, n]) => n > DATEI_DECKE)
        .map(([pfad, n]) => `DECKE (Datei): ${pfad} trägt ${n} Zeilen — höchstens ${DATEI_DECKE} (PFLICHT-OFFEN D)`);

function main() {
    const errs = [];
    const argRev = (n) => (process.argv.indexOf(n) > 0 ? process.argv[process.argv.indexOf(n) + 1] : null);
    const kopfRev = argRev("--kopf");
    const grundRev = argRev("--grund");
    const gemessen = [];
    try {
        const zweig = process.env.GITHUB_REF_NAME || git(["rev-parse", "--abbrev-ref", "HEAD"]).trim();
        const staende = grundRev ? [[grundRev, kopfRev, "--grund"]] : wachstumsStaende(zweig, kopfRev);
        for (const [grund, kopf, name] of staende) {
            const { je, datei } = wachstumZwischen(grund, kopf, PRUEF_PFADE);
            const [dP, dS] = [summe(je), summe(wachstumZwischen(grund, kopf, SPIEL_PFADE).je)];
            const [dK, dD] = [summe(je, "scripts/"), summe(datei, "scripts/")];
            gemessen.push(
                `${name}: Prüf ${dP >= 0 ? "+" : ""}${dP} / Spiel ${dS >= 0 ? "+" : ""}${dS} Atome · scripts ${dK} Atome ${dD} Dat.`
            );
            errs.push(...wachstumBefund(dP, dS, name, dK, dD, taeterVon(je)));
        }
        if (!staende.length)
            gemessen.push(`${zweig}: misst nichts zweimal (jeder Merge stand auf integ-probe an der Wand)`);
    } catch (e) {
        errs.push(
            `WACHSTUMS-WAND: der Grund des Zweigs ist nicht auflösbar (${String(e.message).split("\n")[0]}) — ` +
                `die Wand braucht die Geschichte (CI: fetch-depth 0)`
        );
    }

    // 7) ZITAT-WAND
    let dokuZeile = "nicht gelesen";
    try {
        const gates = new Set(
            Object.keys(JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).scripts)
        );
        // die Welt ist der Index (wie in der CI), nie der lokale Rest unverfolgter Dateien
        const dateien = [...new Set(git(["ls-files", "--cached"]).split("\n"))].filter(
            (p) => p && fs.existsSync(path.join(root, p))
        );
        const lies = (p) => fs.readFileSync(path.join(root, p), "utf8");
        const gemerkt = new Map();
        const ignoriert = (p) => {
            if (!gemerkt.has(p))
                try {
                    git(["check-ignore", "-q", "--no-index", p]);
                    gemerkt.set(p, true);
                } catch {
                    gemerkt.set(p, false);
                }
            return gemerkt.get(p);
        };
        const welt = zitatWelt(dateien, lies, gates, ignoriert, stamm.ALT);
        // fremd ist in vendor/, was seine Karte nicht „eigen" nennt (vendor/README.md); das Eigene spricht wie jeder Code
        const eigen = new Set(
            [...lies("vendor/README.md").matchAll(/^\| `([^`]+)` +\| eigen /gm)].map((m) => "vendor/" + m[1])
        );
        welt.code = welt.code.filter((d) => !d.pfad.startsWith("vendor/") || eigen.has(d.pfad));
        const dokumente = dateien.filter((p) => p.endsWith(".md")).map((p) => ({ pfad: p, text: lies(p) }));
        const befund = zitatBefund(dokumente, welt);
        errs.push(...befund);
        const genannt = dokumente.filter((d) => welt.karte.includes("`" + d.pfad + "`")).length;
        dokuZeile = `Karte ${genannt}/${dokumente.length} .md, ${befund.length} tote Aussagen`;
    } catch (e) {
        errs.push(`ZITAT-WAND: Dokumente oder package.json nicht lesbar (${String(e.message).split("\n")[0]})`);
    }

    // 8) STRIPPER-WAND über jede Skript-Datei + die Tafel des EINEN
    let stripperDateien = 0;
    try {
        const alle = git(["ls-files", "scripts"])
            .split("\n")
            .filter(Boolean)
            .map((p) => ({ pfad: p, text: fs.readFileSync(path.join(root, p), "utf8") }));
        const dateien = alle.filter((d) => /\.(c|m)?js$/.test(d.pfad));
        stripperDateien = dateien.length;
        errs.push(...stripperBefund(dateien), ...dateiDeckeBefund(alle));
        errs.push(...stamm.stripperTafel(root).map((b) => `STRIPPER-WAND (Tafel): ${b}`));
    } catch (e) {
        errs.push(`STRIPPER-WAND: scripts/ oder die Tafel nicht lesbar (${String(e.message).split("\n")[0]})`);
    }

    // 2) FROZEN-LISTEN-WAND
    const listePfad = path.join(root, "docs", "PFLICHT-OFFEN.md");
    let liste = null;
    try {
        liste = fs.readFileSync(listePfad, "utf8");
    } catch {
        errs.push("docs/PFLICHT-OFFEN.md fehlt — die Frozen-Liste ist das EINZIGE Offen-Dokument");
    }
    const posten = liste ? eintraege(liste) : [];
    if (liste && posten.length > 5)
        errs.push(`PFLICHT-OFFEN trägt ${posten.length} Einträge (max 5) — Scope wächst still`);
    if (liste) errs.push(...logbuchBefund(liste));

    // 1) SIEGEL-WORT-WAND am HEAD-Commit
    let headMsg = null;
    try {
        headMsg = git(["log", "-1", "--format=%B"]);
    } catch {
        // kein git (Tarball/CI-Sonderfall): die Wand kann den HEAD nicht lesen — ehrlich melden,
        // nie stumm grün an dieser Teilprüfung vorbei (fail-soft wäre der Bruch).
        errs.push("git log -1 nicht lesbar — die Siegel-Wort-Wand braucht den HEAD-Commit");
    }
    if (headMsg !== null) {
        const befund = siegelBefund(headMsg, posten.length);
        if (befund)
            errs.push(
                `HEAD-Commit trägt Siegel-Wort "${befund.trim()}" bei ${posten.length} Pflicht-OFFEN-Einträgen — ` +
                    `„fertig" ist illegal bis die Frozen-Liste leer ist (BETRIEBSGESETZ #1)`
            );
    }

    // 3) STAND-WAND + 4) ABSENZ-WAND
    const claude = fs.readFileSync(path.join(root, "CLAUDE.md"), "utf8");
    const sz = standZeilen(claude);
    if (sz < 0) errs.push("CLAUDE.md Stand-Kopf nicht gefunden (## Stand (V…)");
    else if (sz > 40)
        errs.push(`CLAUDE.md Stand trägt ${sz} Zeilen (max 40) — Chronik gehört in git log, nicht in den Stand`);
    if (!claude.includes("## DAS BETRIEBSGESETZ"))
        errs.push("CLAUDE.md trägt kein BETRIEBSGESETZ mehr — stilles Streichen der Gesetze");
    if (!claude.includes("PFLICHT-OFFEN.md")) errs.push("CLAUDE.md referenziert docs/PFLICHT-OFFEN.md nicht mehr");
    const champ = fs.readFileSync(path.join(root, ".claude", "agents", "champion.md"), "utf8");
    if (!champ.includes("BETRIEBSGESETZ"))
        errs.push("champion.md trägt das BETRIEBSGESETZ nicht mehr — der Arbeiter läuft ungebunden");
    if (!champ.includes("Pflicht-OFFEN Rest"))
        errs.push("champion.md trägt das Pflicht-Output-Format (Pflicht-OFFEN Rest) nicht mehr");

    // 5) ARCHIV-WAND (Lehre 15: git ist das Archiv, kein Doppel-Archiv im Baum): keine verfolgte Datei, die .gitignore
    // ausschließt.
    let ignoriertVerfolgt = null;
    try {
        ignoriertVerfolgt = git(["ls-files", "-ci", "--exclude-standard"]).split("\n").filter(Boolean);
    } catch {
        errs.push("git ls-files nicht lesbar — die Archiv-Wand braucht den Index");
    }
    if (ignoriertVerfolgt) errs.push(...archivBefund(ignoriertVerfolgt));

    // SELBSTTEST: die Wand muss feuern, sonst ist sie Theater.
    if (!archivBefund(["artifacts/profiband/x/bild.png"]).length || archivBefund([]).length)
        errs.push("Selbsttest der Archiv-Wand versagt");
    const t1 = siegelBefund("welle vollendet, alles RUND", 2); // muss feuern
    const t2 = siegelBefund("betriebsgesetz: siegel-wort-wand steht", 2); // darf nicht feuern
    const t3 = siegelBefund("welle vollendet", 0); // leere Liste: Siegel legal
    const t4 = siegelBefund("bericht: rund 60 assets pro sekunde", 2); // klein „rund" legal
    if (!t1 || t2 || t3 || t4)
        errs.push(`Selbsttest der Siegel-Wort-Wand versagt (t1=${t1} t2=${t2} t3=${t3} t4=${t4})`);
    const l1 = logbuchBefund("> Stand-Stempel: 29.09. · V1.2.3\nA) x").length; // muss feuern
    const l2 = logbuchBefund("# Liste\nA) x — Status: offen").length; // darf nicht feuern
    const l3 = logbuchBefund(
        Array(LISTE_MAX_ZEILEN + 5)
            .fill("x")
            .join("\n")
    ).length; // muss feuern
    if (!l1 || l2 || !l3) errs.push(`Selbsttest der Logbuch-Wand versagt (l1=${l1} l2=${l2} l3=${l3})`);
    // die Wachstums-Wand je Fall: die Zahl der Befunde; die Decke an einem Diff mit voller Umgebung: die Summe der
    // Code-Atome, „rot" = ROT beim Namen der Datei
    const fall = (hunk, m = "") => {
        const w = wachstumAusDiff(`diff --git a/scripts/x.cjs b/scripts/x.cjs\n${m}@@\n${hunk}`);
        const rot = wachstumBefund(-9, 99, "x", summe(w.je), summe(w.datei), taeterVon(w.je));
        return summe(w.je) + (String(rot).includes("x.cjs +") ? " rot" : "");
    };
    const wand = [
        wachstumBefund(600, 1000).length, // +600 Prüf gegen +1000 Spiel: feuert
        wachstumBefund(400, 1000).length, // +400 gegen +1000: schweigt
        wachstumBefund(10, -500).length, // die Welt schrumpft, der Apparat wächst: feuert
        wachstumBefund(-100, -300).length, // beide schrumpfen: schweigt
        wachstumBefund(-9, 99, "x", -5, 1).length, // eine neue Datei mit weniger Atomen: feuert
        fall("+// x\n a;\n-b;\n+b; /* y\n+ */"), // (a) nur Kommentare dazu: 0
        fall("-// x\n a;"), // (b) nur Kommentare weg: 0, zahlt nichts
        fall("-a;\n+!a;"), // (c) ein Code-Atom mehr: ROT beim Namen
        fall("-a;\n-b;\n+a; b;"), // (d) Pressen zweier Zeilen zu einer: 0
        fall("+a;\n+b;", "new file mode\n"), // eine neue Datei zählt ganz und als Datei
        fall("-a;\n-b;", "deleted file mode\n"), // eine gestrichene zahlt ganz
    ].join(" · ");
    if (wand !== "1 · 0 · 1 · 0 · 1 · 0 · 0 · 1 rot · 0 · 4 rot · -4")
        errs.push(`Selbsttest der Wachstums-Wand versagt (${wand})`);
    // die Zitat-Wand: je Regel genau ein Täter beim Namen; die Chronik-Zeile, der Platzhalter und die Einheit schweigen
    const zTexte = {
        "docs/README.md": "| `docs/README.md` | `docs/a.md` |",
        "stamm/01.js": "this._lebt(); // Norm: docs/weg.md",
        "scripts/x.cjs": "// Spiegel aus anazhRealm.js",
    };
    const zWelt = zitatWelt(
        Object.keys(zTexte),
        (p) => zTexte[p],
        new Set(["gate:tier-gang"]),
        () => false,
        stamm.ALT
    );
    const zDoku = [
        "- Linse: `gate:weltgrenze` (A–G)",
        "- der Gang ist `gate:tier-gang`, Ort `stamm/01.js`, Leser `_lebt`",
        "- `gate:dritter-spiegel` fiel mit K16, mit ihm `_weg` und",
        "  `docs/weg.md`. Die Karte: `docs/weg.md`",
        "- der Stamm (`anazhRealm.js`, eine Klasse)",
        "- ruft `_tot()` und diag-genom",
        "- `stamm/NN[x].js` bei 30 km/h",
        "- **_fett** liegt in `archiv/x.md`",
        "- der Bericht (Zweig `koordination` `bericht/x.md`)",
    ].join("\n");
    const zIst = zitatBefund(
        [
            { pfad: "docs/a.md", text: zDoku },
            { pfad: "docs/b.md", text: "x" },
        ],
        zWelt
    );
    const zSoll = [
        "docs/a.md:1 nennt gate:weltgrenze",
        "docs/a.md:4 nennt den Pfad docs/weg.md",
        "docs/a.md:5 nennt die Datei anazhRealm.js",
        "docs/a.md:6 nennt `_tot`",
        "docs/a.md:6 nennt diag-genom",
        "docs/a.md:8 nennt `_fett`",
        "docs/a.md:8 nennt den Pfad archiv/x.md",
        "docs/b.md fehlt in der EINEN Karte",
        "stamm/01.js:1 verweist auf docs/weg.md",
        "scripts/x.cjs:1 nennt anazhRealm.js",
    ];
    if (zIst.length !== zSoll.length || zSoll.some((s) => !zIst.some((z) => z.includes(s))))
        errs.push(`Selbsttest der Zitat-Wand versagt (${zIst.length} statt ${zSoll.length}: ${zIst.join(" | ")})`);
    // die Fälle der Stripper-Wand, aus Stücken gebaut (die Wand liest auch diese Datei): ein Rückstrich S
    const S = "\\";
    const sF = (pfad, text) => stripperBefund([{ pfad, text }]).length;
    const zeileRx = "q.replace(/" + S + "/" + S + '/.*$/gm, "");';
    const s1 = sF(
        "scripts/x.cjs",
        "q.replace(/" + S + "/" + S + "*[" + S + "s" + S + "S]*?" + S + "*" + S + '//g, "");'
    ); // feuert
    const s2 = sF("scripts/x.cjs", zeileRx); // feuert
    const s3 = sF("scripts/x.cjs", "if (c === " + '"/"' + " && d === " + '"*"' + ") {"); // feuert
    const s4 = sF("scripts/x.cjs", "window." + "__codeOf = (f) => String(f);"); // feuert
    const s5 = sF("scripts/lib/stamm.cjs", zeileRx) + sF("scripts/lib/welt-boot.cjs", "window." + "__codeOf = oK;"); // im Heim frei
    const s6 = sF("scripts/x.cjs", "u.replace(/^https?:" + S + "/" + S + '//, ""); const { ohneKommentare } = L;'); // frei
    if (s1 !== 1 || s2 !== 1 || s3 !== 1 || s4 !== 1 || s5 || s6)
        errs.push(`Selbsttest der Stripper-Wand versagt (s1=${s1} s2=${s2} s3=${s3} s4=${s4} s5=${s5} s6=${s6})`);
    // die Decke je Datei: eine gepflanzte 4 001-Zeilen-Datei ist ROT beim Namen, 4 000 Zeilen halten
    const d1 = dateiDeckeBefund([{ pfad: "scripts/x.cjs", text: "x\n".repeat(4001) }]);
    const d2 = dateiDeckeBefund([{ pfad: "scripts/y.cjs", text: "y\n".repeat(4000) }]).length;
    if (d1.length !== 1 || !d1[0].includes("scripts/x.cjs trägt 4001") || d2)
        errs.push(`Selbsttest der Datei-Decke versagt (d1=${d1.length} d2=${d2})`);

    wandEnde(
        errs,
        `gate:betriebsgesetz — Pflicht-OFFEN ${posten.length}/5 · Stand ${sz}/40 Zeilen · ` +
            `Wachstum ${gemessen.join(" · ")} · Siegel-Wand + Logbuch-Wand + Absenz-Wand + Archiv-Wand + ` +
            `Wachstums-Wand + Zitat-Wand + Stripper-Wand (${stripperDateien} Skripte, EIN Stripper, Tafel) stehen (Doku: ${dokuZeile}) · Selbsttest feuert`
    );
}

main();
