// ci-zeiten.cjs — DIE ZEITEN DER CI (K14, CW, Richter 22.10.): aus der GitHub-API je Schritt von check.yml der Median seiner
// Laufzeit über die letzten 7 grünen Messungen auf integ-probe, wo er DENSELBEN Befehl fuhr (sein run-Text an check.yml des
// Laufs, je Job-Art: die Echt-Gruppe fährt dieselben Befehle auf der Karte, eine andere Zeit), je Gruppe der Median ihrer
// Job-Dauer bei gleichem Schritt-Satz, die Vorbereitung als Job-Dauer über die Gate-Schritte hinaus → spec/ci/ci-zeiten.json,
// die Waage von gate:ci-deckung (die CI fragt die API nie); ohne Lauf `geschaetzt`. Liefert die API keine Messung, endet er
// ROT beim Namen und schreibt nichts (22.10.: eine leere Tafel, 0 Schritte, 969 Zeilen still weg).
//
// DERSELBE Befehl verteilt (CW2): die Voll-Gruppen JE KLASSE (K61: cpu · gpu, scripts/lib/ci-klasse.cjs), so viele, wie neben
// dem Puls Läufer-Plätze frei sind — der volle Playtest in Gruppe 1, der Rest größte zuerst in die leichteste, die Teile eines
// Skripts nie beisammen, die Aufteilung cpu:gpu mit der kleinsten schwersten Gruppe —, und je echt-Schritt seine FRIST
// timeout-minutes = max(5, ⌈3 × p90⌉, ⌈1,2 × größter grüner Lauf⌉) in check.yml.
//   node scripts/ci-zeiten.cjs [--zuerst <lauf-id,…>]   (--zuerst: diese Läufe zuerst, die eigenen Messläufe nach einem Umbau)
//   node scripts/ci-zeiten.cjs --tafel                  die Kennzahlen des Richters über 7 Tage (druckt, schreibt nichts)
// Der Schlüssel: GITHUB_TOKEN oder git credential fill.
"use strict";
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const yaml = require("js-yaml");
const { klasseDesLaufs, GROSS_S, LAEUFER_PLAETZE } = require("./lib/ci-klasse.cjs");

const root = path.resolve(__dirname, "..");
const API = "https://api.github.com/repos/MiguellD/AnazhRealm";
const WORKFLOW = ".github/workflows/check.yml";
const AUS = "spec/ci/ci-zeiten.json";
const [JE_SCHRITT, HOECHSTENS] = [7, 40]; // Messungen je Schritt; Läufe höchstens (ein neuer Schritt läse sonst die ganze Liste)
const VORBEREITUNG =
    /^(Set up job|Run actions\/checkout@|Run actions\/setup-node@|Run actions\/cache@|Cache-Schlüssel|System-Libs|Dependencies installieren|Post Run |Complete job)/;
// die Jobs und ihr Gruppen-Schlüssel („voll 16/18 gpu" → „voll 16", wie die Waage ihn nennt; „echt (GPU-Wände …)" → „echt")
const GRUPPE = /^(puls|voll|kopf|echt)(?: (\d+)\/\d+)?/;

function apiMit(token) {
    return async (p) => {
        const r = await fetch(p.startsWith("http") ? p : API + p, {
            headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
        });
        if (!r.ok) throw new Error(`${p}: ${r.status}`);
        return r.json();
    };
}
const sek = (a, b) => (a && b ? (new Date(b) - new Date(a)) / 1000 : null);
const sortiert = (a) => [...a].sort((x, y) => x - y);
const median = (a) =>
    sortiert(a).reduce((m, x, i, s) => (i === s.length >> 1 ? (s.length % 2 ? x : (s[i - 1] + x) / 2) : m), 0);
const p90 = (a) => sortiert(a)[Math.ceil(0.9 * a.length) - 1];
const lauf = (s) =>
    String(s.run || "")
        .trim()
        .replace(/\s+/g, " ");
const frist = (z) => Math.max(5, Math.ceil((3 * z.p90) / 60), Math.ceil((1.2 * z.max) / 60));

