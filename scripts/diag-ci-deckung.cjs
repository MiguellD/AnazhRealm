// diag-ci-deckung.cjs — DIE DECKUNGS-WAND DER CI: jede Art, einen Schritt zu verlieren, zu vervielfachen oder stumm zu
// schalten, steht beim Namen — (G) GRUPPE · (V) FORM, KOPF, SCHLÜSSEL · (D) DOPPELT · (W)/(A)/(R)/(F) die Gegenrichtung ·
// (S) STUMM · (K) KLASSE (die volle Batterie cpu, die Karte gpu — kein swiftshader-Schritt im Zug) · (E) ECHT (die Karten: je
// Schritt GENAU ein Bein, nur auf Abruf) · (T) WAAGE · (P) PLAYTEST · (O) KORPUS-ANTEIL · (H) WEITER · (U) URTEIL (kein rotes Vorderglied verbirgt einen Schritt, der
// Job nennt jeden roten) · (B) BRUCH AM LANDE-TOR (nur BRUCH sperrt, die Tafel spec/ci/tor-klassen.json), je Regel an ihrer
// Funktion erklärt. check.yml trägt die Jobs puls (je Push), kopf und voll (unter VOLL_WENN) und echt (die Karten); ein weiterer
// Job ist ROT.
//   node scripts/diag-ci-deckung.cjs [--selftest]     (npm run gate:ci-deckung; in npm run check)
"use strict";
const { execSync } = require("child_process");
const yaml = require("js-yaml");
const R6 = require("./lib/ci-klasse.cjs");
const { klasseDesLaufs, GROSS_S, LAEUFER_PLAETZE, PULS_S, ueber, R6_SHELL } = R6;
const { schluessel } = require("./ci-schluessel.cjs");
const { kopfUrteil } = require("./ci-kopf.cjs");
const { messe } = require("./ci-zeiten.cjs");
const {
    taeterFaelle,
    selbsttestEnde,
    wandEnde,
    ausDatei,
    SELBSTTEST,
    path,
    fs,
    jsonLesen,
    teilVon,
    ROOT: root,
} = require("./lib/welt-boot.cjs");

const DATEI = ".github/workflows/check.yml";
const ZEITEN = "spec/ci/ci-zeiten.json";
const PULS_JOB = "puls";
const VOLL_JOB = "voll";
const GRUPPEN_JOBS = [PULS_JOB, VOLL_JOB];
// Die EINE Bedingung der vollen Batterie: auf Abruf, auf jedem PR nach main, auf integ-probe (dort sagt der Kopf-Richter
// voll=nein: der Zug fährt voll nie, LANDUNG ≤ 10 MIN) und main (die Nachwache nach jeder Landung), und wo die Commit-Message
// `[ci voll]` trägt (die Vorprüfung am Zweig-Kopf). Kein schedule mehr: die Nacht urteilte am Kopf von main nichts Neues.
const VOLL_WENN =
    "github.event_name == 'workflow_dispatch' || " +
    "github.event_name == 'pull_request' || github.ref == 'refs/heads/integ-probe' || github.ref == 'refs/heads/main' || " +
    "contains(github.event.head_commit.message, '[ci voll]')";
const jobsVon = (doc) => doc?.jobs || {};
const V = (d) => d.jobs.voll; // der volle Job eines Dokuments (die Selbsttests)
const normWenn = (x) =>
    String(x == null ? "" : x)
        .trim()
        .replace(/\s+/g, " ");
const istVollWenn = (x) => normWenn(x) === VOLL_WENN;
// (V) STEMPEL — DER STEMPEL FÄHRT KEINEN JOB (zug-erbt-baum, 26.11.; z747–z749 Stempel → bereit 24 · 44 · 21 min, je Stempel
// 5 Jobs in check.yml und 3 in gpu-probe.yml in derselben GitHub-Reihe wie die Batterien): ein Push auf einen w2*-Zweig, dessen
// Kopf-Message mit „Abgabe " beginnt, weckt weder Puls noch Kopf-Richter (und so keine Batterie) noch den Einlass der GPU-Probe —
// das Urteil des Stempels erbt der Zug-Dienst über den Baum seines Elters (zug.cjs `erbe`). EINE Bedingung, wörtlich an drei
// Jobs; der Einlass erbt nichts mehr selbst (kein Richter, kein Netz): ein zweiter Weg des Erbes wäre der Zwilling.
const STEMPEL_WENN =
    "github.event_name == 'push' && startsWith(github.ref, 'refs/heads/w2') && " +
    "startsWith(github.event.head_commit.message, 'Abgabe ')";
const PULS_WENN = "${{ !(" + STEMPEL_WENN + ") }}";
const KOPF_WENN = "(" + VOLL_WENN + ") && !(" + STEMPEL_WENN + ")";
const EINLASS_WENN = "contains(github.event.head_commit.message, '[gpu-probe:') && !(" + STEMPEL_WENN + ")";
const istKopfWenn = (x) => normWenn(x) === KOPF_WENN;
// EIN URTEIL JE KOPF: der Kopf-Richter läuft unter VOLL_WENN, die Batterie hinter ihm, wenn der Kopf noch kein
// grünes Urteil der vollen Batterie trägt (scripts/ci-kopf.cjs)
const KOPF_JOB = "kopf";
const KOPF_LAUF = /^node scripts\/ci-kopf\.cjs$/;
const VOLL_NACH_KOPF = "needs.kopf.outputs.voll == 'ja'";
const needsVon = (J) => [].concat(J?.needs || []);
// (E) DIE KARTEN (w27-swift-raus): jede Wand der GPU-Klasse auf einem eigenen Läufer mit der echten Karte (`echt`), nie
// pull_request — DREI BEINE ZUGLEICH (matrix.karte; der Läufer heißt bis zum ersten Bindestrich wie seine Karte, sein Label
// `<karte>-gpu`, gpu-probe.yml gibt demselben Label Vorfahrt); je Schritt GENAU ein Bein und eine Frist, kein Bein leer, der
// Job ≤ ECHT_DECKEL_MIN, der Plan je Bein ≤ ECHT_PLAN_S (T). Die Klasse jedes Schritts urteilt (K).
// NUR AUF ABRUF (LANDUNG ≤ 10 MIN, 23.11., der Schöpfer: „Wir messen soviel wie nötig, nicht wie möglich“): ECHT_WENN, ohne
// needs — kein push (bis hier je Zug auf integ-probe, zug-a, zug-b: z695 trug das Bein omen 28,9 der 29,4 min Wand), kein
// schedule, kein Kopf-Richter. Den GPU-Beweis eines Kopfs trägt die GPU-Probe seiner Vorprüfung. Eine Wand, die NUR hier steht,
// hält kein Tor: (W) zählt sie in der abgeleiteten Klasse KARTE_KLASSE (keine Liste, die Zahl steht im Bericht).
// DER ABRUF IST EINE WAHL (ECHT_WAHL): der Zug-Dienst stößt am Zweig-Kopf ohne grüne Batterie check.yml ohne inputs an
// (zug-dienst.sh bereit) — on.workflow_dispatch.inputs.karten (boolean, default false) hält die Beine dort draußen.
const ECHT_JOB = "echt";
const ECHT_WAHL = "karten";
const ECHT_WENN = `github.event_name == 'workflow_dispatch' && inputs.${ECHT_WAHL}`;
const KARTE_GRUND = `der Job „${ECHT_JOB}" fährt nur auf Abruf, den GPU-Beweis trägt die GPU-Probe der Vorprüfung`;
const KARTE_KLASSE = "Karte (GPU-Probe der Vorprüfung, echt auf Abruf)";
const [ECHT_DECKEL_MIN, ECHT_PLAN_S] = [45, 20 * 60];
const ECHT_LAEUFER = ["self-hosted", "${{ matrix.karte }}-gpu"];
// das Bein eines Karten-Schritts: `if: ${{ !cancelled() && matrix.karte == '<karte>' }}` (null: keines)
const BEIN_RE = /^\s*(?:\$\{\{)?\s*!cancelled\(\)\s*&&\s*matrix\.karte\s*==\s*'([a-z][a-z0-9]*)'\s*(?:\}\})?\s*$/;
const beinVon = (s) => (BEIN_RE.exec(String(s.if)) || [])[1] || null;
const kartenVon = (doc) => [].concat(jobsVon(doc)[ECHT_JOB]?.strategy?.matrix?.karte || []);
function echtForm(doc) {
    const E = jobsVon(doc)[ECHT_JOB];
    if (!E) return [];
    const v = [];
    const env = E.env || {};
    const karten = E.strategy?.matrix?.karte;
    if (
        !Array.isArray(karten) ||
        !karten.length ||
        new Set(karten).size !== karten.length ||
        !karten.every((k) => /^[a-z][a-z0-9]*$/.test(k))
    )
        v.push(`(E) KARTEN: „${ECHT_JOB}" matrix.karte ${JSON.stringify(karten)} ist keine Liste verschiedener Karten`);
    if (!E.strategy || E.strategy["fail-fast"] !== false)
        v.push(`(E) FAIL-FAST: „${ECHT_JOB}" strategy.fail-fast ist nicht false`);
    if (
        JSON.stringify([].concat(E["runs-on"] || [])) !== JSON.stringify(ECHT_LAEUFER) ||
        env.CI_KLASSE !== "gpu" ||
        env.LINSE_GPU !== "karte"
    )
        v.push(
            `(E) ECHT: „${ECHT_JOB}" läuft nicht auf [${ECHT_LAEUFER.join(", ")}] mit env CI_KLASSE gpu und LINSE_GPU karte`
        );
    if (normWenn(E.if) !== ECHT_WENN || needsVon(E).length)
        v.push(
            `(E) ABRUF: „${ECHT_JOB}" läuft unter „${E.if}"${needsVon(E).length ? ` hinter ${needsVon(E).join(", ")}` : ""} statt nur auf Abruf (if: ${ECHT_WENN}, ohne needs) — die Karten fahren in keinem Zug und keiner Nacht (LANDUNG ≤ 10 MIN)`
        );
    const on = doc.on !== undefined ? doc.on : doc[true];
    const wahl = on?.workflow_dispatch?.inputs?.[ECHT_WAHL];
    if (!wahl || wahl.type !== "boolean" || wahl.default !== false)
        v.push(
            `(E) ABRUF: on.workflow_dispatch.inputs.${ECHT_WAHL} ist ${JSON.stringify(wahl)} statt { type: boolean, default: false } — ohne die Wahl liefen die Karten nie, mit default true bei jedem Anstoß der vollen Batterie (zug-dienst.sh bereit)`
        );
    if (!(Number(E["timeout-minutes"]) > 0 && Number(E["timeout-minutes"]) <= ECHT_DECKEL_MIN))
        v.push(`(E) DECKEL: „${ECHT_JOB}" timeout-minutes ${E["timeout-minutes"]} (Soll 1–${ECHT_DECKEL_MIN})`);
    const je = new Map((Array.isArray(karten) ? karten : []).map((k) => [k, 0]));
    for (const s of gates(E)) {
        const k = beinVon(s);
        if (!k) v.push(`(E) BEIN: „${name(s)}" trägt kein Bein (if: ${s.if})`);
        else if (!je.has(k)) v.push(`(E) BEIN: „${name(s)}" trägt die Karte „${k}" außerhalb der Matrix`);
        else je.set(k, je.get(k) + 1);
        if (!(Number(s["timeout-minutes"]) > 0))
            v.push(
                `(E) FRIST: „${name(s)}" trägt keine timeout-minutes — er hielte die Karte bis zum Job-Deckel (node scripts/ci-zeiten.cjs)`
            );
    }
    for (const [k, n] of je) if (!n) v.push(`(E) LEER: das Bein „${k}" trägt keinen Schritt`);
    return v;
}
// die volle Stufe: der Kopf-Richter unter VOLL_WENN und die Batterie hinter ihm (ihr Rot hält den Merge, (S))
function vollArt(doc, job) {
    const J = jobsVon(doc)[job];
    if (!J) return false;
    if (job === KOPF_JOB) return istKopfWenn(J.if) && !needsVon(J).length;
    if (job === VOLL_JOB)
        return normWenn(J.if) === VOLL_NACH_KOPF && needsVon(J).includes(KOPF_JOB) && vollArt(doc, KOPF_JOB);
    return false;
}
// läuft der Job im vollen Lauf? die volle Stufe — oder eine Batterie direkt unter VOLL_WENN (ihr Rot hält den Merge auch;
// dass sie hinter dem Kopf-Richter steht, verlangt (V) BEDINGUNG)
const imVollenLauf = (doc, job) =>
    vollArt(doc, job) || (job === VOLL_JOB && !!doc && !!doc.jobs && !!doc.jobs[job] && istVollWenn(doc.jobs[job].if));
// Die Deckel der Waage: der Puls 2 min je Push, die volle Stufe das Mittel ihrer Klasse plus RAND_S (die Streuung einer
// Gruppe um ihren Plan, CW2). Die volle Stufe wiegt je Schritt den p90 (ci-zeiten.cjs: der langsame Läufer — die echten Renderer
// laufen auf SwiftShader bis 2,8× langsamer, die Kamera-Leib-Linse am selben Kopf 319 s und 841 s), ihr Deckel hält 1,2 × die Gruppe (T).
const RAND_S = 30;
const DECKEL_MIN = 45;
// (T) FRIST am Puls: seine Tafel trägt den MEDIAN (voll den p90). Der langsamste gelandete Lauf der Statik trug 1,32 × den Median
// (586 s gegen 444 s, neun Zug-Kandidaten 26.–27.11.); mit demselben Rand 1,2 wie in voll hält die Frist 1,6 × den Plan.
const PULS_FRIST = 1.6;
const VORBEREITUNG = [
    ["checkout", (s) => String(s.uses).startsWith("actions/checkout@")],
    ["setup-node", (s) => String(s.uses).startsWith("actions/setup-node@")],
    ["System-Libs", (s) => /apt-get install/.test(lauf(s))],
    ["npm ci", (s) => /\bnpm ci\b/.test(lauf(s))],
];
// die Caches: der npm-Cache und der puppeteer-Chrome aus dem Actions-Cache vor npm ci (sonst lädt dessen postinstall
// den Chrome je Job neu), ihre Schlüssel aus scripts/ci-schluessel.cjs; sie stehen im Vorbereitungs-Block, ohne Gruppe
const CACHE = (s) => /^actions\/cache(\/restore)?@/.test(String(s.uses));
const SCHLUESSEL = (s) => /^node scripts\/ci-schluessel\.cjs$/.test(lauf(s));
const IST_VORBEREITUNG = (s) => CACHE(s) || SCHLUESSEL(s) || s.name === URTEIL || VORBEREITUNG.some(([, f]) => f(s));
// (H) WEITER + (U) URTEIL (02.11., z147–z158: der erste rote Schritt einer Gruppe verbarg jeden dahinter, sechs Zug-Runden):
// ein Gate-Schritt läuft unter WEITER + seiner Gruppe — auch nach einem roten Vorderglied, nie nach roter Vorbereitung (die
// id an npm ci) oder Abbruch; der letzte Schritt jedes Gruppen-Jobs ist das Urteil, das jeden roten beim Namen nennt
const WEITER = "steps.vorbereitung.outcome == 'success' && !cancelled() && ";
const GRUPPE_RE = /^\s*matrix\.gruppe\s*==\s*(\d+)\s*$/;
// die EINE Lesart der Gruppe eines Schritts (null: keine)
const gruppeVon = (s) => Number((GRUPPE_RE.exec(String(s.if).replace(WEITER, "")) || [])[1]) || null;
const URTEIL = "Urteil der Gruppe (jeder rote Schritt beim Namen)";

