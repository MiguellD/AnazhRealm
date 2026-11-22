// node versuch-jobs.cjs <run-id> <versuch> — die Jobs EINES Versuchs eines Laufs: Schluss je Job, roter Schritt, Läufer.
// Der Schlüssel bleibt im Prozess.
const https = require("https"), cp = require("child_process");
const run = process.argv[2], versuch = process.argv[3] || "1";
const tok = (/^password=(.*)$/m.exec(cp.execFileSync("git", ["credential", "fill"], { input: "protocol=https\nhost=github.com\n\n", encoding: "utf8" })) || [])[1];
function hol(p) {
    return new Promise((ok, nein) => {
        https.get({ host: "api.github.com", path: p, headers: { "User-Agent": "ci-blick", Authorization: "Bearer " + tok, Accept: "application/vnd.github+json" } }, (r) => {
            let b = ""; r.on("data", (d) => (b += d)); r.on("end", () => { try { ok(JSON.parse(b)); } catch (e) { nein(new Error("HTTP " + r.statusCode)); } });
        }).on("error", nein);
    });
}
(async () => {
    const j = await hol(`/repos/MiguellD/AnazhRealm/actions/runs/${run}/attempts/${versuch}/jobs?per_page=100`);
    const jobs = j.jobs || [];
    const zahl = (c) => jobs.filter((x) => x.conclusion === c).length;
    console.log(`Lauf ${run} Versuch ${versuch} · Jobs ${jobs.length} · grün ${zahl("success")} · rot ${zahl("failure")} · abgebrochen ${zahl("cancelled")} · übersprungen ${zahl("skipped")}`);
    for (const x of jobs) {
        if (x.conclusion === "success" || x.conclusion === "skipped") continue;
        const s = (x.steps || []).find((y) => y.conclusion === "failure");
        console.log(`   ${String(x.conclusion || x.status).toUpperCase()} ${x.id} ${x.name} @${x.runner_name || "-"} · ${x.started_at} → ${x.completed_at || "-"}${s ? " · Schritt: " + s.name : ""}`);
    }
})().catch((e) => { console.error("FEHLER " + e.message); process.exit(1); });
