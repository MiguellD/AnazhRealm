// DIE TÄTER-ZAHL der Bahn gezeiten-2: die Station `GEZEIT_AN` (Heimat, wörtlich) einmal mit der Küste FERN vom Spieler (kein
// Chunk geladen: der Leser fällt aufs Gesetz) und einmal mit dem Spieler AN der Küste (die Chunks stehen: der Leser liest das
// gezeichnete Sheet) — so wie am Gerät, wo die Sitzung um den Spieler baut.
"use strict";
const path = require("path");
const WURZEL = path.resolve(__dirname, "..", "..");
const WB = require(path.join(WURZEL, "scripts/lib/welt-boot.cjs"));
const server = WB.statikServer();
WB.hauptLauf(async () => {
    const { browser, page } = await WB.nullWelt(server, { da: (r) => r.state && r.state.player, frist: 600000 }, 120000);
    const lauf = (nah) =>
        page.evaluate(async (nah) => {
            const r = window.anazhRealm, G = globalThis.__gelaendeCore, st = r.state;
            const L = r._gelaende(), wl = st.waterLevel;
            const nassIn = (x, z) => G.hoehe(L, x, z, false) < wl;
            const n0 = nassIn(0, 0);
            let quer = null;
            for (let d = 250; d <= 20000 && !quer; d += 250)
                for (let i = 0; i < 16 && !quer; i++) {
                    const c = Math.cos((i * Math.PI) / 8), s = Math.sin((i * Math.PI) / 8);
                    if (nassIn(d * c, d * s) === n0) continue;
                    let e = d - 250;
                    while (e < d && nassIn(e * c, e * s) === n0) e += 10;
                    quer = [];
                    for (let t = 0; t <= 10; t++) { const q = n0 ? e - (t - 5) * 40 : e + (t - 5) * 40; quer.push([q * c, q * s, G.hoehe(L, q * c, q * s, false)]); }
                }
            const [sx, sz] = quer[10];
            if (nah) {
                // der Ring um den Messpunkt wie `wasserStrom` (wasser-linse): der Spieler am See-Ende, der Ring baut synchron
                const zurueck = [];
                const leihe = (o, t) => { const a = {}; for (const k of Object.keys(t)) { a[k] = o[k]; o[k] = t[k]; } return () => Object.assign(o, a); };
                st.playerMesh.position.set(sx, r._voxelSurfaceY(sx, sz) + 2, sz);
                if (st._fixedSimPos) st._fixedSimPos.copy(st.playerMesh.position);
                await __weltDa(() => !r._ensureHydroTilesAround(sx, sz, 2048));
                zurueck.push(leihe(st, { voxelWorker: null }), leihe(r, { _syncStelle: "naht" }));
                try {
                    for (let last = -1, still = 0, n = 0; n < 9000; n++, await new Promise((f) => setTimeout(f, 0))) {
                        __handTakt();
                        const k = st.voxelChunks ? st.voxelChunks.size : 0;
                        still = k === last ? still + 1 : 0;
                        last = k;
                        if (k >= 9 && still > 30 && !r._weltOffen().chunks) break;
                    }
                } finally {
                    for (const z of zurueck.reverse()) z();
                }
            }
            for (const [x, z] of [quer[0], quer[10]]) { let n = 0; while (r._ensureHydroTilesAround(x, z, 32) && n < 100) { await new Promise((f) => setTimeout(f, 50)); n++; } }
            const span = r._voxelChunkConfig(0).span;
            const chunk = !!st.voxelChunks && st.voxelChunks.has(`${Math.floor(sx / span)},${Math.floor(sz / span)}`);
            const alt = st.spielZeit, stundeS = r._kalender().normS / 24;
            const s1 = [];
            for (let h = 0; h < 25; h++) {
                try {
                    st.spielZeit = alt + h * stundeS;
                    r._pegelTakt();
                    s1.push({ zeit: h, spiegel: Math.round(r._koerperWasser(sx, sz, -Infinity) * 1000) / 1000, nass: quer.filter(([x, z]) => r._nassAt(x, z)).length, k: r._gelaende().gezeit.k, gesetz: Math.round(r._atlasWaterLevelAt(sx, sz, -1e9) * 1000) / 1000 });
                } finally {
                    st.spielZeit = alt;
                    r._pegelTakt();
                }
            }
            return { chunk, sx, sz, s1, tag: st.dayLengthMinutes, chunks: st.voxelChunks ? st.voxelChunks.size : 0 };
        }, nah);
    const urteil = (w) => {
        const s = w.s1.map((x) => ({ a: { zeit: x.zeit }, w: x }));
        const hub = Math.max(...s.map((x) => x.w.spiegel)) - Math.min(...s.map((x) => x.w.spiegel));
        const v = s.map((x) => x.w.spiegel), m = v.reduce((p, y) => p + y, 0) / v.length, auf = [];
        for (let i = 1; i < v.length; i++) if (v[i - 1] < m && v[i] >= m) auf.push(s[i - 1].a.zeit + ((m - v[i - 1]) / (v[i] - v[i - 1])) * (s[i].a.zeit - s[i - 1].a.zeit));
        const periode = auf.length > 1 ? (auf[auf.length - 1] - auf[0]) / (auf.length - 1) : null;
        const nd = Math.max(...s.map((x) => x.w.nass)) - Math.min(...s.map((x) => x.w.nass));
        return `Chunk am Messpunkt ${w.chunk} (${w.chunks} Chunks) · Tag ${w.tag} min · hubM ${hub.toFixed(3)} · periodeH ${periode == null ? "ungemessen" : periode.toFixed(3)} · benetztDiff ${nd} · Stufen ${w.s1.map((x) => x.k).join(",")} · Spiegel ${w.s1.map((x) => x.spiegel).join(",")} · Gesetz ${w.s1.map((x) => x.gesetz).join(",")}`;
    };
    // DIE 12 KÜSTEN DES FÄCHERS (Saat 1–12, wie `GEZEIT_AN` der Station wörtlich): die Station liest dort `wasserSpiegel` an einer Lage
    // OHNE Träger der Gezeit (`lageAus`, die Uhr fehlt der fremden Lage) — vorher. Der Kandidat der Station: dieselbe Lage mit dem
    // Träger der Stunde (`gezeitStand(h)`, die Uhr der Gezeit ab Welt-Uhr 0), gelesen durch das Gesetz, das Körper und Bild lesen
    // (`atlasSpiegel` → `spiegelZurStufe`).
    const faecher = await page.evaluate(async () => {
        const r = window.anazhRealm, G = globalThis.__gelaendeCore, st = r.state;
        await r._fadenQuelle();
        const aus = [];
        for (let saat = 1; saat <= 12; saat++) {
            const breite = ((saat * 0.6180339887) % 1) * 140 - 70, laenge = ((saat * 137.508) % 360) - 180;
            const o = await r._planetAuftrag({ type: "planet-ort", samen: r._planetSamen(), breite, laenge, zeitMa: 0 });
            const heim = r.constructor._weltGesetz(st.worldMeta).gelaende;
            const ort = { samen: o.samen, version: o.version, breite: o.breite, laenge: o.laenge, zeitMa: o.zeitMa, delta: o.delta };
            const O = G.ortGesetz(ort), eg = G.erbgutNormal(G.ortErbgut(G.erbgutNormal(heim == null ? undefined : heim), o.delta.wildnis));
            const wl = G.GRUND.basis - O.meerUnterBasisM;
            const L = G.lageAus({ seed: r._reiseSaat(ort, heim), baseHeight: G.GRUND.basis, waterLevel: wl, ort, erbgut: { terme: eg, wildnis: eg[0] && eg[0].art === "wildnis" ? 1 : 0 }, regionSize: G.GRUND.kachel }, SimplexNoise);
            const nassIn = (x, z) => G.hoehe(L, x, z, false) < wl;
            const n0 = nassIn(0, 0);
            let quer = null;
            for (let d = 250; d <= 20000 && !quer; d += 250)
                for (let i = 0; i < 16 && !quer; i++) {
                    const c = Math.cos((i * Math.PI) / 8), s = Math.sin((i * Math.PI) / 8);
                    if (nassIn(d * c, d * s) === n0) continue;
                    let e = d - 250;
                    while (e < d && nassIn(e * c, e * s) === n0) e += 10;
                    quer = [];
                    for (let t = 0; t <= 10; t++) { const q = n0 ? e - (t - 5) * 40 : e + (t - 5) * 40; quer.push([q * c, q * s, G.hoehe(L, q * c, q * s, false)]); }
                }
            if (!quer) { aus.push({ saat, kueste: false }); continue; }
            const [sx, sz] = quer[10];
            const vor = [], nach = [];
            for (let h = 0; h < 25; h++) {
                vor.push(Math.round(G.wasserSpiegel(L, sx, sz) * 1000) / 1000);
                const Lh = Object.assign(Object.create(L), { gezeit: G.gezeitStand(h) });
                nach.push(Math.round(G.atlasSpiegel(Lh, sx, sz, quer[10][2]) * 1000) / 1000);
            }
            aus.push({ saat, kueste: true, vor, nach });
        }
        return aus;
    });
    const hubP = (v) => { const f = v.filter(Number.isFinite); if (!f.length) return [0, null]; const hub = Math.max(...f) - Math.min(...f); const m = f.reduce((p, y) => p + y, 0) / f.length, auf = []; for (let i = 1; i < v.length; i++) if (v[i - 1] < m && v[i] >= m) auf.push(i - 1 + (m - v[i - 1]) / (v[i] - v[i - 1])); return [hub, auf.length > 1 ? (auf[auf.length - 1] - auf[0]) / (auf.length - 1) : null]; };
    for (const f of faecher) {
        if (!f.kueste) { console.log(`SAAT ${f.saat}: keine Küste`); continue; }
        const [hv, pv] = hubP(f.vor), [hn, pn] = hubP(f.nach);
        console.log(`SAAT ${String(f.saat).padStart(2)}: vorher (Station, wasserSpiegel ohne Träger) Hub ${hv.toFixed(3)} m Periode ${pv == null ? "ungemessen" : pv.toFixed(3)} · Kandidat (atlasSpiegel mit Träger, die fremde Lage ohne Hydrosphäre) Hub ${hn.toFixed(3)} m Periode ${pn == null ? "ungemessen" : pn.toFixed(3)} h`);
    }
    console.log("FERN (kein Chunk):  " + urteil(await lauf(false)));
    console.log("NAH  (Spieler da):  " + urteil(await lauf(true)));
    await browser.close();
    process.exit(0);
});
