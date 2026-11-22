// node ci-warte2.cjs <sha40> [minuten] [mindestLäufe] — EIN Prozess: wartet, bis alle Läufe am Kopf durch sind, dann das Urteil wie ci-rot.cjs.
const https = require("https"), cp = require("child_process"), path = require("path");
const sha = process.argv[2], maxMin = +process.argv[3] || 90, mind = +process.argv[4] || 2;
const tok = (/^password=(.*)$/m.exec(cp.execFileSync("git", ["credential", "fill"], { input: "protocol=https\nhost=github.com\n\n", encoding: "utf8" })) || [])[1];
function hol(p) {
  return new Promise((ok, nein) => {
    https.get({ host: "api.github.com", path: p, headers: { "User-Agent": "ci-blick", Authorization: "Bearer " + tok, Accept: "application/vnd.github+json" } }, (r) => {
      let b = ""; r.on("data", (d) => (b += d)); r.on("end", () => { try { ok(JSON.parse(b)); } catch (e) { nein(new Error("HTTP " + r.statusCode)); } });
    }).on("error", nein);
  });
}
const schlaf = (s) => new Promise((ok) => setTimeout(ok, s * 1000));
(async () => {
  const ende = Date.now() + maxMin * 60000;
  let fertig = false;
  while (Date.now() < ende) {
    try {
      const l = await hol("/repos/MiguellD/AnazhRealm/actions/runs?head_sha=" + sha + "&per_page=30");
      const runs = l.workflow_runs || [];
      if (runs.length >= mind && runs.every((r) => r.status === "completed")) { fertig = true; break; }
    } catch (e) {}
    await schlaf(90);
  }
  console.log(fertig ? "DURCH" : "ZEIT UM (" + maxMin + " min)");
  console.log(cp.execFileSync(process.execPath, [path.join(__dirname, "ci-rot.cjs"), sha], { encoding: "utf8" }));
})();
