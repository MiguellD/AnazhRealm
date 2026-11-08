// ci-zeiten.cjs — DIE ZEITEN DER CI: je Schritt von check.yml sein Gewicht aus den letzten 7 Läufen auf integ-probe, deren Kopf
// auf main gelandet ist (derselbe run-Text, je Job-Art; jeder Versuch, grün und rot) — im Puls der Median, in der vollen Stufe der p90 (der langsame Läufer, den
// ihr Deckel hält) → spec/ci/ci-zeiten.json (die Waage von gate:ci-deckung); ohne Messung ROT, die Tafel bleibt. Er nimmt aus dem
// Puls, was eine Gruppe über ihren Deckel trägt, verteilt die Voll-Gruppen je Klasse und je echt-Schritt die Frist
// timeout-minutes = max(5, ⌈3 × p90⌉, ⌈1,2 × größter Lauf⌉).
//   node scripts/ci-zeiten.cjs                          misst und verteilt
"use strict";
const { execSync, spawnSync } = require("child_process");
const yaml = require("js-yaml");
const { klasseDesLaufs, LAEUFER_PLAETZE, PULS_S, ueber } = require("./lib/ci-klasse.cjs");
const { alleLaeufe, apiMit } = require("./ci-kopf.cjs");
const { hauptLauf, ausDatei, path, fs, jsonLesen, ROOT: root } = require("./lib/welt-boot.cjs");

const API = "https://api.github.com/repos/MiguellD/AnazhRealm";
const WORKFLOW = ".github/workflows/check.yml";
const AUS = "spec/ci/ci-zeiten.json";
const [JE_SCHRITT, HOECHSTENS] = [7, 40]; // Messungen je Schritt; Läufe höchstens
const VORBEREITUNG =
    /^(Set up job|Run actions\/checkout@|Run actions\/setup-node@|Run actions\/cache@|Cache-Schlüssel|System-Libs|Dependencies installieren|Urteil der Gruppe|Post Run |Complete job)/;
// die Jobs und ihre Art („voll 16/18 gpu" → voll, „echt (…)" → echt)
const GRUPPE = /^(puls|voll|kopf|echt)\b/;

const sek = (a, b) => (a && b ? (new Date(b) - new Date(a)) / 1000 : null);
const sortiert = (a) => [...a].sort(aufsteigend);
const median = (a) =>
    sortiert(a).reduce((m, x, i, s) => (i === s.length >> 1 ? (s.length % 2 ? x : (s[i - 1] + x) / 2) : m), 0);
const p90 = (a) => sortiert(a)[Math.ceil(0.9 * a.length) - 1];
const lauf = (s) =>
    String(s.run || "")
        .trim()
        .replace(/\s+/g, " ");
