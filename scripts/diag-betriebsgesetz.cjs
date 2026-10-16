#!/usr/bin/env node
"use strict";
// gate:betriebsgesetz — die Maschine zum BETRIEBSGESETZ (CLAUDE.md, 21.07.).
// Der Agenten-Betriebsmodus (früh „fertig" melden · Scope still verkleinern · OFFEN
// umbenennen · nächste Welle erfinden) fällt nicht durch Vorsatz, sondern durch WÄNDE:
//   1) SIEGEL-WORT-WAND: solange docs/PFLICHT-OFFEN.md Einträge trägt, ist ein
//      HEAD-Commit mit fertig/RUND/vollendet/vollzogen/Schluss/SCOPE ZU rot.
//   2) FROZEN-LISTEN-WAND: max 5 Einträge (A–E), wohlgeformt — Scope wächst nie still;
//      dazu die LOGBUCH-WAND (kein „Stand-Stempel:", max 40 Zeilen).
//   3) STAND-WAND: der CLAUDE.md-Stand bleibt ≤ 40 Zeilen (Chronik = git log, Lehre 15).
//   4) ABSENZ-WAND: BETRIEBSGESETZ in CLAUDE.md + Pflicht-Output in champion.md — ein stilles Streichen ist rot.
//   6) WACHSTUMS-WAND + DECKE: scripts/ sinkt nur (PFLICHT-OFFEN D); 7) ZITAT-WAND: kein Doc zitiert ein totes Gate.
// Selbsttest feuert (Lehre 1: die Linse beweist sich selbst, nie Wachsamkeit).
const fs = require("fs");
const path = require("path");
const { execSync, execFileSync } = require("child_process");

const root = path.join(__dirname, "..");

// RUND bewusst case-sensitiv („rund 60 Assets" bleibt legal); die übrigen Siegel sind als ganze Wörter verboten.
const SIEGEL_CI = /\b(fertig|vollendet|vollzogen|schluss)\b|scope\s+zu/i;
const SIEGEL_CS = /\bRUND\b/;

function eintraege(text) {
    return text.split("\n").filter((z) => /^[A-E]\)\s+\S/.test(z));
}

// 2b) LOGBUCH-WAND (V18.492): die Frozen-Liste ist eine LISTE, kein Logbuch (Chronik = git log, Lehre 15).
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
    let ende = zeilen.length;
    for (let i = kopf + 1; i < zeilen.length; i++) {
        if (/^## /.test(zeilen[i])) {
            ende = i;
            break;
        }
    }
    let inhalt = zeilen.slice(kopf + 1, ende);
    while (inhalt.length && inhalt[inhalt.length - 1].trim() === "") inhalt.pop();
    return inhalt.length;
}

function archivBefund(dateien) {
    if (!dateien.length) return [];
    const ordner = [...new Set(dateien.map((d) => d.split("/").slice(0, 3).join("/")))].slice(0, 6);
    return [
        `${dateien.length} verfolgte Dateien, die .gitignore ausschließt (${ordner.join(", ")}) — Rohdaten gehören nicht in den Baum (Lehre 15), \`git rm -r --cached\``,
    ];
}

