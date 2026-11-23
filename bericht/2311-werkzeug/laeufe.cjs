// node laeufe.cjs <zweig|sha> [jobs] — die letzten Läufe eines Zweigs (oder eines Kopfs) mit Versuch und Urteil; mit „jobs“ die roten/laufenden Jobs
const https = require("https"), cp = require("child_process");
const tok = (/^password=(.*)$/m.exec(cp.execFileSync("git", ["credential", "fill"], { input: "protocol=https\nhost=github.com\n\n", encoding: "utf8" })) || [])[1];
const hol = (p) => new Promise((ok) => {
    https.get({ host: "api.github.com", path: p, headers: { "User-Agent": "laeufe", Accept: "application/vnd.github+json", Authorization: "Bearer " + tok } }, (r) => {
        let d = ""; r.on("data", (c) => (d += c)); r.on("end", () => { try { ok(JSON.parse(d)); } catch { ok(null); } });
    }).on("error", () => ok(null));
});
(async () => {
    const a = process.argv[2], mitJobs = process.argv[3] === "jobs";
    const q = /^[0-9a-f]{7,40}$/.test(a) ? `head_sha=${a.length === 40 ? a : cp.execFileSync("git", ["rev-parse", a], { encoding: "utf8" }).trim()}` : `branch=${encodeURIComponent(a)}`;
    const r = await hol(`/repos/MiguellD/AnazhRealm/actions/runs?${q}&per_page=6`);
    for (const w of (r && r.workflow_runs) || []) {
        console.log(`${w.id} ${w.name} ${w.head_sha.slice(0, 8)} v${w.run_attempt} ${w.status} ${w.conclusion || ""} ${w.updated_at.slice(11, 16)}Z`);
        if (!mitJobs) continue;
        const jj = await hol(`/repos/MiguellD/AnazhRealm/actions/runs/${w.id}/jobs?per_page=100`);
        for (const j of (jj && jj.jobs) || []) if (j.conclusion !== "success" && j.conclusion !== "skipped") console.log(`   ${j.name} · ${j.status} ${j.conclusion || ""} · ${j.runner_name || ""}`);
    }
})();
