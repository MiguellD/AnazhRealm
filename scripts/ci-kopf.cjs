// ci-kopf.cjs — EIN URTEIL JE KOPF (K61 CI-Diät): die volle Batterie richtet jeden Kopf (SHA) einmal.
//
// Befund (Prüfung K61-1): derselbe Kopf fuhr die volle Batterie mehrfach — d2e06032 auf integ-probe (38629080926, grün)
// und 14 min später noch einmal auf main (38631780033, der Vorlauf nach main), 062ec357 viermal (main-naechst · main ·
// claude/profi-band-pflanzen · integ-probe). Jeder Doppel-Lauf belegt die 20 Läufer-Plätze des Kontos mit einem Urteil,
// das schon steht, und ließ den Beweislauf von K61 (38632403330) bis 344 s auf Plätze warten: Wanduhr 12,3 min statt 7,3.
// Der Richter: vor der vollen Batterie fragt der Job `kopf` (check.yml) die API, ob ein ANDERER Lauf dieses Workflows auf
// demselben Kopf die volle Batterie grün trug (jede Voll-Gruppe success, keine übersprungen) — dann steht das Urteil des
// Kopfs, und die Batterie läuft nicht noch einmal (`voll=nein`, der Lauf mit Zweig und Id im Log). Sonst `voll=ja`.
// Ein Beweis ist nur ein Lauf, der den Kopf selbst prüfte (push · schedule · workflow_dispatch; ein pull_request prüft den
// Merge mit main, nie den Kopf allein). Nachts (schedule) und auf Abruf (workflow_dispatch) läuft die Batterie immer, ein
// pull_request immer. Ein Fehler der API ist ROT (Exit 1): der Lauf steht rot, nie still ohne Batterie.
// gate:ci-deckung (V) KOPF hält die Form in check.yml, sein Selbsttest fährt `kopfUrteil()` gegen die Fälle.
//
//   node scripts/ci-kopf.cjs        (im Job `kopf`: GITHUB_* aus der Umgebung, GH_TOKEN) → `voll=ja|nein` nach $GITHUB_OUTPUT
"use strict";
const fs = require("fs");

const IMMER = ["schedule", "workflow_dispatch", "pull_request"];
const BEWEIS = ["push", "schedule", "workflow_dispatch"];
const VOLL_JOB = /^voll\b/;

// ereignis: github.event_name · eigenerLauf: github.run_id · laeufe: die Läufe dieses Workflows auf dem Kopf (API) ·
// jobsJe: Lauf-Id → seine Jobs (letzter Versuch) → { voll: "ja"|"nein", grund }
function kopfUrteil({ ereignis, eigenerLauf, laeufe, jobsJe }) {
    if (IMMER.includes(ereignis)) return { voll: "ja", grund: `Ereignis ${ereignis}: die Batterie läuft immer` };
    for (const r of laeufe || []) {
        if (String(r.id) === String(eigenerLauf)) continue;
        if (!BEWEIS.includes(r.event) || r.status !== "completed" || r.conclusion !== "success") continue;
        const voll = (jobsJe[r.id] || []).filter((j) => VOLL_JOB.test(j.name));
        if (voll.length && voll.every((j) => j.conclusion === "success"))
            return {
                voll: "nein",
                grund: `der Kopf trägt die volle Batterie grün: Lauf ${r.id} (${r.head_branch}, ${r.event}, ${voll.length} Voll-Gruppen)`,
            };
    }
    return { voll: "ja", grund: "kein anderer Lauf trägt die volle Batterie auf diesem Kopf grün" };
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
    (async () => {
        const ereignis = env.GITHUB_EVENT_NAME;
        let laeufe = [];
        const jobsJe = {};
        if (!IMMER.includes(ereignis)) {
            const wf = String(env.GITHUB_WORKFLOW_REF || "")
                .replace(/^[^/]+\/[^/]+\/\.github\/workflows\//, "")
                .replace(/@.*$/, "");
            laeufe = (await api(`/actions/workflows/${wf || "check.yml"}/runs?head_sha=${env.GITHUB_SHA}&per_page=100`))
                .workflow_runs;
            for (const r of laeufe)
                if (String(r.id) !== String(env.GITHUB_RUN_ID) && r.conclusion === "success")
                    jobsJe[r.id] = (await api(`/actions/runs/${r.id}/jobs?filter=latest&per_page=100`)).jobs;
        }
        const u = kopfUrteil({ ereignis, eigenerLauf: env.GITHUB_RUN_ID, laeufe, jobsJe });
        console.log(`Kopf ${String(env.GITHUB_SHA).slice(0, 8)} (${ereignis}): voll=${u.voll} — ${u.grund}`);
        if (env.GITHUB_OUTPUT) fs.appendFileSync(env.GITHUB_OUTPUT, `voll=${u.voll}\n`);
        if (u.voll === "nein") console.log(`::notice title=Ein Urteil je Kopf::${u.grund}`);
    })().catch((e) => {
        console.error(`❌ ci-kopf: ${e.message}`);
        process.exitCode = 1;
    });
}
