// ci-kopf.cjs — EIN URTEIL JE KOPF: die volle Batterie und die Echt-Gruppe richten jeden Kopf (SHA) einmal.
// Trug ein anderer Lauf, der den Kopf selbst prüfte (push · schedule · workflow_dispatch), die volle Batterie grün: `voll=nein`,
// die Echt-Gruppe grün: `echt=nein`. Läuft ein ÄLTERER noch, wartet der Richter (je 30 s, höchstens 30 min): grün steht, rot
// ist ROT, abgebrochen fährt selbst; ein jüngerer wartet nie auf ihn zurück. Auf Abruf und auf einem PR läuft alles, ein Fehler
// der API ist ROT. gate:ci-deckung (V) KOPF hält die Form, sein Selbsttest die Fälle.
//   node scripts/ci-kopf.cjs        (im Job `kopf`: GITHUB_* aus der Umgebung, GH_TOKEN) → `voll=` und `echt=` nach $GITHUB_OUTPUT
"use strict";
const fs = require("fs");

const IMMER = ["workflow_dispatch", "pull_request"];
const BEWEIS = ["push", "schedule", "workflow_dispatch"];
const [VOLL_JOB, ECHT_JOB] = [/^voll\b/, /^echt\b/];
const [TAKT_S, WARTE_S] = [30, 30 * 60];

// → { voll, echt, grund } · { warte: lauf } · { rot: grund }
function kopfUrteil({ ereignis, eigenerLauf, laeufe, jobsJe, gewartet = [] }) {
    const u = { voll: "ja", echt: "ja", grund: "kein anderer Lauf trägt die volle Batterie auf diesem Kopf grün" };
    if (IMMER.includes(ereignis)) return { ...u, grund: `Ereignis ${ereignis}: die Batterie läuft immer` };
    const gruen = (jobs, re) =>
        jobs.filter((j) => re.test(j.name)).length &&
        jobs.filter((j) => re.test(j.name)).every((j) => j.conclusion === "success");
    for (const r of laeufe || []) {
        if (String(r.id) === String(eigenerLauf) || !BEWEIS.includes(r.event)) continue;
        if (r.status !== "completed") {
            if (Number(r.id) < Number(eigenerLauf)) return { warte: r };
            continue;
        }
        if (gewartet.includes(r.id) && r.conclusion === "failure")
            return { rot: `der Kopf trägt ein rotes Urteil: Lauf ${r.id} (${r.head_branch}, ${r.event})` };
        if (r.conclusion !== "success") continue;
        const jobs = jobsJe[r.id] || [];
        if (gruen(jobs, ECHT_JOB)) u.echt = "nein";
        if (u.voll === "ja" && gruen(jobs, VOLL_JOB))
            Object.assign(u, {
                voll: "nein",
                grund: `der Kopf trägt die volle Batterie grün: Lauf ${r.id} (${r.head_branch}, ${r.event})`,
            });
    }
    return u;
}

// die Läufe, neueste zuerst, OHNE Filter der API: `nimm` wählt, `seit` endet; eine kurze Seite
// wird bis 3× neu gefragt — sonst ROT, nie leer.
async function alleLaeufe(api, pfad, { nimm = () => true, seit = 0, hoechstens = Infinity, traegt = (rs) => rs.length > 0, pause = 2000 } = {}) {
    const [out, je, neu] = [[], 100, (x) => new Date(x.created_at) >= seit];
    let [gesamt, gelesen] = [0, 0];
    for (let seite = 1; ; seite++) {
        let r;
        for (let v = 1; ; v++) {
            r = await api(`${pfad}?per_page=${je}&page=${seite}`);
            gesamt = Math.max(gesamt, r.total_count);
            if (r.workflow_runs.length >= Math.min(je, gesamt - gelesen) && (seite > 1 || traegt(r.workflow_runs))) break;
            if (v === 3) throw new Error(`ROT: ${pfad} Seite ${seite} trägt ${r.workflow_runs.length} Läufe von ${gesamt} nach 3 Versuchen`);
            await new Promise((ok) => setTimeout(ok, pause * v));
        }
        gelesen += r.workflow_runs.length;
        out.push(...r.workflow_runs.filter((x) => nimm(x) && neu(x)));
        if (!r.workflow_runs.every(neu) || out.length >= hoechstens || r.workflow_runs.length < je) return out.slice(0, hoechstens);
    }
}

