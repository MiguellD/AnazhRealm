// ci-zeiten.cjs — DIE ZEITEN DER CI: je Schritt von check.yml sein Gewicht aus den letzten 7 Läufen auf integ-probe (derselbe
// run-Text, je Job-Art; jeder Versuch, grün und rot) — im Puls der Median, in der vollen Stufe der p90 (der langsame Läufer, den
// ihr Deckel hält) → spec/ci/ci-zeiten.json (die Waage von gate:ci-deckung); ohne Messung ROT, die Tafel bleibt. Er verteilt die
// Voll-Gruppen je Klasse und je echt-Schritt die Frist timeout-minutes = max(5, ⌈3 × p90⌉, ⌈1,2 × größter Lauf⌉).
//   node scripts/ci-zeiten.cjs                          misst und verteilt
//   node scripts/ci-zeiten.cjs --tafel                  die Kennzahlen des Richters über 7 Tage (druckt, schreibt nichts)
"use strict";
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const yaml = require("js-yaml");
const { klasseDesLaufs, GROSS_S, LAEUFER_PLAETZE } = require("./lib/ci-klasse.cjs");
const { alleLaeufe, apiMit } = require("./ci-kopf.cjs");
const { hauptLauf } = require("./lib/welt-boot.cjs");

const root = path.resolve(__dirname, "..");
const API = "https://api.github.com/repos/MiguellD/AnazhRealm";
const WORKFLOW = ".github/workflows/check.yml";
const AUS = "spec/ci/ci-zeiten.json";
const [JE_SCHRITT, HOECHSTENS] = [7, 40]; // Messungen je Schritt; Läufe höchstens
const VORBEREITUNG =
    /^(Set up job|Run actions\/checkout@|Run actions\/setup-node@|Run actions\/cache@|Cache-Schlüssel|System-Libs|Dependencies installieren|Post Run |Complete job)/;
// die Jobs und ihr Gruppen-Schlüssel („voll 16/18 gpu" → „voll 16", „echt (…)" → „echt")
const GRUPPE = /^(puls|voll|kopf|echt)(?: (\d+)\/\d+)?/;

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
            if (s.name && s.run && !VORBEREITUNG.test(s.name)) m.set(s.name, { run: lauf(s), echt: job === "echt", voll: job === "voll" });
    return m;
}

