#!/usr/bin/env node
// ci-echt.cjs — DIE ECHT-GRUPPE (K65, 15.10.): die Schritte der GPU-Klasse der vollen Batterie auf dem EIGENEN Läufer mit
// der echten Karte (check.yml Job `echt`, `runs-on: [self-hosted, omen-gpu]`). Befund K61: 89 Schritte in 10 GPU-Gruppen
// fahren in der Cloud swiftshader (Pipeline-Bau 42–292 s je Programm, Lehre 26) — und swiftshader verbirgt, was eine echte
// GPU anders zeichnet (Lehre 17: der Fern-Ring 3,5 m auf 8 km nur auf der Radeon). Der Job `echt` fährt dieselben Schritte
// ZUSÄTZLICH auf der GTX, nie statt der Cloud-Gruppen.
//
// Die Schritte stehen GENAU einmal in check.yml (gate:ci-deckung (G)/(D)): diese Datei liest sie von dort — der Job `voll`,
// je Schritt seine Gruppe (`if: matrix.gruppe == N`), je Gruppe die Klasse (`strategy.matrix.include` { gruppe, klasse });
// gefahren wird jeder Schritt einer `gpu`-Gruppe, in Gruppen-Ordnung, mit der Bash wie in der CI (`bash --noprofile --norc
// -eo pipefail -c`, die npm-Skripte ebenfalls in der Bash: `npm_config_script_shell`), mit der Klasse `gpu` (CI_KLASSE: die
// Weiche erlaubt das Echt-Rezept) und der Weiche `LINSE_GPU=karte` (scripts/lib/software-gpu.cjs: jede Linse ohne Zeit-Urteil
// auf der Karte, jede Zeit-Linse auf swiftshader wie die CI — W5). Ein Schritt mit eigener Shell außer bash oder mit einem
// Ausdruck `${{ … }}` in seinem env ist hier nicht zu fahren: ROT beim Namen, nie still übersprungen.
// Je Schritt: Sekunden, Exit, der gelieferte Adapter (die `[linse-gpu]`-Zeilen seines Logs) — die Tafel am Ende und
// `<protokoll>/echt.json`; Exit 1, wenn ein Schritt rot ist (alle Schritte laufen, jeder meldet).
//
// ZWEI STUFEN (K65, Entscheid des Koordinators 15.10.): alle 89 Schritte brauchen seriell auf der GTX ~80–90 min — ein
// serieller Läufer trüge das je Push nicht. Das Ereignis wählt (GITHUB_EVENT_NAME):
//   push      DIE AUSWAHL NACH WERT (spec/ci/echt-auswahl.json): die Schritte, die auf der echten Karte anders urteilen
//             können — Präzision fern · Schatten · Stufen-Wechsel · Bild-Urteil aus dem Ausgabe-Pfad —, je Schritt seine
//             Wert-Klasse und seine GTX-Zeit, die Summe samt Vorbereitung ≤ budget_s (15 min); ein Name der Auswahl, der
//             nicht in der GPU-Klasse steht, ist ROT (stale).
//   schedule  DIE NACHT: alle Schritte der GPU-Klasse auf main — aber nur, wenn dieser Kopf noch keinen grünen Nachtlauf
//             der Echt-Gruppe trägt (die API, GH_TOKEN; `nachtUrteil`): ein Kopf wird einmal ganz gerichtet.
//   sonst     (lokal) alle Schritte, `--auswahl` die Auswahl.
//
//   node scripts/ci-echt.cjs [--auswahl] [--liste] [--gruppe N] [--nur <regex>] [--ab N] [--protokoll <dir>] [--selbsttest]
"use strict";
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const yaml = require("js-yaml");

const ROOT = path.resolve(__dirname, "..");
const DATEI = ".github/workflows/check.yml";
const AUSWAHL = "spec/ci/echt-auswahl.json";
const GRUPPE_RE = /^\s*matrix\.gruppe\s*==\s*(\d+)\s*$/;
const ECHT_JOB = /^echt\b/;

