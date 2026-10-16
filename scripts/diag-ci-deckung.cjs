// diag-ci-deckung.cjs — DIE DECKUNGS-WAND DER CI (Welle K, CI-Teilung 07.10.).
//
// Der playtest-Job lag am 45-min-Deckel (integ-probe 7df27bef 42 min; ein 1,5-fach langsamerer Läufer riss ihn
// zweimal in Schritt 74). Die Wurzel ist die Länge EINES Jobs, nicht sein Deckel: der Job läuft als Matrix in Gruppen
// (`strategy.matrix.gruppe`), jede fährt die Vorbereitung und ihre Gate-Schritte (`if: matrix.gruppe == N`).
// Die Teilung hat zwei neue Arten, einen Schritt zu verlieren oder zu vervielfachen — diese Wand nennt jede beim Namen:
//   (G) GRUPPE   jeder Gate-Schritt des Gruppen-Jobs trägt GENAU eine Gruppe aus der Matrix — ohne `if` liefe er in
//                jeder Gruppe (N-FACH), mit einer Gruppe außerhalb der Matrix nie (VERLOREN); jede Gruppe trägt Schritte
//   (V) VORBEREITUNG  die ersten Schritte sind checkout · setup-node · System-Libs · npm ci, ohne Gruppe (jede Gruppe
//                braucht sie); fail-fast aus (jede Gruppe meldet ganz); der Deckel je Gruppe höchstens 45 min
//   (D) DOPPELT  kein Gate-Schritt (sein run-Befehl) und kein Schritt-Name steht zweimal in der CI (alle Jobs)
//   (Z) VERGLEICH  `--gegen <git-ref>`: die Gate-Schritte (run-Befehle) der Datei an <ref> gegen die jetzige — kein
//                Schritt verloren, keiner doppelt (die Probe der Teilung: vorher ein Job, nachher die Gruppen)
//
// DIE GEGENRICHTUNG (09.10., Familie „Wände in die CI"). Befund: (G)/(V)/(D) prüften nur, dass jeder CI-Schritt seine
// Gruppe hat — nie, dass jede Wand einen Schritt hat. `npm run check` (constitution · studio-vertrag · altlasten ·
// apparat · vendor-anker · betriebsgesetz · taille · start-rezept …) stand in keinem Workflow, 50 von 152 `gate:*` liefen
// nirgends automatisch: die Norm-Wände waren Wachsamkeit (Gebot 10). Die Wand liest jetzt beide Richtungen:
//   (W) WAND     jedes `gate:*` aus package.json und jeder Teil von `npm run check` läuft in einem Workflow
//                (.github/workflows/*.yml; `npm run` wird bis auf die Befehle aufgelöst, eine Wand läuft, wenn ein
//                Schritt sie ruft ODER jeder ihrer Befehle in einem Schritt steht) — oder sie steht in AUSNAHMEN
//   (A) AUSNAHME  je Eintrag eine Klasse aus KLASSEN und ein Grund; die Liste ist selbst geprüft: ein Eintrag, dessen
//                Wand es nicht mehr gibt oder die schon in der CI läuft, ist ROT (keine stale Allow-Liste)
//   (R) REDUNDANT  kein Schritt eines Workflows fährt nur Befehle, die ein anderer Schritt derselben Datei schon fährt
//
// DER ABGESCHALTETE SCHRITT (10.10., Gegenprüfung waende-ci Runde 1). Befund: ein Schritt zählte als Deckung, sobald sein
// Text die Wand nannte — ein eingeschmuggeltes `gate:loch` mit `|| true`, mit continue-on-error am Schritt und im nächtlichen
// Job blieb GRÜN, und die seit 07.10. jede Nacht rote gate:perf-parity galt als gedeckt. Gedeckt ist eine Wand nur, wenn
// ihr Rot den MERGE hält:
//   (S) STUMM    jeder Befehl trägt den Grund, warum sein Rot verpufft — ein Workflow ohne push/pull_request (ein nächtlicher
//                Lauf blockt nichts), continue-on-error an Job oder Schritt, eine Bedingung, die im Merge nicht feuert (nur
//                die Gruppen-Bedingung der eigenen Matrix und success()/always() zählen), `|| …` (außer `|| exit 1` /
//                `|| false`), der Befehl vor einer Pipe ohne pipefail (Lehre 9), `!`, `set +e`, ein &&-Glied mitten im
//                Schritt (bash -e prüft nur das letzte Glied einer Kette, die nicht die letzte Zeile ist), eine Shell, die
//                die Linse nicht liest; npm fährt seine Skripte als `sh -c` ohne errexit (ein `;` in einem Skript macht
//                den Teil davor stumm — STUMM IN SICH). Wer nur stumm läuft, steht beim Namen mit Schritt und Schalter.
//
// DIE ZWEI STUFEN UND DIE WAAGE (K14, 11.10.; der Schöpfer: „der war früher unter 2 min, das wäre wieder genial"). Befund:
// jeder Push fuhr die ganze Batterie — drei Gruppen mit 17,7 / 26,0 / 19,0 min Median und zwei Jobs daneben (check 4,7 min,
// darin Prettier 2,1 min auf dem ganzen Stamm; erst-zeichnung 5,8 min), die Wanduhr ~25 min. check.yml trägt jetzt GENAU
// zwei Gruppen-Jobs: `puls` (je Push) und `voll` (die übrige Batterie, unter der EINEN Bedingung VOLL_WENN); jeder Schritt
// steht an GENAU einer Stelle (G)/(D), ein dritter Job ist ROT (er stünde außerhalb der Waage):
//   (T) WAAGE    je Gruppe die Vorbereitung plus die Median-Zeiten ihrer Schritte aus spec/ci/ci-zeiten.json (gemessen von
//                scripts/ci-zeiten.cjs über die GitHub-API; die CI fragt die API nie): ein Job je Push ≤ 2 min, eine
//                Voll-Gruppe ≤ 7 min — wer drüber liegt, steht mit Minuten und seinem größten Schritt beim Namen; ein Schritt
//                ohne Zeit ist UNGEMESSEN (ROT: erst messen oder mit „geschaetzt" und Quelle eintragen).
// Die Voll-Bedingung zählt für (S) als Merge-haltend: sie feuert auf integ-probe und main (der Weg nach main führt nur über
// integ-probe, Merge-Regel entscheidung.md §2.8) und auf jedem PR nach main; jede andere Job-Bedingung bleibt STUMM.
//
// DIE WANDUHR DER VOLLEN BATTERIE (K61 CI-Diät, 14.10.). Befund (Prüfung K61-1): 20 Voll- und 2 Puls-Gruppen, jede unter
// ihrem Deckel, und doch 12,3 min Wanduhr (38632403330) — das Konto fährt 20 Jobs zugleich (gemessen: 20 um 20:01:04Z,
// die übrigen warteten), 22 Jobs ließen zwei auf einen freien Platz warten, und derselbe Kopf fuhr die Batterie mehrfach
// (d2e06032 auf integ-probe und 14 min später auf main) und belegte die Plätze mit einem Urteil, das schon stand. Dazu
// hingen beide Caches der Vorbereitung am Hash des Lockfiles, das die Projektversion trägt: jede Versions-Stufe lud den
// Chrome in jedem Job neu (am 14.10. riss der Download mit ECONNRESET eine Gruppe, 38588243782).
//   (T) PLÄTZE    die Jobs, die ein voller Lauf zugleich fährt (der Puls und die Voll-Gruppen; ein Job, auf den ein anderer
//                wartet, endet vor ihm), ≤ LAEUFER_PLAETZE — sonst wartet der Überschuss und trägt die Wanduhr doppelt
//   (V) KOPF      vor der Batterie richtet der Job `kopf` (unter VOLL_WENN, ohne Matrix, EIN Schritt scripts/ci-kopf.cjs, nie
//                stumm): trägt ein anderer Lauf diesen Kopf schon grün durch die volle Batterie, läuft sie nicht noch einmal;
//                `voll` wartet auf ihn (`needs: kopf`, `if: VOLL_NACH_KOPF`) — so hält ihr Rot den Merge wie zuvor
//   (V) SCHLÜSSEL kein Cache hasht package.json/package-lock.json (die Projektversion), jeder trägt restore-keys, setup-node
//                trägt keinen eigenen Cache (dessen Schlüssel IST der Lockfile-Hash); die Schlüssel kommen aus
//                scripts/ci-schluessel.cjs (Inhalt allein), der Schritt steht vor den Caches, die Caches vor npm ci
//
// DER VOLLE PLAYTEST IN DER VOLLEN BATTERIE (K18, 11.10. nachts). Befund: K15 kam mit grüner Zweig-CI an und fiel erst am
// Merge im vollen playtest (RAUSCH-GESETZ (B), ein verborgener Fn-Rumpf) — `npm run playtest` lief in keiner Gruppe, nur
// nächtlich in playtest-full.yml (blockt keinen Merge, auf main 86–112 s je Lauf). (W) sah ihn nie: er ist kein gate:*.
//   (P) PLAYTEST  der volle Playtest (`npm run playtest`) läuft in GENAU einem Schritt aller Workflows, in einer EIGENEN
//                Gruppe der vollen Batterie, sein Rot hält den Merge, und das Verdikt ist die Bedingung: der letzte Befehl
//                des Schritts greift „Alle Invarianten OK" aus dem Log, das `tee` aus dem Playtest schrieb (ein grüner
//                Zähler reicht nicht — unter PLAYTEST_STRICT=0 endet der Playtest mit 0 trotz verletzter Invarianten).
//
// DIE ECHT-GRUPPE (K65, 15.10.). Befund: 89 Schritte in 10 GPU-Gruppen fuhren nur swiftshader (Pipeline-Bau 42–292 s je
// Programm), und swiftshader verbirgt, was eine echte GPU anders zeichnet (Lehre 17); eine Wand, die die Karte braucht, stand
// als Ausnahme „echte GPU nötig" draußen. Der eigene Läufer am Messplatz (GTX 1060, Label omen-gpu) fährt die GPU-Klasse
// ZUSÄTZLICH — ein dritter Job neben Puls und Batterie, außerhalb der Waage (kein Platz des Kontos):
//   (E) ECHT      der Job `echt`: runs-on genau self-hosted + omen-gpu, je push auf integ-probe und main (die Auswahl nach Wert
//                spec/ci/echt-auswahl.json: jeder Name in der GPU-Klasse, die Summe ≤ 15 min) und nachts (alles) hinter dem
//                Kopf-Richter (ECHT_WENN — nie pull_request: das Repo ist öffentlich), ohne Matrix, nie stumm, env CI_KLASSE gpu
//                und LINSE_GPU karte, der Deckel trägt das Warten am GPU-Schloss; nach checkout · setup-node · npm ci GENAU EIN
//                Schritt scripts/ci-echt.cjs (er liest die GPU-Klasse aus `voll`: nicht leer, jeder Schritt fahrbar), daneben
//                nur Wände, die die Karte brauchen (npm run gate:…, ohne Bedingung). In dieser Form hält sein Rot den Weg nach
//                main wie die volle Stufe (S); die Klasse „echte GPU nötig" der Ausnahme-Liste ist gefallen.
//
//   node scripts/diag-ci-deckung.cjs [--selftest] [--gegen <git-ref>]     (npm run gate:ci-deckung; in npm run check)
"use strict";
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const yaml = require("js-yaml");
const { klasseDesLaufs, LAEUFER_PLAETZE } = require("./lib/ci-klasse.cjs");
const { schluessel } = require("./ci-schluessel.cjs");
const { kopfUrteil } = require("./ci-kopf.cjs");
const { echtSchritte, auswahlUrteil, AUSWAHL } = require("./ci-echt.cjs");

const root = path.resolve(__dirname, "..");
const DATEI = ".github/workflows/check.yml";
const ZEITEN = "spec/ci/ci-zeiten.json";
const PULS_JOB = "puls";
const VOLL_JOB = "voll";
const GRUPPEN_JOBS = [PULS_JOB, VOLL_JOB];
// Die EINE Bedingung der vollen Batterie: nachts, auf Abruf, auf jedem PR nach main, auf integ-probe und main, und wo die
// Commit-Message `[ci voll]` trägt (eine Karte mit Risiko R2/R3 am letzten Push).
const VOLL_WENN =
    "github.event_name == 'schedule' || github.event_name == 'workflow_dispatch' || " +
    "github.event_name == 'pull_request' || github.ref == 'refs/heads/integ-probe' || github.ref == 'refs/heads/main' || " +
    "contains(github.event.head_commit.message, '[ci voll]')";
const normWenn = (x) => String(x == null ? "" : x).trim().replace(/\s+/g, " ");
const istVollWenn = (x) => normWenn(x) === VOLL_WENN;
// EIN URTEIL JE KOPF (K61): der Kopf-Richter läuft unter VOLL_WENN, die Batterie hinter ihm, wenn der Kopf noch kein
// grünes Urteil der vollen Batterie trägt (scripts/ci-kopf.cjs)
const KOPF_JOB = "kopf";
const KOPF_LAUF = /^node scripts\/ci-kopf\.cjs$/;
const VOLL_NACH_KOPF = "needs.kopf.outputs.voll == 'ja'";
const needsVon = (J) => [].concat((J && J.needs) || []);
// DIE ECHT-GRUPPE (K65): der eigene Läufer mit der Karte fährt die GPU-Klasse der vollen Batterie ZUSÄTZLICH — je push auf
// integ-probe und main die Auswahl nach Wert, nachts (schedule, nur main) alles (nie pull_request: das Repo ist öffentlich), hinter dem Kopf-Richter, EIN Schritt
// scripts/ci-echt.cjs (er liest die Schritte aus `voll`), dazu nur Wände, die ohne Karte nicht laufen. Er steht außerhalb der
// Waage (kein Platz des Kontos); sein timeout trägt das Warten des Läufers am GPU-Schloss (Hook, höchstens 120 min).
const ECHT_JOB = "echt";
const ECHT_WENN =
    "(github.event_name == 'schedule' || (github.event_name == 'push' && (github.ref == 'refs/heads/integ-probe' || " +
    "github.ref == 'refs/heads/main'))) && " +
    VOLL_NACH_KOPF;
