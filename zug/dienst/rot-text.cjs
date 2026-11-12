// rot-text.cjs <lauf-id> | --sha <kopf> — DER ROTE TEXT EINES LAUFS, ohne LLM: je rotem Job (letzter Versuch) sein Name, seine
// roten Schritte und die Zeilen seines Logs, die den Täter nennen (❌ samt der Zeile danach, „gate:… ROT (n)“ samt seinen
// Spiegelstrichen, `[warn]` des Format-Checks). Lehre z380 (11.11.): der Zug fiel zweimal an „Die Fahr-Linse des Lebens“; das
// Urteil nannte nur den Schritt, der Täter stand eine Log-Zeile tiefer („VK … TypeError … fahr-proben.cjs:729“). Mit dem Text ist
// der Täter in Minuten benannt, die Unschuldigen fahren im nächsten Zug; ohne ihn bliebe nur das Halbieren (zwei Züge).
// `--sha <kopf>`: der jüngste Code-Check dieses Kopfs (heim.sh: ein roter ZWEIG-Check geht mit seinem Text an den Macher) —
// läuft er noch oder ist er grün, bleibt die Ausgabe leer. TOKEN wie ci.sh (git credential fill).
// Lehre z396 (12.11.): drei Lesungen gingen fehl, weil der Text zwölf ERWARTETE Mutanten-❌ („[Täter …]“, darunter „✅ der Täter
// macht die Probe ROT“) als Rot zeigte und den Absturz verschwieg („welt-boot.cjs ABSTURZ: … Failed to launch the browser“,
// „##[error]Process completed with exit code 2“). Darum: der Absturz ZUERST, die erwarteten ❌ nur als Zahl; `--selbsttest` prüft beides.
const A = process.argv.slice(2);
const ERWARTET = /✅.*Täter macht die Probe ROT/;
const HART = /ABSTURZ|##\[error\]|exit code [1-9]\d*|The operation was canceled/;
// taeter(log) → die Zeilen, die den Täter nennen: erst hart (ABSTURZ, ##[error], Exit ≠ 0), dann ❌ / „… ROT (n)“ / [warn]
function taeter(t) {
    const z = t.split("\n").map((l) => l.replace(/^\S+Z /, ""));
    const aus = [];
    const zeige = (s, tief = "  ") => aus.push(tief + s.trim().slice(0, 320));
    // nie ein Täter: die Befehls-Zeilen des Workflows (farbig, `echo "❌ …"`)
    const befehl = (s) => /\u001b\[|echo "/.test(s);
    let hart = 0;
    for (let i = 0; i < z.length && hart < 6; i++) {
        if (!befehl(z[i]) && HART.test(z[i])) {
            zeige(z[i]);
            hart++;
        }
    }
    let n = 0;
    let stumm = 0;
    for (let i = 0; i < z.length && n < 12; i++) {
        // nie ein Täter: Selbsttests und die Schluss-Zählung „0 ❌“
        if (/Selbst-?[Tt]est| 0 ❌/.test(z[i]) || befehl(z[i])) continue;
        if (/❌/.test(z[i])) {
            if (z.slice(i + 1, i + 5).some((l) => ERWARTET.test(l))) {
                stumm++;
                continue;
            }
            zeige(z[i]);
            if (z[i + 1] && /^\s+at /.test(z[i + 1])) zeige(decodeURIComponent(z[i + 1]), "    ");
            n++;
        } else if (/^(gate|check|npm run)\S* ROT \(\d+\)/.test(z[i]) || /^\[warn\] /.test(z[i])) {
            zeige(z[i]);
            for (let k = i + 1; k < z.length && /^\s+- /.test(z[k]) && k < i + 6; k++) zeige(z[k], "    ");
            n++;
        }
    }
    if (stumm) aus.push(`  (${stumm} erwartete Mutanten-❌ ausgeblendet: jeder Täter macht seine Probe ROT)`);
    if (!n && !hart) aus.push("  (keine Täter-Zeile im Log erkannt — das Log selbst lesen)");
    return aus;
}
if (A[0] === "--selbsttest") {
    const Z = "2026-11-12T00:00:00.0000000Z ";
    const log = [
        Z + '❌ bewohner  [Täter bewohner-haus] {"quote":0.988}',
        Z + "✅ der Täter macht die Probe ROT (bewohner-haus)",
        Z + "welt-boot.cjs ABSTURZ: Error: Failed to launch the browser process:  Code: null",
        Z + "❌ echte Probe reißt 3 > 2",
        Z + "##[error]Process completed with exit code 2.",
    ];
    const a = taeter(log.join("\n"));
    const gut = /ABSTURZ/.test(a[0]) && /exit code 2/.test(a[1]) && /echte Probe/.test(a[2]) && /1 erwartete/.test(a[3]) && !a.some((l) => /Täter bewohner-haus/.test(l));
    console.log(gut ? "✅ rot-text: der Absturz steht zuerst, die erwartete Mutante schweigt" : "❌ rot-text:\n" + a.join("\n"));
    // Mutante: dasselbe Log ohne die Zeile „der Täter macht die Probe ROT“ — die ❌ des Täters muss dann als Rot erscheinen
    const b = taeter(log.filter((l) => !ERWARTET.test(l)).join("\n"));
    const mut = b.some((l) => /Täter bewohner-haus/.test(l));
    console.log(mut ? "✅ Mutante (ohne die Zeile des Täters): die ❌ erscheint als Rot" : "❌ Mutante: eine ❌ ohne Entwarnung blieb stumm");
    process.exit(gut && mut ? 0 : 1);
}
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
        for (const l of taeter(t)) console.log(l);
    }
})().catch((e) => {
    console.log("rot-text: " + e.message);
    process.exitCode = 1;
});