// die Schritte einer check.yml: Name → { run-Text, Job-Art } (ohne Vorbereitung)
function schritteAus(doc) {
    const m = new Map();
    for (const [job, j] of Object.entries((doc && doc.jobs) || {}))
        for (const s of (GRUPPE.test(job) && j.steps) || [])
            if (s.name && s.run && !VORBEREITUNG.test(s.name)) m.set(s.name, { run: lauf(s), echt: job === "echt" });
    return m;
}

// die Messung: je Schritt die ersten JE_SCHRITT grünen Messungen, je Gruppe die Job-Dauer der grünen Läufe mit dem Satz des
// neuesten; eine Messung = ein Versuch eines Laufs (die genannten mit JEDEM Versuch, die übrigen mit ihrem letzten)
async function messe(api, jetzt, zuerst = [], alt = {}) {
    const soll = schritteAus(jetzt);
    const neueste = [];
    for (let seite = 1; seite <= 3; seite++) {
        const r = await api(
            `/actions/workflows/check.yml/runs?branch=integ-probe&status=completed&per_page=50&page=${seite}`
        );
        neueste.push(...r.workflow_runs);
        if (r.workflow_runs.length < 50) break;
    }
    const laeufe = [];
    for (const id of zuerst) {
        const r = neueste.find((x) => x.id === id) || (await api(`/actions/runs/${id}`));
        for (let a = 1; a <= r.run_attempt; a++) laeufe.push({ r, a, lauf: `${r.id}/${a}` });
    }
    for (const r of neueste) if (!zuerst.includes(r.id)) laeufe.push({ r, a: r.run_attempt, lauf: String(r.id) });
    const proben = new Map([...soll.keys()].map((n) => [n, []]));
    const [vorb, ymlAm, gruppen, ort] = [{ echt: [], sonst: [] }, new Map(), new Map(), new Map()];
    let [kopf, gelesen, gemessen] = [null, 0, 0];
    for (const { r, a, lauf: messung } of laeufe) {
        if ([...proben.values()].every((p) => p.length >= JE_SCHRITT) && vorb.sonst.length >= 25) break;
        if (++gelesen > HOECHSTENS) break;
        if (!ymlAm.has(r.head_sha)) {
            const c = await api(`/contents/${WORKFLOW}?ref=${r.head_sha}`);
            ymlAm.set(r.head_sha, schritteAus(yaml.load(Buffer.from(c.content, "base64").toString("utf8"))));
        }
        const damals = ymlAm.get(r.head_sha);
        for (const job of (await api(`/actions/runs/${r.id}/attempts/${a}/jobs?per_page=100`)).jobs) {
            const g = GRUPPE.exec(job.name);
            if (!g) continue;
            const [key, gruen, echt] = [g[2] ? `${g[1]} ${g[2]}` : g[1], job.conclusion === "success", g[1] === "echt"];
            // ein Schritt misst, wo er grün lief; die Vorbereitung und die Gruppe nur am grünen Job
            let v = sek(job.started_at, job.completed_at);
            const eigen = [];
            for (const s of job.steps || []) {
                const t = sek(s.started_at, s.completed_at);
                if (t == null || s.conclusion === "skipped" || VORBEREITUNG.test(s.name)) continue;
                v -= t;
                const d = damals.get(s.name);
                const n = d && [...soll].find(([, x]) => x.run === d.run && x.echt === echt);
                eigen.push(n ? n[0] : "? " + s.name);
                if (
                    !n ||
                    s.conclusion !== "success" ||
                    proben.get(n[0]).length >= JE_SCHRITT ||
                    proben.get(n[0]).some((p) => p.lauf === messung)
                )
                    continue;
                proben.get(n[0]).push({ lauf: messung, s: t });
                [kopf, gemessen] = [kopf || r.head_sha, gemessen + 1];
                if (!ort.has(n[0])) ort.set(n[0], key);
            }
            if (!gruen) continue;
            const vb = vorb[echt ? "echt" : "sonst"];
            if (vb.length < 25) vb.push(v);
            const satz = eigen.sort().join("\n");
            const G = gruppen.get(key) || gruppen.set(key, { satz, s: [] }).get(key);
            if (G.satz === satz && G.s.length < JE_SCHRITT) G.s.push(sek(job.started_at, job.completed_at));
        }
    }
    const [schritte, ohne] = [{}, []];
    for (const [n, x] of soll) {
        const p = proben.get(n).map((q) => q.s);
        if (p.length)
            schritte[n] = {
                s: Math.round(median(p)),
                n: p.length,
                gruppe: ort.get(n),
                ...(x.echt ? { p90: Math.round(p90(p)), max: Math.round(Math.max(...p)) } : {}),
            };
        else if (alt.schritte && alt.schritte[n] && alt.schritte[n].geschaetzt) schritte[n] = alt.schritte[n];
        else ohne.push(n);
    }
    if (!gemessen || !Object.keys(schritte).length)
        throw new Error(
            `ROT: die API lieferte ${neueste.length} Läufe, ${gemessen} Messungen, ${Object.keys(schritte).length} Schritte — ${AUS} bleibt, wie sie ist`
        );
    const out = {
        quelle: "GitHub-API (s): je Schritt der Median der letzten je_schritt grünen Messungen auf integ-probe (echt-Schritte mit p90 und max), je Gruppe der Job-Dauer, die Vorbereitung je Job; kopf der neueste gemessene Lauf — erzeugt von scripts/ci-zeiten.cjs, gelesen von der Waage in gate:ci-deckung",
        erzeugt: new Date().toISOString().slice(0, 10),
        kopf,
        je_schritt: JE_SCHRITT,
        vorbereitung_s: Math.round(median(vorb.sonst)),
        echt: { vorbereitung_s: Math.round(median(vorb.echt)) },
        gruppen: Object.fromEntries([...gruppen].map(([k, G]) => [k, { s: Math.round(median(G.s)), n: G.s.length }])),
        schritte,
    };
    if (alt.vorher) out.vorher = alt.vorher;
    return { out, gelesen, ohne };
}

