// ci-kopf.cjs — EIN URTEIL JE KOPF: die volle Batterie richtet jeden Kopf (SHA) einmal.
// DER KOPF IST SEIN INHALT: ein Commit ohne Inhalt (EIN Elter, derselbe Inhalt — der Stempel „Abgabe …" auf dem geprüften Kopf)
// trägt das Urteil seines Elters, bis KETTE Glieder tief (`kopfKette`); ein Merge und jeder Commit mit Inhalt erben nichts.
// DER POST ZÄHLT NICHT (ci-post-erbt, 24.11.): der Inhalt ist der Wurzel-Baum OHNE den Eintrag `cloud-post` (`inhaltVon`) — der
// Bericht eines Zweigs (cloud-post/<zweig>.md) ist kein Code-Stand; bis hier fuhr jeder Bericht-Commit mit [ci voll] die Batterie
// neu (klang-leib 3× für EINEN Code-Stand). Gebaut aus der API (`kopfKetteLesen`: /git/commits, dann /git/trees des Wurzel-Baums)
// oder aus dem lokalen git (`kopfKetteLokal`: ls-tree, der Dienst ci.sh) — dieselbe Form, ohne Inhalt bricht die Kette beim Namen.
// Trug ein anderer Lauf, der den Kopf selbst prüfte (push · schedule · workflow_dispatch), die volle Batterie grün: `voll=nein`.
// Läuft ein ÄLTERER noch, wartet der Richter (je 30 s, höchstens 30 min): grün steht, rot
// ist ROT, abgebrochen fährt selbst; ein jüngerer wartet nie auf ihn zurück. Auf Abruf und auf einem PR läuft alles, ein Fehler
// der API ist ROT. gate:ci-deckung (V) KOPF hält die Form, sein Selbsttest die Fälle.
// DER ZUG FÄHRT voll NIE (LANDUNG ≤ 10 MIN, 23.11., der Schöpfer: „Keine 10h max 10min und fertig. Wir messen soviel wie nötig,
// nicht wie möglich“): ein push auf einen Zug-Zweig (ZUG_REFS) ist `voll=nein` ohne Frage an die API — die Batterie erbt vom grünen
// Lauf am Zweig-Kopf, den der Einlass verlangt (zug.cjs bereit); nach der Landung fährt sie auf main (die Nachwache). Die Karten
// (Job `echt`) fahren nur auf Abruf und fragen keinen Richter.
// DIESELBE KETTE trägt die GPU-Probe (`probeErbeLesen`, Leser: der Einlass in gpu-probe.yml, gate:apparat Klinge 7 fährt ihn).
//   node scripts/ci-kopf.cjs        (im Job `kopf`: GITHUB_* aus der Umgebung, GH_TOKEN) → `voll=` nach $GITHUB_OUTPUT
"use strict";
require("./lib/urteil-zeile.cjs").wache(); // Lehre 6: eine gedruckte ROTE Zeile bei Exit 0 wird Exit 1
const fs = require("fs");
const crypto = require("crypto");
const { setTimeout: schlaf } = require("timers/promises");

const IMMER = ["workflow_dispatch", "pull_request"];
const BEWEIS = ["push", "schedule", "workflow_dispatch"];
const VOLL_JOB = /^voll\b/;
const [TAKT_S, WARTE_S] = [30, 30 * 60];
const KETTE = 4;
// die Zug-Zweige: der Kandidat (integ-probe) und die Hälften der Bisektion (zug.cjs teile) — ihr push fährt voll nie
const ZUG_REFS = ["refs/heads/integ-probe", "refs/heads/zug-a", "refs/heads/zug-b"];
const imZug = (ereignis, ref) => ereignis === "push" && ZUG_REFS.includes(ref);
const ZUG_GRUND =
    "der Zug fährt die volle Batterie nie — sie erbt vom grünen Lauf am Zweig-Kopf (zug.cjs bereit), main fährt sie nach der Landung (LANDUNG ≤ 10 MIN)";

// DER INHALT eines Wurzel-Baums: seine Einträge (die Form von /git/trees/<baum>, nicht rekursiv: path · mode · type · sha) ohne den
// Eintrag `cloud-post`, als EIN Abdruck (sha1 der sortierten Zeilen) — ein leerer Baum ist ROT, nie ein Inhalt
const POST = "cloud-post";
function inhaltVon(eintraege) {
    if (!Array.isArray(eintraege) || !eintraege.length)
        throw new Error("ROT: ein Wurzel-Baum ohne Einträge — sein Inhalt ist nicht lesbar");
    const z = eintraege.filter((e) => e.path !== POST).map((e) => `${e.mode} ${e.type} ${e.sha}\t${e.path}`);
    return crypto.createHash("sha1").update(z.sort().join("\n")).digest("hex");
}

