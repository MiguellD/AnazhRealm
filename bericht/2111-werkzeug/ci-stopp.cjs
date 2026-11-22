// node ci-stopp.cjs <sha40> [<sha40> …] — bricht jeden noch laufenden Lauf an einem ÜBERHOLTEN Kopf ab (die Schlange der
// Cloud-Läufer trägt sonst 22 Jobs je totem Kopf). Der Schlüssel bleibt im Prozess.
const https = require("https"), cp = require("child_process");
const tok = (/^password=(.*)$/m.exec(cp.execFileSync("git", ["credential", "fill"], { input: "protocol=https\nhost=github.com\n\n", encoding: "utf8" })) || [])[1];
function ruf(methode, p) {
  return new Promise((ok, nein) => {
    const q = https.request({ method: methode, host: "api.github.com", path: p, headers: { "User-Agent": "ci-blick", Authorization: "Bearer " + tok, Accept: "application/vnd.github+json", "Content-Length": 0 } }, (r) => {
      let b = ""; r.on("data", (d) => (b += d)); r.on("end", () => { let j = null; try { j = b ? JSON.parse(b) : null; } catch (e) {} ok({ status: r.statusCode, j }); });
    });
    q.on("error", nein); q.end();
  });
}
(async () => {
  const R = "/repos/MiguellD/AnazhRealm/actions";
  for (const sha of process.argv.slice(2)) {
    const l = await ruf("GET", R + "/runs?head_sha=" + sha + "&per_page=30");
    for (const run of (l.j && l.j.workflow_runs) || []) {
      if (run.status === "completed") { console.log(sha.slice(0, 8) + " " + run.id + " " + run.name + " schon " + run.conclusion); continue; }
      const a = await ruf("POST", R + "/runs/" + run.id + "/cancel");
      console.log(sha.slice(0, 8) + " " + run.id + " " + run.name + " (" + run.status + ") → Abbruch HTTP " + a.status);
    }
  }
})().catch((e) => { console.log("FEHLER " + e.message); process.exit(1); });
