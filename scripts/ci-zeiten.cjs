// ci-zeiten.cjs — DIE ZEITEN DER CI (K14, CI in zwei Stufen, 11.10.): je Schritt von check.yml der Median seiner Laufzeit
// über die letzten 5 grünen Läufe, die ihn tragen, aus der GitHub-API → spec/ci/ci-zeiten.json. Die Datei liest die Waage
// von gate:ci-deckung (jede Puls-Gruppe ≤ 2 min, jede Voll-Gruppe ≤ 11 min, Median samt Vorbereitung); die CI selbst
// fragt die API nie. Ein Schritt wird über Umbenennungen hinweg erkannt: sein Name ODER sein run-Text (aus check.yml am
// Kopf des jeweiligen Laufs). Ein Schritt ohne Lauf behält einen Eintrag mit `geschaetzt` (lokal gemessen, mit Quelle).
//
//   node scripts/ci-zeiten.cjs [--zuerst <lauf-id,…>] [--verteilen]
//     --zuerst    diese Läufe zuerst (die eigenen Messläufe nach einem Umbau), dann die neuesten grünen
//     --verteilen schlägt die Voll-Gruppen vor: die Schritte nach Median absteigend, je in die leichteste Gruppe
//                 (Bin-Packing, größte zuerst), so viele Gruppen, dass jede ≤ 7,5 min Median trägt — Rand 1,47-fach zum
//                 11-min-Deckel der Waage (dieselbe Gruppe lief auf verschiedenen Läufern bis 2-fach lang)
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
const VORBEREITUNG =
    /^(Set up job|Run actions\/checkout@|Run actions\/setup-node@|System-Libs|Dependencies installieren|Post Run |Complete job)/;
const ZIEL_VOLL_S = 7.5 * 60;

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
    const laeufe = [];
    for (const id of zuerst) laeufe.push(gruen.find((r) => r.id === id) || (await api(`/actions/runs/${id}`)));
    for (const r of gruen) if (!laeufe.some((x) => x.id === r.id)) laeufe.push(r);
    // je Schritt die ersten JE_SCHRITT Läufe, die ihn tragen
    const proben = new Map([...soll.keys()].map((n) => [n, []]));
    const vorb = [];
    const ymlAm = new Map();
    for (const r of laeufe) {
        if ([...proben.values()].every((p) => p.length >= JE_SCHRITT) && vorb.length >= 25) break;
        if (r.conclusion !== "success") throw new Error(`Lauf ${r.id} ist ${r.conclusion}, nicht grün`);
        if (!ymlAm.has(r.head_sha)) {
            const c = await api(`/contents/${WORKFLOW}?ref=${r.head_sha}`);
            ymlAm.set(r.head_sha, schritteAus(yaml.load(Buffer.from(c.content, "base64").toString("utf8"))));
        }
        const damals = ymlAm.get(r.head_sha);
        const jobs = (await api(`/actions/runs/${r.id}/jobs?per_page=100`)).jobs;
        for (const job of jobs) {
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
                    if (
                        (n === s.name || (dLauf && dLauf === l)) &&
                        proben.get(n).length < JE_SCHRITT &&
                        !proben.get(n).some((p) => p.lauf === r.id)
                    )
                        proben.get(n).push({ lauf: r.id, s: t });
            }
            if (vorb.length < 25) vorb.push(v);
        }
    }
    const alt = fs.existsSync(path.join(root, AUS)) ? JSON.parse(fs.readFileSync(path.join(root, AUS), "utf8")) : {};
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
        `${AUS}: ${Object.keys(schritte).length} Schritte, Vorbereitung ${out.vorbereitung_s} s, ${laeufe.length} Läufe gelesen`
    );
    if (ohne.length) console.log(`  ohne Messung (Eintrag mit „geschaetzt" nötig): ${ohne.join(" · ")}`);
    if (args.includes("--verteilen")) {
        const v = jetzt.jobs.voll;
        const gs = v.steps.filter((s) => s.name && schritte[s.name] && !VORBEREITUNG.test(s.name));
        const summe = gs.reduce((a, s) => a + schritte[s.name].s, 0);
        let k = Math.max(1, Math.ceil(summe / (ZIEL_VOLL_S - out.vorbereitung_s)));
        for (; ; k++) {
            const last = Array.from({ length: k }, () => ({ s: out.vorbereitung_s, n: [] }));
            for (const s of [...gs].sort((a, b) => schritte[b.name].s - schritte[a.name].s)) {
                const g = last.reduce((m, x) => (x.s < m.s ? x : m), last[0]);
                g.s += schritte[s.name].s;
                g.n.push(s.name);
            }
            if (last.every((g) => g.s <= ZIEL_VOLL_S)) {
                last.forEach((g, i) =>
                    console.log(`  voll ${i + 1}/${k}: ${(g.s / 60).toFixed(1)} min — ${g.n.length} Schritte`)
                );
                console.log(JSON.stringify(Object.fromEntries(last.flatMap((g, i) => g.n.map((n) => [n, i + 1])))));
                break;
            }
        }
    }
})().catch((e) => {
    console.error(e);
    process.exit(1);
});
