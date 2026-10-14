// ci-zeiten.cjs — DIE ZEITEN DER CI (K14, CI in zwei Stufen, 11.10.): je Schritt von check.yml der Median seiner Laufzeit
// über die letzten 5 grünen Läufe, die ihn tragen, aus der GitHub-API → spec/ci/ci-zeiten.json. Die Datei liest die Waage
// von gate:ci-deckung (jede Puls-Gruppe ≤ 2 min, jede Voll-Gruppe ≤ 7 min, Median samt Vorbereitung); die CI selbst
// fragt die API nie. Ein Schritt misst nur, wo er DENSELBEN Befehl fuhr: sein run-Text an diesem Lauf (aus check.yml am
// Kopf des jeweiligen Laufs) gleicht dem jetzigen — eine Umbenennung misst weiter, ein Umbau (anderer Befehl unter altem
// Namen) misst erst ab seinem eigenen Lauf, auf jedem Zweig (K61: die Lauf-Id-Schwelle `seit` ließ main und integ-probe
// mit dem alten haus-welt unter dem neuen Namen mitzählen, Median 421 s statt 293 s). Ein Schritt ohne Lauf behält einen
// Eintrag mit `geschaetzt` (lokal gemessen, mit Quelle).
//
//   node scripts/ci-zeiten.cjs [--zuerst <lauf-id,…>] [--verteilen]
//     --zuerst    diese Läufe zuerst (die eigenen Messläufe nach einem Umbau), dann die neuesten grünen
//     --verteilen schlägt die Voll-Gruppen vor, JE KLASSE getrennt (K61: cpu · gpu, scripts/lib/ci-klasse.cjs): so viele
//                 Gruppen, wie Läufer-Plätze neben dem Puls frei sind (gate:ci-deckung (T) PLÄTZE — ein Job über den
//                 Plätzen wartet auf einen freien und trägt die Wanduhr doppelt), der volle Playtest in seiner eigenen,
//                 der Rest je Klasse nach Median absteigend in die leichteste Gruppe (Bin-Packing, größte zuerst), die
//                 Aufteilung cpu:gpu mit der kleinsten schwersten Gruppe
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
const JE_SCHRITT = 5;
// höchstens so viele Messungen (ein neuer Schritt, den erst wenige Läufe tragen, liest sonst die ganze Liste)
const HOECHSTENS = 40;
const VORBEREITUNG =
    /^(Set up job|Run actions\/checkout@|Run actions\/setup-node@|Run actions\/cache@|Cache-Schlüssel|System-Libs|Dependencies installieren|Post Run |Complete job)/;
const { klasseDesLaufs, LAEUFER_PLAETZE } = require("./lib/ci-klasse.cjs");

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
const median = (a) => {
    const s = [...a].sort((x, y) => x - y);
    const n = s.length;
    return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
};
const lauf = (s) =>
    String(s.run || "")
        .trim()
        .replace(/\s+/g, " ");

// die Schritte einer check.yml: Name → run-Text (ohne Vorbereitung)
function schritteAus(doc) {
    const m = new Map();
    for (const j of Object.values((doc && doc.jobs) || {}))
        for (const s of j.steps || []) if (s.name && s.run && !VORBEREITUNG.test(s.name)) m.set(s.name, lauf(s));
    return m;
}

