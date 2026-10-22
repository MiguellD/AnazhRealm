// ci-kopf.cjs — EIN URTEIL JE KOPF (K61 CI-Diät, Richter 22.10.): die volle Batterie und die Echt-Gruppe richten jeden Kopf
// (SHA) einmal. Vor der Batterie fragt der Job `kopf` (check.yml) die API nach den anderen Läufen dieses Workflows auf
// demselben Kopf, die ihn selbst prüften (push · schedule · workflow_dispatch; ein pull_request prüft den Merge mit main):
// trug einer die volle Batterie grün, steht ihr Urteil (`voll=nein`), trug einer die Echt-Gruppe grün, steht ihres (`echt=nein`).
// Läuft ein ÄLTERER solcher Lauf noch, wartet der Richter auf ihn (je 30 s, höchstens 30 min): grün → sein Urteil steht, rot
// → ROT, abgebrochen → die Batterie fährt selbst. Ein jüngerer Lauf wartet nie auf einen älteren und umgekehrt (kein Kreis).
// Nachts urteilt derselbe Richter (main trägt den Kopf von integ-probe), auf Abruf und auf einem PR läuft alles. Ein Fehler der
// API ist ROT: der Lauf steht rot, nie still ohne Batterie. gate:ci-deckung (V) KOPF hält die Form, sein Selbsttest die Fälle.
//
//   node scripts/ci-kopf.cjs        (im Job `kopf`: GITHUB_* aus der Umgebung, GH_TOKEN) → `voll=` und `echt=` nach $GITHUB_OUTPUT
"use strict";
const fs = require("fs");

const IMMER = ["workflow_dispatch", "pull_request"];
const BEWEIS = ["push", "schedule", "workflow_dispatch"];
const [VOLL_JOB, ECHT_JOB] = [/^voll\b/, /^echt\b/];
const [TAKT_S, WARTE_S] = [30, 30 * 60];

// ereignis: github.event_name · eigenerLauf: github.run_id · laeufe: die Läufe dieses Workflows auf dem Kopf (API) · jobsJe:
// Lauf-Id → seine Jobs (letzter Versuch) · gewartet: die Läufe, auf die der Richter wartete
// → { voll, echt: "ja"|"nein", grund } · { warte: lauf } · { rot: grund }
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

module.exports = { kopfUrteil };

if (require.main === module) {
    const env = process.env;
    const API = `${env.GITHUB_API_URL || "https://api.github.com"}/repos/${env.GITHUB_REPOSITORY}`;
    const api = async (p) => {
        const r = await fetch(API + p, {
            headers: { Authorization: `Bearer ${env.GH_TOKEN}`, Accept: "application/vnd.github+json" },
        });
        if (!r.ok) throw new Error(`${p}: ${r.status} ${await r.text()}`);
        return r.json();
    };
    const wf =
        String(env.GITHUB_WORKFLOW_REF || "")
            .replace(/^[^/]+\/[^/]+\/\.github\/workflows\//, "")
            .replace(/@.*$/, "") || "check.yml";
    (async () => {
        const [ereignis, gewartet, bis] = [env.GITHUB_EVENT_NAME, [], Date.now() + WARTE_S * 1000];
        let u;
        for (;;) {
            const laeufe = IMMER.includes(ereignis)
                ? []
                : (await api(`/actions/workflows/${wf}/runs?head_sha=${env.GITHUB_SHA}&per_page=100`)).workflow_runs;
            const jobsJe = {};
            for (const r of laeufe)
                if (String(r.id) !== String(env.GITHUB_RUN_ID) && r.conclusion === "success")
                    jobsJe[r.id] = (await api(`/actions/runs/${r.id}/jobs?filter=latest&per_page=100`)).jobs;
            u = kopfUrteil({ ereignis, eigenerLauf: env.GITHUB_RUN_ID, laeufe, jobsJe, gewartet });
            if (!u.warte) break;
            if (Date.now() > bis) {
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
