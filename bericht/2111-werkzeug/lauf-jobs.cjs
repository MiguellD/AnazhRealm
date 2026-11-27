// node lauf-jobs.cjs <run-id> — die Jobs EINES Laufs: id · Name · Urteil · Läufer (Token intern über git credential fill, nie gedruckt)
const https = require("https"), cp = require("child_process");
const tok = (/^password=(.*)$/m.exec(cp.execFileSync("git", ["credential", "fill"], { input: "protocol=https\nhost=github.com\n\n", encoding: "utf8" })) || [])[1];
https.get({ host: "api.github.com", path: `/repos/MiguellD/AnazhRealm/actions/runs/${process.argv[2]}/jobs?per_page=100`, headers: { "User-Agent": "ci-werkzeug", Accept: "application/vnd.github+json", ...(tok ? { Authorization: "Bearer " + tok } : {}) } }, (r) => {
    let s = ""; r.on("data", (d) => (s += d)); r.on("end", () => { const j = JSON.parse(s); for (const x of j.jobs || []) console.log(x.id, "·", x.name, "·", x.conclusion || x.status, "·", x.runner_name || "-"); if (!j.jobs) console.log(s.slice(0, 200)); });
});