// die Messung: je Schritt die ersten JE_SCHRITT Läufe, die ihr Urteil sprachen (grün oder rot: dieselbe Arbeit), aus jedem Versuch;
// ein am Job-Deckel abgebrochener Schritt, der selbst die Hälfte des Deckels trug, zählt mit seiner Zeit als untere Grenze (er ist
// der Täter des Abbruchs). Nur grün und nur der letzte Versuch gezählt, wog die Kamera-Leib-Linse 58 s, während sie auf G18 318–919 s
// lief und sieben Läufe am Deckel brach (der langsame Läufer brach ab, der schnelle Wiederholungs-Versuch wurde gezählt).
async function messe(api, jetzt, alt = {}, pause = 2000) {
    const soll = schritteAus(jetzt);
    const nimm = (r) => r.head_branch === "integ-probe" && r.status === "completed";
    const neueste = await alleLaeufe(api, "/actions/workflows/check.yml/runs", { nimm, seit: Date.now() - 14 * 864e5, hoechstens: HOECHSTENS, pause });
    const proben = new Map([...soll.keys()].map((n) => [n, []]));
    const [vorb, ymlAm, ort, gesehen] = [{ echt: [], sonst: [] }, new Map(), new Map(), new Set()];
    let [kopf, gelesen, gemessen] = [null, 0, 0];
    for (const r of neueste) {
        if ([...proben.values()].every((p) => p.length >= JE_SCHRITT) && vorb.sonst.length >= 25) break;
        gelesen++;
        if (!ymlAm.has(r.head_sha)) {
            const c = await api(`/contents/${WORKFLOW}?ref=${r.head_sha}`);
            const doc = yaml.load(Buffer.from(c.content, "base64").toString("utf8"));
            ymlAm.set(r.head_sha, [schritteAus(doc), doc.jobs]);
        }
        const [damals, jobsDamals] = ymlAm.get(r.head_sha);
        const jobs = [];
        for (let a = r.run_attempt; a >= 1; a--) jobs.push(...(await api(`/actions/runs/${r.id}/attempts/${a}/jobs?per_page=100`)).jobs);
        for (const job of jobs) {
            const g = GRUPPE.exec(job.name);
            // ein Wiederholungs-Versuch trägt die Jobs des vorigen mit (derselbe Start): einmal gezählt
            if (!g || gesehen.has(job.name + job.started_at)) continue;
            gesehen.add(job.name + job.started_at);
            const [key, echt] = [g[2] ? `${g[1]} ${g[2]}` : g[1], g[1] === "echt"];
            let v = sek(job.started_at, job.completed_at);
            const deckel = 60 * Number((jobsDamals[g[1]] || {})["timeout-minutes"]);
            const amDeckel = job.conclusion === "cancelled" && v >= deckel - 60;
            for (const s of job.steps || []) {
                const t = sek(s.started_at, s.completed_at);
                if (t == null || s.conclusion === "skipped" || VORBEREITUNG.test(s.name)) continue;
                v -= t;
                const d = damals.get(s.name);
                const n = d && [...soll].find(([, x]) => x.run === d.run && x.echt === echt);
                const zaehlt = /^(success|failure)$/.test(s.conclusion) || (amDeckel && t >= deckel / 2);
                if (!n || !zaehlt || proben.get(n[0]).length >= JE_SCHRITT) continue;
                proben.get(n[0]).push(t);
                [kopf, gemessen] = [kopf || r.head_sha, gemessen + 1];
                if (!ort.has(n[0])) ort.set(n[0], key);
            }
            // die Vorbereitung nur am grünen Job
            const vb = vorb[echt ? "echt" : "sonst"];
            if (job.conclusion === "success" && vb.length < 25) vb.push(v);
        }
    }
    const [schritte, ohne] = [{}, []];
    for (const [n, x] of soll) {
        const p = proben.get(n);
        if (p.length)
            schritte[n] = {
                s: Math.round(x.echt ? Math.min(...p) : (x.voll ? p90 : median)(p)),
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
        quelle: "GitHub-API (s): je Schritt aus den letzten je_schritt Läufen mit Urteil auf integ-probe im Puls der Median, voll der p90, echt mit p90 und max — scripts/ci-zeiten.cjs, gelesen von gate:ci-deckung",
        erzeugt: new Date().toISOString().slice(0, 10),
        kopf,
        je_schritt: JE_SCHRITT,
        vorbereitung_s: Math.round(median(vorb.sonst)),
        echt: { vorbereitung_s: Math.round(median(vorb.echt)) },
        schritte,
    };
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
        // die Teile EINES Skripts (`--teil=N`, jedes im Schritt) nie in einer Gruppe
        const darf = (g, s, ohne) =>
            !g.n.some((x) => x !== ohne && x.run.replace(/--teil=\d+/g, "") === s.run.replace(/--teil=\d+/g, ""));
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
    // die Frist je gemessenem echt-Schritt (ein ungemessener behält seine)
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

// DIE RICHTER-TAFEL (7 Tage); ein Wackler: ein späterer Versuch grün, wo ein früherer rot war (≥ 2 Läufe = eine Karte)
async function tafel(api) {
    const seit = new Date(Date.now() - 7 * 864e5);
    const runs = await alleLaeufe(api, "/actions/workflows/check.yml/runs", { seit });
    const [J, wackler, min] = [new Map(), new Map(), (s) => (s / 60).toFixed(1).replace(".", ",")];
    const jobsVon = async (r, a) => (await api(`/actions/runs/${r.id}/attempts/${a}/jobs?per_page=100`)).jobs;
    const schritte = (js, wie) => new Set(js.flatMap((j) => (j.steps || []).filter((s) => s.conclusion === wie).map((s) => s.name)));
    const auftrag = runs.filter((r) => r.status === "completed");
    const holen = async () => {
        for (let r; (r = auftrag.pop()); ) {
            J.set(r, await jobsVon(r, r.run_attempt));
            const gruen = schritte(J.get(r), "success");
            for (let a = 1; a < r.run_attempt; a++)
                for (const s of schritte(await jobsVon(r, a), "failure")) if (gruen.has(s)) wackler.set(s, (wackler.get(s) || new Set()).add(r.id));
        }
    };
    await Promise.all(Array.from({ length: 8 }, holen));
    const jobs = (r, re) => (J.get(r) || []).filter((j) => re.test(j.name) && j.conclusion !== "skipped");
    const voll = (r) => jobs(r, /^voll\b/);
    const gruenVoll = (r) => r.conclusion === "success" && voll(r).length && voll(r).every((j) => j.conclusion === "success");
    const echt = runs.flatMap((r) => jobs(r, /^echt\b/)).filter((j) => j.conclusion === "success").map((j) => sek(j.started_at, j.completed_at));
    const erst = (b) => new Map(runs.filter((r) => r.event === "push" && r.head_branch === b).map((r) => [r.head_sha, r.created_at]));
    const [integ, main] = [erst("integ-probe"), erst("main")];
    const weg = [...main].filter(([k]) => integ.has(k)).map(([k, t]) => sek(integ.get(k), t));
    const bat = Object.values(runs.filter((r) => voll(r).length).reduce((m, r) => ((m[r.head_sha] = (m[r.head_sha] || 0) + 1), m), {}));
    const nacht = runs.filter((r) => r.event === "schedule" && voll(r).length && runs.some((o) => o.head_sha === r.head_sha && o.created_at < r.created_at && gruenVoll(o)));
    const karten = [...wackler].filter(([, l]) => l.size >= 2).sort((a, b) => b[1].size - a[1].size);
    console.log(`DIE RICHTER-TAFEL seit ${seit.toISOString().slice(0, 10)}: ${runs.length} Läufe von check.yml
  echt-Median der grünen Läufe: ${min(median(echt))} min (${echt.length} Läufe, p90 ${min(p90(echt) || 0)})
  integ-probe-Push bis main-Push: Median ${min(median(weg))} min (${weg.length} main-Köpfe)
  integ-probe-Köpfe je main-FF: ${integ.size} / ${main.size}
  volle Batterien je Kopf: ${(bat.reduce((a, x) => a + x, 0) / bat.length).toFixed(2)} (${bat.length} Köpfe, ${bat.filter((x) => x > 1).length} mit ≥ 2)
  Wackler je Schritt (≥ 2 Läufe = Karte): ${karten.map(([n, l]) => `„${n}" ×${l.size}`).join(" · ") || "keiner"}
  Nacht-Batterien auf grünem Kopf: ${nacht.length} (${nacht.map((r) => `${r.head_sha.slice(0, 8)} ${min(sek(r.run_started_at, r.updated_at))} min`).join(" · ")})`);
}

module.exports = { messe };

if (require.main === module) {
    const args = process.argv.slice(2);
    const token =
        process.env.GITHUB_TOKEN ||
        execSync("git credential fill", { input: "protocol=https\nhost=github.com\n\n" })
            .toString()
            .match(/^password=(.*)$/m)[1];
    hauptLauf(async () => {
        if (args.includes("--tafel")) return tafel(apiMit(API, token));
        const jetzt = yaml.load(fs.readFileSync(path.join(root, WORKFLOW), "utf8"));
        const alt = fs.existsSync(path.join(root, AUS))
            ? JSON.parse(fs.readFileSync(path.join(root, AUS), "utf8"))
            : {};
        const { out, gelesen, ohne } = await messe(apiMit(API, token), jetzt, alt);
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
    });
}
