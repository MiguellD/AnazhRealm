// stationen/k2-zusammenspiel.js — DIE LEITER-RICHTER DES KAPITELS zusammenspiel der Meisterkarte 2 (33 Leitern, 213 Sprossen,
// die Kopplungen, R7: jede Kopplung misst mit ihrem Gegenlauf; 18.11., Zweig richter-planet-leben-zusammenspiel). Der Kern ist der
// von k2-planet.js.
"use strict";
const K = require("./k2-planet.js").kern;
const L = K.kapitel("zusammenspiel");

// ── DIE PERSPEKTIVE zusammenspiel.planet (8 Leitern, 50 Sprossen, 2 belegt: bahn-klima S1 — g1.js SCHNEE_JAHR, wetter-welt S1 — g3.js
// WETTER_PAAR_PROBE): die Kopplungen des Planeten, jede mit ihrem Gegenlauf (R7). Gemessen wird in der warmen Welt der Sitzung: die Ursache
// am Ort über `r` (der EINE Spiegel `state.waterLevel` — die Lage liest ihn über ihren Getter, stamm/gelaende-boden.js:849 —, das Relief
// `_terrainMacroSurfaceY`/`_terrainSaatY`, der Fluss `_hydroRiverAt`, die Siedlung `_autoSettlementCellInfo`/`_autoSettlementFindSite`,
// die Bewohner `_bewohnerSiedlungen`, der Wind `_windAt`/`_windForm`, die Nässe `_naesseKurve`/`_naesseGesetz`/`_pfuetzeGesetz`), das Wetter
// nur über `window.__wetterSetzen`, der Planet über den Planet-Faden (`r._planetAuftrag` planet-ort/planet-anker, je Lage delta.klima/meer/
// wetter/wuchs/wildnis, zeitMa) und das Wetter am Ort über phyto-core `wetterAt` mit dem Δ des Orts (derselbe Weg wie `_wetterAmOrt`).
// Die Saaten „zsp-0 …“ teilt jede Leiter (der Faden merkt den Plan je Samen, ~0,1 s je neuer Saat). Jede Mutation wird zurückgenommen
// (der Spiegel im finally, die Hüllen `_slopeAt`/`_hydroRiverAt` gelöscht, das Wetter auf sein Wort zurück).
L.perspektive("planet", (() => {
    const A = "planet.kopplung.siedlungslage";
    const B = "planet.kopplung.land-meer-luft";
    const C = "planet.kopplung.bahn-klima";
    const D = "planet.kopplung.wetter-welt";
    const E = "planet.kopplung.stadtklima";
    const F = "planet.kopplung.kaskade";
    const G = "planet.kopplung.ereignis-spur";
    const P = "planet.kopplung.gegenwart";
    const PLANET_PFAD = ["planet-core.js", "voxel-worker.js", "stamm/gelaende-chunks.js", "gelaende-core.js", "phyto-core.js", "stamm/bild-himmel.js", "scripts/werkbank.cjs"];
    // der Zeuge des Planet-Fadens: N Saaten, N Antworten, Streuung, und das Paar mit ↔ ohne Ursache (R7)
    const zeugePlanet = (minSaaten, minPaare) => (roh) => {
        const z = roh.zeuge || {};
        if (!(z.saaten >= minSaaten)) return "nur " + (z.saaten || 0) + " Saaten des Planet-Fadens (Soll ≥ " + minSaaten + ")";
        if (!(z.antworten > 0) || !(z.streuung > 0)) return "die Antworten des Fadens tragen keine Streuung (eine Konstante, nicht der Planet)";
        if (!(z.gegenlauf >= minPaare)) return "der Gegenlauf (Ursache gekappt) fehlt: " + (z.gegenlauf || 0) + " Paare (Soll ≥ " + minPaare + ")";
        if (z.gegenWirkt === true) return "im Gegenlauf bleibt die Wirkung (keine Kopplung, Rauschen)";
        return null;
    };
    const PZ = (n, g) => ({ saaten: n, antworten: 20 * n, streuung: 812, gegenlauf: g, gegenWirkt: false });
    const leer = { werte: {}, zeuge: {} };

    return {
        leitern: {
            // ════════ siedlungslage — Gelände, Wasser und Gestein tragen Siedlung und Verkehr ════════
            // S1 hebt den EINEN Spiegel (`state.waterLevel` + 1 m, im finally zurück) an 50 Uferpunkten und liest die Leser Ufer (`_atlasWaterLevelAt`),
            // Schilf (`_ortNass` im Band 30/60 m), Fuß (`_koerperWasserSpiegel`), Steg und Boot (die Welt fragt nach ihrem Leser) und daneben Spiegel,
            // Wand (`_landAt`) und Nässe (`_nassAt`); der Gegenlauf liest dieselben Punkte zweimal ohne Hebung. S3 die Orte der Region (25 × 25 Zellen,
            // `_autoSettlementFindSite`) an Küste/Fluss gegen Zufallspunkte, der Gegenlauf mit eingeebnetem Relief und gekapptem Fluss (Hüllen
            // `_slopeAt` → 0, `_hydroRiverAt` → null an der Instanz, gelöscht im finally). S4 die Steigung der Trassen der geladenen Orte gegen
            // `ORT_GESETZ.trasse`. S2/S5 fragen die Welt nach Bodenart und Schicht; S6/S7 sind Jury-Sprossen (Auge).
            [A]: {
                sek: 40,
                dorf: true,
                mutiert: true,
                faecher: true,
                pfad: ["stamm/wasser-*.js", "stamm/gelaende-boden.js", "stamm/siedlung-ort.js", "stamm/siedlung-wege.js", "stamm/kreatur-leben.js", "stamm/vegetation-baum.js", "gelaende-core.js", "fachwerk-core.js", "scripts/werkbank.cjs"],
                ungefahren: "die Bildpaare (S1 Ufer, S2 Bodenart) und die Jury (S6, S7) schießt nur das Gerät",
                mess: async function (H, U, M) {
                    const S = (fn, a) => H.seite("return await (" + String(fn) + ")(r, " + JSON.stringify(a || {}) + ");");
                    const seite = async (r, a) => {
                        const st = r.state;
                        const wl = st.waterLevel;
                        const p = st.playerMesh.position;
                        const r3 = (v) => (Number.isFinite(v) ? Math.round(v * 1e3) / 1e3 : null);
                        const aus = { wl };
                        const ufer = [];
                        for (let k = 0; k < 1200 && ufer.length < a.n; k++) {
                            const ang = k * 2.39996;
                            let vor = null;
                            for (let d = 150; d <= 20000; d += 40) {
                                const x = p.x + Math.cos(ang) * d;
                                const z = p.z + Math.sin(ang) * d;
                                if (r._terrainMacroSurfaceY(x, z) < wl) {
                                    if (vor) ufer.push(vor);
                                    break;
                                }
                                vor = [x, z];
                            }
                        }
                        const band = (x, z) => {
                            let s = 0;
                            for (let k = 0; k < 8; k++)
                                for (const d of [30, 60]) {
                                    const qx = x + Math.cos(k * 0.785) * d;
                                    const qz = z + Math.sin(k * 0.785) * d;
                                    s += r._ortNass(qx, qz, r._terrainMacroSurfaceY(qx, qz));
                                }
                            return r3(s);
                        };
                        const leser = {
                            ufer: (x, z, g) => r._atlasWaterLevelAt(x, z, g),
                            schilf: (x, z) => band(x, z),
                            fuss: (x, z, g) => r._koerperWasserSpiegel(x, z, g),
                            spiegel: (x, z) => r._waterLevelAt(x, z),
                            wand: (x, z) => (r._landAt(x, z, 0) ? 1 : 0),
                            naesse: (x, z) => (r._nassAt(x, z) ? 1 : 0),
                        };
                        const namen = Object.keys(leser);
                        const lies = () => ufer.map(([x, z]) => { const g = r._terrainMacroSurfaceY(x, z); return namen.map((k) => leser[k](x, z, g)); });
                        const vor = lies();
                        const gegen = lies();
                        let nach;
                        try {
                            st.waterLevel = wl + 1;
                            nach = lies();
                        } finally {
                            st.waterLevel = wl;
                        }
                        const zur = lies();
                        const je = {};
                        namen.forEach((n, j) => {
                            let folgt = 0;
                            let still = 0;
                            for (let i = 0; i < ufer.length; i++) {
                                if (nach[i][j] !== vor[i][j]) folgt++;
                                if (gegen[i][j] !== vor[i][j]) still++;
                            }
                            je[n] = [folgt, still];
                        });
                        const fehlt = ["_stegAt", "_bootAt", "_stegeAm", "_bootAmUfer"].filter((n) => typeof r[n] === "function");
                        aus.s1 = { punkte: ufer.length, je, zurueck: JSON.stringify(vor) === JSON.stringify(zur), steg: fehlt.length, pose: ufer[0] ? [ufer[0][0], r._terrainMacroSurfaceY(ufer[0][0], ufer[0][1]), ufer[0][1]] : null };
                        const art = ["_bodenArtAt", "_gesteinAt", "_schichtAt", "_bodenartAt", "_gesteinsArt"].filter((n) => typeof r[n] === "function");
                        let bG = 0;
                        let bF = 0;
                        let bN = 0;
                        for (let t = 0; t < 4; t++) {
                            const ang = t * 0.7854 + 0.3;
                            let altB = null;
                            const fels = [];
                            const bk = [];
                            for (let i = 0; i < 120; i++) {
                                const x = p.x + Math.cos(ang) * (i * 10 - 600);
                                const z = p.z + Math.sin(ang) * (i * 10 - 600);
                                bk.push(r._bodenKlasseAt(x, z));
                                fels.push(r._rockGeologyClass(r._slopeAt(x, z), 0));
                            }
                            for (let i = 1; i < bk.length; i++) {
                                if (bk[i] !== bk[i - 1]) {
                                    bG++;
                                    if ([i - 1, i, i + 1].some((j) => j > 0 && j < fels.length && fels[j] !== fels[j - 1])) bF++;
                                }
                                bN++;
                            }
                            altB = bk;
                        }
                        aus.s2 = { bodenLeser: art.length, grenzen: bG, mitFels: bF, punkte: bN };
                        const SG = AnazhRealm._siedlungGesetz();
                        const infos = [];
                        for (let cx = -a.zellen; cx <= a.zellen; cx++) for (let cz = -a.zellen; cz <= a.zellen; cz++) { const i = r._autoSettlementCellInfo(cx, cz); if (i) infos.push(i); }
                        const gunst = (x, z) => {
                            let k1 = 0;
                            let f1 = 0;
                            for (let k = 0; k < 12; k++)
                                for (const d of [0, 120, 300]) {
                                    const qx = x + Math.cos(k * 0.5236) * d;
                                    const qz = z + Math.sin(k * 0.5236) * d;
                                    if (r._terrainMacroSurfaceY(qx, qz) < wl) k1 = 1;
                                    if (r._hydroRiverAt(qx, qz)) f1 = 1;
                                }
                            return k1 || f1 ? 1 : 0;
                        };
                        // die Orte echt ↔ eingeebnet misst der Fächer (S3, unten); die Seite trägt das Zufallsniveau
                        const zuf = [];
                        const R = (a.zellen + 0.5) * SG.cellM;
                        for (let i = 0; i < 4000 && zuf.length < 200; i++) {
                            const x = p.x + (((i * 0.6180339) % 1) * 2 - 1) * R;
                            const z = p.z + (((i * 0.7548776) % 1) * 2 - 1) * R;
                            if (r._landAt(x, z, 0.2) && r._slopeAt(x, z) <= globalThis.__gelaendeCore.ERDBAU.boeschung) zuf.push(gunst(x, z));
                        }
                        const anteil = (v) => { const w = v.filter((x) => x !== null); return w.length ? r3((100 * w.reduce((s, x) => s + x, 0)) / w.length) : null; };
                        const nHmax = infos.reduce((m, i) => Math.max(m, i.nH || 0), 0);
                        aus.s3 = { zufall: anteil(zuf), zufallN: zuf.length, nHmax, wand: 500 };
                        const OG = AnazhRealm.Gesetz("fachwerk:ORT_GESETZ");
                        const seg = [];
                        const strecken = [];
                        for (const S of (r._bewohnerSiedlungen || new Map()).values()) {
                            const pl = S.plan || {};
                            for (const w of [].concat(pl.roads || [], pl.feldwege || [])) {
                                const pts = (w && (w.pts || w.punkte)) || (Array.isArray(w) ? w : null);
                                if (pts && pts.length > 1) strecken.push(pts.map((q) => ({ x: S.ox + q.x, z: S.oz + q.z })));
                            }
                        }
                        for (const k of (r._wegenetzKanten || new Map()).values()) if (k && k.pts && k.pts.length > 1) strecken.push(k.pts);
                        const segs = [];
                        for (const pts of strecken)
                            for (let i = 1; i < pts.length; i++) {
                                const l = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].z - pts[i - 1].z);
                                if (!(l > 0.5)) continue;
                                seg.push(Math.abs(r.getTerrainHeightAt(pts[i].x, pts[i].z) - r.getTerrainHeightAt(pts[i - 1].x, pts[i - 1].z)) / l);
                                if (segs.length < 2000) segs.push([pts[i - 1].x, pts[i - 1].z, pts[i].x, pts[i].z]);
                            }
                        const sturz = ["_bergsturz", "_rutschung", "_passSperren", "_felssturz"].filter((n) => typeof r[n] === "function");
                        aus.segs = segs;
                        aus.haus = [];
                        for (const [k, S] of r._bewohnerSiedlungen || new Map()) ((S.plan && S.plan.slots) || []).forEach((q, i) => { if (aus.haus.length < 400) aus.haus.push([k, i]); });
                        aus.lage = { x: p.x, z: p.z, wl, cellM: SG.cellM, zellen: a.zellen };
                        aus.s4 = { grenze: OG.trasse, segmente: seg.length, strecken: strecken.length, unter: seg.filter((s) => s <= OG.trasse).length, max: r3(Math.max(0, ...seg)), sturz: sturz.length, netz: r._wegenetzKanten ? r._wegenetzKanten.size : 0 };
                        let haeuser = 0;
                        const kultur = {};
                        for (const S of (r._bewohnerSiedlungen || new Map()).values()) for (const s of (S.plan && S.plan.slots) || []) { haeuser++; kultur[s.kultur] = (kultur[s.kultur] || 0) + 1; }
                        aus.s5 = { haeuser, kultur, schichtLeser: art.length, erzLeser: ["_erzAt", "_bergwerk"].filter((n) => typeof r[n] === "function").length };
                        aus.s6 = { nHmax, wand: 500 };
                        return aus;
                    };
                    const w = await S(seite, { n: 50, zellen: 12 });
                    const aus = M.teil || {};
                    const s1 = w.s1;
                    const benannt = ["ufer", "schilf", "fuss"];
                    const anteil = (n) => (s1.punkte ? s1.je[n][0] / s1.punkte : 0);
                    const leserProzent = s1.punkte ? Math.round((1000 * (benannt.reduce((s, n) => s + anteil(n), 0) + 0 + 0)) / 5) / 10 : null;
                    const still = Object.values(s1.je).reduce((s, v) => s + v[1], 0);
                    const pose = s1.pose ? { px: s1.pose[0] - 40, py: s1.pose[1] + 25, pz: s1.pose[2] - 40, lx: s1.pose[0], ly: s1.pose[1], lz: s1.pose[2] } : { ort: "wiese" };
                    aus[1] = {
                        werte: { leserProzent },
                        zeuge: { punkte: s1.punkte, je: s1.je, still, zurueck: s1.zurueck, stegBoot: s1.steg },
                        auge: await M.auge("siedlungslage-s1", pose),
                        ...(s1.punkte < 50 ? { nicht: "nur " + s1.punkte + " Uferpunkte in 20 km um den Spieler (Soll 50)" } : {}),
                    };
                    // S2–S5 AM FÄCHER (M4): je Adresse der Export, den die Welt liest — die Bodenklasse und die Felsklasse an den Punkten
                    // von 4 Transekten (S2), der Ort jeder Zelle der Region echt ↔ eingeebnet (S3), die Steigung jedes Trassen-Segments
                    // (S4), Kultur und Stil jedes Hauses (S5); die Ursache, die die Karte setzt (Bodenart, Bergsturz, Schicht), ist je eine
                    // Adresse: sie setzt sie über den Kanal der Welt oder nennt beim Namen, was fehlt
                    const LG = w.lage, s2 = w.s2;
                    const LESER_BODEN = ["_bodenArtAt", "_gesteinAt", "_schichtAt", "_bodenartAt", "_gesteinsArt"];
                    const BODEN_AN = async (r, T, a, mit) => {
                        if (a.zeit.k === "mutation") {
                            const L = mit.leser.filter((n) => typeof r[n] === "function");
                            return { fehlt: L.length ? "die Bodenart (" + L.join("+") + ") trägt keinen Welt-Akt der Mutation (stamm/feld-dsl.js:946 dslEffects)" : "keine Bodenart und kein Gestein in der Welt: kein Leser " + mit.leser.join("/") + "; stamm/kreatur-leben.js:1707 _bodenKlasseAt liest nur Wasser-Abstand, Hang und Wald" };
                        }
                        const [x, z, t, i] = a.ort;
                        return { bk: String(r._bodenKlasseAt(x, z)), fels: String(r._rockGeologyClass(r._slopeAt(x, z), 0)), t, i };
                    };
                    const tr = [];
                    for (let t = 0; t < 4; t++) { const ang = t * 0.7854 + 0.3; for (let i = 0; i < 120; i++) tr.push([LG.x + Math.cos(ang) * (i * 10 - 600), LG.z + Math.sin(ang) * (i * 10 - 600), t, i]); }
                    const grenzenVon = (aus) => {
                        const by = {};
                        for (const x of aus) (by[x.w.t] = by[x.w.t] || [])[x.w.i] = x.w;
                        let g = 0, f = 0;
                        for (const L of Object.values(by)) for (let i = 1; i < L.length; i++) { if (!L[i] || !L[i - 1] || L[i].bk === L[i - 1].bk) continue; g++; if ([i - 1, i, i + 1].some((j) => j > 0 && L[j] && L[j - 1] && L[j].fels !== L[j - 1].fels)) f++; }
                        return { grenzen: g, mitFels: f };
                    };
                    const R2 = await FAECHER((c) => H.seite(c), {
                        gesetz: { fn: BODEN_AN, export: "stamm/kreatur-leben.js:1707 _bodenKlasseAt(x, z) · stamm/vegetation-baum.js:1433 _rockGeologyClass(slope)", leser: "stamm/kreatur-leben.js:1707 _bodenKlasseAt (Biom und Wuchs am Boden)" },
                        adressen: { orte: tr, zeiten: [{ k: "heute" }], dazu: [{ saat: null, ort: tr[0], zeit: { k: "mutation" } }] },
                        mit: { leser: LESER_BODEN },
                        ms: 8000,
                        masse: { punkte: { wie: "anzahl", feld: "bk" }, biome: { wie: "verschieden", feld: "bk" }, grenzen: { wie: (v, aus) => grenzenVon(aus), feld: "bk" } },
                        schlecht: { feld: "i", richtung: "min" },
                        pose: (a, w) => "der Transekt " + a.ort[2] + " am Punkt " + a.ort[3] + " (Biom " + w.bk + ", Fels " + w.fels + "), Bildpaar vor ↔ nach der Mutation der Bodenart",
                        ungemessen: ["das Bildpaar vor ↔ nach der Mutation der Bodenart (am Gerät)"],
                    });
                    const g2 = R2.werte.grenzen || { grenzen: 0, mitFels: 0 };
                    aus[2] = {
                        werte: { leser: s2.bodenLeser, grenzenProzent: g2.grenzen ? Math.round((1000 * g2.mitFels) / g2.grenzen) / 10 : null },
                        zeuge: { grenzen: g2.grenzen, mitFels: g2.mitFels, punkte: R2.werte.punkte, biome: R2.werte.biome, akte: R2.akte },
                        auge: await M.auge("siedlungslage-s2", { ort: "wiese" }),
                        ...(R2.fehlt ? { nicht: R2.fehlt + " · " + g2.mitFels + " von " + g2.grenzen + " Biomgrenzen an einer Felsgrenze" } : {}),
                    };
                    const LAGE_AN = async (r, T, a, mit) => {
                        const info = r._autoSettlementCellInfo(a.ort[0], a.ort[1]);
                        if (!info) return { ort: 0 };
                        let o;
                        if (a.zeit.k === "flach") {
                            const eigen = ["_slopeAt", "_hydroRiverAt"].map((n) => Object.prototype.hasOwnProperty.call(r, n));
                            try { r._slopeAt = () => 0; r._hydroRiverAt = () => null; o = r._autoSettlementFindSite(info); }
                            finally { if (!eigen[0]) delete r._slopeAt; if (!eigen[1]) delete r._hydroRiverAt; }
                        } else o = r._autoSettlementFindSite(info);
                        if (!o) return { ort: 0, nH: info.nH || 0 };
                        let k1 = 0, f1 = 0;
                        for (let k = 0; k < 12; k++) for (const d of [0, 120, 300]) { const qx = o.x + Math.cos(k * 0.5236) * d, qz = o.z + Math.sin(k * 0.5236) * d; if (r._terrainMacroSurfaceY(qx, qz) < mit.wl) k1 = 1; if (r._hydroRiverAt(qx, qz)) f1 = 1; }
                        return { ort: 1, gunst: k1 || f1 ? 1 : 0, x: o.x, z: o.z, nH: info.nH || 0 };
                    };
                    const zl = [];
                    for (let cx = -LG.zellen; cx <= LG.zellen; cx++) for (let cz = -LG.zellen; cz <= LG.zellen; cz++) zl.push([cx, cz]);
                    const R3 = await FAECHER((c) => H.seite(c), {
                        gesetz: { fn: LAGE_AN, export: "stamm/siedlung-ort.js:1743 _autoSettlementFindSite(info) — der Ort der Zelle (Relief: _slopeAt, Fluss: _hydroRiverAt)", leser: "stamm/siedlung-ort.js:1743 beim Streuen der Orte" },
                        adressen: { orte: zl, zeiten: [{ k: "echt" }, { k: "flach" }] },
                        mit: { wl: LG.wl },
                        ms: 25000,
                        masse: {
                            orte: { wie: "summe", feld: "ort", nur: (a) => a.zeit.k === "echt" },
                            anteil: { wie: "mittel", feld: "gunst", nur: (a) => a.zeit.k === "echt" },
                            gegen: { wie: "mittel", feld: "gunst", nur: (a) => a.zeit.k === "flach" },
                            nHmax: { wie: "max", feld: "nH" },
                            verschoben: { wie: (v, aus) => { const by = {}; for (const x of aus) (by[x.a.ort.join(",")] = by[x.a.ort.join(",")] || {})[x.a.zeit.k] = x.w; return Object.values(by).filter((q) => q.echt && q.flach && (q.echt.ort !== q.flach.ort || (q.echt.ort && Math.hypot(q.echt.x - q.flach.x, q.echt.z - q.flach.z) > 1))).length; }, feld: "ort" },
                        },
                        schlecht: { feld: "gunst", richtung: "min" },
                        pose: (a, w) => "der Ort der Zelle " + a.ort.join(",") + " (" + a.zeit.k + ") — Karte von oben, 300 m Umkreis",
                    });
                    const w3 = R3.werte, s3 = w.s3;
                    const pz = (v) => (v == null ? null : Math.round(1000 * v) / 10);
                    aus[3] = {
                        werte: { anteilProzent: pz(w3.anteil), gegenlaufProzent: pz(w3.gegen), zufallProzent: s3.zufall },
                        zeuge: { zellen: zl.length, orte: w3.orte, zufallN: s3.zufallN, verschoben: w3.verschoben, nHmax: w3.nHmax, wand: 500, akte: R3.akte },
                        ...(w3.nHmax * 5 >= 1e5 ? {} : { nicht: "keine Stadt > 10⁵ Einwohner in der Region (größter Ort " + w3.nHmax + " Häuser, die Wand des Rang-Gesetzes fachwerk-core.js:4459 GROESSE_WAND 500)" }),
                    };
                    const s4 = w.s4;
                    const TRASSE_AN = async (r, T, a, mit) => {
                        if (a.zeit.k === "sturz") {
                            const L = ["_bergsturz", "_rutschung", "_passSperren", "_felssturz"].filter((n) => typeof r[n] === "function");
                            return { fehlt: L.length ? "der Bergsturz (" + L.join("+") + ") trägt keinen Welt-Akt (stamm/feld-dsl.js:946 dslEffects)" : "kein Bergsturz sperrt einen Pass: kein _bergsturz/_rutschung/_passSperren/_felssturz in der Welt, und stamm/siedlung-ort.js:3413 _wegenetzLegen legt Kanten nur zwischen geladenen Orten" };
                        }
                        const [x0, z0, x1, z1] = a.ort, l = Math.hypot(x1 - x0, z1 - z0);
                        const st = Math.abs(r.getTerrainHeightAt(x1, z1) - r.getTerrainHeightAt(x0, z0)) / l;
                        return { s: st, unter: st <= mit.grenze ? 1 : 0 };
                    };
                    const R4 = await FAECHER((c) => H.seite(c), {
                        gesetz: { fn: TRASSE_AN, export: "getTerrainHeightAt an den Segmenten der Trassen (plan.roads, plan.feldwege, _wegenetzKanten)", leser: "stamm/siedlung-ort.js:3413 _wegenetzLegen (die Trasse, die der Verkehr fährt)" },
                        adressen: { orte: w.segs, zeiten: [{ k: "heute" }], dazu: [{ saat: null, ort: w.segs[0] || [0, 0, 1, 1], zeit: { k: "sturz" } }] },
                        mit: { grenze: s4.grenze },
                        ms: 8000,
                        masse: { segmente: { wie: "anzahl", feld: "s" }, unter: { wie: "anteil", feld: "unter" }, max: { wie: "max", feld: "s" } },
                        schlecht: { feld: "s", richtung: "max" },
                        pose: (a, w) => "das Segment " + a.ort.map((q) => Math.round(q)).join(",") + " (Steigung " + (+w.s).toFixed(3) + ")",
                    });
                    const w4 = R4.werte;
                    aus[4] = {
                        werte: { steigungProzent: pz(w4.unter) },
                        zeuge: { segmente: w4.segmente, strecken: s4.strecken, netz: s4.netz, sturz: s4.sturz, grenze: s4.grenze, max: w4.max, akte: R4.akte },
                        nicht: (R4.fehlt || "kein Bergsturz") + " — kein Verkehr eines Landes: das Wegenetz liegt nur zwischen geladenen Orten (" + s4.netz + " Kanten, " + s4.strecken + " Strecken)",
                    };
                    const s5 = w.s5;
                    const HAUS_AN = async (r, T, a, mit) => {
                        if (a.zeit.k === "schicht") {
                            const L = mit.leser.filter((n) => typeof r[n] === "function");
                            return { fehlt: L.length ? "die Schicht (" + L.join("+") + ") erreicht den Baustein nicht" : "keine Schicht unter der Stadt: kein Leser " + mit.leser.join("/") + "; fachwerk-core.js:213 STILMODE wählt den Stoff nach dem Stil" };
                        }
                        const S = r._bewohnerSiedlungen && r._bewohnerSiedlungen.get(a.ort[0]);
                        const q = S && S.plan && S.plan.slots && S.plan.slots[a.ort[1]];
                        if (!q) return { fehlt: "das Haus " + a.ort.join(":") + " fehlt im Plan" };
                        return { kultur: String(q.kultur), stil: String((q.ov && q.ov.stil) || "-") };
                    };
                    const R5 = await FAECHER((c) => H.seite(c), {
                        gesetz: { fn: HAUS_AN, export: "fachwerk-core.js:213 STILMODE über den Plan der Orte (slot.kultur, slot.ov.stil)", leser: "stamm/siedlung-ort.js spawnSettlement (der Plan jedes Orts)" },
                        adressen: { orte: w.haus, zeiten: [{ k: "heute" }], dazu: [{ saat: null, ort: w.haus[0] || ["-", 0], zeit: { k: "schicht" } }] },
                        mit: { leser: LESER_BODEN.concat(["_erzAt", "_bergwerk"]) },
                        ms: 6000,
                        masse: { haeuser: { wie: "anzahl", feld: "kultur" }, kulturen: { wie: "verschieden", feld: "kultur" }, stile: { wie: "verschieden", feld: "stil" } },
                        schlecht: { feld: "kultur", richtung: "min" },
                        pose: (a) => "das Haus " + a.ort.join(":") + " vor seiner Wand, Third 8 m",
                    });
                    aus[5] = {
                        werte: { haeuser: R5.werte.haeuser },
                        zeuge: { haeuser: R5.werte.haeuser, schichtLeser: s5.schichtLeser, kulturen: R5.werte.kulturen, stile: R5.werte.stile, akte: R5.akte },
                        nicht: (R5.fehlt || "keine Schicht unter der Stadt") + " — der Baustein folgt der Kultur des Hauses (" + Object.keys(s5.kultur).join(", ") + ")",
                    };
                    aus[6] = { werte: {}, zeuge: w.s6, auge: await M.auge("siedlungslage-s6", { ort: "wiese" }), nicht: "keine Millionenstadt (größter Ort " + w.s6.nHmax + " Häuser, Wand 500)" };
                    aus[7] = { werte: {}, zeuge: {}, auge: await M.auge("siedlungslage-s7", { ort: "wiese" }), nicht: "keine Zivilisation über Epochen im Zeitsprung: die Orte der Welt stehen am Hash ihrer Zelle, kein Planet-Zeitpunkt verlegt sie" };
                    return { sprossen: aus };
                },
                sprossen: {
                    1: {
                        u: { n: 50 },
                        soll: [K.soll(A, 1, "100 % der Leser", { key: "leserProzent", einheit: "%" })],
                        auge: { pose: "50 m über dem ersten Uferpunkt, Blick aufs Ufer, vor ↔ nach der Hebung um 1 m", vorbild: "Bildpaar: Ufer, Schilf, Steg, Boot und Fuß folgen dem Spiegel (Blindpaar R11)" },
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.punkte >= 50)) return "nur " + (z.punkte || 0) + " Uferpunkte (Soll 50)";
                            if (z.still !== 0) return "im Gegenlauf ohne Hebung bewegen sich Leser (" + z.still + ")";
                            if (z.zurueck !== true) return "der Spiegel kehrte nicht zurück";
                            return null;
                        },
                        taeter: "stamm/wasser-hydro.js _waterLevelAt/_koerperWasserSpiegel (Steg und Boot ohne Leser)",
                        leser: "stamm/siedlung-ort.js:3413 — _wegenetzLegen setzt keinen Steg und kein Boot ans Ufer (kein Leser des Spiegels für Steg/Boot)",
                        gruen: { werte: { leserProzent: 100 }, zeuge: { punkte: 50, still: 0, zurueck: true } },
                        attrappen: [{ name: "100 % ohne Uferpunkte der Welt", roh: { werte: { leserProzent: 100 }, zeuge: { punkte: 0 } } }],
                    },
                    2: {
                        u: {},
                        soll: [K.soll(A, 2, "ändert ≥ 5 Leser", { key: "leser" }), K.soll(A, 2, "≥ 50 % der Biomgrenzen folgen einer Gesteinsgrenze", { key: "grenzenProzent", einheit: "%" })],
                        auge: { pose: "Wiese, Bildpaar vor ↔ nach der Mutation der Bodenart", vorbild: "≥ 5 Leser ändern sich im Bild (Blindpaar R11)" },
                        zeuge: (roh) => ((roh.zeuge || {}).grenzen > 0 ? null : "keine Biomgrenze gezählt"),
                        taeter: "stamm/kreatur-leben.js _bodenKlasseAt (keine Bodenart, kein Gestein)",
                        nicht: "keine Bodenart, kein Gestein",
                        leser: "stamm/kreatur-leben.js:1707 — _bodenKlasseAt liest Wasser-Abstand, Hang und Wald, keine Bodenart und kein Gestein",
                        gruen: { werte: { leser: 6, grenzenProzent: 62 }, zeuge: { grenzen: 40 } },
                        attrappen: [{ name: "6 Leser aus einer Liste", roh: { werte: { leser: 6, grenzenProzent: 62 }, zeuge: {} } }],
                    },
                    3: {
                        u: { zellen: 12 },
                        soll: [
                            K.soll(A, 3, "Siedlungen an Furt, Terrasse, Küste ≥ 80 %", { key: "anteilProzent", einheit: "%" }),
                            K.soll(A, 3, "Anteil fällt auf das Zufallsniveau (≤ 30 %)", { key: "gegenlaufProzent", einheit: "%" }),
                            K.soll(A, 3, "Städte > 10⁵ ≤ 10 km von Küste oder Strom ≥ 70 %", { key: "staedteProzent", einheit: "%" }),
                        ],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.orte >= 20)) return "nur " + (z.orte || 0) + " Orte der Region gemessen (Soll ≥ 20)";
                            if (!(z.zufallN >= 50)) return "kein Zufallsniveau gemessen";
                            if (!(z.verschoben > 0)) return "der Gegenlauf (eingeebnet, Fluss gekappt) verschiebt keinen Ort — die Lage liest das Relief nicht";
                            return null;
                        },
                        taeter: "stamm/siedlung-ort.js _autoSettlementFindSite (Anker am Zell-Hash, kein Zug zu Furt, Terrasse, Küste)",
                        leser: "stamm/siedlung-ort.js:1743 — _autoSettlementFindSite prüft Land, Hang und Nahrung am Hash-Anker, liest weder Fluss noch Küste",
                        gruen: { werte: { anteilProzent: 84, gegenlaufProzent: 22, staedteProzent: 75 }, zeuge: { orte: 120, zufallN: 200, verschoben: 60 } },
                        attrappen: [{ name: "84 % aus einer Karte ohne Orte der Welt", roh: { werte: { anteilProzent: 84, gegenlaufProzent: 22, staedteProzent: 75 }, zeuge: { orte: 0 } } }],
                        proben: [{ name: "der Gegenlauf verschiebt keinen Ort", roh: { werte: { anteilProzent: 84, gegenlaufProzent: 22, staedteProzent: 75 }, zeuge: { orte: 120, zufallN: 200, verschoben: 0 } }, gruen: false }],
                    },
                    4: {
                        u: {},
                        soll: [K.soll(A, 4, "Trassen-Steigung ≤ Grenze in ≥ 95 %", { key: "steigungProzent", einheit: "%" }), K.soll(A, 4, "die Trasse verlegt sich auf den nächsten Pass in ≥ 80 %", { key: "verlegtProzent", einheit: "%" })],
                        zeuge: (roh) => ((roh.zeuge || {}).segmente >= 100 && (roh.zeuge || {}).sturz > 0 ? null : "keine 100 Trassen-Segmente oder kein Bergsturz als Gegenlauf"),
                        taeter: "stamm/siedlung-ort.js _wegenetzLegen (Netz nur zwischen geladenen Orten, kein Bergsturz)",
                        nicht: "kein Land-Netz, kein Bergsturz",
                        leser: "stamm/siedlung-ort.js:3413 — _wegenetzLegen legt Kanten nur zwischen geladenen Orten; kein Ereignis sperrt einen Pass",
                        gruen: { werte: { steigungProzent: 97, verlegtProzent: 85 }, zeuge: { segmente: 400, sturz: 1 } },
                        attrappen: [{ name: "97 % ohne Segmente der Welt", roh: { werte: { steigungProzent: 97, verlegtProzent: 85 }, zeuge: { segmente: 0 } } }],
                    },
                    5: {
                        u: {},
                        soll: [K.soll(A, 5, "Stadt-Bausteine aus der Schicht unter der Stadt ≥ 90 %", { key: "bausteinProzent", einheit: "%" }), K.soll(A, 5, "der Baustein der Stadt wechselt in ≥ 80 %", { key: "wechselProzent", einheit: "%" })],
                        zeuge: (roh) => ((roh.zeuge || {}).haeuser > 0 && (roh.zeuge || {}).schichtLeser > 0 ? null : "keine Häuser oder keine Schicht der Welt gelesen"),
                        taeter: "fachwerk-core.js STILMODE (der Baustein folgt der Kultur, nie dem Gestein)",
                        nicht: "keine Schicht unter der Stadt",
                        leser: "stamm/siedlung-ort.js:1427 — die Zelle trägt Kultur und Epoche, kein Gestein; fachwerk-core.js:213 STILMODE wählt den Stoff nach dem Stil",
                        gruen: { werte: { bausteinProzent: 93, wechselProzent: 85 }, zeuge: { haeuser: 40, schichtLeser: 1 } },
                        attrappen: [{ name: "93 % ohne Häuser", roh: { werte: { bausteinProzent: 93, wechselProzent: 85 }, zeuge: { haeuser: 0 } } }],
                    },
                    6: {
                        u: {},
                        soll: [K.soll(A, 6, "Treffer ≥ 3× Zufall", { key: "trefferFaktor" })],
                        auge: { pose: "Geländekarte eines Kontinents ohne Städte (heute: Wiese)", vorbild: "Jury rät die Lagen der Millionenstädte (Prüfer-Satz R11), Gegenlauf mit vertauschter Karte" },
                        taeter: "fachwerk-core.js GROESSE_WAND (keine Millionenstadt)",
                        nicht: "keine Millionenstadt",
                        leser: "fachwerk-core.js:4459 — GROESSE_WAND 500 Häuser: keine Stadt über 10⁶",
                        gruen: { werte: { trefferFaktor: 3.4 }, zeuge: {} },
                        attrappen: [{ name: "die Jury ohne Karte", roh: { werte: { trefferFaktor: 3.4 }, zeuge: {} } }],
                    },
                    7: {
                        u: {},
                        soll: [K.soll(A, 7, "Jury erkennt die geologische Ursache der Hauptstädte ≥ 70 %", { key: "juryProzent", einheit: "%" }), K.soll(A, 7, "die Siedlung schrumpft oder wandert in ≥ 70 %", { key: "wandertProzent", einheit: "%" })],
                        auge: { pose: "Hauptstadt je Epoche im Zeitsprung (heute: Wiese)", vorbild: "Jury erkennt die geologische Ursache (Prüfer-Satz R11)" },
                        taeter: "stamm/siedlung-ort.js _autoSettlementCellInfo (Orte am Zell-Hash, keine Geschichte)",
                        nicht: "keine Zivilisation über Epochen",
                        leser: "stamm/siedlung-ort.js:1427 — die Zelle liest keinen Planet-Zeitpunkt (Hafen verlandet, Fluss verlegt)",
                        gruen: { werte: { juryProzent: 75, wandertProzent: 74 }, zeuge: {} },
                        attrappen: [{ name: "die Jury ohne Epochen", roh: { werte: { juryProzent: 75, wandertProzent: 74 }, zeuge: {} } }],
                    },
                },
            },

            // ════════ land-meer-luft — EIN Klima aus Gebirge, Meer und Luft ════════
            // Der Planet-Faden an der Heimat-Saat und den Saaten „zsp-0 …“: Breitenkreise ±42°/52° im 3°-Takt (Kamm = Land ≥ 800 m, lokales Maximum),
            // Luv = West (Westwind-Zone), Lee = Ost; der Niederschlag am Ort ist der nasse Anteil des Wetters (phyto-core `wetterAt` über 400 Zeiten mit
            // dem GANZEN Δ des Orts, regenQuote/sturmQuote/nebelQuote — derselbe Weg wie `_wetterAmOrt`). Gegenlauf: flache Paare ohne Kamm (Verhältnis → 1). S2 Rang der
            // Trockenheit gegen Meeresabstand und Schatten, Gegenlauf mit vertauschtem Prädiktor; S3 Nebel an Westküsten der Subtropen gegen Umland; S4
            // West- gegen Ostküste gleicher Breite; S5 das Lee der 40 höchsten Kämme −1 Ma ↔ 0 (die gehobenen),
            // Gegenlauf flaches Land über dieselbe Zeit; S6 Widersprüche Klima ↔ Relief an 20 Orten je Saat.
            [B]: {
                sek: 50,
                pfad: PLANET_PFAD,
                ungefahren: "die Bildpaare (S1 Kammlinie, S5 Hebung) schießt nur das Gerät",
                mess: async function (H, U, M) {
                    const S = (fn, a) => H.seite("return await (" + String(fn) + ")(r, " + JSON.stringify(a || {}) + ");");
                    const seite = async (r, a) => {
                        await r._fadenQuelle();
                        const t0 = performance.now();
                        const PC = globalThis.__phytoCore;
                        const heim = r._planetSamen();
                        const ws = (r.state.worldMeta && r.state.worldMeta.seed) || "anazh-realm-seed";
                        const r3 = (v) => (Number.isFinite(v) ? Math.round(v * 1e3) / 1e3 : null);
                        const ort = (samen, b, l, t) => r._planetAuftrag({ type: "planet-ort", samen, breite: b, laenge: ((((l + 180) % 360) + 360) % 360) - 180, zeitMa: t || 0 });
                        const nassJe = new Map();
                        // DAS Δ GANZ (w2-nebel-delta): `wetterAt` liest das Δ des Orts, wie der Faden es reicht (voxel-worker planetOrtAuftrag,
                        // die Felder von planet-core ORT_DELTA_WETTER samt nebelQuote) — der Schlüssel trägt JEDES seiner Felder, die Station
                        // schneidet keins ab (ohne nebelQuote wirft `wetterAt` beim Namen, phyto-core wetterVersatz)
                        const nass = (d, art) => {
                            const k = Object.keys(d).sort().map((f) => f + ":" + d[f].toFixed(4)).join("|") + "|" + (art || "n");
                            if (nassJe.has(k)) return nassJe.get(k);
                            let n = 0;
                            for (let i = 0; i < 400; i++) {
                                const z = PC.wetterAt(ws, 0, 0, i * 97.3, d).zeile;
                                if (art === "nebel" ? z === "nebel" : z === "regen" || z === "sturm") n++;
                            }
                            nassJe.set(k, n / 400);
                            return n / 400;
                        };
                        const med = (v) => { const w = v.filter(Number.isFinite).sort((x, y) => x - y); return w.length ? w[Math.floor(w.length / 2)] : null; };
                        const rang = (v) => { const i = v.map((x, k) => [x, k]).sort((p, q) => p[0] - q[0]); const o = new Array(v.length); i.forEach((p, k) => (o[p[1]] = k)); return o; };
                        const spear = (x, y) => { if (x.length < 5) return null; const a1 = rang(x), b1 = rang(y), n = x.length; const ma = (n - 1) / 2; let s = 0, sa = 0, sb = 0; for (let k = 0; k < n; k++) { s += (a1[k] - ma) * (b1[k] - ma); sa += (a1[k] - ma) ** 2; sb += (b1[k] - ma) ** 2; } return sa && sb ? s / Math.sqrt(sa * sb) : null; };
                        const saaten = [heim];
                        for (let i = 0; i < a.n - 1; i++) saaten.push("zsp-" + i);
                        const aus = { s1: { kaemme: [], flach: [], flachOrte: [], saaten: 0, antworten: 0 }, s2: { je: [], gegen: [] }, s3: { kuesten: 0, faktoren: [], wueste: 0, saaten: 0 }, s4: { dT: [] }, s6: { orte: 0, wider: 0, welten: 0 } };
                        let ant = 0;
                        const hs = [];
                        for (let si = 0; si < saaten.length; si++) {
                            if (performance.now() - t0 > a.budgetMs) break;
                            const samen = saaten[si];
                            let kamm = false;
                            for (const b of [42, -42, 52]) {
                                const L = [];
                                for (let l = -180; l < 180; l += 3) L.push(l);
                                const o = await Promise.all(L.map((l) => ort(samen, b, l)));
                                ant += o.length;
                                o.forEach((x) => hs.push(x.hoeheM));
                                const n = o.length;
                                const at = (i) => o[(i + n) % n];
                                for (let i = 0; i < n; i++) {
                                    const x = at(i);
                                    const istMax = x.land && x.hoeheM >= 800 && [-2, -1, 1, 2].every((d) => at(i + d).hoeheM <= x.hoeheM);
                                    if (istMax && at(i - 1).land && at(i + 1).land) {
                                        const luv = nass(at(i - 1).delta.wetter);
                                        const lee = nass(at(i + 1).delta.wetter);
                                        aus.s1.kaemme.push({ samen, b, l: L[i], h: r3(x.hoeheM), luv: r3(luv), lee: r3(lee), v: r3((luv + 0.0025) / (lee + 0.0025)) });
                                        kamm = true;
                                    }
                                    const flach = [-3, -2, -1, 0, 1, 2, 3].every((d) => at(i + d).land && at(i + d).hoeheM < 400);
                                    if (flach && aus.s1.flach.length < 400) {
                                        const w1 = nass(at(i - 1).delta.wetter);
                                        const e1 = nass(at(i + 1).delta.wetter);
                                        aus.s1.flach.push(r3((w1 + 0.0025) / (e1 + 0.0025)));
                                        if (aus.s1.flachOrte.length < 30 && i % 4 === 0) aus.s1.flachOrte.push({ samen, b, l: L[i] });
                                    }
                                    if (Math.abs(b) === 42 && x.land && !at(i - 1).land && !at(i - 2).land) {
                                        for (let j = i + 1; j < i + 40; j++)
                                            if (at(j).land && !at(j + 1).land && !at(j + 2).land) {
                                                const tw = (x.delta.klima.sommer + x.delta.klima.winter) / 2;
                                                const te = (at(j).delta.klima.sommer + at(j).delta.klima.winter) / 2;
                                                aus.s4.dT.push({ samen, b, d: r3(tw - te) });
                                                break;
                                            } else if (!at(j).land) break;
                                    }
                                }
                            }
                            if (kamm) aus.s1.saaten++;
                            if (si < 12) {
                                const P = [];
                                for (let b = -55; b <= 55; b += 10) for (let l = -180; l < 180; l += 15) P.push([b, l]);
                                const o = await Promise.all(P.map((q) => ort(samen, q[0], q[1])));
                                ant += o.length;
                                const W = await Promise.all(P.map((q) => ort(samen, q[0], q[1] - 6)));
                                ant += W.length;
                                const tro = [], pre = [], sch = [];
                                o.forEach((x, k) => {
                                    if (!x.land) return;
                                    tro.push(-nass(x.delta.wetter));
                                    pre.push(x.kuesteKm);
                                    sch.push(Math.max(0, W[k].hoeheM - x.hoeheM));
                                });
                                if (tro.length >= 20) {
                                    const rk = rang(pre), rs = rang(sch);
                                    const komb = rk.map((v, k) => v + rs[k]);
                                    aus.s2.je.push(r3(spear(tro, komb)));
                                    const perm = komb.map((_, k) => komb[(k * 7 + 3) % komb.length]);
                                    aus.s2.gegen.push(r3(spear(tro, perm)));
                                }
                                for (const b of [18, 25, -18, -25]) {
                                    const L = [];
                                    for (let l = -180; l < 180; l += 3) L.push(l);
                                    const q = await Promise.all(L.map((l) => ort(samen, b, l)));
                                    ant += q.length;
                                    const n = q.length;
                                    for (let i = 0; i < n; i++) {
                                        const x = q[i], w1 = q[(i - 1 + n) % n], w2 = q[(i - 2 + n) % n], i2 = q[(i + 3) % n];
                                        if (x.land && !w1.land && !w2.land && i2.land) {
                                            aus.s3.kuesten++;
                                            const nk = nass(x.delta.wetter, "nebel"), nu = nass(i2.delta.wetter, "nebel");
                                            aus.s3.faktoren.push(r3((nk + 0.0025) / (nu + 0.0025)));
                                            if (nass(x.delta.wetter) < 0.1) aus.s3.wueste++;
                                        }
                                    }
                                }
                                aus.s3.saaten++;
                            }
                            const orte = [];
                            for (let k = 0; k < 20; k++) orte.push([((k * 37.3 + si * 11.1) % 120) - 60, ((k * 71.9 + si * 23.7) % 360) - 180]);
                            const o1 = await Promise.all(orte.map((q) => ort(samen, q[0], q[1])));
                            const o2 = await Promise.all(orte.map((q) => ort(samen, q[0] + 1, q[1])));
                            ant += 40;
                            for (let k = 0; k < 20; k++) {
                                aus.s6.orte++;
                                const dh = o2[k].hoeheM - o1[k].hoeheM, dt = o2[k].delta.klima.sommer - o1[k].delta.klima.sommer;
                                let w = false;
                                if (o1[k].land && o2[k].land && Math.abs(dh) > 500 && Math.sign(dt) === Math.sign(dh)) w = true;
                                if (o1[k].land && nass(o1[k].delta.wetter) > 0.5 && o1[k].kuesteKm > 2000) w = true;
                                if (w) aus.s6.wider++;
                            }
                            aus.s6.welten++;
                        }
                        aus.s1.antworten = ant;
                        const mh = hs.reduce((s, x) => s + x, 0) / Math.max(1, hs.length);
                        aus.streuung = r3(Math.sqrt(hs.reduce((s, x) => s + (x - mh) ** 2, 0) / Math.max(1, hs.length)));
                        aus.saatenGefragt = Math.min(saaten.length, aus.s6.welten > 0 ? saaten.length : 1);
                        const kh = r._planetAnker ? await r._planetAnker() : null;
                        const hk = { samen: heim, b: kh ? (kh.breite * 180) / Math.PI : 0, l: kh ? (kh.laenge * 180) / Math.PI : 0 };
                        const wandel = async (liste, mitH) => {
                            const j0 = await Promise.all(liste.map((k) => ort(k.samen, k.b, k.l, 0)));
                            const f0 = await Promise.all(liste.map((k) => ort(k.samen, k.b, k.l, -1)));
                            const j1 = await Promise.all(liste.map((k) => ort(k.samen, k.b, k.l + 3, 0)));
                            const f1 = await Promise.all(liste.map((k) => ort(k.samen, k.b, k.l + 3, -1)));
                            return liste.map((k, i) => {
                                const lj = nass(j1[i].delta.wetter), lf = nass(f1[i].delta.wetter);
                                return { samen: k.samen, b: k.b, l: k.l, dh: r3(j0[i].hoeheM - f0[i].hoeheM), lj: r3(lj), lf: r3(lf), p: lf > 0 ? r3((100 * (lj - lf)) / lf) : null };
                            });
                        };
                        const kk = aus.s1.kaemme.slice().sort((p, q) => q.h - p.h).slice(0, 40);
                        const geh = await wandel(kk);
                        const hoch = geh.filter((g) => g.dh > 100 && g.p != null);
                        const fl = (await wandel(aus.s1.flachOrte)).filter((g) => g.p != null && Math.abs(g.dh) < 100);
                        aus.s5 = { kaemme: geh.length, gehoben: hoch.length, saaten: new Set(hoch.map((g) => g.samen)).size, leeProzent: r3(med(hoch.map((g) => g.p))), flach: fl.length, gegenProzent: r3(med(fl.map((g) => g.p))), hebungM: r3(med(hoch.map((g) => g.dh))), bsp: hoch.slice(0, 3) };
                        aus.heim = hk;
                        aus.s1.med = r3(med(aus.s1.kaemme.map((k) => k.v)));
                        aus.s1.flachMed = r3(med(aus.s1.flach));
                        aus.ms = r3(performance.now() - t0);
                        return aus;
                    };
                    const w = await S(seite, { n: 32, budgetMs: 36000 });
                    const med = (v) => { const x = v.filter(Number.isFinite).sort((p, q) => p - q); return x.length ? x[Math.floor(x.length / 2)] : null; };
                    const aus = M.teil || {};
                    const z0 = { antworten: w.s1.antworten, streuung: w.streuung };
                    const flachN = w.s1.flach.length;
                    aus[1] = {
                        werte: { luvLee: w.s1.med, gegenLuvLee: w.s1.flachMed },
                        zeuge: { ...z0, saaten: w.s1.saaten, kaemme: w.s1.kaemme.length, gegenlauf: flachN, gegenWirkt: w.s1.flachMed != null && w.s1.flachMed >= 1.5, bsp: w.s1.kaemme.slice(0, 4) },
                        auge: await M.auge("land-meer-luft-s1", { ort: "wiese" }),
                    };
                    const rho = med(w.s2.je);
                    const rg = med(w.s2.gegen);
                    aus[2] = { werte: { rang: rho, gegenRang: rg }, zeuge: { ...z0, saaten: w.s2.je.length, gegenlauf: w.s2.gegen.length, gegenWirkt: rg != null && Math.abs(rg) >= 0.3 } };
                    const f3 = w.s3.faktoren;
                    aus[3] = {
                        werte: { nebelFaktor: med(f3), anteilProzent: f3.length ? Math.round((1000 * f3.filter((x) => x >= 2).length) / f3.length) / 10 : null, wuesteProzent: w.s3.kuesten ? Math.round((1000 * w.s3.wueste) / w.s3.kuesten) / 10 : null },
                        zeuge: { ...z0, saaten: w.s3.saaten, gegenlauf: w.s3.kuesten, kuesten: w.s3.kuesten },
                    };
                    const dT = w.s4.dT.map((x) => x.d);
                    const proSaat = {};
                    for (const x of w.s4.dT) (proSaat[x.samen] = proSaat[x.samen] || []).push(x.d);
                    aus[4] = { werte: { dT: med(dT) }, zeuge: { ...z0, saaten: Object.keys(proSaat).length, gegenlauf: dT.length, paare: dT.length, positiv: dT.filter((x) => x > 0).length } };
                    const s5 = w.s5;
                    aus[5] = {
                        werte: { leeProzent: s5.leeProzent, gegenProzent: s5.gegenProzent, hebungM: s5.hebungM },
                        zeuge: { ...z0, ...s5, gegenlauf: s5.flach, gegenWirkt: s5.gegenProzent != null && Math.abs(s5.gegenProzent) >= 25 },
                        auge: await M.auge("land-meer-luft-s5", { ort: "wiese" }),
                    };
                    aus[6] = { werte: { ohneWiderspruchProzent: w.s6.orte ? Math.round((1000 * (w.s6.orte - w.s6.wider)) / w.s6.orte) / 10 : null }, zeuge: { ...z0, saaten: w.s6.welten, gegenlauf: w.s6.orte, orte: w.s6.orte, wider: w.s6.wider } };
                    return { sprossen: aus };
                },
                sprossen: {
                    1: {
                        u: {},
                        // ZAHL (auge-klasse.cjs): die Zahl urteilt, das Bild ist Beleg — die sichtbare Hälfte des Satzes ist ein eigenes Soll (ungemessen: ROT)
                        soll: [K.soll(B, 1, "Niederschlag Luv/Lee ≥ 2:1", { key: "luvLee" }), K.soll(B, 1, "im Bild grün/braun an der Kammlinie getrennt", { key: "kammGruenDiff", rel: ">", zahl: 0, refQuelle: "der Richter: „grün/braun an der Kammlinie getrennt“ — der Bewuchs-Anteil im Luv minus dem im Lee an der Kammlinie ist > 0", einheit: "Anteil" })],
                        auge: { pose: "die Kammlinie eines Gebirges der Heimat-Saat (heute: Wiese)", vorbild: "im Bild grün/braun an der Kammlinie getrennt (Blindpaar R11)" },
                        zeuge: zeugePlanet(30, 20),
                        taeter: "planet-core.js planetKlimaR (Regenschatten) über voxel-worker.js planetOrtAuftrag",
                        gruen: { werte: { luvLee: 2.4, gegenLuvLee: 1.05, kammGruenDiff: 0.3 }, zeuge: PZ(30, 40) },
                        attrappen: [{ name: "2,4 : 1 ohne Saaten", roh: { werte: { luvLee: 2.4, kammGruenDiff: 0.3 }, zeuge: {} } }],
                    },
                    2: {
                        u: {},
                        soll: [K.soll(B, 2, "Wüstenanteil gegen Meeresabstand und Schatten Rang ≥ 0,7", { key: "rang" })],
                        zeuge: zeugePlanet(10, 10),
                        taeter: "planet-core.js planetKlimaR (Kontinentalität, Regenschatten)",
                        gruen: { werte: { rang: 0.76, gegenRang: 0.04 }, zeuge: PZ(10, 10) },
                        attrappen: [{ name: "Rang 0,76 ohne Faden", roh: { werte: { rang: 0.76 }, zeuge: { saaten: 10 } } }],
                        proben: [{ name: "der vertauschte Prädiktor trägt denselben Rang", roh: { werte: { rang: 0.76 }, zeuge: { ...PZ(10, 10), gegenWirkt: true } }, gruen: false }],
                    },
                    3: {
                        u: {},
                        soll: [K.soll(B, 3, "an ≥ 70 % der Ostrand-Ströme", { key: "anteilProzent", einheit: "%" }), K.soll(B, 3, "Nebelhäufigkeit ≥ 2× Umland", { key: "nebelFaktor" })],
                        zeuge: (roh) => zeugePlanet(10, 20)(roh) || (!((roh.werte || {}).wuesteProzent >= 50) ? "keine Küstenwüste neben dem Nebel (" + (roh.werte || {}).wuesteProzent + " %)" : null),
                        taeter: "phyto-core.js wetterAt (die Zeile Nebel liest kein Meer, kein Auftrieb)",
                        leser: "phyto-core.js:4804 — wetterAt wählt nebel aus der Feuchte-Welle, das Δ des Orts verschiebt nur Regen und Sturm",
                        gruen: { werte: { anteilProzent: 75, nebelFaktor: 2.6, wuesteProzent: 70 }, zeuge: PZ(10, 40) },
                        attrappen: [{ name: "Nebel 2,6× ohne Küsten des Planeten", roh: { werte: { anteilProzent: 75, nebelFaktor: 2.6, wuesteProzent: 70 }, zeuge: {} } }],
                        // quelle: Namib, Walvis Bay ~140 Nebeltage/a gegen Gobabeb ~94 im Wüsten-Inneren (1,5×; Wikipedia „Gobabeb“), weiter landein
                        // an der Großen Randstufe ~0 — das Umland der Station liegt 9° landein, dort ist ≥ 2× im Band
                        proben: [
                            { name: "das Δ ohne nebelQuote: die Messung wirft beim Namen → ROT", roh: { werte: {}, zeuge: PZ(10, 40), nicht: "die Messung warf: wetterAt: das Δ des Orts trägt nebelQuote nicht (der Nebel liest Meer und Auftrieb des Planeten)" }, gruen: false },
                            { name: "der Nebel am Ostrand 1,0× Umland → ROT", roh: { werte: { anteilProzent: 0, nebelFaktor: 1.0, wuesteProzent: 70 }, zeuge: PZ(10, 40) }, gruen: false },
                        ],
                    },
                    4: {
                        u: {},
                        soll: [K.soll(B, 4, "Temperatur unterscheidet sich ≥ 5 K", { key: "dT", einheit: "K" })],
                        zeuge: (roh) => zeugePlanet(10, 10)(roh) || ((roh.zeuge || {}).positiv / Math.max(1, (roh.zeuge || {}).paare) < 0.7 ? "das Vorzeichen (Westküste wärmer) hält nur an " + (roh.zeuge || {}).positiv + " von " + (roh.zeuge || {}).paare + " Paaren" : null),
                        taeter: "planet-core.js planetKlimaR (Meeresströmung als Lesart der Küstenseite)",
                        gruen: { werte: { dT: 6.2 }, zeuge: { ...PZ(10, 12), paare: 12, positiv: 11 } },
                        attrappen: [{ name: "6,2 K aus einer Tabelle", roh: { werte: { dT: 6.2 }, zeuge: { paare: 12, positiv: 11 } } }],
                    },
                    5: {
                        u: {},
                        // ZAHL (auge-klasse.cjs): die Zahl urteilt, das Bild ist Beleg — die sichtbare Hälfte des Satzes ist ein eigenes Soll (ungemessen: ROT)
                        soll: [K.soll(B, 5, "Niederschlag Lee −50 %", { key: "leeProzent", rel: "≤", zahl: -50, einheit: "%" }), K.soll(B, 5, "grün → Steppe", { key: "leeGruenDelta", rel: "<", zahl: 0, refQuelle: "der Richter: „Bildpaar Region vor/nach Hebung: grün → Steppe“ — der Bewuchs-Anteil im Lee nach der Hebung minus vorher ist < 0", einheit: "Anteil" })],
                        auge: { pose: "die Region um den höchsten Kamm vor ↔ nach 10⁶ a (heute: Wiese)", vorbild: "Bildpaar grün → Steppe (Blindpaar R11)" },
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.gehoben >= 3)) return "nur " + (z.gehoben || 0) + " Kämme, die sich über 10⁶ a um > 100 m hoben (Soll ≥ 3)";
                            if (!(z.gegenlauf >= 3)) return "der Gegenlauf (flaches Land über dieselbe Zeit) fehlt";
                            if (z.gegenWirkt === true) return "das Lee flacher Orte wandelt sich ebenso (" + z.gegenProzent + " %): das Klima der Zeit, nicht die Hebung";
                            return null;
                        },
                        taeter: "planet-core.js planetScheibe (Hebung über 10⁶ a)",
                        gruen: { werte: { leeProzent: -55, gegenProzent: -4, hebungM: 300, leeGruenDelta: -0.4 }, zeuge: { gehoben: 6, gegenlauf: 20, gegenProzent: -4, gegenWirkt: false } },
                        attrappen: [
                            { name: "−55 % ohne gehobenen Kamm", roh: { werte: { leeProzent: -55 }, zeuge: {} } },
                            { name: "das flache Land trocknet ebenso (Gegenlauf ohne Unterschied)", roh: { werte: { leeProzent: -55 }, zeuge: { gehoben: 6, gegenlauf: 20, gegenProzent: -50, gegenWirkt: true } } },
                        ],
                    },
                    6: {
                        u: {},
                        soll: [K.soll(B, 6, "kein Widerspruch Klima ↔ Relief/Meer in ≥ 95 %", { key: "ohneWiderspruchProzent", einheit: "%" })],
                        zeuge: (roh) => (((roh.zeuge || {}).saaten || 0) < 1000 ? "nur " + ((roh.zeuge || {}).saaten || 0) + " Welten (Soll 1 000 × 20 Orte)" : zeugePlanet(1000, 20000)(roh)),
                        taeter: "planet-core.js planetKlimaR",
                        gruen: { werte: { ohneWiderspruchProzent: 97 }, zeuge: PZ(1000, 20000) },
                        attrappen: [{ name: "97 % an einer Welt", roh: { werte: { ohneWiderspruchProzent: 97 }, zeuge: PZ(1, 20) } }],
                    },
                },
            },

            // ════════ bahn-klima — die Bahn formt Klima und Leben (S1 belegt: g1.js SCHNEE_JAHR) ════════
            // Die Welt wird gefragt, ob der Planet-Faden eine andere Bahn liest: derselbe Auftrag mit `koerper` (Neigung 0, gebunden) gegen die Erd-Saat —
            // gleich = der Faden kennt nur PLANET_ERDE (voxel-worker.js planetPlanVon). S2 misst die Jahresamplitude (Sommer − Winter) beider Anfragen,
            // S3 die Reihe von Meeresspiegel und Sommer an der Heimat über 0 … −1 Ma (Zyklen = Extrema), S4 den Versatz der Jahres-Phase je Breitengrad
            // (die Blüte folgt `_saisonPraesenz` der Phase) und den Leser des Laichs, S5 die gebundene Bahn, S6 die Zonen gegen das Zwei-Moden-Modell.
            [C]: {
                sek: 30,
                faecher: true,
                pfad: PLANET_PFAD,
                ungefahren: "Schneelinie und Laub im Bild (S2) und die Klima-Zonen im Bild (S6) schießt nur das Gerät",
                mess: async function (H, U, M) {
                    const S = (fn, a) => H.seite("return await (" + String(fn) + ")(r, " + JSON.stringify(a || {}) + ");");
                    // S2 ÜBER DEN FÄCHER (stationen/faecher.js): 20 Planeten-Saaten und die Erd-Saat × jede dritte Breite (15° · 45° · 75°);
                    // je Saat ihre eigene Neigung aus dem Gesetz des Körpers (planet-core.js:312 planetPlan ohne Vorgabe, :323 neigungRad),
                    // je Adresse die Jahresamplitude, die der Planet-Faden der Welt antwortet (`_planetAuftrag` planet-ort, voxel-worker.js:1429
                    // planetPlanVon). Die Saat der kleinsten Neigung urteilt „0°“, die der größten „45°“ — gegen die Erd-Saat an denselben Breiten
                    const PC = require(require("path").resolve("planet-core.js"));
                    const grad = (x) => (x * 180) / Math.PI;
                    const erdSamen = await H.seite("return r._planetSamen();");
                    const saaten2 = Array.from({ length: 20 }, (_, i) => "planet.kopplung.bahn-klima-s2-" + (i + 1));
                    const neig = Object.fromEntries(saaten2.map((q) => [q, grad(PC.planetPlan(q).koerper.neigungRad)]));
                    neig[erdSamen] = grad(PC.PLANET_ERDE.neigungRad);
                    const BAHN_AN = async (r, T, a) => {
                        await r._fadenQuelle();
                        const kh = r._gelaende().ort.klimaHeute;
                        const an = await r._planetAnker();
                        const o = await r._planetAuftrag({ type: "planet-ort", samen: a.saat, breite: a.ort, laenge: (an.laenge * 180) / Math.PI, zeitMa: 0 });
                        if (!o || !o.delta || !o.delta.klima) return { fehlt: "planet-ort antwortet ohne Klima (voxel-worker.js planet-ort)" };
                        return { amp: kh.sommer + o.delta.klima.sommer - (kh.winter + o.delta.klima.winter), land: !!o.land };
                    };
                    const R2 = await FAECHER((c) => H.seite(c), {
                        gesetz: { fn: BAHN_AN, export: "planet-core.js:312 planetPlan (Körper je Saat)", leser: "voxel-worker.js:1429 planetPlanVon" },
                        adressen: { saaten: [erdSamen, ...saaten2], orte: [15, 45, 75] },
                        ms: 15000,
                        masse: { amp: { wie: "mittel", feld: "amp" }, saaten: { wie: "verschieden", nur: "saat" } },
                        schlecht: { feld: "amp", richtung: "min" },
                        pose: (a) => "Hang mit Schneelinie und Laub, Saat " + a.saat + " (Neigung " + Math.round(neig[a.saat] * 10) / 10 + "°) bei " + a.ort + "° Breite",
                        ungemessen: ["Schneelinie und Laub im Bild (am Gerät)", "45° Neigung: keine Saat trägt sie (planet-core.js:323 neigungRad = 0,7·Z ≤ 40,1°)"],
                    });
                    const ampJe = (q) => {
                        const x = R2.je.filter((e) => e.a.saat === q).map((e) => e.w.amp);
                        return x.length ? x.reduce((u, v) => u + v, 0) / x.length : null;
                    };
                    const saatMin = saaten2.reduce((u, q) => (neig[q] < neig[u] ? q : u)), saatMax = saaten2.reduce((u, q) => (neig[q] > neig[u] ? q : u));
                    const ampErde = ampJe(erdSamen), amp0 = ampJe(saatMin), amp45 = ampJe(saatMax);
                    const r3 = (v) => (Number.isFinite(v) ? Math.round(v * 1e3) / 1e3 : null);
                    const ampSaaten = saaten2.map(ampJe).filter(Number.isFinite);
                    const s2 = { ampErde: r3(ampErde), amp0: r3(amp0), amp45: r3(amp45), neigMin: r3(neig[saatMin]), neigMax: r3(neig[saatMax]), spanneSaatenK: ampSaaten.length ? r3(Math.max(...ampSaaten) - Math.min(...ampSaaten)) : null, gleich: ampSaaten.length > 1 && Math.max(...ampSaaten) - Math.min(...ampSaaten) < 1e-9, akte: R2.akte };
                    const seite = async (r, a) => {
                        await r._fadenQuelle();
                        const r3 = (v) => (Number.isFinite(v) ? Math.round(v * 1e3) / 1e3 : null);
                        const samen = r._planetSamen();
                        const an = await r._planetAnker();
                        const B0 = (an.breite * 180) / Math.PI;
                        const L0 = (an.laenge * 180) / Math.PI;
                        const kh = r._gelaende().ort.klimaHeute;
                        const ort = (b, l, t, extra) => r._planetAuftrag(Object.assign({ type: "planet-ort", samen, breite: b, laenge: l, zeitMa: t || 0 }, extra || {}));
                        const amp = (o) => kh.sommer + o.delta.klima.sommer - (kh.winter + o.delta.klima.winter);
                        const aus = {};
                        const erde = await ort(45, L0);
                        const reihe = await Promise.all(Array.from({ length: 51 }, (_, i) => ort(B0, L0, -i * 0.02)));
                        const wl = reihe.map((o) => o.delta.meer.waterLevelM);
                        const so = reihe.map((o) => o.delta.klima.sommer);
                        const extrema = (v) => { let n = 0; for (let i = 1; i < v.length - 1; i++) if ((v[i] - v[i - 1]) * (v[i + 1] - v[i]) < 0) n++; return n; };
                        aus.s3 = { schritte: reihe.length, zyklenMeer: extrema(wl), zyklenSommer: extrema(so), spanneMeerM: r3(Math.max(...wl) - Math.min(...wl)), spanneSommerK: r3(Math.max(...so) - Math.min(...so)), laskar: ["_insolation65N", "_laskarReihe"].filter((n) => typeof r[n] === "function").length };
                        const br = [30, 35, 40, 45, 50, 55, 60];
                        const ph = await Promise.all(br.map((b) => ort(b, L0)));
                        const phase = ph.map((o) => kh.sommerPhase + o.delta.klima.sommerPhase);
                        const SG = { x: 0, y: 0, z: 0 };
                        const bl = [];
                        for (let d = 0; d < 365; d += 5) bl.push(r._saisonPraesenz(d / 365, SG).y);
                        const steig = (phase[phase.length - 1] - phase[0]) * 365 / (br[br.length - 1] - br[0]);
                        aus.s4 = { breiten: br.length, phase: phase.map(r3), dJeGrad: r3(steig), bluete: r3(Math.max(...bl) - Math.min(...bl)), laich: ["_laichTakt", "_mondPhase", "_laichen"].filter((n) => typeof r[n] === "function").length };
                        const geb = await ort(45, L0, 0, { koerper: { tagStunden: 8760, gebunden: true } });
                        aus.s5 = { gleich: JSON.stringify(erde.delta) === JSON.stringify(geb.delta), tagAmpErde: r3(kh.tagAmp + erde.delta.klima.tagAmp), tagAmpGebunden: r3(kh.tagAmp + geb.delta.klima.tagAmp) };
                        const zonen = [];
                        for (let b = 0; b <= 80; b += 10)
                            for (const l of [-150, -90, -30, 30, 90, 150]) {
                                const o = await ort(b, l);
                                if (!o.land) zonen.push({ b, t: (kh.sommer + o.delta.klima.sommer + kh.winter + o.delta.klima.winter) / 2 });
                            }
                        const x = (b) => Math.sin((b * Math.PI) / 180);
                        const ref = (b) => 14.97 - 28.0 * (1.5 * x(b) * x(b) - 0.5);
                        aus.s6 = { zonen: zonen.length, imBand: zonen.filter((q) => Math.abs(q.t - ref(q.b)) <= 5).length, bsp: zonen.slice(0, 6).map((q) => [q.b, r3(q.t), r3(ref(q.b))]) };
                        return aus;
                    };
                    const w = await S(seite, {});
                    const aus = M.teil || {};
                    aus[2] = {
                        werte: { amp0Prozent: s2.ampErde ? Math.round((1000 * s2.amp0) / s2.ampErde) / 10 : null, amp45Faktor: s2.ampErde ? Math.round((1000 * s2.amp45) / s2.ampErde) / 1000 : null },
                        zeuge: s2,
                        auge: await M.auge("bahn-klima-s2", { ort: "wiese" }),
                        // der Faden baut jeden Plan mit dem Körper der Erde: die eigene Neigung der Saat erreicht die Antwort nie
                        nicht: "der Planet-Faden liest den Körper der Saat nicht (voxel-worker.js:1429 planetPlanVon: P.PLANET_ERDE fest): Neigung " + s2.neigMin + "° → Amplitude " + s2.amp0 + " K, Neigung " + s2.neigMax + "° → " + s2.amp45 + " K, Erd-Saat " + s2.ampErde + " K (Spanne der Saaten " + s2.spanneSaatenK + " K: das Relief der Saat unter dem Körper der Erde, nie ihre Neigung) · " + R2.akte,
                    };
                    const s3 = w.s3;
                    aus[3] = { werte: { zyklen: s3.zyklenMeer, spanneMeerM: s3.spanneMeerM }, zeuge: s3, nicht: "kein Milanković-Antrieb: über 1 Ma " + s3.zyklenMeer + " Extrema des Meeres (Spanne " + s3.spanneMeerM + " m), keine Juni-Insolation 65° N und keine Laskar-Reihe in der Welt" };
                    const s4 = w.s4;
                    aus[4] = { werte: { bluehDJeGrad: s4.dJeGrad, laichSaaten: s4.laich ? null : 0 }, zeuge: s4 };
                    const s5 = w.s5;
                    aus[5] = { werte: {}, zeuge: s5, nicht: "keine gebundene Welt: der Faden liest keinen Körper (Antwort " + (s5.gleich ? "gleich" : "anders") + " der Erd-Saat), PLANET_ERDE ist fest" };
                    const s6 = w.s6;
                    aus[6] = { werte: { imBandProzent: s6.zonen ? Math.round((1000 * s6.imBand) / s6.zonen) / 10 : null }, zeuge: s6, auge: await M.auge("bahn-klima-s6", { ort: "wiese" }), nicht: "1 000 Welten mit eigener Bahn: der Faden kennt nur PLANET_ERDE — gemessen ist die Erd-Saat allein" };
                    return { sprossen: aus };
                },
                sprossen: {
                    2: {
                        u: {},
                        soll: [K.soll(C, 2, "Jahresamplitude ≤ 10 % der Erd-Saat", { key: "amp0Prozent", einheit: "%" }), K.soll(C, 2, "45°: ≥ 2×", { key: "amp45Faktor" }), K.soll(C, 2, "Schneelinie und Laub im Bild", { key: "schneelinieVersatzM", rel: ">", zahl: 0, refQuelle: "der Richter: „Schneelinie und Laub im Bild“ — die Schneelinie am Hang liegt bei 45° Neigung anders als bei 0° (Versatz > 0 m)", einheit: "m" })],
                        // ZAHL (auge-klasse.cjs): die Amplituden urteilen, das Bild ist Beleg — der Zeuge verlangt die Antwort des Fadens auf die Neigung
                        zeuge: (roh) => ((roh.zeuge || {}).gleich === false ? null : "der Faden antwortet der Neigung 0 wie der Erd-Saat (keine Antwort auf die Neigung)"),
                        auge: { pose: "Hang mit Schneelinie und Laub, Saat mit Neigung 0° ↔ 45° (heute: Wiese)", vorbild: "Schneelinie und Laub im Bild (Blindpaar R11)" },
                        taeter: "voxel-worker.js planetPlanVon (PLANET_ERDE fest)",
                        nicht: "der Faden liest keine Neigung",
                        leser: "voxel-worker.js:1425 — planetPlanVon(samen) baut jeden Plan mit P.PLANET_ERDE, kein Auftrag trägt einen Körper",
                        gruen: { werte: { amp0Prozent: 6, amp45Faktor: 2.3, schneelinieVersatzM: 400 }, zeuge: { gleich: false } },
                        attrappen: [{ name: "6 % ohne Antwort des Fadens", roh: { werte: { amp0Prozent: 6, amp45Faktor: 2.3, schneelinieVersatzM: 400 }, zeuge: {} } }],
                    },
                    3: {
                        u: {},
                        soll: [K.soll(C, 3, "r ≥ 0,7 gegen Laskar", { key: "rLaskar" })],
                        zeuge: (roh) => ((roh.zeuge || {}).zyklenMeer >= 20 ? null : "das Meer der Heimat trägt über 1 Ma " + ((roh.zeuge || {}).zyklenMeer || 0) + " Extrema (Milanković ≥ 20)"),
                        taeter: "planet-core.js planetKlimaGlobal (Einstrahlung nur aus Neigung und Sternfluss)",
                        nicht: "kein Milanković-Antrieb",
                        leser: "planet-core.js:2092 — planetKlimaGlobal liest Neigung und Sternfluss, keine Exzentrizität und Präzession (Laskar 2004)",
                        gruen: { werte: { rLaskar: 0.78 }, zeuge: { zyklenMeer: 46 } },
                        attrappen: [{ name: "r 0,78 ohne Reihe der Welt", roh: { werte: { rLaskar: 0.78 }, zeuge: {} } }],
                    },
                    4: {
                        u: {},
                        soll: [
                            K.soll(C, 4, "~4 d je Breitengrad ±1 d", { key: "bluehDJeGrad", ref: 4, refQuelle: "Erde: Hopkins' bioklimatisches Gesetz, ~4 Tage Verspätung je Breitengrad (Hopkins 1918)", einheit: "d" }),
                            K.soll(C, 4, "Laichtakt mit der Mondphase, 100 Saaten", { key: "laichSaaten", rel: "≥", zahl: 100 }),
                        ],
                        zeuge: (roh) => ((roh.zeuge || {}).breiten >= 5 && (roh.zeuge || {}).laich > 0 ? null : "keine 5 Breiten oder kein Leser des Laichs"),
                        taeter: "stamm/bild-himmel.js _saisonPraesenz (die Blüte folgt der Phase der Heimat, nie der Breite)",
                        leser: "stamm/bild-himmel.js:1069 — _saisonPraesenz(phase) liest keine Breite; kein Leser von Mondphase und Laich",
                        gruen: { werte: { bluehDJeGrad: 4.2, laichSaaten: 100 }, zeuge: { breiten: 7, laich: 1 } },
                        attrappen: [{ name: "4,2 d je Grad aus einer Tabelle", roh: { werte: { bluehDJeGrad: 4.2, laichSaaten: 100 }, zeuge: {} } }],
                    },
                    5: {
                        u: {},
                        soll: [K.soll(C, 5, "Temperatur Tag/Nacht gegen Energie-Bilanz ±5 K", { key: "abweichungK", rel: "≤", zahl: 5, einheit: "K" }), K.soll(C, 5, "Leben im Terminator-Band ≥ 80 %", { key: "terminatorProzent", einheit: "%" })],
                        zeuge: (roh) => ((roh.zeuge || {}).gleich === false ? null : "der Faden antwortet der gebundenen Bahn wie der Erde"),
                        taeter: "voxel-worker.js planetPlanVon (PLANET_ERDE fest)",
                        nicht: "keine gebundene Welt",
                        leser: "voxel-worker.js:1425 — planetPlanVon(samen) baut jeden Plan mit P.PLANET_ERDE (tagStunden 24)",
                        gruen: { werte: { abweichungK: 3, terminatorProzent: 85 }, zeuge: { gleich: false } },
                        attrappen: [{ name: "3 K ohne gebundene Antwort", roh: { werte: { abweichungK: 3, terminatorProzent: 85 }, zeuge: {} } }],
                    },
                    6: {
                        u: {},
                        soll: [K.soll(C, 6, "Energie-Bilanz-Modell ±5 K in ≥ 90 %", { key: "imBandProzent", rel: "≥", zahl: 90, einheit: "%" })],
                        // ZAHL (auge-klasse.cjs): das Band urteilt an den Meeres-Zonen, das Bild ist Beleg
                        zeuge: (roh) => ((roh.zeuge || {}).zonen >= 20 ? null : "nur " + ((roh.zeuge || {}).zonen || 0) + " Meeres-Zonen gegen das Energie-Bilanz-Modell gemessen (Soll ≥ 20)"),
                        auge: { pose: "Klima-Zonen im Bild (heute: Wiese)", vorbild: "Zwei-Moden-Modell North 1975: T = 14,97 − 28,0·P₂(sin φ) °C, ±5 K" },
                        taeter: "voxel-worker.js planetPlanVon (eine Bahn für jede Welt)",
                        nicht: "1 000 Welten mit eigener Bahn",
                        leser: "voxel-worker.js:1425 — planetPlanVon(samen) kennt nur PLANET_ERDE",
                        gruen: { werte: { imBandProzent: 93 }, zeuge: { zonen: 40 } },
                        attrappen: [{ name: "93 % ohne Zonen", roh: { werte: { imBandProzent: 93 }, zeuge: {} } }],
                    },
                },
            },

            // ════════ wetter-welt — eine Front läuft durch die Welt (S1 belegt: g3.js WETTER_PAAR_PROBE) ════════
            // S2 die Richtung jedes Wind-Lesers (`_windAt` an 200 Punkten bis 3 km, `_windDirAt` der Uniform) und die Form des Winds (`_windForm`: Lee <
            // frei < Düse); Gegenlauf: die Front bis 24 h später gedreht — die Leser folgen ihr.
            // S3 MIT Gegenlauf: die Nässe nach 30 min Regen (`_naesseKurve` unter dem Feld des Worts rainy) ↔ trocken (sunny: 0) — daraus die Luma der
            // Boden-Farbe (`_bodenFarbeAt`) unter dem Gesetz nasser Oberflächen (`_naesseGesetz`) und die Deckung der Pfütze (`_pfuetzeGesetz` über der Mulde
            // `muldeEcken`) gegen die Senke des Reliefs (Ring-Mittel − Mitte auf `_terrainSaatY`) an 400 Punkten. S4 die Bewohner im Freien (`drinnen`) klar ↔
            // Sturm (über `__wetterSetzen`, 120 Takte), Gegenlauf dieselben Takte ohne Wechsel; S5 die Küste im Sturm; S6 die Dachneigung der Häuser gegen den
            // Schnee-Pegel an ihrer Höhe.
            [D]: {
                sek: 40,
                dorf: true,
                mutiert: true,
                pfad: ["stamm/stoff-material.js", "stamm/bild-himmel.js", "stamm/gelaende-boden.js", "stamm/siedlung-bewohner.js", "stamm/siedlung-ort.js", "gelaende-core.js", "phyto-core.js", "fachwerk-core.js", "scripts/werkbank.cjs"],
                ungefahren: "das Sturmbild (S2), das Bildpaar Marktplatz (S4) und das Bildpaar der Küste (S5) schießt nur das Gerät; die Luma nass/trocken misst headless das Gesetz der Farbe, nicht das Bild",
                mess: async function (H, U, M) {
                    const S = (fn, a) => H.seite("return await (" + String(fn) + ")(r, " + JSON.stringify(a || {}) + ");");
                    const ruhig = async (r) => {
                        const st = r.state;
                        const p = st.playerMesh.position;
                        const r3 = (v) => (Number.isFinite(v) ? Math.round(v * 1e3) / 1e3 : null);
                        const aus = {};
                        const t = st.spielZeit || 0;
                        const wi = (d) => { d = ((((d + 180) % 360) + 360) % 360) - 180; return Math.abs(d); };
                        const lauf = (tt) => {
                            const g = r._windDirAt(tt);
                            const ga = Math.atan2(g.x, g.z);
                            const winkel = [];
                            const form = [];
                            for (let i = 0; i < 200; i++) {
                                const x = p.x + Math.cos(i * 2.39996) * (20 + i * 15);
                                const z = p.z + Math.sin(i * 2.39996) * (20 + i * 15);
                                const w = r._windAt(x, z, tt, {});
                                winkel.push(wi((Math.atan2(w.x, w.z) - ga) * (180 / Math.PI)));
                                form.push(r._windForm(x, z, g));
                            }
                            form.sort((a1, b1) => a1 - b1);
                            return { ga: (ga * 180) / Math.PI, streuung: Math.max(...winkel), form };
                        };
                        const l1 = lauf(t);
                        let l2 = null;
                        let spaeterS = 0;
                        for (const dt of [5400, 21600, 43200, 86400]) {
                            const l = lauf(t + dt);
                            if (!l2 || wi(l.ga - l1.ga) > wi(l2.ga - l1.ga)) { l2 = l; spaeterS = dt; }
                        }
                        const fo = l1.form;
                        aus.s2 = { punkte: fo.length, streuungGrad: r3(l1.streuung), streuungSpaeter: r3(l2.streuung), drehungGrad: r3(wi(l2.ga - l1.ga)), spaeterS, formLee: r3(fo[0]), formFrei: r3(fo[Math.floor(fo.length * 0.5)]), formDuese: r3(fo[fo.length - 1]), formLeeAnteil: r3(fo.filter((v) => v < 0.95).length / fo.length), formDueseAnteil: r3(fo.filter((v) => v > 1.05).length / fo.length), wolke: ["_wolkenWind", "_wolkeWindAt", "_rauchWindAt"].filter((n) => typeof r[n] === "function").length };
                        const R = AnazhRealm;
                        const Num = { k: (v) => v, mul: (a1, b1) => a1 * b1, sub: (a1, b1) => a1 - b1, max: Math.max, klemm: (v) => Math.min(1, Math.max(0, v)), ecke: (v) => v, mix: (a1, b1, s) => a1 + (b1 - a1) * s };
                        const nRegen = R._naesseKurve(0, r._weatherFieldFor("rainy"), 1800);
                        const nTrocken = R._naesseKurve(0, r._weatherFieldFor("sunny"), 1800);
                        const L = r._gelaende();
                        const pts = [];
                        for (let i = 0; i < 400; i++) pts.push([p.x - 30 + (i % 20) * 3.1, p.z - 30 + Math.floor(i / 20) * 3.1]);
                        const arr = new Float32Array(pts.length * 3);
                        pts.forEach((q, k) => { arr[3 * k] = q[0]; arr[3 * k + 1] = r._terrainSaatY(q[0], q[1], true); arr[3 * k + 2] = q[1]; });
                        const mulde = globalThis.__gelaendeCore.muldeEcken(L, arr, pts.length, 0, new Map());
                        const senke = pts.map((q, k) => {
                            let s = 0;
                            for (let j = 0; j < 8; j++) for (const d of [3.6, 7.2]) s += r._terrainSaatY(q[0] + Math.cos(j * 0.785) * d, q[1] + Math.sin(j * 0.785) * d, true);
                            return s / 16 - arr[3 * k + 1];
                        });
                        const pearson = (x, y) => { const n = x.length; const mx = x.reduce((s, v) => s + v, 0) / n, my = y.reduce((s, v) => s + v, 0) / n; let sxy = 0, sx = 0, sy = 0; for (let k = 0; k < n; k++) { sxy += (x[k] - mx) * (y[k] - my); sx += (x[k] - mx) ** 2; sy += (y[k] - my) ** 2; } return sx > 0 && sy > 0 ? sxy / Math.sqrt(sx * sy) : null; };
                        const deck = (n) => Array.from(mulde, (m) => R._pfuetzeGesetz(Num, m, n, 1).deckung);
                        const dR = deck(nRegen);
                        const dT = deck(nTrocken);
                        const enc = (v) => (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055);
                        const Y = (c) => 0.2126 * enc(c[0]) + 0.7152 * enc(c[1]) + 0.0722 * enc(c[2]);
                        const Ylin = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
                        const luma = [];
                        const lumaT = [];
                        const lin = [];
                        const alb = [];
                        for (let k = 0; k < pts.length; k += 4) {
                            const c = [0, 0, 0];
                            r._bodenFarbeAt(pts[k][0], arr[3 * k + 1], pts[k][1], c);
                            const nass = (n) => c.map((ch) => ch * R._naesseGesetz(Num, ch, 0.8, 0, n, null).faktor);
                            if (Y(c) > 0) {
                                luma.push(Y(nass(nRegen)) / Y(c));
                                lumaT.push(Y(nass(nTrocken)) / Y(c));
                                lin.push(Ylin(nass(nRegen)) / Ylin(c));
                                alb.push(Ylin(c));
                            }
                        }
                        const mitte = (v) => { const x = v.slice().sort((a1, b1) => a1 - b1); return x.length ? x[Math.floor(x.length / 2)] : null; };
                        aus.s3 = { punkte: pts.length, naesseRegen: r3(nRegen), naesseTrocken: r3(nTrocken), muldePos: Array.from(mulde).filter((m) => m > 0).length, pfuetzenRegen: dR.filter((d) => d > 0).length, pfuetzenTrocken: dT.filter((d) => d > 0).length, rPfuetze: r3(pearson(dR, senke)), rTrocken: r3(pearson(dT, senke)), lumaVerh: r3(mitte(luma)), lumaTrocken: r3(mitte(lumaT)), linearVerh: r3(mitte(lin)), albedoLinear: r3(mitte(alb)), farben: luma.length };
                        const haeuser = [];
                        for (const Si of (r._bewohnerSiedlungen || new Map()).values())
                            for (const s of (Si.plan && Si.plan.slots) || []) {
                                const x = Si.ox + s.x, z = Si.oz + s.z;
                                const y = r._terrainSaatY(x, z, true);
                                haeuser.push({ neigung: s.ov && Number.isFinite(s.ov.pitchDeg) ? s.ov.pitchDeg : null, schnee: r._schneePegelAt(y), kultur: s.kultur });
                            }
                        const hn = haeuser.filter((h) => h.neigung != null);
                        aus.s6 = { orte: (r._bewohnerSiedlungen || new Map()).size, haeuser: haeuser.length, mitNeigung: hn.length, rDach: r3(hn.length >= 5 ? pearson(hn.map((h) => h.neigung), hn.map((h) => h.schnee)) : null), schneeSpanne: r3(hn.length ? Math.max(...hn.map((h) => h.schnee)) - Math.min(...hn.map((h) => h.schnee)) : null), formen: haeuser.filter((h) => /innenhof|stelz|windturm/i.test(String(h.kultur))).length };
                        return aus;
                    };
                    const sturm = async (r, a) => {
                        const st = r.state;
                        const r3 = (v) => (Number.isFinite(v) ? Math.round(v * 1e3) / 1e3 : null);
                        const alt = st.weather;
                        const leute = () => { const o = []; for (const Si of (r._bewohnerSiedlungen || new Map()).values()) for (const b of Si.liste || []) o.push(b); return o; };
                        const frei = () => leute().filter((b) => !b.drinnen).length;
                        let t = performance.now();
                        const takt = (n) => { for (let i = 0; i < n; i++) r._gameLoopTick((t += 1000 / 60)); };
                        const p = st.playerMesh.position;
                        const kueste = [];
                        for (let k = 0; k < 400 && kueste.length < 40; k++) {
                            const ang = k * 2.39996;
                            let vor = null;
                            for (let d = 150; d <= 20000; d += 50) {
                                const x = p.x + Math.cos(ang) * d, z = p.z + Math.sin(ang) * d;
                                if (r._terrainMacroSurfaceY(x, z) < st.waterLevel) { if (vor) kueste.push(vor); break; }
                                vor = [x, z];
                            }
                        }
                        const land = () => kueste.map(([x, z]) => (r._landAt(x, z, 0) ? 1 : 0));
                        const n = leute().length;
                        const f0 = frei();
                        takt(a.takte);
                        const f1 = frei();
                        const k0 = land();
                        let f2 = null;
                        let k1 = null;
                        let wort = null;
                        try {
                            window.__wetterSetzen("stormy");
                            takt(a.takte);
                            wort = st.weather;
                            f2 = frei();
                            k1 = land();
                        } finally {
                            window.__wetterSetzen(alt);
                            takt(10);
                        }
                        let kAnders = 0;
                        for (let i = 0; i < k0.length; i++) if (k0[i] !== k1[i]) kAnders++;
                        return { bewohner: n, freiKlar: f0, freiKlar2: f1, freiSturm: f2, wortSturm: wort, zurueck: st.weather === alt, alt, kuestePunkte: kueste.length, kuesteAnders: kAnders, leser: ["_wetterFlucht", "_bewohnerRegen", "_schutzSuchen"].filter((x) => typeof r[x] === "function").length };
                    };
                    const w = await S(ruhig, {});
                    let s = null;
                    let sf = null;
                    try {
                        s = await S(sturm, { takte: 120 });
                    } catch (e) {
                        sf = String((e && e.message) || e).slice(0, 200);
                    }
                    const aus = M.teil || {};
                    aus[2] = { werte: { streuungGrad: w.s2.streuungGrad }, zeuge: w.s2, auge: await M.auge("wetter-welt-s2", { ort: "wiese" }) };
                    aus[3] = { werte: { lumaVerh: w.s3.lumaVerh, rPfuetze: w.s3.rPfuetze, lumaTrocken: w.s3.lumaTrocken, rTrocken: w.s3.rTrocken }, zeuge: w.s3 };
                    if (s) {
                        aus[4] = { werte: { freiProzent: s.freiKlar ? Math.round((1000 * s.freiSturm) / s.freiKlar) / 10 : null }, zeuge: s, auge: await M.auge("wetter-welt-s4", { ort: "wiese" }) };
                        aus[5] = { werte: { kuesteVerschiebungM: s.kuesteAnders }, zeuge: s, auge: await M.auge("wetter-welt-s5", { ort: "wiese" }), nicht: "kein Gelände-Wandel durch Wetter: das Relief ist eine Funktion der Saat und des Erdbaus — im Sturm ändern " + s.kuesteAnders + " von " + s.kuestePunkte + " Küstenpunkten ihr Land; keine Düne, keine Rinne" };
                    } else {
                        aus[4] = { werte: {}, zeuge: { fehler: sf }, auge: await M.auge("wetter-welt-s4", { ort: "wiese" }) };
                        aus[5] = { werte: {}, zeuge: { fehler: sf }, auge: await M.auge("wetter-welt-s5", { ort: "wiese" }), nicht: "kein Gelände-Wandel durch Wetter (die Sturm-Messung warf: " + sf + ")" };
                    }
                    aus[6] = { werte: { rDach: w.s6.rDach, haeufigerFaktor: w.s6.formen ? null : 0 }, zeuge: w.s6 };
                    return { sprossen: aus };
                },
                sprossen: {
                    2: {
                        u: {},
                        soll: [K.soll(D, 2, "dieselbe Richtung ±20°", { key: "streuungGrad", rel: "≤", zahl: 20, einheit: "°" })],
                        auge: { pose: "ein Sturmbild an der Wiese: Gras, Bäume, Wolken, Rauch, Wasser", vorbild: "dieselbe Richtung ±20°, Lee < frei < Düse (Blindpaar R11)" },
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.punkte >= 50)) return "nur " + (z.punkte || 0) + " Punkte des Winds";
                            if (!(z.formLee < z.formFrei && z.formFrei < z.formDuese)) return "Lee < frei < Düse hält nicht (" + z.formLee + " · " + z.formFrei + " · " + z.formDuese + ")";
                            if (!(z.drehungGrad >= 5) || !(z.streuungSpaeter <= 20)) return "der Gegenlauf (die Front bis 24 h später gedreht) fehlt oder die Leser folgen ihr nicht (" + z.drehungGrad + "° Drehung, " + z.streuungSpaeter + "° Streuung)";
                            if (!(z.wolke > 0)) return "Wolken und Rauch lesen den Wind am Ort nicht";
                            return null;
                        },
                        taeter: "stamm/stoff-material.js _windAt/_windForm",
                        leser: "stamm/stoff-material.js:349 — _windDirAt speist Gras und Laub; kein Leser für Wolken und Rauch am Ort",
                        gruen: { werte: { streuungGrad: 12 }, zeuge: { punkte: 200, formLee: 0.7, formFrei: 1, formDuese: 1.3, drehungGrad: 30, streuungSpaeter: 10, wolke: 1 } },
                        attrappen: [
                            { name: "12° ohne Punkte", roh: { werte: { streuungGrad: 12 }, zeuge: {} } },
                            { name: "die Front dreht nicht (kein Gegenlauf)", roh: { werte: { streuungGrad: 12 }, zeuge: { punkte: 200, formLee: 0.7, formFrei: 1, formDuese: 1.3, drehungGrad: 0, streuungSpaeter: 10, wolke: 1 } } },
                        ],
                    },
                    3: {
                        u: {},
                        soll: [K.soll(D, 3, "Luma porös nass/trocken 0,5–0,8", { key: "lumaVerh" }), K.soll(D, 3, "Pfützen in Senken r ≥ 0,5", { key: "rPfuetze" })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.punkte >= 300)) return "nur " + (z.punkte || 0) + " Punkte des Bodens (Soll 400)";
                            if (!(z.naesseRegen > 0)) return "der Regen benetzt nicht (Nässe " + z.naesseRegen + ")";
                            if (!(z.pfuetzenRegen > 0)) return "keine Pfütze im Regen";
                            if (z.naesseTrocken !== 0 || z.pfuetzenTrocken !== 0) return "der Gegenlauf trocken trägt Nässe " + z.naesseTrocken + " und " + z.pfuetzenTrocken + " Pfützen (die Wirkung bleibt)";
                            return null;
                        },
                        taeter: "stamm/stoff-material.js _naesseGesetz/_pfuetzeGesetz über gelaende-core.js muldeEcken",
                        gruen: { werte: { lumaVerh: 0.62, rPfuetze: 0.71 }, zeuge: { punkte: 400, naesseRegen: 0.98, pfuetzenRegen: 60, naesseTrocken: 0, pfuetzenTrocken: 0 } },
                        attrappen: [
                            { name: "Luma 0,62 und r 0,71 ohne Boden der Welt", roh: { werte: { lumaVerh: 0.62, rPfuetze: 0.71 }, zeuge: {} } },
                            { name: "die Pfützen stehen auch trocken (Gegenlauf ohne Wirkung)", roh: { werte: { lumaVerh: 0.62, rPfuetze: 0.71 }, zeuge: { punkte: 400, naesseRegen: 0.98, pfuetzenRegen: 60, naesseTrocken: 0, pfuetzenTrocken: 60 } } },
                        ],
                    },
                    4: {
                        u: {},
                        soll: [K.soll(D, 4, "Anteil im Freien bei Sturm ≤ 30 % des klaren Werts", { key: "freiProzent", einheit: "%" })],
                        auge: { pose: "der Marktplatz des nächsten Orts, klar ↔ Sturm (heute: Wiese)", vorbild: "Bildpaar Marktplatz (Blindpaar R11)" },
                        zeuge: (roh) => ((roh.zeuge || {}).bewohner >= 10 && (roh.zeuge || {}).wortSturm === "stormy" && (roh.zeuge || {}).zurueck ? null : "keine 10 Bewohner, kein Sturm oder das Wetter kehrte nicht zurück"),
                        taeter: "stamm/siedlung-bewohner.js (kein Leser des Wetters)",
                        leser: "stamm/siedlung-bewohner.js:2331 drinnenSoll — folgt dem Tagesplan der Stunde, kein Leser von _weatherIsWet (stamm/bild-himmel.js:2861)",
                        gruen: { werte: { freiProzent: 20 }, zeuge: { bewohner: 27, wortSturm: "stormy", zurueck: true } },
                        attrappen: [{ name: "20 % ohne Bewohner", roh: { werte: { freiProzent: 20 }, zeuge: {} } }],
                    },
                    5: {
                        u: {},
                        // ZAHL (auge-klasse.cjs): die Zahl urteilt, das Bild ist Beleg — die sichtbare Hälfte des Satzes ist ein eigenes Soll (ungemessen: ROT)
                        soll: [K.soll(D, 5, "Küstenlinie messbar verändert", { key: "kuesteVerschiebungM", rel: ">", zahl: 0, refQuelle: "der Richter selbst: „messbar verändert“ — jede Verschiebung über 0 an derselben Pose zählt", einheit: "Punkte" }), K.soll(D, 5, "Dünenversatz in Windrichtung", { key: "duenenVersatzWindM", rel: ">", zahl: 0, refQuelle: "der Richter: „Dünenversatz in Windrichtung“ — die Verschiebung der Dünenkämme, projiziert auf die Windrichtung, ist > 0 m", einheit: "m" })],
                        zeuge: (roh) => ((roh.zeuge || {}).kuestePunkte >= 20 && (roh.zeuge || {}).wortSturm === "stormy" ? null : "keine 20 Küstenpunkte oder kein Sturm (die Verschiebung ohne Wetter ist keine Kopplung)"),
                        auge: { pose: "die Küste vor ↔ nach 10 Spieljahren an derselben Pose (heute: Wiese)", vorbild: "Bildpaar: Dünenversatz in Windrichtung, Küstenlinie verändert (Blindpaar R11)" },
                        taeter: "gelaende-core.js hoehe (das Relief liest kein Wetter)",
                        nicht: "kein Gelände-Wandel durch Wetter",
                        leser: "gelaende-core.js:2819 hoehe — das Relief ist Saat + Erdbau, kein Leser von Regen, Wind und Landfall",
                        gruen: { werte: { kuesteVerschiebungM: 6, duenenVersatzWindM: 4 }, zeuge: { kuestePunkte: 64, wortSturm: "stormy" } },
                        attrappen: [{ name: "6 ohne Sturm", roh: { werte: { kuesteVerschiebungM: 6, duenenVersatzWindM: 4 }, zeuge: {} } }],
                    },
                    6: {
                        u: {},
                        soll: [K.soll(D, 6, "Dachneigung ↔ Schneelast r ≥ 0,5", { key: "rDach" }), K.soll(D, 6, "Innenhof, Stelzen, Windturm ≥ 3× häufiger", { key: "haeufigerFaktor" })],
                        zeuge: (roh) => ((roh.zeuge || {}).orte >= 100 ? null : "nur " + ((roh.zeuge || {}).orte || 0) + " Orte geladen (Soll 100 über Klimazonen)"),
                        taeter: "fachwerk-core.js pitchDeg (die Dachneigung folgt dem Stil, nie dem Schnee)",
                        leser: "fachwerk-core.js:5737 — pitchDeg liest den Stil (STILMODE pMin), keine Schneelast; keine Bauform Innenhof/Stelzen/Windturm",
                        gruen: { werte: { rDach: 0.62, haeufigerFaktor: 3.4 }, zeuge: { orte: 100 } },
                        attrappen: [{ name: "r 0,62 an einem Ort", roh: { werte: { rDach: 0.62, haeufigerFaktor: 3.4 }, zeuge: { orte: 1 } } }],
                    },
                },
            },

            // ════════ stadtklima — die Megastadt macht ihr eigenes Wetter ════════
            // S1 der Wind in den Gassen der geladenen Orte (`_windAt` an den Mitten ihrer Wege gegen die Richtung der Gasse) mit dem Gegenlauf derselben
            // Punkte, 300 m abseits; S2 die Temperatur am Kern gegen den Rand auf gleicher Höhe (`_temperaturAt`); S3–S6 fragen die Welt nach der Größe des
            // Orts, nach Dunst und Böe am Ort und nach den Bewohnern (Umfang nicht erzeugbar).
            [E]: {
                sek: 10,
                dorf: true,
                pfad: ["stamm/stoff-material.js", "stamm/bild-himmel.js", "stamm/siedlung-ort.js", "stamm/siedlung-bewohner.js", "fachwerk-core.js", "gelaende-core.js", "scripts/werkbank.cjs"],
                ungefahren: "das Bildpaar der tauenden Stadt (S2) schießt nur das Gerät",
                mess: async function (H, U, M) {
                    const S = (fn, a) => H.seite("return await (" + String(fn) + ")(r, " + JSON.stringify(a || {}) + ");");
                    const seite = async (r) => {
                        const st = r.state;
                        const r3 = (v) => (Number.isFinite(v) ? Math.round(v * 1e3) / 1e3 : null);
                        const t = st.spielZeit || 0;
                        const ab = [];
                        const abG = [];
                        const platz = [];
                        const dW = r._windDirAt(t);
                        let groesste = 0;
                        let bewohner = 0;
                        let kern = null;
                        for (const Si of (r._bewohnerSiedlungen || new Map()).values()) {
                            const pl = Si.plan || {};
                            groesste = Math.max(groesste, (pl.slots || []).length);
                            bewohner += (Si.liste || []).length;
                            if (!kern) kern = { x: Si.ox, z: Si.oz };
                            for (const w of pl.roads || []) {
                                const pts = (w && (w.pts || w.punkte)) || (Array.isArray(w) ? w : null);
                                if (!pts) continue;
                                for (let i = 1; i < pts.length; i++) {
                                    const dx = pts[i].x - pts[i - 1].x, dz = pts[i].z - pts[i - 1].z;
                                    if (Math.hypot(dx, dz) < 2) continue;
                                    const mx = Si.ox + (pts[i].x + pts[i - 1].x) / 2, mz = Si.oz + (pts[i].z + pts[i - 1].z) / 2;
                                    const g = Math.atan2(dx, dz);
                                    const dev = (w1) => { let d = Math.abs(Math.atan2(w1.x, w1.z) - g) * (180 / Math.PI) % 180; return d > 90 ? 180 - d : d; };
                                    // DER UMFANG DER SPROSSE (stadtklima#1): die Gasse ist die Schlucht mit Fassade beidseits (fachwerk
                                    // `gassenWind` κ ≥ 0,99) — dort das Maß und sein Gegenlauf 300 m abseits; der Platz (κ 0, kein Haus in
                                    // Reichweite) ist die Gegenprobe: frei folgt der Wind dem Feld, nicht dem Weg
                                    const kap = r._gassenWind(mx, mz, dW).kappa;
                                    if (kap >= 0.99) {
                                        ab.push(dev(r._windAt(mx, mz, t, {})));
                                        abG.push(dev(r._windAt(mx + 300, mz + 300, t, {})));
                                    } else if (kap === 0) platz.push(dev(r._windAt(mx, mz, t, {})));
                                }
                            }
                        }
                        const m = (v) => (v.length ? v.reduce((s, x) => s + x, 0) / v.length : null);
                        const yK = kern ? r._terrainSaatY(kern.x, kern.z, true) : null;
                        let rand = null;
                        if (kern)
                            for (let j = 0; j < 64; j++)
                                for (const d of [400, 600, 800]) {
                                    const x = kern.x + Math.cos(j * 0.0982) * d, z = kern.z + Math.sin(j * 0.0982) * d;
                                    const y = r._terrainSaatY(x, z, true);
                                    if (!rand || Math.abs(y - yK) < Math.abs(rand.y - yK)) rand = { x, z, y };
                                }
                        const tK = kern ? r._temperaturAt(yK, 0) : null;
                        const tR = rand ? r._temperaturAt(rand.y, 0) : null;
                        const tRoh = kern ? r._temperaturAt(r._terrainSaatY(kern.x + 600, kern.z, true), 0) : null;
                        // DIE PFÜTZE IM SCHATTEN (stadtklima#1), als VERHALTEN: am Haus des Dach-Pools, das dem Auge am nächsten steht,
                        // ein Ort im Wurf seiner Wand (gegen die Sonne) und einer in der Sonne (vor ihr) — die Zeit, bis die Nässe am
                        // Ort (`_naesseAm`, derselbe Leser wie der Stoff) trocken ist, unter klarem Mittag (die Uhr kehrt zurück)
                        let schatten = null;
                        const U = st.atmoUniforms;
                        if (typeof r._naesseAm === "function" && U && U.dachLage && U.schattenSonne) {
                            const uhr = st.timeOfDay;
                            try {
                                st.timeOfDay = 0.45;
                                const wfK = r._weatherFieldFor("sunny");
                                r._schattenTakt(r.constructor._trockenAnteil(wfK));
                                const S = U.schattenSonne.value, h = Math.hypot(S.x, S.z) || 1;
                                const R = r.constructor._trockenRate(wfK);
                                const zeit = (x, y, z) => { for (let q = 0; q < 2e4; q += 5) if (r._naesseAm(x, y, z, q * R) <= 0) return q; return null; };
                                for (let i = 0; i < U.dachLage.length && !schatten; i++) {
                                    const L = U.dachLage[i].value, M = U.dachMass[i].value;
                                    if (!(M.x > 0)) continue;
                                    const e = Math.hypot(M.x, M.y);
                                    const o = (k) => { const x = L.x + (k * S.x / h) * (e + 2), z = L.y + (k * S.z / h) * (e + 2); return [x, r._terrainSaatY(x, z, true) + 0.05, z]; };
                                    const [pS, pO] = [o(-1), o(1)];
                                    if (!(r._hausSchatten(...pS) === 1 && r._hausSchatten(...pO) === 0)) continue;
                                    const [tS, tO] = [zeit(...pS), zeit(...pO)];
                                    if (tS && tO) schatten = { trockenSchattenS: tS, trockenSonneS: tO, verh: r3(tS / tO), haus: i };
                                }
                            } finally {
                                st.timeOfDay = uhr;
                                r._schattenTakt(r.constructor._trockenAnteil(r._weatherFieldFor(st.weather)));
                            }
                        }
                        const wf = r._weatherFieldFor();
                        const bk = kern ? r._windAt(kern.x, kern.z, t, {}) : null;
                        const bf = kern ? r._windAt(kern.x + 600, kern.z, t, {}) : null;
                        return { segmente: ab.length, abweichung: r3(m(ab)), abweichungFrei: r3(m(abG)), platzStuecke: platz.length, platzGrad: r3(m(platz)), schatten: schatten ? schatten.verh : 0, pfuetze: schatten, groesste, bewohner, dK: tK != null && tR != null ? r3(tK - tR) : null, dHoeheM: rand ? r3(rand.y - yK) : null, dKOhneHoehe: tK != null ? r3(tK - tRoh) : null, nebel: r3(wf.fog), boeFaktor: bk && bf && bf.boe ? r3(bk.boe / bf.boe) : null };
                    };
                    const w = await S(seite, {});
                    const aus = M.teil || {};
                    aus[1] = { werte: { abweichungGrad: w.abweichung, abweichungFrei: w.abweichungFrei, platzGrad: w.platzGrad, schattenTrockenVerh: w.schatten }, zeuge: w };
                    aus[2] = { werte: { dK: w.dK }, zeuge: w, auge: await M.auge("stadtklima-s2", { ort: "wiese" }), ...(w.groesste >= 100 ? {} : { nicht: "keine Stadt mit 10² Häusern geladen (größter Ort " + w.groesste + " Häuser); _temperaturAt liest nur die Höhe: Kern − Rand auf gleicher Höhe " + w.dK + " K (" + w.dHoeheM + " m Höhenversatz), 600 m daneben ohne Höhen-Abgleich " + w.dKOhneHoehe + " K — die Höhe, keine Stadt" }) };
                    aus[3] = { werte: { sichtProzent: 100, boeFaktor: w.boeFaktor }, zeuge: w, nicht: "keine Stadt mit 10⁴ Häusern (die Wand des Rang-Gesetzes 500); der Dunst ist ein Wetter-Feld der ganzen Welt (Nebel " + w.nebel + ")" };
                    aus[4] = { werte: {}, zeuge: w, nicht: "keine 10⁶ Bewohner (geladen " + w.bewohner + ")" };
                    aus[5] = { werte: {}, zeuge: w, nicht: "keine Megastadt ≥ 10⁷ (größter Ort " + w.groesste + " Häuser), kein Niederschlag am Ort aus der Stadt" };
                    aus[6] = { werte: {}, zeuge: w, nicht: "keine Industriestadt und kein Smog: Sicht und Himmel folgen dem Wetter-Feld, nie der Epoche der Stadt" };
                    return { sprossen: aus };
                },
                sprossen: {
                    1: {
                        u: {},
                        soll: [K.soll(E, 1, "Wind folgt der Gasse ±20°", { key: "abweichungGrad", rel: "≤", zahl: 20, einheit: "°" })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.segmente >= 10)) return "nur " + (z.segmente || 0) + " Gassen-Stücke gemessen";
                            if (!(z.abweichungFrei - z.abweichung >= 10)) return "der Gegenlauf 300 m abseits weicht gleich ab (" + z.abweichungFrei + "° ↔ " + z.abweichung + "°): die Gasse lenkt nicht";
                            if (!(z.platzGrad - z.abweichung >= 10)) return "der Platz (κ 0) folgt dem Weg wie die Gasse (" + z.platzGrad + "° ↔ " + z.abweichung + "°): keine Gegenprobe";
                            if (!(z.schatten > 1)) return "die Pfütze trocknet im Schatten nicht später (Trocken-Zeit Schatten ÷ Sonne " + z.schatten + ")";
                            return null;
                        },
                        taeter: "stamm/stoff-material.js _windAt (liest keine Häuser)",
                        leser: "stamm/stoff-material.js _windAt über _gassenWind (fachwerk gassenWind, die Gasse κ ≥ 0,99); stamm/stoff-dach.js _naesseAm über _hausSchatten (der Dach-Pool, die Sonne des Lichts) — der Stoff liest dieselbe Nässe am Ort (_naesseOrtKnoten)",
                        gruen: { werte: { abweichungGrad: 12 }, zeuge: { segmente: 40, abweichung: 12, abweichungFrei: 44, platzGrad: 43, schatten: 2.6 } },
                        attrappen: [{ name: "12° ohne Gassen", roh: { werte: { abweichungGrad: 12 }, zeuge: {} } }],
                    },
                    2: {
                        u: {},
                        // ZAHL (auge-klasse.cjs): die Zahl urteilt, das Bild ist Beleg — die sichtbare Hälfte des Satzes ist ein eigenes Soll (ungemessen: ROT)
                        soll: [K.soll(E, 2, "Kern ≥ 2 K wärmer", { key: "dK", einheit: "K" }), K.soll(E, 2, "Schnee taut im Kern zuerst", { key: "tauVorsprungH", rel: ">", zahl: 0, refQuelle: "der Richter: „Schnee taut im Kern zuerst“ — der Schnee im Kern ist früher weg als am Rand gleicher Höhe (Vorsprung > 0 h)", einheit: "h" })],
                        zeuge: (roh) => ((roh.zeuge || {}).groesste >= 100 ? null : "keine Stadt mit 10² Häusern geladen (größter Ort " + ((roh.zeuge || {}).groesste || 0) + ")"),
                        auge: { pose: "die Stadt in klarer Winternacht (heute: Wiese)", vorbild: "Bildpaar: Schnee taut im Kern zuerst (Blindpaar R11)" },
                        taeter: "stamm/bild-himmel.js _temperaturAt (nur die Höhe)",
                        nicht: "keine Stadt mit 10² Häusern",
                        leser: "stamm/bild-himmel.js:3063 — _temperaturAt(y, traegTage) liest keinen Ort (x, z), keine Wärmeinsel",
                        gruen: { werte: { dK: 2.5, tauVorsprungH: 6 }, zeuge: { groesste: 140 } },
                        attrappen: [{ name: "2,5 K ohne Stadt", roh: { werte: { dK: 2.5, tauVorsprungH: 6 }, zeuge: {} } }],
                    },
                    3: {
                        u: {},
                        soll: [K.soll(E, 3, "Sicht im Kern ≤ 50 % des Umlands", { key: "sichtProzent", einheit: "%" }), K.soll(E, 3, "Böe am Turmfuß ≥ 1,5×", { key: "boeFaktor" })],
                        zeuge: (roh) => ((roh.zeuge || {}).groesste >= 1e4 ? null : "keine Stadt mit 10⁴ Häusern"),
                        taeter: "fachwerk-core.js GROESSE_WAND (500 Häuser)",
                        nicht: "keine Stadt mit 10⁴ Häusern",
                        leser: "stamm/bild-himmel.js:3009 _weatherFieldFor — trägt Nebel für die ganze Welt, keinen Dunst am Ort",
                        gruen: { werte: { sichtProzent: 40, boeFaktor: 1.7 }, zeuge: { groesste: 12000 } },
                        attrappen: [{ name: "40 % ohne Stadt", roh: { werte: { sichtProzent: 40, boeFaktor: 1.7 }, zeuge: {} } }],
                    },
                    4: {
                        u: {},
                        soll: [K.soll(E, 4, "Anteil im Freien bei Regen ≤ 30 %", { key: "freiProzent", einheit: "%" })],
                        zeuge: (roh) => ((roh.zeuge || {}).bewohner >= 1e6 ? null : "keine 10⁶ Bewohner"),
                        taeter: "stamm/siedlung-bewohner.js (Bewohner nur der geladenen Orte)",
                        nicht: "keine 10⁶ Bewohner",
                        leser: "stamm/siedlung-bewohner.js:277 _bewohnerSiedlungen — die Bewohner leben nur in geladenen Orten, kein Leser des Regens",
                        gruen: { werte: { freiProzent: 22 }, zeuge: { bewohner: 1e6 } },
                        attrappen: [{ name: "22 % ohne Bewohner", roh: { werte: { freiProzent: 22 }, zeuge: {} } }],
                    },
                    5: {
                        u: {},
                        soll: [K.soll(E, 5, "Niederschlag im Lee ≥ +10 % gegen Luv", { key: "leePlusProzent", einheit: "%" })],
                        zeuge: (roh) => ((roh.zeuge || {}).groesste >= 1e6 ? null : "keine Megastadt"),
                        taeter: "phyto-core.js wetterAt (liest keine Stadt)",
                        nicht: "keine Megastadt ≥ 10⁷",
                        leser: "phyto-core.js:4804 — wetterAt liest Saat, Ort, Zeit und das Δ des Planeten, keine Stadt",
                        gruen: { werte: { leePlusProzent: 14 }, zeuge: { groesste: 2e6 } },
                        attrappen: [{ name: "+14 % ohne Stadt", roh: { werte: { leePlusProzent: 14 }, zeuge: {} } }],
                    },
                    6: {
                        u: {},
                        soll: [K.soll(E, 6, "Sicht und Himmelsfarbe gegen historische Messreihen ±30 %", { key: "abweichungProzent", rel: "≤", zahl: 30, einheit: "%" })],
                        zeuge: (roh) => ((roh.zeuge || {}).smog > 0 ? null : "kein Smog in der Welt"),
                        taeter: "stamm/bild-himmel.js _weatherFieldFor (kein Smog der Epoche)",
                        nicht: "keine Industriestadt, kein Smog",
                        leser: "stamm/bild-himmel.js:3009 _weatherFieldFor — Sicht und Himmel lesen das Wetter-Feld, keine Epoche der Stadt (Kohle 1850)",
                        gruen: { werte: { abweichungProzent: 18 }, zeuge: { smog: 1 } },
                        attrappen: [{ name: "18 % ohne Smog", roh: { werte: { abweichungProzent: 18 }, zeuge: {} } }],
                    },
                },
            },

            // ════════ kaskade — Vulkan formt Küste formt Stadt formt Verkehr ════════
            // Die Welt wird nach jedem Glied gefragt (Rutschung, Fluss-Verlagerung, Deich, Beben, Tsunami); S4 misst die Flut selbst: der EINE Spiegel 2 m
            // gehoben (im finally zurück) — die geflutete Fläche der Leser (`_nassAt`, `_landAt`) gegen die Tiefenkarte (`_voxelSurfaceY` < Spiegel)
            // an 400 Punkten um die Küste, der Gegenlauf ohne Hebung.
            [F]: {
                sek: 15,
                mutiert: true,
                faecher: true,
                pfad: ["stamm/wasser-*.js", "stamm/feld-brand.js", "stamm/siedlung-*.js", "gelaende-core.js", "planet-core.js", "scripts/werkbank.cjs"],
                ungefahren: "das Bild der Folge (S1) schießt nur das Gerät",
                mess: async function (H, U, M) {
                    const S = (fn, a) => H.seite("return await (" + String(fn) + ")(r, " + JSON.stringify(a || {}) + ");");
                    const seite = async (r) => {
                        const st = r.state;
                        const wl = st.waterLevel;
                        const p = st.playerMesh.position;
                        const r3 = (v) => (Number.isFinite(v) ? Math.round(v * 1e3) / 1e3 : null);
                        const glieder = {};
                        for (const n of ["_rutschung", "_bergsturz", "_flussVerlegen", "_deichBauen", "_beben", "_tsunami", "_sturmflut", "_lavaGiessen", "_ausbruch"]) glieder[n] = typeof r[n] === "function";
                        const pts = [];
                        for (let k = 0; k < 600 && pts.length < 400; k++) {
                            const ang = k * 2.39996;
                            let a1 = false, b1 = false;
                            for (let d = 150; d <= 20000; d += 20) {
                                const x = p.x + Math.cos(ang) * d, z = p.z + Math.sin(ang) * d;
                                const m = r._terrainMacroSurfaceY(x, z);
                                if (m < wl) break;
                                if (!a1 && m > wl + 0.2 && m < wl + 1.8) { pts.push([x, z, m]); a1 = true; }
                                if (!b1 && m > wl + 2.2 && m < wl + 4) { pts.push([x, z, m]); b1 = true; }
                            }
                        }
                        const lies = () => pts.map(([x, z]) => (r._nassAt(x, z) || !r._landAt(x, z, 0) ? 1 : 0));
                        const vor = lies();
                        const gegen = lies();
                        let nach;
                        try {
                            st.waterLevel = wl + 2;
                            nach = lies();
                        } finally {
                            st.waterLevel = wl;
                        }
                        const tief = pts.map(([x, z]) => { const b = r._voxelSurfaceY(x, z); return b !== null && Number.isFinite(b) && b < wl + 2 - 0.05 ? 1 : 0; });
                        const tiefMakro = pts.filter((q) => q[2] < wl + 2).length;
                        let gleich = 0, neu = 0, still = 0, beide = 0, eins = 0;
                        for (let i = 0; i < pts.length; i++) {
                            if (nach[i] === tief[i]) gleich++;
                            if (nach[i] && tief[i]) beide++;
                            if (nach[i] || tief[i]) eins++;
                            if (nach[i] && !vor[i]) neu++;
                            if (gegen[i] !== vor[i]) still++;
                        }
                        return { glieder, punkte: pts.length, gleich, beide, eins, neu, still, tief: tief.reduce((s, x) => s + x, 0), tiefMakro, zurueck: st.waterLevel === wl };
                    };
                    const w = await S(seite, {});
                    const g = w.glieder;
                    const da = Object.keys(g).filter((n) => g[n]);
                    const fehlt = (namen) => namen.filter((n) => !g[n]).join(", ");
                    const aus = M.teil || {};
                    // S1 AM FÄCHER (M4): 20 Hang-Orte an der Trasse × ohne ↔ mit Rutschung. Je Ort der Export, den der Verkehr liest (die
                    // Oberkante der Säule _voxelSurfaceY, stamm/siedlung-verkehr.js:2258, und der Hang _slopeAt); die Rutschung setzt der Welt-Akt
                    // des Glieds (_rutschung/_bergsturz) — fehlt er, nennt die Adresse ihn beim Namen. Folge = der Verkehr liest am Ort etwas
                    // anderes als ohne Rutschung
                    const HANG_AN = async (r, T, a, mit) => {
                        const [x, z] = a.ort;
                        if (a.zeit.k === "mit") {
                            const L = ["_rutschung", "_bergsturz"].filter((n) => typeof r[n] === "function");
                            if (!L.length) return { fehlt: "keine Rutschung: kein Glied _rutschung/_bergsturz in der Welt; der Akt voxel_fill (stamm/feld-dsl.js:1003) füllt eine Kugel ≤ 12 m, kein Glied macht daraus eine Sperre (stamm/siedlung-ort.js:3413 _wegenetzLegen liest kein Ereignis)" };
                            return { fehlt: "das Glied " + L.join("+") + " ist da, die Station kennt seine Form nicht" };
                        }
                        return { y: r._voxelSurfaceY(x, z), hang: r._slopeAt(x, z) };
                    };
                    const hang = await H.seite("const p = r.state.playerMesh.position, o = []; for (let k = 0; k < 400 && o.length < 20; k++) { const a = k * 2.39996, d = 80 + (k % 40) * 25, x = p.x + Math.cos(a) * d, z = p.z + Math.sin(a) * d; if (r._landAt(x, z, 0) && r._slopeAt(x, z) > 0.35) o.push([x, z]); } return o;");
                    const R1k = await FAECHER((c) => H.seite(c), {
                        gesetz: { fn: HANG_AN, export: "_voxelSurfaceY(x, z) · _slopeAt(x, z) am Hang (die Oberkante, die der Verkehr liest)", leser: "stamm/siedlung-verkehr.js:2258 die Ecke des Wagens aus _voxelSurfaceY" },
                        adressen: { orte: hang, zeiten: [{ k: "ohne" }, { k: "mit" }] },
                        ms: 5000,
                        masse: { saaten: { wie: "verschieden", feld: "a.ort" }, hangMittel: { wie: "mittel", feld: "hang" } },
                        schlecht: { feld: "hang", richtung: "max" },
                        pose: (a, w) => "der Hang " + a.ort.map(Math.round).join(",") + " (Hang " + (+w.hang).toFixed(2) + ") über der Trasse",
                        ungemessen: ["die gesperrte Straße im Bild (am Gerät)"],
                    });
                    aus[1] = {
                        werte: { saatenMitFolge: null, hangOrte: R1k.werte.saaten },
                        zeuge: { glieder: g, hangOrte: R1k.werte.saaten, akte: R1k.akte },
                        auge: await M.auge("kaskade-s1", { ort: "wiese" }),
                        nicht: (R1k.fehlt || "keine Rutschung sperrt eine Straße (" + fehlt(["_rutschung", "_bergsturz"]) + " fehlen)") + " — an " + R1k.fehltAn.length + " von " + hang.length + " Hang-Orten",
                    };
                    aus[2] = { werte: {}, zeuge: { glieder: g }, nicht: "kein Ausbruch formt Land: " + (g._lavaGiessen ? "die Lava (_lavaGiessen) gießt Glut ins Feld, kein Erdbau der Küste" : "keine Lava") };
                    aus[3] = { werte: {}, zeuge: { glieder: g }, nicht: "kein Fluss verlagert sich und keine Stadt baut einen Deich (" + fehlt(["_flussVerlegen", "_deichBauen"]) + ")" };
                    aus[4] = { werte: { flaecheProzent: w.eins ? Math.round((1000 * w.beide) / w.eins) / 10 : null }, zeuge: w, nicht: "keine Sturmflut und kein Deich (" + fehlt(["_sturmflut", "_deichBauen"]) + "): gemessen ist die Flut des gehobenen Spiegels allein; Flucht und Verkehr lesen keine Flut" };
                    aus[5] = { werte: {}, zeuge: { glieder: g }, nicht: "keine Kette Beben → Rutschung → Tsunami (" + fehlt(["_beben", "_rutschung", "_tsunami"]) + ")" };
                    aus[6] = { werte: {}, zeuge: { glieder: g }, nicht: "keine Vulkaninsel nach Ausbruch (" + (da.length ? "vorhanden: " + da.join(", ") : "kein Glied") + ")" };
                    aus[7] = { werte: {}, zeuge: { glieder: g }, nicht: "keine Kette aus den Gesetzen einer Welt" };
                    return { sprossen: aus };
                },
                sprossen: {
                    1: {
                        u: {},
                        // ZAHL (auge-klasse.cjs): die Zahl urteilt, das Bild ist Beleg — die sichtbare Hälfte des Satzes ist ein eigenes Soll (ungemessen: ROT)
                        soll: [K.soll(F, 1, "20 Saaten: Folge tritt ein", { key: "saatenMitFolge", rel: "≥", zahl: 20 }), K.soll(F, 1, "im Bild sichtbar", { key: "folgeImBild", rel: ">", zahl: 0, refQuelle: "der Richter: „Folge tritt ein und ist im Bild sichtbar“ — die gesperrte Straße steht im Bildausschnitt der Pose (Pixel der Sperre > 0)", einheit: "px" })],
                        zeuge: (roh) => ((((roh.zeuge || {}).glieder) || {})._rutschung ? null : "kein Glied _rutschung in der Welt (die Folge hat keine Ursache)"),
                        auge: { pose: "die gesperrte Straße nach der Rutschung (heute: Wiese)", vorbild: "die Folge im Bild sichtbar (Blindpaar R11)" },
                        taeter: "stamm/siedlung-ort.js (kein Ereignis sperrt eine Straße)",
                        nicht: "keine Rutschung",
                        leser: "stamm/siedlung-ort.js:3413 — _wegenetzLegen liest kein Ereignis; keine Rutschung im Gelände",
                        gruen: { werte: { saatenMitFolge: 20, folgeImBild: 900 }, zeuge: { glieder: { _rutschung: true } } },
                        attrappen: [{ name: "20 Saaten ohne Welt", roh: { werte: { saatenMitFolge: 20, folgeImBild: 900 }, zeuge: {} } }],
                    },
                    2: {
                        u: {},
                        soll: [K.soll(F, 2, "Küstenlinie verschiebt sich messbar", { key: "kuesteM", rel: ">", zahl: 0, refQuelle: "der Richter selbst: „verschiebt sich messbar“ — jede Verschiebung über 0 m nach dem Ausbruch zählt", einheit: "m" })],
                        zeuge: (roh) => ((roh.zeuge || {}).kueste > 0 ? null : "keine Küste verschoben"),
                        taeter: "stamm/feld-brand.js _lavaGiessen (kein Erdbau)",
                        nicht: "kein Ausbruch formt Land",
                        leser: "stamm/feld-leben.js:2510 _lavaGiessen — schreibt Glut ins Feld, kein Erdbau der Küste; die Strandfarbe liest kein Gestein",
                        gruen: { werte: { kuesteM: 40 }, zeuge: { kueste: 1 } },
                        attrappen: [{ name: "40 m ohne Ausbruch", roh: { werte: { kuesteM: 40 }, zeuge: {} } }],
                    },
                    3: {
                        u: {},
                        soll: [K.soll(F, 3, "nach Verlagerung entsteht Deich am Prallufer in ≥ 80 %", { key: "deichProzent", einheit: "%" })],
                        zeuge: (roh) => ((roh.zeuge || {}).deiche > 0 ? null : "kein Deich gezählt"),
                        taeter: "stamm/wasser-hydro.js (der Fluss liegt fest)",
                        nicht: "kein verlagerter Fluss, kein Deich",
                        leser: "stamm/wasser-hydro.js:597 — _hydroRiverAt liest die feste Hydrosphäre; kein Leser verlegt den Lauf",
                        gruen: { werte: { deichProzent: 85 }, zeuge: { deiche: 12 } },
                        attrappen: [{ name: "85 % ohne Deich", roh: { werte: { deichProzent: 85 }, zeuge: {} } }],
                    },
                    4: {
                        u: {},
                        soll: [
                            K.soll(F, 4, "überflutete Fläche = Tiefenkarte ≥ 90 %", { key: "flaecheProzent", einheit: "%" }),
                            K.soll(F, 4, "≥ 90 % der Bewohner verlassen die Zone", { key: "fluchtProzent", einheit: "%" }),
                            K.soll(F, 4, "Verkehr auf gefluteten Trassen 0", { key: "verkehrGeflutet" }),
                        ],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.punkte >= 200)) return "nur " + (z.punkte || 0) + " Punkte der Küste";
                            if (!(z.neu > 0)) return "die Hebung flutet keinen Punkt";
                            if (z.still !== 0) return "im Gegenlauf ändern sich " + z.still + " Punkte";
                            return null;
                        },
                        taeter: "stamm/siedlung-bewohner.js (keine Flucht vor der Flut), kein Deich",
                        nicht: "keine Sturmflut, kein Deich",
                        leser: "stamm/siedlung-bewohner.js:2331 drinnenSoll — der Tagesplan liest keine Flut; kein Deich im Gesetz",
                        gruen: { werte: { flaecheProzent: 96, fluchtProzent: 92, verkehrGeflutet: 0 }, zeuge: { punkte: 400, neu: 80, still: 0 } },
                        attrappen: [{ name: "96 % ohne Flut", roh: { werte: { flaecheProzent: 96, fluchtProzent: 92, verkehrGeflutet: 0 }, zeuge: { punkte: 400, neu: 0, still: 0 } } }],
                    },
                    5: {
                        u: {},
                        soll: [K.soll(F, 5, "30 nie gesehene Zufalls-Auslöseorte: Kette läuft in ≥ 80 %", { key: "ketteProzent", einheit: "%" })],
                        zeuge: (roh) => ((roh.zeuge || {}).orte >= 30 ? null : "keine 30 Auslöseorte"),
                        taeter: "gelaende-core.js (kein Beben, kein Tsunami)",
                        nicht: "keine Kette Beben → Tsunami",
                        leser: "gelaende-core.js:2819 hoehe — kein Leser von Beben und Rutschung; kein Tsunami im Wasser (stamm/wasser-hydro.js)",
                        gruen: { werte: { ketteProzent: 83 }, zeuge: { orte: 30 } },
                        attrappen: [{ name: "83 % ohne Orte", roh: { werte: { ketteProzent: 83 }, zeuge: {} } }],
                    },
                    6: {
                        u: {},
                        soll: [K.soll(F, 6, "Siedlung und Trasse entstehen in ≥ 70 % der Saaten", { key: "siedlungProzent", einheit: "%" })],
                        zeuge: (roh) => ((roh.zeuge || {}).saaten >= 10 ? null : "keine Saaten mit Ausbruch"),
                        taeter: "planet-core.js planetVulkane (kein Ausbruch als Ereignis der Welt)",
                        nicht: "keine Vulkaninsel nach Ausbruch",
                        leser: "voxel-worker.js:1446 — planetOrtAuftrag reicht keinen Vulkan (o.vulkan) an die Welt",
                        gruen: { werte: { siedlungProzent: 74 }, zeuge: { saaten: 20 } },
                        attrappen: [{ name: "74 % ohne Saaten", roh: { werte: { siedlungProzent: 74 }, zeuge: {} } }],
                    },
                    7: {
                        u: {},
                        soll: [K.soll(F, 7, "100 Welten: Kette läuft in ≥ 70 %", { key: "ketteProzent", einheit: "%" })],
                        zeuge: (roh) => ((roh.zeuge || {}).welten >= 100 ? null : "keine 100 Welten"),
                        taeter: "gelaende-core.js / planet-core.js (keine Ereignis-Kette)",
                        nicht: "keine Kette aus den Gesetzen",
                        leser: "planet-core.js:1841 planetScheibe — die Scheibe der Zeit ist stetig, keine Ereignis-Kette reicht in die Welt",
                        gruen: { werte: { ketteProzent: 72 }, zeuge: { welten: 100 } },
                        attrappen: [{ name: "72 % ohne Welten", roh: { werte: { ketteProzent: 72 }, zeuge: {} } }],
                    },
                },
            },

            // ════════ ereignis-spur — Ausbruch, Trapp, Einschlag, Sterben über die Äonen ════════
            // Der Planet-Faden an 31 Orten (Anker + Netz ±50°) über 0 … −500 Ma (51 Schritte): das Welt-Mittel von Wuchs (decke) und Jahresmittel — ein
            // Einbruch ist ein Fall der Decke um > 50 % zum Vorschritt, die Ursache ein Sprung des Klimas um ≥ 2 K im selben Schritt. Die Welt wird nach
            // Grabung/Bohrung gefragt (`_ascheAt` ist die Asche-Decke eines Brands an der Oberfläche, keine Schicht nach Alter).
            [G]: {
                sek: 20,
                faecher: true,
                pfad: PLANET_PFAD,
                ungefahren: "das Licht am Boden im Einschlag (S5) misst nur das Gerät",
                mess: async function (H, U, M) {
                    const S = (fn, a) => H.seite("return await (" + String(fn) + ")(r, " + JSON.stringify(a || {}) + ");");
                    const seite = async (r) => {
                        await r._fadenQuelle();
                        const r3 = (v) => (Number.isFinite(v) ? Math.round(v * 1e3) / 1e3 : null);
                        const samen = r._planetSamen();
                        const an = await r._planetAnker();
                        const B0 = (an.breite * 180) / Math.PI, L0 = (an.laenge * 180) / Math.PI;
                        const netz = [[B0, L0]];
                        for (let b = -50; b <= 50; b += 20) for (let l = -150; l <= 150; l += 75) netz.push([b, l]);
                        const decke = [];
                        const temp = [];
                        for (let i = 0; i <= 50; i++) {
                            const o = await Promise.all(netz.map((q) => r._planetAuftrag({ type: "planet-ort", samen, breite: q[0], laenge: q[1], zeitMa: -i * 10 })));
                            decke.push(o.reduce((s, x) => s + x.delta.wuchs.decke, 0) / o.length);
                            temp.push(o.reduce((s, x) => s + (x.delta.klima.sommer + x.delta.klima.winter) / 2, 0) / o.length);
                        }
                        let einbrueche = 0, mitUrsache = 0, spruenge = 0;
                        for (let i = 1; i < decke.length; i++) {
                            const fall = decke[i - 1] > 0 && decke[i] < 0.5 * decke[i - 1];
                            const sprung = Math.abs(temp[i] - temp[i - 1]) >= 2;
                            if (sprung) spruenge++;
                            if (fall) { einbrueche++; if (sprung) mitUrsache++; }
                        }
                        const grab = ["_grabung", "_bohrung", "_schichtfolgeAt", "_bohrkern"].filter((n) => typeof r[n] === "function").length;
                        const asche = typeof r._ascheAt === "function" ? 1 : 0;
                        const mt = temp.reduce((s, x) => s + x, 0) / temp.length;
                        return { schritte: decke.length, orte: netz.length, einbrueche, mitUrsache, spruenge, grab, asche, tSpanne: r3(Math.max(...temp) - Math.min(...temp)), tStreuung: r3(Math.sqrt(temp.reduce((s, x) => s + (x - mt) ** 2, 0) / temp.length)), maxSprungK: r3(Math.max(...temp.slice(1).map((x, i) => Math.abs(x - temp[i])))), dSpanne: r3(Math.max(...decke) - Math.min(...decke)) };
                    };
                    const w = await S(seite, {});
                    const aus = M.teil || {};
                    // S1 AM FÄCHER (M4): 12 Orte im Umkreis × die Alter des Planet-Fadens (0 … −500 Ma); je Adresse der Export, den eine Grabung
                    // läse (die Schichtfolge nach Alter) und die Asche-Decke der Oberfläche (_ascheAt, stamm/feld-brand.js:5) — trägt die Welt
                    // keine Schicht nach Alter, nennt die Adresse sie beim Namen
                    const GRAB = ["_grabung", "_bohrung", "_schichtfolgeAt", "_bohrkern"];
                    const GRAB_AN = async (r, T, a, mit) => {
                        const [x, z] = a.ort;
                        const L = mit.grab.filter((n) => typeof r[n] === "function");
                        const oben = typeof r._ascheAt === "function" ? r._ascheAt(x, z) : null;
                        if (!L.length) return { fehlt: "keine Grabung: kein Leser der Schichtfolge nach Alter (" + mit.grab.join("/") + "); stamm/feld-brand.js:5 _ascheAt liest nur die Asche-Decke der Oberfläche nach einem Brand (hier " + oben + "), voxel-worker.js:1446 planetOrtAuftrag reicht keine Schicht" };
                        return { fehlt: "die Grabung " + L.join("+") + " ist da, die Station kennt ihre Form nicht", oben };
                    };
                    const umkreis = await H.seite("const p = r.state.playerMesh.position, o = []; for (let k = 0; k < 12; k++) o.push([p.x + Math.cos(k * 0.5236) * 300, p.z + Math.sin(k * 0.5236) * 300]); return o;");
                    const R1g = await FAECHER((c) => H.seite(c), {
                        gesetz: { fn: GRAB_AN, export: "die Schichtfolge nach Alter (" + GRAB.join("/") + ") · stamm/feld-brand.js:5 _ascheAt", leser: "voxel-worker.js:1446 planetOrtAuftrag (der Planet-Faden, der die Welt trägt)" },
                        adressen: { orte: umkreis, zeiten: [0, -66, -252, -500].map((ma) => ({ ma })) },
                        mit: { grab: GRAB },
                        ms: 4000,
                        masse: { adressen: { wie: "anzahl", feld: "oben" } },
                        ungemessen: ["die Asche im Profil der Grabung (kein Leser)"],
                    });
                    aus[1] = { werte: { einbrueche: w.einbrueche }, zeuge: { ...w, akte: R1g.akte }, nicht: (R1g.fehlt || "keine Grabung") + " — " + R1g.fehltAn.length + " von " + R1g.adressen + " Adressen (12 Orte × 4 Alter) ohne Fähigkeit; der Faden trägt " + w.einbrueche + " Einbrüche der Decke über 500 Ma" };
                    aus[2] = { werte: {}, zeuge: w, nicht: "kein Großausbruch: das Welt-Mittel des Planeten (" + w.orte + " Orte) springt in 500 Ma " + w.spruenge + "-mal um ≥ 2 K je 10 Ma (größter Schritt " + w.maxSprungK + " K), kein Jahr nach einem Ausbruch" };
                    aus[3] = { werte: {}, zeuge: w, nicht: "kein Trapp als Ereignis der Welt: der Faden reicht keinen Vulkan und kein Gestein (keine Bohrung)" };
                    aus[4] = { werte: {}, zeuge: w, nicht: "kein Einschlag, keine Grenzlage, keine Bohrung" };
                    aus[5] = { werte: { sterben: w.einbrueche }, zeuge: w, nicht: "kein Massensterben mit Ursache und Spur: " + w.einbrueche + " Einbrüche der Decke in 500 Ma, kein Fossil, kein Licht-Einbruch" };
                    aus[6] = { werte: { einbrueche: w.einbrueche - w.mitUrsache, ursachenOhneSpur: w.spruenge - w.mitUrsache }, zeuge: w };
                    return { sprossen: aus };
                },
                sprossen: {
                    1: {
                        u: {},
                        soll: [K.soll(G, 1, "Grabung im Umkreis findet die Asche am erwarteten Alter in ≥ 95 %", { key: "ascheProzent", einheit: "%" })],
                        zeuge: (roh) => ((roh.zeuge || {}).grab > 0 ? null : "keine Grabung in der Welt"),
                        taeter: "voxel-worker.js planetOrtAuftrag (keine Schichtfolge)",
                        nicht: "keine Grabung, kein Ausbruch",
                        leser: "voxel-worker.js:1446 — planetOrtAuftrag reicht keine Schichtfolge und keinen Vulkan an die Welt",
                        gruen: { werte: { ascheProzent: 97 }, zeuge: { grab: 1 } },
                        attrappen: [{ name: "97 % ohne Grabung", roh: { werte: { ascheProzent: 97 }, zeuge: {} } }],
                    },
                    2: {
                        u: {},
                        soll: [K.soll(G, 2, "Welt-Temperatur −0,5 bis −2 K", { key: "dTWelt", rel: "band", zahl: -2, bis: -0.5, einheit: "K" })],
                        zeuge: (roh) => ((roh.zeuge || {}).ausbruch > 0 ? null : "kein Ausbruch VEI 7 in der Welt"),
                        taeter: "planet-core.js planetKlimaGlobal (stetig über Ma, kein Ausbruch)",
                        nicht: "kein Großausbruch",
                        leser: "planet-core.js:2092 — planetKlimaGlobal(plan, zeitMa) kennt kein Aerosol, kein Jahr nach einem Ausbruch",
                        gruen: { werte: { dTWelt: -1.1 }, zeuge: { ausbruch: 1 } },
                        attrappen: [{ name: "−1,1 K ohne Ausbruch", roh: { werte: { dTWelt: -1.1 }, zeuge: {} } }],
                    },
                    3: {
                        u: {},
                        soll: [K.soll(G, 3, "Mitteltemperatur ändert sich ≥ 2 °C", { key: "dTMittel", einheit: "°C" }), K.soll(G, 3, "Basalt in Bohrungen der Fläche ≥ 95 %", { key: "basaltProzent", einheit: "%" })],
                        zeuge: (roh) => ((roh.zeuge || {}).grab > 0 ? null : "keine Bohrung in der Welt"),
                        taeter: "voxel-worker.js planetOrtAuftrag (kein Trapp, kein Gestein)",
                        nicht: "kein Trapp als Ereignis",
                        leser: "voxel-worker.js:1446 — planetOrtAuftrag reicht o.vulkan (Trapp) und das Gestein nicht an die Welt",
                        gruen: { werte: { dTMittel: 3, basaltProzent: 97 }, zeuge: { grab: 1 } },
                        attrappen: [{ name: "3 °C ohne Bohrung", roh: { werte: { dTMittel: 3, basaltProzent: 97 }, zeuge: {} } }],
                    },
                    4: {
                        u: {},
                        soll: [K.soll(G, 4, "zufällige Bohrungen weltweit mit Grenzlage am selben Alter ≥ 90 %", { key: "bohrProzent", einheit: "%" })],
                        zeuge: (roh) => ((roh.zeuge || {}).grab > 0 ? null : "keine Bohrung in der Welt"),
                        taeter: "planet-core.js (kein Einschlag)",
                        nicht: "kein Einschlag",
                        leser: "planet-core.js:1841 planetScheibe — kein Einschlag, keine Grenzlage; die Welt bohrt nicht",
                        gruen: { werte: { bohrProzent: 93 }, zeuge: { grab: 1 } },
                        attrappen: [{ name: "93 % ohne Bohrung", roh: { werte: { bohrProzent: 93 }, zeuge: {} } }],
                    },
                    5: {
                        u: {},
                        soll: [K.soll(G, 5, "≥ 5 große Sterben", { key: "sterben" }), K.soll(G, 5, "Licht am Boden −3 EV", { key: "lichtEV", rel: "≤", zahl: -3, einheit: "EV" })],
                        zeuge: (roh) => ((roh.zeuge || {}).grab > 0 && (roh.zeuge || {}).mitUrsache >= 5 ? null : "keine 5 Sterben mit Ursache und Spur"),
                        taeter: "planet-core.js (kein Massensterben)",
                        nicht: "kein Massensterben",
                        leser: "planet-core.js:2092 planetKlimaGlobal — keine Sterbe-Ereignisse, kein Licht-Einbruch am Boden",
                        gruen: { werte: { sterben: 5, lichtEV: -3.2 }, zeuge: { grab: 1, mitUrsache: 5 } },
                        attrappen: [{ name: "5 Sterben aus einer Liste", roh: { werte: { sterben: 5, lichtEV: -3.2 }, zeuge: {} } }],
                    },
                    6: {
                        u: {},
                        soll: [K.soll(G, 6, "Einbrüche ohne Ursache = 0", { key: "einbrueche" }), K.soll(G, 6, "Ursachen ohne Spur = 0", { key: "ursachenOhneSpur" })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.saaten >= 1000)) return "nur " + (z.saaten || 1) + " Saat (Soll 1 000)";
                            if (!(z.einbrueche > 0)) return "keine Einbrüche gezählt (0 = 0 trägt nichts)";
                            return null;
                        },
                        taeter: "planet-core.js (keine Ereignis-Ketten über 4,5 Ga)",
                        gruen: { werte: { einbrueche: 0, ursachenOhneSpur: 0 }, zeuge: { saaten: 1000, einbrueche: 40 } },
                        attrappen: [{ name: "0 = 0 ohne Ereignisse", roh: { werte: { einbrueche: 0, ursachenOhneSpur: 0 }, zeuge: { saaten: 1000, einbrueche: 0 } } }],
                    },
                },
            },

            // ════════ gegenwart — die Gegenwart als Ergebnis der Geschichte ════════
            // S1/S6: die Relikte (die Nische Findling `_rockGeologyClass` an 1 000 Punkten der Welt) gegen die Eis-Geschichte des Orts (Jahresmittel der Heimat
            // aus dem Faden über 0 … −2,6 Ma; Eis unter −10 °C). S2: Gipfel > 2 km der Saaten gegen die konvergente Grenze (Δ ks über dem Minimum der Saat).
            // S3: Fjord-Küsten (Trog = Regler-Vorgabe + Δ ≥ 0,7, Küste ≥ 300 m hoch) ohne Eis heute und −20 ka. S4 der Meeresspiegel der Geschichte. S5:
            // 1 000 Orte um den Spieler (±20 km) — Land der Welt gegen Land des Planeten an derselben Lage (x Ost, z Süd), dazu ±200 km die Höhe (r);
            // Gegenlauf: der Planet an verschobener Lage (−31°, +97°) und −1 Ma.
            [P]: {
                sek: 40,
                faecher: true,
                pfad: [...PLANET_PFAD, "stamm/vegetation-baum.js", "stamm/gelaende-kollision.js"],
                ungefahren: "die Bildpaare Durchbruch/Fjord (S3) und Ankunft (S5) schießt nur das Gerät",
                mess: async function (H, U, M) {
                    const S = (fn, a) => H.seite("return await (" + String(fn) + ")(r, " + JSON.stringify(a || {}) + ");");
                    const seite = async (r, a) => {
                        await r._fadenQuelle();
                        const t0 = performance.now();
                        const st = r.state;
                        const r3 = (v) => (Number.isFinite(v) ? Math.round(v * 1e3) / 1e3 : null);
                        const samen = r._planetSamen();
                        const an = await r._planetAnker();
                        const B0 = (an.breite * 180) / Math.PI, L0 = (an.laenge * 180) / Math.PI;
                        const kh = r._gelaende().ort.klimaHeute;
                        const ort = (s, b, l, t) => r._planetAuftrag({ type: "planet-ort", samen: s, breite: b, laenge: ((((l + 180) % 360) + 360) % 360) - 180, zeitMa: t || 0 });
                        const tj = (o) => (kh.sommer + o.delta.klima.sommer + kh.winter + o.delta.klima.winter) / 2;
                        const zeiten = [0, -0.02, -0.1, -0.5, -1, -2, -2.6];
                        const gesch = await Promise.all(zeiten.map((t) => ort(samen, B0, L0, t)));
                        const tMin = Math.min(...gesch.map(tj));
                        const eis = tMin < -10;
                        const p = st.playerMesh.position;
                        const wl = st.waterLevel;
                        let relikte = 0, punkte = 0;
                        for (let i = 0; i < 1000; i++) {
                            const x = p.x + (((i * 0.6180339) % 1) * 2 - 1) * 2000;
                            const z = p.z + (((i * 0.7548776) % 1) * 2 - 1) * 2000;
                            if (r._terrainMacroSurfaceY(x, z) < wl) continue;
                            punkte++;
                            if (r._rockGeologyClass(r._slopeAt(x, z), 0) === "findling") relikte++;
                        }
                        const aus = { s1: { relikte, punkte, eis, tMinC: r3(tMin), zeiten: zeiten.length, mitUrsache: eis ? relikte : 0 } };
                        const gip = { gipfel: 0, konv: 0, saaten: 0, antworten: 0, land: 0, landKonv: 0 };
                        const hs = [];
                        for (let si = 0; si < a.saaten; si++) {
                            if (performance.now() - t0 > a.budgetMs) break;
                            const s = si === 0 ? samen : "zsp-" + (si - 1);
                            const P = [];
                            for (let b = -66; b <= 66; b += 6) for (let l = -180; l < 180; l += 6) P.push([b, l]);
                            const o = await Promise.all(P.map((q) => ort(s, q[0], q[1])));
                            gip.antworten += o.length;
                            const nb = 60;
                            const ksMin = Math.min(...o.filter((x) => x.land).map((x) => x.delta.wildnis.ks));
                            o.forEach((x, k) => {
                                hs.push(x.hoeheM);
                                if (x.land) {
                                    gip.land++;
                                    if (x.delta.wildnis.ks > ksMin + 0.05) gip.landKonv++;
                                }
                                if (!(x.land && x.hoeheM > 2000)) return;
                                const nachbarn = [k - 1, k + 1, k - nb, k + nb].filter((j) => j >= 0 && j < o.length).map((j) => o[j].hoeheM);
                                if (nachbarn.some((h) => h > x.hoeheM)) return;
                                gip.gipfel++;
                                if (x.delta.wildnis.ks > ksMin + 0.05) gip.konv++;
                            });
                            gip.saaten++;
                        }
                        const mh = hs.reduce((s1, x) => s1 + x, 0) / Math.max(1, hs.length);
                        gip.streuung = r3(Math.sqrt(hs.reduce((s1, x) => s1 + (x - mh) ** 2, 0) / Math.max(1, hs.length)));
                        aus.s2 = gip;
                        const K2 = [];
                        for (let b = -70; b <= 70; b += 5) for (let l = -180; l < 180; l += 5) K2.push([b, l]);
                        const k2 = await Promise.all(K2.map((q) => ort(samen, q[0], q[1])));
                        const k2f = await Promise.all(K2.map((q) => ort(samen, q[0], q[1], -0.02)));
                        const reg = (r._gelaende().ort.regler || []).find((x) => x.id === "trog");
                        const trogDef = reg ? reg.def : 0.7;
                        let kuesten = 0, fjord = 0, fjordOhne = 0, fjordEis = 0;
                        k2.forEach((x, k) => {
                            if (!(x.land && Math.abs(x.kuesteKm) < 60)) return;
                            kuesten++;
                            if (trogDef + x.delta.wildnis.trog >= 0.7 && x.hoeheM >= 300) {
                                fjord++;
                                if (Math.min(tj(x), tj(k2f[k])) > -10) fjordOhne++;
                                else fjordEis++;
                            }
                        });
                        aus.s3 = { kuesten, fjord, fjordOhne, fjordEis, trogDef };
                        const wlr = gesch.map((o) => o.delta.meer.waterLevelM);
                        aus.s4 = { spanneM: r3(Math.max(...wlr) - Math.min(...wlr)), rias: ["_riaAt", "_strandTerrasse"].filter((n) => typeof r[n] === "function").length };
                        const R = 6371000;
                        const Q = [];
                        for (let i = 0; i < 1000; i++) Q.push([p.x + (((i * 0.6180339) % 1) * 2 - 1) * 20000, p.z + (((i * 0.7548776) % 1) * 2 - 1) * 20000]);
                        const lagen = Q.map(([x, z]) => [B0 - (z / R) * (180 / Math.PI), L0 + (x / (R * Math.cos((B0 * Math.PI) / 180))) * (180 / Math.PI)]);
                        const pl = await Promise.all(lagen.map((q) => ort(samen, q[0], q[1])));
                        const pv = await Promise.all(lagen.map((q) => ort(samen, q[0] - 31, q[1] + 97)));
                        const pz = await Promise.all(lagen.map((q) => ort(samen, q[0], q[1], -1)));
                        let gleich = 0, weltLand = 0, planetLand = 0, gleichVerschoben = 0, gleichFrueh = 0;
                        Q.forEach(([x, z], k) => {
                            const wland = r._terrainMacroSurfaceY(x, z) >= wl;
                            if (wland) weltLand++;
                            if (pl[k].land) planetLand++;
                            if (wland === pl[k].land) gleich++;
                            if (wland === pv[k].land) gleichVerschoben++;
                            if (wland === pz[k].land) gleichFrueh++;
                        });
                        const Q2 = [];
                        for (let i = 0; i < 1000; i++) Q2.push([p.x + (((i * 0.3819660) % 1) * 2 - 1) * 200000, p.z + (((i * 0.5698403) % 1) * 2 - 1) * 200000]);
                        const lagen2 = Q2.map(([x, z]) => [B0 - (z / R) * (180 / Math.PI), L0 + (x / (R * Math.cos((B0 * Math.PI) / 180))) * (180 / Math.PI)]);
                        const p2 = await Promise.all(lagen2.map((q) => ort(samen, q[0], q[1])));
                        const p2v = await Promise.all(lagen2.map((q) => ort(samen, q[0] - 31, q[1] + 97)));
                        const hw = Q2.map(([x, z]) => r._terrainMacroSurfaceY(x, z));
                        const pear = (x, y) => { const n = x.length; const mx = x.reduce((s1, v) => s1 + v, 0) / n, my = y.reduce((s1, v) => s1 + v, 0) / n; let sxy = 0, sx = 0, sy = 0; for (let k = 0; k < n; k++) { sxy += (x[k] - mx) * (y[k] - my); sx += (x[k] - mx) ** 2; sy += (y[k] - my) ** 2; } return sx > 0 && sy > 0 ? sxy / Math.sqrt(sx * sy) : null; };
                        let gleich200 = 0, gleich200V = 0;
                        hw.forEach((h, k) => { if ((h >= wl) === p2[k].land) gleich200++; if ((h >= wl) === p2v[k].land) gleich200V++; });
                        aus.s5 = { orte: Q.length, gleich, weltLand, planetLand, gleichVerschoben, gleichFrueh, orte200: Q2.length, gleich200, gleich200V, weltLand200: hw.filter((h) => h >= wl).length, planetLand200: p2.filter((x) => x.land).length, rHoehe: r3(pear(hw, p2.map((x) => x.hoeheM))), rGegen: r3(pear(hw, p2v.map((x) => x.hoeheM))) };
                        aus.ms = r3(performance.now() - t0);
                        return aus;
                    };
                    const w = await S(seite, { saaten: 12, budgetMs: 22000 });
                    const aus = M.teil || {};
                    const s1 = w.s1;
                    // S1 AM FÄCHER (M4): Orte des Planeten polwärts 36° × heute — je Ort die Eis-Zeit, die der Findling liest (planet-ort
                    // delta.eis.zeit → gelaende-core.js:5990 ort.eis → stamm/vegetation-baum.js:1433 _rockGeologyClass: am flachen Grund ein
                    // Findling nur, wo eis = 1). Relikt = ein Ort, an dem der Findling liegt (die Welt, über den Faden). Die Ursache liest die
                    // Geschichte des Orts, WIE DAS GESETZ SIE LIEST (EINE Quelle, Entscheid 25.11.): das Jahresmittel des Orts in seiner Höhe
                    // (planet-core planetKlima tJahrC) in jeder Zeit der EIS_ZEITEN des Kerns (je Zeit um den Gang der Zone verschoben,
                    // planetKlimaGlobal T0 + T2·P2) unter der Eis-Linie KLIMA.tEisC (−10 °C, North 1975) — gerechnet hier im Kern des Kopfs,
                    // kein eigener Zeitsatz, kein auf Meereshöhe reduziertes Klima (vorher: kh + Δ des Fadens über −0,02 … −2,6 Ma, 44,1 %).
                    // Der Gegenlauf: Orte mit Eis-Geschichte ohne Findling. Das Raster (2° × 4,5°) trägt den Zeugen ≥ 1 000 Relikte.
                    const PCk = require(require("path").resolve("planet-core.js"));
                    const samenK = await H.seite("return r._planetSamen();");
                    const planK = PCk.planetPlan(samenK, PCk.PLANET_ERDE), S0k = PCk.planetScheibe(planK, 0), G0k = PCk.planetKlimaGlobal(planK, 0);
                    const gangK = PCk.EIS_ZEITEN.map((t) => { const G = PCk.planetKlimaGlobal(planK, t); return [G.T0 - G0k.T0, G.T2 - G0k.T2]; });
                    const pole = [], eisK = {};
                    for (let b = 36; b <= 88; b += 2)
                        for (let l = -180; l < 180; l += 4.5)
                            for (const bb of [b, -b]) {
                                pole.push([bb, l]);
                                const pk = {};
                                PCk.planetPunkt(S0k, (bb * Math.PI) / 180, (l * Math.PI) / 180, 16, pk);
                                if (!(pk.hoeheM > 0)) continue;
                                const K = PCk.planetKlima(S0k, (bb * Math.PI) / 180, (l * Math.PI) / 180, -1, {}, pk);
                                const y = Math.sin((bb * Math.PI) / 180), p2 = 1.5 * y * y - 0.5;
                                eisK[bb + "," + l] = Math.round(100 * Math.min(...gangK.map(([d0, d2]) => K.tJahrC + d0 + d2 * p2))) / 100;
                            }
                    const RELIKT_AN = async (r, T, a, mit) => {
                        const samen = r._planetSamen();
                        const o0 = await r._planetAuftrag({ type: "planet-ort", samen, breite: a.ort[0], laenge: a.ort[1], zeitMa: 0 });
                        if (!o0 || !o0.delta || !o0.delta.eis) return { fehlt: "der Faden trägt keine Eis-Zeit am Ort (delta.eis)" };
                        const tMin = mit.eis[a.ort[0] + "," + a.ort[1]];
                        const relikt = o0.land && o0.delta.eis.zeit >= 1 ? 1 : 0;
                        if (relikt && !Number.isFinite(tMin)) return { land: 1, relikt, fehlt: "das Gesetz trägt am Ort kein Land (planetPunkt hoeheM ≤ 0), der Faden einen Findling" };
                        const eis = Number.isFinite(tMin) && tMin < mit.tEisC ? 1 : 0;
                        return { land: o0.land ? 1 : 0, relikt, eisGeschichte: eis, tMin, ursache: relikt ? eis : null, ohneFindling: !relikt && o0.land && eis ? 1 : 0 };
                    };
                    await H.seite("await r._fadenQuelle(); return 1;");
                    const R1p = await FAECHER((c) => H.seite(c), {
                        gesetz: { fn: RELIKT_AN, export: "voxel-worker.js planetOrtAuftrag (planet-ort: delta.eis.zeit) über r._planetAuftrag · planet-core.js planetKlima tJahrC × EIS_ZEITEN (die Ursache)", leser: "stamm/vegetation-baum.js:1433 _rockGeologyClass liest gelaende-core.js:5990 ort.eis (der Findling am flachen Grund)" },
                        adressen: { orte: pole, zeiten: [{ k: "heute" }] },
                        mit: { eis: eisK, tEisC: PCk.KLIMA.tEisC },
                        ms: 30000,
                        masse: {
                            orte: { wie: "anzahl", feld: "land" },
                            land: { wie: "summe", feld: "land" },
                            relikte: { wie: "summe", feld: "relikt" },
                            ursache: { wie: "mittel", feld: "ursache", nur: (a, w) => w.relikt === 1 },
                            eisGeschichte: { wie: "summe", feld: "eisGeschichte" },
                            ohneFindling: { wie: "summe", feld: "ohneFindling" },
                        },
                        schlecht: { feld: "tMin", richtung: "max" },
                        pose: (a, w) => "der flache Grund am Ort " + a.ort.join("°/") + "° (Findling " + (w.relikt ? "ja" : "nein") + ", tMin " + Math.round(w.tMin) + " °C) — Third 3 m über dem Stein",
                        ungemessen: ["das Bild des Findlings am Ort (am Gerät)"],
                    });
                    const w1p = R1p.werte;
                    aus[1] = {
                        werte: { ursacheProzent: w1p.ursache == null ? null : Math.round(1000 * w1p.ursache) / 10, ohneFindlingOrte: w1p.ohneFindling },
                        zeuge: { relikte: w1p.relikte, zeiten: gangK.length, land: w1p.land, orte: w1p.orte, eisGeschichte: w1p.eisGeschichte, ohneFindling: w1p.ohneFindling, heimat: s1, akte: R1p.akte },
                    };
                    const s2 = w.s2;
                    aus[2] = { werte: { gipfelProzent: s2.gipfel ? Math.round((1000 * s2.konv) / s2.gipfel) / 10 : null, landProzent: s2.land ? Math.round((1000 * s2.landKonv) / s2.land) / 10 : null }, zeuge: s2 };
                    const s3 = w.s3;
                    aus[3] = { werte: { fjordeOhneEis: s3.fjordOhne }, zeuge: s3, auge: await M.auge("gegenwart-s3", { ort: "wiese" }) };
                    // S4 AM FÄCHER (M4): 4 Saaten × Orte des Planeten (10°-Gitter) × drei Fragen. „stand“: der Spiegel des Orts über die
                    // Geschichte (planet-ort delta.meer.waterLevelM an 0 … −2,6 Ma — derselbe Faden, den gelaende-core.js:5980 als
                    // meerUnterBasisM liest, aber nur an EINER Zeit) und ob der Ort Küste ist. „ria“ und „terrasse“: die Welt an der Lage des
                    // Orts (x Ost, z Süd um den Anker) — ruft die Fähigkeit, die eine Ria bzw. eine Strandterrasse trägt, und das Flusstal
                    // (_hydroRiverAt) bzw. die früheren Stände des Fadens. Trägt die Welt die Fähigkeit nicht, gibt die Adresse ihr Fehlen
                    const SPIEGEL_AN = async (r, T, a, mit) => {
                        const samen = a.saat === "heim" ? r._planetSamen() : a.saat;
                        const frage = a.zeit.k;
                        const fn = frage === "ria" ? "_riaAt" : frage === "terrasse" ? "_strandTerrasse" : null;
                        if (fn && typeof r[fn] !== "function")
                            return { fehlt: "keine Meeresspiegel-Geschichte im Relief: die Welt trägt kein " + fn + " — gelaende-core.js:5980 meerUnterBasisM liest delta.meer.waterLevelM EINER Zeit (teil.zeitMa), stamm/gelaende-boden.js:456 der Spiegel ist state.waterLevel, eine Zahl" };
                        const ort = (t) => r._planetAuftrag({ type: "planet-ort", samen, breite: a.ort[0], laenge: a.ort[1], zeitMa: t });
                        const g = await Promise.all(mit.zeiten.map(ort));
                        const o0 = g[0];
                        if (!o0 || !o0.delta || !o0.delta.meer) return { fehlt: "der Faden trägt keinen Spiegel am Ort (delta.meer)" };
                        const staende = g.map((o) => o.delta.meer.waterLevelM);
                        const kueste = o0.land && Math.abs(o0.kuesteKm) < 60 ? 1 : 0;
                        const spanneM = Math.max(...staende) - Math.min(...staende);
                        if (!fn) return { kueste, spanneM: kueste ? spanneM : null };
                        if (!kueste) return { kueste: 0 };
                        const R = 6371000, an = mit.anker;
                        const z = ((an.b - a.ort[0]) * Math.PI * R) / 180, x = ((((a.ort[1] - an.l + 540) % 360) - 180) * Math.PI * R * Math.cos((an.b * Math.PI) / 180)) / 180;
                        if (frage === "ria") {
                            const ria = r._riaAt(x, z) ? 1 : 0;
                            const tal = typeof r._hydroRiverAt === "function" && r._hydroRiverAt(x, z) ? 1 : 0;
                            return { kueste, ria, flutTal: ria ? (tal && Math.min(...staende) < staende[0] ? 1 : 0) : null };
                        }
                        const h = r._strandTerrasse(x, z);
                        if (!Number.isFinite(h)) return { kueste, terrasse: 0 };
                        return { kueste, terrasse: 1, abwM: Math.min(...staende.slice(1).map((s) => Math.abs(h - (r.state.waterLevel + s - staende[0])))) };
                    };
                    const gitter = [];
                    for (let b = -70; b <= 70; b += 10) for (let l = -180; l < 180; l += 10) gitter.push([b, l]);
                    const anker = await H.seite("const an = await r._planetAnker(); return { b: (an.breite * 180) / Math.PI, l: (an.laenge * 180) / Math.PI };");
                    const R4 = await FAECHER((c) => H.seite(c), {
                        gesetz: { fn: SPIEGEL_AN, export: "voxel-worker.js planetOrtAuftrag (planet-ort: delta.meer.waterLevelM über 0 … −2,6 Ma) über r._planetAuftrag; die Welt: r._riaAt, r._strandTerrasse", leser: "gelaende-core.js:5980 meerUnterBasisM = H.meerUnterBasisM − d.meer.waterLevelM (EINE Zeit) · stamm/gelaende-boden.js:456 state.waterLevel" },
                        adressen: { saaten: ["heim", "zsp-0", "zsp-1", "zsp-2"], orte: gitter, zeiten: [{ k: "stand" }, { k: "ria" }, { k: "terrasse" }] },
                        mit: { zeiten: [0, -0.02, -0.1, -0.5, -1, -2, -2.6], anker },
                        ms: 30000,
                        masse: {
                            kuesten: { wie: "summe", feld: "kueste", nur: (a) => a.zeit.k === "stand" },
                            spanneM: { wie: "max", feld: "spanneM", nur: (a) => a.zeit.k === "stand" },
                            spanneMittelM: { wie: "mittel", feld: "spanneM", nur: (a) => a.zeit.k === "stand" },
                            rias: { wie: "summe", feld: "ria", nur: (a) => a.zeit.k === "ria" },
                            flutTal: { wie: "mittel", feld: "flutTal", nur: (a, w) => a.zeit.k === "ria" && w.ria === 1 },
                            terrassen: { wie: "summe", feld: "terrasse", nur: (a) => a.zeit.k === "terrasse" },
                            terrasseAbwM: { wie: "max", feld: "abwM", nur: (a, w) => a.zeit.k === "terrasse" && w.terrasse === 1 },
                        },
                        schlecht: { feld: "spanneM", richtung: "max" },
                        pose: (a) => "die Küste am Ort " + a.ort.join("°/") + "° der Saat " + a.saat + " — Third 3 m über dem Spülsaum, Blick landein",
                        ungemessen: ["das Bild einer Ria und einer Strandterrasse (am Gerät)"],
                    });
                    const w4 = R4.werte;
                    aus[4] = {
                        werte: { riasProzent: w4.flutTal == null ? null : Math.round(1000 * w4.flutTal) / 10, terrasseAbwM: w4.terrasseAbwM, spiegelSpanneM: w4.spanneM },
                        zeuge: { kuesten: w4.kuesten, spanneM: w4.spanneM, spanneMittelM: w4.spanneMittelM, rias: w4.rias || 0, terrassen: w4.terrassen || 0, saaten: 4, zeiten: 7, ohneFaehigkeit: R4.fehltAn.length, heimat: w.s4, akte: R4.akte },
                    };
                    if (R4.fehlt) aus[4].nicht = R4.fehlt + " — an " + R4.fehltAn.length + " Adressen; der Spiegel schwankt an " + (w4.kuesten || 0) + " Küsten bis " + Math.round(w4.spanneM || 0) + " m";
                    const s5 = w.s5;
                    aus[5] = { werte: { gleichOrte: s5.gleich, rHoehe: s5.rHoehe, rGegen: s5.rGegen }, zeuge: s5, auge: await M.auge("gegenwart-s5", { ort: "wiese" }) };
                    aus[6] = { werte: { ohneUrsache: s1.relikte - s1.mitUrsache }, zeuge: { ...s1, orte: 1000 } };
                    return { sprossen: aus };
                },
                sprossen: {
                    1: {
                        u: {},
                        soll: [K.soll(P, 1, "Ursache in der Geschichte des Orts = 100 %", { key: "ursacheProzent", einheit: "%" })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.relikte >= 1000)) return "nur " + (z.relikte || 0) + " Relikte gezählt (Soll 1 000)";
                            if (!(z.zeiten >= 5)) return "keine Geschichte des Orts gefragt";
                            return null;
                        },
                        taeter: "stamm/vegetation-baum.js:1433 _rockGeologyClass (der Findling liest die Eis-Zeit des Planeten, ort.eis — nicht die Geschichte des Orts)",
                        leser: "stamm/vegetation-baum.js:1433 _rockGeologyClass(slope, relH): am flachen Grund ein Findling, wo gelaende-core.js:5990 ort.eis = Heimat + delta.eis.zeit des Planet-Fadens (planet-core ortEisZeit) 1 ist",
                        gruen: { werte: { ursacheProzent: 100 }, zeuge: { relikte: 1200, zeiten: 5 } },
                        attrappen: [
                            { name: "100 % ohne Relikte", roh: { werte: { ursacheProzent: 100 }, zeuge: { relikte: 0 } } },
                            { name: "Findlinge ohne Eis in der Geschichte (Mutant: ursache 62 %)", roh: { werte: { ursacheProzent: 62 }, zeuge: { relikte: 1200, zeiten: 5 } } },
                        ],
                    },
                    2: {
                        u: {},
                        soll: [K.soll(P, 2, "Gipfel > 2 km an einer jemals konvergenten Grenze ≥ 95 %", { key: "gipfelProzent", einheit: "%" })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.saaten >= 100)) return "nur " + (z.saaten || 0) + " Saaten (Soll 100)";
                            if (!(z.gipfel >= 100) || !(z.streuung > 0)) return "keine 100 Gipfel oder keine Streuung";
                            if (!(z.land >= 100)) return "der Gegenlauf (beliebiges Land, kein Gipfel) fehlt";
                            const w = roh.werte || {};
                            if (!(w.gipfelProzent > w.landProzent)) return "Gipfel liegen nicht häufiger an konvergenten Grenzen als beliebiges Land (" + w.gipfelProzent + " % ↔ " + w.landProzent + " %)";
                            return null;
                        },
                        taeter: "planet-core.js planetPunktR (Orogen an der konvergenten Grenze)",
                        gruen: { werte: { gipfelProzent: 97, landProzent: 30 }, zeuge: { saaten: 100, gipfel: 400, streuung: 1800, land: 5000 } },
                        attrappen: [{ name: "97 % an zwölf Saaten", roh: { werte: { gipfelProzent: 97 }, zeuge: { saaten: 12, gipfel: 40, streuung: 1800 } } }],
                    },
                    3: {
                        u: {},
                        soll: [K.soll(P, 3, "Fjorde außerhalb jemals vereister Küsten = 0", { key: "fjordeOhneEis" })],
                        auge: { pose: "ein Durchbruch und eine Fjord-Küste (heute: Wiese)", vorbild: "Bildpaar gegen ein Foto (Blindpaar R11)" },
                        taeter: "planet-core.js ortRoh (der Trog liest die Temperatur von heute, nie das Eis)",
                        leser: "planet-core.js:2734 — trog = glatt(16, −2, tJs) liest das Jahresmittel von heute, keine Eis-Geschichte",
                        zeuge: (roh) => ((roh.zeuge || {}).kuesten >= 50 && (roh.zeuge || {}).fjord > 0 ? null : "keine 50 Küsten oder kein Fjord gezählt (0 = 0 trägt nichts)"),
                        gruen: { werte: { fjordeOhneEis: 0 }, zeuge: { kuesten: 300, fjord: 40 } },
                        attrappen: [{ name: "0 Fjorde ohne Küsten", roh: { werte: { fjordeOhneEis: 0 }, zeuge: {} } }],
                    },
                    4: {
                        u: {},
                        soll: [K.soll(P, 4, "Rias nur an überfluteten Flusstälern ≥ 95 %", { key: "riasProzent", einheit: "%" }), K.soll(P, 4, "Strandterrassen auf Höhen früherer Stände ±10 m", { key: "terrasseAbwM", rel: "≤", zahl: 10, einheit: "m" })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.kuesten >= 50)) return "nur " + (z.kuesten || 0) + " Küsten im Fächer (Soll 50)";
                            if (!(z.zeiten >= 5) || !(z.spanneM > 0)) return "keine Geschichte des Spiegels gefragt (Spanne " + z.spanneM + " m)";
                            if (!(z.rias > 0) || !(z.terrassen > 0)) return "keine Ria und keine Strandterrasse in der Welt (" + (z.rias || 0) + " · " + (z.terrassen || 0) + ")";
                            return null;
                        },
                        taeter: "gelaende-core.js:5980 ortGesetz (meerUnterBasisM liest den Spiegel EINER Zeit — keine Meeresspiegel-Geschichte im Relief)",
                        nicht: "keine Meeresspiegel-Geschichte im Relief",
                        leser: "gelaende-core.js:5980 meerUnterBasisM = H.meerUnterBasisM − d.meer.waterLevelM an teil.zeitMa; stamm/gelaende-boden.js:456 — der Spiegel ist state.waterLevel, eine Zahl",
                        gruen: { werte: { riasProzent: 96, terrasseAbwM: 6 }, zeuge: { kuesten: 300, zeiten: 7, spanneM: 120, rias: 40, terrassen: 60 } },
                        attrappen: [
                            { name: "96 % ohne Rias", roh: { werte: { riasProzent: 96, terrasseAbwM: 6 }, zeuge: { kuesten: 300, zeiten: 7, spanneM: 120 } } },
                            { name: "Rias ohne Geschichte des Spiegels (EIN Stand)", roh: { werte: { riasProzent: 96, terrasseAbwM: 6 }, zeuge: { kuesten: 300, zeiten: 1, spanneM: 0, rias: 40, terrassen: 60 } } },
                            { name: "Mutant: Rias an trockenen Tälern (60 %)", roh: { werte: { riasProzent: 60, terrasseAbwM: 6 }, zeuge: { kuesten: 300, zeiten: 7, spanneM: 120, rias: 40, terrassen: 60 } } },
                            { name: "Mutant: Terrasse 40 m neben jedem früheren Stand", roh: { werte: { riasProzent: 96, terrasseAbwM: 40 }, zeuge: { kuesten: 300, zeiten: 7, spanneM: 120, rias: 40, terrassen: 60 } } },
                        ],
                    },
                    5: {
                        u: {},
                        soll: [K.soll(P, 5, "1 000 Orte", { key: "gleichOrte", rel: "≥", zahl: 1000 })],
                        auge: { pose: "Ankunft am Spieler, Zeitreise −1 Ma → 0 (heute: Wiese)", vorbild: "Bildpaar Zustand(x, 0) der Zeit-Funktion = Ankunftsbild (Blindpaar R11)" },
                        taeter: "gelaende-core.js hoehe (das Relief der Welt ist nicht der Planet am Ort)",
                        leser: "gelaende-core.js:2819 hoehe — das Relief der Heimat liest die Leit-Stützen des Planeten nicht (ort null, die Konstanten)",
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.orte >= 1000)) return "nur " + (z.orte || 0) + " Orte";
                            if (!(z.gleichVerschoben < z.gleich)) return "der Gegenlauf (der Planet an verschobener Lage) stimmt ebenso (" + z.gleichVerschoben + " ↔ " + z.gleich + "): das Maß trennt nicht";
                            if (z.rHoehe != null && !(z.rHoehe - (z.rGegen || 0) >= 0.2)) return "die Höhe der Welt folgt dem Planeten nicht (r " + z.rHoehe + " ↔ verschoben " + z.rGegen + ", ±200 km)";
                            return null;
                        },
                        gruen: { werte: { gleichOrte: 1000 }, zeuge: { orte: 1000, gleich: 1000, gleichVerschoben: 400 } },
                        attrappen: [
                            { name: "1 000 ohne Orte", roh: { werte: { gleichOrte: 1000 }, zeuge: {} } },
                            { name: "der verschobene Planet stimmt ebenso (Gegenlauf ohne Unterschied)", roh: { werte: { gleichOrte: 1000 }, zeuge: { orte: 1000, gleich: 1000, gleichVerschoben: 1000 } } },
                        ],
                    },
                    6: {
                        u: {},
                        soll: [K.soll(P, 6, "Merkmale ohne Ursache = 0", { key: "ohneUrsache" })],
                        zeuge: (roh) => ((roh.zeuge || {}).orte >= 1000 && (roh.zeuge || {}).punkte > 0 ? null : "keine 1 000 Zufallsorte der Welt"),
                        taeter: "stamm/vegetation-baum.js _rockGeologyClass (der Findling ohne Eis)",
                        leser: "stamm/vegetation-baum.js:1433 — _rockGeologyClass liest den Hang, keine Geschichte",
                        gruen: { werte: { ohneUrsache: 0 }, zeuge: { orte: 1000, punkte: 900 } },
                        attrappen: [{ name: "0 ohne Orte", roh: { werte: { ohneUrsache: 0 }, zeuge: {} } }],
                    },
                },
            },
        },
    };
})());

// ── DIE PERSPEKTIVE zusammenspiel.leben (3 Leitern, 21 Sprossen, belegt: leben-formt-planet S1 — g1.js PFAD_SITZUNG, stadt-im-netz S1 —
// Tafel vegetation.K4#1): das Leben als Wandler des Planeten, der Planet als Former der Arten, die Siedlung im Netz. Jede Sprosse misst
// ihre Wirkung MIT ihrem Gegenlauf (R7: die Ursache gekappt → die Wirkung verschwindet). Die Leser des Spiels:
//   · der Bestand je Region (stamm/kreatur-leben.js `_bestandRegion` → `_bestandTakt` → tetrapoda-core BESTAND_GESETZ: Geburt nach
//     Lebensraum der Boden-Klasse `_bodenKlasseAt`, Riss der Jäger, Fraß am Jungwuchs `_kreaturFrass`) — DAS LABOR der Station fährt
//     ihn über die Spiel-Uhr (in Stücken ≤ aufholS, wie der Spieler fern liest), fängt den Fraß als Zahl (die Gabe ans Feld schreibt
//     es nicht: der Lauf lässt das Leben-Feld unberührt), kappt die Ursache (die Wölfe gestrichen, die Boden-Klasse festgehalten,
//     die Jagd des Spielers als Entnahme) und stellt jede Region byte-gleich zurück;
//   · das Gelände unter Starkregen (`__wetterSetzen("stormy")`, Takte des Spiels, `_voxelSurfaceY` am Hang, `_forestStandDensity`);
//   · der Planet-Faden (`r._planetAuftrag` planet-anker / planet-ort, voxel-worker planetOrtAuftrag — derselbe Weg wie die Reise)
//     an den Saaten „same-saat-0…31“ und am Anker der Welt, über 10⁶ und 10⁸ Jahre, mit und ohne Leben (der Faden ignoriert jedes
//     Feld außer samen, breite, laenge, zeitMa — die Gegenprobe zeigt es);
//   · die Siedlung (`worldMeta.settlementCells`, `_staedte`) und die Bestäuber (`_bestaeuberListe`).
// Ein Richter ohne Zahl bekommt sein Soll aus dem Wort selbst oder einer benannten Erd-Referenz (K.soll mit refQuelle beim Namen).
L.perspektive("leben", (() => {
    const LF = "leben.kopplung.leben-formt-planet";
    const EP = "leben.kopplung.evolution-planet";
    const SN = "leben.kopplung.stadt-im-netz";
    const PFAD = [
        "stamm/kreatur-leben.js",
        "stamm/kreatur-fauna.js",
        "stamm/koerper-leib.js",
        "tetrapoda-core.js",
        "stamm/feld-leben.js",
        "stamm/vegetation-wiese.js",
        "stamm/gelaende-*.js",
        "stamm/wasser-hydro.js",
        "stamm/bild-himmel.js",
        "stamm/dirigent-takt.js",
        "stamm/siedlung-ort.js",
        "gelaende-core.js",
        "planet-core.js",
        "voxel-worker.js",
        "scripts/werkbank.cjs",
    ];
    // DAS SOLL EINES RICHTER-WORTS OHNE ZAHL: das Wort steht wörtlich im Richter und trägt keine Zahl (sonst K.soll); die Schwelle trägt
    // eine benannte Quelle (das Wort selbst — „> Umland“, „wächst“, „byte-gleich“ — oder eine Erd-Referenz)
    // „≈ 0“: das Nullband einer Korrelation (Fisher-z, 95 %) — die 0 steht im Wort, das Band trägt seine Quelle
    const sollNahe = (ID, nr, wort, o) => {
        const sp = K.sprosseVon(ID, nr);
        if (!sp.richter.includes(wort) || !/≈/.test(wort)) throw new Error("sollNahe: „" + wort + "“ steht nicht im Richter " + ID + " S" + nr);
        if (!K.zahlenIn(wort).includes(o.ref)) throw new Error("sollNahe: " + o.ref + " steht nicht im Wort");
        return { wort, key: o.key, rel: "±", a: o.toleranz, b: undefined, ref: o.ref, refQuelle: o.refQuelle, einheit: o.einheit || "" };
    };
    // DER ZEUGE DER KOPPLUNG (R7): N Antworten der Welt mit Streuung, und die Wirkung MIT der Ursache gegen OHNE sie — beide gemessen,
    // verschieden (eine Kopplung, deren Gegenlauf dasselbe zeigt, ist Rauschen oder eine Konstante)
    const zeugeR7 = (min, was) => (roh) => {
        const z = roh.zeuge || {};
        if (!(z.antworten >= min)) return "nur " + (z.antworten || 0) + " Antworten der Welt (Soll ≥ " + min + ")";
        if (!(z.streuung > 0)) return "die Antworten tragen keine Streuung (eine Konstante, nicht die Welt)";
        if (!(Number.isFinite(z.mit) && Number.isFinite(z.ohne))) return "der Gegenlauf fehlt (R7: " + was + ")";
        if (!(z.mit !== z.ohne)) return "die Wirkung bleibt im Gegenlauf (mit " + z.mit + " = ohne " + z.ohne + ": " + was + ")";
        return null;
    };
    const Z = (n, streuung, mit, ohne) => ({ antworten: n, streuung, mit, ohne });
    // DER SELBSTTEST: die Messung im Soll mit Zeuge, und drei benannte Attrappen, die den Wortlaut erfüllen, ohne die Welt zu ändern
    const selbst = (werte, z) => ({
        gruen: { werte, zeuge: z },
        attrappen: [
            { name: "die Zahl ohne Antwort der Welt (eine Konstante)", roh: { werte, zeuge: { antworten: 0, streuung: 0 } } },
            { name: "ohne Gegenlauf (R7: die Ursache nie gekappt)", roh: { werte, zeuge: { antworten: z.antworten, streuung: z.streuung } } },
            { name: "der Gegenlauf ändert nichts (mit = ohne: keine Kopplung)", roh: { werte, zeuge: Object.assign({}, z, { ohne: z.mit }) } },
        ],
    });

    return {
        leitern: {
            // ═══ LEBEN FORMT GELÄNDE, WASSER UND FELS (S2–S7; S1 trägt g1.js PFAD_SITZUNG) ═══
            [LF]: {
                sek: 40,
                faecher: true,
                mutiert: true,
                pfad: PFAD,
                ungefahren: "die Bilder der Auge-Sprossen (S2 Rutschung im Starkregen, S3 Bildpaar am Fluss, S5 Draufsicht der Küste, S6 Felswand, S7 Bildvergleich) — swiftshader schießt nicht",
                mess: async function (H, U, M) {
                    const S = (fn, a) => H.seite("return await (" + String(fn) + ")(r, T, " + JSON.stringify(a || {}) + ");");
                    const warf = (e) => "die Messung warf: " + String((e && e.message) || e).slice(0, 200);
                    const Z = (n, streuung, mit, ohne) => ({ antworten: n, streuung, mit, ohne });
                    const stand0 = M.swift ? null : await H.seite("const p = r.state.playerMesh.position; return [p.x, p.z, r.state.weather];").catch(() => null);
                    const spaeter = [];
                    const A = async (name, p, o) => {
                        const a = { bild: null, pose: JSON.stringify(p), grund: "noch nicht geschossen" };
                        spaeter.push({ a, name, p, o });
                        return a;
                    };
                    const schiess = async (frist, heim) => {
                        for (const s of spaeter) {
                            const b = M.uhr() < frist ? await M.auge(s.name, s.p, s.o) : { bild: null, pose: JSON.stringify(s.p), grund: "der Deckel der Leiter: kein Schuss nach " + frist + " s" };
                            delete s.a.grund;
                            Object.assign(s.a, b);
                        }
                        if (stand0 && spaeter.length && M.uhr() < heim) {
                            await H.ruf("/umstellen", { x: stand0[0], z: stand0[1] }).catch(() => null);
                            await H.seite("window.__wetterSetzen(" + JSON.stringify(stand0[2]) + "); return 1;").catch(() => null);
                        }
                    };
                    const pose = (p) => (p ? { px: p[0], py: p[1], pz: p[2], lx: p[3], ly: p[4], lz: p[5] } : { ort: "wiese" });
                    const mittel = (l) => (l.length ? l.reduce((q, v) => q + v, 0) / l.length : NaN);
                    const sdv = (l) => { const m = mittel(l); return l.length > 1 ? Math.sqrt(l.reduce((q, v) => q + (v - m) * (v - m), 0) / (l.length - 1)) : 0; };
                    // DIE HANG-ORTE (Seite): je Ring um den Spieler die Punkte der Boden-Klasse „hang“, bewaldet (Bestandsdichte ≥ waldSd des
                    // Lebensraum-Gesetzes) und offen (< randSd) — die Adressen des Fächers S2
                    const hangOrte = async (r, T, a) => {
                        const LG = r.constructor._lebensraumGesetz();
                        const pm = r.state.playerMesh.position;
                        const wald = [];
                        const offen = [];
                        for (let d = 20; d <= a.radius && (wald.length < a.n || offen.length < a.n); d += 20)
                            for (let k = 0; k < 24; k++) {
                                const x = pm.x + d * Math.cos((k * Math.PI) / 12);
                                const z = pm.z + d * Math.sin((k * Math.PI) / 12);
                                if (r._bodenKlasseAt(x, z) !== "hang") continue;
                                const sd = r._forestStandDensity(x, z);
                                if (sd >= LG.L.waldSd) { if (wald.length < a.n) wald.push([x, z, sd, "wald"]); }
                                else if (sd < LG.L.randSd && offen.length < a.n) offen.push([x, z, sd, "offen"]);
                            }
                        // im Wechsel: reißt die Frist den Fächer, fehlt keiner der beiden Arme ganz
                        const reihe = [];
                        for (let i = 0; i < Math.max(wald.length, offen.length); i++) reihe.push(...[wald[i], offen[i]].filter(Boolean));
                        return reihe;
                    };
                    // DAS GESETZ AN EINER ADRESSE (S2): die Höhe, die das Spiel am Hang liest (`_voxelSurfaceY`), vor und nach Takten des
                    // Spiels im Starkregen (`__wetterSetzen("stormy")`, der EINE Kanal des Wetters; das Wort kehrt im finally zurück); die
                    // Rutschung fragt die Fähigkeit der Welt, die abgegangenes Material trägt — fehlt sie, nennt die Adresse ihr Fehlen
                    const ABTRAG_AN = async (r, T, a, mit) => {
                        const s = r.state;
                        if (a.zeit.k === "rutschung") {
                            const fn = ["_rutschung", "_hangRutschung", "_erosionAt"].find((n) => typeof r[n] === "function");
                            if (!fn) return { fehlt: "kein Abtrag, keine Rutschung: stamm/gelaende-boden.js:316 „keine Erosions-Simulation“ — die Höhe (gelaende-core.js hoehe) trägt keinen Regen- und keinen Wurzel-Term (_forestStandDensity), kein _rutschung" };
                            return { rutschungM3: +r[fn](a.ort[0], a.ort[1]) || 0, wald: a.ort[3] === "wald" ? 1 : 0 };
                        }
                        const h0 = r._voxelSurfaceY(a.ort[0], a.ort[1]);
                        const w0 = s.weather;
                        const uhr0 = s.spielZeit;
                        let t = performance.now();
                        try {
                            window.__wetterSetzen("stormy");
                            for (let i = 0; i < mit.takte; i++) r._gameLoopTick((t += 1000 / 60));
                        } finally {
                            window.__wetterSetzen(w0);
                        }
                        const h1 = r._voxelSurfaceY(a.ort[0], a.ort[1]);
                        return { dh: Math.abs(h1 - h0), h0, wald: a.ort[3] === "wald" ? 1 : 0, sd: a.ort[2], spielS: s.spielZeit - uhr0, zurueck: s.weather === w0 ? 1 : 0 };
                    };
                    const fluss = async (r, T, a) => {
                        const s = r.state;
                        const LG = r.constructor._lebensraumGesetz();
                        const pm = s.playerMesh.position;
                        const nah = new Set(r._bestandNah());
                        let fl = null;
                        const reg = [s.hydrosphere].concat(s.hydroTiles ? [...s.hydroTiles.values()] : []).filter((h) => h && h.ready);
                        for (const h of reg)
                            for (const rv of h.rivers || [])
                                for (const p of rv.points || []) {
                                    if (p.inLake || nah.has(r._bestandKey(p.x, p.z))) continue;
                                    const d = Math.hypot(p.x - pm.x, p.z - pm.z);
                                    if (!fl || d < fl.d) fl = { d, x: p.x, z: p.z, w: p.width };
                                }
                        if (!fl) return { fehler: "kein Fluss in den Hydro-Regionen um den Spieler" };
                        const nass = () => {
                            let n = 0;
                            for (let i = -a.fenster; i <= a.fenster; i += 2) for (let j = -a.fenster; j <= a.fenster; j += 2) if (r._nassAt(fl.x + i, fl.z + j)) n++;
                            return n;
                        };
                        const jahr = ((K) => (K.jahrK * K.tagS) / K.normS)(r._kalender());
                        const vor = nass();
                        const uhr = s.spielZeit;
                        let nach;
                        try {
                            s.spielZeit = uhr + a.jahre * jahr;
                            nach = nass();
                        } finally {
                            s.spielZeit = uhr;
                        }
                        const y = r._voxelSurfaceY(fl.x, fl.z);
                        const gattungen = Object.keys(LG.L.gattung);
                        return { fl, key: r._bestandKey(fl.x, fl.z), vor, nach, jahr, gattungen, biber: gattungen.filter((g) => /biber|beaver|castor/i.test(g)).length, pose: [fl.x + 20, y + 40, fl.z + 20, fl.x, y, fl.z] };
                    };
                    const bestand = async (r, T, a) => {
                        const s = r.state;
                        const C = r.constructor;
                        const LG = C._lebensraumGesetz();
                        const F = r._bestandRegionen();
                        const SE = r._bestandSeite();
                        const nah = new Set(r._bestandNah());
                        const [hx, hz] = r._bestandHier().split(",").map(Number);
                        const kand = [];
                        for (let d = a.ring[0]; d <= a.ring[1]; d++)
                            for (let i = -d; i <= d; i++)
                                for (let j = -d; j <= d; j++) {
                                    const k = hx + i + "," + (hz + j);
                                    if (Math.max(Math.abs(i), Math.abs(j)) === d && !nah.has(k)) kand.push(k);
                                }
                        const tWart = performance.now();
                        const bereit = async (k) => {
                            for (let i = 0; i < 40 && !r._bestandBereit(k) && performance.now() - tWart < (a.wartMs || 6000); i++) await new Promise((ok) => setTimeout(ok, 100));
                            return r._bestandBereit(k);
                        };
                        const keys = [];
                        for (const k of a.keys || kand) {
                            if (keys.length >= a.n) break;
                            if ((nah.has(k) && !a.nahErlaubt) || !(await bereit(k))) continue;
                            const kl = r._bestandFeld(k).zellen.map((c) => c.klasse);
                            if (a.wahl && !a.wahl.every((w) => kl.includes(w))) continue;
                            keys.push(k);
                        }
                        const eigen = (m) => (Object.prototype.hasOwnProperty.call(r, m) ? r[m] : null);
                        const fnv = (t) => { let h = 2166136261; for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h.toString(16); };
                        const r3 = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
                        const lauf = (key, L) => {
                            const neu = !F.regionen[key];
                            const R = r._bestandRegion(key, false);
                            const orig = R.tiere.slice();
                            const felder = orig.map((t) => Object.assign({}, t));
                            const vor = { t: R.t, seq: R.seq, gen: r._lebenGen, kl: r._bestandKlassen, jetzt: s.spielZeit };
                            const alt = { _depositLife: eigen("_depositLife"), _depositEmotion: eigen("_depositEmotion"), _bodenKlasseAt: eigen("_bodenKlasseAt") };
                            const ids0 = new Set(orig.map((t) => t.id));
                            const z = { verbiss: 0, gabe: 0, risse: 0, entnommen: 0, reihe: [], ufer: null, uferN: 0 };
                            const geb = new Map();
                            const uferZ = r._bestandFeld(key).zellen.filter((c) => c.klasse === "fluss");
                            const uferH = () => uferZ.map((c) => r._voxelSurfaceY(c.x, c.z));
                            const u0 = a.ufer ? uferH() : null;
                            const zaehl = () => { const n = {}; for (const t of R.tiere) n[t.g] = (n[t.g] || 0) + 1; return n; };
                            const weg = (g, n) => {
                                let k = 0;
                                for (let i = R.tiere.length - 1; i >= 0 && k < n; i--) if (R.tiere[i].g === g && !R.tiere[i].leib && !R.tiere[i].gehege) (R.tiere.splice(i, 1), k++);
                                return k;
                            };
                            const t0 = performance.now();
                            let start = 0;
                            r._depositLife = function (x, y, m) { if (m < 0) z.verbiss -= m; else z.gabe += m; };
                            r._depositEmotion = function () { z.risse++; };
                            if (L.klasse) {
                                r._bestandKlassen = null;
                                r._bodenKlasseAt = function () { return L.klasse; };
                            }
                            try {
                                if (L.ohne) for (const g of L.ohne) weg(g, Infinity);
                                start = R.tiere.length;
                                const schritte = Math.max(1, Math.round(L.dauer / L.schritt));
                                for (let k = 1; k <= schritte; k++) {
                                    const tk = (k * L.dauer) / schritte;
                                    s.spielZeit = vor.jetzt + tk;
                                    r._bestandRegion(key, true, 0, Infinity, []);
                                    if (L.ohne) for (const g of L.ohne) weg(g, Infinity);
                                    for (const t of R.tiere) if (!ids0.has(t.id) && !geb.has(t.id)) geb.set(t.id, { g: t.g, x: t.x, z: t.z, bs: t.bs, soul: t.soul });
                                    if (L.jagd && tk <= L.jagd.bis + 1e-6 && Math.round(tk) % L.jagd.je === 0) {
                                        const n = R.tiere.filter((t) => t.g === L.jagd.g).length;
                                        z.entnommen += weg(L.jagd.g, L.jagd.n != null ? L.jagd.n : Math.round(L.jagd.anteil * n));
                                    }
                                    z.reihe.push(zaehl());
                                }
                                if (u0) {
                                    const u1 = uferH();
                                    z.ufer = u0.length ? u0.reduce((q, h, i) => q + Math.abs(u1[i] - h), 0) / u0.length : null;
                                    z.uferN = u0.length;
                                }
                                z.hash = fnv(JSON.stringify([z.reihe, R.tiere.map((t) => [t.id, t.g, r3(t.bs), r3(t.x), r3(t.z)])]));
                            } finally {
                                s.spielZeit = vor.jetzt;
                                for (const m of Object.keys(alt)) { if (alt[m]) r[m] = alt[m]; else delete r[m]; }
                                z.n = zaehl();
                                R.t = vor.t;
                                R.seq = vor.seq;
                                R.tiere.length = 0;
                                R.tiere.push(...orig);
                                orig.forEach((t, i) => { for (const k of Object.keys(t)) if (!(k in felder[i])) delete t[k]; Object.assign(t, felder[i]); });
                                r._bestandKlassen = vor.kl;
                                r._lebenGen = vor.gen;
                                if (neu) delete F.regionen[key];
                            }
                            z.tode = start + geb.size - Object.values(z.n).reduce((q, v) => q + v, 0) - z.entnommen;
                            z.geboren = geb.size;
                            if (a.geburten)
                                z.geborene = [...geb.values()].map((t) => {
                                    const kl = r._bodenKlasseAt(t.x, t.z);
                                    return [t.g, r3(t.x), r3(t.z), r3(t.bs), t.soul, kl, LG.lebensraum(t.g, kl, LG.L) > 0 ? 1 : 0, r3(r._temperaturAt(r._terrainMacroSurfaceY(t.x, t.z, false)))];
                                });
                            z.ms = r3(performance.now() - t0);
                            z.verbiss = r3(z.verbiss);
                            z.gabe = r3(z.gabe);
                            return z;
                        };
                        const je = [];
                        for (const key of keys) {
                            const [ix, iz] = key.split(",").map(Number);
                            const cx = (ix + 0.5) * SE;
                            const cz = (iz + 0.5) * SE;
                            const laeufe = {};
                            for (const L of a.laeufe) laeufe[L.name] = lauf(key, L);
                            je.push({ key, cx: r3(cx), cz: r3(cz), hy: r3(r._terrainMacroSurfaceY(cx, cz, false)), klassen: r._bestandFeld(key).zellen.map((c) => c.klasse), laeufe });
                        }
                        return { keys, kand: kand.length, seite: SE, jahr: ((K) => (K.jahrK * K.tagS) / K.normS)(r._kalender()), regionenNachher: Object.keys(F.regionen).length, je };
                    };
                    const planet = async (r, T, a) => {
                        await r._fadenQuelle();
                        const samen0 = r._planetSamen();
                        const grad = (x) => Math.round((x * 18000) / Math.PI) / 100;
                        const ort = (samen, b, l, z, extra) => r._planetAuftrag(Object.assign({ type: "planet-ort", samen, breite: b, laenge: l, zeitMa: z }, extra || {}));
                        const ohneId = (o) => JSON.stringify(Object.assign({}, o, { requestId: 0 }));
                        const blaetter = (o, p, aus) => {
                            for (const k of Object.keys(o || {})) {
                                if (o[k] && typeof o[k] === "object") blaetter(o[k], p + k + ".", aus);
                                else aus.push(p + k);
                            }
                            return aus;
                        };
                        const an = await r._planetAuftrag({ type: "planet-anker", samen: samen0 });
                        const B = grad(an.breite);
                        const L = grad(an.laenge);
                        const saaten = Array.from({ length: a.saaten }, (_, i) => "same-saat-" + i);
                        const anker = await Promise.all(saaten.map((x) => r._planetAuftrag({ type: "planet-anker", samen: x })));
                        const mit = await Promise.all(saaten.map((x, i) => ort(x, grad(anker[i].breite), grad(anker[i].laenge), 0)));
                        const ohne = await Promise.all(saaten.map((x, i) => ort(x, grad(anker[i].breite), grad(anker[i].laenge), 0, { leben: false })));
                        let verschieden = 0;
                        for (let i = 0; i < saaten.length; i++) if (ohneId(mit[i]) !== ohneId(ohne[i])) verschieden++;
                        const hs = mit.map((o) => o.hoeheM);
                        const reise = await Promise.all(a.reise.map((z) => ort(samen0, B, L, z)));
                        const lagen = [[B, L], [B + 5, L], [B - 5, L], [B, L + 5], [B, L - 5]];
                        const tief = [];
                        for (const [b, l] of lagen) tief.push(await Promise.all(a.tief.map((z) => ort(samen0, b, l, z))));
                        const tiefOhne = await Promise.all(lagen.map(([b, l]) => ort(samen0, b, l, a.tief[a.tief.length - 1], { leben: false })));
                        const terme = blaetter(mit[0].delta, "", []);
                        return {
                            samen0,
                            B,
                            L,
                            kuesteKm: an.kuesteKm,
                            version: mit[0].version,
                            saaten: saaten.length,
                            antwortenMit: mit.length,
                            verschieden,
                            hSpanne: Math.max(...hs) - Math.min(...hs),
                            terme,
                            lebenTerme: terme.filter((k) => /kalk|karbonat|kohle|torf|riff|koralle|mangrove|leben|bio|asche|pionier|vulkan|biber/i.test(k)),
                            meerTerme: Object.keys(mit[0].delta.meer || {}),
                            reise: reise.map((o) => [o.zeitMa, o.land ? 1 : 0, Math.round(o.hoeheM), o.delta.wuchs.decke, o.delta.wuchs.wald]),
                            tief: tief.map((rh) => rh.map((o) => [o.zeitMa, Math.round(o.hoeheM), o.delta.wildnis.hartAnteil, o.delta.wildnis.schichtDicke, o.land ? 1 : 0])),
                            tiefOhneGleich: tiefOhne.filter((o, i) => ohneId(o) === ohneId(tief[i][tief[i].length - 1])).length,
                        };
                    };
                    const aus = M.teil || {};
                    // S2 AM FÄCHER (M4) — der Hang unter Starkregen: Hang-Orte bewaldet und offen (der Gegenlauf: die Wurzeln fehlen) × der
                    // Sturm, dazu je Ort die Frage nach der Rutschung
                    try {
                        const orte2 = await S(hangOrte, U[2]);
                        const R2l = await FAECHER((c) => H.seite(c), {
                            gesetz: { fn: ABTRAG_AN, export: "r._voxelSurfaceY nach r._gameLoopTick im Wetter „stormy“ (window.__wetterSetzen) · r._rutschung", leser: "stamm/gelaende-boden.js:316 (die Hydrosphäre füllt das Gelände — „keine Erosions-Simulation“) · gelaende-core.js hoehe" },
                            adressen: { orte: orte2, zeiten: [{ k: "sturm" }, { k: "rutschung" }] },
                            mit: { takte: U[2].takte },
                            ms: 12000,
                            masse: {
                                erosionGerodetM: { wie: "mittel", feld: "dh", nur: (a) => a.zeit.k === "sturm" && a.ort[3] === "offen" },
                                erosionBewaldetM: { wie: "mittel", feld: "dh", nur: (a) => a.zeit.k === "sturm" && a.ort[3] === "wald" },
                                nWald: { wie: "anzahl", feld: "dh", nur: (a) => a.zeit.k === "sturm" && a.ort[3] === "wald" },
                                nOffen: { wie: "anzahl", feld: "dh", nur: (a) => a.zeit.k === "sturm" && a.ort[3] === "offen" },
                                sdSpanne: { wie: (v) => (v.length ? Math.max(...v) - Math.min(...v) : 0), feld: "sd", nur: (a) => a.zeit.k === "sturm" },
                                zurueck: { wie: "anteil", feld: "zurueck", nur: (a) => a.zeit.k === "sturm" },
                                rutschungM3: { wie: "summe", feld: "rutschungM3", nur: (a) => a.zeit.k === "rutschung" && a.ort[3] === "offen" },
                            },
                            schlecht: { feld: "dh", richtung: "max" },
                            pose: (a) => [a.ort[0] + 30, null, a.ort[1] + 30, a.ort[0], null, a.ort[1]],
                            ungemessen: ["die Rutschung im Bild (am Gerät)"],
                        });
                        const w2l = R2l.werte;
                        const ew = w2l.erosionBewaldetM;
                        const eo = w2l.erosionGerodetM;
                        const werte = { erosionGerodetM: eo, erosionBewaldetM: ew, hangPunkte: (w2l.nWald || 0) + (w2l.nOffen || 0), takte: U[2].takte };
                        if (ew > 0 && Number.isFinite(eo)) werte.erosionVerhaeltnis = eo / ew;
                        if (!R2l.fehlt) werte.rutschungM3 = w2l.rutschungM3;
                        const p0 = orte2.find((o) => o[3] === "offen") || orte2[0];
                        const y0 = p0 ? await H.seite("return r._voxelSurfaceY(" + p0[0] + ", " + p0[1] + ");").catch(() => 0) : 0;
                        const roh = { werte, zeuge: Object.assign(Z(werte.hangPunkte, w2l.sdSpanne, eo, ew), { akte: R2l.akte, wetterZurueck: w2l.zurueck }), auge: await A("leben-hang-s2", pose(p0 ? [p0[0] + 30, y0 + 25, p0[1] + 30, p0[0], y0, p0[1]] : null), { wetter: "stormy" }) };
                        if (!(w2l.nWald >= 3 && w2l.nOffen >= 3)) roh.nicht = "nur " + (w2l.nWald || 0) + " bewaldete und " + (w2l.nOffen || 0) + " offene Hang-Punkte im Umkreis " + U[2].radius + " m";
                        else if (!(eo > 0)) roh.nicht = "kein Abtrag unter Starkregen: Δh 0 m an " + werte.hangPunkte + " Hang-Orten nach je " + U[2].takte + " Takten Sturm (bewaldet " + ew + " m, offen " + eo + " m)" + (R2l.fehlt ? " — " + R2l.fehlt : "");
                        aus[2] = roh;
                    } catch (e) {
                        aus[2] = { werte: {}, zeuge: {}, nicht: warf(e) };
                    }
                    // S3 — der Fluss über 10 Spieljahre: der Bestand der Fluss-Region im Zeitraffer, die Wasserfläche vor ↔ nach, der Biber im Buch
                    try {
                        const f = await S(fluss, U[3]);
                        if (f.fehler) throw new Error(f.fehler);
                        const b = await S(bestand, { keys: [f.key], n: 1, ring: [0, 0], nahErlaubt: false, laeufe: [{ name: "zehn", dauer: U[3].jahre * f.jahr, schritt: 600 }] });
                        const L = b.je[0] && b.je[0].laeufe.zehn;
                        const werte = { wasserVor: f.vor, wasserNach: f.nach, biberGattungen: f.biber, gattungen: f.gattungen.length };
                        if (L) werte.sprungJahre = (U[3].jahre * f.jahr) / f.jahr;
                        if (L) werte.geboren = L.geboren;
                        aus[3] = {
                            werte,
                            zeuge: Z(L ? L.reihe.length : 0, L ? L.geboren : 0, f.nach - f.vor, 0),
                            auge: await A("leben-fluss-s3", pose(f.pose)),
                            nicht: "kein Biber im Buch der Gattungen (" + f.gattungen.join(", ") + ") — 10 Spieljahre am Fluss (" + (L ? L.geboren : "?") + " Geburten in der Region " + f.key + "): Wasserfläche " + f.vor + " → " + f.nach + " Felder, kein Stau, kein Totholz",
                        };
                    } catch (e) {
                        aus[3] = { werte: {}, zeuge: {}, nicht: warf(e) };
                    }
                    // S4 — die Wölfe: Regionen mit Wald und Fluss, 2 Spielstunden mit ↔ ohne Wölfe; Verbiss (der Fraß am Jungwuchs) und das Ufer
                    try {
                        const b = await S(bestand, { ring: [2, 4], n: U[4].regionen, wahl: ["wald", "fluss"], ufer: true, laeufe: [{ name: "mit", dauer: U[4].dauer, schritt: 600 }, { name: "ohne", dauer: U[4].dauer, schritt: 600, ohne: ["wolf"] }] });
                        const vm = b.je.map((x) => x.laeufe.mit.verbiss);
                        const vo = b.je.map((x) => x.laeufe.ohne.verbiss);
                        const um = b.je.map((x) => x.laeufe.mit.ufer);
                        const uo = b.je.map((x) => x.laeufe.ohne.ufer);
                        const wolf = b.je.map((x) => mittel(x.laeufe.mit.reihe.map((q) => q.wolf || 0)));
                        const d = uo.map((v, i) => v - um[i]).filter(Number.isFinite);
                        const dv = vo.map((v, i) => v - vm[i]);
                        const ci = (l) => { const m = mittel(l); const h = l.length > 1 ? (1.96 * sdv(l)) / Math.sqrt(l.length) : NaN; return [m - h, m + h]; };
                        const [lo, hi] = ci(d);
                        const [vlo, vhi] = ci(dv);
                        const werte = {
                            regionen: b.je.length,
                            verbissMit: vm.reduce((q, v) => q + v, 0),
                            verbissOhne: vo.reduce((q, v) => q + v, 0),
                            woelfeMittel: mittel(wolf),
                            uferErosionMitM: mittel(um.filter(Number.isFinite)),
                            uferErosionOhneM: mittel(uo.filter(Number.isFinite)),
                            nullImIntervall: d.length >= 2 && (lo > 0 || hi < 0) ? 0 : 1,
                            verbissNullImIntervall: dv.length >= 2 && (vlo > 0 || vhi < 0) ? 0 : 1,
                        };
                        const roh = { werte, zeuge: Z(b.je.reduce((q, x) => q + x.laeufe.mit.reihe.length + x.laeufe.ohne.reihe.length, 0), sdv(vm.concat(vo)), werte.verbissMit, werte.verbissOhne) };
                        if (!b.je.length) roh.nicht = "keine Region mit Wald und Fluss im Ring 2–4 um den Spieler";
                        else if (!(d.some((v) => v !== 0))) roh.nicht = "keine Ufer-Erosion: mit und ohne Wölfe Δh 0 m an " + b.je.reduce((q, x) => q + (x.laeufe.mit.uferN || 0), 0) + " Ufer-Zellen nach " + U[4].dauer / 3600 + " Spielstunden (Verbiss mit " + werte.verbissMit.toFixed(2) + " ↔ ohne " + werte.verbissOhne.toFixed(2) + ") — der Verbiss erreicht das Ufer nie: die Höhe am Fluss liest weder Jungwuchs noch Wurzel";
                        aus[4] = roh;
                    } catch (e) {
                        aus[4] = { werte: {}, zeuge: {}, nicht: warf(e) };
                    }
                    // S5–S7 — der Planet-Faden: Küste, Kruste über 10⁸ Jahre, 32 Saaten mit ↔ ohne Leben, die Zeitreise über 10⁶ Jahre
                    let P = null;
                    let pw = null;
                    try {
                        P = await S(planet, U[7]);
                    } catch (e) {
                        pw = warf(e);
                    }
                    if (!P) for (const nr of [5, 6, 7]) aus[nr] = { werte: {}, zeuge: {}, nicht: pw };
                    else {
                        const riff = P.lebenTerme.filter((k) => /riff|koralle|mangrove|kalk|karbonat/i.test(k));
                        aus[5] = {
                            werte: { riffTerme: riff.length, kuesteKm: P.kuesteKm, antworten: P.antwortenMit },
                            zeuge: Z(P.antwortenMit, P.hSpanne, riff.length, 0),
                            auge: await A("leben-kueste-s5", { ort: "wiese" }),
                            nicht: "keine Riffe und Mangroven: der Planet-Faden trägt " + P.terme.length + " Terme (" + P.terme.join(", ") + "), das Meer nur " + P.meerTerme.join(", ") + " — kein Leben baut Land; die Küste liegt " + Math.round(P.kuesteKm) + " km vom Anker",
                        };
                        const kalkTerme = P.lebenTerme.filter((k) => /kalk|karbonat|kohle|torf/i.test(k));
                        const ha = P.tief.flat().map((x) => x[2]);
                        aus[6] = {
                            werte: { kalkTerme: kalkTerme.length, antworten: P.tief.flat().length, hartAnteilSpanne: Math.max(...ha) - Math.min(...ha), ohneLebenGleich: P.tiefOhneGleich },
                            zeuge: Z(P.tief.flat().length, P.hSpanne, kalkTerme.length, 0),
                            auge: await A("leben-fels-s6", { ort: "wiese" }),
                            nicht: "kein Kalk und keine Kohle: " + P.tief.flat().length + " Antworten des Planet-Fadens an 5 Lagen über " + Math.abs(U[7].tief[U[7].tief.length - 1]) + " Ma — kein Term des Meereslebens, " + P.tiefOhneGleich + "/5 mit ↔ ohne Leben byte-gleich",
                        };
                        const glied = { vulkan: /vulkan|lava/i, asche: /asche/i, pionier: /pionier/i, wald: /wuchs\.wald/i, torf: /torf/i, kohle: /kohle/i };
                        const wechselt = (i) => new Set(P.reise.map((x) => x[i])).size > 1;
                        let belegt = 0;
                        for (const g of Object.keys(glied)) if (g === "wald" ? wechselt(4) : P.lebenTerme.some((k) => glied[g].test(k))) belegt++;
                        const spanne = Math.max(...P.reise.map((x) => Math.abs(x[0])));
                        aus[7] = {
                            werte: { unterscheidbarProzent: (100 * P.verschieden) / P.saaten, saaten: P.saaten, zeitreiseJahre: spanne * 1e6, kettengliederProzent: (100 * belegt) / 6 },
                            zeuge: Z(P.antwortenMit + P.reise.length, P.hSpanne, P.verschieden, 0),
                            auge: await A("leben-planet-s7", { ort: "wiese" }),
                            nicht: "kein Planet ohne Leben: an " + P.saaten + " Saaten sind mit ↔ ohne Leben " + P.verschieden + " Antworten verschieden (der Faden liest nur samen, breite, laenge, zeitMa); die Zeitreise über " + spanne + " Ma am Anker belegt " + belegt + " von 6 Kettengliedern (Wald " + P.reise.map((x) => x[4]).join("/") + ")",
                        };
                    }
                    await schiess(24, 34);
                    return { sprossen: aus };
                },
                sprossen: {
                    2: {
                        u: { radius: 400, n: 12, takte: 20 },
                        // ZAHL (auge-klasse.cjs): die Zahl urteilt, das Bild ist Beleg — die sichtbare Hälfte des Satzes ist ein eigenes Soll (ungemessen: ROT)
                        soll: [K.soll(LF, 2, "Erosion gerodet ≥ 5× bewaldet", { key: "erosionVerhaeltnis", einheit: "×" }), K.soll(LF, 2, "Rutschung sichtbar", { key: "rutschungM3", rel: ">", zahl: 0, refQuelle: "der Richter: „Rutschung sichtbar“ — am gerodeten Hang ist Material abgegangen (abgerutschtes Volumen > 0 m³)", einheit: "m³" })],
                        auge: { pose: "der offene Hang im Starkregen (stormy), 30 m seitlich und 25 m über dem Hangpunkt", vorbild: "Rutschung sichtbar am gerodeten, nicht am bewaldeten Hang (Prüfer-Satz R11, 2AFC gerodet ↔ bewaldet)" },
                        zeuge: zeugeR7(6, "Erosion gerodet gegen bewaldet"),
                        taeter: "gelaende-core.js hoehe (die Höhe ohne Regen- und Wurzel-Term)",
                        nicht: "kein Abtrag unter Starkregen, keine Rutschung",
                        leser: "stamm/gelaende-boden.js:316 — „keine Erosions-Simulation“: kein Leser trägt Abtrag nach Regen × (1 − Wurzelhalt `_forestStandDensity`) ins Gelände",
                        ...selbst({ erosionVerhaeltnis: 6.2, erosionGerodetM: 0.31, erosionBewaldetM: 0.05, rutschungM3: 40 }, Z(17, 0.6, 0.31, 0.05)),
                    },
                    3: {
                        u: { fenster: 30, jahre: 10 },
                        soll: [K.soll(LF, 3, "Bildpaar 0/10 Jahre", { key: "sprungJahre", zahl: 10, einheit: "a" })],
                        auge: { pose: "über dem nächsten Fluss außerhalb der nahen Regionen, 40 m hoch, Blick hinab (Jahr 0 und Jahr 10)", vorbild: "Referenz-Luftbild eines Biberstaus: Wasserfläche und Totholz (Bildpaar 0/10 Jahre)" },
                        zeuge: zeugeR7(10, "Wasserfläche mit Biber gegen ohne"),
                        taeter: "tetrapoda-core.js LEBENSRAUM_GESETZ (kein Biber im Buch der Gattungen)",
                        nicht: "kein Biber, kein Stau",
                        leser: "tetrapoda-core.js:2077 — das Buch der Gattungen trägt deer, fox, wolf, bear: kein Biber, und kein Leser des Wassers (gelaende-core stauFelder) liest ein Tier",
                        ...selbst({ sprungJahre: 10, wasserVor: 120, wasserNach: 190 }, Z(40, 12, 70, 0)),
                    },
                    4: {
                        u: { regionen: 3, dauer: 7200 },
                        soll: [K.soll(LF, 4, "Intervall ohne 0", { key: "nullImIntervall", zahl: 0 })],
                        zeuge: zeugeR7(24, "Verbiss mit Wölfen gegen ohne"),
                        taeter: "stamm/kreatur-leben.js _kreaturFrass (der Verbiss erreicht das Ufer nie)",
                        nicht: "keine Ufer-Erosion",
                        leser: "stamm/kreatur-leben.js:2191 — `_kreaturFrass` schreibt den Verbiss ins Leben-Feld; kein Leser des Ufers (gelaende-core hoehe, `_hydroDistAt`) liest Jungwuchs oder Wurzel",
                        ...selbst({ nullImIntervall: 0, verbissMit: 210, verbissOhne: 260, uferErosionMitM: 0.02, uferErosionOhneM: 0.11 }, Z(72, 14, 210, 260)),
                    },
                    5: {
                        u: {},
                        soll: [
                            K.soll(LF, 5, "Riffdicke gegen Akkretionsraten", { key: "akkretionMmJeA", rel: "band", zahl: 1, bis: 10, einheit: "mm/a", refQuelle: "Erde: Riff-Akkretion im Holozän 1–10 mm/a (Montaggioni 2005, Earth-Science Reviews 71)" }),
                            K.soll(LF, 5, "Rifftyp in Draufsicht ≥ 75 % richtig", { key: "rifftypProzent", einheit: "%" }),
                        ],
                        auge: { pose: "Draufsicht einer Küste (heute keine Küste im Umkreis — geschossen an der Wiese)", vorbild: "Luftbilder Saum-, Barriere- und Atoll-Riff (Darwin 1842), Prüfer-Satz R11 ≥ 75 % richtig" },
                        taeter: "planet-core.js planetOrt (kein Term des Riffs)",
                        nicht: "keine Riffe, keine Mangroven",
                        leser: "voxel-worker.js:1446 — planetOrtAuftrag trägt das Meer nur als waterLevelM: kein Riff, keine Akkretion des Lebens",
                        ...selbst({ akkretionMmJeA: 4, rifftypProzent: 80 }, Z(32, 2400, 3, 0)),
                    },
                    6: {
                        u: {},
                        soll: [K.soll(LF, 6, "Kalkanteil der Kruste wächst mit dem Meeresleben", { key: "kalkSteigung", rel: ">", zahl: 0, refQuelle: "das Wort selbst: „wächst mit“ — die Steigung des Kalkanteils der Kruste gegen das Meeresleben über 10⁸ Jahre > 0" }), K.soll(LF, 6, "Kohleflöze in der Felswand sichtbar", { key: "kohlefloeze", rel: ">", zahl: 0, refQuelle: "der Richter: „Kohleflöze in der Felswand sichtbar“ — die Felswand trägt Kohle-Schichten (Anzahl > 0)", einheit: "Flöze" })],
                        // ZAHL (auge-klasse.cjs): die Zahl urteilt, das Bild ist Beleg — die sichtbare Hälfte des Satzes ist ein eigenes Soll (ungemessen: ROT)
                        zeuge: zeugeR7(10, "Kalk der Kruste mit Meeresleben gegen ohne"),
                        auge: { pose: "eine Felswand (heute keine Schicht im Fels — geschossen an der Wiese)", vorbild: "Kohleflöze in der Felswand sichtbar (Prüfer-Satz R11)" },
                        taeter: "planet-core.js planetPlan (kein Kalk, keine Kohle)",
                        nicht: "kein Kalk, keine Kohle",
                        leser: "planet-core.js:312 — planetPlan(samen, koerperIn) trägt im Körper g, wasserKm, krustenAnteil … — kein Meeresleben, die Kruste kein Kalk",
                        ...selbst({ kalkSteigung: 0.4, kohlefloeze: 3 }, Z(30, 900, 2, 0)),
                    },
                    7: {
                        u: { saaten: 32, reise: [0, -0.2, -0.4, -0.6, -0.8, -1], tief: [0, -20, -40, -60, -80, -100] },
                        soll: [
                            K.soll(LF, 7, "32 Saaten mit und ohne Leben im Bildvergleich unterscheidbar ≥ 90 %", { key: "unterscheidbarProzent", einheit: "%" }),
                            K.soll(LF, 7, "32 Saaten", { key: "saaten", rel: "≥", zahl: 32 }),
                            K.soll(LF, 7, "Zeitreise an einem Ort über 10⁶ Jahre", { key: "zeitreiseJahre", rel: "≥", zahl: 1e6, einheit: "a" }),
                            K.soll(LF, 7, "jedes Kettenglied im Bild belegt", { key: "kettengliederProzent", rel: "≥", zahl: 100, einheit: "%", refQuelle: "das Wort selbst: „jedes Kettenglied“ — 6 von 6 Gliedern des Umfangs (Vulkan, Asche, Pionierflora, Wald, Torf, Kohle)" }),
                        ],
                        auge: { pose: "der Anker der Welt (Orbit nicht erzeugbar — geschossen an der Wiese), je Saat mit und ohne Leben", vorbild: "Bildvergleich 32 Saaten mit ↔ ohne Leben ≥ 90 % unterscheidbar (Prüfer-Satz R11); Zeitreise: jedes Glied im Bild" },
                        taeter: "voxel-worker.js planetOrtAuftrag (kein Leben-Term im Planeten)",
                        nicht: "kein Planet ohne Leben, keine Kette Vulkan → Kohle",
                        leser: "voxel-worker.js:1446 — planetOrtAuftrag liest nur samen, breite, laenge, zeitMa: kein Schalter des Lebens, kein Glied Asche, Torf, Kohle",
                        unklar: "„über 10⁶ Jahre“ ist ein Maß des Umfangs, die Station hält es als Soll zeitreiseJahre ≥ 10⁶ — Vorschlag: der Richter nennt „Zeitreise ≥ 10⁶ Jahre“ als eigene Bedingung.",
                        ...selbst({ unterscheidbarProzent: 94, saaten: 32, zeitreiseJahre: 1e6, kettengliederProzent: 100 }, Z(38, 2400, 32, 0)),
                    },
                },
            },

            // ═══ EVOLUTION LIEST DEN PLANETEN (S1–S6) ═══
            [EP]: {
                sek: 20,
                faecher: true,
                mutiert: true,
                pfad: PFAD,
                ungefahren: "die Bilder der Auge-Sprossen (S1 die Würfe im Bild gezählt, S2 Bildvergleich Nord ↔ Süd) — swiftshader schießt nicht",
                mess: async function (H, U, M) {
                    const S = (fn, a) => H.seite("return await (" + String(fn) + ")(r, T, " + JSON.stringify(a || {}) + ");");
                    const warf = (e) => "die Messung warf: " + String((e && e.message) || e).slice(0, 200);
                    const Z = (n, streuung, mit, ohne) => ({ antworten: n, streuung, mit, ohne });
                    const stand0 = M.swift ? null : await H.seite("const p = r.state.playerMesh.position; return [p.x, p.z, r.state.weather];").catch(() => null);
                    const spaeter = [];
                    const A = async (name, p, o) => {
                        const a = { bild: null, pose: JSON.stringify(p), grund: "noch nicht geschossen" };
                        spaeter.push({ a, name, p, o });
                        return a;
                    };
                    const schiess = async (frist, heim) => {
                        for (const s of spaeter) {
                            const b = M.uhr() < frist ? await M.auge(s.name, s.p, s.o) : { bild: null, pose: JSON.stringify(s.p), grund: "der Deckel der Leiter: kein Schuss nach " + frist + " s" };
                            delete s.a.grund;
                            Object.assign(s.a, b);
                        }
                        if (stand0 && spaeter.length && M.uhr() < heim) {
                            await H.ruf("/umstellen", { x: stand0[0], z: stand0[1] }).catch(() => null);
                            await H.seite("window.__wetterSetzen(" + JSON.stringify(stand0[2]) + "); return 1;").catch(() => null);
                        }
                    };
                    const mittel = (l) => (l.length ? l.reduce((q, v) => q + v, 0) / l.length : NaN);
                    const pearson = (x, y) => {
                        const mx = mittel(x);
                        const my = mittel(y);
                        let a = 0;
                        let b = 0;
                        let c = 0;
                        for (let i = 0; i < x.length; i++) {
                            a += (x[i] - mx) * (y[i] - my);
                            b += (x[i] - mx) * (x[i] - mx);
                            c += (y[i] - my) * (y[i] - my);
                        }
                        return b > 0 && c > 0 ? a / Math.sqrt(b * c) : NaN;
                    };
                    const bestand = async (r, T, a) => {
                        const s = r.state;
                        const C = r.constructor;
                        const LG = C._lebensraumGesetz();
                        const F = r._bestandRegionen();
                        const SE = r._bestandSeite();
                        const nah = new Set(r._bestandNah());
                        const [hx, hz] = r._bestandHier().split(",").map(Number);
                        const kand = [];
                        for (let d = a.ring[0]; d <= a.ring[1]; d++)
                            for (let i = -d; i <= d; i++)
                                for (let j = -d; j <= d; j++) {
                                    const k = hx + i + "," + (hz + j);
                                    if (Math.max(Math.abs(i), Math.abs(j)) === d && !nah.has(k)) kand.push(k);
                                }
                        const tWart = performance.now();
                        const bereit = async (k) => {
                            for (let i = 0; i < 40 && !r._bestandBereit(k) && performance.now() - tWart < (a.wartMs || 6000); i++) await new Promise((ok) => setTimeout(ok, 100));
                            return r._bestandBereit(k);
                        };
                        const keys = [];
                        for (const k of a.keys || kand) {
                            if (keys.length >= a.n) break;
                            if ((nah.has(k) && !a.nahErlaubt) || !(await bereit(k))) continue;
                            const kl = r._bestandFeld(k).zellen.map((c) => c.klasse);
                            if (a.wahl && !a.wahl.every((w) => kl.includes(w))) continue;
                            keys.push(k);
                        }
                        const eigen = (m) => (Object.prototype.hasOwnProperty.call(r, m) ? r[m] : null);
                        const fnv = (t) => { let h = 2166136261; for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h.toString(16); };
                        const r3 = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
                        const lauf = (key, L) => {
                            const neu = !F.regionen[key];
                            const R = r._bestandRegion(key, false);
                            const orig = R.tiere.slice();
                            const felder = orig.map((t) => Object.assign({}, t));
                            const vor = { t: R.t, seq: R.seq, gen: r._lebenGen, kl: r._bestandKlassen, jetzt: s.spielZeit };
                            const alt = { _depositLife: eigen("_depositLife"), _depositEmotion: eigen("_depositEmotion"), _bodenKlasseAt: eigen("_bodenKlasseAt") };
                            const ids0 = new Set(orig.map((t) => t.id));
                            const z = { verbiss: 0, gabe: 0, risse: 0, entnommen: 0, reihe: [], ufer: null, uferN: 0 };
                            const geb = new Map();
                            const zaehl = () => { const n = {}; for (const t of R.tiere) n[t.g] = (n[t.g] || 0) + 1; return n; };
                            const weg = (g, n) => {
                                let k = 0;
                                for (let i = R.tiere.length - 1; i >= 0 && k < n; i--) if (R.tiere[i].g === g && !R.tiere[i].leib && !R.tiere[i].gehege) (R.tiere.splice(i, 1), k++);
                                return k;
                            };
                            const t0 = performance.now();
                            let start = 0;
                            r._depositLife = function (x, y, m) { if (m < 0) z.verbiss -= m; else z.gabe += m; };
                            r._depositEmotion = function () { z.risse++; };
                            if (L.klasse) {
                                r._bestandKlassen = null;
                                r._bodenKlasseAt = function () { return L.klasse; };
                            }
                            try {
                                if (L.ohne) for (const g of L.ohne) weg(g, Infinity);
                                start = R.tiere.length;
                                const schritte = Math.max(1, Math.round(L.dauer / L.schritt));
                                for (let k = 1; k <= schritte; k++) {
                                    const tk = (k * L.dauer) / schritte;
                                    s.spielZeit = vor.jetzt + tk;
                                    r._bestandRegion(key, true, 0, Infinity, []);
                                    if (L.ohne) for (const g of L.ohne) weg(g, Infinity);
                                    for (const t of R.tiere) if (!ids0.has(t.id) && !geb.has(t.id)) geb.set(t.id, { g: t.g, x: t.x, z: t.z, bs: t.bs, soul: t.soul });
                                    z.reihe.push(zaehl());
                                }
                                z.hash = fnv(JSON.stringify([z.reihe, R.tiere.map((t) => [t.id, t.g, r3(t.bs), r3(t.x), r3(t.z)])]));
                            } finally {
                                s.spielZeit = vor.jetzt;
                                for (const m of Object.keys(alt)) { if (alt[m]) r[m] = alt[m]; else delete r[m]; }
                                z.n = zaehl();
                                R.t = vor.t;
                                R.seq = vor.seq;
                                R.tiere.length = 0;
                                R.tiere.push(...orig);
                                orig.forEach((t, i) => { for (const k of Object.keys(t)) if (!(k in felder[i])) delete t[k]; Object.assign(t, felder[i]); });
                                r._bestandKlassen = vor.kl;
                                r._lebenGen = vor.gen;
                                if (neu) delete F.regionen[key];
                            }
                            z.tode = start + geb.size - Object.values(z.n).reduce((q, v) => q + v, 0);
                            z.geboren = geb.size;
                            z.geborene = [...geb.values()].map((t) => {
                                const kl = r._bodenKlasseAt(t.x, t.z);
                                return [t.g, r3(t.x), r3(t.z), r3(t.bs), t.soul, kl, LG.lebensraum(t.g, kl, LG.L) > 0 ? 1 : 0, r3(r._temperaturAt(r._terrainMacroSurfaceY(t.x, t.z, false)))];
                            });
                            z.ms = r3(performance.now() - t0);
                            return z;
                        };
                        const je = [];
                        for (const key of keys) {
                            const [ix, iz] = key.split(",").map(Number);
                            const cx = (ix + 0.5) * SE;
                            const cz = (iz + 0.5) * SE;
                            const laeufe = {};
                            for (const L of a.laeufe) laeufe[L.name] = lauf(key, L);
                            je.push({ key, cx: r3(cx), cz: r3(cz), hy: r3(r._terrainMacroSurfaceY(cx, cz, false)), klassen: r._bestandFeld(key).zellen.map((c) => c.klasse), laeufe });
                        }
                        return { keys, kand: kand.length, seite: SE, regionenNachher: Object.keys(F.regionen).length, je };
                    };
                    const planeten = async (r, T, a) => {
                        await r._fadenQuelle();
                        const saaten = Array.from({ length: a.n }, (_, i) => "same-saat-" + i);
                        const an = await Promise.all(saaten.map((x) => r._planetAuftrag({ type: "planet-anker", samen: x })));
                        const LG = r.constructor._lebensraumGesetz();
                        return { antworten: an.filter((x) => Number.isFinite(x.breite)).length, breiten: an.map((x) => Math.round((x.breite * 18000) / Math.PI) / 100), gattungen: Object.keys(LG.L.gattung) };
                    };
                    const aus = M.teil || {};
                    let B = null;
                    let bw = null;
                    try {
                        B = await S(bestand, { ring: [2, 3], n: U[1].regionen, laeufe: [{ name: "frei", dauer: U[1].dauer, schritt: 600 }, { name: "frei2", dauer: U[1].dauer, schritt: 600 }, { name: "fest", dauer: U[1].dauer, schritt: 600, klasse: U[1].festKlasse }] });
                        if (!B.je.length) throw new Error("keine bereite Region im Ring 2–3 um den Spieler (" + B.kand + " Kandidaten)");
                    } catch (e) {
                        bw = warf(e);
                    }
                    if (!B || bw) for (const nr of [1, 2, 3, 4, 5]) aus[nr] = { werte: {}, zeuge: {}, nicht: bw };
                    else {
                        const frei = B.je.flatMap((x) => x.laeufe.frei.geborene);
                        const fest = B.je.flatMap((x) => x.laeufe.fest.geborene);
                        const anteil = (l) => (l.length ? l.reduce((q, x) => q + x[6], 0) / l.length : NaN);
                        const klassen = new Set(B.je.flatMap((x) => x.klassen));
                        const r0 = B.je[0];
                        const pose = { px: r0.cx + 60, py: r0.hy + 80, pz: r0.cz + 60, lx: r0.cx, ly: r0.hy, lz: r0.cz };
                        // S1 AM FÄCHER (M4) — der Wurf in der Boden-Klasse der Gattung: jede Geburt des Bestands (die Regionen über die Spiel-Uhr,
                        // frei und mit festgehaltener Boden-Klasse = die Ursache gekappt) ist eine Adresse; das Prädikat ruft an ihr das Gesetz,
                        // das der Wurf liest (stamm/kreatur-leben.js:1900 lebt = LG.lebensraum(Gattung, _bodenKlasseAt(x, z), LG.L) > 0)
                        const WURF_AN = async (r, T, a) => {
                            const LG = r.constructor._lebensraumGesetz && r.constructor._lebensraumGesetz();
                            if (!LG || typeof LG.lebensraum !== "function") return { fehlt: "kein Lebensraum-Gesetz (AnazhRealm._lebensraumGesetz)" };
                            const kl = r._bodenKlasseAt(a.ort[0], a.ort[1]);
                            return { imRaum: LG.lebensraum(a.saat, kl, LG.L) > 0 ? 1 : 0, kl };
                        };
                        const wuerfe = (l, lauf) => l.map((x) => ({ saat: x[0], ort: [x[1], x[2]], zeit: { lauf } }));
                        const R1e = await FAECHER((c) => H.seite(c), {
                            gesetz: { fn: WURF_AN, export: "stamm/kreatur-leben.js:1708 AnazhRealm._lebensraumGesetz().lebensraum · :1707 _bodenKlasseAt", leser: "stamm/kreatur-leben.js:1900 lebt (der Ort des Wurfs)" },
                            adressen: { dazu: [...wuerfe(frei, "frei"), ...wuerfe(fest, "fest")] },
                            ms: 8000,
                            masse: {
                                anteilImRaum: { wie: "mittel", feld: "imRaum", nur: (a) => a.zeit.lauf === "frei" },
                                anteilFest: { wie: "mittel", feld: "imRaum", nur: (a) => a.zeit.lauf === "fest" },
                                wuerfe: { wie: "anzahl", feld: "imRaum", nur: (a) => a.zeit.lauf === "frei" },
                                wuerfeFest: { wie: "anzahl", feld: "imRaum", nur: (a) => a.zeit.lauf === "fest" },
                                klassen: { wie: "verschieden", feld: "kl", nur: (a) => a.zeit.lauf === "frei" },
                                gattungen: { wie: "verschieden", feld: "a.saat" },
                            },
                            schlecht: { feld: "imRaum", richtung: "min" },
                            pose: (a) => "der Wurf " + a.saat + " am Ort " + a.ort.map(Math.round).join("/") + " — 60 m schräg darüber",
                            ungemessen: ["die Würfe im Bild gezählt (am Gerät)"],
                        });
                        const w1e = R1e.werte;
                        aus[1] = {
                            werte: { anteilImRaum: w1e.anteilImRaum, anteilFest: w1e.anteilFest, wuerfe: w1e.wuerfe, wuerfeFest: w1e.wuerfeFest, regionen: B.je.length, gattungen: w1e.gattungen },
                            zeuge: Object.assign(Z(w1e.wuerfe, Math.max(klassen.size, w1e.klassen || 0) - 1, w1e.anteilImRaum, w1e.anteilFest), { akte: R1e.akte }),
                            auge: await A("leben-evo-s1", pose),
                        };
                        if (R1e.fehlt) aus[1].nicht = R1e.fehlt;
                        // S2 — Merkmal aus Klima und Boden: Größe ↔ Temperatur der Geburt; das Fell: Varianten je Gattung
                        const bs = frei.map((x) => x[3]);
                        const tp = frei.map((x) => x[7]);
                        const rGK = pearson(bs, tp);
                        const rFest = pearson(fest.map((x) => x[3]), fest.map((x) => x[7]));
                        const seelen = {};
                        for (const x of frei) (seelen[x[0]] = seelen[x[0]] || new Set()).add(x[4]);
                        const fellVarianten = Math.max(0, ...Object.values(seelen).map((q) => q.size));
                        const w2 = { korrGroesseKlima: rGK, fellVarianten, wuerfe: frei.length };
                        if (fest.length > 3 && Number.isFinite(rFest)) w2.ohneSelektionZ = Math.abs(Math.atanh(Math.max(-0.999999, Math.min(0.999999, rFest)))) * Math.sqrt(fest.length - 3);
                        aus[2] = {
                            werte: w2,
                            zeuge: Z(frei.length, Math.max(...bs) - Math.min(...bs), rGK, rFest),
                            auge: await A("leben-evo-s2", pose),
                            nicht: "kein Erbgang: das Tier des Bestands trägt nur die Größe (`_creatureBodySize` aus dem Strom der Region, ohne Eltern), das Fell ist eines je Seele (" + fellVarianten + " Variante(n) je Gattung) — Korrelation Größe ↔ Klima " + (Number.isFinite(rGK) ? rGK.toFixed(3) : "—") + " an " + frei.length + " Würfen",
                        };
                        // S3 — Vikarianz: die Gattungen je Region (ein Buch) gegen das Trennungsalter
                        const sets = B.je.map((x) => new Set(Object.keys(x.laeufe.frei.n)));
                        let dmax = 0;
                        for (let i = 0; i < sets.length; i++) for (let j = i + 1; j < sets.length; j++) dmax = Math.max(dmax, [...sets[i]].filter((g) => !sets[j].has(g)).length + [...sets[j]].filter((g) => !sets[i].has(g)).length);
                        aus[3] = {
                            werte: { regionen: B.je.length, baumDistanzMax: dmax, gattungenGesamt: new Set(B.je.flatMap((x) => Object.keys(x.laeufe.frei.n))).size },
                            zeuge: Z(B.je.length, dmax, NaN, NaN),
                            nicht: "kein Stammbaum je Kontinent: jede Region wirft aus EINEM Buch der Gattungen (" + B.je.length + " Regionen, Unterschied ≤ " + dmax + " Gattungen aus der Boden-Klasse, nie aus einer Trennung) — die Platten des Planeten liest es nie",
                        };
                        // S4 — Katastrophe: ohne Ereignis der Bestand je Spielstunde; ein Ereignis liest der Bestand nicht
                        let wellen = 0;
                        let tode = 0;
                        const sum = B.je[0].laeufe.frei.reihe.map((_, i) => B.je.reduce((q, x) => q + Object.values(x.laeufe.frei.reihe[i] || {}).reduce((u, v) => u + v, 0), 0));
                        for (let i = 1; i < sum.length; i++) if (sum[i - 1] > 0 && sum[i] <= 0.5 * sum[i - 1]) wellen++;
                        for (const x of B.je) tode += x.laeufe.frei.tode;
                        aus[4] = {
                            werte: { wellenOhneEreignis: wellen, todeOhneEreignis: tode, regionen: B.je.length },
                            zeuge: Z(B.je.reduce((q, x) => q + x.laeufe.frei.reihe.length, 0), tode, NaN, wellen),
                            nicht: "kein Ereignis im Bestand: die Bilanz (tetrapoda bestandBilanz) liest Nahrung und Riss, nie Vulkan oder Einschlag — ohne Ereignis " + wellen + " Wellen, " + tode + " Tode in " + U[1].dauer / 3600 + " Spielstunden an " + B.je.length + " Regionen; ein Überlebenden-Profil gibt es nicht",
                        };
                        // S5 — Eingriff: Wiederholung byte-gleich (frei ↔ frei2); einen Eingriff des Spielers in Gebirge oder Meerenge gibt es nicht
                        const gleich = B.je.every((x) => x.laeufe.frei.hash === x.laeufe.frei2.hash) ? 1 : 0;
                        aus[5] = {
                            werte: { wiederholungGleich: gleich, regionen: B.je.length },
                            zeuge: Z(B.je.length * 2, new Set(B.je.map((x) => x.laeufe.frei.hash)).size - 1, NaN, NaN),
                            nicht: "kein Eingriff des Spielers in Gebirge oder Meerenge (kein Verb hebt ein Gebirge, kein Leser des Bestands liest den Planeten) — die Wiederholung desselben Laufs ist " + (gleich ? "byte-gleich" : "VERSCHIEDEN") + " an " + B.je.length + " Regionen",
                        };
                    }
                    // S6 — 10 Planeten: der Faden antwortet je Saat; eine Ahnenlinie trägt keine
                    try {
                        const P = await S(planeten, { n: U[6].planeten });
                        aus[6] = {
                            werte: { planeten: P.antworten },
                            zeuge: Z(P.antworten, Math.max(...P.breiten) - Math.min(...P.breiten), NaN, NaN),
                            nicht: "keine Ahnenlinie: an " + P.antworten + " Planeten dasselbe Buch der Gattungen (" + P.gattungen.join(", ") + "), kein Baum, kein Ereignis der Geologie im Leben",
                        };
                    } catch (e) {
                        aus[6] = { werte: {}, zeuge: {}, nicht: warf(e) };
                    }
                    await schiess(10, 15);
                    return { sprossen: aus };
                },
                sprossen: {
                    1: {
                        u: { regionen: 4, dauer: 3600, festKlasse: "wiese" },
                        soll: [K.soll(EP, 1, "≥ 0,9 der Würfe in der Boden-Klasse der Gattung", { key: "anteilImRaum" })],
                        auge: { pose: "60 m schräg über der Mitte der ersten gemessenen Region, die Würfe im Bild", vorbild: "die Würfe im Bild gezählt: ≥ 0,9 in der Boden-Klasse ihrer Gattung (Klassen-Maske der Tiere gegen die Boden-Klasse)" },
                        zeuge: zeugeR7(20, "die Boden-Klasse festgehalten"),
                        taeter: "stamm/kreatur-leben.js _pickFaunaSoulAtPlayer (die Gattung aus der Boden-Klasse)",
                        leser: "stamm/kreatur-leben.js:1900 lebt(x, z) = LG.lebensraum(Gattung, _bodenKlasseAt(x, z), LG.L) > 0 — der Ort des Wurfs",
                        ...selbst({ anteilImRaum: 1, anteilFest: 0.12 }, Z(40, 4, 1, 0.12)),
                    },
                    2: {
                        u: {},
                        soll: [
                            K.soll(EP, 2, "Korrelation Fell ↔ Boden ≥ 0,5", { key: "korrFellBoden" }),
                            sollNahe(EP, 2, "ohne Selektion ≈ 0", { key: "ohneSelektionZ", ref: 0, toleranz: 1.96, refQuelle: "Nullband einer Korrelation: |atanh r| · √(n − 3) ≤ 1,96 (Fisher 1921, 95 %)" }),
                        ],
                        auge: { pose: "die Würfe der nördlichsten und der südlichsten Region nebeneinander", vorbild: "Bildvergleich Nord ↔ Süd: Fell folgt dem Boden, Größe dem Klima (Bergmann 1847)" },
                        zeuge: zeugeR7(20, "Merkmal mit Selektion gegen ohne"),
                        taeter: "stamm/kreatur-leben.js _creatureNaturalBirth (die Größe aus dem Strom, kein Erbgang)",
                        nicht: "kein Erbgang, kein Fell je Tier",
                        leser: "stamm/kreatur-leben.js:1993 — der Wurf würfelt die Größe `_creatureBodySize` aus dem Strom der Region, ohne Eltern; tetrapoda-core.js:4451 fellFarbe liest das Muster der Art, nie den Boden",
                        unklar: "„ohne Selektion ≈ 0“ trägt kein Band — die Station setzt das 95-%-Nullband nach Fisher (|atanh r|·√(n−3) ≤ 1,96).",
                        ...selbst({ korrFellBoden: 0.62, ohneSelektionZ: 0.8 }, Z(40, 0.4, 0.62, 0.05)),
                    },
                    3: {
                        u: {},
                        soll: [K.soll(EP, 3, "Baum-Distanz wächst mit dem Trennungsalter der Kontinente", { key: "baumSteigung", rel: ">", zahl: 0, refQuelle: "das Wort selbst: „wächst mit“ — die Steigung der Baum-Distanz gegen das Trennungsalter der Kontinente > 0" })],
                        zeuge: zeugeR7(4, "Baum-Distanz getrennt gegen verbunden"),
                        taeter: "tetrapoda-core.js LEBENSRAUM_GESETZ (EIN Buch der Gattungen für jeden Ort)",
                        nicht: "kein Stammbaum je Kontinent",
                        leser: "tetrapoda-core.js:2077 — das Buch der Gattungen ist EINES für jede Region; kein Leser verbindet die Platten (planet-core lageScholle) mit einer Art",
                        ...selbst({ baumSteigung: 0.8 }, Z(12, 3, 0.8, 0)),
                    },
                    4: {
                        u: {},
                        soll: [
                            K.soll(EP, 4, "ohne Ereignis keine Welle", { key: "wellenOhneEreignis", rel: "=", zahl: 0, refQuelle: "das Wort selbst: „keine Welle“ — 0 Einbrüche des Gesamtbestands der gemessenen Regionen auf ≤ die Hälfte binnen 600 Spiel-s ohne Ereignis (die Welle ist ein Ereignis der Landschaft, nie das Rauschen von sechs Tieren einer Region)" }),
                            K.soll(EP, 4, "Überlebenden-Profil gegen das Muster der Kreide-Paläogen-Grenze", { key: "profilKPgRang", rel: "≥", zahl: 0.7, refQuelle: "K-Pg: Überlebende klein, grabend, Generalisten (Longrich et al. 2016); Rang-Übereinstimmung ≥ 0,7 wie die Ursachen-Probe R10" }),
                        ],
                        zeuge: zeugeR7(12, "Einbruch mit Ereignis gegen ohne"),
                        taeter: "tetrapoda-core.js bestandBilanz (liest kein Ereignis)",
                        nicht: "keine Katastrophe im Bestand",
                        leser: "stamm/kreatur-leben.js:2480 `_bestandTakt` liest Nahrung, Riss und Alter; kein Leser trägt Vulkan-Provinz oder Einschlag in die Bilanz",
                        unklar: "„gegen das Muster der Kreide-Paläogen-Grenze“ trägt keine Zahl — die Station misst die Rang-Übereinstimmung des Überlebens (Masse, Grabend, Kost) mit der Schwelle 0,7 der Ursachen-Probe R10.",
                        ...selbst({ wellenOhneEreignis: 0, profilKPgRang: 0.78 }, Z(24, 9, 6, 0)),
                    },
                    5: {
                        u: {},
                        soll: [
                            K.soll(EP, 5, "Baum-Distanz über der Schwelle", { key: "baumDistanzUeber", rel: ">", zahl: 0, refQuelle: "das Wort selbst: „über der Schwelle“ — Baum-Distanz des Paars mit ↔ ohne Eingriff minus die Distanz der Wiederholung (0 bei byte-gleich) > 0" }),
                            K.soll(EP, 5, "Wiederholung byte-gleich", { key: "wiederholungGleich", rel: "=", zahl: 1, refQuelle: "das Wort selbst: „byte-gleich“ — 1 = der Hash zweier Läufe desselben Eingriffs gleich" }),
                        ],
                        zeuge: zeugeR7(8, "Arten mit Eingriff gegen ohne"),
                        taeter: "stamm/kreatur-leben.js _bestandTakt (kein Eingriff des Planeten erreicht den Bestand)",
                        nicht: "kein Eingriff in Gebirge oder Meerenge",
                        leser: "planet-core.js:312 — planetPlan nimmt nur den Samen und den Körper: kein Verb des Spielers hebt ein Gebirge oder öffnet eine Meerenge, und der Bestand liest den Planeten nie",
                        ...selbst({ baumDistanzUeber: 2, wiederholungGleich: 1 }, Z(8, 2, 2, 0)),
                    },
                    6: {
                        u: { planeten: 10 },
                        soll: [
                            K.soll(EP, 6, "Zufallsort auf 10 Planeten", { key: "planeten", rel: "≥", zahl: 10 }),
                            K.soll(EP, 6, "Ahnenlinie und Ereignis 100 % konsistent", { key: "konsistentProzent", rel: "≥", zahl: 100, einheit: "%" }),
                        ],
                        zeuge: zeugeR7(10, "Ahnenlinie mit Geschichte gegen ohne"),
                        taeter: "tetrapoda-core.js LEBENSRAUM_GESETZ (keine Ahnenlinie)",
                        nicht: "keine Ahnenlinie",
                        leser: "tetrapoda-core.js:2077 — die Gattungen sind gesetzt, nicht geworden: kein Baum, kein Ereignis, kein Ort der Herkunft",
                        ...selbst({ planeten: 10, konsistentProzent: 100 }, Z(10, 40, 10, 0)),
                    },
                },
            },

            // ═══ MENSCH, STADT UND MEER IM NETZ DES LEBENS (S2–S8; S1 trägt die Tafel vegetation.K4#1) ═══
            [SN]: {
                faecher: true,
                sek: 30,
                dorf: true,
                mutiert: true,
                pfad: PFAD,
                ungefahren: "die Bilder der Auge-Sprossen (S2 Bildpaar übernutzt ↔ daneben, S5 Mündung, S7 Panel der Epochen, S8 Umland mit ↔ ohne Stadt) — swiftshader schießt nicht",
                mess: async function (H, U, M) {
                    const S = (fn, a) => H.seite("return await (" + String(fn) + ")(r, T, " + JSON.stringify(a || {}) + ");");
                    const warf = (e) => "die Messung warf: " + String((e && e.message) || e).slice(0, 200);
                    const Z = (n, streuung, mit, ohne) => ({ antworten: n, streuung, mit, ohne });
                    const stand0 = M.swift ? null : await H.seite("const p = r.state.playerMesh.position; return [p.x, p.z, r.state.weather];").catch(() => null);
                    const spaeter = [];
                    const A = async (name, p, o) => {
                        const a = { bild: null, pose: JSON.stringify(p), grund: "noch nicht geschossen" };
                        spaeter.push({ a, name, p, o });
                        return a;
                    };
                    const schiess = async (frist, heim) => {
                        for (const s of spaeter) {
                            const b = M.uhr() < frist ? await M.auge(s.name, s.p, s.o) : { bild: null, pose: JSON.stringify(s.p), grund: "der Deckel der Leiter: kein Schuss nach " + frist + " s" };
                            delete s.a.grund;
                            Object.assign(s.a, b);
                        }
                        if (stand0 && spaeter.length && M.uhr() < heim) {
                            await H.ruf("/umstellen", { x: stand0[0], z: stand0[1] }).catch(() => null);
                            await H.seite("window.__wetterSetzen(" + JSON.stringify(stand0[2]) + "); return 1;").catch(() => null);
                        }
                    };
                    const mittel = (l) => (l.length ? l.reduce((q, v) => q + v, 0) / l.length : NaN);
                    const bestand = async (r, T, a) => {
                        const s = r.state;
                        const C = r.constructor;
                        const F = r._bestandRegionen();
                        const SE = r._bestandSeite();
                        const nah = new Set(r._bestandNah());
                        const [hx, hz] = r._bestandHier().split(",").map(Number);
                        const kand = [];
                        for (let d = a.ring[0]; d <= a.ring[1]; d++)
                            for (let i = -d; i <= d; i++)
                                for (let j = -d; j <= d; j++) {
                                    const k = hx + i + "," + (hz + j);
                                    if (Math.max(Math.abs(i), Math.abs(j)) === d && !nah.has(k)) kand.push(k);
                                }
                        const tWart = performance.now();
                        const bereit = async (k) => {
                            for (let i = 0; i < 40 && !r._bestandBereit(k) && performance.now() - tWart < (a.wartMs || 6000); i++) await new Promise((ok) => setTimeout(ok, 100));
                            return r._bestandBereit(k);
                        };
                        const keys = [];
                        for (const k of a.keys || kand) {
                            if (keys.length >= a.n) break;
                            if ((nah.has(k) && !a.nahErlaubt) || !(await bereit(k))) continue;
                            const kl = r._bestandFeld(k).zellen.map((c) => c.klasse);
                            if (a.wahl && !a.wahl.every((w) => kl.includes(w))) continue;
                            keys.push(k);
                        }
                        const eigen = (m) => (Object.prototype.hasOwnProperty.call(r, m) ? r[m] : null);
                        const r3 = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
                        const lauf = (key, L) => {
                            const neu = !F.regionen[key];
                            const R = r._bestandRegion(key, false);
                            const orig = R.tiere.slice();
                            const felder = orig.map((t) => Object.assign({}, t));
                            const vor = { t: R.t, seq: R.seq, gen: r._lebenGen, kl: r._bestandKlassen, jetzt: s.spielZeit };
                            const alt = { _depositLife: eigen("_depositLife"), _depositEmotion: eigen("_depositEmotion") };
                            const z = { verbiss: 0, gabe: 0, risse: 0, entnommen: 0, reihe: [] };
                            const zaehl = () => { const n = {}; for (const t of R.tiere) n[t.g] = (n[t.g] || 0) + 1; return n; };
                            const weg = (g, n) => {
                                let k = 0;
                                for (let i = R.tiere.length - 1; i >= 0 && k < n; i--) if (R.tiere[i].g === g && !R.tiere[i].leib && !R.tiere[i].gehege) (R.tiere.splice(i, 1), k++);
                                return k;
                            };
                            const t0 = performance.now();
                            r._depositLife = function (x, y, m) { if (m < 0) z.verbiss -= m; else z.gabe += m; };
                            r._depositEmotion = function () { z.risse++; };
                            try {
                                const schritte = Math.max(1, Math.round(L.dauer / L.schritt));
                                for (let k = 1; k <= schritte; k++) {
                                    const tk = (k * L.dauer) / schritte;
                                    s.spielZeit = vor.jetzt + tk;
                                    r._bestandRegion(key, true, 0, Infinity, []);
                                    if (L.jagd && tk <= L.jagd.bis + 1e-6 && Math.round(tk) % L.jagd.je === 0) {
                                        const n = R.tiere.filter((t) => t.g === L.jagd.g).length;
                                        z.entnommen += weg(L.jagd.g, L.jagd.n != null ? L.jagd.n : Math.round(L.jagd.anteil * n));
                                    }
                                    z.reihe.push(zaehl());
                                }
                            } finally {
                                s.spielZeit = vor.jetzt;
                                for (const m of Object.keys(alt)) { if (alt[m]) r[m] = alt[m]; else delete r[m]; }
                                z.n = zaehl();
                                R.t = vor.t;
                                R.seq = vor.seq;
                                R.tiere.length = 0;
                                R.tiere.push(...orig);
                                orig.forEach((t, i) => { for (const k of Object.keys(t)) if (!(k in felder[i])) delete t[k]; Object.assign(t, felder[i]); });
                                r._bestandKlassen = vor.kl;
                                r._lebenGen = vor.gen;
                                if (neu) delete F.regionen[key];
                            }
                            z.ms = r3(performance.now() - t0);
                            z.verbiss = r3(z.verbiss);
                            return z;
                        };
                        const je = [];
                        for (const key of keys) {
                            const laeufe = {};
                            for (const L of a.laeufe) laeufe[L.name] = lauf(key, L);
                            je.push({ key, nah: nah.has(key), klassen: r._bestandFeld(key).zellen.map((c) => c.klasse), laeufe });
                        }
                        return { keys, kand: kand.length, seite: SE, jahr: ((K) => (K.jahrK * K.tagS) / K.normS)(r._kalender()), regionenNachher: Object.keys(F.regionen).length, je };
                    };
                    const orte = async (r, T, a) => {
                        const s = r.state;
                        const cells = (s.worldMeta && s.worldMeta.settlementCells) || {};
                        const doerfer = Object.values(cells).filter((c) => c && Number.isFinite(c.x)).map((c) => ({ x: c.x, z: c.z, nH: c.nH || 0, stadt: c.stadt || 0, epoche: c.epoche || null, key: r._bestandKey(c.x, c.z) }));
                        const staedte = r._staedte();
                        await r._fadenQuelle();
                        const an = await r._planetAuftrag({ type: "planet-anker", samen: r._planetSamen() });
                        const B = Math.round((an.breite * 18000) / Math.PI) / 100;
                        const L = Math.round((an.laenge * 18000) / Math.PI) / 100;
                        const lagen = [[B, L], [B + 1, L], [B - 1, L], [B, L + 1], [B, L - 1]];
                        const wald = [];
                        for (const [b, l] of lagen) wald.push(await Promise.all(a.zeiten.map((z) => r._planetAuftrag({ type: "planet-ort", samen: r._planetSamen(), breite: b, laenge: l, zeitMa: z }).then((o) => [o.delta.wuchs.wald, o.delta.wuchs.decke, Math.round(o.hoeheM)]))));
                        const fk = r._fischKarte;
                        let staende = 0;
                        if (fk && fk.zellen) for (const c of fk.zellen.values()) if (c.stand) staende++;
                        const d0 = doerfer[0];
                        const y0 = d0 ? r._voxelSurfaceY(d0.x, d0.z) : 0;
                        return {
                            doerfer,
                            jahr: ((K) => (K.jahrK * K.tagS) / K.normS)(r._kalender()),
                            staedte: staedte.length,
                            groessteStadt: staedte.reduce((q, x) => Math.max(q, x.nH || 0), 0),
                            kuesteKm: an.kuesteKm,
                            wald,
                            bestaeuber: (r._bestaeuberListe || []).length,
                            fischStaende: staende,
                            gattungen: Object.keys(r.constructor._lebensraumGesetz().L.gattung),
                            pose: d0 ? [d0.x + 40, y0 + 60, d0.z + 40, d0.x, y0, d0.z] : null,
                        };
                    };
                    const pose = (p) => (p ? { px: p[0], py: p[1], pz: p[2], lx: p[3], ly: p[4], lz: p[5] } : { ort: "wiese" });
                    const aus = M.teil || {};
                    let O = null;
                    try {
                        O = await S(orte, { zeiten: U[7].zeiten });
                    } catch (e) {
                        for (const nr of [2, 3, 4, 5, 6, 7, 8]) aus[nr] = { werte: {}, zeuge: {}, nicht: warf(e) };
                        return { sprossen: aus };
                    }
                    const doerfer = O.doerfer.length;
                    const groesster = O.doerfer.reduce((q, x) => Math.max(q, x.stadt || x.nH || 0), 0);
                    // S2 — Jagd des Spielers als Entnahme: der Bestand mit ↔ ohne Jagd; der Fang am Wasser
                    try {
                        const b = await S(bestand, { ring: [2, 3], n: U[2].regionen, wahl: ["wiese"], laeufe: [{ name: "ohne", dauer: 3600, schritt: 600 }, { name: "jagd", dauer: 3600, schritt: 600, jagd: { g: "deer", anteil: 0.5, je: 600, bis: 1800 } }] });
                        const ende = (L) => (L.reihe.length ? L.reihe[L.reihe.length - 1].deer || 0 : 0);
                        const mitJ = b.je.map((x) => ende(x.laeufe.jagd));
                        const ohneJ = b.je.map((x) => ende(x.laeufe.ohne));
                        aus[2] = {
                            werte: { fangOrte: 0, hirscheOhneJagd: mittel(ohneJ), hirscheMitJagd: mittel(mitJ), entnommen: b.je.reduce((q, x) => q + x.laeufe.jagd.entnommen, 0), fischStaende: O.fischStaende },
                            zeuge: Z(b.je.length * 12, Math.max(...ohneJ.concat(mitJ)) - Math.min(...ohneJ.concat(mitJ)), mittel(mitJ), mittel(ohneJ)),
                            auge: await A("leben-netz-s2", pose(O.pose)),
                            nicht: "kein Fang des Spielers: an 0 Orten ein Fang je Stunde (" + O.fischStaende + " Fisch-Stände der Karte, kein Verb fischt) — die Jagd als Entnahme: Hirsche nach 1 Spielstunde " + mittel(mitJ).toFixed(1) + " mit ↔ " + mittel(ohneJ).toFixed(1) + " ohne Jagd an " + b.je.length + " Regionen",
                        };
                        // S2 AM FÄCHER (M4): die Fisch-Zellen um den Spieler (25 × 25 Zellen des Fisch-Gesetzes) × zwei Fragen. „dichte“: der
                        // Stand, den das Spiel je Zelle würfelt (stamm/kreatur-fauna.js:566 _fischZelle — die Glieder n des Schwarms; eine
                        // frische Zelle, die Karte des Spiels bleibt unberührt). „fang“: die Fähigkeit der Welt, an der Zelle eine Stunde zu
                        // fischen — fehlt sie, nennt die Adresse ihr Fehlen. Das Prädikat: r (Fang je Stunde ↔ Dichte) über die Zellen mit Stand
                        const FISCH_AN = async (r, T, a) => {
                            const C = r.constructor;
                            if (typeof r._fischZelle !== "function" || typeof C._fischGesetz !== "function") return { fehlt: "kein Fisch-Gesetz (_fischZelle, AnazhRealm._fischGesetz)" };
                            const F = C._fischGesetz().F;
                            const fk = r._fischKarte || { saat: parseInt(r._fastHash(C._saatJe(r) + "-fisch"), 16) >>> 0 };
                            const pm = r.state.playerMesh.position;
                            const c = r._fischZelle(fk, { ix: Math.floor(pm.x / F.zelleM) + a.ort[0], iz: Math.floor(pm.z / F.zelleM) + a.ort[1] });
                            const dichte = c.stand ? c.stand.n : 0;
                            if (a.zeit.k === "dichte") return { dichte, stand: c.stand ? 1 : 0 };
                            if (!c.stand) return { stand: 0 };
                            const fn = ["_fischFang", "_angeln", "_fangAt"].find((n) => typeof r[n] === "function");
                            if (!fn) return { fehlt: "kein Fang des Spielers: kein Verb fischt (kein _fischFang/_angeln) — stamm/kreatur-fauna.js:566 _fischZelle setzt den Stand aus dem Gesetz, kein Leser nimmt aus ihm" };
                            return { stand: 1, dichte, fang: +r[fn](c.stand.x, c.stand.z, 3600) || 0 };
                        };
                        const zellen = [];
                        for (let i = -12; i <= 12; i++) for (let j = -12; j <= 12; j++) zellen.push([i, j]);
                        const pear = (v) => {
                            const p = v.filter((q) => Array.isArray(q) && q.every(Number.isFinite));
                            if (p.length < 3) return null;
                            const mx = p.reduce((q, x) => q + x[0], 0) / p.length, my = p.reduce((q, x) => q + x[1], 0) / p.length;
                            let sxy = 0, sx = 0, sy = 0;
                            for (const [x, y] of p) { sxy += (x - mx) * (y - my); sx += (x - mx) ** 2; sy += (y - my) ** 2; }
                            return sx > 0 && sy > 0 ? sxy / Math.sqrt(sx * sy) : null;
                        };
                        const R2n = await FAECHER((c) => H.seite(c), {
                            gesetz: { fn: FISCH_AN, export: "stamm/kreatur-fauna.js:566 _fischZelle (der Stand je Zelle aus AnazhRealm._fischGesetz) · r._fischFang", leser: "stamm/kreatur-fauna.js:494 _fischTakt (je Takt eine Zelle nach) — kein Leser des Fangs" },
                            adressen: { orte: zellen, zeiten: [{ k: "dichte" }, { k: "fang" }] },
                            ms: 10000,
                            masse: {
                                zellen: { wie: "anzahl", feld: "stand", nur: (a) => a.zeit.k === "dichte" },
                                fischOrte: { wie: "summe", feld: "stand", nur: (a) => a.zeit.k === "dichte" },
                                dichteMax: { wie: "max", feld: "dichte", nur: (a, w) => a.zeit.k === "dichte" && w.stand === 1 },
                                dichteMin: { wie: "min", feld: "dichte", nur: (a, w) => a.zeit.k === "dichte" && w.stand === 1 },
                                fangOrte: { wie: "anzahl", feld: "fang", nur: (a, w) => a.zeit.k === "fang" && w.stand === 1 },
                                fangR: { wie: pear, x: "dichte", y: "fang", nur: (a, w) => a.zeit.k === "fang" && w.stand === 1 },
                            },
                            schlecht: { feld: "dichte", richtung: "max" },
                            pose: (a) => "die Fisch-Zelle " + a.ort.join("/") + " um den Spieler — 3 m über dem Stand, Blick ins Wasser",
                            ungemessen: ["das Bildpaar übernutzt ↔ daneben (am Gerät)"],
                        });
                        const w2n = R2n.werte;
                        Object.assign(aus[2].werte, { fangOrte: w2n.fangOrte || 0, fangR: w2n.fangR, fischOrte: w2n.fischOrte, dichteSpanne: w2n.dichteMax == null ? null : w2n.dichteMax - w2n.dichteMin });
                        aus[2].zeuge.akte = R2n.akte;
                        aus[2].zeuge.fischZellen = w2n.zellen;
                        if (R2n.fehlt) aus[2].nicht = R2n.fehlt + " — an " + R2n.fehltAn.length + " Zellen mit Stand (" + (w2n.fischOrte || 0) + " von " + (w2n.zellen || 0) + " Zellen tragen einen Schwarm, Glieder " + w2n.dichteMin + "–" + w2n.dichteMax + "); " + aus[2].nicht;
                        else delete aus[2].nicht;
                    } catch (e) {
                        aus[2] = { werte: {}, zeuge: {}, nicht: warf(e) };
                    }
                    // S3 — Überjagung ×3 über 10 Spieljahre und die Erholung nach dem Stopp (der Fang selbst fehlt); die Fischerdörfer
                    try {
                        const J = O.jahr;
                        const jahre = U[3].jahre;
                        const b = await S(bestand, { ring: [2, 4], n: U[3].regionen, wahl: ["wiese"], laeufe: [{ name: "basis", dauer: jahre * J, schritt: 600, jagd: { g: "deer", anteil: U[3].anteil, je: J, bis: jahre * J } }, { name: "drei", dauer: (jahre + U[3].stopJahre) * J, schritt: 600, jagd: { g: "deer", anteil: 3 * U[3].anteil, je: J, bis: jahre * J } }] });
                        if (!b.je.length) throw new Error("keine Region mit Wiese im Ring 2–4");
                        const amEnde = (L, s) => { const i = Math.round(s / 600) - 1; return L.reihe[i] ? L.reihe[i].deer || 0 : NaN; };
                        const summe = (name, s) => b.je.reduce((q, x) => q + amEnde(x.laeufe[name], s), 0);
                        const basis10 = summe("basis", jahre * J);
                        const drei10 = summe("drei", jahre * J);
                        const drei15 = summe("drei", (jahre + U[3].stopJahre) * J);
                        const reihe = b.je[0].laeufe.drei.reihe;
                        const w3 = { saaten: 1, fischerdorfProzent: 0, doerfer, regionen: b.je.length, spieljahre: (b.je[0].laeufe.basis.reihe.length * 600) / b.jahr, hirscheBasis: basis10, hirscheDrei: drei10, hirscheErholt: drei15, entnommenBasis: b.je.reduce((q, x) => q + x.laeufe.basis.entnommen, 0), entnommenDrei: b.je.reduce((q, x) => q + x.laeufe.drei.entnommen, 0) };
                        if (basis10 > 0) w3.bestandRueckgangProzent = (100 * (basis10 - drei10)) / basis10;
                        w3.erholung = drei15 - drei10;
                        aus[3] = {
                            werte: w3,
                            zeuge: Z(b.je.reduce((q, x) => q + x.laeufe.basis.reihe.length + x.laeufe.drei.reihe.length, 0), Math.max(...reihe.map((q) => q.deer || 0)) - Math.min(...reihe.map((q) => q.deer || 0)), drei10, basis10),
                            nicht: "keine Fischerdörfer und kein Fang: " + doerfer + " Ort(e) der Welt, die Küste " + Math.round(O.kuesteKm) + " km vom Anker, eine Saat — die Lage des Dorfs liest die Krautschicht, nie den Fischgrund; die Überjagung ×3 als Jagd an " + b.je.length + " Regionen: Hirsche nach " + jahre + " Spieljahren " + drei10 + " ↔ Basis " + basis10 + ", " + U[3].stopJahre + " Jahre nach dem Stopp " + drei15,
                        };
                    } catch (e) {
                        aus[3] = { werte: {}, zeuge: {}, nicht: warf(e) };
                    }
                    // S4 — Kulturfolger am Ort gegen das Umland: der Bestand der Orts-Region gegen die Regionen im Ring
                    try {
                        const ortKeys = [...new Set(O.doerfer.map((d) => d.key))];
                        // 19.11.: eine frisch gestartete Welt trägt an der Wiese noch keinen Ort (der Zug `_tickAutoSettlement` hebt die
                        // Zelle erst, wenn der Spieler naht) — dann gibt es keinen Bestand am Ort, und die Zeile nennt die Zahl statt NaN
                        if (!ortKeys.length) {
                            aus[4] = {
                                werte: { orte: 0, nutztierGattungen: 0, groessterOrt: 0 },
                                zeuge: Z(0, 0, NaN, NaN),
                                nicht: "keine Stadt mit 10⁴ Bewohnern und kein Ort an der Wiese: worldMeta.settlementCells trägt 0 Orte (" + O.staedte + " Städte) — kein Bestand am Ort gegen das Umland; keine Nutztiere im Buch (" + O.gattungen.join(", ") + ")",
                            };
                            throw null;
                        }
                        const st = await S(bestand, { keys: ortKeys, n: ortKeys.length, ring: [0, 0], nahErlaubt: true, laeufe: [{ name: "jetzt", dauer: U[4].dauer, schritt: 600 }] });
                        const umKeys = [];
                        for (const k of ortKeys) {
                            const [ix, iz] = k.split(",").map(Number);
                            for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) { const q = ix + i + "," + (iz + j); if (!ortKeys.includes(q) && !umKeys.includes(q)) umKeys.push(q); }
                        }
                        const um = await S(bestand, { keys: umKeys, n: U[4].umland, ring: [0, 0], nahErlaubt: true, laeufe: [{ name: "jetzt", dauer: U[4].dauer, schritt: 600 }] });
                        const km2 = (st.seite * st.seite) / 1e6;
                        const dichte = (x, gs) => gs.reduce((q, g) => q + (x.laeufe.jetzt.n[g] || 0), 0) / km2;
                        const kultur = ["fox"];
                        const scheu = ["deer", "wolf", "bear"];
                        const ks = mittel(st.je.map((x) => dichte(x, kultur)));
                        const ku = mittel(um.je.map((x) => dichte(x, kultur)));
                        const ss = mittel(st.je.map((x) => dichte(x, scheu)));
                        const su = mittel(um.je.map((x) => dichte(x, scheu)));
                        const w4 = { kulturfolgerDiff: ks - ku, scheueDiff: ss - su, kulturStadt: ks, kulturUmland: ku, scheueStadt: ss, scheueUmland: su, orte: st.je.length, umland: um.je.length, nutztierGattungen: 0, groessterOrt: groesster };
                        aus[4] = {
                            werte: w4,
                            zeuge: Z(st.je.length + um.je.length, Math.abs(ss - su) + Math.abs(ks - ku), ks, ku),
                            nicht: "keine Stadt mit 10⁴ Bewohnern (" + O.staedte + " Städte, der größte Ort " + groesster + " Häuser) und keine Nutztiere im Buch (" + O.gattungen.join(", ") + ") — der Wurf des Bestands fragt nie den Grundriss: Füchse " + ks.toFixed(1) + " /km² am Ort ↔ " + ku.toFixed(1) + " im Umland, Scheue " + ss.toFixed(1) + " ↔ " + su.toFixed(1),
                        };
                    } catch (e) {
                        if (e !== null) aus[4] = { werte: {}, zeuge: {}, nicht: warf(e) };
                    }
                    // S5 — die Metropole: Städte der Welt, ein Leser der Stoffströme
                    aus[5] = {
                        werte: { staedte: O.staedte, groessteStadt: O.groessteStadt, doerfer },
                        zeuge: Z(doerfer + O.staedte, groesster, NaN, NaN),
                        auge: await A("leben-netz-s5", pose(O.pose)),
                        nicht: "keine Metropole und keine Stoffströme: " + O.staedte + " Städte der Welt (größte " + O.groessteStadt + " Häuser); kein Leser trägt Nahrung herein, Abwasser hinaus, Algen oder Sauerstoff im Wasser",
                    };
                    // S6 — Hecken, Bestäuber und Hafenstädte
                    aus[6] = {
                        werte: { saaten: 1, bestaeuber: O.bestaeuber, heckenLeser: 0, staedte: O.staedte },
                        zeuge: Z(1, O.bestaeuber, NaN, NaN),
                        nicht: "keine Monokultur, keine Hecke, keine Hafenstadt: die Bestäuber lesen Blüte, Wind, Feuchte und Tag (" + O.bestaeuber + " im Lauf headless), kein Feld des Menschen; " + O.staedte + " Städte an 1 Saat",
                    };
                    // S7 — der Wald über Jahrtausende: der Planet-Faden am Anker und vier Nachbarn, 0 … 10 000 Jahre zurück
                    const wald = O.wald.map((rh) => rh.map((x) => x[0]));
                    const alt = mittel(wald.map((rh) => rh[rh.length - 1]));
                    const neu = mittel(wald.map((rh) => rh[0]));
                    aus[7] = {
                        werte: { waldRueckgangProzent: alt > 0 ? (100 * (alt - neu)) / alt : NaN, waldJetzt: neu, waldVor: alt, antworten: wald.flat().length },
                        zeuge: Z(wald.flat().length, Math.max(...O.wald.flat().map((x) => x[2])) - Math.min(...O.wald.flat().map((x) => x[2])), neu, alt),
                        auge: await A("leben-netz-s7", pose(O.pose)),
                        nicht: "keine Rodung über Jahrtausende: der Planet-Faden trägt den Wald " + wald.map((rh) => rh.join("/")).join(" · ") + " über " + Math.abs(U[7].zeiten[U[7].zeiten.length - 1]) * 1e6 + " Jahre — kein Mensch im Planeten, keine Epoche der Fischerei",
                    };
                    // S8 — die Stadt jenseits Tokio
                    aus[8] = {
                        werte: { groessteStadt: O.groessteStadt, staedte: O.staedte },
                        zeuge: Z(O.staedte, 0, NaN, NaN),
                        auge: await A("leben-netz-s8", pose(O.pose)),
                        nicht: "keine Stadt über 10⁸ Bewohner: " + O.staedte + " Städte, der größte Ort " + groesster + " Häuser; kein Leser bilanziert Versorgung aus der Saat-Ökologie",
                    };
                    await schiess(18, 25);
                    return { sprossen: aus };
                },
                sprossen: {
                    2: {
                        u: { regionen: 4 },
                        soll: [K.soll(SN, 2, "Fang je Stunde ↔ Fischdichte an 20 Orten r ≥ 0,6", { key: "fangR" }), K.soll(SN, 2, "an 20 Orten", { key: "fangOrte", rel: "≥", zahl: 20 })],
                        auge: { pose: "schräg über dem Ort der Welt (übernutzt ↔ daneben)", vorbild: "Bildpaar übernutzter Ort gegen daneben (Prüfer-Satz R11)" },
                        zeuge: zeugeR7(20, "Bestand mit Nutzung gegen ohne"),
                        taeter: "stamm/kreatur-fauna.js _fischZelle (kein Fang)",
                        nicht: "kein Fang des Spielers",
                        leser: "stamm/kreatur-fauna.js:566 — `_fischZelle` setzt den Stand aus dem Gesetz, kein Verb des Spielers fängt und kein Fang liest die Fischdichte",
                        ...selbst({ fangR: 0.7, fangOrte: 20 }, Z(24, 5, 4, 9)),
                    },
                    3: {
                        u: { jahre: 10, stopJahre: 5, anteil: 0.1, regionen: 3 },
                        soll: [
                            K.soll(SN, 3, "50 Saaten", { key: "saaten", rel: "≥", zahl: 50 }),
                            K.soll(SN, 3, "≥ 70 % der Fischerdörfer am produktivsten Drittel der Küste", { key: "fischerdorfProzent", einheit: "%" }),
                            K.soll(SN, 3, "Fang ×3 → Bestand −≥ 50 % in 10 Spieljahren", { key: "bestandRueckgangProzent", einheit: "%" }),
                            K.soll(SN, 3, "in 10 Spieljahren", { key: "spieljahre", rel: "≤", zahl: 10, einheit: "a" }),
                            K.soll(SN, 3, "Erholung nach Stopp", { key: "erholung", rel: ">", zahl: 0, einheit: "Tiere", refQuelle: "das Wort selbst: Erholung — der Bestand fünf Spieljahre nach dem Stopp minus der Bestand am Stopp > 0" }),
                        ],
                        zeuge: zeugeR7(20, "Bestand bei Fang ×3 gegen einfach"),
                        taeter: "stamm/siedlung-ort.js _ortNaehrt (der Ort liest die Krautschicht, nie den Fischgrund)",
                        nicht: "keine Fischerdörfer, kein Fang",
                        leser: "stamm/siedlung-ort.js:1707 — `_ortNaehrt` liest die Krautschicht (gelaende-core ortKraut), nie den Fischgrund (`_fischZelle`); kein Verb fängt",
                        unklar: "„Fang ×3“ nennt keinen Grund-Fang — die Station misst die Überjagung als Entnahme 10 % ↔ 30 % der Hirsche je Spieljahr (die Jagd, die das Spiel trägt).",
                        ...selbst({ saaten: 50, fischerdorfProzent: 76, bestandRueckgangProzent: 62, spieljahre: 10, erholung: 7 }, Z(100, 9, 4, 11)),
                    },
                    4: {
                        u: { umland: 24, dauer: 0 },
                        soll: [
                            K.soll(SN, 4, "Kulturfolger-Dichte Stadt > Umland", { key: "kulturfolgerDiff", rel: ">", zahl: 0, einheit: "/km²", refQuelle: "das Wort selbst: „Stadt > Umland“ — Dichte der Kulturfolger am Ort minus im Umland > 0" }),
                            K.soll(SN, 4, "Scheue < Umland", { key: "scheueDiff", rel: "<", zahl: 0, einheit: "/km²", refQuelle: "das Wort selbst: „Scheue < Umland“ — Dichte der Scheuen am Ort minus im Umland < 0" }),
                            K.soll(SN, 4, "Nutztiere und Weidefläche gegen Agrarstatistik der Epoche ±Faktor 3", { key: "agrarFaktor", rel: "≤", zahl: 3, einheit: "×" }),
                        ],
                        zeuge: zeugeR7(5, "Dichte am Ort gegen Umland"),
                        taeter: "stamm/kreatur-leben.js _creatureNaturalBirth (der Wurf fragt nie den Grundriss)",
                        nicht: "keine Stadt mit 10⁴ Bewohnern, keine Nutztiere",
                        leser: "stamm/kreatur-leben.js:1958 — der Wurf des Gesetzes fragt nur die Saat (`_wildnisTraegt`), nie den Ort: kein Kulturfolger, keine Scheu; tetrapoda-core.js:2077 gattung: kein Nutztier im Buch",
                        unklar: "„Kulturfolger“ trägt im Buch nur den Fuchs (Tauben, Ratten, Möwen fehlen) — die Station zählt ihn; „±Faktor 3“ als max(x/ref, ref/x) ≤ 3.",
                        ...selbst({ kulturfolgerDiff: 4.2, scheueDiff: -6, agrarFaktor: 1.8 }, Z(7, 10, 9.2, 5)),
                    },
                    5: {
                        u: {},
                        soll: [K.soll(SN, 5, "Algenblüte und Sauerstoffloch stromab im Bildpaar gegen eine Saat ohne Stadt", { key: "algenDiff", rel: ">", zahl: 0, refQuelle: "das Wort selbst: Algenblüte stromab mit Stadt minus ohne Stadt > 0" })],
                        // ZAHL (auge-klasse.cjs): die Zahl urteilt, das Bild ist Beleg — die sichtbare Hälfte des Satzes ist ein eigenes Soll (ungemessen: ROT)
                        zeuge: zeugeR7(2, "Algen stromab mit Stadt gegen eine Saat ohne Stadt"),
                        auge: { pose: "die Mündung stromab der Stadt (heute keine Stadt — geschossen über dem Ort der Welt)", vorbild: "Bildpaar Algenblüte und Sauerstoffloch gegen eine Saat ohne Stadt (Prüfer-Satz R11)" },
                        taeter: "stamm/siedlung-ort.js _staedte (keine Metropole, keine Stoffströme)",
                        nicht: "keine Metropole, keine Stoffströme",
                        leser: "stamm/siedlung-ort.js:1472 — `_staedte` kennt Häuser und Ringe, keinen Strom von Nahrung und Abwasser; kein Leser des Wassers trägt Algen oder Sauerstoff",
                        ...selbst({ algenDiff: 0.3 }, Z(2, 1, 0.4, 0.1)),
                    },
                    6: {
                        u: {},
                        soll: [
                            K.soll(SN, 6, "Intervall ohne 0", { key: "nullImIntervall", zahl: 0 }),
                            K.soll(SN, 6, "Rangkorrelation Küstenstadt-Größe ↔ Meeres-Ertrag + Hafengunst ≥ 0,6", { key: "rangKorr" }),
                            K.soll(SN, 6, "an 50 Saaten", { key: "saaten", rel: "≥", zahl: 50 }),
                        ],
                        zeuge: zeugeR7(50, "Bestäuber mit Hecken gegen ohne"),
                        taeter: "stamm/kreatur-fauna.js _bestaeuberTakt (kein Feld, keine Hecke)",
                        nicht: "keine Monokultur, keine Hecken, keine Hafenstädte",
                        leser: "stamm/kreatur-fauna.js:613 — `_bestaeuberTakt` liest Blüte, Wind, Feuchte und Tag, kein Feld und keine Hecke des Menschen; stamm/siedlung-ort.js:1472 `_staedte` ordnet keine Stadt nach Hafengunst",
                        ...selbst({ nullImIntervall: 0, rangKorr: 0.66, saaten: 50 }, Z(60, 12, 30, 12)),
                    },
                    7: {
                        u: { zeiten: [0, -0.002, -0.004, -0.006, -0.008, -0.01] },
                        soll: [
                            K.soll(SN, 7, "Waldanteil über Jahrtausende gegen Pollen-Reihen", { key: "waldRueckgangProzent", rel: "band", zahl: 50, bis: 70, einheit: "%", refQuelle: "Pollen-Reihen Mitteleuropas: Waldanteil von ~80 % (6000 v. Chr.) auf ~30 % (1850), Rückgang 50–70 % (Kaplan, Krumhardt & Zimmermann 2009, Quaternary Science Reviews 28)" }),
                            K.soll(SN, 7, "Panel ordnet Fischerei und Hafen ihrer Epoche ≥ 70 %", { key: "panelProzent", einheit: "%" }),
                        ],
                        auge: { pose: "schräg über dem Ort der Welt, je Epoche", vorbild: "Panel ordnet Fischerei und Hafen ihrer Epoche ≥ 70 % (Prüfer-Satz R11)" },
                        taeter: "voxel-worker.js planetOrtAuftrag (kein Mensch im Planeten)",
                        nicht: "keine Rodung über Epochen",
                        leser: "voxel-worker.js:1446 — planetOrtAuftrag trägt delta.wuchs aus Klima und Zeit, keine Zivilisation: keine Rodung, keine Megafauna, keine Fischerei je Epoche",
                        unklar: "„gegen Pollen-Reihen“ trägt keine Zahl — die Station setzt den Rückgang des Waldanteils Mitteleuropas 50–70 % (Kaplan et al. 2009).",
                        ...selbst({ waldRueckgangProzent: 58, panelProzent: 74 }, Z(30, 200, 0.4, 0.9)),
                    },
                    8: {
                        u: {},
                        // ZAHL (auge-klasse.cjs): die Zahl urteilt, das Bild ist Beleg — die sichtbare Hälfte des Satzes ist ein eigenes Soll (ungemessen: ROT)
                        soll: [K.soll(SN, 8, "Fehlbetrag ≤ 1 %", { key: "fehlbetragProzent", einheit: "%" }), K.soll(SN, 8, "Umland mit/ohne Stadt im Bildpaar verschieden", { key: "umlandAnders", rel: ">", zahl: 0, refQuelle: "der Richter: „Umland mit/ohne Stadt im Bildpaar verschieden“ — der Anteil geänderter Umland-Zellen mit gegen ohne Stadt ist > 0", einheit: "Anteil" })],
                        zeuge: zeugeR7(3, "Umland mit Stadt gegen ohne"),
                        auge: { pose: "das Umland des Orts der Welt, mit ↔ ohne Stadt", vorbild: "Umland mit/ohne Stadt im Bildpaar verschieden (Prüfer-Satz R11)" },
                        taeter: "stamm/siedlung-ort.js _staedte (keine Stadt über 10⁸)",
                        nicht: "keine Stadt über 10⁸ Bewohner",
                        leser: "stamm/siedlung-ort.js:1472 — `_staedte` kennt keine Bewohnerzahl und keine Versorgung; kein Leser bilanziert die Stadt gegen die Saat-Ökologie",
                        ...selbst({ fehlbetragProzent: 0.6, umlandAnders: 0.2 }, Z(3, 1, 1, 0)),
                    },
                },
            },
        },
    };
})());

// ── DIE PERSPEKTIVE zusammenspiel.mensch (6 Leitern, 37 Sprossen, 1 belegt: antwort S1 — g5.js K4_PROBE, der Ring um das Spielerhaus
// mit dem Gegen-Ort B derselben Saat): wie der Mensch mit der Welt gekoppelt ist — Leib, Sport, Tag, Antwort auf Eingriff, Kultur und der
// Kreislauf der Versorgung —, jede Kopplung mit ihrem Gegenlauf (R7). Gemessen wird in der warmen Welt der Sitzung an EINEM lebenden Dorf
// um den Spieler (der Satz „dorf“ des Spiels: `spawnSettlement`, die Bewohner über `__gebautNach` bis `S.liste && S.lebt`; steht schon ein
// lebendes Dorf ≤ 230 m, misst die Probe dort): der Tag über das Soll des Gesetzes (`_bewohnerSoll` → koerper `tagesPlan`) und den Stand
// jedes Bewohners (`b.drinnen`) nach dem Sprung der Uhr, der Leib über das Genom (`_rollHumanoidGenome`, die EINE Quelle von Höhe und
// Hautton) und die Gestalt der Tracht (`S.gestalten`, `koerper kleidZonen`), Bau und Kultur über den Plan des Fachwerks
// (`_foundryRequestSettlement`, derselbe Export, den der Satz „dorf“ ruft) an den Zellen der Welt (`_autoSettlementCellInfo`) und am
// Boden der Zelle (`_rockExposureAt`, `_forestStandDensity`, `_bodenKlasseAt`). Wetter nur über `__wetterSetzen`, die Schwerkraft über
// den Welt-Akt `gravity` der DSL (unter dem Mess-Halt gehoben und zurückgestellt); Uhr, Wetter und Schwerkraft kehren am Ende zurück.
L.perspektive("mensch", (() => {
    const LEIB = "mensch.kopplung.leib";
    const SPORT = "mensch.kopplung.sport";
    const LEBEN = "mensch.kopplung.leben";
    const KULTUR = "mensch.kopplung.kultur";
    const KREIS = "mensch.kopplung.kreislauf";
    const ANTWORT = "mensch.kopplung.antwort";
    const PFAD_DORF = ["stamm/siedlung-*.js", "stamm/koerper-leib.js", "koerper-core.js", "fachwerk-core.js", "stamm/bild-himmel.js", "stamm/feld-dsl.js", "scripts/lib/welt-boot.cjs", "scripts/werkbank.cjs"];
    // DAS WORT OHNE ZAHL: K.soll verlangt eine Zahl im Wort; eine Bedingung des Richters ohne Zahl („Statur gedrungener“, „verlassene
    // Häuser verfallen“, „ohne Eingriff byte-gleich“) steht als 0/1-Maß. Das Wort steht wörtlich im Richter und trägt selbst KEINE Zahl —
    // jede Zahl-Bedingung geht durch K.soll
    const sollWort = (id, nr, wort, o) => {
        const r = K.sprosseVon(id, nr).richter;
        if (!r.includes(wort)) throw new Error("Soll „" + wort + "“ steht nicht wörtlich im Richter " + id + " S" + nr);
        if (K.zahlenIn(wort).length) throw new Error("das Wort „" + wort + "“ trägt eine Zahl — K.soll, nie sollWort");
        return { wort, key: o.key, rel: o.rel, a: o.zahl, b: undefined, ref: undefined, refQuelle: undefined, einheit: o.einheit || "" };
    };

    // ════════ die Zeugen der Welt ════════
    const zeugeDorf = (roh) => {
        const z = roh.zeuge || {};
        if (!(z.n >= 8)) return "nur " + (z.n || 0) + " Bewohner im Dorf der Probe (Soll ≥ 8)";
        return null;
    };
    const zeugeRegen = (roh) => {
        const z = roh.zeuge || {};
        const d = zeugeDorf(roh);
        if (d) return d;
        if (!(z.regen >= 0.3) || !(z.sonne === 0)) return "der Regen am Ort stand nicht (rain Sonne " + z.sonne + " → Regen " + z.regen + ")";
        if (!(z.istSonne > z.istRegen)) return "der Stand draußen änderte sich nicht unter dem Regen (" + z.istSonne + " → " + z.istRegen + ")";
        if (!(z.istGegen >= z.istSonne - 0.1)) return "der Gegenlauf fehlt: die Sonne zurück, und draußen bleibt " + z.istGegen + " gegen " + z.istSonne + " (die Wirkung verschwindet nicht mit der Ursache)";
        return null;
    };
    const DORF_Z = { n: 27, sonne: 0, regen: 0.6, istSonne: 0.89, istRegen: 0.3, istGegen: 0.89 };

    return {
        leitern: {
            // ════════ mensch.kopplung.leib — Leib folgt dem Planeten ════════
            // EIN Messprogramm: das Dorf der Probe (gegründet, wenn keins lebt), dann je Sprosse am Dorf und an den Zellen der Welt:
            // S1 die gezeigte Tracht (Gestalt des Bewohners) unter Sonne → Regen → Sonne nach dem Sprung der Uhr; S2 200 Genome aus den
            // Samen der Zellen und die Breite ihrer Herkunft (die Welt trägt EINEN Anker); S3 der Stoff der Tracht (koerper kleidZonen
            // `webe`) gegen Feld, Herde, Stände des Plans; S4 die Vielfalt der Häute im Dorf und ob eine Zelle einen Hafen trägt; S5 die
            // Tracht der Pläne in 4 Epochen und die Höhe DERSELBEN Bewohner je Epoche (die Ursache Epoche allein bewegt, der Gegenlauf
            // dieselbe Epoche zweimal); S6 die Schwerkraft 2 g über den Welt-Akt `gravity`: Genom und Plan unter 1 g ↔ 2 g.
            [LEIB]: {
                sek: 60,
                dorf: true,
                mutiert: true,
                faecher: true,
                pfad: PFAD_DORF,
                ungefahren: "das Bildpaar der Tracht Sommer ↔ Winter und Sonne ↔ Regen (S1), die Bilder von Hafen ↔ Bergdorf (S4) und das Dorf unter 2 g (S6) schießt nur das Gerät",
                mess: async function (H, U, M) {
                    const S = (fn, a) => H.seite("return await (" + String(fn) + ")(r, " + JSON.stringify(a || {}) + ");");
                    const d = M.dorfDa();
                    const aus = M.teil || {};
                    const pearson = (p) => { const m = p.length; if (m < 3) return null; const mx = p.reduce((s, q) => s + q[0], 0) / m, my = p.reduce((s, q) => s + q[1], 0) / m; let sxy = 0, sxx = 0, syy = 0; for (const [x, y] of p) { sxy += (x - mx) * (y - my); sxx += (x - mx) ** 2; syy += (y - my) ** 2; } return sxx > 0 && syy > 0 ? sxy / Math.sqrt(sxx * syy) : null; };
                    const r3 = (v) => (Number.isFinite(v) ? Math.round(v * 1e3) / 1e3 : null);
                    // DIE ADRESSEN DER WELT: jede Zelle mit ihrer Siedlungs-Saat (stamm/siedlung-ort.js:1427 _autoSettlementCellInfo — derselbe Ruf, aus
                    // dem jedes Dorf der Welt seinen Plan bestellt), ihre Lage und ihr Grund
                    const zellen = await H.seite("const z = []; for (let cx = -11; cx <= 11 && z.length < 64; cx++) for (let cz = -11; cz <= 11 && z.length < 64; cz++) { const c = r._autoSettlementCellInfo(cx, cz); if (c) z.push({ seed: c.seed, nH: c.nH, x: c.x, z: c.z, y: r.getTerrainHeightAt(c.x, c.z) }); } return z;");
                    if (!Array.isArray(zellen) || !zellen.length) throw new Error("der Leib: keine Zelle der Welt trägt ein Dorf (_autoSettlementCellInfo)");
                    const nH = {};
                    for (const c of zellen) nH[c.seed] = c.nH;

                    // ── S1 ÜBER DEN FÄCHER: 16 Siedlungs-Saaten × Sommer · Winter · Regen · Sturm · Sommer (der Gegenlauf). Die Ursache geht über die
                    // Kanäle der Welt (die Jahreszeit `setSeason`, stamm/bild-himmel.js:1151; das Wetter `__wetterSetzen`), je Adresse ruft der Richter
                    // das Gesetz der Tracht, das der Leib-Raum jeder Siedlung liest: der Plan der Saat (`_foundryRequestSettlement`, fachwerk kleidung)
                    // → `_bewohnerTracht` (stamm/siedlung-bewohner.js:374) — liest es Kälte oder Regen nicht, steht derselbe Schnitt und Δ ist 0
                    const TRACHT_AN = async (r, T, a, mit) => {
                        const kc = window.__koerperCore, st = r.state;
                        if (st.season !== a.zeit.jz && !r.setSeason(a.zeit.jz)) return { fehlt: "die Jahreszeit " + a.zeit.jz + " gilt nicht (setSeason)" };
                        if (st.weather !== a.zeit.w && window.__wetterSetzen(a.zeit.w) !== a.zeit.w) return { fehlt: "das Wetter " + a.zeit.w + " gilt nicht (__wetterSetzen)" };
                        const P = await r._foundryRequestSettlement({ seed: a.saat, nH: mit.nH[a.saat] });
                        if (!P || !P.kleidung) return { fehlt: "der Plan der Saat trägt keine Kleidung (fachwerk-core.js kleidung)" };
                        const Pa = kc.START_PARAMS;
                        const t = r._bewohnerTracht({ topColor: Pa.topColor, bottomColor: Pa.bottomColor, shoeColor: Pa.shoeColor }, P.kleidung, Object.keys(kc.CLOTH_COLORS));
                        let grad = null;
                        try { grad = r._temperaturAt(st.playerMesh.position.y); } catch (e) { grad = null; }
                        return { lage: mit.lagen.includes(t.top) ? 1 : 0, kapuze: t.kapuze || t.hood ? 1 : 0, top: t.top, rain: r._weatherFieldFor().rain, phase: st.seasonPhase, grad: Number.isFinite(grad) ? grad : null };
                    };
                    await H.seite("const st = r.state; window.__kmJahrAlt = { season: st.season, phase: st.seasonPhase, anker: r._saisonAnker, w: st.weather }; return 1;");
                    let R1;
                    try {
                        const Z = (jz, w, gegen) => ({ jz, w, ...(gegen ? { gegen: 1 } : {}) });
                        R1 = await FAECHER((c) => H.seite(c), {
                            gesetz: { fn: TRACHT_AN, export: "stamm/siedlung-bewohner.js:374 _bewohnerTracht an der kleidung des Plans (fachwerk-core.js, _foundryRequestSettlement)", leser: "stamm/siedlung-bewohner.js:362 _bewohnerRaum" },
                            adressen: { saaten: zellen.slice(0, 16).map((c) => c.seed), zeiten: [Z("sommer", "sunny"), Z("winter", "sunny"), Z("sommer", "rainy"), Z("sommer", "stormy"), Z("sommer", "sunny", true)] },
                            mit: { nH, lagen: ["pullover", "poncho", "jacket", "jacke", "coat", "mantel", "hoodie"] },
                            ms: 14000,
                            masse: {
                                saaten: { wie: "verschieden", feld: "a.saat" },
                                lagenSommer: { wie: "mittel", feld: "lage", nur: (a) => a.zeit.jz === "sommer" && a.zeit.w === "sunny" && !a.zeit.gegen },
                                lagenWinter: { wie: "mittel", feld: "lage", nur: (a) => a.zeit.jz === "winter" },
                                lagenGegen: { wie: "mittel", feld: "lage", nur: (a) => !!a.zeit.gegen },
                                kapuzeSonne: { wie: "mittel", feld: "kapuze", nur: (a) => a.zeit.jz === "sommer" && a.zeit.w === "sunny" && !a.zeit.gegen },
                                kapuzeNass: { wie: "mittel", feld: "kapuze", nur: (a) => a.zeit.w === "rainy" || a.zeit.w === "stormy" },
                                rainSonne: { wie: "max", feld: "rain", nur: (a) => a.zeit.w === "sunny" },
                                rainRegen: { wie: "min", feld: "rain", nur: (a) => a.zeit.w === "rainy" },
                                phaseSommer: { wie: "erste", feld: "phase", nur: (a) => a.zeit.jz === "sommer" },
                                phaseWinter: { wie: "erste", feld: "phase", nur: (a) => a.zeit.jz === "winter" },
                                gradSommer: { wie: "mittel", feld: "grad", nur: (a) => a.zeit.jz === "sommer" && a.zeit.w === "sunny" },
                                gradWinter: { wie: "mittel", feld: "grad", nur: (a) => a.zeit.jz === "winter" },
                                tops: { wie: "verschieden", feld: "top" },
                            },
                            schlecht: { feld: "lage", richtung: "min" },
                            pose: (a, w) => "der Platz der Saat " + a.saat + " im " + a.zeit.jz + " (" + a.zeit.w + ") um 12 Uhr, Third 32 m — Tracht " + w.top,
                            ungemessen: ["das Bildpaar Sommer ↔ Winter und Sonne ↔ Regen (am Gerät)"],
                        });
                    } finally {
                        await H.seite("const st = r.state, a = window.__kmJahrAlt; if (a) { if (a.season) r.setSeason(a.season); st.seasonPhase = a.phase; r._saisonAnker = a.anker; window.__wetterSetzen(a.w); } delete window.__kmJahrAlt; return 1;");
                    }
                    const w1 = R1.werte;
                    const amGeraet = async (name, code) => {
                        if (M.swift) return M.auge(name, d.pose, {});
                        await H.seite("const st = r.state; window.__kmAugeAlt = { w: st.weather, tod: st.timeOfDay, g: st.gravity, halt: st.weatherEffectTime, season: st.season, phase: st.seasonPhase, anker: r._saisonAnker }; " + code + " return 1;");
                        try { return await M.auge(name, d.pose, {}); }
                        finally { await H.seite("const st = r.state, a = window.__kmAugeAlt; if (a) { window.__wetterSetzen(a.w); r.setTimeOfDay(a.tod, \"regler\"); if (a.season) r.setSeason(a.season); st.seasonPhase = a.phase; r._saisonAnker = a.anker; if (st.gravity !== a.g) { st.weatherEffectTime = 0; try { r.dslRun([\"gravity\", a.g], { source: \"human\" }); } finally { st.weatherEffectTime = a.halt; } if (st.gravity !== a.g) st.gravity = a.g; } } delete window.__kmAugeAlt; return 1;"); }
                    };
                    const a1s = await amGeraet("mensch-leib-s1-sommer", "r.setSeason(\"sommer\"); window.__wetterSetzen(\"sunny\"); r.setTimeOfDay(0.5, \"regler\");");
                    const a1w = await amGeraet("mensch-leib-s1-winter", "r.setSeason(\"winter\"); window.__wetterSetzen(\"sunny\"); r.setTimeOfDay(0.5, \"regler\");");
                    const auge1 = { bild: a1s.bild && a1w.bild ? a1s.bild + " ↔ " + a1w.bild : null, pose: R1.pose || a1s.pose, grund: a1s.grund || a1w.grund };
                    aus[1] = {
                        werte: { lagenDelta: Number.isFinite(w1.lagenWinter) && Number.isFinite(w1.lagenSommer) ? w1.lagenWinter - w1.lagenSommer : null, kapuzeDelta: Number.isFinite(w1.kapuzeNass) && Number.isFinite(w1.kapuzeSonne) ? w1.kapuzeNass - w1.kapuzeSonne : null, lagenSommer: w1.lagenSommer, lagenWinter: w1.lagenWinter },
                        zeuge: { saaten: w1.saaten, adressen: R1.gemessen, phaseSommer: w1.phaseSommer, phaseWinter: w1.phaseWinter, gradSommer: r3(w1.gradSommer), gradWinter: r3(w1.gradWinter), rainSonne: w1.rainSonne, rainRegen: w1.rainRegen, lagenGegen: w1.lagenGegen, lagenSommer: w1.lagenSommer, tops: w1.tops, akte: R1.akte },
                        auge: auge1,
                        ...(R1.gemessen ? {} : { nicht: "kein Plan der 16 Saaten antwortet (" + (R1.fehlt || (R1.fehler[0] || {}).fehler || "die Frist") + ") · " + R1.akte }),
                    };

                    // ── S2 ÜBER DEN FÄCHER: 200 Planeten-Saaten. Je Saat die Breite ihres Ankers aus dem Planet-Faden (`_planetAuftrag` planet-anker,
                    // stamm/gelaende-chunks.js:680 — der Ort der Welt auf ihrem Planeten, den die Reise liest) und der Hautton ihrer Bewohner aus
                    // dem Genom (`_rollHumanoidGenome`, stamm/koerper-leib.js:12, die EINE Quelle des Hauttons; Leser `_bewohnerGenome`
                    // stamm/siedlung-bewohner.js:422). Der Plan-Same einer fremden Welt ist ohne ihre Welt nicht rufbar (die Zelle liest die
                    // geladene Saat), die Bewohner der Saat q tragen den Samen „q:Haus:Person“ wie jeder Bewohner („Plan:Haus:Person“)
                    const GENOM_AN = async (r, T, a, mit) => {
                        const kc = window.__koerperCore;
                        await r._fadenQuelle();
                        const an = await r._planetAuftrag({ type: "planet-anker", samen: a.saat });
                        if (!an || !Number.isFinite(an.breite)) return { fehlt: "planet-anker antwortet ohne Breite (voxel-worker.js planet-anker)" };
                        let dunkel = 0, ton = null;
                        for (const p of mit.personen) {
                            const g = r._rollHumanoidGenome(a.saat + ":" + p);
                            const t = kc.SKIN_TONES[g.skinTone];
                            if (!t) return { fehlt: "der Hautton " + g.skinTone + " steht nicht in SKIN_TONES (koerper-core.js:757)" };
                            const c = t.hex;
                            dunkel += 1 - (0.2126 * ((c >> 16) & 255) + 0.7152 * ((c >> 8) & 255) + 0.0722 * (c & 255)) / 255;
                            if (ton == null) ton = g.skinTone;
                        }
                        const breite = (an.breite * 180) / Math.PI;
                        return { dunkel: dunkel / mit.personen.length, breite, aequator: 90 - Math.abs(breite), ton };
                    };
                    const R2 = await FAECHER((c) => H.seite(c), {
                        gesetz: { fn: GENOM_AN, export: "stamm/koerper-leib.js:12 _rollHumanoidGenome (skinTone) · planet-anker (stamm/gelaende-chunks.js:680 _planetAnker)", leser: "stamm/siedlung-bewohner.js:422 _bewohnerGenome" },
                        adressen: { saaten: Array.from({ length: U[2].saaten }, (_, i) => "mensch.kopplung.leib-s2-" + (i + 1)) },
                        mit: { personen: ["1:0", "1:1", "2:0", "2:1"] },
                        ms: 30000,
                        masse: {
                            saaten: { wie: "anzahl" },
                            r: { wie: (v) => pearson(v), x: "aequator", y: "dunkel" },
                            rGegen: { wie: (v, aus) => pearson(aus.map((x, i) => [aus[(i + 1) % aus.length].w.aequator, x.w.dunkel])) },
                            breiteSpanne: { wie: (v) => (v.length ? Math.max(...v) - Math.min(...v) : null), feld: "breite" },
                            toene: { wie: "verschieden", feld: "ton" },
                        },
                        schlecht: { feld: "aequator", richtung: "max" },
                        pose: (a, w) => "die Bewohner der Saat " + a.saat + " am äquatornächsten Anker (" + r3(w.breite) + "°): Hautton " + w.ton,
                        ungemessen: ["Statur nach Bergmann/Allen (das Genom liest kein Klima: kh und build aus dem Samen, stamm/koerper-leib.js:48)"],
                    });
                    const w2 = R2.werte;
                    aus[2] = {
                        werte: { saaten: w2.saaten, r: r3(w2.r) },
                        zeuge: { genome: w2.saaten * 4, toene: w2.toene, breiteStreuung: r3(w2.breiteSpanne), gegenR: r3(w2.rGegen), akte: R2.akte },
                        ...(R2.gemessen ? {} : { nicht: "keine Planeten-Saat antwortet (" + (R2.fehlt || (R2.fehler[0] || {}).fehler || "die Frist") + ") · " + R2.akte }),
                    };

                    // ── S3 ÜBER DEN FÄCHER: 32 Siedlungs-Saaten. Je Plan die Stoffe seiner Tracht (koerper `kleidZonen` `webe`, koerper-core.js:257) gegen
                    // die Erzeugnisse seiner Region: die Ware jedes Werks des Plans nach dem Gesetz des Bestands (`BESTAND_GESETZ.herstellung`, die
                    // Herstellung, die der Wirt liest), das Feld, die Stände
                    const STOFF_AN = async (r, T, a, mit) => {
                        const kc = window.__koerperCore;
                        const P = await r._foundryRequestSettlement({ seed: a.saat, nH: mit.nH[a.saat] });
                        if (!P || !P.kleidung) return { fehlt: "der Plan der Saat trägt keine Kleidung (fachwerk-core.js kleidung)" };
                        const K = P.kleidung;
                        const zonen = kc.kleidZonen(Object.assign({}, kc.START_PARAMS, { top: K.top, bottom: K.bottom, shoes: K.shoes }));
                        const stoffe = [...new Set(zonen.map((z) => z.webe).filter(Boolean))];
                        const HG = (kc.BESTAND_GESETZ || {}).herstellung || {};
                        const erz = new Set();
                        for (const s of P.slots || []) if (HG[s.rolle] && HG[s.rolle].ware) erz.add(HG[s.rolle].ware);
                        if ((P.felder || []).length && HG.feld) erz.add(HG.feld.ware);
                        for (const s of P.staende || []) for (const k of ["ware", "gut", "art"]) if (typeof s[k] === "string") erz.add(s[k]);
                        return { stoffe: stoffe.length, drin: stoffe.filter((s) => erz.has(s)).length, erz: erz.size, voll: stoffe.length > 0 && stoffe.every((s) => erz.has(s)) ? 1 : 0, bild: stoffe.join("+") + " ⊄ " + ([...erz].join("+") || "—") };
                    };
                    const R3 = await FAECHER((c) => H.seite(c), {
                        gesetz: { fn: STOFF_AN, export: "koerper-core.js:257 kleidZonen (webe) an der kleidung des Plans · koerper-core.js BESTAND_GESETZ.herstellung", leser: "stamm/siedlung-bewohner.js:362 _bewohnerRaum (Tracht) · der Wirt _bestandHalter (Ware)" },
                        adressen: { saaten: zellen.slice(0, 32).map((c) => c.seed) },
                        mit: { nH },
                        ms: 12000,
                        masse: { saaten: { wie: "anzahl" }, voll: { wie: (v) => (v.length ? (100 * v.filter(Boolean).length) / v.length : null), feld: "voll" }, stoffe: { wie: "summe", feld: "stoffe" }, drin: { wie: "summe", feld: "drin" }, erzeugnisse: { wie: "summe", feld: "erz" }, bilder: { wie: "verschieden", feld: "bild" } },
                        schlecht: { feld: "drin", richtung: "min" },
                        pose: (a, w) => "die Tracht der Saat " + a.saat + " (" + w.bild + ") am Platz ihres Dorfs",
                    });
                    const w3 = R3.werte;
                    aus[3] = {
                        werte: { stoffProzent: w3.voll, saaten: w3.saaten },
                        zeuge: { stoffe: w3.stoffe, erzeugnisse: w3.erzeugnisse, drin: w3.drin, gegenWechsel: false, akte: R3.akte },
                        ...(R3.gemessen ? {} : { nicht: "kein Plan der 32 Saaten antwortet (" + (R3.fehlt || (R3.fehler[0] || {}).fehler || "die Frist") + ") · " + R3.akte }),
                    };

                    // ── S4 (Panel R11) ÜBER DEN FÄCHER: 64 Siedlungs-Saaten; je Plan, ob er einen Hafen trägt, und die Vielfalt der Häute seiner
                    // Bewohner (Simpson über die Genome „Plan:Haus:Person“) — der Hafen gegen das höchste Dorf (Bergdorf)
                    const HAFEN_AN = async (r, T, a, mit) => {
                        const kc = window.__koerperCore;
                        const P = await r._foundryRequestSettlement({ seed: a.saat, nH: mit.nH[a.saat] });
                        if (!P || !P.slots) return { fehlt: "der Plan der Saat trägt keine Bauten (_foundryRequestSettlement)" };
                        const n = {};
                        let k = 0;
                        for (let si = 0; si < Math.min(8, P.slots.length); si++) for (let p = 0; p < 3; p++) { const t = r._rollHumanoidGenome(a.saat + ":" + si + ":" + p).skinTone; n[t] = (n[t] || 0) + 1; k++; }
                        let simpson = 1;
                        for (const t of Object.keys(n)) simpson -= (n[t] / k) ** 2;
                        void kc;
                        return { hafen: P.slots.some((s) => /hafen|kai|mole/i.test(String(s.rolle || ""))) ? 1 : 0, vielfalt: simpson, hoehe: mit.hoehe[a.saat] };
                    };
                    const hoehe = {};
                    for (const c of zellen) hoehe[c.seed] = c.y;
                    const R4 = await FAECHER((c) => H.seite(c), {
                        gesetz: { fn: HAFEN_AN, export: "fachwerk-core.js DORF (slots, _foundryRequestSettlement) · stamm/koerper-leib.js:12 _rollHumanoidGenome", leser: "stamm/siedlung-bewohner.js:422 _bewohnerGenome" },
                        adressen: { saaten: zellen.map((c) => c.seed) },
                        mit: { nH, hoehe },
                        ms: 12000,
                        masse: { plaene: { wie: "anzahl" }, hafen: { wie: "summe", feld: "hafen" }, vielfaltHafen: { wie: "mittel", feld: "vielfalt", nur: (a, w) => w.hafen === 1 }, vielfaltBerg: { wie: (v, aus) => { const b = aus.filter((x) => Number.isFinite(x.w.hoehe)).sort((p, q) => q.w.hoehe - p.w.hoehe)[0]; return b ? b.w.vielfalt : null; } } },
                        schlecht: { feld: "hoehe", richtung: "max" },
                        pose: (a) => "Third über dem höchsten Dorf der Zellen (Saat " + a.saat + ") gegen den Hafen (es gibt keinen)",
                        ungemessen: ["„plausibel gegen Daten“: Zensus gemischter Häfen (R11, Prüfer-Satz)", "die Migration (kein Zuzug in der Welt)"],
                    });
                    const w4 = R4.werte;
                    aus[4] = { werte: { vielfaltDelta: Number.isFinite(w4.vielfaltHafen) && Number.isFinite(w4.vielfaltBerg) ? w4.vielfaltHafen - w4.vielfaltBerg : null, hafenOrte: w4.hafen, plaene: w4.plaene }, zeuge: { plaene: w4.plaene, hafen: w4.hafen, akte: R4.akte }, auge: await M.auge("mensch-leib-s4", d.pose, {}), nicht: "kein Hafen unter " + w4.plaene + " Plänen der Zellen und keine Migration: das Genom liest nur seinen Samen (stamm/koerper-leib.js:12 _rollHumanoidGenome), das Bergdorf mischt wie jedes (Simpson " + r3(w4.vielfaltBerg) + ") · " + R4.akte };

                    // ── S5 und S6 am Gesetz der Bewohner des Dorfs (die Genome ihrer Samen) und am Plan der Saat des Dorfs
                    const leib = async (r, a) => {
                        const st = r.state, A = AnazhRealm;
                        const D = r._bewohnerSiedlungen.get(window.__dorfDerProbe);
                        if (!D || !D.liste) return { fehler: "das Dorf der Probe fehlt" };
                        const Lb = D.liste, n = Lb.length;
                        const alt = { w: st.weather, tod: st.timeOfDay, g: st.gravity, halt: st.weatherEffectTime };
                        const aus = { n };
                        const E = A.Gesetz("fachwerk:epocheImJahr");
                        const hoch = () => Lb.reduce((s, b) => s + r._rollHumanoidGenome(b.seed).kh * 800, 0) / n;
                        const ep = [];
                        for (const j of a.jahre) {
                            const e = E(j);
                            const P = await r._foundryRequestSettlement({ seed: a.same, nH: a.nH, epoche: e });
                            const T = P && P.kleidung;
                            ep.push({ jahr: j, epoche: e, tracht: T ? [T.top, T.bottom, T.shoes, T.farben.join("+")].join("/") : null, cm: hoch() });
                        }
                        const P0 = await r._foundryRequestSettlement({ seed: a.same, nH: a.nH, epoche: E(a.jahre[0]) });
                        const tr0 = P0 && P0.kleidung ? [P0.kleidung.top, P0.kleidung.bottom, P0.kleidung.shoes, P0.kleidung.farben.join("+")].join("/") : null;
                        aus.s5 = { ep, gegenGleich: tr0 === ep[0].tracht && Math.abs(hoch() - ep[0].cm) < 1e-9 };
                        // S6 misst der Fächer (unten): die Genome des Dorfs × 1 g · 2 g · 1 g zurück am EINEN Welt-Akt gravity
                        aus.samen = Lb.map((b) => b.seed);
                        aus.g = alt.g;
                        aus.gZurueck = st.gravity === alt.g;
                        return aus;
                    };
                    const m = await S(leib, { same: d.seed, nH: 8, jahre: [1320, 1560, 1700, 1860] });
                    if (!m || m.fehler) throw new Error("der Leib: " + (m && m.fehler));
                    const s5 = m.s5, ref = U[5].ref;
                    const abw = s5.ep.map((e) => Math.abs(e.cm - ref[String(e.jahr)]));
                    const cms = s5.ep.map((e) => e.cm);
                    const trachten = s5.ep.map((e) => e.tracht);
                    const eindeutig = trachten.filter((t) => t && trachten.filter((u) => u === t).length === 1).length;
                    aus[5] = { werte: { epocheProzent: (100 * eindeutig) / s5.ep.length, groesseAbwCm: Math.max(...abw), groesseCm: cms[0] }, zeuge: { plaene: s5.ep.filter((e) => e.tracht).length, trachtWechsel: new Set(trachten).size - 1, groesseStreuungCm: Math.max(...cms) - Math.min(...cms), gegenGleich: s5.gegenGleich, epochen: s5.ep.map((e) => e.jahr + ":" + e.epoche + ":" + e.cm.toFixed(1)).join(" ") } };
                    // S6 AM FÄCHER (M4): je Genom des Dorfs der Export, den der Leib liest (_rollHumanoidGenome: kh, build), unter 1 g, 2 g und
                    // 1 g zurück — die Schwerkraft setzt der EINE Welt-Akt (dslRun gravity). Liest das Genom sie, wird der Leib unter 2 g kleiner
                    // oder breiter (gedrungen > 0); liest es sie nicht, ist gedrungen 0. „Leib und Kultur kohärent ≥ 0,8“ ist R6/R11 (ein
                    // Prüfer liest) — ungemessen bis zum Gerät und zum Panel
                    const STATUR_AN = async (r, T, a, mit) => {
                        const st = r.state, halt = st.weatherEffectTime, soll = mit.g * a.zeit.g;
                        if (st.gravity !== soll) { st.weatherEffectTime = 0; try { r.dslRun(["gravity", soll], { source: "human" }); } finally { st.weatherEffectTime = halt; } }
                        if (Math.abs(st.gravity - soll) > 1e-9) return { fehlt: "der Welt-Akt gravity setzt " + soll + " nicht (stamm/feld-dsl.js gravity)" };
                        const G = r._rollHumanoidGenome(a.saat);
                        return { kh: G.kh, build: G.build, g: st.gravity / mit.g };
                    };
                    let R6;
                    try {
                        R6 = await FAECHER((c) => H.seite(c), {
                            gesetz: { fn: STATUR_AN, export: "stamm/koerper-leib.js:12 _rollHumanoidGenome(seed) — kh und build des Leibs", leser: "stamm/siedlung-bewohner.js _bewohnerLeibAn (der Leib des Bewohners aus seinem Genom)" },
                            adressen: { saaten: m.samen.slice(0, 40), zeiten: [{ g: 1, k: "eins" }, { g: 2, k: "zwei" }, { g: 1, k: "zurueck" }] },
                            mit: { g: m.g },
                            ms: 8000,
                            masse: {
                                genome: { wie: "verschieden", feld: "a.saat" },
                                kh1: { wie: "mittel", feld: "kh", nur: (a) => a.zeit.k === "eins" },
                                kh2: { wie: "mittel", feld: "kh", nur: (a) => a.zeit.k === "zwei" },
                                khZurueck: { wie: "mittel", feld: "kh", nur: (a) => a.zeit.k === "zurueck" },
                                bau1: { wie: "mittel", feld: "build", nur: (a) => a.zeit.k === "eins" },
                                bau2: { wie: "mittel", feld: "build", nur: (a) => a.zeit.k === "zwei" },
                                gFaktor: { wie: "max", feld: "g" },
                            },
                            schlecht: { feld: "kh", richtung: "max" },
                            pose: (a, w) => "Third über dem Genom " + a.saat + " unter " + w.g + " g (kh " + (+w.kh).toFixed(3) + ")",
                            ungemessen: ["Leib und Kultur kohärent aus dem Bild unter 2 g (R6/R11 Panel, am Gerät)"],
                        });
                    } finally {
                        await H.seite("const st = r.state, g = " + JSON.stringify(m.g) + ", halt = st.weatherEffectTime; if (st.gravity !== g) { st.weatherEffectTime = 0; try { r.dslRun([\"gravity\", g], { source: \"human\" }); } finally { st.weatherEffectTime = halt; } } if (st.gravity !== g) st.gravity = g; return 1;");
                    }
                    const w6 = R6.werte;
                    const ged = [w6.kh1, w6.kh2, w6.bau1, w6.bau2].every(Number.isFinite) && w6.kh1 > 0 ? (w6.kh1 - w6.kh2) / w6.kh1 + (w6.bau2 - w6.bau1) : null;
                    aus[6] = {
                        werte: { gFaktor: w6.gFaktor, gedrungen: ged },
                        zeuge: { gFaktor: w6.gFaktor, gZurueck: Number.isFinite(w6.khZurueck) && Math.abs(w6.khZurueck - w6.kh1) < 1e-9, kh: w6.kh1 + " → " + w6.kh2, bewohner: w6.genome, akte: R6.akte },
                        auge: await amGeraet("mensch-leib-s6", "st.weatherEffectTime = 0; try { r.dslRun([\"gravity\", 2 * st.gravity], { source: \"human\" }); } finally { st.weatherEffectTime = window.__kmAugeAlt.halt; }"),
                    };
                    return { sprossen: aus };
                },
                sprossen: {
                    1: {
                        u: {},
                        soll: [sollWort(LEIB, 1, "Lagen-Anteil steigt im Bildpaar", { key: "lagenDelta", rel: ">", zahl: 0 })],
                        // ZAHL (auge-klasse.cjs): die Zahl urteilt, das Bild ist Beleg — der Zeuge verlangt die Welt hinter der Zahl: ≥ 8 Saaten,
                        // die Kälte stand (die Phase des Jahrs sprang), der Regen stand, und der Gegenlauf (der Sommer zurück) trägt den Schnitt des Sommers
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.saaten >= 8)) return "nur " + (z.saaten || 0) + " Saaten im Fächer (Soll ≥ 8)";
                            if (!(Number.isFinite(z.phaseWinter) && Number.isFinite(z.phaseSommer) && z.phaseWinter !== z.phaseSommer)) return "die Kälte stand nicht: die Phase des Jahrs blieb " + z.phaseSommer;
                            if (!(z.rainRegen >= 0.3) || !(z.rainSonne === 0)) return "der Regen am Ort stand nicht (rain Sonne " + z.rainSonne + " → Regen " + z.rainRegen + ")";
                            if (!(Math.abs(z.lagenGegen - z.lagenSommer) < 1e-9)) return "der Gegenlauf fehlt: der Sommer zurück, und die Lagen bleiben " + z.lagenGegen + " gegen " + z.lagenSommer;
                            return null;
                        },
                        auge: { pose: "Third über dem Platz der schlechtesten Saat (32 m, 9 m über Grund), Sommer 12 Uhr ↔ Winter 12 Uhr", vorbild: "Bildpaar Sommer ↔ Winter desselben Platzes: Prüfer-Satz (R11) zählt Lagen und Kapuzen" },
                        taeter: "stamm/siedlung-bewohner.js:374 _bewohnerTracht (der Schnitt der Epoche aus fachwerk kleidung; keine Jahreszeit, kein Wetter)",
                        nicht: "die Tracht liest kein Wetter",
                        leser: "stamm/siedlung-bewohner.js:362 _bewohnerRaum ruft :374 _bewohnerTracht(d, T, tuch) mit dem Schnitt der Epoche (S.plan.kleidung); kein Leser der Jahreszeit (state.seasonPhase), des Wetter-Felds (rain) und der Temperatur am Leib",
                        gruen: { werte: { lagenDelta: 0.4 }, zeuge: { saaten: 16, phaseSommer: 0.375, phaseWinter: 0.875, rainSonne: 0, rainRegen: 0.6, lagenGegen: 0.1, lagenSommer: 0.1 } },
                        attrappen: [
                            { name: "Lagen-Anteil aus einer Tafel ohne Saat", roh: { werte: { lagenDelta: 0.4 }, zeuge: {} } },
                            { name: "Lagen ohne Kälte (die Phase des Jahrs stand)", roh: { werte: { lagenDelta: 0.4 }, zeuge: { saaten: 16, phaseSommer: 0.375, phaseWinter: 0.375, rainSonne: 0, rainRegen: 0.6, lagenGegen: 0.1, lagenSommer: 0.1 } } },
                            { name: "der Sommer zurück trägt die Lagen des Winters (die Wirkung bleibt ohne Ursache)", roh: { werte: { lagenDelta: 0.4 }, zeuge: { saaten: 16, phaseSommer: 0.375, phaseWinter: 0.875, rainSonne: 0, rainRegen: 0.6, lagenGegen: 0.5, lagenSommer: 0.1 } } },
                        ],
                    },
                    2: {
                        u: { saaten: 200 },
                        soll: [K.soll(LEIB, 2, "200 Saaten", { key: "saaten", rel: "≥", zahl: 200 }), K.soll(LEIB, 2, "Hautton ↔ Breite r ≥ 0,7", { key: "r" })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.genome >= 200)) return "nur " + (z.genome || 0) + " Genome der Welt (Soll 200)";
                            if (!(z.toene >= 2)) return "die Genome tragen keinen Wechsel des Hauttons";
                            if (!(z.breiteStreuung >= 20)) return "die Herkunft trägt keine Streuung der Breite (" + z.breiteStreuung + "° — r ohne Ursache)";
                            if (!(Math.abs(z.gegenR) < 0.2)) return "der Gegenlauf fehlt: die Breiten vertauscht, und der Gang bleibt (r " + z.gegenR + ")";
                            return null;
                        },
                        taeter: "stamm/koerper-leib.js:49 _rollHumanoidGenome (skinTone aus dem Samen, keine Breite)",
                        nicht: "keine Breite am Leib",
                        leser: "stamm/koerper-leib.js:49 skinTone = g.pick(\"skin\", …) gleichverteilt; kein Leser der Herkunfts-Breite (UV): der Anker (stamm/gelaende-chunks.js:680 _planetAnker) erreicht das Genom nie",
                        gruen: { werte: { saaten: 200, r: 0.74 }, zeuge: { genome: 800, toene: 7, breiteStreuung: 110, gegenR: 0.03 } },
                        attrappen: [
                            { name: "r 0,74 aus einer Hautton-Tafel je Breite (kein Genom der Welt)", roh: { werte: { saaten: 200, r: 0.74 }, zeuge: { genome: 0 } } },
                            { name: "r über EINE Breite (keine Streuung der Ursache)", roh: { werte: { saaten: 200, r: 0.74 }, zeuge: { genome: 800, toene: 7, breiteStreuung: 0.1, gegenR: 0 } } },
                            { name: "r bleibt mit vertauschten Breiten (der Gang ist kein Gesetz der Breite)", roh: { werte: { saaten: 200, r: 0.74 }, zeuge: { genome: 800, toene: 7, breiteStreuung: 110, gegenR: 0.7 } } },
                        ],
                    },
                    3: {
                        u: {},
                        soll: [K.soll(LEIB, 3, "Stoffe ⊆ Erzeugnisse und Handel der Region 100 %", { key: "stoffProzent", rel: "≥", zahl: 100, einheit: "%" })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.stoffe >= 1)) return "kein Stoff der Tracht gelesen";
                            if (!(z.erzeugnisse >= 1)) return "die Region trägt keine Erzeugnisse (Feld, Herde, Handel) — 100 % über einer leeren Menge";
                            if (z.gegenWechsel !== true) return "der Gegenlauf fehlt: die Wolle aus der Region genommen, und die Tracht bleibt";
                            return null;
                        },
                        taeter: "fachwerk-core.js DORF (kleidung = Schnitt der Epoche, kein Stoff aus Feld/Herde/Handel)",
                        nicht: "keine Erzeugnisse der Region",
                        leser: "fachwerk-core.js kleidung {top, bottom, shoes, farben} aus EPOCHEN[…].tracht; koerper-core.js:257 webe folgt nur dem Schnitt; kein Leser von Flachs, Wolle, Seide aus Feld, Herde, Handel (BESTAND_GESETZ.herstellung trägt kraut und eisen)",
                        gruen: { werte: { stoffProzent: 100 }, zeuge: { stoffe: 3, erzeugnisse: 4, gegenWechsel: true } },
                        attrappen: [{ name: "100 % über einer leeren Erzeugnis-Liste", roh: { werte: { stoffProzent: 100 }, zeuge: { stoffe: 3, erzeugnisse: 0 } } }],
                    },
                    4: {
                        u: {},
                        soll: [sollWort(LEIB, 4, "Vielfalts-Index Hafen > Bergdorf", { key: "vielfaltDelta", rel: ">", zahl: 0 })],
                        auge: { pose: "Third über dem Dorfplatz (heute: das Dorf der Probe; ein Hafen fehlt)", vorbild: "Bildpaar Hafen ↔ Bergdorf gegen Zensus-Daten gemischter Häfen, Prüfer-Satz (R11)" },
                        taeter: "stamm/koerper-leib.js _rollHumanoidGenome (kein Hafen, keine Migration)",
                        nicht: "kein Hafen, keine Migration",
                        leser: "fachwerk-core.js:5192 region der Siedlung fällt aus rnd() des Samens; kein Hafen-Ort und kein Zuzug, der Leib und Mode mischt",
                        gruen: { werte: { vielfaltDelta: 0.2 }, zeuge: { plaene: 64, hafen: 3 } },
                        attrappen: [{ name: "Vielfalt ohne Hafen", roh: { werte: { vielfaltDelta: 0.2 }, zeuge: { plaene: 0 } } }],
                    },
                    5: {
                        u: { ref: { 1320: 171, 1560: 170, 1700: 167, 1860: 167 } },
                        soll: [K.soll(LEIB, 5, "Epoche ≥ 80 %", { key: "epocheProzent", einheit: "%" }), K.soll(LEIB, 5, "Körpergröße ± 5 cm gegen reale Kurve", { key: "groesseAbwCm", rel: "≤", zahl: 5, einheit: "cm" })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.plaene >= 4)) return "nur " + (z.plaene || 0) + " Pläne der Epochen (Soll 4)";
                            if (!(z.trachtWechsel >= 1)) return "die Tracht wechselt über 4 Epochen nicht";
                            if (!(z.groesseStreuungCm > 0)) return "die Körpergröße DERSELBEN Bewohner wandelt sich über 4 Epochen nicht (" + z.epochen + ") — die Epoche erreicht den Leib nicht";
                            if (z.gegenGleich !== true) return "der Gegenlauf fehlt: dieselbe Epoche zweimal ist nicht gleich";
                            return null;
                        },
                        taeter: "stamm/koerper-leib.js _rollHumanoidGenome (kh aus dem Samen, kein Jahr)",
                        leser: "stamm/koerper-leib.js:48 kh = 0,215 · (1 + 0,08 · …) aus dem Samen; kein Leser des Jahrs (Referenz: Koepke & Baten 2005, Hatton & Bray 2010)",
                        unklar: "„Epoche ≥ 80 %“ nennt nicht, wer die Epoche erkennt — Vorschlag: Prüfer-Satz (R11) ordnet 4 Tracht-Bilder ihren Epochen zu, ≥ 80 % richtig; die Station zählt bis dahin die Epochen mit eindeutiger Tracht",
                        gruen: { werte: { epocheProzent: 100, groesseAbwCm: 2.4 }, zeuge: { plaene: 4, trachtWechsel: 3, groesseStreuungCm: 4.6, gegenGleich: true } },
                        attrappen: [
                            { name: "die Größe der Erd-Kurve abgeschrieben (der Leib wandelt sich nicht)", roh: { werte: { epocheProzent: 100, groesseAbwCm: 2.4 }, zeuge: { plaene: 4, trachtWechsel: 3, groesseStreuungCm: 0, gegenGleich: true } } },
                            { name: "ohne Pläne der Epochen", roh: { werte: { epocheProzent: 100, groesseAbwCm: 2.4 }, zeuge: { plaene: 0 } } },
                        ],
                    },
                    6: {
                        u: {},
                        soll: [K.soll(LEIB, 6, "2 g", { key: "gFaktor" }), sollWort(LEIB, 6, "Statur gedrungener", { key: "gedrungen", rel: ">", zahl: 0 }), K.soll(LEIB, 6, "Leib und Kultur kohärent ≥ 0,8", { key: "kohaerent" })],
                        auge: { pose: "Third über dem Dorfplatz unter 2 g (Welt-Akt gravity)", vorbild: "Fremdwelt-Probe (R10): ein eingefrorener Leser sagt aus dem Bild die Schwerkraft voraus, Kohärenz Leib ↔ Kultur ≥ 0,8" },
                        taeter: "stamm/koerper-leib.js _rollHumanoidGenome (keine Schwerkraft am Leib)",
                        nicht: "der Leib liest keine Schwerkraft",
                        leser: "stamm/feld-dsl.js:981 gravity, der Welt-Akt, schreibt state.gravity nur für _stepCharacter; das Genom (stamm/koerper-leib.js:48 kh) und der Plan (fachwerk-core.js:5183 DORF) lesen sie nicht",
                        gruen: { werte: { gFaktor: 2, gedrungen: 0.06, kohaerent: 0.85 }, zeuge: { gFaktor: 2, gZurueck: true } },
                        attrappen: [{ name: "gedrungen ohne Schwerkraft-Akt", roh: { werte: { gFaktor: 2, gedrungen: 0.06, kohaerent: 0.85 }, zeuge: {} } }],
                    },
                },
            },

            // ════════ mensch.kopplung.sport — Sport sitzt im Leben der Welt ════════
            // Der Tag jedes Bewohners am Abend (18,5–21 Uhr) über das Soll des Gesetzes (`_bewohnerSoll` → koerper tagesPlan) unter Sonne
            // und Regen, der Mittag als Gegenlauf (die Ursache Abend gekappt); die Rollen der Pläne an 200 Zellen (Sportstätten, Arenen)
            // gegen den Boden der Zelle (`_bodenKlasseAt`). Was der Tag nicht kennt (Spiel, Partie, Eis, Liga), urteilt „nicht erzeugbar“.
            [SPORT]: {
                sek: 45,
                dorf: true,
                mutiert: true,
                faecher: true,
                pfad: PFAD_DORF,
                ungefahren: "das Bild des Dorfplatzes am Abend (S1), der Platz bei Regen und Frost (S2) und das Bild der Sportkultur zweier Saaten (S5, S6) schießt nur das Gerät",
                mess: async function (H, U, M) {
                    const d = M.dorfDa();
                    const aus = M.teil || {};
                    const r3 = (v) => (Number.isFinite(v) ? Math.round(v * 1e3) / 1e3 : null);
                    // ── S1 und S2 ÜBER EINEN FÄCHER: jeder Bewohner des Dorfs × die Stunden des Abends (Sonne) und des Tags (Sonne · Regen · Sonne als
                    // Gegenlauf). Je Adresse ruft der Richter den Leser des Spiels, `_bewohnerSoll` (stamm/siedlung-bewohner.js:2237): er reicht Same,
                    // Rolle, Orte und den Regen des EINEN Wetter-Felds an koerper `tagesPlan` (koerper-core.js:5630) — das Wetter nur über `__wetterSetzen`
                    const TAG_AN = async (r, T, a) => {
                        const D = r._bewohnerSiedlungen.get(a.saat);
                        if (!D || !D.liste || !D.liste[a.ort]) return { fehlt: "der Bewohner " + a.ort + " fehlt im Dorf (_bewohnerSiedlungen)" };
                        if (r.state.weather !== a.zeit.w && window.__wetterSetzen(a.zeit.w) !== a.zeit.w) return { fehlt: "das Wetter " + a.zeit.w + " gilt nicht (__wetterSetzen)" };
                        const b = D.liste[a.ort];
                        const z = r._bewohnerSoll(b, a.zeit.h);
                        const spiel = z.akt === "spiel" ? 1 : 0;
                        // der Regen, den der Plan liest: an der Tür (`_wetterFeldAm`, main 60e8909d stamm/siedlung-bewohner.js:2245), am Mess-Kopf 8544438f das Wort der Welt
                        const tuer = b.orte && b.orte.tuer;
                        const rain = typeof r._wetterFeldAm === "function" && tuer ? r._wetterFeldAm(tuer.x, tuer.z).rain : r._weatherFieldFor().rain;
                        return { spiel, partie: spiel && !z.drinnen ? 1 : 0, eis: /eis/i.test(String(z.akt)) ? 1 : 0, kind: b.rolle === "kind" ? 1 : 0, rolle: String(b.rolle || "-"), akt: { [z.akt]: 1 }, rain };
                    };
                    const n = await H.seite("const D = r._bewohnerSiedlungen.get(window.__dorfDerProbe); return D && D.liste ? D.liste.length : 0;");
                    const wAlt = await H.seite("return r.state.weather;");
                    const abend = [17.5, 18, 18.5, 19, 19.5, 20, 20.5, 21];
                    const tag = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
                    const Zt = (h, w, art) => ({ h, w, art });
                    let R1;
                    try {
                        R1 = await FAECHER((c) => H.seite(c), {
                            gesetz: { fn: TAG_AN, export: "koerper-core.js:5630 tagesPlan (TAGES_GESETZ :5300, das Kind :5353)", leser: "stamm/siedlung-bewohner.js:2237 _bewohnerSoll" },
                            adressen: { saaten: [d.key], orte: Array.from({ length: n }, (_, i) => i), zeiten: [...abend.map((h) => Zt(h, "sunny", "abend")), ...tag.map((h) => Zt(h, "sunny", "tag")), ...tag.map((h) => Zt(h, "rainy", "regen")), ...tag.map((h) => Zt(h, "sunny", "gegen"))] },
                            ms: 12000,
                            masse: {
                                bewohner: { wie: "verschieden", feld: "a.ort" },
                                kinder: { wie: (v, aus) => new Set(aus.filter((x) => x.w.kind).map((x) => x.a.ort)).size },
                                erwachsene: { wie: (v, aus) => new Set(aus.filter((x) => !x.w.kind).map((x) => x.a.ort)).size },
                                spielAbend: { wie: "mittel", feld: "spiel", nur: (a) => a.zeit.art === "abend" },
                                spielAbendN: { wie: "summe", feld: "spiel", nur: (a) => a.zeit.art === "abend" },
                                spielKindAbend: { wie: "mittel", feld: "spiel", nur: (a, w) => a.zeit.art === "abend" && w.kind === 1 },
                                spielErwAbend: { wie: "mittel", feld: "spiel", nur: (a, w) => a.zeit.art === "abend" && w.kind === 0 },
                                spielTag: { wie: "mittel", feld: "spiel", nur: (a) => a.zeit.art === "tag" },
                                akteAbend: { wie: "zaehle", feld: "akt", nur: (a) => a.zeit.art === "abend" },
                                partienSonne: { wie: "summe", feld: "partie", nur: (a) => a.zeit.art === "tag" },
                                partienRegen: { wie: "summe", feld: "partie", nur: (a) => a.zeit.art === "regen" },
                                partienGegen: { wie: "summe", feld: "partie", nur: (a) => a.zeit.art === "gegen" },
                                eis: { wie: "summe", feld: "eis" },
                                rainSonne: { wie: "max", feld: "rain", nur: (a) => a.zeit.w === "sunny" },
                                rainRegen: { wie: "min", feld: "rain", nur: (a) => a.zeit.w === "rainy" },
                            },
                            schlecht: { feld: "spiel", richtung: "min" },
                            pose: (a, w) => "der Dorfplatz " + a.saat + " um " + a.zeit.h + " Uhr (" + a.zeit.w + "), Bewohner " + a.ort + " (" + w.rolle + ") ohne Spiel",
                            ungemessen: ["der Dorfplatz am Abend im Bild (am Gerät)", "Frost → Eis: kein Wort des Wetters trägt Frost (stamm/daten.js:56 WETTER_ZEILE), der Tag liest keine Temperatur"],
                        });
                    } finally {
                        await H.seite("window.__wetterSetzen(" + JSON.stringify(wAlt) + "); return 1;");
                    }
                    const w = R1.werte;
                    const akte = Object.keys(w.akteAbend || {}).join("+");
                    aus[1] = {
                        werte: { spielProzent: Number.isFinite(w.spielAbend) ? 100 * w.spielAbend : null, spielTagProzent: Number.isFinite(w.spielTag) ? 100 * w.spielTag : null },
                        zeuge: { n: w.bewohner, kinder: w.kinder, erwachsene: w.erwachsene, spielAbend: w.spielAbendN, spielKindAbend: r3(w.spielKindAbend), spielErwAbend: r3(w.spielErwAbend), akteAbend: akte, akte: R1.akte },
                        ...(R1.gemessen ? {} : { nicht: "kein Bewohner des Dorfs antwortet (" + (R1.fehlt || (R1.fehler[0] || {}).fehler || "die Frist") + ") · " + R1.akte }),
                    };
                    const rueck = w.partienSonne > 0 ? (100 * (w.partienSonne - w.partienRegen)) / w.partienSonne : null;
                    aus[2] = {
                        werte: { regenRueckgangProzent: r3(rueck), eisMaxC: null, partienSonne: w.partienSonne, partienRegen: w.partienRegen },
                        zeuge: { partienSonne: w.partienSonne, regen: w.rainRegen, sonne: w.rainSonne, gegenPartien: w.partienGegen, eis: w.eis, akte: R1.akte },
                        // der Regen bricht die Partie (gemessen am Fächer); das Eis ist keine Fähigkeit der Welt: kein Akt „Eis“, kein Leser der Temperatur
                        ...(w.eis > 0 ? {} : { nicht: "kein Eis: unter " + R1.gemessen + " Adressen kein Akt „Eis“ (koerper-core.js:5630 tagesPlan kennt schlaf · morgen · besuch · arbeit · spiel · mittag · abend; die Temperatur, stamm/bild-himmel.js:3063 _temperaturAt, hat im Tag keinen Leser) · Regen " + w.partienSonne + " → " + w.partienRegen + " Partien · " + R1.akte }),
                    };

                    // ── S3 und S4 ÜBER DEN FÄCHER: 200 Siedlungs-Saaten der Zellen (stamm/siedlung-ort.js:1427 _autoSettlementCellInfo), je Plan
                    // (`_foundryRequestSettlement`, fachwerk DORF) seine Sportstätten und der Boden seiner Zelle (`_bodenKlasseAt`, stamm/kreatur-leben.js:1707)
                    const zellen = await H.seite("const z = []; for (let cx = -16; cx <= 16 && z.length < 200; cx++) for (let cz = -16; cz <= 16 && z.length < 200; cz++) { const c = r._autoSettlementCellInfo(cx, cz); if (c) z.push({ seed: c.seed, nH: c.nH, x: c.x, z: c.z }); } return z;");
                    const zelle = {};
                    for (const c of zellen) zelle[c.seed] = c;
                    const SPORT_AN = async (r, T, a, mit) => {
                        const c = mit.zelle[a.saat];
                        const P = await r._foundryRequestSettlement({ seed: a.saat, nH: c.nH });
                        if (!P || !P.slots) return { fehlt: "der Plan der Saat trägt keine Bauten (_foundryRequestSettlement)" };
                        const rollen = [...new Set(P.slots.map((s) => String(s.rolle || "-")))];
                        const arten = rollen.filter((x) => /arena|stadion|sport|turnier|reitbahn|kampfbahn|spielplatz|liga|bad/i.test(x)).sort();
                        return { art: arten.join("+") || "keine", arten: arten.length, stadion: arten.some((x) => /arena|stadion/i.test(x)) ? 1 : 0, biom: String(r._bodenKlasseAt(c.x, c.z)), rollen: rollen.join("+") };
                    };
                    const cramer = (paare) => {
                        const rs = [...new Set(paare.map((p) => p[0]))], cs = [...new Set(paare.map((p) => p[1]))];
                        if (rs.length < 2 || cs.length < 2) return 0;
                        const N = paare.length, t = {}, rz = {}, cz = {};
                        for (const [x, y] of paare) { t[x + "|" + y] = (t[x + "|" + y] || 0) + 1; rz[x] = (rz[x] || 0) + 1; cz[y] = (cz[y] || 0) + 1; }
                        let chi = 0;
                        for (const x of rs) for (const y of cs) { const e = (rz[x] * cz[y]) / N; chi += ((t[x + "|" + y] || 0) - e) ** 2 / e; }
                        return Math.sqrt(chi / (N * (Math.min(rs.length, cs.length) - 1)));
                    };
                    const R3 = await FAECHER((c) => H.seite(c), {
                        gesetz: { fn: SPORT_AN, export: "fachwerk-core.js DORF (slots je Rolle, _foundryRequestSettlement)", leser: "stamm/siedlung-ort.js spawnSettlement (der Plan jedes Dorfs der Welt)" },
                        adressen: { saaten: zellen.map((c) => c.seed) },
                        mit: { zelle },
                        ms: 25000,
                        masse: {
                            saaten: { wie: "anzahl" },
                            cramersV: { wie: (v) => cramer(v), x: "biom", y: "art" },
                            gegenV: { wie: (v, aus) => cramer(aus.map((x, i) => [aus[(i + 1) % aus.length].w.biom, x.w.art])) },
                            sportarten: { wie: (v) => v.filter((x) => x !== "keine").length ? new Set(v.filter((x) => x !== "keine")).size : 0, feld: "art" },
                            stadien: { wie: "summe", feld: "stadion" },
                            artenJeSaat: { wie: "mittel", feld: "arten" },
                            biome: { wie: "verschieden", feld: "biom" },
                            rollen: { wie: (v) => [...new Set(v.join("+").split("+"))].join("+"), feld: "rollen" },
                        },
                        schlecht: { feld: "stadion", richtung: "min" },
                        pose: (a, w) => "der Ort der Saat " + a.saat + " auf Boden " + w.biom + " (Rollen " + String(w.rollen).slice(0, 60) + ") zur Stunde der Ankunft",
                    });
                    const z = R3.werte;
                    aus[3] = {
                        werte: { saaten: z.saaten, cramersV: r3(z.cramersV), biome: z.biome },
                        zeuge: { saaten: z.saaten, sportarten: z.sportarten, biome: z.biome, gegenV: r3(z.gegenV), akte: R3.akte },
                        ...(R3.gemessen ? {} : { nicht: "kein Plan der Zellen antwortet (" + (R3.fehlt || (R3.fehler[0] || {}).fehler || "die Frist") + ") · " + R3.akte }),
                    };
                    // S4: der Verkehr am Spieltag braucht ein Stadion und einen Spieltag — die Welt trägt keins von beiden (Fähigkeit fehlt, beim Namen)
                    aus[4] = { werte: { stadien: z.stadien }, zeuge: { stadien: z.stadien, akte: R3.akte }, nicht: "kein Stadion und kein Spieltag: " + z.stadien + " Stadien unter " + z.saaten + " Plänen der Zellen (fachwerk-core.js DORF kennt keine Sportstätte; die Arena der Breite steht nur am Genesis-Ort, fachwerk-core.js:12865, als Fläche) und kein Spieltag im Verkehr (stamm/siedlung-verkehr.js:27 _verkehrAnlegen) · " + R3.akte };
                    aus[5] = { werte: { artenJeSaat: z.artenJeSaat, staetten: z.stadien }, zeuge: { saaten: z.saaten, akte: R3.akte }, auge: await M.auge("mensch-sport-s5", d.pose, {}), nicht: "keine Sportart mit Lebenslauf: " + (z.artenJeSaat == null ? "?" : z.artenJeSaat) + " Sportstätten je Saat an " + z.saaten + " Plänen, kein Spiel des Erwachsenen im Tag, und kein Jahr, über das eine Art entsteht, wandert und stirbt (fachwerk-core.js:5183 DORF kennt keine Sportstätte)" };
                    aus[6] = { werte: { sportkulturAnders: z.sportarten > 1 ? 1 : 0, biome: z.biome }, zeuge: { saaten: z.saaten }, auge: await M.auge("mensch-sport-s6", d.pose, {}), nicht: "keine Sportkultur, die das Gelände formen könnte (" + z.biome + " Böden unter " + z.saaten + " Zellen, " + z.sportarten + " Sportarten)" };
                    return { sprossen: aus };
                },
                sprossen: {
                    1: {
                        u: {},
                        soll: [K.soll(SPORT, 1, "Anteil im Spiel 5–15 %", { key: "spielProzent", einheit: "%" })],
                        // „Wahl folgt Alter und Rolle“: der Zeuge verlangt Kinder und Erwachsene im Fächer und dass das Spiel am Abend sie scheidet
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.n >= 8)) return "nur " + (z.n || 0) + " Bewohner";
                            if (!(z.kinder >= 1 && z.erwachsene >= 1)) return "der Fächer trägt nicht Kinder und Erwachsene (" + z.kinder + " · " + z.erwachsene + ") — die Wahl nach dem Alter ist ungeprüft";
                            if (!(z.spielAbend > 0)) return "am Abend spielt niemand (Soll der Welt: 0 Akte „Spiel“)";
                            if (!(Math.abs(z.spielKindAbend - z.spielErwAbend) > 0.05)) return "die Wahl folgt dem Alter nicht: Kinder " + z.spielKindAbend + " · Erwachsene " + z.spielErwAbend;
                            return null;
                        },
                        taeter: "koerper-core.js:5353 TAGES_GESETZ.rollen.kind (Spiel nur im Werk 9–16 Uhr; am Abend und für jeden Erwachsenen kein Spiel)",
                        nicht: "kein Spiel am Abend",
                        leser: "stamm/siedlung-bewohner.js:2237 _bewohnerSoll → koerper-core.js:5630 tagesPlan: der Akt „spiel“ ist das Werk des Kinds (w0 … w1, :5660), der Abend ist für jede Rolle „abend“",
                        gruen: { werte: { spielProzent: 9 }, zeuge: { n: 27, kinder: 6, erwachsene: 21, spielAbend: 19, spielKindAbend: 0.3, spielErwAbend: 0.05 } },
                        attrappen: [
                            { name: "9 % aus einer Tafel ohne Akt der Welt", roh: { werte: { spielProzent: 9 }, zeuge: { n: 27, kinder: 6, erwachsene: 21, spielAbend: 0 } } },
                            { name: "9 % ohne Kinder im Fächer", roh: { werte: { spielProzent: 9 }, zeuge: { n: 27, kinder: 0, erwachsene: 27, spielAbend: 19 } } },
                            { name: "Kinder und Erwachsene spielen gleich (die Wahl folgt dem Alter nicht)", roh: { werte: { spielProzent: 9 }, zeuge: { n: 27, kinder: 6, erwachsene: 21, spielAbend: 19, spielKindAbend: 0.09, spielErwAbend: 0.09 } } },
                        ],
                    },
                    2: {
                        u: {},
                        soll: [K.soll(SPORT, 2, "Partien bei Regen ↓ ≥ 50 %", { key: "regenRueckgangProzent", einheit: "%" }), K.soll(SPORT, 2, "Eis nur < 0 °C", { key: "eisMaxC", einheit: "°C" })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.partienSonne > 0)) return "keine Partie unter Sonne — ein Rückgang über nichts";
                            if (!(z.regen >= 0.3) || !(z.sonne === 0)) return "der Regen am Ort stand nicht (rain Sonne " + z.sonne + " → Regen " + z.regen + ")";
                            if (!(z.gegenPartien >= z.partienSonne)) return "der Gegenlauf fehlt: die Sonne zurück, und " + z.gegenPartien + " von " + z.partienSonne + " Partien kehren wieder";
                            if (!(z.eis > 0)) return "kein Eis in der Welt — „nur unter 0 °C“ über einer leeren Menge";
                            return null;
                        },
                        taeter: "koerper-core.js:5630 tagesPlan (kein Eis, keine Temperatur)",
                        nicht: "kein Eis",
                        leser: "koerper-core.js:5630 tagesPlan: der Regen treibt das Spiel ins Haus (TAGES_GESETZ.regen :5399, `aus`), kein Akt Eis und kein Leser der Temperatur (stamm/bild-himmel.js:3063 _temperaturAt)",
                        gruen: { werte: { regenRueckgangProzent: 80, eisMaxC: -2 }, zeuge: { partienSonne: 10, regen: 0.6, sonne: 0, gegenPartien: 10, eis: 4 } },
                        attrappen: [
                            { name: "Rückgang 80 % ohne Partie", roh: { werte: { regenRueckgangProzent: 80, eisMaxC: -2 }, zeuge: { partienSonne: 0, regen: 0.6, sonne: 0, gegenPartien: 0, eis: 4 } } },
                            { name: "die Sonne kehrt zurück, die Partien nicht", roh: { werte: { regenRueckgangProzent: 80, eisMaxC: -2 }, zeuge: { partienSonne: 10, regen: 0.6, sonne: 0, gegenPartien: 2, eis: 4 } } },
                            { name: "Eis −2 °C ohne Eis in der Welt", roh: { werte: { regenRueckgangProzent: 80, eisMaxC: -2 }, zeuge: { partienSonne: 10, regen: 0.6, sonne: 0, gegenPartien: 10, eis: 0 } } },
                        ],
                    },
                    3: {
                        u: {},
                        soll: [K.soll(SPORT, 3, "200 Saaten", { key: "saaten", rel: "≥", zahl: 200 }), K.soll(SPORT, 3, "Biom ↔ Sportart Cramérs V ≥ 0,3", { key: "cramersV" })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.saaten >= 200)) return "nur " + (z.saaten || 0) + " Pläne der Zellen";
                            if (!(z.sportarten >= 2)) return "weniger als zwei Sportarten in der Welt (" + (z.sportarten || 0) + ")";
                            if (!(z.biome >= 2)) return "nur ein Boden unter den Zellen";
                            if (!(z.gegenV < 0.1)) return "der Gegenlauf fehlt: die Böden vertauscht, und V bleibt";
                            return null;
                        },
                        taeter: "fachwerk-core.js DORF (keine Sportstätte, kein Boden)",
                        nicht: "keine Sportart",
                        leser: "fachwerk-core.js:5183 DORF(DP) liest Same, Größe, Epoche; keine Sportstätte und kein Boden der Zelle",
                        gruen: { werte: { saaten: 200, cramersV: 0.41 }, zeuge: { saaten: 200, sportarten: 5, biome: 6, gegenV: 0.04 } },
                        attrappen: [
                            { name: "V 0,41 aus einer Tabelle", roh: { werte: { saaten: 200, cramersV: 0.41 }, zeuge: { saaten: 200, sportarten: 0, biome: 6 } } },
                            { name: "V bleibt mit vertauschten Böden (kein Gesetz des Bodens)", roh: { werte: { saaten: 200, cramersV: 0.41 }, zeuge: { saaten: 200, sportarten: 5, biome: 6, gegenV: 0.38 } } },
                        ],
                    },
                    4: {
                        u: {},
                        soll: [K.soll(SPORT, 4, "Verkehr ≥ + 30 % auf Stadion-Trassen", { key: "verkehrPlusProzent", einheit: "%" })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.stadien >= 1)) return "kein Stadion in der Welt";
                            if (!(z.kontrolle > 0)) return "kein Verkehr am Kontroll-Tag gemessen (der Gegenlauf fehlt)";
                            return null;
                        },
                        taeter: "fachwerk-core.js DORF (kein Stadion), stamm/siedlung-verkehr.js (kein Spieltag)",
                        nicht: "kein Stadion",
                        leser: "stamm/siedlung-verkehr.js:27 _verkehrAnlegen(S) legt die Wagen nur in der Stadt ihres Plans an (PFLICHT-OFFEN C); kein Spieltag und kein Stadion als Ziel",
                        gruen: { werte: { verkehrPlusProzent: 42 }, zeuge: { stadien: 1, kontrolle: 18 } },
                        attrappen: [{ name: "+42 % ohne Stadion", roh: { werte: { verkehrPlusProzent: 42 }, zeuge: { stadien: 0 } } }],
                    },
                    5: {
                        u: {},
                        soll: [K.soll(SPORT, 5, "je Saat ≥ 1 Art mit Lebenslauf", { key: "artenJeSaat" }), K.soll(SPORT, 5, "plausibel ≥ 70 %", { key: "plausibelProzent", einheit: "%" })],
                        auge: { pose: "Third über dem Dorfplatz (heute ohne Sportstätte)", vorbild: "Prüfer-Satz (R11): der Lebenslauf einer Sportart (Entstehen, Wandern, Sterben) gegen die Geschichte realer Sportarten, ≥ 70 % plausibel" },
                        taeter: "fachwerk-core.js DORF / koerper-core.js tagesPlan (keine Sportart)",
                        nicht: "keine Sportart",
                        leser: "koerper-core.js:5630 tagesPlan kennt kein Spiel; fachwerk-core.js:5183 DORF keine Sportstätte",
                        gruen: { werte: { artenJeSaat: 2, plausibelProzent: 75 }, zeuge: { saaten: 16 } },
                        attrappen: [{ name: "zwei Arten ohne Welt", roh: { werte: { artenJeSaat: 2, plausibelProzent: 75 }, zeuge: {} } }],
                    },
                    6: {
                        u: {},
                        soll: [sollWort(SPORT, 6, "andere Geländesaat zeigt andere Sportkultur", { key: "sportkulturAnders", rel: ">", zahl: 0 })],
                        auge: { pose: "Third über dem Dorfplatz zweier Geländesaaten zur gleichen Stunde", vorbild: "Prüfer-Satz (R11) im Blindpaar: welche Sportkultur gehört zu welchem Gelände, stimmig" },
                        taeter: "fachwerk-core.js DORF / koerper-core.js tagesPlan (keine Sportkultur)",
                        nicht: "keine Sportkultur",
                        leser: "fachwerk-core.js:5183 DORF liest kein Gelände; koerper-core.js:5630 tagesPlan kein Spiel",
                        gruen: { werte: { sportkulturAnders: 1 }, zeuge: { saaten: 2 } },
                        attrappen: [{ name: "andere Sportkultur ohne Bild", roh: { werte: { sportkulturAnders: 1 }, zeuge: {} } }],
                    },
                },
            },

            // ════════ mensch.kopplung.leben — Leben und Welt formen sich ════════
            // S1 der Tag des Dorfs unter Sonne → Regen → Sonne (der Gegenlauf), je Stand der Anteil draußen NACH dem Sprung der Uhr (der Wirt
            // stellt jeden an das Soll seiner Stunde, `_bewohnerSoll` mit dem Regen des EINEN Wetter-Felds) — der Stand `b.drinnen`, den der
            // Spieler sieht, nie nur das Soll; S3 die Familie je Haus (die Liste, Samen „Plan:Haus:Person“) gegen das Volumen des Hauses und den
            // Plan 20 Jahre später; S2/S4–S6 fragen die Welt, ob sie Not, Gedächtnis und Wendepunkte trägt.
            [LEBEN]: {
                sek: 20,
                dorf: true,
                mutiert: true,
                faecher: true,
                pfad: PFAD_DORF,
                mess: async function (H, U, M) {
                    const S = (fn, a) => H.seite("return await (" + String(fn) + ")(r, " + JSON.stringify(a || {}) + ");");
                    const leben = async (r, a) => {
                        const st = r.state, A = AnazhRealm;
                        const D = r._bewohnerSiedlungen.get(window.__dorfDerProbe);
                        if (!D || !D.liste) return { fehler: "das Dorf der Probe fehlt" };
                        const Lb = D.liste, n = Lb.length, alt = { w: st.weather, tod: st.timeOfDay };
                        const takt = async (k) => { for (let i = 0; i < k; i++) await window.__seitenTakt(); };
                        const sprung = async (h) => { r.setTimeOfDay(((h + 6) % 24) / 24, "regler"); await takt(1); r.setTimeOfDay(h / 24, "regler"); await takt(a.takte); };
                        const wetter = (w) => { if (window.__wetterSetzen(w) !== w) throw new Error("das Wetter " + w + " gilt nicht"); };
                        const pearson = (x, y) => { const m = x.length; if (m < 3) return null; const mx = x.reduce((s, v) => s + v, 0) / m, my = y.reduce((s, v) => s + v, 0) / m; let sxy = 0, sxx = 0, syy = 0; for (let i = 0; i < m; i++) { sxy += (x[i] - mx) * (y[i] - my); sxx += (x[i] - mx) ** 2; syy += (y[i] - my) ** 2; } return sxx > 0 && syy > 0 ? sxy / Math.sqrt(sxx * syy) : null; };
                        const stand = () => { const h = st.timeOfDay * 24; return { ist: Lb.filter((b) => !b.drinnen).length / n, soll: Lb.filter((b) => !r._bewohnerSoll(b, h).drinnen).length / n, rain: r._weatherFieldFor().rain }; };
                        const aus = { n };
                        try {
                            wetter("sunny"); await sprung(12); aus.sonne = stand();
                            wetter("rainy"); await sprung(12); aus.regen = stand();
                            wetter("sunny"); await sprung(12); aus.gegen = stand();
                        } catch (e) { aus.fehler1 = String((e && e.message) || e).slice(0, 200); }
                        finally { window.__wetterSetzen(alt.w); r.setTimeOfDay(alt.tod, "regler"); }
                        const fam = {};
                        for (const b of Lb) { const h = Number(String(b.seed).split(":")[1]); fam[h] = (fam[h] || 0) + 1; }
                        const vol = (s) => (s && s.ov ? (s.ov.W || 0) * (s.ov.D || 0) * Math.max(1, s.ov.storeys || 1) : 0);
                        const xs = [], ys = [];
                        D.plan.slots.forEach((s, h) => { if (String(s.rolle || "wohnhaus") === "wohnhaus" || fam[h]) { xs.push(fam[h] || 0); ys.push(vol(s)); } });
                        const E = A.Gesetz("fachwerk:epocheImJahr");
                        const nH = ((st.worldMeta.settlementCells || {})[window.__dorfDerProbe] || {}).nH || D.plan.slots.length;
                        const P0 = await r._foundryRequestSettlement({ seed: D.plan.seed, nH });
                        const P0b = await r._foundryRequestSettlement({ seed: D.plan.seed, nH });
                        const ph = (P) => (P ? JSON.stringify(P.slots.map((x) => [x.seed, x.ov && x.ov.W, x.ov && x.ov.D, x.ov && x.ov.storeys])) : null);
                        const P20 = await r._foundryRequestSettlement(D.plan.chronik ? { seed: D.plan.seed, nH, epoche: E(D.plan.jahr), jahr: D.plan.jahr + 20 } : { seed: D.plan.seed, nH, jahr: D.plan.jahr + 20 });
                        let anbau = 0, leer = 0, verfall = 0;
                        const da = [], dv = [];
                        if (P0 && P20) P0.slots.forEach((s, h) => { const t = P20.slots.find((q) => (q.seed >>> 0) === (s.seed >>> 0)); const v0 = vol(s), v1 = t ? vol(t) : 0; if (v1 > v0) anbau++; if (!fam[h]) { leer++; if (v1 < v0) verfall++; } da.push(fam[h] || 0); dv.push(v1 - v0); });
                        aus.s3 = { haeuser: xs.length, r: pearson(xs, ys), famStreuung: Math.max(...xs) - Math.min(...xs), sprung: !!(P0 && P20), gegenGleich: !!P0 && ph(P0) === ph(P0b), jahr20: D.plan.jahr + 20, chronik: !!D.plan.chronik, anbau, leer, verfall, rAnbau: pearson(da, dv) };
                        const ops = Object.keys(r.dslEffects || {});
                        aus.ops = { not: ops.filter((k) => /ernte|duerre|hunger|seuche|krieg|pest|missernte/i.test(k)), alle: ops.length };
                        const GED = /erinner|gedaecht|gedenk|trauer|chronik|lebenslauf|name/i;
                        aus.gedaechtnis = Lb.filter((b) => Object.keys(b).some((k) => GED.test(k))).length;
                        aus.namen = Lb.filter((b) => typeof b.name === "string" && b.name).length;
                        const bins = new Set(Lb.map((b) => Math.floor((b.genom && b.genom.alter) * 10)));
                        aus.kohorten = bins.size;
                        return aus;
                    };
                    const d = M.dorfDa();
                    const m = await S(leben, { takte: 3 });
                    if (!m || m.fehler) throw new Error("das Leben: " + (m && m.fehler));
                    const aus = M.teil || {};
                    aus[1] = m.fehler1 || !m.sonne ? { werte: {}, nicht: "der Wechsel Sonne ↔ Regen warf: " + m.fehler1 } : {
                        werte: { draussenSinkt: m.sonne.ist - m.regen.ist, draussenSonne: m.sonne.ist, draussenRegen: m.regen.ist, draussenGegen: m.gegen.ist, sollSonne: m.sonne.soll, sollRegen: m.regen.soll },
                        zeuge: { n: m.n, sonne: m.sonne.rain, regen: m.regen.rain, istSonne: m.sonne.ist, istRegen: m.regen.ist, istGegen: m.gegen.ist },
                    };
                    const ops = m.ops.not.length ? m.ops.not.join("+") : "keiner";
                    // S2 AM FÄCHER (M4): die Bewohner des Dorfs × die Stunden des Tags, je Adresse der Export, den der Tag liest (_bewohnerSoll →
                    // koerper tagesPlan) und das Heim des Bewohners; die Zeit „Missernte“ ist die Ursache — sie setzt die Station über den EINEN
                    // Kanal der Taten (dslEffects), oder die Adresse nennt beim Namen, was fehlt. Ohne Missernte misst der Fächer die Umzugs-Welle
                    // (das Heim wechselt über den Tag) und den Tag selbst — der Gegenlauf, an dem eine Welle ohne Ursache ROT würde
                    const TAG_NOT_AN = async (r, T, a, mit) => {
                        const D = r._bewohnerSiedlungen.get(window.__dorfDerProbe);
                        const b = D && D.liste && D.liste[a.saat];
                        if (!b) return { fehlt: "der Bewohner " + a.saat + " fehlt im Dorf der Probe" };
                        if (a.zeit.not) {
                            const not = Object.keys(r.dslEffects || {}).filter((k) => /missernte|ernte|duerre|hunger|not\b/i.test(k));
                            return { fehlt: "kein Welt-Akt der Missernte: stamm/feld-dsl.js:946 dslEffects trägt " + (not.length ? not.join("+") + " (die Station kennt seine Form nicht)" : "keinen") + ", und koerper-core.js:5630 tagesPlan(same, rolle, stunde, orte, nass) liest weder Ernte noch Scheune (koerper-core.js:5844 scheuneHalter)" };
                        }
                        const z = r._bewohnerSoll(b, a.zeit.h), o = b.orte || {}, p = (q) => (q ? Math.round(q.x) + "," + Math.round(q.z) : "—");
                        return { akt: String(z.akt), drinnen: z.drinnen ? 1 : 0, heim: p(o.heim || o.tuer), same: b.same, rolle: b.rolle };
                    };
                    const nL = Math.min(40, m.n);
                    const R2 = await FAECHER((c) => H.seite(c), {
                        gesetz: { fn: TAG_NOT_AN, export: "koerper-core.js:5630 tagesPlan über stamm/siedlung-bewohner.js:2237 _bewohnerSoll(b, stunde) und das Heim b.orte.heim (stamm/siedlung-bewohner.js:960)", leser: "stamm/siedlung-bewohner.js:2209 _bewohnerSoll im Tick des Bewohners" },
                        adressen: { saaten: Array.from({ length: nL }, (_, i) => i), zeiten: [{ h: 2 }, { h: 7 }, { h: 12 }, { h: 17 }, { h: 22 }, { h: 12, not: 1 }] },
                        ms: 8000,
                        masse: {
                            bewohner: { wie: "verschieden", feld: "a.saat", nur: (a) => !a.zeit.not },
                            umzugOhne: { wie: (v, aus) => { const by = {}; for (const x of aus) (by[x.a.saat] = by[x.a.saat] || new Set()).add(x.w.heim); const L = Object.values(by); return L.length ? L.filter((q) => q.size > 1).length / L.length : null; }, feld: "heim", nur: (a) => !a.zeit.not },
                            akte: { wie: "verschieden", feld: "akt", nur: (a) => !a.zeit.not },
                            draussen: { wie: "mittel", feld: "drinnen", nur: (a) => !a.zeit.not },
                        },
                        schlecht: { feld: "drinnen", richtung: "min" },
                        pose: (a, w) => "der Bewohner " + a.saat + " (" + w.rolle + ") um " + a.zeit.h + " Uhr am Heim " + w.heim + ", Third 6 m",
                        ungemessen: ["die Frage an die Betroffenen (keine Rede-Funktion trägt ein Ereignis: stamm/siedlung-bewohner.js:2149 furchtErinnert erinnert nur Furcht vor Gewalt)"],
                    });
                    const w2l = R2.werte, mitNot = R2.fehltAn.filter((x) => x.zeit && x.zeit.not).length;
                    aus[2] = {
                        werte: { umzugOhneProzent: w2l.umzugOhne == null ? null : 100 * w2l.umzugOhne, akteDesTags: w2l.akte, notAkte: m.ops.not.length, gedaechtnisFelder: m.gedaechtnis },
                        zeuge: { betroffene: R2.je.filter((x) => x.a.zeit && x.a.zeit.not).length, befragt: 0, ohne: w2l.bewohner, gegenUmzugProzent: w2l.umzugOhne == null ? undefined : 100 * w2l.umzugOhne, akte: R2.akte },
                        nicht: "keine Missernte in der Welt (" + mitNot + " von " + nL + " Adressen „mit Missernte“ ohne Fähigkeit): " + (R2.fehlt || "Welt-Akte der Not " + ops + " (von " + m.ops.alle + ")") + " — ohne Missernte zieht " + (w2l.umzugOhne == null ? "?" : Math.round(100 * w2l.umzugOhne)) + " % der " + w2l.bewohner + " Bewohner um; " + m.gedaechtnis + " von " + m.n + " tragen ein Gedächtnis, niemand nennt ein Ereignis",
                    };
                    const s3 = m.s3;
                    aus[3] = {
                        werte: { r: s3.r, verfallProzent: s3.leer ? (100 * s3.verfall) / s3.leer : undefined, anbau: s3.anbau, rAnbau: s3.rAnbau },
                        zeuge: { haeuser: s3.haeuser, famStreuung: s3.famStreuung, sprung: s3.sprung, gegenGleich: s3.gegenGleich, anbau: s3.anbau, leer: s3.leer, jahr20: s3.jahr20, chronik: s3.chronik },
                        ...(s3.anbau > 0 ? {} : { nicht: "in 20 Jahren baut keine Familie an: der Plan des Dorfs " + (s3.chronik ? "mit" : "ohne") + " Chronik ist im Jahr " + s3.jahr20 + " derselbe (" + s3.anbau + " Häuser wuchsen, " + s3.verfall + " von " + s3.leer + " leeren verfielen) — die Leute folgen dem Haus (fachwerk-core.js:10924 leuteVon), das Haus nie der Familie" }),
                    };
                    aus[4] = { werte: { kohortenBins: m.kohorten, gedaechtnisFelder: m.gedaechtnis }, zeuge: { ereignis: false }, nicht: "kein Vulkan, keine Seuche, kein Krieg erreicht die Bewohner: keine Flucht vor einem Ereignis, kein Gedenken (" + m.gedaechtnis + " Gedächtnis-Felder), keine Kohorte über die Zeit (" + m.kohorten + " Alters-Stufen, ohne Geburt und Tod)" };
                    aus[5] = { werte: { personenBenannt: m.namen, wendepunkte: 0 }, zeuge: { wendepunkte: 0, personen: m.namen }, nicht: "keine Geschichte aus Leben: " + m.namen + " von " + m.n + " Bewohnern tragen einen Namen, die Welt kennt keinen Wendepunkt" };
                    aus[6] = { werte: { personenBenannt: m.namen, wendepunkte: 0 }, zeuge: { wendepunkte: 0, personen: m.namen }, nicht: "keine Wendepunkte und kein Planetenwechsel mit Personen (" + m.namen + " benannte Bewohner)" };
                    return { sprossen: aus };
                },
                sprossen: {
                    1: {
                        u: {},
                        soll: [K.soll(LEBEN, 1, "Anteil draußen sinkt ≥ 0,3", { key: "draussenSinkt" })],
                        zeuge: zeugeRegen,
                        zeugeText: "der Regen treibt ins Haus, die Sonne zurück holt sie heraus (Gegenlauf)",
                        taeter: "koerper-core.js tagesPlan / stamm/siedlung-bewohner.js _bewohnerSoll (der Regen des Wetter-Felds)",
                        gruen: { werte: { draussenSinkt: 0.59 }, zeuge: DORF_Z },
                        attrappen: [
                            { name: "der Anteil aus dem Soll ohne Stand (niemand ging)", roh: { werte: { draussenSinkt: 0.59 }, zeuge: { ...DORF_Z, istRegen: 0.89 } } },
                            { name: "der Gegenlauf fehlt (die Sonne holt niemanden zurück)", roh: { werte: { draussenSinkt: 0.59 }, zeuge: { ...DORF_Z, istGegen: 0.3 } } },
                            { name: "ohne Regen am Ort", roh: { werte: { draussenSinkt: 0.59 }, zeuge: { ...DORF_Z, regen: 0 } } },
                        ],
                    },
                    2: {
                        u: {},
                        soll: [
                            K.soll(LEBEN, 2, "mit Missernte ziehen ≥ 10 % der Betroffenen um", { key: "umzugProzent", einheit: "%" }),
                            sollWort(LEBEN, 2, "ändern ihren Tag", { key: "tagGeaendertProzent", rel: "≥", zahl: 10, einheit: "%" }),
                            sollWort(LEBEN, 2, "ohne Missernte keine Umzugswelle", { key: "umzugOhneProzent", rel: "<", zahl: 10, einheit: "%" }),
                            K.soll(LEBEN, 2, "Betroffene nennen das Ereignis auf Frage ≥ 0,8", { key: "nennenAnteil" }),
                        ],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.betroffene >= 10)) return "nur " + (z.betroffene || 0) + " Betroffene einer Missernte in der Welt";
                            if (!(z.befragt >= 1)) return "niemand wurde befragt";
                            if (typeof z.gegenUmzugProzent !== "number") return "der Gegenlauf ohne Missernte fehlt";
                            return null;
                        },
                        taeter: "stamm/siedlung-bewohner.js (keine Not, kein Gedächtnis eines Ereignisses)",
                        unklar: "„keine Umzugswelle“ trägt keine Zahl — Vorschlag: ohne Missernte ziehen < 10 % um (die Schwelle derselben Zeile); die Station misst so",
                        nicht: "keine Missernte, keine Not",
                        leser: "stamm/feld-dsl.js:946 dslEffects trägt keinen Welt-Akt Missernte; stamm/siedlung-bewohner.js:2149 furchtErinnert: der Bewohner erinnert nur Furcht vor Gewalt, kein Ereignis, keinen Umzug",
                        gruen: { werte: { umzugProzent: 14, tagGeaendertProzent: 14, umzugOhneProzent: 1, nennenAnteil: 0.86 }, zeuge: { betroffene: 40, befragt: 40, gegenUmzugProzent: 1 } },
                        attrappen: [{ name: "Umzug 14 % ohne Betroffene der Welt", roh: { werte: { umzugProzent: 14, tagGeaendertProzent: 14, umzugOhneProzent: 1, nennenAnteil: 0.86 }, zeuge: { betroffene: 0 } } }],
                    },
                    3: {
                        u: {},
                        soll: [K.soll(LEBEN, 3, "Bauten ↔ Familiengröße r ≥ 0,5", { key: "r" }), sollWort(LEBEN, 3, "verlassene Häuser verfallen", { key: "verfallProzent", rel: ">", zahl: 0, einheit: "%" })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.haeuser >= 5)) return "nur " + (z.haeuser || 0) + " Häuser mit Familie";
                            if (!(z.famStreuung > 0)) return "alle Familien gleich groß (keine Ursache)";
                            if (z.sprung !== true) return "der Sprung 20 J fehlt (kein Plan 20 Jahre später)";
                            if (!(z.anbau >= 1)) return "in 20 Jahren baut keine Familie an (" + (z.anbau || 0) + " Häuser wuchsen) — das Haus folgt der Familie nicht";
                            if (!(z.leer >= 1)) return "kein verlassenes Haus im Dorf, an dem Verfall zu sehen wäre";
                            if (z.gegenGleich !== true) return "der Gegenlauf fehlt: ohne Sprung (dasselbe Jahr zweimal) ist der Plan nicht gleich";
                            return null;
                        },
                        taeter: "fachwerk-core.js DORF (die Familie folgt dem Haus — leuteVon —, nie das Haus der Familie)",
                        leser: "fachwerk-core.js:10924 leuteVon(hp): die Leute eines Hauses aus seinem Bau; kein Anbau aus der Familie, kein Verfall leerer Häuser (stamm/siedlung-satz.js:788 _werkAlter altert ohne Bewohner)",
                        gruen: { werte: { r: 0.62, verfallProzent: 40 }, zeuge: { haeuser: 8, famStreuung: 3, sprung: true, gegenGleich: true, anbau: 3, leer: 2 } },
                        attrappen: [
                            { name: "r aus dem statischen Plan ohne Sprung (das Haus macht die Familie)", roh: { werte: { r: 0.62, verfallProzent: 40 }, zeuge: { haeuser: 8, famStreuung: 3, sprung: true, gegenGleich: true, anbau: 0, leer: 2 } } },
                            { name: "ohne Häuser der Welt", roh: { werte: { r: 0.62, verfallProzent: 40 }, zeuge: {} } },
                        ],
                    },
                    4: {
                        u: {},
                        soll: [K.soll(LEBEN, 4, "Gedenken nach 50 J", { key: "gedenkenJahre", rel: "≥", zahl: 50, einheit: "J" }), sollWort(LEBEN, 4, "alle drei messbar", { key: "messbar", rel: "≥", zahl: 3 })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (z.ereignis !== true) return "kein Ereignis (Vulkan, Seuche, Krieg) erreichte die Bewohner";
                            if (!(z.flucht > 0)) return "niemand floh";
                            if (typeof z.gegenDelle !== "number") return "der Gegenlauf ohne Ereignis fehlt";
                            return null;
                        },
                        taeter: "stamm/siedlung-bewohner.js (kein Ereignis, kein Gedenken, keine Kohorte)",
                        nicht: "kein Ereignis über Generationen",
                        leser: "stamm/siedlung-bewohner.js:2149 furchtErinnert: die Flucht folgt nur der Furcht vor Gewalt am Ort; keine Geburt, kein Tod, kein Gedenken über Jahre",
                        gruen: { werte: { gedenkenJahre: 60, messbar: 3 }, zeuge: { ereignis: true, flucht: 12, gegenDelle: 0 } },
                        attrappen: [{ name: "drei Messungen ohne Ereignis", roh: { werte: { gedenkenJahre: 60, messbar: 3 }, zeuge: { ereignis: false } } }],
                    },
                    5: {
                        u: {},
                        soll: [K.soll(LEBEN, 5, "Wendepunkte auf benennbare Personen ≥ 0,8", { key: "personenAnteil" }), K.soll(LEBEN, 5, "verschiebt sich in ≥ 70 %", { key: "gegenProzent", einheit: "%" })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.wendepunkte >= 1)) return "kein Wendepunkt der Geschichte in der Welt";
                            if (!(z.personen >= 1)) return "keine benennbare Person";
                            if (z.gegen !== true) return "der Gegenlauf (Person entfernt) fehlt";
                            return null;
                        },
                        taeter: "stamm/siedlung-bewohner.js (keine Geschichte aus Personen)",
                        nicht: "keine Geschichte aus Leben",
                        leser: "stamm/siedlung-bewohner.js:377 _bewohnerGenome gibt Leib und Farbe, keinen Namen, keinen Lebenslauf; kein Leser einer Geschichte",
                        gruen: { werte: { personenAnteil: 0.85, gegenProzent: 75 }, zeuge: { wendepunkte: 20, personen: 17, gegen: true } },
                        attrappen: [{ name: "Wendepunkte aus einem Text", roh: { werte: { personenAnteil: 0.85, gegenProzent: 75 }, zeuge: { wendepunkte: 0 } } }],
                    },
                    6: {
                        u: {},
                        soll: [K.soll(LEBEN, 6, "andere Personen → andere Wendepunkte ≥ 70 %", { key: "andereProzent", einheit: "%" }), K.soll(LEBEN, 6, "dieselben Personen → dieselben Wendepunkte ≥ 95 %", { key: "dieselbenProzent", einheit: "%" })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.wendepunkte >= 1)) return "kein Wendepunkt in der Welt";
                            if (!(z.personen >= 1)) return "keine Person";
                            if (z.gegen !== true) return "der Gegenlauf (dieselben Personen) fehlt";
                            return null;
                        },
                        taeter: "stamm/siedlung-bewohner.js (keine Wendepunkte)",
                        nicht: "keine Wendepunkte",
                        leser: "stamm/siedlung-bewohner.js:377 _bewohnerGenome trägt keinen Lebenslauf je Bewohner, kein Planetenwechsel mit Personen",
                        gruen: { werte: { andereProzent: 80, dieselbenProzent: 98 }, zeuge: { wendepunkte: 30, personen: 20, gegen: true } },
                        attrappen: [{ name: "Prozente ohne Wendepunkt", roh: { werte: { andereProzent: 80, dieselbenProzent: 98 }, zeuge: { wendepunkte: 0 } } }],
                    },
                },
            },

            // ════════ mensch.kopplung.kultur — Kultur folgt der Welt ════════
            // 32 Zellen der Welt: ihr Plan (der Baustoff der Häuser: `ov.stil` stein · klinker → Stein, huette → Holz, alt → Fachwerk/Lehm;
            // das Dach `ov.pitchDeg`) gegen den Boden der Zelle (Fels, Wald, Bodenklasse) und das Klima des Planeten am Anker (planet-ort);
            // die Mutation: Regen über `__wetterSetzen` und Schwerkraft 2 g über den Welt-Akt — der Plan derselben Zelle vor ↔ nach;
            // der Tag der Bewohner über 24 Stunden (ein Fest?), die Rollen der Pläne (heiliger Ort). 1 000 Orte zählt die Probe an den Zellen.
            [KULTUR]: {
                // DER DECKEL TRÄGT DAS PROGRAMM (pm-front-f1, Radeon c445936d: „der Deckel der Leiter riss nach 20,012 s vor dem Wert der
                // Sprosse“, GTX f68dbf09 ebenso): die Leiter rechnet in EINEM Seiten-Eval 1 000 Zellen und 116 Pläne der Gießerei (32 +
                // 32 Gegenlauf + 32 Regen + 20 unter 2 g) — M.teil trägt dort nichts, 20 s reichten nie; kein Soll ändert sich
                sek: 60,
                dorf: true,
                mutiert: true,
                faecher: true,
                pfad: PFAD_DORF.concat(["planet-core.js", "voxel-worker.js", "stamm/gelaende-chunks.js", "stamm/gelaende-boden.js", "stamm/vegetation-wiese.js", "stamm/kreatur-leben.js"]),
                ungefahren: "die Hausbilder der 32 Zellen (S1), die 1 000 Ortsbilder (S6) und die 20 Stadtbilder unter 2 g (S7) schießt nur das Gerät",
                mess: async function (H, U, M) {
                    const S = (fn, a) => H.seite("return await (" + String(fn) + ")(r, " + JSON.stringify(a || {}) + ");");
                    const kultur = async (r, a) => {
                        const st = r.state, alt = { w: st.weather, g: st.gravity, halt: st.weatherEffectTime };
                        const zellen = [];
                        for (let R = 0; R <= 26 && zellen.length < 1000; R++) for (let cx = -R; cx <= R; cx++) for (let cz = -R; cz <= R; cz++) { if (Math.max(Math.abs(cx), Math.abs(cz)) !== R) continue; const c = r._autoSettlementCellInfo(cx, cz); if (c) zellen.push(c); }
                        const aus = { orte: zellen.length };
                        // S1, S2 und S7 misst der Fächer (unten) an denselben 32 Zellen; die Seite trägt nur die Zellen, den Anker und den Tag
                        const Z = zellen.slice(0, 32);
                        await r._fadenQuelle();
                        const An = await r._planetAnker();
                        const O = await r._planetAuftrag({ type: "planet-ort", samen: r._planetSamen(), breite: (An.breite * 180) / Math.PI, laenge: (An.laenge * 180) / Math.PI, zeitMa: 0 });
                        const nied = O && O.delta && O.delta.wetter ? O.delta.wetter.regenQuote : null;
                        aus.s2 = { niederschlag: nied, zellen: Z.map((c) => ({ seed: c.seed, nH: c.nH, x: c.x, z: c.z })), wetter: alt.w, g: alt.g };
                        const D = window.__dorfDerProbe && r._bewohnerSiedlungen.get(window.__dorfDerProbe);
                        let feste = 0, akte = new Set();
                        if (D && D.liste) for (let h = 0; h < 24; h += 0.5) for (const b of D.liste) { const z = r._bewohnerSoll(b, h); akte.add(String(z.akt)); if (/fest|feier|markttag|kirchweih|ernte/i.test(String(z.akt))) feste++; }
                        aus.s3 = { feste, akte: [...akte].join("+"), dorf: !!(D && D.liste) };
                        return aus;
                    };
                    const m = await S(kultur, {});
                    if (!m || m.fehler) throw new Error("die Kultur: " + (m && m.fehler));
                    const aus = M.teil || {};
                    const s2 = m.s2;
                    const nH2 = {}, lage = {};
                    for (const c of s2.zellen) { nH2[c.seed] = c.nH; lage[c.seed] = [c.x, c.z]; }
                    // S1 AM FÄCHER (M4): je Zelle der Plan der Gießerei (der Export, den der Ort baut) und der Boden der Zelle (Fels, Wald —
                    // dieselben Leser, die Gelände und Wiese tragen); passend heißt: der Baustoff des Plans ist der Stoff seines Bodens. Die
                    // Region aus dem Hausbild ist R11 (ein Prüfer liest) — ungemessen bis zum Gerät und zum Panel
                    const BAU_AN = async (r, T, a, mit) => {
                        const P = await r._foundryRequestSettlement({ seed: a.saat, nH: mit.nH[a.saat] });
                        if (!P || !P.slots || !P.slots.length) return { fehlt: "die Gießerei gibt der Saat keinen Plan (fachwerk-core.js, _foundryRequestSettlement)" };
                        const [x, z] = mit.lage[a.saat];
                        const fels = r._rockExposureAt(x, z), wald = r._forestStandDensity(x, z);
                        const soll = fels >= 0.3 ? "stein" : wald >= 0.5 ? "holz" : "lehm";
                        const k = {};
                        for (const q of P.slots) { const w = mit.STOFF[(q.ov && q.ov.stil) || ""] || "lehm"; k[w] = (k[w] || 0) + 1; }
                        const ist = Object.keys(k).sort((p, q) => k[q] - k[p])[0];
                        const t = JSON.stringify(P.slots.map((x) => [x.kultur, x.x, x.z, x.ov && x.ov.W, x.ov && x.ov.D, x.ov && x.ov.storeys, x.ov && x.ov.pitchDeg, x.ov && x.ov.stil]));
                        let h = 0;
                        for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) | 0;
                        return { ist, soll, passend: ist === soll ? 1 : 0, fels, wald, heilig: P.slots.some((x) => /kirche|kapelle|tempel|schrein|kloster/i.test(String(x.rolle || ""))) ? 1 : 0, hash: h, stoff: { [ist]: 1 } };
                    };
                    const R1 = await FAECHER((c) => H.seite(c), {
                        gesetz: { fn: BAU_AN, export: "fachwerk-core.js:2762 bauRezept über _foundryRequestSettlement({seed, nH}) — der Stil (ov.stil) der Slots", leser: "fachwerk-core.js:5192 region = rnd() des Samens (der Plan, den der Ort baut); Boden: _rockExposureAt · _forestStandDensity der Zelle" },
                        adressen: { saaten: s2.zellen.map((c) => c.seed) },
                        mit: { nH: nH2, lage, STOFF: { stein: "stein", klinker: "stein", huette: "holz", alt: "lehm", glas: "glas", modern: "glas" } },
                        ms: 15000,
                        masse: {
                            saaten: { wie: "verschieden", feld: "a.saat" },
                            passend: { wie: "anteil", feld: "passend" },
                            stoffe: { wie: "zaehle", feld: "stoff" },
                            sollStoffe: { wie: "verschieden", feld: "soll" },
                            heilig: { wie: "summe", feld: "heilig" },
                        },
                        schlecht: { feld: "passend", richtung: "min" },
                        pose: (a, w) => "das Haus der Zelle der Saat " + a.saat + " (Plan " + w.ist + ", Boden " + w.soll + "), Third 12 m vor der Traufe",
                        ungemessen: ["die Region aus dem Hausbild der 32 Zellen (R11 Panel, am Gerät)"],
                    });
                    const w1 = R1.werte, hashVor = {};
                    for (const x of R1.je) hashVor[x.a.saat] = x.w.hash;
                    aus[1] = {
                        werte: { saaten: w1.saaten, passendProzent: w1.passend == null ? null : 100 * w1.passend },
                        zeuge: { saaten: w1.saaten, stoffe: JSON.stringify(w1.stoffe), bodenArten: w1.sollStoffe, akte: R1.akte },
                        auge: await M.auge("mensch-kultur-s1", { ort: "genesis" }, {}),
                    };
                    // S2 AM FÄCHER (M4): der Niederschlag ist der EINE Wetter-Kanal der Welt (window.__wetterSetzen → _weatherFieldFor().rain, den
                    // stamm/siedlung-bewohner.js:2241 und stamm/wasser-hydro.js:164 lesen); je Zelle der Plan der Gießerei unter Sonne, Regen und
                    // Sonne als Gegenlauf. Liest der Plan den Regen, steigt die Dach-Neigung mit ihm (r) und der Plan ändert sich (Mutation); liest
                    // er ihn nicht, ist r ≈ 0 und die Mutation 0 % — geurteilt, nie geraten
                    const DACH_AN = async (r, T, a, mit) => {
                        if (r.state.weather !== a.zeit.w && window.__wetterSetzen(a.zeit.w) !== a.zeit.w) return { fehlt: "das Wetter " + a.zeit.w + " gilt nicht (__wetterSetzen)" };
                        const P = await r._foundryRequestSettlement({ seed: a.saat, nH: mit.nH[a.saat] });
                        if (!P || !P.slots || !P.slots.length) return { fehlt: "die Gießerei gibt der Saat keinen Plan (fachwerk-core.js, _foundryRequestSettlement)" };
                        const t = JSON.stringify(P.slots.map((x) => [x.kultur, x.x, x.z, x.ov && x.ov.W, x.ov && x.ov.D, x.ov && x.ov.storeys, x.ov && x.ov.pitchDeg, x.ov && x.ov.stil]));
                        let h = 0;
                        for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) | 0;
                        return { dach: P.slots.reduce((q, x) => q + ((x.ov && x.ov.pitchDeg) || 0), 0) / P.slots.length, regen: r._weatherFieldFor().rain, hash: h };
                    };
                    const pearsonPaare = (v) => {
                        const p = v.filter((q) => Array.isArray(q) && q.every((x) => typeof x === "number" && Number.isFinite(x)));
                        if (p.length < 3) return null;
                        const mx = p.reduce((q, x) => q + x[0], 0) / p.length, my = p.reduce((q, x) => q + x[1], 0) / p.length;
                        let sxy = 0, sxx = 0, syy = 0;
                        for (const [x, y] of p) { sxy += (x - mx) * (y - my); sxx += (x - mx) ** 2; syy += (y - my) ** 2; }
                        return sxx > 0 && syy > 0 ? sxy / Math.sqrt(sxx * syy) : sxx > 0 ? 0 : null;
                    };
                    const paarJeSaat = (aus, w1, w2) => {
                        const by = {};
                        for (const x of aus) (by[x.a.saat] = by[x.a.saat] || {})[x.a.zeit.k] = x.w.hash;
                        const p = Object.values(by).filter((o) => o[w1] != null && o[w2] != null);
                        return { paare: p.length, anders: p.filter((o) => o[w1] !== o[w2]).length };
                    };
                    let R2;
                    try {
                        R2 = await FAECHER((c) => H.seite(c), {
                            gesetz: { fn: DACH_AN, export: "fachwerk-core.js:2762 bauRezept über _foundryRequestSettlement({seed, nH}) — die Dach-Neigung ov.pitchDeg der Slots", leser: "stamm/siedlung-bewohner.js:2241 _weatherFieldFor().rain (der Regen, den der Tag liest)" },
                            adressen: { saaten: s2.zellen.map((c) => c.seed), zeiten: [{ k: "sonne", w: "sunny" }, { k: "regen", w: "rainy" }, { k: "gegen", w: "sunny" }] },
                            mit: { nH: nH2 },
                            ms: 30000,
                            masse: {
                                orte: { wie: "verschieden", feld: "a.saat" },
                                r: { wie: pearsonPaare, x: "regen", y: "dach", nur: (a) => a.zeit.k !== "gegen" },
                                regenSonne: { wie: "max", feld: "regen", nur: (a) => a.zeit.k === "sonne" },
                                regenRegen: { wie: "min", feld: "regen", nur: (a) => a.zeit.k === "regen" },
                                dachSonne: { wie: "mittel", feld: "dach", nur: (a) => a.zeit.k === "sonne" },
                                dachRegen: { wie: "mittel", feld: "dach", nur: (a) => a.zeit.k === "regen" },
                                mutation: { wie: (v, aus) => paarJeSaat(aus, "sonne", "regen"), feld: "hash" },
                                gegen: { wie: (v, aus) => paarJeSaat(aus, "sonne", "gegen"), feld: "hash" },
                            },
                            schlecht: { feld: "dach", richtung: "min" },
                            pose: (a, w) => "die Zelle der Saat " + a.saat + " unter " + a.zeit.w + ", Third 40 m über dem Dorfplatz — Dach " + (+w.dach).toFixed(1) + "°",
                            ungemessen: ["das Dachbild der 32 Zellen unter Sonne ↔ Regen (am Gerät)"],
                        });
                    } finally {
                        await H.seite("window.__wetterSetzen(" + JSON.stringify(s2.wetter) + "); return 1;");
                    }
                    const w2 = R2.werte;
                    const mut = w2.mutation || { paare: 0, anders: 0 }, geg = w2.gegen || { paare: 0, anders: 0 };
                    aus[2] = {
                        werte: { r: w2.r, mutationProzent: mut.paare ? (100 * mut.anders) / mut.paare : null, dachSonneGrad: w2.dachSonne, dachRegenGrad: w2.dachRegen, niederschlagAnker: s2.niederschlag },
                        zeuge: { orte: w2.orte, niederschlagStreuung: w2.regenRegen != null && w2.regenSonne != null ? w2.regenRegen - w2.regenSonne : 0, mutationen: mut.paare, gegenGleich: geg.paare - geg.anders, akte: R2.akte },
                    };
                    const s3 = m.s3;
                    aus[3] = { werte: { feste: s3.feste }, zeuge: { feste: s3.feste, ereignisse: 0 }, nicht: "kein Fest und kein Kalender: der Tag kennt " + s3.akte + " (koerper-core.js:5630 tagesPlan), kein Ereignis der Saat am Himmel oder in der Ernte" };
                    const s4 = { heilig: w1.heilig, orte: R1.gemessen };
                    aus[4] = { werte: { heiligeOrte: s4.heilig, orte: s4.orte }, zeuge: { verschoben: false, orte: s4.orte }, nicht: "kein Gebirge verschiebbar und keine Sprachgrenze am Gelände: " + s4.heilig + " von " + s4.orte + " Zellen tragen einen heiligen Bau aus der Tafel ihres Samens, nie aus dem Gelände" };
                    aus[5] = { werte: { heiligeOrte: s4.heilig }, zeuge: { eingriff: false }, nicht: "keine Kaskade Vulkan → Kultur: der Plan liest kein Gelände und keinen Ausbruch (fachwerk-core.js:5183 DORF), kein Mythos, keine Sprachgrenze" };
                    // S6 AM FÄCHER (M4): die Zellen im Umkreis von 26 Zellen um den Ursprung, je Adresse der Ort, den die Welt streut
                    // (_autoSettlementCellInfo) — „1 000 Orte“ ist die Zahl-Hälfte; Klima, Gestein und Epoche aus dem Bild liest ein Prüfer (R11)
                    const ORT6_AN = async (r, T, a) => {
                        const c = r._autoSettlementCellInfo(a.ort[0], a.ort[1]);
                        return { da: c ? 1 : 0, nH: c ? c.nH || 0 : 0 };
                    };
                    const orte6 = [];
                    for (let cx = -26; cx <= 26; cx++) for (let cz = -26; cz <= 26; cz++) orte6.push([cx, cz]);
                    const R6 = await FAECHER((c) => H.seite(c), {
                        gesetz: { fn: ORT6_AN, export: "stamm/siedlung-ort.js:1427 _autoSettlementCellInfo(cx, cz) — der Ort der Zelle", leser: "stamm/siedlung-ort.js:1427 beim Streuen der Orte (worldMeta.settlementCells)" },
                        adressen: { orte: orte6 },
                        ms: 10000,
                        masse: { zellen: { wie: "anzahl", feld: "da" }, orte: { wie: "summe", feld: "da" }, raenge: { wie: "verschieden", feld: "nH", nur: (a, w) => w.da === 1 } },
                        schlecht: { feld: "nH", richtung: "max" },
                        pose: (a, w) => "Ego vor dem Ort der Zelle " + a.ort.join(",") + " (Rang " + w.nH + ")",
                        ungemessen: ["Klima, Gestein und Epoche aus dem Bild der 1 000 Orte (R11 Panel, am Gerät)"],
                    });
                    const w6 = R6.werte;
                    aus[6] = { werte: { orte: w6.orte, zellen: w6.zellen }, zeuge: { orte: w6.orte, raenge: w6.raenge, akte: R6.akte }, auge: await M.auge("mensch-kultur-s6", { ort: "genesis" }, {}) };
                    // S7 AM FÄCHER (M4): 20 Zellen × 2 g — die Schwerkraft setzt der EINE Welt-Akt (dslRun gravity, stamm/feld-dsl.js:981); der Plan
                    // jeder Zelle unter 2 g gegen ihren Plan unter 1 g aus S1 (derselbe Export, dieselbe Saat). Gekoppelt heißt: der Plan ändert sich.
                    // Die Schwerkraft aus 20 Stadtbildern liest ein Prüfer (R10/R11) — ungemessen bis zum Gerät
                    const SCHWER_AN = async (r, T, a, mit) => {
                        const st = r.state, halt = st.weatherEffectTime, soll = mit.g * a.zeit.g;
                        if (st.gravity !== soll) { st.weatherEffectTime = 0; try { r.dslRun(["gravity", soll], { source: "human" }); } finally { st.weatherEffectTime = halt; } }
                        if (Math.abs(st.gravity - soll) > 1e-9) return { fehlt: "der Welt-Akt gravity setzt " + soll + " nicht (stamm/feld-dsl.js gravity)" };
                        const P = await r._foundryRequestSettlement({ seed: a.saat, nH: mit.nH[a.saat] });
                        if (!P || !P.slots || !P.slots.length) return { fehlt: "die Gießerei gibt der Saat keinen Plan unter " + a.zeit.g + " g" };
                        const t = JSON.stringify(P.slots.map((x) => [x.kultur, x.x, x.z, x.ov && x.ov.W, x.ov && x.ov.D, x.ov && x.ov.storeys, x.ov && x.ov.pitchDeg, x.ov && x.ov.stil]));
                        let h = 0;
                        for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) | 0;
                        return { anders: mit.vor[a.saat] != null && h !== mit.vor[a.saat] ? 1 : 0, g: st.gravity / mit.g, geschoss: P.slots.reduce((q, x) => q + ((x.ov && x.ov.storeys) || 1), 0) / P.slots.length };
                    };
                    let R7;
                    try {
                        R7 = await FAECHER((c) => H.seite(c), {
                            gesetz: { fn: SCHWER_AN, export: "fachwerk-core.js:2762 bauRezept über _foundryRequestSettlement({seed, nH}) unter dem Welt-Akt gravity", leser: "stamm/feld-dsl.js:981 gravity → state.gravity (gelesen nur von _stepCharacter)" },
                            adressen: { saaten: s2.zellen.slice(0, 20).map((c) => c.seed).filter((q) => hashVor[q] != null), zeiten: [{ g: 2 }] },
                            mit: { nH: nH2, vor: hashVor, g: s2.g },
                            ms: 12000,
                            masse: { stadtplaene: { wie: "anzahl", feld: "anders" }, gekoppelt: { wie: "anteil", feld: "anders" }, gFaktor: { wie: "erste", feld: "g" }, geschoss: { wie: "mittel", feld: "geschoss" } },
                            schlecht: { feld: "anders", richtung: "min" },
                            pose: (a, w) => "Third über der Stadt der Saat " + a.saat + " unter " + w.g + " g (Plan " + (w.anders ? "anders" : "gleich") + ")",
                            ungemessen: ["die Schwerkraft aus 20 Stadtbildern (Fremdwelt-Probe R10, am Gerät)"],
                        });
                    } finally {
                        await H.seite("const st = r.state, g = " + JSON.stringify(s2.g) + ", halt = st.weatherEffectTime; if (st.gravity !== g) { st.weatherEffectTime = 0; try { r.dslRun([\"gravity\", g], { source: \"human\" }); } finally { st.weatherEffectTime = halt; } } if (st.gravity !== g) st.gravity = g; return 1;");
                    }
                    const w7 = R7.werte;
                    aus[7] = {
                        werte: { gekoppeltProzent: w7.gekoppelt == null ? null : 100 * w7.gekoppelt, gFaktor: w7.gFaktor, geschossMittel: w7.geschoss },
                        zeuge: { stadtplaene: w7.stadtplaene, akte: R7.akte },
                        auge: await M.auge("mensch-kultur-s7", { ort: "genesis" }, {}),
                    };
                    for (const k of Object.keys(aus)) if (aus[k].nicht === undefined) delete aus[k].nicht;
                    return { sprossen: aus };
                },
                sprossen: {
                    1: {
                        u: {},
                        soll: [K.soll(KULTUR, 1, "32 Saaten", { key: "saaten", rel: "≥", zahl: 32 }), K.soll(KULTUR, 1, "passender Baustoff ≥ 85 %", { key: "passendProzent", einheit: "%" }), K.soll(KULTUR, 1, "Region aus Hausbild ≥ 70 %", { key: "regionBildProzent", einheit: "%" })],
                        auge: { pose: "Third vor dem Haus der Zelle (32 Zellen; headless: Genesis)", vorbild: "Prüfer-Satz (R11): die Region aus dem Hausbild ≥ 70 % gegen Hausbilder realer Regionen" },
                        taeter: "fachwerk-core.js DORF (die Region aus rnd(), kein Boden)",
                        nicht: "der Baustoff liest keinen Boden",
                        leser: "fachwerk-core.js:5192 region = rnd() des Samens; kein Leser von Fels (_rockExposureAt), Wald und Lehm der Zelle",
                        gruen: { werte: { saaten: 32, passendProzent: 88, regionBildProzent: 74 }, zeuge: { saaten: 32 } },
                        attrappen: [{ name: "88 % ohne Zellen", roh: { werte: { saaten: 32, passendProzent: 88, regionBildProzent: 74 }, zeuge: {} } }],
                    },
                    2: {
                        u: {},
                        soll: [K.soll(KULTUR, 2, "Dach ↔ Niederschlag r ≥ 0,5", { key: "r" }), K.soll(KULTUR, 2, "Mutation ≥ 90 %", { key: "mutationProzent", einheit: "%" })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.orte >= 32)) return "nur " + (z.orte || 0) + " Orte";
                            if (!(z.niederschlagStreuung > 0)) return "der Niederschlag streut nicht über die Orte (EIN Klima — r ohne Ursache)";
                            if (!(z.mutationen >= 32)) return "keine Mutation des Klimas gemessen";
                            if (!(z.gegenGleich >= 32)) return "der Gegenlauf fehlt: ohne Mutation ist der Plan nicht zweimal gleich (" + z.gegenGleich + " von 32)";
                            return null;
                        },
                        // ZAHL am Fächer (M4): 32 Zellen × Sonne · Regen · Sonne-Gegenlauf am EINEN Wetter-Kanal; der Zeuge verlangt, dass der Regen
                        // stand (rain Regen > Sonne) und der Gegenlauf den Plan gleich lässt (sonst wäre die Mutation Zufall, nicht Regen)
                        taeter: "fachwerk-core.js:2762 bauRezept (die Dach-Neigung aus dem Samen; kein Niederschlag, kein Wetter am Dach)",
                        nicht: "kein Klima am Dach",
                        leser: "fachwerk-core.js:2762 bauRezept({nutzung, rahmen:{region, band}}) liest kein Klima; der Regen der Welt ist EIN Kanal (window.__wetterSetzen → _weatherFieldFor().rain, gelesen stamm/siedlung-bewohner.js:2241), kein Niederschlag je Ort; Jahr und Klima fielen mit dem Labor-Meta-Gesetz (worlds/fachwerk/fachwerk.js:807 Klima)",
                        gruen: { werte: { r: 0.58, mutationProzent: 94 }, zeuge: { orte: 32, niederschlagStreuung: 0.6, mutationen: 32, gegenGleich: 32 } },
                        attrappen: [
                            { name: "r 0,58 über EIN Klima", roh: { werte: { r: 0.58, mutationProzent: 94 }, zeuge: { orte: 32, niederschlagStreuung: 0, mutationen: 32, gegenGleich: 32 } } },
                            { name: "Mutation 94 % ohne Gegenlauf (der Plan würfelt)", roh: { werte: { r: 0.58, mutationProzent: 94 }, zeuge: { orte: 32, niederschlagStreuung: 0.6, mutationen: 32, gegenGleich: 3 } } },
                            { name: "der Plan liest den Regen nicht (Mutant: r 0, Mutation 0 %)", roh: { werte: { r: 0, mutationProzent: 0 }, zeuge: { orte: 32, niederschlagStreuung: 0.6, mutationen: 32, gegenGleich: 32 } } },
                        ],
                    },
                    3: {
                        u: {},
                        soll: [K.soll(KULTUR, 3, "≥ 80 % der Feste auf einem Ereignis der Saat", { key: "festeProzent", einheit: "%" })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.feste >= 1)) return "kein Fest im Tag der Bewohner";
                            if (!(z.ereignisse >= 1)) return "kein Ereignis der Saat (Himmel, Ernte) gezählt";
                            if (z.gegen !== true) return "der Gegenlauf fehlt: das Ereignis genommen, und das Fest bleibt";
                            return null;
                        },
                        taeter: "koerper-core.js tagesPlan (kein Fest, kein Kalender)",
                        nicht: "kein Fest",
                        leser: "koerper-core.js:5630 tagesPlan kennt kein Fest; kein Kalender aus Himmel (stamm/bild-himmel.js:673 mond steht nur im Bild des Himmels) und Ernte",
                        gruen: { werte: { festeProzent: 85 }, zeuge: { feste: 6, ereignisse: 5, gegen: true } },
                        attrappen: [{ name: "85 % ohne Fest", roh: { werte: { festeProzent: 85 }, zeuge: { feste: 0 } } }],
                    },
                    4: {
                        u: {},
                        soll: [sollWort(KULTUR, 4, "Gebirge verschoben → Grenze folgt", { key: "grenzeFolgt", rel: ">", zahl: 0 }), K.soll(KULTUR, 4, "Mutante = 0", { key: "mutante" }), K.soll(KULTUR, 4, "angepasst ≥ 80 %", { key: "angepasstProzent", einheit: "%" })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (z.verschoben !== true) return "kein Gebirge verschoben";
                            if (!(z.orte >= 32)) return "zu wenige Orte";
                            return null;
                        },
                        taeter: "fachwerk-core.js DORF (kein Gelände, keine Sprachgrenze)",
                        nicht: "keine Grenze aus dem Gelände",
                        leser: "fachwerk-core.js:5183 DORF(DP) liest kein Gelände; keine Sprachgrenze und keine Gefahren-Bauweise (Bebenzone, Vulkanhang)",
                        gruen: { werte: { grenzeFolgt: 1, mutante: 0, angepasstProzent: 84 }, zeuge: { verschoben: true, orte: 40 } },
                        attrappen: [{ name: "Grenze folgt ohne verschobenes Gebirge", roh: { werte: { grenzeFolgt: 1, mutante: 0, angepasstProzent: 84 }, zeuge: { verschoben: false } } }],
                    },
                    5: {
                        u: {},
                        soll: [sollWort(KULTUR, 5, "heiliger Ort, Baustoff, Sprachgrenze, Mythos alle ≠", { key: "andersZahl", rel: "≥", zahl: 4 }), K.soll(KULTUR, 5, "Mutante 0", { key: "mutante" })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (z.eingriff !== true) return "kein Vulkan-Eingriff an der Welt";
                            if (typeof z.gegenAnders !== "number") return "der Gegenlauf ohne Eingriff fehlt";
                            return null;
                        },
                        taeter: "fachwerk-core.js DORF (keine Kaskade Geologie → Kultur)",
                        nicht: "keine Kaskade Vulkan → Kultur",
                        leser: "fachwerk-core.js:5183 DORF liest keinen Ausbruch und kein Gelände; kein Mythos, keine Sprache am Ort",
                        gruen: { werte: { andersZahl: 4, mutante: 0 }, zeuge: { eingriff: true, gegenAnders: 0 } },
                        attrappen: [{ name: "vier ≠ ohne Eingriff", roh: { werte: { andersZahl: 4, mutante: 0 }, zeuge: { eingriff: false } } }],
                    },
                    6: {
                        u: {},
                        soll: [K.soll(KULTUR, 6, "1 000 Orte", { key: "orte", rel: "≥", zahl: 1000 }), K.soll(KULTUR, 6, "Klima, Gestein, Epoche aus dem Bild ≥ 70 %", { key: "bildProzent", einheit: "%" })],
                        auge: { pose: "Ego vor dem Ort (1 000 Orte; headless: Genesis)", vorbild: "Prüfer-Satz (R11): Klima, Gestein und Epoche aus dem Bild ≥ 70 % gegen die Wahrheit der Welt" },
                        taeter: "fachwerk-core.js DORF (der Bau deutet den Ort nicht)",
                        leser: "fachwerk-core.js:5183 DORF liest kein Klima und kein Gestein; nur die Epoche steht im Bau",
                        gruen: { werte: { orte: 1000, bildProzent: 72 }, zeuge: { orte: 1000 } },
                        attrappen: [{ name: "1 000 Orte ohne Bild", roh: { werte: { orte: 1000, bildProzent: 72 }, zeuge: {} } }],
                    },
                    7: {
                        u: {},
                        soll: [K.soll(KULTUR, 7, "Schwerkraft aus 20 Stadtbildern ≥ 70 %", { key: "schwerkraftBildProzent", einheit: "%" }), K.soll(KULTUR, 7, "gekoppelt ≥ 85 %", { key: "gekoppeltProzent", einheit: "%" })],
                        auge: { pose: "Third über 20 Städten unter 2 g (Welt-Akt gravity; headless: Genesis)", vorbild: "Fremdwelt-Probe (R10): ein eingefrorener Leser sagt die Schwerkraft aus dem Stadtbild voraus ≥ 70 %" },
                        taeter: "fachwerk-core.js DORF (keine Schwerkraft am Bau)",
                        nicht: "die Kultur liest keine Schwerkraft",
                        leser: "stamm/feld-dsl.js:981 gravity schreibt nur state.gravity; fachwerk-core.js:5183 DORF liest sie nicht",
                        gruen: { werte: { schwerkraftBildProzent: 75, gekoppeltProzent: 90 }, zeuge: { stadtplaene: 20 } },
                        attrappen: [{ name: "gekoppelt ohne Plan", roh: { werte: { schwerkraftBildProzent: 75, gekoppeltProzent: 90 }, zeuge: {} } }],
                    },
                },
            },

            // ════════ mensch.kopplung.kreislauf — Die Stadt trägt sich ════════
            // 20 Bewohner des Dorfs: ihre Orte (heim · werk · mahl, die Bindung des Wirts) und ob ihr Mahl eine Herkunft trägt; der Plan:
            // Felder (Fläche), Brunnen, Stände, Laternen; die größte Stadt, die das Gesetz trägt (fachwerk STADT_FUNKTION).
            [KREIS]: {
                sek: 15,
                dorf: true,
                faecher: true,
                pfad: PFAD_DORF,
                mess: async function (H, U, M) {
                    const S = (fn, a) => H.seite("return await (" + String(fn) + ")(r, " + JSON.stringify(a || {}) + ");");
                    const kreis = async (r, a) => {
                        const D = window.__dorfDerProbe && r._bewohnerSiedlungen.get(window.__dorfDerProbe);
                        const pm = r.state.playerMesh.position;
                        const Dn = D && D.liste ? D : [...(r._bewohnerSiedlungen || new Map()).values()].filter((q) => q && q.liste && q.lebt && Math.hypot(q.ox - pm.x, q.oz - pm.z) < 230)[0];
                        if (!Dn) return { fehler: "kein lebendes Dorf ≤ 230 m (die Leiter leib gründet es)" };
                        const L20 = Dn.liste.slice(0, 20), P = Dn.plan;
                        const HERK = /herkunft|vorrat|ware|bissen|mahlzeit|nahrung|essen/i;
                        let heim = 0, werk = 0, mahl = 0, herkunft = 0, wasser = 0;
                        for (const b of L20) {
                            const o = b.orte || {};
                            if (o.heim) heim++;
                            if (o.werk && o.werk !== o.heim) werk++;
                            if (o.mahl) mahl++;
                            if (Object.keys(b).some((k) => HERK.test(k))) herkunft++;
                            if ((P.brunnen || []).length) wasser++;
                        }
                        const feldM2 = (P.felder || []).reduce((s, f) => s + 4 * (f.ex || 0) * (f.ez || 0), 0);
                        const stadtM2 = P.slots.reduce((s, x) => s + ((x.ov && x.ov.W) || 0) * ((x.ov && x.ov.D) || 0), 0);
                        const SF = AnazhRealm.Gesetz("fachwerk:STADT_FUNKTION");
                        return { personen: L20.length, n: Dn.liste.length, heim, werk, mahl, herkunft, wasser, felder: (P.felder || []).length, feldM2, stadtM2, brunnen: (P.brunnen || []).length, staende: (P.staende || []).length, laternen: (P.laternen || []).length, stadtVoll: SF ? SF.voll : null };
                    };
                    const m = await S(kreis, {});
                    if (!m || m.fehler) throw new Error("der Kreislauf: " + (m && m.fehler));
                    const P = (x) => (100 * x) / Math.max(1, m.personen);
                    const ware = "keine Ware mit Herkunft: das Mahl ist ein Ort der Bindung (koerper-core.js:5530 tagesBindung), nie ein Bissen aus der Flur — " + m.herkunft + " von " + m.personen + " tragen eine Herkunft";
                    const aus = M.teil || {};
                    // ── S1 ÜBER DEN FÄCHER: 20 Personen des Dorfs × die Stunden des Mittags. Je Adresse ruft der Richter den Leser des Spiels
                    // (`_bewohnerSoll`, stamm/siedlung-bewohner.js:2237 → koerper `tagesPlan`) und folgt dem Mahl die Kette hinab, die der Wirt
                    // trägt: der Ort des Mahls (`b.orte.mahl`, koerper `tagesBindung`) → ein Halter des Bestands dort (`b.bestand`, koerper-core.js:5758
                    // bestandHalter: Stand · Scheune · Werk) → seine Ware → das Werk, das sie herstellt (`BESTAND_GESETZ.herstellung`: das Feld trägt
                    // kraut) → der Bissen der Person (ein Verzehr am Leib). Die Kette ganz = Mahl bis Feld; jedes fehlende Glied steht beim Namen
                    const MAHL_AN = async (r, T, a) => {
                        const KC = window.__koerperCore;
                        const D = r._bewohnerSiedlungen.get(a.saat);
                        if (!D || !D.liste || !D.liste[a.ort]) return { fehlt: "die Person " + a.ort + " fehlt im Dorf (_bewohnerSiedlungen)" };
                        const b = D.liste[a.ort];
                        const z = r._bewohnerSoll(b, a.zeit);
                        const o = b.orte || {};
                        const HG = (KC.BESTAND_GESETZ || {}).herstellung || {};
                        const feldWare = HG.feld && HG.feld.ware;
                        const halter = D.liste.filter((h) => h.bestand && h.orte && o.mahl && h.orte.werk === o.mahl);
                        const waren = [...new Set(halter.map((h) => h.bestand.ware))];
                        const bissen = Object.keys(b).some((k) => /bissen|verzehr|mahlzeit|gegessen|vorrat|satt/i.test(k));
                        const glied = z.akt !== "mittag" ? "kein Mahl zur Stunde (" + z.akt + ")" : !o.mahl ? "kein Ort des Mahls (tagesBindung)" : !halter.length ? "kein Halter einer Ware am Ort des Mahls" : !waren.includes(feldWare) ? "die Ware am Ort des Mahls ist nicht vom Feld (" + waren.join("+") + ")" : !bissen ? "kein Bissen am Leib (der Stand leert sich über die Stunden seines Händlers, nie durch die Person)" : null;
                        return { mahl: z.akt === "mittag" ? 1 : 0, ort: o.mahl ? 1 : 0, halter: halter.length ? 1 : 0, feld: waren.includes(feldWare) ? 1 : 0, bissen: bissen ? 1 : 0, kette: glied ? 0 : 1, glied: { [glied || "ganz"]: 1 }, heim: o.heim ? 1 : 0, werk: o.werk && o.werk !== o.heim ? 1 : 0 };
                    };
                    const dk = await H.seite("const D = window.__dorfDerProbe && r._bewohnerSiedlungen.get(window.__dorfDerProbe); return D && D.liste ? [window.__dorfDerProbe, D.liste.length] : null;");
                    if (!dk) throw new Error("der Kreislauf: das Dorf der Probe fehlt");
                    const R1 = await FAECHER((c) => H.seite(c), {
                        gesetz: { fn: MAHL_AN, export: "koerper-core.js:5630 tagesPlan · tagesBindung (orte.mahl) · :5758 bestandHalter · BESTAND_GESETZ.herstellung", leser: "stamm/siedlung-bewohner.js:2237 _bewohnerSoll" },
                        adressen: { saaten: [dk[0]], orte: Array.from({ length: Math.min(20, dk[1]) }, (_, i) => i), zeiten: [12, 12.5] },
                        ms: 5000,
                        masse: { personen: { wie: "verschieden", feld: "a.ort" }, kette: { wie: "mittel", feld: "kette" }, mahl: { wie: "mittel", feld: "mahl" }, ort: { wie: "mittel", feld: "ort" }, halter: { wie: "mittel", feld: "halter" }, feld: { wie: "mittel", feld: "feld" }, bissen: { wie: "mittel", feld: "bissen" }, glieder: { wie: "zaehle", feld: "glied" }, heim: { wie: "mittel", feld: "heim" }, werk: { wie: "mittel", feld: "werk" } },
                        schlecht: { feld: "kette", richtung: "min" },
                        pose: (a) => "die Person " + a.ort + " des Dorfs " + a.saat + " um " + a.zeit + " Uhr an ihrem Mahl",
                        ungemessen: ["das Wasser aus dem Brunnen (kein Halter Wasser im Bestand; " + m.brunnen + " Brunnen im Plan ohne Fluss)"],
                    });
                    const w1 = R1.werte;
                    const pz = (v) => (Number.isFinite(v) ? Math.round(1000 * v) / 10 : null);
                    aus[1] = {
                        werte: { personen: w1.personen, mahlFeldProzent: pz(w1.kette), wohnungProzent: pz(w1.heim), werkProzent: pz(w1.werk) },
                        zeuge: { personen: w1.personen, felder: m.felder, gegen: false, glieder: Object.entries(w1.glieder || {}).map(([k, v]) => k + " " + v).join(" · "), mahlProzent: pz(w1.mahl), ortProzent: pz(w1.ort), halterProzent: pz(w1.halter), feldProzent: pz(w1.feld), bissenProzent: pz(w1.bissen), akte: R1.akte },
                        ...(R1.gemessen ? {} : { nicht: ware + " · " + R1.akte }),
                    };
                    aus[2] = { werte: { staende: m.staende, gueter: 0 }, zeuge: { gueter: 0 }, nicht: "kein Gut mit Bilanz: " + m.staende + " Stände ohne Ware, kein Brennholz, kein Werkzeug im Fluss" };
                    aus[3] = { werte: { laternen: m.laternen, leitungen: 0 }, zeuge: { stoffe: 0 }, nicht: "kein Stoff im Fluss: keine Leitung, kein Abwasser, kein Müll; " + m.laternen + " Laternen ohne Energie" };
                    aus[4] = { werte: { hinterlandM2: m.feldM2, stadtM2: m.stadtM2, verhaeltnis: m.stadtM2 ? m.feldM2 / m.stadtM2 : undefined }, zeuge: { bedarf: 0 }, nicht: "kein Bedarf je Person: Hinterland " + Math.round(m.feldM2) + " m² Feld gegen " + Math.round(m.stadtM2) + " m² Grund, ohne Strom und Handel" };
                    aus[5] = { werte: { personenDorf: m.n, versorgtAnteil: 0, stadtVoll: m.stadtVoll }, zeuge: { personen: m.n }, nicht: "10⁸ in EINER Stadt nicht erzeugbar (das Dorf der Probe trägt " + m.n + ", die Stadt des Fachwerks klemmt ihre Häuser) und keine Person ist versorgt (keine Nahrung, keine Energie)" };
                    aus[6] = { werte: { mangelModell: 0 }, zeuge: { saaten: 0 }, nicht: "kein Mangel und keine Ursache: die Welt kennt keine Versorgung über 100 J" };
                    return { sprossen: aus };
                },
                sprossen: {
                    1: {
                        u: {},
                        soll: [K.soll(KREIS, 1, "20 Personen", { key: "personen", rel: "≥", zahl: 20 }), K.soll(KREIS, 1, "Mahl bis Feld ≥ 90 %", { key: "mahlFeldProzent", einheit: "%" })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.personen >= 20)) return "nur " + (z.personen || 0) + " Personen";
                            if (!(z.felder >= 1)) return "kein Feld im Plan";
                            if (z.gegen !== true) return "der Gegenlauf fehlt: das Feld genommen, und das Mahl bleibt";
                            return null;
                        },
                        taeter: "koerper-core.js tagesBindung (das Mahl ist ein Ort, keine Ware)",
                        nicht: "keine Ware mit Herkunft",
                        leser: "koerper-core.js:5530 tagesBindung bindet mahl an einen Ort; kein Bissen, kein Vorrat, keine Herkunft bis zum Feld des Plans",
                        gruen: { werte: { personen: 20, mahlFeldProzent: 95 }, zeuge: { personen: 20, felder: 4, gegen: true } },
                        attrappen: [{ name: "95 % ohne Feld und Gegenlauf", roh: { werte: { personen: 20, mahlFeldProzent: 95 }, zeuge: { personen: 20, felder: 0 } } }],
                    },
                    2: {
                        u: {},
                        soll: [K.soll(KREIS, 2, "Bilanz je Gut ± 10 %", { key: "bilanzAbwProzent", rel: "≤", zahl: 10, einheit: "%" })],
                        zeuge: (roh) => (!((roh.zeuge || {}).gueter >= 3) ? "kein Gut (Markt, Brennholz, Werkzeug) mit Bilanz in der Welt" : (roh.zeuge || {}).gegen !== true ? "der Gegenlauf fehlt: die Quelle eines Guts gekappt, und die Bilanz bleibt" : null),
                        taeter: "fachwerk-core.js DORF (Stände ohne Ware)",
                        nicht: "kein Gut",
                        leser: "koerper-core.js:5201 markt (TAGES_GESETZ) bietet Arbeit, Mahl und Morgengang, keine Ware mit Menge",
                        gruen: { werte: { bilanzAbwProzent: 6 }, zeuge: { gueter: 3, gegen: true } },
                        attrappen: [{ name: "Bilanz 6 % ohne Gut", roh: { werte: { bilanzAbwProzent: 6 }, zeuge: { gueter: 0 } } }],
                    },
                    3: {
                        u: {},
                        soll: [K.soll(KREIS, 3, "Bilanz je Stoff ± 5 %", { key: "bilanzAbwProzent", rel: "≤", zahl: 5, einheit: "%" })],
                        zeuge: (roh) => (!((roh.zeuge || {}).stoffe >= 3) ? "kein Stoff (Leitung, Abwasser, Müll) im Fluss der Welt" : (roh.zeuge || {}).gegen !== true ? "der Gegenlauf fehlt: die Leitung gekappt, und die Bilanz bleibt" : null),
                        taeter: "fachwerk-core.js DORF (keine Leitung, kein Abwasser)",
                        nicht: "kein Stoff im Fluss",
                        leser: "fachwerk-core.js:5183 DORF legt Brunnen und Laternen als Bauten, ohne Fluss von Wasser, Abwasser, Müll",
                        gruen: { werte: { bilanzAbwProzent: 3 }, zeuge: { stoffe: 3, gegen: true } },
                        attrappen: [{ name: "Bilanz 3 % ohne Stoff", roh: { werte: { bilanzAbwProzent: 3 }, zeuge: { stoffe: 0 } } }],
                    },
                    4: {
                        u: {},
                        soll: [K.soll(KREIS, 4, "Hinterland ≥ Stadtfläche × Bedarf ± 30 %", { key: "hinterlandAbwProzent", rel: "≤", zahl: 30, einheit: "%" })],
                        zeuge: (roh) => (!((roh.zeuge || {}).bedarf > 0) ? "kein Bedarf je Person in der Welt — das Hinterland deckt nichts" : (roh.zeuge || {}).gegen !== true ? "der Gegenlauf fehlt: das Hinterland genommen, und die Stadt bleibt versorgt" : null),
                        taeter: "fachwerk-core.js DORF (Felder ohne Bedarf)",
                        unklar: "„Hinterland ≥ Stadtfläche × Bedarf ± 30 %“ mischt ≥ und ± — Vorschlag: Hinterland ÷ (Stadtfläche × Bedarf) ≥ 0,7; die Station misst die Unterdeckung ≤ 30 %",
                        nicht: "kein Bedarf",
                        leser: "fachwerk-core.js:5183 DORF: die Felder des Plans haben eine Fläche, keinen Ertrag und keinen Bedarf; kein Strom, kein Handel",
                        gruen: { werte: { hinterlandAbwProzent: 18 }, zeuge: { bedarf: 2.1, gegen: true } },
                        attrappen: [{ name: "18 % ohne Bedarf", roh: { werte: { hinterlandAbwProzent: 18 }, zeuge: { bedarf: 0 } } }],
                    },
                    5: {
                        u: {},
                        soll: [K.soll(KREIS, 5, "1 000 Personen ≥ 0,99", { key: "versorgtAnteil" }), K.soll(KREIS, 5, "100 Bissen bis Feld ≥ 90 %", { key: "bissenProzent", einheit: "%" })],
                        zeuge: (roh) => (!((roh.zeuge || {}).personen >= 1000) ? "nur " + ((roh.zeuge || {}).personen || 0) + " Personen in der Stadt (Soll 1 000 je Stichprobe)" : (roh.zeuge || {}).gegen !== true ? "der Gegenlauf fehlt: das Feld genommen, und der Bissen bleibt" : null),
                        taeter: "fachwerk-core.js STADT_FUNKTION / koerper-core.js tagesBindung (keine Versorgung)",
                        nicht: "10⁸ in einer Stadt nicht erzeugbar",
                        leser: "stamm/siedlung-ort.js:1157 spawnSettlement klemmt die Stadt an fachwerk STADT_FUNKTION (Kachel-Netz), keine Versorgung je Person",
                        gruen: { werte: { versorgtAnteil: 0.995, bissenProzent: 93 }, zeuge: { personen: 1000, gegen: true } },
                        attrappen: [{ name: "0,995 ohne Personen", roh: { werte: { versorgtAnteil: 0.995, bissenProzent: 93 }, zeuge: { personen: 0 } } }],
                    },
                    6: {
                        u: {},
                        soll: [K.soll(KREIS, 6, "16 Saaten × 100 J", { key: "saaten", rel: "≥", zahl: 16 }), K.soll(KREIS, 6, "16 Saaten × 100 J", { key: "jahre", rel: "≥", zahl: 100, einheit: "J" }), sollWort(KREIS, 6, "kein Mangel ohne sichtbare Ursache", { key: "mangelOhneUrsache", rel: "=", zahl: 0 })],
                        zeuge: (roh) => (!((roh.zeuge || {}).saaten >= 16) ? "keine Saat lief 100 J mit Versorgung" : (roh.zeuge || {}).gegen !== true ? "der Gegenlauf fehlt: eine Ursache gesetzt (Missernte), und kein Mangel folgt" : null),
                        taeter: "die Welt (kein Kreislauf der Versorgung)",
                        nicht: "kein Mangel-Modell",
                        leser: "koerper-core.js:5530 tagesBindung ohne Nahrung; kein Sprung über 100 J mit Bilanz",
                        gruen: { werte: { saaten: 16, jahre: 100, mangelOhneUrsache: 0 }, zeuge: { saaten: 16, gegen: true } },
                        attrappen: [{ name: "kein Mangel, weil nichts gezählt", roh: { werte: { saaten: 16, jahre: 100, mangelOhneUrsache: 0 }, zeuge: { saaten: 0 } } }],
                    },
                },
            },

            // ════════ mensch.kopplung.antwort — Die Welt antwortet auf Eingriff (S1 trägt g5.js K4_PROBE) ════════
            // Die Zellen der Welt (`_autoSettlementCellInfo`) als Siedlungsnetz: Dichte im 200-m-Gürtel einer Linie durch den Spieler gegen
            // die Kontrolle (S2), die Netz-Kennzahlen des Dorfs der Probe zweimal (S3), der Rang (nH) von 64 Zellen mit ↔ ohne Eingriff (S4),
            // 64 Pläne im Jahr X+300 (Epoche über fachwerk epocheImJahr, wie der Satz „dorf … jahr“) mit Eingriff (Schwerkraft 2 g, der
            // Welt-Akt) gegen ohne Eingriff zweimal (S5), 100 Taten (Schwerkraft g_k) und ihre Folge in den Perspektiven Leib (Genom),
            // Bau (Plan), Markt (Stände), Tag (Soll draußen) mit dem Gegenlauf ohne Tat (S6).
            [ANTWORT]: {
                sek: 25,
                dorf: true,
                mutiert: true,
                faecher: true,
                pfad: PFAD_DORF,
                mess: async function (H, U, M) {
                    const S = (fn, a) => H.seite("return await (" + String(fn) + ")(r, " + JSON.stringify(a || {}) + ");");
                    const antwort = async (r, a) => {
                        const st = r.state, A = AnazhRealm, alt = { g: st.gravity, halt: st.weatherEffectTime };
                        const pm = st.playerMesh.position;
                        const hash = (P) => { if (!P) return null; const t = JSON.stringify([P.region, P.jahr, P.kleidung, P.slots.map((x) => [x.kultur, x.x, x.z, x.ov && x.ov.W, x.ov && x.ov.D, x.ov && x.ov.storeys, x.ov && x.ov.pitchDeg, x.rolle])]); let h = 0; for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) | 0; return h; };
                        const schwer = (g) => { st.weatherEffectTime = 0; try { r.dslRun(["gravity", g], { source: "human" }); } finally { st.weatherEffectTime = alt.halt; } return st.gravity; };
                        const zellen = [];
                        for (let cx = -9; cx <= 9; cx++) for (let cz = -9; cz <= 9; cz++) { const c = r._autoSettlementCellInfo(cx, cz); if (c) zellen.push({ cx, cz, seed: c.seed, nH: c.nH, x: c.x, z: c.z }); }
                        const SG = A._siedlungGesetz();
                        const cellM = (SG && SG.cellM) || 512;
                        const ring = 9 * cellM;
                        const inG = zellen.filter((c) => Math.abs(c.z - pm.z) <= 200).length, ausG = zellen.length - inG;
                        const flG = 2 * ring * 400, flA = 4 * ring * ring - flG;
                        const aus = { zellen: zellen.length, s2: { dichteFaktor: ausG ? inG / flG / (ausG / flA) : null, inG, ausG } };
                        const D = window.__dorfDerProbe && r._bewohnerSiedlungen.get(window.__dorfDerProbe);
                        const nHD = D ? ((st.worldMeta.settlementCells || {})[window.__dorfDerProbe] || {}).nH || D.plan.slots.length : 0;
                        const netz = (P) => (P ? { wege: (P.roads || []).length, knoten: P.graph && P.graph.nodes ? P.graph.nodes.length : null, kanten: P.graph && P.graph.edges ? P.graph.edges.length : null, felder: (P.felder || []).length } : null);
                        if (D) { const p1 = await r._foundryRequestSettlement({ seed: D.plan.seed, nH: nHD }); const p2 = await r._foundryRequestSettlement({ seed: D.plan.seed, nH: nHD }); aus.s3 = { a: netz(p1), b: netz(p2), gleich: hash(p1) === hash(p2) }; }
                        const Z = zellen.slice().sort((p, q) => Math.hypot(p.x - pm.x, p.z - pm.z) - Math.hypot(q.x - pm.x, q.z - pm.z)).slice(0, 64);
                        const rang = () => Z.map((c) => { const i = r._autoSettlementCellInfo(c.cx, c.cz); return i ? i.nH : 0; });
                        const E = A.Gesetz("fachwerk:epocheImJahr");
                        const basis = [];
                        for (const c of Z) basis.push(await r._foundryRequestSettlement({ seed: c.seed, nH: c.nH }));
                        const plus = async () => { const o = []; for (let i = 0; i < Z.length; i++) { const P0 = basis[i]; o.push(P0 ? hash(await r._foundryRequestSettlement({ seed: Z[i].seed, nH: Z[i].nH, epoche: E(P0.jahr + 300) })) : null); } return o; };
                        const rang0 = rang(), ohne1 = await plus(), ohne2 = await plus();
                        let mit = null, rangMit = null, g2 = null;
                        try { g2 = schwer(alt.g * 2) / alt.g; rangMit = rang(); mit = await plus(); }
                        finally { if (st.gravity !== alt.g) schwer(alt.g); if (st.gravity !== alt.g) st.gravity = alt.g; }
                        const paare = ohne1.filter((h, i) => h != null && mit && mit[i] != null).length;
                        aus.s4 = { orte: Z.length, rangVerschiebung: rang0.filter((v, i) => rangMit && v !== rangMit[i]).length, g2 };
                        aus.s5 = { orte: Z.length, paare, anders: ohne1.filter((h, i) => h != null && mit && mit[i] != null && mit[i] !== h).length, ohneUngleich: ohne1.filter((h, i) => h !== ohne2[i]).length, hashe: new Set(ohne1).size, zeitAnders: ohne1.filter((h, i) => basis[i] && h !== hash(basis[i])).length, g2 };
                        const LS = D && D.liste ? D.liste.slice(0, 12) : [];
                        const blick = async () => { const P = D ? await r._foundryRequestSettlement({ seed: D.plan.seed, nH: nHD }) : null; return { leib: LS.map((b) => r._rollHumanoidGenome(b.seed).kh).join(","), bau: hash(P), markt: P ? (P.staende || []).length : null, tag: LS.filter((b) => !r._bewohnerSoll(b, 12).drinnen).length }; };
                        const K4 = ["leib", "bau", "markt", "tag"];
                        let taten = 0, mitFolge = 0, mutante = 0;
                        const vor = await blick();
                        try {
                            for (let k = 0; k < a.taten; k++) {
                                const g = -(1 + ((k * 7919) % 280) / 10);
                                schwer(g);
                                if (st.gravity !== g) continue;
                                taten++;
                                const nach = await blick();
                                if (K4.filter((p) => nach[p] !== vor[p]).length >= 3) mitFolge++;
                                schwer(alt.g);
                                const gegen = await blick();
                                mutante = Math.max(mutante, K4.filter((p) => gegen[p] !== vor[p]).length);
                            }
                        } finally { if (st.gravity !== alt.g) schwer(alt.g); if (st.gravity !== alt.g) st.gravity = alt.g; }
                        aus.s6 = { taten, mitFolge, mutante, perspektiven: K4.length, dorf: !!D };
                        aus.gZurueck = st.gravity === alt.g;
                        return aus;
                    };
                    const m = await S(antwort, { taten: 100 });
                    if (!m || m.fehler) throw new Error("die Antwort: " + (m && m.fehler));
                    const aus = M.teil || {};
                    // S2 AM FÄCHER (M4): die 19 × 19 Zellen um den Spieler × „ohne Trasse“, je Adresse der Export, den die Welt beim Streuen der
                    // Orte liest (_autoSettlementCellInfo); die Adresse „mit Trasse“ setzt die Ursache über den EINEN Kanal der Taten (dslEffects)
                    // oder nennt beim Namen, was fehlt. Ohne Trasse misst der Fächer die Dichte im 200-m-Gürtel gegen den Rest — die Kontrolle,
                    // an der eine Dichte ohne Ursache ROT würde
                    const SPUR = await H.seite("const p = r.state.playerMesh.position, G = AnazhRealm._siedlungGesetz(); return { x: p.x, z: p.z, cellM: (G && G.cellM) || 512 };");
                    const ORT_AN = async (r, T, a, mit) => {
                        if (a.zeit.k === "mit") {
                            const t = Object.keys(r.dslEffects || {});
                            const weg = t.filter((k) => /road|weg|trasse|strasse|pfad|path|bahn/i.test(k));
                            return { fehlt: "kein Weg-Akt des Spielers: stamm/feld-dsl.js:946 dslEffects trägt " + t.length + " Taten, " + (weg.length ? "die Station kennt die Form von " + weg.join("+") + " nicht" : "keine Trasse") + "; stamm/siedlung-ort.js:1427 _autoSettlementCellInfo(cx, cz) liest Same und Rang, keine Erreichbarkeit" };
                        }
                        const c = r._autoSettlementCellInfo(a.ort.cx, a.ort.cz);
                        return { da: c ? 1 : 0, z: c ? c.z : null, nH: c ? c.nH || 0 : 0 };
                    };
                    const ringM = 9 * SPUR.cellM, flG = 2 * ringM * 400, flA = 4 * ringM * ringM - flG;
                    const orte2 = [];
                    for (let cx = -9; cx <= 9; cx++) for (let cz = -9; cz <= 9; cz++) orte2.push({ cx, cz });
                    const R2 = await FAECHER((c) => H.seite(c), {
                        gesetz: { fn: ORT_AN, export: "stamm/siedlung-ort.js:1427 _autoSettlementCellInfo(cx, cz) — der Ort der Zelle (Same, Rang, Lage)", leser: "stamm/siedlung-ort.js:1427 _autoSettlementCellInfo beim Streuen der Orte (worldMeta.settlementCells)" },
                        adressen: { orte: orte2, zeiten: [{ k: "ohne" }], dazu: [{ saat: null, ort: { cx: 0, cz: 0 }, zeit: { k: "mit" } }] },
                        mit: {},
                        ms: 8000,
                        masse: {
                            zellen: { wie: "anzahl", feld: "da" },
                            orte: { wie: "summe", feld: "da" },
                            inG: { wie: "summe", feld: "da", nur: (a, w) => w.z != null && Math.abs(w.z - SPUR.z) <= 200 },
                            dichteFaktor: { wie: (v, aus) => { const d = aus.filter((x) => x.w.da); const inG = d.filter((x) => Math.abs(x.w.z - SPUR.z) <= 200).length, ausG = d.length - inG; return ausG ? inG / flG / (ausG / flA) : null; }, feld: "da" },
                        },
                        schlecht: { feld: "nH", richtung: "max" },
                        pose: (a, w) => "die Zelle " + a.ort.cx + "," + a.ort.cz + " (Rang " + w.nH + ") — Karte von oben über dem Gürtel z " + Math.round(SPUR.z) + " ± 200 m",
                        ungemessen: ["das Luftbild des Gürtels vor und nach 50 Jahren (am Gerät)"],
                    });
                    const w2a = R2.werte;
                    aus[2] = {
                        werte: { dichteFaktorOhne: w2a.dichteFaktor, zellen: w2a.zellen, orte: w2a.orte, imGuertel: w2a.inG },
                        zeuge: { trasse: false, zellen: w2a.zellen, kontrolle: w2a.orte - w2a.inG, akte: R2.akte },
                        nicht: (R2.fehlt || "keine Trasse des Spielers") + " — ohne Trasse trägt der 200-m-Gürtel " + (w2a.dichteFaktor == null ? "?" : w2a.dichteFaktor.toFixed(2)) + "× die Dichte der Kontrolle (" + w2a.inG + " von " + w2a.orte + " Orten in " + w2a.zellen + " Zellen)",
                    };
                    const s3 = m.s3 || {};
                    aus[3] = { werte: { gegenAenderung: s3.gleich === true ? 0 : s3.gleich === false ? 1 : undefined, wegeAlt: s3.a ? s3.a.wege : undefined }, zeuge: { abriss: false, neubau: 0, gegenGemessen: s3.gleich !== undefined }, nicht: "kein Neubau nach Zerstörung: der Ort wächst nur aus seinem Jahr (stamm/siedlung-ort.js:3013 _ortWaechst), kein Bodenwert und kein Wiederaufbau nach remove_architecture" };
                    aus[4] = { werte: { rangVerschiebung: m.s4.rangVerschiebung, orte: m.s4.orte, sprungJ: 0 }, zeuge: { orte: m.s4.orte, eingriff: m.s4.g2 === 2, kontrolle: true, sprung: false }, nicht: "kein Sprung 50 J am Siedlungsnetz und kein Leerstand: der Rang der Zelle liest kein Jahr und keinen Eingriff (stamm/siedlung-ort.js:1427 _autoSettlementCellInfo) — unter 2 g verschoben " + m.s4.rangVerschiebung + " von " + m.s4.orte };
                    aus[5] = { werte: { orteAnders: m.s5.anders, sprungJ: 300, ohneUngleich: m.s5.ohneUngleich, zeitAnders: m.s5.zeitAnders }, zeuge: { paare: m.s5.paare, hashe: m.s5.hashe, eingriff: m.s5.g2 === 2, gegenPaare: m.s5.orte - m.s5.ohneUngleich } };
                    aus[6] = { werte: { taten: m.s6.taten, folgeProzent: m.s6.taten ? (100 * m.s6.mitFolge) / m.s6.taten : undefined, mutante: m.s6.mutante }, zeuge: { taten: m.s6.taten, perspektiven: m.s6.perspektiven, dorf: m.s6.dorf, gegenGemessen: true } };
                    return { sprossen: aus };
                },
                sprossen: {
                    2: {
                        u: {},
                        soll: [K.soll(ANTWORT, 2, "Dichte im 200-m-Gürtel ≥ 2× gegen Kontroll-Saat", { key: "dichteFaktor" })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (z.trasse !== true) return "keine Trasse des Spielers gelegt";
                            if (!(z.zellen >= 20)) return "zu wenige Zellen";
                            if (!(z.kontrolle > 0)) return "keine Kontrolle";
                            return null;
                        },
                        taeter: "stamm/siedlung-ort.js _autoSettlementCellInfo (keine Erreichbarkeit)",
                        nicht: "keine Trasse des Spielers",
                        leser: "stamm/siedlung-ort.js:1427 _autoSettlementCellInfo(cx, cz) liest Same und Rang, keine Trasse und keine Erreichbarkeit; die DSL (stamm/feld-dsl.js:946 dslEffects) kennt keinen Weg-Akt",
                        gruen: { werte: { dichteFaktor: 2.4 }, zeuge: { trasse: true, zellen: 300, kontrolle: 250 } },
                        attrappen: [{ name: "2,4× ohne Trasse", roh: { werte: { dichteFaktor: 2.4 }, zeuge: { trasse: false, zellen: 300, kontrolle: 250 } } }],
                    },
                    3: {
                        u: {},
                        soll: [
                            sollWort(ANTWORT, 3, "Netz-Kennzahlen des Neubaus weichen vom alten Viertel ab", { key: "abweichung", rel: ">", zahl: 0 }),
                            K.soll(ANTWORT, 3, "liegen im Band realer Wiederaufbau-Pläne ≥ 70 %", { key: "bandProzent", einheit: "%" }),
                            sollWort(ANTWORT, 3, "Gegenlauf ohne Zerstörung: Viertel unverändert", { key: "gegenAenderung", rel: "=", zahl: 0 }),
                        ],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (z.abriss !== true) return "kein Viertel zerstört";
                            if (!(z.neubau >= 1)) return "kein Neubau";
                            if (z.gegenGemessen !== true) return "der Gegenlauf fehlt";
                            return null;
                        },
                        taeter: "stamm/siedlung-ort.js _ortWaechst (kein Wiederaufbau)",
                        nicht: "kein Wiederaufbau",
                        leser: "stamm/siedlung-ort.js:3013 _ortWaechst baut nur Häuser seines Jahrs nach; kein Neubau nach Zerstörung, kein Bodenwert",
                        gruen: { werte: { abweichung: 1, bandProzent: 76, gegenAenderung: 0 }, zeuge: { abriss: true, neubau: 6, gegenGemessen: true } },
                        attrappen: [{ name: "Abweichung ohne Abriss", roh: { werte: { abweichung: 1, bandProzent: 76, gegenAenderung: 0 }, zeuge: { abriss: false } } }],
                    },
                    4: {
                        u: {},
                        soll: [K.soll(ANTWORT, 4, "Sprung 50 J", { key: "sprungJ", rel: "≥", zahl: 50, einheit: "J" }), sollWort(ANTWORT, 4, "Rang-Verschiebung gegen Kontrolle", { key: "rangVerschiebung", rel: ">", zahl: 0 }), K.soll(ANTWORT, 4, "Leerstand erkannt ≥ 70 %", { key: "leerstandProzent", einheit: "%" })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.orte >= 20)) return "zu wenige Orte";
                            if (z.eingriff !== true) return "kein Eingriff";
                            if (z.sprung !== true) return "kein Sprung 50 J am Siedlungsnetz";
                            return null;
                        },
                        taeter: "stamm/siedlung-ort.js _autoSettlementCellInfo (kein Jahr, kein Eingriff)",
                        nicht: "kein Sprung am Netz",
                        leser: "stamm/siedlung-ort.js:1427 _autoSettlementCellInfo liest kein Jahr und keinen Eingriff; kein Leerstand",
                        gruen: { werte: { sprungJ: 50, rangVerschiebung: 5, leerstandProzent: 74 }, zeuge: { orte: 64, eingriff: true, sprung: true } },
                        attrappen: [{ name: "Rang verschoben ohne Sprung", roh: { werte: { sprungJ: 50, rangVerschiebung: 5, leerstandProzent: 74 }, zeuge: { orte: 64, eingriff: true, sprung: false } } }],
                    },
                    5: {
                        u: {},
                        soll: [K.soll(ANTWORT, 5, "64 Orte im Jahr X+300 anders", { key: "orteAnders", rel: "≥", zahl: 64 }), K.soll(ANTWORT, 5, "X+300", { key: "sprungJ", rel: "≥", zahl: 300, einheit: "J" }), sollWort(ANTWORT, 5, "ohne Eingriff byte-gleich", { key: "ohneUngleich", rel: "=", zahl: 0 })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.paare >= 64)) return "nur " + (z.paare || 0) + " Paare mit ↔ ohne Eingriff (Soll 64)";
                            if (!(z.hashe >= 2)) return "alle Orte gleich (eine Konstante)";
                            if (z.eingriff !== true) return "der Eingriff (Schwerkraft 2 g) stand nicht";
                            if (!(z.gegenPaare >= 64)) return "der Gegenlauf ohne Eingriff fehlt";
                            return null;
                        },
                        zeugeText: "64 Orte X+300 mit ↔ ohne Eingriff, ohne Eingriff zweimal byte-gleich",
                        taeter: "fachwerk-core.js DORF (der Plan liest keinen Eingriff)",
                        leser: "fachwerk-core.js:5183 DORF(DP) liest Same, Größe, Epoche; ein Eingriff der Welt (Akt, Haus, Schwerkraft) erreicht den Plan der Zelle nicht",
                        gruen: { werte: { orteAnders: 64, sprungJ: 300, ohneUngleich: 0 }, zeuge: { paare: 64, hashe: 60, eingriff: true, gegenPaare: 64 } },
                        attrappen: [{ name: "64 anders ohne Paare der Welt", roh: { werte: { orteAnders: 64, sprungJ: 300, ohneUngleich: 0 }, zeuge: { paare: 0 } } }],
                    },
                    6: {
                        u: {},
                        soll: [K.soll(ANTWORT, 6, "100 Taten", { key: "taten", rel: "≥", zahl: 100 }), K.soll(ANTWORT, 6, "Folge in ≥ 3 Perspektiven ≥ 90 %", { key: "folgeProzent", zahl: 90, einheit: "%" }), K.soll(ANTWORT, 6, "Mutante = 0", { key: "mutante" })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.taten >= 100)) return "nur " + (z.taten || 0) + " Taten an der Welt";
                            if (!(z.perspektiven >= 3)) return "weniger als 3 Perspektiven beobachtet";
                            if (z.dorf !== true) return "kein Dorf, an dem Leib, Markt und Tag antworten";
                            if (z.gegenGemessen !== true) return "der Gegenlauf ohne Tat fehlt";
                            return null;
                        },
                        zeugeText: "100 Taten, je Tat Leib · Bau · Markt · Tag vor ↔ nach und der Gegenlauf ohne Tat",
                        taeter: "stamm/feld-dsl.js gravity (die Tat erreicht nur _stepCharacter)",
                        leser: "stamm/feld-dsl.js:981 gravity, der Welt-Akt, schreibt state.gravity für den Schritt des Spielers; Leib (stamm/koerper-leib.js:48 kh), Bau (fachwerk-core.js:5183 DORF), Markt und Tag (koerper-core.js:5630 tagesPlan) lesen keine Tat",
                        gruen: { werte: { taten: 100, folgeProzent: 93, mutante: 0 }, zeuge: { taten: 100, perspektiven: 4, dorf: true, gegenGemessen: true } },
                        attrappen: [{ name: "93 % ohne Taten der Welt", roh: { werte: { taten: 100, folgeProzent: 93, mutante: 0 }, zeuge: { taten: 0 } } }],
                    },
                },
            },
        },
    };
})());

// ── DIE PERSPEKTIVE zusammenspiel.erleben (7 Leitern, 44 Sprossen, 2 belegt: wahrnehmung S1 — g2.js witterungJagd, bild S1 — g3.js
// KOPPLUNG_PROBE): das Erleben der Kopplungen, jede mit ihrem Gegenlauf (R7). Gemessen wird in der warmen Welt der Sitzung um den
// Spieler über die Wege des Spiels: die Kaskade über den Bestand (`tickFaunaLifecycle`, `_kreaturBestand`, die Wölfe genommen wie
// diag-kreatur-leben „kaskade“), der Klang über die EINE Lage am Ohr (`_umweltLage` → klang-core `umweltMischung`, der Graph
// `um.graph.zensus()` als Abgriff), das Bild über `_archImBild` und die Kamera, die Uhr über `setTimeOfDay(…, "regler")`, das Jahr über
// `seasonPhase`/`_saisonAnker`, das Wetter NUR über `window.__wetterSetzen`, der Planet über den Planet-Faden (`r._planetAuftrag`,
// planet-anker und planet-ort an den Saaten „same-saat-0…99“, die der Faden je Samen behält). Was die Welt nicht trägt (kein Netz-
// Spieler, kein Donner, keine Epoche am Ohr, kein Arten-Inventar je Zeitalter), stellt die Probe an der Welt fest und urteilt ROT
// „Umfang nicht erzeugbar“ mit dem fehlenden Leser. Jede Änderung wird am Ende zurückgenommen (Bestand, Uhr, Jahr, Wetter, Feuer,
// Ohr, Lage des Spielers).
L.perspektive("erleben", (() => {
    const E = "erleben.kopplung.emergenz";
    const W = "erleben.kopplung.wahrnehmung";
    const B = "erleben.kopplung.bild";
    const KL = "erleben.kopplung.klang";
    const GS = "erleben.kopplung.geteilter-sinn";
    const EE = "erleben.kopplung.ein-ereignis";
    const EP = "erleben.kopplung.epoche-ganz";
    // DAS SOLL OHNE ZAHL IM WORT („höher als“, „unterscheidbar“, „in allen drei Sichten“): K.soll verlangt eine Zahl im Wort — dieses Wort
    // trägt keine, seine Bedingung ist ein Vergleich; das Wort steht wörtlich im Richter (sonst wirft es wie K.soll), die Zahl ist die des
    // Vergleichs (0 als Differenz, 1 als Ja), nie weicher als der Wortlaut
    const sollWort = (id, nr, wort, o) => {
        const r = K.sprosseVon(id, nr).richter;
        if (!r.includes(wort)) throw new Error("Soll „" + wort + "“ steht nicht wörtlich im Richter " + id + " S" + nr);
        if (K.zahlenIn(wort).length) throw new Error("das Wort „" + wort + "“ trägt eine Zahl — K.soll, nie sollWort");
        if (!["≥", "≤", ">", "<", "="].includes(o.rel) || !Number.isFinite(o.zahl)) throw new Error("sollWort " + id + " S" + nr + ": rel und zahl fehlen");
        return { wort, key: o.key, rel: o.rel, a: o.zahl, b: undefined, ref: undefined, refQuelle: undefined, einheit: o.einheit || "" };
    };
    const A = (name, werte, zeuge) => ({ name, roh: { werte, zeuge } });
    // der Zeuge der Welt als Liste von Bedingungen [feld, min, Grund]: jedes Feld der Antwort muss ≥ min sein
    const zeugeMin = (liste) => (roh) => {
        const z = roh.zeuge || {};
        for (const [feld, min, grund] of liste) if (!(typeof z[feld] === "number" && z[feld] >= min)) return grund + " (" + feld + " " + (z[feld] === undefined ? "fehlt" : z[feld]) + ", Soll ≥ " + min + ")";
        return null;
    };

    // ════════ erleben.kopplung.emergenz — die Kaskade im Blick ════════
    const ZE = { paare: 8, woelfeMit: 2.4, woelfeOhne: 0, hirscheMehr: 8, jungStreuung: 0.9, imKegel: 1 };
    const zeugeKaskade = zeugeMin([
        ["paare", 1, "kein Paar mit ↔ ohne Wölfe gefahren"],
        ["woelfeMit", 0.5, "im Gegenlauf (mit Wölfen) lebt kein Wolf im Tal — die Ursache fehlt"],
        ["ohneGekappt", 1, "die Wölfe sind im Lauf ohne Wölfe nicht gekappt"],
        ["hirscheMehr", 1, "ohne Wölfe nirgends mehr Hirsche — das mittlere Glied fehlt"],
        ["jungStreuung", 1e-9, "der Jungwuchs trägt keine Streuung (eine Konstante, nicht der Bestand)"],
    ]);
    const ZK = { paare: 8, woelfeMit: 2.4, ohneGekappt: 1, hirscheMehr: 8, jungStreuung: 0.9, imKegel: 1 };

    // ════════ erleben.kopplung.ein-ereignis — das Feuer in Bild und Ohr ════════
    const ZF = { feuer: 20, imBild: 20, gestillt: 20, panStreuung: 0.4, ohr: 20 };

    return {
        leitern: {
            // ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
            // EMERGENZ: die trophische Kaskade über den Bestand der nahen Regionen (der Weg der Linse diag-kreatur-leben „kaskade“): das Tal
            // abseits des Genesis-Orts, je Saat 6 Spielstunden (2 160 Takte × 10 s) mit Wölfen und ihr Gegenlauf ohne Wölfe; der Jungwuchs ist
            // die Äsung des Tals (`_kreaturBestand(…).deer.K`). Dazu der Planet-Faden über 10⁴ Jahre an 100 Saaten, der Bestand der Siedlung,
            // die Leser der Welt für Markt und Stadt-Ereignis. Bilder schießt nur das Gerät (M.auge).
            [E]: {
                sek: 60,
                faecher: true,
                dorf: true,
                mutiert: true,
                pfad: ["stamm/kreatur-leben.js", "stamm/kreatur-fauna.js", "tetrapoda-core.js", "stamm/siedlung-bewohner.js", "stamm/siedlung-ort.js", "stamm/feld-brand.js", "planet-core.js", "voxel-worker.js", "stamm/gelaende-chunks.js", "scripts/werkbank.cjs"],
                ungefahren: "die Bildpaare (S1 Tal mit ↔ ohne Wölfe, S4 Siedlung vor ↔ nach, S5/S6 Prüfer und Gutachter) schießt nur das Gerät; headless schafft der Deckel weniger als 8 Saaten",
                mess: async function (H, U, M) {
                    const DECKEL = 60;
                    const S = (fn, a) => H.seite("return await (" + String(fn) + ")(r, T, " + JSON.stringify(a || {}) + ");");
                    const kurz = (e) => String((e && e.message) || e).slice(0, 220);
                    const roh = {};
                    for (const nr of Object.keys(U)) roh[nr] = { werte: {}, zeuge: {} };
                    const welt = async (r, T, a) => {
                        const s = r.state;
                        const namen = new Set();
                        for (let p = Object.getPrototypeOf(r); p && p !== Object.prototype; p = Object.getPrototypeOf(p)) for (const k of Object.getOwnPropertyNames(p)) namen.add(k);
                        const such = (q) => [...namen].filter((k) => q.test(k));
                        const sied = r._bewohnerSiedlungen ? [...r._bewohnerSiedlungen.values()] : [];
                        const bew = sied.flatMap((x) => x.liste || []);
                        const S0 = sied[0];
                        return {
                            markt: such(/preis|auszug|^_?markt/i),
                            stadtEreignis: such(/seuche|revolte|epidemie|aufruhr/i),
                            bewohner: bew.length,
                            rollen: [...new Set(bew.map((b) => b.rolle))].length,
                            siedlungen: sied.length,
                            dorf: S0 ? { x: S0.ox, z: S0.oz, y: r.getTerrainHeightAt(S0.ox, S0.oz) } : null,
                            fernM: s.camera ? s.camera.far : 0,
                        };
                    };
                    const planet = async (r, T, a) => {
                        await r._fadenQuelle();
                        return Promise.all(a.saaten.map(async (samen) => {
                            const an = await r._planetAuftrag({ type: "planet-anker", samen });
                            const B = (an.breite * 180) / Math.PI;
                            const L = (an.laenge * 180) / Math.PI;
                            const o = await Promise.all([0, a.zeitMa].map((zeitMa) => r._planetAuftrag({ type: "planet-ort", samen, breite: B, laenge: L, zeitMa })));
                            return { samen, k0: o[0].kuesteKm, k1: o[1].kuesteKm, h0: o[0].hoeheM, felder: Object.keys(o[1]).concat(Object.keys(o[1].delta || {})) };
                        }));
                    };
                    const kaskade = async (r, T, a) => {
                        const s = r.state;
                        const pm = s.playerMesh.position;
                        const boden = (x, z) => r.getTerrainHeightAt(x, z) + 0.5;
                        if (a.stufe === "start") {
                            window.__erlebenKaskade = { pos: pm.clone(), spielZeit: s.spielZeit, fb: s.faunaBestand, lf: s.lifeField, fl: s.faunaLifecycle, seq: s._creatureNetSeq, stroeme: r._faunaStroeme, kreaturen: new Set(s.creatures), leichname: new Set(s.leichname || []), max: s.maxCreatures };
                            const park = () => r._bestandNah().flatMap((k) => r._bestandFeld(k).zellen).filter((c) => r._genesisFlaeche(c.x, c.z)).length;
                            let x = pm.x;
                            let schritte = 0;
                            while (park() && schritte < 8) {
                                x -= r._bestandSeite();
                                pm.set(x, boden(x, pm.z), pm.z);
                                schritte++;
                            }
                            s.maxCreatures = 20;
                            return { x: pm.x, z: pm.z, schritte, park: park() };
                        }
                        if (a.stufe === "ende") {
                            const alt = window.__erlebenKaskade;
                            if (!alt) return { ende: "nichts zu räumen" };
                            for (const c of s.creatures.slice()) if (!alt.kreaturen.has(c)) r.removeCreature(c);
                            for (const c of (s.leichname || []).slice()) if (!alt.leichname.has(c)) r.removeCreature(c);
                            Object.assign(s, { spielZeit: alt.spielZeit, faunaBestand: alt.fb, lifeField: alt.lf, faunaLifecycle: alt.fl, _creatureNetSeq: alt.seq, maxCreatures: alt.max });
                            r._faunaStroeme = alt.stroeme;
                            pm.copy(alt.pos);
                            delete window.__erlebenKaskade;
                            return { kreaturen: s.creatures.length };
                        }
                        const t0 = performance.now();
                        const rng = new Proxy(Object.create(null), { get: (o, k) => o[k] || (o[k] = r._streamRng("bestand-" + a.saat + "-" + String(k))) });
                        r._faunaStroeme = { seed: s.worldMeta.seed, rng };
                        [s._creatureNetSeq, s.spielZeit, s.faunaLifecycle] = [1e4 * a.saat, 0, { lastTick: 0 }];
                        [s.lifeField, s.faunaBestand] = [];
                        const nah = r._bestandNah();
                        for (const k of nah) r._bestandRegion(k, false).t = 0;
                        const K = (k) => r._kreaturBestand(null, k).deer.K;
                        const tal = nah.reduce((x, y) => (K(y) > K(x) ? y : x));
                        const zahl = (g) => {
                            const R = s.faunaBestand.regionen[tal];
                            return R ? R.tiere.filter((t) => t.g === g).length : 0;
                        };
                        const nimm = () => {
                            for (const R of r._bestandNah().map((key) => s.faunaBestand.regionen[key]).filter(Boolean))
                                for (const t of R.tiere.filter((t) => t.g === "wolf")) {
                                    const c = t.leib;
                                    if (c) (r._bestandAus(c), r.removeCreature(c));
                                    else R.tiere.splice(R.tiere.indexOf(t), 1);
                                }
                        };
                        const ARTEN = ["deer", "wolf", "fox", "bear"];
                        const spur = [];
                        let stunde1 = null;
                        let wechsel = 0;
                        let vor = null;
                        const ende = { jung: 0, hirsche: 0, woelfe: 0, n: 0 };
                        for (let k = 0; k < a.takte; k++) {
                            s.spielZeit += 10;
                            r.tickFaunaLifecycle();
                            if (a.ohne) nimm();
                            for (const c of (s.leichname || []).slice()) r.removeCreature(c);
                            r._todLageTick();
                            if (k % 60 === 59) {
                                const z = ARTEN.map(zahl);
                                if (vor) wechsel += z.filter((v, i) => v !== vor[i]).length;
                                vor = z;
                                if (k < 360) spur.push(z);
                            }
                            if (k === 359) stunde1 = { jung: K(tal), hirsche: zahl("deer"), woelfe: zahl("wolf") };
                            if (k >= a.takte - 60) {
                                ende.jung += K(tal);
                                ende.hirsche += zahl("deer");
                                ende.woelfe += zahl("wolf");
                                ende.n++;
                            }
                        }
                        const zellen = r._bestandFeld(tal).zellen;
                        const c = { x: zellen.reduce((q, z) => q + z.x, 0) / zellen.length, z: zellen.reduce((q, z) => q + z.z, 0) / zellen.length };
                        const y = r.getTerrainHeightAt(c.x, c.z);
                        const n = Math.max(1, ende.n);
                        // der Sichtkegel der Pose (150 m westlich der Mitte, Blick auf die Mitte): der Anteil der Äsungs-Zellen des Tals in
                        // seinem waagrechten Öffnungswinkel (fov und Seitenverhältnis der Kamera der Welt)
                        const px = c.x - 150;
                        const halb = Math.atan(Math.tan(((s.camera.fov || 75) * Math.PI) / 360) * (s.camera.aspect || 16 / 9));
                        const imKegel = zellen.filter((q) => Math.abs(Math.atan2(q.z - c.z, q.x - px)) <= halb).length / zellen.length;
                        return {
                            saat: a.saat, ohne: !!a.ohne, tal, ms: Math.round(performance.now() - t0), stunde1, spur, wechsel, imKegel,
                            ende: { jung: ende.jung / n, hirsche: ende.hirsche / n, woelfe: ende.woelfe / n },
                            pose: { px, py: r.getTerrainHeightAt(px, c.z) + 25, pz: c.z, lx: c.x, ly: y, lz: c.z },
                        };
                    };
                    let w = {};
                    try {
                        w = await S(welt, {});
                    } catch (e) {
                        w = { fehler: kurz(e) };
                    }
                    // S6 im Faden NEBEN der Kaskade (der Planet-Faden rechnet, während die Seite die Takte zählt): 100 Saaten, Küste heute ↔
                    // vor 10⁴ Jahren; abgeholt nach der Kaskade
                    const saaten = [];
                    for (let i = 0; i < 100; i++) saaten.push("same-saat-" + i);
                    let P = [];
                    let pf = null;
                    const planetLos = async (r, T, a) => {
                        window.__erlebenPlanet = (async () => {
                            try {
                                return { liste: await (0, eval)("(" + a.fn + ")")(r, T, a) };
                            } catch (e) {
                                return { fehler: String((e && e.message) || e).slice(0, 200) };
                            }
                        })();
                        return true;
                    };
                    const planetHol = async (r, T, a) => {
                        const p = window.__erlebenPlanet;
                        delete window.__erlebenPlanet;
                        return p ? await p : { fehler: "kein Auftrag" };
                    };
                    const uhr = { start: M.uhr() };
                    try {
                        await S(planetLos, { fn: String(planet), saaten, zeitMa: -0.01 });
                    } catch (e) {
                        pf = kurz(e);
                    }
                    // die Kaskade: je Saat mit Wölfen und ohne (der Gegenlauf), solange der Deckel reicht; dann Saat 1 noch einmal (1 h) für S7
                    const laeufe = [];
                    let tal = null;
                    let wieder = null;
                    let kf = null;
                    try {
                        tal = await S(kaskade, { stufe: "start" });
                        uhr.kaskade = M.uhr();
                        // S1 AM FÄCHER (M4): 8 Saaten × mit ↔ ohne Wölfe (der Gegenlauf), je Adresse die Kaskade des Bestands über 6
                        // Spielstunden (stamm/kreatur-leben.js tickFaunaLifecycle, 2160 Takte à 10 s); die Frist des Fächers ist der Rest des
                        // Deckels — was sie reißt, steht gezählt als ungemessen, nie geraten
                        const zugabe = 14000;
                        const frist = Math.max(1000, (DECKEL - 8 - M.uhr()) * 1000 - zugabe);
                        const RK = await FAECHER((c) => H.seite(c), {
                            gesetz: { fn: "async (r, T, a, mit) => (" + String(kaskade) + ")(r, T, { saat: a.saat, takte: mit.takte, ohne: !!a.zeit.ohne })", export: "stamm/kreatur-leben.js tickFaunaLifecycle (der Bestand je Saat-Strom r._streamRng) · r._kreaturBestand(…).deer.K (die Äsung = der Jungwuchs)", leser: "stamm/kreatur-leben.js _kreaturFrass (der Fraß am Jungwuchs) · tetrapoda-core BESTAND_GESETZ (Riss der Jäger)" },
                            adressen: { saaten: 8, zeiten: [{ k: "mit" }, { k: "ohne", ohne: 1 }] },
                            mit: { takte: 2160 },
                            ms: frist,
                            zugabe,
                            masse: { laeufe: { wie: "anzahl", feld: "saat" } },
                            schlecht: { feld: "ende.jung", richtung: "max" },
                            pose: (q, x) => x.pose,
                            ungemessen: ["das Bildpaar mit ↔ ohne Wölfe (am Gerät)"],
                        });
                        const je = {};
                        for (const x of RK.je) (je[x.a.saat] = je[x.a.saat] || { saat: x.a.saat })[x.a.zeit.k] = x.w;
                        laeufe.push(...Object.values(je));
                        uhr.akte = RK.akte;
                        uhr.gerissen = RK.gerissen;
                        const dauer = RK.je.length ? RK.ms / 1000 / RK.je.length : 0;
                        if (laeufe.length && M.uhr() + dauer / 6 + 2 < DECKEL - 3) wieder = await S(kaskade, { saat: 1, takte: 360 });
                    } catch (e) {
                        kf = kurz(e);
                    } finally {
                        await S(kaskade, { stufe: "ende" }).catch(() => null);
                    }
                    uhr.ende = M.uhr();
                    try {
                        const h = await S(planetHol, {});
                        P = h.liste || [];
                        pf = pf || h.fehler || null;
                    } catch (e) {
                        pf = pf || kurz(e);
                    }
                    uhr.planet = M.uhr();
                    const ok = laeufe.filter((l) => l.mit && l.ohne && l.mit.ende && l.ohne.ende && l.mit.stunde1 && l.ohne.stunde1);
                    const sd = (xs) => {
                        const m = xs.reduce((q, x) => q + x, 0) / (xs.length || 1);
                        return Math.sqrt(xs.reduce((q, x) => q + (x - m) * (x - m), 0) / (xs.length || 1));
                    };
                    const jungAlle = ok.flatMap((l) => [l.mit.ende.jung, l.ohne.ende.jung]);
                    const zk = {
                        paare: ok.length,
                        woelfeMit: ok.length ? Math.min(...ok.map((l) => l.mit.ende.woelfe)) : 0,
                        ohneGekappt: ok.length && ok.every((l) => l.ohne.ende.woelfe === 0) ? 1 : 0,
                        hirscheMehr: ok.filter((l) => l.ohne.ende.hirsche > l.mit.ende.hirsche).length,
                        jungStreuung: +sd(jungAlle).toFixed(4),
                        laufMs: ok.map((l) => [l.mit.ms, l.ohne.ms]),
                        jung: ok.map((l) => [+l.mit.ende.jung.toFixed(3), +l.ohne.ende.jung.toFixed(3)]),
                        hirsche: ok.map((l) => [+l.mit.ende.hirsche.toFixed(2), +l.ohne.ende.hirsche.toFixed(2)]),
                        tal: tal && { x: Math.round(tal.x), z: Math.round(tal.z), park: tal.park },
                        uhrS: Object.fromEntries(Object.entries(uhr).filter(([k, v]) => typeof v === "number" && k !== "gerissen").map(([k, v]) => [k, +v.toFixed(1)])),
                        akte: uhr.akte,
                        gerissen: uhr.gerissen,
                        fehler: kf,
                    };
                    const pose = ok.length ? ok[0].mit.pose : null;
                    // S1: Jungwuchs nach 6 Spielstunden ohne Wölfe dünner, gezählt über die Saaten
                    if (U[1]) {
                        // Wölfe weg → mehr Hirsche → weniger Jungwuchs (vision/blatt/28-sinn.md:62): das Minus des Jungwuchses ohne Wölfe gegen
                        // mit Wölfen, je Saat in Prozent der Deckung mit Wölfen, gemittelt über die gefahrenen Paare
                        const minus = ok.filter((l) => l.mit.ende.jung > 0).map((l) => (100 * (l.mit.ende.jung - l.ohne.ende.jung)) / l.mit.ende.jung);
                        roh[1] = { werte: ok.length ? { saaten: ok.filter((l) => l.ohne.ende.jung < l.mit.ende.jung).length, spielStunden: (2160 * 10) / 3600 } : {}, zeuge: zk };
                        if (minus.length) roh[1].werte.jungwuchsMinusProzent = +(minus.reduce((q, v) => q + v, 0) / minus.length).toFixed(2);
                        roh[1].auge = await M.auge("erleben-emergenz-s1", pose || { ort: "wiese" });
                    }
                    // S2: die Kette nach EINER Spielstunde (Wolf weg → Hirsche mehr → Jungwuchs dünner) im Sichtkegel der Pose am Tal
                    if (U[2]) {
                        const kette = (l) => l.ohne.stunde1.woelfe === 0 && l.mit.stunde1.woelfe > 0 && l.ohne.stunde1.hirsche > l.mit.stunde1.hirsche && l.ohne.stunde1.jung < l.mit.stunde1.jung;
                        roh[2] = {
                            werte: ok.length ? { ketten: ok.filter(kette).length, spielMin: (360 * 10) / 60 } : {},
                            zeuge: Object.assign({}, zk, { imKegel: ok.length ? +ok[0].mit.imKegel.toFixed(3) : 0, stunde1: ok.map((l) => [l.mit.stunde1, l.ohne.stunde1]) }),
                        };
                    }
                    // S3: die Ketten der Welt tragen Glieder aus 2 Domänen (Tier, Pflanze); ein Glied Wirtschaft (Preis, Auszug) fragt die Welt
                    if (U[3]) {
                        roh[3] = { werte: ok.length ? { kettenJeStunde: 0 } : {}, zeuge: Object.assign({}, zk, { domaenen: ok.length ? 2 : 0, markt: (w.markt || []).length }) };
                        if (!(w.markt || []).length) roh[3].nicht = "kein Glied aus Wirtschaft und Siedlung: die Welt trägt keinen Preis, keinen Markt, keinen Auszug — ihre Ketten haben 2 Domänen (Tier, Pflanze), gemessen an " + ok.length + " Saaten";
                    }
                    // S4: die Bewohner der nahen Siedlung (Ort und Rolle je Haus); ein Gesetz, das sie über Tage versetzt, fragt die Welt
                    if (U[4]) {
                        const d = w.dorf;
                        roh[4] = { werte: { bewohner: w.bewohner || 0, rollen: w.rollen || 0 }, zeuge: { bewohner: w.bewohner || 0, siedlungen: w.siedlungen || 0 } };
                        roh[4].nicht = "kein Gesetz versetzt Bewohner über Tage an einen anderen Ort oder in eine andere Rolle (Rolle = Haus, Ort = Bindung) — im Umkreis " + (w.bewohner || 0) + " Bewohner, " + (w.rollen || 0) + " Rollen, " + (w.siedlungen || 0) + " Siedlungen";
                        roh[4].auge = await M.auge("erleben-emergenz-s4", d ? { px: d.x + 30, py: d.y + 12, pz: d.z + 30, lx: d.x, ly: d.y, lz: d.z } : { ort: "dorf" });
                    }
                    // S5: was die Welt ohne Tat geschehen lässt — gezählt die Wechsel im Bestand des Tals über 6 h (ohne Eingriff)
                    if (U[5]) {
                        roh[5] = { werte: ok.length ? { wechselOhneTat: ok.reduce((q, l) => q + l.mit.wechsel, 0) } : {}, zeuge: { paare: ok.length, stadtEreignis: (w.stadtEreignis || []).length } };
                        if (!(w.stadtEreignis || []).length) roh[5].nicht = "keine Seuche, keine Revolte; der Brand zündet nur an einer Tat (_brandEntfachen aus Kampf und Fahrt) — eine Stadt formt sich nie ohne Spieler um";
                        roh[5].auge = await M.auge("erleben-emergenz-s5", { ort: "stadt" });
                    }
                    // S6: der Planet über 10⁴ Jahre an 100 Saaten — Küste heute ↔ vor 10⁴ Jahren, und welche Glieder der Faden trägt
                    if (U[6]) {
                        const felder = [...new Set(P.flatMap((p) => p.felder))];
                        const glieder = felder.filter((f) => /vulkan|stadt|krieg|siedlung/i.test(f));
                        roh[6] = { werte: { saaten: P.length, kuesteGeaendert: P.filter((p) => Math.abs(p.k1 - p.k0) > 1e-6).length }, zeuge: { saaten: P.length, streuungM: +sd(P.map((p) => p.h0)).toFixed(1), felder, fehler: pf } };
                        if (!glieder.length) roh[6].nicht = "der Planet-Faden trägt über 10⁴ Jahre nur " + felder.filter((f) => /klima|meer|wetter|wuchs|wildnis/.test(f)).join(", ") + " — keinen Vulkan, keine Stadt, keinen Krieg (gefragt " + P.length + " Saaten)";
                        roh[6].auge = await M.auge("erleben-emergenz-s6", pose || { ort: "wiese" });
                    }
                    // S7: der Ereignis-Graph der ersten Stunde (je 10 min Bestand je Art) zweier Saaten; Gegenlauf: dieselbe Saat zweimal
                    if (U[7]) {
                        const graph = (spur) => new Set((spur || []).flatMap((z, b) => z.map((v, i) => b + ":" + i + ":" + v)));
                        const jac = (x, y) => {
                            const u = new Set([...x, ...y]);
                            if (!u.size) return 1;
                            let n = 0;
                            for (const q of x) if (y.has(q)) n++;
                            return n / u.size;
                        };
                        const ga = ok[0] ? graph(ok[0].mit.spur) : null;
                        const gb = ok[1] ? graph(ok[1].mit.spur) : null;
                        const gw = wieder ? graph(wieder.spur) : null;
                        roh[7] = {
                            werte: ga && gb ? { aehnlichkeit: +jac(ga, gb).toFixed(4) } : {},
                            zeuge: { saaten: ok.length, gegen: ga && gw ? +jac(ga, gw).toFixed(4) : -1, ereignisse: ga ? ga.size : 0 },
                        };
                    }
                    return { sprossen: roh };
                },
                sprossen: {
                    1: {
                        u: {},
                        soll: [
                            K.soll(E, 1, "nach 6 Spielstunden", { key: "spielStunden", rel: "≥", zahl: 6, einheit: "h" }),
                            K.soll(E, 1, "Jungwuchs sichtbar dünner über ≥ 8 Saaten", { key: "saaten", einheit: "Saaten" }),
                            K.soll(E, 1, "Jungwuchs sichtbar dünner", { key: "jungwuchsMinusProzent", rel: ">", zahl: 0, refQuelle: "der Richter: „Jungwuchs sichtbar dünner“ — Wölfe weg → mehr Hirsche → weniger Jungwuchs (vision/blatt/28-sinn.md:62): die Jungwuchs-Deckung ohne Wölfe liegt unter der mit Wölfen (Minus > 0 %)", einheit: "%" }),
                        ],
                        // ZAHL (auge-klasse.cjs): die Zahl urteilt, das Bild ist Beleg — der Zeuge ist die Kaskade selbst
                        zeuge: zeugeKaskade,
                        auge: { pose: "150 m westlich der Mitte des Tals der Kaskade, 25 m über dem Boden (das Tal mit der größten Äsung des Rotwilds abseits des Genesis-Orts), Blick auf seine Mitte", vorbild: "Bildpaar desselben Orts mit ↔ ohne Wölfe nach 6 Spielstunden (Prüfer-Satz R11)" },
                        taeter: "stamm/kreatur-leben.js tickFaunaLifecycle (die Kaskade des Bestands)",
                        gruen: { werte: { saaten: 8, spielStunden: 6, jungwuchsMinusProzent: 25 }, zeuge: ZK },
                        attrappen: [
                            A("acht Saaten aus einer Tabelle, kein Lauf", { saaten: 8, spielStunden: 6, jungwuchsMinusProzent: 25 }, { paare: 0 }),
                            A("Mutant: ohne Wölfe dichter (Jungwuchs −12 %)", { saaten: 8, spielStunden: 6, jungwuchsMinusProzent: -12 }, ZK),
                            A("drei Saaten statt acht (die Frist riss den Rest)", { saaten: 3, spielStunden: 6, jungwuchsMinusProzent: 25 }, ZK),
                        ],
                    },
                    2: {
                        u: {},
                        soll: [K.soll(E, 2, "Ketten mit ≥ 3 Gliedern im Sichtkegel ≥ 1", { key: "ketten", rel: "≥", zahl: 1 }), K.soll(E, 2, "Spielgang 60 min", { key: "spielMin", rel: "≥", zahl: 60, einheit: "min" })],
                        zeuge: (roh) => zeugeKaskade(roh) || (roh.zeuge && roh.zeuge.imKegel >= 0.5 ? null : "weniger als die Hälfte des Tals der Kette liegt im Sichtkegel der Pose (" + (roh.zeuge && roh.zeuge.imKegel) + ")"),
                        taeter: "stamm/kreatur-leben.js tickFaunaLifecycle (die Kaskade des Bestands)",
                        gruen: { werte: { ketten: 2, spielMin: 60 }, zeuge: ZK },
                        attrappen: [A("eine Kette als Zahl ohne Gegenlauf (keine Wölfe im Lauf mit Wölfen)", { ketten: 2, spielMin: 60 }, Object.assign({}, ZK, { woelfeMit: 0 })), A("die Kette ohne Tal im Blick", { ketten: 2, spielMin: 60 }, Object.assign({}, ZK, { imKegel: 0 }))],
                    },
                    3: {
                        u: {},
                        soll: [K.soll(E, 3, "Ketten mit Gliedern aus ≥ 3 Domänen je Stunde im Blick ≥ 10", { key: "kettenJeStunde", rel: "≥", zahl: 10 })],
                        zeuge: (roh) => zeugeKaskade(roh) || zeugeMin([["domaenen", 3, "die Ketten tragen Glieder aus weniger als 3 Domänen"]])(roh),
                        taeter: "stamm/siedlung-bewohner.js _bewohnerSoll (kein Glied Wirtschaft)",
                        nicht: "kein Preis, kein Markt, kein Auszug in der Welt",
                        leser: "stamm/siedlung-bewohner.js:2219 _bewohnerSoll — liest keinen Preis, keinen Vorrat, keinen Markt (Dürre → Ernte → Preis → Auszug hat kein Glied Siedlung)",
                        gruen: { werte: { kettenJeStunde: 12 }, zeuge: Object.assign({}, ZK, { domaenen: 4 }) },
                        attrappen: [A("zwölf Ketten aus 2 Domänen als drei gezählt", { kettenJeStunde: 12 }, Object.assign({}, ZK, { domaenen: 2 }))],
                    },
                    4: {
                        u: {},
                        soll: [K.soll(E, 4, "≥ 10² Bewohner an anderem Ort oder in anderer Rolle", { key: "bewohnerGeaendert", einheit: "Bewohner" })],
// ZAHL (auge-klasse.cjs): die Zahl urteilt, das Bild ist Beleg — der Zeuge verlangt die Welt hinter der Zahl
                        zeuge: (roh) => { const z = roh.zeuge || {}; if (!(typeof z.bewohner === "number" && z.bewohner >= 100)) return "keine 10² Bewohner in der Welt (bewohner " + (z.bewohner === undefined ? "fehlt" : z.bewohner) + ", Soll ≥ 100)"; if (!(typeof z.siedlungen === "number" && z.siedlungen >= 1)) return "keine Siedlung (siedlungen " + (z.siedlungen === undefined ? "fehlt" : z.siedlungen) + ", Soll ≥ 1)"; return null; },
                        auge: { pose: "aus 30 m Höhe schräg über der Mitte der nahen Siedlung, Blick auf ihren Platz (vor ↔ nach)", vorbild: "Bildpaar vor ↔ nach über Tage: leere Häuser, neue Stände (Prüfer-Satz R11)" },
                        taeter: "stamm/siedlung-bewohner.js _bewohnerListe (Rolle und Bindung fest)",
                        nicht: "kein Gesetz versetzt Bewohner über Tage",
                        leser: "stamm/siedlung-bewohner.js:458 _bewohnerListe — setzt Rolle und Bindung je Haus einmal; kein Gesetz versetzt sie über Tage (Auszug, Rollenwechsel)",
                        gruen: { werte: { bewohnerGeaendert: 140 }, zeuge: { bewohner: 1100, siedlungen: 3 } },
                        attrappen: [A("140 Umzüge als Zahl", { bewohnerGeaendert: 140 }, { bewohner: 0 })],
                    },
                    5: {
                        u: {},
                        soll: [K.soll(E, 5, "≥ 3 Ereignisse", { key: "ereignisse", einheit: "Ereignisse" })],
                        auge: { pose: "Ego am Messort stadt nach 10 Spielstunden ohne Eingriff", vorbild: "Blind-Spieler nennt ungefragt ≥ 3 Ereignisse, die er nicht verursachte (Prüfer-Satz R11)" },
                        taeter: "stamm/feld-brand.js _brandEntfachen (nur an einer Tat)",
                        nicht: "keine Seuche, keine Revolte, kein Brand ohne Tat",
                        leser: "stamm/feld-brand.js:440 _brandEntfachen — rufen nur Taten (stamm/kampf.js:2446 _brandEntfachen, stamm/koerper-fahrt.js:2355 _brandEntfachen); kein Leser für Seuche oder Revolte",
                        gruen: { werte: { ereignisse: 4 }, zeuge: { paare: 1, stadtEreignis: 3 } },
                        attrappen: [A("vier Ereignisse vom Blatt", { ereignisse: 4 }, { paare: 0 })],
                    },
                    6: {
                        u: {},
                        soll: [K.soll(E, 6, "N = 100 Saaten", { key: "saaten", rel: "≥", zahl: 100 }), K.soll(E, 6, "plausible Geschichten ≥ 90 %", { key: "plausibelProzent", einheit: "%" })],
                        auge: { pose: "Ego am Tal der Kaskade (je Saat am Ort der Geschichte; heute nur die Saat der Sitzung)", vorbild: "Gutachter werten 100 Geschichten Vulkan → Küste → Stadt → Krieg (Prüfer-Satz R11)" },
                        taeter: "planet-core.js planetOrt (kein Vulkan, keine Stadt, kein Krieg im Faden)",
                        nicht: "der Planet-Faden trägt keine Stadt und keinen Krieg",
                        leser: "planet-core.js:2684 planetOrt — delta trägt Klima, Meer, Wetter, Wuchs, Wildnis; kein Vulkan, keine Stadt, kein Krieg",
                        gruen: { werte: { saaten: 100, plausibelProzent: 93 }, zeuge: { saaten: 100, streuungM: 2400 } },
                        attrappen: [A("100 Geschichten ohne Faden", { saaten: 100, plausibelProzent: 93 }, { saaten: 0 })],
                    },
                    7: {
                        u: {},
                        soll: [sollWort(E, 7, "Ähnlichkeit erlebter Ereignis-Graphen zweier Saaten < Ähnlichkeit zweier Durchläufe eines geskripteten AAA-Titels", { key: "aehnlichkeit", rel: "<", zahl: 1 })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.saaten >= 2)) return "nur " + (z.saaten || 0) + " Saaten gefahren (Soll 2)";
                            if (z.gegen !== 1) return "dieselbe Saat zweimal ergibt nicht denselben Graphen (Gegenlauf " + z.gegen + ") — der Unterschied ist Rauschen, nicht die Saat";
                            if (!(z.ereignisse > 0)) return "der Graph trägt keine Ereignisse";
                            const w = (roh.werte || {}).aehnlichkeit;
                            if (!(typeof z.aaa === "number" && z.aaa > 0 && z.aaa <= 1)) return "die Vergleichszahl fehlt: die Ähnlichkeit zweier Durchläufe eines geskripteten AAA-Titels ist nicht gemessen (Richter unklar) — gemessen nur die Welt, " + w;
                            if (!(w < z.aaa)) return "Ähnlichkeit " + w + " nicht unter der des AAA-Titels " + z.aaa;
                            return null;
                        },
                        taeter: "stamm/kreatur-leben.js tickFaunaLifecycle (der Bestand je Saat)",
                        unklar: "Die Ähnlichkeit zweier Durchläufe eines geskripteten AAA-Titels als Zahl einfrieren (gemessen an einem Titel, sonst gilt 1 = gleicher Graph).",
                        gruen: { werte: { aehnlichkeit: 0.3 }, zeuge: { saaten: 2, gegen: 1, ereignisse: 24, aaa: 0.85 } },
                        attrappen: [
                            A("Ähnlichkeit 0,3 aus Rauschen (dieselbe Saat zweimal verschieden)", { aehnlichkeit: 0.3 }, { saaten: 2, gegen: 0.4, ereignisse: 24, aaa: 0.85 }),
                            A("eine Saat", { aehnlichkeit: 0.3 }, { saaten: 1, gegen: 1, ereignisse: 24, aaa: 0.85 }),
                            A("ohne Vergleich mit dem AAA-Titel", { aehnlichkeit: 0.3 }, { saaten: 2, gegen: 1, ereignisse: 24 }),
                            A("ähnlicher als der AAA-Titel", { aehnlichkeit: 0.9 }, { saaten: 2, gegen: 1, ereignisse: 24, aaa: 0.85 }),
                        ],
                    },
                },
            },

            // ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
            // WAHRNEHMUNG (S2–S6; S1 trägt g2.js witterungJagd): das Kitz allein auf der Wiese, dreimal 5 s Kreatur-Takt — zweimal unter dem
            // Wind der Welt (das Rauschen), einmal mit gedrehtem Wind (der Gegenlauf; `_windAt` gezählt: liest die Beute ihn?); die Bestäuber
            // über ihren Takt (`_bestaeuberTakt`, Blüten der Nah-Streu); die Gattungen des Bestands; Laternen und Gäste; die Vogelstimme des
            // Gesetzes mit ↔ ohne Lärm in der Lage; der Stern an 20 Saaten des Planet-Fadens.
            [W]: {
                sek: 25,
                faecher: true,
                mutiert: true,
                pfad: ["stamm/kreatur-verhalten.js", "stamm/kreatur-fauna.js", "stamm/kreatur-leben.js", "tetrapoda-core.js", "klang-core.js", "stamm/klang.js", "stamm/siedlung-ort.js", "planet-core.js", "voxel-worker.js"],
                ungefahren: "das Bildpaar zweier Sterne (S6) schießt nur das Gerät",
                mess: async function (H, U, M) {
                    const S = (fn, a) => H.seite("return await (" + String(fn) + ")(r, T, " + JSON.stringify(a || {}) + ");");
                    const kurz = (e) => String((e && e.message) || e).slice(0, 220);
                    const sinne = async (r, T, a) => {
                        const s = r.state;
                        const pm = s.playerMesh.position;
                        const aus = {};
                        const dt = 1 / 60;
                        try {
                            r._bestaeuberTakt(dt);
                            r._bestaeuberTakt(dt);
                            const bl = r._bestaeuberBlueten();
                            aus.bestaeuber = { besuche: (r._bestaeuberListe || []).length, blueten: bl.reduce((n, e) => n + (e.n || 0), 0), aktiv: r._bestaeuberAktiv };
                        } catch (e) {
                            aus.bestaeuber = { fehler: String((e && e.message) || e).slice(0, 160) };
                        }
                        const g = new Set();
                        for (const R of Object.values((s.faunaBestand || {}).regionen || {})) for (const t of R.tiere || []) g.add(t.g);
                        aus.arten = { gattungen: [...g], voegel: (s.voegel || []).length, bestaeuber: (r._bestaeuberListe || []).length };
                        const lat = (s.architectures || []).filter((e) => e && /laterne/i.test(String(e.type || e.name || ""))).map((e) => e.position).filter(Boolean);
                        const gast = r._bestaeuberListe || [];
                        const nahe = (p) => gast.filter((v) => Math.hypot(v.x - p.x, v.z - p.z) < 6).length;
                        const G = AnazhRealm._umweltGesetz();
                        const park = { windFeld: 0.2, boe: 0.7, deckung: 0.5, regen: 0, sonne: 0.8, temperatur: 18, voegel: [{ d: 12, pan: 0 }] };
                        const laut = Object.assign({}, park, { deckung: 0, verkehr: 1, laerm: 1, laermDb: -10 });
                        const mp = G.kern.umweltMischung(park);
                        const ml = G.kern.umweltMischung(laut);
                        aus.stadt = { laternen: lat.length, insektenLaterne: lat.reduce((n, p) => n + nahe(p), 0), insektenDunkel: lat.reduce((n, p) => n + nahe({ x: p.x + 25, z: p.z + 25 }), 0), hzPark: mp.vogel.hz, hzLaut: ml.vogel.hz, dbPark: mp.vogel.db, dbLaut: ml.vogel.db };
                        return aus;
                    };
                    let w;
                    try {
                        w = await S(sinne, {});
                    } catch (e) {
                        w = { fehler: kurz(e) };
                    }
                    // S2 AM FÄCHER (M4): das Kitz an 5 Orten um den Spieler × drei Läufe (Wind, derselbe Wind = das Rauschen, gedrehter
                    // Wind über die Hülle `_windAt`, die den EINEN Wind dreht und jeden Ruf zählt). Je Adresse ein Leib, 300 Schritte des
                    // Kreatur-Takts (`_kreaturStossSchritt`, `_leibKontakte`, `updateCreatures`), allein in der Welt; die anderen Kreaturen,
                    // die Hülle und die Leichname kehren im finally zurück
                    const KITZ_AN = async (r, T, a, mit) => {
                        const s = r.state;
                        const pm = s.playerMesh.position;
                        const arr = s.creatures;
                        const andere = arr.splice(0, arr.length);
                        const leichAlt = new Set(s.leichname || []);
                        const eigen = Object.prototype.hasOwnProperty.call(r, "_windAt");
                        const windAlt = r._windAt;
                        const ort = { x: pm.x + a.ort[0], z: pm.z + a.ort[1] };
                        ort.y = r._voxelSurfaceY(ort.x, ort.z);
                        const dt = 1 / 60;
                        let rufe = 0;
                        try {
                            r._windAt = function () {
                                rufe++;
                                const w = windAlt.apply(this, arguments);
                                return a.zeit.dreh ? Object.assign({}, w, { x: -w.x, z: -w.z }) : w;
                            };
                            s.creatureAnimationTime = 100;
                            r._creatureAiFrame = 0;
                            const k = r.spawnCreatureAt(ort.x, ort.y, ort.z, "happy", "wesen", { precise: true, bodySize: 0.6 });
                            if (!k) return { fehlt: "kein Leib am Ort (spawnCreatureAt gab nichts)" };
                            k.userData.emotions = { joy: 0, awe: 0, sorrow: 0, hope: 0, peace: 0, chaos: 0 };
                            for (let i = 0; i < mit.schritte; i++) {
                                r._kreaturStossSchritt(dt);
                                r._leibKontakte();
                                r.updateCreatures(dt);
                            }
                            const p = [k.position.x, k.position.z];
                            r.removeCreature(k);
                            return { p, rufe, weg: Math.hypot(p[0] - ort.x, p[1] - ort.z) };
                        } finally {
                            if (eigen) r._windAt = windAlt;
                            else delete r._windAt;
                            for (const c of arr.slice()) r.removeCreature(c);
                            arr.splice(0, arr.length, ...andere);
                            for (const c of (s.leichname || []).slice()) if (!leichAlt.has(c)) r.removeCreature(c);
                        }
                    };
                    // je Ort der Abstand der Lagen: Wind ↔ gedrehter Wind (lageWind) gegen Wind ↔ derselbe Wind (Rauschen)
                    const paar = (aus, k1, k2) => {
                        const je = {};
                        for (const x of aus) (je[x.a.ort.join(",")] = je[x.a.ort.join(",")] || {})[x.a.zeit.k] = x.w.p;
                        const d = Object.values(je).filter((q) => q[k1] && q[k2]).map((q) => Math.hypot(q[k1][0] - q[k2][0], q[k1][1] - q[k2][1]));
                        return d.length ? d.reduce((q, v) => q + v, 0) / d.length : null;
                    };
                    let R2w = null;
                    if (U[2]) {
                        try {
                            R2w = await FAECHER((c) => H.seite(c), {
                                gesetz: { fn: KITZ_AN, export: "r.updateCreatures (der Kreatur-Takt) mit r._windAt als Hülle (gedreht, gezählt)", leser: "stamm/kreatur-furcht.js:119 witterung (NAT.noticeRadius × Furcht) · stamm/kreatur-verhalten.js:190 _creatureScentHuntDir (den Wind liest der Jäger)" },
                                adressen: { orte: [[40, 25], [-35, 30], [30, -40], [-45, -20], [60, 0]], zeiten: [{ k: "wind" }, { k: "rausch" }, { k: "dreh", dreh: 1 }] },
                                mit: { schritte: 300 },
                                ms: 12000,
                                masse: {
                                    laeufe: { wie: "anzahl", feld: "rufe" },
                                    windRufe: { wie: "summe", feld: "rufe" },
                                    lageWindM: { wie: (v, aus) => paar(aus, "wind", "dreh"), feld: "p" },
                                    lageRauschM: { wie: (v, aus) => paar(aus, "wind", "rausch"), feld: "p" },
                                    wegM: { wie: "mittel", feld: "weg" },
                                },
                                schlecht: { feld: "weg", richtung: "min" },
                                pose: (q) => "das Kitz am Ort +" + q.ort.join("/+") + " m (" + q.zeit.k + ") — Third 4 m hinter ihm, der Wind von vorn",
                                ungemessen: ["die Flucht im Bild (am Gerät)"],
                            });
                        } catch (e) {
                            R2w = { werte: {}, fehler: [{ fehler: kurz(e) }], akte: kurz(e) };
                        }
                    }
                    const roh = M.teil || {}; // die Knoten-Seite legt die Sprossen in M.teil, bevor das Auge (S6) kommt — nie die Seite
                    const k = (R2w && R2w.werte) || {};
                    if (U[2]) {
                        roh[2] = { werte: {}, zeuge: { laeufe: k.laeufe || 0, windRufe: k.windRufe, lageWindM: k.lageWindM, lageRauschM: k.lageRauschM, wegM: k.wegM, fehler: (R2w && R2w.fehler && R2w.fehler.length ? R2w.fehler[0].fehler : null) || w.fehler, akte: R2w && R2w.akte } };
                        if (k.laeufe >= 3 && Number.isFinite(k.lageWindM) && Number.isFinite(k.lageRauschM)) {
                            roh[2].werte.lageWindM = +k.lageWindM.toFixed(3);
                            if (!(k.windRufe > 0 && k.lageWindM > k.lageRauschM + 0.05)) roh[2].nicht = "die Beute wählt keine Lage gegen den Wind: der Kreatur-Takt rief _windAt in " + k.laeufe + " × 300 Schritten an 5 Orten " + k.windRufe + "×; mit gedrehtem Wind steht das Kitz nach 5 s im Mittel " + k.lageWindM.toFixed(2) + " m anders, im Rauschen zweier gleicher Läufe " + k.lageRauschM.toFixed(2) + " m (stamm/kreatur-furcht.js:119 witterung ist ein Kreis, kein Wind)";
                        }
                    }
                    const b = w.bestaeuber || {};
                    if (U[3]) {
                        roh[3] = { werte: Number.isFinite(b.besuche) ? { besuche: b.besuche } : {}, zeuge: { blueten: b.blueten || 0, besuche: b.besuche || 0, fehler: b.fehler } };
                        roh[3].nicht = "die Blüte trägt kein Saftmal: der Besuch des Bestäubers liest Wurf, Zeit, Aktivität, Feuchte und Leben, keine Farbe — Saftmal aus ist kein Gegenlauf der Welt (" + (b.besuche || 0) + " Besuche an " + (b.blueten || 0) + " Blüten)";
                    }
                    const ar = w.arten || {};
                    if (U[4]) {
                        const fm = (ar.gattungen || []).filter((x) => /bat|fledermaus|moth|motte/i.test(x));
                        roh[4] = { werte: { gattungen: (ar.gattungen || []).length }, zeuge: { gattungen: (ar.gattungen || []).length, liste: ar.gattungen } };
                        if (!fm.length) roh[4].nicht = "keine Fledermaus, keine Motte im Bestand (Gattungen: " + (ar.gattungen || []).join(", ") + "; dazu Vögel und Bestäuber)";
                    }
                    const st = w.stadt || {};
                    if (U[5]) {
                        roh[5] = { werte: {}, zeuge: { laternen: st.laternen || 0, hzPark: st.hzPark, hzLaut: st.hzLaut, dbPark: st.dbPark } };
                        if (Number.isFinite(st.hzPark) && Number.isFinite(st.hzLaut)) roh[5].werte.gesangHzDiff = st.hzLaut - st.hzPark;
                        if (st.insektenDunkel > 0) roh[5].werte.insektenFaktor = st.insektenLaterne / st.insektenDunkel;
                        roh[5].nicht = "Licht lockt keine Insekten (der Flug der Bestäuber liest kein Licht; " + (st.laternen || 0) + " Laternen im Umkreis) und Lärm verschiebt keinen Gesang (Vogelstimme laut " + st.hzLaut + " Hz = Park " + st.hzPark + " Hz)";
                    }
                    // S6 AM FÄCHER (M4): 40 Saaten — je Planet der Anker des Fadens (voxel-worker.js:1435 planetAnker, derselbe Weg wie die
                    // Reise): trägt er einen Stern (Typ, Spektrum, Leuchtkraft), und streut der Planet (Küste, Breite)
                    let sn = {};
                    if (U[6]) {
                        const STERN_AN = async (r, T, a) => {
                            await r._fadenQuelle();
                            const an = await r._planetAuftrag({ type: "planet-anker", samen: a.saat });
                            const f = Object.keys(an || {});
                            return { stern: f.some((q) => /stern|spektr|teff|leucht/i.test(q)) ? 1 : 0, felder: f.join("·"), breite: an.breite, kueste: an.kuesteKm };
                        };
                        try {
                            const R6w = await FAECHER((c) => H.seite(c), {
                                gesetz: { fn: STERN_AN, export: "voxel-worker.js:1435 planetAnker (planet-anker) über r._planetAuftrag", leser: "planet-core.js:2585 planetAnker — Vegetationsfarbe und Augen lesen keinen Stern" },
                                adressen: { saaten: Array.from({ length: 40 }, (_, i) => "same-saat-" + i), zeiten: [{ k: "heute" }] },
                                ms: 15000,
                                masse: { planeten: { wie: "anzahl", feld: "stern" }, mitStern: { wie: "summe", feld: "stern" }, felder: { wie: "erste", feld: "felder" }, breiten: { wie: "verschieden", feld: "breite" } },
                                ungemessen: ["das Bildpaar zweier Sterne (am Gerät)"],
                            });
                            sn = { planeten: R6w.werte.planeten, mitStern: R6w.werte.mitStern, felder: String(R6w.werte.felder || "").split("·"), breiten: R6w.werte.breiten, akte: R6w.akte };
                        } catch (e) {
                            sn = Object.assign({}, sn, { fehler: kurz(e) });
                        }
                        roh[6] = { werte: { paare: Math.floor((sn.planeten || 0) / 2) }, zeuge: { planeten: sn.planeten || 0, mitStern: sn.mitStern || 0, felder: sn.felder, breiten: sn.breiten, akte: sn.akte, fehler: sn.fehler } };
                        if (!(sn.mitStern > 0)) roh[6].nicht = "der Planet trägt keinen Stern-Typ (voxel-worker.js:1435 planet-anker an " + (sn.planeten || 0) + " Saaten: " + (sn.felder || []).join(", ") + ") — Augen und Blütenfarben lesen keinen";
                        roh[6].auge = await M.auge("erleben-wahrnehmung-s6", { ort: "wiese" });
                    }
                    return { sprossen: roh };
                },
                sprossen: {
                    2: {
                        u: {},
                        soll: [K.soll(W, 2, "Beute mit Wind-Wahl überlebt ≥ 1,5×", { key: "ueberlebenFaktor", einheit: "×" })],
                        zeuge: zeugeMin([["laeufe", 15, "nicht 5 Orte × drei Läufe des Kitzes (Wind, Rauschen, gedrehter Wind)"], ["windRufe", 1, "der Kreatur-Takt liest den Wind nie"], ["lageWindM", 0.05, "gedrehter Wind ändert die Lage der Beute nicht"]]),
                        taeter: "stamm/kreatur-furcht.js _creatureWarinessSpieler (die Witterung der Beute ohne Wind)",
                        nicht: "die Beute wählt keine Lage gegen den Wind",
                        leser: "stamm/kreatur-furcht.js:119 witterung — die Witterung der Beute ist ein Kreis (NAT.noticeRadius × Furcht), kein Wind; den Wind liest nur der Jäger (stamm/kreatur-verhalten.js:190 _creatureScentHuntDir)",
                        gruen: { werte: { ueberlebenFaktor: 1.7 }, zeuge: { laeufe: 15, windRufe: 4500, lageWindM: 4.2, lageRauschM: 0.1 } },
                        attrappen: [A("Überleben 1,7× ohne Lauf", { ueberlebenFaktor: 1.7 }, { laeufe: 0 }), A("Überleben 1,7×, aber der Wind ändert nichts", { ueberlebenFaktor: 1.7 }, { laeufe: 3, windRufe: 0, lageWindM: 0 })],
                    },
                    3: {
                        u: {},
                        soll: [K.soll(W, 3, "Saftmal aus → Bestäubung −≥ 30 %", { key: "bestaeubungMinusProzent", rel: "≥", zahl: 30, einheit: "%" }), K.soll(W, 3, "N = 50 Saaten: bienenbestäubte Blüten mit Saftmal im Bienenspektrum ≥ 0,6", { key: "saftmalAnteil", rel: "≥", zahl: 0.6 })],
                        zeuge: zeugeMin([["blueten", 1, "keine gezeichnete Blüte im Ring"], ["besuche", 1, "kein Besuch eines Bestäubers"], ["saaten", 50, "weniger als 50 Saaten"]]),
                        taeter: "tetrapoda-core.js bestaeuberBesuch (kein Saftmal)",
                        nicht: "die Blüte trägt kein Saftmal",
                        leser: "tetrapoda-core.js:2975 bestaeuberBesuch — (h, t, aktiv, feuchte, B, out, leben) liest keine Blütenfarbe und kein UV-Saftmal",
                        gruen: { werte: { bestaeubungMinusProzent: 41, saftmalAnteil: 0.7 }, zeuge: { blueten: 120, besuche: 30, saaten: 50 } },
                        attrappen: [A("41 % ohne Blüte und Gast", { bestaeubungMinusProzent: 41, saftmalAnteil: 0.7 }, { blueten: 0, besuche: 0, saaten: 50 })],
                    },
                    4: {
                        u: {},
                        soll: [K.soll(W, 4, "Motten mit Gehör: Fangquote −≥ 30 %", { key: "fangMinusProzent", rel: "≥", zahl: 30, einheit: "%" })],
                        zeuge: zeugeMin([["fledermaeuse", 1, "keine Fledermaus im Bestand"], ["motten", 1, "keine Motte im Bestand"]]),
                        taeter: "tetrapoda-core.js (keine Fledermaus, keine Motte)",
                        nicht: "keine Fledermaus, keine Motte",
                        leser: "tetrapoda-core.js:62 GATTUNGEN — die Gattungen des Bestands sind Wolf, Fuchs, Bär, Hirsch; keine Fledermaus mit Echo, keine hörende Motte",
                        gruen: { werte: { fangMinusProzent: 35 }, zeuge: { fledermaeuse: 12, motten: 400 } },
                        attrappen: [A("Fangquote −35 % ohne Tiere", { fangMinusProzent: 35 }, { fledermaeuse: 0, motten: 0 })],
                    },
                    5: {
                        u: {},
                        soll: [K.soll(W, 5, "Insektendichte an Laternen ≥ 3× gegen dunkle Straße", { key: "insektenFaktor", einheit: "×" }), sollWort(W, 5, "Gesangsfrequenz in lauter Straße höher als im Park", { key: "gesangHzDiff", rel: ">", zahl: 0, einheit: "Hz" })],
                        zeuge: zeugeMin([["laternen", 1, "keine Laterne im Umkreis"], ["insektenDunkel", 1, "keine Insekten an der dunklen Straße (kein Bezug)"]]),
                        taeter: "tetrapoda-core.js bestaeuberBahn (kein Licht) · klang-core.js umweltMischung (fester Vogel-Ton)",
                        nicht: "Licht lockt keine Insekten, Lärm verschiebt keinen Gesang",
                        leser: "tetrapoda-core.js:2987 bestaeuberBahn — liest kein Licht; klang-core.js:929 Sv.hz — die Vogelstimme singt mit fester Frequenz, die Lage am Ohr trägt keinen Lärm",
                        gruen: { werte: { insektenFaktor: 4.1, gesangHzDiff: 380 }, zeuge: { laternen: 12, insektenDunkel: 9 } },
                        attrappen: [A("Faktor 4,1 ohne Laterne", { insektenFaktor: 4.1, gesangHzDiff: 380 }, { laternen: 0, insektenDunkel: 0 })],
                    },
                    6: {
                        u: {},
                        soll: [K.soll(W, 6, "N = 20 Paare ≥ 0,8", { key: "anteil", rel: "≥", zahl: 0.8 }), K.soll(W, 6, "N = 20 Paare", { key: "paare", rel: "≥", zahl: 20 })],
// ZAHL (auge-klasse.cjs): die Zahl urteilt, das Bild ist Beleg — der Zeuge verlangt die Welt hinter der Zahl
                        zeuge: (roh) => { const z = roh.zeuge || {}; if (!(typeof z.planeten === "number" && z.planeten >= 20)) return "zu wenige Planeten gemessen (planeten " + (z.planeten === undefined ? "fehlt" : z.planeten) + ", Soll ≥ 20)"; if (!(typeof z.mitStern === "number" && z.mitStern >= 20)) return "die Planeten tragen keinen Stern-Typ (mitStern " + (z.mitStern === undefined ? "fehlt" : z.mitStern) + ", Soll ≥ 20)"; return null; },
                        auge: { pose: "Ego am Messort wiese je Planet (roter ↔ heller Stern; heute nur der Stern der Sitzung)", vorbild: "Bildpaar zweier Planeten: Vegetationsfarbe und Augenspektren gesetzmäßig verschieden (Prüfer-Satz R11)" },
                        taeter: "planet-core.js planetPlan (kein Stern-Typ)",
                        nicht: "der Planet trägt keinen Stern-Typ",
                        leser: "planet-core.js:2585 planetAnker (voxel-worker.js:1435) — Ort und Anker des Planeten tragen keinen Stern-Typ; Vegetationsfarbe und Augen lesen keinen",
                        gruen: { werte: { anteil: 0.85, paare: 20 }, zeuge: { planeten: 40, mitStern: 40 } },
                        attrappen: [A("0,85 ohne Stern", { anteil: 0.85, paare: 20 }, { planeten: 0, mitStern: 0 })],
                    },
                },
            },

            // ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
            // BILD (S2–S6; S1 trägt g3.js KOPPLUNG_PROBE): je Sprosse das Bild an der festen Pose für das Panel (2AFC, R11) — und was die Welt
            // davon in EIN Bild stellen kann, gefragt an ihren Lesern am Ort der Pose (Wald `_forestStandDensity`, Wasser `_nassAt`, Siedlung
            // `settlementCells`, Abendlicht und Nacht über die EINE Uhr, Küste über den Planet-Faden am Anker, Lichter, Front, Lava).
            [B]: {
                sek: 15,
                mutiert: true,
                pfad: ["stamm/bild-himmel.js", "stamm/bild-sicht.js", "stamm/vegetation-*.js", "stamm/wasser-*.js", "stamm/siedlung-*.js", "stamm/gelaende-chunks.js", "planet-core.js", "scripts/werkbank.cjs"],
                ungefahren: "alle Bilder (Panel-2AFC) schießt nur das Gerät; headless nur die Leser der Welt am Ort der Pose",
                mess: async function (H, U, M) {
                    const S = (fn, a) => H.seite("return await (" + String(fn) + ")(r, T, " + JSON.stringify(a || {}) + ");");
                    const kurz = (e) => String((e && e.message) || e).slice(0, 220);
                    const phaen = async (r, T, a) => {
                        const s = r.state;
                        const namen = new Set();
                        for (let p = Object.getPrototypeOf(r); p && p !== Object.prototype; p = Object.getPrototypeOf(p)) for (const k of Object.getOwnPropertyNames(p)) namen.add(k);
                        const such = (q) => [...namen].filter((k) => q.test(k));
                        const alt = s.timeOfDay;
                        let abend = null;
                        let nacht = null;
                        try {
                            r.setTimeOfDay(0.78, "regler");
                            abend = r._sonnenRichtung().y;
                            r.setTimeOfDay(0.02, "regler");
                            nacht = r._sonnenRichtung().y;
                        } finally {
                            r.setTimeOfDay(alt, "regler");
                        }
                        await r._fadenQuelle();
                        const an = await r._planetAnker();
                        const zellen = Object.keys((s.worldMeta || {}).settlementCells || {});
                        const lage = (k) => {
                            const m = /@(-?[0-9.]+),(-?[0-9.]+)/.exec(k);
                            return m ? { x: +m[1], z: +m[2] } : null;
                        };
                        const arch = (s.architectures || []).filter((e) => e && e.position);
                        const orte = {};
                        for (const [name, p] of Object.entries(a.orte)) {
                            let wald = 0;
                            let nass = 0;
                            let lava = 0;
                            let n = 0;
                            for (let i = 0; i < 36; i++) {
                                const w = i * 2.39996;
                                const d = 400 * Math.sqrt((i + 0.5) / 36);
                                const x = p.x + d * Math.cos(w);
                                const z = p.z + d * Math.sin(w);
                                try {
                                    wald = Math.max(wald, r._forestStandDensity(x, z));
                                    if (r._nassAt(x, z)) nass++;
                                    lava = Math.max(lava, r._lavaDeckeAt(x, z) || 0);
                                    n++;
                                } catch (e) {
                                    /* ein Ort ohne Leser zählt nicht */
                                }
                            }
                            const dorfM = zellen.map(lage).filter(Boolean).reduce((m, q) => Math.min(m, Math.hypot(q.x - p.x, q.z - p.z)), Infinity);
                            const nah = arch.filter((e) => Math.hypot(e.position.x - p.x, e.position.z - p.z) < 400);
                            const typ = (e) => String(e.type || e.name || "");
                            orte[name] = {
                                wald: +wald.toFixed(3), nass, lava: +lava.toFixed(3), proben: n, dorfM: Number.isFinite(dorfM) ? Math.round(dorfM) : null,
                                lichter: nah.filter((e) => /laterne|lampe/i.test(typ(e))).length, glut: nah.filter((e) => /glut|feuer/i.test(typ(e))).length,
                            };
                        }
                        return {
                            orte, abend, nacht, kuesteKm: an.kuesteKm, siedlungen: zellen.length,
                            front: such(/front/i).filter((k) => !/brand/i.test(k)),
                            gewitter: such(/blitz|donner|gewitter/i).length,
                            fahne: such(/fahne|rauchsaeule|aschewolke/i).length,
                        };
                    };
                    let w;
                    try {
                        w = await S(phaen, { orte: { dorf: { x: -841, z: -861 }, stadt: { x: 400, z: 400 }, gipfel: { x: -433.6, z: -3146.4 }, wiese: { x: -280.4, z: -1045.6 } } });
                    } catch (e) {
                        w = { fehler: kurz(e), orte: {} };
                    }
                    const o = w.orte || {};
                    const j = (b) => (b ? 1 : 0);
                    const roh = {};
                    const liste = (nr, ph) => {
                        const da = Object.keys(ph).filter((k) => ph[k]);
                        const fehlt = Object.keys(ph).filter((k) => !ph[k]);
                        roh[nr].werte.phaenomene = da.length;
                        roh[nr].zeuge = { phaenomene: da.length, da, fehlt, fehler: w.fehler };
                        return fehlt;
                    };
                    if (U[2]) {
                        roh[2] = { werte: {} };
                        const d = o.dorf || {};
                        const f = liste(2, { dorf: d.dorfM !== null && d.dorfM < 300, wald: d.wald > 0.3, wasser: d.nass > 0, himmel: Number.isFinite(w.abend) });
                        if (f.length) roh[2].nicht = "am Messort dorf fehlt " + f.join(", ") + " in EINEM Bild (Wald " + d.wald + ", nass " + d.nass + "/" + d.proben + ", Siedlung " + d.dorfM + " m)";
                        roh[2].auge = await M.auge("erleben-bild-s2", { ort: "dorf" });
                    }
                    const st = o.stadt || {};
                    const p8 = (q) => ({ stadt: q.dorfM !== null && q.dorfM < 300, kueste: w.kuesteKm < 5, meer: w.kuesteKm < 5, wetterfront: (w.front || []).length > 0, abendlicht: w.abend > -0.05 && w.abend < 0.3, wald: q.wald > 0.3, wasser: q.nass > 0, himmel: Number.isFinite(w.abend) });
                    if (U[3]) {
                        roh[3] = { werte: {} };
                        const f = liste(3, p8(st));
                        if (f.length) roh[3].nicht = "am Messort stadt fehlt " + f.join(", ") + " (die Küste des Ankers liegt " + Math.round(w.kuesteKm) + " km fern; das Wetter ist ein Wort für die ganze Welt, keine Front)";
                        roh[3].auge = await M.auge("erleben-bild-s3", { ort: "stadt" }, { uhr: 0.78 });
                    }
                    if (U[4]) {
                        roh[4] = { werte: {} };
                        const g = o.gipfel || {};
                        const q8 = p8(g);
                        const p16 = Object.assign({}, q8, { vulkan: g.lava > 0, glut: g.lava > 0 || g.glut > 0, fahne: w.fahne > 0, kuestenstadt: q8.kueste && q8.stadt, lichter: g.lichter > 0, spiegelung: g.nass > 0, gewitter: w.gewitter > 0, nacht: w.nacht < -0.2 });
                        const f = liste(4, p16);
                        if (f.length) roh[4].nicht = "am Messort gipfel-blick fehlen von 16 Phänomenen " + f.join(", ") + " (Lava " + g.lava + ", Lichter " + g.lichter + ", Siedlung " + g.dorfM + " m) — kein Vulkan mit Fahne an einer Küstenstadt, kein Gewitter";
                        roh[4].auge = await M.auge("erleben-bild-s4", { ort: "gipfel-blick" }, { uhr: 0.02 });
                    }
                    if (U[5]) {
                        roh[5] = { werte: { saaten: 1 }, zeuge: { saaten: 1, posen: 1 } };
                        roh[5].nicht = "nur die Saat der Sitzung: eine andere Saat ist eine andere Welt (die Reise tauscht die Welt), 100 Zufallssaaten stehen nie in einer Fahrt";
                        roh[5].auge = await M.auge("erleben-bild-s5", { ort: "wiese" });
                    }
                    if (U[6]) {
                        roh[6] = { werte: {}, zeuge: { fremdeWelten: 0 } };
                        roh[6].nicht = "keine fremde Welt in der Sitzung (Mars, Titan): das Welt-Tor gebiert eine neue Welt, die Probe bleibt in der Welt der Sitzung";
                        roh[6].auge = await M.auge("erleben-bild-s6", { ort: "gipfel-blick" });
                    }
                    return { sprossen: roh };
                },
                sprossen: {
                    2: {
                        u: {},
                        soll: [K.soll(B, 2, "Panel-2AFC Spiel gegen Foto ähnlicher Landschaft ≤ 75 %", { key: "afcProzent", einheit: "%" })],
                        auge: { pose: "Ego am Messort dorf (spec/profiband/haushalt.json), Mittag", vorbild: "Fotos ähnlicher Landschaft mit Dorf, Wald, Wasser, Himmel (Panel-2AFC, R11)" },
                        taeter: "stamm/bild-himmel.js · stamm/vegetation-*.js · stamm/siedlung-*.js (das eine Bild)",
                        gruen: { werte: { afcProzent: 70, phaenomene: 4 }, zeuge: { phaenomene: 4 } },
                        attrappen: [A("70 % ohne Bild", { afcProzent: 70 }, { phaenomene: 0 })],
                    },
                    3: {
                        u: {},
                        soll: [K.soll(B, 3, "2AFC ≤ 65 %", { key: "afcProzent", einheit: "%" })],
                        auge: { pose: "Ego am Messort stadt, Uhr 0,78 (Abendlicht)", vorbild: "Fotos von Küstenstädten im Abendlicht mit Wetterfront (Panel-2AFC, R11)" },
                        taeter: "stamm/klang.js:410 _weatherFieldFor (keine Front) · planet-core.js (keine Küste am Ort)",
                        nicht: "keine Küste am Anker, keine Wetterfront",
                        leser: "stamm/klang.js:410 _weatherFieldFor — (this.state.weather) liest EIN Wort für die ganze Welt; keine Front, die über den Ort zieht",
                        gruen: { werte: { afcProzent: 60, phaenomene: 8 }, zeuge: { phaenomene: 8 } },
                        attrappen: [A("60 % ohne Bild", { afcProzent: 60 }, { phaenomene: 0 })],
                    },
                    4: {
                        u: {},
                        soll: [K.soll(B, 4, "2AFC ≤ 55 % gegen Fotos realer Vulkanküsten bei Nacht", { key: "afcProzent", einheit: "%" })],
                        auge: { pose: "Ego am Messort gipfel-blick, Uhr 0,02 (Nacht)", vorbild: "Fotos realer Vulkanküsten bei Nacht (Panel-2AFC, R11)" },
                        taeter: "stamm/siedlung-wege.js (Lava ohne Fahne) · kein Gewitter",
                        nicht: "kein Vulkan mit Fahne an einer Küstenstadt, kein Gewitter",
                        leser: "stamm/klang.js:474 _umweltLageZwei — die Welt trägt kein Gewitter (kein Blitz, kein Donner); die Lava (stamm/siedlung-wege.js:522 _lavaDeckeAt) hat keine Fahne",
                        gruen: { werte: { afcProzent: 52, phaenomene: 16 }, zeuge: { phaenomene: 16 } },
                        attrappen: [A("52 % ohne Bild", { afcProzent: 52 }, { phaenomene: 0 })],
                    },
                    5: {
                        u: {},
                        soll: [K.soll(B, 5, "Anteil, den ein Panel als Foto hält ≥ 0,4", { key: "fotoAnteil" })],
                        auge: { pose: "Ego am Messort wiese der Saat der Sitzung (je Saat × Pose × Uhr × Wetter × Epoche am Gerät)", vorbild: "Panel hält ≥ 0,4 der Bilder für Fotos (Zufall 0,5; R11)" },
                        taeter: "stamm/netz-portal.js _reiseBetreten (eine Saat je Welt)",
                        nicht: "nur die Saat der Sitzung",
                        leser: "stamm/netz-portal.js:660 _reiseBetreten — eine andere Saat ist eine andere Welt (die Reise tauscht die Welt); keine Pose über 100 Saaten in einer Sitzung",
                        gruen: { werte: { fotoAnteil: 0.45 }, zeuge: { saaten: 100 } },
                        attrappen: [A("0,45 ohne Bild", { fotoAnteil: 0.45 }, { saaten: 0 })],
                    },
                    6: {
                        u: {},
                        soll: [K.soll(B, 6, "2AFC gegen Sondenfotos (Mars, Titan) ≤ 55 %", { key: "afcProzent", einheit: "%" })],
                        auge: { pose: "Ego am Messort gipfel-blick (eine fremde Welt ist in der Sitzung nicht erzeugbar)", vorbild: "Sondenfotos von Mars und Titan (Panel-2AFC, R11)" },
                        taeter: "stamm/netz-portal.js _weltTorBetreten (fremde Welt nur als neue Welt)",
                        nicht: "keine fremde Welt in der Sitzung",
                        leser: "stamm/netz-portal.js:610 _weltTorBetreten — gebiert eine fremde Welt nur als neue Welt; kein Gesetz Mars/Titan im Ultiversum",
                        gruen: { werte: { afcProzent: 50 }, zeuge: { fremdeWelten: 1 } },
                        attrappen: [A("50 % ohne Bild", { afcProzent: 50 }, { fremdeWelten: 0 })],
                    },
                },
            },

            // ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
            // KLANG: der Abgriff ist der Graph des Ohrs (`um.graph.zensus()`), seine Eingabe die EINE Lage (`_umweltLage`). S1 die fünf Wetter
            // (Bild: die Deckkraft des Regens, Ohr: die Stimme regen; der Dachstoff als Eingabe der Mischung); S2 der Sturm als Ereignis
            // (Simulation: die Vögel `state.voegel`, Abgriff: der Chor, über die Zeit des Ohrs); S3 zehn Orte um den Spieler: jede hörbare
            // Stimme gegen ihre Quelle aus einem eigenen Leser (Waisen) und der Gegenlauf mit gekappten Quellen; S4 die Epochen der
            // Siedlungen (`_siedlungEpoche`) gegen die Stimmen des Gesetzes; S5/S6 die Zeitalter am Planet-Faden.
            [KL]: {
                faecher: true,
                // 60 s, die Grenze der Karte je Leiter (19.11.: 45 s riss an der frisch gestarteten Welt 1 — die Takte des Ohrs bauen dort
                // noch Chunks; an der warmen Welt 2 maß dieselbe Leiter alle sechs Sprossen)
                sek: 60,
                mutiert: true,
                pfad: ["stamm/klang.js", "klang-core.js", "stamm/kreatur-fauna.js", "stamm/bild-himmel.js", "stamm/siedlung-ort.js", "fachwerk-core.js", "planet-core.js", "voxel-worker.js"],
                ungefahren: "das Hören am Gerät (die Stimmen klingen headless in einem Audio-Kontext ohne Ausgabe); die Ticks laufen headless langsamer, die Zeit des Ohrs ist echt",
                mess: async function (H, U, M) {
                    const S = (fn, a) => H.seite("return await (" + String(fn) + ")(r, T, " + JSON.stringify(a || {}) + ");");
                    const kurz = (e) => String((e && e.message) || e).slice(0, 220);
                    const ohr = async (r, T, a) => {
                        const s = r.state;
                        if (a.an) {
                            const war = !!s.symphony.enabled;
                            window.__erlebenOhr = { war };
                            r._loopCamera(performance.now());
                            s.camera.updateMatrixWorld(true);
                            if (!war) r.initSymphony();
                            const ctx = s.symphony.ctx;
                            if (ctx && ctx.state !== "running") await ctx.resume();
                            return { war, ctx: ctx && ctx.state };
                        }
                        const w = window.__erlebenOhr;
                        if (w && !w.war) r.disposeSymphony();
                        delete window.__erlebenOhr;
                        return { sym: !!s.symphony.enabled };
                    };
                    const wetter = async (r, T, a) => {
                        const s = r.state;
                        const sym = s.symphony;
                        const um = sym.umwelt;
                        const G = AnazhRealm._umweltGesetz();
                        const warte = (ms) => new Promise((f) => setTimeout(f, ms));
                        const stimme = (n) => {
                            const g = um.graph.zensus().find((v) => v.name === n);
                            return g && g.an && Number.isFinite(g.db) ? g.db : -Infinity;
                        };
                        const takt = async (n) => {
                            for (let k = 0; k < n; k++) {
                                r._gameLoopTick(performance.now());
                                await warte(16);
                            }
                        };
                        const alt = s.weather;
                        const uhrAlt = s.timeOfDay;
                        const aus = { reihe: [], sturm: [] };
                        try {
                            // Mittag: der Chor singt (die Vögel des Hör-Kreises ruhen nachts) — die Uhr kehrt am Ende zurück
                            r.setTimeOfDay(0.5, "regler");
                            for (const w of a.wetter) {
                                window.__wetterSetzen(w);
                                await takt(a.takte);
                                const m = r._rainSystem && r._rainSystem.mesh;
                                aus.reihe.push({ w, rain: r._weatherFieldFor().rain, bild: m && m.visible ? m.material.opacity : 0, regen: stimme("regen") });
                            }
                            window.__wetterSetzen("sunny");
                            await takt(a.takte);
                            // der Gegenlauf: dieselbe Spanne ohne Ereignis (sonnig bleibt sonnig), dann das Ereignis (der Sturm) — je Takt die
                            // Zeit des Ohrs, die Vögel der Simulation, Chor und Regen am Abgriff
                            const reihe = async (wort, liste) => {
                                window.__wetterSetzen(wort);
                                const t0 = sym.ctx.currentTime;
                                for (let k = 0; k < a.sturmTakte; k++) {
                                    r._gameLoopTick(performance.now());
                                    await warte(16);
                                    liste.push([+(sym.ctx.currentTime - t0).toFixed(3), (s.voegel || []).length, stimme("vogel"), stimme("regen")]);
                                }
                            };
                            aus.ruhe = [];
                            await reihe("sunny", aus.ruhe);
                            await reihe("stormy", aus.sturm);
                        } finally {
                            window.__wetterSetzen(alt);
                            r.setTimeOfDay(uhrAlt, "regler");
                            await takt(3);
                        }
                        return aus;
                    };
                    // DAS GESETZ DES OHRS AN EINER ADRESSE (M4, der Fächer): a.zeit.s nennt die Sprosse. S1: die Mischung des Spiels
                    // (klang-core.js:917 regen, AnazhRealm._umweltGesetz().kern.umweltMischung) an der Lage des Ohrs (stamm/klang.js:408
                    // _umweltLage) mit der Regenstärke der Adresse und — trägt die Lage ein Feld des Dachs — dem Baustil des Orts
                    // (fachwerk-core.js:186 stil); trägt sie keins, nennt die Adresse ihr Fehlen. S2: der Welt-Akt des Ereignisses (die
                    // Effekte der DSL, stamm/feld-dsl.js:946). S3: das Ohr am Ort (der Spieler dorthin, der Hör-Ring, die Vögel, die Lage)
                    // — je hörbare Stimme ihre Quelle (Waisen) und der Gegenlauf mit gekappten Quellen; 100 Jahre fragt die Fähigkeit des
                    // Raffers. S4: die Epoche der Siedlung an der Lage. S5/S6: der Planet-Faden an Saat × Zeitalter
                    const OHR_AN = async (r, T, a, mit) => {
                        const s = r.state;
                        const G = AnazhRealm._umweltGesetz();
                        const UM = G.UMWELT;
                        const k = a.zeit.s;
                        const felder = (L, re) => Object.keys(L || {}).concat(Object.keys((L && L.raum) || {})).filter((f) => re.test(f));
                        const fx = (L, n) => Object.keys(r.dslEffects || {}).concat(Object.getOwnPropertyNames(Object.getPrototypeOf(r))).filter((f) => n.test(f));
                        if (k === 1) {
                            const L0 = r._umweltLage();
                            const L = Object.assign({}, L0, { regen: a.zeit.regen });
                            if (!a.zeit.dach) L.deckung = a.ort;
                            else if (a.zeit.regen > 0) {
                                const df = felder(L0, /dach|stoff|stil/i);
                                if (!df.length) return { fehlt: "kein Dachstoff am Ohr: stamm/klang.js:408 _umweltLage trägt " + Object.keys(L0).join("·") + " — keinen Stil des Baus (fachwerk-core.js:186); klang-core.js:917 regen liest regen und deckung" };
                                for (const f of df) if (f in L0) L[f] = a.ort; else L.raum = Object.assign({}, L0.raum, { [f]: a.ort });
                            }
                            const m = G.kern.umweltMischung(L).regen;
                            return { regen: a.zeit.regen, db: Number.isFinite(m.db) ? m.db : null, amp: Number.isFinite(m.db) ? Math.pow(10, m.db / 20) : 0, klang: Number.isFinite(m.db) ? m.db.toFixed(2) + "/" + Math.round(m.hz) : "stumm", stumm: Number.isFinite(m.db) ? 0 : 1 };
                        }
                        if (k === 2) {
                            if (a.ort === "sturm") return { da: typeof (r.dslEffects || {}).weather === "function" ? 1 : 0, akt: "weather stormy" };
                            const n = { beben: /beben|quake|erschuett/i, ausbruch: /ausbruch|erupt|vulkan/i, unfall: /unfall|crash|kollision/i }[a.ort];
                            const da = fx(null, n);
                            if (!da.length) return { fehlt: "kein Welt-Akt „" + a.ort + "“: stamm/feld-dsl.js:946 dslEffects kennt " + Object.keys(r.dslEffects || {}).slice(0, 24).join("·") + "; die Lage am Ohr stamm/klang.js:485 _umweltLageZwei trägt keine Menge (kein Schrei, keine Hupe)" };
                            return { da: 1, akt: da.join("·") };
                        }
                        if (k === 3) {
                            if (a.zeit.jahre > 0) {
                                const da = fx(null, /raffer|zeitraffer|jahreSprung|ortAltern/i);
                                if (!da.length) return { fehlt: "kein Raffer von 100 Jahren am Ort: stamm/netz-portal.js:660 _reiseBetreten — die Zeit eines Orts springt nur über die Reise in eine neue Welt; kein Akt altert den Ort" };
                                return { da: 1, akt: da.join("·") };
                            }
                            const pm = s.playerMesh.position;
                            const um = s.symphony.umwelt;
                            const alt = pm.clone();
                            try {
                                const x = mit.x + a.ort[0];
                                const z = mit.z + a.ort[1];
                                pm.set(x, r.getTerrainHeightAt(x, z) + AnazhRealm.PLAYER_FOOT_OFFSET, z);
                                r._umweltRingProbe(um, x, z, um.ring.punkte.length);
                                r._vogelTakt();
                                const L = r._umweltLage();
                                const mix = G.kern.umweltMischung(L);
                                const hoer = Object.keys(mix).filter((q) => mix[q].db >= UM.hoerschwelleDb);
                                const ring = [];
                                for (let i = 0; i < 16; i++) ring.push([x + 30 * Math.cos(i * 0.3927), z + 30 * Math.sin(i * 0.3927)]);
                                const fl = (r._hydroFor(x, z).rivers || []).flatMap((v) => v.points || []).reduce((m, p) => Math.min(m, Math.hypot(p.x - x, p.z - z)), Infinity);
                                const fa = (r._hydroFor(x, z).waterfalls || []).reduce((m, p) => Math.min(m, Math.hypot(p.x - x, p.z - z)), Infinity);
                                const glut = [...r._blockerMit("glut")].some((e) => e.position && Math.hypot(e.position.x - x, e.position.z - z) < UM.stimmen.glut.hoerweiteM);
                                const quelle = {
                                    wind: r._windAt(x, z, r._bildZeit).staerke > 0,
                                    laub: r._forestStandDensity(x, z) > 0 || r._kronenStreuAt(x, z) > 0,
                                    ufer: ring.some(([qx, qz]) => r._nassAt(qx, qz)) || r._nassAt(x, z),
                                    fluss: fl < UM.stimmen.fluss.hoerweiteM + 10,
                                    fall: fa < UM.stimmen.fall.hoerweiteM + 10,
                                    regen: r._weatherFieldFor().rain > 0,
                                    glut,
                                    vogel: (s.voegel || []).some((v) => Math.hypot(v.x - x, v.z - z) < 200),
                                    grille: L.temperatur > UM.stimmen.grille.tStumm && L.sonne < UM.stimmen.grille.nachtAb,
                                };
                                const gekappt = Object.assign({}, L, { voegel: [], deckung: 0, regen: 0, ufer: { d: Infinity, anteil: 0, pan: 0 }, fluss: { d: Infinity, tempo: 0, pan: 0 }, fall: { d: Infinity, hoehe: 0, pan: 0 }, glut: { d: Infinity, flaeche: 0, pan: 0 }, temperatur: -Infinity });
                                const m2 = G.kern.umweltMischung(gekappt);
                                const rest = Object.keys(m2).filter((q) => q !== "wind" && m2[q].db >= UM.hoerschwelleDb);
                                const waisen = hoer.filter((q) => !quelle[q]);
                                return { x: Math.round(x), z: Math.round(z), hoer, waisen, rest, nHoer: hoer.length, nWaisen: waisen.length, nRest: rest.length };
                            } finally {
                                pm.copy(alt);
                                r._umweltRingProbe(um, alt.x, alt.z, um.ring.punkte.length);
                                r._vogelTakt();
                            }
                        }
                        if (k === 4) {
                            const ep = r._siedlungEpoche(a.ort);
                            const L0 = r._umweltLage();
                            const ef = felder(L0, /epoch/i);
                            const es = Object.keys(UM.stimmen).filter((q) => /huf|dampf|motor|verbrenn|elektro|epoch|kutsche|glocke/i.test(q));
                            if (!ef.length && !es.length) return { fehlt: "die Lage am Ohr liest keine Epoche: stamm/klang.js:485 _umweltLageZwei trägt " + Object.keys(L0).join("·") + "; UMWELT.stimmen " + Object.keys(UM.stimmen).join("·") + " — keine Hufe, kein Dampf, kein Verbrenner (stamm/siedlung-ort.js:2006 _siedlungEpoche reicht nur ins Bild)", epoche: ep };
                            return { epoche: ep, felder: ef.length, stimmen: es.length };
                        }
                        await r._fadenQuelle();
                        const an = await r._planetAuftrag({ type: "planet-anker", samen: a.saat });
                        const o = await r._planetAuftrag({ type: "planet-ort", samen: a.saat, breite: (an.breite * 180) / Math.PI, laenge: (an.laenge * 180) / Math.PI, zeitMa: a.zeit.ma });
                        const f = Object.keys(o).concat(Object.keys(o.delta || {}));
                        const re = k === 5 ? /art|fauna|leben|tier/i : /art|fauna|leben|tier|medium|atmo|druck/i;
                        return { h: o.hoeheM, felder: f.length, arten: f.filter((q) => re.test(q)).length, wuchs: o.delta && o.delta.wuchs ? o.delta.wuchs.wald : null };
                    };
                    const F = (adressen, masse, leser, schlecht, mit, ms) =>
                        FAECHER((c) => H.seite(c), {
                            gesetz: { fn: OHR_AN, export: "klang-core.js:917 umweltMischung (AnazhRealm._umweltGesetz().kern) an stamm/klang.js:408 _umweltLage · stamm/feld-dsl.js:946 dslEffects · r._planetAuftrag planet-ort", leser },
                            adressen,
                            masse,
                            mit: mit || {},
                            ms: ms || 8000,
                            schlecht,
                            pose: (q) => "das Ohr an der Adresse " + JSON.stringify(q).slice(0, 60) + " (Third in Kopfhöhe)",
                            ungemessen: ["das Hören am Gerät (headless ohne Ausgabe)"],
                        });
                    const roh = {};
                    const FA = {};
                    let an = null;
                    let wt = null;
                    let or = null;
                    let fe = null;
                    try {
                        an = await S(ohr, { an: true });
                        if (U[1] || U[2]) wt = await S(wetter, { wetter: ["sunny", "cloudy", "foggy", "rainy", "stormy"], takte: 25, sturmTakte: 150 });
                        if (U[1]) {
                            const stile = ["alt", "modern", "huette", "stein", "glas", "klinker", "stroh"];
                            FA[1] = await F(
                                { orte: [0, 0.5, 1], zeiten: [0, 0.25, 0.5, 0.75, 1].map((regen) => ({ s: 1, regen })), dazu: stile.map((ort) => ({ ort, zeit: { s: 1, regen: 1, dach: 1 } })) },
                                {
                                    pegelR: { wie: (v) => { const p = v.filter((q) => q.every(Number.isFinite)); if (p.length < 3) return null; const mx = p.reduce((q, x) => q + x[0], 0) / p.length, my = p.reduce((q, x) => q + x[1], 0) / p.length; let a = 0, b = 0, c = 0; for (const [x, y] of p) { a += (x - mx) * (y - my); b += (x - mx) ** 2; c += (y - my) ** 2; } return b > 0 && c > 0 ? a / Math.sqrt(b * c) : null; }, x: "regen", y: "amp", nur: (q) => !q.zeit.dach },
                                    stummOhneRegen: { wie: "anteil", feld: "stumm", nur: (q) => !q.zeit.dach && q.zeit.regen === 0 },
                                    dachKlaenge: { wie: "verschieden", feld: "klang", nur: (q) => q.zeit.dach },
                                    dachOrte: { wie: "anzahl", feld: "klang", nur: (q) => q.zeit.dach },
                                },
                                "klang-core.js:917 regen (Sr.refDb + db(regen) + deckungDb · deck) — der Stimme am Ohr",
                                { feld: "amp", richtung: "max" }
                            );
                        }
                        if (U[3]) {
                            const p0 = await H.seite("const p = r.state.playerMesh.position; return { x: p.x, z: p.z };");
                            const O10 = [[0, 0], [40, 0], [-40, 0], [0, 40], [0, -40], [80, 60], [-80, -60], [120, -30], [-30, 120], [150, 150]];
                            FA[3] = await F(
                                { orte: O10, zeiten: [{ s: 3, jahre: 0 }, { s: 3, jahre: 100 }] },
                                { orte: { wie: "anzahl", feld: "nHoer", nur: (q) => q.zeit.jahre === 0 }, waisen: { wie: "summe", feld: "nWaisen" }, stimmen: { wie: "summe", feld: "nHoer" }, gegenRest: { wie: "summe", feld: "nRest" } },
                                "stamm/klang.js:408 _umweltLage → klang-core.js umweltMischung (je hörbare Stimme ihre Quelle am Ort) · stamm/netz-portal.js:660 _reiseBetreten",
                                { feld: "nWaisen", richtung: "max" },
                                p0,
                                20000
                            );
                            or = FA[3].je.filter((x) => x.a.zeit.jahre === 0).map((x) => x.w);
                        }
                        if (U[4]) {
                            FA[4] = await F(
                                { orte: Array.from({ length: 40 }, (_, i) => i + 1), zeiten: [{ s: 4 }] },
                                { epochen: { wie: "verschieden", feld: "epoche" }, epochStimmen: { wie: "summe", feld: "stimmen" }, epochFelder: { wie: "summe", feld: "felder" } },
                                "stamm/klang.js:485 _umweltLageZwei (die Lage am Ohr) · stamm/siedlung-ort.js:2006 _siedlungEpoche"
                            );
                        }
                    } catch (e) {
                        fe = kurz(e);
                    } finally {
                        await S(ohr, { an: false }).catch(() => null);
                    }
                    if (U[2]) {
                        try {
                            FA[2] = await F({ orte: ["sturm", "beben", "ausbruch", "unfall"], zeiten: [{ s: 2 }] }, { ereignisse: { wie: "summe", feld: "da" } }, "stamm/klang.js:485 _umweltLageZwei (die Lage am Ohr trägt das Ereignis) · stamm/feld-dsl.js:946 dslEffects");
                        } catch (e) {
                            fe = fe || kurz(e);
                        }
                    }
                    for (const nr of [5, 6]) {
                        if (!U[nr]) continue;
                        try {
                            const saaten = Array.from({ length: 10 }, (_, i) => "same-saat-" + (nr === 5 ? i : 10 + i));
                            const zeiten = (nr === 5 ? [-541, -359, -252, -66, -0.02, 0] : [-500, -66, 0]).map((ma) => ({ s: nr, ma }));
                            FA[nr] = await F(
                                { saaten, zeiten },
                                {
                                    antworten: { wie: "anzahl", feld: "h" },
                                    streuungM: { wie: (v) => { const z = v.filter(Number.isFinite); const m = z.reduce((q, x) => q + x, 0) / (z.length || 1); return Math.sqrt(z.reduce((q, x) => q + (x - m) ** 2, 0) / (z.length || 1)); }, feld: "h" },
                                    artenFelder: { wie: "max", feld: "arten" },
                                    zeitalter: { wie: "verschieden", feld: "a.zeit" },
                                    saaten: { wie: "verschieden", feld: "a.saat" },
                                    wuchs: { wie: "verschieden", feld: "wuchs" },
                                },
                                "planet-core.js:2684 planetOrt — delta trägt Klima, Meer, Wetter, Wuchs, Wildnis",
                                null,
                                null,
                                30000
                            );
                        } catch (e) {
                            fe = fe || kurz(e);
                        }
                    }
                    const pearson = (xs, ys) => {
                        const n = xs.length;
                        if (n < 3) return null;
                        const mx = xs.reduce((q, x) => q + x, 0) / n;
                        const my = ys.reduce((q, y) => q + y, 0) / n;
                        let sxy = 0;
                        let sxx = 0;
                        let syy = 0;
                        for (let i = 0; i < n; i++) {
                            sxy += (xs[i] - mx) * (ys[i] - my);
                            sxx += (xs[i] - mx) * (xs[i] - mx);
                            syy += (ys[i] - my) * (ys[i] - my);
                        }
                        return sxx > 0 && syy > 0 ? sxy / Math.sqrt(sxx * syy) : null;
                    };
                    const amp = (db) => (Number.isFinite(db) ? Math.pow(10, db / 20) : 0);
                    if (U[1]) {
                        const R = (wt && wt.reihe) || [];
                        const r = pearson(R.map((x) => x.bild), R.map((x) => amp(x.regen)));
                        roh[1] = {
                            werte: {},
                            zeuge: { wetter: R.length, trocken: R.filter((x) => x.rain === 0 && amp(x.regen) === 0).length, nass: R.filter((x) => x.rain > 0 && amp(x.regen) > 0).length, reihe: R.map((x) => [x.w, +(+x.rain).toFixed(3), +(+x.bild).toFixed(3), Number.isFinite(x.regen) ? +x.regen.toFixed(1) : null]), fehler: fe },
                        };
                        if (r !== null) roh[1].werte.r = +r.toFixed(4);
                        // der Fächer S1: die Stimme über Regen × Deckung (pegelR, der Gegenlauf ohne Regen stumm) und je Baustil der Klang
                        const f1 = FA[1];
                        if (f1) {
                            Object.assign(roh[1].zeuge, { pegelR: f1.werte.pegelR, stummOhneRegen: f1.werte.stummOhneRegen, dachOrte: f1.werte.dachOrte || 0, akte: f1.akte });
                            if (!f1.fehlt) roh[1].werte.dachKlaenge = f1.werte.dachKlaenge;
                            else roh[1].nicht = "der Regen klingt auf jedem Dach gleich: " + f1.fehlt + " — an " + f1.fehltAn.length + " Baustilen; die Stimme folgt Regen × Deckung (r " + (f1.werte.pegelR == null ? "—" : f1.werte.pegelR.toFixed(3)) + " an " + f1.gemessen + " Adressen)";
                        } else roh[1].nicht = "der Fächer des Dachs lief nicht" + (fe ? " (" + fe + ")" : "");
                    }
                    if (U[2]) {
                        // -∞ dB (stumm) reist als null durch JSON: zurück zu -∞
                        const dbz = (x) => (typeof x === "number" ? x : -Infinity);
                        const norm = (L) => (L || []).map((x) => [x[0], x[1], dbz(x[2]), dbz(x[3])]);
                        const Z = norm(wt && wt.sturm);
                        const R0 = norm(wt && wt.ruhe);
                        // eine Änderung der Klanglandschaft: Chor oder Regen ≥ 3 dB gegen den ersten Takt (auch: verstummt, setzt ein)
                        const anders = (x, b) => [2, 3].some((i) => (Number.isFinite(x[i]) || Number.isFinite(b[i])) && !(Number.isFinite(x[i]) && Number.isFinite(b[i]) && Math.abs(x[i] - b[i]) < 3));
                        const iOhr = Z.length ? Z.findIndex((x) => anders(x, Z[0])) : -1;
                        const ruhig = R0.length && !R0.some((x) => anders(x, R0[0])) ? 1 : 0;
                        // das Fenster um das Ereignis: die letzten 30 Takte davor (sonnig) und der Sturm — die Simulation reagiert im ersten Takt
                        // (die Vögel fliehen den Regen), der Abgriff folgt ihr; „vor“ ist der letzte Takt ohne Ereignis
                        const fenster = R0.slice(-30).concat(Z);
                        const r = pearson(fenster.map((x) => x[1]), fenster.map((x) => amp(x[2])));
                        const vor = R0.length ? R0[R0.length - 1] : null;
                        const v0 = vor ? vor[1] : 0;
                        const db0 = vor ? vor[2] : -Infinity;
                        const zeig = (L) => L.filter((x, i) => i % 10 === 0).map((x) => [x[0], x[1], Number.isFinite(x[2]) ? +x[2].toFixed(1) : null, Number.isFinite(x[3]) ? +x[3].toFixed(1) : null]);
                        roh[2] = { werte: {}, zeuge: { proben: Z.length, voegelVor: v0, voegelNach: Z.length ? Z[Z.length - 1][1] : 0, chorVor: Number.isFinite(db0) ? +db0.toFixed(1) : -999, ruhig, ruheProben: R0.length, sturm: zeig(Z), ruhe: zeig(R0) } };
                        if (r !== null) roh[2].werte.r = +r.toFixed(4);
                        if (iOhr >= 0) roh[2].werte.verzugS = Z[iOhr][0];
                        const f2 = FA[2];
                        if (f2) roh[2].zeuge.akte = f2.akte;
                        if (!f2 || f2.fehlt) roh[2].nicht = "kein Ausbruch, kein Beben, kein Unfall mit Klang-Folge" + (f2 ? ": " + f2.fehlt + " — an " + f2.fehltAn.map((q) => q.ort).join(", ") : "") + " · gemessen am Sturm, dem Ereignis der Welt";
                    }
                    if (U[3]) {
                        const O = or || [];
                        roh[3] = { werte: { waisen: O.reduce((q, x) => q + x.waisen.length, 0), orte: O.length }, zeuge: { orte: O.length, stimmen: O.reduce((q, x) => q + x.hoer.length, 0), gegenRest: O.reduce((q, x) => q + x.rest.length, 0), je: O.map((x) => [x.x, x.z, x.hoer.join("+"), x.waisen.join("+")]), fehler: fe } };
                        if (!O.length) roh[3].werte = {};
                        const f3 = FA[3];
                        if (f3) roh[3].zeuge.akte = f3.akte;
                        if (!f3 || f3.fehlt) roh[3].nicht = (f3 && f3.fehlt ? f3.fehlt : "kein Raffer von 100 Jahren am Ort") + "; keine Asche, keine wachsende Küste — die Waisen gemessen heute an " + O.length + " Orten";
                    }
                    if (U[4]) {
                        const f4 = FA[4];
                        const w4 = (f4 && f4.werte) || {};
                        const liste = f4 ? [...new Set(f4.je.map((x) => x.w.epoche).filter(Boolean))] : [];
                        roh[4] = { werte: {}, zeuge: { epochen: liste.length, liste, epochStimmen: w4.epochStimmen || 0, fehler: fe, akte: f4 && f4.akte } };
                        if (f4 && f4.fehlt) roh[4].nicht = f4.fehlt + " — an " + f4.fehltAn.length + " Siedlungen";
                        else if (!f4) roh[4].nicht = "der Fächer der Epochen lief nicht" + (fe ? " (" + fe + ")" : "");
                    }
                    for (const nr of [5, 6]) {
                        if (!U[nr]) continue;
                        const f = FA[nr];
                        const w = (f && f.werte) || {};
                        const z = { antworten: w.antworten || 0, streuungM: w.streuungM == null ? 0 : +w.streuungM.toFixed(1), artenFelder: w.artenFelder || 0, wuchs: w.wuchs, fehler: fe, akte: f && f.akte };
                        roh[nr] = nr === 5 ? { werte: { zeitalter: w.zeitalter || 0, saaten: w.saaten || 0 }, zeuge: z } : { werte: { planeten: w.saaten || 0, zeitalter: w.zeitalter || 0 }, zeuge: z };
                        if (!(w.artenFelder > 0))
                            roh[nr].nicht = (nr === 5 ? "der Planet-Faden trägt kein Arten-Inventar je Zeitalter" : "der Planet-Faden trägt weder Arten noch Medium (Luft, Vakuum) je Planet und Zeitalter") + " (planet-core.js:2684 planetOrt: " + (w.antworten || 0) + " Adressen, Saaten × Zeitalter " + (w.saaten || 0) + " × " + (w.zeitalter || 0) + ", 0 Arten-Felder) — " + (nr === 5 ? "der Vogel singt im Kambrium wie heute" : "der Klang kann ihnen nicht folgen");
                    }
                    return { sprossen: roh };
                },
                sprossen: {
                    1: {
                        u: {},
                        soll: [K.soll(KL, 1, "Regenstärke im Bild ↔ Pegel r ≥ 0,9", { key: "r" }), sollWort(KL, 1, "Regenklang je Dachstoff unterscheidbar", { key: "dachKlaenge", rel: ">", zahl: 1, einheit: "Klänge" })],
                        zeuge: zeugeMin([["wetter", 5, "nicht alle fünf Wetter gefahren"], ["trocken", 1, "kein Gegenlauf: kein trockenes Wetter ohne Regenstimme"], ["nass", 2, "der Regen trägt im Ohr keine Stimme"]]),
                        taeter: "klang-core.js umweltMischung (die Regenstimme ohne Dachstoff)",
                        nicht: "der Regen klingt auf jedem Dach gleich",
                        leser: "klang-core.js:917 regen — die Regenstimme liest regen und deckung, keinen Dachstoff (stamm/stoff-dach.js reicht keinen ans Ohr)",
                        gruen: { werte: { r: 0.97, dachKlaenge: 3 }, zeuge: { wetter: 5, trocken: 2, nass: 3 } },
                        attrappen: [A("r 0,97 ohne Gegenlauf", { r: 0.97, dachKlaenge: 3 }, { wetter: 5, trocken: 0, nass: 3 }), A("r 0,97 ohne Wetter", { r: 0.97, dachKlaenge: 3 }, { wetter: 0 })],
                    },
                    2: {
                        u: {},
                        soll: [K.soll(KL, 2, "ändern sich ≤ 2 s", { key: "verzugS", einheit: "s" }), K.soll(KL, 2, "folgen der Reaktion der Simulation r ≥ 0,8", { key: "r" })],
                        zeuge: zeugeMin([
                            ["proben", 10, "zu wenige Proben über den Sturm"],
                            ["voegelVor", 1, "vor dem Ereignis singt kein Vogel (keine Ursache)"],
                            ["chorVor", -64, "vor dem Ereignis klingt kein Chor"],
                            ["ruheProben", 10, "der Gegenlauf ohne Ereignis fehlt"],
                            ["ruhig", 1, "ohne Ereignis (Gegenlauf, sonnig) ändert sich die Klanglandschaft ebenso — die Änderung ist nicht die Folge des Ereignisses"],
                        ]),
                        taeter: "stamm/klang.js _umweltLageZwei (kein Ausbruch, kein Beben, keine Menge)",
                        nicht: "kein Ausbruch, kein Beben, kein Unfall am Ohr",
                        leser: "stamm/klang.js:485 _umweltLageZwei — trägt kein Beben, keinen Ausbruch, keine Menge (Schrei, Flucht, Hupe)",
                        gruen: { werte: { verzugS: 0.4, r: 0.92 }, zeuge: { proben: 30, voegelVor: 14, chorVor: -41, ruheProben: 30, ruhig: 1 } },
                        attrappen: [
                            A("Verzug 0,4 s ohne Vögel", { verzugS: 0.4, r: 0.92 }, { proben: 30, voegelVor: 0, chorVor: -41, ruheProben: 30, ruhig: 1 }),
                            A("die Klanglandschaft wechselt auch ohne Ereignis", { verzugS: 0.4, r: 0.92 }, { proben: 30, voegelVor: 14, chorVor: -41, ruheProben: 30, ruhig: 0 }),
                        ],
                    },
                    3: {
                        u: {},
                        soll: [K.soll(KL, 3, "Raffer 100 Jahre an 10 Orten", { key: "orte", rel: "≥", zahl: 10 }), K.soll(KL, 3, "0 Waisen", { key: "waisen", rel: "=", zahl: 0 })],
                        zeuge: zeugeMin([["orte", 10, "weniger als 10 Orte"], ["stimmen", 10, "zu wenige hörbare Stimmen an den Orten"]]),
                        taeter: "stamm/netz-portal.js _reiseBetreten (kein Raffer am Ort)",
                        nicht: "kein Raffer von 100 Jahren am Ort",
                        leser: "stamm/netz-portal.js:660 _reiseBetreten — die Zeit eines Orts springt nur über die Reise in eine neue Welt; der Ort selbst altert nicht um 100 Jahre",
                        gruen: { werte: { orte: 10, waisen: 0 }, zeuge: { orte: 10, stimmen: 31, gegenRest: 0 } },
                        attrappen: [A("0 Waisen ohne Orte", { orte: 10, waisen: 0 }, { orte: 0, stimmen: 0 })],
                    },
                    4: {
                        u: {},
                        soll: [K.soll(KL, 4, "Epochenfahrt: 0 anachronistische Quellen", { key: "anachronismen", rel: "=", zahl: 0 }), K.soll(KL, 4, "Epoche nur am Abgriff erkannt ≥ 80 %", { key: "erkanntProzent", einheit: "%" })],
                        zeuge: zeugeMin([["epochen", 3, "weniger als drei Epochen in der Welt"], ["epochStimmen", 1, "keine Stimme liest die Epoche"]]),
                        taeter: "stamm/klang.js _umweltLageZwei (liest keine Epoche)",
                        nicht: "die Lage am Ohr liest keine Epoche",
                        leser: "stamm/klang.js:485 _umweltLageZwei — die Lage am Ohr liest keine Epoche der Siedlung (fachwerk-core.js:4495 siedlungsEpoche reicht nur ins Bild); UMWELT.stimmen ohne Hufe, Dampf, Verbrenner",
                        gruen: { werte: { anachronismen: 0, erkanntProzent: 84 }, zeuge: { epochen: 5, epochStimmen: 6 } },
                        attrappen: [A("84 % ohne Epochen-Stimme", { anachronismen: 0, erkanntProzent: 84 }, { epochen: 5, epochStimmen: 0 })],
                    },
                    5: {
                        u: {},
                        soll: [K.soll(KL, 5, "6 Zeitalter", { key: "zeitalter", rel: "≥", zahl: 6 }), K.soll(KL, 5, "10 Saaten", { key: "saaten", rel: "≥", zahl: 10 }), K.soll(KL, 5, "0 Anachronismen", { key: "anachronismen", rel: "=", zahl: 0 })],
                        zeuge: zeugeMin([["antworten", 60, "weniger als 60 Antworten des Planet-Fadens"], ["streuungM", 1e-6, "die Antworten tragen keine Streuung"], ["artenFelder", 1, "der Faden trägt kein Arten-Inventar"]]),
                        taeter: "planet-core.js planetOrt (kein Arten-Inventar je Zeitalter)",
                        nicht: "kein Arten-Inventar je Zeitalter",
                        leser: "planet-core.js:2684 planetOrt — delta trägt Klima, Meer, Wetter, Wuchs, Wildnis; kein Arten-Inventar je Zeitalter, das der Klang lesen könnte",
                        gruen: { werte: { zeitalter: 6, saaten: 10, anachronismen: 0 }, zeuge: { antworten: 60, streuungM: 2100, artenFelder: 3 } },
                        attrappen: [A("0 Anachronismen ohne Faden", { zeitalter: 6, saaten: 10, anachronismen: 0 }, { antworten: 0 })],
                    },
                    6: {
                        u: {},
                        soll: [K.soll(KL, 6, "10 Zufallsplaneten × 3 Zeitalter", { key: "planeten", rel: "≥", zahl: 10 }), K.soll(KL, 6, "10 Zufallsplaneten × 3 Zeitalter", { key: "zeitalter", rel: "≥", zahl: 3 }), K.soll(KL, 6, "0 Waisen", { key: "waisen", rel: "=", zahl: 0 })],
                        zeuge: zeugeMin([["antworten", 30, "weniger als 30 Antworten des Planet-Fadens"], ["streuungM", 1e-6, "die Antworten tragen keine Streuung"], ["artenFelder", 1, "der Faden trägt weder Arten noch Medium"]]),
                        taeter: "planet-core.js planetOrt (weder Arten noch Medium)",
                        nicht: "weder Arten noch Medium je Planet",
                        leser: "planet-core.js:2684 planetOrt — der Planet-Faden trägt weder Arten noch Medium (Luft, Vakuum) je Planet und Zeitalter",
                        gruen: { werte: { planeten: 10, zeitalter: 3, waisen: 0 }, zeuge: { antworten: 30, streuungM: 2100, artenFelder: 2 } },
                        attrappen: [A("0 Waisen ohne Faden", { planeten: 10, zeitalter: 3, waisen: 0 }, { antworten: 0 })],
                    },
                },
            },

            // ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
            // GETEILTER SINN: die Sitzung fragt ihr Netz (`state.p2p`: Gegenstellen), die Wege einer Tat ins Netz (NON_BROADCASTABLE_OPS),
            // die Zeugen der Siedlung (das Gedächtnis „gewalt“, die Akten der Zelle) und ob die Welt eine Legende kennt. Ohne zweiten
            // Spieler ist jede Sprosse „Umfang nicht erzeugbar“ — gemessen wird, was die Welt dafür trägt.
            [GS]: {
                sek: 8,
                faecher: true,
                dorf: true,
                pfad: ["stamm/netz-p2p.js", "stamm/netz-identitaet.js", "stamm/feld-dsl.js", "stamm/siedlung-bewohner.js"],
                ungefahren: "zwei Geräte an einer Saat (die Fahrt hat eines)",
                mess: async function (H, U, M) {
                    const S = (fn, a) => H.seite("return await (" + String(fn) + ")(r, T, " + JSON.stringify(a || {}) + ");");
                    const kurz = (e) => String((e && e.message) || e).slice(0, 220);
                    const netz = async (r, T, a) => {
                        const s = r.state;
                        const p = s.p2p || {};
                        const zahl = (x) => (x instanceof Map || x instanceof Set ? x.size : Array.isArray(x) ? x.length : x && typeof x === "object" ? Object.keys(x).length : 0);
                        const namen = new Set();
                        for (let q = Object.getPrototypeOf(r); q && q !== Object.prototype; q = Object.getPrototypeOf(q)) for (const k of Object.getOwnPropertyNames(q)) namen.add(k);
                        const such = (q) => [...namen].filter((k) => q.test(k));
                        const NB = r.constructor.NON_BROADCASTABLE_OPS;
                        const sied = r._bewohnerSiedlungen ? [...r._bewohnerSiedlungen.values()] : [];
                        const bew = sied.flatMap((x) => x.liste || []);
                        const cells = (s.worldMeta || {}).settlementCells || {};
                        const akten = Object.values(cells).flatMap((c) => (c && c.akten) || []);
                        const peers = Math.max(zahl(p.peers), zahl(p.rtcPeers), zahl(p.channels), zahl(p.verbunden));
                        return {
                            peers, p2pFelder: Object.keys(p).slice(0, 24), spieler: 1 + peers,
                            legenden: such(/legende|legend/i).length,
                            zeugen: bew.filter((b) => b.leib && ((b.leib.userData && b.leib.userData.memory) || []).some((m) => m && m.type === "gewalt")).length,
                            bewohner: bew.length, akten: akten.length, aktenMitWer: akten.filter((k) => k && (k.wer || k.von) && Number.isFinite(k.x)).length,
                            tatReist: NB ? !(NB.has ? NB.has("spawn_studio") : NB.includes("spawn_studio")) : null,
                        };
                    };
                    let w;
                    try {
                        w = await S(netz, {});
                    } catch (e) {
                        w = { fehler: kurz(e), spieler: 0 };
                    }
                    const roh = {};
                    const z = { spieler: w.spieler || 0, peers: w.peers || 0, legenden: w.legenden || 0, zeugen: w.zeugen || 0, bewohner: w.bewohner || 0, akten: w.akten || 0, aktenMitWer: w.aktenMitWer || 0, tatReist: w.tatReist ? 1 : 0, p2pFelder: w.p2pFelder, fehler: w.fehler };
                    const allein = "kein zweiter Spieler in der Sitzung (" + (w.peers || 0) + " Gegenstellen im Netz der Welt)";
                    for (const nr of Object.keys(U)) roh[nr] = { werte: { spieler: z.spieler, legenden: z.legenden }, zeuge: z };
                    if (U[1]) {
                        // S1 AM FÄCHER (M4): jede Tat der Welt (die Effekte der DSL, stamm/feld-dsl.js:946) × Spieler A und B. A: reist die Tat ins
                        // Netz (sie steht nicht in NON_BROADCASTABLE_OPS, stamm/speicher-laden.js:1322 — derselbe Leser wie das Laden)? B: die
                        // Spur am Ort bei einer Gegenstelle — ohne Gegenstelle nennt die Adresse ihr Fehlen
                        const TAT_AN = async (r, T, a) => {
                            const NB = r.constructor.NON_BROADCASTABLE_OPS;
                            if (a.zeit.wer === "A") return { reist: NB ? (NB.has ? !NB.has(a.ort) : !NB.includes(a.ort)) ? 1 : 0 : null };
                            const p = r.state.p2p || {};
                            const zahl = (x) => (x instanceof Map || x instanceof Set ? x.size : Array.isArray(x) ? x.length : x && typeof x === "object" ? Object.keys(x).length : 0);
                            const peers = Math.max(zahl(p.peers), zahl(p.rtcPeers), zahl(p.channels), zahl(p.verbunden));
                            if (!peers) return { fehlt: "kein Spieler B: stamm/netz-p2p.js:1713 _p2pMsgPeerJoin — die Sitzung hat 0 Gegenstellen (ein Gerät, kein Broker)" };
                            return { fehlt: "die Spur bei B liest nur das Gerät B (" + peers + " Gegenstellen; kein Leser der fremden Welt in dieser Sitzung)" };
                        };
                        try {
                            const ops = await H.seite("return Object.keys(r.dslEffects || {}).slice(0, 60);");
                            const R1g = await FAECHER((c) => H.seite(c), {
                                gesetz: { fn: TAT_AN, export: "AnazhRealm.NON_BROADCASTABLE_OPS · state.p2p (die Gegenstellen)", leser: "stamm/speicher-laden.js:1322 _dslContainsAnyOp(dsl, NON_BROADCASTABLE_OPS) · stamm/netz-p2p.js:1713 _p2pMsgPeerJoin" },
                                adressen: { orte: ops, zeiten: [{ wer: "A" }, { wer: "B" }] },
                                ms: 4000,
                                masse: { taten: { wie: "anzahl", feld: "reist" }, reisenAnteil: { wie: "anteil", feld: "reist" } },
                                ungemessen: ["das Bildpaar A ↔ B am Ort der Tat (zwei Geräte)"],
                            });
                            z.taten = R1g.werte.taten;
                            z.reisenAnteil = R1g.werte.reisenAnteil;
                            z.akte = R1g.akte;
                            roh[1].nicht = (R1g.fehlt || allein) + " — an " + R1g.fehltAn.length + " Taten; bei A reisen " + Math.round(100 * (R1g.werte.reisenAnteil || 0)) + " % von " + (R1g.werte.taten || 0) + " Taten ins Netz";
                        } catch (e) {
                            roh[1].nicht = allein + "; der Fächer der Taten warf: " + kurz(e);
                        }
                        roh[1].auge = await M.auge("erleben-geteilt-s1", { ort: "wiese" });
                    }
                    if (U[2]) roh[2].nicht = allein + "; kein Bewohner erzählt eine Tat (" + z.zeugen + " Zeugen mit Gedächtnis „gewalt“, " + z.akten + " Akten, davon " + z.aktenMitWer + " mit Wer und Wo)";
                    for (const nr of [3, 4]) if (U[nr]) roh[nr].nicht = allein + " — " + (nr === 3 ? "10² Spieler" : "10⁴ Spieler") + " in einer Stadt sind nicht erzeugbar";
                    for (const nr of [5, 6, 7]) if (U[nr]) roh[nr].nicht = allein + "; die Welt kennt keine Legende (" + z.legenden + " Leser)";
                    return { sprossen: roh };
                },
                sprossen: {
                    1: {
                        u: {},
                        soll: [sollWort(GS, 1, "Bildpaar am Ort bei B zeigt dieselbe Spur", { key: "spurGleich", rel: "=", zahl: 1 })],
// ZAHL (auge-klasse.cjs): die Zahl urteilt, das Bild ist Beleg — der Zeuge verlangt die Welt hinter der Zahl
                        zeuge: (roh) => { const z = roh.zeuge || {}; if (!(typeof z.spieler === "number" && z.spieler >= 2)) return "kein Spieler B (spieler " + (z.spieler === undefined ? "fehlt" : z.spieler) + ", Soll ≥ 2)"; return null; },
                        auge: { pose: "Ego am Ort der Tat von A, bei A und bei B (dieselbe Saat; heute ein Gerät)", vorbild: "Bildpaar A ↔ B am Ort der Tat zeigt dieselbe Spur (Prüfer-Satz R11)" },
                        taeter: "stamm/netz-p2p.js (keine Gegenstelle in der Sitzung)",
                        nicht: "kein zweiter Spieler in der Sitzung",
                        leser: "stamm/netz-p2p.js:1713 _p2pMsgPeerJoin — die Sitzung der Fahrt hat keine Gegenstelle (ein Gerät, kein Broker)",
                        gruen: { werte: { spurGleich: 1 }, zeuge: { spieler: 2 } },
                        attrappen: [A("dieselbe Spur ohne B", { spurGleich: 1 }, { spieler: 1 })],
                    },
                    2: {
                        u: {},
                        soll: [K.soll(GS, 2, "10 Taten von A", { key: "taten", rel: "≥", zahl: 10 }), sollWort(GS, 2, "Zeugen bei B nennen Wer, Was, Wo richtig", { key: "richtigAnteil", rel: "≥", zahl: 1 })],
                        zeuge: zeugeMin([["spieler", 2, "kein Spieler B"], ["zeugen", 1, "kein Zeuge bei B"], ["aktenMitWer", 1, "keine Akte mit Wer und Wo"]]),
                        taeter: "stamm/siedlung-bewohner.js _bewohnerZeuge (die Akte ohne Wer, Was, Wo)",
                        nicht: "kein Spieler B, kein erzählender Zeuge",
                        leser: "stamm/siedlung-bewohner.js:2169 akten — _bewohnerZeuge legt die Akte als { t, type } ab: ohne Wer und Wo, kein Bewohner erzählt sie",
                        gruen: { werte: { taten: 10, richtigAnteil: 1 }, zeuge: { spieler: 2, zeugen: 14, aktenMitWer: 10 } },
                        attrappen: [A("10 Taten ohne B", { taten: 10, richtigAnteil: 1 }, { spieler: 1, zeugen: 0, aktenMitWer: 0 })],
                    },
                    3: {
                        u: {},
                        soll: [K.soll(GS, 3, "Anteil Ziele, die ≥ 2 Spieler zugleich verfolgen ≥ 20 %", { key: "zieleGeteiltProzent", rel: "≥", zahl: 20, einheit: "%" })],
                        zeuge: zeugeMin([["spieler", 100, "weniger als 10² Spieler"]]),
                        taeter: "stamm/netz-p2p.js (kein Netz-Spiel mit 10² Spielern)",
                        nicht: "kein zweiter Spieler, keine 10²",
                        leser: "stamm/netz-p2p.js:376 p2pSend — trägt Gegenstellen eines Raums; die Sitzung hat keine, kein Ziel-Leser über Spieler",
                        gruen: { werte: { zieleGeteiltProzent: 24 }, zeuge: { spieler: 120 } },
                        attrappen: [A("24 % ohne Spieler", { zieleGeteiltProzent: 24 }, { spieler: 1 })],
                    },
                    4: {
                        u: {},
                        soll: [K.soll(GS, 4, "Ruf von A ändert die Begegnungen von B messbar (≥ 20 Prozentpunkte)", { key: "rufPunkte", einheit: "pp" })],
                        zeuge: zeugeMin([["spieler", 2, "kein Spieler B"], ["zeugen", 1, "kein Bewohner trägt einen Ruf"]]),
                        taeter: "stamm/siedlung-bewohner.js (kein Ruf eines Spielers)",
                        nicht: "kein zweiter Spieler, kein Ruf",
                        leser: "stamm/siedlung-bewohner.js:2163 _creatureRemember — das Gedächtnis „gewalt“ trägt { von: \"spieler\" }, keinen Namen: Ruf von A ist für B nicht lesbar",
                        gruen: { werte: { rufPunkte: 26 }, zeuge: { spieler: 2, zeugen: 30 } },
                        attrappen: [A("26 Punkte ohne B", { rufPunkte: 26 }, { spieler: 1, zeugen: 0 })],
                    },
                    5: {
                        u: {},
                        soll: [K.soll(GS, 5, "in ≥ 50 % binnen 1 h eine Legende eines Früheren", { key: "legendeProzent", rel: "≥", zahl: 50, einheit: "%" }), sollWort(GS, 5, "Zeitreise bestätigt den Kern", { key: "kernBestaetigt", rel: "=", zahl: 1 })],
                        zeuge: zeugeMin([["spieler", 2, "keine früheren Spieler"], ["legenden", 1, "die Welt kennt keine Legende"]]),
                        taeter: "die Welt kennt keine Legende (kein Leser)",
                        nicht: "keine Legende in der Welt",
                        leser: "stamm/siedlung-bewohner.js:2170 aktenMax — die Akte einer Tat altert aus (WACHSTUM.aktenMax) und wird nie Legende; kein Legenden-Speicher in speicher-welten.js",
                        gruen: { werte: { legendeProzent: 55, kernBestaetigt: 1 }, zeuge: { spieler: 1000, legenden: 40 } },
                        attrappen: [A("55 % ohne Legende", { legendeProzent: 55, kernBestaetigt: 1 }, { spieler: 1, legenden: 0 })],
                    },
                    6: {
                        u: {},
                        soll: [K.soll(GS, 6, "Anteil Legenden mit Spieler-Ursprung zwischen 10 % und 50 %", { key: "spielerUrsprungProzent", rel: "band", zahl: 10, bis: 50, einheit: "%" })],
                        zeuge: zeugeMin([["spieler", 2, "keine Spieler-Zivilisation"], ["legenden", 1, "die Welt kennt keine Legende"]]),
                        taeter: "die Welt kennt keine Legende (kein Leser)",
                        nicht: "keine Legende in der Welt",
                        leser: "stamm/siedlung-bewohner.js:2170 aktenMax — die Akte altert aus, kein Legenden-Speicher: die Welt erzählt keine Tat, weder eines Spielers noch ihre eigene",
                        gruen: { werte: { spielerUrsprungProzent: 30 }, zeuge: { spieler: 1000, legenden: 60 } },
                        attrappen: [A("30 % ohne Legende", { spielerUrsprungProzent: 30 }, { spieler: 1, legenden: 0 })],
                    },
                    7: {
                        u: {},
                        soll: [K.soll(GS, 7, "≥ 50 % der Spieler haben nach 100 h eine Legende eines anderen Spielers gefunden und verfolgt", { key: "gefundenProzent", rel: "≥", zahl: 50, einheit: "%" })],
                        zeuge: zeugeMin([["spieler", 2, "keine anderen Spieler"], ["legenden", 1, "die Welt kennt keine Legende"]]),
                        taeter: "die Welt kennt keine Legende (kein Leser)",
                        nicht: "keine Legende, kein zweiter Spieler",
                        leser: "stamm/siedlung-bewohner.js:2170 aktenMax — keine Legende überdauert ihren Spieler (kein Legenden-Speicher)",
                        gruen: { werte: { gefundenProzent: 58 }, zeuge: { spieler: 1000, legenden: 300 } },
                        attrappen: [A("58 % ohne Legende", { gefundenProzent: 58 }, { spieler: 1, legenden: 0 })],
                    },
                },
            },

            // ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
            // EIN EREIGNIS: S1 zwanzig Feuer (glutbrunnen) im Sichtkegel, je eines: der Bild-Takt, der es zeichnet (`_archImBild` und im
            // Frustum der Kamera), dann das Ohr im Takt eines Bilds (symphonyTick je 16 ms) bis die Stimme glut aus seinem Abstand klingt —
            // der Versatz auf der Uhr des Ohrs (ctx.currentTime), die Richtung aus dem Panorama gegen den Ort im Bild; der Gegenlauf: das
            // Feuer fort → die Stimme schweigt. S2 Gewitter (Leser der Welt, die Bewohner unter Dach mit ↔ ohne Sturm), S3 die Kanäle eines
            // Ausbruchs, S4 die Sichten (first/third/orbit) am selben Feuer, S5 Zeugen und Akten, S6 die Feuer als Zufallsereignisse.
            [EE]: {
                sek: 50,
                dorf: true,
                mutiert: true,
                pfad: ["stamm/klang.js", "klang-core.js", "stamm/siedlung-bauten.js", "stamm/bau-vorlagen.js", "stamm/dirigent-*.js", "stamm/siedlung-bewohner.js", "koerper-core.js", "stamm/feld-brand.js"],
                ungefahren: "das Hören am Gerät und das Bildpaar Orbit ↔ Ego (S4); headless läuft der Bild-Takt langsamer, die Uhr des Ohrs ist echt",
                mess: async function (H, U, M) {
                    const DECKEL = 50;
                    const S = (fn, a) => H.seite("return await (" + String(fn) + ")(r, T, " + JSON.stringify(a || {}) + ");");
                    const kurz = (e) => String((e && e.message) || e).slice(0, 220);
                    const ohr = async (r, T, a) => {
                        const s = r.state;
                        if (a.an) {
                            const war = !!s.symphony.enabled;
                            window.__erlebenOhr = { war, modus: s.cameraMode };
                            r._loopCamera(performance.now());
                            s.camera.updateMatrixWorld(true);
                            if (!war) r.initSymphony();
                            const ctx = s.symphony.ctx;
                            if (ctx && ctx.state !== "running") await ctx.resume();
                            return { war, ctx: ctx && ctx.state };
                        }
                        const w = window.__erlebenOhr;
                        if (w && w.modus && s.cameraMode !== w.modus) r.setCameraMode(w.modus);
                        for (const e of (s.architectures || []).slice()) if (e && /^erleben-feuer-/.test(String(e.id || ""))) r.removeArchitecture(e, { still: true });
                        if (w && !w.war) r.disposeSymphony();
                        delete window.__erlebenOhr;
                        return { sym: !!s.symphony.enabled };
                    };
                    const feuer = async (r, T, a) => {
                        const s = r.state;
                        const pm = s.playerMesh.position;
                        const sym = s.symphony;
                        const um = sym.umwelt;
                        const ctx = sym.ctx;
                        const warte = (ms) => new Promise((f) => setTimeout(f, ms));
                        const cam = s.camera;
                        cam.updateMatrixWorld(true);
                        const fr = new T.Frustum().setFromProjectionMatrix(new T.Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
                        const v = new T.Vector3();
                        cam.getWorldDirection(v);
                        const l = Math.hypot(v.x, v.z) || 1;
                        const f = [v.x / l, v.z / l];
                        const rechts = [-v.z / l, v.x / l];
                        const glutDa = (d) => {
                            const L = um.lage && um.lage.glut;
                            const g = um.graph.zensus().find((q) => q.name === "glut");
                            return L && Math.abs(L.d - d) < 1.5 && g && g.an && Number.isFinite(g.db) ? g : null;
                        };
                        const aus = [];
                        for (const i of a.feuer) {
                            const az = (a.az[i] * Math.PI) / 180;
                            const d = a.d[i];
                            const x = pm.x + d * (f[0] * Math.cos(az) + rechts[0] * Math.sin(az));
                            const z = pm.z + d * (f[1] * Math.cos(az) + rechts[1] * Math.sin(az));
                            const y = r.getTerrainHeightAt(x, z);
                            const e = r.spawnArchitecture("glutbrunnen", { x, y, z }, { precise: true, id: "erleben-feuer-" + i });
                            if (!e) {
                                aus.push({ i, fehler: "kein Feuer gebaut" });
                                continue;
                            }
                            let tBild = null;
                            for (let k = 0; k < 6 && tBild === null; k++) {
                                r._gameLoopTick(performance.now());
                                if (r._archImBild(e) && fr.containsPoint(new T.Vector3(x, y + 0.5, z))) tBild = ctx.currentTime;
                            }
                            let tOhr = null;
                            let pan = null;
                            let n = 0;
                            for (; n < 90 && tOhr === null; n++) {
                                const g = glutDa(Math.hypot(x - pm.x, z - pm.z));
                                if (g) {
                                    tOhr = ctx.currentTime;
                                    pan = g.pan;
                                    break;
                                }
                                r.symphonyTick();
                                await warte(16);
                            }
                            r.removeArchitecture(e, { still: true });
                            let still = null;
                            const t1 = ctx.currentTime;
                            for (let k = 0; k < 90 && still === null; k++) {
                                r.symphonyTick();
                                await warte(16);
                                const L = um.lage && um.lage.glut;
                                if (!(L && Math.abs(L.d - d) < 1.5)) still = ctx.currentTime - t1;
                            }
                            const winkel = pan === null ? null : (Math.asin(Math.max(-1, Math.min(1, pan))) * 180) / Math.PI;
                            aus.push({ i, az: a.az[i], d, imBild: tBild !== null, versatzMs: tBild !== null && tOhr !== null ? Math.round((tOhr - tBild) * 1000) : null, winkel, fehlerGrad: winkel === null ? null : Math.abs(winkel - a.az[i]), stillMs: still === null ? null : Math.round(still * 1000), takte: n });
                        }
                        return aus;
                    };
                    const welt = async (r, T, a) => {
                        const s = r.state;
                        const pm = s.playerMesh.position;
                        const namen = new Set();
                        for (let q = Object.getPrototypeOf(r); q && q !== Object.prototype; q = Object.getPrototypeOf(q)) for (const k of Object.getOwnPropertyNames(q)) namen.add(k);
                        const such = (q) => [...namen].filter((k) => q.test(k));
                        const UM = AnazhRealm._umweltGesetz().UMWELT;
                        const stimmen = Object.keys(UM.stimmen);
                        const sied = r._bewohnerSiedlungen ? [...r._bewohnerSiedlungen.values()] : [];
                        const bew = sied.flatMap((x) => x.liste || []);
                        const aus = { stimmen, bewohner: bew.length };
                        aus.blitz = such(/blitz|donner|gewitter|lightning|thunder/i);
                        aus.front = such(/front/i).filter((k) => !/brand/i.test(k));
                        const stunde = ((((s.timeOfDay || 0.5) % 1) + 1) % 1) * 24;
                        const drinnen = () => bew.filter((b) => r._bewohnerSoll(b, stunde).drinnen).length;
                        const alt = s.weather;
                        try {
                            window.__wetterSetzen("sunny");
                            r._gameLoopTick(performance.now());
                            aus.sonnig = drinnen();
                            window.__wetterSetzen("stormy");
                            for (let k = 0; k < 3; k++) r._gameLoopTick(performance.now());
                            aus.sturm = drinnen();
                            aus.regenSturm = r._weatherFieldFor().rain;
                        } finally {
                            window.__wetterSetzen(alt);
                            r._gameLoopTick(performance.now());
                        }
                        aus.kanal = {
                            glut: stimmen.includes("glut"),
                            grollen: stimmen.some((k) => /groll|infra|donner/i.test(k)),
                            beben: such(/beben|bodenwelle/i).length > 0,
                            asche: such(/asche/i).length > 0,
                            schwefel: such(/schwefel|geruch/i).length > 0,
                            flucht: such(/flucht/i).length > 0,
                        };
                        const cells = (s.worldMeta || {}).settlementCells || {};
                        const akten = Object.values(cells).flatMap((c) => (c && c.akten) || []);
                        aus.zeugen = bew.filter((b) => b.leib && ((b.leib.userData && b.leib.userData.memory) || []).some((m) => m && m.type === "gewalt")).length;
                        aus.akten = akten.length;
                        aus.aktenMitOrt = akten.filter((k) => k && Number.isFinite(k.x) && Number.isFinite(k.z)).length;
                        const modus = s.cameraMode;
                        const sichten = {};
                        const x = pm.x + 6;
                        const z = pm.z;
                        const e = r.spawnArchitecture("glutbrunnen", { x, y: r.getTerrainHeightAt(x, z), z }, { precise: true, id: "erleben-feuer-sicht" });
                        try {
                            for (const m of ["first", "third", "orbit"]) {
                                r.setCameraMode(m);
                                r._loopCamera(performance.now());
                                s.camera.updateMatrixWorld(true);
                                const g = r._glutAmOhr(pm.x, pm.z, r._umweltPanorama());
                                sichten[m] = { modus: s.cameraMode, d: g.d, pan: g.pan, kamera: [s.camera.position.x, s.camera.position.y, s.camera.position.z].map((q) => +q.toFixed(2)) };
                            }
                        } finally {
                            if (e) r.removeArchitecture(e, { still: true });
                            r.setCameraMode(modus);
                            r._loopCamera(performance.now());
                        }
                        aus.sichten = sichten;
                        return aus;
                    };
                    const roh = {};
                    const N = 20;
                    const az = [];
                    const dd = [];
                    for (let i = 0; i < N; i++) {
                        az.push(Math.round((-30 + 60 * ((i * 0.618034) % 1)) * 10) / 10);
                        dd.push(Math.round((5 + 15 * ((i * 0.381966 + 0.25) % 1)) * 10) / 10);
                    }
                    let F = [];
                    let w = null;
                    let fe = null;
                    try {
                        await S(ohr, { an: true });
                        if (U[1] || U[6]) {
                            for (let i = 0; i < N; i += 5) {
                                if (M.uhr() > DECKEL - 14) break;
                                F = F.concat(await S(feuer, { feuer: [i, i + 1, i + 2, i + 3, i + 4].filter((k) => k < N), az, d: dd }));
                            }
                        }
                        w = await S(welt, {});
                    } catch (e) {
                        fe = kurz(e);
                    } finally {
                        await S(ohr, { an: false }).catch(() => null);
                    }
                    w = w || { fehler: fe };
                    const gut = F.filter((x) => x.imBild && x.versatzMs !== null && x.fehlerGrad !== null);
                    const haelt = (x) => x.imBild && x.versatzMs !== null && x.versatzMs <= 50 && x.fehlerGrad !== null && x.fehlerGrad <= 10 && x.stillMs !== null;
                    const sd = (xs) => {
                        const m = xs.reduce((q, x) => q + x, 0) / (xs.length || 1);
                        return Math.sqrt(xs.reduce((q, x) => q + (x - m) * (x - m), 0) / (xs.length || 1));
                    };
                    const zf = { feuer: F.length, imBild: F.filter((x) => x.imBild).length, ohr: gut.length, gestillt: F.filter((x) => x.stillMs !== null).length, panStreuung: +sd(gut.map((x) => Math.sin((x.winkel * Math.PI) / 180))).toFixed(3), je: F.map((x) => [x.az, x.d, x.versatzMs, x.fehlerGrad === null ? null : +x.fehlerGrad.toFixed(2), x.stillMs, x.takte]), fehler: fe };
                    if (U[1]) {
                        roh[1] = { werte: {}, zeuge: zf };
                        if (gut.length) {
                            roh[1].werte.versatzMsMax = Math.max(...gut.map((x) => x.versatzMs));
                            roh[1].werte.winkelFehlerMax = +Math.max(...gut.map((x) => x.fehlerGrad)).toFixed(3);
                        }
                        if (F.length) {
                            roh[1].werte.feuer = F.length;
                            roh[1].werte.anteilProzent = +((100 * F.filter(haelt).length) / F.length).toFixed(1);
                        }
                    }
                    if (U[2]) {
                        roh[2] = { werte: {}, zeuge: { blitz: (w.blitz || []).length, front: (w.front || []).length, bewohner: w.bewohner || 0, sonnig: w.sonnig, sturm: w.sturm, regenSturm: w.regenSturm, fehler: w.fehler } };
                        if (w.bewohner > 0) roh[2].werte.unterDach = w.sturm / w.bewohner;
                        if (!(w.blitz || []).length) roh[2].nicht = "kein Blitz, kein Donner, keine Front: das Wetter ist ein Wort für die ganze Welt (Stimmen am Ohr: " + (w.stimmen || []).join(", ") + ")" + (w.bewohner > 0 ? "" : "; kein lebender Bewohner im Umkreis");
                    }
                    if (U[3]) {
                        const K6 = w.kanal || {};
                        const ohne = Object.keys(K6).filter((k) => !K6[k]);
                        roh[3] = { werte: w.kanal ? { kanaeleOhneSpur: ohne.length } : {}, zeuge: { kanaele: Object.keys(K6).length, ohne, ausbruch: 0 } };
                        roh[3].nicht = "kein Ausbruch in 20 km: von 6 Kanälen tragen " + ohne.join(", ") + " keinen Leser in der Welt (Glut und Flucht ja, aber kein Ereignis, das sie in Zeitfolge setzt)";
                    }
                    if (U[4]) {
                        const sv = w.sichten || {};
                        const modi = [...new Set(Object.values(sv).map((x) => x.modus))];
                        roh[4] = { werte: { sichten: modi.length }, zeuge: { sichten: modi.length, je: sv } };
                        if (sv.first && sv.third && sv.first.d > 0) roh[4].werte.abstandDiffProzent = +((100 * Math.abs(sv.first.d - sv.third.d)) / sv.first.d).toFixed(3);
                        if (modi.length < 3) roh[4].nicht = "nur " + modi.length + " Sichten (" + modi.join(", ") + "): kein Orbit, keine Sicht eines Bewohners oder Tiers mit fremdem Sinn";
                        roh[4].auge = await M.auge("erleben-ereignis-s4", { ort: "wiese" });
                    }
                    if (U[5]) {
                        roh[5] = { werte: { zeugen: w.zeugen || 0 }, zeuge: { zeugen: w.zeugen || 0, akten: w.akten || 0, aktenMitOrt: w.aktenMitOrt || 0, bewohner: w.bewohner || 0 } };
                        roh[5].nicht = "kein Zeuge erzählt Ort und Zeit (" + (w.akten || 0) + " Akten, davon " + (w.aktenMitOrt || 0) + " mit Ort; " + (w.zeugen || 0) + " Zeugen), kein Sprung zurück in der Welt der Sitzung";
                    }
                    if (U[6]) {
                        roh[6] = { werte: {}, zeuge: { ereignisse: F.length, saaten: 1, ohr: gut.length } };
                        if (F.length) Object.assign(roh[6].werte, { ereignisse: F.length, saaten: 1, anteil: +(F.filter(haelt).length / F.length).toFixed(3) });
                        roh[6].nicht = "nur die Saat der Sitzung: 10 Saaten sind 10 Welten (die Reise tauscht die Welt) — gemessen " + F.length + " Feuer dieser Saat";
                    }
                    return { sprossen: roh };
                },
                sprossen: {
                    1: {
                        u: {},
                        soll: [
                            K.soll(EE, 1, "20 Feuer", { key: "feuer", rel: "≥", zahl: 20 }),
                            K.soll(EE, 1, "Versatz Bild ↔ Abgriff ≤ 50 ms", { key: "versatzMsMax", einheit: "ms" }),
                            K.soll(EE, 1, "Quellort am Abgriff ±10° zur Glut", { key: "winkelFehlerMax", ref: 0, refQuelle: "der Ort der Glut im Bild (Richtung der Kamera, Abweichung 0°)", einheit: "°" }),
                            K.soll(EE, 1, "100 %", { key: "anteilProzent", rel: "≥", zahl: 100, einheit: "%" }),
                        ],
                        zeuge: zeugeMin([["feuer", 20, "weniger als 20 Feuer gebaut"], ["imBild", 20, "nicht jedes Feuer im Bild (Frustum und Zeichnung)"], ["ohr", 20, "nicht jedes Feuer am Ohr"], ["gestillt", 20, "der Gegenlauf fehlt: ein Feuer fort, die Stimme klingt weiter"], ["panStreuung", 0.05, "die Feuer stehen nicht in verschiedenen Richtungen"]]),
                        taeter: "stamm/klang.js _umweltKlangTick (die Mischung im Takt mischSek hinter dem Bild)",
                        gruen: { werte: { feuer: 20, versatzMsMax: 34, winkelFehlerMax: 1.2, anteilProzent: 100 }, zeuge: ZF },
                        attrappen: [A("Versatz 34 ms ohne Feuer", { feuer: 20, versatzMsMax: 34, winkelFehlerMax: 1.2, anteilProzent: 100 }, { feuer: 0 }), A("die Stimme schweigt nie (kein Gegenlauf)", { feuer: 20, versatzMsMax: 34, winkelFehlerMax: 1.2, anteilProzent: 100 }, Object.assign({}, ZF, { gestillt: 0 }))],
                    },
                    2: {
                        u: {},
                        soll: [
                            K.soll(EE, 2, "Donner-Verzug = Abstand/c ±2 %", { key: "donnerVerhaeltnis", ref: 1, refQuelle: "Schallgeschwindigkeit c = 343 m/s bei 20 °C (Verzug / (Abstand/c) = 1)" }),
                            sollWort(EE, 2, "Regen am Ort ≤ Zugzeit der Front", { key: "regenJeZugzeit", rel: "≤", zahl: 1 }),
                            K.soll(EE, 2, "Bewohner unter Dach ≥ 0,8", { key: "unterDach" }),
                        ],
                        zeuge: zeugeMin([["blitz", 1, "die Welt trägt keinen Blitz"], ["front", 1, "das Wetter hat keine Front"], ["bewohner", 1, "kein lebender Bewohner im Umkreis"]]),
                        taeter: "stamm/klang.js _umweltLageEins (das Wetter als ein Wort, kein Donner)",
                        nicht: "kein Blitz, kein Donner, keine Front",
                        leser: "stamm/klang.js:410 _weatherFieldFor — (this.state.weather) liest ein Wort für die Welt (keine Front); UMWELT.stimmen tragen keinen Donner",
                        gruen: { werte: { donnerVerhaeltnis: 1.01, regenJeZugzeit: 0.9, unterDach: 0.85 }, zeuge: { blitz: 2, front: 1, bewohner: 40 } },
                        attrappen: [A("Donner aus der Formel ohne Blitz", { donnerVerhaeltnis: 1.01, regenJeZugzeit: 0.9, unterDach: 0.85 }, { blitz: 0, front: 0, bewohner: 0 })],
                    },
                    3: {
                        u: {},
                        soll: [
                            K.soll(EE, 3, "nach Abstand und Geschwindigkeit ±10 %", { key: "zeitfolgeVerhaeltnis", ref: 1, refQuelle: "Bodenwelle 6 km/s (P-Welle), Schall 343 m/s, Asche mit dem Wind: Ankunft = Abstand / Geschwindigkeit" }),
                            K.soll(EE, 3, "0 Kanäle ohne Spur", { key: "kanaeleOhneSpur", rel: "=", zahl: 0 }),
                        ],
                        zeuge: zeugeMin([["ausbruch", 1, "kein Ausbruch in der Welt"], ["kanaele", 6, "nicht alle sechs Kanäle gefragt"]]),
                        taeter: "stamm/klang.js _umweltLageZwei (kein Grollen, Beben, Asche, Schwefel)",
                        nicht: "kein Ausbruch in 20 km",
                        leser: "stamm/klang.js:474 _umweltLageZwei — die Lage am Ohr trägt kein Grollen, kein Beben, keinen Schwefel; die Lava (stamm/siedlung-wege.js:522 _lavaDeckeAt) ist kein Ausbruch mit Spuren in Zeitfolge",
                        gruen: { werte: { zeitfolgeVerhaeltnis: 1.04, kanaeleOhneSpur: 0 }, zeuge: { ausbruch: 1, kanaele: 6 } },
                        attrappen: [A("0 Kanäle ohne Ausbruch", { zeitfolgeVerhaeltnis: 1.04, kanaeleOhneSpur: 0 }, { ausbruch: 0, kanaele: 6 })],
                    },
                    4: {
                        u: {},
                        soll: [
                            K.soll(EE, 4, "±1 s", { key: "zeitDiffS", rel: "≤", zahl: 1, einheit: "s" }),
                            K.soll(EE, 4, "±1 % Abstand", { key: "abstandDiffProzent", rel: "≤", zahl: 1, einheit: "%" }),
                            sollWort(EE, 4, "in allen drei Sichten", { key: "sichten", rel: "≥", zahl: 3 }),
                        ],
// ZAHL (auge-klasse.cjs): die Zahl urteilt, das Bild ist Beleg — der Zeuge verlangt die Welt hinter der Zahl
                        zeuge: (roh) => { const z = roh.zeuge || {}; if (!(typeof z.sichten === "number" && z.sichten >= 3)) return "nicht drei Sichten in der Welt (sichten " + (z.sichten === undefined ? "fehlt" : z.sichten) + ", Soll ≥ 3)"; return null; },
                        auge: { pose: "Orbit über dem Feuer ↔ Ego am Messort wiese (Orbit ist nicht erzeugbar: geschossen nur Ego)", vorbild: "Bildpaar Orbit ↔ Ego zeigt dieselbe Fahne (Prüfer-Satz R11)" },
                        taeter: "stamm/dirigent-kern.js setCameraMode (nur first/third)",
                        nicht: "kein Orbit, keine Sicht eines Bewohners",
                        leser: "stamm/dirigent-kern.js:1237 setCameraMode — kennt nur first und third; keine Orbit-Sicht, keine Rolle eines Bewohners oder Tiers",
                        gruen: { werte: { zeitDiffS: 0.2, abstandDiffProzent: 0.4, sichten: 3 }, zeuge: { sichten: 3 } },
                        attrappen: [A("drei Sichten ohne Kamera", { zeitDiffS: 0.2, abstandDiffProzent: 0.4, sichten: 3 }, { sichten: 0 })],
                    },
                    5: {
                        u: {},
                        soll: [
                            K.soll(EE, 5, "20 Zeugen nennen Ort und Zeit richtig ≥ 80 %", { key: "richtigProzent", rel: "≥", zahl: 80, einheit: "%" }),
                            K.soll(EE, 5, "Spur am Ort nach 10 Jahren sichtbar", { key: "spurJahre", rel: "≥", zahl: 10, einheit: "a" }),
                            sollWort(EE, 5, "Sprung zurück zeigt das Erzählte", { key: "sprungGleich", rel: "=", zahl: 1 }),
                        ],
                        zeuge: zeugeMin([["zeugen", 20, "weniger als 20 Zeugen"], ["aktenMitOrt", 1, "keine Akte trägt den Ort"]]),
                        taeter: "stamm/siedlung-bewohner.js _bewohnerZeuge (die Akte ohne Ort, kein Erzählen)",
                        nicht: "kein Zeuge erzählt, kein Sprung zurück",
                        leser: "stamm/siedlung-bewohner.js:2169 akten — _bewohnerZeuge legt die Akte ohne Ort ab, kein Bewohner erzählt sie; ein Sprung zurück (stamm/netz-portal.js:660 _reiseBetreten) gebiert eine neue Welt",
                        gruen: { werte: { richtigProzent: 85, spurJahre: 10, sprungGleich: 1 }, zeuge: { zeugen: 20, aktenMitOrt: 20 } },
                        attrappen: [A("85 % ohne Zeugen", { richtigProzent: 85, spurJahre: 10, sprungGleich: 1 }, { zeugen: 0, aktenMitOrt: 0 })],
                    },
                    6: {
                        u: {},
                        soll: [
                            K.soll(EE, 6, "N = 100 Zufallsereignisse aus 10 Saaten", { key: "ereignisse", rel: "≥", zahl: 100 }),
                            K.soll(EE, 6, "N = 100 Zufallsereignisse aus 10 Saaten", { key: "saaten", rel: "≥", zahl: 10 }),
                            K.soll(EE, 6, "Anteil ohne Widerspruch zwischen allen Kanälen und Perspektiven ≥ 0,95", { key: "anteil" }),
                        ],
                        zeuge: zeugeMin([["ereignisse", 100, "weniger als 100 Ereignisse"], ["saaten", 10, "weniger als 10 Saaten"]]),
                        taeter: "stamm/netz-portal.js _reiseBetreten (eine Saat je Welt)",
                        nicht: "nur die Saat der Sitzung",
                        leser: "stamm/netz-portal.js:660 _reiseBetreten — eine andere Saat ist eine andere Welt; 10 Saaten stehen nie in einer Sitzung",
                        gruen: { werte: { ereignisse: 100, saaten: 10, anteil: 0.97 }, zeuge: { ereignisse: 100, saaten: 10 } },
                        attrappen: [A("0,97 aus 20 Feuern einer Saat", { ereignisse: 100, saaten: 10, anteil: 0.97 }, { ereignisse: 20, saaten: 1 })],
                    },
                },
            },

            // ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
            // DIE EPOCHE IST GANZ: S1 24 Zufallsuhren über die EINE Uhr (`setTimeOfDay(…, "regler")`): Sonnenstand, Chor und Grillen am Ohr
            // (die Lage `_umweltLage` → `umweltMischung`, die Vögel `_vogelTakt`), der Bewohnertag (`_bewohnerSoll` der lebenden Bewohner);
            // der Gegenlauf koppelt das Licht ab (die Sonne der Gegenuhr in der Lage) — die Widersprüche müssen erscheinen. S2 12 Monate am
            // dichtesten Kronendach nahe dem Spieler: Laub im Bild (`uLaubPraesenz`) gegen Laub und Grillen am Ohr. S3/S4 die Leser von
            // Zeit und Epoche (Planet-Faden, `_siedlungEpoche`), S5/S6 die Zeitalter am Planet-Faden.
            [EP]: {
                sek: 45,
                dorf: true,
                mutiert: true,
                pfad: ["stamm/bild-himmel.js", "stamm/klang.js", "klang-core.js", "stamm/kreatur-fauna.js", "stamm/siedlung-bewohner.js", "koerper-core.js", "stamm/siedlung-ort.js", "fachwerk-core.js", "planet-core.js", "voxel-worker.js"],
                ungefahren: "das Bild jeder Uhr und jedes Monats (Licht, Laub) urteilt am Gerät nur als Zahl der Uniformen; die Kleidung der Bewohner zeigt nur das Gerät",
                mess: async function (H, U, M) {
                    const S = (fn, a) => H.seite("return await (" + String(fn) + ")(r, T, " + JSON.stringify(a || {}) + ");");
                    const kurz = (e) => String((e && e.message) || e).slice(0, 220);
                    const ohr = async (r, T, a) => {
                        const s = r.state;
                        if (a.an) {
                            const war = !!s.symphony.enabled;
                            window.__erlebenOhr = { war };
                            if (!war) r.initSymphony();
                            const ctx = s.symphony.ctx;
                            if (ctx && ctx.state !== "running") await ctx.resume();
                            return { war };
                        }
                        const w = window.__erlebenOhr;
                        if (w && !w.war) r.disposeSymphony();
                        delete window.__erlebenOhr;
                        return { sym: !!s.symphony.enabled };
                    };
                    const uhren = async (r, T, a) => {
                        const s = r.state;
                        const G = AnazhRealm._umweltGesetz();
                        const alt = s.timeOfDay;
                        const sied = r._bewohnerSiedlungen ? [...r._bewohnerSiedlungen.values()] : [];
                        const bew = sied.flatMap((x) => x.liste || []).slice(0, 60);
                        const aus = [];
                        // DER HOCHSOMMER DER UHREN (pm-front-f1; GTX 31ea3847: 0 Widersprüche, aber „die Grillen schweigen an diesem Ort zu
                        // jeder Uhr (zu kalt)“): die Grille singt nach dem Gesetz nur über tStumm 12 °C Bodenwärme (klang-core.js grille,
                        // Dolbear) — in der Jahreszeit der Sitzung prüfte die Probe den Kanal Grillen nie. Die 24 Uhren laufen im Hochsommer
                        // (seasonPhase der Mitte des Sommers, `_tickSeason` wie die Monate unten); danach kehrt das Jahr der Sitzung zurück
                        const altJahr = { phase: s.seasonPhase, anker: r._saisonAnker };
                        // der Gipfel der Wärme am Ort ist das Wort des Gelände-Kerns (`klimaHeute.sommerPhase`, dieselbe Phase liest `_schneeTafel`)
                        const L0 = r._gelaende && r._gelaende();
                        const sp = L0 && L0.ort && L0.ort.klimaHeute ? L0.ort.klimaHeute.sommerPhase : null;
                        const SOMMER = Number.isFinite(sp) ? sp : a.sommer;
                        try {
                            s.seasonPhase = SOMMER;
                            r._saisonAnker = { anker: SOMMER, k: r._kalenderZeit(s.spielZeit), phase: SOMMER };
                            r._tickSeason();
                            for (const t of a.uhren) {
                                r.setTimeOfDay(t, "regler");
                                r._vogelTakt();
                                const L = r._umweltLage();
                                const m = G.kern.umweltMischung(L);
                                const m2 = G.kern.umweltMischung(Object.assign({}, L, { sonne: -L.sonne }));
                                aus.push({
                                    t, uhr: s.timeOfDay, sonne: L.sonne, temperatur: L.temperatur, vogel: m.vogel.db, grille: m.grille.db, vogel2: m2.vogel.db, grille2: m2.grille.db, voegel: (s.voegel || []).length,
                                    akt: bew.map((b) => r._bewohnerSoll(b, s.timeOfDay * 24).akt),
                                    verkehr: sied.reduce((q, S) => q + (S.verkehr && S.verkehr.wagen ? S.verkehr.wagen.length : 0), 0), faehrt: r._fahrtVerkehr(s.playerMesh).length,
                                });
                            }
                        } finally {
                            s.seasonPhase = altJahr.phase;
                            r._saisonAnker = altJahr.anker;
                            r._tickSeason();
                            r.setTimeOfDay(alt, "regler");
                            r._vogelTakt();
                        }
                        return { aus, bewohner: bew.length, schwelle: G.UMWELT.hoerschwelleDb, season: SOMMER, temperatur: aus.length ? null : null };
                    };
                    const monate = async (r, T, a) => {
                        const s = r.state;
                        const pm = s.playerMesh.position;
                        const um = s.symphony.umwelt;
                        const G = AnazhRealm._umweltGesetz();
                        const alt = { phase: s.seasonPhase, anker: r._saisonAnker, pos: pm.clone() };
                        let best = null;
                        for (let i = 0; i < 40; i++) {
                            const w = i * 2.39996;
                            const d = 150 * Math.sqrt((i + 0.5) / 40);
                            const x = alt.pos.x + d * Math.cos(w);
                            const z = alt.pos.z + d * Math.sin(w);
                            const k = r._kronenStreuAt(x, z);
                            if (!best || k > best.k) best = { x, z, k };
                        }
                        const aus = [];
                        try {
                            pm.set(best.x, r.getTerrainHeightAt(best.x, best.z) + AnazhRealm.PLAYER_FOOT_OFFSET, best.z);
                            r._umweltRingProbe(um, best.x, best.z, um.ring.punkte.length);
                            for (const p of a.phasen) {
                                s.seasonPhase = p;
                                r._saisonAnker = { anker: p, k: r._kalenderZeit(s.spielZeit), phase: p };
                                r._tickSeason();
                                r._vogelTakt();
                                const su = s.seasonUniforms;
                                const lp = su && su.uLaubPraesenz && su.uLaubPraesenz.value;
                                const L = r._umweltLage();
                                const m = G.kern.umweltMischung(L);
                                aus.push({ p, phase: s.seasonPhase, name: s.season, laub: lp ? lp.x : null, deckung: L.deckung, temp: L.temperatur, laubDb: m.laub.db, grilleDb: m.grille.db, vogelDb: m.vogel.db });
                            }
                        } finally {
                            s.seasonPhase = alt.phase;
                            r._saisonAnker = alt.anker;
                            r._tickSeason();
                            pm.copy(alt.pos);
                            r._umweltRingProbe(um, alt.pos.x, alt.pos.z, um.ring.punkte.length);
                            r._vogelTakt();
                        }
                        const namen = new Set();
                        for (let q = Object.getPrototypeOf(r); q && q !== Object.prototype; q = Object.getPrototypeOf(q)) for (const k of Object.getOwnPropertyNames(q)) namen.add(k);
                        return { aus, kronen: best.k, schwelle: G.UMWELT.hoerschwelleDb, kleidung: [...namen].filter((k) => /kleid|tracht|gewand/i.test(k)).length, phaseNach: s.seasonPhase };
                    };
                    const zeit = async (r, T, a) => {
                        await r._fadenQuelle();
                        const an = await r._planetAnker();
                        const samen = r._planetSamen();
                        const B0 = (an.breite * 180) / Math.PI;
                        const L0 = (an.laenge * 180) / Math.PI;
                        const orte = [];
                        for (let i = 0; i < 10; i++) orte.push([B0 + 0.05 * Math.cos(i * 0.628), L0 + 0.05 * Math.sin(i * 0.628)]);
                        const je = await Promise.all(orte.map(async ([b, l]) => {
                            const o = await Promise.all([0, a.sprungMa].map((zeitMa) => r._planetAuftrag({ type: "planet-ort", samen, breite: b, laenge: l, zeitMa })));
                            return { dKlima: Math.abs(o[1].delta.klima.sommer - o[0].delta.klima.sommer), dMeer: Math.abs(o[1].delta.meer.waterLevelM - o[0].delta.meer.waterLevelM) };
                        }));
                        const ep = [];
                        for (let i = 1; i <= 40; i++) ep.push(r._siedlungEpoche(i));
                        const zuvor = [];
                        for (let i = 1; i <= 40; i++) zuvor.push(r._siedlungEpoche(i));
                        return { orte: je.length, dKlima: je.reduce((q, x) => q + x.dKlima, 0) / je.length, dMeer: je.reduce((q, x) => q + x.dMeer, 0) / je.length, epochen: [...new Set(ep.filter(Boolean))], gleich: ep.every((x, i) => x === zuvor[i]) ? 1 : 0, stimmen: Object.keys(AnazhRealm._umweltGesetz().UMWELT.stimmen) };
                    };
                    const zeitalter = async (r, T, a) => {
                        await r._fadenQuelle();
                        const aus = [];
                        await Promise.all(a.saaten.map(async (samen) => {
                            const an = await r._planetAuftrag({ type: "planet-anker", samen });
                            const B = (an.breite * 180) / Math.PI;
                            const L = (an.laenge * 180) / Math.PI;
                            for (const zeitMa of a.zeiten) {
                                const o = await r._planetAuftrag({ type: "planet-ort", samen, breite: B, laenge: L, zeitMa });
                                aus.push({ samen, zeitMa, h: o.hoeheM, felder: Object.keys(o).concat(Object.keys(o.delta || {})) });
                            }
                        }));
                        return aus;
                    };
                    const roh = {};
                    let U1 = null;
                    let U2 = null;
                    let fe = null;
                    const uhrenListe = [];
                    for (let i = 0; i < 24; i++) uhrenListe.push(+((i * 0.618034 + 0.137) % 1).toFixed(4));
                    const phasen = [];
                    for (let i = 0; i < 12; i++) phasen.push(+((i + 0.5) / 12).toFixed(4));
                    try {
                        await S(ohr, { an: true });
                        if (U[1]) U1 = await S(uhren, { uhren: uhrenListe, sommer: 0.375 }); // 0,375: die Mitte von „summer“ (bild-himmel phaseFor), nur ohne Ort
                        if (U[2]) U2 = await S(monate, { phasen });
                    } catch (e) {
                        fe = kurz(e);
                    } finally {
                        await S(ohr, { an: false }).catch(() => null);
                    }
                    const sd = (xs) => {
                        const m = xs.reduce((q, x) => q + x, 0) / (xs.length || 1);
                        return Math.sqrt(xs.reduce((q, x) => q + (x - m) * (x - m), 0) / (xs.length || 1));
                    };
                    if (U[1]) {
                        const X = (U1 && U1.aus) || [];
                        const sw = U1 ? U1.schwelle : -64;
                        // hörbar: über der Hörschwelle des Gesetzes (-∞ dB reist als null durch JSON — null ist stumm, nie 0 dB)
                        const hoer = (db) => typeof db === "number" && db >= sw;
                        // ein Widerspruch: der Chor in der Nacht, Grillen am Tag, Schlaf in heller Sonne, Morgen oder Mittag in tiefer Nacht
                        // (die Arbeit am Abend ist der Tag des Gasthauses, kein Widerspruch)
                        const wid = (x, sonne, vogel, grille) => (hoer(vogel) && sonne < -0.1 ? 1 : 0) + (hoer(grille) && sonne > 0.1 ? 1 : 0) + x.akt.filter((akt) => (akt === "schlaf" && sonne > 0.3) || ((akt === "morgen" || akt === "mittag") && sonne < -0.3)).length;
                        const w1 = X.reduce((q, x) => q + wid(x, x.sonne, x.vogel, x.grille), 0);
                        const w2 = X.reduce((q, x) => q + wid(x, -x.sonne, x.vogel2, x.grille2), 0);
                        roh[1] = {
                            werte: X.length ? { widersprueche: w1, uhren: X.length } : {},
                            zeuge: {
                                uhren: X.length, sonneStreuung: +sd(X.map((x) => x.sonne)).toFixed(3), gegenWidersprueche: w2, chor: X.filter((x) => hoer(x.vogel)).length, grillen: X.filter((x) => hoer(x.grille)).length,
                                verkehr: X.reduce((q, x) => Math.max(q, x.verkehr || 0), 0), faehrt: X.reduce((q, x) => Math.max(q, x.faehrt || 0), 0), bewohner: U1 ? U1.bewohner : 0,
                                temperatur: X.length ? [Math.min(...X.map((x) => x.temperatur)), Math.max(...X.map((x) => x.temperatur))].map((v) => +(+v).toFixed(1)) : null,
                                je: X.map((x) => [x.t, +x.sonne.toFixed(2), Number.isFinite(x.vogel) ? +x.vogel.toFixed(1) : null, Number.isFinite(x.grille) ? +x.grille.toFixed(1) : null, x.voegel, x.akt.slice(0, 2).join("/")]),
                                fehler: fe,
                            },
                        };
                    }
                    if (U[2]) {
                        const X = (U2 && U2.aus) || [];
                        const sw = U2 ? U2.schwelle : -64;
                        const hoer = (db) => typeof db === "number" && db >= sw;
                        // ein Widerspruch: kahles Laub im Bild (Präsenz < 0,3), am Ohr rauscht Laub; Grillen im Winter
                        let w1 = 0;
                        for (const x of X) w1 += (typeof x.laub === "number" && x.laub < 0.3 && hoer(x.laubDb) ? 1 : 0) + (x.name === "winter" && hoer(x.grilleDb) ? 1 : 0);
                        let anders = 0;
                        for (let i = 0; i < X.length; i++) {
                            const y = X[(i + 6) % X.length];
                            const dif = (p, q) => (Number.isFinite(p) || Number.isFinite(q) ? !(Number.isFinite(p) && Number.isFinite(q) && Math.abs(p - q) < 1) : false);
                            if (dif(X[i].laubDb, y.laubDb) || dif(X[i].grilleDb, y.grilleDb) || dif(X[i].vogelDb, y.vogelDb)) anders++;
                        }
                        roh[2] = { werte: X.length ? { widersprueche: w1, monate: X.length } : {}, zeuge: { monate: X.length, laubStreuung: +sd(X.map((x) => x.laub || 0)).toFixed(3), klangFolgt: anders, kronen: U2 ? +U2.kronen.toFixed(3) : 0, trachtLeser: U2 ? U2.kleidung : 0, je: X.map((x) => [x.name, x.laub === null ? null : +x.laub.toFixed(2), +(+x.deckung).toFixed(2), +(+x.temp).toFixed(1), Number.isFinite(x.laubDb) ? +x.laubDb.toFixed(1) : null, Number.isFinite(x.grilleDb) ? +x.grilleDb.toFixed(1) : null]), fehler: fe } };
                        roh[2].nicht = "Kleidung und Ernteziele lesen keine Jahreszeit (die Tracht liest die Epoche, der Bewohnertag Uhr und Regen, nie den Monat)" + (anders ? "" : "; der Klang folgt dem Jahr nicht: Laub " + X.map((x) => (typeof x.laub === "number" ? x.laub.toFixed(2) : "?")).join("/") + " im Bild, am Ohr je Monat dieselbe Laubstimme");
                    }
                    if (U[3] || U[4]) {
                        let Z = null;
                        try {
                            Z = await S(zeit, { sprungMa: -0.0001 });
                        } catch (e) {
                            Z = { fehler: kurz(e), epochen: [], stimmen: [] };
                        }
                        if (U[3]) {
                            roh[3] = { werte: { orte: Z.orte || 0 }, zeuge: { orte: Z.orte || 0, dKlima: Z.dKlima, dMeer: Z.dMeer, epocheZeitlos: Z.gleich, fehler: Z.fehler } };
                            roh[3].nicht = "kein Sprung um 100 Jahre am Ort: der Planet ändert sich in 100 Jahren um " + (Number.isFinite(Z.dKlima) ? Z.dKlima.toExponential(2) : "?") + " K, Bauweise, Lampen und Sprache lesen die Zeit nicht (_siedlungEpoche liest nur den Samen)";
                        }
                        if (U[4]) {
                            const es = (Z.stimmen || []).filter((k) => /huf|dampf|motor|verbrenn|elektro|epoch/i.test(k));
                            roh[4] = { werte: {}, zeuge: { epochen: (Z.epochen || []).length, liste: Z.epochen, epochKanaele: es.length, fehler: Z.fehler } };
                            roh[4].nicht = "nur das Bild der Siedlung liest die Epoche (" + (Z.epochen || []).join(", ") + "); Abgriff, Verb-Tafel und Ziele lesen sie nicht — eine Epochenfahrt hat keinen zweiten Kanal";
                        }
                    }
                    if (U[5] || U[6]) {
                        let Z5 = [];
                        let Z6 = [];
                        let zf = null;
                        try {
                            const s5 = [];
                            for (let i = 0; i < 10; i++) s5.push("same-saat-" + i);
                            if (U[5]) Z5 = await S(zeitalter, { saaten: s5, zeiten: [-541, -359, -252, -66, -0.02, 0] });
                            const s6 = [];
                            for (let i = 0; i < 50; i++) s6.push("same-saat-" + i);
                            if (U[6]) Z6 = await S(zeitalter, { saaten: s6, zeiten: [-300, 0] });
                        } catch (e) {
                            zf = kurz(e);
                        }
                        const art = (Z) => [...new Set(Z.flatMap((x) => x.felder))].filter((f) => /art|fauna|leben|tier|himmel|stern/i.test(f));
                        if (U[5]) {
                            roh[5] = { werte: { zeitalter: new Set(Z5.map((x) => x.zeitMa)).size, saaten: new Set(Z5.map((x) => x.samen)).size }, zeuge: { antworten: Z5.length, streuungM: +sd(Z5.map((x) => x.h)).toFixed(1), inventar: art(Z5).length, fehler: zf } };
                            if (!art(Z5).length) roh[5].nicht = "kein Inventar der Epoche: der Planet-Faden trägt je Zeitalter weder Arten noch Himmel (" + Z5.length + " Antworten) — Arten am Abgriff und im Bild sind die von heute";
                        }
                        if (U[6]) {
                            roh[6] = { werte: { paare: Z6.length }, zeuge: { antworten: Z6.length, streuungM: +sd(Z6.map((x) => x.h)).toFixed(1), inventar: art(Z6).length, fehler: zf } };
                            if (!art(Z6).length) roh[6].nicht = "kein Inventar der Epoche je (Planet, Datum): " + Z6.length + " Antworten des Planet-Fadens ohne Arten, Himmel, Technik — kein Kanal kann einem Datum folgen";
                        }
                    }
                    return { sprossen: roh };
                },
                sprossen: {
                    1: {
                        u: {},
                        soll: [K.soll(EP, 1, "24 Zufallsuhren", { key: "uhren", rel: "≥", zahl: 24 }), K.soll(EP, 1, "0 Widersprüche zwischen Sonnenstand, Klangbild (Chor, Grillen, Verkehr) und Bewohnertag", { key: "widersprueche", rel: "=", zahl: 0 })],
                        zeuge: zeugeMin([
                            ["uhren", 24, "weniger als 24 Uhren"],
                            ["sonneStreuung", 0.1, "der Sonnenstand folgt der Uhr nicht"],
                            ["gegenWidersprueche", 1, "der Gegenlauf (Licht der Gegenuhr) erzeugt keinen Widerspruch — Klang und Bewohnertag hängen nicht an der Uhr"],
                            ["chor", 1, "nie ein Chor am Ohr — der Kanal Chor ist ungeprüft"],
                            ["grillen", 1, "die Grillen schweigen an diesem Ort zu jeder Uhr (zu kalt) — der Kanal Grillen ist ungeprüft"],
                            ["verkehr", 1, "kein Wagen im Umkreis — der Kanal Verkehr ist ungeprüft"],
                            ["bewohner", 1, "kein lebender Bewohner: der Bewohnertag ist ungeprüft"],
                        ]),
                        taeter: "stamm/klang.js _umweltLageZwei · stamm/siedlung-bewohner.js _bewohnerSoll (die eine Uhr)",
                        gruen: { werte: { uhren: 24, widersprueche: 0 }, zeuge: { uhren: 24, sonneStreuung: 0.6, gegenWidersprueche: 9, chor: 12, grillen: 8, verkehr: 4, bewohner: 30 } },
                        attrappen: [
                            A("0 Widersprüche ohne Gegenlauf", { uhren: 24, widersprueche: 0 }, { uhren: 24, sonneStreuung: 0.6, gegenWidersprueche: 0, chor: 12, grillen: 8, verkehr: 4, bewohner: 30 }),
                            A("0 Widersprüche ohne Bewohner", { uhren: 24, widersprueche: 0 }, { uhren: 24, sonneStreuung: 0.6, gegenWidersprueche: 9, chor: 12, grillen: 8, verkehr: 4, bewohner: 0 }),
                            A("0 Widersprüche, Grillen und Verkehr nie gehört", { uhren: 24, widersprueche: 0 }, { uhren: 24, sonneStreuung: 0.6, gegenWidersprueche: 9, chor: 12, grillen: 0, verkehr: 0, bewohner: 30 }),
                        ],
                    },
                    2: {
                        u: {},
                        soll: [K.soll(EP, 2, "12 Zufallsmonate", { key: "monate", rel: "≥", zahl: 12 }), K.soll(EP, 2, "0 Widersprüche zwischen Bild, Klang, Kleidung und Zielen", { key: "widersprueche", rel: "=", zahl: 0 })],
                        zeuge: zeugeMin([["monate", 12, "weniger als 12 Monate"], ["laubStreuung", 0.05, "das Laub im Bild folgt dem Jahr nicht"], ["klangFolgt", 1, "der Klang des Gegenmonats ist derselbe — der Klang folgt dem Jahr nicht"], ["kleidungJahr", 1, "keine Kleidung folgt dem Monat"]]),
                        taeter: "klang-core.js umweltMischung (die Laubstimme liest die Deckung, nie das Jahr) · stamm/siedlung-bewohner.js _bewohnerTracht (die Tracht der Epoche, nie des Monats)",
                        nicht: "Kleidung und Ernteziele lesen keine Jahreszeit",
                        leser: "stamm/siedlung-bewohner.js:363 _bewohnerTracht — die Tracht liest die Epoche (fachwerk kleidung), nie den Monat; stamm/siedlung-bewohner.js:2219 _bewohnerSoll — liefert { ziel, drinnen, akt } aus Uhr und Regen, kein Ernteziel je Monat; klang-core.js:898 laub — die Laubstimme liest die Kronen-Deckung, nie das Laub der Jahreszeit",
                        gruen: { werte: { monate: 12, widersprueche: 0 }, zeuge: { monate: 12, laubStreuung: 0.25, klangFolgt: 8, kleidungJahr: 2 } },
                        attrappen: [A("0 Widersprüche, der Klang taub für das Jahr", { monate: 12, widersprueche: 0 }, { monate: 12, laubStreuung: 0.25, klangFolgt: 0, kleidungJahr: 2 })],
                    },
                    3: {
                        u: {},
                        soll: [K.soll(EP, 3, "Sprung um 100 Jahre an 10 Orten", { key: "orte", rel: "≥", zahl: 10 }), sollWort(EP, 3, "Änderung in Bild, Klang und Sprache gleichgerichtet", { key: "gleichgerichtet", rel: "=", zahl: 1 }), K.soll(EP, 3, "0 Waisen", { key: "waisen", rel: "=", zahl: 0 })],
                        zeuge: zeugeMin([["orte", 10, "weniger als 10 Orte"], ["epocheZeitlos", 0, "die Epoche fehlt"], ["sprung", 1, "kein Sprung um 100 Jahre in der Welt"]]),
                        taeter: "stamm/siedlung-ort.js _siedlungEpoche (liest nur den Samen)",
                        nicht: "kein Sprung um 100 Jahre am Ort",
                        leser: "stamm/siedlung-ort.js:2006 _siedlungEpoche — (seed) liest nur den Samen, nie die Zeit; der Sprung (stamm/netz-portal.js:660 _reiseBetreten) gebiert eine neue Welt",
                        gruen: { werte: { orte: 10, gleichgerichtet: 1, waisen: 0 }, zeuge: { orte: 10, epocheZeitlos: 0, sprung: 10 } },
                        attrappen: [A("gleichgerichtet ohne Sprung", { orte: 10, gleichgerichtet: 1, waisen: 0 }, { orte: 10, epocheZeitlos: 1, sprung: 0 })],
                    },
                    4: {
                        u: {},
                        soll: [K.soll(EP, 4, "Epochenfahrt: 0 anachronistische Quellen über Bild, Abgriff, Verb-Tafel und Ziele", { key: "anachronismen", rel: "=", zahl: 0 }), K.soll(EP, 4, "Epoche blind erkannt ≥ 80 %", { key: "erkanntProzent", einheit: "%" })],
                        zeuge: zeugeMin([["epochen", 3, "weniger als drei Epochen"], ["epochKanaele", 3, "weniger als drei Kanäle lesen die Epoche"]]),
                        taeter: "stamm/klang.js _umweltLageZwei (keine Epoche am Ohr) · fachwerk-core.js siedlungsEpoche (nur das Bild)",
                        nicht: "nur das Bild liest die Epoche",
                        leser: "stamm/klang.js:474 _umweltLageZwei — Abgriff, Verb-Tafel und Ziele lesen keine Epoche; nur das Bild der Siedlung (fachwerk-core.js:4495 siedlungsEpoche)",
                        gruen: { werte: { anachronismen: 0, erkanntProzent: 85 }, zeuge: { epochen: 4, epochKanaele: 4 } },
                        attrappen: [A("85 % ohne Kanäle", { anachronismen: 0, erkanntProzent: 85 }, { epochen: 4, epochKanaele: 0 })],
                    },
                    5: {
                        u: {},
                        soll: [K.soll(EP, 5, "6 Zeitalter × 10 Saaten", { key: "zeitalter", rel: "≥", zahl: 6 }), K.soll(EP, 5, "6 Zeitalter × 10 Saaten", { key: "saaten", rel: "≥", zahl: 10 }), K.soll(EP, 5, "0 Anachronismen", { key: "anachronismen", rel: "=", zahl: 0 })],
                        zeuge: zeugeMin([["antworten", 60, "weniger als 60 Antworten"], ["streuungM", 1e-6, "keine Streuung"], ["inventar", 1, "kein Inventar der Epoche"]]),
                        taeter: "planet-core.js planetOrt (kein Inventar der Epoche)",
                        nicht: "kein Inventar der Epoche",
                        leser: "planet-core.js:2684 planetOrt — delta trägt kein Inventar der Epoche (Arten, Himmel, Luft)",
                        gruen: { werte: { zeitalter: 6, saaten: 10, anachronismen: 0 }, zeuge: { antworten: 60, streuungM: 2000, inventar: 3 } },
                        attrappen: [A("0 Anachronismen ohne Faden", { zeitalter: 6, saaten: 10, anachronismen: 0 }, { antworten: 0 })],
                    },
                    6: {
                        u: {},
                        soll: [K.soll(EP, 6, "N = 100 (Planet, Datum)", { key: "paare", rel: "≥", zahl: 100 }), K.soll(EP, 6, "Anteil ohne Anachronismus über alle Kanäle ≥ 0,95", { key: "anteil" })],
                        zeuge: zeugeMin([["antworten", 100, "weniger als 100 Antworten"], ["streuungM", 1e-6, "keine Streuung"], ["inventar", 1, "kein Inventar der Epoche"]]),
                        taeter: "planet-core.js planetOrt (kein Inventar der Epoche)",
                        nicht: "kein Inventar der Epoche je (Planet, Datum)",
                        leser: "planet-core.js:2684 planetOrt — delta trägt kein Inventar der Epoche je (Planet, Datum)",
                        gruen: { werte: { paare: 100, anteil: 0.96 }, zeuge: { antworten: 100, streuungM: 2000, inventar: 3 } },
                        attrappen: [A("0,96 ohne Faden", { paare: 100, anteil: 0.96 }, { antworten: 0 })],
                    },
                },
            },
        },
    };
})());

// ── DIE PERSPEKTIVE zusammenspiel.same (9 Leitern, 61 Sprossen, 3 belegt: stoerung S1, kaskade S1, ereignis S1 — g1.js BRAND_SITZUNG
// und LAVA_SITZUNG): die Kopplungen über alle Kapitel, jede mit ihrem Gegenlauf (R7). Gemessen wird in der warmen Welt der Sitzung um
// den Spieler (dort stehen die Chunks): die Tat über die Wege des Spiels (der Satz `spawn_studio`, `lava`, `_brandEntfachen`, die Ernte
// `harvestArchitecture`), ihre Antwort über die Leser der Welt (`auraAt`, `_atlasWaterLevelAt`, `_forestStandDensity`, `_temperaturAt`,
// `faunaBestand`, `_sukzession`, `_werkAlter`), der Planet über den Planet-Faden (`r._planetAuftrag`, planet-ort und planet-anker) an den
// Saaten „same-saat-0…99“ (der Faden behält die Pläne je Samen: jede Leiter fragt dieselben). Jede Tat wird am Ende zurückgenommen
// (die Taten-Liste auf ihre Länge, `_tatGen`, die Decken neu gemalt, der Wald der Narbe neu gepflanzt — wie brandSeite der Linse).
L.perspektive("same", (() => {
    const A = "same.kopplung.aufwaerts";

    // ════════ same.kopplung.aufwaerts — die Tat schreibt das Große (Haus, Lava) ════════
    // Die Tat: ein Haus über den Satz `spawn_studio haus` (der EINE Stempel `_studioStampFor`) 30–120 m um den Spieler; zehn Orte im
    // Umkreis bis 1 km (Pegel `_atlasWaterLevelAt`, Leben `auraAt`, Wuchs `_wuchsAt`, Feuchte `_feuchteAt`, Wild aus `faunaBestand`, Wald
    // `_forestStandDensity`) vor ↔ nach der Tat, der Gegenlauf dieselben Orte zweimal OHNE Tat; der Speicher-Zuwachs ist die Länge des
    // Stands (`buildStateSnapshot`) nach ↔ vor; der Wald in 5 km, das Wasser der nächsten Flusspunkte, die Temperatur am Haus und 1 km
    // fern, die Küste und das Klima des Planeten am Anker der Welt. Am Gerät: das Bildpaar aus 400 m über dem Ort vor ↔ nach dem Bau.
    // Dann die Lava (`lava`, der einzige Ausbruch der Welt) auf einer Zelle ohne Bett (sie zündet nichts): Temperatur und Sonnenlicht
    // vor ↔ nach, der Gegenlauf zweimal ohne Guss. Der Planet: 100 Saaten am Anker, Zeit 0 ↔ 300 a, und ob seine Antwort ein Glied der
    // Zivilisation trägt.
    const zeugeHaus = (roh) => {
        const z = roh.zeuge || {};
        if (z.haus !== true) return "kein Haus gebaut (der Satz spawn_studio setzte nichts)";
        if (!(z.blkNach > z.blkVor)) return "das Haus steht nicht an seiner Stelle (Blocker am Ort " + z.blkVor + " → " + z.blkNach + ")";
        if (!(z.orte >= 10)) return "nur " + (z.orte || 0) + " Orte im Umkreis gemessen (Soll 10)";
        if (z.gegen !== 0) return "der Gegenlauf ohne Tat ändert " + z.gegen + " Orte (Rauschen, keine Kopplung)";
        if (!(z.bytes > 0)) return "kein Speicher-Zuwachs der Tat gemessen";
        return null;
    };
    const HAUS_Z = { haus: true, blkVor: 0, blkNach: 6, orte: 10, gegen: 0, bytes: 262, bild: true };
    const zeugePlanet = (min) => (roh) => {
        const z = roh.zeuge || {};
        if (!(z.saaten >= min)) return "nur " + (z.saaten || 0) + " Saaten des Planet-Fadens (Soll ≥ " + min + ")";
        if (!(z.streuungM > 0)) return "die Saaten tragen keine Streuung der Höhe (eine Konstante, nicht der Faden)";
        if (!(z.mitOhne > 0)) return "kein Paar mit ↔ ohne Ursache gemessen (der Gegenlauf fehlt)";
        return null;
    };
    const PLANET_Z = { saaten: 100, streuungM: 2400, mitOhne: 100 };

    return {
        leitern: {
            [A]: {
                sek: 45,
                mutiert: true,
                pfad: ["stamm/feld-dsl.js", "stamm/feld-leben.js", "stamm/feld-brand.js", "stamm/siedlung-*.js", "stamm/vegetation-wiese.js", "stamm/bild-himmel.js", "stamm/wasser-hydro.js", "stamm/gelaende-chunks.js", "stamm/kreatur-leben.js", "stamm/speicher-welten.js", "voxel-worker.js", "planet-core.js", "gelaende-core.js", "phyto-core.js", "fachwerk-core.js", "scripts/werkbank.cjs"],
                ungefahren: "das Bildpaar aus 400 m (S1) und die Orbit-Bilder (S7) schießt nur das Gerät; headless steht die Welt nie (__ausgabeAufnahme wartet auf Ruhe)",
                mess: async function (H, U, M) {
                    const S = (fn, a) => H.seite("return await (" + String(fn) + ")(r, " + JSON.stringify(a || {}) + ");");
                    const seite = async (r, a) => {
                        const st = r.state;
                        const C = AnazhRealm;
                        const cs = C.LIFE_FIELD.cell;
                        const pm = st.playerMesh.position;
                        const r3 = (v) => (Number.isFinite(v) ? Math.round(v * 1e3) / 1e3 : null);
                        const frei = (x, z, R) => r._landAt(x, z, 0.2) && !r._nassAt(x, z) && !r._blockerUmPlatz(x, z, R, []).length;
                        let P = null;
                        for (let d = 30; d <= 120 && !P; d += 15)
                            for (let k = 0; k < 12 && !P; k++) {
                                const x = pm.x + d * Math.cos((k * Math.PI) / 6);
                                const z = pm.z + d * Math.sin((k * Math.PI) / 6);
                                if (frei(x, z, 8)) P = { x, z };
                            }
                        if (!P) return { fehler: "kein trockener freier Ort 30–120 m um den Spieler" };
                        P.y = r._voxelSurfaceY(P.x, P.z);
                        const tiere = () => {
                            const o = [];
                            for (const R of Object.values((st.faunaBestand || {}).regionen || {})) for (const t of R.tiere || []) o.push(t);
                            return o;
                        };
                        const orte = a.radien.map((m, k) => [P.x + m * Math.cos(k * 2.39996), P.z + m * Math.sin(k * 2.39996)]);
                        const lies = () => {
                            const T = tiere();
                            return orte.map(([x, z]) => {
                                const y = r._voxelSurfaceY(x, z);
                                return [r3(r._atlasWaterLevelAt(x, z, y)), r3(r.auraAt(x, z).lebendig), r3(r._wuchsAt(x, z)), r3(r._feuchteAt(x, z, y)), T.filter((t) => Math.hypot(t.x - x, t.z - z) <= 150).length, r3(r._forestStandDensity(x, z))];
                            });
                        };
                        const anders = (X, Y) => X.filter((q, i) => q.some((v, j) => v !== Y[i][j])).length;
                        const wald = () => {
                            let s = 0;
                            let n = 0;
                            for (let i = -5; i <= 5; i++) for (let j = -5; j <= 5; j++) if (i * i + j * j <= 25) (s += r._forestStandDensity(P.x + i * 1000, P.z + j * 1000)), n++;
                            return r3(s / n);
                        };
                        const flussP = (r._hydroFor(P.x, P.z).rivers || []).flatMap((v) => v.points).sort((p, q) => Math.hypot(p.x - P.x, p.z - P.z) - Math.hypot(q.x - P.x, q.z - P.z)).slice(0, 8);
                        const fluss = () => r3(flussP.reduce((s, p) => { const b = r._voxelSurfaceY(p.x, p.z); return s + Math.max(0, r._atlasWaterLevelAt(p.x, p.z, b) - b); }, 0));
                        const fern = { x: P.x + 1000, z: P.z };
                        const temp = (q) => r3(r._temperaturAt(r._voxelSurfaceY(q.x, q.z), 0));
                        let t = performance.now();
                        const takt = () => r._gameLoopTick((t += 1000 / 60));
                        await r._fadenQuelle();
                        const an = await r._planetAnker();
                        const [B, L] = [(an.breite * 180) / Math.PI, (an.laenge * 180) / Math.PI];
                        const samen = r._planetSamen();
                        const planet = async () => {
                            const o = await r._planetAuftrag({ type: "planet-ort", samen, breite: B, laenge: L, zeitMa: 0 });
                            return [r3(o.kuesteKm), r3(o.delta.klima.sommer), r3(o.delta.meer.waterLevelM), r3(o.hoeheM)];
                        };
                        const bild = async () => {
                            await window.__weltStehtNach(takt, 900);
                            const cam = st.camera;
                            cam.position.set(P.x + 1, P.y + 400, P.z + 1);
                            cam.lookAt(P.x, P.y, P.z);
                            cam.updateMatrixWorld(true);
                            const v = new T.Vector3(P.x, P.y + 3, P.z).project(cam);
                            return { u8: (await window.__ausgabeAufnahme(960, 540)).u8, px: Math.round(((v.x + 1) / 2) * 960), py: Math.round(((1 - v.y) / 2) * 540) };
                        };
                        const aus = { ort: [P.x, P.z].map(Math.round), orte: orte.length };
                        const vor = lies();
                        aus.gegen = anders(vor, lies());
                        const pVor = await planet();
                        const [w0, f0, t0, y30] = [wald(), fluss(), [temp(P), temp(fern)], r._voxelSurfaceY(P.x + 30, P.z)];
                        const b0 = JSON.stringify(r.buildStateSnapshot()).length;
                        aus.blkVor = r._blockerUmPlatz(P.x, P.z, 6, []).length;
                        let bVor = null;
                        if (a.bild) {
                            try {
                                bVor = await bild();
                            } catch (e) {
                                aus.bild = { fehler: String((e && e.message) || e).slice(0, 200) };
                            }
                        }
                        const a0 = st.architectures.length;
                        const halt = st.weatherEffectTime;
                        let haus = null;
                        st.weatherEffectTime = 0;
                        try {
                            r.dslRun(["spawn_studio", "haus", ["at", P.x, P.y, P.z], 1, a.same], { source: "human" });
                            st.weatherEffectTime = halt;
                            haus = st.architectures.slice(a0).find((e) => /haus/.test(e.type)) || null;
                            aus.haus = !!haus;
                            aus.typ = haus && haus.type;
                            aus.blkNach = r._blockerUmPlatz(P.x, P.z, 6, []).length;
                            aus.orteGeaendert = anders(vor, lies());
                            aus.bytes = JSON.stringify(r.buildStateSnapshot()).length - b0;
                            aus.planet = [pVor, await planet()];
                            aus.wald = [w0, wald()];
                            aus.fluss = [f0, fluss()];
                            aus.temp = [t0, [temp(P), temp(fern)]];
                            aus.senkungM = r3(y30 - r._voxelSurfaceY(P.x + 30, P.z));
                            aus.staedte = r._staedte().length;
                            if (bVor && haus) {
                                try {
                                    const n = await bild();
                                    let k = 0;
                                    for (let y = n.py - 30; y <= n.py + 30; y++)
                                        for (let x = n.px - 30; x <= n.px + 30; x++) {
                                            if (x < 0 || y < 0 || x >= 960 || y >= 540) continue;
                                            const i = (y * 960 + x) * 4;
                                            if (Math.abs(n.u8[i] - bVor.u8[i]) + Math.abs(n.u8[i + 1] - bVor.u8[i + 1]) + Math.abs(n.u8[i + 2] - bVor.u8[i + 2]) > 24) k++;
                                        }
                                    aus.bild = { pixel: k, px: [n.px, n.py] };
                                } catch (e) {
                                    aus.bild = { fehler: String((e && e.message) || e).slice(0, 200) };
                                }
                            }
                        } finally {
                            st.weatherEffectTime = halt;
                            if (haus) r.removeArchitecture(haus);
                        }
                        // DIE LAVA auf einer Zelle ohne Bett im 3×3 (sie zündet nichts), 20–80 m vom Haus
                        let Q = null;
                        for (let d = 20; d <= 80 && !Q; d += 10)
                            for (let k = 0; k < 12 && !Q; k++) {
                                const x = P.x + d * Math.cos((k * Math.PI) / 6);
                                const z = P.z + d * Math.sin((k * Math.PI) / 6);
                                const [cx, cz] = [Math.floor(x / cs), Math.floor(z / cs)];
                                let bett = false;
                                for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) bett = bett || !!r._brandStoff(cx + i, cz + j);
                                if (!bett && frei(x, z, 4)) Q = { x, z, y: r._voxelSurfaceY(x, z) };
                            }
                        const licht = () => {
                            for (let i = 0; i < 4; i++) takt();
                            const c = st.weltLicht && st.weltLicht.U && st.weltLicht.U.l0c && st.weltLicht.U.l0c.value;
                            return r3(c ? c.x + c.y + c.z : st.directionalLight ? st.directionalLight.intensity : NaN);
                        };
                        if (!Q) aus.lava = { fehler: "keine Zelle ohne Bett 20–80 m um den Ort" };
                        else {
                            const L0 = (st.worldMeta.taten ||= []);
                            const n0 = L0.length;
                            const bf0 = new Set((st.brandFeld || new Map()).keys());
                            const lv = { ort: [Q.x, Q.z].map(Math.round), tVor: temp(Q), lichtVor: licht(), tOhne: temp(Q), lichtOhne: licht(), tFernVor: temp({ x: Q.x + 1000, z: Q.z }) };
                            st.weatherEffectTime = 0;
                            try {
                                r.dslRun(["lava", Q.x, Q.y, Q.z], { source: "human" });
                                st.weatherEffectTime = halt;
                                lv.taten = L0.length - n0;
                                lv.glut = r3((r._lavaAt(Q.x, Q.z) || { glut: null }).glut);
                                lv.tNach = temp(Q);
                                lv.lichtNach = licht();
                                lv.tFernNach = temp({ x: Q.x + 1000, z: Q.z });
                            } finally {
                                st.weatherEffectTime = halt;
                                L0.length = n0;
                                for (const k of [...(st.brandFeld || new Map()).keys()]) if (!bf0.has(k)) st.brandFeld.delete(k);
                                r._tatGen = (r._tatGen | 0) + 1;
                                r._lavaTaktT = -Infinity;
                                for (const s of st.wegeKarte ? st.wegeKarte.stufen : []) if (s.zentriert) r._lavaStufeMalen(s);
                            }
                            aus.lava = lv;
                        }
                        // DER PLANET an 100 Saaten am Anker: Zeit 0 ↔ 300 a (0,0003 Ma) — und ob die Antwort ein Glied der Zivilisation trägt
                        const ziv = (o) => Object.keys(o).concat(Object.keys(o.delta || {})).filter((k) => /ziv|kultur|co2|techn|mensch|siedl|stadt/i.test(k)).length;
                        const S0 = await Promise.all(
                            Array.from({ length: a.saaten }, async (_, i) => {
                                const s = "same-saat-" + i;
                                const o0 = await r._planetAuftrag({ type: "planet-ort", samen: s, breite: B, laenge: L, zeitMa: 0 });
                                const o1 = await r._planetAuftrag({ type: "planet-ort", samen: s, breite: B, laenge: L, zeitMa: 0.0003 });
                                return [o0.hoeheM, o1.delta.klima.sommer - o0.delta.klima.sommer, ziv(o0) + ziv(o1), o1.hoeheM !== o0.hoeheM ? 1 : 0];
                            })
                        );
                        const hm = S0.reduce((s, q) => s + q[0], 0) / S0.length;
                        aus.saaten = { n: S0.length, streuungM: r3(Math.sqrt(S0.reduce((s, q) => s + (q[0] - hm) * (q[0] - hm), 0) / S0.length)), dSommer: r3(S0.reduce((s, q) => s + q[1], 0) / S0.length), ziv: S0.filter((q) => q[2] > 0).length, zeitAendert: S0.reduce((s, q) => s + q[3], 0) };
                        return aus;
                    };
                    const x = await S(seite, { radien: [60, 120, 200, 300, 400, 500, 650, 800, 900, 1000], same: 7, bild: !M.swift, saaten: 100 });
                    if (x.fehler) throw new Error(x.fehler);
                    const P0 = x.planet ? x.planet[0] : [];
                    const P1 = x.planet ? x.planet[1] : [];
                    const lv = x.lava || {};
                    const sa = x.saaten || {};
                    const auge7 = await M.auge("same-aufwaerts-s7", { ort: "wiese" });
                    const zh = { haus: x.haus, blkVor: x.blkVor, blkNach: x.blkNach, orte: x.orte, gegen: x.gegen, bytes: x.bytes, bild: !!(x.bild && x.bild.pixel != null), typ: x.typ };
                    const zp = { saaten: sa.n, streuungM: sa.streuungM, mitOhne: 0, zivilisation: sa.ziv };
                    const wa = x.wald || [];
                    const fl = x.fluss || [];
                    const te = x.temp || [[], []];
                    return {
                        sprossen: {
                            1: { werte: { sichtHoeheM: x.bild && x.bild.pixel != null ? (x.bild.pixel >= 4 ? 400 : 0) : undefined, orteGeaendert: x.orteGeaendert, tatBytes: x.bytes }, zeuge: Object.assign({ bildFehler: x.bild && x.bild.fehler }, zh) },
                            2: { werte: { rWaldBevoelkerung: null, waldAnteilVor: wa[0], waldAnteilNach: wa[1], staedte: x.staedte }, zeuge: Object.assign({ staedte: x.staedte, wald: wa }, zh), nicht: "kein Dorf rodet: r._staedte() trägt " + x.staedte + " Städte, der Wald im Umkreis 5 km steht nach der Tat bei " + wa[1] + " (vor " + wa[0] + ") — phyto-core forestStandDensity liest keine Bevölkerung" },
                            3: { werte: { sedimentFaktor: null, waermeinselK: te[1][0] != null && te[1][1] != null ? Math.round((te[1][0] - te[1][1]) * 1000) / 1000 : null, tempAmHausVorNachK: te[0][0] != null ? Math.round((te[1][0] - te[0][0]) * 1000) / 1000 : null }, zeuge: Object.assign({ temp: te }, zh), nicht: "keine Stadt von 10⁵ und kein Sediment: die Temperatur liest nur die Höhe (`_temperaturAt(y)`), Haus ↔ 1 km fern " + JSON.stringify(te[1]) + " °C; die Erosion liest keine Rodung" },
                            4: { werte: { orbitZuBoden: null, sprungJahre: 0, kuesteVorKm: P0[0], kuesteNachKm: P1[0] }, zeuge: Object.assign({ planet: x.planet }, zh), nicht: "kein Damm, kein Delta: die Küste des Planeten am Anker vor ↔ nach der Tat " + P0[0] + " ↔ " + P1[0] + " km — planet-ort nimmt nur samen, breite, laenge, zeitMa" },
                            5: { werte: { hochwasserFaktor: fl[0] > 0 ? Math.round((fl[1] / fl[0]) * 1000) / 1000 : null, senkungFaktor: null, senkungCmA: x.senkungM != null ? x.senkungM * 100 : null }, zeuge: Object.assign({ fluss: fl }, zh), nicht: "keine Megastadt (10⁷), keine Versiegelung: der Pegel liest keinen Bau (Wassertiefe der nächsten Flusspunkte vor ↔ nach " + fl.join(" ↔ ") + " m), der Boden sinkt nicht" },
                            6: {
                                werte: { abkuehlungK: lv.tVor != null && lv.tNach != null ? Math.round((lv.tVor - lv.tNach) * 1000) / 1000 : null, bodenlichtVerh: lv.lichtVor > 0 && lv.lichtNach != null ? Math.round((lv.lichtNach / lv.lichtVor) * 1000) / 1000 : null },
                                zeuge: { glut: lv.glut, taten: lv.taten, gegenK: lv.tOhne != null && lv.tVor != null ? lv.tVor - lv.tOhne : null, gegenLicht: lv.lichtOhne != null && lv.lichtVor != null ? lv.lichtOhne - lv.lichtVor : null, fern: [lv.tFernVor, lv.tFernNach], fehler: lv.fehler },
                                nicht: "kein Ausbruch kühlt einen Kontinent: die Lava ist EINE 16-m-Zelle (glut " + lv.glut + "), Temperatur " + lv.tVor + " → " + lv.tNach + " °C, Sonnenlicht " + lv.lichtVor + " → " + lv.lichtNach + " — `_temperaturAt` liest keine Asche, kein Aerosol",
                            },
                            7: { werte: { plausibelProzent: undefined, erwaermungK: sa.dSommer }, zeuge: zp, auge: auge7, nicht: "keine Zivilisation formt den Planeten: " + sa.ziv + " von " + sa.n + " Saaten tragen ein Glied der Zivilisation, kein CO₂ im Planet-Faden; 300 a ändern den Sommer um " + sa.dSommer + " K" },
                            8: { werte: { anteilProzent: sa.n ? (100 * sa.ziv) / sa.n : null }, zeuge: zp, nicht: "keine Fremd-Zivilisation: " + sa.ziv + " von " + sa.n + " Planeten-Saaten tragen eine — der Faden kennt den Zustand mit Zivilisation nicht (planet-ort ohne Eingang)" },
                        },
                    };
                },
                sprossen: {
                    1: {
                        u: { tat: "haus", radienM: [60, 1000] },
                        soll: [K.soll(A, 1, "Pixel aus 400 m an seiner Stelle", { key: "sichtHoeheM", rel: "≥", zahl: 400, einheit: "m" }), K.soll(A, 1, "Bildpaar an 10 Orten im Umkreis", { key: "orteGeaendert", rel: "≥", zahl: 10 })],
                        zeuge: (roh) => zeugeHaus(roh) || ((roh.zeuge || {}).bild !== true ? "das Haus aus 400 m ohne Bildpaar (keine Pixel der Welt)" : null),
                        taeter: "stamm/feld-leben.js `_tatSchreiben` / phyto-core `forestStandDensity` (die Tat verschiebt keinen Elternknoten: Pegel, Wuchs, Wild um das Haus bleiben)",
                        leser: "stamm/vegetation-wiese.js:2799 `_forestStandDensity` und stamm/gelaende-boden.js:1619 `_feuchteAt` — kein Leser eines gebauten Hauses im Umkreis",
                        gruen: { werte: { sichtHoeheM: 400, orteGeaendert: 10 }, zeuge: HAUS_Z },
                        attrappen: [
                            { name: "zehn geänderte Orte ohne gebautes Haus", roh: { werte: { sichtHoeheM: 400, orteGeaendert: 10 }, zeuge: Object.assign({}, HAUS_Z, { haus: false }) } },
                            { name: "die Orte ändern sich auch ohne Tat (das Rauschen der Welt zählt als Kopplung)", roh: { werte: { sichtHoeheM: 400, orteGeaendert: 10 }, zeuge: Object.assign({}, HAUS_Z, { gegen: 4 }) } },
                            { name: "400 m aus der Projektion statt aus dem Bild", roh: { werte: { sichtHoeheM: 400, orteGeaendert: 10 }, zeuge: Object.assign({}, HAUS_Z, { bild: false }) } },
                        ],
                    },
                    2: {
                        u: { staedteMin: 3, waldRadiusKm: 5 },
                        soll: [K.soll(A, 2, "r ≥ 0,6", { key: "rWaldBevoelkerung" }), K.soll(A, 2, "ΔE ≥ 5 an der Tat", { key: "deltaETat" }), K.soll(A, 2, "sonst ≤ 1", { key: "deltaESonst" })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.staedte >= 3)) return "nur " + (z.staedte || 0) + " Städte (r braucht ≥ 3)";
                            if (!(z.wald && z.wald[0] !== z.wald[1])) return "der Wald im Umkreis 5 km ändert sich mit der Tat nicht";
                            return zeugeHaus(roh);
                        },
                        taeter: "phyto-core.js forestStandDensity (liest keine Bevölkerung) · stamm/siedlung-ort.js `_staedte`",
                        nicht: "kein Dorf, das rodet",
                        leser: "stamm/vegetation-wiese.js:2799 `_forestStandDensity` — kein Eingang der Bevölkerung; stamm/siedlung-ort.js:1472 `_staedte` leer in der Welt",
                        gruen: { werte: { rWaldBevoelkerung: 0.71, deltaETat: 7.2, deltaESonst: 0.6 }, zeuge: Object.assign({ staedte: 12, wald: [0.62, 0.48] }, HAUS_Z) },
                        attrappen: [{ name: "r 0,71 aus drei erfundenen Dörfern, der Wald bleibt", roh: { werte: { rWaldBevoelkerung: 0.71, deltaETat: 7.2, deltaESonst: 0.6 }, zeuge: Object.assign({ staedte: 12, wald: [0.62, 0.62] }, HAUS_Z) } }],
                    },
                    3: {
                        u: { stadt: 1e5, talKm: 10 },
                        soll: [K.soll(A, 3, "Sediment im Hafen ≥ 2× der Wald-Saat", { key: "sedimentFaktor" })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.temp && z.temp[1] && z.temp[1][0] != null)) return "keine Temperatur am Ort gemessen";
                            if (!(roh.werte && Math.abs(roh.werte.waermeinselK) > 0)) return "Stadt und Umland gleich warm (keine Wärmeinsel aus der Welt)";
                            return zeugeHaus(roh);
                        },
                        taeter: "stamm/bild-himmel.js `_temperaturAt` (liest nur die Höhe) · gelaende-core.js (keine Erosion aus Rodung)",
                        nicht: "keine Stadt, kein Sediment",
                        leser: "stamm/bild-himmel.js:3063 `_temperaturAt(y, traegTage)` — kein Ort, keine Siedlung im Eingang",
                        unklar: "„Temperatur Stadt ↔ Umland gegen gemessene Wärmeinseln“ trägt keine Zahl — Vorschlag: Wärmeinsel 1–3 K (die Tiefe der Sprosse) als zweites Soll.",
                        gruen: { werte: { sedimentFaktor: 2.4, waermeinselK: 1.8 }, zeuge: Object.assign({ temp: [[14, 14], [15.8, 14]] }, HAUS_Z) },
                        attrappen: [{ name: "Sediment 2,4× ohne Wärmeinsel und ohne Stadt", roh: { werte: { sedimentFaktor: 2.4, waermeinselK: 0 }, zeuge: Object.assign({ temp: [[14, 14], [14, 14]] }, HAUS_Z, { haus: false }) } }],
                    },
                    4: {
                        u: { dammKm: 100, jahre: 10 },
                        soll: [
                            K.soll(A, 4, "Bildpaar Delta vor ↔ nach 10 Jahren", { key: "sprungJahre", rel: "≥", zahl: 10, einheit: "a" }),
                            K.soll(A, 4, "Fläche der Änderung Orbit ↔ Boden ±10 %", { key: "orbitZuBoden", ref: 1, refQuelle: "die Fläche am Boden derselben Fahrt (Orbit ÷ Boden = 1; Erde: Rückzug des Nil-Deltas nach Assuan, Stanley 1996)" }),
                        ],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.planet && z.planet[0] && z.planet[1])) return "der Planet-Faden antwortete nicht vor und nach der Tat";
                            if (z.planet[0][0] === z.planet[1][0]) return "die Küste des Planeten bleibt nach der Tat (" + z.planet[0][0] + " km)";
                            return zeugeHaus(roh);
                        },
                        taeter: "voxel-worker.js planetOrtAuftrag (kein Eingang der Tat)",
                        nicht: "kein Damm, kein Delta",
                        leser: "voxel-worker.js:1446 planetOrtAuftrag(msg) — nimmt samen, breite, laenge, zeitMa, keine Tat",
                        gruen: { werte: { sprungJahre: 10, orbitZuBoden: 1.04 }, zeuge: Object.assign({ planet: [[288.6, 0, 0, 120], [287.9, 0, 0, 120]] }, HAUS_Z) },
                        attrappen: [{ name: "Orbit ÷ Boden 1,04, die Küste unverändert", roh: { werte: { sprungJahre: 10, orbitZuBoden: 1.04 }, zeuge: Object.assign({ planet: [[288.6, 0, 0, 120], [288.6, 0, 0, 120]] }, HAUS_Z) } }],
                    },
                    5: {
                        u: { menschen: 1e7, region: true },
                        soll: [K.soll(A, 5, "Hochwasser-Spitze ≥ 1,5× nach Versiegelung", { key: "hochwasserFaktor" }), K.soll(A, 5, "Senkung cm/a im Faktor 3 von Jakarta", { key: "senkungFaktor", rel: "≤", zahl: 3 })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.fluss && z.fluss[0] > 0)) return "kein Wasser an den Flusspunkten gemessen";
                            if (z.fluss[0] === z.fluss[1]) return "das Wasser der Flusspunkte bleibt nach der Versiegelung (" + z.fluss[0] + " m)";
                            return zeugeHaus(roh);
                        },
                        taeter: "gelaende-core.js pegelZustand (kein Eingang der Versiegelung)",
                        nicht: "keine Megastadt, keine Versiegelung",
                        leser: "stamm/wasser-hydro.js:231 `_pegelZustand` — liest Regen-Stempel und Regen-Mittel, keinen Bau",
                        gruen: { werte: { hochwasserFaktor: 1.7, senkungFaktor: 1.6 }, zeuge: Object.assign({ fluss: [2.1, 3.6] }, HAUS_Z) },
                        attrappen: [{ name: "Faktor 1,7 bei gleichem Wasser", roh: { werte: { hochwasserFaktor: 1.7, senkungFaktor: 1.6 }, zeuge: Object.assign({ fluss: [2.1, 2.1] }, HAUS_Z) } }],
                    },
                    6: {
                        u: { ausbruch: "lava", zelleM: 16 },
                        soll: [
                            K.soll(A, 6, "Abkühlung gegen Pinatubo (~0,5 K) ±50 %", { key: "abkuehlungK", ref: 0.5, refQuelle: "Erde: Pinatubo 1991, globale Abkühlung ~0,5 K im Jahr darauf (Hansen et al. 1992)" }),
                            K.soll(A, 6, "Bodenlicht unter der Wolke ±15 %", { key: "bodenlichtVerh", ref: 0.75, refQuelle: "Erde: Direktstrahlung Mauna Loa nach Pinatubo −25 % (Dutton & Christy 1992)" }),
                        ],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (z.fehler) return "kein Guss: " + z.fehler;
                            if (!(z.glut > 0 && z.taten >= 1)) return "die Lava glüht nicht (kein Ausbruch in der Welt)";
                            if (z.gegenK == null || z.gegenLicht == null) return "kein Gegenlauf ohne Guss gemessen";
                            if (Math.abs(z.gegenK) >= Math.abs((roh.werte || {}).abkuehlungK || 0)) return "die Abkühlung ohne Guss ist so groß wie mit (keine Kopplung)";
                            return null;
                        },
                        taeter: "stamm/bild-himmel.js `_temperaturAt` (kein Aerosol, keine Asche)",
                        nicht: "kein Ausbruch, der einen Kontinent kühlt",
                        leser: "stamm/bild-himmel.js:3063 `_temperaturAt` und stamm/feld-leben.js:2510 `_lavaGiessen` — die Lava schreibt nur ihre Zelle",
                        gruen: { werte: { abkuehlungK: 0.42, bodenlichtVerh: 0.78 }, zeuge: { glut: 1, taten: 1, gegenK: 0, gegenLicht: 0 } },
                        attrappen: [
                            { name: "0,42 K ohne Guss", roh: { werte: { abkuehlungK: 0.42, bodenlichtVerh: 0.78 }, zeuge: { glut: 0, taten: 0, gegenK: 0, gegenLicht: 0 } } },
                            { name: "dieselbe Abkühlung im Gegenlauf (der Tag kühlt, nicht die Asche)", roh: { werte: { abkuehlungK: 0.42, bodenlichtVerh: 0.78 }, zeuge: { glut: 1, taten: 1, gegenK: 0.42, gegenLicht: 0 } } },
                        ],
                    },
                    7: {
                        u: { saaten: 100, jahre: 300 },
                        soll: [K.soll(A, 7, "plausibel ≥ 90 %", { key: "plausibelProzent", einheit: "%" }), K.soll(A, 7, "Erwärmung je CO₂-Verdopplung 2–5 K", { key: "erwaermungK", einheit: "K" })],
                        auge: { pose: "Orbit über dem Planeten vor ↔ nach 300 a (heute keine Orbit-Pose: geschossen an der Wiese)", vorbild: "Prüfer-Satz R11: Orbitbild-Paare an 100 Saaten, plausibel ≥ 90 %" },
                        taeter: "voxel-worker.js planetOrtAuftrag (kein CO₂, keine Zivilisation)",
                        nicht: "keine Zivilisation, die den Planeten formt",
                        leser: "voxel-worker.js:1446 planetOrtAuftrag — kein Eingang für Landbau, Industrie, CO₂",
                        gruen: { werte: { plausibelProzent: 92, erwaermungK: 3 }, zeuge: PLANET_Z },
                        attrappen: [{ name: "3 K aus einer Tafel ohne Faden", roh: { werte: { plausibelProzent: 92, erwaermungK: 3 }, zeuge: { saaten: 0 } } }],
                    },
                    8: {
                        u: { planeten: 100 },
                        soll: [K.soll(A, 8, "Anteil der Planeten, die sich vom Zustand ohne Zivilisation messbar unterscheiden ≥ 80 %", { key: "anteilProzent", einheit: "%" })],
                        zeuge: zeugePlanet(100),
                        taeter: "voxel-worker.js planetOrtAuftrag (kein Zustand mit Zivilisation)",
                        nicht: "keine Fremd-Zivilisation",
                        leser: "voxel-worker.js:1446 planetOrtAuftrag — kein Eingang einer Zivilisation",
                        gruen: { werte: { anteilProzent: 86 }, zeuge: PLANET_Z },
                        attrappen: [{ name: "86 % ohne Paar mit ↔ ohne Zivilisation", roh: { werte: { anteilProzent: 86 }, zeuge: Object.assign({}, PLANET_Z, { mitOhne: 0 }) } }],
                    },
                },
            },
        },
    };
})());

// ── DAS STÜCK zusammenspiel.same: ereignis (S2–S7; S1 trägt g1.js LAVA_SITZUNG) und erdsaat (S1–S6) ─────────────────────────────────
// EREIGNIS — die Tat über die Wege des Spiels: der Brand (`_brandEntfachen`, der Akt der Welt) auf der trockenen Zelle mit Bett nächst
// dem Spieler, sein Lauf auf SEINER Uhr (`_tickBrand` je `BRAND.schrittS`, wie g1 brandSitzungProbe `brennen`) bis 1 ha (Asche +
// brennende Zellen × Zelle²), dann die Bilder der Welt (`__seitenTakt`) mit der Frame-Zeit, die der Flugschreiber liest
// (`_flightRecorderTick(frameMs)`), und die Lage jedes Bewohners ≤ 300 m (`_bewohnerSiedlungen`) gegen die brennenden Zellen. DER
// GEGENLAUF (R7): dieselben Bilder VOR dem Entfachen — Frame-Zeit ohne Brand und die Zellen, die jeder Bewohner ohne Front betrat;
// „meiden“ zählt nur, wer ohne Brand die Zellen der Front betrat und mit ihr nicht. Danach brennt die Front weiter bis 1 km² (Deckel
// der Wanduhr), das Bild des Brands schießt das Gerät an fester Pose über dem Herd, dann fällt alles (Brand-Feld, Taten, Asche, Narbe,
// Uhr, Wetter, Regler). Die Lava (`lava`, der einzige Ausbruch) auf einer Zelle ohne Bett: die Asche (`_ascheAt`) in 0–1 000 m mit ↔
// ohne Guss. Tsunami, Beben, Einschlag: die Welt wird gefragt, welchen Leser sie trägt (die Namen der Welt), wie viele Bewohner und
// Bauten sie hält, und der Planet-Faden antwortet an der Antipode des Ankers.
// ERDSAAT — der Planet-Faden (`r._planetAuftrag` planet-ort, stamm/gelaende-chunks.js → voxel-worker.js planetOrtAuftrag) am Samen
// „erde“: der Vesuv über ein Jahrhundert gegen einen Gegenort ohne Vulkan (R7), zehn Orte der Gefahr in drei Epochen, Pompeji 79 ·
// Lissabon 1755 · London 1666 an ihrem Jahr, Tambora → 1816 (der Sommer Mitteleuropas 1815 → 1816 gegen 1814 → 1815), der
// Meeresspiegel des Quartärs gegen die Rekonstruktion (Spratt & Lisiecki 2016), die fünf großen Aussterben gegen die Decke des
// Lebens am Faden (Fibonacci-Punkte gleicher Fläche, t − 5 · t · t + 5 Ma). Der Schlüssel der Erd-Saat (R4) ist die Frage an die
// Welt wie in planet.erde; ohne ihn ist jeder Umfang nicht erzeugbar.
L.perspektive("same", (() => {
    const E = "same.kopplung.ereignis";
    const D = "same.kopplung.erdsaat";

    // ════════ same.kopplung.ereignis — der Zeuge der Front (S2) ════════
    const zeugeFront = (roh) => {
        const z = roh.zeuge || {};
        if (z.fehler) return "kein Brand in der Welt: " + z.fehler;
        if (!(z.flaecheM2 >= 10000)) return "der Brand erreichte nur " + (z.flaecheM2 || 0) + " m² (Soll 1 ha)";
        if (!(z.brennend > 0)) return "während der Bilder brannte keine Zelle (keine Front, nur Asche)";
        if (!(z.frames >= 30 && z.framesGegen >= 30)) return "nur " + (z.frames || 0) + " ↔ " + (z.framesGegen || 0) + " Bilder mit ↔ ohne Brand (Soll je 30)";
        if (!(z.p95 <= 34)) return "Frame p95 " + z.p95 + " ms während des Brands über dem Preis P (REGELN R8, Klasse Ort: p95 ≤ 34 ms)";
        if (!(z.bewohner >= 10)) return "nur " + (z.bewohner || 0) + " Bewohner ≤ 300 m um den Herd (Soll 10)";
        if (!(z.imGegen >= 1)) return "die Front lag auf keinem Weg eines Bewohners — der Gegenlauf ohne Brand zeigt dasselbe (R7)";
        return null;
    };
    const FRONT_Z = { flaecheM2: 13056, brennend: 24, frames: 39, framesGegen: 39, p95: 18.2, p95Gegen: 16.9, bewohner: 12, imGegen: 5, imMit: 0 };

    // ════════ same.kopplung.erdsaat — der Zeuge der Erd-Saat ════════
    const zeugeErde = (min, extra) => (roh) => {
        const z = roh.zeuge || {};
        if (z.schluessel !== true) return "keine Erd-Saat mit Schlüssel (R4): der Planet liest nur den Samen (planet-core planetPlan)";
        if (!(z.antworten >= min)) return "nur " + (z.antworten || 0) + " Antworten des Planet-Fadens (Soll ≥ " + min + ")";
        if (!(z.streuungM > 0)) return "die Antworten tragen keine Streuung der Höhe (eine Konstante, nicht der Faden)";
        return extra ? extra(z, roh) : null;
    };
    const ERDE_Z = { schluessel: true, antworten: 190, streuungM: 1840, samen: "erde" };

    return {
        leitern: {
            [E]: {
                sek: 50,
                dorf: true,
                mutiert: true,
                pfad: ["stamm/feld-brand.js", "stamm/feld-leben.js", "stamm/feld-dsl.js", "stamm/siedlung-*.js", "stamm/dirigent-regler.js", "stamm/dirigent-takt.js", "stamm/vegetation-baum.js", "stamm/bild-himmel.js", "stamm/gelaende-chunks.js", "voxel-worker.js", "planet-core.js", "gelaende-core.js", "scripts/werkbank.cjs", "scripts/lib/welt-boot.cjs"],
                ungefahren: "Frame p95 mit ↔ ohne Brand urteilt nur das Gerät (headless ist die Zahl Mechanik auf swiftshader); die Bilder des Brands über dem Herd (S3, S4), des Himmels über der Lava (S6) und der Wiese (S7) schießt nur das Gerät",
                mess: async function (H, U, M) {
                    const S = (fn, a) => H.seite("return await (" + String(fn) + ")(r, " + JSON.stringify(a || {}) + ");");
                    const auge = (name, pose) => Promise.race([M.auge(name, pose), new Promise((ok) => setTimeout(() => ok({ bild: null, pose: JSON.stringify(pose), grund: "kein Bild in 10 s" }), 10000))]);
                    const brand = async (r, a) => {
                        const st = r.state;
                        const C = AnazhRealm;
                        const B = C.BRAND;
                        const cs = C.LIFE_FIELD.cell;
                        const pm = st.playerMesh.position;
                        const r3 = (v) => (Number.isFinite(v) ? Math.round(v * 1e3) / 1e3 : null);
                        const L0 = (st.worldMeta.taten ||= []);
                        const A = (window.__ereignisAlt = { n0: L0.length, bf0: [...(st.brandFeld || new Map()).keys()], rest0: !!r._brandRest, wetter: st.weather, tod: st.timeOfDay, spiel: st.spielZeit, uhr: st._uhrSpielZeit, halt: st.weatherEffectTime, regler: st.perfRegulator });
                        st.perfRegulator = false;
                        const aus = {};
                        const leute = [];
                        for (const Sd of (r._bewohnerSiedlungen || new Map()).values()) for (const b of Sd.liste || []) leute.push(b);
                        aus.bewohnerWelt = leute.length;
                        if (st.weather !== "sunny" && window.__wetterSetzen("sunny") !== "sunny") return Object.assign(aus, { fehler: "das Wetter der Probe gilt nicht: sunny (es gilt " + st.weather + ")" });
                        const lage = (b) => (b.leib && b.leib.position && Number.isFinite(b.leib.position.x) ? b.leib.position : null);
                        const dort = leute.map(lage).filter((p) => p && Math.hypot(p.x - pm.x, p.z - pm.z) <= a.leuteSuchM);
                        const mitte = dort.length ? dort.reduce((s, p) => [s[0] + p.x / dort.length, s[1] + p.z / dort.length], [0, 0]) : [pm.x, pm.z];
                        aus.herdAn = dort.length ? "Mitte von " + dort.length + " Bewohnern" : "Spieler";
                        const [px, pz] = [Math.floor(mitte[0] / cs), Math.floor(mitte[1] / cs)];
                        const [sx, sz] = [Math.floor(pm.x / cs), Math.floor(pm.z / cs)];
                        let herd = null;
                        for (let d = dort.length ? 0 : a.herdVon; d <= a.herdBis && !herd; d++)
                            for (let i = -d; i <= d && !herd; i++)
                                for (const [cx, cz] of [[px + i, pz - d], [px + i, pz + d], [px - d, pz + i], [px + d, pz + i]]) {
                                    if (Math.max(Math.abs(cx - sx), Math.abs(cz - sz)) < a.herdVon) continue;
                                    const f = r._brandStoff(cx, cz);
                                    if (f && r._brandFeuchte(f.boden) < f.zeile.brenn.mx && !r._nassAt((cx + 0.5) * cs, (cz + 0.5) * cs)) {
                                        herd = [cx, cz, f.zeile.name];
                                        break;
                                    }
                                }
                        if (!herd) return Object.assign(aus, { fehler: "keine trockene Zelle mit Bett " + a.herdVon + "–" + a.herdBis + " Zellen um " + aus.herdAn });
                        const [hx, hz] = [(herd[0] + 0.5) * cs, (herd[1] + 0.5) * cs];
                        const hy = r._voxelSurfaceY(hx, hz);
                        Object.assign(aus, { herd: [hx, hz].map(Math.round), stoff: herd[2] });
                        const nahe = leute.filter((b) => lage(b) && Math.hypot(lage(b).x - hx, lage(b).z - hz) <= a.leuteM);
                        const zelleVon = (b) => Math.floor(lage(b).x / cs) + "," + Math.floor(lage(b).z / cs);
                        const brennt = () => {
                            const s = new Set();
                            for (const [k, z] of st.brandFeld || new Map()) if (z.t0 !== null) s.add(k);
                            return s;
                        };
                        const flaeche = () => (brennt().size + L0.slice(A.n0).filter((q) => q.tat === "brand").length) * cs * cs;
                        const bilder = async (n, je) => {
                            const ms = [];
                            const echt = r._flightRecorderTick;
                            const zur = window.leihe(r, { _flightRecorderTick: function (f, ...x) { ms.push(f); return echt.call(this, f, ...x); } });
                            try {
                                for (let i = 0; i < n; i++) {
                                    await window.__seitenTakt();
                                    if (je) je(i);
                                }
                            } finally {
                                zur();
                            }
                            const b = ms.slice(1).sort((x, y) => x - y);
                            return { n: b.length, p95: b.length ? r3(b[Math.min(b.length - 1, Math.ceil(0.95 * b.length) - 1)]) : null, max: b.length ? r3(b[b.length - 1]) : null };
                        };
                        const gegenOrte = nahe.map(() => []);
                        aus.ohne = await bilder(a.bilder, () => nahe.forEach((b, k) => lage(b) && gegenOrte[k].push(zelleVon(b))));
                        st.weatherEffectTime = 0;
                        aus.entfacht = !!r._brandEntfachen(hx, hz);
                        st.weatherEffectTime = A.halt;
                        if (!aus.entfacht) return Object.assign(aus, { fehler: "der Herd " + aus.herd.join(",") + " (" + herd[2] + ") fing nicht" });
                        const brennen = (ziel, wandMs) => {
                            const t0 = performance.now();
                            const u0 = r._brandUhr;
                            while (flaeche() < ziel && r._brandLebt() && performance.now() - t0 < wandMs) {
                                st.spielZeit = r._brandUhr + B.schrittS;
                                r._tickBrand();
                            }
                            st._uhrSpielZeit = st.spielZeit;
                            return Math.round(r._brandUhr - u0);
                        };
                        aus.bisHaS = brennen(a.haM2, a.wandMs);
                        aus.flaecheM2 = flaeche();
                        aus.brennendVor = brennt().size;
                        const imFeuer = nahe.map(() => false);
                        const front = new Set();
                        aus.mit = await bilder(a.bilder, () => {
                            const F = brennt();
                            F.forEach((k) => front.add(k));
                            nahe.forEach((b, k) => {
                                if (lage(b) && F.has(zelleVon(b))) imFeuer[k] = true;
                            });
                        });
                        aus.brennend = brennt().size;
                        aus.front = front.size;
                        aus.bewohner = nahe.length;
                        aus.imGegen = gegenOrte.filter((Lz) => Lz.some((k) => front.has(k))).length;
                        aus.imMit = imFeuer.filter(Boolean).length;
                        aus.meiden = gegenOrte.filter((Lz, k) => Lz.some((q) => front.has(q)) && !imFeuer[k]).length;
                        aus.weiterS = brennen(a.kmM2, a.wandMs3);
                        aus.flaecheMaxM2 = flaeche();
                        aus.brennendMax = brennt().size;
                        aus.lebt = r._brandLebt();
                        aus.pose = { px: hx + a.augeM, py: hy + 0.75 * a.augeM, pz: hz + a.augeM, lx: hx, ly: hy, lz: hz };
                        return aus;
                    };
                    const putz = async (r) => {
                        const st = r.state;
                        const cs = AnazhRealm.LIFE_FIELD.cell;
                        const A = window.__ereignisAlt;
                        if (!A) return { putz: "kein Stand der Probe" };
                        const L0 = (st.worldMeta.taten ||= []);
                        const bf0 = new Set(A.bf0);
                        const asche = L0.slice(A.n0).filter((q) => q.tat === "brand");
                        for (const k of [...(st.brandFeld || new Map()).keys()]) if (!bf0.has(k)) st.brandFeld.delete(k);
                        if (!A.rest0) r._brandRest = null;
                        if (!bf0.size) r._brandBett = null;
                        L0.length = A.n0;
                        r._tatGen = (r._tatGen | 0) + 1;
                        r._lavaTaktT = -Infinity;
                        for (const s of st.wegeKarte ? st.wegeKarte.stufen : []) if (s.zentriert) r._ascheStufeMalen(s);
                        for (const q of asche) r._waldNachwuchs(q.x - cs, q.z - cs, q.x + cs, q.z + cs);
                        r._brandMalen();
                        st.spielZeit = A.spiel;
                        st._uhrSpielZeit = A.uhr;
                        r.setTimeOfDay(A.tod, "regler");
                        st.weatherEffectTime = A.halt;
                        st.perfRegulator = A.regler;
                        if (st.weather !== A.wetter) window.__wetterSetzen(A.wetter);
                        delete window.__ereignisAlt;
                        return { aschen: asche.length, brandFeld: st.brandFeld ? st.brandFeld.size : 0, taten: L0.length, lebt: r._brandLebt(), uhr: st.spielZeit === A.spiel, wetter: st.weather };
                    };
                    const lava = async (r, a) => {
                        const st = r.state;
                        const cs = AnazhRealm.LIFE_FIELD.cell;
                        const pm = st.playerMesh.position;
                        const r3 = (v) => (Number.isFinite(v) ? Math.round(v * 1e3) / 1e3 : null);
                        let Q = null;
                        for (let d = a.vonM; d <= a.bisM && !Q; d += 16)
                            for (let k = 0; k < 12 && !Q; k++) {
                                const x = pm.x + d * Math.cos((k * Math.PI) / 6);
                                const z = pm.z + d * Math.sin((k * Math.PI) / 6);
                                const [cx, cz] = [Math.floor(x / cs), Math.floor(z / cs)];
                                let bett = false;
                                for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) bett = bett || !!r._brandStoff(cx + i, cz + j);
                                if (!bett && r._landAt(x, z, 0.2) && !r._nassAt(x, z)) Q = { x, z, y: r._voxelSurfaceY(x, z) };
                            }
                        if (!Q) return { fehler: "keine Zelle ohne Bett " + a.vonM + "–" + a.bisM + " m um den Spieler" };
                        const asche = () => a.distanzM.map((d) => r3(r._ascheAt(Q.x + d, Q.z)));
                        const L0 = (st.worldMeta.taten ||= []);
                        const n0 = L0.length;
                        const bf0 = new Set((st.brandFeld || new Map()).keys());
                        const halt = st.weatherEffectTime;
                        const aus = { ort: [Q.x, Q.z].map(Math.round), y: r3(Q.y), ohne: asche() };
                        aus.ohne2 = asche();
                        st.weatherEffectTime = 0;
                        try {
                            r.dslRun(["lava", Q.x, Q.y, Q.z], { source: "human" });
                            st.weatherEffectTime = halt;
                            aus.taten = L0.length - n0;
                            aus.glut = r3((r._lavaAt(Q.x, Q.z) || { glut: null }).glut);
                            aus.mit = asche();
                        } finally {
                            st.weatherEffectTime = halt;
                            L0.length = n0;
                            for (const k of [...(st.brandFeld || new Map()).keys()]) if (!bf0.has(k)) st.brandFeld.delete(k);
                            if (!bf0.size) [r._brandRest, r._brandBett] = [null, null];
                            r._tatGen = (r._tatGen | 0) + 1;
                            r._lavaTaktT = -Infinity;
                            for (const s of st.wegeKarte ? st.wegeKarte.stufen : []) if (s.zentriert) r._lavaStufeMalen(s);
                        }
                        aus.nachher = { lava: !!r._lavaAt(Q.x, Q.z), taten: L0.length - n0 };
                        return aus;
                    };
                    const welt = async (r) => {
                        const st = r.state;
                        const namen = new Set();
                        for (let p = r; p && p !== Object.prototype; p = Object.getPrototypeOf(p)) for (const n of Object.getOwnPropertyNames(p)) namen.add(n);
                        const N = [...namen];
                        const bewohner = [...(r._bewohnerSiedlungen || new Map()).values()].reduce((s, q) => s + (q.liste ? q.liste.length : 0), 0);
                        await r._fadenQuelle();
                        const an = await r._planetAnker();
                        const [B, L] = [(an.breite * 180) / Math.PI, (an.laenge * 180) / Math.PI];
                        const samen = r._planetSamen();
                        const anti = await r._planetAuftrag({ type: "planet-ort", samen, breite: -B, laenge: L > 0 ? L - 180 : L + 180, zeitMa: 0 });
                        const heim = await r._planetAuftrag({ type: "planet-ort", samen, breite: B, laenge: L, zeitMa: 0 });
                        return {
                            tsunami: N.filter((n) => /tsunami|beben|quake|seism/i.test(n)),
                            einschlag: N.filter((n) => /einschlag|impakt|impact|krater|meteor|asteroid/i.test(n)),
                            bewohner,
                            siedlungen: (r._bewohnerSiedlungen || new Map()).size,
                            bauten: (st.architectures || []).length,
                            anker: [B, L].map((v) => Math.round(v * 100) / 100),
                            antipode: { land: anti.land, hoeheM: Math.round(anti.hoeheM), kuesteKm: Math.round(anti.kuesteKm) },
                            heim: { land: heim.land, hoeheM: Math.round(heim.hoeheM) },
                        };
                    };
                    let x = {};
                    let a3 = null;
                    let geputzt = null;
                    try {
                        x = await S(brand, Object.assign({}, U[2], U[3]));
                        if (!x.fehler && x.pose) a3 = await auge("same-ereignis-s3-brand", x.pose);
                    } catch (e) {
                        x = Object.assign({}, x, { fehler: String((e && e.message) || e).slice(0, 200) });
                    } finally {
                        geputzt = await S(putz, {}).catch((e) => ({ fehler: String((e && e.message) || e).slice(0, 200) }));
                    }
                    const lv = await S(lava, U[6]).catch((e) => ({ fehler: String((e && e.message) || e).slice(0, 200) }));
                    const a6 = await auge("same-ereignis-s6-himmel", lv.ort ? { px: lv.ort[0], py: lv.y + 2, pz: lv.ort[1], lx: lv.ort[0] + 10, ly: lv.y + 60, lz: lv.ort[1] } : { ort: "wiese" });
                    const a7 = await auge("same-ereignis-s7-wiese", { ort: "wiese" });
                    const w = await S(welt, {});
                    const xo = x.ohne || {};
                    const xm = x.mit || {};
                    const zf = { fehler: x.fehler, flaecheM2: x.flaecheM2, brennend: x.brennend, frames: xm.n, framesGegen: xo.n, p95: xm.p95, p95Gegen: xo.p95, bewohner: x.bewohner, imGegen: x.imGegen, imMit: x.imMit, front: x.front, herd: x.herd, stoff: x.stoff, bisHaS: x.bisHaS, putz: geputzt };
                    const fl = x.flaecheMaxM2 || 0;
                    const kein = (a) => !(a && a.some((v) => v > 0));
                    return {
                        sprossen: {
                            2: {
                                werte: { brennendHa: x.flaecheM2 != null ? x.flaecheM2 / 1e4 : null, meidenProzent: x.imGegen > 0 ? (100 * x.meiden) / x.imGegen : null, frameP95Ms: xm.p95, frameP95OhneMs: xo.p95, frameMaxMs: xm.max },
                                zeuge: zf,
                                ...(x.fehler ? {} : x.bewohner >= 10 ? {} : { nicht: "keine 10 Menschen an der Front: die Welt der Sitzung trägt " + x.bewohner + " Bewohner ≤ 300 m um den Herd " + (x.herd || []).join(",") + " (" + x.bewohnerWelt + " in der Welt) — und kein Bewohner liest das Brand-Feld (stamm/siedlung-bewohner.js _bewohnerSoll)" }),
                            },
                            3: {
                                werte: { fluchtGelaendeProzent: null, flaecheMaxM2: fl, brandUhrS: (x.bisHaS || 0) + (x.weiterS || 0) },
                                zeuge: Object.assign({ flaecheMaxM2: fl, bewohnerWelt: x.bewohnerWelt, lebt: x.lebt }, zf),
                                auge: a3 || { bild: null, pose: "über dem Herd", grund: x.fehler || "kein Brand" },
                                nicht: "kein Dorf flieht: der Brand erreichte " + Math.round(fl) + " m² (Soll 10⁶) in " + ((x.bisHaS || 0) + (x.weiterS || 0)) + " s Brand-Uhr, " + x.bewohnerWelt + " Bewohner in der Welt (Soll 10³); die Flucht folgt nur gesehener Gewalt (stamm/siedlung-bewohner.js _bewohnerWeichen), kein Fluchtweg vor einer Front" + (x.fehler ? " · " + x.fehler : ""),
                            },
                            4: {
                                werte: { glaubhaftProzent: undefined, raeumungFaktor: null, bauten: w.bauten, bewohnerWelt: w.bewohner },
                                zeuge: { bauten: w.bauten, bewohner: w.bewohner, siedlungen: w.siedlungen },
                                auge: a3 || { bild: null, pose: "über dem Herd", grund: x.fehler || "kein Brand" },
                                ...(w.bauten >= 1e4 && w.bewohner >= 1e5 ? {} : { nicht: "kein Stadtbrand über 10⁴ Gebäude, kein pyroklastischer Strom, keine 10⁵ Menschen: die Welt trägt " + w.bauten + " Bauten und " + w.bewohner + " Bewohner in " + w.siedlungen + " Siedlungen; das Bett des Brands ist " + (x.stoff || "?") + ", kein Bau (stamm/feld-brand.js _brandStoff); keine Räumung" }),
                            },
                            5: {
                                werte: { wellenAnkunftVerh: null, personenHandeln: null, bewohnerWelt: w.bewohner },
                                zeuge: { leser: (w.tsunami || []).length, kuestenorte: 0, personen: w.bewohner },
                                ...((w.tsunami || []).length ? {} : { nicht: "kein Tsunami, kein Beben M8: die Welt trägt 0 Leser einer Welle oder eines Bebens (Namen der Welt), der Planet-Faden kein Ereignis; " + w.bewohner + " Bewohner in der Welt (Soll 10⁷), keiner handelt in einem Ereignis" }),
                            },
                            6: {
                                werte: { ascheFaktor: null, glut: lv.glut, ascheMit: lv.mit, ascheOhne: lv.ohne },
                                zeuge: { glut: lv.glut, taten: lv.taten, mit: lv.mit, ohne: lv.ohne, ohne2: lv.ohne2, nachher: lv.nachher, fehler: lv.fehler },
                                auge: a6,
                                ...(lv.fehler || kein(lv.mit) || !kein(lv.ohne) ? { nicht: "kein Ausbruch fördert Asche: die Lava (glut " + lv.glut + ") legt in " + JSON.stringify(U[6].distanzM) + " m Asche " + JSON.stringify(lv.mit) + " (ohne Guss " + JSON.stringify(lv.ohne) + ") — EINE 16-m-Zelle, kein VEI 8, keine Wanderung, kein Himmel über 3 Jahren" + (lv.fehler ? " · " + lv.fehler : "") } : {}),
                            },
                            7: {
                                werte: { ladebilder: null },
                                zeuge: { einschlag: (w.einschlag || []).length, antipode: w.antipode, heim: w.heim },
                                auge: a7,
                                ...((w.einschlag || []).length ? {} : { nicht: "kein Einschlag: 0 Leser eines Einschlags, Kraters oder Impakt-Winters in der Welt; die Antipode des Ankers " + JSON.stringify(w.anker) + " antwortet im Faden (" + JSON.stringify(w.antipode) + "), erreichbar nur über die Reise (stamm/feld-leben.js _planetAuftrag), kein Flug" }),
                            },
                        },
                    };
                },
                sprossen: {
                    2: {
                        u: { haM2: 10000, bilder: 40, leuteM: 300, leuteSuchM: 400, herdVon: 3, herdBis: 14, wandMs: 8000 },
                        soll: [
                            K.soll(E, 2, "während 1 ha brennt", { key: "brennendHa", rel: "≥", zahl: 1, einheit: "ha" }),
                            K.soll(E, 2, "Bewohner meiden die Front = 100 %", { key: "meidenProzent", einheit: "%" }),
                        ],
                        zeuge: zeugeFront,
                        zeugeText: "1 ha brennt, Frame p95 im Preis P, die Front lag auf ihren Wegen und sie mieden sie",
                        taeter: "stamm/siedlung-bewohner.js `_bewohnerSoll` (liest kein Brand-Feld) · stamm/feld-brand.js `_tickBrand` (die Kosten der Front)",
                        leser: "stamm/siedlung-bewohner.js:2219 _bewohnerSoll — das Soll der Stunde liest Plan, Regen und die Furcht vor Gewalt, kein Brand-Feld: niemand weicht der Front",
                        unklar: "„Frame p95 während 1 ha brennt“ nennt keine Schwelle — Vorschlag: „Frame p95 ≤ 34 ms während 1 ha brennt“ (REGELN R8, Klasse Ort) wörtlich in den Richter; bis dahin hält der Zeuge die 34 ms der Preis-Treppe.",
                        gruen: { werte: { brennendHa: 1.3, meidenProzent: 100 }, zeuge: FRONT_Z },
                        attrappen: [
                            { name: "100 % gemieden, weil die Front auf keinem Weg lag (der Gegenlauf zeigt dasselbe)", roh: { werte: { brennendHa: 1.3, meidenProzent: 100 }, zeuge: Object.assign({}, FRONT_Z, { imGegen: 0 }) } },
                            { name: "1 ha aus der Asche, während der Bilder brennt nichts", roh: { werte: { brennendHa: 1.3, meidenProzent: 100 }, zeuge: Object.assign({}, FRONT_Z, { brennend: 0 }) } },
                            { name: "Frame p95 über dem Preis P (R8 Ort 34 ms)", roh: { werte: { brennendHa: 1.3, meidenProzent: 100 }, zeuge: Object.assign({}, FRONT_Z, { p95: 51.4 }) } },
                            { name: "100 % aus drei Bewohnern", roh: { werte: { brennendHa: 1.3, meidenProzent: 100 }, zeuge: Object.assign({}, FRONT_Z, { bewohner: 3 }) } },
                            { name: "kein Brand in der Welt", roh: { werte: { brennendHa: 1.3, meidenProzent: 100 }, zeuge: Object.assign({}, FRONT_Z, { fehler: "der Herd fing nicht" }) } },
                        ],
                    },
                    3: {
                        u: { kmM2: 1e6, menschen: 1e3, wandMs3: 5000, augeM: 60 },
                        soll: [K.soll(E, 3, "Fluchtwege folgen dem Gelände", { key: "fluchtGelaendeProzent", rel: "≥", zahl: 100, einheit: "%", refQuelle: "der Wortlaut „folgen dem Gelände“: jeder Fluchtweg (100 %) bleibt auf begehbarem Gelände" })],
                        auge: { pose: "60 m schräg über dem Herd des Brands der Probe, nach dem Lauf bis 1 km² (die Front brennt im Schuss)", vorbild: "Foto einer Brandfront im Grasland und eines Pahoehoe-Felds (Kīlauea, USGS HVO) — Blindpaar R11" },
                        zeuge: (roh) => ((roh.zeuge || {}).flaecheMaxM2 >= 1e6 && (roh.zeuge || {}).bewohnerWelt >= 1e3 ? null : "kein Feuer von 1 km² mit 10³ Menschen"),
                        taeter: "stamm/siedlung-bewohner.js `_bewohnerWeichen` (keine Flucht vor einem Brand)",
                        nicht: "kein Feuer von 1 km² mit 10³ Menschen, kein Dorf flieht",
                        leser: "stamm/siedlung-bewohner.js:2179 _bewohnerWeichen — die Flucht folgt nur gesehener Gewalt (Furcht-Gesetz), kein Fluchtweg vor einer Front; stamm/feld-brand.js:440 _brandEntfachen zündet EINE Zelle, ihr Lauf trägt keine Menschen",
                        unklar: "„Fluchtwege folgen dem Gelände“ trägt keine Zahl — Vorschlag: ≥ 90 % der Fluchtweg-Schritte bergab oder quer zum Hang, keiner über Wasser oder Hang > 35°.",
                        gruen: { werte: { fluchtGelaendeProzent: 100 }, zeuge: Object.assign({ flaecheMaxM2: 1.1e6, bewohnerWelt: 1200 }, FRONT_Z) },
                        attrappen: [{ name: "100 % ohne Flucht und ohne Bild", roh: { werte: { fluchtGelaendeProzent: 100 }, zeuge: { flaecheMaxM2: 3000, bewohnerWelt: 0 } } }],
                    },
                    4: {
                        u: { flaecheKm2: 100, menschen: 1e5, gebaeude: 1e4 },
                        soll: [K.soll(E, 4, "bei 70 %", { key: "glaubhaftProzent", rel: "≥", einheit: "%" }), K.soll(E, 4, "Räumungszeit Faktor 2", { key: "raeumungFaktor", rel: "≤" })],
                        auge: { pose: "der Brand der Probe über dem Herd (heute kein Stadtbrand: derselbe Schuss wie S3)", vorbild: "historische Bilder (London 1666, Chicago 1871, Saint-Pierre 1902) — Blind-Urteil ≥ „glaubhaft“ bei 70 %" },
                        zeuge: (roh) => ((roh.zeuge || {}).bauten >= 1e4 && (roh.zeuge || {}).bewohner >= 1e5 ? null : "kein Stadtbrand über 10⁴ Gebäude mit 10⁵ Menschen"),
                        taeter: "stamm/feld-brand.js `_brandStoff` (das Bett ist Gras und Laub, kein Bau) · stamm/siedlung-ort.js `spawnSettlement` (keine Stadt von 10⁵)",
                        nicht: "kein Stadtbrand, kein pyroklastischer Strom, keine 10⁵ Menschen",
                        leser: "stamm/feld-brand.js:297 _brandStoff — das Bett des Brands ist Vegetation, kein Gebäude brennt; stamm/siedlung-ort.js:1157 spawnSettlement — keine Räumung, keine Helfer, kein Stau",
                        gruen: { werte: { glaubhaftProzent: 74, raeumungFaktor: 1.4 }, zeuge: { bauten: 12000, bewohner: 120000 } },
                        attrappen: [{ name: "74 % glaubhaft ohne Stadt", roh: { werte: { glaubhaftProzent: 74, raeumungFaktor: 1.4 }, zeuge: { bauten: 30, bewohner: 0 } } }],
                    },
                    5: {
                        u: { flaecheKm2: 1e4, menschen: 1e7, kuesteKm: 1000, orte: 10, stichprobe: 100 },
                        soll: [
                            K.soll(E, 5, "Wellen-Ankunft an 10 Küstenorten ±10 % gegen √(g·h)", { key: "wellenAnkunftVerh", ref: 1, refQuelle: "Flachwasser-Welle c = √(g·h) (Lagrange 1781; NOAA-Laufzeitkarten): Ankunft der Welt ÷ Weg/√(g·h) = 1" }),
                            K.soll(E, 5, "100 Stichproben-Personen handeln", { key: "personenHandeln", rel: "≥", zahl: 100 }),
                        ],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.leser >= 1)) return "die Welt trägt keinen Leser einer Welle oder eines Bebens";
                            if (!(z.kuestenorte >= 10)) return "nur " + (z.kuestenorte || 0) + " Küstenorte mit Ankunft gemessen (Soll 10)";
                            if (!(z.personen >= 100)) return "nur " + (z.personen || 0) + " Personen in der Welt (Soll 100 Stichproben)";
                            return null;
                        },
                        taeter: "voxel-worker.js planetOrtAuftrag (kein Beben, keine Welle) · stamm/siedlung-bewohner.js `_bewohnerSoll` (kein Ereignis im Tag)",
                        nicht: "kein Tsunami, kein Beben M8, keine Megastadt",
                        leser: "voxel-worker.js:1446 planetOrtAuftrag — der Faden trägt kein Beben und keine Welle; kein Leser eines Tsunami in der Welt",
                        gruen: { werte: { wellenAnkunftVerh: 1.04, personenHandeln: 120 }, zeuge: { leser: 2, kuestenorte: 10, personen: 120 } },
                        attrappen: [{ name: "1,04 aus der Formel ohne Welle in der Welt", roh: { werte: { wellenAnkunftVerh: 1.04, personenHandeln: 120 }, zeuge: { leser: 0, kuestenorte: 0, personen: 0 } } }],
                    },
                    6: {
                        u: { vei: 8, vonM: 40, bisM: 200, distanzM: [0, 50, 200, 1000] },
                        soll: [K.soll(E, 6, "Aschedicke gegen Distanz Faktor 2", { key: "ascheFaktor", rel: "≤" })],
                        auge: { pose: "an der Zelle der Lava 2 m über Grund, Blick 80° hinauf (der Himmel über dem Ausbruch)", vorbild: "Himmel nach Pinatubo 1991 / Tambora 1815 über 3 Jahre (Aerosol-Rekonstruktion, Gemälde-Farben Zerefos 2007)" },
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (z.fehler) return "kein Guss: " + z.fehler;
                            if (!(z.glut > 0)) return "die Lava glüht nicht (kein Ausbruch in der Welt)";
                            if (!(z.mit && z.mit.some((v) => v > 0))) return "keine Asche in der Distanz nach dem Ausbruch";
                            if (z.ohne && z.ohne.some((v) => v > 0)) return "Asche auch ohne Guss (der Gegenlauf zeigt dasselbe, R7)";
                            return null;
                        },
                        taeter: "stamm/feld-leben.js `_lavaGiessen` (EINE Zelle, keine Asche) · stamm/feld-brand.js `_ascheAt` (liest nur die Asche des Brands)",
                        nicht: "kein Ausbruch fördert Asche, kein VEI 8",
                        leser: "stamm/feld-leben.js:2510 _lavaGiessen — die Lava deckt EINE Zelle, keine Asche über die Distanz; stamm/feld-brand.js:5 _ascheAt liest nur die Asche des Brands",
                        gruen: { werte: { ascheFaktor: 1.6 }, zeuge: { glut: 1, taten: 1, mit: [1, 0.6, 0.2, 0.02], ohne: [0, 0, 0, 0] } },
                        attrappen: [{ name: "Faktor 1,6 aus der Toba-Tafel, die Lava legt keine Asche", roh: { werte: { ascheFaktor: 1.6 }, zeuge: { glut: 1, taten: 1, mit: [0, 0, 0, 0], ohne: [0, 0, 0, 0] } } }],
                    },
                    7: {
                        u: { einschlagKm: 10, menschen: 1e10, flug: "Krater → Antipode" },
                        soll: [K.soll(E, 7, "ohne Ladebild", { key: "ladebilder", rel: "=", zahl: 0, refQuelle: "der Wortlaut „ohne Ladebild“: 0 Ladebilder auf dem Flug vom Krater zur Antipode" })],
                        auge: { pose: "die Mess-Wiese der Sitzung (heute kein Krater: geschossen an der Wiese)", vorbild: "Chicxulub-Modellierung (Collins et al. 2020, Morgan et al. 2016) — Blindpaar R11" },
                        zeuge: (roh) => ((roh.zeuge || {}).einschlag >= 1 ? null : "kein Einschlag in der Welt"),
                        taeter: "planet-core.js planetPlan (kein Einschlag) · stamm/feld-leben.js `_planetAuftrag` (die Reise, kein Flug)",
                        nicht: "kein Einschlag, kein Flug zur Antipode",
                        leser: "stamm/feld-leben.js:1286 _planetAuftrag — die Reise fragt den Faden nach Ort und Zeit, kein Flug ohne Ladebild; planet-core.js:312 planetPlan kennt keinen Einschlag, keinen Krater, keinen Impakt-Winter",
                        gruen: { werte: { ladebilder: 0 }, zeuge: { einschlag: 1 } },
                        attrappen: [{ name: "0 Ladebilder ohne Flug und ohne Einschlag", roh: { werte: { ladebilder: 0 }, zeuge: { einschlag: 0 } } }],
                    },
                },
            },

            [D]: {
                sek: 20,
                pfad: ["planet-core.js", "voxel-worker.js", "stamm/gelaende-chunks.js", "stamm/feld-leben.js", "gelaende-core.js", "scripts/werkbank.cjs"],
                ungefahren: "die Bilder (Relief am Vesuv S1, Blindpaar S3) schießt nur das Gerät; headless steht nur der Faden",
                mess: async function (H, U, M) {
                    const seite = async (r, a) => {
                        const r3 = (v) => (Number.isFinite(v) ? Math.round(v * 1e3) / 1e3 : null);
                        await r._fadenQuelle();
                        const G = r._gelaende && r._gelaende();
                        const schluessel = !!(G && G.ort && G.ort.teil && G.ort.teil.erdSchluessel);
                        let antworten = 0;
                        const hoehen = [];
                        const ort = async (b, l, t) => {
                            const o = await r._planetAuftrag({ type: "planet-ort", samen: a.samen, breite: b, laenge: l, zeitMa: t });
                            antworten++;
                            hoehen.push(o.hoeheM);
                            return o;
                        };
                        const ereignis = (o) => {
                            const k = Object.keys(o).concat(Object.keys(o.delta || {}));
                            for (const v of Object.values(o.delta || {})) if (v && typeof v === "object") k.push(...Object.keys(v));
                            return k.filter((n) => /vulkan|ausbruch|eruption|beben|quake|tsunami|brand|feuer|asche|ereignis/i.test(n)).length;
                        };
                        const s1 = await Promise.all(a.s1Jahre.map(async (j) => { const t = -j / 1e6; const [v, g] = await Promise.all([ort(a.vesuv[0], a.vesuv[1], t), ort(a.gegen[0], a.gegen[1], t)]); return [ereignis(v), ereignis(g), r3(v.hoeheM), v.land]; }));
                        const s2 = await Promise.all(a.orte.map((p) => Promise.all(a.epochen.map(async (t) => { const o = await ort(p[0], p[1], t); return [ereignis(o), r3(o.hoeheM)]; }))));
                        const s3 = await Promise.all(a.drei.map(async (e) => { const t = -(a.heute - e.jahr) / 1e6; const [o, v] = await Promise.all([ort(e.b, e.l, t), ort(e.b, e.l, t - 1e-5)]); return { name: e.name, land: o.land, hoeheM: r3(o.hoeheM), kuesteKm: r3(o.kuesteKm), ereignis: ereignis(o), dSommerK: r3(o.delta.klima.sommer - v.delta.klima.sommer) }; }));
                        const sommer = await Promise.all(a.tambora.map(async (j) => (await ort(a.europa[0], a.europa[1], -(a.heute - j) / 1e6)).delta.klima.sommer));
                        const s5 = await Promise.all(a.meer.map(async ([ka, ref]) => [ka, ref, r3((await ort(a.vesuv[0], a.vesuv[1], -ka / 1000)).delta.meer.waterLevelM)]));
                        const alpen = await Promise.all([0, -0.021].map(async (t) => (await ort(a.alpen[0], a.alpen[1], t)).delta.klima.sommer));
                        const fib = Array.from({ length: a.fib }, (_, i) => [(Math.asin(1 - (2 * (i + 0.5)) / a.fib) * 180) / Math.PI, ((i * 137.508) % 360) - 180]);
                        const decke = async (t) => { const v = await Promise.all(fib.map((p) => ort(p[0], p[1], t))); return v.reduce((s, o) => s + o.delta.wuchs.decke, 0) / v.length; };
                        const s6 = await Promise.all(a.aussterben.map(async ([t, verlust]) => { const [vor, an, nach] = await Promise.all([decke(t - 5), decke(t), decke(t + 5)]); return [t, verlust, r3(vor), r3(an), r3(nach)]; }));
                        const hm = hoehen.reduce((s, v) => s + v, 0) / Math.max(1, hoehen.length);
                        const streuungM = r3(Math.sqrt(hoehen.reduce((s, v) => s + (v - hm) * (v - hm), 0) / Math.max(1, hoehen.length)));
                        return { schluessel, antworten, streuungM, s1, s2, s3, sommer: sommer.map(r3), s5, alpen: alpen.map(r3), s6 };
                    };
                    const a = Object.assign({ samen: "erde", heute: 2025 }, U[1], U[2], U[3], U[4], U[5], U[6]);
                    const x = await H.seite("return await (" + String(seite) + ")(r, " + JSON.stringify(a) + ");");
                    const bild = await Promise.race([M.auge("same-erdsaat-ort", { ort: "wiese" }), new Promise((ok) => setTimeout(() => ok({ bild: null, pose: "{\"ort\":\"wiese\"}", grund: "kein Bild in 10 s" }), 10000))]);
                    const basis = { schluessel: x.schluessel, antworten: x.antworten, streuungM: x.streuungM, samen: "erde" };
                    const ohne = x.schluessel ? "" : "keine Erd-Saat mit Schlüssel (R4) — der Planet liest nur den Samen „erde“ (planet-core planetPlan); ";
                    const ausV = x.s1.reduce((s, q) => s + q[0], 0);
                    const ausG = x.s1.reduce((s, q) => s + q[1], 0);
                    const ereig2 = x.s2.reduce((s, L) => s + L.reduce((u, q) => u + q[0], 0), 0);
                    const ereig3 = x.s3.reduce((s, q) => s + q.ereignis, 0);
                    const [j14, j15, j16] = x.sommer;
                    const tambK = j16 != null && j15 != null ? Math.round((j16 - j15) * 1000) / 1000 : null;
                    const gegenK = j15 != null && j14 != null ? Math.round((j15 - j14) * 1000) / 1000 : null;
                    const fak = x.s5.filter((q) => Math.abs(q[1]) >= 20).map(([, ref, sim]) => { const [p, q] = [Math.abs(ref) + 1, Math.abs(sim) + 1]; return Math.sign(ref) === Math.sign(sim) || Math.abs(sim) < 1e-9 ? Math.max(p, q) / Math.min(p, q) : Math.abs(ref) + Math.abs(sim) + 1; });
                    const meerFaktor = fak.length ? Math.round(Math.max(...fak) * 1000) / 1000 : null;
                    const meerSpanne = x.s5.length ? Math.max(...x.s5.map((q) => q[2])) - Math.min(...x.s5.map((q) => q[2])) : 0;
                    const einbr = x.s6.filter((q) => q[3] < 0.9 * Math.min(q[2], q[4])).length;
                    return {
                        sprossen: {
                            1: { werte: { ausbrueche: ausV, ausbruecheGegen: ausG, vesuvHoeheM: x.s1[0] && x.s1[0][2] }, zeuge: Object.assign({ ausbruchVesuv: ausV, ausbruchGegen: ausG, vesuvLand: x.s1[0] && x.s1[0][3] }, basis), auge: bild, nicht: ohne + "am Vesuv antwortet der Faden über " + U[1].s1Jahre.length + " Zeiten eines Jahrhunderts mit " + ausV + " Ausbrüchen (Gegenort " + ausG + "), Höhe " + (x.s1[0] && x.s1[0][2]) + " m, Land " + (x.s1[0] && x.s1[0][3]) + " — kein Vulkan bricht von selbst aus" },
                            2: { werte: { wiederkehrFaktor: null, ereignisse: ereig2 }, zeuge: Object.assign({ ereignisse: ereig2, orte: x.s2.length }, basis), nicht: ohne + U[2].orte.length + " Orte der Gefahr in " + U[2].epochen.length + " Epochen tragen " + ereig2 + " Ereignisse am Faden — keine Rate eines Ausbruchs, Bebens oder Brands" },
                            3: { werte: { phasenFaktor: null, ereignisse: ereig3 }, zeuge: Object.assign({ ereignisse: ereig3, drei: x.s3 }, basis), auge: bild, nicht: ohne + "Pompeji 79, Lissabon 1755, London 1666 an ihrem Jahr: " + x.s3.map((q) => q.name + " Land " + q.land + " " + q.hoeheM + " m, " + q.ereignis + " Ereignisse").join(" · ") + " — kein Ablauf aus Gesetzen, keine Phase" },
                            4: { werte: { fernfolgeProzent: null, tamboraSommerK: tambK, gegenSommerK: gegenK }, zeuge: Object.assign({ tamboraK: tambK, gegenK, ereignisse: 0 }, basis), nicht: ohne + "keine 100 Ereignisse über 5 000 Jahre: Tambora → 1816 ändert den Sommer Mitteleuropas um " + tambK + " K (Gegenlauf 1814 → 1815: " + gegenK + " K; Erde: −1 bis −3 K) — keine Fernfolge ohne Ereignis" },
                            5: { werte: { meeresspiegelFaktor: meerFaktor, gletscherMaxVerh: null, alpenSommerLgmK: x.alpen[1] != null && x.alpen[0] != null ? Math.round((x.alpen[1] - x.alpen[0]) * 1000) / 1000 : null }, zeuge: Object.assign({ meer: x.s5, meerSpanneM: Math.round(meerSpanne * 1000) / 1000, alpen: x.alpen }, basis), nicht: ohne + "kein Quartär am Faden: der Meeresspiegel " + x.s5.map((q) => q[0] + " ka " + q[2] + " m (Rekonstruktion " + q[1] + ")").join(" · ") + "; der Sommer der Alpen −21 ka gegen heute " + JSON.stringify(x.alpen) + " °C — keine Eiszeit, kein Gletscher" },
                            6: { werte: { aussterbenZeitFaktor: null, artenVerlustFaktor: null, einbrueche: einbr }, zeuge: Object.assign({ einbrueche: einbr, aussterben: x.s6 }, basis), nicht: ohne + "keine Arten am Faden (delta: klima, meer, wetter, wuchs, wildnis): die Decke des Lebens an " + U[6].fib + " Punkten bricht an " + einbr + " von 5 Aussterben ein (" + x.s6.map((q) => q[0] + " Ma " + q[2] + "→" + q[3] + "→" + q[4]).join(" · ") + ")" },
                        },
                    };
                },
                sprossen: {
                    1: {
                        u: { vesuv: [40.821, 14.426], gegen: [52.52, 13.4], s1Jahre: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90] },
                        soll: [K.soll(D, 1, "der Vulkan bricht von selbst aus", { key: "ausbrueche", rel: "≥", zahl: 1, refQuelle: "der Wortlaut „bricht von selbst aus“: ≥ 1 Ausbruch ohne Tat am Ort der Erd-Saat im gemessenen Jahrhundert" })],
                        auge: { pose: "die Mess-Wiese der Sitzung (heute keine Erd-Saat: der Golf von Neapel steht nicht)", vorbild: "Relief-Modell des Golfs von Neapel mit dem Vesuv (SRTM 30 m / TINITALY) — Blindpaar R11" },
                        zeuge: zeugeErde(20, (z) => (z.ausbruchVesuv > z.ausbruchGegen ? null : "am Vesuv bricht nicht mehr aus als am Gegenort ohne Vulkan (R7: " + z.ausbruchVesuv + " ↔ " + z.ausbruchGegen + ")")),
                        taeter: "planet-core.js planetPlan (kein Erd-Schlüssel) · planetVulkane (kein Leser im Faden)",
                        nicht: "keine Erd-Saat, kein Ausbruch von selbst",
                        leser: "planet-core.js:312 planetPlan — liest keinen Erd-Schlüssel (R4); planet-core.js:1884 planetVulkane hat keinen Leser im Faden (voxel-worker.js:1446 planetOrtAuftrag)",
                        gruen: { werte: { ausbrueche: 2 }, zeuge: Object.assign({ ausbruchVesuv: 2, ausbruchGegen: 0 }, ERDE_Z) },
                        attrappen: [
                            { name: "zwei Ausbrüche ohne Erd-Saat", roh: { werte: { ausbrueche: 2 }, zeuge: Object.assign({ ausbruchVesuv: 2, ausbruchGegen: 0 }, ERDE_Z, { schluessel: false }) } },
                            { name: "derselbe Ausbruch am Gegenort ohne Vulkan (R7)", roh: { werte: { ausbrueche: 2 }, zeuge: Object.assign({ ausbruchVesuv: 2, ausbruchGegen: 2 }, ERDE_Z) } },
                        ],
                    },
                    2: {
                        u: {
                            orte: [[40.821, 14.426], [37.751, 14.994], [35.361, 138.727], [-6.102, 105.423], [46.191, -122.194], [15.13, 120.35], [-8.25, 118.0], [63.983, -19.666], [-7.541, 110.446], [38.722, -9.139]],
                            epochen: [0, -0.001, -0.005],
                        },
                        soll: [K.soll(D, 2, "simulierte Wiederkehr Faktor 3 der historischen", { key: "wiederkehrFaktor", rel: "≤" })],
                        zeuge: zeugeErde(30, (z) => (z.ereignisse > 0 ? null : "die zehn Orte tragen kein Ereignis am Faden (keine Wiederkehr)")),
                        taeter: "voxel-worker.js planetOrtAuftrag (kein Ereignis, keine Rate)",
                        nicht: "keine Erd-Saat, kein Ereignis mit Rate",
                        leser: "voxel-worker.js:1446 planetOrtAuftrag — gibt kein Ereignis (Ausbruch, Beben, Brand) und keine Rate je Epoche weiter",
                        gruen: { werte: { wiederkehrFaktor: 1.8 }, zeuge: Object.assign({ ereignisse: 14 }, ERDE_Z) },
                        attrappen: [{ name: "Faktor 1,8 aus dem Katalog (Smithsonian GVP), kein Ereignis am Faden", roh: { werte: { wiederkehrFaktor: 1.8 }, zeuge: Object.assign({ ereignisse: 0 }, ERDE_Z) } }],
                    },
                    3: {
                        u: { drei: [{ name: "Pompeji 79", b: 40.751, l: 14.487, jahr: 79 }, { name: "Lissabon 1755", b: 38.722, l: -9.139, jahr: 1755 }, { name: "London 1666", b: 51.507, l: -0.128, jahr: 1666 }], menschen: 1e4 },
                        soll: [K.soll(D, 3, "Faktor 2 je Phase", { key: "phasenFaktor", rel: "≤" })],
                        auge: { pose: "die Mess-Wiese der Sitzung (heute kein Pompeji, Lissabon, London: derselbe Schuss wie S1)", vorbild: "Plinius d. J. (Briefe 6.16/6.20), Augenzeugen 1755, Pepys 1666 — Blind-Bildvergleich R11" },
                        zeuge: zeugeErde(6, (z) => (z.ereignisse > 0 ? null : "die drei Orte tragen an ihrem Jahr kein Ereignis")),
                        taeter: "planet-core.js planetPlan (keine Erd-Saat) · stamm/feld-leben.js `_lavaGiessen` (der einzige Ausbruch, EINE Zelle)",
                        nicht: "keine Erd-Saat, kein Ablauf aus Gesetzen",
                        leser: "planet-core.js:312 planetPlan — keine Erd-Saat; kein Ablauf Säulen-Phase → Strom, Beben → Brand → Tsunami (stamm/feld-leben.js:2510 _lavaGiessen ist der einzige Ausbruch)",
                        gruen: { werte: { phasenFaktor: 1.5 }, zeuge: Object.assign({ ereignisse: 3 }, ERDE_Z) },
                        attrappen: [{ name: "Faktor 1,5 aus den Quellen, die Orte tragen nichts", roh: { werte: { phasenFaktor: 1.5 }, zeuge: Object.assign({ ereignisse: 0 }, ERDE_Z) } }],
                    },
                    4: {
                        u: { ereignisse: 100, jahre: 5000, europa: [48.0, 10.0], tambora: [1814, 1815, 1816] },
                        soll: [K.soll(D, 4, "Anteil, deren dokumentierte Fernfolge messbar eintritt ≥ 50 %", { key: "fernfolgeProzent", einheit: "%" })],
                        zeuge: zeugeErde(3, (z) => {
                            if (!(z.ereignisse >= 100)) return "nur " + (z.ereignisse || 0) + " Ereignisse in der Erd-Saat (Soll 100)";
                            if (!(Math.abs(z.tamboraK || 0) > Math.abs(z.gegenK || 0))) return "Tambora → 1816 ändert den Sommer nicht mehr als der Gegenlauf 1814 → 1815 (" + z.tamboraK + " ↔ " + z.gegenK + " K)";
                            return null;
                        }),
                        taeter: "voxel-worker.js planetOrtAuftrag (kein Ereignis, keine Fernfolge)",
                        nicht: "keine Erd-Saat, keine 100 Ereignisse",
                        leser: "voxel-worker.js:1446 planetOrtAuftrag — das Klima am Ort folgt dem Plan der Zeit, kein Ereignis wirkt fort (kein Tambora → 1816, keine Pest → Löhne)",
                        gruen: { werte: { fernfolgeProzent: 58 }, zeuge: Object.assign({ ereignisse: 100, tamboraK: -1.4, gegenK: 0.1 }, ERDE_Z) },
                        attrappen: [
                            { name: "58 % ohne Ereignisse", roh: { werte: { fernfolgeProzent: 58 }, zeuge: Object.assign({ ereignisse: 0, tamboraK: -1.4, gegenK: 0.1 }, ERDE_Z) } },
                            { name: "1816 so kühl wie der Gegenlauf (R7)", roh: { werte: { fernfolgeProzent: 58 }, zeuge: Object.assign({ ereignisse: 100, tamboraK: -0.2, gegenK: -0.2 }, ERDE_Z) } },
                        ],
                    },
                    5: {
                        u: { jahre: 1e6, meer: [[21, -125], [65, -85], [140, -120], [250, -105], [435, -125], [125, 6]], alpen: [47.0, 10.0] },
                        soll: [
                            K.soll(D, 5, "Meeresspiegel-Kurve gegen Rekonstruktion Faktor 1,5", { key: "meeresspiegelFaktor", rel: "≤" }),
                            K.soll(D, 5, "Gletscher-Maximum am Ort ±20 %", { key: "gletscherMaxVerh", ref: 1, refQuelle: "Erde: LGM-Schneegrenz-Senkung der Alpen ~1 200 m (Ivy-Ochs 2015) — Welt ÷ Erde = 1" }),
                        ],
                        zeuge: zeugeErde(8, (z) => (z.meerSpanneM > 20 ? null : "der Meeresspiegel des Fadens bewegt sich über das Quartär nur " + z.meerSpanneM + " m (keine Eiszeit)")),
                        taeter: "planet-core.js planetMeer (lineare 10-Ma-Fächer, keine Bahn-Zyklen)",
                        nicht: "keine Erd-Saat, kein Quartär",
                        leser: "planet-core.js:1826 planetMeer — lineare 10-Ma-Fächer, keine Bahn-Zyklen: kein Meeresspiegel des Quartärs, kein Gletscher",
                        unklar: "„Gletscher-Maximum am Ort“ nennt weder Ort noch Größe — Vorschlag: die LGM-Schneegrenz-Senkung der Alpen 1 200 m ±20 % (Ivy-Ochs 2015) am Ort der Erd-Saat 47° N 10° O.",
                        gruen: { werte: { meeresspiegelFaktor: 1.2, gletscherMaxVerh: 1.1 }, zeuge: Object.assign({ meerSpanneM: 128 }, ERDE_Z) },
                        attrappen: [{ name: "die Rekonstruktion eingesetzt, der Faden bleibt flach", roh: { werte: { meeresspiegelFaktor: 1.2, gletscherMaxVerh: 1.1 }, zeuge: Object.assign({ meerSpanneM: 0.03 }, ERDE_Z) } }],
                    },
                    6: {
                        u: { jahre: 4.5e9, fib: 8, aussterben: [[-445, 85], [-372, 75], [-252, 96], [-201, 80], [-66, 76]] },
                        soll: [K.soll(D, 6, "Zeitpunkt Faktor 2", { key: "aussterbenZeitFaktor", rel: "≤" }), K.soll(D, 6, "Arten-Verlust Faktor 1,5", { key: "artenVerlustFaktor", rel: "≤" })],
                        zeuge: zeugeErde(100, (z) => (z.einbrueche >= 5 ? null : "die Decke des Lebens bricht an " + (z.einbrueche || 0) + " von 5 Aussterben ein")),
                        taeter: "voxel-worker.js planetOrtAuftrag (keine Arten im Faden) · planet-core.js planetPlan (keine Erd-Saat)",
                        nicht: "keine Erd-Saat, keine Arten am Faden",
                        leser: "voxel-worker.js:1446 planetOrtAuftrag — delta trägt klima, meer, wetter, wuchs, wildnis: keine Arten, kein Aussterben",
                        gruen: { werte: { aussterbenZeitFaktor: 1.3, artenVerlustFaktor: 1.2 }, zeuge: Object.assign({ einbrueche: 5 }, ERDE_Z) },
                        attrappen: [{ name: "Faktoren aus Raup & Sepkoski, die Decke bricht nie ein", roh: { werte: { aussterbenZeitFaktor: 1.3, artenVerlustFaktor: 1.2 }, zeuge: Object.assign({ einbrueche: 0 }, ERDE_Z) } }],
                    },
                },
            },
        },
    };
})());

// ── DIE LEITERN same.kopplung.gewalt (S1–S6) und same.kopplung.stoerung (S2–S7; S1 trägt g1.js BRAND_SITZUNG) der Perspektive
// zusammenspiel.same — EIN Stück, je Leiter EINE Messung in der warmen Welt der Sitzung, jede mit ihrem Gegenlauf (R7).
// GEWALT: die Gefahr, die die Welt von SELBST trägt. Das Wetter der Front über 100 Spieljahre am Ort (`_wetterAmOrt`, je Zug der
// Welt-Uhr), dann der Takt der Welt (`_gameLoopTick`) im Gewitter und — der Gegenlauf, die Ursache gekappt — in der Sonne, je mit
// gezählten Zündungen (jeder Ruf von `_brandEntfachen`, neue Zellen im Brandfeld, neue Taten „brand“); der Pegel der Flüsse
// (`_atlasWaterLevelAt` an den nächsten Flusspunkten nach `_pegelTakt`) nach 30 min Sturm, 30 min Sonne und 3 Tagen Sonne; der
// Planet-Faden (`r._planetAuftrag` planet-ort) an 8 Saaten × 10⁴ a, im 1°-Gitter der Erd-Saat um den Anker und an 100 Saaten mit und
// ohne fremden Körper — gezählt wird, welche Gefahr seine Antwort trägt. Am Ende Wetter, Regen-Stempel, Pegel und Brand zurück.
// STÖRUNG: der Brand als Tat über ihren EINEN Schreiber (`_tatSchreiben` in einer Kopie der Taten, wie die Sukzession der Ökologie):
// an Orten im Ring um den Spieler das Tempo der Heilung (die Dauer der Narbe, `_tatIndex().dauer`) gegen Feuchte × Licht des Orts
// (`_feuchteAt`, `_bodenLichtFeld`), die Folge nach 1 Spieljahr (`_sukzession`), die Äsung der Tiere (`_kreaturNahrung`) auf einer
// Brandfläche vor ↔ nach ↔ über 15 Jahre, der Pegel der Flüsse vor ↔ nach; der Gegenlauf dieselben Orte ohne Tat. Der Planet: die
// Wurzel (der Samen) gekippt am Anker gegen denselben Samen zweimal, 100 Saaten auf Gefahr. Taten, Index, Uhr zurück.
L.perspektive("same", (() => {
    const G = "same.kopplung.gewalt";
    const ST = "same.kopplung.stoerung";
    const PFAD_G = ["stamm/feld-brand.js", "stamm/bild-himmel.js", "stamm/dirigent-takt.js", "stamm/wasser-hydro.js", "gelaende-core.js", "phyto-core.js", "voxel-worker.js", "planet-core.js", "stamm/gelaende-chunks.js", "scripts/werkbank.cjs"];
    const PFAD_S = ["stamm/feld-leben.js", "stamm/vegetation-wiese.js", "stamm/gelaende-boden.js", "stamm/kreatur-leben.js", "stamm/wasser-hydro.js", "stamm/siedlung-*.js", "voxel-worker.js", "planet-core.js", "stamm/gelaende-chunks.js", "scripts/werkbank.cjs"];

    // ════════ DIE ZEUGEN ════════
    // die Gefahr von selbst: der Zeitraffer lief (Züge der 100 a, Takte), das Gewitter zündete, die Sonne (Gegenlauf) zündete weniger
    const zeugeZuendung = (roh) => {
        const z = roh.zeuge || {};
        if (z.fehler) return "die Messung warf: " + z.fehler;
        if (!(z.zuege >= 2000)) return "nur " + (z.zuege || 0) + " Wetter-Züge gelesen (100 Spieljahre = 2 000)";
        if (!(z.takte >= 60)) return "nur " + (z.takte || 0) + " Takte der Welt im Gewitter";
        if (!(z.zuendSturm > 0)) return "kein Brand von selbst: 0 Zündungen im Gewitter";
        if (!(z.zuendOhne < z.zuendSturm)) return "der Gegenlauf ohne Gewitter zündet ebenso (" + z.zuendOhne + ") — keine Kopplung";
        return null;
    };
    const ZUEND_Z = { zuege: 2000, takte: 240, sturm: 180, zuendSturm: 3, zuendOhne: 0 };
    // der Planet: N Antworten des Fadens, Streuung der Höhe > 0, die Gefahr steht in seiner Antwort
    const zeugeFaden = (min, gefMin) => (roh) => {
        const z = roh.zeuge || {};
        if (z.fehler) return "die Messung warf: " + z.fehler;
        if (!(z.antworten >= min)) return "nur " + (z.antworten || 0) + " Antworten des Planet-Fadens (Soll ≥ " + min + ")";
        if (!(z.streuungM > 0)) return "die Antworten tragen keine Streuung der Höhe (eine Konstante, nicht der Faden)";
        if (!(z.gefahr >= gefMin)) return "die Antwort des Fadens trägt " + (z.gefahr || 0) + " Gefahr-Schlüssel (Soll ≥ " + gefMin + ")";
        return null;
    };
    // die Störung: N Orte, Streuung > 0, der Brand schrieb (Nährstoff nach > vor), der Gegenlauf ohne Tat ändert nichts
    const zeugeBrand = (roh) => {
        const z = roh.zeuge || {};
        if (z.fehler) return "die Messung warf: " + z.fehler;
        if (!(z.orte >= 8)) return "nur " + (z.orte || 0) + " Orte gemessen (Soll ≥ 8)";
        if (!(z.streuung > 0)) return "Feuchte × Licht ohne Streuung über die Orte (eine Konstante)";
        if (!(z.naehrNach > z.naehrVor)) return "der Brand schrieb nichts (Nährstoff " + z.naehrVor + " → " + z.naehrNach + ")";
        if (z.gegen !== 0) return "der Gegenlauf ohne Tat ändert " + z.gegen + " Orte (Rauschen, keine Kopplung)";
        return null;
    };
    const BRAND_Z = { orte: 24, streuung: 0.31, naehrVor: 1, naehrNach: 1.4, gegen: 0, nachwuchs: 24 };
    const mit = (z, o) => Object.assign({}, z, o);

    return {
        leitern: {
            // ════════════════════════════════ same.kopplung.gewalt ════════════════════════════════
            [G]: {
                sek: 40,
                faecher: true,
                mutiert: true,
                pfad: PFAD_G,
                ungefahren: "das Bild der Fremdwelt-Probe (S6) schießt nur das Gerät; die Takte im Gewitter laufen headless ohne Karte (Tempo am Gerät höher)",
                mess: async function (H, U, M) {
                    const S = (fn, a) => H.seite("return await (" + String(fn) + ")(r, T, " + JSON.stringify(a || {}) + ");");
                    const seite = async (r, T, a) => {
                        const st = r.state;
                        const C = AnazhRealm;
                        const pm = st.playerMesh.position;
                        const P = { x: pm.x, z: pm.z };
                        const r3 = (v) => (Number.isFinite(v) ? Math.round(v * 1e3) / 1e3 : null);
                        const aus = {};
                        const Z = C.WETTER_ZUG_SEK;
                        const nZ = Math.round((a.jahre * r._kalender().jahrK) / Z);
                        const tA = st.spielZeit;
                        let [sturm, sonne, sturmNachTrocken, lauf] = [0, 0, 0, 0];
                        for (let k = 0; k < nZ; k++) {
                            const w = r._wetterAmOrt(P.x, P.z, tA + k * Z);
                            if (w === "stormy") {
                                sturm++;
                                if (lauf >= a.trockenZuege) sturmNachTrocken++;
                                lauf = 0;
                            } else if (w === "sunny") (sonne++, lauf++);
                            else lauf = 0;
                        }
                        aus.wetter = { zuege: nZ, sturm, sonne, sturmNachTrocken, jahre: a.jahre, zugS: Z };
                        const eigen = Object.prototype.hasOwnProperty.call(r, "_brandEntfachen");
                        const orig = r._brandEntfachen;
                        let zuend = 0;
                        const w0 = st.weather;
                        const ww0 = st.wetterWort;
                        const rs0 = Array.isArray(st.regenStempel) ? st.regenStempel.slice() : st.regenStempel;
                        const pz0 = st.pegelZustand;
                        const L0 = (st.worldMeta.taten ||= []);
                        const n0 = L0.length;
                        const bf0 = new Set((st.brandFeld || new Map()).keys());
                        const sz0 = st.spielZeit;
                        const stempelZurueck = () => {
                            st.regenStempel = Array.isArray(rs0) ? rs0.slice() : rs0;
                            st.pegelZustand = pz0;
                            r._regenGen = (r._regenGen | 0) + 1;
                        };
                        let t = performance.now();
                        const takt = () => r._gameLoopTick((t += 1000 / 60));
                        const flussP = (r._hydroFor(P.x, P.z).rivers || []).flatMap((v) => v.points || []).sort((p, q) => Math.hypot(p.x - P.x, p.z - P.z) - Math.hypot(q.x - P.x, q.z - P.z)).slice(0, 8);
                        const tiefe = () => r3(flussP.reduce((s, p) => { const b = r._voxelSurfaceY(p.x, p.z); return s + Math.max(0, r._atlasWaterLevelAt(p.x, p.z, b) - b); }, 0) / Math.max(1, flussP.length));
                        try {
                            r._brandEntfachen = function (x, z) {
                                zuend++;
                                return orig.call(this, x, z);
                            };
                            const zeitraffer = (wort) => {
                                if (window.__wetterSetzen(wort) !== wort) throw new Error("das Wetter der Probe gilt nicht: " + wort + " (es gilt " + st.weather + ")");
                                const [z0, b0, a0] = [zuend, (st.brandFeld || new Map()).size, st.worldMeta.taten.length];
                                for (let i = 0; i < a.takte; i++) takt();
                                return { zuend: zuend - z0, zellen: (st.brandFeld || new Map()).size - b0, taten: st.worldMeta.taten.slice(a0).filter((x) => x && x.tat === "brand").length, wetter: st.weather };
                            };
                            aus.sturm = zeitraffer("stormy");
                            aus.ohne = zeitraffer("sunny");
                            const pegel = (wort, s) => {
                                stempelZurueck();
                                if (window.__wetterSetzen(wort) !== wort) throw new Error("das Wetter der Probe gilt nicht: " + wort);
                                const s0 = st.spielZeit;
                                try {
                                    st.spielZeit = s0 + s;
                                    if (typeof r._pegelTakt === "function") r._pegelTakt();
                                    return tiefe();
                                } finally {
                                    st.spielZeit = s0;
                                }
                            };
                            const basis = tiefe();
                            aus.fluss = { punkte: flussP.length, basis, sturm30: pegel("stormy", 1800), sonne30: pegel("sunny", 1800), duerre3t: pegel("sunny", 3 * r._kalender().tagS) };
                        } finally {
                            if (eigen) r._brandEntfachen = orig;
                            else delete r._brandEntfachen;
                            if (window.__wetterSetzen(w0) !== w0) aus.zurueck = "das Wetter " + w0 + " gilt nicht nach der Probe";
                            if (!ww0) st.wetterWort = ww0;
                            stempelZurueck();
                            if (st.spielZeit < sz0) st.spielZeit = sz0;
                            if (typeof r._pegelTakt === "function") r._pegelTakt();
                            const L = st.worldMeta.taten;
                            if (L === L0 && L.length > n0) L.length = n0;
                            let weg = 0;
                            for (const k of [...(st.brandFeld || new Map()).keys()]) if (!bf0.has(k)) (st.brandFeld.delete(k), weg++);
                            if (weg) r._tatGen = (r._tatGen | 0) + 1;
                            aus.brandZurueck = weg;
                        }
                        // DER PLANET: welche Gefahr trägt die Antwort des Fadens (Schlüssel bis zur dritten Tiefe)
                        const GEF = ["beben", "quake", "vulkan", "volcan", "ausbruch", "eruption", "vei", "tsunami", "rutsch", "slide", "krater", "crater", "gefahr", "hazard", "blitz", "lightning", "brand", "fire", "flut", "flood", "duerre", "drought"];
                        const gef = (o) => {
                            const ks = [];
                            const geh = (x, d) => {
                                if (!x || typeof x !== "object" || d > 3) return;
                                for (const k of Object.keys(x)) (ks.push(k), geh(x[k], d + 1));
                            };
                            geh(o, 0);
                            return [...new Set(ks.filter((k) => GEF.some((g) => k.toLowerCase().includes(g))))];
                        };
                        await r._fadenQuelle();
                        const an = await r._planetAnker();
                        const [B, Lg] = [(an.breite * 180) / Math.PI, (an.laenge * 180) / Math.PI];
                        const ort = (samen, breite, laenge, zeitMa, mehr) => r._planetAuftrag(Object.assign({ type: "planet-ort", samen, breite: Math.max(-89.9, Math.min(89.9, breite)), laenge: ((laenge + 540) % 360) - 180, zeitMa }, mehr || {}));
                        const sd = (v) => {
                            const m = v.reduce((s, x) => s + x, 0) / Math.max(1, v.length);
                            return r3(Math.sqrt(v.reduce((s, x) => s + (x - m) * (x - m), 0) / Math.max(1, v.length)));
                        };
                        const s8 = await Promise.all(Array.from({ length: a.saaten8 }, async (_, i) => [await ort("same-saat-" + i, B, Lg, 0), await ort("same-saat-" + i, B, Lg, 0.01)]));
                        const g8 = new Set(s8.flatMap(([x, y]) => gef(x).concat(gef(y))));
                        aus.saat8 = { antworten: s8.length * 2, streuungM: sd(s8.map((q) => q[0].hoeheM)), zeitAendert: s8.filter(([x, y]) => x.hoeheM !== y.hoeheM).length, gefahr: [...g8], schluessel: Object.keys(s8[0][0]).concat(Object.keys(s8[0][0].delta || {})) };
                        const gitter = [];
                        for (let i = 0; i < a.gitter; i++) for (let j = 0; j < a.gitter; j++) gitter.push([B - a.gitter / 2 + i + 0.5, Lg - a.gitter / 2 + j + 0.5]);
                        const eg = await Promise.all(gitter.map(([b, l]) => ort(r._planetSamen(), b, l, 0)));
                        aus.erde = { zellen: eg.length, streuungM: sd(eg.map((o) => o.hoeheM)), land: eg.filter((o) => o.land).length, gefahr: [...new Set(eg.flatMap(gef))] };
                        const fr = await Promise.all(Array.from({ length: a.fremd }, async (_, i) => [await ort("same-saat-" + i, B, Lg, 0), await ort("same-saat-" + i, B, Lg, 0, { koerper: "mars", radiusKm: 3389.5, masseErden: 0.107, schwere: 3.71 })]));
                        aus.fremd = { antworten: fr.length * 2, streuungM: sd(fr.map((q) => q[0].hoeheM)), koerperWirkt: fr.filter(([x, y]) => x.hoeheM !== y.hoeheM || x.kuesteKm !== y.kuesteKm || JSON.stringify(x.delta) !== JSON.stringify(y.delta)).length, gefahr: [...new Set(fr.flatMap(([x, y]) => gef(x).concat(gef(y))))] };
                        return aus;
                    };
                    const u1 = U[1] || {};
                    const x = await S(seite, { jahre: u1.jahre || 100, takte: u1.takte || 240, trockenZuege: 10, saaten8: (U[3] || {}).saaten || 8, gitter: (U[5] || {}).gitter || 6, fremd: (U[6] || {}).planeten || 100 });
                    const w = x.wetter || {};
                    // S1 AM FÄCHER (M4): 12 Orte um den Spieler (±2 km) × zwei Fragen. „wetter“: die Wetter-Züge des Orts über die Spieljahre
                    // (r._wetterAmOrt, derselbe Weg wie das Wetter am Ort) — die Gewitter und die Gewitter nach ≥ 10 trockenen Zügen, die
                    // Ursache des Brands von selbst. „blitz“: die Fähigkeit der Welt, aus dem Gewitter zu zünden — fehlt sie, nennt die
                    // Adresse ihr Fehlen (die Zündung `_brandEntfachen` hat nur die Tat und das Werk als Rufer)
                    const GEWITTER_AN = async (r, T, a, mit) => {
                        const pm = r.state.playerMesh.position;
                        const x0 = pm.x + a.ort[0], z0 = pm.z + a.ort[1];
                        if (a.zeit.k === "blitz") {
                            const namen = new Set();
                            for (let q = Object.getPrototypeOf(r); q && q !== Object.prototype; q = Object.getPrototypeOf(q)) for (const k of Object.getOwnPropertyNames(q)) namen.add(k);
                            const da = [...namen].filter((k) => /blitz|lightning|einschlag/i.test(k));
                            if (!da.length) return { fehlt: "kein Blitz schlägt ein: die Zündung stamm/feld-brand.js:440 _brandEntfachen rufen nur stamm/kampf.js:2471 (die Tat) und stamm/koerper-fahrt.js:2361 (das Werk), kein Leser des Gewitters" };
                            return { da: da.length, namen: da.join("·") };
                        }
                        const Z = AnazhRealm.WETTER_ZUG_SEK;
                        const nZ = Math.round((mit.jahre * r._kalender().jahrK) / Z);
                        const tA = r.state.spielZeit;
                        let sturm = 0, nachTrocken = 0, lauf = 0;
                        for (let k = 0; k < nZ; k++) {
                            const w = r._wetterAmOrt(x0, z0, tA + k * Z);
                            if (w === "stormy") {
                                sturm++;
                                if (lauf >= mit.trocken) nachTrocken++;
                                lauf = 0;
                            } else if (w === "sunny") lauf++;
                            else lauf = 0;
                        }
                        return { zuege: nZ, sturm, nachTrocken };
                    };
                    const orte1 = [];
                    for (let i = 0; i < 12; i++) orte1.push([Math.round(2000 * Math.cos((i * Math.PI) / 6) * (0.4 + 0.05 * i)), Math.round(2000 * Math.sin((i * Math.PI) / 6) * (0.4 + 0.05 * i))]);
                    let R1g = null;
                    try {
                        R1g = await FAECHER((c) => H.seite(c), {
                            gesetz: { fn: GEWITTER_AN, export: "r._wetterAmOrt (die Wetter-Züge des Orts, AnazhRealm.WETTER_ZUG_SEK) · der Prototyp der Welt (ein Blitz)", leser: "stamm/feld-brand.js:440 _brandEntfachen ← stamm/kampf.js:2471 · stamm/koerper-fahrt.js:2361" },
                            adressen: { orte: orte1, zeiten: [{ k: "wetter" }, { k: "blitz" }] },
                            mit: { jahre: u1.jahre || 100, trocken: 10 },
                            ms: 12000,
                            masse: { orte: { wie: "anzahl", feld: "sturm" }, zuegeJeOrt: { wie: "mittel", feld: "zuege" }, sturmJeOrt: { wie: "mittel", feld: "sturm" }, sturmMin: { wie: "min", feld: "sturm" }, nachTrocken: { wie: "summe", feld: "nachTrocken" } },
                            schlecht: { feld: "nachTrocken", richtung: "max" },
                            pose: (q) => "das Gewitter am Ort +" + q.ort.join("/+") + " m — Third 3 m, Blick zum Wald",
                            ungemessen: ["der Brand von selbst im Bild (am Gerät)"],
                        });
                    } catch (e) {
                        R1g = { werte: {}, fehlt: null, fehltAn: [], akte: "der Fächer warf: " + String((e && e.message) || e).slice(0, 160) };
                    }
                    const zs = (x.sturm || {}).zuend || 0;
                    const zo = (x.ohne || {}).zuend || 0;
                    const sturmS = (a) => (w.sturm || 0) * (w.zugS || 120) / Math.max(1, w.jahre || 100);
                    const rate = (u1.takte || 240) > 0 ? (zs / ((u1.takte || 240) / 60)) * sturmS() / (u1.flaecheKm2 || 1) : null;
                    const real = u1.realRateKm2a || 0.001;
                    const faktor = rate > 0 ? Math.max(rate / real, real / rate) : null;
                    const zz = { zuege: w.zuege, takte: u1.takte || 240, sturm: w.sturm, sturmNachTrocken: w.sturmNachTrocken, zuendSturm: zs, zuendOhne: zo, zellen: [(x.sturm || {}).zellen, (x.ohne || {}).zellen], brandZurueck: x.brandZurueck, zurueck: x.zurueck, faecherOrte: R1g.werte.orte || 0, sturmJeOrt: R1g.werte.sturmJeOrt, nachTrockenOrte: R1g.werte.nachTrocken, akte: R1g.akte };
                    const fl = x.fluss || {};
                    const klassen = (zs > 0 ? 1 : 0) + (fl.sturm30 > fl.sonne30 ? 1 : 0) + (fl.duerre3t < fl.sonne30 ? 1 : 0);
                    const s8 = x.saat8 || {};
                    const er = x.erde || {};
                    const fr = x.fremd || {};
                    const gefN = (g) => (Array.isArray(g) ? g.length : 0);
                    const auge6 = await M.auge("same-gewalt-s6", { ort: "wiese" });
                    return {
                        sprossen: {
                            1: {
                                werte: { brandRateKm2a: rate, faktorZurRealRate: faktor },
                                zeuge: zz,
                                nicht: "kein Brand von selbst: " + (u1.takte || 240) + " Takte der Welt im Gewitter zünden " + zs + ", in der Sonne " + zo + " (jeder Ruf von `_brandEntfachen` gezählt); die Front trägt " + w.sturm + " Sturm-Züge in " + w.jahre + " Spieljahren, " + w.sturmNachTrocken + " nach ≥ 10 trockenen Zügen — " + (R1g.fehlt || "kein Blitz schlägt ein") + " · am Fächer " + (R1g.werte.orte || 0) + " Orte × " + Math.round(R1g.werte.zuegeJeOrt || 0) + " Züge: im Mittel " + (R1g.werte.sturmJeOrt == null ? "—" : Math.round(R1g.werte.sturmJeOrt)) + " Gewitter je Ort, " + (R1g.werte.nachTrocken || 0) + " nach Trockenheit",
                            },
                            2: {
                                werte: { klassenVonSelbst: klassen, steigungFaktor: null },
                                zeuge: Object.assign({ fluss: [fl.basis, fl.sturm30, fl.sonne30, fl.duerre3t], punkte: fl.punkte }, zz),
                                nicht: "nur " + klassen + " von 3 Klassen von selbst: Brand " + zs + " Zündungen; Flusstiefe an " + fl.punkte + " Punkten " + fl.basis + " m → 30 min Sturm " + fl.sturm30 + " · 30 min Sonne " + fl.sonne30 + " · 3 Tage Sonne " + fl.duerre3t + " m — keine Häufigkeits-Kurve über 10³ a, ohne die Brand-Klasse keine Steigung gegen GWIS",
                            },
                            3: {
                                werte: { saaten: s8.antworten ? s8.antworten / 2 : null, bWert: null },
                                zeuge: { antworten: s8.antworten, streuungM: s8.streuungM, gefahr: gefN(s8.gefahr), zeitAendert: s8.zeitAendert },
                                nicht: "kein Beben, kein Ausbruch, kein Hangrutsch: " + (s8.antworten / 2) + " Saaten × 10⁴ a im Planet-Faden, die Antwort trägt " + gefN(s8.gefahr) + " Gefahr-Schlüssel (" + (s8.schluessel || []).join(", ") + ")",
                            },
                            4: {
                                werte: { tsunamiAusloeserProzent: null, tsunamiRateFaktor: null },
                                zeuge: { tsunamis: 0, mitAusloeser: 0, gefahr: gefN(s8.gefahr) + gefN(er.gefahr), zuendNachDuerre: zs, sturmNachTrocken: w.sturmNachTrocken },
                                nicht: "keine Auslöser-Kette: kein Tsunami (0 Gefahr-Schlüssel an " + ((s8.antworten || 0) + (er.zellen || 0)) + " Antworten des Fadens), Dürre → Brand: " + w.sturmNachTrocken + " Gewitter nach ≥ 10 trockenen Zügen, " + zs + " Zündungen",
                            },
                            5: {
                                werte: { rBebenGem: null, rVulkanGvp: null, kraterExponent: null },
                                zeuge: { antworten: er.zellen, streuungM: er.streuungM, gefahr: gefN(er.gefahr), land: er.land },
                                nicht: "keine Gefahr-Karte: " + er.zellen + " 1°-Zellen der Erd-Saat um den Anker (" + er.land + " Land, Höhe σ " + er.streuungM + " m) — die Antwort trägt " + gefN(er.gefahr) + " Gefahr-Schlüssel, kein Beben, keinen Vulkan, keinen Krater",
                            },
                            6: {
                                werte: { rang: null, namenloseJe10: 0 },
                                zeuge: { antworten: fr.antworten, streuungM: fr.streuungM, gefahr: gefN(fr.gefahr), koerperWirkt: fr.koerperWirkt },
                                auge: auge6,
                                nicht: "keine Fremd-Gefahr: " + (fr.antworten / 2) + " Saaten mit ↔ ohne Körper Mars — der Körper ändert " + fr.koerperWirkt + " Antworten, die Antwort trägt " + gefN(fr.gefahr) + " Gefahr-Schlüssel",
                            },
                        },
                    };
                },
                sprossen: {
                    1: {
                        u: { jahre: 100, flaecheKm2: 1, takte: 240, realRateKm2a: 0.001 },
                        soll: [K.soll(G, 1, "im Faktor 3 der Real-Rate", { key: "faktorZurRealRate", rel: "≤", einheit: "×", refQuelle: "Erde: Blitzbrände ~1·10⁻³ je km² und Jahr (Kanada, Stocks et al. 2002: ~3 000 Blitzbrände/a auf ~4·10⁶ km² Wald)" })],
                        zeuge: zeugeZuendung,
                        taeter: "stamm/feld-brand.js `_brandEntfachen` (gerufen nur von der Tat: Brennglas, Unfall, Lava — kein Blitz im Gewitter)",
                        nicht: "kein Brand von selbst (kein Blitz)",
                        leser: "stamm/feld-brand.js:440 `_brandEntfachen` — kein Rufer aus dem Wetter; stamm/bild-himmel.js:3032 `_wetterAmOrt` trägt das Gewitter ohne Blitz",
                        gruen: { werte: { brandRateKm2a: 0.0016, faktorZurRealRate: 1.6 }, zeuge: ZUEND_Z },
                        attrappen: [
                            { name: "Faktor 1,6 aus einer Tafel, 0 Zündungen in der Welt", roh: { werte: { brandRateKm2a: 0.0016, faktorZurRealRate: 1.6 }, zeuge: mit(ZUEND_Z, { zuendSturm: 0 }) } },
                            { name: "die Sonne zündet wie das Gewitter (die Zündung hängt nicht am Wetter)", roh: { werte: { brandRateKm2a: 0.0016, faktorZurRealRate: 1.6 }, zeuge: mit(ZUEND_Z, { zuendOhne: 3 }) } },
                            { name: "kein Zeitraffer (10 Wetter-Züge statt 100 Spieljahren)", roh: { werte: { brandRateKm2a: 0.0016, faktorZurRealRate: 1.6 }, zeuge: mit(ZUEND_Z, { zuege: 10 }) } },
                        ],
                    },
                    2: {
                        u: { klassen: ["brand", "hochwasser", "duerre"], jahre: 1000, sturmS: 1800, duerreTage: 3 },
                        soll: [K.soll(G, 2, "Steigung im Faktor 1,5", { key: "steigungFaktor", rel: "≤", einheit: "×" })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.punkte >= 4)) return "nur " + (z.punkte || 0) + " Flusspunkte gemessen";
                            if (!(z.fluss && z.fluss[1] > z.fluss[2])) return "der Sturm hebt den Fluss nicht über die Sonne (kein Hochwasser aus dem Regen)";
                            return zeugeZuendung(roh);
                        },
                        taeter: "stamm/feld-brand.js `_brandEntfachen` (keine Brand-Klasse von selbst) · gelaende-core.js pegelLauf (kein Jahres-Maximum, keine Kurve)",
                        nicht: "keine Brand-Klasse von selbst, keine Häufigkeits-Kurve",
                        leser: "stamm/feld-brand.js:440 `_brandEntfachen` — kein Rufer aus dem Klima; stamm/wasser-hydro.js:231 `_pegelZustand` — kein Gedächtnis der Jahres-Spitzen",
                        gruen: { werte: { klassenVonSelbst: 3, steigungFaktor: 1.2 }, zeuge: mit(ZUEND_Z, { fluss: [0.4, 0.9, 0.4, 0.3], punkte: 8 }) },
                        attrappen: [
                            { name: "Steigung 1,2 bei gleichem Fluss in Sturm und Sonne", roh: { werte: { klassenVonSelbst: 3, steigungFaktor: 1.2 }, zeuge: mit(ZUEND_Z, { fluss: [0.4, 0.4, 0.4, 0.4], punkte: 8 }) } },
                            { name: "Steigung 1,2 ohne Brand von selbst", roh: { werte: { klassenVonSelbst: 3, steigungFaktor: 1.2 }, zeuge: mit(ZUEND_Z, { fluss: [0.4, 0.9, 0.4, 0.3], punkte: 8, zuendSturm: 0 }) } },
                        ],
                    },
                    3: {
                        u: { saaten: 8, jahre: 10000, klassen: 6 },
                        soll: [
                            K.soll(G, 3, "8 Saaten", { key: "saaten", rel: "≥" }),
                            K.soll(G, 3, "b-Wert und VEI-Raten im Real-Band", { key: "bWert", rel: "band", zahl: 0.8, bis: 1.2, quelleFeld: "tiefe", quelleWort: "b 0,8–1,2", refQuelle: "Erde: Gutenberg-Richter b ≈ 1 (0,8–1,2)" }),
                        ],
                        zeuge: zeugeFaden(16, 3),
                        taeter: "voxel-worker.js planetOrtAuftrag (kein Beben, kein Ausbruch, kein Rutsch in der Antwort)",
                        nicht: "kein Beben, kein Ausbruch, kein Hangrutsch",
                        leser: "voxel-worker.js:1446 planetOrtAuftrag — die Antwort trägt land, hoeheM, kuesteKm, delta; planet-core.js:1884 planetVulkane hat keinen Leser",
                        unklar: "„VEI-Raten im Real-Band“ trägt keine Zahl — Vorschlag: Ausbrüche VEI ≥ 4 je 10 a im Faktor 3 der GVP-Rate (~1 je 10 a) als zweites Soll.",
                        gruen: { werte: { saaten: 8, bWert: 1.02 }, zeuge: { antworten: 16, streuungM: 2400, gefahr: 3 } },
                        attrappen: [{ name: "b 1,02 ohne Beben in der Antwort des Fadens", roh: { werte: { saaten: 8, bWert: 1.02 }, zeuge: { antworten: 16, streuungM: 2400, gefahr: 0 } } }],
                    },
                    4: {
                        u: { ketten: ["beben>tsunami", "duerre>brand", "ausbruch>gletscherlauf"] },
                        soll: [
                            K.soll(G, 4, "Tsunamis mit Auslöser in der Welt = 100 %", { key: "tsunamiAusloeserProzent", rel: "=", zahl: 100, einheit: "%" }),
                            K.soll(G, 4, "Rate je Küstenkilometer Faktor 3", { key: "tsunamiRateFaktor", rel: "≤", einheit: "×" }),
                        ],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.tsunamis >= 1)) return "kein Tsunami in der Welt";
                            if (z.mitAusloeser !== z.tsunamis) return z.tsunamis - z.mitAusloeser + " Tsunamis ohne Auslöser in der Welt";
                            if (!(z.zuendNachDuerre >= 1)) return "die Dürre zündet keinen Brand (die Kette Dürre → Brand fehlt)";
                            return null;
                        },
                        taeter: "voxel-worker.js planetOrtAuftrag (kein Beben, kein Tsunami) · stamm/feld-brand.js `_brandEntfachen` (Dürre zündet nicht)",
                        nicht: "keine Auslöser-Kette",
                        leser: "voxel-worker.js:1446 planetOrtAuftrag — kein Beben, kein Tsunami; stamm/feld-brand.js:440 `_brandEntfachen` — kein Rufer aus der Dürre",
                        gruen: { werte: { tsunamiAusloeserProzent: 100, tsunamiRateFaktor: 1.8 }, zeuge: { tsunamis: 12, mitAusloeser: 12, zuendNachDuerre: 4 } },
                        attrappen: [
                            { name: "100 % bei 0 Tsunamis in der Welt", roh: { werte: { tsunamiAusloeserProzent: 100, tsunamiRateFaktor: 1.8 }, zeuge: { tsunamis: 0, mitAusloeser: 0, zuendNachDuerre: 4 } } },
                            { name: "Tsunamis ohne Beben (gesetzt, nicht ausgelöst)", roh: { werte: { tsunamiAusloeserProzent: 100, tsunamiRateFaktor: 1.8 }, zeuge: { tsunamis: 12, mitAusloeser: 7, zuendNachDuerre: 4 } } },
                        ],
                    },
                    5: {
                        u: { saat: "erde", gitterGrad: 1, gitter: 6, jahre: 1e6 },
                        soll: [
                            K.soll(G, 5, "GEM r ≥ 0,7", { key: "rBebenGem" }),
                            K.soll(G, 5, "GVP r ≥ 0,7", { key: "rVulkanGvp" }),
                            K.soll(G, 5, "Krater N(>D) ∝ D^−2,7", { key: "kraterExponent", rel: "=", zahl: -2.7 }),
                        ],
                        zeuge: zeugeFaden(36, 2),
                        taeter: "voxel-worker.js planetOrtAuftrag (keine Beben-, Vulkan-, Krater-Karte) · planet-core.js planetVulkane (ohne Leser)",
                        nicht: "keine Gefahr-Karte des Planeten",
                        leser: "planet-core.js:1884 planetVulkane — ohne Leser im Spiel; voxel-worker.js:1446 planetOrtAuftrag — kein Beben, kein Krater in der Antwort",
                        unklar: "„N(>D) ∝ D^−2,7“ nennt keine Toleranz — Vorschlag: Exponent −2,7 ± 0,3 über ≥ 100 Krater.",
                        gruen: { werte: { rBebenGem: 0.74, rVulkanGvp: 0.72, kraterExponent: -2.7 }, zeuge: { antworten: 36, streuungM: 1800, gefahr: 3 } },
                        attrappen: [{ name: "r 0,74 aus einer Tafel, der Faden trägt keine Gefahr", roh: { werte: { rBebenGem: 0.74, rVulkanGvp: 0.72, kraterExponent: -2.7 }, zeuge: { antworten: 36, streuungM: 1800, gefahr: 0 } } }],
                    },
                    6: {
                        u: { planeten: 100, koerper: "mars", jahre: 1e9 },
                        soll: [K.soll(G, 6, "Rang ≥ 0,7", { key: "rang" }), K.soll(G, 6, "≥ 1 namenlose Gefahr je 10 Planeten", { key: "namenloseJe10" })],
                        auge: { pose: "Orbit über dem Fremd-Planeten (heute keine Orbit-Pose: geschossen an der Wiese)", vorbild: "Fremdwelt-Probe R10: Ursachen-Probe aus dem Bild Rang ≥ 0,7, Gegenlauf, Neuheit" },
                        zeuge: zeugeFaden(200, 1),
                        taeter: "voxel-worker.js planetOrtAuftrag (der Körper ändert nichts, keine Gefahr in der Antwort)",
                        nicht: "keine Fremd-Gefahr",
                        leser: "voxel-worker.js:1446 planetOrtAuftrag — nimmt samen, breite, laenge, zeitMa; kein Körper, kein Wärmefluss, keine Gefahr",
                        gruen: { werte: { rang: 0.78, namenloseJe10: 2 }, zeuge: { antworten: 200, streuungM: 2400, gefahr: 3 } },
                        attrappen: [{ name: "Rang 0,78 ohne Gefahr in der Antwort", roh: { werte: { rang: 0.78, namenloseJe10: 2 }, zeuge: { antworten: 200, streuungM: 2400, gefahr: 0 } } }],
                    },
                },
            },
            // ════════════════════════════════ same.kopplung.stoerung (S2–S7) ════════════════════════════════
            [ST]: {
                sek: 30,
                mutiert: true,
                pfad: PFAD_S,
                ungefahren: "die Bildpaare (S4 Wiederaufbau, S6 angepasste Bauten, S7 Weltkarte) schießt nur das Gerät",
                mess: async function (H, U, M) {
                    const S = (fn, a) => H.seite("return await (" + String(fn) + ")(r, T, " + JSON.stringify(a || {}) + ");");
                    const seite = async (r, T, a) => {
                        const st = r.state;
                        const C = AnazhRealm;
                        const wm = st.worldMeta;
                        const pm = st.playerMesh.position;
                        const cs = C.LIFE_FIELD.cell;
                        const jahrH = ((K) => (K.tagStunden * K.jahrK) / K.normS)(r._kalender());
                        const r3 = (v) => (Number.isFinite(v) ? Math.round(v * 1e3) / 1e3 : null);
                        const mitte = (v) => (Math.floor(v / cs) + 0.5) * cs;
                        const alt = { L0: wm.taten, nf: r._nachwuchsFaellig, sn: r._sukzessionNeu, idx: r._tatIdx, sz: st.spielZeit };
                        const stubs = ["_scheduleEditSave", "_nahStreuTat", "_weltRegt"].map((m) => [m, Object.prototype.hasOwnProperty.call(r, m), r[m]]);
                        const bei = (j, f) => {
                            st.spielZeit = alt.sz + j * ((K) => (K.jahrK * K.tagS) / K.normS)(r._kalender());
                            try {
                                return f();
                            } finally {
                                st.spielZeit = alt.sz;
                            }
                        };
                        const orte = Array.from({ length: a.orte }, (_, i) => {
                            const d = a.radien[i % a.radien.length];
                            return [mitte(pm.x + d * Math.cos(i * 2.39996)), mitte(pm.z + d * Math.sin(i * 2.39996))];
                        });
                        // Feuchte × Licht ist DAS Wuchs-Gesetz des Spiels (`_wuchsAt`, stamm/vegetation-wiese.js: das Wasser des Bodens mal
                        // das Licht unter den Kronen, × Nährstoff und Krautschicht) — die Probe liest es, nie eine Abschrift seines Wasser-Terms
                        const lies = (x, z) => {
                            const f = r._feuchteAt(x, z);
                            const l = r._bodenLichtFeld(x, z, x, z)(x, z);
                            return { f: r3(f), l: r3(l), fl: r3(r._wuchsAt(x, z)), naehr: r3(r._naehrstoffAt(x, z)), nahr: r3(r._kreaturNahrung(x, z)) };
                        };
                        const vor = orte.map(([x, z]) => lies(x, z));
                        const gegen = orte.filter(([x, z], i) => JSON.stringify(lies(x, z)) !== JSON.stringify(vor[i])).length;
                        const block = [];
                        const [bx, bz] = [mitte(pm.x + a.blockAbstand), mitte(pm.z)];
                        for (let i = -a.blockR; i <= a.blockR; i++) for (let j = -a.blockR; j <= a.blockR; j++) block.push([bx + i * cs, bz + j * cs]);
                        const aesung = () => r3(block.reduce((s, [x, z]) => s + r._kreaturNahrung(x, z), 0) / block.length);
                        const flussP = (r._hydroFor(bx, bz).rivers || []).flatMap((v) => v.points || []).sort((p, q) => Math.hypot(p.x - bx, p.z - bz) - Math.hypot(q.x - bx, q.z - bz)).slice(0, 8);
                        const fluss = () => r3(flussP.reduce((s, p) => { const b = r._voxelSurfaceY(p.x, p.z); return s + Math.max(0, r._atlasWaterLevelAt(p.x, p.z, b) - b); }, 0) / Math.max(1, flussP.length));
                        const tiere = () => {
                            let n = 0;
                            for (const R of Object.values((st.faunaBestand || {}).regionen || {})) for (const t of R.tiere || []) if (Math.hypot(t.x - bx, t.z - bz) <= a.tierR) n++;
                            return n;
                        };
                        const aus = { orte: orte.length, gegen };
                        const blockVor = { aesung: aesung(), fluss: fluss(), tiere: tiere(), punkte: flussP.length };
                        try {
                            for (const [m] of stubs) r[m] = () => {};
                            r._sukzessionNeu = [];
                            wm.taten = Array.isArray(alt.L0) ? alt.L0.slice() : [];
                            const h0 = r._weltStunde();
                            const B = orte.map(([x, z]) => r._tatSchreiben("brand", x, z));
                            const I = r._tatIndex();
                            aus.reihe = B.map((b, i) => {
                                const d = I.dauer.get(b);
                                const s1 = r._sukzession(b, h0 + a.sprungJahre * jahrH);
                                return { fl: vor[i].fl, tempo: d > 0 ? r3(jahrH / d) : null, w: b.w, asche1: s1.asche, busch1: s1.busch, nachwuchs: s1.asche < 1 || s1.busch > 0 ? 1 : 0, naehr: r3(r._naehrstoffAt(orte[i][0], orte[i][1])) };
                            });
                            aus.sprungJahre = a.sprungJahre;
                            wm.taten = Array.isArray(alt.L0) ? alt.L0.slice() : [];
                            for (const [x, z] of block) r._tatSchreiben("brand", x, z);
                            aus.block = { vor: blockVor, nach: { aesung: aesung(), fluss: fluss(), tiere: tiere() }, jahre: a.jahre.map((j) => [j, bei(j, aesung)]), zellen: block.length, ort: [bx, bz].map(Math.round) };
                        } finally {
                            wm.taten = alt.L0;
                            r._nachwuchsFaellig = alt.nf;
                            r._sukzessionNeu = alt.sn;
                            r._tatIdx = alt.idx;
                            st.spielZeit = alt.sz;
                            for (const [m, e, f] of stubs) {
                                if (e) r[m] = f;
                                else delete r[m];
                            }
                        }
                        aus.zurueck = { taten: wm.taten === alt.L0, aesung: aesung() === blockVor.aesung };
                        aus.welt = { staedte: r._staedte().length, siedlungen: ((st.wegeKarte || {}).siedlungen || []).length, haefen: (st.architectures || []).filter((e) => e && /hafen|harbor|harbour|port/i.test(String(e.type))).length, bauten: (st.architectures || []).length, wegStufen: ((st.wegeKarte || {}).stufen || []).length };
                        const GEF = ["beben", "quake", "vulkan", "volcan", "ausbruch", "eruption", "tsunami", "rutsch", "krater", "crater", "gefahr", "hazard", "einschlag", "impact", "aussterb", "arten"];
                        const gef = (o) => {
                            const ks = [];
                            const geh = (x, d) => {
                                if (!x || typeof x !== "object" || d > 3) return;
                                for (const k of Object.keys(x)) (ks.push(k), geh(x[k], d + 1));
                            };
                            geh(o, 0);
                            return [...new Set(ks.filter((k) => GEF.some((g) => k.toLowerCase().includes(g))))];
                        };
                        await r._fadenQuelle();
                        const an = await r._planetAnker();
                        const [Bb, Lg] = [(an.breite * 180) / Math.PI, (an.laenge * 180) / Math.PI];
                        const ort = (samen, zeitMa) => r._planetAuftrag({ type: "planet-ort", samen, breite: Bb, laenge: Lg, zeitMa });
                        const samen = r._planetSamen();
                        const glieder = (o) => [o.land, o.hoeheM, o.kuesteKm, o.delta.klima.sommer, o.delta.meer.waterLevelM, o.delta.wetter.regenQuote, o.delta.wuchs.wald, o.delta.wildnis.ks, o.delta.staedte, o.delta.sprachen];
                        const diff = (x, y) => glieder(x).filter((v, i) => v !== undefined && glieder(y)[i] !== undefined && v !== glieder(y)[i]).length;
                        const o0 = await ort(samen, 0);
                        const o0b = await ort(samen, 0);
                        const oK = await ort(samen + "-gekippt", 0);
                        const oZ = await ort(samen, a.zeitMa);
                        aus.wurzel = { geaendert: diff(o0, oK), gegen: diff(o0, o0b), zeit: diff(o0, oZ), glieder: glieder(o0).length, getragen: glieder(o0).filter((v) => v !== undefined).length, gefahr: gef(o0).concat(gef(oK)).length, kueste: [o0.kuesteKm, oK.kuesteKm].map(r3) };
                        const s100 = await Promise.all(Array.from({ length: a.saaten }, (_, i) => ort("same-saat-" + i, 0)));
                        const hs = s100.map((o) => o.hoeheM);
                        const hm = hs.reduce((s, v) => s + v, 0) / Math.max(1, hs.length);
                        aus.saaten = { n: s100.length, streuungM: r3(Math.sqrt(hs.reduce((s, v) => s + (v - hm) * (v - hm), 0) / Math.max(1, hs.length))), gefahr: [...new Set(s100.flatMap(gef))].length, mitGefahr: s100.filter((o) => gef(o).length > 0).length };
                        return aus;
                    };
                    const x = await S(seite, { orte: (U[2] || {}).orte || 24, radien: [30, 60, 90, 120, 150, 180, 210, 240], sprungJahre: (U[2] || {}).jahre || 1, blockAbstand: 60, blockR: 3, tierR: 150, jahre: [0, 0.5, 1, 2, 3, 5, 7, 10, 15], zeitMa: 1, saaten: (U[6] || {}).saaten || 100 });
                    const R = x.reihe || [];
                    const pear = (P) => {
                        const n = P.length;
                        if (n < 3) return null;
                        const [mx, my] = [P.reduce((s, p) => s + p[0], 0) / n, P.reduce((s, p) => s + p[1], 0) / n];
                        let [sxy, sxx, syy] = [0, 0, 0];
                        for (const [u, v] of P) (sxy += (u - mx) * (v - my)), (sxx += (u - mx) * (u - mx)), (syy += (v - my) * (v - my));
                        return sxx > 0 && syy > 0 ? Math.round((sxy / Math.sqrt(sxx * syy)) * 1000) / 1000 : null;
                    };
                    const paare = R.filter((q) => Number.isFinite(q.tempo) && Number.isFinite(q.fl)).map((q) => [q.tempo, q.fl]);
                    const fls = R.map((q) => q.fl).filter(Number.isFinite);
                    const naehrNach = R.length ? Math.min(...R.map((q) => q.naehr)) : null;
                    const zb = { orte: R.length, streuung: fls.length ? Math.round((Math.max(...fls) - Math.min(...fls)) * 1000) / 1000 : 0, naehrVor: 1, naehrNach, gegen: x.gegen, nachwuchs: R.reduce((s, q) => s + q.nachwuchs, 0), tempo: [Math.min(...paare.map((p) => p[0])), Math.max(...paare.map((p) => p[0]))] };
                    const bl = x.block || { vor: {}, nach: {}, jahre: [] };
                    const dichte = bl.vor.aesung > 0 ? Math.round(((bl.nach.aesung - bl.vor.aesung) / bl.vor.aesung) * 1000) / 10 : null;
                    const rueck = bl.vor.aesung > 0 ? (bl.jahre.find(([j, v]) => j > 0 && v >= 0.9 * bl.vor.aesung) || [null])[0] : null;
                    const pegelF = bl.vor.fluss > 0 ? Math.round((bl.nach.fluss / bl.vor.fluss) * 1000) / 1000 : null;
                    const wl = x.welt || {};
                    const wu = x.wurzel || {};
                    const sa = x.saaten || {};
                    const auge4 = await M.auge("same-stoerung-s4", { ort: "wiese" });
                    const auge6 = await M.auge("same-stoerung-s6", { ort: "wiese" });
                    const auge7 = await M.auge("same-stoerung-s7", { ort: "wiese" });
                    const zs = { antworten: sa.n, streuungM: sa.streuungM, gefahr: sa.gefahr, mitGefahr: sa.mitGefahr };
                    return {
                        sprossen: {
                            2: { werte: { sprungJahre: x.sprungJahre, rTempoFeuchteLicht: pear(paare), nachwuchsOrte: zb.nachwuchs }, zeuge: Object.assign({ zurueck: x.zurueck }, zb) },
                            3: {
                                werte: { tierdichteSofortProzent: dichte, rueckkehrJahre: rueck, pegelSpitzeFaktor: pegelF },
                                zeuge: Object.assign({}, zb, { aesung: [bl.vor.aesung, bl.nach.aesung], tiere: [bl.vor.tiere, bl.nach.tiere], fluss: [bl.vor.fluss, bl.nach.fluss], punkte: bl.vor.punkte, kurve: bl.jahre }),
                                taeter: "stamm/wasser-hydro.js `_pegelZustand` (Pegel ×" + pegelF + ": der Abfluss liest keine Brandfläche) · stamm/kreatur-leben.js `_kreaturNahrung` (die Äsung fällt " + dichte + " %, das Tier flieht nicht: " + bl.vor.tiere + " → " + bl.nach.tiere + " Tiere im Umkreis)",
                            },
                            4: { werte: { vei: null, bevoelkerungProzent: null, kornpreisFaktor: null, bildpaarJahre: null }, zeuge: wl, auge: auge4, nicht: "keine Stadt am Ausbruch: r._staedte() trägt " + wl.staedte + " Städte, " + wl.siedlungen + " Siedlungen; der einzige Ausbruch ist die Lava einer 16-m-Zelle, kein Kornpreis in der Welt" },
                            5: { werte: { haefenVerlegtProzent: null }, zeuge: Object.assign({ tsunamis: 0 }, wl, zs), nicht: "kein Tsunami, kein neu entstehender Hafen: " + wl.haefen + " Häfen unter " + wl.bauten + " Bauten, " + sa.gefahr + " Gefahr-Schlüssel an " + sa.n + " Saaten des Fadens" },
                            6: { werte: { saaten: sa.n, rGefahrBauten: null }, zeuge: zs, auge: auge6, nicht: "keine Gefahr-Rate je Saat: " + sa.mitGefahr + " von " + sa.n + " Saaten tragen eine Gefahr im Planet-Faden, keine angepasste Bauweise" },
                            7: {
                                werte: { gliederGeaendert: wu.geaendert, artenVerlustProzent: null, erholungMioA: null },
                                zeuge: wu,
                                auge: auge7,
                                nicht: "die Wurzel ändert " + wu.geaendert + " von " + wu.glieder + " Gliedern (der Faden trägt " + wu.getragen + ": keine Städte, keine Sprachen; derselbe Samen zweimal " + wu.gegen + "), kein Einschlag, kein Aussterben im Faden",
                            },
                        },
                    };
                },
                sprossen: {
                    2: {
                        u: { orte: 24, jahre: 1, domaenen: ["boden", "pflanze", "licht"] },
                        soll: [K.soll(ST, 2, "Zeitsprung 1 Spieljahr", { key: "sprungJahre", rel: "≥", einheit: "a" }), K.soll(ST, 2, "r(Tempo, Feuchte × Licht) ≥ 0,5", { key: "rTempoFeuchteLicht" })],
                        zeuge: (roh) => zeugeBrand(roh) || (!((roh.zeuge || {}).nachwuchs >= 1) ? "kein Nachwuchs auf der Asche nach dem Sprung" : null),
                        zeugeText: "der Brand düngt (Nährstoff steigt), Nachwuchs auf der Asche, der Gegenlauf ohne Tat ändert nichts",
                        taeter: "stamm/vegetation-wiese.js `_tatDauer` / `_wuchsAt` (das Tempo der Heilung)",
                        gruen: { werte: { sprungJahre: 1, rTempoFeuchteLicht: 0.83, nachwuchsOrte: 24 }, zeuge: BRAND_Z },
                        attrappen: [
                            { name: "r 0,83 an EINEM Ort (keine Streuung)", roh: { werte: { sprungJahre: 1, rTempoFeuchteLicht: 0.83 }, zeuge: mit(BRAND_Z, { streuung: 0 }) } },
                            { name: "der Brand schrieb nichts (Nährstoff 1 → 1)", roh: { werte: { sprungJahre: 1, rTempoFeuchteLicht: 0.83 }, zeuge: mit(BRAND_Z, { naehrNach: 1 }) } },
                            { name: "die Orte ändern sich auch ohne Tat", roh: { werte: { sprungJahre: 1, rTempoFeuchteLicht: 0.83 }, zeuge: mit(BRAND_Z, { gegen: 5 }) } },
                            { name: "kein Nachwuchs auf der Asche", roh: { werte: { sprungJahre: 1, rTempoFeuchteLicht: 0.83 }, zeuge: mit(BRAND_Z, { nachwuchs: 0 }) } },
                        ],
                    },
                    3: {
                        u: { block: "7×7 Zellen", jahre: 10, tierR: 150 },
                        soll: [
                            K.soll(ST, 3, "Tierdichte −50 % sofort", { key: "tierdichteSofortProzent", rel: "≤", einheit: "%" }),
                            K.soll(ST, 3, "Rückkehr in 3–10 a", { key: "rueckkehrJahre", einheit: "a" }),
                            K.soll(ST, 3, "Pegel-Spitze ≥ 1,3×", { key: "pegelSpitzeFaktor", einheit: "×" }),
                        ],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.aesung && z.aesung[0] > z.aesung[1])) return "die Äsung der Tiere fällt nicht mit dem Brand";
                            if (!(z.fluss && z.fluss[0] > 0)) return "kein Wasser an den Flusspunkten gemessen";
                            if (!(z.fluss[1] > z.fluss[0])) return "der Pegel steigt nicht nach dem Brand (" + z.fluss.join(" → ") + " m)";
                            return zeugeBrand(roh);
                        },
                        taeter: "stamm/wasser-hydro.js `_pegelZustand` (der Abfluss liest keine Brandfläche) · stamm/kreatur-leben.js `_kreaturNahrung` (die Äsung sinkt, kein Tier flieht)",
                        leser: "stamm/wasser-hydro.js:231 `_pegelZustand` — liest Regen-Stempel und Regen-Mittel, keine verbrannte Fläche; stamm/kreatur-leben.js:2169 `_kreaturNahrung` — die Äsung trägt den Brand, das Tier flieht nicht",
                        gruen: { werte: { tierdichteSofortProzent: -62, rueckkehrJahre: 5, pegelSpitzeFaktor: 1.45 }, zeuge: mit(BRAND_Z, { aesung: [0.6, 0.23], fluss: [0.4, 0.58] }) },
                        attrappen: [
                            { name: "−62 % bei gleicher Äsung", roh: { werte: { tierdichteSofortProzent: -62, rueckkehrJahre: 5, pegelSpitzeFaktor: 1.45 }, zeuge: mit(BRAND_Z, { aesung: [0.6, 0.6], fluss: [0.4, 0.58] }) } },
                            { name: "Pegel 1,45× bei gleichem Wasser", roh: { werte: { tierdichteSofortProzent: -62, rueckkehrJahre: 5, pegelSpitzeFaktor: 1.45 }, zeuge: mit(BRAND_Z, { aesung: [0.6, 0.23], fluss: [0.4, 0.4] }) } },
                        ],
                    },
                    4: {
                        u: { vei: 5, bewohner: 1e5, jahre: 100 },
                        soll: [
                            K.soll(ST, 4, "VEI 5 nahe Stadt", { key: "vei", rel: "≥" }),
                            K.soll(ST, 4, "Bevölkerung −20 % binnen 5 a", { key: "bevoelkerungProzent", rel: "≤", zahl: -20, einheit: "%" }),
                            K.soll(ST, 4, "Kornpreis ×2", { key: "kornpreisFaktor", rel: "≥", einheit: "×" }),
                            K.soll(ST, 4, "Wiederaufbau im Bildpaar nach 50 a", { key: "bildpaarJahre", rel: "≥", einheit: "a" }),
                        ],
// ZAHL (auge-klasse.cjs): die Zahl urteilt, das Bild ist Beleg — der Zeuge verlangt die Welt hinter der Zahl
                        zeuge: (roh) => { const z = roh.zeuge || {}; if (!(typeof z.staedte === "number" && z.staedte >= 1)) return "keine Stadt nahe dem Ausbruch (staedte " + (z.staedte === undefined ? "fehlt" : z.staedte) + ", Soll ≥ 1)"; return null; },
                        auge: { pose: "die Stadt am Ausbruch vor ↔ 50 a danach (heute keine Stadt: geschossen an der Wiese)", vorbild: "Prüfer-Satz R11: Wiederaufbau nach VEI 5 (Pinatubo 1991 / Angeles City)" },
                        taeter: "stamm/siedlung-ort.js `_staedte` (keine Stadt) · stamm/feld-leben.js `_lavaGiessen` (der Ausbruch ist eine Zelle)",
                        nicht: "keine Stadt, kein VEI 5, kein Kornpreis",
                        leser: "stamm/siedlung-ort.js:1472 `_staedte` — leer in der Welt, kein Markt; stamm/feld-leben.js:2510 `_lavaGiessen` — die Lava schreibt EINE Zelle",
                        gruen: { werte: { vei: 5, bevoelkerungProzent: -24, kornpreisFaktor: 2.3, bildpaarJahre: 50 }, zeuge: { staedte: 3 } },
                        attrappen: [{ name: "−24 % ohne Stadt", roh: { werte: { vei: 5, bevoelkerungProzent: -24, kornpreisFaktor: 2.3, bildpaarJahre: 50 }, zeuge: { staedte: 0 } } }],
                    },
                    5: {
                        u: { saat: "tsunami", bewohner: 1e7, jahre: 1000 },
                        soll: [K.soll(ST, 5, "verlegt neu entstehende Häfen ≥ 50 %", { key: "haefenVerlegtProzent", einheit: "%" })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.tsunamis >= 1)) return "kein Tsunami in der Welt";
                            if (!(z.haefen >= 2)) return "nur " + (z.haefen || 0) + " Häfen (ein verlegter Hafen braucht ≥ 2)";
                            return null;
                        },
                        taeter: "voxel-worker.js planetOrtAuftrag (kein Tsunami) · stamm/siedlung-ort.js `_staedte` (kein Hafen entsteht)",
                        nicht: "kein Tsunami, kein Hafen, der neu entsteht",
                        leser: "voxel-worker.js:1446 planetOrtAuftrag — kein Tsunami in der Antwort; stamm/siedlung-ort.js:1472 `_staedte` — keine Stadt, die einen Hafen gründet",
                        unklar: "„Straßennetz-Diff“ trägt keine Zahl — Vorschlag: ≥ 20 % der Wegkanten nach der Tsunami-Saat verlegt (gegen die Kontroll-Saat ≥ 2σ).",
                        gruen: { werte: { haefenVerlegtProzent: 62 }, zeuge: { tsunamis: 4, haefen: 9 } },
                        attrappen: [{ name: "62 % ohne Tsunami in der Welt", roh: { werte: { haefenVerlegtProzent: 62 }, zeuge: { tsunamis: 0, haefen: 9 } } }],
                    },
                    6: {
                        u: { saaten: 100, jahre: 10000 },
                        soll: [K.soll(ST, 6, "100 Saaten", { key: "saaten", rel: "≥" }), K.soll(ST, 6, "r ≥ 0,6", { key: "rGefahrBauten" })],
// ZAHL (auge-klasse.cjs): die Zahl urteilt, das Bild ist Beleg — der Zeuge verlangt die Welt hinter der Zahl
                        zeuge: (roh) => { const z = roh.zeuge || {}; if (!(typeof z.antworten === "number" && z.antworten >= 100)) return "zu wenige Saaten des Fadens (antworten " + (z.antworten === undefined ? "fehlt" : z.antworten) + ", Soll ≥ 100)"; if (!(typeof z.gefahr === "number" && z.gefahr >= 1)) return "die Saaten tragen keine Gefahr (gefahr " + (z.gefahr === undefined ? "fehlt" : z.gefahr) + ", Soll ≥ 1)"; return null; },
                        auge: { pose: "Siedlung an der Gefahr je Saat (heute keine Gefahr-Saat: geschossen an der Wiese)", vorbild: "Prüfer-Satz R11: Anteil angepasster Bauten im Bild (Pfahlbau, Erdbebenbau)" },
                        taeter: "voxel-worker.js planetOrtAuftrag (keine Gefahr je Saat) · stamm/siedlung-ort.js `_staedte` (keine angepasste Bauweise)",
                        nicht: "keine Gefahr-Rate, keine angepasste Bauweise",
                        leser: "voxel-worker.js:1446 planetOrtAuftrag — keine Gefahr in der Antwort je Saat",
                        gruen: { werte: { saaten: 100, rGefahrBauten: 0.66 }, zeuge: { antworten: 100, gefahr: 2 } },
                        attrappen: [{ name: "r 0,66 ohne Gefahr an den Saaten", roh: { werte: { saaten: 100, rGefahrBauten: 0.66 }, zeuge: { antworten: 100, gefahr: 0 } } }],
                    },
                    7: {
                        u: { wurzel: "samen gekippt", zeitMa: 1, glieder: 10 },
                        soll: [
                            K.soll(ST, 7, "10/10 Glieder am selben Ort geändert", { key: "gliederGeaendert", rel: "≥", zahl: 10 }),
                            K.soll(ST, 7, "Arten-Verlust 50–80 %", { key: "artenVerlustProzent", einheit: "%" }),
                            K.soll(ST, 7, "Erholung in 5–10 Mio. a", { key: "erholungMioA", einheit: "Mio. a" }),
                        ],
// ZAHL (auge-klasse.cjs): die Zahl urteilt, das Bild ist Beleg — der Zeuge verlangt die Welt hinter der Zahl
                        zeuge: (roh) => { const z = roh.zeuge || {}; if (!(z.geaendert >= 10)) return "keine 10 Glieder am selben Ort geändert (" + (z.geaendert || 0) + ")"; if (z.gegen !== 0) return "der Gegenlauf mit demselben Samen ändert " + z.gegen + " Glieder (Rauschen, keine Mutation)"; return null; },
                        auge: { pose: "Weltkarte vor ↔ nach der Mutation (heute keine Weltkarten-Pose: geschossen an der Wiese)", vorbild: "Prüfer-Satz R11: Bildpaar Weltkarte, 10 Glieder am selben Ort" },
                        taeter: "voxel-worker.js planetOrtAuftrag (keine Städte, keine Sprachen, kein Einschlag in der Antwort)",
                        nicht: "keine Städte und Sprachen im Faden, kein Einschlag",
                        leser: "voxel-worker.js:1446 planetOrtAuftrag — nimmt samen, breite, laenge, zeitMa; keine Zivilisation, kein Einschlag, kein Bestand der Arten",
                        gruen: { werte: { gliederGeaendert: 10, artenVerlustProzent: 64, erholungMioA: 7 }, zeuge: { geaendert: 10, gegen: 0 } },
                        attrappen: [{ name: "10/10 bei demselben Samen (kein Gegenlauf)", roh: { werte: { gliederGeaendert: 10, artenVerlustProzent: 64, erholungMioA: 7 }, zeuge: { geaendert: 10, gegen: 10 } } }],
                    },
                },
            },
        },
    };
})());

// ── DAS STÜCK zusammenspiel.same · kaskade (S2–S7; S1 trägt g1.js BRAND_SITZUNG) + kohaerenz (S1–S7). Gemessen in der warmen Welt
// der Sitzung um den Spieler. KASKADE: die Kette Regen → Nässe → Stoff → Brand → Licht am Herd über die Wege des Spiels
// (`__wetterSetzen`, `_naesseTakt`, `_brandFeuchte`, `_tickBrand`, `_leuchtQuellen`), je Glied die Festhalte-Probe (der Vorgänger
// gehalten als eigene Methode der Instanz, danach gelöscht) und der Gegenlauf ohne Regen; der Ausbruch über `lava` auf einer Zelle
// ohne Bett (Glut, Asche-Fall, Bauten, Pegel der Flusspunkte, lebendig im Ring — je zweimal ohne Guss gelesen); die Fremd-Planeten
// über den Planet-Faden an den Saaten „same-saat-i“ (dieselben wie aufwaerts). KOHÄRENZ: die Flüsse der Hydrosphäre
// (`_hydroFor`) gegen das Relief (`_voxelSurfaceY`), der Gegenlauf derselbe Lauf rückwärts; die Pflanzen-Dichte (`auraAt`) quer
// zum Fluss gegen dieselben Schnitte an Orten fern jedes Flusses; die Orte der Welt (`_autoSettlementCellInfo`) am Fluss gegen
// Zufallsorte derselben Fläche, ihre Größen als Zipf-Gerade; die Planeten-Saaten über den Faden. Jede Tat wird zurückgenommen.
L.perspektive("same", (() => {
    const KA = "same.kopplung.kaskade";
    const KO = "same.kopplung.kohaerenz";

    // der Zeuge der Kette: ein Herd fing, alle sechs Phasen gelesen, der Gegenlauf ohne Regen löscht nichts
    const zeugeKette = (roh) => {
        const z = roh.zeuge || {};
        if (z.fehler) return "keine Kette: " + z.fehler;
        if (z.entfacht !== true) return "der Herd fing nicht (kein Brand in der Welt)";
        if (!(z.phasen >= 6)) return "nur " + (z.phasen || 0) + " von 6 Phasen gelesen (Festhalte-Probe je Glied fehlt)";
        if (!(z.brandA >= 1 && z.lichtA >= 1)) return "vor dem Regen brennt keine Zelle mit Licht (" + z.brandA + " Zellen, " + z.lichtA + " Lichter)";
        if (!(z.gegenBrand >= 1 && z.gegenLicht >= 1 && z.gegenNaesse === 0)) return "der Gegenlauf ohne Regen löscht oder nässt auch (Brand " + z.gegenBrand + ", Licht " + z.gegenLicht + ", Nässe " + z.gegenNaesse + ")";
        if (z.bild !== true) return "kein Bildpaar der Kette (" + (z.bildGrund || "nicht geschossen") + ")";
        if (!(z.bildKette > z.bildGegen)) return "das Bild ändert sich im Gegenlauf so stark wie in der Kette (" + z.bildGegen + " ≥ " + z.bildKette + ")";
        return null;
    };
    const KETTE_Z = { entfacht: true, phasen: 6, brandA: 4, lichtA: 4, gegenBrand: 5, gegenLicht: 5, gegenNaesse: 0, bild: true, bildKette: 0.31, bildGegen: 0.02 };
    // der Zeuge des Ausbruchs: Glut in der Welt, die Ringe zweimal ohne Guss gleich gelesen
    const zeugeAusbruch = (roh) => {
        const z = roh.zeuge || {};
        if (z.fehler) return "kein Guss: " + z.fehler;
        if (!(z.glut > 0 && z.taten >= 1)) return "die Lava glüht nicht (kein Ausbruch in der Welt)";
        if (z.gegen !== 0) return "der Gegenlauf ohne Guss ändert " + z.gegen + " Glieder (Rauschen, keine Kette)";
        return null;
    };
    const AUS_Z = { glut: 1, taten: 1, gegen: 0 };
    // der Zeuge des Planet-Fadens: N Saaten mit Streuung
    const zeugeFaden = (min) => (roh) => {
        const z = roh.zeuge || {};
        if (!(z.saaten >= min)) return "nur " + (z.saaten || 0) + " Saaten des Planet-Fadens (Soll ≥ " + min + ")";
        if (!(z.streuungM > 0)) return "die Saaten tragen keine Streuung der Höhe (eine Konstante, nicht der Faden)";
        return null;
    };
    const FADEN_Z = { saaten: 100, streuungM: 2400 };
    // der Zeuge der Orte: genug Orte der Welt, ihr Anteil am Wasser über dem der Zufallsorte (R7)
    const zeugeOrte = (roh) => {
        const z = roh.zeuge || {};
        if (!(z.orte >= 10)) return "nur " + (z.orte || 0) + " Orte der Welt gemessen (Soll 10)";
        if (!(z.zufall >= 10)) return "kein Gegenlauf an Zufallsorten";
        if (!(z.anteilOrte > z.anteilZufall)) return "die Orte stehen nicht öfter am Wasser als Zufallsorte (" + z.anteilOrte + " ≤ " + z.anteilZufall + " %) — keine Ursache";
        return null;
    };
    const ORTE_Z = { orte: 40, zufall: 40, anteilOrte: 78, anteilZufall: 31 };

    return {
        leitern: {
            // ════════ same.kopplung.kaskade — die Kette der Stoff-Physik im Ereignis-Fenster ════════
            [KA]: {
                sek: 55,
                mutiert: true,
                pfad: ["stamm/feld-brand.js", "stamm/feld-leben.js", "stamm/bild-himmel.js", "stamm/dirigent-kern.js", "stamm/wasser-hydro.js", "stamm/vegetation-baum.js", "stamm/siedlung-wege.js", "voxel-worker.js", "planet-core.js", "scripts/lib/ausgabe-aufnahme.cjs", "scripts/werkbank.cjs"],
                ungefahren: "das Bildpaar der Kette (S2) schießt nur das Gerät (`__ausgabeAufnahme` am Herd); headless zählt die Kette ihre Glieder an den Lesern der Welt",
                mess: async function (H, U, M) {
                    const S = (fn, a) => H.seite("return await (" + String(fn) + ")(r, " + JSON.stringify(a || {}) + ");");
                    // DIE KETTE am Herd: sechs Phasen je n Schritte der Welt-Uhr (BRAND.schrittS) — A trocken brennend · B Regen gehalten
                    // (Gegenlauf) · C Nässe gehalten im Regen · D Stoff gehalten · E Brand gehalten · F frei bis erloschen
                    const kette = async (r, a) => {
                        const st = r.state;
                        const C = AnazhRealm;
                        const B = C.BRAND;
                        const cs = C.LIFE_FIELD.cell;
                        const pm = st.playerMesh.position;
                        const r3 = (v) => (Number.isFinite(v) ? Math.round(v * 1e3) / 1e3 : null);
                        const xz = (cx, cz) => [(cx + 0.5) * cs, (cz + 0.5) * cs];
                        const HALT = ["_naesseTakt", "_brandFeuchte", "_tickBrand", "_feldFolgeSteht"];
                        const eigen = HALT.filter((k) => Object.prototype.hasOwnProperty.call(r, k));
                        if (eigen.length) return { fehler: "die Welt trägt schon eigene " + eigen.join(", ") };
                        if ((st.brandFeld && st.brandFeld.size) || r._brandRest) return { fehler: "es brennt schon in der Welt" };
                        const [mx, mz] = [Math.floor(pm.x / cs), Math.floor(pm.z / cs)];
                        let herd = null;
                        let f0 = null;
                        for (let d = 2; d <= 8 && !herd; d++)
                            for (let i = -d; i <= d && !herd; i++)
                                for (const [cx, cz] of [[mx + i, mz - d], [mx + i, mz + d], [mx - d, mz + i], [mx + d, mz + i]]) {
                                    const f = r._brandStoff(cx, cz);
                                    if (f && f.zeile.name === "gras" && (f.anteil == null || f.anteil >= 0.99) && r._brandFeuchte(f.boden) < f.zeile.brenn.mx && !r._nassAt(...xz(cx, cz))) {
                                        herd = [cx, cz];
                                        f0 = f;
                                        break;
                                    }
                                }
                        if (!herd) return { fehler: "keine trockene Gras-Zelle mit vollem Bett 2–8 Zellen um den Spieler" };
                        const [hx, hz] = xz(...herd);
                        const hy = r._voxelSurfaceY(hx, hz);
                        const Ua = r._ensureAtmoUniforms();
                        let t = performance.now();
                        const takt = () => r._gameLoopTick((t += 1000 / 60));
                        const schritt = (n) => {
                            for (let k = 0; k < n; k++) {
                                st.spielZeit = (Number(st.spielZeit) || 0) + B.schrittS;
                                takt();
                            }
                        };
                        const brennt = () => [...(st.brandFeld || new Map()).values()].filter((z) => z.t0 !== null).length;
                        const licht = () => r._leuchtQuellen(hx, hy + 1.5, hz, 80).filter((q) => q.quelle === "brand").length;
                        const lies = () => ({ regen: r3((C.WEATHER_FIELD[st.weather] || {}).rain), naesse: r3(st.naesse), stoff: r3(r._brandFeuchte(f0.boden)), brand: brennt(), licht: licht() });
                        const W = 960;
                        const Hh = 540;
                        const cam = st.camera;
                        const kam = [hx + 18, hy + 12, hz + 10];
                        const bild = async () => {
                            if (!a.bild) return null;
                            cam.position.set(kam[0], kam[1], kam[2]);
                            cam.lookAt(hx, hy, hz);
                            cam.updateMatrixWorld(true);
                            return (await window.__ausgabeAufnahme(W, Hh)).u8;
                        };
                        const diff = (p, q) => {
                            if (!p || !q) return null;
                            let n = 0;
                            for (let i = 0; i < W * Hh; i++) if (Math.abs(p[4 * i] - q[4 * i]) + Math.abs(p[4 * i + 1] - q[4 * i + 1]) + Math.abs(p[4 * i + 2] - q[4 * i + 2]) > 24) n++;
                            return r3(n / (W * Hh));
                        };
                        const L0 = (st.worldMeta.taten ||= []);
                        const n0 = L0.length;
                        const wm = st.worldMeta;
                        const klon = (v) => {
                            try {
                                return v === undefined ? undefined : structuredClone(v);
                            } catch (_e) {
                                return v;
                            }
                        };
                        const vor = { wetter: st.weather, wet: st.weatherEffectTime, wort: klon(st.wetterWort), naesse: st.naesse, naesseUhr: r._naesseUhr, spiel: st.spielZeit, tod: st.timeOfDay, regler: st.perfRegulator, uN: Ua.naesse.value, uR: Ua.regen.value, nassTage: wm.nassTage, stempel: klon(st.regenStempel), pegel: klon(st.pegelZustand), pegelRegen: klon(st.pegelRegen), wt: klon(st.weatherTransition) };
                        const aus = { herd: [hx, hz].map(Math.round), zelle: cs, ph: {}, bilder: {} };
                        const P = aus.ph;
                        try {
                            st.perfRegulator = false;
                            if (window.__wetterSetzen("sunny") !== "sunny") throw new Error("das Wetter der Probe gilt nicht: sunny (es gilt " + st.weather + ")");
                            r._naesseTakt(1e6);
                            r._naesseUhr = st.spielZeit;
                            r._feldFolgeSteht = () => true;
                            aus.entfacht = !!r._brandEntfachen(hx, hz);
                            delete r._feldFolgeSteht;
                            schritt(a.start);
                            P.A = lies();
                            const bA = await bild();
                            schritt(a.schritte);
                            P.B = lies();
                            const bB = await bild();
                            const nH = st.naesse;
                            r._naesseTakt = () => (st.naesse = nH);
                            if (window.__wetterSetzen("rainy") !== "rainy") throw new Error("das Wetter der Probe gilt nicht: rainy (es gilt " + st.weather + ")");
                            schritt(a.schritte);
                            P.C = lies();
                            delete r._naesseTakt;
                            r._naesseUhr = st.spielZeit;
                            const sH = r._brandFeuchte(f0.boden);
                            r._brandFeuchte = () => sH;
                            schritt(a.schritte);
                            P.D = lies();
                            delete r._brandFeuchte;
                            r._tickBrand = () => {};
                            schritt(a.schritte);
                            P.E = lies();
                            delete r._tickBrand;
                            let n = 0;
                            for (; n < a.loeschMax && brennt() > 0; n++) schritt(1);
                            schritt(3);
                            P.F = lies();
                            aus.loeschS = n * B.schrittS;
                            const bF = await bild();
                            aus.bildKette = diff(bA, bF);
                            aus.bildGegen = diff(bA, bB);
                        } finally {
                            for (const k of HALT) if (Object.prototype.hasOwnProperty.call(r, k)) delete r[k];
                            if (r._brandRest) r._brandArbeit(Infinity);
                            const asche = L0.slice(n0).filter((x) => x.tat === "brand");
                            aus.aschen = asche.length;
                            if (st.brandFeld) st.brandFeld.clear();
                            L0.length = n0;
                            r._tatGen = (r._tatGen | 0) + 1;
                            r._brandBett = null;
                            for (const s of st.wegeKarte ? st.wegeKarte.stufen : []) if (s.zentriert) r._ascheStufeMalen(s);
                            for (const x of asche) if (Number.isFinite(x.x) && Number.isFinite(x.z)) r._waldNachwuchs(x.x - cs, x.z - cs, x.x + cs, x.z + cs);
                            window.__wetterSetzen(vor.wetter);
                            st.weatherEffectTime = vor.wet;
                            if (vor.wort === undefined) delete st.wetterWort;
                            else st.wetterWort = vor.wort;
                            st.spielZeit = vor.spiel;
                            st.naesse = vor.naesse;
                            r._naesseUhr = vor.naesseUhr;
                            Ua.naesse.value = vor.uN;
                            Ua.regen.value = vor.uR;
                            if (vor.nassTage === undefined) delete wm.nassTage;
                            else wm.nassTage = vor.nassTage;
                            for (const [k, v] of [["regenStempel", vor.stempel], ["pegelZustand", vor.pegel], ["pegelRegen", vor.pegelRegen], ["weatherTransition", vor.wt]]) {
                                if (v === undefined) delete st[k];
                                else st[k] = v;
                            }
                            r.setTimeOfDay(vor.tod, "regler");
                            st.perfRegulator = vor.regler;
                        }
                        return aus;
                    };
                    // DER AUSBRUCH: `lava` auf einer Zelle ohne Bett im 3×3 (sie zündet nichts) 20–120 m um den Spieler; die sechs Glieder
                    // an ihren Lesern vor (zweimal, der Gegenlauf) ↔ nach dem Guss
                    const ausbruch = async (r, a) => {
                        const st = r.state;
                        const C = AnazhRealm;
                        const cs = C.LIFE_FIELD.cell;
                        const pm = st.playerMesh.position;
                        const r3 = (v) => (Number.isFinite(v) ? Math.round(v * 1e3) / 1e3 : null);
                        const frei = (x, z, R) => r._landAt(x, z, 0.2) && !r._nassAt(x, z) && !r._blockerUmPlatz(x, z, R, []).length;
                        let Q = null;
                        for (let d = 20; d <= 120 && !Q; d += 10)
                            for (let k = 0; k < 12 && !Q; k++) {
                                const x = pm.x + d * Math.cos((k * Math.PI) / 6);
                                const z = pm.z + d * Math.sin((k * Math.PI) / 6);
                                const [cx, cz] = [Math.floor(x / cs), Math.floor(z / cs)];
                                let bett = false;
                                for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) bett = bett || !!r._brandStoff(cx + i, cz + j);
                                if (!bett && frei(x, z, 4)) Q = { x, z, y: r._voxelSurfaceY(x, z) };
                            }
                        if (!Q) return { fehler: "keine Zelle ohne Bett 20–120 m um den Spieler" };
                        const ring = a.radienM.map((m, k) => [Q.x + m * Math.cos(k * 2.39996), Q.z + m * Math.sin(k * 2.39996)]);
                        const flussP = (r._hydroFor(Q.x, Q.z).rivers || []).flatMap((v) => v.points).sort((p, q) => Math.hypot(p.x - Q.x, p.z - Q.z) - Math.hypot(q.x - Q.x, q.z - Q.z)).slice(0, 8);
                        const lies = () => ({
                            ausbruch: r3((r._lavaAt(Q.x, Q.z) || { glut: 0 }).glut || 0),
                            asche: r3(Math.max(0, ...ring.map(([x, z]) => r._ascheAt(x, z) || 0))),
                            dach: null,
                            einsturz: st.architectures.filter((e) => e.position && Math.hypot(e.position.x - Q.x, e.position.z - Q.z) <= 400).length,
                            lahar: r3(flussP.reduce((s, p) => { const b = r._voxelSurfaceY(p.x, p.z); return s + Math.max(0, (r._atlasWaterLevelAt(p.x, p.z, b) || b) - b); }, 0)),
                            ernte: r3(ring.reduce((s, [x, z]) => s + r.auraAt(x, z).lebendig, 0) / ring.length),
                        });
                        const glieder = ["ausbruch", "asche", "dach", "einsturz", "lahar", "ernte"];
                        const anders = (p, q) => glieder.filter((g) => p[g] !== null && p[g] !== q[g]);
                        const L0 = (st.worldMeta.taten ||= []);
                        const n0 = L0.length;
                        const bf0 = new Set((st.brandFeld || new Map()).keys());
                        const halt = st.weatherEffectTime;
                        const v0 = lies();
                        const v1 = lies();
                        const aus = { ort: [Q.x, Q.z].map(Math.round), vor: v0, gegen: anders(v0, v1).length, flussP: flussP.length };
                        st.weatherEffectTime = 0;
                        try {
                            r.dslRun(["lava", Q.x, Q.y, Q.z], { source: "human" });
                            st.weatherEffectTime = halt;
                            aus.taten = L0.length - n0;
                            aus.nach = lies();
                            aus.glieder = anders(v0, aus.nach);
                        } finally {
                            st.weatherEffectTime = halt;
                            L0.length = n0;
                            for (const k of [...(st.brandFeld || new Map()).keys()]) if (!bf0.has(k)) st.brandFeld.delete(k);
                            r._tatGen = (r._tatGen | 0) + 1;
                            r._lavaTaktT = -Infinity;
                            for (const s of st.wegeKarte ? st.wegeKarte.stufen : []) if (s.zentriert) r._lavaStufeMalen(s);
                        }
                        return aus;
                    };
                    // DIE FREMD-PLANETEN: der Planet-Faden an den Saaten „same-saat-i“ (die Breite des Ankers der Welt), unter einem Deckel
                    // in ms — trägt seine Antwort ein Ereignis, eine Kette?
                    const fremd = async (r, a) => {
                        await r._fadenQuelle();
                        const an = await r._planetAnker();
                        const [Bg, Lg] = [(an.breite * 180) / Math.PI, (an.laenge * 180) / Math.PI];
                        const t0 = performance.now();
                        const H0 = [];
                        let kette = 0;
                        let felder = [];
                        for (let i = 0; i < a.saaten && performance.now() - t0 < a.deckelMs; i += 10) {
                            const o = await Promise.all(Array.from({ length: Math.min(10, a.saaten - i) }, (_, k) => r._planetAuftrag({ type: "planet-ort", samen: "same-saat-" + (i + k), breite: Bg, laenge: Lg, zeitMa: 0 })));
                            for (const x of o) {
                                const f = Object.keys(x).concat(Object.keys(x.delta || {}));
                                felder = f;
                                H0.push(x.hoeheM);
                                if (f.some((k) => /kette|ereignis|ausbruch|beben|flut|lahar|brand|einsturz/i.test(k))) kette++;
                            }
                        }
                        const m = H0.reduce((s, v) => s + v, 0) / Math.max(1, H0.length);
                        return { n: H0.length, kette, felder, streuungM: Math.round(Math.sqrt(H0.reduce((s, v) => s + (v - m) * (v - m), 0) / Math.max(1, H0.length))), ms: Math.round(performance.now() - t0) };
                    };
                    const k = await S(kette, { start: 20, schritte: 10, loeschMax: 90, bild: !M.swift });
                    const v = await S(ausbruch, { radienM: [32, 48, 64, 96, 128, 160, 200, 240, 280, 320, 360, 400] });
                    const f = await S(fremd, { saaten: U[7].planeten, deckelMs: Math.max(2000, (48 - M.uhr()) * 1000) });
                    const P = k.ph || {};
                    const geht = (x, y, g) => !!(x && y) && x[g] !== y[g];
                    const steht = (x, y, g) => !!(x && y) && x[g] === y[g];
                    const lebt = (x, g) => !!x && x[g] >= 1;
                    const je = {
                        naesse: geht(P.A, P.F, "naesse") && steht(P.A, P.B, "naesse"),
                        stoff: geht(P.A, P.F, "stoff") && steht(P.A, P.C, "stoff"),
                        brand: lebt(P.A, "brand") && P.F && P.F.brand === 0 && lebt(P.D, "brand"),
                        licht: lebt(P.A, "licht") && P.F && P.F.licht === 0 && lebt(P.E, "licht"),
                    };
                    const glieder = k.fehler ? undefined : Object.values(je).filter(Boolean).length;
                    const zk = { fehler: k.fehler, entfacht: k.entfacht, phasen: ["A", "B", "C", "D", "E", "F"].filter((n) => P[n]).length, brandA: P.A && P.A.brand, lichtA: P.A && P.A.licht, gegenBrand: P.B && P.B.brand, gegenLicht: P.B && P.B.licht, gegenNaesse: P.A && P.B ? (P.B.naesse !== P.A.naesse ? 1 : 0) : null, bild: k.bildKette != null, bildGrund: M.swift ? "swiftshader: kein Bild ohne Gerät (ungefahren am Gerät)" : null, bildKette: k.bildKette, bildGegen: k.bildGegen, je, ph: P, loeschS: k.loeschS, aschen: k.aschen, herd: k.herd };
                    const vg = v.glieder || [];
                    const za = { fehler: v.fehler, glut: v.nach && v.nach.ausbruch, taten: v.taten, gegen: v.gegen, glieder: vg, vor: v.vor, nach: v.nach };
                    const bruch = "die Welt kennt kein Beben und keinen Bruch: die Feld-Akte tragen leben · brand · aus · annahme, die Lava ist EIN Guss auf EINE Zelle";
                    return {
                        sprossen: {
                            2: { werte: { glieder }, zeuge: zk },
                            3: { werte: { anteilProzent: undefined, gliederAusbruch: vg.length }, zeuge: za, nicht: "kein Damm, kein Bruch, keine Trümmer im Fluid: " + bruch + "; das Wasser bricht nur aus einem Graben (`_flutSaat`), 20 Saaten trägt die Welt nicht (EINE Saat)" },
                            4: { werte: { kettenProzent: undefined, gliederBrand: glieder }, zeuge: zk, nicht: "kein Beben, kein Einsturz nach Lastpfad: " + bruch + "; von Beben → Bruch → Brand läuft nur der Brand (" + (glieder == null ? "?" : glieder) + " Glieder der Regen-Kette)" },
                            5: { werte: { kettenProzent: undefined, wellenVerh: undefined }, zeuge: za, nicht: "keine Küstenstadt, kein Beben, keine Welle: " + bruch + "; r._staedte() trägt keine Stadt" },
                            6: { werte: { gliederImBild: vg.length }, zeuge: za, nicht: "ein Ausbruch, 20 Vulkan-Saaten nicht: die Welt trägt EINE Saat, die Lava schreibt nur ihre Zelle — Glieder vor ↔ nach dem Guss: " + (vg.join(", ") || "keins") + " (Asche-Fall, Dachlast, Einsturz, Lahar ohne Leser)" },
                            7: { werte: { anteilProzent: f.n ? (100 * f.kette) / f.n : undefined }, zeuge: { saaten: f.n, streuungM: f.streuungM, ms: f.ms }, nicht: "keine Kette auf Fremd-Planeten: " + f.kette + " von " + f.n + " Saaten tragen ein Ereignis — planet-ort antwortet " + (f.felder || []).join(", ") + (f.n < U[7].planeten ? " (nur " + f.n + " von " + U[7].planeten + " Saaten im Deckel)" : "") },
                        },
                    };
                },
                sprossen: {
                    2: {
                        u: { glieder: ["regen", "naesse", "stoff", "brand", "licht"], schritteJePhase: 10, start: 20 },
                        soll: [K.soll(KA, 2, "Glieder, deren Bild sich ändert und beim Festhalten des Vorgängers stehen bleibt, ≥ 4", { key: "glieder" })],
                        zeuge: zeugeKette,
                        taeter: "stamm/feld-brand.js `_brandFeuchte` / `_tickBrand` · stamm/bild-himmel.js `_naesseTakt` (ein Glied liest seinen Vorgänger nicht)",
                        unklar: "„deren Bild sich ändert“ nennt kein Bildmaß je Glied — Vorschlag: je Glied der Ausschnitt seines Lesers im Bild (Regen-Schleier, Boden-Luma der Nässe, Flammen-Emission, Licht-Luma um den Herd) mit ≥ 5 % geänderter Pixel, im Festhalten < 1 %.",
                        gruen: { werte: { glieder: 4 }, zeuge: KETTE_Z },
                        attrappen: [
                            { name: "vier Glieder ohne Herd (kein Brand in der Welt)", roh: { werte: { glieder: 4 }, zeuge: Object.assign({}, KETTE_Z, { entfacht: false }) } },
                            { name: "der Brand erlischt auch ohne Regen (der Gegenlauf zeigt dasselbe)", roh: { werte: { glieder: 4 }, zeuge: Object.assign({}, KETTE_Z, { gegenBrand: 0, gegenLicht: 0 }) } },
                            { name: "vier Glieder ohne Festhalte-Probe (nur zwei Phasen gelesen)", roh: { werte: { glieder: 4 }, zeuge: Object.assign({}, KETTE_Z, { phasen: 2 }) } },
                            { name: "vier Glieder ohne Bildpaar", roh: { werte: { glieder: 4 }, zeuge: Object.assign({}, KETTE_Z, { bild: false }) } },
                        ],
                    },
                    3: {
                        u: { glieder: ["bruch", "koerper", "fluid"], volumenM3: 1000, saaten: 20 },
                        soll: [K.soll(KA, 3, "Anteil, in dem jedes Glied im Bild eintritt ≥ 90 %", { key: "anteilProzent", einheit: "%" })],
                        zeuge: zeugeAusbruch,
                        taeter: "stamm/feld-leben.js `_feldAkt` (kein Bruch-Akt) · stamm/wasser-zellen.js `_flutSaat` (kein Damm, keine Trümmer)",
                        nicht: "kein Damm, kein Bruch, keine Trümmer",
                        leser: "stamm/wasser-zellen.js:102 `_flutSaat` — das Wasser flutet nur einen Graben, kein Damm bricht, kein Körper schwimmt; stamm/feld-leben.js:2317 `akt.art` kennt keinen Bruch",
                        gruen: { werte: { anteilProzent: 95 }, zeuge: AUS_Z },
                        attrappen: [{ name: "95 % ohne Ereignis in der Welt", roh: { werte: { anteilProzent: 95 }, zeuge: Object.assign({}, AUS_Z, { glut: 0, taten: 0 }) } }],
                    },
                    4: {
                        u: { glieder: ["beben", "bruch", "brand"], flaeche: "viertel", saaten: 20 },
                        soll: [K.soll(KA, 4, "vollständige Ketten ≥ 80 %", { key: "kettenProzent", einheit: "%" })],
                        zeuge: zeugeKette,
                        taeter: "stamm/feld-leben.js `_feldAkt` (kein Beben, kein Einsturz nach Lastpfad)",
                        nicht: "kein Beben, kein Einsturz",
                        leser: "stamm/feld-leben.js:2317 `akt.art` — die Feld-Akte kennen leben · brand · aus · annahme, kein Beben, keinen Bruch",
                        gruen: { werte: { kettenProzent: 85 }, zeuge: KETTE_Z },
                        attrappen: [{ name: "85 % ohne Festhalte-Probe je Glied", roh: { werte: { kettenProzent: 85 }, zeuge: Object.assign({}, KETTE_Z, { phasen: 1 }) } }],
                    },
                    5: {
                        u: { glieder: ["beben", "bruch", "brand", "flut"], ort: "kuestenstadt", saaten: 20 },
                        soll: [
                            K.soll(KA, 5, "vollständige Ketten ≥ 70 %", { key: "kettenProzent", einheit: "%" }),
                            K.soll(KA, 5, "Wellen-Ankunft ±10 % gegen √(g·h)", { key: "wellenVerh", ref: 1, refQuelle: "Flachwasser-Welle c = √(g·h) (Lagrange 1781; Laufzeiten der Tsunami-Warnzentren NOAA): gemessene ÷ berechnete Ankunft = 1" }),
                        ],
                        zeuge: zeugeAusbruch,
                        taeter: "stamm/feld-leben.js `_feldAkt` (kein Beben) · stamm/siedlung-ort.js `_staedte` (keine Küstenstadt)",
                        nicht: "keine Küstenstadt, kein Beben, keine Welle",
                        leser: "stamm/siedlung-ort.js:1472 `_staedte` — leer in der Welt; stamm/feld-leben.js:2317 `akt.art` ohne Beben und Welle",
                        gruen: { werte: { kettenProzent: 75, wellenVerh: 1.04 }, zeuge: AUS_Z },
                        attrappen: [{ name: "75 % und 1,04 ohne Ereignis", roh: { werte: { kettenProzent: 75, wellenVerh: 1.04 }, zeuge: Object.assign({}, AUS_Z, { gegen: 3 }) } }],
                    },
                    6: {
                        u: { glieder: ["ausbruch", "asche", "dachlast", "einsturz", "lahar", "ernte"], ringM: [32, 400], saaten: 20 },
                        soll: [K.soll(KA, 6, "≥ 5 von 6 Gliedern im Bild", { key: "gliederImBild" })],
                        zeuge: zeugeAusbruch,
                        taeter: "stamm/feld-leben.js `_lavaGiessen` (die Lava schreibt nur ihre Zelle) · stamm/feld-brand.js `_ascheAt` (Asche nur aus dem Brand)",
                        nicht: "ein Ausbruch, keine Region, keine 20 Vulkan-Saaten",
                        leser: "stamm/feld-leben.js:2510 `_lavaGiessen` — EIN Guss auf EINE Zelle; stamm/feld-brand.js:5 `_ascheAt` liest nur die Asche des Brands, keinen Asche-Fall, keine Dachlast",
                        gruen: { werte: { gliederImBild: 5 }, zeuge: AUS_Z },
                        attrappen: [
                            { name: "fünf Glieder ohne Guss", roh: { werte: { gliederImBild: 5 }, zeuge: Object.assign({}, AUS_Z, { glut: 0, taten: 0 }) } },
                            { name: "fünf Glieder, die sich auch ohne Guss ändern", roh: { werte: { gliederImBild: 5 }, zeuge: Object.assign({}, AUS_Z, { gegen: 2 }) } },
                        ],
                    },
                    7: {
                        u: { planeten: 100, gliederMin: 3 },
                        soll: [K.soll(KA, 7, "zugeordnet, ≥ 80 %", { key: "anteilProzent", einheit: "%" })],
                        zeuge: zeugeFaden(100),
                        taeter: "voxel-worker.js planetOrtAuftrag (keine Ereignis-Kette im Faden)",
                        nicht: "keine Kette auf Fremd-Planeten",
                        leser: "voxel-worker.js:1446 planetOrtAuftrag — antwortet land, hoeheM, kuesteKm, klima, meer, wetter, wuchs, wildnis; kein Ereignis, keine Kette",
                        gruen: { werte: { anteilProzent: 84 }, zeuge: FADEN_Z },
                        attrappen: [{ name: "84 % ohne Planet-Faden", roh: { werte: { anteilProzent: 84 }, zeuge: { saaten: 0 } } }],
                    },
                },
            },

            // ════════ same.kopplung.kohaerenz — die gewachsene Kohärenz einer ungestörten Saat ════════
            [KO]: {
                sek: 40,
                faecher: true,
                pfad: ["stamm/gelaende-boden.js", "stamm/wasser-hydro.js", "stamm/feld-leben.js", "stamm/siedlung-ort.js", "stamm/siedlung-wege.js", "gelaende-core.js", "fachwerk-core.js", "voxel-worker.js", "planet-core.js", "scripts/werkbank.cjs"],
                ungefahren: "die Auge-Bilder (S5 ein Ort der Welt aus 80 m, S6 an der Wiese) schießt nur das Gerät; headless steht die Welt nie (/bild wartet auf Ruhe)",
                mess: async function (H, U, M) {
                    const S = (fn, a) => H.seite("return await (" + String(fn) + ")(r, " + JSON.stringify(a || {}) + ");");
                    const welt = async (r, a) => {
                        const st = r.state;
                        const C = AnazhRealm;
                        const pm = st.playerMesh.position;
                        const r3 = (v) => (Number.isFinite(v) ? Math.round(v * 1e3) / 1e3 : null);
                        const hyd = r._hydroFor(pm.x, pm.z);
                        const rv = (hyd.rivers || []).filter((v) => v.points && v.points.length >= 3);
                        const alle = rv.flatMap((v) => v.points);
                        const y = (x, z) => r._voxelSurfaceY(x, z);
                        const aus = { fluesse: rv.length, punkte: alle.length };
                        const lebt = (x, z) => r.auraAt(x, z).lebendig;
                        const schnitt = (x, z, nx, nz) => {
                            const w = [];
                            for (const d of a.abstaende) {
                                const [qx, qz] = [x + nx * d, z + nz * d];
                                if (r._nassAt(qx, qz)) return null;
                                w.push(lebt(qx, qz));
                            }
                            return w;
                        };
                        const monoton = (w) => w.every((v, i) => i === 0 || v <= w[i - 1] + a.tolDichte);
                        const fP = alle.filter((_, i) => i % Math.max(1, Math.floor(alle.length / a.schnitte)) === 0).slice(0, a.schnitte);
                        const fl = fP.map((p) => schnitt(p.x, p.z, -(p.flowZ || 0), p.flowX || 1)).filter(Boolean);
                        const fern = (x, z) => alle.every((p) => Math.hypot(p.x - x, p.z - z) >= a.fernM);
                        const zufall = [];
                        let sd = 12345;
                        const rnd = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
                        for (let k = 0; k < 400 && zufall.length < a.schnitte; k++) {
                            const [x, z] = [pm.x + (rnd() * 2 - 1) * a.halbM, pm.z + (rnd() * 2 - 1) * a.halbM];
                            const g = rnd() * Math.PI * 2;
                            if (!fern(x, z) || !r._landAt(x, z, 0.2)) continue;
                            const w = schnitt(x, z, Math.cos(g), Math.sin(g));
                            if (w) zufall.push(w);
                        }
                        aus.s2 = { fluss: fl.length, flussMonoton: fl.filter(monoton).length, zufall: zufall.length, zufallMonoton: zufall.filter(monoton).length, streu: r3(Math.max(...fl.flat()) - Math.min(...fl.flat())), beispiel: fl[0] && fl[0].map(r3), flaecheKm2: r3((hyd.size || 2048) * (hyd.size || 2048) / 1e6) };
                        const SG = C._siedlungGesetz();
                        const cm = SG.cellM;
                        const [mx, mz] = [Math.floor(pm.x / cm), Math.floor(pm.z / cm)];
                        const orte = [];
                        for (let i = -a.zellen; i <= a.zellen; i++)
                            for (let j = -a.zellen; j <= a.zellen; j++) {
                                const o = r._autoSettlementCellInfo(mx + i, mz + j);
                                if (o && Math.abs(o.x - pm.x) <= a.halbM && Math.abs(o.z - pm.z) <= a.halbM) orte.push({ x: o.x, z: o.z, nH: o.nH });
                            }
                        const amWasser = (x, z) => alle.some((p) => Math.hypot(p.x - x, p.z - z) <= a.anM) || r._nassAt(x, z);
                        const zo = [];
                        for (let k = 0; k < 2000 && zo.length < Math.max(40, orte.length); k++) {
                            const [x, z] = [pm.x + (rnd() * 2 - 1) * a.halbM, pm.z + (rnd() * 2 - 1) * a.halbM];
                            if (r._landAt(x, z, 0.2)) zo.push([x, z]);
                        }
                        const nH = orte.map((o) => o.nH).filter((v) => v > 0).sort((p, q) => q - p);
                        let zipf = null;
                        if (nH.length >= 3) {
                            const X = nH.map((_, i) => Math.log(i + 1));
                            const Y = nH.map((v) => Math.log(v));
                            const xm = X.reduce((s, v) => s + v, 0) / X.length;
                            const ym = Y.reduce((s, v) => s + v, 0) / Y.length;
                            const sxy = X.reduce((s, v, i) => s + (v - xm) * (Y[i] - ym), 0);
                            const sxx = X.reduce((s, v) => s + (v - xm) * (v - xm), 0);
                            zipf = sxx > 0 ? r3(-sxy / sxx) : null;
                        }
                        aus.orte = { n: orte.length, amWasser: orte.filter((o) => amWasser(o.x, o.z)).length, zufall: zo.length, zufallAmWasser: zo.filter(([x, z]) => amWasser(x, z)).length, zipf, groesster: nH[0] || 0, kleinster: nH[nH.length - 1] || 0, staedte: r._staedte().length };
                        const nah = orte.slice().sort((p, q) => Math.hypot(p.x - pm.x, p.z - pm.z) - Math.hypot(q.x - pm.x, q.z - pm.z))[0];
                        aus.pose = nah ? { px: Math.round(nah.x + 80), py: Math.round(y(nah.x, nah.z) + 60), pz: Math.round(nah.z + 40), lx: Math.round(nah.x), ly: Math.round(y(nah.x, nah.z)), lz: Math.round(nah.z) } : null;
                        return aus;
                    };
                    const faden = async (r, a) => {
                        await r._fadenQuelle();
                        const an = await r._planetAnker();
                        const [Bg, Lg] = [(an.breite * 180) / Math.PI, (an.laenge * 180) / Math.PI];
                        const t0 = performance.now();
                        const H0 = [];
                        let land = 0;
                        for (let i = 0; i < a.saaten && performance.now() - t0 < a.deckelMs; i += 10) {
                            const o = await Promise.all(Array.from({ length: Math.min(10, a.saaten - i) }, (_, k) => r._planetAuftrag({ type: "planet-ort", samen: "same-saat-" + (i + k), breite: Bg, laenge: Lg, zeitMa: 0 })));
                            for (const x of o) (H0.push(x.hoeheM), (land += x.land ? 1 : 0));
                        }
                        const m = H0.reduce((s, v) => s + v, 0) / Math.max(1, H0.length);
                        return { n: H0.length, land, streuungM: Math.round(Math.sqrt(H0.reduce((s, v) => s + (v - m) * (v - m), 0) / Math.max(1, H0.length))), ms: Math.round(performance.now() - t0) };
                    };
                    // S1 ÜBER DEN FÄCHER (stationen/faecher.js): die 100 Saaten der Leiter (dieselben Namen wie S6 im Planet-Faden) und die Saat
                    // der Welt; je Adresse die Wasserläufe der Hydrosphäre um den Spieler an 50 Punkten — vorwärts bergab und am Ende in Senke
                    // oder Meer, rückwärts als Gegenlauf. Die Hydrosphäre rechnet der Faden über SEINER Lage (gelaende-core.js:6107
                    // `hydrosphaere`, voxel-worker.js:1997, state = die geladene Saat): eine andere Saat zählt ohne Fähigkeit
                    const WASSER_AN = async (r, T, a, mit) => {
                        const st = r.state;
                        if (!st.worldMeta || a.saat !== st.worldMeta.seed)
                            return { fehlt: "die Hydrosphäre lebt nur für die Saat der Welt (gelaende-core.js:6107 hydrosphaere im Faden über seiner Lage, voxel-worker.js:1997; der Planet-Faden antwortet ohne Flusslauf)" };
                        const pm = st.playerMesh.position;
                        const hyd = r._hydroFor(pm.x, pm.z);
                        const rv = (hyd.rivers || []).filter((v) => v.points && v.points.length >= 3);
                        const y = (x, z) => r._voxelSurfaceY(x, z);
                        const ende = (v) => {
                            const p = v.points[v.points.length - 1];
                            const b = y(p.x, p.z);
                            const w = r._atlasWaterLevelAt(p.x, p.z, b);
                            return !!(v.mouth || p.inLake || r._nassAt(p.x, p.z) || (Number.isFinite(w) && w > b));
                        };
                        const paare = [];
                        for (const v of rv) for (let i = 0; i + 1 < v.points.length; i++) paare.push([v.points[i], v.points[i + 1], ende(v)]);
                        const schritt = Math.max(1, Math.floor(paare.length / mit.punkte));
                        const wahl = paare.filter((_, i) => i % schritt === 0).slice(0, mit.punkte);
                        const ab = (p, q) => y(q.x, q.z) <= y(p.x, p.z) + mit.tolM;
                        return { n: wahl.length, vor: wahl.filter(([p, q, e]) => ab(p, q) && e).length, rueck: wahl.filter(([p, q]) => y(p.x, p.z) < y(q.x, q.z) - mit.tolM).length, bergab: wahl.filter(([p, q]) => ab(p, q)).length, ende: rv.filter(ende).length, rueckAb: wahl.filter(([p, q]) => ab(q, p)).length, fluesse: rv.length };
                    };
                    const geladen = await H.seite("return r.state.worldMeta && r.state.worldMeta.seed;");
                    const R1 = await FAECHER((c) => H.seite(c), {
                        gesetz: { fn: WASSER_AN, export: "gelaende-core.js:6107 hydrosphaere (im Faden, voxel-worker.js:1997)", leser: "stamm/gelaende-boden.js:675 _hydroFor" },
                        adressen: { saaten: [geladen, ...Array.from({ length: U[1].saaten }, (_, i) => "same-saat-" + i)] },
                        mit: { punkte: U[1].punkte, tolM: 0.05 },
                        ms: 10000,
                        masse: { saaten: { wie: "anzahl", nur: "saat" }, n: { wie: "summe", feld: "n" }, vor: { wie: "summe", feld: "vor" }, rueck: { wie: "summe", feld: "rueck" }, bergab: { wie: "summe", feld: "bergab" }, rueckAb: { wie: "summe", feld: "rueckAb" }, ende: { wie: "summe", feld: "ende" }, fluesse: { wie: "summe", feld: "fluesse" } },
                        schlecht: { feld: "vor", richtung: "min" },
                        pose: (a) => "Saat " + a.saat + ": ein Fluss am Spieler aus 80 m, Lauf und Mündung im Bild",
                    });
                    const w = await S(welt, { abstaende: U[2].abstaendeM, tolDichte: 0.02, schnitte: 20, fernM: 400, halbM: U[3].halbM, zellen: 8, anM: U[3].anM });
                    w.s1 = R1.werte;
                    const f = await S(faden, { saaten: U[6].saaten, deckelMs: Math.max(2000, (30 - M.uhr()) * 1000) });
                    const auge5 = await M.auge("same-kohaerenz-s5", w.pose || { ort: "wiese" });
                    const auge6 = await M.auge("same-kohaerenz-s6", { ort: "wiese" });
                    const s1 = w.s1 || {};
                    const s2 = w.s2 || {};
                    const o = w.orte || {};
                    const pz = (a, b) => (b > 0 ? Math.round((1000 * a) / b) / 10 : undefined);
                    const zo = { orte: o.n, zufall: o.zufall, anteilOrte: pz(o.amWasser, o.n), anteilZufall: pz(o.zufallAmWasser, o.zufall) };
                    const eine = "die Welt trägt EINE Saat (100 Saaten erzeugt sie nicht; der Planet-Faden kennt keine Flüsse, keine Pflanzen-Dichte am Wasser, keine Orte)";
                    return {
                        sprossen: {
                            1: { werte: { anteilProzent: pz(s1.vor, s1.n) }, zeuge: { punkte: s1.n, vor: s1.vor, rueck: s1.rueck, rueckAb: s1.rueckAb, bergab: s1.bergab, fluesse: s1.fluesse, ende: s1.ende, saaten: R1.gemessen }, ...(R1.gemessen < U[1].saaten ? { nicht: (R1.fehlt || "die Frist") + " — an der Saat der Welt: " + s1.vor + " von " + s1.n + " Punkten bergab in Senke oder Meer, rückwärts steigen " + s1.rueck + " · " + R1.akte } : {}) },
                            2: { werte: { monotonProzent: pz(s2.flussMonoton, s2.fluss) }, zeuge: { schnitte: s2.fluss, zufall: s2.zufall, anteilFluss: pz(s2.flussMonoton, s2.fluss), anteilZufall: pz(s2.zufallMonoton, s2.zufall), streu: s2.streu }, nicht: eine + " — an dieser: " + s2.flussMonoton + " von " + s2.fluss + " Schnitten quer zum Fluss monoton fallend (fern jedes Flusses " + s2.zufallMonoton + " von " + s2.zufall + "), " + s2.flaecheKm2 + " km² Hydrosphäre" },
                            3: { werte: { anteilProzent: zo.anteilOrte, luvLeeVerh: undefined }, zeuge: zo, nicht: "10³ km² nicht und kein Niederschlag je Ort: " + o.n + " Orte (Dörfer, " + o.staedte + " Städte) auf " + Math.round(((2 * U[3].halbM) / 1000) ** 2) + " km², " + o.amWasser + " am Fluss (Zufallsorte " + o.zufallAmWasser + " von " + o.zufall + "); der Planet-Faden trägt Regen nur als Δ zum Anker, Luv/Lee unmessbar" },
                            4: { werte: { umwegFaktor: undefined, zipfSteigung: o.zipf, groessterOrt: o.groesster }, zeuge: Object.assign({ zipf: o.zipf }, zo), nicht: "10⁵ km² und 10³ Städte nicht, kein Straßennetz zwischen den Orten: " + o.n + " Orte, der größte trägt " + o.groesster + " Häuser (Soll bis 10⁷), Zipf-Steigung " + o.zipf },
                            5: { werte: { zuordnungProzent: undefined, orte: o.n }, zeuge: zo, auge: auge5, nicht: "20 Stadtbilder aus ihrem Biom nicht: " + o.n + " Orte in EINER Region, " + o.staedte + " Städte" },
                            6: { werte: { verwechslungProzent: undefined, saaten: f.n }, zeuge: { saaten: f.n, streuungM: f.streuungM, land: f.land }, auge: auge6, nicht: "keine Orbit-Pose ohne Ladebild, keine 10⁹ Bewohner: der Planet-Faden antwortet an " + f.n + " Saaten (Höhe streut " + f.streuungM + " m, " + f.land + " Land am Anker)" },
                            7: { werte: { anteilProzent: zo.anteilOrte }, zeuge: zo, nicht: "1 000 Fremd-Saaten nicht: die Welt trägt EINE Saat der Erd-Physik — " + o.amWasser + " von " + o.n + " Orten am Wasser (Zufallsorte " + zo.anteilZufall + " %)" },
                        },
                    };
                },
                sprossen: {
                    1: {
                        u: { saaten: 100, punkte: 50 },
                        soll: [K.soll(KO, 1, "Wasserläufe bergab in Senke oder Meer ≥ 95 %", { key: "anteilProzent", einheit: "%" })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.punkte >= 50)) return "nur " + (z.punkte || 0) + " Punkte an Flüssen gemessen (Soll 50)";
                            if (!(z.rueck < z.bergab)) return "der Lauf rückwärts fällt so oft wie vorwärts (" + z.rueck + " ≥ " + z.bergab + ") — die Flüsse folgen dem Relief nicht";
                            if (!(z.ende >= 1)) return "kein Fluss endet in Senke oder Meer";
                            return null;
                        },
                        taeter: "gelaende-core.js hydroRegion (die Flüsse) · stamm/gelaende-boden.js `_hydroFor`",
                        nicht: "eine Saat, nicht 100",
                        leser: "stamm/gelaende-boden.js:675 `_hydroFor` — die Hydrosphäre nur der Saat der Welt; voxel-worker.js:1446 planetOrtAuftrag ohne Flusslauf",
                        gruen: { werte: { anteilProzent: 97 }, zeuge: { punkte: 50, vor: 49, rueck: 2, rueckAb: 10, bergab: 49, fluesse: 21, ende: 18 } },
                        attrappen: [
                            { name: "97 % an flachen Linien (rückwärts fällt es genauso)", roh: { werte: { anteilProzent: 97 }, zeuge: { punkte: 50, vor: 49, rueck: 49, bergab: 49, fluesse: 21, ende: 18 } } },
                            { name: "97 % aus fünf Punkten", roh: { werte: { anteilProzent: 97 }, zeuge: { punkte: 5, vor: 5, rueck: 0, bergab: 5, fluesse: 1, ende: 1 } } },
                        ],
                    },
                    2: {
                        u: { saaten: 100, abstaendeM: [10, 30, 60, 120, 240], flaecheKm2: 10 },
                        soll: [K.soll(KO, 2, "Pflanzen-Dichte gegen Abstand zum Wasser monoton fallend in ≥ 80 %", { key: "monotonProzent", einheit: "%" })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.schnitte >= 10)) return "nur " + (z.schnitte || 0) + " Schnitte quer zum Fluss (Soll 10)";
                            if (!(z.zufall >= 10)) return "kein Gegenlauf fern jedes Flusses";
                            if (!(z.streu > 0)) return "die Pflanzen-Dichte streut nicht (eine Konstante)";
                            if (!(z.anteilFluss > z.anteilZufall)) return "fern jedes Flusses fällt die Dichte so oft wie am Fluss (" + z.anteilZufall + " ≥ " + z.anteilFluss + " %) — das Wasser ist keine Ursache";
                            return null;
                        },
                        taeter: "stamm/feld-leben.js `auraAt` (lebendig liest den Abstand zum Wasser nicht) · stamm/gelaende-boden.js `_feuchteAt`",
                        nicht: "eine Saat, nicht 100",
                        leser: "stamm/gelaende-boden.js:675 `_hydroFor` — Flüsse und Pflanzen nur der Saat der Welt",
                        unklar: "„monoton fallend“ trägt keine Toleranz — Vorschlag: je Schnitt 10–240 m kein Schritt steigt um mehr als 0,02 lebendig.",
                        gruen: { werte: { monotonProzent: 85 }, zeuge: { schnitte: 20, zufall: 20, anteilFluss: 85, anteilZufall: 30, streu: 0.5 } },
                        attrappen: [{ name: "85 % auch fern jedes Flusses (das Gelände fällt, nicht das Wasser wirkt)", roh: { werte: { monotonProzent: 85 }, zeuge: { schnitte: 20, zufall: 20, anteilFluss: 85, anteilZufall: 85, streu: 0.5 } } }],
                    },
                    3: {
                        u: { flaecheKm2: 1000, halbM: 2000, anM: 300 },
                        soll: [K.soll(KO, 3, "Städte an Fluss/Küste/Pass ≥ 70 %", { key: "anteilProzent", einheit: "%" }), K.soll(KO, 3, "Niederschlag Luv/Lee ≥ 2:1", { key: "luvLeeVerh" })],
                        zeuge: zeugeOrte,
                        taeter: "fachwerk-core.js (der Ort liest Wasser nur als Verbot und Kosten) · voxel-worker.js planetOrtAuftrag (Regen nur als Δ)",
                        nicht: "10³ km² nicht, kein Niederschlag je Ort",
                        leser: "voxel-worker.js:1202 `regenQuote` — der Faden reicht den Regen nur als Δ zum Anker, keinen Niederschlag, keinen Wind; stamm/siedlung-ort.js:1427 `_autoSettlementCellInfo` wählt den Ort ohne Fluss, Furt, Pass",
                        unklar: "„an Fluss/Küste/Pass“ trägt keinen Abstand und „Städte“ keine Größe — Vorschlag: jeder Ort der Welt (Dorf oder Stadt), sein Kern ≤ 300 m vom Fluss, der Küste oder dem Sattel.",
                        gruen: { werte: { anteilProzent: 78, luvLeeVerh: 2.4 }, zeuge: ORTE_Z },
                        attrappen: [{ name: "78 % — Zufallsorte stehen ebenso oft am Wasser", roh: { werte: { anteilProzent: 78, luvLeeVerh: 2.4 }, zeuge: Object.assign({}, ORTE_Z, { anteilZufall: 80 }) } }],
                    },
                    4: {
                        u: { flaecheKm2: 1e5, staedte: 1000, bisEinwohner: 1e7 },
                        soll: [
                            K.soll(KO, 4, "Straßennetz-Umweg ≤ 1,2 × günstigster Gelände-Pfad", { key: "umwegFaktor" }),
                            K.soll(KO, 4, "Zipf-Steigung 0,8–1,2", { key: "zipfSteigung" }),
                            K.soll(KO, 4, "bis 10⁷", { key: "groessterOrt", rel: "≥", zahl: 1e7 }),
                        ],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!Number.isFinite(z.zipf)) return "keine Zipf-Gerade aus den Orten der Welt";
                            return zeugeOrte(roh);
                        },
                        taeter: "stamm/siedlung-ort.js `_autoSettlementCellInfo` (Dörfer ohne Wachstum zur Stadt) · stamm/siedlung-wege.js `_wegeKarteEnsure` (Wege nur im Ort)",
                        nicht: "10⁵ km², 10³ Städte, kein Straßennetz",
                        leser: "stamm/siedlung-wege.js:16 `_wegeKarteEnsure` — die Wege liegen nur in den Siedlungen, kein Netz zwischen den Orten; stamm/siedlung-ort.js:1472 `_staedte` leer",
                        gruen: { werte: { umwegFaktor: 1.1, zipfSteigung: 1.02, groessterOrt: 2e7 }, zeuge: Object.assign({ zipf: 1.02 }, ORTE_Z) },
                        attrappen: [{ name: "Zipf 1,02 ohne Orte der Welt", roh: { werte: { umwegFaktor: 1.1, zipfSteigung: 1.02, groessterOrt: 2e7 }, zeuge: { zipf: 1.02, orte: 0, zufall: 0 } } }],
                    },
                    5: {
                        u: { glieder: 10, stadtbilder: 20, flaeche: "kontinent" },
                        soll: [K.soll(KO, 5, "Blindtest: 20 Stadtbilder ihrem Biom zugeordnet ≥ 70 %", { key: "zuordnungProzent", einheit: "%" })],
                        auge: { pose: "der nächste Ort der Welt aus 80 m Abstand, 60 m Höhe (ohne Ort: die Wiese)", vorbild: "Prüfer-Satz R11: 20 Stadtbilder blind ihrem Biom zugeordnet, ≥ 70 %" },
                        taeter: "stamm/siedlung-ort.js `_autoSettlementCellInfo` (der Ort wählt Lehm, Holz, Stein nicht aus dem Biom)",
                        nicht: "20 Stadtbilder aus 20 Biomen nicht",
                        leser: "stamm/siedlung-ort.js:1472 `_staedte` — keine Stadt in der Welt, die Dörfer einer Region",
                        gruen: { werte: { zuordnungProzent: 75 }, zeuge: ORTE_Z },
                        attrappen: [{ name: "75 % ohne Bild", roh: { werte: { zuordnungProzent: 75 }, zeuge: { orte: 0 } } }],
                    },
                    6: {
                        u: { saaten: 100, bewohner: 1e9 },
                        soll: [K.soll(KO, 6, "Geograf trennt sie blind nicht von Erdkarten-Ausschnitten ≥ 50 %", { key: "verwechslungProzent", einheit: "%" })],
                        auge: { pose: "Orbit über dem Planeten (heute keine Orbit-Pose: geschossen an der Wiese)", vorbild: "Prüfer-Satz R11: 100 Planeten-Karten blind gegen Erdkarten-Ausschnitte, Verwechslung ≥ 50 %" },
                        taeter: "voxel-worker.js planetOrtAuftrag (keine Kulturräume, keine Bewohner)",
                        nicht: "keine Orbit-Pose, keine 10⁹ Bewohner",
                        leser: "voxel-worker.js:1446 planetOrtAuftrag — kein Bewohner, keine Siedlung, kein Kulturraum in der Antwort",
                        gruen: { werte: { verwechslungProzent: 55 }, zeuge: FADEN_Z },
                        attrappen: [{ name: "55 % ohne Faden", roh: { werte: { verwechslungProzent: 55 }, zeuge: { saaten: 0 } } }],
                    },
                    7: {
                        u: { saaten: 1000, physik: "fremd", anM: 300 },
                        soll: [K.soll(KO, 7, "Siedlungen mit sichtbarer Ursache (Wasser, Pass, Stoff, Schutz) ≥ 90 %", { key: "anteilProzent", einheit: "%" })],
                        zeuge: zeugeOrte,
                        taeter: "stamm/siedlung-ort.js `_autoSettlementCellInfo` (der Ort hat keine Ursache am Ort) · planet-core.js (keine fremde Physik)",
                        nicht: "1 000 Fremd-Saaten nicht",
                        leser: "stamm/siedlung-ort.js:1427 `_autoSettlementCellInfo` — der Rang aus dem Samen der Zelle, kein Wasser, kein Pass, kein Stoff als Ursache",
                        gruen: { werte: { anteilProzent: 93 }, zeuge: ORTE_Z },
                        attrappen: [{ name: "93 % — Zufallsorte stehen ebenso oft am Wasser", roh: { werte: { anteilProzent: 93 }, zeuge: Object.assign({}, ORTE_Z, { anteilZufall: 95 }) } }],
                    },
                },
            },
        },
    };
})());

// ── DAS STÜCK zusammenspiel.same · zeitreise + terraform (2 Leitern, 13 Sprossen, belegt: keine) — Teil der EINEN Probe der Perspektive.
// ZEITREISE (die Tat zu jeder Zeit): in der warmen Welt um den Spieler fallen zehn Bäume des Walds über die Ernte des Spiels
// (`harvestArchitecture`, die Tat `faellen`), die Hand pflückt Pflanzen der Nah-Streu (`_streuNehmen`, die Tat `ernten`), ein Haus
// entsteht über den Satz `spawn_studio` (der EINE Stempel), ein Trampelpfad über den Schritt der Leiber (`_tritt`, im Sandkasten des
// Felds `worldMeta.tritt`). Eine Spielstunde läuft im Takt des Spiels (`_weltUhrNimm` in Schritten unter dem Uhr-Sprung); die Sprünge
// (+1 a, 10 a, 100 a, 10³ a, rückwärts, 100 Zufallspaare bis 10⁹ a) setzen die Welt-Uhr `spielZeit` und lesen die Leser der Welt:
// den Nachwuchs (`_tickScatterRegrow` — er heilt und pflanzt), die Sukzession (`_sukzession`), das Baum-Alter (`_baumAlter`), das
// Werk-Alter (`_werkAlter`, `_werkAlterSchluessel`), die Erholung des Pfads (`_trittErholen`), die Narbe (`_narbeAt`). Der Reload geht
// über den Speicher-Weg: der Stand (`buildStateSnapshot`, als JSON geschrieben und gelesen), das Haus steht aus ihm wieder auf
// (`_bauAusStand`). Ein Jahr ist 365 Tage der Prozesse (`_kalender().tagS`) — dasselbe Spieljahr wie stoffe.K5 (8 760 Welt-Stunden). Am
// Ende fällt alles zurück: Uhr, Taten-Liste und Index (`_tatGen`), die Stümpfe (`_nahStreuTat`), der Wald (`_waldNachwuchs`), die
// geernteten Kacheln, das Haus, der Pfad, Nässe, Lage des Spielers und der Sicherungs-Ruf.
// TERRAFORM (Technik formt den Planeten): die Welt trägt keinen Eingriff — gemessen wird, was sie trägt: der Regen des Worts
// (`_weatherFieldFor`, ohne Ort), der Planet-Faden (`planet-ort`) an Wüste, Anker und 100 Saaten über die Zeit (der Gegenlauf ohne
// Eingriff), die Bücher der Foundry (kein Aufzug), Städte und Wachstum der Orte. Das Bild (Orbit, Folge, Fremdwelt R10) schießt nur das Gerät.
L.perspektive("same", (() => {
    const ZR = "same.kopplung.zeitreise";
    const TF = "same.kopplung.terraform";

    const LICHTUNG_Z = { gefaellt: 10, taten: 10, vor: 12, nach: 2, gVor: 11, gNach: 11 };
    const zeugeLichtung = (roh) => {
        const z = roh.zeuge || {};
        if (!(z.gefaellt >= 10)) return "nur " + (z.gefaellt || 0) + " Bäume gefällt (Soll 10 Fällungen)";
        if (!(z.taten >= z.gefaellt)) return "die Fällungen schrieben " + (z.taten || 0) + " Taten für " + z.gefaellt + " Bäume";
        if (!(z.vor >= 10)) return "die Lichtung trug vorher nur " + (z.vor || 0) + " Bäume";
        if (!(z.gVor >= 5)) return "kein Gegenlauf: die Gruppe ohne Fällung fehlt";
        if (!(z.gNach / z.gVor > 0.3)) return "der Gegenlauf ohne Fällung lichtet ebenso (" + z.gNach + " von " + z.gVor + "): die Stunde, nicht die Tat";
        return null;
    };

    return {
        leitern: {
            // ════════ same.kopplung.zeitreise — die Tat zu jeder Zeit ════════
            [ZR]: {
                sek: 25,
                mutiert: true,
                pfad: ["stamm/feld-leben.js", "stamm/vegetation-wiese.js", "stamm/vegetation-baum.js", "stamm/werkstatt-bauen.js", "stamm/siedlung-satz.js", "stamm/siedlung-wege.js", "stamm/siedlung-bewohner.js", "stamm/siedlung-ort.js", "stamm/speicher-*.js", "stamm/dirigent-takt.js", "stamm/feld-dsl.js", "stamm/bild-himmel.js", "voxel-worker.js", "planet-core.js", "phyto-core.js", "fachwerk-core.js", "foundry-core.js"],
                ungefahren: "das Bildpaar t₀−1 ↔ t₀+1 der Werk-Pixel (S4) schießt nur das Gerät (`__ausgabeAufnahme` wartet headless auf Ruhe); headless zeichnet die Nah-Streu keine Senke — die Stümpfe (S1) und die Pflanzen der Ernte (S2) zählt nur das Gerät",
                mess: async function (H, U, M) {
                    const S = (fn, a) => H.seite("return await (" + String(fn) + ")(r, T, " + JSON.stringify(a || {}) + ");");
                    const seite = async (r, T, a) => {
                        const s = r.state;
                        const C = AnazhRealm;
                        const wm = s.worldMeta;
                        const pm = s.playerMesh.position;
                        const r3 = (v) => (Number.isFinite(v) ? Math.round(v * 1e3) / 1e3 : null);
                        const TAG = r._kalender().tagS;
                        const JAHR = 365 * TAG;
                        let tk = performance.now();
                        const takt = (n) => {
                            for (let i = 0; i < n; i++) r._gameLoopTick((tk += 1000 / 60));
                        };
                        const baum = (e) => /baum/.test(e._lodSpecies || e.type) && r._istNatur(e);
                        const ab = (e, p) => Math.hypot(e.position.x - p.x, e.position.z - p.z);
                        const zaehl = (m, R) => s.architectures.filter((e) => baum(e) && ab(e, m) <= R).length;
                        const mittel = (L) => ({ x: L.reduce((q, e) => q + e.position.x, 0) / L.length, z: L.reduce((q, e) => q + e.position.z, 0) / L.length });
                        const stuempfe = () => {
                            const ns = s.nahStreu;
                            const Z = new Set();
                            if (ns) for (const q of ns.senken.values()) if (q.preset === "stumpf") for (const [k, b] of q.bloecke) for (const id of b.ids) if (String(id).startsWith("tat|")) Z.add(k + "#" + id);
                            return Z.size;
                        };
                        const gezeichnet = (q) => {
                            const ns = s.nahStreu;
                            const sk = ns && ns.senken.get(q.senke);
                            const b = sk && sk.bloecke.get(q.key);
                            return !!b && b.ids.includes(q.id);
                        };
                        if (!Array.isArray(wm.taten)) wm.taten = [];
                        const L0 = wm.taten;
                        const vorTaten = L0.slice();
                        const own = (m) => Object.prototype.hasOwnProperty.call(r, m);
                        const alt = { sz: s.spielZeit, tod: s.timeOfDay, wetter: s.weather, pos: [pm.x, pm.y, pm.z], nf: r._nachwuchsFaellig, sn: Array.isArray(r._sukzessionNeu) ? r._sukzessionNeu.slice() : r._sukzessionNeu, nass: wm.nassTage, nu: r._naesseUhr, naesse: s.naesse, hatTritt: Object.prototype.hasOwnProperty.call(wm, "tritt"), tritt: wm.tritt, wk: s.wegeKarte, schw: r._trittSchwach, schrieb: r._trittSchrieb, sprung: r._weltUhrSprung, perf: s.perfRegulator, sav: [own("_scheduleEditSave"), r._scheduleEditSave], arch: s.architectures.length };
                        const aus = { s1: {}, s2: {}, s3: {}, s4: {}, s5: {}, s6: {}, s7: {} };
                        const gebaut = [];
                        const gefaellt = [];
                        const geerntet = [];
                        let mitte = null;
                        let R = 0;
                        let e2 = null;
                        let pfadF = null;
                        const pfadBei = (t) => {
                            if (!pfadF) return null;
                            const [t0, w0, s0, c0] = [wm.tritt, s.wegeKarte, r._trittSchwach, r._trittSchrieb];
                            const zeit = s.spielZeit;
                            try {
                                wm.tritt = JSON.parse(JSON.stringify(pfadF));
                                s.wegeKarte = { trittGemalt: new Map(), trittOffen: new Set(), stufen: [{}] };
                                r._trittSchwach = new Map();
                                s.spielZeit = t;
                                r._trittErholen();
                                return Object.keys(wm.tritt).length;
                            } finally {
                                [wm.tritt, s.wegeKarte, r._trittSchwach, r._trittSchrieb] = [t0, w0, s0, c0];
                                s.spielZeit = zeit;
                            }
                        };
                        s.perfRegulator = false;
                        r._scheduleEditSave = () => {};
                        try {
                            await r._fadenQuelle();
                            const an = await r._planetAnker();
                            const [PB, PL] = [(an.breite * 180) / Math.PI, (an.laenge * 180) / Math.PI];
                            const planetB = async () => {
                                const o = await r._planetAuftrag({ type: "planet-ort", samen: a.samenB, breite: PB, laenge: PL, zeitMa: 0 });
                                return JSON.stringify([o.land, o.hoeheM, o.kuesteKm, o.delta]);
                            };
                            const pB0 = await planetB();
                            const pB00 = await planetB();
                            // S1: zehn Fällungen am nächsten Wald des Spielers, der Gegenlauf an einer Gruppe ≥ 3 R fern ohne Fällung
                            const B0 = s.architectures.filter(baum);
                            if (B0.length < 2 * a.faellungen) return { fehler: "nur " + B0.length + " Bäume des Walds in der Welt (zwei Gruppen zu " + a.faellungen + " verlangt)" };
                            const kern = B0.slice().sort((x, y) => ab(x, pm) - ab(y, pm))[0].position;
                            const ziel = B0.slice().sort((x, y) => ab(x, kern) - ab(y, kern)).slice(0, a.faellungen);
                            mitte = mittel(ziel);
                            R = Math.max(...ziel.map((e) => ab(e, mitte))) + 1;
                            const fern = B0.filter((e) => ab(e, mitte) >= 3 * R + 10).sort((x, y) => ab(x, mitte) - ab(y, mitte))[0];
                            const gZiel = fern ? B0.slice().sort((x, y) => ab(x, fern.position) - ab(y, fern.position)).slice(0, a.faellungen) : [];
                            const gMitte = gZiel.length ? mittel(gZiel) : null;
                            const gR = gZiel.length ? Math.max(...gZiel.map((e) => ab(e, gMitte))) + 1 : 0;
                            Object.assign(aus.s1, { mitte: [Math.round(mitte.x), Math.round(mitte.z)], R: r3(R), vor: zaehl(mitte, R), gVor: gMitte ? zaehl(gMitte, gR) : null, stuempfeVor: stuempfe() });
                            const n0 = L0.length;
                            const tFaell = s.spielZeit;
                            for (const e of ziel) {
                                const p = { x: e.position.x, z: e.position.z };
                                r.harvestArchitecture(e, "welt");
                                if (!s.architectures.includes(e)) gefaellt.push(p);
                            }
                            const fa = L0.slice(n0).filter((q) => q && q.tat === "faellen");
                            aus.s1.gefaellt = gefaellt.length;
                            aus.s1.taten = fa.length;
                            pm.set(mitte.x, r._voxelSurfaceY(mitte.x, mitte.z) + 1.8, mitte.z);
                            // S2: die Ernte der Hand (die Tat `ernten`) an den Pflanzen der Nah-Streu nächst der Lichtung
                            const ns = s.nahStreu;
                            const kand = [];
                            if (ns)
                                for (const [senke, q] of ns.senken)
                                    if (q.ernte && q.preset !== "stumpf")
                                        for (const [key, b] of q.bloecke) {
                                            const k = ns.kacheln.get(key);
                                            if (k) for (const it of k.items) if (b.ids.includes(it.id) && Math.hypot(it.x - mitte.x, it.z - mitte.z) < 30) kand.push({ q: { senke, key, id: it.id }, d: Math.hypot(it.x - mitte.x, it.z - mitte.z) });
                                        }
                            kand.sort((p, q) => p.d - q.d);
                            for (const c of kand) {
                                if (geerntet.length >= a.pflanzen) break;
                                if (geerntet.some((g) => g.key === c.q.key && g.id === c.q.id)) continue;
                                if (r._streuNehmen(c.q.key, c.q.id)) geerntet.push(c.q);
                            }
                            // das Werk: ein Haus über den Satz (der EINE Stempel) 30–120 m von der Lichtung
                            const frei = (x, z, Rr) => r._landAt(x, z, 0.2) && !r._nassAt(x, z) && !r._blockerUmPlatz(x, z, Rr, []).length;
                            let HP = null;
                            for (let d = 30; d <= 120 && !HP; d += 15)
                                for (let k = 0; k < 12 && !HP; k++) {
                                    const x = mitte.x + d * Math.cos((k * Math.PI) / 6);
                                    const z = mitte.z + d * Math.sin((k * Math.PI) / 6);
                                    if (frei(x, z, 8)) HP = { x, z };
                                }
                            let haus = null;
                            const tHaus = s.spielZeit;
                            const tagHaus = r._weltTag();
                            if (HP) {
                                HP.y = r._voxelSurfaceY(HP.x, HP.z);
                                const a0 = s.architectures.length;
                                const halt = s.weatherEffectTime;
                                s.weatherEffectTime = 0;
                                try {
                                    r.dslRun(["spawn_studio", "haus", ["at", HP.x, HP.y, HP.z], 1, 7], { source: "human" });
                                } finally {
                                    s.weatherEffectTime = halt;
                                }
                                for (const e of s.architectures.slice(a0)) gebaut.push(e);
                                haus = gebaut.find((e) => /haus/.test(e.type)) || null;
                            }
                            // DIE STUNDE im Takt des Spiels: drei Schritte zu 50 s Welt-Uhr (unter WELT_UHR_SPRUNG_S), je zehn Takte
                            for (let k = 0; k < 3; k++) {
                                r._weltUhrNimm(s.spielZeit + TAG / 72);
                                takt(a.takte);
                            }
                            const base = s.spielZeit;
                            const stumpfKachel = () => {
                                let arten = null;
                                try {
                                    arten = r._nahStreuArten();
                                } catch (_e) {
                                    arten = null;
                                }
                                if (!Array.isArray(arten)) return null;
                                const K = C.NAH_STREU.kachel;
                                let n = 0;
                                for (const k of new Set(gefaellt.map((p) => Math.floor(p.x / K) + "," + Math.floor(p.z / K)))) {
                                    const [tx, tz] = k.split(",").map(Number);
                                    n += (r._tatStuempfe(tx, tz, arten) || []).length;
                                }
                                return n;
                            };
                            Object.assign(aus.s1, { nach: zaehl(mitte, R), gNach: gMitte ? zaehl(gMitte, gR) : null, stuempfe: stuempfe(), stuempfeKachel: stumpfKachel(), senken: s.nahStreu ? s.nahStreu.senken.size : 0, stunde: r3((base - tFaell) / (TAG / 24)) });
                            // der Pfad: der Schritt eines Leibs 60 Gänge über 10 Zellen der Lichtung (im Sandkasten des Felds, nie gemalt)
                            {
                                const [t0, w0, s0, c0] = [wm.tritt, s.wegeKarte, r._trittSchwach, r._trittSchrieb];
                                try {
                                    wm.tritt = {};
                                    s.wegeKarte = null;
                                    r._trittSchwach = new Map();
                                    const leib = {};
                                    const Z = C.TRITT.zelleM;
                                    for (let g = 0; g < a.pfadGaenge; g++)
                                        for (let c = 0; c < a.pfadZellen; c++) {
                                            const i = g % 2 ? a.pfadZellen - 1 - c : c;
                                            r._tritt(leib, mitte.x + (i + 0.5) * Z, mitte.z + 0.25 * Z, true, false);
                                        }
                                    pfadF = JSON.parse(JSON.stringify(wm.tritt));
                                } finally {
                                    [wm.tritt, s.wegeKarte, r._trittSchwach, r._trittSchrieb] = [t0, w0, s0, c0];
                                }
                            }
                            const stoffe = (haus && haus._alterStoffe) || [];
                            const schluessel = (e) => (e && stoffe.length ? r._werkAlterSchluessel(e, stoffe) : null);
                            const regler = (e) => {
                                const o = e ? r._werkAlterOv(e, e.studioOv || null) : null;
                                return o && Number.isFinite(o.verwitterung) ? o.verwitterung : null;
                            };
                            const key0 = schluessel(haus);
                            const ov0 = regler(haus);
                            const alter0 = haus ? r._werkAlter(haus).zeit : null;
                            const waldBei = () => (gefaellt.length ? gefaellt.filter((p) => r._baumAlter(p.x, p.z) === 1).length / gefaellt.length : 0);
                            // der Gegenlauf ohne Sprung (S2/S3): die Pflanzen fehlen, die Stümpfe stehen, das Werk ist jung
                            const zurueckOhne = geerntet.filter((q) => !r._geerntetIn(q.key).has(q.id)).length;
                            const waldNull = waldBei();
                            const pfadNull = pfadBei(base);
                            aus.s3.spurenOhne = 100 * ((0 + (pfadNull > 0 ? 1 : 0) + (waldNull === 1 ? 1 : 0) + 0) / 4);
                            // DIE SUKZESSIONS-REIHE des ersten Stumpfs: die Stufen zu Stunden nach der Tat (der Leser `_sukzession`)
                            const I = r._tatIndex();
                            const faK = fa.map((q) => ({ x: q.x, z: q.z, h: q.h, dauerH: I.dauer.get(q) }));
                            const reihe = fa.length ? a.reiheStunden.map((dh) => r._sukzession(fa[0], fa[0].h + dh)) : [];
                            const stufenR = new Set(reihe.map((z) => z.stufe));
                            const steigt = reihe.every((z, i) => !i || z.stubben >= reihe[i - 1].stubben);
                            // +1 SPIELJAHR: der Nachwuchs heilt und pflanzt (der Takt des Spiels liest dieselbe Funktion)
                            s.spielZeit = base + a.jahr * JAHR;
                            r._tickScatterRegrow(r._weltStunde());
                            const zurueck = geerntet.filter((q) => !r._geerntetIn(q.key).has(q.id)).length;
                            const alterJahr = haus ? r._werkAlter(haus).zeit : null;
                            const keyJahr = schluessel(haus);
                            // DER RELOAD über den Speicher-Weg: der Stand geschrieben (JSON) und gelesen, das Haus steht aus ihm auf
                            let reload = false;
                            let alterR = null;
                            let keyR = null;
                            if (haus) {
                                const stand = JSON.parse(JSON.stringify(r.buildStateSnapshot()));
                                const hs = (stand.architectures || []).find((q) => q && q.id === haus.id);
                                if (hs) {
                                    r.removeArchitecture(haus);
                                    e2 = r._bauAusStand(hs, stand, null);
                                    reload = !!e2 && e2 !== haus;
                                    if (e2) {
                                        alterR = r._werkAlter(e2).zeit;
                                        keyR = schluessel(e2);
                                    }
                                }
                            }
                            s.spielZeit = base;
                            takt(a.takte);
                            Object.assign(aus.s2, {
                                gepflueckt: geerntet.length,
                                zurueck,
                                zurueckOhne,
                                gezeichnet: geerntet.filter(gezeichnet).length,
                                stufen: stufenR.size,
                                steigt,
                                reihe: reihe.map((z) => z.stubben),
                                reload,
                                alterNull: alter0,
                                alterJahr,
                                alterReload: alterR,
                                keyJahr,
                                keyReload: keyR,
                                baeumeNachJahr: zaehl(mitte, R),
                                tatenNachJahr: L0.filter((q) => fa.includes(q)).length,
                            });
                            // S3: Sprung 10 und 100 Jahre — Bau gealtert, Pfad verfestigt, Lichtung Wald, Name am Ort
                            const spurenJe = a.jahre.map((N) => {
                                s.spielZeit = base + N * JAHR;
                                const ovN = regler(e2);
                                const bau = e2 && ((key0 != null && schluessel(e2) !== key0) || (ovN != null && ovN !== ov0)) ? 1 : 0;
                                const alterN = e2 ? r._werkAlter(e2).zeit : null;
                                const wald = waldBei() === 1 ? 1 : 0;
                                s.spielZeit = base;
                                const pf = pfadBei(base + N * JAHR);
                                const pfad = pf > 0 && pf >= pfadNull ? 1 : 0;
                                return { N, bau, alterN, regler: ovN, pfad, pfadZellen: pf, wald, name: 0, prozent: 100 * ((bau + pfad + wald) / 4) };
                            });
                            s.spielZeit = base;
                            Object.assign(aus.s3, { je: spurenJe, pfadNull, stoffe: stoffe.length, key0, regler0: ov0, typ: haus ? haus.type : null, koerper: !!(e2 && e2.mesh) });
                            // S4: rückwärts vor die Tat (ein Tag vor dem Akt des Hauses) und zurück
                            {
                                const tVor = tHaus - a.rueckTage * TAG;
                                s.spielZeit = tVor;
                                const s4 = { aktTag: r3(tagHaus), rueckTag: r3(r._weltTag()), werk: !!e2, werkDaVor: e2 && s.architectures.includes(e2) ? 1 : 0, alterVor: e2 ? r._werkAlter(e2).zeit : null, keyVor: schluessel(e2) };
                                s.spielZeit = base;
                                s4.pfadVorGang = pfadBei(tFaell - a.rueckTage * TAG);
                                s.spielZeit = base + a.rueckTage * TAG;
                                s4.werkDaNach = e2 && s.architectures.includes(e2) ? 1 : 0;
                                s.spielZeit = base;
                                if (a.bild && e2 && e2.mesh) {
                                    try {
                                        const cam = s.camera;
                                        const hp = e2.position;
                                        const schuss = async () => {
                                            cam.position.set(hp.x + 24, hp.y + 10, hp.z + 24);
                                            cam.lookAt(hp.x, hp.y + 3, hp.z);
                                            cam.updateMatrixWorld(true);
                                            return (await window.__ausgabeAufnahme(480, 270)).u8;
                                        };
                                        const diff = (p, q, i) => Math.abs(p[i] - q[i]) + Math.abs(p[i + 1] - q[i + 1]) + Math.abs(p[i + 2] - q[i + 2]);
                                        await window.__weltStehtNach(() => takt(1), 600);
                                        const mit = await schuss();
                                        e2.mesh.visible = false;
                                        const ohne = await schuss();
                                        e2.mesh.visible = true;
                                        const maske = [];
                                        for (let i = 0; i < mit.length; i += 4) if (diff(mit, ohne, i) > 24) maske.push(i);
                                        s.spielZeit = tVor;
                                        const vor = await schuss();
                                        s.spielZeit = base + a.rueckTage * TAG;
                                        const nach = await schuss();
                                        s.spielZeit = base;
                                        const anteil = (img) => (maske.length ? (100 * maske.filter((i) => diff(img, ohne, i) > 24).length) / maske.length : null);
                                        Object.assign(s4, { maske: maske.length, pixelVor: r3(anteil(vor)), pixelNach: r3(anteil(nach)) });
                                    } catch (e) {
                                        s4.bildFehler = String((e && e.message) || e).slice(0, 200);
                                    } finally {
                                        if (e2 && e2.mesh) e2.mesh.visible = true;
                                        s.spielZeit = base;
                                    }
                                }
                                aus.s4 = s4;
                            }
                            // S5: Sprung 10³ Jahre — die Grabung an der Tat, die Narbe, die Akten der Orte
                            {
                                s.spielZeit = base + a.jahrtausend * JAHR;
                                const narbe = gefaellt.length ? Math.max(...gefaellt.map((p) => r._narbeAt(p.x, p.z))) : null;
                                const akten = Object.values(wm.settlementCells || {}).reduce((q, c) => q + ((c && c.akten) || []).filter((k) => k && k.t >= tFaell && /faell|bau|werk|haus|ernt/.test(String(k.type))).length, 0);
                                aus.s5 = { jahre: a.jahrtausend, werkSteht: e2 && s.architectures.includes(e2) ? 1 : 0, alter: e2 ? r._werkAlter(e2).zeit : null, narbe: r3(narbe), tatenUebrig: L0.filter((q) => fa.includes(q)).length, akten, staedte: r._staedte().length, bewohnerOrte: (r._bewohnerSiedlungen || new Map()).size, schicht: null, schichtOhne: null, tat: gefaellt.length > 0 || !!e2 };
                                s.spielZeit = base;
                            }
                            // S6: 100 Zufallspaare (Tat, Zeit) bis 10⁹ a vor und nach dem Akt
                            {
                                let sd = 20261119;
                                const rnd = () => (sd = (sd * 1103515245 + 12345) % 2147483648) / 2147483648;
                                const taten = [{ werk: true }].concat(faK);
                                const paare = [];
                                for (let i = 0; i < a.paare; i++) {
                                    const t = taten[Math.min(taten.length - 1, Math.floor(rnd() * taten.length))];
                                    const dJ = (rnd() < 0.5 ? -1 : 1) * Math.pow(10, -3 + 12 * rnd());
                                    let ok = false;
                                    let st = null;
                                    if (t.werk) {
                                        s.spielZeit = tHaus + dJ * JAHR;
                                        const da = !!e2 && s.architectures.includes(e2);
                                        st = e2 ? r._werkAlter(e2).zeit : null;
                                        ok = da === dJ >= 0;
                                    } else {
                                        s.spielZeit = tFaell + dJ * JAHR;
                                        const b = r._baumAlter(t.x, t.z);
                                        const stumpfSoll = dJ >= 0 && dJ * 8760 < t.dauerH;
                                        ok = stumpfSoll ? b < 1 : b === 1;
                                        st = b;
                                    }
                                    paare.push({ w: !!t.werk, dJ, ok, st });
                                }
                                s.spielZeit = base;
                                const w = paare.filter((p) => p.w && p.dJ >= 0).sort((p, q) => p.dJ - q.dJ);
                                const stufeFalsch = w.filter((p, i) => i && p.st < w[i - 1].st).length;
                                const richtig = paare.filter((p) => p.ok).length - stufeFalsch;
                                aus.s6 = { paare: paare.length, richtig, widersprueche: paare.length - richtig, stufeFalsch, vorAkt: paare.filter((p) => p.dJ < 0).length, zeitenVerschieden: new Set(paare.map((p) => p.dJ)).size, taten: taten.length, werkVorFalsch: paare.filter((p) => p.w && p.dJ < 0 && !p.ok).length, stumpfFalsch: paare.filter((p) => !p.w && !p.ok).length };
                            }
                            // S7: Planet B (eine andere Saat des Fadens) vor ↔ nach den Taten dieser Welt
                            {
                                const pB1 = await planetB();
                                aus.s7 = { planetB: [pB0, pB1].filter(Boolean).length, taten: gefaellt.length + geerntet.length + (gebaut.length ? 1 : 0), bAnders: pB1 !== pB0 ? 1 : 0, bOhneAnders: pB00 !== pB0 ? 1 : 0, samenB: a.samenB };
                            }
                            return aus;
                        } finally {
                            s.spielZeit = alt.sz;
                            const weg = gebaut.concat(e2 ? [e2] : []);
                            for (const e of weg) if (s.architectures.includes(e)) r.removeArchitecture(e);
                            L0.length = 0;
                            for (const q of vorTaten) L0.push(q);
                            wm.taten = L0;
                            r._tatGen = (r._tatGen | 0) + 1;
                            r._nachwuchsFaellig = alt.nf;
                            r._sukzessionNeu = alt.sn;
                            for (const p of gefaellt) {
                                r._nahStreuTat({ tat: "faellen", x: p.x, z: p.z });
                                r._waldNachwuchs(p.x - 1, p.z - 1, p.x + 1, p.z + 1);
                            }
                            for (const q of geerntet) r._nahStreuTat({ tat: "ernten", kachel: q.key, x: 0, z: 0 });
                            if (alt.hatTritt) wm.tritt = alt.tritt;
                            else delete wm.tritt;
                            s.wegeKarte = alt.wk;
                            r._trittSchwach = alt.schw;
                            r._trittSchrieb = alt.schrieb;
                            wm.nassTage = alt.nass;
                            r._naesseUhr = alt.nu;
                            s.naesse = alt.naesse;
                            r._weltUhrSprung = alt.sprung;
                            s.timeOfDay = alt.tod;
                            pm.set(alt.pos[0], alt.pos[1], alt.pos[2]);
                            if (s.weather !== alt.wetter && window.__wetterSetzen) window.__wetterSetzen(alt.wetter);
                            if (alt.sav[0]) r._scheduleEditSave = alt.sav[1];
                            else delete r._scheduleEditSave;
                            try {
                                takt(a.ruhe);
                            } catch (_e) {
                                aus.ruheFehler = String((_e && _e.message) || _e).slice(0, 120);
                            }
                            s.spielZeit = alt.sz;
                            s.timeOfDay = alt.tod;
                            s.perfRegulator = alt.perf;
                            aus.wieder = { baeume: mitte ? zaehl(mitte, R) : null, baeumeVor: aus.s1.vor, taten: wm.taten.length === vorTaten.length, arch: s.architectures.length - alt.arch, uhr: s.spielZeit === alt.sz, wetter: s.weather === alt.wetter };
                        }
                    };
                    const x = await S(seite, { faellungen: U[1].faellungen, takte: 10, pflanzen: U[2].pflanzen, jahr: U[2].jahre, reiheStunden: [0, 2, 6, 12, 24, 48, 72, 96, 144, 240, 8760], jahre: U[3].jahre, pfadGaenge: 60, pfadZellen: 10, rueckTage: U[4].rueckTage, jahrtausend: U[5].jahre, paare: U[6].paare, samenB: U[7].samenB, bild: !M.swift, ruhe: 20 });
                    if (x.fehler) throw new Error(x.fehler);
                    const [s1, s2, s3, s4, s5, s6, s7] = [x.s1, x.s2, x.s3, x.s4, x.s5, x.s6, x.s7];
                    const je = s3.je || [];
                    const spuren = je.length ? Math.min(...je.map((q) => q.prozent)) : null;
                    const r3 = (v) => (Number.isFinite(v) ? Math.round(v * 1e3) / 1e3 : null);
                    return {
                        sprossen: {
                            1: { werte: { baumAnteilProzent: s1.vor > 0 ? r3((100 * s1.nach) / s1.vor) : null, stuempfe: s1.stuempfe }, zeuge: { gefaellt: s1.gefaellt, taten: s1.taten, vor: s1.vor, nach: s1.nach, gVor: s1.gVor, gNach: s1.gNach, stunde: s1.stunde, mitte: s1.mitte, stuempfeKachel: s1.stuempfeKachel, senken: s1.senken, wieder: x.wieder } },
                            2: {
                                werte: { pflanzenZurueckProzent: s2.gepflueckt ? r3((100 * s2.zurueck) / s2.gepflueckt) : null, sukzessionsStufen: s2.steigt ? s2.stufen : 0, alterDiffTage: s2.alterReload != null && s2.alterJahr != null ? r3(Math.abs(s2.alterReload - s2.alterJahr)) : null },
                                zeuge: { gepflueckt: s2.gepflueckt, zurueck: s2.zurueck, zurueckOhne: s2.zurueckOhne, gezeichnet: s2.gezeichnet, reload: s2.reload, alterNull: s2.alterNull, alterJahr: s2.alterJahr, reihe: s2.reihe, keyJahr: s2.keyJahr, keyReload: s2.keyReload, baeumeNachJahr: s2.baeumeNachJahr },
                            },
                            3: { werte: { spurenProzent: spuren }, zeuge: { jahre: je.map((q) => q.N), spurenOhne: s3.spurenOhne, pfadNull: s3.pfadNull, je, stoffe: s3.stoffe, regler0: s3.regler0, typ: s3.typ, koerper: s3.koerper } },
                            4: {
                                werte: { werkPixelVorProzent: s4.pixelVor != null ? s4.pixelVor : undefined, werkPixelNachProzent: s4.pixelNach != null ? s4.pixelNach : undefined, werkDaVor: s4.werkDaVor, werkDaNach: s4.werkDaNach },
                                zeuge: { werk: s4.werk, rueckTag: s4.rueckTag, aktTag: s4.aktTag, maske: s4.maske || 0, bildFehler: s4.bildFehler, pfadVorGang: s4.pfadVorGang },
                                nicht: "kein Sprung rückwärts: die Welt-Uhr geht nie zurück (`_weltUhrNimm` nimmt die spätere); an der zurückgestellten Uhr (Tag " + s4.rueckTag + " vor dem Akt am Tag " + s4.aktTag + ") steht das Werk " + (s4.werkDaVor ? "da" : "nicht da") + " mit Alter " + s4.alterVor + " d (ungealtert statt abwesend), der Pfad vor seinem Gang trägt " + s4.pfadVorGang + " Zellen",
                            },
                            5: {
                                werte: { sprungJahre: s5.jahre, schichtAbweichungM: undefined, bewohnerNennen: s5.akten, narbe: s5.narbe, werkSteht: s5.werkSteht },
                                zeuge: { jahre: s5.jahre, tat: s5.tat, schicht: s5.schicht, schichtOhne: s5.schichtOhne, tatenUebrig: s5.tatenUebrig, staedte: s5.staedte },
                                nicht: "keine Schicht, keine Megastadt: nach 10³ a trägt die Taten-Liste " + s5.tatenUebrig + " der Fällungen (geheilt fällt die Tat aus der Liste), die Narbe " + s5.narbe + ", das Haus steht (" + s5.werkSteht + ") mit Alter " + s5.alter + " d als Werk, nie als Ruine; " + s5.staedte + " Städte, " + s5.akten + " Akten der Orte nennen eine Tat",
                            },
                            6: {
                                werte: { paare: s6.paare, richtigProzent: s6.paare ? r3((100 * s6.richtig) / s6.paare) : null, widersprueche: s6.widersprueche },
                                zeuge: { paare: s6.paare, zeitenVerschieden: s6.zeitenVerschieden, taten: s6.taten, vorAkt: s6.vorAkt, werkVorFalsch: s6.werkVorFalsch, stumpfFalsch: s6.stumpfFalsch, stufeFalsch: s6.stufeFalsch },
                                nicht: "Milliarden Taten auf jedem Planeten: die Taten leben nur in der EINEN Welt (" + s6.taten + " in der Fahrt), kein Planet des Fadens trägt eine Tat; von " + s6.paare + " Paaren " + s6.werkVorFalsch + " mit dem Werk vor seinem Akt, " + s6.stumpfFalsch + " mit einem Baum ohne seinen Stumpf",
                            },
                            7: {
                                werte: { taten: s7.taten, sichtbarRichtigProzent: s7.taten ? (100 * (s7.bAnders ? 1 : 0)) : null },
                                zeuge: { planetB: s7.planetB, taten: s7.taten, bOhneAnders: s7.bOhneAnders, bAnders: s7.bAnders },
                                nicht: "keine Tat reist zwischen Welten: Planet B (Saat " + s7.samenB + ") antwortet nach " + s7.taten + " Taten dieser Welt " + (s7.bAnders ? "anders" : "byte-gleich") + " — planet-ort nimmt samen, breite, laenge, zeitMa, keine Tat, kein Licht, kein Signal",
                            },
                        },
                    };
                },
                sprossen: {
                    1: {
                        u: { faellungen: 10, stunden: 1 },
                        soll: [K.soll(ZR, 1, "Baum-Anteil ≤ 30 %", { key: "baumAnteilProzent", einheit: "%" }), K.soll(ZR, 1, "Stümpfe sichtbar", { key: "stuempfe", rel: "≥", zahl: 10, quelleFeld: "umfang", quelleWort: "10 Fällungen" })],
                        zeuge: zeugeLichtung,
                        zeugeText: "zehn Fällungen über die Ernte, Taten im Feld, der Gegenlauf ohne Fällung bleibt Wald",
                        taeter: "stamm/werkstatt-bauen.js harvestArchitecture · stamm/vegetation-wiese.js `_tatStuempfe` (der Stumpf der Tat)",
                        gruen: { werte: { baumAnteilProzent: 16.7, stuempfe: 10 }, zeuge: LICHTUNG_Z },
                        attrappen: [
                            { name: "Anteil 16,7 % ohne gefällten Baum (nur gezählt)", roh: { werte: { baumAnteilProzent: 16.7, stuempfe: 10 }, zeuge: Object.assign({}, LICHTUNG_Z, { gefaellt: 0, taten: 0 }) } },
                            { name: "der Gegenlauf ohne Fällung lichtet ebenso (die Stunde, nicht die Tat)", roh: { werte: { baumAnteilProzent: 16.7, stuempfe: 10 }, zeuge: Object.assign({}, LICHTUNG_Z, { gNach: 2 }) } },
                        ],
                    },
                    2: {
                        u: { jahre: 1, pflanzen: 10, reload: "Stand geschrieben und gelesen" },
                        soll: [
                            K.soll(ZR, 2, "Pflanzen zurück", { key: "pflanzenZurueckProzent", rel: "≥", zahl: 100, einheit: "%", refQuelle: "alle gepflückten Pflanzen nach dem Spieljahr (Beleg der Karte: 138/138, feld.K4 · stoffe.K5)" }),
                            K.soll(ZR, 2, "Sukzessions-Reihe", { key: "sukzessionsStufen", rel: "≥", zahl: 3, refQuelle: "eine Reihe: Stumpf, Jungwuchs, Baum — mindestens drei steigende Stufen der Sukzession (vegetation-wiese `_sukzession`, SUKZESSION.jugend)" }),
                            K.soll(ZR, 2, "Alter nach Reload gleich", { key: "alterDiffTage", rel: "=", zahl: 0, einheit: "d", refQuelle: "gleich: das Alter des Werks vor dem Reload minus nach dem Lesen des Stands = 0 Tage" }),
                        ],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.gepflueckt >= 5)) return "nur " + (z.gepflueckt || 0) + " Pflanzen gepflückt";
                            if (!(z.zurueckOhne < z.zurueck)) return "die Pflanzen sind auch ohne das Jahr zurück (" + z.zurueckOhne + " von " + z.gepflueckt + "): keine Ernte in der Welt";
                            if (z.reload !== true) return "kein Reload: das Werk stand nicht aus dem Stand wieder auf";
                            if (!(z.alterJahr > z.alterNull)) return "das Werk altert im Jahr nicht (" + z.alterNull + " → " + z.alterJahr + " d)";
                            return null;
                        },
                        zeugeText: "gepflückt, ein Jahr geheilt, das Werk aus dem Stand wieder aufgestanden",
                        taeter: "stamm/vegetation-wiese.js `_tickScatterRegrow` · stamm/siedlung-satz.js `_werkAlter` · stamm/speicher-laden.js `_bauAusStand`",
                        gruen: { werte: { pflanzenZurueckProzent: 100, sukzessionsStufen: 5, alterDiffTage: 0 }, zeuge: { gepflueckt: 10, zurueck: 10, zurueckOhne: 0, reload: true, alterNull: 0, alterJahr: 365 } },
                        attrappen: [
                            { name: "Alter gleich ohne Reload (dasselbe Werk zweimal gelesen)", roh: { werte: { pflanzenZurueckProzent: 100, sukzessionsStufen: 5, alterDiffTage: 0 }, zeuge: { gepflueckt: 10, zurueck: 10, zurueckOhne: 0, reload: false, alterNull: 0, alterJahr: 365 } } },
                            { name: "Pflanzen zurück ohne Sprung (nie gepflückt)", roh: { werte: { pflanzenZurueckProzent: 100, sukzessionsStufen: 5, alterDiffTage: 0 }, zeuge: { gepflueckt: 10, zurueck: 10, zurueckOhne: 10, reload: true, alterNull: 0, alterJahr: 365 } } },
                            { name: "das Werk altert nicht (0 = 0 nach dem Reload)", roh: { werte: { pflanzenZurueckProzent: 100, sukzessionsStufen: 5, alterDiffTage: 0 }, zeuge: { gepflueckt: 10, zurueck: 10, zurueckOhne: 0, reload: true, alterNull: 0, alterJahr: 0 } } },
                        ],
                    },
                    3: {
                        u: { jahre: [10, 100] },
                        soll: [K.soll(ZR, 3, "alle Spuren gleichzeitig", { key: "spurenProzent", rel: "≥", zahl: 100, einheit: "%", refQuelle: "alle = die vier Spuren der Tiefe (Bau gealtert, Pfad verfestigt, Lichtung Wald, Name am Ort) zugleich, bei 10 und bei 100 Jahren" })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(Array.isArray(z.jahre) && z.jahre.includes(10) && z.jahre.includes(100))) return "der Sprung spannte nicht 10 und 100 Jahre (" + JSON.stringify(z.jahre) + ")";
                            if (!(z.pfadNull > 0)) return "kein Pfad getreten (0 Zellen vor dem Sprung)";
                            if (!(z.spurenOhne < ((roh.werte || {}).spurenProzent || 0))) return "der Gegenlauf ohne Sprung zeigt dieselben Spuren (" + z.spurenOhne + " %)";
                            return null;
                        },
                        zeugeText: "Haus, Pfad und Lichtung vor dem Sprung jung, nach 10 und 100 Jahren gealtert",
                        taeter: "stamm/siedlung-wege.js `_trittErholen` (der Pfad erholt sich, nie fest) · kein Leser eines Namens am Ort",
                        leser: "stamm/siedlung-wege.js:1764 `_trittErholen` — der Pfad erholt sich in `TRITT.erholTage`, kein Gang verfestigt ihn; stamm/siedlung-satz.js:795 `_werkAlter` — das Alter des Werks; kein Leser nennt einen Ort beim Namen",
                        unklar: "„im Soll ihrer Leiter“ nennt keine Leiter je Spur — Vorschlag: je Spur ihr Soll als Zahl (Werk-Stufe > 0, Pfad-Stufe ≥ der des Gangs, Baum-Alter 1 am Stumpf, ein Name am Ort) bei 10 und 100 Jahren.",
                        gruen: { werte: { spurenProzent: 100 }, zeuge: { jahre: [10, 100], spurenOhne: 25, pfadNull: 10 } },
                        attrappen: [
                            { name: "alle Spuren schon ohne Sprung", roh: { werte: { spurenProzent: 100 }, zeuge: { jahre: [10, 100], spurenOhne: 100, pfadNull: 10 } } },
                            { name: "kein Pfad getreten", roh: { werte: { spurenProzent: 100 }, zeuge: { jahre: [10, 100], spurenOhne: 25, pfadNull: 0 } } },
                            { name: "nur 10 Jahre gesprungen", roh: { werte: { spurenProzent: 100 }, zeuge: { jahre: [10], spurenOhne: 25, pfadNull: 10 } } },
                        ],
                    },
                    4: {
                        u: { rueckTage: 1 },
                        soll: [K.soll(ZR, 4, "Werk-Pixel 0 %", { key: "werkPixelVorProzent", rel: "=", zahl: 0, einheit: "%" }), K.soll(ZR, 4, "≥ 95 %", { key: "werkPixelNachProzent", einheit: "%" })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (z.werk !== true) return "kein Werk gebaut";
                            if (!(z.rueckTag < z.aktTag)) return "die Uhr ging nicht vor den Akt (Tag " + z.rueckTag + " ↔ Akt " + z.aktTag + ")";
                            if (!(z.maske > 0)) return "keine Werk-Pixel im Bild (die Maske mit ↔ ohne Werk ist leer)";
                            return null;
                        },
                        zeugeText: "die Uhr vor dem Akt, die Werk-Maske aus dem Bild mit ↔ ohne Werk",
                        taeter: "stamm/siedlung-satz.js `_werkAlter` (die Zeit klemmt auf 0) · stamm/dirigent-takt.js `_weltUhrNimm` (kein Sprung zurück)",
                        nicht: "kein Sprung rückwärts; ein Werk vor seinem Akt steht ungealtert da",
                        leser: "stamm/siedlung-satz.js:795 `_werkAlter` — die Zeit klemmt auf 0 (Math.max), kein Werk fehlt vor seiner Geburt; stamm/dirigent-takt.js:1784 `_weltUhrNimm` — die Uhr geht nie zurück",
                        gruen: { werte: { werkPixelVorProzent: 0, werkPixelNachProzent: 98 }, zeuge: { werk: true, rueckTag: -1, aktTag: 0, maske: 900 } },
                        attrappen: [
                            { name: "0 % ↔ 98 % ohne Werk-Maske (kein Bild)", roh: { werte: { werkPixelVorProzent: 0, werkPixelNachProzent: 98 }, zeuge: { werk: true, rueckTag: -1, aktTag: 0, maske: 0 } } },
                            { name: "die Uhr ging nicht zurück", roh: { werte: { werkPixelVorProzent: 0, werkPixelNachProzent: 98 }, zeuge: { werk: true, rueckTag: 0, aktTag: 0, maske: 900 } } },
                        ],
                    },
                    5: {
                        u: { jahre: 1000, megastadt: true },
                        soll: [
                            K.soll(ZR, 5, "Grabung bei t+1000", { key: "sprungJahre", rel: "≥", zahl: 1000, einheit: "a" }),
                            K.soll(ZR, 5, "Schicht ±1 m", { key: "schichtAbweichungM", einheit: "m", ref: 0, refQuelle: "die Tiefe, in der die Tat liegt (Abweichung 0 m in derselben Fahrt)" }),
                            K.soll(ZR, 5, "Bewohner nennen sie", { key: "bewohnerNennen", rel: "≥", zahl: 1, refQuelle: "mindestens ein Bewohner nennt die Tat (der Richter verlangt die Nennung)" }),
                        ],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.jahre >= 1000)) return "der Sprung spannte " + (z.jahre || 0) + " Jahre";
                            if (z.tat !== true) return "keine Tat in der Welt (die Grabung trifft nichts Getanes)";
                            if (z.schichtOhne != null) return "die Grabung ohne Tat trifft dieselbe Schicht (" + z.schichtOhne + " m)";
                            return null;
                        },
                        zeugeText: "die Tat geschah, 10³ a gesprungen, die Grabung ohne Tat leer",
                        taeter: "stamm/vegetation-wiese.js `_tickScatterRegrow` (die geheilte Tat fällt) · stamm/siedlung-bewohner.js `_bewohnerZeuge` (die Akte altert aus)",
                        nicht: "keine Schicht, keine Megastadt",
                        leser: "stamm/vegetation-wiese.js:2468 `_tickScatterRegrow` — die geheilte Tat fällt aus der Liste, keine Schicht bleibt; stamm/siedlung-bewohner.js:2170 aktenMax — die Akte altert aus, kein Bewohner nennt eine Tat",
                        gruen: { werte: { sprungJahre: 1000, schichtAbweichungM: 0.4, bewohnerNennen: 3 }, zeuge: { jahre: 1000, tat: true, schichtOhne: null } },
                        attrappen: [
                            { name: "Schicht ±0,4 m ohne Tat", roh: { werte: { sprungJahre: 1000, schichtAbweichungM: 0.4, bewohnerNennen: 3 }, zeuge: { jahre: 1000, tat: false, schichtOhne: null } } },
                            { name: "die Grabung ohne Tat trifft dieselbe Schicht", roh: { werte: { sprungJahre: 1000, schichtAbweichungM: 0.4, bewohnerNennen: 3 }, zeuge: { jahre: 1000, tat: true, schichtOhne: 0.4 } } },
                        ],
                    },
                    6: {
                        u: { paare: 100, jahreBis: 1e9 },
                        soll: [
                            K.soll(ZR, 6, "N = 100 Zufallspaare", { key: "paare", rel: "≥", zahl: 100 }),
                            K.soll(ZR, 6, "richtige Sichtbarkeit und Alters-Stufe = 100 %", { key: "richtigProzent", rel: "=", zahl: 100, einheit: "%" }),
                            K.soll(ZR, 6, "Widersprüche = 0", { key: "widersprueche", rel: "=", zahl: 0 }),
                        ],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.paare >= 100)) return "nur " + (z.paare || 0) + " Paare gefragt";
                            if (!(z.zeitenVerschieden >= 50)) return "die Paare tragen " + (z.zeitenVerschieden || 0) + " Zeiten (kein Zufall über die Geschichte)";
                            if (!(z.taten >= 2)) return "nur " + (z.taten || 0) + " Taten in den Paaren";
                            if (!(z.vorAkt >= 10)) return "nur " + (z.vorAkt || 0) + " Paare vor dem Akt (rückwärts nie gefragt)";
                            return null;
                        },
                        zeugeText: "100 Paare über 10⁻³…10⁹ a vor und nach dem Akt, Werk und Stümpfe",
                        taeter: "stamm/vegetation-wiese.js `_baumAlter` · stamm/siedlung-satz.js `_werkAlter` (kein Werk fehlt vor seinem Akt)",
                        nicht: "Milliarden Taten auf jedem Planeten",
                        leser: "stamm/vegetation-wiese.js:2468 `_tickScatterRegrow` — die geheilte Tat fällt aus der Liste (ein Sprung zurück findet keinen Stumpf); stamm/siedlung-satz.js:795 `_werkAlter` — kein Werk fehlt vor seinem Akt; voxel-worker.js:1446 planetOrtAuftrag — kein Planet trägt eine Tat",
                        gruen: { werte: { paare: 100, richtigProzent: 100, widersprueche: 0 }, zeuge: { paare: 100, zeitenVerschieden: 100, taten: 11, vorAkt: 48 } },
                        attrappen: [
                            { name: "100 % aus einer Zeit (kein Sprung)", roh: { werte: { paare: 100, richtigProzent: 100, widersprueche: 0 }, zeuge: { paare: 100, zeitenVerschieden: 1, taten: 11, vorAkt: 48 } } },
                            { name: "nur Paare nach der Tat (rückwärts nie gefragt)", roh: { werte: { paare: 100, richtigProzent: 100, widersprueche: 0 }, zeuge: { paare: 100, zeitenVerschieden: 100, taten: 11, vorAkt: 0 } } },
                        ],
                    },
                    7: {
                        u: { samenB: "same-saat-0", taten: 100 },
                        soll: [
                            K.soll(ZR, 7, "100 Taten", { key: "taten", rel: "≥", zahl: 100 }),
                            K.soll(ZR, 7, "Sichtbarkeit auf B zur richtigen Zeit", { key: "sichtbarRichtigProzent", rel: "≥", zahl: 100, einheit: "%", refQuelle: "jede der 100 Taten auf B nach ihrer Laufzeit sichtbar, nie davor (der Richter nennt keine Quote: alle)" }),
                        ],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.planetB >= 2)) return "Planet B antwortete nicht vor und nach den Taten";
                            if (!(z.taten >= 1)) return "keine Tat auf A";
                            if (z.bOhneAnders) return "Planet B ändert sich auch ohne Tat (Rauschen, keine Kopplung)";
                            return null;
                        },
                        zeugeText: "Planet B vor ↔ nach den Taten, ohne Tat ruhig",
                        taeter: "voxel-worker.js planetOrtAuftrag (keine Tat einer anderen Welt im Eingang)",
                        nicht: "keine Tat reist zwischen Welten",
                        leser: "voxel-worker.js:1446 planetOrtAuftrag — nimmt samen, breite, laenge, zeitMa, keine Tat einer anderen Welt, kein Licht, kein Signal",
                        gruen: { werte: { taten: 100, sichtbarRichtigProzent: 100 }, zeuge: { planetB: 2, taten: 100, bOhneAnders: 0 } },
                        attrappen: [
                            { name: "100 % ohne Planet B", roh: { werte: { taten: 100, sichtbarRichtigProzent: 100 }, zeuge: { planetB: 0, taten: 100, bOhneAnders: 0 } } },
                            { name: "B ändert sich auch ohne Tat", roh: { werte: { taten: 100, sichtbarRichtigProzent: 100 }, zeuge: { planetB: 2, taten: 100, bOhneAnders: 1 } } },
                        ],
                    },
                },
            },

            // ════════ same.kopplung.terraform — Technik formt den Planeten ════════
            [TF]: {
                sek: 20,
                faecher: true,
                pfad: ["stamm/bild-himmel.js", "stamm/wasser-hydro.js", "stamm/gelaende-chunks.js", "stamm/siedlung-ort.js", "voxel-worker.js", "planet-core.js", "gelaende-core.js", "fachwerk-core.js", "foundry-core.js"],
                ungefahren: "die Bilder (S1 Bildpaar über der Stadt, S3 die ungewollte Folge, S5 die Folge der Halte, S6 das Orbitbild der Fremdwelt-Probe R10) schießt nur das Gerät",
                mess: async function (H, U, M) {
                    const S = (fn, a) => H.seite("return await (" + String(fn) + ")(r, T, " + JSON.stringify(a || {}) + ");");
                    const seite = async (r, T, a) => {
                        const s = r.state;
                        const wm = s.worldMeta || {};
                        const pm = s.playerMesh.position;
                        const r3 = (v) => (Number.isFinite(v) ? Math.round(v * 1e3) / 1e3 : null);
                        await r._fadenQuelle();
                        const an = await r._planetAnker();
                        const [B, L] = [(an.breite * 180) / Math.PI, (an.laenge * 180) / Math.PI];
                        const samen = r._planetSamen();
                        const ort = (sa, b, l, z) => r._planetAuftrag({ type: "planet-ort", samen: sa, breite: b, laenge: l, zeitMa: z });
                        const aus = {};
                        // S1: der Regen — das Feld des Worts (der EINE Leser `_weatherFieldFor`, ohne Ort) an Ziel und Lee, das Wort des
                        // Regens als einziges Werkzeug; der Planet trägt den Regen je Lage (planet-ort regenQuote), zweimal gefragt
                        const wort = s.weather;
                        const feld = (w) => r._weatherFieldFor(w, true).rain;
                        const zO = await ort(samen, B, L, 0);
                        const lO = await ort(samen, B, L + a.leeGrad, 0);
                        const zO2 = await ort(samen, B, L, 0);
                        aus.s1 = { wort, eingriff: a.eingriff, zielMit: feld(a.eingriff), zielOhne: feld(wort), leeMit: feld(a.eingriff), leeOhne: feld(wort), planetZiel: r3(zO.delta.wetter.regenQuote), planetLee: r3(lO.delta.wetter.regenQuote), gegen: r3(zO2.delta.wetter.regenQuote - zO.delta.wetter.regenQuote), leeGrad: a.leeGrad };
                        // S2: die Wüste — der trockenste Land-Ort im Kreis 4° um den Anker, Sprung +100 a im Faden (der Gegenlauf ohne Eingriff)
                        const pts = [[B, L]];
                        for (let i = 0; i < a.wuestePunkte; i++) pts.push([B + 4 * Math.sin((i * 2 * Math.PI) / a.wuestePunkte), L + 4 * Math.cos((i * 2 * Math.PI) / a.wuestePunkte)]);
                        const O0 = await Promise.all(pts.map(([b, l]) => ort(samen, b, l, 0)));
                        let w = -1;
                        O0.forEach((o, i) => {
                            if (o.land && (w < 0 || o.delta.wetter.regenQuote < O0[w].delta.wetter.regenQuote)) w = i;
                        });
                        if (w >= 0) {
                            const o0 = O0[w];
                            const o1 = await ort(samen, pts[w][0], pts[w][1], a.jahre * 1e-6);
                            const decke = [r3(o0.delta.wuchs.decke), r3(o1.delta.wuchs.decke)];
                            aus.s2 = { punkte: O0.length, wueste: pts[w].map(r3), regen: r3(o0.delta.wetter.regenQuote), decke, wald: [r3(o0.delta.wuchs.wald), r3(o1.delta.wuchs.wald)], kueste: [r3(o0.kuesteKm), r3(o1.kuesteKm)], land: [o0.land, o1.land], sprung: a.jahre, neuesUfer: o1.kuesteKm < o0.kuesteKm - 1 && o1.delta.wuchs.decke > o0.delta.wuchs.decke ? 1 : 0, bleibt: Math.abs(o1.delta.wuchs.decke - o0.delta.wuchs.decke) <= 0.01 ? 1 : 0, mitOhne: 0 };
                        } else aus.s2 = { punkte: O0.length, fehler: "kein Land-Ort im Kreis 4° um den Anker" };
                        // S3: das Klima — die Antwort des Fadens über 100 a ohne Eingriff am Anker, die Temperatur am Spieler
                        const k0 = await ort(samen, B, L, 0);
                        const k1 = await ort(samen, B, L, a.jahre * 1e-6);
                        const glieder = (o) => Object.keys(o).concat(Object.keys(o.delta || {}), Object.keys((o.delta && o.delta.klima) || {})).filter((k) => /co2|aerosol|spiegel|albedo|kohlen|eingriff|techn|ziv/i.test(k)).length;
                        aus.s3 = { dSommerK: r3(k1.delta.klima.sommer - k0.delta.klima.sommer), dWinterK: r3(k1.delta.klima.winter - k0.delta.klima.winter), tempHier: r3(r._temperaturAt(r._voxelSurfaceY(pm.x, pm.z), 0)), eingriffe: glieder(k0) + glieder(k1), jahre: a.jahre };
                        // S4: Industrie im All — die Bücher der Foundry, die Städte, das Wachstum der Orte
                        const rec = Object.keys((r._foundry && r._foundry.recipes) || {});
                        const cells = Object.values(wm.settlementCells || {});
                        aus.s4 = { buecher: rec.length, aufzuege: rec.filter((k) => /aufzug|elevator|asteroid|orbit|rakete|raumschiff|weltraum/i.test(k)).length, staedte: r._staedte().length, orte: cells.length, wachsend: cells.filter((c) => c && c.wachs).length, bauten: s.architectures.length };
                        // S5: zehn Halte über 10⁴ a am Anker — Meeresspiegel, Bewuchs, Höhe, Luftdruck (wenn der Faden ihn trägt)
                        const halte = await Promise.all(Array.from({ length: a.halte }, (_, k) => ort(samen, B, L, ((k * a.jahre5) / (a.halte - 1)) * 1e-6)));
                        const reihe = halte.map((o) => [r3(o.delta.meer.waterLevelM), r3(o.delta.wuchs.decke), r3(o.hoeheM), o.delta.luft || o.delta.druck || null]);
                        aus.s5 = { halte: halte.length, reihe, druck: reihe.filter((q) => q[3] != null).length, meerWechsel: new Set(reihe.map((q) => q[0])).size, deckeWechsel: new Set(reihe.map((q) => q[1])).size, jahre: a.jahre5 };
                        // S6: 100 Saaten am Anker, je Saat das Paar Zeit 0 ↔ 300 a (der Gegenlauf je Saat ohne Eingriff)
                        const S6 = await Promise.all(
                            Array.from({ length: a.saaten }, async (_, i) => {
                                const sa = "same-saat-" + i;
                                const o0 = await ort(sa, B, L, 0);
                                const o1 = await ort(sa, B, L, 0.0003);
                                return [o0.hoeheM, glieder(o0) + glieder(o1), o1.hoeheM !== o0.hoeheM ? 1 : 0];
                            })
                        );
                        const hm = S6.reduce((q, x) => q + x[0], 0) / S6.length;
                        aus.s6 = { n: S6.length, streuungM: r3(Math.sqrt(S6.reduce((q, x) => q + (x[0] - hm) * (x[0] - hm), 0) / S6.length)), eingriffe: S6.filter((x) => x[1] > 0).length, zeitAendert: S6.reduce((q, x) => q + x[2], 0) };
                        return aus;
                    };
                    const x = await S(seite, { eingriff: U[1].eingriff, leeGrad: U[1].leeGrad, wuestePunkte: 24, jahre: U[2].jahre, halte: U[5].halte, jahre5: U[5].jahre, saaten: U[6].saaten });
                    // S1 AM FÄCHER (M4): der Regen, den das Spiel AM ORT liest (`_wetterFeldAm`, stamm/bild-himmel.js:3059 am Kopf main 60e8909d,
                    // wetter-am-ort; phyto-core.js:4971 wetterFeldAm: das Wort am Spieler ist sein Eingriff, es gilt bis hierM und läuft in die
                    // Natur aus, den Regen, den es zieht, gibt das Lee windab her) an 5 Orten im Ziel (der Kern um den Spieler), 5 im Lee
                    // (windab längs der Grundrichtung der Fronten `windGrund` im Abstand `WETTER_ORT.leeM`), 3 fern (quer, 30 km: der
                    // Gegenort, den kein Eingriff erreicht) und dem Lee der Karte (leeGrad windab) × ohne ↔ mit Eingriff. „ohne“: der Eingriff
                    // steht fern (der Spieler 200 km versetzt, im finally zurück) — am Ort spricht die Natur; „mit“: das Wort des Eingriffs am
                    // Spieler (`__wetterSetzen` → `_setWeather`, scripts/lib/ausgabe-aufnahme.cjs:156; im finally zurück). Am Mess-Kopf 8544438f
                    // fehlt `_wetterFeldAm`: dort nennt jede Adresse ihr Fehlen (der Regen ist EIN Wort der Welt, :3009 `_weatherFieldFor`)
                    const REGEN_AN = async (r, T, a, mit) => {
                        const s = r.state;
                        if (typeof r._wetterFeldAm !== "function") return { fehlt: "kein Feld am Ort: stamm/bild-himmel.js:3009 _weatherFieldFor (Mess-Kopf 8544438f) ist EIN Wort der ganzen Welt, :3032 _wetterAmOrt das Wort der Front ohne Eingriff — kein _wetterFeldAm, das den Regen EINER Region lenkt und das Lee zahlen lässt (main 60e8909d stamm/bild-himmel.js:3059)" };
                        if (typeof window.__wetterSetzen !== "function") return { fehlt: "die Bühne trägt kein window.__wetterSetzen (scripts/lib/ausgabe-aufnahme.cjs:2263)" };
                        const pm = s.playerMesh.position;
                        const [x, z] = a.ort;
                        const w0 = s.weather, p0 = [pm.x, pm.z];
                        try {
                            if (a.zeit.k === "ohne") {
                                pm.x = p0[0] + mit.wegM;
                                pm.z = p0[1] + mit.wegM;
                            } else if (window.__wetterSetzen(mit.eingriff) !== mit.eingriff) return { fehlt: "das Wort des Eingriffs " + mit.eingriff + " gilt nicht (__wetterSetzen)" };
                            const f = r._wetterFeldAm(x, z);
                            return { regen: f.rain, hier: f.hier, lee: f.lee, wort: s.weather };
                        } finally {
                            pm.x = p0[0];
                            pm.z = p0[1];
                            if (s.weather !== w0) window.__wetterSetzen(w0);
                        }
                    };
                    let R1t = null, lage = null;
                    try {
                        lage = await H.seite("const s = r.state, p = s.playerMesh.position, P = globalThis.__phytoCore || {}; const W = P.WETTER_ORT || null; let g = null; if (typeof P.windGrund === \"function\") g = P.windGrund(AnazhRealm._saatVon(s.worldMeta || {})); if (!g) { const w = r._windAt(p.x, p.z, r._bildZeit); const n = Math.hypot(w.x, w.z) || 1; g = { x: w.x / n, z: w.z / n }; } return { x: p.x, z: p.z, gx: g.x, gz: g.z, leeM: W ? W.leeM : null, kernM: W ? W.hierM[0] : null, wortOrt: r._wetterAmOrt(p.x, p.z), wort: s.weather };");
                        const leeM = lage.leeM || 13200, kernM = Math.min(1500, (lage.kernM || 3300) * 0.45), leeK = (U[1].leeGrad || 0.05) * 111000;
                        const ring = (cx, cz, typ, n, rM) => Array.from({ length: n }, (_, i) => [Math.round(cx + (i ? rM * Math.cos((i * 2 * Math.PI) / (n - 1)) : 0)), Math.round(cz + (i ? rM * Math.sin((i * 2 * Math.PI) / (n - 1)) : 0)), typ]);
                        const fern = [-1, 1, 2].map((k) => [Math.round(lage.x - lage.gz * 30000 * k), Math.round(lage.z + lage.gx * 30000 * k), "fern"]);
                        const orteT = ring(lage.x, lage.z, "ziel", 5, kernM).concat(ring(lage.x + lage.gx * leeM, lage.z + lage.gz * leeM, "lee", 5, kernM), fern, [[Math.round(lage.x + lage.gx * leeK), Math.round(lage.z + lage.gz * leeK), "karte"]]);
                        const m = (typ, k, feld) => ({ wie: "mittel", feld: feld || "regen", nur: (q) => q.ort && q.ort[2] === typ && q.zeit.k === k });
                        R1t = await FAECHER((c) => H.seite(c), {
                            gesetz: { fn: REGEN_AN, export: "stamm/bild-himmel.js:3059 _wetterFeldAm (main 60e8909d) über phyto-core.js:4971 wetterFeldAm · window.__wetterSetzen (scripts/lib/ausgabe-aufnahme.cjs:156, das Wort des Spielers)", leser: "stamm/siedlung-bewohner.js:2245 _bewohnerSoll (der Regen an der Tür) · stamm/bau-teile.js:2590 (das Gefäß im Regen) · stamm/stoff-material.js:376 _windAt (main 60e8909d)" },
                            adressen: { orte: orteT, zeiten: [{ k: "ohne" }, { k: "mit" }] },
                            mit: { eingriff: U[1].eingriff, wegM: 200000 },
                            ms: 8000,
                            masse: { zielOhne: m("ziel", "ohne"), zielMit: m("ziel", "mit"), leeOhne: m("lee", "ohne"), leeMit: m("lee", "mit"), fernOhne: m("fern", "ohne"), fernMit: m("fern", "mit"), karteOhne: m("karte", "ohne"), karteMit: m("karte", "mit"), hierZiel: m("ziel", "mit", "hier"), leeAnteil: m("lee", "mit", "lee"), orte: { wie: "anzahl", feld: "regen", nur: (q) => q.zeit.k === "ohne" && q.ort && (q.ort[2] === "ziel" || q.ort[2] === "lee") }, mitWorte: { wie: "verschieden", feld: "wort", nur: (q) => q.zeit.k === "mit" } },
                            schlecht: { feld: "regen", richtung: "max" },
                            ungemessen: ["das Bildpaar über der Stadt mit ↔ ohne Eingriff (am Gerät)"],
                        });
                    } catch (e) {
                        R1t = { werte: {}, fehlt: null, fehltAn: [], akte: "der Fächer warf: " + String((e && e.message) || e).slice(0, 160) };
                    }
                    const w1t = R1t.werte;
                    const dt = (p, q) => (Number.isFinite(p) && Number.isFinite(q) ? Math.round((p - q) * 1e3) / 1e3 : null);
                    const ohneT = (w1t.zielOhne || 0) + (w1t.leeOhne || 0);
                    // das Wort der Natur am Spieler und das Wort mit Eingriff: der Zeuge verlangt, dass der Eingriff das Wort wirklich wechselt
                    const wortOhne = lage ? lage.wortOrt : undefined;
                    const wortMit = (R1t.je || []).filter((q) => q.a.zeit && q.a.zeit.k === "mit").map((q) => q.w.wort)[0];
                    const bild = await M.auge("same-terraform", { ort: "wiese" });
                    const [s1, s2, s3, s4, s5, s6] = [x.s1 || {}, x.s2 || {}, x.s3 || {}, x.s4 || {}, x.s5 || {}, x.s6 || {}];
                    const d = (p, q) => (Number.isFinite(p) && Number.isFinite(q) ? Math.round((p - q) * 1e3) / 1e3 : null);
                    const ohne = (s1.zielOhne || 0) + (s1.leeOhne || 0);
                    return {
                        sprossen: {
                            1: {
                                werte: { zielMehr: dt(w1t.zielMit, w1t.zielOhne), leeWeniger: dt(w1t.leeMit, w1t.leeOhne), bilanzVerh: ohneT > 0 ? Math.round((((w1t.zielMit || 0) + (w1t.leeMit || 0)) / ohneT) * 1e3) / 1e3 : null },
                                zeuge: { wort: wortOhne, eingriff: wortMit, wunsch: U[1].eingriff, faecherOrte: w1t.orte || 0, fernDelta: dt(w1t.fernMit, w1t.fernOhne), karteDelta: dt(w1t.karteMit, w1t.karteOhne), hierZiel: w1t.hierZiel, leeAnteil: w1t.leeAnteil, leeM: lage && lage.leeM, zielOhne: w1t.zielOhne, zielMit: w1t.zielMit, leeOhne: w1t.leeOhne, leeMit: w1t.leeMit, eingriffFehlt: (R1t.fehltAn || []).length, planetZiel: s1.planetZiel, planetLee: s1.planetLee, gegen: s1.gegen, akte: R1t.akte },
                                auge: bild,
                                nicht: (R1t.fehlt ? R1t.fehlt + " — " : "") + "am Fächer " + (w1t.orte || 0) + " Orte mit dem Wort „" + U[1].eingriff + "“: Ziel " + w1t.zielOhne + " → " + w1t.zielMit + ", Lee (" + ((lage && lage.leeM) || "—") + " m windab) " + w1t.leeOhne + " → " + w1t.leeMit + ", fern " + w1t.fernOhne + " → " + w1t.fernMit + ", Lee der Karte (" + U[1].leeGrad + "°) " + w1t.karteOhne + " → " + w1t.karteMit + "; der Planet trägt Regen je Lage (Ziel " + s1.planetZiel + ", Lee " + s1.planetLee + ") · " + R1t.akte,
                            },
                            2: {
                                werte: { sprungJahre: s2.sprung, neuesUfer: s2.neuesUfer, wuesteBleibt: s2.bleibt },
                                zeuge: { sprung: s2.sprung, gegen: s2.bleibt, mitOhne: s2.mitOhne, punkte: s2.punkte, decke: s2.decke, kueste: s2.kueste, wueste: s2.wueste },
                                nicht: "kein Eingriff legt ein Meer an oder begrünt eine Wüste: am trockensten Land-Ort " + JSON.stringify(s2.wueste) + "° (Regen-Quote " + s2.regen + ") ändert der Sprung +100 a den Bewuchs " + JSON.stringify(s2.decke) + " und die Küste " + JSON.stringify(s2.kueste) + " km nur im Gang des Planeten — planet-ort trägt keinen Eingriff",
                            },
                            3: {
                                werte: { kJeVerdopplung: undefined, folgen: 0, gegenlaufSommerK: s3.dSommerK },
                                zeuge: s3,
                                auge: bild,
                                nicht: "keine Geo-Technik: der Faden trägt " + s3.eingriffe + " Glieder für CO₂, Aerosol oder Spiegel; ohne Eingriff ändern 100 a den Sommer am Anker um " + s3.dSommerK + " K; die Temperatur der Welt liest nur die Höhe (" + s3.tempHier + " °C am Spieler)",
                            },
                            4: {
                                werte: { bauAbfallProzent: undefined, stoffBilanzVerh: undefined, aufzuege: s4.aufzuege, staedte: s4.staedte },
                                zeuge: { aufzuege: s4.aufzuege, gekappt: false, bauMit: s4.wachsend, bauOhne: s4.wachsend, buecher: s4.buecher, orte: s4.orte },
                                nicht: "keine Industrie im All: " + s4.aufzuege + " von " + s4.buecher + " Büchern der Foundry tragen Aufzug, Asteroid oder Orbit; " + s4.staedte + " Städte, " + s4.wachsend + " von " + s4.orte + " Orten wachsen — kein Stoff fließt vom All",
                            },
                            5: {
                                werte: { halte: s5.halte, folgeRichtig: undefined, faelltZurueck: undefined, meerWechsel: s5.meerWechsel },
                                zeuge: s5,
                                auge: bild,
                                nicht: "keine tote Welt, kein Terraforming: " + s5.halte + " Halte über " + s5.jahre + " a am Anker tragen " + s5.druck + " Werte des Luftdrucks, " + s5.meerWechsel + " Stände des Meers, " + s5.deckeWechsel + " des Bewuchses — der Planet geht seinen Gang, kein Eingriff, den man abbrechen könnte",
                            },
                            6: {
                                werte: { rang: undefined, saaten: s6.n, eingriffe: s6.eingriffe },
                                zeuge: s6,
                                auge: bild,
                                nicht: "keine Zivilisation formt ihren Planeten: " + s6.eingriffe + " von " + s6.n + " Saaten tragen ein Glied eines Eingriffs (Streuung der Höhe " + s6.streuungM + " m, 300 a ändern " + s6.zeitAendert + ")",
                            },
                        },
                    };
                },
                sprossen: {
                    1: {
                        u: { eingriff: "rainy", leeGrad: 0.05, region: "Stadt" },
                        soll: [
                            K.soll(TF, 1, "Regenmenge im Zielgebiet höher", { key: "zielMehr", rel: ">", zahl: 0, refQuelle: "höher: Regen im Ziel mit Eingriff minus ohne > 0 (dieselbe Saat, derselbe Ort)" }),
                            K.soll(TF, 1, "im Lee tiefer", { key: "leeWeniger", rel: "<", zahl: 0, refQuelle: "tiefer: Regen im Lee mit Eingriff minus ohne < 0 (dieselbe Saat, derselbe Ort)" }),
                            K.soll(TF, 1, "Bilanz ±10 %", { key: "bilanzVerh", ref: 1, refQuelle: "Erde: Wolkenimpfung verlagert Niederschlag, Ziel + Lee mit ÷ ohne = 1 (WMO 2017, Weather Modification)" }),
                        ],
// ZAHL (auge-klasse.cjs): die Zahl urteilt, das Bild ist Beleg — der Zeuge verlangt die Welt hinter der Zahl
                        // der Zeuge verlangt den Fächer (≥ 10 Orte, Ziel und Lee je ohne ↔ mit), ein Feld am Ort (am Mess-Kopf 8544438f sein
                        // Fehlen beim Namen), einen fernen Gegenort, an dem der Eingriff nichts ändert (|Δ| ≤ 0,02), und ein Wort, das der
                        // Eingriff wirklich wechselt
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.faecherOrte >= 10)) return "der Fächer trug " + (z.faecherOrte || 0) + " von 10 Orten (Ziel und Lee je 5)";
                            if (z.eingriffFehlt !== 0) return "keine Fähigkeit lenkt den Regen einer Region (" + z.eingriffFehlt + " Adressen ohne Feld am Ort)";
                            if (!(Number.isFinite(z.fernDelta) && Math.abs(z.fernDelta) <= 0.02)) return "der Eingriff wirkt fern (30 km quer: Regen " + z.fernDelta + ") — kein Eingriff einer Region";
                            return typeof z.wort === "string" && typeof z.eingriff === "string" && z.wort !== z.eingriff ? null : "kein Eingriff am Wetter-Wort der Region (" + z.wort + " → " + z.eingriff + ")";
                        },
                        auge: { pose: "2 km über der Stadt, Ziel und Lee im Bild, mit ↔ ohne Eingriff an derselben Saat (heute kein Eingriff: geschossen an der Wiese)", vorbild: "Radar-Bilder geimpfter Wolken (Wolkenimpfung, WMO 2017), Prüfer-Satz R11" },
                        taeter: "stamm/bild-himmel.js `_weatherFieldFor` (Mess-Kopf 8544438f: der Regen ist ein Wort ohne Ort; main 60e8909d trägt `_wetterFeldAm`)",
                        nicht: "kein Eingriff lenkt den Regen einer Region",
                        leser: "stamm/bild-himmel.js:3009 `_weatherFieldFor` (Mess-Kopf 8544438f) — der Regen ist EIN Wort der ganzen Welt, ohne Ort; main 60e8909d stamm/bild-himmel.js:3059 `_wetterFeldAm` (phyto-core.js:4971) — das Wort am Spieler gilt in seiner Region, das Lee windab zahlt; gelesen stamm/siedlung-bewohner.js:2245",
                        gruen: { werte: { zielMehr: 0.3, leeWeniger: -0.25, bilanzVerh: 1.04 }, zeuge: { wort: "cloudy", eingriff: "rainy", faecherOrte: 10, eingriffFehlt: 0, fernDelta: 0 } },
                        attrappen: [
                            { name: "Ziel nass, Lee trocken aus einer Tafel ohne Welt", roh: { werte: { zielMehr: 0.3, leeWeniger: -0.25, bilanzVerh: 1.04 }, zeuge: {} } },
                            { name: "Mutant: das Wort der ganzen Welt (Lee nass wie das Ziel)", roh: { werte: { zielMehr: 0.3, leeWeniger: 0.3, bilanzVerh: 1.6 }, zeuge: { wort: "cloudy", eingriff: "rainy", faecherOrte: 10, eingriffFehlt: 0, fernDelta: 0 } } },
                            { name: "Mutant: der Eingriff wirkt überall (fern nass)", roh: { werte: { zielMehr: 0.3, leeWeniger: -0.25, bilanzVerh: 1.04 }, zeuge: { wort: "cloudy", eingriff: "rainy", faecherOrte: 10, eingriffFehlt: 0, fernDelta: 0.3 } } },
                            { name: "ein Ort statt zehn", roh: { werte: { zielMehr: 0.3, leeWeniger: -0.25, bilanzVerh: 1.04 }, zeuge: { wort: "cloudy", eingriff: "rainy", faecherOrte: 1, eingriffFehlt: 0, fernDelta: 0 } } },
                            { name: "ohne Fähigkeit: der Eingriff fehlt", roh: { werte: { zielMehr: 0.3, leeWeniger: -0.25, bilanzVerh: 1.04 }, zeuge: { wort: "cloudy", eingriff: "rainy", faecherOrte: 10, eingriffFehlt: 1, fernDelta: 0 } } },
                        ],
                    },
                    2: {
                        u: { flaecheKm2: 1e5, jahre: 100 },
                        soll: [
                            K.soll(TF, 2, "Sprung +100 a", { key: "sprungJahre", rel: "≥", zahl: 100, einheit: "a" }),
                            K.soll(TF, 2, "neues Ufer mit Bewuchs und Siedlung", { key: "neuesUfer", rel: "≥", zahl: 1, refQuelle: "ein neues Ufer: die Küste rückt an das Zielgebiet, dort Bewuchs und eine Siedlung (der Richter nennt keine Zahl: mindestens eins)" }),
                            K.soll(TF, 2, "die Wüste bleibt", { key: "wuesteBleibt", rel: "=", zahl: 1, refQuelle: "Gegenlauf ohne Eingriff: der Bewuchs der Wüste nach 100 a gleich (1 = bleibt)" }),
                        ],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.sprung >= 100)) return "der Sprung spannte " + (z.sprung || 0) + " Jahre";
                            if (!(z.punkte >= 10)) return "nur " + (z.punkte || 0) + " Orte des Fadens gefragt (keine Wüste gesucht)";
                            if (z.gegen == null) return "kein Gegenlauf ohne Eingriff gemessen";
                            if (!(z.mitOhne > 0)) return "der Gegenlauf ohne Eingriff zeigt dasselbe wie mit (kein Eingriff in der Welt)";
                            return null;
                        },
                        zeugeText: "die Wüste des Fadens, +100 a mit ↔ ohne Eingriff",
                        taeter: "voxel-worker.js planetOrtAuftrag (kein Eingriff im Eingang)",
                        nicht: "kein Eingriff legt ein Meer an",
                        leser: "voxel-worker.js:1446 planetOrtAuftrag — nimmt samen, breite, laenge, zeitMa: kein Meer, keine Bewässerung, keine Siedlung im Eingang",
                        gruen: { werte: { sprungJahre: 100, neuesUfer: 1, wuesteBleibt: 1 }, zeuge: { sprung: 100, gegen: 1, mitOhne: 1, punkte: 25 } },
                        attrappen: [{ name: "neues Ufer, doch mit = ohne Eingriff", roh: { werte: { sprungJahre: 100, neuesUfer: 1, wuesteBleibt: 1 }, zeuge: { sprung: 100, gegen: 1, mitOhne: 0, punkte: 25 } } }],
                    },
                    3: {
                        u: { eingriffe: ["spiegel", "aerosol", "kohlenstoff"], jahre: 100 },
                        soll: [K.soll(TF, 3, "2–5 K je Verdopplung", { key: "kJeVerdopplung", einheit: "K" }), K.soll(TF, 3, "≥ 1 ungewollte Folge im Bild", { key: "folgen" })],
// ZAHL (auge-klasse.cjs): die Zahl urteilt, das Bild ist Beleg — der Zeuge verlangt die Welt hinter der Zahl
                        zeuge: (roh) => { const z = roh.zeuge || {}; if (!(typeof z.eingriffe === "number" && z.eingriffe >= 1)) return "kein Eingriff im Faden (eingriffe " + (z.eingriffe === undefined ? "fehlt" : z.eingriffe) + ", Soll ≥ 1)"; if (!(typeof z.gegenlauf === "number" && z.gegenlauf >= 1)) return "der Gegenlauf ohne Eingriff fehlt (gegenlauf " + (z.gegenlauf === undefined ? "fehlt" : z.gegenlauf) + ", Soll ≥ 1)"; return null; },
                        auge: { pose: "Orbit über dem Kontinent des Ankers vor ↔ nach dem Eingriff (heute keine Orbit-Pose: geschossen an der Wiese)", vorbild: "Klima-Rechnung 2–5 K je CO₂-Verdopplung (IPCC AR6) und Bilder der Folge (Monsun-Karten), Prüfer-Satz R11" },
                        taeter: "voxel-worker.js planetOrtAuftrag (kein CO₂, kein Spiegel, kein Aerosol) · stamm/bild-himmel.js `_temperaturAt`",
                        nicht: "keine Geo-Technik",
                        leser: "stamm/bild-himmel.js:3063 `_temperaturAt` — liest nur Höhe und Trägheit; voxel-worker.js:1446 planetOrtAuftrag — kein CO₂, kein Spiegel, kein Aerosol im Eingang",
                        gruen: { werte: { kJeVerdopplung: 3, folgen: 1 }, zeuge: { eingriffe: 1, gegenlauf: 1 } },
                        attrappen: [{ name: "3 K aus einer Tafel ohne Faden", roh: { werte: { kJeVerdopplung: 3, folgen: 1 }, zeuge: {} } }],
                    },
                    4: {
                        u: { aufzug: 1, jahre: 10 },
                        soll: [
                            K.soll(TF, 4, "die Bautätigkeit der Stadt fällt binnen Jahren", { key: "bauAbfallProzent", rel: ">", zahl: 0, einheit: "%", refQuelle: "fällt: die Bautätigkeit nach dem Kappen unter der davor (Abfall > 0 % binnen der Jahre des Sprungs)" }),
                            K.soll(TF, 4, "Stoff-Bilanz ±20 %", { key: "stoffBilanzVerh", ref: 1, refQuelle: "Erhaltung der Masse: Stoff vom All = Stoff in der Stadt (Bilanz 1)" }),
                        ],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.aufzuege >= 1)) return "kein Aufzug in der Welt (" + (z.aufzuege || 0) + " Bücher)";
                            if (z.gekappt !== true) return "der Aufzug wurde nie gekappt (kein Gegenlauf)";
                            if (!(z.bauMit > z.bauOhne)) return "die Stadt baut gekappt so viel wie mit (" + z.bauOhne + " ↔ " + z.bauMit + ")";
                            return null;
                        },
                        zeugeText: "der Aufzug steht, gekappt fällt die Bautätigkeit",
                        taeter: "stamm/siedlung-ort.js wachstum (liest keinen Stoff aus dem All)",
                        nicht: "keine Industrie im All",
                        leser: "stamm/siedlung-ort.js:2898 wachstum — das Wachstum der Orte liest Chronik, Akten und Furcht, keinen Stoff aus dem All; kein Buch der Foundry trägt Aufzug oder Asteroid",
                        gruen: { werte: { bauAbfallProzent: 40, stoffBilanzVerh: 1.05 }, zeuge: { aufzuege: 1, gekappt: true, bauMit: 12, bauOhne: 7 } },
                        attrappen: [
                            { name: "Abfall 40 % ohne Aufzug", roh: { werte: { bauAbfallProzent: 40, stoffBilanzVerh: 1.05 }, zeuge: { aufzuege: 0, gekappt: true, bauMit: 12, bauOhne: 7 } } },
                            { name: "gekappt baut die Stadt so viel wie mit", roh: { werte: { bauAbfallProzent: 40, stoffBilanzVerh: 1.05 }, zeuge: { aufzuege: 1, gekappt: true, bauMit: 12, bauOhne: 12 } } },
                        ],
                    },
                    5: {
                        u: { jahre: 10000, halte: 10, tot: true },
                        soll: [
                            K.soll(TF, 5, "10 Halte", { key: "halte", rel: "≥", zahl: 10 }),
                            K.soll(TF, 5, "in richtiger Folge", { key: "folgeRichtig", rel: "=", zahl: 1, refQuelle: "die Folge, die die Physik verlangt: erst Druck, dann Wasser, dann Bewuchs (1 = jede Folge richtig)" }),
                            K.soll(TF, 5, "die Welt fällt zurück", { key: "faelltZurueck", rel: "=", zahl: 1, refQuelle: "Gegenlauf Eingriff abgebrochen: die Welt kehrt zum Zustand vor dem Eingriff (1 = fällt zurück)" }),
                        ],
// ZAHL (auge-klasse.cjs): die Zahl urteilt, das Bild ist Beleg — der Zeuge verlangt die Welt hinter der Zahl
                        zeuge: (roh) => { const z = roh.zeuge || {}; if (!(typeof z.halte === "number" && z.halte >= 10)) return "keine 10 Halte der Welt (halte " + (z.halte === undefined ? "fehlt" : z.halte) + ", Soll ≥ 10)"; return null; },
                        auge: { pose: "Orbit über der toten Welt an jedem der 10 Halte (heute keine tote Welt, keine Orbit-Pose: geschossen an der Wiese)", vorbild: "Terraforming-Folgen der Planetologie (Mars: Druck → Wasser → Leben, McKay 1991), Prüfer-Satz R11" },
                        taeter: "voxel-worker.js planetOrtAuftrag (kein Luftdruck, kein Eingriff)",
                        nicht: "keine tote Welt, kein Terraforming",
                        leser: "voxel-worker.js:1446 planetOrtAuftrag — trägt keinen Luftdruck und keinen Eingriff (delta: klima, meer, wetter, wuchs, wildnis)",
                        gruen: { werte: { halte: 10, folgeRichtig: 1, faelltZurueck: 1 }, zeuge: { halte: 10 } },
                        attrappen: [{ name: "zehn Halte aus einer Tafel", roh: { werte: { halte: 10, folgeRichtig: 1, faelltZurueck: 1 }, zeuge: {} } }],
                    },
                    6: {
                        u: { saaten: 100 },
                        soll: [K.soll(TF, 6, "Rang ≥ 0,7", { key: "rang" })],
                        auge: { pose: "Orbitbild je Saat vor ↔ nach dem Eingriff (heute keine Orbit-Pose: geschossen an der Wiese)", vorbild: "Fremdwelt-Probe R10: Prüfer lesen den Eingriff aus dem Orbitbild, Rang ≥ 0,7 (Prüfer-Satz R11)" },
                        taeter: "voxel-worker.js planetOrtAuftrag (kein Eingang einer Zivilisation, die formt)",
                        nicht: "keine Zivilisation formt ihren Planeten",
                        leser: "voxel-worker.js:1446 planetOrtAuftrag — kein Eingang einer Zivilisation, die formt",
                        gruen: { werte: { rang: 0.8 }, zeuge: { n: 100 } },
                        attrappen: [{ name: "Rang 0,8 ohne Orbitbild", roh: { werte: { rang: 0.8 }, zeuge: {} } }],
                    },
                },
            },
        },
    };
})());

module.exports = L.stationen();