// 6) WACHSTUMS-WAND (V1 15.10.) + DIE DECKE (PFLICHT-OFFEN D, Schöpfer 16.10.): scripts/ wächst nie — Zeilen und Dateien
//    sinken oder stehen, eine neue Linse zahlt mit gestrichenen; scripts/ + spec/ zusammen höchstens um die Hälfte des
//    Spiel-Wachstums. Gemessen JE ZWEIG (`wachstumsStaende`), nie gegen einen festen Grund (der summierte fremde Zweige),
//    als Netto-Differenz `git diff --numstat --no-renames` (hinzu − weg; `git grep -c ''` hing an der git-Version).
//    `--grund <rev>` / `--kopf <rev>` messen zwischen zwei Ständen, ohne `--kopf` der Arbeitsbaum; kein Grund = ROT.
const PRUEF_PFADE = ["scripts", "spec", ":(exclude)spec/profiband/ratsche-*"]; // Ratschen = Messdaten des Werkzeugs (16.10.)
const SPIEL_PFADE = ["stamm", ":(glob)*.js", "index.html", "worlds", ":(exclude)worlds/**/lib/**"];
function git(args) {
    return execFileSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 1 << 26 });
}
function nettoZeilen(numstat) {
    return numstat
        .split("\n")
        .filter(Boolean)
        .reduce((s, z) => {
            const [hinzu, weg] = z.split("\t");
            return hinzu === "-" ? s : s + Number(hinzu) - Number(weg);
        }, 0);
}
function wachstumZwischen(grund, kopf, pfade) {
    return nettoZeilen(git(["diff", "--numstat", "--no-renames", grund, ...(kopf ? [kopf] : []), "--", ...pfade]));
}
function dateienZwischen(grund, kopf, pfade) {
    const z = git(["diff", "--name-status", "--no-renames", grund, ...(kopf ? [kopf] : []), "--", ...pfade]).split("\n");
    return z.filter((l) => l.startsWith("A\t")).length - z.filter((l) => l.startsWith("D\t")).length;
}
// Die Stände, an denen die Wand misst — je Stand [grund, kopf (null = Arbeitsbaum), Name]. Ein Karten-Zweig misst sich
// ganz ab der Merge-Basis mit origin/integ-probe. integ-probe misst seinen PUSH (WACHSTUM_VORHER = der Kopf vor dem Push,
// sonst der letzte Commit): der Integrator merget eine Karte oder spult integ-probe auf ihren Kopf vor — dann geht der
// erste Eltern-Pfad durch die Karte, und je Commit gemessen träfe ihr „Merge integ-probe in <karte>" die Summe fremder
// Karten. Nie die Summe seit main: eine Karte, die Spiel-Code streicht, machte sonst eine fremde rot. main nimmt nur den
// Vorlauf von integ-probe, dessen jeder Push an dieser Wand stand — main misst nichts zweimal.
function wachstumsStaende(zweig, kopfRev) {
    if (zweig === "main") return [];
    if (zweig === "integ-probe") {
        const vorher = process.env.WACHSTUM_VORHER;
        const grund = vorher && !/^0+$/.test(vorher) ? vorher : "HEAD~1";
        return [[grund, "HEAD", `Push ${grund.slice(0, 8)}..HEAD`]];
    }
    return [[git(["merge-base", "HEAD", "origin/integ-probe"]).trim(), kopfRev, "Merge-Basis mit origin/integ-probe"]];
}
function wachstumBefund(dP, dS, name = "Zweig", dSkript = 0, dDatei = 0) {
    const erlaubt = Math.floor(Math.max(0, dS) / 2);
    return [
        ...(dSkript > 0 || dDatei > 0
            ? [`DECKE (${name}): scripts/ wuchs um ${dSkript} Zeilen / ${dDatei} Dateien — sie sinkt nur (PFLICHT-OFFEN D)`]
            : []),
        ...(dP > erlaubt
            ? [`WACHSTUMS-WAND (${name}): scripts/ + spec/ +${dP} Zeilen bei Spiel ${dS} — erlaubt die Hälfte (${erlaubt})`]
            : []),
    ];
}