const ECHT_LAEUFER = ["self-hosted", "omen-gpu"];
const ECHT_LAUF = /^node scripts\/ci-echt\.cjs$/;
const ECHT_DECKEL_MIN = 240; // 120 min Warten am Schloss + die Nacht (~90 min) + Vorbereitung
const ECHT_ENV = { CI_KLASSE: "gpu", LINSE_GPU: "karte" };
// die volle Stufe: der Kopf-Richter unter VOLL_WENN und die Batterie hinter ihm (ihr Rot hält den Merge, (S))
function vollArt(doc, job) {
    const J = doc && doc.jobs && doc.jobs[job];
    if (!J) return false;
    if (job === KOPF_JOB) return istVollWenn(J.if) && !needsVon(J).length;
    if (job === VOLL_JOB)
        return normWenn(J.if) === VOLL_NACH_KOPF && needsVon(J).includes(KOPF_JOB) && vollArt(doc, KOPF_JOB);
    return false;
}
// läuft der Job im vollen Lauf? die volle Stufe — oder eine Batterie direkt unter VOLL_WENN (ihr Rot hält den Merge auch;
// dass sie hinter dem Kopf-Richter steht, verlangt (V) BEDINGUNG)
const imVollenLauf = (doc, job) =>
    vollArt(doc, job) || (job === VOLL_JOB && !!doc && !!doc.jobs && !!doc.jobs[job] && istVollWenn(doc.jobs[job].if));
// Die Deckel der Waage (Median samt Vorbereitung): ein Job je Push trägt den Puls, eine Voll-Gruppe ihre Breite.
const WAAGE_S = { push: 120, voll: 420 };
const DECKEL_MIN = 45;
const VORBEREITUNG = [
    ["checkout", (s) => typeof s.uses === "string" && s.uses.startsWith("actions/checkout@")],
    ["setup-node", (s) => typeof s.uses === "string" && s.uses.startsWith("actions/setup-node@")],
    ["System-Libs", (s) => /apt-get install/.test(String(s.run || ""))],
    ["npm ci", (s) => /\bnpm ci\b/.test(String(s.run || ""))],
];
// die Caches (K61): der npm-Cache und der puppeteer-Chrome aus dem Actions-Cache, vor npm ci (dessen postinstall lädt den
// Chrome sonst je Job neu — am 14.10. riss der Download mit ECONNRESET eine ganze Gruppe), ihre Schlüssel aus dem
// Schlüssel-Schritt (scripts/ci-schluessel.cjs); sie stehen im Vorbereitungs-Block, ohne Gruppe
const CACHE = (s) => typeof s.uses === "string" && /^actions\/cache(\/restore)?@/.test(s.uses);
const SCHLUESSEL = (s) => /^node scripts\/ci-schluessel\.cjs$/.test(String(s.run || "").trim());
const IST_VORBEREITUNG = (s) => CACHE(s) || SCHLUESSEL(s) || VORBEREITUNG.some(([, f]) => f(s));
const GRUPPE_RE = /^\s*matrix\.gruppe\s*==\s*(\d+)\s*$/;

const lauf = (s) => String(s.run || "").trim();
const name = (s) => String(s.name || s.uses || lauf(s).split("\n")[0]).replace(/\s+/g, " ");

// ── DIE GEGENRICHTUNG (W)/(A)/(R) ──
const WORKFLOWS = ".github/workflows";
// Die Klassen, aus denen eine Wand der CI fernbleiben darf. Jede nennt eine Eigenschaft der Wand, keinen Zeitplan. (Die
// Klasse „echter Renderer nötig" fiel am 10.10.: der Läufer rastert swiftshader-WebGPU und -GL — gate:webgl-probe läuft
// in Gruppe 2; was dort nicht steht, steht wegen einer anderen Eigenschaft. Die Klasse „echte GPU nötig" fiel am 15.10.
// (K65): der eigene Läufer trägt die Karte — eine Wand, die sie braucht, fährt im Job `echt`, gate:weltbild-frost:echt zuerst.)
const KLASSEN = {
    MESS: "Messwerkzeug, kein Urteil", // gibt Zahlen aus, kennt kein Rot
    FRIST: "Zeitfrist/Einschwingen > CI-Budget", // ein Lauf trägt den Deckel einer Gruppe nicht
    ROT: "rot an der Basis", // rot auf main, Täter benannt — die Heilung ist größer als diese Wand
};
// Die EINE Ausnahme-Liste: Wand → { klasse, grund }. Wer hier steht, hält in keinem Workflow den Merge — mit Grund.
const AUSNAHMEN = {
    "gate:arch-feld": {
        klasse: KLASSEN.FRIST,
        grund:
            "trägt den Deckel des Läufers nicht (Lauf 38005574907: Gruppe 1 nach 45,3 min abgebrochen, die Wand allein " +
            "25 min): der Bäcker backt dort auf swiftshader 1 Karte in 4 000 Takten (lokal 6 in 1 887) — A' wartet auf " +
            "die Karte der fernen Eiche —, und die Erst-Zeichnung des D-Blicks reißt zweimal die 600-s-Wand (lokal 369 s); " +
            "B nannte dort 1 ausgebrannten von 342 Foundry-Bauten (offen benannt). Lokal GRÜN in 549 s, D seit 3ec8844b " +
            "an der Wurzel geheilt (Feld gegen Mesh 0,99 aus der EINEN Aufnahme)",
    },
    "gate:perf-parity": {
        klasse: KLASSEN.ROT,
        grund:
            "rot seit 07.10. (Nacht-Lauf 37607543521 an 2f237817; grün am 06.10. an 53d94719 mit VIS 59 %), allein am " +
            "H4-Band „VIS-Ratio ≥ 50 %“ (main 7dd944e6: 39–40 %). Täter 87c59800 (Merge welle7-vereint, 06.10.): der " +
            "Zensus zählt Emitter, deren Ursprung ≤ 120 m vom Spieler liegt — das EINE Gesetz der Pass-Wahl verdichtete " +
            "nah die Bündel (regionBundle 93 → 67 Emitter), und headless bleiben die 21 Nah-Wiese-Senken ohne Sicht-Satz " +
            "leer und zeichnen nie: VIS 52 → 42 % bei unverändert 131 fernen Emittern, davon 59 unter unsichtbaren Ahnen " +
            "(Wolf-Hüllen des wrap↔fern-Schalters — der Zensus geht mit traverse statt traverseVisible). Das Band " +
            "bestraft das Verdichten; sein Maß gehört zum Profi-Band (Pflicht-OFFEN E). Bis 10.10. lief die Wand nur " +
            "nächtlich (blockte keinen Merge) und war dort jede Nacht rot — der Schritt fiel aus playtest-full.yml",
    },
};