// die Auswahl nach Wert gegen die GPU-Klasse: { namen: Set, befunde: [..], summe_s } (gate:ci-deckung (E) liest dieselbe)
function auswahlUrteil(auswahl, schritte) {
    const befunde = [];
    const A = auswahl || {};
    const S = A.schritte || {};
    const klassen = new Set(A.klassen || []);
    const gpu = new Set(schritte.map((s) => s.name));
    let summe = Number(A.vorbereitung_s) || 0;
    if (!(Number(A.budget_s) > 0)) befunde.push(`${AUSWAHL}: kein budget_s`);
    if (!(Number(A.vorbereitung_s) >= 0)) befunde.push(`${AUSWAHL}: keine vorbereitung_s`);
    for (const [n, e] of Object.entries(S)) {
        if (!gpu.has(n)) befunde.push(`STALE: „${n}" steht in der Auswahl, aber in keiner GPU-Gruppe von voll`);
        if (!klassen.has(e && e.klasse)) befunde.push(`„${n}": Wert-Klasse „${e && e.klasse}" nicht in ${[...klassen].join(" · ")}`);
        if (!(Number(e && e.s) > 0)) befunde.push(`„${n}": keine GTX-Zeit (s)`);
        else summe += Number(e.s);
    }
    if (!Object.keys(S).length) befunde.push(`${AUSWAHL}: die Auswahl ist leer`);
    if (Number(A.budget_s) > 0 && summe > Number(A.budget_s))
        befunde.push(`BUDGET: die Auswahl trägt ${Math.round(summe)} s samt Vorbereitung (Deckel ${A.budget_s} s)`);
    return { namen: new Set(Object.keys(S)), befunde, summe_s: Math.round(summe) };
}

// DIE NACHT: trägt dieser Kopf schon einen grünen Nachtlauf der Echt-Gruppe? laeufe: die Läufe des Workflows auf dem Kopf
// (API) · jobsJe: Lauf-Id → seine Jobs → { ganz: true|false, grund }
function nachtUrteil({ eigenerLauf, laeufe, jobsJe }) {
    for (const r of laeufe || []) {
        if (String(r.id) === String(eigenerLauf) || r.event !== "schedule") continue;
        const e = (jobsJe[r.id] || []).find((j) => ECHT_JOB.test(j.name));
        if (e && e.conclusion === "success")
            return { ganz: false, grund: `der Kopf trägt die Echt-Gruppe ganz grün: Nachtlauf ${r.id} (${r.created_at || "?"})` };
    }
    return { ganz: true, grund: "kein Nachtlauf hat diesen Kopf ganz gerichtet" };
}

