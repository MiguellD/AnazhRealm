// Aufruf: node <ort>/zensus-lesen.cjs <lauf.json> [mehr …]      (Läufe mit eingriff/zensus.js und FREI_NACH=3000)
// ENTSTANDEN GEGEN IM SCHIRM: je Lauf die Programme des Hauptbilds mit ihrem Urteil der Okklusions-Abfrage — SICHTBAR (eines
// ihrer Dinge ließ Proben durch), VERDECKT (keines), im Bündel / ohne Antwort (nicht messbar) —, Text in KB und das erste Ding;
// dazu die Sammlungen des Stands mit Lage (Größe · im Blick-Kegel der Ankunft) und die Szene-Gruppen nach Dreiecken.
const fs = require("fs");
for (const f of process.argv.slice(2)) {
    const j = JSON.parse(fs.readFileSync(f, "utf8"));
    const Z = (j.extra || {}).zensus;
    const U = ((j.extra || {}).zug || {}).je || {};
    if (!Z) {
        console.log(f, "— kein Zensus im Lauf");
        continue;
    }
    const P = Object.fromEntries((j.pipes || []).filter((e) => e.length >= 5).map((e) => [String(e[2]).replace("renderPipeline_", ""), e]));
    console.log(`== ${f.replace(/^.*[\\/]/, "")} · Bild ${j.marken.weltbild} · gefragt ${Z.gefragt} Dinge · Backend antwortete: ${Z.gelesen} · Fehler "${Z.fehler || ""}"`);
    const sum = { SICHTBAR: [0, 0], VERDECKT: [0, 0], "nicht messbar": [0, 0] };
    for (const [k, v] of Object.entries(Z.pixel)) {
        const p = P[k];
        const kb = p ? (Number(p[3].split(":")[0]) + Number(p[4].split(":")[0])) / 1000 : 0;
        const urteil = v[1] > 0 ? "SICHTBAR" : v[2] > 0 ? "VERDECKT" : "nicht messbar";
        sum[urteil][0]++;
        sum[urteil][1] += kb;
        console.log(`   ${urteil.padEnd(13)} ${k.padEnd(32)} ${String(Math.round(kb)).padStart(4)} KB · Dinge ${v[0]} (sichtbar ${v[1]}, verdeckt ${v[2]}, ohne Zug ${v[3]}, im Bündel ${v[4]}) · ${String((U[k] || [])[8] || "?").slice(0, 60)}`);
    }
    console.log("   Σ " + Object.entries(sum).map(([k, v]) => `${k} ${v[0]} Programme ${Math.round(v[1])} KB`).join(" · "));
    const lage = Object.entries(Z.stand).filter(([, v]) => v.length === 3).sort((a, b) => b[1][0] - a[1][0]);
    console.log("   Stand mit Lage (Größe · im Blick-Kegel): " + lage.slice(0, 14).map(([k, v]) => `${k} ${v[1]} · ${v[2]}`).join(" | "));
    const sz = Object.entries(Z.szene).sort((a, b) => b[1][2] - a[1][2]).slice(0, 14);
    console.log("   Szene (Dinge · Instanzen · Dreiecke): " + sz.map(([k, v]) => `${k} ${v[0]} · ${v[1]} · ${v[2]}`).join(" | "));
}