const gates = (J) => (J.steps || []).filter((s) => s.run && !IST_VORBEREITUNG(s));
const lauf = (s) => String(s.run || "").trim();
const name = (s) => String(s.name || s.uses || lauf(s).split("\n")[0]).replace(/\s+/g, " ");

// ── DIE GEGENRICHTUNG (W)/(A)/(R) ──
const WORKFLOWS = ".github/workflows";
// Die Klassen, aus denen eine Wand der CI fernbleiben darf — je eine Eigenschaft der Wand, kein Zeitplan.
const KLASSEN = {
    MESS: "Messwerkzeug, kein Urteil", // gibt Zahlen aus, kennt kein Rot
    FRIST: "Zeitfrist/Einschwingen > CI-Budget", // ein Lauf trägt den Deckel einer Gruppe nicht
    ROT: "rot an der Basis", // rot auf main, Täter benannt — die Heilung ist größer als diese Wand
    ZEIT: "Wanduhr nur am Band-Gerät", // urteilt Millisekunden: fährt als zeit:gate: im GPU-Probe-Dienst, nie auf dem Linux-Läufer
    // urteilt ein Bild-Maß: fährt als gate: im GPU-Probe-Dienst mit Bild (w28-tor-bruch, Tafel spec/ci/tor-klassen.json (B))
    AUSSEHEN: "Bild-Maß am Ende der Klasse",
};
// Die EINE Ausnahme-Liste: Wand → { klasse, grund }. Wer hier steht, hält in keinem Workflow den Merge — mit Grund.
const AUSNAHMEN = {
    "gate:verkehr-takt": {
        klasse: KLASSEN.ZEIT,
        // der Sim-Takt des Verkehrs in ms (`--zeit`); in der CI urteilt VK die gezählte Arbeit (w28-verkehr-graph)
        grund: "die Eichung trug sich nicht auf den Linux-Läufer (z397/z399: 2,34–2,56 Eichungen je Schritt dort, unter 1,72 lokal)",
    },
    "gate:pop": {
        klasse: KLASSEN.MESS,
        grund: "der Messplatz von lod.K2#1 im GPU-Probe-Dienst, der Richter ist die Station",
    },
    "gate:laub-kante": {
        klasse: KLASSEN.MESS,
        grund: "der Messplatz von lod.K1#1 im GPU-Probe-Dienst, der Richter ist die Station",
    },
    "gate:schirm-stufen": {
        klasse: KLASSEN.FRIST,
        // zwei Welten am Dorf (die Sitzung in 640 × 360 und die Welt ab dem Boot in 1920 × 1080), je Ding seine Stufe im Bild
        grund:
            "zwei Boots der Welt, einer in 1920 × 1080 (GTX 1050: 269 s; swiftshader trägt ihn nicht) — die Wand des Zugs sind " +
            "gate:stand-takt (W: der Schirm-Schritt) und der Selbsttest der Bild-Linsen (S), der Beweis fährt als GPU-Probe",
    },
    "gate:tag-achse:bahn": {
        klasse: KLASSEN.ROT,
        // die ganze Bahn von licht.K1 (Spawn und Mess-Wiese, Ego und Third) mit dem vollen Soll der Linse (`tagKurveUrteil`);
        // die Wand des Zugs bleibt gate:tag-achse:echt (die Mechanik der Kamera, `TAG_WAND`), die Bahn fährt je Zweig als GPU-Probe
        grund: "auf der Karte ROT am Soll der Szene (GTX 4e2df19b: SPRUNG und BUCKEL im Wurf der Bäume, GOLD, WARM, NACHT und REF am Genesis-Ort) — die Heilung ist licht.K1 selbst",
    },
    "gate:studio-huelle": {
        klasse: KLASSEN.FRIST,
        // Selbsttest und Baum (H1–H5) fahren in npm run check; der Gang (--engine: H3/H4/H6/H10 im echten Browser) braucht die
        // Karte (die swiftshader-Fassung war ein falsches Grün und fiel mit w27-swift-raus) und fährt je Zweig als GPU-Probe
        grund: "der Gang je Seite der Hülle im Browser auf der Karte: GPU-Proben 10.11. an main 2d5f4146 gtx1050-desktop 398 s, radeon-890m 152–173 s, omen-gtx1060 208–444 s",
    },
};

