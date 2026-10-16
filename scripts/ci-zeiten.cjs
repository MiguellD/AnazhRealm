// ci-zeiten.cjs — DIE ZEITEN DER CI (K14, 11.10.; CW, 16.10.): aus der GitHub-API je Schritt von check.yml der Median seiner
// Laufzeit über die letzten 7 Läufe auf integ-probe, die ihn in einem grünen Job der GitHub-Läufer tragen (die Echt-Gruppe
// fährt dieselben Schritte auf der Karte, eine andere Zeit), je Gruppe der Median ihrer Job-Dauer bei gleichem Schritt-Satz,
// die Vorbereitung als Job-Dauer über die Gate-Schritte hinaus und der Kopf der Quelle (der neueste gemessene Lauf) →
// spec/ci/ci-zeiten.json, die Waage von gate:ci-deckung; die CI fragt die API nie. CW-Befund: die Quelle las nur ganz grüne
// Läufe — seit der Echt-Gruppe (K65) kaum einer — und rechnete mit Medianen vom 14.10. (Fenster-Wand 77 s statt 441 s). Ein
// Schritt misst nur, wo er DENSELBEN Befehl fuhr (sein run-Text an check.yml des Laufs, K61); ohne Lauf `geschaetzt` mit Quelle.
//
//   node scripts/ci-zeiten.cjs [--zuerst <lauf-id,…>] [--verteilen]
//     --zuerst    diese Läufe zuerst (die eigenen Messläufe nach einem Umbau), dann die neuesten auf integ-probe
//     --verteilen schlägt die Voll-Gruppen vor, JE KLASSE (K61: cpu · gpu, scripts/lib/ci-klasse.cjs), so viele, wie neben dem
//                 Puls Läufer-Plätze frei sind: der volle Playtest zuerst in Gruppe 1, der Rest größte zuerst in die
//                 leichteste, die Aufteilung cpu:gpu mit der kleinsten schwersten Gruppe, die mehr als einen Schritt trägt
// Der Schlüssel: GITHUB_TOKEN oder die git-Anmeldung (git credential fill).
"use strict";
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const yaml = require("js-yaml");

const root = path.resolve(__dirname, "..");
const REPO = "MiguellD/AnazhRealm";
const API = `https://api.github.com/repos/${REPO}`;
const WORKFLOW = ".github/workflows/check.yml";
const AUS = "spec/ci/ci-zeiten.json";
const JE_SCHRITT = 7;
const HOECHSTENS = 40; // Messungen höchstens (ein neuer Schritt, den wenige Läufe tragen, läse sonst die ganze Liste)
const VORBEREITUNG =
    /^(Set up job|Run actions\/checkout@|Run actions\/setup-node@|Run actions\/cache@|Cache-Schlüssel|System-Libs|Dependencies installieren|Post Run |Complete job)/;
// die Jobs der GitHub-Läufer und ihr Gruppen-Schlüssel („voll 16/18 gpu" → „voll 16", wie die Waage ihn nennt)
const GRUPPE = /^(puls|voll|kopf)(?: (\d+)\/\d+)?/;
const { klasseDesLaufs, GROSS_S, LAEUFER_PLAETZE } = require("./lib/ci-klasse.cjs");

const token =
    process.env.GITHUB_TOKEN ||
    execSync("git credential fill", { input: "protocol=https\nhost=github.com\n\n" })
        .toString()
        .match(/^password=(.*)$/m)[1];
async function api(p) {
    const r = await fetch(p.startsWith("http") ? p : API + p, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
    });
    if (!r.ok) throw new Error(`${p}: ${r.status}`);
    return r.json();
}
const sek = (a, b) => (a && b ? (new Date(b) - new Date(a)) / 1000 : null);
const median = (a) => [...a].sort((x, y) => x - y).reduce((m, x, i, s) => (i === s.length >> 1 ? (s.length % 2 ? x : (s[i - 1] + x) / 2) : m), 0);
const lauf = (s) => String(s.run || "").trim().replace(/\s+/g, " ");

// die Schritte einer check.yml auf den GitHub-Läufern: Name → run-Text (ohne Vorbereitung)
function schritteAus(doc) {
    const m = new Map();
    for (const [job, j] of Object.entries((doc && doc.jobs) || {}))
        for (const s of (GRUPPE.test(job) && j.steps) || []) if (s.name && s.run && !VORBEREITUNG.test(s.name)) m.set(s.name, lauf(s));
    return m;
}

