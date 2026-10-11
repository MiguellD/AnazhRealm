// orte-des-gesetzes.cjs — DIE ORTE DES GESETZES: jede Probe, die ein Merkmal des Geländes braucht (einen See, sein Ufer,
// das Meer, einen Wasserfall, eine Höhle unter dem See), liest es dort, wo das Gelände-Gesetz es setzt — nie an einer festen
// Wildnis-Koordinate, nie in der Heimat-Kachel. Seit der Landform im Kern (K16) trägt die Heimat keinen See und keinen Fall:
// die Seen sind die Senken des Flussnetzes (≤ 1 je km², der nächste 5,6 km vom Ursprung), die Fälle stehen im Gebirge. Die
// Proben, die in der Heimat suchten, wurden blind (Zweig-CI 38168337384 an grund-studio: Luft-Sicht „unter Wasser −1 m“,
// Klang „S seeufer“ und „O fallArm“, der Scatter-Selbsttest ohne Wasser, das Werk im Wasser). EIN Ort je Art, gecacht je Seite.
//
//   window.__wasserOrt(art, { nahe })  "see" · "ufer" · "meer" · "kueste" · "hoehle" · "fall" · "fluss" (der nächste nasse Fluss-Punkt
//                              zum Anker `nahe`) → { x, z, hydro, lake?, wasser?, fall?, fluss?, punkt? } | null
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
    window.__wasserOrt = (art, opt) => {
        const r = window.anazhRealm;
        const G = window.__gelaendeCore;
        const nahe = (opt && opt.nahe) || null;
        const schluessel = nahe ? art + "@" + nahe.join(",") : art;
        window.__wasserOrtCache = window.__wasserOrtCache || {};
        const c = window.__wasserOrtCache[schluessel];
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
            // ihrem Rand-Ring (4-m-Raster) der Seen um die benannten Senken, nächste zuerst — so, wie die Wasser-Zellen
            // sie sehen: je Zelle des Chunk-Gitters das Mittel der Dichte an ihren acht Ecken (`_buildVoxelChunkWaterCells`);
            // die Meter-Probe einer Spalte fand unter dem See eine Höhle, die keine Zelle trägt (0 von 0).
            const cfgH = r._voxelChunkConfig(0);
            const S = cfgH.step;
            const oyH = (r.state.terrainBaseHeight || 0) - cfgH.floorDrop;
            const zelleFest = (cx, cy, cz) => {
                let d = 0;
                for (const ex of [-S / 2, S / 2])
                    for (const ey of [-S / 2, S / 2])
                        for (const ez of [-S / 2, S / 2]) d += r._terrainDensityAt(cx + ex, cy + ey, cz + ez);
                return d > 0;
            };
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
                                const cx = (Math.floor((p.x + sx) / S) + 0.5) * S;
                                const cz = (Math.floor((p.z + sz) / S) + 0.5) * S;
                                let stufe = 0;
                                const j0 = Math.floor((lake.level - 0.5 - oyH) / S);
                                for (let j = j0; j > j0 - 40 / S && stufe < 3; j--) {
                                    const fest = zelleFest(cx, oyH + (j + 0.5) * S, cz);
                                    if ((stufe === 0 && fest) || (stufe === 1 && !fest) || (stufe === 2 && fest))
                                        stufe++;
                                }
                                if (stufe === 3) ort = { x: cx, z: cz, lake };
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
        } else if (art === "kueste") {
            // die Küste: vom Meer-Ort zum Ursprung der erste Punkt, an dem das Gesetz kein Wasser trägt (`_nassAt` ohne
            // Chunk), zurück 8 m ins Wasser — das Ufer des Meers mit seinem Küsten-Streifen
            const m = window.__wasserOrt("meer");
            if (m) {
                const lg = Math.hypot(m.x, m.z) || 1;
                const ux = -m.x / lg;
                const uz = -m.z / lg;
                for (let s = 0; s < 4000 && !ort; s += 4) {
                    const x = m.x + ux * s;
                    const z = m.z + uz * s;
                    r._ensureHydroTilesAround(x, z, 0);
                    if (!r._nassAt(x, z)) ort = { x: x - ux * 8, z: z - uz * 8, lake: null, land: { x, z } };
                }
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
        } else if (art === "fluss") {
            // der nächste Fluss-Punkt mit gezeichnetem Wasser (`_nassAt`) zum Anker `nahe` (Standard: der Ursprung), nie ein
            // Punkt im See (`inLake`: dort trägt der See, nicht der Lauf) — ein Fluss-Punkt allein ist kein Bach.
            const [ax, az] = nahe || [0, 0];
            r._ensureHydroTilesAround(ax, az, 200);
            const h = r._hydroFor(ax, az);
            let best = null;
            for (const f of (h && h.rivers) || [])
                f.points.forEach((q, i) => {
                    const d = Math.hypot(q.x - ax, q.z - az);
                    if (best && d >= best.d) return;
                    if (q.inLake || !r._nassAt(q.x, q.z)) return;
                    best = { d, x: q.x, z: q.z, fluss: f, punkt: i };
                });
            if (best) ort = { x: best.x, z: best.z, fluss: best.fluss, punkt: best.punkt, lake: null };
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
        window.__wasserOrtCache[schluessel] = ort;
        return { ...ort, hydro: r._hydroFor(ort.x, ort.z) };
    };
    // DER HAFEN (K16b, Klasse W): Wasser, das das Sheet über Atlas-Land zeichnet — gegraben mit dem Verb des Spielers an der
    // Küste des Gesetzes (`__wasserOrt("kueste")`): ein Kanal (Kugeln r 4, 2 m unter dem Meeresspiegel) von 10 m im Meer
    // 70 m landeinwärts und ein Becken (r 9) an seinem Ende. Das Atlas-Raster nennt das Becken Land (jenseits seines
    // 3×3-Rands), die Zellen fluten es vom Meer her. Bis K16 trug die Küste −88/−880 solche Spalten von selbst; die Küste der
    // Landform steigt glatt 0,5 m über den Meeresspiegel (am Ort 0 Spalten). Rückgabe { x, z } (die Mitte des Beckens) | null.
    window.__hafen = () => {
        const r = window.anazhRealm;
        window.__wasserOrtCache = window.__wasserOrtCache || {};
        if (window.__wasserOrtCache.hafen) return window.__wasserOrtCache.hafen;
        const K = window.__wasserOrt("kueste");
        if (!K || !K.land) return null;
        const wl = r.state.waterLevel;
        const lg = Math.hypot(K.land.x, K.land.z) || 1;
        const ux = -K.land.x / lg;
        const uz = -K.land.z / lg;
        for (let s = -10; s <= 70; s += 3) r.carveVoxelSphere(K.land.x + ux * s, wl - 2, K.land.z + uz * s, 4);
        const aus = { x: K.land.x + ux * 70, z: K.land.z + uz * 70 };
        r.carveVoxelSphere(aus.x, wl - 2, aus.z, 9);
        window.__wasserOrtCache.hafen = aus;
        return aus;
    };
    // DER WEG IN DEN SEE (K16b, Klasse W): der See des Gesetzes (`__wasserOrt("see")`) als Bühne der Proben, die vom Ufer
    // hineingehen, schwimmen, fahren, im Fenster zählen — bis K16 der See der Mess-Wiese (Ostufer −884/−650, Mitte −935/−650
    // 8 m tief, Rand-Streifen x = −944). `mitte`: die tiefste Zelle (der Grund `_voxelSurfaceY`), von der der Weg nach Osten
    // (+x, die Proben gehen nach −x hinein) über keinen Fluss (`_waterFlowAt`) ans trockene Ufer führt; `start` 4 m hinter der
    // Uferlinie (`_nassAt`); `rand`: Atlas-Land neben dem See (waterKind 0, 3×3 an einer See-Zelle), sein Boden ≥ 1 m unter
    // dem Spiegel (der Streifen, den das Gefährt lesen muss); `fenster` ± 40 m um die Mitte. Rückgabe
    // { mitte: [x, z], start: [x, z], tiefe, spiegel, rand: [[x, z]…], fenster: [x0, z0, x1, z1], lake } | null.
    window.__seeWeg = () => {
        const r = window.anazhRealm;
        window.__wasserOrtCache = window.__wasserOrtCache || {};
        if (window.__wasserOrtCache.seeWeg) return window.__wasserOrtCache.seeWeg;
        const see = window.__wasserOrt("see");
        if (!see || !see.lake || !see.hydro) return null;
        const h = see.hydro;
        const lake = see.lake;
        const S = lake.level;
        const zelle = (q) => ({
            x: h.originX + ((q % h.dim) + 0.5) * h.cell,
            z: h.originZ + (((q / h.dim) | 0) + 0.5) * h.cell,
        });
        const tief = [];
        for (const q of lake.cells) {
            const p = zelle(q);
            const g = r._voxelSurfaceY(p.x, p.z);
            if (Number.isFinite(g)) tief.push({ x: p.x, z: p.z, tiefe: S - g });
        }
        tief.sort((a, b) => b.tiefe - a.tiefe);
        let weg = null;
        for (const m of tief) {
            let ufer = null;
            for (let s = 1; s < 200; s++) {
                const x = m.x + s;
                if (r._waterFlowAt(x, m.z)) break;
                if (!r._nassAt(x, m.z)) {
                    ufer = x;
                    break;
                }
            }
            if (ufer === null || r._nassAt(ufer + 4, m.z) || r._waterFlowAt(ufer + 4, m.z)) continue;
            weg = { mitte: [m.x, m.z], start: [ufer + 4, m.z], tiefe: m.tiefe };
            break;
        }
        if (!weg) return null;
        const inSee = new Set(lake.cells);
        const rand = [];
        const gesehen = new Set();
        for (const q of lake.cells)
            for (let dj = -1; dj <= 1; dj++)
                for (let di = -1; di <= 1; di++) {
                    const n = q + di + dj * h.dim;
                    if (inSee.has(n) || gesehen.has(n) || h.water.waterKind[n] !== 0) continue;
                    gesehen.add(n);
                    const p = zelle(n);
                    const g = r._voxelSurfaceY(p.x, p.z);
                    if (Number.isFinite(g) && S - g >= 1) rand.push([p.x, p.z]);
                }
        const [mx, mz] = weg.mitte;
        const aus = Object.assign(weg, {
            spiegel: S,
            rand: rand.sort((p, q) => Math.hypot(p[0] - mx, p[1] - mz) - Math.hypot(q[0] - mx, q[1] - mz)).slice(0, 13),
            fenster: [mx - 40, mz - 40, mx + 40, mz + 40],
            lake,
        });
        window.__wasserOrtCache.seeWeg = aus;
        return aus;
    };
    // DER PRÜF-SPALT (K16b, Klasse H): seit die Canyon-Maske fiel (K16 1b98d609), bleibt jede Höhlen-Decke 16 m unter dem
    // Boden — die Welt trägt keinen Spalt, keinen Überhang und keine Mündung mehr (im 5-km-Quadrat um den Ursprung fällt
    // der Boden an 1 von 1,56 Mio. Stellen > 8 m auf 4 m). Die Proben, die einen Körper unter einem Überhang, über einer
    // Spaltkante oder in einer Mündung prüfen, graben ihn mit dem Verb des Spielers (`carveVoxelSphere`, EINE Edit-Wahrheit
    // für Feld, Gitter und Worker): ein Spalt längs z (Kugeln r 11, Mitte 7 m unter dem Rand — die Luft ist in der Tiefe
    // breiter als oben, der Rand hängt über) und ein Stollen in die Westwand (drei Reihen Kugeln r 3,5 nebeneinander, Mitte
    // 10 m tief, 22 m lang — die Mündung; sein Boden liegt eben über 3 m Breite, 6 m Luft unter 7 m Fels). Unter der Bühne
    // liegt 20 m keine natürliche Höhle (die Decken beginnen 16 m unter dem Boden, 24 m fand sich in 640 m keine Ebene) —
    // der Grund des Spalts bleibt darin (13–16 m): bis K16b-n4 grub der Spalt 22 m tief, sein Boden lag 2 m über den
    // versiegelten Höhlen, der Zensus des Fall-Wächters fand dort Leiber 14–34 m unter dem Grund. Der Ort: die nächste
    // trockene, ebene Fläche (± 24 m Spanne ≤ 4 m, kein Wasser in ± 36 m) zum Anker `nahe`.
    // Rückgabe { x0, z0, S, rand, grund, ueberhang: { x, z, grund, dach }, muendung: { x, y, z, dx, dz }, stollen } | null.
    // DIE EBENE (K16b, Klasse B): die nächste trockene, ebene Fläche zum Anker `nahe` — ± `halb` m (Raster 6 m) liegt die
    // Spanne des Bodens ≤ `spanne` m, kein Wasser in ± (halb + 12) m. Seit der Landform im Kern liegt die Mess-Wiese
    // (−900/−850) an einem Hang (Spanne 34,8 m in ± 40 m, Stufe bis 0,82 m je m): die Proben, die dort eine flache Gasse,
    // eine Strecke oder einen Bauplatz suchten, fanden den Hang. Rückgabe { x, z, y } | null (Ringe zu 16 m, bis 640 m).
    window.__ebenOrt = (opt) => {
        const r = window.anazhRealm;
        const nahe = (opt && opt.nahe) || [0, 0];
        const halb = (opt && opt.halb) || 24;
        const spanne = (opt && opt.spanne) || 4;
        // `massiv` m: so tief liegt unter der Fläche (Raster 8 m) kein Hohlraum — der Grund einer Bühne, die gegraben wird
        const massiv = (opt && opt.massiv) || 0;
        const schluessel = ["eben", nahe.join(","), halb, spanne, massiv].join("@");
        window.__wasserOrtCache = window.__wasserOrtCache || {};
        if (window.__wasserOrtCache[schluessel]) return window.__wasserOrtCache[schluessel];
        const top = (x, z) => r._voxelSurfaceY(x, z);
        const eben = (x, z) => {
            let lo = Infinity;
            let hi = -Infinity;
            for (let dz = -halb; dz <= halb; dz += 6)
                for (let dx = -halb; dx <= halb; dx += 6) {
                    const h = top(x + dx, z + dz);
                    if (!Number.isFinite(h)) return null;
                    lo = Math.min(lo, h);
                    hi = Math.max(hi, h);
                    if (hi - lo > spanne) return null;
                }
            for (let dz = -halb - 12; dz <= halb + 12; dz += 6)
                for (let dx = -halb - 12; dx <= halb + 12; dx += 6) if (r._nassAt(x + dx, z + dz)) return null;
            if (massiv > 0)
                for (let dz = -halb - 8; dz <= halb + 8; dz += 8)
                    for (let dx = -halb - 8; dx <= halb + 8; dx += 8) {
                        const h = top(x + dx, z + dz);
                        for (let y = h - 1; y > h - massiv; y -= 1) if (!r._fieldSolid(x + dx, y, z + dz)) return null;
                    }
            return top(x, z);
        };
        for (let ring = 0; ring <= 40; ring++)
            for (let k = 0; k < (ring ? 8 * ring : 1); k++) {
                const a = (k / (ring ? 8 * ring : 1)) * 2 * Math.PI;
                const x = Math.round(nahe[0] + Math.cos(a) * ring * 16);
                const z = Math.round(nahe[1] + Math.sin(a) * ring * 16);
                const y = eben(x, z);
                if (y !== null) return (window.__wasserOrtCache[schluessel] = { x, z, y });
            }
        return null;
    };
    window.__pruefSpalt = (opt) => {
        const r = window.anazhRealm;
        const nahe = (opt && opt.nahe) || [0, 0];
        const schluessel = "spalt@" + nahe.join(",");
        window.__wasserOrtCache = window.__wasserOrtCache || {};
        if (window.__wasserOrtCache[schluessel]) return window.__wasserOrtCache[schluessel];
        const top = (x, z) => r._voxelSurfaceY(x, z);
        const e = window.__ebenOrt({ nahe, halb: 24, spanne: 4, massiv: 20 });
        if (!e) return null;
        const [x0, z0, S] = [e.x, e.z, e.y];
        for (let z = z0 - 16; z <= z0 + 16; z += 4) r.carveVoxelSphere(x0, S - 7, z, 11);
        for (const dz of [-1.5, 0, 1.5])
            for (let x = x0 - 8; x >= x0 - 30; x -= 3) r.carveVoxelSphere(x, S - 10, z0 + dz, 3.5);
        const fest = (x, y, z) => r._fieldSolid(x, y, z);
        // der Rand: längs +x der letzte Punkt vor dem Abbruch (> 3 m auf 0,5 m), z neben dem Stollen (z0 + 12)
        const zr = z0 + 12;
        let rand = null;
        for (let x = x0 - 20; x < x0; x += 0.5) {
            const a = top(x, zr);
            const b = top(x + 0.5, zr);
            if (Number.isFinite(a) && Number.isFinite(b) && a - b > 3) {
                rand = { x, z: zr, y: a };
                break;
            }
        }
        const grund = { x: x0, z: zr, y: top(x0, zr) };
        // der Überhang: die Säule hinter dem Rand, die unter Fels ≥ 3 m Luft über festem Grund trägt (zur Kante hin)
        let ueberhang = null;
        for (let x = rand ? rand.x - 6 : x0 - 14; x <= (rand ? rand.x : x0) && !ueberhang; x += 0.5) {
            const dach = top(x, zr);
            if (!Number.isFinite(dach)) continue;
            let luftOben = null;
            for (let y = dach - 0.25; y > dach - 30; y -= 0.25) {
                const f = fest(x, y, zr);
                if (!f && luftOben === null) luftOben = y;
                if (f && luftOben !== null) {
                    // die Luft des Spalts beginnt unter der Lippe (≤ 4 m), nie eine natürliche Höhle darunter
                    if (luftOben - y >= 3 && luftOben > dach - 4) ueberhang = { x, z: zr, grund: y, dach };
                    break;
                }
            }
        }
        const muendung = { x: x0 - 9, y: S - 10, z: z0, dx: 1, dz: 0 };
        const aus = { x0, z0, S, rand, grund, ueberhang, muendung, stollen: { x1: x0 - 30, y: S - 10, z: z0 } };
        window.__wasserOrtCache[schluessel] = aus;
        return aus;
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