// die GPU-Schritte des Jobs `voll`: [{ gruppe, name, run, env, fehler }]
function echtSchritte(doc) {
    const voll = doc && doc.jobs && doc.jobs.voll;
    if (!voll) throw new Error(`${DATEI}: kein Job voll`);
    const klasse = new Map();
    for (const e of (voll.strategy && voll.strategy.matrix && voll.strategy.matrix.include) || [])
        klasse.set(e.gruppe, e.klasse);
    const out = [];
    for (const s of voll.steps || []) {
        const m = GRUPPE_RE.exec(String(s.if || ""));
        if (!m || klasse.get(+m[1]) !== "gpu") continue;
        const name = s.name || s.uses || String(s.run || "").split("\n")[0];
        let fehler = null;
        if (s.uses) fehler = `uses ${s.uses} (eine Aktion, kein run)`;
        else if (s.shell && s.shell !== "bash") fehler = `shell ${s.shell} (der Echt-Läufer fährt bash)`;
        else if (Object.values(s.env || {}).some((v) => /\$\{\{/.test(String(v))))
            fehler = "env mit ${{ … }} (hier nicht aufzulösen)";
        out.push({ gruppe: +m[1], name, run: s.run || "", env: s.env || {}, fehler });
    }
    // Gruppen-Ordnung, in der Gruppe die Ordnung der Datei
    return out
        .map((s, i) => ({ s, i }))
        .sort((a, b) => a.s.gruppe - b.s.gruppe || a.i - b.i)
        .map((x) => x.s);
}

// die Bash wie in der CI: unter Windows die Git-Bash (ECHT_BASH überschreibt), sonst `bash`
function bashPfad(env = process.env, plattform = process.platform) {
    if (env.ECHT_BASH) return env.ECHT_BASH;
    if (plattform !== "win32") return "bash";
    for (const p of ["C:\\Program Files\\Git\\bin\\bash.exe", "C:\\Program Files (x86)\\Git\\bin\\bash.exe"])
        if (fs.existsSync(p)) return p;
    throw new Error("keine Git-Bash gefunden (ECHT_BASH setzen)");
}

function fahre(schritt, { bash, env, log }) {
    return new Promise((res) => {
        const t0 = Date.now();
        const aus = fs.createWriteStream(log);
        const kind = spawn(bash, ["--noprofile", "--norc", "-eo", "pipefail", "-c", schritt.run], {
            cwd: ROOT,
            env: Object.assign({}, env, schritt.env),
            windowsHide: true,
        });
        const adapter = new Set();
        const lies = (d) => {
            aus.write(d);
            for (const z of String(d).split("\n")) {
                const m = /\[linse-gpu\]\s*(.+)$/.exec(z);
                if (m) adapter.add(m[1].trim());
            }
        };
        kind.stdout.on("data", lies);
        kind.stderr.on("data", lies);
        kind.on("close", (code) => {
            aus.end();
            res({
                exit: code == null ? 1 : code,
                sek: Math.round((Date.now() - t0) / 100) / 10,
                adapter: [...adapter],
            });
        });
    });
}

// die Läufe dieses Workflows auf dem Kopf samt ihren Jobs (die API wie scripts/ci-kopf.cjs) — nur für die Nacht
async function nachtLaeufe(env) {
    const API = `${env.GITHUB_API_URL || "https://api.github.com"}/repos/${env.GITHUB_REPOSITORY}`;
    const api = async (p) => {
        const r = await fetch(API + p, {
            headers: { Authorization: `Bearer ${env.GH_TOKEN}`, Accept: "application/vnd.github+json" },
        });
        if (!r.ok) throw new Error(`${p}: ${r.status} ${await r.text()}`);
        return r.json();
    };
    const wf = String(env.GITHUB_WORKFLOW_REF || "")
        .replace(/^[^/]+\/[^/]+\/\.github\/workflows\//, "")
        .replace(/@.*$/, "");
    const laeufe = (await api(`/actions/workflows/${wf || "check.yml"}/runs?head_sha=${env.GITHUB_SHA}&event=schedule&per_page=100`))
        .workflow_runs;
    const jobsJe = {};
    for (const r of laeufe)
        if (String(r.id) !== String(env.GITHUB_RUN_ID))
            jobsJe[r.id] = (await api(`/actions/runs/${r.id}/jobs?filter=latest&per_page=100`)).jobs;
    return { laeufe, jobsJe };
}

async function lauf(opt) {
    const doc = yaml.load(fs.readFileSync(path.join(ROOT, DATEI), "utf8"));
    let liste = echtSchritte(doc);
    const ereignis = process.env.GITHUB_EVENT_NAME || "";
    const stufe = opt.auswahl || ereignis === "push" ? "auswahl" : ereignis === "schedule" ? "nacht" : "alle";
    if (stufe === "auswahl") {
        const a = auswahlUrteil(JSON.parse(fs.readFileSync(path.join(ROOT, AUSWAHL), "utf8")), liste);
        if (a.befunde.length) {
            console.log(`❌ ROT — die Auswahl nach Wert trägt nicht: ${a.befunde.join(" · ")}`);
            return 1;
        }
        console.log(`STUFE push: die Auswahl nach Wert (${a.namen.size} von ${liste.length} Schritten, ${a.summe_s} s geplant samt Vorbereitung) — der Rest fährt nachts`);
        liste = liste.filter((s) => a.namen.has(s.name));
    } else if (stufe === "nacht") {
        const { laeufe, jobsJe } = await nachtLaeufe(process.env);
        const u = nachtUrteil({ eigenerLauf: process.env.GITHUB_RUN_ID, laeufe, jobsJe });
        console.log(`STUFE schedule: ${u.ganz ? "alle " + liste.length + " Schritte" : "nichts zu tun"} — ${u.grund}`);
        if (!u.ganz) {
            console.log(`::notice title=Echt-Gruppe::${u.grund}`);
            return 0;
        }
    }
    if (opt.gruppe) liste = liste.filter((s) => s.gruppe === opt.gruppe);
    if (opt.ab > 1) liste = liste.slice(opt.ab - 1); // ein angehaltener Lauf setzt fort (1-basiert in der Liste)
    if (opt.nur) liste = liste.filter((s) => new RegExp(opt.nur).test(s.name + " " + s.run));
    if (opt.liste) {
        for (const s of liste) console.log(`G${s.gruppe}  ${s.fehler ? "ROT " + s.fehler + " — " : ""}${s.name}`);
        console.log(`${liste.length} Schritte der GPU-Klasse`);
        return 0;
    }
    const bash = bashPfad();
    const prot = path.resolve(opt.protokoll || path.join(ROOT, "ci-echt-protokoll"));
    fs.mkdirSync(prot, { recursive: true });
    const env = Object.assign({}, process.env, {
        CI_KLASSE: "gpu",
        LINSE_GPU: process.env.LINSE_GPU || "karte",
        npm_config_script_shell: bash,
    });
    const t0 = Date.now();
    const ergebnis = [];
    let nr = 0;
    for (const s of liste) {
        nr++;
        const kopf = `[${nr}/${liste.length}] G${s.gruppe} ${s.name}`;
        if (s.fehler) {
            console.log(`❌ ${kopf} — ${s.fehler}`);
            ergebnis.push({ gruppe: s.gruppe, name: s.name, exit: 1, sek: 0, adapter: [], fehler: s.fehler });
            continue;
        }
        const log = path.join(prot, `${String(nr).padStart(2, "0")}-g${s.gruppe}.log`);
        const e = await fahre(s, { bash, env, log });
        console.log(
            `${e.exit === 0 ? "✅" : "❌"} ${kopf} — ${e.sek} s${e.adapter.length ? " · " + e.adapter.join(", ") : ""}${e.exit === 0 ? "" : ` · EXIT=${e.exit} (${path.basename(log)})`}`
        );
        ergebnis.push(Object.assign({ gruppe: s.gruppe, name: s.name, log: path.basename(log) }, e));
    }
    const sek = Math.round((Date.now() - t0) / 1000);
    const rot = ergebnis.filter((e) => e.exit !== 0);
    const jeGruppe = {};
    for (const e of ergebnis) jeGruppe[e.gruppe] = Math.round(((jeGruppe[e.gruppe] || 0) + e.sek) * 10) / 10;
    fs.writeFileSync(
        path.join(prot, "echt.json"),
        JSON.stringify({ sek, rot: rot.length, jeGruppe, schritte: ergebnis }, null, 1)
    );
    console.log(
        `\nECHT-GRUPPE: ${ergebnis.length} Schritte in ${Math.floor(sek / 60)} min ${sek % 60} s — je Gruppe ${Object.entries(
            jeGruppe
        )
            .map(([g, s]) => `G${g} ${Math.round(s)} s`)
            .join(" · ")}`
    );
    console.log(
        rot.length
            ? `❌ ROT — ${rot.length} Schritte: ${rot.map((e) => `G${e.gruppe} ${e.name}`).join(" · ")}`
            : "✅ GRÜN — jede GPU-Wand hält auf der echten Karte"
    );
    return rot.length ? 1 : 0;
}

// SELBSTTEST: ein Fixture-Workflow — gefahren werden nur die Schritte der gpu-Gruppen (die Vorbereitung und die cpu-Gruppe
// nie), in Gruppen-Ordnung; ein Schritt mit fremder Shell, mit einer Aktion oder mit `${{ … }}` im env ist ROT beim Namen;
// das Exit eines Schritts trägt bis zum Urteil (ein roter Schritt macht den Lauf rot, die übrigen laufen weiter).
async function selbsttest() {
    const fix = yaml.load(`
jobs:
  voll:
    strategy:
      matrix:
        gruppe: [1, 2, 3]
        include:
          - { gruppe: 1, klasse: cpu }
          - { gruppe: 2, klasse: gpu }
          - { gruppe: 3, klasse: gpu }
    steps:
      - uses: actions/checkout@v4
      - name: npm ci
        run: npm ci
      - name: cpu-wand
        if: matrix.gruppe == 1
        run: echo cpu
      - name: gpu-b
        if: matrix.gruppe == 3
        run: echo b
      - name: gpu-a
        if: matrix.gruppe == 2
        run: echo a
      - name: gpu-pwsh
        if: matrix.gruppe == 3
        shell: pwsh
        run: Write-Host x
      - name: gpu-ausdruck
        if: matrix.gruppe == 2
        env:
          X: \${{ matrix.klasse }}
        run: echo $X
`);
    const fehl = [];
    const l = echtSchritte(fix);
    const namen = l.map((s) => s.name).join(",");
    if (namen !== "gpu-a,gpu-ausdruck,gpu-b,gpu-pwsh") fehl.push(`Auswahl/Ordnung: ${namen}`);
    if (!/shell pwsh/.test((l.find((s) => s.name === "gpu-pwsh") || {}).fehler || ""))
        fehl.push("fremde Shell nicht rot");
    if (!/\$\{\{/.test((l.find((s) => s.name === "gpu-ausdruck") || {}).fehler || ""))
        fehl.push("Ausdruck im env nicht rot");
    // das Exit trägt: ein roter und ein grüner Schritt mit der echten Bash
    const tmp = fs.mkdtempSync(path.join(require("os").tmpdir(), "ci-echt-"));
    const bash = bashPfad();
    const rot = await fahre(
        { run: "echo '[linse-gpu] nvidia/pascal'; exit 3", env: {} },
        { bash, env: process.env, log: path.join(tmp, "a.log") }
    );
    const gruen = await fahre({ run: "true | cat", env: {} }, { bash, env: process.env, log: path.join(tmp, "b.log") });
    const pipe = await fahre({ run: "false | cat", env: {} }, { bash, env: process.env, log: path.join(tmp, "c.log") });
    if (rot.exit !== 3) fehl.push(`Exit trägt nicht (${rot.exit})`);
    if (rot.adapter[0] !== "nvidia/pascal") fehl.push("Adapter-Zeile nicht gelesen");
    if (gruen.exit !== 0) fehl.push("grüner Schritt rot");
    if (pipe.exit === 0) fehl.push("pipefail fehlt (false | cat war grün)");
    fs.rmSync(tmp, { recursive: true, force: true });
    // DIE AUSWAHL: gut steht; ein Name außerhalb der GPU-Klasse ist STALE, eine fremde Wert-Klasse, ein Schritt ohne Zeit und
    // eine Summe über dem Budget fallen beim Namen
    const gs = [{ name: "gpu-a" }, { name: "gpu-b" }];
    const gut = { budget_s: 100, vorbereitung_s: 20, klassen: ["Schatten"], schritte: { "gpu-a": { klasse: "Schatten", s: 30 } } };
    const mit = (o) => JSON.parse(JSON.stringify(Object.assign({}, gut, o)));
    if (auswahlUrteil(gut, gs).befunde.length) fehl.push(`Auswahl gut ist rot: ${auswahlUrteil(gut, gs).befunde.join(" · ")}`);
    const auswahlFaelle = [
        ["stale", mit({ schritte: { "gpu-x": { klasse: "Schatten", s: 1 } } }), /STALE: „gpu-x"/],
        ["Klasse", mit({ schritte: { "gpu-a": { klasse: "Wetter", s: 1 } } }), /Wert-Klasse „Wetter"/],
        ["ohne Zeit", mit({ schritte: { "gpu-a": { klasse: "Schatten" } } }), /keine GTX-Zeit/],
        ["Budget", mit({ schritte: { "gpu-a": { klasse: "Schatten", s: 90 } } }), /BUDGET: die Auswahl trägt 110 s/],
        ["leer", mit({ schritte: {} }), /die Auswahl ist leer/],
    ];
    for (const [n, a, re] of auswahlFaelle)
        if (!auswahlUrteil(a, gs).befunde.some((x) => re.test(x))) fehl.push(`Auswahl „${n}" nicht rot`);
    // DIE NACHT: ein grüner Nachtlauf der Echt-Gruppe auf dem Kopf richtet ihn; ein push-Lauf, ein roter Nachtlauf und der
    // eigene Lauf richten nicht
    const job = (c) => [{ name: "echt (GPU-Gruppen auf der Karte)", conclusion: c }];
    const n1 = nachtUrteil({ eigenerLauf: 9, laeufe: [{ id: 1, event: "schedule" }], jobsJe: { 1: job("success") } });
    const n2 = nachtUrteil({
        eigenerLauf: 9,
        laeufe: [{ id: 2, event: "push" }, { id: 3, event: "schedule" }, { id: 9, event: "schedule" }],
        jobsJe: { 2: job("success"), 3: job("failure"), 9: job("success") },
    });
    if (n1.ganz !== false) fehl.push("Nacht: ein grüner Nachtlauf auf dem Kopf richtet ihn nicht");
    if (n2.ganz !== true) fehl.push(`Nacht: ${n2.grund} (push, rot oder der eigene Lauf zählten)`);
    // die echte Datei: jeder GPU-Schritt fahrbar
    const echt = echtSchritte(yaml.load(fs.readFileSync(path.join(ROOT, DATEI), "utf8")));
    const unfahrbar = echt.filter((s) => s.fehler);
    if (!echt.length) fehl.push("check.yml trägt keinen GPU-Schritt");
    const ap = path.join(ROOT, AUSWAHL);
    if (!fs.existsSync(ap)) fehl.push(`${AUSWAHL} fehlt`);
    else for (const b of auswahlUrteil(JSON.parse(fs.readFileSync(ap, "utf8")), echt).befunde) fehl.push(`${AUSWAHL}: ${b}`);
    if (unfahrbar.length)
        fehl.push(`check.yml: ${unfahrbar.map((s) => `G${s.gruppe} ${s.name}: ${s.fehler}`).join(" · ")}`);
    console.log(
        fehl.length
            ? `❌ SELBSTTEST ROT — ${fehl.join(" · ")}`
            : `✅ SELBSTTEST GRÜN — Auswahl, Ordnung, rote Formen, Exit und pipefail (check.yml: ${echt.length} GPU-Schritte fahrbar)`
    );
    return fehl.length ? 1 : 0;
}

if (require.main === module) {
    const a = process.argv.slice(2);
    const wert = (k) => (a.includes(k) ? a[a.indexOf(k) + 1] : null);
    const p = a.includes("--selbsttest")
        ? selbsttest()
        : lauf({
              auswahl: a.includes("--auswahl"),
              ab: wert("--ab") ? +wert("--ab") : 1,
              liste: a.includes("--liste"),
              gruppe: wert("--gruppe") ? +wert("--gruppe") : null,
              nur: wert("--nur"),
              protokoll: wert("--protokoll"),
          });
    p.then(
        (c) => process.exit(c),
        (e) => {
            console.error("❌ ci-echt:", e.message);
            process.exit(2);
        }
    );
}

module.exports = { echtSchritte, bashPfad, auswahlUrteil, nachtUrteil, AUSWAHL };
