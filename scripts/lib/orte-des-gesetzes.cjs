// orte-des-gesetzes.cjs — DIE ORTE DES GESETZES: jede Probe, die ein Merkmal des Geländes braucht (einen See, sein Ufer,
// das Meer, einen Wasserfall, eine Höhle unter dem See), liest es dort, wo das Gelände-Gesetz es setzt — nie an einer festen
// Wildnis-Koordinate, nie in der Heimat-Kachel. Seit der Landform im Kern (K16) trägt die Heimat keinen See und keinen Fall:
// die Seen sind die Senken des Flussnetzes (≤ 1 je km², der nächste 5,6 km vom Ursprung), die Fälle stehen im Gebirge. Die
// Proben, die in der Heimat suchten, wurden blind (Zweig-CI 38168337384 an grund-studio: Luft-Sicht „unter Wasser −1 m“,
// Klang „S seeufer“ und „O fallArm“, der Scatter-Selbsttest ohne Wasser, das Werk im Wasser). EIN Ort je Art, gecacht je Seite.
//
//   window.__wasserOrt(art)    "see" · "ufer" · "meer" · "hoehle" · "fall" → { x, z, hydro, lake?, wasser?, fall? } | null
//   window.__wasserChunk(art)  der Chunk am Ort, synchron über den EINEN Build-Eingang gebaut → Schlüssel | null
//
// Eingebaut als Seiten-Skript (`page.evaluateOnNewDocument(ORTE.ORTE_INSTALL)` oder `page.evaluate(ORTE.ORTE_INSTALL)`) von
// playtest, gate:luft-sicht, gate:klang-zensus, gate:scatter-ab und gate:werk-im-wasser.
"use strict";