// der Kopf und seine leeren Vorfahren, der Kopf zuerst: `commits` trägt je SHA { sha, tree: { sha }, parents: [{ sha }], inhalt }
// (die Form von /git/commits/<sha> samt `inhaltVon` seines Wurzel-Baums); die Kette endet am Merge, am ersten Elter mit anderem
// Inhalt, an KETTE Vorfahren
function kopfKette(sha, commits) {
    const inhalt = (c) => {
        if (!c.inhalt)
            throw new Error(
                `ROT: kopfKette — ${String(c.sha).slice(0, 8)} trägt keinen Inhalt (kopfKetteLesen und kopfKetteLokal bauen ihn)`
            );
        return c.inhalt;
    };
    const kette = [sha];
    for (let c = commits[sha]; c && kette.length <= KETTE;) {
        const e = c.parents.length === 1 ? commits[c.parents[0].sha] : null;
        if (!e || inhalt(e) !== inhalt(c)) break;
        kette.push(e.sha);
        c = e;
    }
    return kette;
}

// → { voll, grund } · { warte: lauf } · { rot: grund }
function kopfUrteil({ ereignis, ref, eigenerLauf, laeufe, jobsJe, gewartet = [] }) {
    const u = { voll: "ja", grund: "kein anderer Lauf trägt die volle Batterie auf diesem Kopf grün" };
    if (IMMER.includes(ereignis)) return { ...u, grund: `Ereignis ${ereignis}: die Batterie läuft immer` };
    if (imZug(ereignis, ref)) return { voll: "nein", grund: ZUG_GRUND };
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
        if (u.voll === "ja" && gruen(jobs, VOLL_JOB))
            Object.assign(u, {
                voll: "nein",
                grund: `der Kopf trägt die volle Batterie grün: Lauf ${r.id} (${r.head_branch}, ${r.event}${r.head_sha ? ", " + String(r.head_sha).slice(0, 8) : ""})`,
            });
    }
    return u;
}

// die Läufe, neueste zuerst, OHNE Filter der API: `nimm` wählt, `seit` endet; eine kurze Seite
// wird bis 3× neu gefragt — sonst ROT, nie leer.
async function alleLaeufe(
    api,
    pfad,
    { nimm = () => true, seit = 0, hoechstens = Infinity, traegt = (rs) => rs.length > 0, pause = 2000 } = {}
) {
    // 30 je Seite: die Läufe-Liste mit 100 je Seite riss bei GitHub wiederholt mit 502 (26.10.: z40 zweimal, bewohner-gesetz einmal)
    const [out, je, neu] = [[], 30, (x) => new Date(x.created_at) >= seit];
    let [gesamt, gelesen] = [0, 0];
    for (let seite = 1; ; seite++) {
        let r;
        for (let v = 1; ; v++) {
            r = await api(`${pfad}?per_page=${je}&page=${seite}`);
            gesamt = Math.max(gesamt, r.total_count);
            if (r.workflow_runs.length >= Math.min(je, gesamt - gelesen) && (seite > 1 || traegt(r.workflow_runs)))
                break;
            if (v === 3)
                throw new Error(
                    `ROT: ${pfad} Seite ${seite} trägt ${r.workflow_runs.length} Läufe von ${gesamt} nach 3 Versuchen`
                );
            await schlaf(pause * v);
        }
        gelesen += r.workflow_runs.length;
        out.push(...r.workflow_runs.filter((x) => nimm(x) && neu(x)));
        if (!r.workflow_runs.every(neu) || out.length >= hoechstens || r.workflow_runs.length < je)
            return out.slice(0, hoechstens);
    }
}