// die Lage in check.yml: im Job voll je Schritt seine Gruppe, die Matrix und ihre Klassen; im Job echt je Schritt seine Frist
function verteile(jetzt, out) {
    const skripte = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).scripts || {};
    const { schritte } = out;
    const alle = jetzt.jobs.voll.steps.filter((s) => s.name && s.run && schritte[s.name] && !VORBEREITUNG.test(s.name));
    const z = (s) => schritte[s.name].s;
    const pt = (s) => /\bnpm run playtest\b(?!:)/.test(s.run);
    const packe = (gs, k) => {
        const last = Array.from({ length: k }, () => ({ s: out.vorbereitung_s, n: [] }));
        const lege = (g, s, vz = 1) => ((g.s += vz * z(s)), vz > 0 ? g.n.push(s) : g.n.splice(g.n.indexOf(s), 1));
        // die Teile EINES Skripts (`--teil=N`) nie in einer Gruppe (CW-Lauf 38914686744: Erst-Zeichnung 1+2 zusammen 396 s statt 198)
        const darf = (g, s, ohne) =>
            !g.n.some((x) => x !== ohne && x.run.replace(/--teil=\d+/, "") === s.run.replace(/--teil=\d+/, ""));
        for (const s of [...gs].sort((x, y) => pt(y) - pt(x) || z(y) - z(x)))
            lege(
                pt(s)
                    ? last[0]
                    : last
                          .filter((x) => darf(x, s))
                          .reduce((m, x) => (x.s < m.s ? x : m), last.find((x) => darf(x, s)) || last[0]),
                s
            );
        // nachbessern: ein Zug (ein Schritt der schwersten Gruppe in eine andere, oder ein Tausch) senkt sie, solange einer da ist
        for (let zug = true; zug;) {
            const h = last.filter((x) => x.n.length > 1).sort((x, y) => y.s - x.s)[0];
            zug = null;
            for (const l of h ? last : [])
                for (const a of h.n)
                    for (const b of [null, ...l.n]) {
                        const [d, frei] = [
                            z(a) - (b ? z(b) : 0),
                            darf(l, a, b) && (!b || darf(h, b, a)) && !pt(a) && !(b && pt(b)),
                        ];
                        const neu = Math.max(h.s - d, l.s + d);
                        if (l !== h && d > 0 && frei && neu < (zug ? zug.neu : h.s)) zug = { l, a, b, neu };
                    }
            const zuege = zug
                ? [
                      [h, zug.a, -1],
                      [zug.l, zug.a, 1],
                  ].concat(
                      zug.b
                          ? [
                                [zug.l, zug.b, -1],
                                [h, zug.b, 1],
                            ]
                          : []
                  )
                : [];
            for (const [g, s, vz] of zuege) lege(g, s, vz);
        }
        return last;
    };
    // ein bedingter Schritt läuft als CPU (die Weiche urteilt zur Laufzeit)
    const gpu = (s) => klasseDesLaufs(s.run, skripte).klasse === "gpu";
    const frei = LAEUFER_PLAETZE - (((jetzt.jobs.puls.strategy || {}).matrix || {}).gruppe || [1]).length;
    let best = null;
    for (let kc = 1; kc < frei; kc++) {
        const a = packe(
            alle.filter((s) => !gpu(s)),
            kc
        ).map((g) => ({ ...g, klasse: "cpu" }));
        const g = a.concat(packe(alle.filter(gpu), frei - kc).map((x) => ({ ...x, klasse: "gpu" })));
        const max = Math.max(...g.map((x) => (x.n.length > 1 ? x.s : 0)));
        if (!best || max < best.max) best = { max, g };
    }
    for (const [i, g, gross = g.n.find((s) => z(s) > GROSS_S)] of best.g.map((g, i) => [i, g]))
        console.log(
            `  voll ${i + 1}/${best.g.length} ${g.klasse}: ${(g.s / 60).toFixed(1)} min — ${g.n.length} Schritte` +
                (gross ? ` · über ${GROSS_S / 60} min (eigene Karte): „${gross.name}"` : "")
        );
    const nr = new Map(best.g.flatMap((g, i) => g.n.map((s) => [s, i + 1])));
    const neu = jetzt.jobs.voll.steps
        .filter((s) => /^\s*matrix\.gruppe\s*==\s*\d+\s*$/.test(String(s.if)))
        .map((s) => nr.get(s));
    let yml = fs.readFileSync(path.join(root, WORKFLOW), "utf8");
    const block = (job) => {
        const von = yml.indexOf(`\n    ${job}:\n`);
        return [von, von + 1 + yml.slice(von + 1).search(/\n {4}[\w-]+:\n|$/)];
    };
    let [von, bis] = block("voll");
    let zeile = 0;
    const voll = yml
        .slice(von, bis)
        .replace(/(name: voll \$\{\{ matrix\.gruppe \}\}\/)\d+/, (m, x) => x + best.g.length)
        .replace(/^( +gruppe: )\[[\d, ]*\]/m, (m, x) => `${x}[${best.g.map((g, k) => k + 1).join(", ")}]`)
        .replace(/^( +)- gruppe: \d+\n(?: +klasse: \w+\n| +- gruppe: \d+\n)*/m, (m, x) =>
            best.g.map((g, k) => `${x}- gruppe: ${k + 1}\n${x}  klasse: ${g.klasse}\n`).join("")
        )
        .replace(/^( +if: matrix\.gruppe == )(\d+)$/gm, (m, x, alt) => x + (neu[zeile++] || alt));
    if (von < 0 || zeile !== neu.length)
        throw new Error(`${WORKFLOW}: ${zeile} Gruppen-Zeilen im Job voll, ${neu.length} Schritte mit Gruppe`);
    yml = yml.slice(0, von) + voll + yml.slice(bis);
    // die Frist je gemessenem echt-Schritt (ein ungemessener behält seine, ohne eine ist er ROT in gate:ci-deckung (E))
    [von, bis] = block("echt");
    let fristen = 0;
    const echt = yml.slice(von, bis).replace(/^( +)- name: (.+)\n(?:\1  timeout-minutes: \d+\n)?/gm, (m, x, n) => {
        const s = schritte[n.replace(/^"(.*)"$/, "$1")];
        return s && s.p90 ? (fristen++, `${x}- name: ${n}\n${x}  timeout-minutes: ${frist(s)}\n`) : m;
    });
    if (von >= 0) yml = yml.slice(0, von) + echt + yml.slice(bis);
    fs.writeFileSync(path.join(root, WORKFLOW), yml);
    console.log(
        `${WORKFLOW}: ${nr.size} Schritte in ${best.g.length} Voll-Gruppen, die schwerste mit Mitfahrern ${(best.max / 60).toFixed(1)} min · ${fristen} echt-Fristen — es wiegt npm run gate:ci-deckung`
    );
}