// gelandet: der Kopf des Laufs steht in der Geschichte von origin/main (der angenommene Code). Ein Zug mit einem Täter-Zweig landet
// nie — seine Zeiten wiegen nie (z184–z188: w6-weiches trug die Kreatur-Linse Teil 1 214 → 723 s, der p90 hob jede voll-Frist)
const gelandetAmMain = (sha) => spawnSync("git", ["merge-base", "--is-ancestor", sha, "origin/main"], { cwd: root }).status === 0;
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
// der Täter des Abbruchs; auch ein gelandeter Kopf trägt ihn, im Versuch vor dem grünen Wiederholungs-Versuch). Nur grün und nur der letzte Versuch gezählt, wog die Kamera-Leib-Linse 58 s, während sie auf G18 318–919 s
// lief und sieben Läufe am Deckel brach (der langsame Läufer brach ab, der schnelle Wiederholungs-Versuch wurde gezählt).
async function messe(api, jetzt, alt = {}, pause = 2000, gelandet = gelandetAmMain) {
    const soll = schritteAus(jetzt);
    const nimm = (r) => r.head_branch === "integ-probe" && r.status === "completed" && gelandet(r.head_sha);
    const neueste = await alleLaeufe(api, "/actions/workflows/check.yml/runs", { nimm, seit: Date.now() - 14 * 864e5, hoechstens: HOECHSTENS, pause });
    const proben = new Map([...soll.keys()].map((n) => [n, []]));
    const [vorb, ymlAm, gesehen] = [{ echt: [], sonst: [] }, new Map(), new Set()];
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
            const echt = g[1] === "echt";
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
                ...(x.echt ? { p90: Math.round(p90(p)), max: Math.round(Math.max(...p)) } : {}),
            };
        else if (alt.schritte?.[n]?.geschaetzt) schritte[n] = alt.schritte[n];
        else ohne.push(n);
    }
    if (!gemessen || !Object.keys(schritte).length)
        throw new Error(
            `ROT: die API lieferte ${neueste.length} Läufe, ${gemessen} Messungen, ${Object.keys(schritte).length} Schritte — ${AUS} bleibt, wie sie ist`
        );
    const out = {
        quelle: "GitHub-API (s): je Schritt aus den letzten je_schritt Läufen mit Urteil auf integ-probe, deren Kopf auf main landete, im Puls der Median, voll der p90, echt mit p90 und max — scripts/ci-zeiten.cjs, gelesen von gate:ci-deckung",
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
    const skripte = jsonLesen("package.json").scripts || {};
    const { schritte } = out;
    const z = (s) => schritte[s.name]?.s || 0;
    // DER PULS HÄLT SEINEN DECKEL SELBST (z212: die Mensch-Anatomie stieg mit w7-gesicht — jeder Haar-Stil an beiden Rändern
    // des Genoms ganz gegossen — von 21 auf 80 s Median, „puls 2/2" trug 2,6 min gegen den Deckel 2,0): trägt eine Puls-Gruppe
    // mit Mitfahrern samt Vorbereitung mehr als PULS_S (dieselbe Waage wie gate:ci-deckung (T)), wandert ihr schwerster
    // Schritt in die volle Stufe — dieselbe Messung, nur ihr Platz —, bis die Gruppe den Deckel hält; ein Schritt allein
    // bleibt (er ist der Puls). Der Schritt (sein `- name:` und die Zeilen tiefer) zieht hinter den letzten Gruppen-Schritt
    // von voll, die Verteilung unten gibt ihm seine Gruppe.
    const Z = ausDatei(path.join(root, WORKFLOW)).split("\n");
    const ende = (a) => {
        while (/^( {13,}\S|\s*$)/.test(Z[++a]));
        return a;
    };
    for (const g of jetzt.jobs.puls.strategy.matrix.gruppe) {
        const rest = jetzt.jobs.puls.steps.filter((s) => String(s.if).endsWith("== " + g)).sort((a, b) => z(b) - z(a));
        while (rest.length > 1 && ueber(rest.reduce((a, s) => a + z(s), out.vorbereitung_s), PULS_S)) {
            const n = rest.shift().name;
            const a = Z.indexOf("            - name: " + n);
            if (a < 0) throw new Error("keine Zeile im Puls: " + n);
            const teil = Z.splice(a, ende(a) - a);
            Z.splice(ende(Z.findLastIndex((x) => /matrix\.gruppe == \d+$/.test(x))), 0, ...teil);
            console.log(`  puls ${g} → voll: „${n}"`);
        }
    }
    let yml = Z.join("\n");
    jetzt = yaml.load(yml);
    const alle = jetzt.jobs.voll.steps.filter((s) => s.name && s.run && schritte[s.name] && !VORBEREITUNG.test(s.name));
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
            const zuege = zug ? [[h, zug.a, -1], [zug.l, zug.a, 1], ...(zug.b ? [[zug.l, zug.b, -1], [h, zug.b, 1]] : [])] : []; // prettier-ignore
            for (const [g, s, vz] of zuege) lege(g, s, vz);
        }
        return last;
    };
    // ein bedingter Schritt läuft als CPU (die Weiche urteilt zur Laufzeit)
    const gpu = (s) => klasseDesLaufs(s.run, skripte).klasse === "gpu";
    const frei = LAEUFER_PLAETZE - jetzt.jobs.puls.strategy.matrix.gruppe.length;
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
    const nr = new Map(best.g.flatMap((g, i) => g.n.map((s) => [s, i + 1])));
    const neu = jetzt.jobs.voll.steps
        .filter((s) => /matrix\.gruppe == \d+$/.test(String(s.if)))
        .map((s) => nr.get(s));
    const block = (job) => {
        const von = yml.indexOf(`\n    ${job}:\n`);
        return [von, von + 1 + yml.slice(von + 1).search(/\n {4}[\w-]+:\n|$/)];
    };
    let [von, bis] = block("voll");
    let zeile = 0;
    // die Frist der voll-Gruppen: 1,2 × die schwerste Gruppe im Plan ((T) FRIST) — aus der gelandeten Tafel, nie von Hand
    const vollFrist = Math.ceil((1.2 * Math.max(...best.g.map((g) => g.s))) / 60);
    const voll = yml
        .slice(von, bis)
        .replace(/(name: voll \$\{\{ matrix\.gruppe \}\}\/)\d+/, (m, x) => x + best.g.length)
        .replace(/^( {8}timeout-minutes: )\d+$/m, (m, x) => x + vollFrist)
        .replace(/^( +gruppe: )\[[\d, ]*\]/m, (m, x) => `${x}[${best.g.map((g, k) => k + 1).join(", ")}]`)
        .replace(/^( +)- gruppe: \d+\n(?: +klasse: \w+\n| +- gruppe: \d+\n)*/m, (m, x) =>
            best.g.map((g, k) => `${x}- gruppe: ${k + 1}\n${x}  klasse: ${g.klasse}\n`).join("")
        )
        // die Gruppen-Zeile samt WEITER (die Bedingung bleibt, die Nummer wandert)
        .replace(/^( +if: .*matrix\.gruppe == )(\d+)$/gm, (m, x, alt) => x + (neu[zeile++] || alt));
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
        `${WORKFLOW}: ${nr.size} Schritte in ${best.g.length} Voll-Gruppen, die schwerste mit Mitfahrern ${(best.max / 60).toFixed(1)} min, Frist ${vollFrist} min · ${fristen} echt-Fristen — es wiegt npm run gate:ci-deckung`
    );
}

module.exports = { messe };

if (require.main === module) {
    const token =
        process.env.GITHUB_TOKEN ||
        execSync("git credential fill", { input: "protocol=https\nhost=github.com\n\n" })
            .toString()
            .match(/^password=(.*)$/m)[1];
    hauptLauf(async () => {
        const jetzt = yaml.load(ausDatei(path.join(root, WORKFLOW)));
        const alt = fs.existsSync(path.join(root, AUS))
            ? jsonLesen(path.join(root, AUS))
            : {};
        // die Geschichte von main frisch: ein eben gelandeter Kopf zählt
        execSync('git fetch --quiet origin "+refs/heads/main:refs/remotes/origin/main"', { cwd: root, stdio: "pipe" });
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
