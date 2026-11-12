// WEGWERF (w28-samen-wiese): der Stamm-Spike über die ECHTE Brücke — Eiche Same 1 (Bestand) und Same 3 (Solitär), L0:
// heute und mit dem Regler-Kanal `ov` (foundry-core: ov ersetzt P-Felder nach der Ableitung) in der Kandidaten-Dicke.
// node samen/wiese/bau-stamm.cjs <zielordner> <trunkMul Same 1> <trunkMul Same 3>
"use strict";
const fs = require("fs");
const path = require("path");
const { runWithWorker } = require("../../scripts/lib/asset-worker-harness.cjs");
const [ziel, m1, m3] = process.argv.slice(2);
(async () => {
    await runWithWorker(8795, async ({ build }) => {
        const faelle = [
            ["eiche", 1, null, "heute"], ["eiche", 1, { trunkMul: +m1 }, "kandidat"],
            ["eiche", 3, null, "heute"], ["eiche", 3, { trunkMul: +m3 }, "kandidat"],
        ];
        for (const [presetId, seed, ov, name] of faelle) {
            const zeiten = [];
            let r = null;
            for (let i = 0; i < 6; i++) {
                const t0 = Date.now();
                r = await build(Object.assign({ presetId, seed, lod: 0, season: "summer" }, ov ? { ov } : {}));
                if (i) zeiten.push(Date.now() - t0);
            }
            zeiten.sort((a, b) => a - b);
            let tris = 0;
            for (const m of r.meshes) if (m.attrs && m.attrs.position && m.index) tris += Buffer.from(m.index, "base64").length / 12;
            fs.writeFileSync(path.join(ziel, `stamm-${presetId}-s${seed}-${name}.json`), JSON.stringify(r));
            console.log(`${presetId} s${seed} ${name} ov ${JSON.stringify(ov)}: Dreiecke ${tris} · Bau über die Brücke (Median aus 5, mit Transport) ${zeiten[2]} ms${r.budgetBruch ? " · BUDGET-BRUCH " + JSON.stringify(r.budgetBruch).slice(0, 160) : ""}`);
        }
    });
})().catch((e) => { console.error(e); process.exit(1); });
