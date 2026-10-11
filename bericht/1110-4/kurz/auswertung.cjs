// Auswertung 1110-4: je Stand der ersten Eltern-Linie (Licht des Auges aus) gpu-bank je Sitzung und Mittel, das Band je Klasse,
// die Zerlegung je Pass, die Programme — und je Merge die Differenz zum Stand davor.
const fs = require("fs");
const path = require("path");
const DIR = process.argv[2];
const NAMEN = ["S0-main", "S1-pruefbuehne", "S2-egoschatten", "S3-haus", "S4-koerperbild", "S5-wasser", "S6-werkstatt"];
const mittel = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : NaN);
const f2 = (v) => (Number.isFinite(v) ? v.toFixed(2) : "–");
const stand = {};
for (const N of NAMEN) {
    const dateien = fs.readdirSync(DIR).filter((d) => d.startsWith(N + "-g") && d.endsWith(".json")).sort();
    const sitz = [];
    for (const d of dateien) {
        const j = JSON.parse(fs.readFileSync(path.join(DIR, d), "utf8"));
        const st = (n) => j.schritte.find((s) => s.name === n);
        const gb = st("gpu-bank").ergebnis;
        const m = st("band").ergebnis.messung;
        const kl = {};
        for (const k of m.klassen) kl[k.id] = { befehle: k.ist.befehle, dreiecke: k.ist.dreiecke };
        sitz.push({ datei: d, urteil: j.urteil, b0: gb["0"].gpuJeFrameMs, b88: gb["-0.88"].gpuJeFrameMs, befehle: m.summe.befehle, dreiecke: m.summe.dreiecke, vram: m.vram.mb, bandGpu: m.gpu && m.gpu.gpuJeFrameMs, kl });
    }
    const pass = {};
    try {
        for (const l of fs.readFileSync(path.join(DIR, N + "-zerlegen.txt"), "utf8").split("\n")) {
            const mm = /^(haupt|k0|k1|post)\s+(-?[\d,]+)/.exec(l);
            if (mm) pass[mm[1]] = Number(mm[2].replace(",", "."));
        }
    } catch (_e) {}
    let prog = null;
    try {
        const t = fs.readFileSync(path.join(DIR, N + "-zaehlen.txt"), "utf8");
        const z = JSON.parse(t.slice(t.indexOf("{")));
        prog = (z.ergebnis || z).programme;
    } catch (_e) {}
    const kl = {};
    for (const s of sitz) for (const [id, v] of Object.entries(s.kl)) (kl[id] = kl[id] || []).push(v);
    stand[N] = {
        n: sitz.length,
        b0: sitz.map((s) => s.b0),
        b88: sitz.map((s) => s.b88),
        m0: mittel(sitz.map((s) => s.b0)),
        m88: mittel(sitz.map((s) => s.b88)),
        befehle: mittel(sitz.map((s) => s.befehle)),
        dreiecke: mittel(sitz.map((s) => s.dreiecke)),
        vram: mittel(sitz.map((s) => s.vram)),
        bandGpu: mittel(sitz.map((s) => s.bandGpu)),
        kl: Object.fromEntries(Object.entries(kl).map(([id, a]) => [id, { befehle: mittel(a.map((x) => x.befehle)), dreiecke: mittel(a.map((x) => x.dreiecke)) }])),
        pass,
        prog,
        urteile: sitz.map((s) => s.urteil),
    };
}
let out = "## Je Stand (Licht des Auges aus)\n\n| Stand | n | gpu-bank Gier 0 je Sitzung | Mittel | Gier −0,88 je Sitzung | Mittel | band Bef. · Dreiecke · VRAM · GPU | zerlegen haupt / k0 / post | Programme v/f/Fam/Pip |\n|---|---|---|---|---|---|---|---|---|\n";
for (const N of NAMEN) {
    const s = stand[N];
    const p = s.prog ? `${s.prog.vertex}/${s.prog.fragment}/${s.prog.familien}/${s.prog.pipelines}` : "–";
    out += `| ${N} | ${s.n} | ${s.b0.map(f2).join(" · ")} | ${f2(s.m0)} | ${s.b88.map(f2).join(" · ")} | ${f2(s.m88)} | ${Math.round(s.befehle)} · ${Math.round(s.dreiecke / 1000)}k · ${f2(s.vram)} · ${f2(s.bandGpu)} | ${f2(s.pass.haupt)} / ${f2(s.pass.k0)} / ${f2(s.pass.post)} | ${p} |\n`;
}
out += "\n## Je Merge (Stand − Stand davor)\n\n| Merge | Δ gpu-bank Gier 0 | Δ Gier −0,88 | Δ zerlegen haupt / k0 / post | Δ band Befehle · Dreiecke · VRAM | Klassen, die sich ändern (Befehle · Dreiecke) |\n|---|---|---|---|---|---|\n";
for (let i = 1; i < NAMEN.length; i++) {
    const a = stand[NAMEN[i - 1]],
        b = stand[NAMEN[i]];
    const d = (x, y) => (Number.isFinite(x) && Number.isFinite(y) ? (y - x >= 0 ? "+" : "") + (y - x).toFixed(2) : "–");
    const kl = [];
    for (const id of new Set([...Object.keys(a.kl), ...Object.keys(b.kl)])) {
        const x = a.kl[id] || { befehle: 0, dreiecke: 0 },
            y = b.kl[id] || { befehle: 0, dreiecke: 0 };
        if (Math.abs(y.befehle - x.befehle) >= 0.5 || Math.abs(y.dreiecke - x.dreiecke) >= 2000)
            kl.push(`${id} ${Math.round(x.befehle)}→${Math.round(y.befehle)} · ${Math.round(x.dreiecke / 1000)}k→${Math.round(y.dreiecke / 1000)}k`);
    }
    out += `| ${NAMEN[i]} | ${d(a.m0, b.m0)} | ${d(a.m88, b.m88)} | ${d(a.pass.haupt, b.pass.haupt)} / ${d(a.pass.k0, b.pass.k0)} / ${d(a.pass.post, b.pass.post)} | ${d(a.befehle, b.befehle)} · ${d(a.dreiecke / 1000, b.dreiecke / 1000)}k · ${d(a.vram, b.vram)} | ${kl.join("; ") || "–"} |\n`;
}
fs.writeFileSync(path.join(DIR, "auswertung.md"), out);
fs.writeFileSync(path.join(DIR, "auswertung.json"), JSON.stringify(stand, null, 1));
console.log(out);
