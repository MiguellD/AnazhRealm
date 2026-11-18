// Zensus b (wasser) — die Messungen des Blatts b-wasser.md §2 in EINER Datei, reines Node, nur lesen.
// Aufruf: node b-mess.cjs [haupt|meer|netz|naht]   (netz und meer: node --max-old-space-size=3000 …)
// Lädt den Kern über den absoluten Pfad /home/user/AnazhRealm (main b7ed8419).
"use strict";
const WURZEL = "/home/user/AnazhRealm";
require(WURZEL + "/gelaende-core.js");
const G = globalThis.__gelaendeCore;
const RN = require(WURZEL + "/vendor/simplex-noise.js");
const SN = RN.SimplexNoise || RN.default || RN;

// Zensus b (wasser): Messung des Gelände-Kerns im reinen Node — Kosten der Hydrosphäre (ms, Bytes, Flächen-Skalierung),
// das Flussnetz nah und 1 000 km fern (Knoten-Zahl, ms), der Wasser-Spiegel an Adressen vor und nach der Kachel,
// die See-Zwillinge (Netz-Senke gegen Priority-Flood-See), die Bett-Tiefe aller Fluss-Punkte.
// Lädt den Kern über den absoluten Pfad. Nur lesen.
function haupt() {
    // Abschrift der Zahlen von stamm/daten.js:202-252 (HYDROSPHERE) — nur für die Messung; regionSize aus dem Kern (GRUND.kachel).
    function gesetz(regionSize) {
        return Object.freeze({
            regionSize: regionSize || G.GRUND.kachel,
            cell: 16,
            fillEpsilon: 0.01,
            minLakeCells: 6,
            waterfallSlope: 0.4,
            waterfallMinDrop: 6,
            maxRiverPoints: 800,
            carveBedMin: 1.4,
            carveBedK: 0.16,
            kanalTiefe: 0.8,
            spiegelFreibord: 0.25,
            bankNeigung: 0.7,
            bankKruemmung: 0.04,
            bankWeite: 24,
            bankRundung: 0.6,
            dammBreite: 2.6,
            dammFreibord: 0.2,
            quellBett: 1.2,
            quellWeitung: 0.25,
            carveLakeBedDepth: 8,
            carveBucketSize: 32,
        });
    }
    function lage(H) {
        const L = G.lageGrund("anazh-realm-seed", SN);
        L.ort = G.ortGesetz(null);
        L.hydroGesetz = H;
        L.regionSize = H.regionSize;
        return L;
    }
    const ms = (t0) => Number(process.hrtime.bigint() - t0) / 1e6;
    const jetzt = () => process.hrtime.bigint();
    function bytes(h) {
        let b = 0;
        const zaehl = (o) => {
            if (!o) return;
            if (ArrayBuffer.isView(o)) b += o.byteLength;
            else if (typeof o === "object") for (const k in o) if (k !== "rivers" && k !== "lakes" && k !== "waterfalls") zaehl(o[k]);
        };
        zaehl(h);
        const json = Buffer.byteLength(JSON.stringify({ rivers: h.rivers, lakes: h.lakes, waterfalls: h.waterfalls }));
        return { typed: b, json };
    }
    function region(L, H, origin) {
        const t0 = jetzt();
        const h = G.hydrosphaere(L, H, (x, z) => G.hoehe(L, x, z, true), origin);
        const t = ms(t0);
        const by = bytes(h);
        const muende = {};
        for (const rv of h.rivers) muende[rv.mouth] = (muende[rv.mouth] || 0) + 1;
        const seeOhneY = h.rivers.filter((rv) => rv.mouth === "see" && !Number.isFinite(rv.seeY)).length;
        return { h, ms: Math.round(t * 10) / 10, bytesTyped: by.typed, bytesJson: by.json, fluesse: h.rivers.length, seen: h.lakes.length, faelle: h.waterfalls.length, muende, seeOhneY, stats: h.stats };
    }
    const aus = {};

    // (1) Heimat-Region kalt (das Netz entsteht dabei) und warm
    {
        const H = gesetz();
        const L = lage(H);
        const n0 = G.netzZaehler(L).knoten;
        const kalt = region(L, H);
        const n1 = G.netzZaehler(L).knoten;
        const warm = region(L, H);
        aus.heim = { kaltMs: kalt.ms, warmMs: warm.ms, bytesTyped: kalt.bytesTyped, bytesJson: kalt.bytesJson, fluesse: kalt.fluesse, seen: kalt.seen, faelle: kalt.faelle, muende: kalt.muende, seeMuendungOhneSpiegel: kalt.seeOhneY, stats: kalt.stats, netzKnotenVor: n0, netzKnotenNach: n1 };

        // (2) Bett-Tiefe aller Fluss-Punkte: Anteil an der Decke kanalTiefe
        let n = 0, deckel = 0, voll = 0, vollDeckel = 0, tMin = Infinity, wMin = Infinity, wMax = 0;
        for (const rv of kalt.h.rivers)
            for (const p of rv.points) {
                const d = G.flussTiefe(H, p);
                n++;
                if (Math.abs(d - H.kanalTiefe) < 1e-9) deckel++;
                if (p.quelle === 1) { voll++; if (Math.abs(d - H.kanalTiefe) < 1e-9) vollDeckel++; }
                if (d < tMin) tMin = d;
                if (p.width < wMin) wMin = p.width;
                if (p.width > wMax) wMax = p.width;
            }
        aus.bettTiefe = { punkte: n, aufKanalTiefe: deckel, anteil: Math.round((1000 * deckel) / n) / 1000, vollePunkte: voll, vollAufDeckel: vollDeckel, tiefeMin: Math.round(tMin * 1000) / 1000, breiteMin: Math.round(wMin * 100) / 100, breiteMax: Math.round(wMax * 100) / 100 };

        // (3) See-Zwilling: Netz-Senken (benannteSeen, Ebene 0 senke=1) gegen Priority-Flood-Seen der Hydrosphäre, am selben Raster
        const h = kalt.h;
        const benannt = G.benannteSeen(L, h.originX, h.originZ, h.cell, h.dim);
        let benanntImFlutSee = 0;
        for (const idx of benannt) if (h.water.waterKind[idx] === 2) benanntImFlutSee++;
        let flutSeeMitName = 0;
        const benanntSet = new Set(benannt);
        for (const lk of h.lakes) if (lk.cells.some((c) => benanntSet.has(c))) flutSeeMitName++;
        // Netz-Läufe, die im Netz an einer Senke "see" enden
        const laeufe = G.flussLaeufe(L, h.originX, h.originZ, h.originX + h.dim * h.cell, h.originZ + h.dim * h.cell, h.cell);
        const ende = {};
        for (const lf of laeufe) ende[lf.ende] = (ende[lf.ende] || 0) + 1;
        aus.seeZwilling = { netzSenkenZellen: benannt.length, davonInFlutSee: benanntImFlutSee, flutSeen: h.lakes.length, flutSeenMitNetzSenke: flutSeeMitName, netzLaufEnden: ende, hydroMuendungen: kalt.muende };

        // (4) Spiegel an Adressen: Heimat geladen, keine Kachel
        L.hydrosphere = h;
        L.hydroTiles = new Map();
        const probe = (x, z) => {
            const y = G.hoehe(L, x, z, true);
            return { x, z, boden: Math.round(y * 100) / 100, atlas: G.atlasSpiegel(L, x, z, y), wasser: Math.round(G.wasserSpiegel(L, x, z) * 100) / 100, kachel: G.kachelSchluessel(L, x, z) };
        };
        // Wasser-Zellen der Heimat suchen (ein See, ein Fluss)
        let seeP = null, flussP = null, meerP = null;
        for (let i = 0; i < h.dim * h.dim && !(seeP && meerP); i++) {
            const x = h.originX + ((i % h.dim) + 0.5) * h.cell, z = h.originZ + (((i / h.dim) | 0) + 0.5) * h.cell;
            if (!seeP && h.water.waterKind[i] === 2) seeP = [x, z];
            if (!meerP && h.water.waterKind[i] === 1) meerP = [x, z];
        }
        for (const rv of h.rivers) { if (rv.points.length > 20) { const p = rv.points[10]; flussP = [p.x, p.z]; break; } }
        aus.spiegelNah = [probe(0, 0)];
        if (seeP) aus.spiegelNah.push(Object.assign({ art: "see" }, probe(seeP[0], seeP[1])));
        if (flussP) aus.spiegelNah.push(Object.assign({ art: "fluss" }, probe(flussP[0], flussP[1])));
        if (meerP) aus.spiegelNah.push(Object.assign({ art: "meer" }, probe(meerP[0], meerP[1])));

        // (5) 1 000 km fern: vor der Kachel (nur Heimat geladen) und nach ihr
        const FX = 1e6, FZ = 0;
        const key = G.kachelSchluessel(L, FX, FZ);
        const [kx, kz] = key.split(",").map(Number);
        const origin = { x: kx * H.regionSize - H.regionSize / 2, z: kz * H.regionSize - H.regionSize / 2 };
        const nf0 = G.netzZaehler(L).knoten;
        const t0 = jetzt();
        const y0 = G.hoehe(L, FX, FZ, true);
        const hoeheFernKaltMs = ms(t0);
        const nf1 = G.netzZaehler(L).knoten;
        const t1 = jetzt();
        G.hoehe(L, FX + 3, FZ + 3, true);
        const hoeheFernWarmMs = ms(t1);
        // Raster 64 × 64 über die ferne Kachel: der Spiegel vor der Kachel
        const vor = [];
        const R = 64, st = H.regionSize / R;
        for (let j = 0; j < R; j++) for (let i = 0; i < R; i++) {
            const x = origin.x + (i + 0.5) * st, z = origin.z + (j + 0.5) * st, y = G.hoehe(L, x, z, true);
            vor.push([x, z, y, G.atlasSpiegel(L, x, z, y)]);
        }
        const fern = region(L, H, origin);
        L.hydroTiles.set(key, fern.h);
        let nassVor = 0, nassNach = 0, anders = 0, meerWirdLand = 0, landWirdSee = 0, maxDiff = 0;
        for (const [x, z, y, a] of vor) {
            const b = G.atlasSpiegel(L, x, z, y);
            const nv = a > y, nn = b > y;
            if (nv) nassVor++;
            if (nn) nassNach++;
            if (nv !== nn) anders++;
            if (nv && !nn) meerWirdLand++;
            if (!nv && nn) landWirdSee++;
            if (Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) > maxDiff) maxDiff = Math.abs(a - b);
        }
        aus.fern = { adresse: [FX, FZ], kachel: key, origin, boden: Math.round(y0 * 100) / 100, hoeheKaltMs: Math.round(hoeheFernKaltMs * 10) / 10, hoeheWarmMs: Math.round(hoeheFernWarmMs * 1000) / 1000, netzKnotenVorFern: nf0, netzKnotenNachFernHoehe: nf1,
            kachelMs: fern.ms, kachelBytesTyped: fern.bytesTyped, kachelBytesJson: fern.bytesJson, fluesse: fern.fluesse, seen: fern.seen, muende: fern.muende, stats: fern.stats,
            raster: R * R, nassVorKachel: nassVor, nassNachKachel: nassNach, urteilWechselt: anders, nassWirdTrocken: meerWirdLand, trockenWirdNass: landWirdSee, maxSpiegelDiffM: Math.round(maxDiff * 100) / 100,
            spiegelAdresse: { vor: vor.length ? null : null } };
        // eine Adresse fern: Spiegel vor/nach
        const yF = G.hoehe(L, FX, FZ, true);
        L.hydroTiles.delete(key);
        const aVor = G.atlasSpiegel(L, FX, FZ, yF);
        L.hydroTiles.set(key, fern.h);
        const aNach = G.atlasSpiegel(L, FX, FZ, yF);
        aus.fern.spiegelAdresse = { boden: Math.round(yF * 100) / 100, vorKachel: aVor, nachKachel: aNach, wasserSpiegelNach: Math.round(G.wasserSpiegel(L, FX, FZ) * 100) / 100 };
        // ohne jede Region (vor der Heimat-Hydrosphäre)
        const L0 = lage(H);
        aus.ohneRegion = { atlasSpiegel00: G.atlasSpiegel(L0, 0, 0, G.hoehe(L0, 0, 0, true)), atlasSpiegelUnterMeer: G.atlasSpiegel(L0, 0, 0, -50), wasserSpiegel00: G.wasserSpiegel(L0, 0, 0) };
    }

    // (6) Flächen-Skalierung der Hydrosphäre: Kante 1024 · 2048 · 4096 m (Zelle 16 m), je frischer Lage, das Netz vorgewärmt
    {
        aus.skalierung = [];
        for (const s of [1024, 2048, 4096]) {
            const H = gesetz(s);
            const L = lage(H);
            const vorw = jetzt();
            G.flussLaeufe(L, -s / 2, -s / 2, s / 2, s / 2, 16);
            const netzMs = ms(vorw);
            const r = region(L, H);
            const r2 = region(L, H);
            aus.skalierung.push({ kanteM: s, zellen: (s / 16) ** 2, netzVorlaufMs: Math.round(netzMs * 10) / 10, ms: r.ms, msWarm: r2.ms, bytesTyped: r.bytesTyped, bytesJson: r.bytesJson, fluesse: r.fluesse, seen: r.seen, knoten: G.netzZaehler(L).knoten });
        }
    }

    // (7) See-Zwilling und Kachel-Naht über 3 × 3 Kacheln um die Heimat und um eine Küste: Netz-Senken (benannteSeen) gegen
    // Flut-Seen; Seen, deren Kasten die Kachel-Kante berührt; Meer-Zellen; Fluss-Enden "border"
    {
        const H = gesetz();
        const L = lage(H);
        // eine Küste suchen: die erste Stelle auf der +x-Achse (Schritt 256 m, bis 200 km) unter dem Meer
        let kx = null;
        for (let x = 0; x < 2e5; x += 256) if (G.hoehe(L, x, 0, false) < L.waterLevel - 5) { kx = x; break; }
        aus.kuesteX = kx;
        const felder = [["heim", 0, 0]];
        if (kx !== null) felder.push(["kueste", Math.floor((kx + 1024) / 2048), 0]);
        aus.kacheln = [];
        for (const [name, cx, cz] of felder) {
            const sum = { name, kacheln: 0, ms: 0, flutSeen: 0, flutSeeZellen: 0, seenAmRand: 0, netzSenkenZellen: 0, netzSenkenInFlutSee: 0, flutSeenMitNetzSenke: 0, meerZellen: 0, fluesse: 0, fluesseBorder: 0, seeMuendung: 0, seeMuendungOhneSpiegel: 0 };
            for (let dz = -1; dz <= 1; dz++)
                for (let dx = -1; dx <= 1; dx++) {
                    const origin = { x: (cx + dx) * 2048 - 1024, z: (cz + dz) * 2048 - 1024 };
                    const r = region(L, H, origin);
                    const h = r.h;
                    sum.kacheln++;
                    sum.ms += r.ms;
                    sum.flutSeen += h.lakes.length;
                    sum.meerZellen += h.stats.seaCells;
                    sum.fluesse += h.rivers.length;
                    sum.fluesseBorder += r.muende.border || 0;
                    sum.seeMuendung += r.muende.see || 0;
                    sum.seeMuendungOhneSpiegel += r.seeOhneY;
                    const lo = h.originX + h.cell, hi = h.originX + (h.dim - 1) * h.cell, loZ = h.originZ + h.cell, hiZ = h.originZ + (h.dim - 1) * h.cell;
                    for (const lk of h.lakes) {
                        sum.flutSeeZellen += lk.cells.length;
                        if (lk.bbox.minX < lo || lk.bbox.maxX > hi || lk.bbox.minZ < loZ || lk.bbox.maxZ > hiZ) sum.seenAmRand++;
                    }
                    const benannt = G.benannteSeen(L, h.originX, h.originZ, h.cell, h.dim);
                    sum.netzSenkenZellen += benannt.length;
                    const bs = new Set(benannt);
                    for (const idx of benannt) if (h.water.waterKind[idx] === 2) sum.netzSenkenInFlutSee++;
                    for (const lk of h.lakes) if (lk.cells.some((c) => bs.has(c))) sum.flutSeenMitNetzSenke++;
                }
            sum.ms = Math.round(sum.ms);
            aus.kacheln.push(sum);
        }
    }
    aus.heapMB = Math.round(process.memoryUsage().heapUsed / 1e5) / 10;
    console.log(JSON.stringify(aus, null, 1));
}

