// node neulauf.cjs <run-id> — stößt NUR die roten Jobs EINES Laufs neu an (Token intern über git credential fill, nie gedruckt)
const https = require("https"), cp = require("child_process");
const run = process.argv[2];
const tok = (/^password=(.*)$/m.exec(cp.execFileSync("git", ["credential", "fill"], { input: "protocol=https\nhost=github.com\n\n", encoding: "utf8" })) || [])[1];
const r = https.request({ method: "POST", host: "api.github.com", path: "/repos/MiguellD/AnazhRealm/actions/runs/" + run + "/rerun-failed-jobs", headers: { "User-Agent": "ci-blick", Authorization: "Bearer " + tok, Accept: "application/vnd.github+json", "Content-Length": 0 } }, (a) => {
    let b = ""; a.on("data", (d) => (b += d)).on("end", () => console.log("HTTP", a.statusCode, b.slice(0, 200), new Date().toTimeString().slice(0, 8)));
});
r.on("error", (e) => console.log("FEHLER", e.message)); r.end();
