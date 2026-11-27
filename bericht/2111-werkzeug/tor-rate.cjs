// node tor-rate.cjs <schritt-regex> [n=40] — die letzten n Code-Check-Läufe: je Lauf und Versuch das Urteil des Schritts, dessen Name die Regex trifft
const https = require("https"), cp = require("child_process");
const [rx, nRaw] = process.argv.slice(2), n = Number(nRaw || 40), R = new RegExp(rx);
const tok = (/^password=(.*)$/m.exec(cp.execFileSync("git", ["credential", "fill"], { input: "protocol=https\nhost=github.com\n\n", encoding: "utf8" })) || [])[1];
const hol = (pfad) => new Promise((ok, nein) => https.get({ host: "api.github.com", path: pfad, headers: { "User-Agent": "ci-blick", Accept: "application/vnd.github+json", ...(tok ? { Authorization: "Bearer " + tok } : {}) } }, (r) => { let s = ""; r.on("data", (d) => (s += d)).on("end", () => { try { ok(JSON.parse(s)); } catch (e) { nein(new Error("HTTP " + r.statusCode + " " + s.slice(0, 120))); } }); }).on("error", nein));
(async () => {
    const runs = [];
    for (let p = 1; runs.length < n && p <= 4; p++) { const j = await hol("/repos/MiguellD/AnazhRealm/actions/runs?per_page=100&page=" + p); for (const r of j.workflow_runs || []) if (/Code-Check/.test(r.name) && r.status === "completed") runs.push(r); }
    let rot = 0, gruen = 0; const zeilen = [];
    for (const r of runs.slice(0, n)) {
        const urteile = [];
        for (let p = 1; p <= 2; p++) {
            const j = await hol("/repos/MiguellD/AnazhRealm/actions/runs/" + r.id + "/jobs?filter=all&per_page=100&page=" + p);
            for (const job of j.jobs || []) for (const s of job.steps || []) if (R.test(s.name) && (s.conclusion === "success" || s.conclusion === "failure")) urteile.push({ v: job.run_attempt, u: s.conclusion });
            if ((j.jobs || []).length < 100) break;
        }
        urteile.sort((a, b) => a.v - b.v);
        for (const u of urteile) u.u === "failure" ? rot++ : gruen++;
        zeilen.push(r.created_at.slice(11, 16) + "Z " + r.head_sha.slice(0, 8) + " " + String(r.head_branch).slice(0, 28).padEnd(28) + " " + (urteile.map((u) => "V" + u.v + ":" + (u.u === "failure" ? "ROT" : "grün")).join(" ") || "—"));
    }
    console.log(zeilen.join("\n")); console.log("Σ " + rx + ": rot " + rot + " · grün " + gruen + " über " + zeilen.length + " Läufe");
})().catch((e) => { console.log("FEHLER " + e.message); process.exit(1); });
