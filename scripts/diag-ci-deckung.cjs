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
//   node scripts/diag-ci-deckung.cjs [--selftest] [--gegen <git-ref>]     (npm run gate:ci-deckung; in npm run check)
"use strict";
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const yaml = require("js-yaml");

const root = path.resolve(__dirname, "..");
const DATEI = ".github/workflows/check.yml";
const GRUPPEN_JOB = "playtest";
const DECKEL_MIN = 45;
const VORBEREITUNG = [
    ["checkout", (s) => typeof s.uses === "string" && s.uses.startsWith("actions/checkout@")],
    ["setup-node", (s) => typeof s.uses === "string" && s.uses.startsWith("actions/setup-node@")],
    ["System-Libs", (s) => /apt-get install/.test(String(s.run || ""))],
    ["npm ci", (s) => /\bnpm ci\b/.test(String(s.run || ""))],
];
const IST_VORBEREITUNG = (s) => VORBEREITUNG.some(([, f]) => f(s));
const GRUPPE_RE = /^\s*matrix\.gruppe\s*==\s*(\d+)\s*$/;

const lauf = (s) => String(s.run || "").trim();
const name = (s) => String(s.name || s.uses || lauf(s).split("\n")[0]).replace(/\s+/g, " ");

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
    const J = doc && doc.jobs && doc.jobs[GRUPPEN_JOB];
    if (!J) return [`LEER: kein Job „${GRUPPEN_JOB}" in ${DATEI}`];
    const M = J.strategy && J.strategy.matrix && J.strategy.matrix.gruppe;
    if (!Array.isArray(M) || !M.length || !M.every((g) => Number.isInteger(g) && g > 0) || new Set(M).size !== M.length)
        v.push(
            `(V) MATRIX: strategy.matrix.gruppe ist keine Liste verschiedener Gruppen-Nummern (${JSON.stringify(M)})`
        );
    if (!J.strategy || J.strategy["fail-fast"] !== false)
        v.push("(V) FAIL-FAST: strategy.fail-fast ist nicht false — eine rote Gruppe bräche die anderen ab");
    if (!(Number(J["timeout-minutes"]) > 0 && Number(J["timeout-minutes"]) <= DECKEL_MIN))
        v.push(`(V) DECKEL: timeout-minutes ${J["timeout-minutes"]} (Soll 1–${DECKEL_MIN} je Gruppe)`);
    const steps = J.steps || [];
    VORBEREITUNG.forEach(([n, f], i) => {
        const s = steps[i];
        if (!s || !f(s)) v.push(`(V) VORBEREITUNG: Schritt ${i + 1} ist nicht „${n}" (${s ? name(s) : "fehlt"})`);
        else if (s.if) v.push(`(V) VORBEREITUNG: „${n}" trägt eine Bedingung (${s.if}) — jede Gruppe braucht sie`);
    });
    const gruppen = new Set(Array.isArray(M) ? M : []);
    const je = new Map([...gruppen].map((g) => [g, 0]));
    for (const s of steps.slice(VORBEREITUNG.length)) {
        if (IST_VORBEREITUNG(s)) continue;
        const m = typeof s.if === "string" ? GRUPPE_RE.exec(s.if) : null;
        if (!s.if)
            v.push(`(G) N-FACH: „${name(s)}" trägt keine Gruppe — er liefe in jeder der ${gruppen.size} Gruppen`);
        else if (!m) v.push(`(G) UNKLAR: „${name(s)}" trägt die Bedingung „${s.if}" statt genau einer Gruppe`);
        else if (!gruppen.has(Number(m[1])))
            v.push(
                `(G) VERLOREN: „${name(s)}" trägt Gruppe ${m[1]}, die Matrix kennt ${[...gruppen].join(", ")} — er liefe nie`
            );
        else je.set(Number(m[1]), je.get(Number(m[1])) + 1);
    }
    for (const [g, n] of je) if (n === 0) v.push(`(G) LEER: Gruppe ${g} trägt keinen Schritt (ein Läufer ohne Arbeit)`);
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