// DIE RICHTER-TAFEL (7 Tage): echt-Median der grünen Läufe · integ-probe-Push bis main-Push · integ-probe-Köpfe je main-FF ·
// volle Batterien je Kopf · Wackler je Schritt (ein Versuch ≥ 2 grün, wo ein früherer rot war; ≥ 2 Läufe = eine Karte) ·
// Nacht-Batterien auf grünem main (der Kopf trug schon einen grünen vollen Lauf)
async function tafel(api) {
    const seit = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
    const runs = [];
    for (let seite = 1; seite <= 30; seite++) {
        const r = await api(`/actions/workflows/check.yml/runs?created=%3E%3D${seit}&per_page=100&page=${seite}`);
        runs.push(...r.workflow_runs);
        if (r.workflow_runs.length < 100) break;
    }
    if (!runs.length) throw new Error(`ROT: die API lieferte seit ${seit} keinen Lauf`);
    const vollArt = (r) =>
        ["schedule", "workflow_dispatch", "pull_request"].includes(r.event) ||
        ["integ-probe", "main"].includes(r.head_branch) ||
        /\[ci voll\]/.test((r.head_commit || {}).message || "");
    const [J, frueher] = [new Map(), new Map()];
    const auftrag = runs.filter((r) => r.status === "completed" && (vollArt(r) || r.run_attempt > 1));
    const holen = async () => {
        for (let r; (r = auftrag.pop());) {
            J.set(r.id, (await api(`/actions/runs/${r.id}/attempts/${r.run_attempt}/jobs?per_page=100`)).jobs);
            for (let a = 1; a < r.run_attempt; a++)
                frueher.set(`${r.id}/${a}`, (await api(`/actions/runs/${r.id}/attempts/${a}/jobs?per_page=100`)).jobs);
        }
    };
    await Promise.all(Array.from({ length: 8 }, holen));
    const jobs = (r, re) => (J.get(r.id) || []).filter((j) => re.test(j.name) && j.conclusion !== "skipped");
    const gruenVoll = (r) =>
        r.conclusion === "success" &&
        jobs(r, /^voll\b/).length &&
        jobs(r, /^voll\b/).every((j) => j.conclusion === "success");
    const min = (s) => (s / 60).toFixed(1).replace(".", ",");
    const echt = runs
        .flatMap((r) => jobs(r, /^echt\b/))
        .filter((j) => j.conclusion === "success")
        .map((j) => sek(j.started_at, j.completed_at));
    const push = (b) => runs.filter((r) => r.event === "push" && r.head_branch === b);
    const erst = new Map();
    for (const r of push("integ-probe"))
        if (!erst.has(r.head_sha) || r.created_at < erst.get(r.head_sha)) erst.set(r.head_sha, r.created_at);
    const mainKoepfe = new Set(push("main").map((r) => r.head_sha));
    const weg = [...mainKoepfe]
        .filter((s) => erst.has(s))
        .map((s) => sek(erst.get(s), push("main").find((r) => r.head_sha === s).created_at));
    const batterien = new Map();
    for (const r of runs)
        if (jobs(r, /^voll\b/).length) batterien.set(r.head_sha, (batterien.get(r.head_sha) || 0) + 1);
    const wackler = new Map();
    for (const [k, js] of frueher) {
        const r = runs.find((x) => String(x.id) === k.split("/")[0]);
        const spaeter = new Set(
            (J.get(r.id) || []).flatMap((j) =>
                (j.steps || []).filter((s) => s.conclusion === "success").map((s) => s.name)
            )
        );
        for (const s of new Set(
            js.flatMap((j) => (j.steps || []).filter((s) => s.conclusion === "failure").map((s) => s.name))
        ))
            if (spaeter.has(s)) wackler.set(s, new Set([...(wackler.get(s) || []), r.id]));
    }
    const nacht = runs.filter(
        (r) =>
            r.event === "schedule" &&
            jobs(r, /^voll\b/).length &&
            runs.some((o) => o !== r && o.head_sha === r.head_sha && o.created_at < r.created_at && gruenVoll(o))
    );
    const bat = [...batterien.values()];
    console.log(`DIE RICHTER-TAFEL (seit ${seit}, ${runs.length} Läufe von check.yml, ${J.size} mit Jobs gelesen)`);
    console.log(
        `  echt-Median der grünen Läufe: ${echt.length ? min(median(echt)) : "—"} min (${echt.length} Läufe, p90 ${echt.length ? min(p90(echt)) : "—"})`
    );
    console.log(
        `  integ-probe-Push bis main-Push: Median ${weg.length ? min(median(weg)) : "—"} min (${weg.length} main-Köpfe)`
    );
    console.log(
        `  integ-probe-Köpfe je main-FF: ${erst.size} / ${mainKoepfe.size} = ${(erst.size / Math.max(1, mainKoepfe.size)).toFixed(1).replace(".", ",")}`
    );
    console.log(
        `  volle Batterien je Kopf: ${(bat.reduce((a, x) => a + x, 0) / Math.max(1, bat.length)).toFixed(2).replace(".", ",")} (${bat.length} Köpfe, ${bat.filter((x) => x > 1).length} mit ≥ 2, höchstens ${Math.max(0, ...bat)})`
    );
    const karten = [...wackler].filter(([, l]) => l.size >= 2).sort((a, b) => b[1].size - a[1].size);
    console.log(
        `  Wackler je Schritt (≥ 2 Läufe = Karte): ${karten.map(([n, l]) => `„${n}" ×${l.size}`).join(" · ") || "keiner"} (${wackler.size} Schritte je ≥ 1)`
    );
    console.log(
        `  Nacht-Batterien auf grünem main: ${nacht.length} (${nacht.map((r) => `${r.head_sha.slice(0, 8)} ${min(sek(r.run_started_at, r.updated_at))} min`).join(" · ") || "keine"})`
    );
}