// 7) ZITAT-WAND (V1 Prüf-Diät N1, 15.10.): ein Dokument nennt als Beweis nur ein Gate, das package.json trägt. Die Diät
//    strich gate:tier-gang, gate:weltgrenze und gate:nervensystem-porta/-schmiede/-fachwerk, während docs/studio-vertrag.md
//    und docs/taille-spec.md sie weiter als Linse und ε-Beweis nannten (GOLDENE DEFINITION: nie stale Gates als Beweis).
//    Eine Zeile, die das Gate als gefallen benennt (fiel · gefallen), ist Chronik und bleibt legal.
const ZITAT_GATE = /gate:([a-z0-9][a-z0-9-]*[a-z0-9])/g;
const ZITAT_CHRONIK = /\b(fiel|gefallen|gefallene[nmrs]?)\b/i;
function zitatBefund(dokumente, gates) {
    const out = [];
    for (const { pfad, text } of dokumente)
        text.split("\n").forEach((zeile, i) => {
            if (ZITAT_CHRONIK.test(zeile)) return;
            for (const m of zeile.matchAll(ZITAT_GATE))
                if (!gates.has(`gate:${m[1]}`))
                    out.push(`ZITAT-WAND: ${pfad}:${i + 1} nennt gate:${m[1]} — package.json trägt es nicht`);
        });
    return out;
}

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
            const dP = wachstumZwischen(grund, kopf, PRUEF_PFADE);
            const dS = wachstumZwischen(grund, kopf, SPIEL_PFADE);
            const dK = wachstumZwischen(grund, kopf, ["scripts"]);
            const dD = dateienZwischen(grund, kopf, ["scripts"]);
            gemessen.push(`${name}: Prüf ${dP >= 0 ? "+" : ""}${dP} / Spiel ${dS >= 0 ? "+" : ""}${dS} · scripts ${dK} Z. ${dD} Dat.`);
            errs.push(...wachstumBefund(dP, dS, name, dK, dD));
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
    try {
        const gates = new Set(
            Object.keys(JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).scripts)
        );
        const dokumente = git(["ls-files", "CLAUDE.md", "docs", ".claude/agents"])
            .split("\n")
            .filter((p) => p.endsWith(".md"))
            .map((p) => ({ pfad: p, text: fs.readFileSync(path.join(root, p), "utf8") }));
        errs.push(...zitatBefund(dokumente, gates));
    } catch (e) {
        errs.push(`ZITAT-WAND: Dokumente oder package.json nicht lesbar (${String(e.message).split("\n")[0]})`);
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
        headMsg = execSync("git log -1 --format=%B", { cwd: root, encoding: "utf8" });
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
    // ausschließt — am 14.10. lagen 201 Mess-Rohdateien (217 MB) unter artifacts/ im Baum, per `git add -f` aus Übergaben.
    let ignoriertVerfolgt = null;
    try {
        ignoriertVerfolgt = execSync("git ls-files -ci --exclude-standard", { cwd: root, encoding: "utf8" })
            .split("\n")
            .filter(Boolean);
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
    const w1 = wachstumBefund(600, 1000).length; // +600 Prüf gegen +1000 Spiel: muss feuern
    const w2 = wachstumBefund(400, 1000).length; // +400 gegen +1000: darf nicht
    const w3 = wachstumBefund(10, -500).length; // die Welt schrumpft, der Apparat wächst: feuert
    const w4 = wachstumBefund(-100, -300).length; // beide schrumpfen: darf nicht
    // die Zählung ist die Netto-Differenz je Datei; eine Binärdatei trägt keine Zeilen (eine leere Schlusszeile zählt
    // wie jede Zeile — kein Zählen, das an der git-Version hängt)
    const w5 = nettoZeilen("512\t0\tscripts/lib/kronen-linse.cjs\n-\t-\tspec/bild.png\n3\t10\tspec/a.json\n");
    const w6 = [wachstumBefund(-9, 99, "x", 1, 0), wachstumBefund(-9, 99, "x", -5, 1), wachstumBefund(-9, 99, "x", -5, 0)];
    if (!w1 || w2 || !w3 || w4 || w5 !== 505 || w6.map((w) => w.length).join() !== "1,1,0")
        errs.push(`Selbsttest der Wachstums-Wand versagt (w1=${w1} w2=${w2} w3=${w3} w4=${w4} w5=${w5} w6=${w6})`);
    const zG = new Set(["gate:tier-gang"]);
    const z1 = zitatBefund([{ pfad: "v.md", text: "Linse: `gate:weltgrenze` (A–G)" }], zG).length; // muss feuern
    const z2 = zitatBefund([{ pfad: "v.md", text: "der Gang ist `gate:tier-gang`" }], zG).length; // darf nicht
    const z3 = zitatBefund([{ pfad: "v.md", text: "`gate:dritter-spiegel` fiel mit K16" }], zG).length; // Chronik
    const z4 = zitatBefund([{ pfad: "v.md", text: "ε-Beweis, `gate:nervensystem-porta`)." }], zG)[0] || "";
    if (!z1 || z2 || z3 || !z4.includes("v.md:1 nennt gate:nervensystem-porta"))
        errs.push(`Selbsttest der Zitat-Wand versagt (z1=${z1} z2=${z2} z3=${z3} z4=${z4})`);

    if (errs.length) {
        console.error("gate:betriebsgesetz ROT");
        for (const e of errs) console.error("  - " + e);
        process.exit(1);
    }
    console.log(
        `gate:betriebsgesetz GRÜN — Pflicht-OFFEN ${posten.length}/5 · Stand ${sz}/40 Zeilen · ` +
            `Wachstum ${gemessen.join(" · ")} · Siegel-Wand + Logbuch-Wand + Absenz-Wand + Archiv-Wand + ` +
            `Wachstums-Wand + Zitat-Wand stehen · Selbsttest feuert`
    );
}

main();
