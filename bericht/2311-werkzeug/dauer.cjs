// node dauer.cjs <run-id> [...] — je Job: Warten (created→started), Laufen (started→completed), Läufer; dazu die Wand des Laufs
const https = require("https"), cp = require("child_process");
const tok = (/^password=(.*)$/m.exec(cp.execFileSync("git", ["credential", "fill"], { input: "protocol=https\nhost=github.com\n\n", encoding: "utf8" })) || [])[1];
const hol = (p) => new Promise((ok) => {
    https.get({ host: "api.github.com", path: p, headers: { "User-Agent": "dauer", Accept: "application/vnd.github+json", Authorization: "Bearer " + tok } }, (r) => {
        let d = ""; r.on("data", (c) => (d += c)); r.on("end", () => { try { ok(JSON.parse(d)); } catch { ok(null); } });
    }).on("error", () => ok(null));
});
const m = (a, b) => (a && b ? ((Date.parse(b) - Date.parse(a)) / 60e3).toFixed(1) : "—");
(async () => {
    for (const id of process.argv.slice(2)) {
        const r = await hol(`/repos/MiguellD/AnazhRealm/actions/runs/${id}`);
        console.log(`== ${id} ${r.name} ${r.head_branch} v${r.run_attempt} ${r.conclusion} · Wand ${m(r.run_started_at || r.created_at, r.updated_at)} min`);
        const jj = await hol(`/repos/MiguellD/AnazhRealm/actions/runs/${id}/jobs?per_page=100${r.run_attempt > 1 ? "&filter=all" : ""}`);
        const jobs = ((jj && jj.jobs) || []).sort((a, b) => Date.parse(a.started_at) - Date.parse(b.started_at));
        for (const j of jobs) console.log(`  ${j.name.padEnd(34).slice(0, 34)} warten ${m(j.created_at, j.started_at).padStart(5)} · laufen ${m(j.started_at, j.completed_at).padStart(5)} · ab ${m(r.run_started_at || r.created_at, j.started_at).padStart(5)} · ${j.conclusion || j.status} · ${j.runner_name || ""}`);
    }
})();