// Zensus b (wasser): der Meer-Anteil der Heimat-Lage — Anteil der Makro-Höhe unter dem Meeresspiegel (−3 m) in Kästen um den
// Ursprung, und die nächste Meer-Stelle; danach die Kachel an dieser Küste: Meer-Zellen, Seen unter dem Meer (Tote-Meer-Regel).
function meer() {
    const L = G.lageGrund("anazh-realm-seed", SN);
    L.ort = G.ortGesetz(null);
    const aus = { waterLevel: L.waterLevel, kaesten: [] };
    let naechst = null;
    for (const [R, st] of [[10000, 500], [20000, 1000], [50000, 2500]]) {
        let n = 0, unter = 0;
        for (let z = -R; z <= R; z += st)
            for (let x = -R; x <= R; x += st) {
                const y = G.hoehe(L, x, z, false);
                n++;
                if (y < L.waterLevel) {
                    unter++;
                    const d = Math.hypot(x, z);
                    if (!naechst || d < naechst.d) naechst = { x, z, d: Math.round(d), y: Math.round(y * 10) / 10 };
                }
            }
        aus.kaesten.push({ halbKanteKm: R / 1000, schrittM: st, proben: n, unterMeer: unter, anteil: Math.round((1e4 * unter) / n) / 1e4 });
    }
    aus.naechstesMeer = naechst;
    if (naechst) {
        const H = {
            regionSize: G.GRUND.kachel, cell: 16, fillEpsilon: 0.01, minLakeCells: 6, waterfallSlope: 0.4, waterfallMinDrop: 6,
            maxRiverPoints: 800, carveBedMin: 1.4, carveBedK: 0.16, kanalTiefe: 0.8, spiegelFreibord: 0.25, bankNeigung: 0.7,
            bankKruemmung: 0.04, bankWeite: 24, bankRundung: 0.6, dammBreite: 2.6, dammFreibord: 0.2, quellBett: 1.2, quellWeitung: 0.25,
            carveLakeBedDepth: 8, carveBucketSize: 32,
        };
        L.hydroGesetz = H;
        const key = G.kachelSchluessel(L, naechst.x, naechst.z).split(",").map(Number);
        const origin = { x: key[0] * 2048 - 1024, z: key[1] * 2048 - 1024 };
        const t0 = process.hrtime.bigint();
        const h = G.hydrosphaere(L, H, (x, z) => G.hoehe(L, x, z, true), origin);
        const ms = Number(process.hrtime.bigint() - t0) / 1e6;
        let unterMeerSeen = 0;
        for (const lk of h.lakes) if (lk.level < L.waterLevel) unterMeerSeen++;
        let unterMeerLand = 0;
        for (let i = 0; i < h.dim * h.dim; i++) if (h.water.waterKind[i] === 0 && h.water.waterY[i] === L.waterLevel) { /* trockene Zelle traegt den Meeresspiegel */ }
        // Zellen unter dem Meer, die die Kachel NICHT Meer nennt (Binnen-Mulde: See oder Land)
        // (gezählt an der Fläche des Rasters: surf ist intern; wir fragen hoehe ohne Detail an der Zell-Mitte)
        for (let j = 0; j < h.dim; j++)
            for (let i = 0; i < h.dim; i++) {
                const x = h.originX + (i + 0.5) * h.cell, z = h.originZ + (j + 0.5) * h.cell;
                if (G.hoehe(L, x, z, false) < L.waterLevel && h.water.waterKind[i + j * h.dim] !== 1) unterMeerLand++;
            }
        aus.kuestenKachel = { origin, ms: Math.round(ms), stats: h.stats, seen: h.lakes.length, seenUnterMeer: unterMeerSeen, zellenUnterMeerNichtMeer: unterMeerLand, fluesse: h.rivers.length };
    }
    console.log(JSON.stringify(aus, null, 1));
}

