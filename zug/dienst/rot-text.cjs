// rot-text.cjs <lauf-id> — DER ROTE TEXT EINES ZUGS, ohne LLM: je rotem Job (letzter Versuch) sein Name, seine roten Schritte und
// die ❌-Zeilen seines Logs samt der Zeile danach (der Ort im Stapel). Lehre z380 (11.11.): der Zug fiel zweimal an „Die Fahr-Linse
// des Lebens“; das Urteil nannte nur den Schritt, der Täter stand eine Log-Zeile tiefer („VK … TypeError … fahr-proben.cjs:729“,
// `ort.spieler` — w27-ort-pose-voll nahm das Feld aus haushalt.json). Mit dem Text ist der Täter in Minuten benannt, die drei
// Unschuldigen fahren im nächsten Zug; ohne ihn bliebe nur das Halbieren (zwei Züge). TOKEN wie ci.sh (git credential fill).
const lauf = process.argv[2];
const h = { Authorization: "Bearer " + process.env.TOKEN, Accept: "application/vnd.github+json" };
const R = "https://api.github.com/repos/MiguellD/AnazhRealm";
(async () => {
    if (!lauf || !process.env.TOKEN) throw new Error("Aufruf: TOKEN=… node rot-text.cjs <lauf-id>");
    let jobs = [];
    for (let p = 1; p < 6; p++) {
        const j = await (await fetch(`${R}/actions/runs/${lauf}/jobs?per_page=100&page=${p}&filter=latest`, { headers: h })).json();
        jobs = jobs.concat(j.jobs || []);
        if ((j.jobs || []).length < 100) break;
    }
    const rot = jobs.filter((x) => x.conclusion === "failure");
    if (!rot.length) return console.log(`Lauf ${lauf}: kein roter Job unter ${jobs.length}`);
    for (const job of rot) {
        const schritte = (job.steps || []).filter((s) => s.conclusion === "failure" && !/^Urteil der Gruppe/.test(s.name)).map((s) => s.name);
        console.log(`ROT ${job.name} (Versuch ${job.run_attempt}): ${schritte.join(" | ") || "kein Schritt beim Namen"}`);
        const t = await (await fetch(`${R}/actions/jobs/${job.id}/logs`, { headers: h })).text();
        const z = t.split("\n").map((l) => l.replace(/^\S+Z /, ""));
        let n = 0;
        for (let i = 0; i < z.length && n < 12; i++)
            if (/❌/.test(z[i]) && !/Selbst-?[Tt]est/.test(z[i])) {
                console.log("  " + z[i].trim().slice(0, 300));
                if (z[i + 1] && /^\s+at /.test(z[i + 1])) console.log("    " + decodeURIComponent(z[i + 1].trim()).slice(0, 220));
                n++;
            }
        if (!n) console.log("  (keine ❌-Zeile im Log — das Log selbst lesen)");
    }
})().catch((e) => {
    console.log("rot-text: " + e.message);
    process.exitCode = 1;
});
