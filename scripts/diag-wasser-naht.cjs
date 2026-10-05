#!/usr/bin/env node
// DIE NAHT-LINSE DES WASSERS (Welle 5, 05.10.): die Zell-Sheets zweier Nachbar-Chunks treffen sich Kante an Kante. Entlang
// jeder gemeinsamen Grenze (alle 0,25 m) wird der Rand JEDES Sheets gesucht (quer zur Grenze in 5-cm-Schritten, die
// Fläche über Dreieck + baryzentrisch) und die beiden Rand-Höhen verglichen — eine Stufe > 1 cm auf dem Seespiegel ist
// die dunkle Naht-Linie der Blick-Tour 07. Gemessen gegen eine LAUFENDE Werkbank-Welt (echte GPU oder swiftshader).
//
//   node scripts/diag-wasser-naht.cjs [--port <werkbank-steuerport>]   (oder WERKBANK_PORT)
//   node scripts/diag-wasser-naht.cjs --selftest                        (nur Node: zwei Sheets, eine 5-cm-Stufe)
//
// Befund 05.10. (Seeufer −790/−915, echte GPU): vor dem gezeichneten Dach 32 Spiegel-Stufen > 1 cm (max 28 cm) in 1547
// Proben, danach 13 (max 16 cm, alle am Ufer-Rand, wo das Sheet in die Böschung fällt).
"use strict";
const http = require("http");

// Die Linse — läuft in der Seite (r = die Welt) oder im Selbsttest gegen eine Attrappe.
function nahtLinse(r) {
    const span = r._voxelChunkConfig().span;
    const iso = r.state.voxelChunkWaterIso;
    const hoehe = (mesh, x, z) => {
        const g = mesh.geometry;
        const p = g.attributes.position.array;
        const idx = g.index ? g.index.array : null;
        const mw = mesh.matrixWorld.elements;
        const n = idx ? g.index.count : p.length / 3;
        // Der Index kann ein Fenster auf den Wasser-Satz sein (Satz-Vertex-Basis): auf die lokale Zählung zurück.
        let basis = 0;
        if (idx) {
            basis = Infinity;
            for (let t = 0; t < n; t++) if (idx[t] < basis) basis = idx[t];
        }
        let best = null;
        for (let t = 0; t + 2 < n; t += 3) {
            const i0 = ((idx ? idx[t] : t) - basis) * 3;
            const i1 = ((idx ? idx[t + 1] : t + 1) - basis) * 3;
            const i2 = ((idx ? idx[t + 2] : t + 2) - basis) * 3;
            const ax = p[i0] + mw[12],
                az = p[i0 + 2] + mw[14];
            const bx = p[i1] + mw[12],
                bz = p[i1 + 2] + mw[14];
            const cx = p[i2] + mw[12],
                cz = p[i2 + 2] + mw[14];
            const d = (bz - cz) * (ax - cx) + (cx - bx) * (az - cz);
            if (Math.abs(d) < 1e-9) continue;
            const l1 = ((bz - cz) * (x - cx) + (cx - bx) * (z - cz)) / d;
            const l2 = ((cz - az) * (x - cx) + (ax - cx) * (z - cz)) / d;
            const l3 = 1 - l1 - l2;
            if (l1 < -1e-6 || l2 < -1e-6 || l3 < -1e-6) continue;
            const y = l1 * (p[i0 + 1] + mw[13]) + l2 * (p[i1 + 1] + mw[13]) + l3 * (p[i2 + 1] + mw[13]);
            if (best === null || y > best) best = y;
        }
        return best;
    };
    const o = { kanten: 0, proben: 0, stufen: 0, maxStufeCm: 0, spiegelProben: 0, spiegelStufen: 0, spiegelMaxCm: 0 };
    for (const [key, mesh] of iso) {
        if (!mesh || !mesh.geometry) continue;
        const [cx, cz] = key.split(",").map(Number);
        for (const [dx, dz] of [
            [1, 0],
            [0, 1],
        ]) {
            const nb = iso.get(`${cx + dx},${cz + dz}`);
            if (!nb || !nb.geometry) continue;
            let gemeinsam = 0;
            for (let s = 0.125; s < span; s += 0.25) {
                const x = dx ? (cx + 1) * span : cx * span + s;
                const z = dz ? (cz + 1) * span : cz * span + s;
                let ya = null,
                    yb = null,
                    qa = null,
                    qb = null;
                for (let q = -1.5; q <= 1.5; q += 0.05) {
                    const px = dx ? x + q : x;
                    const pz = dz ? z + q : z;
                    const ha = hoehe(mesh, px, pz);
                    if (ha !== null) {
                        ya = ha;
                        qa = q;
                    }
                    if (yb === null) {
                        const hb = hoehe(nb, px, pz);
                        if (hb !== null) {
                            yb = hb;
                            qb = q;
                        }
                    }
                }
                if (ya === null || yb === null || Math.abs(qa - qb) > 0.15) continue;
                gemeinsam++;
                const d = Math.abs(ya - yb);
                if (d > 0.01) o.stufen++;
                o.maxStufeCm = Math.max(o.maxStufeCm, d * 100);
                const wl = r._waterLevelAt(x, z);
                if (Math.abs(ya - wl) < 0.6 && Math.abs(yb - wl) < 0.6) {
                    o.spiegelProben++;
                    if (d > 0.01) o.spiegelStufen++;
                    o.spiegelMaxCm = Math.max(o.spiegelMaxCm, d * 100);
                }
            }
            if (gemeinsam) {
                o.kanten++;
                o.proben += gemeinsam;
            }
        }
    }
    o.maxStufeCm = +o.maxStufeCm.toFixed(2);
    o.spiegelMaxCm = +o.spiegelMaxCm.toFixed(2);
    return o;
}