// Zensus b (wasser): das Flussnetz als Funktion der Adresse — Knoten (Ebene 0/1/2) und Heap, die je Frage entstehen,
// und die Zeit je Frage; nah (Heimat) und an fernen Adressen. Dann der Meer-Anteil in kleinen Kästen (begrenzt).
function netz() {
    const L = G.lageGrund("anazh-realm-seed", SN);
    L.ort = G.ortGesetz(null);
    const heap = () => Math.round(process.memoryUsage().heapUsed / 1e5) / 10;
    const sum = (a) => a[0] + a[1] + a[2];
    const aus = { einzel: [], flaeche: [] };
    // (a) je Adresse EINE Höhen-Frage: neue Knoten und ms
    for (const [x, z] of [[0, 0], [5000, 0], [50000, 0], [1e6, 0], [1e6, 1e6], [-3e6, 2e6]]) {
        const k0 = G.netzZaehler(L).knoten;
        const t0 = process.hrtime.bigint();
        const y = G.hoehe(L, x, z, true);
        const ms = Number(process.hrtime.bigint() - t0) / 1e6;
        const k1 = G.netzZaehler(L).knoten;
        aus.einzel.push({ x, z, hoehe: Math.round(y * 10) / 10, ms: Math.round(ms * 10) / 10, neueKnoten: [k1[0] - k0[0], k1[1] - k0[1], k1[2] - k0[2]], heapMB: heap() });
    }
    // (b) Fläche: Raster 1 km über wachsende Kästen um (2e6, 0) — Knoten und Heap je km²
    for (const R of [2000, 5000, 10000, 20000]) {
        const k0 = sum(G.netzZaehler(L).knoten);
        const h0 = heap();
        const t0 = process.hrtime.bigint();
        let n = 0, unter = 0;
        for (let z = -R; z <= R; z += 1000)
            for (let x = 2e6 - R; x <= 2e6 + R; x += 1000) {
                n++;
                if (G.hoehe(L, x, z, false) < L.waterLevel) unter++;
            }
        const ms = Number(process.hrtime.bigint() - t0) / 1e6;
        const k1 = sum(G.netzZaehler(L).knoten);
        aus.flaeche.push({ kastenKm: (2 * R) / 1000, proben: n, unterMeer: unter, ms: Math.round(ms), knotenNeu: k1 - k0, knotenGesamt: k1, heapMB: heap(), heapDeltaMB: Math.round((heap() - h0) * 10) / 10 });
    }
    console.log(JSON.stringify(aus, null, 1));
}

