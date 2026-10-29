// ci-kopf.cjs — EIN URTEIL JE KOPF: die volle Batterie und die Echt-Gruppe richten jeden Kopf (SHA) einmal.
// Trug ein anderer Lauf, der den Kopf selbst prüfte (push · schedule · workflow_dispatch), die volle Batterie grün: `voll=nein`,
// die Echt-Gruppe grün: `echt=nein`. Läuft ein ÄLTERER noch, wartet der Richter (je 30 s, höchstens 30 min): grün steht, rot
// ist ROT, abgebrochen fährt selbst; ein jüngerer wartet nie auf ihn zurück. Auf Abruf und auf einem PR läuft alles, ein Fehler
// der API ist ROT. Auf einem Zweig-Push wählt DIE AUSWAHL NACH KONSUM die Gruppen (`waehle`: die Spur des Konsum-Zeugen am
// Grund, die Wechsel bis zum Kopf); integ-probe, main, nachts, auf Abruf und am PR fahren alle Gruppen der Tafel VOLL_GRUPPEN.
// gate:ci-deckung (V) KOPF und (Z) halten die Form, seine Selbsttests die Fälle.
//   node scripts/ci-kopf.cjs        (im Job `kopf`: GITHUB_* aus der Umgebung, GH_TOKEN) → `voll=`, `echt=` und `matrix=` nach $GITHUB_OUTPUT
"use strict";
const fs = require("fs");
const path = require("path");

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
            await new Promise((ok) => setTimeout(ok, pause * v));
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
        if ((!r || r.status >= 500) && v < 5)
            return new Promise((ok) => setTimeout(ok, 3000 * v)).then(() => api(p, v + 1));
        if (!r.ok) throw new Error(`${p}: ${r.status} ${await r.text()}`);
        return r.json();
    };
    return api;
}

// DIE AUSWAHL NACH KONSUM (Spike „Die CI wählt nach Konsum"): ein Schritt am Kopf fährt, wenn er am Grund (dem jüngsten Ahn-Lauf
// mit der ganzen Batterie und ihrer Spur, konsum.json je Gruppe) nicht grün lief, seine Form wechselte, seine Spur fehlt oder blind
// ist (scripts/lib/konsum-zeuge.cjs `blindVon`, .git gelesen), oder zwischen Grund und Kopf eine Datei wechselte, die er oder die
// Vorbereitung las oder befragte, ein Eintrag kam oder ging, wo er listete oder ein Verzeichnis befragte, das kam oder ging, oder
// eine Zeile von package.json, die sein npm las (`teil`). Eine Gruppe fährt, wenn einer ihrer Schritte fährt.
function betroffen(s, wechsel, teile, verz) {
    for (const w of wechsel) {
        if (w.datei === "package.json" && !s.lies.has(w.datei) && !s.frage.has(w.datei)) {
            const t = teile.find(
                (x) => s.teil.has(`package.json#${x}`) || (!/^scripts\./.test(x) && s.teil.has("package.json#~scripts"))
            );
            if (t) return `package.json#${t}`;
            continue;
        }
        if (s.lies.has(w.datei) || s.frage.has(w.datei)) return w.datei;
        if (w.art !== "M")
            for (let d = path.posix.dirname(w.datei); ; d = path.posix.dirname(d)) {
                if (s.liste.has(d)) return `${d}/ (${w.art} ${w.datei})`;
                if (d === "." || verz[0].has(d) === verz[1].has(d)) break;
                if (s.frage.has(d) || s.lies.has(d)) return `${d} (${w.art} ${w.datei})`;
            }
    }
    return null;
}
// schritte am Kopf [{ name, run, form, gruppe }] · grund: Map name → { form, gruen } · spuren: Wurzel → Spur (Arten als Listen)
// · wechsel [{ datei, art }] · teile: die geänderten Zeilen von package.json · baum: Set der Dateien · verz: [Verzeichnisse am
// Grund, am Kopf] → { gruppen, je: [{ name, gruppe, warum }] } (warum null: das Urteil des Grunds steht)
function auswahl({ schritte, grund, spuren, wechsel, teile, baum, verz }) {
    const { blindVon, befehleIn } = require("./lib/konsum-zeuge.cjs");
    const menge = (ws) =>
        Object.fromEntries(
            ["lies", "liste", "frage", "teil", "ruft"].map((a) => [a, new Set(ws.flatMap((w) => w[a]))])
        );
    const alle = new Set(schritte.flatMap((k) => befehleIn(k.run)));
    const vor = betroffen(
        menge(
            Object.keys(spuren)
                .filter((w) => !alle.has(w))
                .map((w) => spuren[w])
        ),
        wechsel,
        teile,
        verz
    );
    const je = schritte.map((k) => {
        const g = grund.get(k.name);
        const ws = befehleIn(k.run)
            .filter((b) => spuren[b])
            .map((b) => spuren[b]);
        const s = menge(ws);
        const blind = [...befehleIn(k.run), ...s.ruft].map((b) => blindVon(b, baum)).find(Boolean);
        const warum = !g
            ? "am Grund nie gelaufen"
            : g.form !== k.form
              ? "die Form wechselte"
              : !g.gruen
                ? "am Grund nicht grün"
                : !ws.length
                  ? "ohne Spur"
                  : blind || [...s.lies, ...s.frage, ...s.liste].includes(".git")
                    ? `blind: ${blind || ".git"}`
                    : vor
                      ? `Vorbereitung: ${vor}`
                      : betroffen(s, wechsel, teile, verz);
        return { name: k.name, gruppe: k.gruppe, warum };
    });
    return { gruppen: [...new Set(je.filter((x) => x.warum).map((x) => x.gruppe))].sort((a, b) => a - b), je };
}