module.exports = { messe };

if (require.main === module) {
    const args = process.argv.slice(2);
    const token =
        process.env.GITHUB_TOKEN ||
        execSync("git credential fill", { input: "protocol=https\nhost=github.com\n\n" })
            .toString()
            .match(/^password=(.*)$/m)[1];
    (async () => {
        if (args.includes("--tafel")) return tafel(apiMit(token));
        const zi = args.indexOf("--zuerst");
        const jetzt = yaml.load(fs.readFileSync(path.join(root, WORKFLOW), "utf8"));
        const alt = fs.existsSync(path.join(root, AUS))
            ? JSON.parse(fs.readFileSync(path.join(root, AUS), "utf8"))
            : {};
        const { out, gelesen, ohne } = await messe(
            apiMit(token),
            jetzt,
            zi >= 0 ? args[zi + 1].split(",").map(Number) : [],
            alt
        );
        // eine Liste oder ein Eintrag ohne Klammern in sich (eine Gruppe, ein Schritt des `vorher`) steht in einer Zeile
        const text = JSON.stringify(out, null, 2).replace(
            /([[{])\n\s+([^[\]{}]*?)\n\s+([\]}])/g,
            (m, a, x, b) => a + x.replace(/\n\s+/g, " ") + b
        );
        fs.writeFileSync(path.join(root, AUS), text + "\n");
        console.log(
            `${AUS}: ${Object.keys(out.schritte).length} Schritte, Vorbereitung ${out.vorbereitung_s} s (echt ${out.echt.vorbereitung_s} s), ${gelesen} Läufe, Kopf ${out.kopf}`
        );
        if (ohne.length) console.log(`  ohne Messung (Eintrag mit „geschaetzt" nötig): ${ohne.join(" · ")}`);
        verteile(jetzt, out);
    })().catch((e) => {
        console.error(`❌ ci-zeiten: ${e.message}`);
        process.exit(1);
    });
}
