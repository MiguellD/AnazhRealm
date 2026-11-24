// node job-log.cjs <job-id> <ziel-datei> — lädt das Log EINES Jobs (Token intern über git credential fill, nie gedruckt)
const https = require("https"), cp = require("child_process"), fs = require("fs");
const [id, ziel] = process.argv.slice(2);
const tok = (/^password=(.*)$/m.exec(cp.execFileSync("git", ["credential", "fill"], { input: "protocol=https\nhost=github.com\n\n", encoding: "utf8" })) || [])[1];
function hol(url, auth, tiefe = 0) {
    const u = new URL(url);
    https.get({ host: u.host, path: u.pathname + u.search, headers: { "User-Agent": "ci-blick", Accept: "application/vnd.github+json", ...(auth ? { Authorization: "Bearer " + tok } : {}) } }, (r) => {
        if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location && tiefe < 4) return hol(r.headers.location, false, tiefe + 1);
        const teile = [];
        r.on("data", (d) => teile.push(d)).on("end", () => { fs.writeFileSync(ziel, Buffer.concat(teile)); console.log("HTTP", r.statusCode, "Bytes", Buffer.concat(teile).length); });
    }).on("error", (e) => console.log("FEHLER", e.message));
}
hol("https://api.github.com/repos/MiguellD/AnazhRealm/actions/jobs/" + id + "/logs", true);
