// node ci-rot.cjs <sha40> — EIN Blick: Läufe am Kopf, rote Jobs mit rotem Schritt und Läufer. Der Schlüssel bleibt im Prozess.
const https = require("https"), cp = require("child_process");
const sha = process.argv[2];
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
    const jobs = j.jobs || [];
    const z = (c) => jobs.filter(c).length;
    console.log(run.id + " " + run.name + " " + run.status + "/" + (run.conclusion || "-") + " Versuch " + run.run_attempt + " · Jobs " + jobs.length + " · grün " + z((x) => x.conclusion === "success") + " · rot " + z((x) => x.conclusion === "failure" || x.conclusion === "cancelled" || x.conclusion === "timed_out") + " · läuft " + z((x) => x.status !== "completed"));
    for (const x of jobs) {
      if (x.status !== "completed") console.log("   LÄUFT/WARTET " + x.name + " (" + x.status + ") seit " + (x.started_at || "-") + " @" + (x.runner_name || "-"));
      else if (x.conclusion !== "success" && x.conclusion !== "skipped") console.log("   ROT " + x.id + " " + x.name + " [" + x.conclusion + "] @" + (x.runner_name || "-") + " · Schritt: " + ((x.steps || []).filter((s) => s.conclusion === "failure" || s.conclusion === "cancelled").map((s) => s.name).join(" | ") || "keiner"));
    }
  }
  console.log(new Date().toTimeString().slice(0, 5));
})().catch((e) => { console.log("FEHLER " + e.message); process.exit(1); });
