// Aufruf: node <ort>/menge-lesen.cjs <lauf.json> […]   (KURZ=1 nur die Summen) — die Erst-Bild-Menge (Eingriff zug-menge.js, mit bau-im-gang.js): je Pipeline, die VOR dem Bild
// bestellt wurde — bestellt → bereit, Text (V/F in KB), ihre Züge bis zum Bild und im Fenster danach (h Hauptbild · w Wurf ·
// a andere Szene) und ihr Urteil: ZEICHNET (Zug im Hauptbild oder Wurf der Welt), EINGANG (nur in anderer Szene: Tafeln, Bühne),
// NIE (kein Zug bis Bild + 600 ms). Dazu die Summen je Urteil (Zahl, Übersetzung Σ, Text Σ) und die Knoten-Bauten vor dem Bild.
const fs = require("fs");
const kurz = process.env.KURZ === "1";
for (const f of process.argv.slice(2)) {
    const j = JSON.parse(fs.readFileSync(f, "utf8"));
    const W = j.marken.weltbild;
    const Z = (j.extra || {}).zug || { je: {} };
    const G = (j.extra || {}).gang || { bau: [] };
    const P = (j.pipes || []).filter((e) => e.length >= 5 && e[0] <= W);
    const sum = { ZEICHNET: [0, 0, 0], EINGANG: [0, 0, 0], NIE: [0, 0, 0] };
    const zeilen = [];
    const texte = new Map();
    for (const e of P) {
        const label = String(e[2]).replace("renderPipeline_", "");
        const z = Z.je[label];
        const zug = z ? z.slice(1, 7) : [0, 0, 0, 0, 0, 0];
        const welt = zug[0] + zug[1] + zug[3] + zug[4];
        const urteil = welt > 0 ? "ZEICHNET" : zug[2] + zug[5] > 0 ? "EINGANG" : "NIE";
        const ms = typeof e[1] === "number" ? e[1] - e[0] : W - e[0];
        const kb = (Number(e[3].split(":")[0]) + Number(e[4].split(":")[0])) / 1000;
        sum[urteil][0]++;
        sum[urteil][1] += ms;
        sum[urteil][2] += kb;
        const t = e[3] + "|" + e[4];
        texte.set(t, (texte.get(t) || 0) + 1);
        zeilen.push(`  ${String(e[0]).padStart(6)} → ${String(e[1]).padStart(6)} ${String(ms).padStart(5)} ms · V ${e[3].split(":")[0].padStart(6)} F ${e[4].split(":")[0].padStart(7)} · ${urteil.padEnd(8)} h ${zug[0]}+${zug[3]} w ${zug[1]}+${zug[4]} a ${zug[2]}+${zug[5]} · ${label.slice(0, 34).padEnd(34)} · ${z ? String(z[8]).slice(0, 46) : "(kein Zug)"}`);
    }
    console.log(`\n== ${f.replace(/^.*[\\/]/, "")} · Bild ${W} · Pipelines vor dem Bild bestellt ${P.length} · verschiedene Text-Paare ${texte.size} · Züge gezählt ${Z.zuege} · Fehler "${Z.fehler || ""}"`);
    if (!kurz) for (const z of zeilen) console.log(z);
    for (const [k, v] of Object.entries(sum)) console.log(`  ${k}: ${v[0]} Pipelines · Übersetzung Σ ${Math.round(v[1])} ms · Text Σ ${Math.round(v[2])} KB`);
    const vor = G.bau.filter((b) => b[0] <= W);
    const bauMs = vor.reduce((a, b) => a + b[3], 0);
    console.log(`  Knoten-Bau vor dem Bild: ${vor.length} Bauten · ${vor.reduce((a, b) => a + b[2], 0)} Rufe · ${Math.round(bauMs)} ms`);
    // die Bauten, deren Stoff-Label nie zeichnete
    const nie = vor.filter((b) => {
        const z = Z.je[b[5]];
        return !z || z[1] + z[2] + z[4] + z[5] === 0;
    });
    console.log(`  davon Bauten, deren Stoff bis zum Bild nie in der Welt zeichnete: ${nie.length} · ${Math.round(nie.reduce((a, b) => a + b[3], 0))} ms`);
    if (!kurz) for (const b of nie) console.log(`     ${b[0]}→${b[1]} ${b[2]} Rufe ${Math.round(b[3])} ms · ${String(b[4]).slice(0, 50)} · ${b[5]} · ${b[6]} · ${String(b[9]).slice(0, 40)}`);
}