// (Z) die Gate-Schritte zweier Stände: was fehlt nachher, was steht nachher öfter als vorher
function vergleich(vorher, nachher) {
    const zahl = (doc) => {
        const m = new Map();
        for (const s of gateSchritte(doc)) m.set(s.run, (m.get(s.run) || 0) + 1);
        return m;
    };
    const a = zahl(vorher),
        b = zahl(nachher);
    const verloren = [...a].filter(([r, n]) => (b.get(r) || 0) < n).map(([r]) => r);
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
    const je = new Map();
    for (const s of gateSchritte(doc)) if (s.job === GRUPPEN_JOB) je.set(s.gruppe, (je.get(s.gruppe) || 0) + 1);
    return [...je]
        .sort((x, y) => x[0] - y[0])
        .map(([g, n]) => `Gruppe ${g}: ${n}`)
        .join(" · ");
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
            check: { steps: [{ uses: "actions/checkout@v4" }, { name: "Lint", run: "npm run lint" }] },
            playtest: {
                strategy: { "fail-fast": false, matrix: { gruppe: [1, 2] } },
                "timeout-minutes": 45,
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
    const P = (d) => d.jobs.playtest;
    const faelle = [
        ["ohne Gruppe (er liefe N-fach)", (d) => delete P(d).steps[5].if, /\(G\) N-FACH: „B"/],
        [
            "Gruppe außerhalb der Matrix (er liefe nie)",
            (d) => (P(d).steps[5].if = "matrix.gruppe == 3"),
            /\(G\) VERLOREN: „B" trägt Gruppe 3/,
        ],
        [
            "zwei Gruppen in einer Bedingung",
            (d) => (P(d).steps[5].if = "matrix.gruppe == 1 || matrix.gruppe == 2"),
            /\(G\) UNKLAR: „B"/,
        ],
        ["eine Gruppe ohne Schritt", (d) => (P(d).steps[5].if = "matrix.gruppe == 1"), /\(G\) LEER: Gruppe 2/],
        [
            "derselbe Schritt in zwei Gruppen",
            (d) => P(d).steps.push({ name: "A2", if: "matrix.gruppe == 2", run: "npm run gate:a" }),
            /\(D\) DOPPELT: „npm run gate:a" läuft 2×/,
        ],
        [
            "ein Gate im Job check und in einer Gruppe",
            (d) => d.jobs.check.steps.push({ name: "C", run: "npm run gate:c" }),
            /\(D\) DOPPELT: „npm run gate:c" läuft 2×/,
        ],
        ["fail-fast an", (d) => delete P(d).strategy["fail-fast"], /\(V\) FAIL-FAST/],
        ["Deckel über 45", (d) => (P(d)["timeout-minutes"] = 60), /\(V\) DECKEL: timeout-minutes 60/],
        ["npm ci fehlt", (d) => P(d).steps.splice(3, 1), /\(V\) VORBEREITUNG: Schritt 4 ist nicht „npm ci"/],
        [
            "Vorbereitung nur in Gruppe 1",
            (d) => (P(d).steps[2].if = "matrix.gruppe == 1"),
            /\(V\) VORBEREITUNG: „System-Libs" trägt eine Bedingung/,
        ],
        ["keine Matrix", (d) => delete P(d).strategy.matrix, /\(V\) MATRIX/],
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
    P(weg).steps.splice(6, 1);
    const z1 = vergleich(vorher, weg);
    const ok1 = z1.verloren.length === 1 && z1.verloren[0] === "npm run gate:c";
    console.log(
        `  ${ok1 ? "✅" : "❌"} Selbsttest „bei der Teilung verloren" → verloren ${JSON.stringify(z1.verloren)}`
    );
    if (!ok1) f.push("(Z) ein bei der Teilung verlorener Schritt steht nicht beim Namen");
    const zwei = gut();
    P(zwei).steps.push({ name: "C2", if: "matrix.gruppe == 2", run: "npm run gate:c" });
    const z2 = vergleich(vorher, zwei);
    const ok2 = z2.doppelt.length === 1 && z2.doppelt[0] === "npm run gate:c";
    console.log(`  ${ok2 ? "✅" : "❌"} Selbsttest „bei der Teilung doppelt" → doppelt ${JSON.stringify(z2.doppelt)}`);
    if (!ok2) f.push("(Z) ein bei der Teilung verdoppelter Schritt steht nicht beim Namen");
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
const v = urteil(doc);
const i = process.argv.indexOf("--gegen");
let z = null;
if (i > 0) {
    const ref = process.argv[i + 1];
    const alt = yaml.load(execSync(`git show ${ref}:${DATEI}`, { cwd: root, maxBuffer: 1 << 26 }).toString());
    z = vergleich(alt, doc);
    for (const r of z.verloren) v.push(`(Z) VERLOREN gegen ${ref}: „${r.split("\n")[0]}"`);
    for (const r of z.doppelt) v.push(`(Z) DOPPELT gegen ${ref}: „${r.split("\n")[0]}"`);
}
console.log("=== CI-DECKUNG — " + DATEI + " ===");
console.log(`  Gate-Schritte: ${gateSchritte(doc).length} (alle Jobs) · ${gruppenBericht(doc)}`);
if (z)
    console.log(
        `  gegen ${process.argv[i + 1]}: vorher ${z.vorher}, nachher ${z.nachher}, verloren ${z.verloren.length}, doppelt ${z.doppelt.length}, neu ${z.neu.length}`
    );
if (v.length) {
    console.error("\n❌ ROT:\n  " + v.join("\n  "));
    process.exit(1);
}
console.log("✅ GRÜN — jeder Gate-Schritt läuft genau einmal, jede Gruppe trägt die Vorbereitung und ihre Schritte.");
