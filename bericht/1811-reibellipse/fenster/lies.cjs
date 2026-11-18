const fs = require("fs");
for (const d of process.argv.slice(2)) {
    const j = JSON.parse(fs.readFileSync(d + "/reib.json", "utf8"));
    console.log("==", d, j.kopf, j.fehler || "");
    for (const [n, f] of Object.entries(j.fahrten)) {
        if (!f || !f.spur) { console.log(n, JSON.stringify(f)); continue; }
        const at = (t) => f.spur.find((s) => Math.abs(s[0] - t) < 0.01) || [];
        const g = (t) => { const s = at(t); return s.length ? `${t}s gier ${s[3]}° v ${s[4]}/${s[5]} gr ${s[6]}°/s` : ""; };
        // mittlere Verzögerung der Bahn-Geschwindigkeit über die erste Sekunde und 0–2 s
        const sp = (s) => Math.hypot(s[4], s[5]);
        const s1 = at(1), s2 = at(2), s05 = at(0.5);
        const v0 = 15;
        console.log(n.padEnd(15), "weg", f.weg, "sek", f.sek, "stand", f.stand, "gierMax", f.gierMaxGrad, "| a(0-1s)", s1.length ? ((v0 - sp(s1)) / 1).toFixed(2) : "-", "a(0-2s)", s2.length ? ((v0 - sp(s2)) / 2).toFixed(2) : "-", "aLong@0.5", s05[10], "aLat@0.5", s05[11], "\n    ", g(0.5), "|", g(1), "|", g(1.5), "|", g(2), "| ende", JSON.stringify(f.ende));
    }
}
