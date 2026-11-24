// node abbruch.cjs <run-id> [...] — bricht eigene, überholte Läufe ab (gibt Plätze der GitHub-Schlange frei). Der Schlüssel bleibt im Prozess.
const https = require("https"), cp = require("child_process");
const tok = (/^password=(.*)$/m.exec(cp.execFileSync("git", ["credential", "fill"], { input: "protocol=https\nhost=github.com\n\n", encoding: "utf8" })) || [])[1];
const post = (p) =>
  new Promise((ok, nein) => {
    const r = https.request({ method: "POST", host: "api.github.com", path: p, headers: { "User-Agent": "ci-blick", Authorization: "Bearer " + tok, Accept: "application/vnd.github+json", "Content-Length": 0 } }, (a) => {
      let b = ""; a.on("data", (d) => (b += d)); a.on("end", () => ok(a.statusCode + " " + b.slice(0, 120)));
    });
    r.on("error", nein); r.end();
  });
(async () => {
  for (const id of process.argv.slice(2)) console.log(id, "→ HTTP", await post("/repos/MiguellD/AnazhRealm/actions/runs/" + id + "/cancel"));
})().catch((e) => { console.log("FEHLER " + e.message); process.exit(1); });
