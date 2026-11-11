// rot-text.cjs <lauf-id> | --sha <kopf> — DER ROTE TEXT EINES LAUFS, ohne LLM: je rotem Job (letzter Versuch) sein Name, seine
// roten Schritte und die Zeilen seines Logs, die den Täter nennen (❌ samt der Zeile danach, „gate:… ROT (n)“ samt seinen
// Spiegelstrichen, `[warn]` des Format-Checks). Lehre z380 (11.11.): der Zug fiel zweimal an „Die Fahr-Linse des Lebens“; das
// Urteil nannte nur den Schritt, der Täter stand eine Log-Zeile tiefer („VK … TypeError … fahr-proben.cjs:729“). Mit dem Text ist
// der Täter in Minuten benannt, die Unschuldigen fahren im nächsten Zug; ohne ihn bliebe nur das Halbieren (zwei Züge).
// `--sha <kopf>`: der jüngste Code-Check dieses Kopfs (heim.sh: ein roter ZWEIG-Check geht mit seinem Text an den Macher) —
// läuft er noch oder ist er grün, bleibt die Ausgabe leer. TOKEN wie ci.sh (git credential fill).
const A = process.argv.slice(2);
const h = { Authorization: "Bearer " + process.env.TOKEN, Accept: "application/vnd.github+json" };
const R = "https://api.github.com/repos/MiguellD/AnazhRealm";
const hole = async (u) => (await fetch(u, { headers: h })).json();
(async () => {
    if (!A[0] || !process.env.TOKEN) throw new Error("Aufruf: TOKEN=… node rot-text.cjs <lauf-id> | --sha <kopf>");
    let lauf = A[0];
    if (lauf === "--sha") {
        const l = ((await hole(`${R}/actions/runs?head_sha=${A[1]}&per_page=30`)).workflow_runs || []).filter((r) => r.name === "Code-Check");
        l.sort((a, b) => b.run_number - a.run_number || b.run_attempt - a.run_attempt);
        if (!l[0] || l[0].status !== "completed" || l[0].conclusion !== "failure") return;
        lauf = l[0].id;
    }
    let jobs = [];
    for (let p = 1; p < 6; p++) {
        const j = await hole(`${R}/actions/runs/${lauf}/jobs?per_page=100&page=${p}&filter=latest`);
        jobs = jobs.concat(j.jobs || []);
        if ((j.jobs || []).length < 100) break;
    }
    const rot = jobs.filter((x) => x.conclusion === "failure");
    if (!rot.length) return console.log(`Lauf ${lauf}: kein roter Job unter ${jobs.length}`);
    for (const job of rot) {
        const schritte = (job.steps || []).filter((s) => s.conclusion === "failure" && !/^Urteil der Gruppe/.test(s.name)).map((s) => s.name);
        console.log(`ROT ${job.name} (Lauf ${lauf}, Versuch ${job.run_attempt}): ${schritte.join(" | ") || "kein Schritt beim Namen"}`);
        const t = await (await fetch(`${R}/actions/jobs/${job.id}/logs`, { headers: h })).text();
        const z = t.split("\n").map((l) => l.replace(/^\S+Z /, ""));
        let n = 0;
        const zeige = (s, tief = "  ") => console.log(tief + s.trim().slice(0, 320));
        for (let i = 0; i < z.length && n < 12; i++) {
            // nie ein Täter: Selbsttests, die Befehls-Zeilen des Workflows (farbig, `echo "❌ …"`), die Schluss-Zählung „0 ❌“
            if (/Selbst-?[Tt]est|\u001b\[|echo "| 0 ❌/.test(z[i])) continue;
            if (/❌/.test(z[i])) {
                zeige(z[i]);
                if (z[i + 1] && /^\s+at /.test(z[i + 1])) zeige(decodeURIComponent(z[i + 1]), "    ");
                n++;
            } else if (/^(gate|check|npm run)\S* ROT \(\d+\)/.test(z[i]) || /^\[warn\] /.test(z[i])) {
                zeige(z[i]);
                for (let k = i + 1; k < z.length && /^\s+- /.test(z[k]) && k < i + 6; k++) zeige(z[k], "    ");
                n++;
            }
        }
        if (!n) console.log("  (keine Täter-Zeile im Log erkannt — das Log selbst lesen)");
    }
})().catch((e) => {
    console.log("rot-text: " + e.message);
    process.exitCode = 1;
});
