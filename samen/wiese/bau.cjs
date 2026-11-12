// WEGWERF (w28-samen-wiese): baut Gras und Bäume über die ECHTE Brücke (asset-worker-harness) und legt die Puffer als JSON ab.
// node samen/wiese/bau.cjs <zielordner>
"use strict";
const fs = require("fs");
const path = require("path");
const { runWithWorker } = require("../../scripts/lib/asset-worker-harness.cjs");
const ziel = process.argv[2];
if (!ziel) throw new Error("Zielordner fehlt");
fs.mkdirSync(ziel, { recursive: true });
const LISTE = [
    ["gras", 1, 0], ["gras", 1, 1], ["gras", 1, 2], ["gras", 2, 0], ["gras", 2, 1], ["gras", 2, 2],
    ["eiche", 1, 0], ["eiche", 2, 0], ["eiche", 3, 0], ["eiche", 1, 1],
    ["fichte", 1, 0], ["birke", 1, 0], ["buche", 1, 0], ["buche", 3, 0], ["birke", 3, 0],
];
(async () => {
    await runWithWorker(8791, async ({ build }) => {
        for (const [presetId, seed, lod] of LISTE) {
            const t0 = Date.now();
            const r = await build({ presetId, seed, lod, season: "summer" });
            const ms = Date.now() - t0;
            let tris = 0;
            for (const m of r.meshes) if (m.attrs && m.attrs.position) tris += m.index ? Buffer.from(m.index, "base64").length / 4 / 3 : 0;
            const name = `${presetId}-s${seed}-l${lod}.json`;
            fs.writeFileSync(path.join(ziel, name), JSON.stringify(r));
            console.log(name, "teile", r.meshes.length, "tris~", tris, "ms", ms, "budget", JSON.stringify(r.budget), r.budgetBruch ? "BRUCH " + JSON.stringify(r.budgetBruch) : "");
            for (const m of r.meshes) console.log("   ", m.kind, m.teil || "", Object.keys(m.attrs || {}).join(","), JSON.stringify(m.mat || {}).slice(0, 200));
        }
    });
})().catch((e) => { console.error(e); process.exit(1); });