// Zensus b (wasser): die Kachel-Naht des Fluss-Spiegels — zwei Nachbar-Kacheln rechnen ihre Spiegel `S` je für sich
// (`hydroRiverSpiegel` je Region); dieselbe Bahn des Netzes liegt in beiden. Vergleich: der Spiegel am selben Ort beiderseits
// der Kante: je Fluss-Punkt von A (≤ 48 m vor der Kante) der nächste Punkt von B (≤ 24 m) — verglichen wird der Spiegel über
// der Sohle des Netzes (S − y; die Sohle y ist die globale Funktion des Netzes, das Gefälle fällt so heraus).
function naht() {
    const H = {
        regionSize: G.GRUND.kachel, cell: 16, fillEpsilon: 0.01, minLakeCells: 6, waterfallSlope: 0.4, waterfallMinDrop: 6,
        maxRiverPoints: 800, carveBedMin: 1.4, carveBedK: 0.16, kanalTiefe: 0.8, spiegelFreibord: 0.25, bankNeigung: 0.7,
        bankKruemmung: 0.04, bankWeite: 24, bankRundung: 0.6, dammBreite: 2.6, dammFreibord: 0.2, quellBett: 1.2, quellWeitung: 0.25,
        carveLakeBedDepth: 8, carveBucketSize: 32,
    };
    const L = G.lageGrund("anazh-realm-seed", SN);
    L.ort = G.ortGesetz(null);
    L.hydroGesetz = H;
    const boden = (x, z) => G.hoehe(L, x, z, true);
    const aus = { paare: [] };
    for (const [ax, az, bx, bz] of [[0, 0, 1, 0], [0, 0, 0, 1], [0, 0, -1, 0], [0, 0, 0, -1]]) {
        const oA = { x: ax * 2048 - 1024, z: az * 2048 - 1024 }, oB = { x: bx * 2048 - 1024, z: bz * 2048 - 1024 };
        const hA = G.hydrosphaere(L, H, boden, oA), hB = G.hydrosphaere(L, H, boden, oB);
        // Kante: x = 1024 (bx = 1) usw.
        const kanteX = bx !== ax ? (bx > ax ? 1024 : -1024) : null, kanteZ = bz !== az ? (bz > az ? 1024 : -1024) : null;
        const LA = Object.assign({}, L, { hydrosphere: hA, hydroTiles: new Map() });
        const LB = Object.assign({}, L, { hydrosphere: hB, hydroTiles: new Map() });
        let n = 0, maxD = 0, summe = 0, ueber10cm = 0;
        for (const rv of hA.rivers)
            for (const p of rv.points) {
                const d = kanteX !== null ? Math.abs(p.x - kanteX) : Math.abs(p.z - kanteZ);
                if (d > 48) continue;
                // derselbe Ort auf der anderen Seite: am Punkt selbst, die Region B kennt ihn nur jenseits der Kante — wir fragen
                // den Punkt um 2 × d gespiegelt? Nein: wir fragen B an seinen eigenen Punkten nahe der Kante und vergleichen mit A
                // am selben Ort (A kennt ihn nicht). Darum: je Fluss-Punkt von A der nächste Punkt von B jenseits der Kante (≤ 24 m).
                let best = null, bd = 24;
                for (const rb of hB.rivers)
                    for (const q of rb.points) {
                        const dd = Math.hypot(q.x - p.x, q.z - p.z);
                        if (dd < bd) { bd = dd; best = q; }
                    }
                if (!best || !Number.isFinite(p.S) || !Number.isFinite(best.S)) continue;
                n++;
                const diff = Math.abs((p.S - p.y) - (best.S - best.y));
                summe += diff;
                if (diff > maxD) maxD = diff;
                if (diff > 0.1) ueber10cm++;
            }
        aus.paare.push({ A: oA, B: oB, punktPaare: n, mittelDiffM: n ? Math.round((1000 * summe) / n) / 1000 : null, maxDiffM: Math.round(maxD * 1000) / 1000, ueber10cm });
        void LA; void LB;
    }
    console.log(JSON.stringify(aus, null, 1));
}

const wahl = process.argv[2] || "haupt";
const lauf = { haupt, meer, netz, naht }[wahl];
if (!lauf) throw new Error("unbekannt: " + wahl + " (haupt|meer|netz|naht)");
lauf();