// DIE GRUPPEN DER VOLLEN BATTERIE: die Tafel VOLL_GRUPPEN der Workflow-env („1:cpu 2:cpu … 18:gpu", node scripts/ci-zeiten.cjs
// schreibt sie) — der Kopf-Richter reicht sie ganz oder gewählt als Matrix an voll, gate:ci-deckung wiegt sie
const planAus = (tafel) =>
    String(tafel || "")
        .split(/\s+/)
        .filter(Boolean)
        .map((x) => ({ gruppe: Number(x.split(":")[0]), klasse: x.split(":")[1] }));
// die voll-Schritte eines check.yml-Texts (Form: Name · run · env · shell · Klasse) und ihr Rahmen (der Job ohne Gruppen-Schritte)
function vollSchritte(text) {
    const doc = require("js-yaml").load(text);
    const V = doc.jobs.voll;
    const klasse = new Map(planAus((doc.env || {}).VOLL_GRUPPEN).map((e) => [e.gruppe, e.klasse]));
    const schritte = [];
    for (const s of V.steps) {
        const m = /^\s*matrix\.gruppe\s*==\s*(\d+)\s*$/.exec(s.if || "");
        if (!m || !s.run) continue;
        const [name, run, gruppe] = [String(s.name || "").replace(/\s+/g, " "), s.run.trim(), Number(m[1])];
        schritte.push({ name, run, gruppe, form: JSON.stringify([name, run, s.env, s.shell, klasse.get(gruppe)]) });
    }
    const rahmen = JSON.stringify({
        ...V,
        strategy: null,
        steps: V.steps.filter((s) => !/matrix\.gruppe/.test(s.if || "")),
    });
    return { schritte, rahmen };
}
// die gewechselten Zeilen von package.json: Schlüssel oben, je Skript `scripts.<name>`
function teileVon(alt, neu) {
    const [p, q] = [JSON.parse(alt), JSON.parse(neu)];
    const zeilen = (o) => ({
        ...o,
        scripts: undefined,
        ...Object.fromEntries(Object.entries(o.scripts || {}).map(([k, v]) => [`scripts.${k}`, v])),
    });
    const [a, b] = [zeilen(p), zeilen(q)];
    return [...new Set([...Object.keys(a), ...Object.keys(b)])].filter(
        (k) => JSON.stringify(a[k]) !== JSON.stringify(b[k])
    );
}
// DER GRUND eines Zweig-Kopfs: der jüngste fertige Lauf eines Ahns (push · schedule · workflow_dispatch), an dem jede voll-Gruppe ein
// Urteil trug und ihre Spur hinterließ (Artefakt konsum-voll-N), höchstens 12 Ahnen weit; dann die Auswahl gegen ihn — ohne Grund
// oder mit gewechseltem Rahmen fährt alles
async function waehle({ api, wf, kopf, git, lade }) {
    const laeufe = await alleLaeufe(api, `/actions/workflows/${wf}/runs`, {
        nimm: (r) => BEWEIS.includes(r.event) && r.status === "completed",
        seit: Date.now() - 3 * 864e5,
        hoechstens: 60,
    });
    let [n, G] = [0, null];
    for (const r of laeufe) {
        if (n >= 12 || G) break;
        if (git(["merge-base", "--is-ancestor", r.head_sha, kopf]) === null) continue;
        n++;
        const jobs = (await api(`/actions/runs/${r.id}/jobs?filter=latest&per_page=100`)).jobs.filter((j) =>
            VOLL_JOB.test(j.name)
        );
        if (!jobs.length || jobs.some((j) => j.conclusion !== "success" && j.conclusion !== "failure")) continue;
        const arts = (await api(`/actions/runs/${r.id}/artifacts?per_page=100`)).artifacts;
        const zu = jobs.map((j) =>
            arts.find((a) => a.name === `konsum-voll-${/^voll (\d+)/.exec(j.name)[1]}` && !a.expired)
        );
        if (zu.some((a) => !a)) continue;
        const spuren = {};
        for (const a of zu)
            for (const [w, s] of Object.entries(JSON.parse(await lade(a.archive_download_url)).schritte))
                spuren[w] = Object.fromEntries(
                    Object.entries(s).map(([k, v]) => [
                        k,
                        Array.isArray(v) ? [...new Set([...((spuren[w] || {})[k] || []), ...v])] : v,
                    ])
                );
        // jeder Job listet alle Schritte, fremde als skipped: es zählt nur der Schritt mit Urteil
        const geurteilt = jobs.flatMap((j) =>
            j.steps.filter((s) => s.conclusion === "success" || s.conclusion === "failure")
        );
        const gruen = new Map(geurteilt.map((s) => [s.name.replace(/\s+/g, " "), s.conclusion === "success"]));
        G = { lauf: r, spuren, gruen };
    }
    if (!G) return { gruppen: null, grund: `kein Ahn trägt die ganze Batterie mit Spur (${n} geprüft)` };
    const g = G.lauf.head_sha;
    const [vG, vK] = [g, kopf].map((rev) => vollSchritte(git(["show", `${rev}:.github/workflows/check.yml`])));
    if (vG.rahmen !== vK.rahmen)
        return { gruppen: null, grund: `der Rahmen von voll wechselte seit Lauf ${G.lauf.id}` };
    const wechsel = git(["-c", "core.quotePath=false", "diff", "--name-status", "--no-renames", g, kopf])
        .split("\n")
        .filter(Boolean)
        .map((z) => ({ art: z[0], datei: z.split("\t")[1] }));
    const teile = wechsel.some((w) => w.datei === "package.json")
        ? teileVon(...[g, kopf].map((rev) => git(["show", `${rev}:package.json`])))
        : [];
    const [bG, bK] = [g, kopf].map(
        (rev) => new Set(git(["ls-tree", "-r", "--name-only", rev]).split("\n").filter(Boolean))
    );
    const verz = [bG, bK].map(
        (b) =>
            new Set([
                ".",
                ...[...b].flatMap((f) =>
                    f
                        .split("/")
                        .slice(0, -1)
                        .map((_, i, t) => t.slice(0, i + 1).join("/"))
                ),
            ])
    );
    const grund = new Map(vG.schritte.map((k) => [k.name, { form: k.form, gruen: G.gruen.get(k.name) === true }]));
    const a = auswahl({ schritte: vK.schritte, grund, spuren: G.spuren, wechsel, teile, baum: bK, verz });
    return {
        ...a,
        grund: `gegen Lauf ${G.lauf.id} (${G.lauf.head_branch} ${g.slice(0, 8)}): ${wechsel.length} Dateien gewechselt`,
    };
}