// DIE SHELL eines Schritts (GitHub Actions): ohne `shell` läuft `bash -e {0}` (errexit, KEIN pipefail — das Log nennt
// „shell: /usr/bin/bash -e {0}"), `shell: bash` läuft `bash --noprofile --norc -eo pipefail {0}`, `shell: sh` läuft
// `sh -e {0}`; ein eigener Befehl trägt seine Schalter selbst. npm fährt ein Skript als `sh -c` — ohne errexit.
// `fremd`: eine Shell, deren Text die Linse nicht liest (pwsh, python …) — jeder Befehl darin zählt als stumm.
const SHELL_NPM = { e: false, pipefail: false, fremd: null };
function shellArt(shell) {
    if (shell == null || shell === "") return { e: true, pipefail: false, fremd: null };
    const s = String(shell).trim();
    if (s === "bash") return { e: true, pipefail: true, fremd: null };
    if (s === "sh") return { e: true, pipefail: false, fremd: null };
    if (/^(\S*\/)?(ba)?sh\b/.test(s))
        return { e: /\s-\w*e/.test(s), pipefail: /pipefail/.test(s), fremd: null };
    return { e: false, pipefail: false, fremd: s };
}
const norm = (b) => {
    b = b.trim().replace(/\s+/g, " ");
    while (/^[A-Z_][A-Z0-9_]*=\S*\s/.test(b)) b = b.replace(/^[A-Z_][A-Z0-9_]*=\S*\s+/, "");
    return b.replace(/(^|\s)\.\/scripts\//g, "$1scripts/");
};
// Ein Rückfall, der das Rot weiterträgt: `|| exit 1` · `|| exit $?` · `|| false` (die Wand hält).
const STRENGER_RUECKFALL = /^(exit\s+([1-9]\d*|\$\?)|false)$/;
// Die Befehle eines Shell-Texts (run-Block oder npm-Skript) — je Befehl `{ t, stumm }`: `t` der Befehl (Kommentar-
// Zeilen fallen, Zeilen-Fortsetzungen werden eins, führende Umgebungs-Zuweisungen und `./` vor scripts/ sind kein
// Unterschied), `stumm` der Grund, warum sein Rot den Schritt NICHT rot macht (null: es macht ihn rot). Die Regeln sind
// die der bash (errexit): ein Befehl vor `||` fällt in den Rückfall (außer der Rückfall trägt das Rot weiter), einer nach
// `||` läuft nur im Fehlerfall, einer vor `|` verliert sein Rot ohne pipefail, `!` kehrt es um, `set +e` schaltet errexit
// ab; errexit prüft in einer &&-Kette nur ihr letztes Glied — mitten im Schritt verliert ein früheres Glied sein Rot,
// nur die LETZTE Liste des Texts trägt jedes Glied (ihr Status ist der Ausgang des Schritts). Ohne errexit entscheidet
// allein die letzte Liste.
function befehle(text, shell = shellArt(null)) {
    const sh = shell && typeof shell === "object" ? shell : shellArt(shell);
    const listen = [];
    let e = sh.e,
        pf = sh.pipefail;
    for (const zeile of String(text || "")
        .replace(/\\\r?\n/g, " ")
        .split("\n")) {
        if (/^\s*#/.test(zeile)) continue;
        for (const roh of zeile.split(";")) {
            const l = roh.trim();
            if (!l) continue;
            const set = /^set\s+(.*)$/.exec(l);
            if (set) {
                const tok = set[1].split(/\s+/);
                for (let i = 0; i < tok.length; i++) {
                    const m = /^([-+])(\w+)$/.exec(tok[i]);
                    if (!m) continue;
                    if (m[2].includes("e")) e = m[1] === "-";
                    if (m[2].includes("o") && tok[i + 1] === "pipefail") pf = m[1] === "-";
                }
                continue;
            }
            listen.push({ l, e, pf });
        }
    }
    const out = [];
    listen.forEach(({ l, e, pf }, li) => {
        const letzte = li === listen.length - 1;
        // die Pipelines der Liste und die Operatoren dazwischen (`||` vor `|` — die Alternation ist geordnet)
        const teile = l.split(/(&&|\|\||(?<!\|)\|(?!\|))/);
        const pipes = [];
        const ops = [];
        let cur = [];
        for (let i = 0; i < teile.length; i++) {
            if (i % 2 === 0) cur.push(teile[i]);
            else if (teile[i] === "|") continue;
            else {
                pipes.push(cur);
                ops.push(teile[i]);
                cur = [];
            }
        }
        pipes.push(cur);
        pipes.forEach((cmds, i) => {
            let grund = null;
            if (sh.fremd) grund = `die Shell „${sh.fremd}" liest die Linse nicht`;
            else if (i > 0 && ops[i - 1] === "||") grund = "läuft nur im Fehlerfall (nach ||)";
            else {
                const j = ops.findIndex((o, k) => k >= i && o === "||");
                if (j >= 0) {
                    const rueck = norm(
                        pipes
                            .slice(j + 1)
                            .map((c) => c.join(" | "))
                            .join(" ")
                    );
                    if (!STRENGER_RUECKFALL.test(rueck)) grund = `„|| ${rueck}" schluckt sein Rot`;
                } else if (!e && !letzte) grund = "ohne errexit (set +e / Shell ohne -e) entscheidet nur der letzte Befehl";
                else if (i < pipes.length - 1 && !letzte)
                    grund = "Glied einer &&-Kette mitten im Schritt (errexit prüft nur ihr letztes Glied)";
            }
            const c0 = norm(cmds[0] || "");
            if (!grund && /^!\s/.test(c0)) grund = `„!" kehrt sein Rot um`;
            cmds.forEach((c, k) => {
                const t = norm(c).replace(/^!\s+/, "");
                if (!t) return;
                let g = grund;
                if (!g && k < cmds.length - 1 && !pf) g = "vor einer Pipe ohne pipefail (das letzte Glied entscheidet)";
                out.push({ t, stumm: g });
            });
        });
    });
    return out;
}
const NPM_RUN = /^npm run ([\w:.@/-]+)$/;
// Löst `npm run X` bis auf die Befehle auf (je Befehl `{ t, stumm }`; ein stummer Aufruf vererbt seinen Grund, ein
// Skript läuft unter `sh -c`). Jedes erreichte Skript landet in `erreicht` (Name → Grund oder null, null gewinnt).
function aufloesen(text, skripte, erreicht = new Map(), tiefe = 0, shell = shellArt(null), erbe = null) {
    const out = [];
    for (const b of befehle(text, shell)) {
        const stumm = erbe || b.stumm;
        const m = NPM_RUN.exec(b.t);
        if (m && typeof skripte[m[1]] === "string" && tiefe < 16) {
            if (!erreicht.has(m[1]) || erreicht.get(m[1])) erreicht.set(m[1], stumm);
            out.push(...aufloesen(skripte[m[1]], skripte, erreicht, tiefe + 1, SHELL_NPM, stumm));
        } else out.push({ t: b.t, stumm });
    }
    return out;
}
// Die Wände: jedes gate:* (mit seinen Befehlen) und jeder Teil von `npm run check` (je Befehl eine Wand).
function waende(skripte) {
    const w = new Map();
    for (const k of Object.keys(skripte)) if (k.startsWith("gate:")) w.set(k, aufloesen(`npm run ${k}`, skripte));
    if (typeof skripte.check === "string")
        for (const t of aufloesen(skripte.check, skripte, new Map(), 0, SHELL_NPM)) w.set(`check: ${t.t}`, [t]);
    return w;
}
// Hält ein Workflow den Merge? Nur, wenn er auf push oder pull_request läuft (ein nächtlicher Lauf blockt nichts).
function haeltMerge(doc) {
    const on = doc && (doc.on !== undefined ? doc.on : doc[true]);
    const ereignisse = typeof on === "string" ? [on] : Array.isArray(on) ? on : Object.keys(on || {});
    return ereignisse.some((x) => x === "push" || x === "pull_request");
}
const IMMER = /^\s*(\$\{\{\s*)?(success|always|!\s*cancelled)\(\)(\s*\}\})?\s*$/;
// Warum ein Schritt (mit seinem Job und Workflow) kein Rot hält — null: er hält es.
function schrittStumm(datei, doc, job, j, s) {
    if (!haeltMerge(doc)) return `${datei} läuft nicht auf push/pull_request (blockt keinen Merge)`;
    const an = (x) => x !== undefined && x !== false && x !== "false";
    if (an(j["continue-on-error"])) return `continue-on-error am Job „${job}"`;
    // die volle Stufe hält den Merge: der Kopf-Richter feuert unter VOLL_WENN, die Batterie hinter ihm läuft, solange
    // der Kopf kein grünes Urteil der vollen Batterie trägt — wo sie nicht läuft, steht das Urteil des Kopfs schon
    // die Echt-Gruppe (K65) feuert auf integ-probe und main wie die volle Stufe — in ihrer Form (E) hält ihr Rot den Weg nach main
    const vollStufe = datei === path.basename(DATEI) && (imVollenLauf(doc, job) || (job === ECHT_JOB && !echtForm(doc).length));
    if (j.if !== undefined && !IMMER.test(String(j.if)) && !vollStufe) return `der Job „${job}" läuft nur unter „${j.if}"`;
    if (an(s["continue-on-error"])) return "continue-on-error am Schritt";
    if (s.if !== undefined && !IMMER.test(String(s.if))) {
        const m = GRUPPE_RE.exec(String(s.if));
        const M = j.strategy && j.strategy.matrix && j.strategy.matrix.gruppe;
        if (!m) return `läuft nur unter „${s.if}"`;
        if (!Array.isArray(M) || !M.includes(Number(m[1]))) return `Gruppe ${m[1]} steht in keiner Matrix (läuft nie)`;
    }
    return null;
}
// Jeder Schritt jedes Workflows mit seinen aufgelösten Befehlen (die Vorbereitung zählt nicht als Wand-Lauf).
function ciSchritte(docs, skripte) {
    const out = [];
    for (const [datei, doc] of Object.entries(docs))
        for (const [job, j] of Object.entries((doc && doc.jobs) || {}))
            for (const s of j.steps || []) {
                if (!s.run || IST_VORBEREITUNG(s)) continue;
                const erreicht = new Map();
                const shell =
                    s.shell ||
                    (j.defaults && j.defaults.run && j.defaults.run.shell) ||
                    (doc.defaults && doc.defaults.run && doc.defaults.run.shell);
                const teile = aufloesen(s.run, skripte, erreicht, 0, shellArt(shell), schrittStumm(datei, doc, job, j, s));
                out.push({ datei, job, name: name(s), teile, erreicht, schritt: s, jobDef: j, shell: shellArt(shell) });
            }
    return out;
}
function deckung(skripte, docs, ausnahmen) {
    const v = [];
    const schritte = ciSchritte(docs, skripte);
    // gefahren: Befehle, deren Rot ein Schritt hält; gerufen: Skripte, deren Aufruf das Rot hält; stummBei: wo ein Befehl
    // oder Skript nur stumm läuft (Schritt und Grund — die Linse nennt den Schalter beim Namen)
    const gefahren = new Set();
    const gerufen = new Set();
    const stummBei = new Map();
    const merke = (k, s, g) => {
        if (!stummBei.has(k)) stummBei.set(k, []);
        stummBei.get(k).push(`„${s.name}" (${s.datei}/${s.job}): ${g}`);
    };
    for (const s of schritte) {
        for (const t of s.teile) (t.stumm ? merke(t.t, s, t.stumm) : gefahren.add(t.t));
        for (const [n, g] of s.erreicht) (g ? merke("npm run " + n, s, g) : gerufen.add(n));
    }
    const W = waende(skripte);
    const inSich = (teile) => teile.filter((t) => t.stumm);
    const laeuft = (n, teile) =>
        !inSich(teile).length && (gerufen.has(n) || (teile.length > 0 && teile.every((t) => gefahren.has(t.t))));
    const klassen = new Set(Object.values(KLASSEN));
    const zahl = { waende: W.size, inCi: 0, ausnahmen: 0, offen: 0, jeKlasse: {} };
    for (const [n, teile] of W) {
        if (laeuft(n, teile)) zahl.inCi++;
        else if (ausnahmen[n]) {
            zahl.ausnahmen++;
            const k = ausnahmen[n].klasse;
            zahl.jeKlasse[k] = (zahl.jeKlasse[k] || 0) + 1;
        }
        else {
            zahl.offen++;
            const selbst = inSich(teile);
            const fehlt = teile.filter((t) => !gefahren.has(t.t)).map((t) => t.t);
            const stumm = [...new Set([...((n.startsWith("gate:") && stummBei.get("npm run " + n)) || []), ...fehlt.flatMap((t) => stummBei.get(t) || [])])];
            if (selbst.length)
                v.push(
                    `(S) STUMM IN SICH: „${n}" schluckt sein eigenes Rot — ${selbst.map((t) => `„${t.t}": ${t.stumm}`).join(" · ")}`
                );
            else if (stumm.length)
                v.push(`(S) STUMM: „${n}" läuft nur abgeschaltet — ${stumm.join(" · ")} (fehlt: ${fehlt.join(" · ")})`);
            else
                v.push(
                    `(W) WACHSAMKEIT: „${n}" läuft in keinem Workflow und steht in keiner Ausnahme (fehlt: ${fehlt.join(" · ")})`
                );
        }
    }
    for (const [n, a] of Object.entries(ausnahmen)) {
        if (!W.has(n)) v.push(`(A) STALE: die Ausnahme „${n}" nennt keine Wand mehr (package.json kennt sie nicht)`);
        else if (laeuft(n, W.get(n))) v.push(`(A) STALE: „${n}" läuft schon in der CI — die Ausnahme fällt`);
        if (!a || !klassen.has(a.klasse))
            v.push(`(A) KLASSE: „${n}" trägt die Klasse „${a && a.klasse}" — erlaubt: ${[...klassen].join(" · ")}`);
        if (!a || typeof a.grund !== "string" || a.grund.trim().length < 20)
            v.push(
                `(A) GRUND: „${n}" trägt keinen Grund (mindestens ein Satz: was die Wand braucht, warum nicht hier)`
            );
    }
    // (R) je Workflow-Datei: ein Schritt, dessen Befehle alle schon ein ANDERER Schritt fährt (einen Befehl, dessen Rot
    // dieser Schritt hält, nur ein anderer, der es AUCH hält)
    for (const s of schritte) {
        if (!s.teile.length) continue;
        const andere = schritte.filter((o) => o !== s && o.datei === s.datei);
        const bei = (t) => andere.find((o) => o.teile.some((x) => x.t === t.t && (t.stumm || !x.stumm)));
        if (s.teile.every((t) => bei(t))) {
            const wer = [...new Set(s.teile.map((t) => bei(t).name))];
            v.push(
                `(R) REDUNDANT: „${s.name}" (${s.datei}/${s.job}) fährt nur, was schon „${wer.join("“ · „")}" fährt`
            );
        }
    }
    return { v, zahl };
}
// (P) DER VOLLE PLAYTEST: genau ein Träger in allen Workflows, eine eigene Gruppe der vollen Batterie, sein Rot hält den
// Merge, das Verdikt ist die Bedingung (der letzte Befehl greift es aus dem Log, das tee aus dem Playtest schreibt).
const PLAYTEST = "playtest";
const VERDIKT = "Alle Invarianten OK";
const gruppeVon = (s) => {
    const m = typeof s.if === "string" ? GRUPPE_RE.exec(s.if) : null;
    return m ? Number(m[1]) : null;
};
function playtestUrteil(docs, skripte) {
    const v = [];
    const ziel = aufloesen(`npm run ${PLAYTEST}`, skripte).map((t) => t.t);
    const traeger = ciSchritte(docs, skripte).filter(
        (s) => s.erreicht.has(PLAYTEST) || (ziel.length > 0 && ziel.every((t) => s.teile.some((x) => x.t === t)))
    );
    const wo = (s) =>
        `„${s.name}" (${s.datei}/${s.job}${gruppeVon(s.schritt) ? " Gruppe " + gruppeVon(s.schritt) : ""})`;
    // warum ein Träger sein Rot nicht hält — null: er hält es
    const stumm = (s) =>
        s.erreicht.get(PLAYTEST) || (s.teile.find((x) => ziel.includes(x.t) && x.stumm) || {}).stumm || null;
    const imVoll = traeger.filter((s) => s.datei === path.basename(DATEI) && s.job === VOLL_JOB);
    if (!imVoll.length)
        v.push(
            `(P) PLAYTEST: der volle Playtest („npm run ${PLAYTEST}") läuft in keiner Gruppe der vollen Batterie — erst der ` +
                "Integrator sähe sein Rot" +
                (traeger.length ? ` (nur ${traeger.map((s) => wo(s) + (stumm(s) ? ": " + stumm(s) : "")).join(" · ")})` : "")
        );
    if (traeger.length > 1)
        v.push(`(P) ZWILLING: der volle Playtest läuft ${traeger.length}× (${traeger.map(wo).join(" · ")}) — EIN Schritt trägt ihn`);
    for (const s of imVoll) {
        const g = stumm(s);
        if (g) v.push(`(P) STUMM: ${wo(s)} fährt den vollen Playtest abgeschaltet — ${g}`);
        const meine = gruppeVon(s.schritt);
        const neben = (s.jobDef.steps || []).filter(
            (x) => x !== s.schritt && x.run && !IST_VORBEREITUNG(x) && meine !== null && gruppeVon(x) === meine
        );
        if (neben.length)
            v.push(
                `(P) EIGEN: der volle Playtest teilt Gruppe ${meine} mit ${neben.map((x) => `„${name(x)}"`).join(" · ")} — er ` +
                    "trägt eine eigene Gruppe"
            );
        const b = befehle(s.schritt.run, s.shell);
        const letzter = b[b.length - 1];
        const log =
            letzter && !letzter.stumm && /^grep\s/.test(letzter.t) && letzter.t.includes(VERDIKT)
                ? letzter.t.split(" ").pop()
                : null;
        if (!log || !b.some((x) => !x.stumm && x.t === `tee ${log}`))
            v.push(
                `(P) VERDIKT: ${wo(s)} urteilt ohne das Verdikt „${VERDIKT}" — ein grüner Zähler reicht nicht (der letzte ` +
                    "Befehl greift es aus dem Log, das tee aus dem Playtest schreibt)"
            );
    }
    return v;
}

function workflowsLesen() {
    const docs = {};
    for (const f of fs.readdirSync(path.join(root, WORKFLOWS)).sort())
        if (/\.ya?ml$/.test(f)) docs[f] = yaml.load(fs.readFileSync(path.join(root, WORKFLOWS, f), "utf8"));
    return docs;
}

// Alle Gate-Schritte der Datei (je Job, ohne die Vorbereitung), mit ihrer Gruppe.
function gateSchritte(doc) {
    const out = [];
    for (const [job, j] of Object.entries((doc && doc.jobs) || {}))
        for (const s of j.steps || []) {
            if (IST_VORBEREITUNG(s) || !s.run) continue;
            const m = typeof s.if === "string" ? GRUPPE_RE.exec(s.if) : null;
            out.push({ job, name: name(s), run: lauf(s), gruppe: m ? Number(m[1]) : null, wenn: s.if });
        }
    return out;
}

function urteil(doc) {
    const v = [];
    for (const job of Object.keys((doc && doc.jobs) || {}))
        if (!GRUPPEN_JOBS.includes(job) && job !== KOPF_JOB && job !== ECHT_JOB)
            v.push(
                `(V) JOB: „${job}" steht außerhalb von ${GRUPPEN_JOBS.join(" und ")} (und dem Kopf-Richter „${KOPF_JOB}", der Echt-Gruppe „${ECHT_JOB}") — die Waage sähe ihn nicht`
            );
    if (doc && doc.jobs && doc.jobs[ECHT_JOB]) v.push(...echtForm(doc));
    for (const job of GRUPPEN_JOBS) {
        const J = doc && doc.jobs && doc.jobs[job];
        if (!J) {
            v.push(`(V) LEER: kein Job „${job}" in ${DATEI}`);
            continue;
        }
        if (job === PULS_JOB && (J.if !== undefined || needsVon(J).length))
            v.push(
                `(V) PULS: „${job}"` +
                    [J.if !== undefined ? ` trägt die Bedingung „${J.if}"` : "", needsVon(J).length ? ` wartet auf ${needsVon(J).join(", ")}` : ""]
                        .filter(Boolean)
                        .join(" und") +
                    " — der Puls läuft je Push, ohne Bedingung"
            );
        if (job === VOLL_JOB && (normWenn(J.if) !== VOLL_NACH_KOPF || !needsVon(J).includes(KOPF_JOB)))
            v.push(
                `(V) BEDINGUNG: „${job}" läuft unter „${J.if}"${needsVon(J).includes(KOPF_JOB) ? "" : " ohne needs: " + KOPF_JOB} statt hinter dem Kopf-Richter (needs: ${KOPF_JOB}, if: ${VOLL_NACH_KOPF})`
            );
        v.push(...gruppenUrteil(job, J));
    }
    v.push(...kopfForm(doc));
    // (D) über ALLE Jobs: ein Befehl, ein Name
    const alle = gateSchritte(doc);
    const zaehle = (key) => {
        const m = new Map();
        for (const s of alle) m.set(key(s), (m.get(key(s)) || []).concat(s));
        return [...m].filter(([, l]) => l.length > 1);
    };
    for (const [r, l] of zaehle((s) => s.run))
        v.push(
            `(D) DOPPELT: „${r.split("\n")[0]}" läuft ${l.length}× (${l.map((s) => s.job + (s.gruppe ? "/" + s.gruppe : "")).join(", ")})`
        );
    for (const [n, l] of zaehle((s) => s.name))
        if (new Set(l.map((s) => s.run)).size > 1) v.push(`(D) DOPPELT: der Name „${n}" steht ${l.length}×`);
    return v;
}

// (V)/(G) eines Gruppen-Jobs: Matrix, fail-fast, Deckel, Vorbereitung, jeder Schritt genau eine Gruppe, keine leere Gruppe
function gruppenUrteil(job, J) {
    const v = [];
    const M = J.strategy && J.strategy.matrix && J.strategy.matrix.gruppe;
    if (!Array.isArray(M) || !M.length || !M.every((g) => Number.isInteger(g) && g > 0) || new Set(M).size !== M.length)
        v.push(
            `(V) MATRIX: „${job}" strategy.matrix.gruppe ist keine Liste verschiedener Gruppen-Nummern (${JSON.stringify(M)})`
        );
    if (!J.strategy || J.strategy["fail-fast"] !== false)
        v.push(`(V) FAIL-FAST: „${job}" strategy.fail-fast ist nicht false — eine rote Gruppe bräche die anderen ab`);
    if (!(Number(J["timeout-minutes"]) > 0 && Number(J["timeout-minutes"]) <= DECKEL_MIN))
        v.push(`(V) DECKEL: „${job}" timeout-minutes ${J["timeout-minutes"]} (Soll 1–${DECKEL_MIN} je Gruppe)`);
    const steps = J.steps || [];
    // der Vorbereitungs-Block: die führenden Schritte der Vorbereitung; in ihm checkout · setup-node · System-Libs · npm ci
    // in dieser Reihenfolge, daneben nur der Schlüssel-Schritt und die Caches (K61) — der Schlüssel vor jedem Cache, der
    // ihn liest, jeder Cache vor npm ci (danach hätte die Installation ihn nicht gelesen)
    let blockEnde = 0;
    while (blockEnde < steps.length && IST_VORBEREITUNG(steps[blockEnde])) blockEnde++;
    const block = steps.slice(0, blockEnde).filter((s) => !CACHE(s) && !SCHLUESSEL(s));
    VORBEREITUNG.forEach(([n, f], i) => {
        const s = block[i];
        if (!s || !f(s))
            v.push(`(V) VORBEREITUNG: „${job}" Schritt ${i + 1} ist nicht „${n}" (${s ? name(s) : "fehlt"})`);
        else if (s.if)
            v.push(`(V) VORBEREITUNG: „${job}" „${n}" trägt eine Bedingung (${s.if}) — jede Gruppe braucht sie`);
    });
    const npmCi = steps.findIndex((s) => VORBEREITUNG[3][1](s));
    steps.slice(0, blockEnde).forEach((s, i) => {
        if (!CACHE(s) && !SCHLUESSEL(s)) return;
        const wer = CACHE(s) ? `Cache „${String((s.with || {}).path || "").trim()}"` : "Cache-Schlüssel";
        if (s.if) v.push(`(V) VORBEREITUNG: „${job}" ${wer} trägt eine Bedingung (${s.if}) — jede Gruppe braucht ihn`);
        if (npmCi >= 0 && i > npmCi) v.push(`(V) VORBEREITUNG: „${job}" ${wer} steht nach npm ci — die Installation las ihn nie`);
        const ids = [...String((s.with || {}).key || "").matchAll(/steps\.([\w-]+)\.outputs/g)].map((m) => m[1]);
        for (const id of ids)
            if (!steps.slice(0, i).some((x) => x.id === id))
                v.push(`(V) VORBEREITUNG: „${job}" ${wer} liest steps.${id}, der vor ihm nicht steht — sein Schlüssel wäre leer`);
    });
    const gruppen = new Set(Array.isArray(M) ? M : []);
    const je = new Map([...gruppen].map((g) => [g, 0]));
    for (const s of steps.slice(blockEnde)) {
        if (IST_VORBEREITUNG(s)) continue;
        const m = typeof s.if === "string" ? GRUPPE_RE.exec(s.if) : null;
        if (!s.if)
            v.push(`(G) N-FACH: „${name(s)}" trägt keine Gruppe — er liefe in jeder der ${gruppen.size} Gruppen von „${job}"`);
        else if (!m) v.push(`(G) UNKLAR: „${name(s)}" trägt die Bedingung „${s.if}" statt genau einer Gruppe`);
        else if (!gruppen.has(Number(m[1])))
            v.push(
                `(G) VERLOREN: „${name(s)}" trägt Gruppe ${m[1]}, die Matrix von „${job}" kennt ${[...gruppen].join(", ")} — er liefe nie`
            );
        else je.set(Number(m[1]), je.get(Number(m[1])) + 1);
    }
    for (const [g, n] of je)
        if (n === 0) v.push(`(G) LEER: „${job}" Gruppe ${g} trägt keinen Schritt (ein Läufer ohne Arbeit)`);
    return v;
}

// (V) KOPF (K61): der Kopf-Richter vor der vollen Batterie — unter VOLL_WENN, ohne Matrix, nie stumm (ein stummer Richter
// ließe bei einem Fehler der API die Batterie still aus), EIN Schritt außer checkout: scripts/ci-kopf.cjs mit id, dessen
// Ausgabe `voll` der Job weiterreicht
function kopfForm(doc) {
    const v = [];
    const K = doc && doc.jobs && doc.jobs[KOPF_JOB];
    if (!K) return [`(V) KOPF: kein Job „${KOPF_JOB}" — die volle Batterie richtet denselben Kopf auf jedem Zweig neu`];
    if (!istVollWenn(K.if)) v.push(`(V) KOPF: „${KOPF_JOB}" läuft unter „${K.if}" statt der EINEN Voll-Bedingung (${VOLL_WENN})`);
    if (needsVon(K).length) v.push(`(V) KOPF: „${KOPF_JOB}" wartet auf ${needsVon(K).join(", ")} — er steht am Anfang des Laufs`);
    if (K.strategy) v.push(`(V) KOPF: „${KOPF_JOB}" trägt eine Matrix — er richtet einmal je Lauf`);
    if (K["continue-on-error"] !== undefined && K["continue-on-error"] !== false)
        v.push(`(V) KOPF: „${KOPF_JOB}" trägt continue-on-error — ein Fehler der API ließe die Batterie still aus`);
    const eigen = (K.steps || []).filter((s) => !(typeof s.uses === "string" && s.uses.startsWith("actions/checkout@")));
    const r = eigen.find((s) => KOPF_LAUF.test(lauf(s)));
    if (eigen.length !== 1 || !r)
        v.push(
            `(V) KOPF: „${KOPF_JOB}" trägt ${eigen.length} Schritte neben checkout (${eigen.map(name).join(" · ") || "keinen"}) statt EINEM: node scripts/ci-kopf.cjs`
        );
    if (r) {
        if (r["continue-on-error"] !== undefined && r["continue-on-error"] !== false)
            v.push(`(V) KOPF: der Richter-Schritt trägt continue-on-error — ein Fehler der API ließe die Batterie still aus`);
        if (r.if !== undefined) v.push(`(V) KOPF: der Richter-Schritt trägt die Bedingung „${r.if}"`);
        const soll = r.id ? `\${{ steps.${r.id}.outputs.voll }}` : null;
        if (!soll || normWenn((K.outputs || {}).voll) !== soll)
            v.push(`(V) KOPF: „${KOPF_JOB}" reicht outputs.voll nicht aus dem Richter-Schritt (Soll ${soll || "eine id am Schritt"})`);
    }
    return v;
}

// (E) DIE ECHT-GRUPPE (K65): der Job `echt` fährt auf dem eigenen Läufer (runs-on genau self-hosted + omen-gpu) nur bei push
// auf integ-probe und main hinter dem Kopf-Richter (ECHT_WENN — nie pull_request, nie ein Karten-Zweig), ohne Matrix und nie
// stumm, mit der Klasse gpu und der Weiche `karte` (ECHT_ENV), den Deckel für Warten am Schloss plus Lauf; nach der
// Vorbereitung (checkout · setup-node · npm ci, ohne Bedingung) GENAU EIN Schritt scripts/ci-echt.cjs — er liest die
// GPU-Klasse aus `voll`, die nicht leer und ganz fahrbar ist —, daneben nur Schritte, die eine Wand fahren (ohne Bedingung).
// → [Befund]
function echtForm(doc) {
    const v = [];
    const E = doc && doc.jobs && doc.jobs[ECHT_JOB];
    if (!E) return v;
    const an = (x) => x !== undefined && x !== false && x !== "false";
    if (normWenn(E.if) !== normWenn(ECHT_WENN))
        v.push(`(E) ECHT: „${ECHT_JOB}" läuft unter „${E.if}" statt nur bei push auf integ-probe und main hinter dem Kopf-Richter (${ECHT_WENN})`);
    if (!needsVon(E).includes(KOPF_JOB)) v.push(`(E) ECHT: „${ECHT_JOB}" wartet nicht auf „${KOPF_JOB}" — ein schon gerichteter Kopf führe die Karte noch einmal`);
    const ro = [].concat(E["runs-on"] || []);
    if (ro.length !== ECHT_LAEUFER.length || !ECHT_LAEUFER.every((x) => ro.includes(x)))
        v.push(`(E) ECHT: „${ECHT_JOB}" läuft auf ${JSON.stringify(E["runs-on"])} statt ${JSON.stringify(ECHT_LAEUFER)} — der Läufer mit der Karte`);
    if (E.strategy) v.push(`(E) ECHT: „${ECHT_JOB}" trägt eine Matrix — ein Läufer, die Gruppen seriell in EINEM Schritt`);
    if (an(E["continue-on-error"])) v.push(`(E) ECHT: „${ECHT_JOB}" trägt continue-on-error — sein Rot verpuffte`);
    if (!(Number(E["timeout-minutes"]) > 0 && Number(E["timeout-minutes"]) <= ECHT_DECKEL_MIN))
        v.push(`(E) ECHT: „${ECHT_JOB}" timeout-minutes ${E["timeout-minutes"]} (Soll 1–${ECHT_DECKEL_MIN}: Warten am Schloss plus Lauf)`);
    for (const [k, w] of Object.entries(ECHT_ENV))
        if (!E.env || String(E.env[k]) !== w) v.push(`(E) ECHT: „${ECHT_JOB}" env ${k} ist „${E.env && E.env[k]}" statt „${w}"`);
    const steps = E.steps || [];
    const VORB_ECHT = VORBEREITUNG.filter(([n]) => n !== "System-Libs");
    VORB_ECHT.forEach(([n, f], i) => {
        const s = steps[i];
        if (!s || !f(s)) v.push(`(E) VORBEREITUNG: „${ECHT_JOB}" Schritt ${i + 1} ist nicht „${n}" (${s ? name(s) : "fehlt"})`);
        else if (s.if) v.push(`(E) VORBEREITUNG: „${ECHT_JOB}" „${n}" trägt eine Bedingung (${s.if})`);
    });
    const eigen = steps.slice(VORB_ECHT.length);
    const laeufer = eigen.filter((s) => ECHT_LAUF.test(lauf(s)));
    if (laeufer.length !== 1)
        v.push(`(E) ECHT: „${ECHT_JOB}" trägt ${laeufer.length} Schritte node scripts/ci-echt.cjs statt GENAU EINEM`);
    for (const s of eigen) {
        if (s.if !== undefined) v.push(`(E) ECHT: „${name(s)}" trägt die Bedingung „${s.if}" — jeder Schritt der Echt-Gruppe läuft`);
        if (an(s["continue-on-error"])) v.push(`(E) ECHT: „${name(s)}" trägt continue-on-error`);
        if (!ECHT_LAUF.test(lauf(s)) && !/^npm run gate:[\w:.-]+$/.test(lauf(s)))
            v.push(`(E) ECHT: „${name(s)}" ist weder der Läufer noch EINE Wand (npm run gate:…) — „${lauf(s).split("\n")[0]}"`);
    }
    let gpu = [];
    try {
        gpu = echtSchritte(doc);
    } catch (e) {
        v.push(`(E) ECHT: die GPU-Klasse ist nicht zu lesen (${e.message})`);
    }
    if (!gpu.length) v.push(`(E) ECHT: die volle Batterie trägt keinen Schritt der Klasse gpu — die Echt-Gruppe führe leer`);
    for (const s of gpu.filter((x) => x.fehler)) v.push(`(E) ECHT: „${s.name}" (Gruppe ${s.gruppe}) ist auf dem Läufer nicht zu fahren: ${s.fehler}`);
    // DIE AUSWAHL NACH WERT (die push-Stufe): jeder Name in der GPU-Klasse, jede Wert-Klasse bekannt, jede GTX-Zeit gemessen,
    // die Summe samt Vorbereitung im Budget
    const ap = path.join(root, AUSWAHL);
    if (!fs.existsSync(ap)) v.push(`(E) AUSWAHL: ${AUSWAHL} fehlt — die push-Stufe hätte keine Auswahl`);
    else if (gpu.length) for (const b of auswahlUrteil(JSON.parse(fs.readFileSync(ap, "utf8")), gpu).befunde) v.push(`(E) AUSWAHL: ${b}`);
    return v;
}

// (V) SCHLÜSSEL (K61) über ALLE Workflows: ein Cache-Schlüssel hasht nur, was der Cache trägt
const VERSIONS_HASH = /hashFiles\(([^)]*\bpackage(?:-lock)?\.json[^)]*)\)/;
function schluesselUrteil(docs) {
    const v = [];
    for (const [datei, doc] of Object.entries(docs))
        for (const [job, J] of Object.entries((doc && doc.jobs) || {}))
            for (const s of J.steps || []) {
                const u = typeof s.uses === "string" ? s.uses : "";
                const w = s.with || {};
                if (u.startsWith("actions/setup-node@") && w.cache)
                    v.push(
                        `(V) SCHLÜSSEL: „${datei} ${job}" setup-node cache: ${w.cache} — sein Schlüssel ist der Hash des Lockfiles samt ` +
                            `Projektversion, ohne restore-keys: jede Versions-Stufe lädt alles neu (den Schlüssel trägt scripts/ci-schluessel.cjs)`
                    );
                if (!CACHE(s)) continue;
                const wo = `„${datei} ${job}" Cache „${String(w.path || "").trim()}"`;
                const m = VERSIONS_HASH.exec(String(w.key || ""));
                if (m)
                    v.push(
                        `(V) SCHLÜSSEL: ${wo} hasht ${m[1].trim()} — die Datei trägt die Projektversion: jede Versions-Stufe verliert den Cache`
                    );
                if (!String(w["restore-keys"] || "").trim())
                    v.push(`(V) SCHLÜSSEL: ${wo} ohne restore-keys — ein neuer Schlüssel beginnt leer`);
            }
    return v;
}

