#!/usr/bin/env node
"use strict";
const { wandEnde, argOpt, ausDatei, path, fs, jsonLesen, ROOT: root } = require("./lib/welt-boot.cjs");
// gate:betriebsgesetz — die Maschine zum BETRIEBSGESETZ (CLAUDE.md).
// Der Agenten-Betriebsmodus (früh „fertig" melden · Scope still verkleinern · OFFEN
// umbenennen · nächste Welle erfinden) fällt nicht durch Vorsatz, sondern durch WÄNDE:
//   1) SIEGEL-WORT-WAND: solange die Meisterkarte 2 nicht ganz gebucht ist (1 718 von 1 718, der Stand im Zweig
//      punkte-maschine), ist ein HEAD-Commit mit fertig/RUND/vollendet/vollzogen/Schluss/SCOPE ZU rot; ein unlesbarer Stand
//      zählt als offen (die Wand wird nie still grün).
//   2) SCOPE-WAND (Schöpfer 19.11.: „Löse endlich die altlasten, entweder sie sind in den sprossen integriert oder du
//      lässt es"): der EINZIGE Scope ist die Karte 2 — eine zurückgekehrte eigene Offen-Liste (`LISTE_ALT`, die
//      gefallene Frozen-Liste) oder eine Bericht-Vorlage mit der Zeile „Pflicht-… Rest" ist ROT beim Namen.
//   3) STAND-WAND: der CLAUDE.md-Stand bleibt ≤ 40 Zeilen (Chronik = git log, Lehre 15).
//   4) ABSENZ-WAND: BETRIEBSGESETZ + Karte 2 in CLAUDE.md, die Schluss-Zeile „Karte 2: …" in champion.md — ein stilles
//      Streichen ist rot.
//   6) WACHSTUMS-WAND: scripts/ + spec/ wachsen höchstens um das Spiel + EIN Linsen-Maß, in Code-Atomen ohne Kommentare — sie
//      urteilt am ZUG (er trägt sich selbst, dazu der Überschuss der Woche), jeder andere Zweig druckt seinen Stand; 6b) DATEI-DECKE 6 000 Zeilen je Skript;
//   7) ZITAT-WAND: jede .md steht in der Karte, nennt nur Lebendes;
//   8) STRIPPER-WAND: EIN Kommentar-Stripper (scripts/lib/stamm.cjs), EIN __codeOf (scripts/lib/welt-boot.cjs).
// Selbsttest feuert (Lehre 1: die Linse beweist sich selbst, nie Wachsamkeit).

// RUND bewusst case-sensitiv („rund 60 Assets" bleibt legal); die übrigen Siegel sind als ganze Wörter verboten.
const SIEGEL_CI = /\b(fertig|vollendet|vollzogen|schluss)\b|scope\s+zu/i;
const SIEGEL_CS = /\bRUND\b/;

// Die Karte 2: ihr Umfang und ihr Stand (`heute` = gebuchte Sprossen) im Zweig punkte-maschine.
const KARTE_SPROSSEN = 1718;
const KARTE_STAND = "origin/punkte-maschine:vision/karte-2-stand.json";
// offen = die ungebuchten Sprossen; null (Stand unlesbar) zählt als offen
function siegelBefund(commitMsg, offen) {
    if (offen === 0) return null; // die ganze Karte gebucht = SCOPE ZU legal
    const m = commitMsg.match(SIEGEL_CI) || commitMsg.match(SIEGEL_CS);
    return m ? m[0] : null;
}