module.exports = { kopfUrteil, alleLaeufe, apiMit, auswahl, planAus, vollSchritte, teileVon, waehle };

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
        const [ereignis, gewartet] = [env.GITHUB_EVENT_NAME, []];
        let u;
        for (let gang = 0; ; gang++) {
            // der eigene Lauf steht immer in der Liste — fehlt er, war die Seite leer
            const traegt = (rs) => rs.some((r) => String(r.id) === String(env.GITHUB_RUN_ID));
            const [nimm, seit] = [(r) => r.head_sha === env.GITHUB_SHA, Date.now() - 3 * 864e5];
            const laeufe = IMMER.includes(ereignis)
                ? []
                : await alleLaeufe(api, `/actions/workflows/${wf}/runs`, { nimm, seit, traegt });
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
        // auf einem Zweig-Push wählt die Auswahl nach Konsum die Gruppen; integ-probe, main, nachts, Abruf und PR fahren alles
        let plan = planAus(env.VOLL_GRUPPEN);
        if (!plan.length) throw new Error("ROT: die Workflow-env trägt keine Tafel VOLL_GRUPPEN");
        if (u.voll === "ja" && ereignis === "push" && !["integ-probe", "main"].includes(env.GITHUB_REF_NAME)) {
            const { execFileSync } = require("child_process");
            const git = (a) => {
                try {
                    return execFileSync("git", a, {
                        encoding: "utf8",
                        maxBuffer: 1 << 28,
                        stdio: ["ignore", "pipe", "ignore"],
                    });
                } catch {
                    return null;
                }
            };
            // ein Artefakt: das Zip über die API (die Weiterleitung trägt keinen Schlüssel), die Spur aus ihm
            const lade = async (url) => {
                const r = await fetch(url, { headers: { Authorization: `Bearer ${env.GH_TOKEN}` } });
                if (!r.ok) throw new Error(`${url}: ${r.status}`);
                const zip = path.join(env.RUNNER_TEMP || require("os").tmpdir(), `konsum-${Date.now()}.zip`);
                fs.writeFileSync(zip, Buffer.from(await r.arrayBuffer()));
                return execFileSync("unzip", ["-p", zip, "konsum.json"], { encoding: "utf8", maxBuffer: 1 << 28 });
            };
            const w = await waehle({ api, wf, kopf: env.GITHUB_SHA, git, lade });
            for (const x of (w.je || []).filter((x) => x.warum))
                console.log(`  fährt: voll ${x.gruppe} „${x.name}" — ${x.warum}`);
            if (w.gruppen) plan = plan.filter((e) => w.gruppen.includes(e.gruppe));
            u.grund = `Auswahl nach Konsum ${w.gruppen ? `${plan.length} von ${planAus(env.VOLL_GRUPPEN).length} Gruppen` : "alle Gruppen"} — ${w.grund}`;
            if (!plan.length) [u.voll, plan] = ["nein", planAus(env.VOLL_GRUPPEN)];
        }
        console.log(
            `Kopf ${String(env.GITHUB_SHA).slice(0, 8)} (${ereignis}): voll=${u.voll} echt=${u.echt} — ${u.grund}`
        );
        const matrix = JSON.stringify({ include: plan });
        if (env.GITHUB_OUTPUT)
            fs.appendFileSync(env.GITHUB_OUTPUT, `voll=${u.voll}\necht=${u.echt}\nmatrix=${matrix}\n`);
        console.log(`::notice title=Ein Urteil je Kopf::${u.grund}`);
    })().catch((e) => {
        console.error(`❌ ci-kopf: ${e.message}`);
        process.exitCode = 1;
    });
}
