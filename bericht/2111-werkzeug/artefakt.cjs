// node artefakt.cjs <run-id> [name-teil] [ziel.zip] — listet die Artefakte EINES Laufs; mit Ziel lädt es das erste passende (Token intern, nie gedruckt)
const https = require("https"), cp = require("child_process"), fs = require("fs");
const [run, teil, ziel] = process.argv.slice(2);
const tok = (/^password=(.*)$/m.exec(cp.execFileSync("git", ["credential", "fill"], { input: "protocol=https\nhost=github.com\n\n", encoding: "utf8" })) || [])[1];
const hol = (url, auth, roh, tiefe = 0) => new Promise((ok, nein) => {
    const u = new URL(url);
    https.get({ host: u.host, path: u.pathname + u.search, headers: { "User-Agent": "ci-blick", Accept: "application/vnd.github+json", ...(auth ? { Authorization: "Bearer " + tok } : {}) } }, (r) => {
        if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location && tiefe < 4) return ok(hol(r.headers.location, false, roh, tiefe + 1));
        const t = []; r.on("data", (d) => t.push(d)).on("end", () => ok(roh ? Buffer.concat(t) : JSON.parse(Buffer.concat(t).toString("utf8"))));
    }).on("error", nein);
});
(async () => {
    const l = await hol("https://api.github.com/repos/MiguellD/AnazhRealm/actions/runs/" + run + "/artifacts?per_page=50", true, false);
    for (const a of l.artifacts || []) console.log(a.id, a.name, (a.size_in_bytes / 1e6).toFixed(1) + " MB", a.expired ? "ABGELAUFEN" : "");
    const a = (l.artifacts || []).find((x) => !x.expired && (!teil || x.name.includes(teil)));
    if (ziel && a) { const b = await hol(a.archive_download_url, true, true); fs.writeFileSync(ziel, b); console.log("GELADEN", a.name, b.length, "Bytes →", ziel); }
})();