// 2) SCOPE-WAND: die gefallene Liste kehrt nicht zurück, keine Vorlage druckt ihre Rest-Zeile. Die Muster stehen aus
//    Stücken, ebenso ihre Mutanten im Selbsttest — so liest die Wand auch diese Datei.
const LISTE_ALT = "docs/" + "PFLICHT" + "-OFFEN.md";
const REST_ZEILE = new RegExp("Pflicht" + "-OFFEN\\s+Rest", "i");
const VORLAGEN_PFADE = /^(?:\.claude\/|docs\/|scripts\/|CLAUDE\.md$|README\.md$)/;
function scopeBefund(dateien, listeDa) {
    const out = [];
    if (listeDa)
        out.push(`SCOPE-WAND: ${LISTE_ALT} ist zurück — der EINZIGE Scope ist die Meisterkarte 2 (BETRIEBSGESETZ #2), keine eigene Offen-Liste`);
    for (const { pfad, text } of dateien)
        text.split("\n").forEach((z, i) => {
            if (REST_ZEILE.test(z))
                out.push(`SCOPE-WAND: ${pfad}:${i + 1} trägt die Bericht-Zeile der gefallenen Liste — der Bericht nennt „Karte 2: <gebucht> von 1 718"`);
        });
    return out;
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

// 6) WACHSTUMS-WAND: scripts/ + spec/ wachsen zusammen höchstens um das Spiel-Wachstum + EIN Linsen-Maß. Sie URTEILT am
//    ZUG, am Push von integ-probe: er trägt sich selbst, dazu der Überschuss der WOCHE (`wachstumsStaende`; `--grund tag`
//    misst dasselbe vor dem Zug, `--grund <rev>` ein beliebiges Fenster); jeder andere Zweig druckt
//    seinen Stand (Prüf / Spiel / erlaubt) ohne ROT: ein Linsen-Commit vor seinem Spiel-Commit oder ein reiner Linsen-Zweig
//    ist kein Befund, die Summe im Zug ist es. Die Decke „scripts/ sinkt nur" (+0 je Stand) fiel am 09.11.: main 02.11. →
//    09.11. maß Prüf −2 936 bei Spiel +234 451 (erlaubt +117 225), und 01.–07.11. standen 44 ROT an ihr, 0 echt — sie
//    kaufte Atome statt Linsen (Gebot 10). Gemessen JE STAND (`wachstumsStaende`), nie gegen einen festen Grund (der
//    summierte fremde Zweige): je geänderter Datei die ATOME (Wort oder Satzzeichen) am Kopf − am Grund, Code (.js .cjs .mjs .html .css) ohne
//    Kommentare über den EINEN Stripper (`ohneKommentare`) — ein Kommentar kostet nichts und zahlt nichts, Pressen zahlt
//    nichts. Dasselbe Maß gilt der Spiel-Seite (sonst kaufte ein Kommentar im
//    Spiel Prüf-Budget). Beide Texte je Datei liest EIN Diff mit voller Umgebung (`-U` über jede Länge): Umgebung und
//    „-" sind der Grund, Umgebung und „+" der Kopf. `--grund <rev>` / `--kopf <rev>` messen zwischen zwei Ständen, ohne
//    `--kopf` der Arbeitsbaum; kein Grund = ROT.
const PRUEF_PFADE = ["scripts", "spec", ":(exclude)spec/profiband/ratsche-*"]; // Ratschen = Messdaten des Werkzeugs
const SPIEL_PFADE = ["stamm", ":(glob)*.js", "index.html", "worlds", ":(exclude)worlds/**/lib/**"];
const stamm = require("./lib/stamm.cjs");
// 6c) WERKZEUG-TAFELN: was `stamm-umzug --nach-karte` als Spiegel des Stamms schreibt — die Stamm-Quellen der Tafeln
//     (Tafel am Grund, Stamm am Grund → Stamm am Kopf) und die Karte (der Stamm am Kopf ihr Fixpunkt; ihre Namen und Themen
//     trägt er als Glieder und Marker) — misst gegen die FRISCHE AUSGABE DES WERKZEUGS am selben Stand (`werkzeugVon`, das
//     Werkzeug kennt seine Ausgabe, sein Selbsttest in check:statik): die Ableitung ist kein geschriebener Prüf-Code und zählt
//     nichts; was davon abweicht, zählt voll und steht beim Namen (Datei: die erste Zeile mit fremden Atomen — ein Abdruck,
//     den das Werkzeug VERALTET schreibt, ist gleich viele Atome). Bis 30.10. maß die Teilung siedlung-satz → satz · instanz ·
//     wege (88da99be) Prüf +471 (Tafeln 384, Karte 87) bei Spiel 80: jede Modul-Teilung traf die Wand, die Ordnung zahlte.
//     Der Richter (`--richter`) zählt wie bisher — er rückt geschriebene Bänder um, eine Teilung bewegt ihn atom-neutral.
const { werkzeugVon, TAFELN, DATEI_DECKE } = require("./stamm-umzug.cjs");
const git = (args) => stamm.gitIn(root, args);
const deckeMass = (text) => (text.match(/[\p{L}\p{N}_$]+|[^\s\p{L}\p{N}_$]/gu) || []).length;
const atome = (p, t) => deckeMass(/\.(?:[cm]?js|html|css)$/.test(p) ? stamm.ohneKommentare(t) : t);
const zahl = (d) => (d >= 0 ? "+" : "") + d;
// Kopfzeilen (--- / +++) stehen vor dem ersten @@, eine Binärdatei trägt keinen Hunk, ein Hunk-Stück nie das leere (der
// Rest hinter dem letzten Umbruch); eine geänderte Werkzeug-Tafel misst gegen `werkzeug(pfad, grund, kopf)`, `hand` nennt
// ihre Abweichung, `frei` summiert die Ableitung
function wachstumAusDiff(text, werkzeug) {
    const [seiten, je, datei, hand] = [new Map(), new Map(), new Map(), []];
    let [pfad, hunk, frei] = [null, false, 0];
    for (const z of text.split("\n"))
        if (z.startsWith("diff --git ")) {
            [pfad, hunk] = [z.slice(13, 13 + (z.length - 16) / 2), false];
            seiten.set(pfad, [[], []]);
        } else if (!hunk && /^(new|deleted) file mode/.test(z)) datei.set(pfad, z[0] === "n" ? 1 : -1);
        else if (z.startsWith("@@")) hunk = true;
        else if (hunk && z) for (const k of [0, 1]) if (z[0] !== "+-"[k]) seiten.get(pfad)[k].push(z.slice(1));
    for (const [p, [alt, neu]] of seiten) {
        const t = [...TAFELN, stamm.KARTE].includes(p) && !datei.has(p);
        const [a, n] = [alt.join("\n"), neu.join("\n")];
        const w = t ? werkzeug(p, a, n) : a;
        const d = atome(p, n) - atome(p, w);
        if (t && d) {
            const [nz, wz] = [n, w].map((s) => s.replace(/"c:\w+"/g, "").split("\n"));
            hand.push(`${p}:${nz.findIndex((z, i) => z !== wz[i]) + 1} ${zahl(d)}`);
        }
        if (t) frei += atome(p, w) - atome(p, a);
        je.set(p, d);
    }
    return { je, frei, hand };
}
const summe = (m, vor = "") => [...m].reduce((s, [p, d]) => (p.startsWith(vor) ? s + d : s), 0);
function wachstumZwischen(grund, kopf, pfade, werkzeug) {
    const args = ["-c", "core.quotePath=false", "diff", "-U9999999", "--no-color", "--no-renames", grund];
    return wachstumAusDiff(git([...args, ...(kopf ? [kopf] : []), "--", ...pfade]), werkzeug);
}
const taeterVon = (je) =>
    [...je]
        .filter(([, d]) => d > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([p, d]) => `, ${p} +${d}`)
        .join("");
// Die Stände, an denen die Wand misst — je Stand [grund, kopf (null = Arbeitsbaum), Name, urteilt]. Ein Karten-Zweig misst
// sich ganz ab der Merge-Basis mit origin/integ-probe und druckt den Stand (urteilt nicht). integ-probe urteilt am ZUG (unten);
// der Grund seines Fensters ist der main-Stand FENSTER_TAGE vor dem Kopf (Erst-Eltern-Kette von origin/main, nie die der Karte — spult der Integrator
// integ-probe auf eine Karte vor, ginge deren Kette durch fremde Commits), davon die Merge-Basis mit dem Kopf. Bis 10.11. war das
// Fenster der eine Push: eine Linsen-Heilung brauchte Spiel-Partner im eigenen Zug und stand an der Wand, während der Tag
// Prüf +2 223 / Spiel +11 482 maß (erlaubt 5 741) — sechs Heilungen warteten, darunter die des gemessenen Falls „reading 'size'".
// Der Preis ist gewollt: ein Tag, der Spiel-Code streicht, senkt das Budget jedes Zugs dieses Tages. main nimmt nur den Vorlauf
// von integ-probe, dessen jeder Push an dieser Wand stand — main misst nichts zweimal. Gesetz des Schöpfers 10.11. 19:10:
// „Ja, Tagesfenster" — seit 11.11. die WOCHE: gemessen an main trug EIN Tag Prüf +6 042 / Spiel +13 189 (46 %), zwei Tage
// −2 917 / +21 944, sieben Tage −9 106 / +240 119. Der Apparat schrumpft über die Woche; der eine Tag nach dem Kehraus strafte
// jeden Zug. Die Wand fängt die Explosion (103 k → 223 k Zeilen in 15 Tagen), nicht den Tag. (Der Name `tagGrund` und das Wort
// `--grund tag` bleiben: der Zug-Bau erkennt an ihnen, dass das Gesetz ein Fenster trägt.)
const FENSTER_TAGE = 7;
function tagGrund(kopf) {
    const vor = new Date(
        (+git(["log", "-1", "--format=%ct", kopf]).trim() - FENSTER_TAGE * 24 * 3600) * 1000
    ).toISOString();
    const vorTag = git(["rev-list", "-1", "--first-parent", `--before=${vor}`, "origin/main"]).trim();
    return git(["merge-base", vorTag, kopf]).trim();
}
// DER ZUG TRÄGT SICH SELBST (Schöpfer 11.11. 02:55 „Ja, umbauen", 03:00 „selber Nutzwert-Entscheide treffen"): das Fenster des Tages urteilte nach der UHR — sein Grund
// rollt mit der Commit-Zeit des Kandidaten, und rollte eine spiel-starke Landung hinaus, kippte das Urteil ohne jede Änderung
// (z378: Vorprüfung 02:07 GRÜN, Bau 02:16 ROT um 217 Atome, dazwischen rollte die Landung von 02:11 hinaus; ab 03:10 stand der
// Tag im Minus, −203 bis −2 878 bis 20:58 — jeder Zug wäre gefallen). Jetzt zwei Stände: die WOCHE vor dem Zug (`tagGrund` →
// Merge-Basis mit origin/main) misst nur ihren ÜBERSCHUSS; der ZUG (Merge-Basis → Kopf) urteilt. Ein Minus straft keinen Zug.
// DAS LINSEN-MASS (14.11., Koordinator nach dem Wort des Schöpfers 12.11. „Wachstum mit Struktur und Übersicht sollte kein
// Problem sein"): „die Hälfte des Spiels" hielt grüne Abgaben draußen — z357 (w27-takt-streu allein), z378, am 14.11.
// w28-ziel-plan (+3 071 / +2 494) und die Heilungen w28-kampf-linie (+337 / 0) und w28-tor-bruch (+1 999 / 0). Die Wand
// bremst nur AUFBLÄHUNG: erlaubt(Zug) = max(0, Spiel) + LINSEN_MASS (eine Linse mit Selbsttest und Mutanten, gemessen an
// ziel-plan) + Überschuss der Woche; der Überschuss = max(0, Spiel − Prüf) der Woche, 1:1 ohne Linsen-Maß (es gilt je Zug,
// nie gesammelt). Sie stoppt weiter beim Namen: w28-tor-bruch daeaf9df am 13.11., +24 626 bei Spiel 0.
// ACHT ZWEIGE JE ZUG (15.11.): das Maß war für EINEN Zweig gemessen (3 000), gilt aber je ZUG — ein Zug aus drei grünen Abgaben
// (z451: w28-bild-preis, w28-preis-ort, w28-satz-menge, +12 245 bei Spiel +7 588) fiel an ihm, und die Vorprüfung hielt die Züge
// deshalb tagelang bei EINEM Zweig (30–60 min je Abgabe). Der Zug trägt acht Zweige, also acht Maße.
const LINSEN_MASS = 24000;
function wachstumsStaende(zweig, kopfRev, zug = zweig === "integ-probe") {
    if (zweig === "main") return [];
    const basis = git(["merge-base", kopfRev || "HEAD", zug ? "origin/main" : "origin/integ-probe"]).trim();
    const stand = [basis, kopfRev, zug ? "Zug" : "Merge-Basis mit origin/integ-probe", zug];
    return zug ? [[tagGrund(kopfRev || "HEAD"), basis, "Woche", false], stand] : [stand];
}
const erlaubtVon = (dS, ueber = 0) => Math.max(0, dS) + LINSEN_MASS + ueber;
const ueberschussVon = (dP, dS) => Math.max(0, dS - dP);
// die Zeile des Stands: was die Wand am Zug sagen wird, auch wo sie nicht urteilt
const wachstumStand = (dP, dS, name, urteilt, frei = 0, hand = "", ueber = 0) =>
    `${name}: Prüf ${zahl(dP)} / Spiel ${zahl(dS)} Atome · erlaubt ${erlaubtVon(dS, ueber)} · ` +
    `${urteilt ? "urteilt" : name === "Woche" ? "ihr Überschuss trägt den Zug" : "Stand, urteilt am Zug"} · Werkzeug-Ausgabe ${zahl(frei)} frei${hand}`;
function wachstumBefund(dP, dS, name, urteilt, taeter = "", hand = "", ueber = 0) {
    const erlaubt = erlaubtVon(dS, ueber);
    if (!urteilt || dP <= erlaubt) return [];
    return [
        `WACHSTUMS-WAND (${name}): scripts/ + spec/ +${dP} Atome bei Spiel ${dS} — erlaubt Spiel + Linsen-Maß ${LINSEN_MASS} + der Überschuss der Woche ${ueber} (${erlaubt})${taeter}${hand}`,
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

// 8) STRIPPER-WAND (Klarheit D3): es gibt EINEN Kommentar-Stripper (`ohneKommentare` in
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

// 6b) DIE DECKE JE DATEI: keine Datei in scripts/ trägt über 6 000 Zeilen (bis 15.11. 4 000: die Kante traf den Zweig mit der letzten Zeile); ROT beim Namen samt dem Weg, der teilt. Den
//     Richter (scripts/playtest.cjs + scripts/playtest/<domaene>.cjs) teilt das Werkzeug: `stamm-umzug --richter` gibt
//     eine Domäne über der Decke nach Modul/teil ab. Jede andere Linse teilt von Hand nach Domäne (scripts/lib/<domaene>-proben.cjs
//     wie fahr-proben, kampf-proben) — `--nach-karte` teilt nur den Stamm, kein Skript. Die Zahl selbst lebt in stamm-umzug.cjs
//     (DATEI_DECKE, EINE Konstante für Stamm und scripts/ seit 21.11.) und wird oben von dort gelesen.
const teilWeg = (pfad) =>
    /^scripts\/playtest(?:\.cjs|\/)/.test(pfad)
        ? "teilt: node scripts/stamm-umzug.cjs --richter"
        : "kein Werkzeug teilt sie — von Hand nach Domäne (scripts/lib/<domaene>-proben.cjs)";
const dateiDeckeBefund = (dateien) =>
    dateien
        .map(({ pfad, text }) => [pfad, (text.match(/\n/g) || []).length])
        .filter(([, n]) => n > DATEI_DECKE)
        .map(([pfad, n]) => `DECKE (Datei): ${pfad} trägt ${n} Zeilen — höchstens ${DATEI_DECKE}, ${teilWeg(pfad)}`);

function main() {
    const errs = [];
    const [kopfRev, grundRev] = ["--kopf", "--grund"].map((n) => argOpt(n, null));
    const gemessen = [];
    try {
        const zweig = process.env.GITHUB_REF_NAME || git(["rev-parse", "--abbrev-ref", "HEAD"]).trim();
        const staende =
            grundRev && grundRev !== "tag"
                ? [[grundRev, kopfRev, "--grund", true]]
                : wachstumsStaende(zweig, kopfRev, grundRev ? true : undefined);
        let ueber = 0;
        for (const [grund, kopf, name, urteilt] of staende) {
            const { je, frei, hand } = wachstumZwischen(
                grund,
                kopf,
                PRUEF_PFADE,
                werkzeugVon((k) => stamm.teileVon(root, k ? kopf : grund))
            );
            const [dP, dS] = [summe(je), summe(wachstumZwischen(grund, kopf, SPIEL_PFADE).je)];
            const vonHand = hand.length ? ` · von Hand ${hand.join(", ")}` : "";
            gemessen.push(wachstumStand(dP, dS, name, urteilt, frei, vonHand, ueber));
            errs.push(...wachstumBefund(dP, dS, name, urteilt, taeterVon(je), vonHand, ueber));
            if (name === "Woche") ueber = ueberschussVon(dP, dS);
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
        const gates = new Set(Object.keys(jsonLesen("package.json").scripts));
        // die Welt ist der Index (wie in der CI), nie der lokale Rest unverfolgter Dateien
        const dateien = [...new Set(git(["ls-files", "--cached"]).split("\n"))].filter(
            (p) => p && fs.existsSync(path.join(root, p))
        );
        const lies = (p) => ausDatei(path.join(root, p));
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
            .map((p) => ({ pfad: p, text: ausDatei(path.join(root, p)) }));
        const dateien = alle.filter((d) => /\.(c|m)?js$/.test(d.pfad));
        stripperDateien = dateien.length;
        errs.push(...stripperBefund(dateien), ...dateiDeckeBefund(alle));
        errs.push(...stamm.stripperTafel(root).map((b) => `STRIPPER-WAND (Tafel): ${b}`));
    } catch (e) {
        errs.push(`STRIPPER-WAND: scripts/ oder die Tafel nicht lesbar (${String(e.message).split("\n")[0]})`);
    }

    // 2) SCOPE-WAND: die alte Liste im Baum oder im Index, die Rest-Zeile in jeder Vorlage (.claude/, docs/, scripts/)
    let vorlagen = 0;
    try {
        const listeDa =
            fs.existsSync(path.join(root, LISTE_ALT)) || git(["ls-files", "--cached", "--", LISTE_ALT]).trim() !== "";
        const dateien = git(["ls-files", "--cached"])
            .split("\n")
            .filter((p) => p && VORLAGEN_PFADE.test(p) && /\.(?:md|c?js|mjs|json|txt)$/.test(p))
            .filter((p) => fs.existsSync(path.join(root, p)))
            .map((p) => ({ pfad: p, text: ausDatei(path.join(root, p)) }));
        vorlagen = dateien.length;
        errs.push(...scopeBefund(dateien, listeDa));
    } catch (e) {
        errs.push(`SCOPE-WAND: der Index ist nicht lesbar (${String(e.message).split("\n")[0]})`);
    }

    // der Stand der Karte 2 (gebucht von 1 718); unlesbar = offen, nie still grün
    let gebucht = null;
    try {
        const st = JSON.parse(git(["show", KARTE_STAND]));
        if (st.sprossen === KARTE_SPROSSEN && Number.isInteger(st.heute)) gebucht = st.heute;
    } catch {
        gebucht = null;
    }
    const offen = gebucht === null ? null : KARTE_SPROSSEN - gebucht;

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
        const befund = siegelBefund(headMsg, offen);
        if (befund)
            errs.push(
                `HEAD-Commit trägt Siegel-Wort "${befund.trim()}" bei ${offen === null ? "ungelesenem Stand" : offen + " offenen Sprossen"} der Karte 2 — ` +
                    `„fertig" ist illegal, bis die Karte 2 ganz gebucht ist (BETRIEBSGESETZ #1)`
            );
    }

    // 3) STAND-WAND + 4) ABSENZ-WAND
    const claude = ausDatei("CLAUDE.md");
    const sz = standZeilen(claude);
    if (sz < 0) errs.push("CLAUDE.md Stand-Kopf nicht gefunden (## Stand (V…)");
    else if (sz > 40)
        errs.push(`CLAUDE.md Stand trägt ${sz} Zeilen (max 40) — Chronik gehört in git log, nicht in den Stand`);
    if (!claude.includes("## DAS BETRIEBSGESETZ"))
        errs.push("CLAUDE.md trägt kein BETRIEBSGESETZ mehr — stilles Streichen der Gesetze");
    if (!claude.includes("Meisterkarte 2 ist der EINZIGE Scope"))
        errs.push("CLAUDE.md nennt die Meisterkarte 2 nicht mehr als den EINZIGEN Scope (BETRIEBSGESETZ #2)");
    const champ = ausDatei(".claude/agents/champion.md");
    if (!champ.includes("BETRIEBSGESETZ"))
        errs.push("champion.md trägt das BETRIEBSGESETZ nicht mehr — der Arbeiter läuft ungebunden");
    if (!champ.includes("Karte 2: <gebucht> von 1 718"))
        errs.push("champion.md trägt die Schluss-Zeile „Karte 2: <gebucht> von 1 718“ nicht mehr");
    // IPERKA (Schöpfer 23.11.): der Arbeiter informiert sich bei den Profis — ohne Web-Werkzeug kann er es nicht.
    if (!champ.includes("I — INFORMIEREN"))
        errs.push("champion.md trägt den Schritt „I — INFORMIEREN“ nicht mehr — der Arbeiter baut ohne die Profis (IPERKA)");
    if (!/^tools:(?=.*\bWebSearch\b)(?=.*\bWebFetch\b)/m.test(champ))
        errs.push("champion.md gibt dem Arbeiter WebSearch und WebFetch nicht — er kann die Profis nicht lesen (IPERKA I)");

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
    const t1 = siegelBefund("welle vollendet, alles RUND", 1682); // muss feuern
    const t2 = siegelBefund("betriebsgesetz: siegel-wort-wand steht", 1682); // darf nicht feuern
    const t3 = siegelBefund("welle vollendet", 0); // die ganze Karte gebucht: Siegel legal
    const t4 = siegelBefund("bericht: rund 60 assets pro sekunde", 1682); // klein „rund" legal
    const t5 = siegelBefund("SCOPE ZU", null); // Stand unlesbar zählt offen: muss feuern
    if (!t1 || t2 || t3 || t4 || !t5)
        errs.push(`Selbsttest der Siegel-Wort-Wand versagt (t1=${t1} t2=${t2} t3=${t3} t4=${t4} t5=${t5})`);
    // die Scope-Wand: die zurückgekehrte Liste und die Rest-Zeile in einer Vorlage feuern beim Namen; die Karte-2-Zeile
    // und ein Satz über die gefallene Liste schweigen
    const restMutant = "Pflicht" + "-OFFEN Rest: 0 | Liste";
    const p1 = scopeBefund([], true);
    const p2 = scopeBefund([{ pfad: ".claude/agents/x.md", text: "Gemessen: 3\n" + restMutant }], false);
    const p3 = scopeBefund([{ pfad: "docs/x.md", text: "Karte 2: 36 von 1 718 (Stand-Datei)\ndie frühere Liste A–F fiel" }], false);
    if (p1.length !== 1 || !p1[0].includes(LISTE_ALT) || p2.length !== 1 || !p2[0].includes(".claude/agents/x.md:2") || p3.length)
        errs.push(`Selbsttest der Scope-Wand versagt (p1=${p1.length} p2=${p2.join(" | ")} p3=${p3.length})`);
    // die Wachstums-Wand je Fall: die Zahl der Befunde am Zug (urteilt) und am Zweig (Stand); die Atome an einem Diff mit
    // voller Umgebung: die Summe der Code-Atome, „rot" = am Zug gegen Spiel 0 ROT beim Namen der Datei, dahinter die
    // Abweichung von Hand. Die Fälle fahren mit einem GIERIGEN Werkzeug, das jeden Kopf für abgeleitet erklärt: eine Datei
    // außerhalb der Werkzeug-Tafeln und eine neue Tafel fragt die Wand nie (6c, Fall c). Eine geänderte Tafel misst gegen die
    // frische Ausgabe, hier ihr Grund und die Zeile „b" (die Ableitung selbst prüft stamm-umzug --selftest an einem Umzug):
    // (a) gleich ihr zählt 0; (b) eine Hand-Zeile in der Tafel-Region zählt +1 und steht mit Datei:Zeile beim Namen
    const gierig = (p, a, n) => n;
    const fall = (hunk, m = "", p = "scripts/x.cjs", werk = gierig) => {
        const w = wachstumAusDiff(`diff --git a/${p} b/${p}\n${m}@@\n${hunk}`, werk);
        const rot = wachstumBefund(summe(w.je) + LINSEN_MASS, 0, "x", true, taeterVon(w.je)); // jedes Atom über dem Maß
        return [summe(w.je) + (String(rot).includes("x.cjs +") ? " rot" : ""), ...w.hand].join(" ");
    };
    const [frisch, tafel] = [(p, a) => a + "\nb", TAFELN[0]];
    // der Linsen-Zweig druckt am Zweig nur seinen Stand
    const zweigStand = wachstumStand(50, 0, "Zweig", false);
    const zweig =
        wachstumBefund(50, 0, "Zweig", false).length +
        (zweigStand.includes(`Prüf +50 / Spiel +0 Atome · erlaubt ${LINSEN_MASS} · Stand`) ? " Stand" : "");
    // die Aufblähung am Zug (w28-tor-bruch daeaf9df): ROT beim Namen des Stands und des Täters
    const zug = String(wachstumBefund(24626, 0, "--grund", true, ", scripts/y.cjs +24626"));
    const zugSoll =
        `WACHSTUMS-WAND (--grund): scripts/ + spec/ +24626 Atome bei Spiel 0 — erlaubt Spiel + Linsen-Maß ${LINSEN_MASS} + der Überschuss der Woche 0 (${LINSEN_MASS}), scripts/y.cjs +24626`;
    const Z = (dP, dS, w) => wachstumBefund(dP, dS, "Zug", true, "", "", w ? ueberschussVon(...w) : 0).length;
    const wand = [
        Z(337, 0), // die Heilung (kampf-linie): schweigt
        Z(3071, 2494), // die Linse am Spiel (ziel-plan): schweigt
        Z(1000 + LINSEN_MASS, 1000) + "|" + Z(1001 + LINSEN_MASS, 1000), // die Grenze Spiel + Maß: schweigt | +1 feuert
        Z(1001 + LINSEN_MASS, 1000, [6130, 5000]) + "|" + Z(1000 + LINSEN_MASS, 1000, [6130, 5000]), // ein Minus der Woche straft nicht und trägt nicht
        Z(1300 + LINSEN_MASS, 1000, [100, 400]) + "|" + Z(1301 + LINSEN_MASS, 1000, [100, 400]), // der Überschuss der Woche (+300) trägt 1:1
        Z(LINSEN_MASS + 10, -500), // die Welt schrumpft, der Apparat wächst über das Maß: feuert
        Z(-100, -300), // beide schrumpfen: schweigt
        zweig, // der Linsen-Zweig: 0 Befunde, die Stand-Zeile steht
        zug === zugSoll ? "rot" : zug, // die Mutante am Zug: feuert beim Namen
        fall("+// x\n a;\n-b;\n+b; /* y\n+ */"), // (a) nur Kommentare dazu: 0
        fall("-// x\n a;"), // (b) nur Kommentare weg: 0, zahlt nichts
        fall("-a;\n+!a;"), // (c) ein Code-Atom mehr: ROT beim Namen
        fall("-a;\n-b;\n+a; b;"), // (d) Pressen zweier Zeilen zu einer: 0
        fall("+a;\n+b;", "new file mode\n"), // eine neue Datei zählt ganz
        fall("-a;\n-b;", "deleted file mode\n"), // eine gestrichene zahlt ganz
        fall("-a\n+a\n+b", "", tafel, frisch), // (a) die frische Ausgabe des Werkzeugs: 0
        fall("-a\n+a\n+h\n+b", "", tafel, frisch), // (b) eine Hand-Zeile darin: +1 beim Namen
        fall("+a", "new file mode\n", tafel), // (c) eine neue Tafel zählt voll
    ].join(" · ");
    if (
        wand !==
        `0 · 0 · 0|1 · 1|0 · 0|1 · 1 · 0 · 0 Stand · rot · 0 · 0 · 1 rot · 0 · 4 rot · -4 · 0 · 1 ${tafel}:2 +1 · 1`
    )
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
    // die Decke je Datei: eine gepflanzte 6 001-Zeilen-Datei ist ROT beim Namen, 6 000 Zeilen halten
    const d1 = dateiDeckeBefund([{ pfad: "scripts/x.cjs", text: "x\n".repeat(6001) }]);
    const d2 = dateiDeckeBefund([{ pfad: "scripts/y.cjs", text: "y\n".repeat(6000) }]).length;
    const d3 = dateiDeckeBefund([{ pfad: "scripts/playtest/x.cjs", text: "x\n".repeat(6001) }]);
    if (
        d1.length !== 1 ||
        !d1[0].includes("scripts/x.cjs trägt 6001") ||
        !d1[0].includes("von Hand") ||
        d2 ||
        !String(d3).includes("--richter")
    )
        errs.push(`Selbsttest der Datei-Decke versagt (d1=${d1.length} d2=${d2})`);

    wandEnde(
        errs,
        `gate:betriebsgesetz — Karte 2 ${gebucht === null ? "Stand unlesbar (Siegel verboten)" : gebucht + " von " + KARTE_SPROSSEN} · ` +
            `Scope-Wand (${vorlagen} Vorlagen) · Stand ${sz}/40 Zeilen · ` +
            `Wachstum ${gemessen.join(" · ")} · Siegel-Wand + Absenz-Wand + Archiv-Wand + ` +
            `Wachstums-Wand + Zitat-Wand + Stripper-Wand (${stripperDateien} Skripte, EIN Stripper, Tafel) stehen (Doku: ${dokuZeile}) · Selbsttest feuert`
    );
}

main();
