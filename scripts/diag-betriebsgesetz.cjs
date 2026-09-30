#!/usr/bin/env node
"use strict";
// gate:betriebsgesetz — die Maschine zum BETRIEBSGESETZ (CLAUDE.md, 21.07.).
// Der Agenten-Betriebsmodus (früh „fertig" melden · Scope still verkleinern · OFFEN
// umbenennen · nächste Welle erfinden) fällt nicht durch Vorsatz, sondern durch WÄNDE:
//   1) SIEGEL-WORT-WAND: solange docs/PFLICHT-OFFEN.md Einträge trägt, ist ein
//      HEAD-Commit mit fertig/RUND/vollendet/vollzogen/Schluss/SCOPE ZU rot.
//   2) FROZEN-LISTEN-WAND: max 5 Einträge (A–E), wohlgeformt — Scope wächst nie still;
//      dazu die LOGBUCH-WAND (kein „Stand-Stempel:", max 40 Zeilen).
//   3) STAND-WAND: der CLAUDE.md-Stand bleibt ≤ 40 Zeilen (Chronik = git log, Lehre 15;
//      die 1300-Zeilen-Wellen-Romane wachsen nie nach).
//   4) ABSENZ-WAND: BETRIEBSGESETZ in CLAUDE.md + Pflicht-Output in champion.md —
//      ein stilles Streichen der Gesetze macht dieses Gate rot, nicht unsichtbar.
// Selbsttest feuert (Lehre 1: die Linse beweist sich selbst, nie Wachsamkeit).
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const root = path.join(__dirname, "..");

// RUND bewusst case-sensitiv (das Siegel-Wort der Berichte) — „rund 60 Assets" in
// einer Message bleibt legal; die übrigen Siegel sind als ganze Wörter verboten.
const SIEGEL_CI = /\b(fertig|vollendet|vollzogen|schluss)\b|scope\s+zu/i;
const SIEGEL_CS = /\bRUND\b/;

function eintraege(text) {
    return text.split("\n").filter((z) => /^[A-E]\)\s+\S/.test(z));
}

// 2b) LOGBUCH-WAND (V18.492): die Frozen-Liste ist eine LISTE, kein Logbuch. Die
//     September-Welle stempelte 446 „Stand-Stempel:"-Zeilen vor die fünf Einträge (je
//     gehobener Lab-Konstante eine Zeile + eine Patch-Version) — die Liste wuchs 13 → 462
//     Zeilen, A–E bewegten sich nicht. Chronik = git log (Lehre 15).
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

function main() {
    const errs = [];

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
    if (!claude.includes("PFLICHT-OFFEN.md"))
        errs.push("CLAUDE.md referenziert docs/PFLICHT-OFFEN.md nicht mehr");
    const champ = fs.readFileSync(path.join(root, ".claude", "agents", "champion.md"), "utf8");
    if (!champ.includes("BETRIEBSGESETZ"))
        errs.push("champion.md trägt das BETRIEBSGESETZ nicht mehr — der Arbeiter läuft ungebunden");
    if (!champ.includes("Pflicht-OFFEN Rest"))
        errs.push("champion.md trägt das Pflicht-Output-Format (Pflicht-OFFEN Rest) nicht mehr");

    // SELBSTTEST: die Wand muss feuern, sonst ist sie Theater.
    const t1 = siegelBefund("welle vollendet, alles RUND", 2); // muss feuern
    const t2 = siegelBefund("betriebsgesetz: siegel-wort-wand steht", 2); // darf nicht feuern
    const t3 = siegelBefund("welle vollendet", 0); // leere Liste: Siegel legal
    const t4 = siegelBefund("bericht: rund 60 assets pro sekunde", 2); // klein „rund" legal
    if (!t1 || t2 || t3 || t4)
        errs.push(`Selbsttest der Siegel-Wort-Wand versagt (t1=${t1} t2=${t2} t3=${t3} t4=${t4})`);
    const l1 = logbuchBefund("> Stand-Stempel: 29.09. · V1.2.3\nA) x").length; // muss feuern
    const l2 = logbuchBefund("# Liste\nA) x — Status: offen").length; // darf nicht feuern
    const l3 = logbuchBefund(Array(LISTE_MAX_ZEILEN + 5).fill("x").join("\n")).length; // muss feuern
    if (!l1 || l2 || !l3) errs.push(`Selbsttest der Logbuch-Wand versagt (l1=${l1} l2=${l2} l3=${l3})`);

    if (errs.length) {
        console.error("gate:betriebsgesetz ROT");
        for (const e of errs) console.error("  - " + e);
        process.exit(1);
    }
    console.log(
        `gate:betriebsgesetz GRÜN — Pflicht-OFFEN ${posten.length}/5 · Stand ${sz}/40 Zeilen · ` +
            `Siegel-Wand + Logbuch-Wand + Absenz-Wand stehen · Selbsttest feuert`
    );
}

main();