// DIE SHELL eines Schritts: ohne `shell` `bash -e {0}` (KEIN pipefail), `shell: bash` `-eo pipefail`, `shell: sh` `sh -e`;
// npm fährt ein Skript als `sh -c` ohne errexit; `fremd`: eine Shell, deren Text die Linse nicht liest — jeder Befehl stumm.
const SHELL_NPM = { e: false, pipefail: false, fremd: null };
function shellArt(shell) {
    if (shell == null || shell === "" || shell === R6_SHELL) return { e: true, pipefail: false, fremd: null };
    const s = String(shell).trim();
    if (s === "bash") return { e: true, pipefail: true, fremd: null };
    if (s === "sh") return { e: true, pipefail: false, fremd: null };
    if (/^(\S*\/)?(ba)?sh\b/.test(s)) return { e: /\s-\w*e/.test(s), pipefail: /pipefail/.test(s), fremd: null };
    return { e: false, pipefail: false, fremd: s };
}
const norm = (b) => {
    b = b.trim().replace(/\s+/g, " ");
    while (/^[A-Z_][A-Z0-9_]*=\S*\s/.test(b)) b = b.replace(/^[A-Z_][A-Z0-9_]*=\S*\s+/, "");
    return b.replace(/(^|\s)\.\/scripts\//g, "$1scripts/");
};
// Ein Rückfall, der das Rot weiterträgt: `|| exit 1` · `|| exit $?` · `|| false` (die Wand hält).
const STRENGER_RUECKFALL = /^(exit\s+([1-9]\d*|\$\?)|false)$/;
// Die Befehle eines Shell-Texts (run-Block oder npm-Skript) — je Befehl `{ t, stumm }`: `stumm` der Grund, warum sein Rot
// den Schritt NICHT rot macht (null: es macht ihn rot), nach den Regeln der bash (errexit, pipefail, `||`, `!`, `set +e`;
// in einer &&-Kette prüft errexit nur das letzte Glied, nur die LETZTE Liste des Texts trägt jedes Glied).
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
                } else if (!e && !letzte)
                    grund = "ohne errexit (set +e / Shell ohne -e) entscheidet nur der letzte Befehl";
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
const NPM_RUN = /^npm run (?:(?:-s|--silent) )?([\w:.@/-]+)$/;
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
    // die Karten halten kein Tor (LANDUNG ≤ 10 MIN): in ihrer Form fahren sie nur auf Abruf — KARTE_GRUND, (W) zählt die Wand in
    // KARTE_KLASSE; außer Form nennt (E) den Täter und die Wand ist stumm wie jede
    if (job === ECHT_JOB && datei === path.basename(DATEI))
        return echtForm(doc).length ? `der Job „${job}" verfehlt seine Form (E)` : KARTE_GRUND;
    // die volle Stufe hält den Merge: der Kopf-Richter feuert unter VOLL_WENN, die Batterie hinter ihm läuft, solange
    // der Kopf kein grünes Urteil der vollen Batterie trägt — wo sie nicht läuft, steht das Urteil des Kopfs schon
    const vollStufe = datei === path.basename(DATEI) && imVollenLauf(doc, job);
    // der Puls unter PULS_WENN läuft je Push — nur der Stempel ruht, sein Urteil steht am Elter über demselben Baum (V) STEMPEL
    const pulsStufe = datei === path.basename(DATEI) && job === PULS_JOB && normWenn(j.if) === PULS_WENN;
    if (j.if !== undefined && !IMMER.test(String(j.if)) && !vollStufe && !pulsStufe)
        return `der Job „${job}" läuft nur unter „${j.if}"`;
    if (an(s["continue-on-error"])) return "continue-on-error am Schritt";
    if (s.if !== undefined && !IMMER.test(String(s.if))) {
        const [g, M] = [gruppeVon(s), j.strategy?.matrix?.gruppe];
        if (!g) return `läuft nur unter „${s.if}"`;
        if (!Array.isArray(M) || !M.includes(g)) return `Gruppe ${g} steht in keiner Matrix (läuft nie)`;
    }
    return null;
}
// Jeder Schritt jedes Workflows mit seinen aufgelösten Befehlen (die Vorbereitung zählt nicht als Wand-Lauf).
function ciSchritte(docs, skripte) {
    const out = [];
    for (const [datei, doc] of Object.entries(docs))
        for (const [job, j] of Object.entries(jobsVon(doc)))
            for (const s of gates(j)) {
                const erreicht = new Map();
                const shell = s.shell || j.defaults?.run?.shell || doc.defaults?.run?.shell;
                const teile = aufloesen(
                    s.run,
                    skripte,
                    erreicht,
                    0,
                    shellArt(shell),
                    schrittStumm(datei, doc, job, j, s)
                );
                out.push({ datei, job, name: name(s), teile, erreicht, schritt: s, shell: shellArt(shell) });
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
        for (const t of s.teile) t.stumm ? merke(t.t, s, t.stumm) : gefahren.add(t.t);
        for (const [n, g] of s.erreicht) g ? merke("npm run " + n, s, g) : gerufen.add(n);
    }
    // (F) jedes `npm run X` eines Schritts oder Skripts braucht das Skript X (npm bricht sonst in 0 s, kein Gate lief)
    const fehlt = (text, wer) => {
        for (const b of befehle(text)) {
            const m = NPM_RUN.exec(b.t);
            if (m && typeof skripte[m[1]] !== "string")
                v.push(`(F) FEHLT: ${wer} ruft „${b.t}" — package.json kennt es nicht`);
        }
    };
    for (const s of schritte) fehlt(s.schritt.run, `„${s.name}" (${s.datei}/${s.job})`);
    for (const [n, t] of Object.entries(skripte)) fehlt(t, `das Skript „${n}"`);
    const W = waende(skripte);
    const inSich = (teile) => teile.filter((t) => t.stumm);
    const laeuft = (n, teile) =>
        !inSich(teile).length && (gerufen.has(n) || (teile.length > 0 && teile.every((t) => gefahren.has(t.t))));
    // eine Wand der Karte: was die CI von ihr nicht fährt, fährt der Job echt in seiner Form (KARTE_GRUND) — die abgeleitete Klasse
    const nurKarte = (teile) => {
        const rest = teile.filter((t) => !gefahren.has(t.t));
        return !inSich(teile).length && rest.length > 0 && rest.every((t) => (stummBei.get(t.t) || []).some((e) => e.endsWith(KARTE_GRUND)));
    };
    const klassen = new Set(Object.values(KLASSEN));
    const zahl = { waende: W.size, inCi: 0, ausnahmen: 0, offen: 0, jeKlasse: {} };
    for (const [n, teile] of W) {
        if (laeuft(n, teile)) zahl.inCi++;
        else if (ausnahmen[n] || nurKarte(teile)) {
            zahl.ausnahmen++;
            const k = ausnahmen[n] ? ausnahmen[n].klasse : KARTE_KLASSE;
            zahl.jeKlasse[k] = (zahl.jeKlasse[k] || 0) + 1;
        } else {
            zahl.offen++;
            const selbst = inSich(teile);
            const fehlt = teile.filter((t) => !gefahren.has(t.t)).map((t) => t.t);
            const stumm = [
                ...new Set([
                    ...((n.startsWith("gate:") && stummBei.get("npm run " + n)) || []),
                    ...fehlt.flatMap((t) => stummBei.get(t) || []),
                ]),
            ];
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
    // dieser Schritt hält, nur ein anderer, der es AUCH hält) — auch zwischen Karte und voller Batterie (seit w27-swift-raus
    // wiederholt die Karte keinen Schritt mehr: jede Wand an GENAU einer Stelle)
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
function playtestUrteil(docs, skripte) {
    const v = [];
    const ziel = aufloesen(`npm run ${PLAYTEST}`, skripte).map((t) => t.t);
    const traeger = ciSchritte(docs, skripte).filter(
        (s) => s.erreicht.has(PLAYTEST) || (ziel.length && ziel.every((t) => s.teile.some((x) => x.t === t)))
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
                (traeger.length
                    ? ` (nur ${traeger.map((s) => wo(s) + (stumm(s) ? ": " + stumm(s) : "")).join(" · ")})`
                    : "")
        );
    if (traeger.length > 1)
        v.push(
            `(P) ZWILLING: der volle Playtest läuft ${traeger.length}× (${traeger.map(wo).join(" · ")}) — EIN Schritt trägt ihn`
        );
    for (const s of imVoll) {
        const g = stumm(s);
        if (g) v.push(`(P) STUMM: ${wo(s)} fährt den vollen Playtest abgeschaltet — ${g}`);
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
// (O) DER KORPUS-ANTEIL (ci-korpus-einmal, 23.11.): jeder Schritt von check.yml, der den Speicher-Korpus fährt (diag-persistence.cjs
// ohne --stufe/--weg), trägt seinen Anteil k/n (env PERSISTENCE_KORPUS; ohne ihn 1/1 = alle) — die Anteile decken den Korpus
// lückenlos und ohne Doppel: jedes k von n GENAU einmal. Bis hier luden Teil 1 und Teil 2 je alle Stände (1449 s und 1392 s).
const KORPUS_LAUF = /^node scripts\/diag-persistence\.cjs(?!.*\s--(?:stufe|weg)\b)/;
function korpusAnteilUrteil(doc, skripte) {
    const [v, traeger] = [[], []];
    for (const J of Object.values(jobsVon(doc)))
        for (const s of gates(J)) {
            if (!aufloesen(s.run, skripte).some((t) => KORPUS_LAUF.test(t.t))) continue;
            const roh = { ...doc.env, ...J.env, ...s.env }.PERSISTENCE_KORPUS;
            try {
                traeger.push({ name: name(s), ...teilVon(roh === undefined ? "1/1" : roh, "PERSISTENCE_KORPUS") });
            } catch (e) {
                v.push(`(O) Korpus-Anteil unlesbar: „${name(s)}" — ${e.message}`);
            }
        }
    const ns = [...new Set(traeger.map((t) => t.n))];
    const wer = (l) => l.map((t) => `„${t.name}"`).join(" · ");
    if (!traeger.length && !v.length) v.push("(O) Korpus-Anteil fehlt: kein Schritt fährt den Korpus (diag-persistence.cjs)");
    if (ns.length > 1)
        v.push(
            `(O) Korpus-Anteil doppelt: ${traeger.map((t) => `„${t.name}" ${t.k}/${t.n}`).join(" · ")} teilen in verschiedene n — ein Stand lädt mehrmals oder nie`
        );
    else if (ns.length)
        for (let k = 1; k <= ns[0]; k++) {
            const bei = traeger.filter((t) => t.k === k);
            if (bei.length > 1) v.push(`(O) Korpus-Anteil doppelt: ${k}/${ns[0]} in ${wer(bei)}`);
            if (!bei.length) v.push(`(O) Korpus-Anteil fehlt: ${k}/${ns[0]} fährt kein Schritt`);
        }
    return v;
}

function workflowsLesen() {
    const docs = {};
    for (const f of fs.readdirSync(path.join(root, WORKFLOWS)).sort())
        if (/\.ya?ml$/.test(f)) docs[f] = yaml.load(ausDatei(path.join(root, WORKFLOWS, f)));
    return docs;
}

// Alle Gate-Schritte der Datei (je Job, ohne die Vorbereitung), mit ihrer Gruppe.
function gateSchritte(doc) {
    const out = [];
    for (const [job, j] of Object.entries(jobsVon(doc)))
        for (const s of gates(j)) {
            out.push({ job, name: name(s), run: lauf(s), gruppe: gruppeVon(s) || beinVon(s), wenn: s.if });
        }
    return out;
}

// (Z) DER SELBSTTEST IM ZUG (R6, 07.11.): die volle Batterie fährt unter der R6-Shell; jeder Selbsttest läuft nachts, auf
// Abruf, auf main und auf einem Diff, der nur seine Linse ändert — einer, der nie mehr liefe, ist ROT beim Namen. (Die Zug-Stelle
// je Wand — was der echt-Job fuhr, ruhte im Zug auf swiftshader — fiel mit w27-swift-raus: dieselbe Wand an zwei Stellen ist (D).)
function zugStelle(doc, skripte, r6 = R6) {
    const V = jobsVon(doc)[VOLL_JOB] || {};
    if (V.defaults?.run?.shell !== R6_SHELL) return [`(Z) R6: „${VOLL_JOB}" fährt nicht unter ${R6_SHELL}`];
    const env = (e, ref = "refs/heads/main") => ({ GITHUB_ACTIONS: "1", GITHUB_EVENT_NAME: e, GITHUB_REF: ref });
    const [v, aufrufe] = [[], new Set()];
    for (const s of gates(V)) r6.r6Text(s.run, skripte, (a) => (aufrufe.add(a), {}), []);
    for (const a of aufrufe) {
        const linse = (/node\s+([\w./-]+\.c?js)/.exec(a) || [])[1];
        const nie = [env("schedule"), env("workflow_dispatch"), env("push")]
            .filter((e) => !r6.r6Immer(e) || !r6.r6Urteil(a, { immer: r6.r6Immer(e) }).laeuft)
            .map((e) => e.GITHUB_EVENT_NAME);
        if (!r6.r6Urteil(a, { diff: new Map([[linse, []]]), bekannt: () => 1 }).laeuft) nie.push(`Diff ${linse}`);
        // … und auf einem Diff, der nur einen KERN ändert, durch den seine Linse baut (anatomie-r4-heil; ci-klasse `r6Kerne`: der
        // Selbsttest der Mensch-Anatomie ruhte, als w28-mensch-nah foundry-core.js änderte — seine Mutante R4 war ab da stumpf,
        // main fiel erst rot, als ein anderer Diff ihn weckte). Ein Ruf, dessen Kerne der Schlüssel nicht lesen kann, ist ROT.
        const ab = r6.r6Abhaengig(linse || "");
        for (const k of ab.kerne)
            if (!r6.r6Urteil(a, { diff: new Map([[k, []]]), bekannt: () => 1 }, () => ab).laeuft) nie.push(`Diff ${k}`);
        // … und ein WELT-TOR (die Seite der Linse lädt Stamm und Kerne; ci-klasse `weltTueren`) auf JEDEM Laufzeit-Byte
        // (ruhe-gesetz): der Zusatz von gate:koerper-stand ruhte, als w28-auge-der-art stamm/bild-kosten.js änderte — keine
        // geänderte Zeile nannte eines seiner Glieder. Ein Welt-Tor ruht nur, wenn der Diff kein Laufzeit-Byte trägt.
        if (ab.welt && !r6.r6Urteil(a, { diff: new Map([["stamm/bild-kosten.js", []]]), bekannt: () => 1 }, () => ab).laeuft)
            nie.push("Diff stamm/bild-kosten.js");
        if (ab.blind.length)
            v.push(`(Z) KERN: „${linse}" baut im Faden über „${ab.blind[0]}" — der Ruhe-Schlüssel liest seine Kerne nicht (ci-klasse r6Kerne)`); // prettier-ignore
        if (nie.length) v.push(`(Z) NIE: „${a}" liefe nie mehr (${nie.join(" · ")})`);
    }
    return v;
}
function urteil(doc) {
    const v = [];
    for (const job of Object.keys(jobsVon(doc)))
        if (!GRUPPEN_JOBS.includes(job) && job !== KOPF_JOB && job !== ECHT_JOB)
            v.push(
                `(V) JOB: „${job}" steht außerhalb von ${GRUPPEN_JOBS.join(" und ")} (und dem Kopf-Richter „${KOPF_JOB}", den Karten „${ECHT_JOB}") — die Waage sähe ihn nicht`
            );
    for (const job of GRUPPEN_JOBS) {
        const J = jobsVon(doc)[job];
        if (!J) {
            v.push(`(V) LEER: kein Job „${job}" in ${DATEI}`);
            continue;
        }
        if (job === PULS_JOB && (normWenn(J.if) !== PULS_WENN || needsVon(J).length))
            v.push(
                `(V) PULS: „${job}"` +
                    [
                        J.if === undefined
                            ? " fährt am Stempel (ohne die Bedingung des Stempels)"
                            : normWenn(J.if) !== PULS_WENN
                              ? ` trägt die Bedingung „${J.if}"`
                              : "",
                        needsVon(J).length ? ` wartet auf ${needsVon(J).join(", ")}` : "",
                    ]
                        .filter(Boolean)
                        .join(" und") +
                    ` — der Puls läuft je Push außer am Stempel (${PULS_WENN})`
            );
        if (job === VOLL_JOB && (normWenn(J.if) !== VOLL_NACH_KOPF || !needsVon(J).includes(KOPF_JOB)))
            v.push(
                `(V) BEDINGUNG: „${job}" läuft unter „${J.if}"${needsVon(J).includes(KOPF_JOB) ? "" : " ohne needs: " + KOPF_JOB} statt hinter dem Kopf-Richter (needs: ${KOPF_JOB}, if: ${VOLL_NACH_KOPF})`
            );
        v.push(...gruppenUrteil(job, J));
    }
    v.push(...kopfForm(doc), ...echtForm(doc));
    // (D) über ALLE Jobs, die Karten eingeschlossen: ein Befehl, ein Name — seit w27-swift-raus ist der Schritt der vollen
    // Batterie neben demselben auf der Karte kein Zwilling „mit Absicht" mehr, sondern ROT beim Namen
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
    const M = J.strategy?.matrix?.gruppe;
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
    // in dieser Reihenfolge, daneben nur der Schlüssel-Schritt und die Caches — der Schlüssel vor jedem Cache, der
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
        if (npmCi >= 0 && i > npmCi)
            v.push(`(V) VORBEREITUNG: „${job}" ${wer} steht nach npm ci — die Installation las ihn nie`);
        const ids = [...String((s.with || {}).key || "").matchAll(/steps\.([\w-]+)\.outputs/g)].map((m) => m[1]);
        for (const id of ids)
            if (!steps.slice(0, i).some((x) => x.id === id))
                v.push(
                    `(V) VORBEREITUNG: „${job}" ${wer} liest steps.${id}, der vor ihm nicht steht — sein Schlüssel wäre leer`
                );
    });
    const u = steps[steps.length - 1] || {};
    if (u.name !== URTEIL || u.if !== "failure()" || steps[npmCi]?.id !== "vorbereitung")
        v.push(`(U) URTEIL: „${job}" endet nicht mit „${URTEIL}" unter failure() oder npm ci ohne id vorbereitung`);
    const gruppen = new Set(Array.isArray(M) ? M : []);
    const je = new Map([...gruppen].map((g) => [g, 0]));
    for (const s of steps.slice(blockEnde)) {
        if (IST_VORBEREITUNG(s)) continue;
        const g = gruppeVon(s);
        if (!s.if)
            v.push(
                `(G) N-FACH: „${name(s)}" trägt keine Gruppe — er liefe in jeder der ${gruppen.size} Gruppen von „${job}"`
            );
        else if (!g) v.push(`(G) UNKLAR: „${name(s)}" trägt die Bedingung „${s.if}" statt genau einer Gruppe`);
        else if (!gruppen.has(g))
            v.push(
                `(G) VERLOREN: „${name(s)}" trägt Gruppe ${g}, die Matrix von „${job}" kennt ${[...gruppen].join(", ")} — er liefe nie`
            );
        else je.set(g, je.get(g) + 1);
        if (g && !s.if.startsWith(WEITER))
            v.push(`(H) WEITER: „${name(s)}" (${job}) ohne WEITER — ein rotes Vorderglied verbirgt ihn`);
    }
    for (const [g, n] of je)
        if (n === 0) v.push(`(G) LEER: „${job}" Gruppe ${g} trägt keinen Schritt (ein Läufer ohne Arbeit)`);
    return v;
}

// die relative require-Kette des Richters, ab scripts/ci-kopf.cjs (Pfade ab der Wurzel des Repos)
function kopfLaedt() {
    const gesehen = new Set(["scripts/ci-kopf.cjs"]);
    for (const f of gesehen) {
        const text = fs.readFileSync(path.join(root, f), "utf8");
        for (const m of text.matchAll(/require\(\s*["'](\.{1,2}\/[^"']+)["']\s*\)/g)) {
            const z = path.posix.join(path.posix.dirname(f), m[1]);
            if (fs.existsSync(path.join(root, z))) gesehen.add(z);
        }
    }
    return [...gesehen];
}

// der Richter läuft in einem Teil-Checkout: jede Datei seiner relativen require-Kette steht in sparse-checkout — sonst stirbt
// er an MODULE_NOT_FOUND, bevor er urteilt (Lehre z398, 12.11.: die Urteils-Wache kam in ci-kopf.cjs, der Checkout nicht mit).
// Der Leser: der Job `kopf` der check.yml (der Einlass der GPU-Probe lädt den Richter nicht mehr, (V) STEMPEL)
function teilLaedt(J, wer) {
    const co = ((J && J.steps) || []).find((s) => String(s.uses).startsWith("actions/checkout@"));
    const teil = String((co && co.with && co.with["sparse-checkout"]) || "")
        .split(/\s+/)
        .filter(Boolean)
        .map((p) => p.replace(/^\//, ""));
    return teil.length
        ? kopfLaedt()
              .filter((f) => !teil.includes(f))
              .map(
                  (f) =>
                      `(V) KOPF: ${wer} lädt „${f}", der Teil-Checkout holt nur ${teil.join(" · ")} — er stürbe an MODULE_NOT_FOUND vor dem Urteil`
              )
        : [];
}
// (V) STEMPEL am Einlass der GPU-Probe (gpu-probe.yml): er läuft unter EINLASS_WENN (der Stempel weckt ihn nicht) und erbt
// nichts selbst — kein Richter (scripts/ci-kopf.cjs), kein Netz, kein Ausgang „geerbt"; das Erbe hat EINEN Ort, den Zug-Dienst
const PROBE_WF = "gpu-probe.yml";
function einlassTeil(docs) {
    const E = docs[PROBE_WF]?.jobs?.einlass;
    if (!E) return [`(V) STEMPEL: ${PROBE_WF} trägt keinen Job „einlass"`];
    const v = [];
    if (normWenn(E.if) !== EINLASS_WENN)
        v.push(`(V) STEMPEL: der Einlass der GPU-Probe läuft unter „${E.if}" statt ${EINLASS_WENN} — der Stempel weckte ihn`);
    const js = String(E.steps.at(-1)?.env?.EINLASS_JS || "");
    if (/ci-kopf|fetch\(|GH_TOKEN/.test(js) || (E.outputs && E.outputs.geerbt !== undefined))
        v.push(
            "(V) STEMPEL: der Einlass der GPU-Probe erbt selbst (Richter, Netz oder Ausgang „geerbt“) — ein zweiter Weg neben dem Erbe des Zug-Diensts"
        );
    return v;
}

// (V) KOPF: der Kopf-Richter vor der vollen Batterie — unter VOLL_WENN, ohne Matrix, nie stumm, EIN Schritt außer
// checkout (scripts/ci-kopf.cjs mit id), dessen Ausgabe `voll` der Job weiterreicht — nur sie (die Karten fragen ihn nicht mehr)
function kopfForm(doc) {
    const v = [];
    const K = jobsVon(doc)[KOPF_JOB];
    if (!K) return [`(V) KOPF: kein Job „${KOPF_JOB}" — die volle Batterie richtet denselben Kopf auf jedem Zweig neu`];
    if (!istKopfWenn(K.if))
        v.push(`(V) KOPF: „${KOPF_JOB}" läuft unter „${K.if}" statt der EINEN Voll-Bedingung ohne den Stempel (${KOPF_WENN})`);
    if (needsVon(K).length)
        v.push(`(V) KOPF: „${KOPF_JOB}" wartet auf ${needsVon(K).join(", ")} — er steht am Anfang des Laufs`);
    if (K.strategy) v.push(`(V) KOPF: „${KOPF_JOB}" trägt eine Matrix — er richtet einmal je Lauf`);
    if (K["continue-on-error"] !== undefined && K["continue-on-error"] !== false)
        v.push(`(V) KOPF: „${KOPF_JOB}" trägt continue-on-error — ein Fehler der API ließe die Batterie still aus`);
    v.push(...teilLaedt(K, "der Richter"));
    const eigen = (K.steps || []).filter((s) => !String(s.uses).startsWith("actions/checkout@"));
    const r = eigen.find((s) => KOPF_LAUF.test(lauf(s)));
    if (eigen.length !== 1 || !r)
        v.push(
            `(V) KOPF: „${KOPF_JOB}" trägt ${eigen.length} Schritte neben checkout (${eigen.map(name).join(" · ") || "keinen"}) statt EINEM: node scripts/ci-kopf.cjs`
        );
    if (r) {
        if (r["continue-on-error"] !== undefined && r["continue-on-error"] !== false)
            v.push(
                `(V) KOPF: der Richter-Schritt trägt continue-on-error — ein Fehler der API ließe die Batterie still aus`
            );
        if (r.if !== undefined) v.push(`(V) KOPF: der Richter-Schritt trägt die Bedingung „${r.if}"`);
        const soll = r.id ? `\${{ steps.${r.id}.outputs.voll }}` : null;
        if (!soll || normWenn((K.outputs || {}).voll) !== soll)
            v.push(
                `(V) KOPF: „${KOPF_JOB}" reicht outputs.voll nicht aus dem Richter-Schritt (Soll ${soll || "eine id am Schritt"})`
            );
        for (const aus of Object.keys(K.outputs || {}).filter((a) => a !== "voll"))
            v.push(`(V) KOPF: „${KOPF_JOB}" reicht outputs.${aus} — der Richter urteilt nur voll, der Leser läse leer`);
    }
    return v;
}

// (V) SCHLÜSSEL über ALLE Workflows: ein Cache-Schlüssel hasht nur, was der Cache trägt
const VERSIONS_HASH = /hashFiles\(([^)]*\bpackage(?:-lock)?\.json[^)]*)\)/;
function schluesselUrteil(docs) {
    const v = [];
    for (const [datei, doc] of Object.entries(docs))
        for (const [job, J] of Object.entries(jobsVon(doc)))
            for (const s of J.steps || []) {
                const u = String(s.uses || "");
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

// (K) DIE KLASSE (w27-swift-raus, 10.11.; der Schöpfer: „wieso noch die Übersetzung? … geprüft am System, wo's zählt"): die volle
// Batterie trägt die Klasse cpu (env CI_KLASSE: cpu, keine Klasse je Gruppe — bis hier zeichneten die Gruppen 15–18 auf
// GitHub-ubuntu mit swiftshader), die Karten die Klasse gpu. Statisch steht jeder Schritt in der Klasse seines Rezepts
// (scripts/lib/ci-klasse.cjs, die Werkbank eingeschlossen): ein Echt-Rezept in der vollen Batterie ist ein swiftshader-Schritt im
// Zug — ROT beim Namen, seine EINE Stelle ist die Karte; ein Karten-Schritt ohne Echt-Rezept zeichnet dort nie — seine Stelle ist
// eine CPU-Gruppe. Zur Laufzeit urteilen die Weiche (welt-boot, CI_KLASSE) und `werkbank start` dasselbe.
const CI_KLASSE_VOLL = "cpu";
function klassenUrteil(doc, skripte, lies) {
    const v = [];
    const J = jobsVon(doc)[VOLL_JOB];
    if (J) {
        const M = J.strategy?.matrix || {};
        if (M.include || M.klasse)
            v.push(`(K) KLASSE: „${VOLL_JOB}" trägt eine Klasse je Gruppe — die volle Batterie ist cpu`);
        if (!J.env || J.env.CI_KLASSE !== CI_KLASSE_VOLL)
            v.push(`(K) KLASSE: „${VOLL_JOB}" reicht CI_KLASSE ${J.env?.CI_KLASSE} statt ${CI_KLASSE_VOLL}`);
        for (const s of gates(J)) {
            const k = klasseDesLaufs(s.run, skripte, lies);
            if (k.klasse === "gpu")
                v.push(
                    `(K) SWIFTSHADER: „${name(s)}" (${VOLL_JOB} Gruppe ${gruppeVon(s)}) startet ein Echt-Rezept — ${k.wo}: seine Stelle ist die Karte`
                );
        }
    }
    const E = jobsVon(doc)[ECHT_JOB];
    for (const s of E ? gates(E) : []) {
        const k = klasseDesLaufs(s.run, skripte, lies);
        if (k.klasse === "cpu")
            v.push(
                `(K) KARTE: „${name(s)}" (${ECHT_JOB} ${beinVon(s)}) startet kein Echt-Rezept — seine Stelle ist „${VOLL_JOB}"`
            );
    }
    return v;
}
function selbsttestKlasse() {
    const dateien = {
        "a.cjs": 'starteBrowser({ art: "null" });',
        "g.cjs": 'const { x } = require("./lib/h.cjs");',
        "lib/h.cjs": 'starteBrowser({ art: "linse", frist: 1 });',
        "b.cjs": 'const BILD = process.argv.includes("--bild");\nstarteBrowser({ art: BILD ? "linse" : "null" });',
        "s.cjs": 'const SELBST = SELBSTTEST;\nstarteBrowser({ art: SELBST ? "null" : "linse" });',
        "w.cjs": "const tor = werkbankTor(4596);",
        "l.cjs":
            'async function lichtLauf() {\n    await starteBrowser({ art: ECHT ? "echt" : "linse" });\n}\nif (argv.includes("--licht")) return lichtLauf();\nstarteBrowser({ art: "standard" });',
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
        "gate:s": "node scripts/s.cjs --selftest && node scripts/s.cjs",
        "gate:s-selbst": "node scripts/s.cjs --selftest",
        "gate:w": "node scripts/w.cjs",
        "gate:l": "node scripts/l.cjs --selftest",
        "gate:l-licht": "node scripts/l.cjs --licht --selftest",
        "gate:wb": "node scripts/werkbank.cjs licht --naesse --eigen --port 4699",
    };
    const bein = (k) => `\${{ !cancelled() && matrix.karte == '${k}' }}`;
    const doc = () => ({
        jobs: {
            voll: {
                if: VOLL_WENN,
                env: { CI_KLASSE: CI_KLASSE_VOLL },
                strategy: { "fail-fast": false, matrix: { gruppe: [1, 2] } },
                steps: [
                    { name: "A", if: "matrix.gruppe == 1", run: "npm run gate:a" },
                    { name: "B", if: "matrix.gruppe == 1", run: "npm run gate:b" },
                    { name: "S-Selbst", if: "matrix.gruppe == 2", run: "npm run gate:s-selbst" },
                    { name: "L", if: "matrix.gruppe == 2", run: "npm run gate:l" },
                ],
            },
            echt: {
                strategy: { "fail-fast": false, matrix: { karte: ["omen", "radeon"] } },
                steps: [
                    { name: "G auf der Karte", if: bein("omen"), run: "npm run gate:g" },
                    { name: "B-Bild auf der Karte", if: bein("omen"), run: "npm run gate:b-bild" },
                    { name: "S auf der Karte", if: bein("radeon"), run: "npm run gate:s" },
                    { name: "W auf der Karte", if: bein("radeon"), run: "npm run gate:w" },
                    { name: "L-Licht auf der Karte", if: bein("radeon"), run: "npm run gate:l-licht" },
                    { name: "WB auf der Karte", if: bein("radeon"), run: "npm run gate:wb" },
                ],
            },
        },
    });
    const E = (d) => d.jobs.echt;
    // DER MUTANT DES AUFTRAGS: ein swiftshader-gpu-Schritt kehrt in den Zug zurück — je Weg zum Echt-Rezept einer
    const zurueck =
        (i, g = 1) =>
        (d) =>
            V(d).steps.push({ ...E(d).steps[i], if: "matrix.gruppe == " + g });
    const faelle = [
        ["die Klassen im Lot (grün)", () => {}, null],
        [
            "ein Echt-Rezept über eine lib kehrt in die volle Batterie zurück",
            zurueck(0),
            /\(K\) SWIFTSHADER: „G auf der Karte" \(voll Gruppe 1\) startet ein Echt-Rezept — scripts\/g\.cjs → scripts\/lib\/h\.cjs .*seine Stelle ist die Karte/,
        ],
        [
            "der Schalter --bild macht den Zweig echt",
            zurueck(1, 2),
            /\(K\) SWIFTSHADER: „B-Bild auf der Karte" \(voll Gruppe 2\)/,
        ],
        [
            "ohne --selftest zeichnet der Zweig echt",
            zurueck(2),
            /\(K\) SWIFTSHADER: „S auf der Karte" \(voll Gruppe 1\)/,
        ],
        [
            "die Werkbank einer Linse (werkbankTor) in der vollen Batterie",
            zurueck(3),
            /\(K\) SWIFTSHADER: „W auf der Karte" \(voll Gruppe 1\) startet ein Echt-Rezept — scripts\/w\.cjs \(werkbankTor/,
        ],
        [
            "der Lauf hinter seinem Schalter (--licht) in der vollen Batterie",
            zurueck(4),
            /\(K\) SWIFTSHADER: „L-Licht auf der Karte" \(voll Gruppe 1\)/,
        ],
        [
            "die Werkbank mit eigener Welt (--eigen) in der vollen Batterie",
            zurueck(5),
            /\(K\) SWIFTSHADER: „WB auf der Karte" \(voll Gruppe 1\) startet ein Echt-Rezept — „node scripts\/werkbank\.cjs licht --naesse --eigen/,
        ],
        [
            "ein CPU-Schritt (Null-Renderer) auf der Karte",
            (d) => E(d).steps.push({ ...V(d).steps[0], if: bein("omen") }),
            /\(K\) KARTE: „A" \(echt omen\) startet kein Echt-Rezept/,
        ],
        [
            "die GPU-Gruppe kehrt als Klasse zurück",
            (d) =>
                (V(d).strategy.matrix.include = [
                    { gruppe: 1, klasse: "cpu" },
                    { gruppe: 2, klasse: "gpu" },
                ]),
            /\(K\) KLASSE: „voll" trägt eine Klasse je Gruppe/,
        ],
        [
            "die Klasse reist nicht an die Schritte",
            (d) => delete V(d).env,
            /\(K\) KLASSE: „voll" reicht CI_KLASSE undefined statt cpu/,
        ],
    ];
    const f = [];
    taeterFaelle(faelle, (d) => klassenUrteil(d, skripte, lies), { fehler: f, klon: doc });
    return f;
}

// (T) DIE WAAGE je Job und Gruppe: der PLAN (Vorbereitung + Gewichte, dieselben Zahlen, mit denen ci-zeiten.cjs verteilt) gegen
// den Deckel seiner Klasse (Puls PULS_S, Voll das Mittel der Klasse + RAND_S); ROT nur, was die Verteilung senken kann, und
// (T) FRIST, wo timeout-minutes den Plan nicht 1,2-fach hält. Die Wanduhr (der längste Weg im Plan) steht als Zahl und sperrt nie;
// die grün gezählte Job-Dauer je Gruppe fiel (sie nannte G18 8,5 min, während die Gruppe am 20-min-Deckel brach).
const minuten = (s) => (s / 60).toFixed(1).replace(".", ",");
// die Merges auf dem ersten Eltern-Weg seit dem Kopf der Quelle (der Puls holt die Geschichte ganz, fetch-depth 0)
const seitKopf = (kopf) =>
    /^[0-9a-f]{40}$/.test(String(kopf))
        ? Number(
              execSync(`git rev-list --count --first-parent --merges ${kopf}..HEAD`, {
                  cwd: root,
                  stdio: "pipe",
              }).toString()
          )
        : NaN;
const LINIE = [process.env.GITHUB_BASE_REF, process.env.GITHUB_REF_NAME || execSync("git rev-parse --abbrev-ref HEAD", { cwd: root, stdio: "pipe" }).toString().trim()].some((z) => z === "integ-probe" || z === "main"); // prettier-ignore
function waage(doc, zeiten, alterVon = seitKopf, sperrt = LINIE) {
    const [v, alt] = [[], []];
    const zeilen = [];
    const Z = zeiten?.schritte || {};
    const vorb = zeiten && Number(zeiten.vorbereitung_s);
    if (!(vorb >= 0)) return { v: [`(T) ZEITEN: ${ZEITEN} trägt keine vorbereitung_s`], zeilen };
    const alter = (() => {
        try {
            return alterVon(zeiten.kopf);
        } catch {
            return NaN;
        }
    })();
    if (!(alter >= 0))
        v.push(
            `(T) ALT: der Kopf der Zeit-Quelle „${zeiten.kopf}" ist in der Geschichte nicht aufzulösen — keine Messung urteilt`
        );
    else if (!(alter <= Number(zeiten.je_schritt)))
        (sperrt ? v : alt).push(
            `(T) ALT: seit dem Kopf der Zeit-Quelle (${String(zeiten.kopf).slice(0, 8)}) trugen ${alter} Merges je einen vollen ` +
                `Lauf, sie misst je Schritt ${zeiten.je_schritt} — älter als ihre Läufe (node scripts/ci-zeiten.cjs)`
        );
    const [imLauf, gruppen, deckel, schwerste, gross] = [[], [], new Map(), new Map(), new Set()];
    // das Gewicht eines Schritts, ohne Zeit ROT beim Namen (null)
    const gewicht = (s, job) =>
        Z[name(s)]?.s >= 0
            ? Z[name(s)].s
            : v.push(
                  `(T) UNGEMESSEN: „${name(s)}" (${job}) trägt keine Zeit in ${ZEITEN} — messen (node scripts/ci-zeiten.cjs)`
              ) && null;
    for (const [job, J] of Object.entries(jobsVon(doc))) {
        // je Push: ohne Bedingung, oder der Puls unter PULS_WENN (er ruht nur am Stempel, (V) STEMPEL)
        const jePush = (J.if === undefined || (job === PULS_JOB && normWenn(J.if) === PULS_WENN)) && !needsVon(J).length;
        const art = jePush ? "push" : imVollenLauf(doc, job) ? "voll" : null;
        if (!art) continue; // eine andere Bedingung urteilt (V)/(S)
        const M = J.strategy?.matrix || {};
        const gs = Array.isArray(M.gruppe) ? M.gruppe : [null];
        imLauf.push([job, J, gs.length]);
        const steps = gates(J);
        for (const g of gs) {
            const mein = steps.filter((s) => g === null || !s.if || gruppeVon(s) === g);
            let summe = vorb;
            let groesster = null;
            for (const s of mein) {
                const z = gewicht(s, job);
                if (z === null) continue;
                summe += z;
                if (z > GROSS_S) gross.add(`„${name(s)}" ${minuten(z)}`);
                if (!groesster || z > groesster[1]) groesster = [name(s), z];
            }
            const klasse = job;
            const wer = g === null ? job : `${job} ${g}/${gs.length}`;
            gruppen.push({ job, art, klasse, plan: summe, n: mein.length, groesster, wer });
            if (art === "voll" && 1.2 * summe > 60 * J["timeout-minutes"])
                v.push(
                    `(T) FRIST: „${wer}" trägt im langsamen Lauf ${minuten(summe)} min, timeout-minutes ${J["timeout-minutes"]} hält nicht 1,2 × davon`
                );
            // z795 (27.11.): der Puls 1 lief am Zug-Kandidaten zweimal in seinen Deckel 10 min — abgebrochen ist kein Urteil
            if (art === "push" && PULS_FRIST * summe > 60 * J["timeout-minutes"])
                v.push(
                    `(T) FRIST: „${wer}" trägt im Median ${minuten(summe)} min, timeout-minutes ${J["timeout-minutes"]} hält nicht ${String(PULS_FRIST).replace(".", ",")} × davon`
                );
            const k = deckel.get(klasse) || deckel.set(klasse, { s: 0, n: 0, art }).get(klasse);
            [k.s, k.n, k.d] = [k.s + summe, k.n + 1, art === "push" ? PULS_S : (k.s + summe) / (k.n + 1) + RAND_S];
        }
    }
    for (const { job, art, klasse, plan, n, groesster, wer } of gruppen) {
        const { d, s: summe, n: zahl } = deckel.get(klasse);
        const wie =
            art === "push" ? "je Push" : `= Mittel der Klasse ${minuten(summe / zahl)} + Rand ${minuten(RAND_S)}`;
        zeilen.push(`${wer} ${minuten(plan)} (${n})`);
        if (!schwerste.has(job) || plan > schwerste.get(job)[1]) schwerste.set(job, [wer, plan]);
        if (groesster && ueber(vorb + groesster[1], d)) {
            gross.add(`„${groesster[0]}" ${minuten(groesster[1])}`);
            if (n > 1)
                v.push(
                    `(T) ALLEIN: „${groesster[0]}" trägt allein ${minuten(vorb + groesster[1])} min, über dem Deckel von „${wer}" ` +
                        `(${minuten(d)} min) — ${n - 1} Schritte fahren mit; er steht allein (eine eigene Karte)`
                );
        } else if (ueber(plan, d))
            v.push(
                `(T) WAAGE: „${wer}" trägt ${minuten(plan)} min (Deckel ${minuten(d)} min ${wie})` +
                    (groesster ? ` — der größte Schritt „${groesster[0]}" ${minuten(groesster[1])} min` : "") +
                    " — die Verteilung senkt sie: node scripts/ci-zeiten.cjs"
            );
    }
    // (E) der Plan je Karte: die Vorbereitung ihres Läufers und die Zeiten ihrer Schritte auf der Karte, je Bein höchstens
    // ECHT_PLAN_S — die Karten laufen zugleich, das schwerste Bein ist ihr Weg (die Wanduhr unten)
    const E = jobsVon(doc)[ECHT_JOB];
    if (E) {
        const vb = zeiten?.echt?.vorbereitung_s || {};
        for (const k of kartenVon(doc)) {
            const wer = `${ECHT_JOB} ${k}`;
            if (!(Number(vb[k]) >= 0)) v.push(`(T) ZEITEN: ${ZEITEN} trägt keine echt.vorbereitung_s.${k}`);
            let plan = Number(vb[k]) || 0;
            for (const s of gates(E).filter((x) => beinVon(x) === k)) plan += gewicht(s, wer) || 0;
            zeilen.push(`${wer} ${minuten(plan)}`);
            if (!schwerste.has(ECHT_JOB) || plan > schwerste.get(ECHT_JOB)[1]) schwerste.set(ECHT_JOB, [wer, plan]);
            if (ueber(plan, ECHT_PLAN_S))
                v.push(`(T) ECHT: „${wer}" trägt ${minuten(plan)} min (Deckel ${minuten(ECHT_PLAN_S)} min)`);
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
    // die WANDUHR (benannt, nie ROT): der längste Weg — je Job seine schwerste Gruppe plus die der Jobs, auf die er wartet; die
    // Karten fahren nur auf Abruf (LANDUNG ≤ 10 MIN), nie im vollen Lauf: ihr Bein steht im Plan (T) ECHT, nie auf diesem Weg
    const weg = (job, tiefe = 0) => {
        const J = doc.jobs[job];
        const eigen = schwerste.has(job) ? schwerste.get(job)[1] : 0;
        const vor = tiefe < 8 ? needsVon(J).map((n) => (doc.jobs[n] ? weg(n, tiefe + 1) : [0, ""])) : [];
        const v0 = vor.reduce((m, x) => (x[0] > m[0] ? x : m), [0, ""]);
        return [v0[0] + eigen, (v0[1] ? v0[1] + " → " : "") + (schwerste.has(job) ? schwerste.get(job)[0] : job)];
    };
    const wege = imLauf.map(([job]) => weg(job));
    const laengster = wege.reduce((m, x) => (x[0] > m[0] ? x : m), [0, ""]);
    const voll = [...deckel].filter(([, k]) => k.art === "voll" && k.n > 1).map(([kl, k]) => `${kl} ${minuten(k.d)}`);
    return { v, zeilen, plaetze, wanduhr: laengster, gross: [...gross], deckel: voll, alt };
}

// Fixture-Bausteine: der Kopf-Richter in seiner Form, ein Cache-Schritt
const CHECKOUT = { uses: "actions/checkout@v4" };
const kopfJob = () => ({
    if: KOPF_WENN,
    outputs: { voll: "${{ steps.kopf.outputs.voll }}" },
    steps: [CHECKOUT, { name: "Kopf", id: "kopf", run: "node scripts/ci-kopf.cjs" }],
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
                    CHECKOUT,
                    { uses: "actions/setup-node@v4", with: { "node-version": "22" } },
                    { name: "Cache-Schlüssel", id: "schluessel", run: "node scripts/ci-schluessel.cjs" },
                    cacheSchritt(
                        "~/.npm",
                        "npm-${{ runner.os }}-${{ steps.schluessel.outputs.npm }}",
                        "npm-${{ runner.os }}-"
                    ),
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
    taeterFaelle(faelle, (d) => schluesselUrteil({ "t.yml": d }), { fehler: f, klon: doc });
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
        if (!ok)
            f.push(
                `Schlüssel „${n}": npm ${npmGleich ? "soll gleich" : "soll neu"}, chrome ${chromeGleich ? "soll gleich" : "soll neu"}`
            );
    }
    return f;
}

// (V) KOPF: das Urteil des Kopf-Richters (scripts/ci-kopf.cjs) gegen die Fälle
function selbsttestKopf(urteile = kopfUrteil) {
    const gruen = (id, event = "push", voll = ["success", "success"]) => ({
        lauf: { id, event, status: "completed", conclusion: "success", head_branch: "w28-zweig" },
        jobs: [{ name: "puls 1/2", conclusion: "success" }].concat(
            voll.map((c, i) => ({ name: `voll ${i + 1}/2`, conclusion: c }))
        ),
    });
    const lauf = (x, lauf) => ({ ...x, lauf: { ...x.lauf, ...lauf } });
    const laufend = lauf(gruen(1), { status: "in_progress", conclusion: null });
    // der eigene Lauf: ein push auf main (die Nachwache) — im Zug (ZUG_REFS) fragt der Richter nichts
    // pr: { kopfZweig, eigen } eines pull_request (der Kopf-Zweig und ob er im eigenen Repo liegt)
    const fall = (ereignis, laeufe, gewartet = [], ref = "refs/heads/main", pr = {}) => ({
        ereignis,
        ref,
        eigenerLauf: 9,
        laeufe: laeufe.map((x) => x.lauf),
        jobsJe: Object.fromEntries(laeufe.map((x) => [x.lauf.id, x.jobs])),
        gewartet,
        ...pr,
    });
    const PR_REF = "refs/pull/7/merge";
    // [Name, Fall, Soll: „ja"/„nein" (voll) · „warte" · „rot" · ein Prüfer am Urteil]
    const faelle = [
        ["derselbe Kopf grün am Zweig (der Stempel landet, main erbt)", fall("push", [gruen(1)]), "nein"],
        ["kein anderer Lauf", fall("push", []), "ja"],
        ["nur der eigene Lauf", fall("push", [gruen(9)]), "ja"],
        ["auf Abruf läuft sie immer", fall("workflow_dispatch", [gruen(1)]), "ja"],
        ["ein PR prüft den Merge, nie den Kopf", fall("pull_request", [gruen(1)]), "ja"],
        // 26.11.: je Cloud-Kopf fuhren push UND pull_request die 22 Jobs — den Kopf richtet der push am selben Zweig
        [
            "der Zwilling: ein PR aus dem eigenen Zweig (der push am selben Zweig richtet den Kopf)",
            fall("pull_request", [], [], PR_REF, { kopfZweig: "leib-liest-satz", eigen: true }),
            "nein",
        ],
        [
            "der Zwilling wartet auf keinen Lauf und liest keinen",
            fall("pull_request", [laufend], [], PR_REF, { kopfZweig: "leib-liest-satz", eigen: true }),
            "nein",
        ],
        [
            "kein Zwilling: ein PR aus einem Fork (dort fährt hier kein push)",
            fall("pull_request", [], [], PR_REF, { kopfZweig: "leib-liest-satz", eigen: false }),
            "ja",
        ],
        [
            "kein Zwilling: ein PR aus claude/** (check.yml nimmt den Zweig vom push aus)",
            fall("pull_request", [], [], PR_REF, { kopfZweig: "claude/leib-liest-satz", eigen: true }),
            "ja",
        ],
        ["der grüne Lauf war ein PR", fall("push", [gruen(1, "pull_request")]), "ja"],
        ["der grüne Lauf trug nur den Puls", fall("push", [gruen(1, "push", [])]), "ja"],
        ["eine Voll-Gruppe übersprungen", fall("push", [gruen(1, "push", ["success", "skipped"])]), "ja"],
        // Richter 22.10.: Doppel-Batterien auf derselben SHA
        ["ein älterer Lauf läuft noch (er wird abgewartet)", fall("push", [laufend]), "warte"],
        ["ein jüngerer Lauf läuft noch (kein Kreis)", fall("push", [lauf(laufend, { id: 12 })]), "ja"],
        ["laufend, dann grün", fall("push", [gruen(1)], [1]), "nein"],
        ["laufend, dann rot", fall("push", [lauf(gruen(1), { conclusion: "failure" })], [1]), "rot"],
        [
            "laufend, dann abgebrochen (die Batterie fährt selbst)",
            fall("push", [lauf(gruen(1), { conclusion: "cancelled" })], [1]),
            "ja",
        ],
        [
            "der Kopf stand rot (die Batterie fährt)",
            fall("push", [lauf(gruen(1, "push", ["failure"]), { conclusion: "failure" })]),
            "ja",
        ],
        // LANDUNG ≤ 10 MIN (23.11.): der Zug fährt voll nie — ohne Frage an die API, auch neben einem laufenden Lauf
        ["im Zug: push auf integ-probe (der Kandidat)", fall("push", [], [], "refs/heads/integ-probe"), "nein"],
        ["im Zug: push auf zug-a (die Hälfte der Bisektion)", fall("push", [], [], "refs/heads/zug-a"), "nein"],
        ["im Zug: push auf zug-b", fall("push", [], [], "refs/heads/zug-b"), "nein"],
        ["im Zug wartet der Richter auf keinen älteren Lauf", fall("push", [laufend], [], "refs/heads/integ-probe"), "nein"],
        ["auf Abruf an integ-probe läuft sie (der Abruf ist kein Zug)", fall("workflow_dispatch", [], [], "refs/heads/integ-probe"), "ja"],
        [
            "die Nachwache auf main: der Zug-Lauf am selben Kopf trug kopf und Puls, nie voll (sie fährt)",
            fall("push", [gruen(1, "push", ["skipped", "skipped"])]),
            "ja",
        ],
    ];
    const pruefe = (u) => {
        const f = [];
        for (const [n, e, soll] of faelle) {
            const x = u(e);
            const art = x.warte ? "warte" : x.rot ? "rot" : x.voll;
            if ((typeof soll === "function" ? soll(x) : art === soll) === false)
                f.push([n, `${art} statt ${typeof soll === "function" ? "der Prüfung" : soll}`, x]);
        }
        return f;
    };
    const rot = pruefe(urteile);
    for (const [n, e] of faelle) {
        const x = urteile(e);
        const r = rot.find(([m]) => m === n);
        console.log(
            `  ${r ? "❌" : "✅"} Selbsttest Kopf „${n}" → ${x.warte ? "warte" : x.rot ? "rot" : x.voll} (${x.grund || x.rot || (x.warte && x.warte.id)})`
        );
    }
    const f = rot.map(([n, w]) => `Kopf „${n}": ${w}`);
    // DER MUTANT: der alte Richter (blind für den Ref: jeder push fragt nach der Batterie) — er fällt an den Zug-Fällen
    if (urteile === kopfUrteil) {
        const alt = pruefe((e) => kopfUrteil({ ...e, ref: "refs/heads/main" })).map(([n]) => n);
        const zug = faelle.filter(([n]) => n.startsWith("im Zug")).map(([n]) => n);
        const ok = zug.every((n) => alt.includes(n));
        console.log(
            `  ${ok ? "✅" : "❌"} Selbsttest Kopf, Mutant „der Richter blind für den Zug" → ${alt.length ? "ROT an „" + alt.join("“ · „") + '"' : "bleibt grün"}`
        );
        if (!ok) f.push("Kopf: der Mutant „der Richter blind für den Zug\" fällt nicht an jedem Zug-Fall — die Fälle sind vakuös");
        // DIE DREI MUTANTEN DES ZWILLINGS: der alte Richter (jeder PR fährt die Batterie), der Richter blind für den Fork (jeder PR
        // gilt als eigen) und der Richter blind für claude/** (jeder Zweig gilt als vom push gedeckt) — jeder fällt an SEINEM Fall
        const zwilling = [
            ["der Richter blind für den Zwilling (jeder PR fährt die Batterie doppelt)", (e) => ({ ...e, eigen: undefined }), "der Zwilling"],
            ["der Richter blind für den Fork", (e) => ({ ...e, eigen: e.ereignis === "pull_request" ? true : e.eigen }), "kein Zwilling: ein PR aus einem Fork"],
            ["der Richter blind für claude/**", (e) => ({ ...e, kopfZweig: e.kopfZweig && e.kopfZweig.replace(/^claude\//, "") }), "kein Zwilling: ein PR aus claude/**"],
        ];
        for (const [n, m, an] of zwilling) {
            const faellt = pruefe((e) => kopfUrteil(m(e))).map(([x]) => x);
            const trifft = faellt.some((x) => x.startsWith(an));
            console.log(
                `  ${trifft ? "✅" : "❌"} Selbsttest Kopf, Mutant „${n}" → ${faellt.length ? "ROT an „" + faellt.join("“ · „") + '"' : "bleibt grün"}`
            );
            if (!trifft) f.push(`Kopf: der Mutant „${n}" fällt nicht an „${an} …" — die Fälle sind vakuös`);
        }
    }
    return f;
}

// die Vorbereitung eines Fixture-Jobs (Checkout, Node, System-Libs, Dependencies), dahinter seine Schritte
const prep = (...schritte) => [
    CHECKOUT,
    { uses: "actions/setup-node@v4" },
    { name: "System-Libs", run: "sudo apt-get install -y libnss3" },
    { name: "Dependencies", id: "vorbereitung", run: "npm ci --no-audit --no-fund" },
    ...schritte,
];
const [gr, U] = [(g) => WEITER + "matrix.gruppe == " + g, { name: URTEIL, if: "failure()" }];
function selbsttest() {
    const gut = () => ({
        jobs: {
            puls: {
                if: PULS_WENN,
                strategy: { "fail-fast": false, matrix: { gruppe: [1] } },
                "timeout-minutes": 10,
                steps: prep({ name: "Lint", if: gr(1), run: "npm run lint" }, U),
            },
            kopf: kopfJob(),
            voll: {
                needs: KOPF_JOB,
                if: VOLL_NACH_KOPF,
                strategy: { "fail-fast": false, matrix: { gruppe: [1, 2] } },
                "timeout-minutes": 30,
                steps: prep(
                    { name: "A", if: gr(1), run: "npm run gate:a" },
                    { name: "B", if: gr(2), run: "npm run gate:b" },
                    { name: "C", if: gr(1), run: "npm run gate:c" },
                    U
                ),
            },
        },
    });
    // (E) die Karten in ihrer Form: zwei Beine, je Schritt genau eines (D auf omen, W auf radeon), mit Frist
    const bein = (k) => `\${{ !cancelled() && matrix.karte == '${k}' }}`;
    const echtDazu = (d) =>
        ((d.on = { push: { branches: ["**"] }, workflow_dispatch: { inputs: { [ECHT_WAHL]: { type: "boolean", default: false } } } }),
        (d.jobs.echt = {
            if: ECHT_WENN,
            strategy: { "fail-fast": false, matrix: { karte: ["omen", "radeon"] } },
            "runs-on": [...ECHT_LAEUFER],
            "timeout-minutes": 30,
            env: { CI_KLASSE: "gpu", LINSE_GPU: "karte" },
            steps: [
                CHECKOUT,
                { uses: "actions/setup-node@v4" },
                { name: "Dependencies", run: "npm ci --no-audit --no-fund" },
                { name: "D auf der Karte", if: bein("omen"), run: "npm run gate:d", "timeout-minutes": 5 },
                { name: "W auf der Karte", if: bein("radeon"), run: "npm run gate:w", "timeout-minutes": 5 },
            ],
        }));
    const faelle = [
        [
            "ein Karten-Schritt ohne Frist",
            (d) => delete echtDazu(d).steps[3]["timeout-minutes"],
            /\(E\) FRIST: „D auf der Karte" trägt keine timeout-minutes/,
        ],
        [
            "die Karten über dem Job-Deckel (150 min)",
            (d) => (echtDazu(d)["timeout-minutes"] = 150),
            /\(E\) DECKEL: „echt" timeout-minutes 150/,
        ],
        // LANDUNG ≤ 10 MIN (23.11.): die Karten fahren in keinem Zug und keiner Nacht — der Täter ist jede alte Form
        [
            "die Karten wieder im Zug (push auf integ-probe, hinter dem Kopf-Richter)",
            (d) =>
                Object.assign(echtDazu(d), {
                    needs: KOPF_JOB,
                    if: "github.event_name == 'push' && github.ref == 'refs/heads/integ-probe' && needs.kopf.result == 'success'",
                }),
            /\(E\) ABRUF: „echt" läuft unter „github\.event_name == 'push' && github\.ref == 'refs\/heads\/integ-probe'.*" hinter kopf statt nur auf Abruf/,
        ],
        [
            "die Karten wieder nachts",
            (d) => (echtDazu(d).if = "github.event_name == 'schedule' || github.event_name == 'workflow_dispatch'"),
            /\(E\) ABRUF: „echt" läuft unter „github\.event_name == 'schedule'/,
        ],
        [
            "die Karten auf Abruf, aber hinter dem Kopf-Richter (er fragte nach ihnen)",
            (d) => (echtDazu(d).needs = KOPF_JOB),
            /\(E\) ABRUF: „echt" läuft unter „github\.event_name == 'workflow_dispatch' && inputs\.karten" hinter kopf/,
        ],
        [
            "der Abruf ohne die Wahl der Karten (jeder Anstoß der vollen Batterie führe drei Beine mit)",
            (d) => (echtDazu(d), (d.on.workflow_dispatch.inputs[ECHT_WAHL].default = true)),
            /\(E\) ABRUF: on\.workflow_dispatch\.inputs\.karten ist \{"type":"boolean","default":true\}/,
        ],
        [
            "die Wahl fehlt (die Karten liefen nie)",
            (d) => (echtDazu(d), (d.on.workflow_dispatch = null)),
            /\(E\) ABRUF: on\.workflow_dispatch\.inputs\.karten ist undefined/,
        ],
        [
            "der Kopf-Richter reicht noch echt (der Leser läse leer)",
            (d) => (d.jobs.kopf.outputs.echt = "${{ steps.kopf.outputs.echt }}"),
            /\(V\) KOPF: „kopf" reicht outputs\.echt — der Richter urteilt nur voll/,
        ],
        [
            "ein Karten-Schritt ohne Bein (er liefe auf jeder Karte)",
            (d) => (echtDazu(d).steps[3].if = "${{ !cancelled() }}"),
            /\(E\) BEIN: „D auf der Karte" trägt kein Bein/,
        ],
        [
            "ein Bein außerhalb der Matrix (er liefe nie)",
            (d) => (echtDazu(d).steps[3].if = bein("gtx1050")),
            /\(E\) BEIN: „D auf der Karte" trägt die Karte „gtx1050" außerhalb der Matrix/,
        ],
        [
            "eine Karte ohne Arbeit",
            (d) => echtDazu(d).strategy.matrix.karte.push("gtx1050"),
            /\(E\) LEER: das Bein „gtx1050"/,
        ],
        [
            "die Karten an einem festen Label (alle Beine auf einem Läufer)",
            (d) => (echtDazu(d)["runs-on"] = ["self-hosted", "echt-gpu"]),
            /\(E\) ECHT: „echt" läuft nicht auf \[self-hosted, \$\{\{ matrix\.karte \}\}-gpu\]/,
        ],
        [
            "derselbe Schritt in voll und auf der Karte (der Zwilling)",
            (d) =>
                echtDazu(d).steps.push({
                    name: "B auf der Karte",
                    if: bein("omen"),
                    run: "npm run gate:b",
                    "timeout-minutes": 5,
                }),
            /\(D\) DOPPELT: „npm run gate:b" läuft 2× \(voll\/2, echt\/omen\)/,
        ],
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
            ["jobs.puls.steps.2.if=", "matrix.gruppe == 1"],
            /\(V\) VORBEREITUNG: „puls" „System-Libs" trägt eine Bedingung/,
        ],
        ["keine Matrix", (d) => delete V(d).strategy.matrix, /\(V\) MATRIX: „voll"/],
        // (H) (U): z150 voll 11 — „Die Fahr-Linse des Lebens" rot, „Die Klang-Linse" dahinter lief nie
        ["die alte Kette", (d) => (V(d).steps[6].if = "matrix.gruppe == 1"), /\(H\) WEITER: „C" \(voll\) ohne WEITER/],
        ["npm ci ohne id", (d) => delete V(d).steps[3].id, /\(U\) URTEIL: „voll"/],
        ["ohne Urteil", (d) => V(d).steps.pop(), /\(U\) URTEIL: „voll" endet nicht/],
        // die zwei Stufen: genau puls und voll, der Puls ohne Bedingung, voll unter der EINEN Bedingung
        [
            "ein dritter Job neben puls und voll",
            ["jobs.check=", { steps: [{ name: "X", run: "npm run gate:x" }] }],
            /\(V\) JOB: „check" steht außerhalb von puls und voll/,
        ],
        [
            "voll unter einer anderen Bedingung",
            (d) => (V(d).if = "github.ref == 'refs/heads/main'"),
            /\(V\) BEDINGUNG: „voll" läuft unter „github\.ref == 'refs\/heads\/main'"/,
        ],
        [
            "der Puls unter einer Bedingung",
            ["jobs.puls.if=", "github.ref == 'refs/heads/main'"],
            /\(V\) PULS: „puls" trägt die Bedingung/,
        ],
        // (V) STEMPEL: der Stand bis zug-erbt-baum — der Stempel weckt Puls und Kopf-Richter (z747–z749: 5 Jobs je Stempel)
        ["der Puls fährt am Stempel", ["jobs.puls.if"], /\(V\) PULS: „puls" fährt am Stempel/],
        ["der Kopf-Richter fährt am Stempel", ["jobs.kopf.if=", VOLL_WENN], /\(V\) KOPF: „kopf" läuft unter .* statt der EINEN Voll-Bedingung ohne den Stempel/], // prettier-ignore
        ["kein Job voll", ["jobs.voll"], /\(V\) LEER: kein Job „voll"/],
        // EIN URTEIL JE KOPF: der Kopf-Richter vor der Batterie, nie stumm, EIN Schritt
        ["kein Kopf-Richter", ["jobs.kopf"], /\(V\) KOPF: kein Job „kopf"/],
        [
            "die Batterie ohne den Kopf-Richter",
            (d) => {
                V(d).if = VOLL_WENN;
                delete V(d).needs;
            },
            /\(V\) BEDINGUNG: „voll" läuft unter „github\.event_name == 'workflow_dispatch'.*" ohne needs: kopf/,
        ],
        [
            "der Kopf-Richter unter einer anderen Bedingung",
            ["jobs.kopf.if=", "github.ref == 'refs/heads/main'"],
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
        [
            "der Teil-Checkout des Kopf-Richters ohne seine Bibliothek",
            (d) =>
                (d.jobs.kopf.steps[0] = {
                    uses: "actions/checkout@v4",
                    with: { "sparse-checkout": "scripts/ci-kopf.cjs" },
                }),
            /\(V\) KOPF: der Richter lädt „scripts\/lib\/urteil-zeile\.cjs", der Teil-Checkout holt nur scripts\/ci-kopf\.cjs/,
        ],
        ["die Ausgabe nicht weitergereicht", ["jobs.kopf.outputs"], /\(V\) KOPF: „kopf" reicht outputs\.voll nicht/],
        ["der Puls wartet auf den Kopf", ["jobs.puls.needs=", KOPF_JOB], /\(V\) PULS: „puls" .*wartet auf kopf/],
        // die Caches: der Schlüssel vor dem Cache, der Cache vor npm ci
        [
            "ein Cache nach npm ci",
            (d) => V(d).steps.splice(4, 0, cacheSchritt("~/.npm", "npm-${{ runner.os }}-x")),
            /\(V\) VORBEREITUNG: „voll" Cache „~\/\.npm" steht nach npm ci/,
        ],
        [
            "der Cache vor seinem Schlüssel",
            (d) =>
                V(d).steps.splice(
                    1,
                    0,
                    cacheSchritt("~/.npm", "npm-${{ runner.os }}-${{ steps.schluessel.outputs.npm }}")
                ),
            /\(V\) VORBEREITUNG: „voll" Cache „~\/\.npm" liest steps\.schluessel, der vor ihm nicht steht/,
        ],
    ];
    const f = [];
    for (const [n, d] of [
        ["", gut()],
        [" mit echt", gut()],
    ]) {
        if (n) echtDazu(d);
        const g0 = urteil(d);
        if (g0.length) f.push(`der gute Stand${n} ist rot: ` + g0.join(" · "));
    }
    taeterFaelle(faelle, urteil, { fehler: f, klon: gut });
    // (F) am Täter: die echte check.yml mit dem Schritt vom 22.10. gegen das echte package.json
    const wf = workflowsLesen();
    wf[path.basename(DATEI)].jobs[VOLL_JOB].steps.push({
        name: "Fernstufe",
        if: "matrix.gruppe == 4",
        run: "npm run gate:fahrzeug-fern",
    });
    const tf = deckung(require(path.join(root, "package.json")).scripts, wf, AUSNAHMEN).v.filter((x) =>
        x.startsWith("(F)")
    );
    const okF = tf.length === 1 && /„Fernstufe" \(check\.yml\/voll\) ruft „npm run gate:fahrzeug-fern"/.test(tf[0]);
    console.log(
        `  ${okF ? "✅" : "❌"} Selbsttest „die echte check.yml mit dem gefallenen Schritt" → ${tf.join(" · ") || "grün"}`
    );
    if (!okF) f.push("(F) der Schritt Fahrzeug-Fernstufe an der echten check.yml fällt nicht rot beim Namen");
    return f.concat(
        selbsttestWaage(),
        selbsttestGegenrichtung(),
        selbsttestPlaytest(),
        selbsttestKorpus(),
        selbsttestKlasse(),
        selbsttestSchluessel(),
        selbsttestKopf(),
        selbsttestEinlass(),
        selbsttestZug()
    );
}
// (Z) gegen die echte check.yml: je Mutante der R6-Shell der Täter beim Namen
// (V) STEMPEL am Einlass der GPU-Probe: die echten Workflows sind grün; ein Einlass, den der Stempel weckt (der Stand bis
// zug-erbt-baum), und einer, der wieder selbst erbt (der Stand stempel-erbt-probe: der Richter im Einlass), fallen beim Namen
function selbsttestEinlass() {
    return taeterFaelle(
        [
            ["der Einlass fährt am Stempel", (z) => { z[PROBE_WF].jobs.einlass.if = "contains(github.event.head_commit.message, '[gpu-probe:')"; }, /\(V\) STEMPEL: der Einlass der GPU-Probe läuft unter/], // prettier-ignore
            ["der Einlass erbt selbst", (z) => { const e = z[PROBE_WF].jobs.einlass.steps.at(-1).env; e.EINLASS_JS += '\nconst K = require("./scripts/ci-kopf.cjs");'; }, /\(V\) STEMPEL: der Einlass der GPU-Probe erbt selbst/], // prettier-ignore
        ],
        einlassTeil,
        { gruen: workflowsLesen() }
    );
}

function selbsttestZug() {
    const [doc, sk] = [yaml.load(ausDatei(path.join(root, DATEI))), jsonLesen("package.json").scripts];
    const leer = () => ({ code: new Map(), text: "", kerne: new Set(), blind: [], welt: false, namen: new Set(), zeilen: [] });
    const z = [
        ["die echte check.yml", R6, /^$/],
        [
            "nachts ruht ein Selbsttest",
            { ...R6, r6Immer: (e) => e.GITHUB_EVENT_NAME !== "schedule" && R6.r6Immer(e) },
            /NIE: „node scripts\/diag-kreatur-takt.*\(schedule/,
        ],
        [
            "die Linse fehlt in ihrer Abhängigkeit",
            { ...R6, r6Urteil: (a, kx) => R6.r6Urteil(a, kx, leer) },
            /NIE: „node scripts\/diag-haus-welt.*Diff scripts\/diag-haus-welt/,
        ],
        // (anatomie-r4-heil) der Schlüssel vor dem Schnitt: der Kern, durch den die Linse baut, weckt ihren Selbsttest nicht
        [
            "der Kern einer Linse weckt ihren Selbsttest nicht",
            { ...R6, r6Urteil: (a, kx) => R6.r6Urteil(a, kx, (l) => ({ ...R6.r6Abhaengig(l), kerne: new Set() })) },
            /NIE: „node scripts\/diag-(mensch-anatomie|tier-anatomie|ofen-contract)[^„]*Diff (foundry|phyto|tetrapoda|koerper)-core\.js/,
        ],
        // (ruhe-gesetz) der Schlüssel vor dem Schnitt: ein Welt-Tor ruht, obwohl der Diff ein Laufzeit-Byte trägt
        [
            "ein Welt-Tor ruht bei einem Diff am Stamm",
            { ...R6, r6Urteil: (a, kx) => R6.r6Urteil(a, kx, (l) => ({ ...R6.r6Abhaengig(l), welt: false })) },
            /NIE: „node scripts\/diag-koerper-stand[^„]*Diff stamm\/bild-kosten\.js/,
        ],
        // … und der Faden über eine Liste, die der Schlüssel nicht lesen kann (kein Literal, keine Liste der Bibliothek, kein Kern)
        [
            "eine Linse baut über eine Liste, die der Schlüssel nicht liest",
            // (der Ruf ist zusammengesetzt: am Stück läse der Schlüssel DIESER Linse ihn als eigenen)
            { ...R6, r6Abhaengig: (l) => ({ ...R6.r6Abhaengig(l), ...(/diag-mensch-anatomie/.test(l) ? R6.r6Kerne("const sb = faden" + "Scope(quellen);") : {}) }) }, // prettier-ignore
            /\(Z\) KERN: „scripts\/diag-mensch-anatomie\.cjs" baut im Faden über „quellen"/,
        ],
    ].flatMap(([n, r6, soll]) => {
        const u = zugStelle(doc, sk, r6).join(" · ");
        console.log(`  ${soll.test(u) ? "✅" : "❌"} Selbsttest „${n}" → ${u.slice(0, 240) || "grün"}`);
        return soll.test(u) ? [] : [`(Z) „${n}" fällt nicht rot beim Namen`];
    });
    // DER SWIFTSHADER-SCHRITT IM ZUG (w27-swift-raus) an der echten check.yml: eine Wand der Karte kehrt in die volle Batterie
    // zurück — als Zwilling neben ihrer Karten-Stelle (K)+(D), allein (K), als Klasse je Gruppe (K); die Werkbank eingeschlossen
    const karte = (d, re) => d.jobs[ECHT_JOB].steps.find((s) => re.test(String(s.run)));
    const zurueck = (re, ganz) => (d) => {
        const s = karte(d, re);
        d.jobs[VOLL_JOB].steps.splice(-1, 0, { ...s, if: WEITER + "matrix.gruppe == 3" });
        if (ganz) d.jobs[ECHT_JOB].steps.splice(d.jobs[ECHT_JOB].steps.indexOf(s), 1);
    };
    const urteile = (d) => [...urteil(d), ...klassenUrteil(d, sk)];
    const s = [
        ["die echte check.yml (die Klassen und jede Wand an einer Stelle)", () => {}, /^$/],
        [
            "der Zwilling kehrt zurück (Ziel-Zensus in voll 3 UND auf der Karte)",
            zurueck(/gate:ziel-zensus$/),
            /^(?=.*\(K\) SWIFTSHADER: „Ziel-Zensus auf der Karte[^"]*" \(voll Gruppe 3\))(?=.*\(D\) DOPPELT: „npm run gate:ziel-zensus" läuft 2× \(voll\/3, echt\/omen\))/,
        ],
    ].flatMap(([n, tat, soll]) => {
        const d = yaml.load(ausDatei(path.join(root, DATEI)));
        tat(d);
        const u = urteile(d).join(" · ");
        console.log(`  ${soll.test(u) ? "✅" : "❌"} Selbsttest „${n}" → ${u.slice(0, 300) || "grün"}`);
        return soll.test(u) ? [] : [`(K)/(D) „${n}" fällt nicht rot beim Namen`];
    });
    return z.concat(s);
}

// (T) Die Waage gegen ein Fixture.
function selbsttestWaage() {
    const schritt = (name, g) => ({ name, if: `matrix.gruppe == ${g}`, run: `npm run gate:${name}` });
    const doc = () => ({
        jobs: {
            puls: { if: PULS_WENN, strategy: { matrix: { gruppe: [1] } }, steps: prep(schritt("Lint", 1)) },
            voll: {
                if: VOLL_WENN,
                strategy: { matrix: { gruppe: [1, 2] } },
                steps: prep(schritt("A", 1), schritt("B", 2), schritt("C", 1)),
            },
        },
    });
    const zeiten = () => ({
        kopf: "f".repeat(40),
        je_schritt: 7,
        vorbereitung_s: 20,
        schritte: { Lint: { s: 30 }, A: { s: 200 }, B: { s: 300 }, C: { s: 150 } },
    });
    const mitKopf = (d, z, s = 3) => {
        Object.assign(d.jobs.voll, { needs: KOPF_JOB, if: VOLL_NACH_KOPF });
        d.jobs.kopf = kopfJob();
        z.schritte.Kopf = { s };
    };
    const gruppen = (d, n) => (d.jobs.voll.strategy.matrix.gruppe = Array.from({ length: n }, (_, i) => i + 1));
    // die Karten: zwei Beine, W auf omen (s Sekunden), X auf radeon (300 s), je Läufer seine Vorbereitung
    const mitEcht = (d, z, s) => {
        const bein = (k) => `\${{ !cancelled() && matrix.karte == '${k}' }}`;
        d.jobs.echt = {
            if: ECHT_WENN,
            strategy: { "fail-fast": false, matrix: { karte: ["omen", "radeon"] } },
            steps: prep(
                { name: "W", if: bein("omen"), run: "npm run gate:w:echt" },
                { name: "X", if: bein("radeon"), run: "npm run gate:x" }
            ),
        };
        [z.echt, z.schritte.W, z.schritte.X] = [{ vorbereitung_s: { omen: 100, radeon: 60 } }, { s }, { s: 300 }];
    };
    // [Name, Tat an Lage und Zeiten, Soll (Regex · null: grün · Prüfung am Ergebnis), Alter der Quelle in Merges oder „wurf"]
    const B100 = (d, z) => (z.schritte.B.s = 100);
    const faelle = [
        ["die Waage im Lot (grün)", () => {}, null],
        // (T) WAAGE (CW2): die Voll-Gruppe gegen das Mittel ihrer Klasse plus Rand — ROT nur, was die Verteilung senkt
        // (T) FRIST: G18 trug die Kamera-Leib-Linse (p90 898 s) neben 287 s, der Deckel 20 min brach 7 Läufe ab
        [
            "ein Deckel, der den langsamen Läufer nicht hält",
            (d, z) =>
                Object.assign(d.jobs.voll, { "timeout-minutes": 20 }) &&
                Object.assign(z.schritte, { A: { s: 898 }, C: { s: 287 } }),
            /\(T\) FRIST: „voll 1\/2" trägt im langsamen Lauf 20,1 min, timeout-minutes 20 hält nicht 1,2 × davon/,
        ],
        // (T) FRIST am Puls (z795, 27.11.): die Statik trug 444 s Median allein, der Deckel 10 min brach den Kandidaten bei 585 s ab
        [
            "ein Puls-Deckel, der den langsamen Lauf nicht hält",
            (d, z) =>
                Object.assign(d.jobs.puls, { "timeout-minutes": 10 }) && Object.assign(z.schritte, { Lint: { s: 444 } }),
            /\(T\) FRIST: „puls 1\/1" trägt im Median 7,7 min, timeout-minutes 10 hält nicht 1,6 × davon/,
        ],
        [
            "derselbe Puls unter 15 min (grün, der Große beim Namen)",
            (d, z) =>
                Object.assign(d.jobs.puls, { "timeout-minutes": 15 }) && Object.assign(z.schritte, { Lint: { s: 444 } }),
            (w) => !w.v.length && w.gross.includes('„Lint" 7,4'),
        ],
        [
            "eine Voll-Gruppe über dem Mittel ihrer Klasse",
            B100,
            /\(T\) WAAGE: „voll 1\/2" trägt 6,2 min \(Deckel 4,6 min = Mittel der Klasse 4,1 \+ Rand 0,5\) — der größte Schritt „A" 3,3 min — die Verteilung senkt sie/,
        ],
        [
            "der Puls über 2 min",
            (d, z) =>
                d.jobs.puls.steps.push(schritt("Format", 1)) &&
                Object.assign(z.schritte, { Lint: { s: 90 }, Format: { s: 20 } }),
            /\(T\) WAAGE: „puls 1\/1" trägt 2,2 min \(Deckel 2,0 min je Push\) — der größte Schritt „Lint" 1,5 min — die Verteilung senkt sie/,
        ],
        ["ein Schritt ohne Zeit", (d, z) => delete z.schritte.B, /\(T\) UNGEMESSEN: „B" \(voll\)/],
        ["die Zeiten ohne Vorbereitung", (d, z) => delete z.vorbereitung_s, /\(T\) ZEITEN/],
        [
            "ein Schritt aus voll in den Puls gezogen (allein über dem Deckel, mit Mitfahrer)",
            (d) =>
                d.jobs.puls.steps.push(Object.assign(d.jobs.voll.steps.splice(5, 1)[0], { if: "matrix.gruppe == 1" })),
            /\(T\) ALLEIN: „B" trägt allein 5,3 min, über dem Deckel von „puls 1\/1" \(2,0 min\) — 1 Schritte fahren mit/,
        ],
        [
            "allein über dem Deckel und allein in der Gruppe (grün, beim Namen)",
            (d, z) =>
                Object.assign(d.jobs.voll, { "timeout-minutes": 20 }) &&
                Object.assign(z.schritte, { A: { s: 600 }, C: { s: 50 } }) &&
                (d.jobs.voll.steps[6].if = "matrix.gruppe == 2"),
            (w) => !w.v.length && w.gross.includes('„A" 10,0'),
        ],
        // (T) ALT (CW): die Quelle ist älter als ihre Läufe, oder ihr Kopf steht in keiner Geschichte
        [
            "die Quelle älter als ihre Läufe",
            () => {},
            /\(T\) ALT: seit dem Kopf der Zeit-Quelle \(ffffffff\) trugen 8 Merges/,
            8,
        ],
        [
            "dieselbe auf einem Arbeits-Zweig (benannt, nie ROT)",
            () => {},
            (w) => !w.v.length && /^\(T\) ALT: seit dem Kopf/.test(w.alt[0]),
            8,
            false,
        ],
        [
            "der Kopf der Quelle nicht aufzulösen",
            () => {},
            /\(T\) ALT: der Kopf der Zeit-Quelle „f+" ist in der Geschichte nicht/,
            "wurf",
        ],
        // (T) PLÄTZE: 1 Puls- und 20 Voll-Gruppen auf 20 Plätzen; der Kopf-Richter endet vor der Batterie
        [
            "mehr Jobs zugleich als Läufer-Plätze (K61-Befund: 22 gegen 20)",
            (d) => gruppen(d, 20),
            /\(T\) PLÄTZE: ein voller Lauf fährt 21 Jobs zugleich \(puls 1 · voll 20\) — das Konto hat 20 Läufer-Plätze: 1 warten/,
        ],
        [
            "der Kopf-Richter belegt keinen Platz neben der Batterie",
            (d, z) => mitKopf(d, z) || gruppen(d, 19),
            (w) => !w.v.some((x) => /PLÄTZE/.test(x)),
        ],
        [
            "der längste Weg über 8 min (benannt, nie ROT)",
            (d, z) => mitKopf(d, z, 120),
            (w) => !w.v.length && minuten(w.wanduhr[0]) === "8,5" && w.wanduhr[1] === "kopf → voll 1/2",
        ],
        // (E) der Plan der Echt-Gruppe
        ["die Karten im Plan (grün)", (d, z) => mitEcht(d, z, 900), null],
        [
            "ein Bein über dem Deckel",
            (d, z) => mitEcht(d, z, 1300),
            /\(T\) ECHT: „echt omen" trägt 23,3 min \(Deckel 20,0 min\)/,
        ],
        [
            "ein Karten-Schritt ohne Zeit",
            (d, z) => mitEcht(d, z, 900) || delete z.schritte.W,
            /\(T\) UNGEMESSEN: „W" \(echt omen\)/,
        ],
        [
            "die Karten fahren nie im vollen Lauf: ihr schwerstes Bein (19,0 min) ist nie die Wanduhr (LANDUNG ≤ 10 MIN)",
            (d, z) => mitKopf(d, z, 120) || mitEcht(d, z, 900),
            (w) => !w.v.length && w.wanduhr[1] === "kopf → voll 1/2" && minuten(w.wanduhr[0]) === "8,5",
        ],
    ];
    const f = [];
    for (const [n, tat, soll, alter = 0, sperrt = true] of faelle) {
        const d = doc(),
            z = zeiten();
        tat(d, z);
        const w = waage(
            d,
            z,
            () => {
                if (alter === "wurf") throw new Error("unbekannt");
                return alter;
            },
            sperrt
        );
        const u = w.v;
        const ok = typeof soll === "function" ? soll(w) : soll ? u.some((x) => soll.test(x)) : u.length === 0;
        console.log(`  ${ok ? "✅" : "❌"} Selbsttest „${n}" → ${u.join(" · ") || "grün"}`);
        if (!ok) f.push(`„${n}" fällt nicht rot beim Namen (${u.join(" · ") || "grün"})`);
    }
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
            on: {
                push: { branches: ["**"] },
                pull_request: { branches: ["main"] },
                workflow_dispatch: { inputs: { [ECHT_WAHL]: { type: "boolean", default: false } } },
            },
            jobs: {
                check: {
                    steps: [
                        CHECKOUT,
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
    // eine Wand der Karte: gate:e fährt NUR im Job echt (in seiner Form: nur auf Abruf)
    const mitKarte = (s, d) => {
        s["gate:e"] = "node scripts/e.cjs --echt";
        d["check.yml"].jobs.echt = {
            if: ECHT_WENN,
            strategy: { "fail-fast": false, matrix: { karte: ["omen"] } },
            "runs-on": [...ECHT_LAEUFER],
            "timeout-minutes": 30,
            env: { CI_KLASSE: "gpu", LINSE_GPU: "karte" },
            steps: [
                CHECKOUT,
                { name: "Dependencies", run: "npm ci --no-audit --no-fund" },
                { name: "E auf der Karte", if: "${{ !cancelled() && matrix.karte == 'omen' }}", run: "npm run gate:e", "timeout-minutes": 5 },
            ],
        };
        return d["check.yml"].jobs.echt;
    };
    const faelle = [
        ["(W) der gute Stand", () => {}],
        ["(W) eine Wand nur auf der Karte (Abruf): die Klasse Karte, kein Rot", (s, d) => mitKarte(s, d), null],
        [
            "die Wand der Karte, die Karten wieder im Zug: ihr Rot verfehlt die Form",
            (s, d) => (mitKarte(s, d).if = "github.event_name == 'push' && github.ref == 'refs/heads/integ-probe'"),
            /\(S\) STUMM: „gate:e" läuft nur abgeschaltet — „E auf der Karte" \(check\.yml\/echt\): der Job „echt" verfehlt seine Form \(E\)/,
        ],
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
        // (S) DER ABGESCHALTETE SCHRITT (`|| true`, continue-on-error) — die Klasse: jeder Weg, auf dem das Rot einer
        // Wand den Merge nicht hält
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
        // (F) DAS GEFALLENE SKRIPT: hinter -s und mitten in einer &&-Kette
        [
            "npm run -s mitten in einer &&-Kette",
            (s, d) => (C(d).run = "npm run -s gate:weg && npm run gate:c"),
            /\(F\) FEHLT: „C" \(check\.yml\/playtest\) ruft „npm run -s gate:weg"/,
        ],
        [
            "ein Skript ruft ein gefallenes Skript",
            (s) => (s["gate:c-beide"] = "npm run gate:c && npm run gate:weg"),
            /\(F\) FEHLT: das Skript „gate:c-beide" ruft „npm run gate:weg"/,
        ],
    ];
    const f = taeterFaelle(
        faelle.map(([n, tat, soll]) => [n, (z) => tat(...z), soll]),
        (z) => deckung(...z).v,
        { klon: () => [skripte(), docs(), aus()] }
    );
    // die Zahl: die Wand der Karte zählt in KARTE_KLASSE, nie „in der CI" (der Täter ist das alte Gesetz: die Karten hielten das Tor)
    const [s, d] = [skripte(), docs()];
    mitKarte(s, d);
    const z = deckung(s, d, aus()).zahl;
    const zok = z.jeKlasse[KARTE_KLASSE] === 1 && z.inCi === z.waende - z.ausnahmen;
    console.log(`  ${zok ? "✅" : "❌"} Selbsttest „die Wand der Karte steht in der Klasse Karte" → ${JSON.stringify(z.jeKlasse)}, in der CI ${z.inCi}`);
    return zok ? f : f.concat([`(W) die Wand der Karte zählt nicht in „${KARTE_KLASSE}": ${JSON.stringify(z.jeKlasse)}`]);
}

// (P) Der volle Playtest gegen ein Fixture: die gute check.yml trägt ihn allein in Gruppe 2 der vollen Batterie, mit
// pipefail, tee und dem Verdikt als letztem Befehl.
function selbsttestPlaytest() {
    const skripte = {
        playtest: "node scripts/playtest.cjs",
        "playtest:fast": "node scripts/playtest-fast.cjs",
        "gate:a": "node scripts/a.cjs",
    };
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
                    if: PULS_WENN,
                    strategy: { "fail-fast": false, matrix: { gruppe: [1] } },
                    "timeout-minutes": 10,
                    steps: prep({ name: "Schnell", if: "matrix.gruppe == 1", run: "npm run playtest:fast" }),
                },
                voll: {
                    if: VOLL_WENN,
                    strategy: { "fail-fast": false, matrix: { gruppe: [1, 2] } },
                    "timeout-minutes": 30,
                    steps: prep({ name: "A", if: "matrix.gruppe == 1", run: "npm run gate:a" }, traeger()),
                },
            },
        },
    });
    const nacht = () => ({
        on: { schedule: [{ cron: "30 3 * * *" }] },
        jobs: { nacht: { steps: prep({ name: "Nacht-Playtest", run: "npm run playtest" }) } },
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
    ];
    const f = [];
    taeterFaelle(faelle, (d) => playtestUrteil(d, skripte), { fehler: f, klon: docs });
    return f;
}

// (O) Der Korpus-Anteil gegen ein Fixture: Teil 1 und Teil 2 je ein Anteil, der Stufen-Lauf zählt nicht; die alte Art (beide
// Teile ohne Schalter, main 5b36f69a), derselbe Anteil zweimal, ein fehlender, ein leerer Schalter und verschiedene n — ROT.
function selbsttestKorpus() {
    const skripte = { "gate:persistence": "node scripts/diag-persistence.cjs --selftest" };
    const docs = () => ({
        jobs: {
            voll: {
                steps: prep(
                    { name: "Teil 1", if: gr(2), env: { PERSISTENCE_KORPUS: "1/2" }, run: "npm run gate:persistence" },
                    { name: "Teil 2", if: gr(3), env: { PERSISTENCE_KORPUS: "2/2" }, run: "node scripts/diag-persistence.cjs" },
                    { name: "Stufe", if: gr(4), run: "node scripts/diag-persistence.cjs --stufe" }
                ),
            },
        },
    });
    const T = (d, n) => d.jobs.voll.steps.find((s) => s.name === "Teil " + n);
    const faelle = [
        ["der gute Stand", () => {}, null],
        [
            "beide Teile ohne Anteil (main 5b36f69a: je Lauf 2 × 317 Stände)",
            (d) => [1, 2].forEach((n) => delete T(d, n).env.PERSISTENCE_KORPUS),
            /\(O\) Korpus-Anteil doppelt: 1\/1 in „Teil 1" · „Teil 2"/,
        ],
        [
            "zwei Schritte mit demselben Anteil",
            (d) => (T(d, 2).env.PERSISTENCE_KORPUS = "1/2"),
            [/\(O\) Korpus-Anteil doppelt: 1\/2 in „Teil 1" · „Teil 2"/, /\(O\) Korpus-Anteil fehlt: 2\/2/],
        ],
        [
            "ein fehlender Anteil",
            (d) => d.jobs.voll.steps.splice(d.jobs.voll.steps.indexOf(T(d, 2)), 1),
            /\(O\) Korpus-Anteil fehlt: 2\/2 fährt kein Schritt/,
        ],
        ["ein leerer Schalter", (d) => (T(d, 1).env.PERSISTENCE_KORPUS = ""), /\(O\) Korpus-Anteil unlesbar: „Teil 1"/],
        ["verschiedene n", (d) => (T(d, 2).env.PERSISTENCE_KORPUS = "2/3"), /\(O\) Korpus-Anteil doppelt: .*verschiedene n/],
    ];
    const f = [];
    taeterFaelle(faelle, (d) => korpusAnteilUrteil(d, skripte), { fehler: f, klon: docs });
    return f;
}

// ci-zeiten: liefert die API keinen Lauf, endet die Messung ROT (nie eine leere Tafel)
async function selbsttestZeiten() {
    const leer = async (p) => (p.includes("/runs?per_page") ? { total_count: 0, workflow_runs: [] } : { jobs: [] });
    const u = await messe(leer, { jobs: { puls: { steps: [{ name: "Lint", run: "npm run lint" }] } } }, {}, 0).then(
        () => "grün",
        (e) => e.message
    );
    const ok = u === "ROT: /actions/workflows/check.yml/runs Seite 1 trägt 0 Läufe von 0 nach 3 Versuchen";
    console.log(`  ${ok ? "✅" : "❌"} Selbsttest „ci-zeiten an einer leeren API" → ${u}`);
    // ein roter, nie gelandeter Lauf (z188: w6-weiches, die Kreatur-Linse 214 → 723 s) verändert die Tafel nicht
    const [T, G] = ["t".repeat(40), "a".repeat(40)];
    const jetzt = { jobs: { voll: { steps: [{ name: "A", run: "npm run gate:a" }] } } };
    const zeit = (s) => new Date(Date.UTC(2026, 10, 4) + s * 1000).toISOString();
    const job = (s, wie) => ({
        name: "voll 1/2 cpu",
        started_at: zeit(0),
        completed_at: zeit(s + 20),
        conclusion: wie,
        steps: [{ name: "A", started_at: zeit(10), completed_at: zeit(10 + s), conclusion: wie }],
    });
    const laeufe = [
        [1, T, 723, "failure"],
        [2, G, 214, "success"],
    ];
    const api = async (p) =>
        p.includes("/runs?per_page")
            ? {
                  total_count: 2,
                  workflow_runs: laeufe.map(([id, sha]) => ({
                      id,
                      head_sha: sha,
                      head_branch: "integ-probe",
                      status: "completed",
                      run_attempt: 1,
                      created_at: new Date().toISOString(),
                  })),
              }
            : p.startsWith("/contents/")
              ? { content: Buffer.from(yaml.dump(jetzt)).toString("base64") }
              : {
                    jobs: laeufe
                        .filter(([id]) => p === `/actions/runs/${id}/attempts/1/jobs?per_page=100`)
                        .map(([, , s, wie]) => job(s, wie)),
                };
    const t = await messe(api, jetzt, {}, 0, (sha) => sha === G).then(
        (x) => x.out,
        (e) => ({ schritte: {}, e })
    );
    const gut = t.kopf === G && t.schritte.A && t.schritte.A.s === 214;
    const w = `A ${t.schritte.A ? t.schritte.A.s : "—"} s, Kopf ${String(t.kopf).slice(0, 8)}`;
    console.log(`  ${gut ? "✅" : "❌"} Selbsttest „ein roter, nie gelandeter Lauf mit 723 s" → ${w}`);
    // ein neuer Schritt, den noch kein gelandeter Lauf fuhr, behält beim Neu-Messen die Zeit seines Zweigs (z633: der Zug heilte
    // (T) ALT, die zwei neuen Schritte des Heilers fielen aus der Tafel und der Kandidat fuhr an (T) UNGEMESSEN rot)
    const mitNeu = { jobs: { voll: { steps: [...jetzt.jobs.voll.steps, { name: "B", run: "npm run gate:b" }] } } };
    const n = await messe(api, mitNeu, { schritte: { B: { s: 13, n: 1 } } }, 0, (sha) => sha === G).then(
        (x) => x,
        (e) => ({ out: { schritte: {} }, ohne: [e.message] })
    );
    const B = n.out.schritte.B;
    const bleibt = !!B && B.s === 13 && B.geschaetzt === true && !n.ohne.length && n.out.schritte.A?.s === 214;
    const wb = B ? `B ${B.s} s${B.geschaetzt ? " geschaetzt" : ""}` : `B fehlt (ohne Messung: ${n.ohne.join(", ") || "—"})`;
    console.log(`  ${bleibt ? "✅" : "❌"} Selbsttest „ein neuer Schritt ohne gelandeten Lauf behält die Zeit seines Zweigs" → ${wb}`);
    // LANDUNG ≤ 10 MIN: der Zug fährt voll nie — die Nachwache auf main wiegt die volle Stufe; ein Arbeits-Zweig wiegt nie (der Täter
    // ist der alte Filter „nur integ-probe": er fände keinen Lauf, die Tafel bliebe ROT stehen)
    const zweigLauf = (id, zweig, s) => ({ id, zweig, s });
    const nw = [zweigLauf(5, "main", 300), zweigLauf(6, "w28-arbeit", 999)];
    const apiNw = async (p) =>
        p.includes("/runs?per_page")
            ? { total_count: nw.length, workflow_runs: nw.map((x) => ({ id: x.id, head_sha: G, head_branch: x.zweig, status: "completed", run_attempt: 1, created_at: new Date().toISOString() })) } // prettier-ignore
            : p.startsWith("/contents/")
              ? { content: Buffer.from(yaml.dump(jetzt)).toString("base64") }
              : { jobs: nw.filter((x) => p === `/actions/runs/${x.id}/attempts/1/jobs?per_page=100`).map((x) => job(x.s, "success")) };
    const tn = await messe(apiNw, jetzt, {}, 0, () => true).then(
        (x) => x.out,
        (e) => ({ schritte: {}, e: e.message })
    );
    const wache = tn.schritte.A?.s === 300 && tn.schritte.A?.n === 1;
    const ww = tn.schritte.A ? `A ${tn.schritte.A.s} s aus ${tn.schritte.A.n} Lauf` : `A fehlt (${tn.e || "—"})`;
    console.log(`  ${wache ? "✅" : "❌"} Selbsttest „die Nachwache auf main wiegt voll, ein Arbeits-Zweig nie" → ${ww}`);
    return (ok ? [] : [`ci-zeiten an einer leeren API: ${u}`]).concat(
        gut ? [] : [`der Täter-Lauf ${T.slice(0, 8)} vergiftet die Tafel: ${w}`],
        bleibt ? [] : [`das Neu-Messen wirft den Eintrag eines neuen Schritts aus der Tafel: ${wb}`],
        wache ? [] : [`die Nachwache auf main wiegt nicht (oder ein Arbeits-Zweig wiegt mit): ${ww}`]
    );
}
async function selbsttestLauf() {
    console.log("=== CI-DECKUNG — Selbsttest (ohne Datei) ===");
    selbsttestEnde(
        selbsttest().concat(selbsttestTor(), await selbsttestZeiten()),
        "jeder eingeschmuggelte Täter fällt rot und wird beim Namen genannt."
    );
    process.exit(0);
}

// ── (B) BRUCH AM LANDE-TOR (w28-tor-bruch, 13.11.; der Schöpfer: „als würde der ingenieur ein teil anpassen und der tüv die ganze
// zeit bämengelt, bevor die anpassung vollständig“) ── Am Lande-Tor (check.yml) sperrt nur BRUCH — die Vorgabe, sie steht nirgends
// als Zeile: ein Schritt, der aus dem Lande-Tor fällt, ist ROT in der Gegenrichtung (W). Die Tafel TOR_TAFEL trägt NUR die
// Ausnahmen: `probe` die Wände, deren ganzes Urteil ein Bild-Maß (AUSSEHEN) oder Wanduhr (ZEIT) ist — sie fahren nicht im Lande-Tor,
// ihr Richter ist `[gpu-probe: gate:…]` (ZEIT `zeit:gate:…`), (W) zählt sie als Ausnahme; `mass` je Datei die Zahl der Stellen
// `mass(ZEIT|AUSSEHEN, …)` (scripts/lib/urteil-zeile.cjs), die am Lande-Tor melden statt zu sperren. ROT beim Namen: (B3) eine
// probe-Wand im Lande-Tor oder ohne Skript; (B4) eine Maß-Stelle, die die Tafel nicht nennt, oder eine genannte, die fehlt; (B5)
// voll und echt ohne env TOR_KLASSE bruch (gpu-probe.yml setzt sie nicht: dort, beim Richter, sperrt das Maß).
const TOR_TAFEL = "spec/ci/tor-klassen.json";
function massStellen(dateien, lies = (d) => ausDatei(path.join(root, d))) {
    const z = {};
    for (const d of dateien) {
        const n = (lies(d).match(/\bmass\("(?:ZEIT|AUSSEHEN)"/g) || []).length;
        if (n) z[d] = n;
    }
    return z;
}
function torUrteil(doc, tafel, skripte, stellen) {
    const v = [];
    const ist = new Set(gateSchritte(doc).map((s) => s.run));
    for (const sk of Object.keys(tafel.probe)) {
        if (typeof skripte[sk] !== "string") v.push(`(B3) NICHT RUFBAR: „${sk}"`);
        if (ist.has(`npm run ${sk}`)) v.push(`(B3) SPERRT AM LANDE-TOR: „${sk}"`);
    }
    for (const d of new Set([...Object.keys(stellen), ...Object.keys(tafel.mass)]))
        if (stellen[d] !== tafel.mass[d])
            v.push(`(B4) MASS-STELLEN: ${d} trägt ${stellen[d] || 0}, die Tafel ${tafel.mass[d] || 0}`);
    for (const j of [VOLL_JOB, ECHT_JOB])
        if (jobsVon(doc)[j]?.env?.TOR_KLASSE !== "bruch") v.push(`(B5) TOR_KLASSE: „${j}"`);
    return v;
}
const torAusnahmen = (tafel) =>
    Object.fromEntries(Object.entries(tafel.probe).map(([sk, k]) => [sk, { klasse: KLASSEN[k], grund: `${k}: das ganze Urteil ist ein Maß, Richter [gpu-probe: ${sk}]` }])); // prettier-ignore
function selbsttestTor() {
    const fehler = [];
    for (const [name, tat, muss] of [
        ["grün", () => {}, null],
        [
            "probe im Lande-Tor",
            (d) => d.jobs.voll.steps.push({ name: "B", if: gr(1), run: "npm run gate:b" }),
            /\(B3\) SPERRT/,
        ],
        ["probe ohne Skript", (d, t) => (t.probe = { "gate:weg": "AUSSEHEN" }), /\(B3\) NICHT RUFBAR/],
        ["Maß-Stelle ohne Tafel", (d, t, s) => (s.n = 1), /\(B4\) MASS-STELLEN: n/],
        ["voll ohne TOR_KLASSE", (d) => delete d.jobs.voll.env, /\(B5\)/],
    ]) {
        const [d, t, s] = [{ jobs: { voll: { env: { TOR_KLASSE: "bruch" }, steps: [] }, echt: { env: { TOR_KLASSE: "bruch" } } } }, { probe: { "gate:b": "AUSSEHEN" }, mass: { m: 1 } }, { m: 1 }]; // prettier-ignore
        tat(d, t, s);
        const v = torUrteil(d, t, { "gate:b": "x" }, s);
        const ok = muss ? v.some((x) => muss.test(x)) : !v.length;
        if (!ok) fehler.push(`(B) ${name}: ${v.join(" · ") || "(nichts)"}`);
        console.log(`  ${ok ? "✅" : "❌"} Selbsttest (B) „${name}": ${v.join(" · ") || "(nichts)"}`);
    }
    return fehler;
}

function hauptlauf() {
    const doc = yaml.load(ausDatei(path.join(root, DATEI)));
    const skripte = jsonLesen("package.json").scripts || {};
    const v = urteil(doc);
    v.push(...klassenUrteil(doc, skripte), ...zugStelle(doc, skripte));
    const alleWorkflows = workflowsLesen();
    const tafel = jsonLesen(TOR_TAFEL);
    const cjs = fs.readdirSync(path.join(root, "scripts")).filter((f) => f.endsWith(".cjs"));
    v.push(...torUrteil(doc, tafel, skripte, massStellen(cjs.map((f) => "scripts/" + f))));
    const g = deckung(skripte, alleWorkflows, { ...AUSNAHMEN, ...torAusnahmen(tafel) });
    v.push(...g.v);
    v.push(...schluesselUrteil(alleWorkflows));
    v.push(...einlassTeil(alleWorkflows));
    v.push(...playtestUrteil(alleWorkflows, skripte));
    v.push(...korpusAnteilUrteil(doc, skripte));
    const zeitenDatei = path.join(root, ZEITEN);
    const w = fs.existsSync(zeitenDatei)
        ? waage(doc, jsonLesen(zeitenDatei))
        : { v: [`(T) ZEITEN: ${ZEITEN} fehlt — die Waage hat keine Zeiten`], zeilen: [] };
    v.push(...w.v);
    const jeKlasse = g.zahl.jeKlasse;
    console.log("=== CI-DECKUNG — " + DATEI + " ===");
    console.log(`  Gate-Schritte: ${gateSchritte(doc).length} (alle Jobs)`);
    console.log(
        `  Wände: ${g.zahl.waende} (gate:* und Teile von npm run check) · in der CI ${g.zahl.inCi} · Ausnahmen ${g.zahl.ausnahmen}` +
            (Object.keys(jeKlasse).length
                ? ` (${Object.entries(jeKlasse)
                      .map(([k, n]) => `${k} ${n}`)
                      .join(" · ")})`
                : "") +
            ` · ohne Workflow ${g.zahl.offen}`
    );
    if (w.alt?.length)
        console.log(`  ⚠ ${w.alt.join(" · ")} (Arbeits-Zweig: benannt, sperrt auf integ-probe und main)`);
    console.log(
        `  Waage (Plan = Gewicht samt Vorbereitung — Puls Median, voll p90 —, min, Schritte; Deckel ${(w.deckel || []).join(" · ")}): ${w.zeilen.join(" · ")}`
    );
    if (w.gross?.length)
        console.log(
            `  über ${GROSS_S / 60} min oder allein über dem Deckel (je eine eigene Karte, nie die Waage): ${w.gross.join(" · ")}`
        );
    if (w.wanduhr)
        console.log(
            `  Plätze: ${w.plaetze} Jobs zugleich (Konto ${LAEUFER_PLAETZE}) · Wanduhr (längster Weg, benannt, sperrt nie): ${minuten(w.wanduhr[0])} min — ${w.wanduhr[1]}`
        );
    wandEnde(
        v,
        `(G) (V) (D) (W) (A) (R) (F) (S) (K) (E) (T) (P) (O) (Z) (B) halten: jeder Gate-Schritt läuft genau einmal, hält den Merge, liegt im Plan unter seinem Deckel und trägt seine Tor-Klasse`
    );
}
if (SELBSTTEST) selbsttestLauf();
else hauptlauf();