(async () => {
    const args = process.argv.slice(2);
    const zi = args.indexOf("--zuerst");
    const zuerst = zi >= 0 ? args[zi + 1].split(",").map(Number) : [];
    const jetzt = yaml.load(fs.readFileSync(path.join(root, WORKFLOW), "utf8"));
    const soll = schritteAus(jetzt);
    // die Läufe: zuerst die genannten, dann die neuesten auf integ-probe (jeder trägt den Puls, ein voller die Batterie)
    const neueste = [];
    for (let seite = 1; seite <= 3; seite++) {
        const r = await api(`/actions/workflows/check.yml/runs?branch=integ-probe&status=completed&per_page=50&page=${seite}`);
        neueste.push(...r.workflow_runs);
        if (r.workflow_runs.length < 50) break;
    }
    // eine Messung = ein Versuch eines Laufs: die genannten Läufe mit JEDEM Versuch (eine Wiederholung über die API ist
    // eine zweite Messung desselben Kopfs), die übrigen mit ihrem letzten
    const laeufe = [];
    for (const id of zuerst) {
        const r = neueste.find((x) => x.id === id) || (await api(`/actions/runs/${id}`));
        for (let a = 1; a <= r.run_attempt; a++) laeufe.push({ r, a, lauf: `${r.id}/${a}` });
    }
    for (const r of neueste) if (!zuerst.includes(r.id)) laeufe.push({ r, a: r.run_attempt, lauf: String(r.id) });
    // je Schritt die ersten JE_SCHRITT Messungen, die ihn tragen; je Gruppe die Job-Dauer der Läufe, die ihr dieselben
    // Schritte gaben wie der neueste (der Satz); der Kopf der Quelle ist der neueste Lauf, der misst
    const proben = new Map([...soll.keys()].map((n) => [n, []]));
    const alt = fs.existsSync(path.join(root, AUS)) ? JSON.parse(fs.readFileSync(path.join(root, AUS), "utf8")) : {};
    const vorb = [];
    const ymlAm = new Map();
    const gruppen = new Map();
    const ort = new Map();
    let kopf = null;
    let gelesen = 0;
    for (const { r, a, lauf: messung } of laeufe) {
        if ([...proben.values()].every((p) => p.length >= JE_SCHRITT) && vorb.length >= 25) break;
        if (++gelesen > HOECHSTENS) break;
        if (!ymlAm.has(r.head_sha)) {
            const c = await api(`/contents/${WORKFLOW}?ref=${r.head_sha}`);
            ymlAm.set(r.head_sha, schritteAus(yaml.load(Buffer.from(c.content, "base64").toString("utf8"))));
        }
        const damals = ymlAm.get(r.head_sha);
        for (const job of (await api(`/actions/runs/${r.id}/attempts/${a}/jobs?per_page=100`)).jobs) {
            const g = GRUPPE.exec(job.name);
            // ein roter Job misst nie, die Echt-Gruppe nie hier (dieselben Schritte auf der Karte, eine andere Zeit)
            if (job.conclusion !== "success" || !g) continue;
            const key = g[2] ? `${g[1]} ${g[2]}` : g[1];
            // die Vorbereitung: was der Job über seine Gate-Schritte hinaus trägt (Set up, checkout, Caches, npm ci, die Fugen)
            let v = sek(job.started_at, job.completed_at);
            const eigen = [];
            for (const s of job.steps || []) {
                const t = sek(s.started_at, s.completed_at);
                if (t == null || s.conclusion === "skipped") continue;
                if (VORBEREITUNG.test(s.name)) continue;
                v -= t;
                const dLauf = damals.get(s.name);
                const n = dLauf && [...soll].find(([, l]) => l === dLauf);
                eigen.push(n ? n[0] : "? " + s.name);
                if (!n || proben.get(n[0]).length >= JE_SCHRITT || proben.get(n[0]).some((p) => p.lauf === messung)) continue;
                proben.get(n[0]).push({ lauf: messung, s: t });
                kopf = kopf || r.head_sha;
                if (!ort.has(n[0])) ort.set(n[0], key);
            }
            if (vorb.length < 25) vorb.push(v);
            const satz = eigen.sort().join("\n");
            const G = gruppen.get(key) || gruppen.set(key, { satz, s: [] }).get(key);
            if (G.satz === satz && G.s.length < JE_SCHRITT) G.s.push(sek(job.started_at, job.completed_at));
        }
    }
    const schritte = {};
    const ohne = [];
    for (const [n, l] of soll) {
        const p = proben.get(n);
        if (p.length)
            schritte[n] = {
                s: Math.round(median(p.map((x) => x.s))),
                n: p.length,
                gruppe: ort.get(n),
                lauf: l,
                laeufe: p.map((x) => x.lauf),
            };
        else if (alt.schritte && alt.schritte[n] && alt.schritte[n].geschaetzt)
            schritte[n] = { ...alt.schritte[n], lauf: l };
        else ohne.push(n);
    }
    const out = {
        quelle: "GitHub-API (s): je Schritt der Median der letzten je_schritt Läufe auf integ-probe, je Gruppe der Job-Dauer, die Vorbereitung je Job; kopf der neueste gemessene Lauf — erzeugt von scripts/ci-zeiten.cjs, gelesen von der Waage in gate:ci-deckung",
        erzeugt: new Date().toISOString().slice(0, 10),
        kopf,
        je_schritt: JE_SCHRITT,
        vorbereitung_s: Math.round(median(vorb)),
        gruppen: Object.fromEntries([...gruppen].map(([k, G]) => [k, { s: Math.round(median(G.s)), n: G.s.length }])),
        schritte,
    };
    if (alt.vorher) out.vorher = alt.vorher;
    // eine Liste ohne Klammern in sich (Läufe, ein Schritt des `vorher`) steht in einer Zeile
    const text = JSON.stringify(out, null, 2).replace(/\[\n\s+([^[\]{}]*?)\n\s+\]/g, (m, x) => `[${x.replace(/\n\s+/g, " ")}]`);
    fs.writeFileSync(path.join(root, AUS), text + "\n");
    console.log(`${AUS}: ${Object.keys(schritte).length} Schritte, Vorbereitung ${out.vorbereitung_s} s, ${gelesen} Messungen, Kopf ${kopf}`);
    if (ohne.length) console.log(`  ohne Messung (Eintrag mit „geschaetzt" nötig): ${ohne.join(" · ")}`);
    if (args.includes("--verteilen")) {
        const skripte = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).scripts || {};
        const alle = jetzt.jobs.voll.steps.filter((s) => s.name && s.run && schritte[s.name] && !VORBEREITUNG.test(s.name));
        const z = (s) => schritte[s.name].s;
        // in k Gruppen: der volle Playtest zuerst in Gruppe 1, der Rest größte zuerst in die leichteste
        const pt = (s) => /\bnpm run playtest\b(?!:)/.test(s.run);
        const packe = (gs, k) => {
            const last = Array.from({ length: k }, () => ({ s: out.vorbereitung_s, n: [] }));
            const lege = (g, s, vz = 1) => ((g.s += vz * z(s)), vz > 0 ? g.n.push(s) : g.n.splice(g.n.indexOf(s), 1));
            // die Teile EINES Skripts (`--teil=N`) nie in einer Gruppe (CW-Lauf 38914686744: Erst-Zeichnung 1+2 zusammen 396 s statt 198)
            const darf = (g, s, ohne) => !g.n.some((x) => x !== ohne && x.run.replace(/--teil=\d+/, "") === s.run.replace(/--teil=\d+/, ""));
            for (const s of [...gs].sort((x, y) => pt(y) - pt(x) || z(y) - z(x)))
                lege(pt(s) ? last[0] : last.filter((x) => darf(x, s)).reduce((m, x) => (x.s < m.s ? x : m), last.find((x) => darf(x, s)) || last[0]), s);
            // nachbessern: ein Zug (ein Schritt der schwersten Gruppe in eine andere, oder ein Tausch) senkt sie, solange einer da ist
            for (let zug = true; zug; ) {
                const h = last.filter((x) => x.n.length > 1).sort((x, y) => y.s - x.s)[0];
                zug = null;
                for (const l of h ? last : [])
                    for (const a of h.n)
                        for (const b of [null, ...l.n]) {
                            const [d, frei] = [z(a) - (b ? z(b) : 0), darf(l, a, b) && (!b || darf(h, b, a)) && !pt(a) && !(b && pt(b))];
                            const neu = Math.max(h.s - d, l.s + d);
                            if (l !== h && d > 0 && frei && neu < (zug ? zug.neu : h.s)) zug = { l, a, b, neu };
                        }
                const zuege = zug ? [[h, zug.a, -1], [zug.l, zug.a, 1]].concat(zug.b ? [[zug.l, zug.b, -1], [h, zug.b, 1]] : []) : [];
                for (const [g, s, vz] of zuege) lege(g, s, vz);
            }
            return last;
        };
        // ein bedingter Schritt läuft als CPU (die Weiche urteilt zur Laufzeit); der Kopf-Richter endet vor der Batterie
        const gpu = (s) => klasseDesLaufs(s.run, skripte).klasse === "gpu";
        const frei = LAEUFER_PLAETZE - (((jetzt.jobs.puls.strategy || {}).matrix || {}).gruppe || [1]).length;
        let best = null;
        for (let kc = 1; kc < frei; kc++) {
            const a = packe(alle.filter((s) => !gpu(s)), kc).map((g) => ({ ...g, klasse: "cpu" }));
            const g = a.concat(packe(alle.filter(gpu), frei - kc).map((x) => ({ ...x, klasse: "gpu" })));
            const max = Math.max(...g.map((x) => (x.n.length > 1 ? x.s : 0)));
            if (!best || max < best.max) best = { max, g };
        }
        for (const [i, g, gross = g.n.find((s) => z(s) > GROSS_S)] of best.g.map((g, i) => [i, g]))
            console.log(`  voll ${i + 1}/${best.g.length} ${g.klasse}: ${(g.s / 60).toFixed(1)} min — ${g.n.length} Schritte` + (gross ? ` · über ${GROSS_S / 60} min (eigene Karte): „${gross.name}"` : ""));
        console.log(
            JSON.stringify({
                klassen: best.g.map((g) => g.klasse),
                schritte: Object.fromEntries(best.g.flatMap((g, i) => g.n.map((s) => [s.name, i + 1]))),
            })
        );
    }
})().catch((e) => {
    console.error(e);
    process.exit(1);
});
