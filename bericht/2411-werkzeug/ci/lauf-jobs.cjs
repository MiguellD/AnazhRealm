// node lauf-jobs.cjs <lauf-id> — die Jobs EINES Laufs: Name, Zustand, erstellt, Start, Läufer (Token intern über git credential fill, nie gedruckt)
const https = require("https"), cp = require("child_process");
const lauf = process.argv[2];
const tok = (/^password=(.*)$/m.exec(cp.execFileSync("git", ["credential", "fill"], { input: "protocol=https\nhost=github.com\n\n", encoding: "utf8" })) || [])[1];
const hol = (p) =>
    new Promise((ok, nein) =>
        https
            .get({ host: "api.github.com", path: "/repos/MiguellD/AnazhRealm" + p, headers: { "User-Agent": "ci-blick", Authorization: "Bearer " + tok, Accept: "application/vnd.github+json" } }, (a) => {
                let b = "";
                a.on("data", (d) => (b += d)).on("end", () => ok(JSON.parse(b)));
            })
            .on("error", nein)
    );
(async () => {
    const r = await hol("/actions/runs/" + lauf);
    const t = (x) => (x ? new Date(x).toTimeString().slice(0, 8) : "-");
    console.log(`Lauf ${lauf} · ${r.head_branch} ${String(r.head_sha).slice(0, 8)} · ${r.status}/${r.conclusion || "-"} · Versuch ${r.run_attempt} · erstellt ${t(r.created_at)} · Start ${t(r.run_started_at)}`);
    const j = await hol("/actions/runs/" + lauf + "/jobs?filter=latest&per_page=100");
    for (const x of j.jobs || []) console.log(`  ${x.id} ${x.name} · ${x.status}/${x.conclusion || "-"} · erstellt ${t(x.created_at)} · Start ${t(x.started_at)} · Läufer ${x.runner_name || "-"}`);
})().catch((e) => console.log("FEHLER", e.message));
