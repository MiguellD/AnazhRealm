// node jobs.cjs <sha40> [name-teil] — alle Jobs der Läufe am Kopf mit Id, Urteil und Dauer (auch die grünen: der Vergleich
// rot ↔ grün braucht das Log des grünen Jobs). Der Schlüssel bleibt im Prozess.
const https = require("https"), cp = require("child_process");
const [sha, teil] = process.argv.slice(2);
const tok = (/^password=(.*)$/m.exec(cp.execFileSync("git", ["credential", "fill"], { input: "protocol=https\nhost=github.com\n\n", encoding: "utf8" })) || [])[1];
function hol(p) {
  return new Promise((ok, nein) => {
    https.get({ host: "api.github.com", path: p, headers: { "User-Agent": "ci-blick", Authorization: "Bearer " + tok, Accept: "application/vnd.github+json" } }, (r) => {
      let b = ""; r.on("data", (d) => (b += d)); r.on("end", () => { try { ok(JSON.parse(b)); } catch (e) { nein(new Error("HTTP " + r.statusCode)); } });
    }).on("error", nein);
  });
}
(async () => {
  const R = "/repos/MiguellD/AnazhRealm/actions";
  const l = await hol(R + "/runs?head_sha=" + sha + "&per_page=30");
  for (const run of l.workflow_runs || []) {
    const j = await hol(R + "/runs/" + run.id + "/jobs?per_page=100&filter=latest");
    for (const x of j.jobs || []) {
      if (teil && !x.name.includes(teil)) continue;
      const s = x.started_at && x.completed_at ? Math.round((new Date(x.completed_at) - new Date(x.started_at)) / 1000) : -1;
      console.log(run.id + " " + run.name + " · " + x.id + " " + x.name + " [" + (x.conclusion || x.status) + "] " + s + " s @" + (x.runner_name || "-"));
    }
  }
})().catch((e) => { console.log("FEHLER " + e.message); process.exit(1); });