// (K) DIE KLASSE (K61): jede Voll-Gruppe trägt GENAU eine Klasse (`strategy.matrix.include` { gruppe, klasse: cpu | gpu }),
// der Job reicht sie als CI_KLASSE an seine Schritte — die Weiche (scripts/lib/welt-boot.cjs) urteilt zur Laufzeit: ein
// Echt-Rezept in einer CPU-Gruppe ist ROT beim Namen. Statisch (scripts/lib/ci-klasse.cjs): ein Schritt mit Echt-Rezept steht in
// einer GPU-Gruppe, eine GPU-Gruppe trägt keinen Schritt ohne — die GPU-Gruppen sind die Arbeit eines GPU-Läufers.
const KLASSEN_CI = ["cpu", "gpu"];
const CI_KLASSE_ENV = "${{ matrix.klasse }}";
function klassenUrteil(doc, skripte, lies) {
    const v = [];
    const J = doc && doc.jobs && doc.jobs[VOLL_JOB];
    if (!J) return v;
    const M = (J.strategy && J.strategy.matrix) || {};
    const gruppen = Array.isArray(M.gruppe) ? M.gruppe : [];
    const klasse = new Map();
    for (const e of Array.isArray(M.include) ? M.include : []) {
        if (!e || !gruppen.includes(e.gruppe)) v.push(`(K) KLASSE: matrix.include ${JSON.stringify(e)} nennt keine Gruppe der Matrix`);
        else if (!KLASSEN_CI.includes(e.klasse))
            v.push(`(K) KLASSE: Gruppe ${e.gruppe} trägt die Klasse „${e.klasse}" (Soll ${KLASSEN_CI.join(" oder ")})`);
        else if (klasse.has(e.gruppe)) v.push(`(K) KLASSE: Gruppe ${e.gruppe} trägt zwei Klassen`);
        else klasse.set(e.gruppe, e.klasse);
    }
    for (const g of gruppen)
        if (!klasse.has(g))
            v.push(`(K) KLASSE: Gruppe ${g} von „${VOLL_JOB}" trägt keine Klasse (matrix.include { gruppe: ${g}, klasse: cpu | gpu })`);
    if (!J.env || J.env.CI_KLASSE !== CI_KLASSE_ENV)
        v.push(`(K) KLASSE: „${VOLL_JOB}" reicht die Klasse nicht als CI_KLASSE: ${CI_KLASSE_ENV} an seine Schritte — die Weiche urteilt blind`);
    for (const s of J.steps || []) {
        if (!s.run || IST_VORBEREITUNG(s)) continue;
        const m = typeof s.if === "string" ? GRUPPE_RE.exec(s.if) : null;
        if (!m) continue; // (G) urteilt
        const g = Number(m[1]);
        const k = klasseDesLaufs(s.run, skripte, lies);
        if (klasse.get(g) === "cpu" && k.klasse === "gpu")
            v.push(`(K) CPU-GRUPPE: „${name(s)}" (Gruppe ${g}) startet ein Echt-Rezept — ${k.wo}`);
        if (klasse.get(g) === "gpu" && k.klasse === "cpu")
            v.push(`(K) GPU-GRUPPE: „${name(s)}" (Gruppe ${g}) braucht keinen Echt-Renderer — er gehört in eine CPU-Gruppe`);
    }
    return v;
}
function selbsttestKlasse() {
    const dateien = {
        "a.cjs": 'starteBrowser({ art: "null" });',
        "g.cjs": 'const { x } = require("./lib/h.cjs");',
        "lib/h.cjs": 'starteBrowser({ art: "linse", frist: 1 });',
        "b.cjs": 'const BILD = process.argv.includes("--bild");\nstarteBrowser({ art: BILD ? "linse" : "null" });',
    };
    const lies = (f) => {
        const k = Object.keys(dateien).find((d) => f.replace(/\\/g, "/").endsWith("/scripts/" + d));
        return k ? dateien[k] : null;
    };
    const skripte = {
        "gate:a": "node scripts/a.cjs",
        "gate:g": "node scripts/g.cjs",
        "gate:b": "node scripts/b.cjs",
        "gate:b-bild": "node scripts/b.cjs --bild",
    };
    const doc = () => ({
        jobs: {
            voll: {
                if: VOLL_WENN,
                env: { CI_KLASSE: CI_KLASSE_ENV },
                strategy: {
                    "fail-fast": false,
                    matrix: {
                        gruppe: [1, 2],
                        include: [
                            { gruppe: 1, klasse: "cpu" },
                            { gruppe: 2, klasse: "gpu" },
                        ],
                    },
                },
                steps: [
                    { name: "A", if: "matrix.gruppe == 1", run: "npm run gate:a" },
                    { name: "B", if: "matrix.gruppe == 1", run: "npm run gate:b" },
                    { name: "G", if: "matrix.gruppe == 2", run: "npm run gate:g" },
                    { name: "B-Bild", if: "matrix.gruppe == 2", run: "npm run gate:b-bild" },
                ],
            },
        },
    });
    const V = (d) => d.jobs.voll;
    const faelle = [
        ["die Klassen im Lot (grün)", () => {}, null],
        ["ein Echt-Rezept über eine lib in der CPU-Gruppe", (d) => (V(d).steps[2].if = "matrix.gruppe == 1"), /\(K\) CPU-GRUPPE: „G" \(Gruppe 1\) startet ein Echt-Rezept — scripts\/g\.cjs → scripts\/lib\/h\.cjs/],
        ["der Schalter --bild macht den Zweig echt", (d) => (V(d).steps[3].if = "matrix.gruppe == 1"), /\(K\) CPU-GRUPPE: „B-Bild" \(Gruppe 1\)/],
        ["ein CPU-Schritt in der GPU-Gruppe", (d) => (V(d).steps[1].if = "matrix.gruppe == 2"), /\(K\) GPU-GRUPPE: „B" \(Gruppe 2\) braucht keinen Echt-Renderer/],
        ["eine Gruppe ohne Klasse", (d) => V(d).strategy.matrix.include.pop(), /\(K\) KLASSE: Gruppe 2 von „voll" trägt keine Klasse/],
        ["eine fremde Klasse", (d) => (V(d).strategy.matrix.include[0].klasse = "tpu"), /\(K\) KLASSE: Gruppe 1 trägt die Klasse „tpu"/],
        ["die Klasse reist nicht an die Schritte", (d) => delete V(d).env, /\(K\) KLASSE: „voll" reicht die Klasse nicht als CI_KLASSE/],
    ];
    const f = [];
    for (const [n, tat, soll] of faelle) {
        const d = doc();
        tat(d);
        const u = klassenUrteil(d, skripte, lies);
        const ok = soll ? u.some((x) => soll.test(x)) : u.length === 0;
        console.log(`  ${ok ? "✅" : "❌"} Selbsttest „${n}" → ${u.join(" · ") || "grün"}`);
        if (!ok) f.push(`„${n}" fällt nicht rot beim Namen (${u.join(" · ") || "grün"})`);
    }
    return f;
}

// (T) DIE WAAGE: je Job und Gruppe die Vorbereitung plus die Median-Zeiten ihrer Schritte. Ein Job ohne Bedingung läuft je
// Push (Deckel 2 min), die volle Stufe (der Kopf-Richter und die Batterie hinter ihm) trägt die Breite (7 min je Gruppe);
// ein Job ohne Matrix ist EINE Gruppe. Dazu (K61) die PLÄTZE: die Jobs, die ein voller Lauf zugleich fährt (ein Job, auf den
// ein anderer wartet, endet vor ihm), ≤ LAEUFER_PLAETZE — und die WANDUHR: der längste Weg durch den Lauf (der Puls, der
// Kopf-Richter samt der schwersten Voll-Gruppe) ≤ 8 min.
// → { v: Befunde, zeilen: je Gruppe „job g/N: x,y min", plaetze, wanduhr_s }
const minuten = (s) => (s / 60).toFixed(1).replace(".", ",");
const WANDUHR_S = 480;
function waage(doc, zeiten) {
    const v = [];
    const zeilen = [];
    const Z = (zeiten && zeiten.schritte) || {};
    const vorb = zeiten && Number(zeiten.vorbereitung_s);
    if (!(vorb >= 0)) return { v: [`(T) ZEITEN: ${ZEITEN} trägt keine vorbereitung_s`], zeilen };
    const imLauf = [];
    const schwerste = new Map();
    for (const [job, J] of Object.entries((doc && doc.jobs) || {})) {
        const art = J.if === undefined && !needsVon(J).length ? "push" : imVollenLauf(doc, job) ? "voll" : null;
        if (!art) continue; // eine andere Bedingung urteilt (V)/(S)
        const M = (J.strategy && J.strategy.matrix && J.strategy.matrix.gruppe) || null;
        const gs = Array.isArray(M) ? M : [null];
        imLauf.push([job, J, gs.length]);
        const steps = (J.steps || []).filter((s) => s.run && !IST_VORBEREITUNG(s));
        for (const g of gs) {
            const mein = steps.filter((s) => {
                const m = typeof s.if === "string" ? GRUPPE_RE.exec(s.if) : null;
                return g === null || !s.if || (m && Number(m[1]) === g);
            });
            let summe = vorb;
            let groesster = null;
            for (const s of mein) {
                const z = Z[name(s)];
                if (!z || !(Number(z.s) >= 0)) {
                    v.push(
                        `(T) UNGEMESSEN: „${name(s)}" (${job}) trägt keine Zeit in ${ZEITEN} — messen (node scripts/ci-zeiten.cjs) ` +
                            `oder mit „geschaetzt" und Quelle eintragen`
                    );
                    continue;
                }
                summe += z.s;
                if (!groesster || z.s > groesster[1]) groesster = [name(s), z.s];
            }
            const kl = ((J.strategy && J.strategy.matrix && J.strategy.matrix.include) || []).find((e) => e && e.gruppe === g);
            const wer = g === null ? job : `${job} ${g}/${gs.length}` + (kl && kl.klasse ? ` ${kl.klasse}` : "");
            zeilen.push(`${wer} ${minuten(summe)}`);
            if (!schwerste.has(job) || summe > schwerste.get(job)[1]) schwerste.set(job, [wer, summe]);
            if (summe > WAAGE_S[art])
                v.push(
                    `(T) WAAGE: „${wer}" trägt ${minuten(summe)} min (Deckel ${minuten(WAAGE_S[art])} min ${art === "push" ? "je Push" : "je Voll-Gruppe"})` +
                        (groesster ? ` — der größte Schritt „${groesster[0]}" ${minuten(groesster[1])} min` : "")
                );
        }
    }
    // (T) PLÄTZE: zugleich laufen alle Jobs des vollen Laufs außer denen, auf die ein anderer wartet
    const gewartet = new Set(imLauf.flatMap(([, J]) => needsVon(J)));
    const zugleich = imLauf.filter(([job]) => !gewartet.has(job));
    const plaetze = zugleich.reduce((a, [, , n]) => a + n, 0);
    if (plaetze > LAEUFER_PLAETZE)
        v.push(
            `(T) PLÄTZE: ein voller Lauf fährt ${plaetze} Jobs zugleich (${zugleich.map(([j, , n]) => `${j} ${n}`).join(" · ")}) — ` +
                `das Konto hat ${LAEUFER_PLAETZE} Läufer-Plätze: ${plaetze - LAEUFER_PLAETZE} warten auf einen freien Platz und tragen die Wanduhr doppelt`
        );
    // (T) WANDUHR: der längste Weg — je Job seine schwerste Gruppe plus die schwersten Gruppen der Jobs, auf die er wartet
    const weg = (job, tiefe = 0) => {
        const J = doc.jobs[job];
        const eigen = schwerste.has(job) ? schwerste.get(job)[1] : 0;
        const vor = tiefe < 8 ? needsVon(J).map((n) => (doc.jobs[n] ? weg(n, tiefe + 1) : [0, ""])) : [];
        const v0 = vor.reduce((m, x) => (x[0] > m[0] ? x : m), [0, ""]);
        return [v0[0] + eigen, (v0[1] ? v0[1] + " → " : "") + (schwerste.has(job) ? schwerste.get(job)[0] : job)];
    };
    const wege = imLauf.map(([job]) => weg(job));
    const laengster = wege.reduce((m, x) => (x[0] > m[0] ? x : m), [0, ""]);
    if (laengster[0] > WANDUHR_S)
        v.push(
            `(T) WANDUHR: der längste Weg „${laengster[1]}" trägt ${minuten(laengster[0])} min (Ziel ${minuten(WANDUHR_S)} min je vollem Lauf)`
        );
    return { v, zeilen, plaetze, wanduhr: laengster };
}

// (Z) die Gate-Schritte zweier Stände: was fehlt nachher, was steht nachher öfter als vorher
// (ein Schritt, dessen Befehle nachher ein anderer Schritt fährt — z. B. in `npm run check` gewandert — ist nicht verloren)
function vergleich(vorher, nachher, skripte = {}) {
    const zahl = (doc) => {
        const m = new Map();
        for (const s of gateSchritte(doc)) m.set(s.run, (m.get(s.run) || 0) + 1);
        return m;
    };
    const a = zahl(vorher),
        b = zahl(nachher);
    // (Z) ist der Bau-Vergleich der Schritte; ob ein Schritt sein Rot hält, urteilt (W)/(S)
    const gefahren = new Set(ciSchritte({ nachher }, skripte).flatMap((s) => s.teile.map((t) => t.t)));
    const verloren = [...a]
        .filter(([r, n]) => (b.get(r) || 0) < n && !aufloesen(r, skripte).every((t) => gefahren.has(t.t)))
        .map(([r]) => r);
    const doppelt = [...b].filter(([r, n]) => n > Math.max(1, a.get(r) || 0)).map(([r]) => r);
    const neu = [...b].filter(([r]) => !a.has(r)).map(([r]) => r);
    return {
        vorher: [...a.values()].reduce((x, y) => x + y, 0),
        nachher: [...b.values()].reduce((x, y) => x + y, 0),
        verloren,
        doppelt,
        neu,
    };
}

function gruppenBericht(doc) {
    return GRUPPEN_JOBS.map((job) => {
        const je = new Map();
        for (const s of gateSchritte(doc)) if (s.job === job) je.set(s.gruppe, (je.get(s.gruppe) || 0) + 1);
        return (
            `${job} ` +
            [...je]
                .sort((x, y) => x[0] - y[0])
                .map(([g, n]) => `${g}: ${n}`)
                .join(" · ")
        );
    }).join(" | ");
}

// Fixture-Bausteine (K61): der Kopf-Richter in seiner Form, ein Cache-Schritt
const kopfJob = () => ({
    if: VOLL_WENN,
    outputs: { voll: "${{ steps.kopf.outputs.voll }}" },
    steps: [{ uses: "actions/checkout@v4" }, { name: "Kopf", id: "kopf", run: "node scripts/ci-kopf.cjs" }],
});
const cacheSchritt = (p, key, restore = p.replace(/\W+/g, "") + "-") => ({
    uses: "actions/cache@v4",
    with: { path: p, key, ...(restore ? { "restore-keys": restore } : {}) },
});

// (V) SCHLÜSSEL gegen Fixtures: die Form der Caches über alle Workflows — und `schluessel()` gegen Lockfiles, die sich nur
// in der Projektversion unterscheiden (gleicher Schlüssel) oder in einer Abhängigkeit (anderer Schlüssel)
function selbsttestSchluessel() {
    const doc = () => ({
        jobs: {
            voll: {
                steps: [
                    { uses: "actions/checkout@v4" },
                    { uses: "actions/setup-node@v4", with: { "node-version": "22" } },
                    { name: "Cache-Schlüssel", id: "schluessel", run: "node scripts/ci-schluessel.cjs" },
                    cacheSchritt("~/.npm", "npm-${{ runner.os }}-${{ steps.schluessel.outputs.npm }}", "npm-${{ runner.os }}-"),
                    cacheSchritt(
                        "~/.cache/puppeteer",
                        "puppeteer-${{ runner.os }}-${{ steps.schluessel.outputs.chrome }}",
                        "puppeteer-${{ runner.os }}-"
                    ),
                ],
            },
        },
    });
    const S = (d) => d.jobs.voll.steps;
    const faelle = [
        ["die Caches am Inhalt (grün)", () => {}, null],
        [
            "setup-node mit eigenem Cache",
            (d) => (S(d)[1].with.cache = "npm"),
            /\(V\) SCHLÜSSEL: „t\.yml voll" setup-node cache: npm — sein Schlüssel ist der Hash des Lockfiles/,
        ],
        [
            "der Chrome am Lockfile (K61-Befund)",
            (d) => (S(d)[4].with.key = "puppeteer-${{ runner.os }}-${{ hashFiles('package-lock.json') }}"),
            /\(V\) SCHLÜSSEL: „t\.yml voll" Cache „~\/\.cache\/puppeteer" hasht 'package-lock\.json' — die Datei trägt die Projektversion/,
        ],
        [
            "ein Cache an package.json",
            (d) => (S(d)[3].with.key = "npm-${{ hashFiles('**/package.json') }}"),
            /\(V\) SCHLÜSSEL: „t\.yml voll" Cache „~\/\.npm" hasht '\*\*\/package\.json'/,
        ],
        [
            "ein Cache ohne restore-keys",
            (d) => delete S(d)[4].with["restore-keys"],
            /\(V\) SCHLÜSSEL: „t\.yml voll" Cache „~\/\.cache\/puppeteer" ohne restore-keys/,
        ],
    ];
    const f = [];
    for (const [n, tat, soll] of faelle) {
        const d = doc();
        tat(d);
        const u = schluesselUrteil({ "t.yml": d });
        const ok = soll ? u.some((x) => soll.test(x)) : u.length === 0;
        console.log(`  ${ok ? "✅" : "❌"} Selbsttest „${n}" → ${u.join(" · ") || "grün"}`);
        if (!ok) f.push(`„${n}" fällt nicht rot beim Namen (${u.join(" · ") || "grün"})`);
    }
    const lock = (pv = "1.0.0", a = "1.2.3", pc = "24.43.1", dep = "^1.2.0") => ({
        name: "p",
        version: pv,
        lockfileVersion: 3,
        packages: {
            "": { name: "p", version: pv, dependencies: { a: dep, "puppeteer-core": "^24.0.0" } },
            "node_modules/a": { version: a },
            "node_modules/puppeteer-core": { version: pc },
        },
    });
    const k0 = schluessel(lock());
    const proben = [
        ["eine Versions-Stufe (V18.546.1 → .2)", schluessel(lock("1.0.1")), true, true],
        ["eine Abhängigkeit neu", schluessel(lock("1.0.0", "1.2.4")), false, true],
        ["ein Abhängigkeits-Bereich neu", schluessel(lock("1.0.0", "1.2.3", "24.43.1", "^1.3.0")), false, true],
        ["puppeteer-core neu (ein anderer Chrome)", schluessel(lock("1.0.0", "1.2.3", "24.44.0")), false, false],
    ];
    for (const [n, k, npmGleich, chromeGleich] of proben) {
        const ok = (k.npm === k0.npm) === npmGleich && (k.chrome === k0.chrome) === chromeGleich;
        console.log(
            `  ${ok ? "✅" : "❌"} Selbsttest Schlüssel „${n}" → npm ${k.npm === k0.npm ? "gleich" : "neu"} · chrome ${k.chrome === k0.chrome ? "gleich" : "neu"}`
        );
        if (!ok) f.push(`Schlüssel „${n}": npm ${npmGleich ? "soll gleich" : "soll neu"}, chrome ${chromeGleich ? "soll gleich" : "soll neu"}`);
    }
    return f;
}

// (V) KOPF: das Urteil des Kopf-Richters (scripts/ci-kopf.cjs) gegen die Fälle
function selbsttestKopf() {
    const gruen = (id, event = "push", voll = ["success", "success"]) => ({
        lauf: { id, event, status: "completed", conclusion: "success", head_branch: "integ-probe" },
        jobs: [{ name: "puls 1/2", conclusion: "success" }].concat(voll.map((c, i) => ({ name: `voll ${i + 1}/2 cpu`, conclusion: c }))),
    });
    const fall = (ereignis, ...laeufe) => ({
        ereignis,
        eigenerLauf: 9,
        laeufe: laeufe.map((x) => x.lauf),
        jobsJe: Object.fromEntries(laeufe.map((x) => [x.lauf.id, x.jobs])),
    });
    const faelle = [
        ["derselbe Kopf grün auf integ-probe (d2e06032)", fall("push", gruen(1)), "nein"],
        ["kein anderer Lauf", fall("push"), "ja"],
        ["nur der eigene Lauf", fall("push", gruen(9)), "ja"],
        ["nachts läuft sie immer", fall("schedule", gruen(1)), "ja"],
        ["auf Abruf läuft sie immer", fall("workflow_dispatch", gruen(1)), "ja"],
        ["ein PR prüft den Merge, nie den Kopf", fall("pull_request", gruen(1)), "ja"],
        ["der grüne Lauf war ein PR", fall("push", gruen(1, "pull_request")), "ja"],
        ["der grüne Lauf trug nur den Puls", fall("push", gruen(1, "push", [])), "ja"],
        ["eine Voll-Gruppe übersprungen", fall("push", gruen(1, "push", ["success", "skipped"])), "ja"],
        [
            "der andere Lauf läuft noch",
            fall("push", { ...gruen(1), lauf: { ...gruen(1).lauf, status: "in_progress", conclusion: null } }),
            "ja",
        ],
    ];
    const f = [];
    for (const [n, e, soll] of faelle) {
        const u = kopfUrteil(e);
        const ok = u.voll === soll;
        console.log(`  ${ok ? "✅" : "❌"} Selbsttest Kopf „${n}" → voll=${u.voll} (${u.grund})`);
        if (!ok) f.push(`Kopf „${n}": voll=${u.voll} statt ${soll}`);
    }
    return f;
}

function selbsttest() {
    const prep = () => [
        { uses: "actions/checkout@v4" },
        { uses: "actions/setup-node@v4" },
        { name: "System-Libs", run: "sudo apt-get install -y libnss3" },
        { name: "Dependencies", run: "npm ci --no-audit --no-fund" },
    ];
    const gut = () => ({
        jobs: {
            puls: {
                strategy: { "fail-fast": false, matrix: { gruppe: [1] } },
                "timeout-minutes": 10,
                steps: prep().concat([{ name: "Lint", if: "matrix.gruppe == 1", run: "npm run lint" }]),
            },
            kopf: kopfJob(),
            voll: {
                needs: KOPF_JOB,
                if: VOLL_NACH_KOPF,
                strategy: { "fail-fast": false, matrix: { gruppe: [1, 2] } },
                "timeout-minutes": 30,
                steps: prep().concat([
                    { name: "A", if: "matrix.gruppe == 1", run: "npm run gate:a" },
                    { name: "B", if: "matrix.gruppe == 2", run: "npm run gate:b" },
                    { name: "C", if: "matrix.gruppe == 1", run: "npm run gate:c" },
                ]),
            },
        },
    });
    const vorher = {
        jobs: {
            check: { steps: [{ name: "Lint", run: "npm run lint" }] },
            playtest: {
                steps: prep().concat([
                    { name: "A", run: "npm run gate:a" },
                    { name: "B", run: "npm run gate:b" },
                    { name: "C", run: "npm run gate:c" },
                ]),
            },
        },
    };
    const V = (d) => d.jobs.voll;
    const faelle = [
        ["ohne Gruppe (er liefe N-fach)", (d) => delete V(d).steps[5].if, /\(G\) N-FACH: „B"/],
        [
            "Gruppe außerhalb der Matrix (er liefe nie)",
            (d) => (V(d).steps[5].if = "matrix.gruppe == 3"),
            /\(G\) VERLOREN: „B" trägt Gruppe 3/,
        ],
        [
            "zwei Gruppen in einer Bedingung",
            (d) => (V(d).steps[5].if = "matrix.gruppe == 1 || matrix.gruppe == 2"),
            /\(G\) UNKLAR: „B"/,
        ],
        ["eine Gruppe ohne Schritt", (d) => (V(d).steps[5].if = "matrix.gruppe == 1"), /\(G\) LEER: „voll" Gruppe 2/],
        [
            "derselbe Schritt in zwei Gruppen",
            (d) => V(d).steps.push({ name: "A2", if: "matrix.gruppe == 2", run: "npm run gate:a" }),
            /\(D\) DOPPELT: „npm run gate:a" läuft 2×/,
        ],
        [
            "ein Gate im Puls und in einer Voll-Gruppe",
            (d) => d.jobs.puls.steps.push({ name: "C", if: "matrix.gruppe == 1", run: "npm run gate:c" }),
            /\(D\) DOPPELT: „npm run gate:c" läuft 2×/,
        ],
        ["fail-fast an", (d) => delete V(d).strategy["fail-fast"], /\(V\) FAIL-FAST: „voll"/],
        ["Deckel über 45", (d) => (V(d)["timeout-minutes"] = 60), /\(V\) DECKEL: „voll" timeout-minutes 60/],
        ["npm ci fehlt", (d) => V(d).steps.splice(3, 1), /\(V\) VORBEREITUNG: „voll" Schritt 4 ist nicht „npm ci"/],
        [
            "Vorbereitung nur in Gruppe 1",
            (d) => (d.jobs.puls.steps[2].if = "matrix.gruppe == 1"),
            /\(V\) VORBEREITUNG: „puls" „System-Libs" trägt eine Bedingung/,
        ],
        ["keine Matrix", (d) => delete V(d).strategy.matrix, /\(V\) MATRIX: „voll"/],
        // die zwei Stufen (K14): genau puls und voll, der Puls ohne Bedingung, voll unter der EINEN Bedingung
        [
            "ein dritter Job neben puls und voll",
            (d) => (d.jobs.check = { steps: [{ name: "X", run: "npm run gate:x" }] }),
            /\(V\) JOB: „check" steht außerhalb von puls und voll/,
        ],
        [
            "voll unter einer anderen Bedingung",
            (d) => (V(d).if = "github.ref == 'refs/heads/main'"),
            /\(V\) BEDINGUNG: „voll" läuft unter „github\.ref == 'refs\/heads\/main'"/,
        ],
        [
            "der Puls unter einer Bedingung",
            (d) => (d.jobs.puls.if = "github.ref == 'refs/heads/main'"),
            /\(V\) PULS: „puls" trägt die Bedingung/,
        ],
        ["kein Job voll", (d) => delete d.jobs.voll, /\(V\) LEER: kein Job „voll"/],
        // EIN URTEIL JE KOPF (K61): der Kopf-Richter vor der Batterie, nie stumm, EIN Schritt
        ["kein Kopf-Richter", (d) => delete d.jobs.kopf, /\(V\) KOPF: kein Job „kopf"/],
        [
            "die Batterie ohne den Kopf-Richter",
            (d) => {
                V(d).if = VOLL_WENN;
                delete V(d).needs;
            },
            /\(V\) BEDINGUNG: „voll" läuft unter „github\.event_name == 'schedule'.*" ohne needs: kopf/,
        ],
        [
            "der Kopf-Richter unter einer anderen Bedingung",
            (d) => (d.jobs.kopf.if = "github.ref == 'refs/heads/main'"),
            /\(V\) KOPF: „kopf" läuft unter „github\.ref == 'refs\/heads\/main'"/,
        ],
        [
            "der Kopf-Richter stumm",
            (d) => (d.jobs.kopf.steps[1]["continue-on-error"] = true),
            /\(V\) KOPF: der Richter-Schritt trägt continue-on-error/,
        ],
        [
            "ein Gate im Kopf-Richter",
            (d) => d.jobs.kopf.steps.push({ name: "X", run: "npm run gate:x" }),
            /\(V\) KOPF: „kopf" trägt 2 Schritte neben checkout/,
        ],
        ["die Ausgabe nicht weitergereicht", (d) => delete d.jobs.kopf.outputs, /\(V\) KOPF: „kopf" reicht outputs\.voll nicht/],
        ["der Puls wartet auf den Kopf", (d) => (d.jobs.puls.needs = KOPF_JOB), /\(V\) PULS: „puls" .*wartet auf kopf/],
        // die Caches (K61): der Schlüssel vor dem Cache, der Cache vor npm ci
        [
            "ein Cache nach npm ci",
            (d) => V(d).steps.splice(4, 0, cacheSchritt("~/.npm", "npm-${{ runner.os }}-x")),
            /\(V\) VORBEREITUNG: „voll" Cache „~\/\.npm" steht nach npm ci/,
        ],
        [
            "der Cache vor seinem Schlüssel",
            (d) => V(d).steps.splice(1, 0, cacheSchritt("~/.npm", "npm-${{ runner.os }}-${{ steps.schluessel.outputs.npm }}")),
            /\(V\) VORBEREITUNG: „voll" Cache „~\/\.npm" liest steps\.schluessel, der vor ihm nicht steht/,
        ],
    ];
    const f = [];
    const g0 = urteil(gut());
    if (g0.length) f.push("der gute Stand ist rot: " + g0.join(" · "));
    for (const [n, tat, soll] of faelle) {
        const d = gut();
        tat(d);
        const u = urteil(d);
        const ok = u.some((x) => soll.test(x));
        console.log(`  ${ok ? "✅" : "❌"} Selbsttest „${n}" → ${u.join(" · ") || "grün"}`);
        if (!ok) f.push(`„${n}" fällt nicht rot beim Namen (${u.join(" · ") || "grün"})`);
    }
    // (Z) vorher ein Job, nachher die Gruppen: gleich; ein Schritt fällt bei der Teilung, einer doppelt
    const z0 = vergleich(vorher, gut());
    if (z0.verloren.length || z0.doppelt.length) f.push("(Z) die gute Teilung meldet " + JSON.stringify(z0));
    const weg = gut();
    V(weg).steps.splice(6, 1);
    const z1 = vergleich(vorher, weg);
    const ok1 = z1.verloren.length === 1 && z1.verloren[0] === "npm run gate:c";
    console.log(
        `  ${ok1 ? "✅" : "❌"} Selbsttest „bei der Teilung verloren" → verloren ${JSON.stringify(z1.verloren)}`
    );
    if (!ok1) f.push("(Z) ein bei der Teilung verlorener Schritt steht nicht beim Namen");
    const zwei = gut();
    V(zwei).steps.push({ name: "C2", if: "matrix.gruppe == 2", run: "npm run gate:c" });
    const z2 = vergleich(vorher, zwei);
    const ok2 = z2.doppelt.length === 1 && z2.doppelt[0] === "npm run gate:c";
    console.log(`  ${ok2 ? "✅" : "❌"} Selbsttest „bei der Teilung doppelt" → doppelt ${JSON.stringify(z2.doppelt)}`);
    if (!ok2) f.push("(Z) ein bei der Teilung verdoppelter Schritt steht nicht beim Namen");
    const z3 = vergleich(
        { jobs: { check: { steps: [{ name: "Q", run: "npm run gate:q" }] } } },
        { jobs: { check: { steps: [{ name: "Statik", run: "npm run check" }] } } },
        { check: "node scripts/q.cjs", "gate:q": "node scripts/q.cjs" }
    );
    const ok3 = z3.verloren.length === 0;
    console.log(
        `  ${ok3 ? "✅" : "❌"} Selbsttest „in npm run check gewandert" → verloren ${JSON.stringify(z3.verloren)}`
    );
    if (!ok3) f.push("(Z) ein Schritt, dessen Befehle ein anderer Schritt fährt, zählt als verloren");
    return f.concat(
        selbsttestWaage(),
        selbsttestGegenrichtung(),
        selbsttestPlaytest(),
        selbsttestKlasse(),
        selbsttestSchluessel(),
        selbsttestKopf(),
        selbsttestEcht()
    );
}

// (E) Die Echt-Gruppe gegen das heutige check.yml und seine Täter: die Form steht grün; ein PR-Weg, ein Cloud-Läufer, kein
// Kopf-Richter, eine andere Weiche, ein zweiter Läufer-Schritt, eine Bedingung, ein Fremd-Schritt, ein Deckel über dem Warten
// und eine Batterie ohne GPU-Klasse fallen beim Namen; mit falscher Bedingung ist die Wand im Echt-Job STUMM (S).
function selbsttestEcht() {
    const f = [];
    const echt = () => JSON.parse(JSON.stringify(yaml.load(fs.readFileSync(path.join(root, DATEI), "utf8"))));
    const grund = echtForm(echt());
    const ok0 = grund.length === 0;
    console.log(`  ${ok0 ? "✅" : "❌"} Selbsttest „Echt-Gruppe in check.yml" → ${ok0 ? "die Form steht" : grund.join(" · ")}`);
    if (!ok0) f.push("(E) das heutige check.yml trägt die Form der Echt-Gruppe nicht");
    const E = (d) => d.jobs[ECHT_JOB];
    const faelle = [
        ["PR-Weg", (d) => (E(d).if += " || github.event_name == 'pull_request'"), /\(E\) ECHT: „echt" läuft unter/],
        ["Cloud-Läufer", (d) => (E(d)["runs-on"] = "ubuntu-latest"), /\(E\) ECHT: „echt" läuft auf "ubuntu-latest"/],
        ["ohne Kopf-Richter", (d) => delete E(d).needs, /wartet nicht auf „kopf"/],
        ["Weiche hardware", (d) => (E(d).env.LINSE_GPU = "hardware"), /env LINSE_GPU ist „hardware"/],
        ["zweiter Läufer", (d) => E(d).steps.push({ name: "noch einmal", run: "node scripts/ci-echt.cjs" }), /2 Schritte node scripts\/ci-echt\.cjs/],
        ["Bedingung", (d) => (E(d).steps[E(d).steps.length - 1].if = "always()"), /trägt die Bedingung „always\(\)"/],
        ["Fremd-Schritt", (d) => E(d).steps.push({ name: "Hallo", run: "echo hallo" }), /„Hallo" ist weder der Läufer noch EINE Wand/],
        ["Deckel", (d) => (E(d)["timeout-minutes"] = 600), /timeout-minutes 600/],
        [
            "ohne GPU-Klasse",
            (d) => d.jobs[VOLL_JOB].strategy.matrix.include.forEach((e) => (e.klasse = "cpu")),
            /keinen Schritt der Klasse gpu/,
        ],
    ];
    for (const [n, mut, re] of faelle) {
        const d = echt();
        mut(d);
        const b = echtForm(d);
        const ok = b.some((x) => re.test(x));
        console.log(`  ${ok ? "✅" : "❌"} Selbsttest (E) „${n}" → ${b.find((x) => re.test(x)) || b.join(" · ") || "grün"}`);
        if (!ok) f.push(`(E) „${n}" fällt nicht beim Namen`);
    }
    // (S): die Wand im Echt-Job hält den Merge nur in seiner Form
    const d1 = echt();
    const wand = E(d1).steps.find((s) => /^npm run gate:/.test(lauf(s)));
    const s1 = wand ? schrittStumm(path.basename(DATEI), d1, ECHT_JOB, E(d1), wand) : "kein Wand-Schritt";
    const d2 = echt();
    E(d2).if = "github.event_name == 'push'";
    const wand2 = E(d2).steps.find((s) => /^npm run gate:/.test(lauf(s)));
    const s2 = wand2 ? schrittStumm(path.basename(DATEI), d2, ECHT_JOB, E(d2), wand2) : null;
    const okS = s1 === null && !!s2;
    console.log(`  ${okS ? "✅" : "❌"} Selbsttest (E)/(S) „Wand im Echt-Job" → in Form ${s1 === null ? "hält den Merge" : s1} · falsche Bedingung: ${s2 || "hält (falsch)"}`);
    if (!okS) f.push("(E)/(S) die Wand im Echt-Job hält den Merge außerhalb seiner Form oder nie");
    return f;
}

// (T) Die Waage gegen ein Fixture — und gegen das heutige check.yml (b5eb02e9, das eingefrorene `vorher` in ci-zeiten.json):
// jeder Job lief je Push, und keiner trug den Puls.
function selbsttestWaage() {
    const prep = () => [
        { uses: "actions/checkout@v4" },
        { uses: "actions/setup-node@v4" },
        { name: "System-Libs", run: "sudo apt-get install -y libnss3" },
        { name: "Dependencies", run: "npm ci --no-audit --no-fund" },
    ];
    const doc = () => ({
        jobs: {
            puls: {
                strategy: { "fail-fast": false, matrix: { gruppe: [1] } },
                steps: prep().concat([{ name: "Lint", if: "matrix.gruppe == 1", run: "npm run lint" }]),
            },
            voll: {
                if: VOLL_WENN,
                strategy: { "fail-fast": false, matrix: { gruppe: [1, 2] } },
                steps: prep().concat([
                    { name: "A", if: "matrix.gruppe == 1", run: "npm run gate:a" },
                    { name: "B", if: "matrix.gruppe == 2", run: "npm run gate:b" },
                    { name: "C", if: "matrix.gruppe == 1", run: "npm run gate:c" },
                ]),
            },
        },
    });
    const zeiten = () => ({ vorbereitung_s: 20, schritte: { Lint: { s: 30 }, A: { s: 200 }, B: { s: 300 }, C: { s: 150 } } });
    const mitKopf = (d, z) => {
        d.jobs.kopf = kopfJob();
        d.jobs.voll.needs = KOPF_JOB;
        d.jobs.voll.if = VOLL_NACH_KOPF;
        z.schritte.Kopf = { s: 3 };
    };
    const faelle = [
        ["die Waage im Lot (grün)", () => {}, null],
        [
            "eine Voll-Gruppe über 7 min",
            (d, z) => (z.schritte.A.s = 300),
            /\(T\) WAAGE: „voll 1\/2" trägt 7,8 min \(Deckel 7,0 min je Voll-Gruppe\) — der größte Schritt „A" 5,0 min/,
        ],
        [
            "der Puls über 2 min",
            (d, z) => (z.schritte.Lint.s = 130),
            /\(T\) WAAGE: „puls 1\/1" trägt 2,5 min \(Deckel 2,0 min je Push\) — der größte Schritt „Lint" 2,2 min/,
        ],
        ["ein Schritt ohne Zeit", (d, z) => delete z.schritte.B, /\(T\) UNGEMESSEN: „B" \(voll\)/],
        ["die Zeiten ohne Vorbereitung", (d, z) => delete z.vorbereitung_s, /\(T\) ZEITEN/],
        [
            "ein Schritt aus voll in den Puls gezogen",
            (d) => d.jobs.puls.steps.push(Object.assign(d.jobs.voll.steps.splice(5, 1)[0], { if: "matrix.gruppe == 1" })),
            /\(T\) WAAGE: „puls 1\/1" trägt 5,8 min .*„B" 5,0 min/,
        ],
        // (T) PLÄTZE und WANDUHR (K61): 1 Puls- und 20 Voll-Gruppen auf 20 Plätzen; der Kopf-Richter endet vor der Batterie
        [
            "mehr Jobs zugleich als Läufer-Plätze (K61-Befund: 22 gegen 20)",
            (d) => (d.jobs.voll.strategy.matrix.gruppe = Array.from({ length: 20 }, (_, i) => i + 1)),
            /\(T\) PLÄTZE: ein voller Lauf fährt 21 Jobs zugleich \(puls 1 · voll 20\) — das Konto hat 20 Läufer-Plätze: 1 warten/,
        ],
        [
            "der Kopf-Richter belegt keinen Platz neben der Batterie",
            (d, z) => {
                mitKopf(d, z);
                d.jobs.voll.strategy.matrix.gruppe = Array.from({ length: 19 }, (_, i) => i + 1);
            },
            null,
        ],
        [
            "der längste Weg über 8 min",
            (d, z) => {
                mitKopf(d, z);
                z.schritte.Kopf.s = 120;
            },
            /\(T\) WANDUHR: der längste Weg „kopf → voll 1\/2" trägt 8,5 min \(Ziel 8,0 min je vollem Lauf\)/,
        ],
    ];
    const f = [];
    for (const [n, tat, soll] of faelle) {
        const d = doc(),
            z = zeiten();
        tat(d, z);
        const u = waage(d, z).v;
        const ok = soll ? u.some((x) => soll.test(x)) : u.length === 0;
        console.log(`  ${ok ? "✅" : "❌"} Selbsttest „${n}" → ${u.join(" · ") || "grün"}`);
        if (!ok) f.push(`„${n}" fällt nicht rot beim Namen (${u.join(" · ") || "grün"})`);
    }
    // das heutige check.yml: der Bau aus dem eingefrorenen `vorher` (Jobs, Gruppen, Schritte mit ihren Medianen)
    const Z = JSON.parse(fs.readFileSync(path.join(root, ZEITEN), "utf8"));
    if (!Z.vorher || !Z.vorher.jobs) return f.concat([`${ZEITEN} trägt kein „vorher" — der Selbsttest am heutigen check.yml fehlt`]);
    const alt = { jobs: {} };
    const zAlt = { vorbereitung_s: Z.vorher.vorbereitung_s, schritte: {} };
    for (const [job, j] of Object.entries(Z.vorher.jobs)) {
        alt.jobs[job] = {
            strategy: j.matrix ? { "fail-fast": false, matrix: { gruppe: j.matrix } } : undefined,
            steps: prep().concat(
                j.schritte.map(([n, g]) => ({ name: n, run: "npm run x", ...(g ? { if: `matrix.gruppe == ${g}` } : {}) }))
            ),
        };
        for (const [n, , s] of j.schritte) zAlt.schritte[n] = { s };
    }
    const u = waage(alt, zAlt).v;
    const soll = [
        /\(T\) WAAGE: „check" trägt \d+,\d min \(Deckel 2,0 min je Push\) — der größte Schritt „Prettier-Format-Check" 2,1 min/,
        /\(T\) WAAGE: „playtest [123]\/3" trägt (1\d|2\d),\d min \(Deckel 2,0 min je Push\)/,
        /\(T\) WANDUHR: der längste Weg „playtest 2\/3" trägt 26,0 min \(Ziel 8,0 min je vollem Lauf\)/,
    ];
    const ok =
        soll.every((r) => u.some((x) => r.test(x))) &&
        u.filter((x) => /^\(T\) WAAGE/.test(x)).length ===
            Object.values(Z.vorher.jobs).reduce((a, j) => a + (j.matrix ? j.matrix.length : 1), 0);
    console.log(`  ${ok ? "✅" : "❌"} Selbsttest „das heutige check.yml (${Z.vorher.ref.split(" ")[0]})" → ${u.join(" · ") || "grün"}`);
    if (!ok) f.push(`das heutige check.yml fällt nicht rot mit seinen Tätern (${u.join(" · ") || "grün"})`);
    return f;
}

// Die Gegenrichtung (W)/(A)/(R) gegen ein Fixture: package.json-Skripte + Workflows + Ausnahmen.
function selbsttestGegenrichtung() {
    const skripte = () => ({
        check: "node --check a.js && node scripts/a.cjs --selftest && node scripts/a.cjs && node scripts/b.cjs",
        "gate:a": "node scripts/a.cjs --selftest && node scripts/a.cjs",
        "gate:b": "node scripts/b.cjs",
        "gate:c": "node scripts/c.cjs",
        "gate:c-beide": "npm run gate:c && npm run gate:b",
        "gate:d": "node scripts/d.cjs --echt",
        lint: "eslint a.js",
    });
    const docs = () => ({
        "check.yml": {
            on: { push: { branches: ["**"] }, pull_request: { branches: ["main"] } },
            jobs: {
                check: {
                    steps: [
                        { uses: "actions/checkout@v4" },
                        { name: "Dependencies", run: "npm ci --no-audit --no-fund" },
                        { name: "Lint", run: "npm run lint" },
                        { name: "Statik", run: "npm run check" },
                    ],
                },
                playtest: {
                    strategy: { "fail-fast": false, matrix: { gruppe: [1] } },
                    steps: [{ name: "C", if: "matrix.gruppe == 1", run: "npm run gate:c" }],
                },
            },
        },
        "nacht.yml": {
            on: { workflow_dispatch: null, schedule: [{ cron: "30 3 * * *" }] },
            jobs: { nacht: { steps: [{ name: "Dependencies", run: "npm ci" }] } },
        },
    });
    const aus = () => ({
        "gate:d": { klasse: KLASSEN.MESS, grund: "gibt Zahlen aus, kennt kein Rot" },
    });
    const C = (d) => d["check.yml"].jobs.playtest.steps[0];
    const f = [];
    const g0 = deckung(skripte(), docs(), aus());
    if (g0.v.length) f.push("(W) der gute Stand ist rot: " + g0.v.join(" · "));
    const faelle = [
        [
            "ein neues Gate ohne Schritt und ohne Eintrag",
            (s) => (s["gate:neu"] = "node scripts/neu.cjs"),
            /\(W\) WACHSAMKEIT: „gate:neu" .*fehlt: node scripts\/neu\.cjs/,
        ],
        [
            "npm run check in keinem Workflow",
            (s, d) => d["check.yml"].jobs.check.steps.pop(),
            /\(W\) WACHSAMKEIT: „check: node scripts\/b\.cjs"/,
        ],
        [
            "der Selbsttest eines Gates fehlt in check",
            (s) => (s.check = s.check.replace("node scripts/a.cjs --selftest && ", "")),
            /\(W\) WACHSAMKEIT: „gate:a" .*fehlt: node scripts\/a\.cjs --selftest/,
        ],
        [
            "die Ausnahme eines gefallenen Gates",
            (s, d, a) => (a["gate:weg"] = { klasse: KLASSEN.MESS, grund: "gibt Zahlen aus, kennt kein Rot" }),
            /\(A\) STALE: die Ausnahme „gate:weg" nennt keine Wand mehr/,
        ],
        [
            "die Ausnahme eines Gates, das schon läuft",
            (s, d, a) => (a["gate:c"] = { klasse: KLASSEN.FRIST, grund: "ein Lauf trägt den Deckel nicht" }),
            /\(A\) STALE: „gate:c" läuft schon in der CI/,
        ],
        [
            "eine Ausnahme ohne erlaubte Klasse",
            (s, d, a) => (a["gate:d"].klasse = "später"),
            /\(A\) KLASSE: „gate:d" trägt die Klasse „später"/,
        ],
        ["eine Ausnahme ohne Grund", (s, d, a) => (a["gate:d"].grund = " "), /\(A\) GRUND: „gate:d"/],
        [
            "ein Schritt, den npm run check schon fährt",
            (s, d) => d["check.yml"].jobs.check.steps.push({ name: "A allein", run: "npm run gate:a" }),
            /\(R\) REDUNDANT: „A allein" \(check\.yml\/check\) fährt nur, was schon „Statik" fährt/,
        ],
        // (S) DER ABGESCHALTETE SCHRITT (Gegenprüfung 09.10.: `|| true`, continue-on-error am Schritt und im nächtlichen
        // Job zählten als Deckung) — die Klasse: jeder Weg, auf dem das Rot einer Wand den Merge nicht hält
        [
            "|| true hinter dem Gate",
            (s, d) => (C(d).run = "npm run gate:c || true"),
            /\(S\) STUMM: „gate:c" läuft nur abgeschaltet — „C" \(check\.yml\/playtest\): „\|\| true" schluckt sein Rot/,
        ],
        ["|| exit 1 trägt das Rot weiter (grün)", (s, d) => (C(d).run = "npm run gate:c || exit 1"), null],
        [
            "continue-on-error am Schritt",
            (s, d) => (C(d)["continue-on-error"] = true),
            /\(S\) STUMM: „gate:c" .*continue-on-error am Schritt/,
        ],
        [
            "continue-on-error am Job",
            (s, d) => (d["check.yml"].jobs.playtest["continue-on-error"] = true),
            /\(S\) STUMM: „gate:c" .*continue-on-error am Job „playtest"/,
        ],
        [
            "nur im nächtlichen Workflow (blockt keinen Merge)",
            (s, d) => d["nacht.yml"].jobs.nacht.steps.push(d["check.yml"].jobs.playtest.steps.pop()),
            /\(S\) STUMM: „gate:c" .*nacht\.yml läuft nicht auf push\/pull_request/,
        ],
        [
            "vor einer Pipe ohne pipefail (Lehre 9)",
            (s, d) => (C(d).run = "npm run gate:c | tail -5"),
            /\(S\) STUMM: „gate:c" .*vor einer Pipe ohne pipefail/,
        ],
        [
            "Pipe unter shell: bash (pipefail) hält (grün)",
            (s, d) => Object.assign(C(d), { shell: "bash", run: "npm run gate:c | tee c.log" }),
            null,
        ],
        [
            "&&-Glied mitten im Schritt",
            (s, d) => (C(d).run = "npm run gate:c && echo c\necho ende"),
            /\(S\) STUMM: „gate:c" .*Glied einer &&-Kette mitten im Schritt/,
        ],
        ["&&-Kette als letzte Zeile hält (grün)", (s, d) => (C(d).run = "echo start\nnpm run gate:c && echo c"), null],
        [
            "set +e vor dem Gate",
            (s, d) => (C(d).run = "set +e\nnpm run gate:c\necho ende"),
            /\(S\) STUMM: „gate:c" .*ohne errexit/,
        ],
        ["! kehrt das Rot um", (s, d) => (C(d).run = "! npm run gate:c"), /\(S\) STUMM: „gate:c" .*kehrt sein Rot um/],
        [
            "eine Bedingung, die im Merge nie feuert",
            (s, d) => (C(d).if = "github.event_name == 'schedule'"),
            /\(S\) STUMM: „gate:c" .*läuft nur unter „github\.event_name == 'schedule'"/,
        ],
        [
            "eine Gruppe außerhalb der Matrix",
            (s, d) => (C(d).if = "matrix.gruppe == 7"),
            /\(S\) STUMM: „gate:c" .*Gruppe 7 steht in keiner Matrix/,
        ],
        [
            "ein Gate, das sein Rot selbst schluckt",
            (s) => (s["gate:c"] = "node scripts/c.cjs || true"),
            /\(S\) STUMM IN SICH: „gate:c" schluckt sein eigenes Rot — „node scripts\/c\.cjs": „\|\| true"/,
        ],
        [
            "ein Teil von check hinter ; (npm fährt sh -c ohne errexit)",
            (s) => (s.check = s.check.replace("node --check a.js && ", "node --check a.js; ")),
            /\(S\) STUMM IN SICH: „check: node --check a\.js" .*ohne errexit/,
        ],
    ];
    for (const [n, tat, soll] of faelle) {
        const s = skripte(),
            d = docs(),
            a = aus();
        tat(s, d, a);
        const u = deckung(s, d, a).v;
        const ok = soll ? u.some((x) => soll.test(x)) : u.length === 0;
        console.log(`  ${ok ? "✅" : "❌"} Selbsttest „${n}" → ${u.join(" · ") || "grün"}`);
        if (!ok) f.push(`„${n}" fällt nicht rot beim Namen (${u.join(" · ") || "grün"})`);
    }
    return f;
}

// (P) Der volle Playtest gegen ein Fixture: die gute check.yml trägt ihn allein in Gruppe 2 der vollen Batterie, mit
// pipefail, tee und dem Verdikt als letztem Befehl.
function selbsttestPlaytest() {
    const skripte = {
        playtest: "node scripts/playtest.cjs",
        "playtest:fast": "node scripts/playtest-fast.cjs",
        "gate:a": "node scripts/a.cjs",
    };
    const prep = () => [
        { uses: "actions/checkout@v4" },
        { uses: "actions/setup-node@v4" },
        { name: "System-Libs", run: "sudo apt-get install -y libnss3" },
        { name: "Dependencies", run: "npm ci --no-audit --no-fund" },
    ];
    const traeger = () => ({
        name: "Voller Playtest",
        if: "matrix.gruppe == 2",
        shell: "bash",
        run: 'npm run playtest | tee playtest-voll.log\ngrep -qx "✅ Alle Invarianten OK" playtest-voll.log\n',
    });
    const docs = () => ({
        "check.yml": {
            on: { push: {} },
            jobs: {
                puls: {
                    strategy: { "fail-fast": false, matrix: { gruppe: [1] } },
                    "timeout-minutes": 10,
                    steps: prep().concat([{ name: "Schnell", if: "matrix.gruppe == 1", run: "npm run playtest:fast" }]),
                },
                voll: {
                    if: VOLL_WENN,
                    strategy: { "fail-fast": false, matrix: { gruppe: [1, 2] } },
                    "timeout-minutes": 30,
                    steps: prep().concat([{ name: "A", if: "matrix.gruppe == 1", run: "npm run gate:a" }, traeger()]),
                },
            },
        },
    });
    const nacht = () => ({
        on: { schedule: [{ cron: "30 3 * * *" }] },
        jobs: { nacht: { steps: prep().concat([{ name: "Nacht-Playtest", run: "npm run playtest" }]) } },
    });
    const V = (d) => d["check.yml"].jobs.voll;
    const T = (d) => V(d).steps[V(d).steps.length - 1];
    const ohne = (d) => {
        V(d).steps.pop();
        V(d).strategy.matrix.gruppe = [1];
    };
    const faelle = [
        ["der gute Stand", () => {}, null],
        ["eine check.yml ohne die Gruppe", ohne, /\(P\) PLAYTEST: der volle Playtest .* läuft in keiner Gruppe/],
        [
            "nur nächtlich (blockt keinen Merge)",
            (d) => {
                ohne(d);
                d["nacht.yml"] = nacht();
            },
            /\(P\) PLAYTEST: .*keiner Gruppe .*nur „Nacht-Playtest" \(nacht\.yml\/nacht\): nacht\.yml läuft nicht auf push/,
        ],
        [
            "nur im Puls",
            (d) => {
                ohne(d);
                d["check.yml"].jobs.puls.steps.push({ ...traeger(), if: "matrix.gruppe == 1" });
            },
            /\(P\) PLAYTEST: .*keiner Gruppe .*nur „Voller Playtest" \(check\.yml\/puls Gruppe 1\)/,
        ],
        [
            "nur der Schnell-Playtest",
            (d) => (T(d).run = T(d).run.replace("npm run playtest |", "npm run playtest:fast |")),
            /\(P\) PLAYTEST: .*keiner Gruppe/,
        ],
        ["ein nächtlicher Zwilling", (d) => (d["nacht.yml"] = nacht()), /\(P\) ZWILLING: der volle Playtest läuft 2×/],
        ["nur der Zähler (kein Verdikt)", (d) => (T(d).run = "npm run playtest"), /\(P\) VERDIKT: „Voller Playtest"/],
        [
            "das Verdikt aus einem fremden Log",
            (d) => (T(d).run = T(d).run.replace(/OK" playtest-voll\.log/, 'OK" alt.log')),
            /\(P\) VERDIKT: „Voller Playtest"/,
        ],
        ["ohne pipefail", (d) => delete T(d).shell, /\(P\) STUMM: .*vor einer Pipe ohne pipefail/],
        [
            "der Playtest mit || true",
            (d) => (T(d).run = T(d).run.replace("tee playtest-voll.log\n", "tee playtest-voll.log || true\n")),
            /\(P\) STUMM: .*„\|\| true" schluckt sein Rot/,
        ],
        ["continue-on-error am Schritt", (d) => (T(d)["continue-on-error"] = true), /\(P\) STUMM: .*continue-on-error/],
        [
            "eine geteilte Gruppe",
            (d) => (T(d).if = "matrix.gruppe == 1"),
            /\(P\) EIGEN: der volle Playtest teilt Gruppe 1 mit „A"/,
        ],
    ];
    const f = [];
    for (const [n, tat, soll] of faelle) {
        const d = docs();
        tat(d);
        const u = playtestUrteil(d, skripte);
        const ok = soll ? u.some((x) => soll.test(x)) : u.length === 0;
        console.log(`  ${ok ? "✅" : "❌"} Selbsttest „${n}" → ${u.join(" · ") || "grün"}`);
        if (!ok) f.push(`(P) „${n}" fällt nicht rot beim Namen (${u.join(" · ") || "grün"})`);
    }
    return f;
}

if (process.argv.includes("--selftest")) {
    console.log("=== CI-DECKUNG — Selbsttest (ohne Datei) ===");
    const f = selbsttest();
    if (f.length) {
        console.log("\n❌ SELBSTTEST ROT — die Wand ist blind:\n  " + f.join("\n  "));
        process.exit(1);
    }
    console.log("✅ SELBSTTEST GRÜN — jeder eingeschmuggelte Täter fällt rot und wird beim Namen genannt.");
    process.exit(0);
}

const doc = yaml.load(fs.readFileSync(path.join(root, DATEI), "utf8"));
const skripte = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).scripts || {};
const v = urteil(doc);
v.push(...klassenUrteil(doc, skripte));
const i = process.argv.indexOf("--gegen");
let z = null;
if (i > 0) {
    const ref = process.argv[i + 1];
    const alt = yaml.load(execSync(`git show ${ref}:${DATEI}`, { cwd: root, maxBuffer: 1 << 26 }).toString());
    z = vergleich(alt, doc, skripte);
    for (const r of z.verloren) v.push(`(Z) VERLOREN gegen ${ref}: „${r.split("\n")[0]}"`);
    for (const r of z.doppelt) v.push(`(Z) DOPPELT gegen ${ref}: „${r.split("\n")[0]}"`);
}
const alleWorkflows = workflowsLesen();
const g = deckung(skripte, alleWorkflows, AUSNAHMEN);
v.push(...g.v);
v.push(...schluesselUrteil(alleWorkflows));
v.push(...playtestUrteil(alleWorkflows, skripte));
const zeitenDatei = path.join(root, ZEITEN);
const w = fs.existsSync(zeitenDatei)
    ? waage(doc, JSON.parse(fs.readFileSync(zeitenDatei, "utf8")))
    : { v: [`(T) ZEITEN: ${ZEITEN} fehlt — die Waage hat keine Zeiten`], zeilen: [] };
v.push(...w.v);
const jeKlasse = g.zahl.jeKlasse;
console.log("=== CI-DECKUNG — " + DATEI + " ===");
console.log(`  Gate-Schritte: ${gateSchritte(doc).length} (alle Jobs) · ${gruppenBericht(doc)}`);
console.log(
    `  Wände: ${g.zahl.waende} (gate:* und Teile von npm run check) · in der CI ${g.zahl.inCi} · Ausnahmen ${g.zahl.ausnahmen}` +
        (Object.keys(jeKlasse).length
            ? ` (${Object.entries(jeKlasse)
                  .map(([k, n]) => `${k} ${n}`)
                  .join(" · ")})`
            : "") +
        ` · ohne Workflow ${g.zahl.offen}`
);
console.log(`  Waage (Median samt Vorbereitung, min): ${w.zeilen.join(" · ")}`);
if (w.wanduhr)
    console.log(
        `  Plätze: ${w.plaetze} Jobs zugleich (Konto ${LAEUFER_PLAETZE}) · Wanduhr (längster Weg): ${minuten(w.wanduhr[0])} min — ${w.wanduhr[1]}`
    );
if (z)
    console.log(
        `  gegen ${process.argv[i + 1]}: vorher ${z.vorher}, nachher ${z.nachher}, verloren ${z.verloren.length}, doppelt ${z.doppelt.length}, neu ${z.neu.length}`
    );
if (v.length) {
    console.error("\n❌ ROT:\n  " + v.join("\n  "));
    process.exit(1);
}
console.log(
    `✅ GRÜN — jeder Gate-Schritt läuft genau einmal, jede Gruppe trägt die Vorbereitung und ihre Schritte und liegt unter ihrem Deckel (Puls 2 min, Voll 7 min), ein voller Lauf fährt höchstens ${LAEUFER_PLAETZE} Jobs zugleich und sein längster Weg ≤ 8 min, der Kopf-Richter lässt keinen Kopf zweimal durch die Batterie, kein Cache-Schlüssel hasht die Projektversion; jede Voll-Gruppe trägt ihre Klasse cpu oder gpu; jede Wand läuft in einem Workflow oder steht mit Klasse und Grund in der Ausnahme-Liste; der volle Playtest urteilt in seiner eigenen Voll-Gruppe am Verdikt; die Echt-Gruppe fährt die GPU-Klasse zusätzlich auf der Karte, nur bei push auf integ-probe und main.`
);
