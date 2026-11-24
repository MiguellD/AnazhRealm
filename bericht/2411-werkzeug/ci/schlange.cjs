// node schlange.cjs — EIN Blick auf die GitHub-Schlange: je aktivem Lauf Zweig, Kopf, Jobs läuft/wartet/durch, Alter. Der Schlüssel bleibt im Prozess.
const https = require("https"), cp = require("child_process");
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
  const runs = [];
  for (const st of ["in_progress", "queued"]) runs.push(...((await hol(R + "/runs?status=" + st + "&per_page=50")).workflow_runs || []));
  const gesehen = new Set();
  let lauft = 0, wartet = 0;
  const zeilen = [];
  for (const run of runs.sort((a, b) => a.created_at.localeCompare(b.created_at))) {
    if (gesehen.has(run.id)) continue;
    gesehen.add(run.id);
    const jobs = (await hol(R + "/runs/" + run.id + "/jobs?per_page=100&filter=latest")).jobs || [];
    const z = (c) => jobs.filter(c).length;
    const L = z((x) => x.status === "in_progress"), W = z((x) => x.status === "queued" || x.status === "waiting" || x.status === "pending"), D = z((x) => x.status === "completed");
    const gh = jobs.filter((x) => x.status === "in_progress" && /^GitHub Actions|^ubuntu|^Hosted/i.test(x.runner_name || "")).length;
    lauft += L; wartet += W;
    const alt = Math.round((Date.now() - Date.parse(run.created_at)) / 60000);
    zeilen.push(`${run.id} ${run.name.padEnd(10)} ${String(run.head_branch).padEnd(28)} ${run.head_sha.slice(0, 8)} V${run.run_attempt} · läuft ${L} (GitHub ${gh}) · wartet ${W} · durch ${D} · ${alt} min`);
  }
  console.log(zeilen.join("\n"));
  console.log(`SUMME läuft ${lauft} · wartet ${wartet} · ${new Date().toTimeString().slice(0, 8)}`);
})().catch((e) => { console.log("FEHLER " + e.message); process.exit(1); });