(async () => {
    const args = process.argv.slice(2);
    const zi = args.indexOf("--zuerst");
    const zuerst = zi >= 0 ? args[zi + 1].split(",").map(Number) : [];
    const jetzt = yaml.load(fs.readFileSync(path.join(root, WORKFLOW), "utf8"));
    const soll = schritteAus(jetzt);
    // die Läufe: zuerst die genannten, dann die neuesten grünen
    const gruen = [];
    for (let seite = 1; seite <= 3; seite++) {
        const r = await api(`/actions/workflows/check.yml/runs?status=success&per_page=50&page=${seite}`);
        gruen.push(...r.workflow_runs);
        if (r.workflow_runs.length < 50) break;
    }
    // eine Messung = ein Versuch eines Laufs: die genannten Läufe mit JEDEM Versuch (eine Wiederholung über die API ist
    // eine zweite Messung desselben Kopfs), die übrigen mit ihrem letzten
    const laeufe = [];
    for (const id of zuerst) {
        const r = gruen.find((x) => x.id === id) || (await api(`/actions/runs/${id}`));
        for (let a = 1; a <= r.run_attempt; a++) laeufe.push({ r, a, lauf: `${r.id}/${a}` });
    }
    for (const r of gruen) if (!zuerst.includes(r.id)) laeufe.push({ r, a: r.run_attempt, lauf: String(r.id) });
    // je Schritt die ersten JE_SCHRITT Messungen, die ihn tragen
    const proben = new Map([...soll.keys()].map((n) => [n, []]));
    const altDatei = fs.existsSync(path.join(root, AUS)) ? JSON.parse(fs.readFileSync(path.join(root, AUS), "utf8")) : {};
    const vorb = [];
    const ymlAm = new Map();
    let gelesen = 0;
    for (const { r, a, lauf: messung } of laeufe) {
        if ([...proben.values()].every((p) => p.length >= JE_SCHRITT) && vorb.length >= 25) break;
        if (++gelesen > HOECHSTENS) break;
        if (!ymlAm.has(r.head_sha)) {
            const c = await api(`/contents/${WORKFLOW}?ref=${r.head_sha}`);
            ymlAm.set(r.head_sha, schritteAus(yaml.load(Buffer.from(c.content, "base64").toString("utf8"))));
        }
        const damals = ymlAm.get(r.head_sha);
        const jobs = (await api(`/actions/runs/${r.id}/attempts/${a}/jobs?per_page=100`)).jobs;
        const rot = jobs.filter((j) => !["success", "skipped"].includes(j.conclusion));
        // ein genannter Messlauf (--zuerst) misst nur seine grünen Jobs; ein roter Job misst nie
        if (rot.length && !zuerst.includes(r.id))
            throw new Error(`Lauf ${messung} trägt ${rot.map((j) => j.name + " " + j.conclusion).join(", ")}`);
        for (const job of jobs) {
            if (job.conclusion !== "success") continue;
            let v = 0;
            for (const s of job.steps || []) {
                const t = sek(s.started_at, s.completed_at);
                if (t == null || s.conclusion === "skipped") continue;
                if (VORBEREITUNG.test(s.name)) {
                    v += t;
                    continue;
                }
                const dLauf = damals.get(s.name);
                for (const [n, l] of soll)
                    if (dLauf && dLauf === l && proben.get(n).length < JE_SCHRITT && !proben.get(n).some((p) => p.lauf === messung))
                        proben.get(n).push({ lauf: messung, s: t });
            }
            if (vorb.length < 25) vorb.push(v);
        }
    }
    const alt = altDatei;
    const schritte = {};
    const ohne = [];
    for (const [n, l] of soll) {
        const p = proben.get(n);
        if (p.length)
            schritte[n] = {
                s: Math.round(median(p.map((x) => x.s))),
                n: p.length,
                lauf: l,
                laeufe: p.map((x) => x.lauf),
            };
        else if (alt.schritte && alt.schritte[n] && alt.schritte[n].geschaetzt)
            schritte[n] = { ...alt.schritte[n], lauf: l };
        else ohne.push(n);
    }
    const out = {
        quelle:
            "GitHub-API: je Schritt von check.yml der Median seiner Laufzeit (s) über die letzten 5 grünen Läufe, die ihn tragen " +
            "(Name oder run-Text), vorbereitung_s der Median je Job (Set up, checkout, setup-node, System-Libs, npm ci, Post) — " +
            "erzeugt von scripts/ci-zeiten.cjs, gelesen von der Waage in gate:ci-deckung",
        erzeugt: new Date().toISOString().slice(0, 10),
        vorbereitung_s: Math.round(median(vorb)),
        schritte,
    };
    if (alt.vorher) out.vorher = alt.vorher;
    fs.mkdirSync(path.dirname(path.join(root, AUS)), { recursive: true });
    fs.writeFileSync(path.join(root, AUS), JSON.stringify(out, null, 2) + "\n");
    console.log(
        `${AUS}: ${Object.keys(schritte).length} Schritte, Vorbereitung ${out.vorbereitung_s} s, ${Math.min(gelesen, laeufe.length)} Messungen gelesen`
    );
    if (ohne.length) console.log(`  ohne Messung (Eintrag mit „geschaetzt" nötig): ${ohne.join(" · ")}`);
    if (args.includes("--verteilen")) {
        const v = jetzt.jobs.voll;
        const skripte = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).scripts || {};
        const alle = v.steps.filter((s) => s.name && s.run && schritte[s.name] && !VORBEREITUNG.test(s.name));
        // in k Gruppen: größte zuerst in die leichteste (LPT)
        const packe = (gs, k) => {
            const last = Array.from({ length: k }, () => ({ s: out.vorbereitung_s, n: [] }));
            for (const s of [...gs].sort((x, y) => schritte[y.name].s - schritte[x.name].s)) {
                const g = last.reduce((m, x) => (x.s < m.s ? x : m), last[0]);
                g.s += schritte[s.name].s;
                g.n.push(s.name);
            }
            return last;
        };
        // je Klasse die Gruppen (ein bedingter Schritt läuft als CPU: die Weiche urteilt zur Laufzeit)
        const gpu = (s) => klasseDesLaufs(s.run, skripte).klasse === "gpu";
        // der volle Playtest trägt seine EIGENE Gruppe (gate:ci-deckung (P) EIGEN)
        const pt = (s) => /\bnpm run playtest\b(?!:)/.test(s.run);
        // die Plätze neben dem Puls (ein Job, auf den die Batterie wartet — der Kopf-Richter —, endet vor ihr)
        const puls = ((jetzt.jobs.puls.strategy || {}).matrix || {}).gruppe || [1];
        const frei = LAEUFER_PLAETZE - puls.length - alle.filter(pt).length;
        const cpu = alle.filter((s) => !gpu(s) && !pt(s));
        const gp = alle.filter(gpu);
        let best = null;
        for (let kc = 1; kc < frei; kc++) {
            const a = packe(cpu, kc);
            const b = packe(gp, frei - kc);
            const max = Math.max(...a.concat(b).map((g) => g.s));
            if (!best || max < best.max) best = { max, a, b };
        }
        const gruppen = [
            ...alle.filter(pt).map((s) => ({ s: out.vorbereitung_s + schritte[s.name].s, n: [s.name], klasse: "cpu" })),
            ...best.a.map((g) => ({ ...g, klasse: "cpu" })),
            ...best.b.map((g) => ({ ...g, klasse: "gpu" })),
        ];
        gruppen.forEach((g, i) =>
            console.log(`  voll ${i + 1}/${gruppen.length} ${g.klasse}: ${(g.s / 60).toFixed(1)} min — ${g.n.length} Schritte`)
        );
        console.log(
            JSON.stringify({
                klassen: gruppen.map((g) => g.klasse),
                schritte: Object.fromEntries(gruppen.flatMap((g, i) => g.n.map((n) => [n, i + 1]))),
            })
        );
    }
})().catch((e) => {
    console.error(e);
    process.exit(1);
});