// die EINE Anfrage an die API (Kopf-Richter und ci-zeiten): ein 5xx oder ein Abriss ist ein Wackler, bis 3 Versuche; sonst ROT
function apiMit(basis, token) {
    const api = async (p, v = 1) => {
        const kopf = { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" } };
        const r = await fetch(basis + p, kopf).catch((e) => (v < 3 ? null : Promise.reject(e)));
        if ((!r || r.status >= 500) && v < 3) return new Promise((ok) => setTimeout(ok, 2000 * v)).then(() => api(p, v + 1));
        if (!r.ok) throw new Error(`${p}: ${r.status} ${await r.text()}`);
        return r.json();
    };
    return api;
}

module.exports = { kopfUrteil, alleLaeufe, apiMit };

if (require.main === module) {
    const env = process.env;
    const api = apiMit(`${env.GITHUB_API_URL || "https://api.github.com"}/repos/${env.GITHUB_REPOSITORY}`, env.GH_TOKEN);
    const wf =
        String(env.GITHUB_WORKFLOW_REF || "")
            .replace(/^[^/]+\/[^/]+\/\.github\/workflows\//, "")
            .replace(/@.*$/, "") || "check.yml";
    (async () => {
        const [ereignis, gewartet] = [env.GITHUB_EVENT_NAME, []];
        let u;
        for (let gang = 0; ; gang++) {
            // der eigene Lauf steht immer in der Liste — fehlt er, war die Seite leer
            const traegt = (rs) => rs.some((r) => String(r.id) === String(env.GITHUB_RUN_ID));
            const [nimm, seit] = [(r) => r.head_sha === env.GITHUB_SHA, Date.now() - 3 * 864e5];
            const laeufe = IMMER.includes(ereignis) ? [] : await alleLaeufe(api, `/actions/workflows/${wf}/runs`, { nimm, seit, traegt });
            const jobsJe = {};
            for (const r of laeufe)
                if (String(r.id) !== String(env.GITHUB_RUN_ID) && r.conclusion === "success")
                    jobsJe[r.id] = (await api(`/actions/runs/${r.id}/jobs?filter=latest&per_page=100`)).jobs;
            u = kopfUrteil({ ereignis, eigenerLauf: env.GITHUB_RUN_ID, laeufe, jobsJe, gewartet });
            if (!u.warte) break;
            if (gang >= WARTE_S / TAKT_S) {
                u = {
                    voll: "ja",
                    echt: "ja",
                    grund: `Lauf ${u.warte.id} läuft nach ${WARTE_S / 60} min noch — die Batterie fährt selbst`,
                };
                break;
            }
            if (!gewartet.includes(u.warte.id)) gewartet.push(u.warte.id);
            console.log(
                `Kopf ${String(env.GITHUB_SHA).slice(0, 8)}: wartet auf Lauf ${u.warte.id} (${u.warte.head_branch}, ${u.warte.status})`
            );
            await new Promise((ok) => setTimeout(ok, TAKT_S * 1000));
        }
        if (u.rot) throw new Error(u.rot);
        console.log(
            `Kopf ${String(env.GITHUB_SHA).slice(0, 8)} (${ereignis}): voll=${u.voll} echt=${u.echt} — ${u.grund}`
        );
        if (env.GITHUB_OUTPUT) fs.appendFileSync(env.GITHUB_OUTPUT, `voll=${u.voll}\necht=${u.echt}\n`);
        if (u.voll === "nein") console.log(`::notice title=Ein Urteil je Kopf::${u.grund}`);
    })().catch((e) => {
        console.error(`❌ ci-kopf: ${e.message}`);
        process.exitCode = 1;
    });
}