// die EINE Anfrage an die API (Kopf-Richter und ci-zeiten): ein 5xx oder ein Abriss ist ein Wackler, bis 5 Versuche (3, 6, 9, 12 s); sonst ROT
function apiMit(basis, token) {
    const api = async (p, v = 1) => {
        const kopf = { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" } };
        const r = await fetch(basis + p, kopf).catch((e) => (v < 3 ? null : Promise.reject(e)));
        if ((!r || r.status >= 500) && v < 5) return schlaf(3000 * v).then(() => api(p, v + 1));
        if (!r.ok) throw new Error(`${p}: ${r.status} ${await r.text()}`);
        return r.json();
    };
    return api;
}

// die Kette des Kopfs aus der API (der Richter unten, der Einlass der GPU-Probe): je Glied ZWEI Anfragen (der Commit, sein
// Wurzel-Baum), sie endet am ersten Commit, der nicht mehr erbt; ein Fehler der API ist ROT (apiMit wirft), nie eine kürzere Kette
async function kopfKetteLesen(api, sha) {
    const commits = {};
    for (let s = sha; s;) {
        const c = await api(`/git/commits/${s}`);
        const b = await api(`/git/trees/${c.tree.sha}`);
        if (b.truncated) throw new Error(`ROT: der Wurzel-Baum ${c.tree.sha} kam gekürzt (truncated)`);
        commits[s] = { ...c, inhalt: inhaltVon(b.tree) };
        const e = c.parents.length === 1 ? c.parents[0].sha : null;
        s = e && !commits[e] && kopfKette(sha, commits).at(-1) === c.sha ? e : null;
    }
    return commits;
}

// DIESELBE KETTE AUS DEM LOKALEN GIT (der Dienst zug/dienst/ci.sh im Klon des Laptops): je Glied rev-list --parents und der
// Wurzel-Baum per ls-tree -z — dieselbe Form wie kopfKetteLesen, derselbe Inhalt (inhaltVon); ein Fehler von git wirft
function kopfKetteLokal(sha, cwd = process.cwd()) {
    const { execFileSync } = require("child_process");
    const g = (...a) => execFileSync("git", a, { cwd, encoding: "utf8", maxBuffer: 1 << 24 });
    const kopf = g("rev-parse", "--verify", sha + "^{commit}").trim();
    const commits = {};
    for (let s = kopf; s;) {
        const z = g("rev-list", "--parents", "-n", "1", s).trim().split(" ");
        const baum = g("rev-parse", z[0] + "^{tree}").trim();
        const eintraege = g("ls-tree", "-z", baum)
            .split("\0")
            .filter(Boolean)
            .map((l) => {
                const [vor, p] = [l.slice(0, l.indexOf("\t")), l.slice(l.indexOf("\t") + 1)];
                const [mode, type, sha1] = vor.split(" ");
                return { mode, type, sha: sha1, path: p };
            });
        commits[z[0]] = {
            sha: z[0],
            tree: { sha: baum },
            parents: z.slice(1).map((x) => ({ sha: x })),
            inhalt: inhaltVon(eintraege),
        };
        const e = z.length === 2 ? z[1] : null;
        s = e && !commits[e] && kopfKette(kopf, commits).at(-1) === z[0] ? e : null;
    }
    return commits;
}

// DIE GPU-PROBE ERBT WIE DIE BATTERIE (stempel-erbt-probe, 22.11.: je Stempel 10–13 min einer Karte für ein Urteil, das am
// selben Baum schon stand; e3d964c9 gab auf der GTX 1050 nach, sein Elter fdba94e2 trug die Probe 3 von 3 grün): ein Kopf ohne
// Inhalt erbt die Probe vom NÄCHSTEN Glied seiner Kette (die Kette oben: jedes Glied trägt denselben Baum), dessen Ruf JEDE Probe
// des eigenen Rufs nennt (`rufVon`, der EINE Leser der Marke im Einlass) und an dem ein Lauf `completed/success` steht — die
// Vorprüfung ist selbst leer über dem WIP (w28-pop-treue: Abgabe 4042a0c4 → Vorprüfung 7570379a → WIP c7324b75, ein Baum 902a0f92),
// das Ende der Kette trägt keinen Ruf. Jeder andere Fall fährt, beim Namen. → { erbt: { sha, lauf } } · { faehrt: grund }
function probeErbe({ sha, commits, laeufe = [], proben, rufVon }) {
    const kette = kopfKette(sha, commits);
    if (kette.length < 2)
        return { faehrt: `Kopf ${String(sha).slice(0, 8)} trägt Inhalt oder ist ein Merge — er erbt keine Probe` };
    const gruende = [];
    for (const e of kette.slice(1)) {
        const ruf = rufVon(commits[e].message) || [];
        const fehlt = proben.filter((p) => !ruf.includes(p));
        const an = laeufe.filter((l) => l.head_sha === e && l.event === "push");
        const g = an.find((l) => l.status === "completed" && l.conclusion === "success");
        if (!fehlt.length && g) return { erbt: { sha: e, lauf: g.id } };
        gruende.push(
            fehlt.length
                ? `${e.slice(0, 8)} fuhr ${fehlt.join(", ")} nicht (Ruf: ${ruf.join(", ") || "keiner"})`
                : `${e.slice(0, 8)} trägt keinen grünen Lauf (${an.map((l) => `${l.id} ${l.status}/${l.conclusion || "-"}`).join(", ") || "keinen"})`
        );
    }
    return { faehrt: `kein Glied der Kette ohne Inhalt trägt diese Probe grün: ${gruende.join(" · ")}` };
}

// das Urteil aus der API: die Kette, dann die Läufe der Probe seit dem ältesten Glied (höchstens 3 Tage, wie der Richter); die
// erste Seite reicht bis zum eigenen Lauf zurück, sonst ist sie kurz
async function probeErbeLesen(api, { sha, lauf, proben, rufVon, wf = "gpu-probe.yml" }) {
    const commits = await kopfKetteLesen(api, sha);
    const glieder = kopfKette(sha, commits).slice(1);
    const alt = Math.min(...glieder.map((s) => new Date(commits[s].committer.date)));
    const laeufe = glieder.length
        ? await alleLaeufe(api, `/actions/workflows/${wf}/runs`, {
              nimm: (l) => glieder.includes(l.head_sha),
              seit: Math.max(alt - 36e5, Date.now() - 3 * 864e5),
              traegt: (rs) => rs.some((l) => Number(l.id) <= Number(lauf)),
          })
        : [];
    return probeErbe({ sha, commits, laeufe, proben, rufVon });
}

module.exports = { kopfUrteil, kopfKette, KETTE, ZUG_REFS, alleLaeufe, apiMit, kopfKetteLesen, kopfKetteLokal, inhaltVon, POST, probeErbe, probeErbeLesen }; // prettier-ignore

if (require.main === module) {
    const env = process.env;
    const api = apiMit(
        `${env.GITHUB_API_URL || "https://api.github.com"}/repos/${env.GITHUB_REPOSITORY}`,
        env.GH_TOKEN
    );
    const wf =
        String(env.GITHUB_WORKFLOW_REF || "")
            .replace(/^[^/]+\/[^/]+\/\.github\/workflows\//, "")
            .replace(/@.*$/, "") || "check.yml";
    (async () => {
        const [ereignis, ref, gewartet] = [env.GITHUB_EVENT_NAME, env.GITHUB_REF, []];
        // im Zug fragt der Richter nichts: voll=nein (ZUG_REFS)
        const ohneFrage = IMMER.includes(ereignis) || imZug(ereignis, ref);
        // die Kette des Kopfs: je Glied EINE Anfrage, sie endet am ersten Commit, der nicht mehr erbt
        const commits = ohneFrage ? {} : await kopfKetteLesen(api, env.GITHUB_SHA);
        const kette = kopfKette(env.GITHUB_SHA, commits);
        if (kette.length > 1)
            console.log(
                `Kopf ${String(env.GITHUB_SHA).slice(0, 8)}: ohne Inhalt über ${kette
                    .slice(1)
                    .map((s) => s.slice(0, 8))
                    .join(" → ")} — er trägt deren Urteil`
            );
        let u;
        for (let gang = 0; ; gang++) {
            // der eigene Lauf steht immer in der Liste — fehlt er, war die Seite leer
            const traegt = (rs) => rs.some((r) => String(r.id) === String(env.GITHUB_RUN_ID));
            const [nimm, seit] = [(r) => kette.includes(r.head_sha), Date.now() - 3 * 864e5];
            const laeufe = ohneFrage
                ? []
                : await alleLaeufe(api, `/actions/workflows/${wf}/runs`, { nimm, seit, traegt });
            const jobsJe = {};
            for (const r of laeufe)
                if (String(r.id) !== String(env.GITHUB_RUN_ID) && r.conclusion === "success")
                    jobsJe[r.id] = (await api(`/actions/runs/${r.id}/jobs?filter=latest&per_page=100`)).jobs;
            u = kopfUrteil({ ereignis, ref, eigenerLauf: env.GITHUB_RUN_ID, laeufe, jobsJe, gewartet });
            if (!u.warte) break;
            if (gang >= WARTE_S / TAKT_S) {
                u = {
                    voll: "ja",
                    grund: `Lauf ${u.warte.id} läuft nach ${WARTE_S / 60} min noch — die Batterie fährt selbst`,
                };
                break;
            }
            if (!gewartet.includes(u.warte.id)) gewartet.push(u.warte.id);
            console.log(
                `Kopf ${String(env.GITHUB_SHA).slice(0, 8)}: wartet auf Lauf ${u.warte.id} (${u.warte.head_branch}, ${u.warte.status})`
            );
            await schlaf(TAKT_S * 1000);
        }
        if (u.rot) throw new Error(u.rot);
        console.log(`Kopf ${String(env.GITHUB_SHA).slice(0, 8)} (${ereignis} ${ref}): voll=${u.voll} — ${u.grund}`);
        if (env.GITHUB_OUTPUT) fs.appendFileSync(env.GITHUB_OUTPUT, `voll=${u.voll}\n`);
        if (u.voll === "nein") console.log(`::notice title=Ein Urteil je Kopf::${u.grund}`);
    })().catch((e) => {
        console.error(`❌ ci-kopf: ${e.message}`);
        process.exitCode = 1;
    });
}