// Selbsttest: zwei 4×4-m-Sheets nebeneinander (Grenze x = 4), das rechte 5 cm höher → die Linse muss Stufen melden;
// gleich hoch → keine.
function selbsttest() {
    const sheet = (x0, y) => {
        const pos = [x0, y, 0, x0 + 4, y, 0, x0 + 4, y, 4, x0, y, 4];
        return {
            geometry: { attributes: { position: { array: pos } }, index: { array: [0, 1, 2, 0, 2, 3], count: 6 } },
            matrixWorld: { elements: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] },
        };
    };
    const welt = (yRechts) => ({
        _voxelChunkConfig: () => ({ span: 4 }),
        _waterLevelAt: () => 10,
        state: {
            voxelChunkWaterIso: new Map([
                ["0,0", sheet(0, 10)],
                ["1,0", sheet(4, yRechts)],
            ]),
        },
    });
    const mitStufe = nahtLinse(welt(10.05));
    const ohne = nahtLinse(welt(10));
    const ok = mitStufe.spiegelStufen > 0 && Math.abs(mitStufe.spiegelMaxCm - 5) < 0.01 && ohne.spiegelStufen === 0;
    console.log(
        ok
            ? `✅ SELBST-TEST: die Naht-Linse feuert (5-cm-Stufe: ${mitStufe.spiegelStufen} Proben, max ${mitStufe.spiegelMaxCm} cm; bündig: 0)`
            : `❌ SELBST-TEST: ${JSON.stringify({ mitStufe, ohne })}`
    );
    process.exit(ok ? 0 : 1);
}

function main() {
    if (process.argv.includes("--selftest")) return selbsttest();
    const i = process.argv.indexOf("--port");
    const port = Number(i >= 0 ? process.argv[i + 1] : process.env.WERKBANK_PORT || 4490);
    const code = `return (${nahtLinse.toString()})(r);`;
    const req = http.request(
        { host: "127.0.0.1", port, path: "/eval", method: "POST", headers: { "Content-Type": "application/json" } },
        (res) => {
            let d = "";
            res.on("data", (c) => (d += c));
            res.on("end", () => {
                const j = JSON.parse(d);
                if (!j.ergebnis) {
                    console.log("❌ Werkbank-Antwort ohne Ergebnis: " + d.slice(0, 300));
                    process.exit(2);
                }
                const e = j.ergebnis;
                console.log(
                    `Wasser-Naht: ${e.kanten} Kanten · ${e.proben} Proben · Stufen > 1 cm ${e.stufen} (max ${e.maxStufeCm} cm) · ` +
                        `auf dem Spiegel ${e.spiegelStufen} von ${e.spiegelProben} (max ${e.spiegelMaxCm} cm)`
                );
            });
        }
    );
    req.on("error", (e) => {
        console.log(`❌ keine Werkbank auf :${port} (${e.message}) — erst \`node scripts/werkbank.cjs start\``);
        process.exit(2);
    });
    req.end(JSON.stringify({ code }));
}

main();