function orteAn() {
    // DER WASSER-ORT (K16): jedes Band, das einen See oder das Meer prüft, liest ihn dort, wo das Gelände-Gesetz
    // ihn setzt — die Heimat-Kachel trägt keinen (die Seen sind die Senken des Flussnetzes, ≤ 1 je km²; das Meer liegt
    // jenseits des Kontinents). „see“: die nächste benannte Senke (gelaende-core `benannteSeen`), deren Kachel einen
    // gerenderten See (Spiegel > Meer + 2 m, ≥ 16 Zellen) trägt; „meer“: der nächste Punkt unter dem Meeresspiegel auf
    // Ringen um den Ursprung, dort die nächste Ozean-Zelle. Die Kachel wird über den EINEN Kachel-Eingang registriert
    // (`_ensureHydroTilesAround`), damit jeder Hydro-Leser (`_hydroFor`) sie findet. Rückgabe { x, z, hydro, lake }.
    window.__wasserOrt = (art) => {
        const r = window.anazhRealm;
        const G = window.__gelaendeCore;
        window.__wasserOrtCache = window.__wasserOrtCache || {};
        const c = window.__wasserOrtCache[art];
        if (c) {
            r._ensureHydroTilesAround(c.x, c.z, 0);
            return { ...c, hydro: r._hydroFor(c.x, c.z) };
        }
        const L = r._gelaende();
        const wl = r.state.waterLevel;
        const zelle = (h, q) => ({
            x: h.originX + ((q % h.dim) + 0.5) * h.cell,
            z: h.originZ + (((q / h.dim) | 0) + 0.5) * h.cell,
        });
        let ort = null;
        if (art === "see") {
            const step = 64;
            const n = 375;
            const kand = G.benannteSeen(L, -12000, -12000, step, n)
                .map((k) => ({ x: -12000 + (k % n) * step, z: -12000 + ((k / n) | 0) * step }))
                .sort((a, b) => a.x * a.x + a.z * a.z - (b.x * b.x + b.z * b.z));
            for (const k of kand) {
                r._ensureHydroTilesAround(k.x, k.z, 0);
                const h = r._hydroFor(k.x, k.z);
                const lake = h && h.lakes.find((l) => l.level > wl + 2 && l.cells && l.cells.length >= 16);
                if (!lake) continue;
                ort = { ...zelle(h, lake.cells[(lake.cells.length / 2) | 0]), lake };
                break;
            }
        } else if (art === "hoehle") {
            // eine trockene Höhle unter oder neben einem See des Gesetzes: von seinem Spiegel abwärts erst fester
            // Grund (die Decke), dann Luft (die Höhle), dann wieder Grund (ihr Boden). Gesucht in den See-Zellen und
            // ihrem Rand-Ring (4-m-Raster) der Seen um die benannten Senken, nächste zuerst.
            const step = 64;
            const n = 375;
            const kand = G.benannteSeen(L, -12000, -12000, step, n)
                .map((k) => ({ x: -12000 + (k % n) * step, z: -12000 + ((k / n) | 0) * step }))
                .sort((a, b) => a.x * a.x + a.z * a.z - (b.x * b.x + b.z * b.z));
            const geprueft = new Set();
            for (const k of kand.slice(0, 6)) {
                if (ort) break;
                r._ensureHydroTilesAround(k.x, k.z, 0);
                const h = r._hydroFor(k.x, k.z);
                for (const lake of (h && h.lakes) || []) {
                    if (ort || !(lake.level > wl + 2) || !lake.cells) break;
                    const zellen = new Set();
                    for (const q of lake.cells)
                        for (let dj = -1; dj <= 1; dj++)
                            for (let di = -1; di <= 1; di++) zellen.add(q + di + dj * h.dim);
                    for (const q of zellen) {
                        const key = h.originX + ":" + h.originZ + ":" + q;
                        if (ort || geprueft.has(key)) continue;
                        geprueft.add(key);
                        const p = zelle(h, q);
                        for (let sz = -6; sz <= 6 && !ort; sz += 4)
                            for (let sx = -6; sx <= 6 && !ort; sx += 4) {
                                let stufe = 0;
                                for (let y = lake.level - 0.5; y > lake.level - 40 && stufe < 3; y -= 1) {
                                    const fest = r._terrainDensityAt(p.x + sx, y, p.z + sz) > 0;
                                    if ((stufe === 0 && fest) || (stufe === 1 && !fest) || (stufe === 2 && fest))
                                        stufe++;
                                }
                                if (stufe === 3) ort = { x: p.x + sx, z: p.z + sz, lake };
                            }
                    }
                }
            }
        } else if (art === "meer") {
            for (let R = 512; R <= 40000 && !ort; R += 512)
                for (let a = 0; a < 64; a++) {
                    const x = R * Math.cos((a / 64) * 2 * Math.PI);
                    const z = R * Math.sin((a / 64) * 2 * Math.PI);
                    if (!(G.hoehe(L, x, z, false) < wl - 4)) continue;
                    r._ensureHydroTilesAround(x, z, 0);
                    const h = r._hydroFor(x, z);
                    let best = -1;
                    let bd = Infinity;
                    for (let q = 0; q < h.water.waterKind.length; q++) {
                        if (h.water.waterKind[q] !== 1) continue;
                        const p = zelle(h, q);
                        const d = (p.x - x) ** 2 + (p.z - z) ** 2;
                        if (d < bd) [bd, best] = [d, q];
                    }
                    if (best >= 0) ort = { ...zelle(h, best), lake: null };
                    break;
                }
        } else if (art === "ufer") {
            // das Ufer des Sees: von einer Rand-Zelle des Sees (nass, still) landeinwärts der erste trockene Punkt, dann
            // 3 m weiter — das Wasser liegt 3–4 m entfernt, das Ohr hört es auf seinem ersten Ring. Trocken und still nach
            // der EINEN Wasser-Wahrheit am Körper (`_nassAt`, `_waterFlowAt`); die Rand-Zellen in Zell-Reihenfolge.
            const see = window.__wasserOrt("see");
            if (see && see.lake && see.hydro) {
                const h = see.hydro;
                const zellen = new Set(see.lake.cells);
                let mx = 0;
                let mz = 0;
                for (const q of see.lake.cells) {
                    const p = zelle(h, q);
                    mx += p.x / see.lake.cells.length;
                    mz += p.z / see.lake.cells.length;
                }
                for (const q of see.lake.cells) {
                    if (ort) break;
                    if (![1, -1, h.dim, -h.dim].some((d) => !zellen.has(q + d))) continue;
                    const p = zelle(h, q);
                    if (!r._nassAt(p.x, p.z) || r._waterFlowAt(p.x, p.z)) continue;
                    const lg = Math.hypot(p.x - mx, p.z - mz) || 1;
                    const ux = (p.x - mx) / lg;
                    const uz = (p.z - mz) / lg;
                    for (let s = 1; s < 40; s++) {
                        const qx = p.x + ux * s;
                        const qz = p.z + uz * s;
                        if (r._nassAt(qx, qz)) continue;
                        const fx = qx + ux * 3;
                        const fz = qz + uz * 3;
                        if (!r._nassAt(fx, fz) && !r._waterFlowAt(fx, fz))
                            ort = { x: fx, z: fz, lake: see.lake, wasser: { x: p.x, z: p.z } };
                        break;
                    }
                }
            }
        } else if (art === "fall") {
            // der nächste Wasserfall des Gesetzes: die Hydro-Kacheln (dim × cell, die Heimat-Kachel um den Ursprung) Ring
            // um Ring, im ersten Ring mit Fällen der dem Ursprung nächste — der Fuß (x, z) und der Fall (topY, bottomY).
            const h0 = r.state.hydrosphere;
            const T = h0 && h0.dim && h0.cell ? h0.dim * h0.cell : 2048;
            let best = null;
            for (let ring = 0; ring <= 6 && !best; ring++)
                for (let i = -ring; i <= ring; i++)
                    for (let j = -ring; j <= ring; j++) {
                        if (Math.max(Math.abs(i), Math.abs(j)) !== ring) continue;
                        r._ensureHydroTilesAround(i * T, j * T, 0);
                        const h = r._hydroFor(i * T, j * T);
                        for (const f of (h && h.waterfalls) || []) {
                            const d = Math.hypot(f.x, f.z);
                            if (!best || d < best.d) best = { f, d };
                        }
                    }
            if (best) ort = { x: best.f.x, z: best.f.z, fall: best.f, lake: null };
        }
        if (!ort) return null;
        window.__wasserOrtCache[art] = ort;
        return { ...ort, hydro: r._hydroFor(ort.x, ort.z) };
    };
    // Der Wasser-Chunk am Wasser-Ort: synchron gebaut über den EINEN Build-Eingang und in die Chunk-Menge gelegt (der
    // Stream räumt ihn wie jeden fernen Chunk). Steht er schon mit Wasser-Zellen, bleibt alles, wie es ist.
    window.__wasserChunk = (art) => {
        const r = window.anazhRealm;
        if (!r.state.voxelChunks) r.state.voxelChunks = new Map();
        const ort = window.__wasserOrt(art);
        if (!ort) return null;
        const { span } = r._voxelChunkConfig(0);
        const cx = Math.floor(ort.x / span);
        const cz = Math.floor(ort.z / span);
        const key = `${cx},${cz}`;
        const da = r.state.voxelChunks.get(key);
        if (da && da.mesh && da.waterCells) return key;
        r._disposeVoxelChunk(key);
        r.state.voxelChunks.delete(key);
        const fresh = r._acquireVoxelChunkBuild(cx, cz, 0, { forceSync: true });
        if (fresh && fresh !== "pending") r._finalizeVoxelChunkBuild(cx, cz, 0, fresh, true);
        return r.state.voxelChunks.has(key) ? key : null;
    };
}

module.exports = { ORTE_INSTALL: `(${orteAn.toString()})();` };
