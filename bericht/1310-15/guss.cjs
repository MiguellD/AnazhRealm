// 1310-15: DER MENSCH-GUSS EINES BAUMS (die echte Brücke, Harness-Kopie mit Skelett) — je Stufe die Meshes (Art, Gelenk,
// Seh-Klasse, Ecken, Dreiecke, Lage/Index als base64) und das Skelett. K15_BAUM=<baum> node guss.cjs <datei.json> [port]
"use strict";
const fs = require("fs");
const path = require("path");
const { runWithWorker } = require(path.join(__dirname, "harness.cjs"));
const [datei, port = "4522"] = process.argv.slice(2);
const dec = (b) => Buffer.from(b, "base64");
(async () => {
    const out = await runWithWorker(Number(port), async ({ build }) => {
        const r = {};
        for (const lod of [0, 1]) {
            const a = await build({ type: "build-asset", id: "mensch", presetId: "mensch", seed: 1, lod, ov: null });
            const ms = a.meshes || [];
            const sk = ms.find((m) => m.skelett);
            const meshes = ms
                .filter((m) => m.attrs && m.attrs.position)
                .map((m) => {
                    const pb = dec(m.attrs.position.b64);
                    const ecken = pb.length / 12;
                    const ib = m.index ? dec(m.index) : null;
                    let breite = 4;
                    if (ib) {
                        const u32 = new Uint32Array(ib.buffer, ib.byteOffset, ib.length >> 2);
                        let mx = 0;
                        for (const v of u32) if (v > mx) mx = v;
                        if (!(mx < ecken)) breite = 2;
                    }
                    return {
                        kind: m.kind, joint: m.joint || null, seh: m.mat ? m.mat.seh || null : null,
                        skinned: !!(m.attrs.skinIndex), ecken, dreiecke: ib ? ib.length / breite / 3 : ecken / 3, breite,
                        pos: m.attrs.position.b64, index: m.index || null,
                    };
                });
            r["L" + lod] = { budget: a.budget, dreiecke: meshes.reduce((s, m) => s + m.dreiecke, 0), meshes, skelett: sk ? sk.skelett : null };
        }
        return r;
    });
    fs.writeFileSync(datei, JSON.stringify(out));
    for (const L of ["L0", "L1"]) {
        const r = out[L];
        console.log(`${L}: ${r.meshes.length} Meshes, ${r.dreiecke} Dreiecke, Budget ${JSON.stringify(r.budget)}, Skelett ${r.skelett ? r.skelett.joints.length + " Gelenke" : "FEHLT"}`);
        const je = {};
        for (const m of r.meshes) {
            const k = `${m.kind}|${m.seh}|${m.skinned ? "huelle" : m.joint}`;
            je[k] = (je[k] || 0) + m.dreiecke;
        }
        for (const [k, v] of Object.entries(je).sort((a, b) => b[1] - a[1])) console.log(`   ${k.padEnd(34)} ${v}`);
    }
})().catch((e) => { console.error("ABBRUCH " + e.message); process.exit(2); });
