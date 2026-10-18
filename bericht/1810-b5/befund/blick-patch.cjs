// 1810 B5 Finder: Zusatz zum Lieferungs-Instrument (nach lieferung-patch.cjs anwenden) — die Haupt-Faden-Arbeit der Ankunft
// VOR dem Bild, geteilt nach „im ersten Blick" (`_imErstenBlick` / `_rangImErstenBlick`, dieselbe Frage wie Tor und Pumpe) und
// „außer Blick": Boden-Chunk (Worker-Mesh → Satz, Fertigbau), Streu-Region, Pflanzung, Bau-Satz, Karte, Hülle, Sichthöhe.
// Je Name [ms im Blick, ms außer Blick, n im, n außer] in A.blick (verschachtelte Glieder zählen je Name).
//   node blick-patch.cjs <baum>      zurück: git -c core.autocrlf=false checkout -- scripts/diag-boot-stage.cjs
"use strict";
const fs = require("fs");
const path = require("path");
const f = path.join(process.argv[2], "scripts", "diag-boot-stage.cjs");
let s = fs.readFileSync(f, "utf8");
if (s.includes("OMEN 1810 B5 Blick")) {
    console.log(f, "schon gepatcht");
    process.exit(0);
}
if (!s.includes("OMEN 1810 B5: die Lieferungen")) throw new Error("erst lieferung-patch.cjs anwenden");
const ers = (a, n) => {
    if (s.split(a).length !== 2) throw new Error(`Anker nicht eindeutig: ${JSON.stringify(a)}`);
    s = s.replace(a, n);
};
ers(
    "    let gewickelt = false;\n",
    "    // OMEN 1810 B5 Blick: Haupt-Faden-Arbeit vor dem Bild, im Blick / außer Blick\n" +
        "    A.blick = {};\n" +
        "    const wickleBlick = (P) => {\n" +
        "        const SC = () => window.anazhRealm.constructor.SCATTER;\n" +
        "        const ding = () => window.anazhRealm.constructor.ERSTER_BLICK.dingM;\n" +
        "        const lage = {\n" +
        "            _buildVoxelChunkDataFromWorkerMesh: (r, a) => { const sp = r._voxelChunkConfig().span; return [(a[0] + 0.5) * sp, (a[1] + 0.5) * sp, sp * Math.SQRT1_2]; },\n" +
        "            _finalizeVoxelChunkBuild: (r, a) => { const sp = r._voxelChunkConfig().span; return [(a[0] + 0.5) * sp, (a[1] + 0.5) * sp, sp * Math.SQRT1_2]; },\n" +
        "            _ensureVoxelChunkAt: (r, a) => { const sp = r._voxelChunkConfig().span; return [(a[0] + 0.5) * sp, (a[1] + 0.5) * sp, sp * Math.SQRT1_2]; },\n" +
        "            _scatterRegion: (r, a) => { const m = SC().regionM; return [(a[0] + 0.5) * m, (a[1] + 0.5) * m, m * Math.SQRT1_2]; },\n" +
        "            _naturSetzen: (r, a) => (a[1] ? [a[1].x, a[1].z, ding()] : null),\n" +
        "            spawnArchitecture: (r, a) => (a[1] ? [a[1].x, a[1].z, ding()] : null),\n" +
        "            _rebuildArchitectureMesh: (r, a) => (a[0] && a[0].position ? [a[0].position.x, a[0].position.z, ding()] : null),\n" +
        "            _populateBlockerAABBs: (r, a) => (a[0] && a[0].position ? [a[0].position.x, a[0].position.z, ding()] : null),\n" +
        "            _lodTreeVisHeight: (r, a) => { const e = a[0]; const q = e && (e.position || e.wo); return q && Number.isFinite(q.x) ? [q.x, q.z, ding()] : null; },\n" +
        "            _karteWeltBacken: (r, a) => ({ rang: a[1] ? a[1]._bedarfD2 : Infinity }),\n" +
        "        };\n" +
        "        for (const name of Object.keys(lage)) {\n" +
        "            const alt = P[name];\n" +
        "            if (typeof alt !== 'function') continue;\n" +
        "            P[name] = function () {\n" +
        "                if (this.state._weltbildDa) return alt.apply(this, arguments);\n" +
        "                let im = null;\n" +
        "                try {\n" +
        "                    const l = lage[name](this, arguments);\n" +
        "                    if (l && 'rang' in l) im = this._rangImErstenBlick(l.rang);\n" +
        "                    else if (l) im = this._imErstenBlick(l[0], l[1], l[2]);\n" +
        "                } catch (_e) {}\n" +
        "                const t0 = performance.now();\n" +
        "                try {\n" +
        "                    return alt.apply(this, arguments);\n" +
        "                } finally {\n" +
        "                    const z = A.blick[name] || (A.blick[name] = [0, 0, 0, 0, 0]);\n" +
        "                    const ms = performance.now() - t0;\n" +
        "                    if (im === true) { z[0] += ms; z[2]++; } else if (im === false) { z[1] += ms; z[3]++; } else z[4] += ms;\n" +
        "                }\n" +
        "            };\n" +
        "        }\n" +
        "    };\n" +
        "    let gewickelt = false;\n"
);
ers(
    "                wickleLf(Object.getPrototypeOf(r));\n",
    "                wickleLf(Object.getPrototypeOf(r));\n                wickleBlick(Object.getPrototypeOf(r));\n"
);
// die Gegenprobe OHNE DORF (nur mit B5_OHNE_DORF=1): der Gate-Hook `__anazhAutoSettlement = false` (`_dorfTaktLebt`) — kein
// Start-Dorf, kein Term „dorf", keine Häuser im ersten Blick; sonst dieselbe Welt
ers(
    "        await page.evaluateOnNewDocument(KALT_PROBE);\n",
    "        await page.evaluateOnNewDocument(KALT_PROBE);\n" +
        "        if (process.env.B5_OHNE_DORF) await page.evaluateOnNewDocument(() => { window.__anazhAutoSettlement = false; });\n" +
        // serie4 (E-Läufe): OHNE START-DORF, der Genesis-Ort bleibt (`_startDorfFaellig` liest `_autoSettlementStartHopeless`)
        "        // OMEN 1810 B5 Gegenprobe OHNE START-DORF (nur mit B5_OHNE_STARTDORF=1): der Genesis-Ort bleibt, das Start-Dorf ist hoffnungslos (`_startDorfFaellig`)\n" +
        "        if (process.env.B5_OHNE_STARTDORF) await page.evaluateOnNewDocument(() => { const h = setInterval(() => { const r = window.anazhRealm; if (r) { r._autoSettlementStartHopeless = true; clearInterval(h); } }, 20); });\n"
);
fs.writeFileSync(f, s);
console.log(f, "gepatcht (B5 Blick)");
