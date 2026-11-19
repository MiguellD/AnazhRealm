// stationen/k2-zusammenspiel.js — DIE LEITER-RICHTER DES KAPITELS zusammenspiel der Meisterkarte 2 (33 Leitern, 213 Sprossen,
// die Kopplungen, R7: jede Kopplung misst mit ihrem Gegenlauf; 18.11., Zweig richter-planet-leben-zusammenspiel). Der Kern ist der
// von k2-planet.js.
"use strict";
const K = require("./k2-planet.js").kern;
const L = K.kapitel("zusammenspiel");

// ── DIE PERSPEKTIVE zusammenspiel.same (9 Leitern, 61 Sprossen, 3 belegt: stoerung S1, kaskade S1, ereignis S1 — g1.js BRAND_SITZUNG
// und LAVA_SITZUNG): die Kopplungen über alle Kapitel, jede mit ihrem Gegenlauf (R7). Gemessen wird in der warmen Welt der Sitzung um
// den Spieler (dort stehen die Chunks): die Tat über die Wege des Spiels (der Satz `spawn_studio`, `lava`, `_brandEntfachen`, die Ernte
// `harvestArchitecture`), ihre Antwort über die Leser der Welt (`auraAt`, `_atlasWaterLevelAt`, `_forestStandDensity`, `_temperaturAt`,
// `faunaBestand`, `_sukzession`, `_werkAlter`), der Planet über den Planet-Faden (`r._planetAuftrag`, planet-ort und planet-anker) an den
// Saaten „same-saat-0…99“ (der Faden behält die Pläne je Samen: jede Leiter fragt dieselben). Jede Tat wird am Ende zurückgenommen
// (die Taten-Liste auf ihre Länge, `_tatGen`, die Decken neu gemalt, der Wald der Narbe neu gepflanzt — wie brandSeite der Linse).
L.perspektive("same", (() => {
    const A = "same.kopplung.aufwaerts";
    // DER RICHTER OHNE ZAHL (ereignis S3/S7, erdsaat S1, zeitreise S2/S3): K.soll verlangt eine Zahl im Wort, diese Richter tragen keine —
    // ihre Bedingung steht als 0/1 (oder Gleichheit) im Wort selbst; das Wort steht wörtlich im Richter, und NUR ein Richter ohne jede Zahl
    // darf diesen Weg gehen (sonst wirft er wie K.soll)
    const sollOhneZahl = (id, nr, wort, o) => {
        const r = K.sprosseVon(id, nr).richter;
        if (!r.includes(wort)) throw new Error("Soll „" + wort + "“ steht nicht wörtlich im Richter " + id + " S" + nr);
        if (K.zahlenIn(r).length) throw new Error("der Richter " + id + " S" + nr + " trägt Zahlen — K.soll, nie sollOhneZahl");
        return { wort, key: o.key, rel: o.rel, a: o.zahl, b: undefined, ref: undefined, refQuelle: undefined, einheit: o.einheit || "" };
    };

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
                        leser: "stamm/vegetation-wiese.js:2596 `_forestStandDensity` und stamm/gelaende-boden.js:1538 `_feuchteAt` — kein Leser eines gebauten Hauses im Umkreis",
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
                        leser: "stamm/vegetation-wiese.js:2596 `_forestStandDensity` — kein Eingang der Bevölkerung; stamm/siedlung-ort.js:1455 `_staedte` leer in der Welt",
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
                        leser: "stamm/bild-himmel.js:2874 `_temperaturAt(y, traegTage)` — kein Ort, keine Siedlung im Eingang",
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
                        leser: "voxel-worker.js:1175 planetOrtAuftrag(msg) — nimmt samen, breite, laenge, zeitMa, keine Tat",
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
                        leser: "stamm/bild-himmel.js:2874 `_temperaturAt` und stamm/feld-leben.js:2460 `_lavaGiessen` — die Lava schreibt nur ihre Zelle",
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
                        leser: "voxel-worker.js:1175 planetOrtAuftrag — kein Eingang für Landbau, Industrie, CO₂",
                        gruen: { werte: { plausibelProzent: 92, erwaermungK: 3 }, zeuge: PLANET_Z },
                        attrappen: [{ name: "3 K aus einer Tafel ohne Faden", roh: { werte: { plausibelProzent: 92, erwaermungK: 3 }, zeuge: { saaten: 0 } } }],
                    },
                    8: {
                        u: { planeten: 100 },
                        soll: [K.soll(A, 8, "Anteil der Planeten, die sich vom Zustand ohne Zivilisation messbar unterscheiden ≥ 80 %", { key: "anteilProzent", einheit: "%" })],
                        zeuge: zeugePlanet(100),
                        taeter: "voxel-worker.js planetOrtAuftrag (kein Zustand mit Zivilisation)",
                        nicht: "keine Fremd-Zivilisation",
                        leser: "voxel-worker.js:1175 planetOrtAuftrag — kein Eingang einer Zivilisation",
                        gruen: { werte: { anteilProzent: 86 }, zeuge: PLANET_Z },
                        attrappen: [{ name: "86 % ohne Paar mit ↔ ohne Zivilisation", roh: { werte: { anteilProzent: 86 }, zeuge: Object.assign({}, PLANET_Z, { mitOhne: 0 }) } }],
                    },
                },
            },
        },
    };
})());

module.exports = L.stationen();
