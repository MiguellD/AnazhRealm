// SPIKE KOPPLUNG — Fall I: trockene Wiese mit Wind (entscheid.md (7)). Linien-Zündung (10 Zellen = 160 m quer zu θ0) auf der
// Wiese mit Bedeckung p ≥ 0,95 nächst der Mess-Wiese, Tag-Phase 14 Uhr, Sommer (saisonNull 0,375, autoSeason aus).
// R_Kopf = Weg des Kopfs längs der mittleren Wind-Richtung zwischen 120 s und 300 s / 180 s (der Kopf: die größte Projektion
// eines Eintritts einer gefangenen Zelle, `_brandZuenden`).
//   node fall1.cjs fest   <teil>   — NACHHER: die Kopien des Gesetzes, im Kreis um die Mess-Wiese die Kontroll-Kopie (feste
//                                      Eingänge: bewoelkt, tor 0, P 0, U10, feuchte so, dass M_Gras am Herd das Ziel trifft)
//   node fall1.cjs vorher <teil>   — VORHER: die Originale; der Wind kommt aus dem Wort (foggy 2,4 · cloudy 7,2 · stormy 24 m/s)
// teil: "a" = U10 2,4 und 7,2; "b" = U10 24; "m" = die Mutanten (c) Wort und (d) Nässe bei U10 7,2, M 0,06; "p" = Punkt-Zündung
// L/B und der Preis; "s" = nur die Suche des Orts.
"use strict";
const { lauf } = require("./buehne.cjs");

// Der Ort, gefunden mit `node fall1.cjs fest s` (S.wiesenLinie, p·anteil ≥ 0,95 an allen 10 Zellen, nächst der Mess-Wiese)
const ORT = { x: -1128, z: -984 };

lauf(
    async (A) => {
        const S = window.__spike;
        S.lauschen();
        const cs = AnazhRealm.LIFE_FIELD.cell;
        const saat = S.saat();
        const g0 = __phytoCore.windGrund(saat);
        const gesetz = S.gesetz();
        const aus = { theta0: [g0.x, g0.z], tagNull: String(st.worldMeta.tagNull) };
        const tIgn = S.zeitZurPhase(14 / 24, 3600);
        aus.tIgn = tIgn;
        let ort = A.ort;
        if (!ort || A.teil === "s") {
            if (!gesetz) throw new Error("vorher braucht den Ort aus dem Gesetz-Lauf (ORT in fall1.cjs)");
            // die mittlere Wind-Richtung des Gesetzes zwischen 120 und 300 s nach der Zündung: längs ihr soll das Bett tragen
            let [mx, mz] = [0, 0];
            for (let t = tIgn + 120; t <= tIgn + 300; t++) {
                const d = __phytoCore.windRichtung(saat, t);
                (mx += d.x), (mz += d.z);
            }
            const l = Math.hypot(mx, mz);
            aus.suche = S.laufOrt(A.MESS.x, A.MESS.z, 1500, mx / l, mz / l, 0.95, A.sollM || 1500, A.pLauf || 0.95);
            aus.suche.pLauf = A.pLauf || 0.95;
            aus.nachbarLinie = S.wiesenLinie(A.MESS.x, A.MESS.z, g0.x, g0.z);
            ort = ort || aus.suche;
        }
        aus.ort = ort;
        aus.abstandMessWieseM = Math.hypot(ort.x - A.MESS.x, ort.z - A.MESS.z);
        if (A.teil === "s") return aus;
        aus.phaseIgn = r._tagPhaseAm ? r._tagPhaseAm(tIgn) : null;
        // der Spieler und die stehenden Kronen (`wegeKarte.kronen`: das Licht, das die Wiese und das Bett lesen)
        aus.spieler = A.spieler || "Mess-Wiese";
        aus.kronen = st.wegeKarte && st.wegeKarte.kronen ? st.wegeKarte.kronen.size : null;
        const yH = r._voxelSurfaceY(ort.x, ort.z);
        const [hx, hz] = [Math.floor(ort.x / cs), Math.floor(ort.z / cs)];
        const FEST_R = A.festR || 1000;
        const fest = (U10, feuchte) => {
            window.__kopplungFest = { x: A.MESS.x, z: A.MESS.z, r: FEST_R, U10, feuchte };
            r._wetterAmMerk = null;
            r._feuchteMerk = null;
        };
        const MHerd = () => r._feuchteAm((hx + 0.5) * cs, (hz + 0.5) * cs, yH, tIgn).gras;
        // die feuchte des Versuchs: Bisektion, bis M_Gras am Herd zur Zündung das Ziel trifft (M steigt mit der feuchte)
        const feuchteFuer = (U10, Mziel) => {
            let [lo, hi] = [0, 1];
            for (let i = 0; i < 30; i++) {
                const m = (lo + hi) / 2;
                fest(U10, m);
                if (MHerd() < Mziel) lo = m;
                else hi = m;
            }
            fest(U10, (lo + hi) / 2);
            return { feuchte: (lo + hi) / 2, M: MHerd() };
        };
        const WORT = { 2.4: "foggy", 7.2: "cloudy", 24: "stormy" };
        // EIN Lauf: Linien- oder Punkt-Zündung zur Zeit tIgn, 300 s Welt
        const SEG = A.segment || [40, 360]; // das Stück windab, auf dem das Bett trägt (die Suche: Lauf 400 m auf Bett)
        S.messen(["_brandSchritt", "_brandArbeit", "_brandMalen", "_brandStoff", "_brandTempo", "_lastAm", "_feuchteFenster"]);
        const brand = (punkte, bis = 300) => {
            S.leer();
            S.uhrNull();
            const t0 = performance.now();
            const n0 = S.zuenden(punkte, tIgn);
            let schritte = 0;
            S.brennenBis(tIgn + bis, () => schritte++);
            const ms = performance.now() - t0;
            // die mittlere Wind-Richtung zwischen 120 s und 300 s (die geladene Funktion `windRichtung`)
            let [mx, mz] = [0, 0];
            for (let t = tIgn + 120; t <= tIgn + 300; t += 1) {
                const d = __phytoCore.windRichtung(saat, t);
                mx += d.x;
                mz += d.z;
            }
            const l = Math.hypot(mx, mz);
            const [dx, dz] = [mx / l, mz / l];
            const P = S.protokoll;
            const k = (t, ax, az) => S.kopf(t, ort.x, ort.z, ax, az);
            const r3 = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : v);
            const MM = P.map((p) => p.M), UU = P.map((p) => p.U);
            // der Kopf je Sekunde und das Tempo auf dem tragenden Stück [SEG0, SEG1] m (die erste Sekunde ≥ SEG0 bis zur
            // ersten ≥ SEG1, sonst bis 300 s)
            const reihe = Array.from({ length: bis + 1 }, (_, s) => k(tIgn + s, dx, dz));
            const ta = reihe.findIndex((v) => v >= SEG[0]);
            let tb = reihe.findIndex((v) => v >= SEG[1]);
            if (tb < 0) tb = bis;
            const R_bett = ta >= 0 && tb > ta ? (reihe[tb] - reihe[ta]) / (tb - ta) : null;
            // die Gerade der kleinsten Quadrate durch den Kopf je Sekunde über [120, 300] s (glättet die Stufen der 16-m-Zellen)
            const gerade = (a, b) => {
                let [n, sx, sy, sxx, sxy] = [0, 0, 0, 0, 0];
                for (let q = a; q <= b; q++) {
                    const y = reihe[q];
                    if (!Number.isFinite(y)) continue;
                    (n++, (sx += q), (sy += y), (sxx += q * q), (sxy += q * y));
                }
                return n > 1 ? (n * sxy - sx * sy) / (n * sxx - sx * sx) : null;
            };
            const U = S.uhr;
            return {
                gezuendet: n0,
                zellen: P.length,
                zaehle: S.zaehle(),
                schritte,
                ms: Math.round(ms),
                windMittelGrad: r3((Math.atan2(dx, dz) * 180) / Math.PI),
                theta0Grad: r3((Math.atan2(g0.x, g0.z) * 180) / Math.PI),
                kopf120: r3(k(tIgn + 120, dx, dz)),
                kopf300: r3(k(tIgn + 300, dx, dz)),
                R_kopf: r3((k(tIgn + 300, dx, dz) - k(tIgn + 120, dx, dz)) / 180),
                R_kopf_theta0: r3((k(tIgn + 300, g0.x, g0.z) - k(tIgn + 120, g0.x, g0.z)) / 180),
                R_bett: r3(R_bett),
                R_ls: r3(gerade(120, Math.min(300, bis))),
                R_lang: bis > 300 ? r3((reihe[bis] - reihe[120]) / (bis - 120)) : undefined,
                Rz: Object.fromEntries(P.map((p) => [p.cx + "," + p.cz, p.R])),
                reihe,
                deckelAnteil: P.length ? r3(P.filter((p) => p.deckel).length / P.length) : null,
                leb: P.length ? r3(P.reduce((a, p) => a + p.leb, 0) / P.length) : null,
                bettStueck: [ta, tb, r3(reihe[ta]), r3(reihe[tb])],
                R_zelleMax: P.length ? r3(Math.max(...P.map((p) => p.R))) : null,
                M: P.length ? [r3(Math.min(...MM)), r3(MM.reduce((a, b) => a + b, 0) / MM.length), r3(Math.max(...MM))] : null,
                U10eff: P.length ? [r3(Math.min(...UU)), r3(UU.reduce((a, b) => a + b, 0) / UU.length), r3(Math.max(...UU))] : null,
                ausDemKreis: P.filter((p) => Math.hypot(p.ex - A.MESS.x, p.ez - A.MESS.z) > FEST_R).length,
                preis: {
                    zellSek: U.zellSek,
                    usJeZelleSek_tick: r3((1000 * U.tick) / U.zellSek),
                    usJeZelleSek_front: r3((1000 * (U._brandSchritt + U._brandArbeit)) / U.zellSek),
                    msMalen: r3(U._brandMalen),
                    bettNeu: U["_lastAm#"] || U["_brandStoff#"],
                    msBett: r3(U._lastAm != null ? U._lastAm : null),
                    msBrandStoff: r3(U._brandStoff),
                    msTempo: r3(U._brandTempo),
                    msFeuchte: r3(U._feuchteFenster != null ? U._feuchteFenster : null),
                    feuchteRufe: U["_feuchteFenster#"],
                },
                dx,
                dz,
            };
        };
        // CSIRO-Gras, natürliches Weideland, voll ausgehärtet (Cheney, Gould & Catchpole 1998), aus der Quelle: U10 in km/h, MC in %
        const csiro = (U10, M) => {
            const U = U10 * 3.6,
                MC = M * 100;
            const phi = MC < 12 ? Math.exp(-0.108 * MC) : U < 10 ? 0.684 - 0.0342 * MC : 0.547 - 0.0228 * MC;
            const R = U >= 5 ? (1.4 + 0.838 * Math.pow(U - 5, 0.844)) * phi : (0.054 + 0.269 * U) * phi;
            return Math.max(0, R) / 3.6;
        };
        const median = (v) => {
            const w = [...v].sort((a, b) => a - b);
            return w.length ? (w.length % 2 ? w[(w.length - 1) / 2] : (w[w.length / 2 - 1] + w[w.length / 2]) / 2) : null;
        };
        const r3a = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : v);
        // der Vergleich zweier Läufe: Kopf (Soll-Maß), Gerade, Bett-Stück, und je GLEICHER Zelle das R des Kerns (`_brandTempo`)
        const vergleich = (a, b) => {
            const gem = Object.keys(a.Rz).filter((k) => k in b.Rz && b.Rz[k] > 0);
            // DAS GEMEINSAME STÜCK: der Kopf beider Läufe auf DEMSELBEN Stück Bett [40 m, s1], s1 = min(300 m, die Reichweite beider)
            const reich = (L) => Math.max(...L.reihe.filter(Number.isFinite));
            const s1 = Math.min(300, reich(a), reich(b));
            const tAn = (L, s) => L.reihe.findIndex((v) => v >= s);
            const seg = (L) => (s1 - 40) / (tAn(L, s1) - tAn(L, 40));
            return {
                seg: [40, r3a(s1)],
                R_seg: s1 > 60 ? r3a(seg(a) / seg(b)) : null,
                R_seg_hi_lo: s1 > 60 ? [r3a(seg(a)), r3a(seg(b))] : null,
                R_kopf: r3a(a.R_kopf / b.R_kopf),
                R_ls: r3a(a.R_ls / b.R_ls),
                R_bett: a.R_bett && b.R_bett ? r3a(a.R_bett / b.R_bett) : null,
                zelleMedian: r3a(median(gem.map((k) => a.Rz[k] / b.Rz[k]))),
                zellenGemeinsam: gem.length,
            };
        };
        const linie = S.linie(ort.x, ort.z, g0.x, g0.z);
        const laeufe = (aus.laeufe = []);
        if (A.teil === "a") {
            const Us = [2.4, 7.2, 24];
            // VORHER trägt die zweite Feuchte nur über die Welt-Nässe: M = trocken 0,06 + nass 2,5 · Nässe (feld-brand.js:284, Boden 0)
            const Ms = [0.06, 0.09];
            const NAESSE_FUER = { 0.06: 0, 0.09: 0.012 };
            for (const Mziel of Ms)
                for (const U10 of Us) {
                    const L = { U10, Mziel };
                    if (gesetz) Object.assign(L, feuchteFuer(U10, Mziel));
                    else {
                        L.wort = S.wort(WORT[U10]);
                        if (Mziel === 0.06) {
                            // VORHER (a): das Wort mit der Nässe, die main ihm gibt (`_naesseTakt` eingeschwungen)
                            st.naesse = 0;
                            r._naesseTakt(3600);
                            L.naesseMain = st.naesse;
                            L.mitNaesse = brand(linie);
                            for (const k of ["Rz", "reihe"]) delete L.mitNaesse[k];
                        }
                        // VORHER (b): dasselbe Wort, die Nässe des Stubs (0 bzw. 0,012 für M 0,09) — das Tempo, das main dem Wort gibt
                        st.naesse = NAESSE_FUER[Mziel];
                        L.naesse = st.naesse;
                    }
                    Object.assign(L, brand(linie, U10 === 2.4 ? 900 : 300));
                    const Mr = L.M ? L.M[1] : null;
                    L.R_csiro = Mr != null ? r3a(csiro(U10, Mr)) : null;
                    L.zuCsiro = Mr != null ? { R_kopf: r3a(L.R_kopf / csiro(U10, Mr)), R_bett: L.R_bett ? r3a(L.R_bett / csiro(U10, Mr)) : null } : null;
                    laeufe.push(L);
                }
            const g = (U10, Mziel) => laeufe.find((L) => L.U10 === U10 && L.Mziel === Mziel);
            aus.verhaeltnis = [];
            for (const Mziel of Ms)
                for (const [hi, lo] of [
                    [7.2, 2.4],
                    [24, 7.2],
                ])
                    aus.verhaeltnis.push(Object.assign({ art: "wind", Mziel, hi, lo }, vergleich(g(hi, Mziel), g(lo, Mziel))));
            for (const U10 of Us)
                    aus.verhaeltnis.push(
                        Object.assign({ art: "feuchte", U10, M: [g(U10, 0.06).M && g(U10, 0.06).M[1], g(U10, 0.09).M && g(U10, 0.09).M[1]] }, vergleich(g(U10, 0.06), g(U10, 0.09)))
                    );
            for (const L of laeufe) (delete L.Rz, delete L.reihe);
            // DAS BETT LÄNGS DES WINDS: das kleinste leb·anteil (`_brandStoff` des geladenen Moduls) der drei mittleren Zellen quer,
            // je 16 m bis 640 m windab der Linie; bettEnde = das erste s mit Wert < 0,9 bzw. < minStoff
            {
                const L0 = laeufe[0];
                const [dx, dz] = [L0.dx, L0.dz];
                S.leer();
                const prof = [];
                for (let s = 0; s <= 640; s += 16) {
                    let m = Infinity;
                    for (const k of [-1, 0, 1]) {
                        const [px, pz] = [ort.x + s * dx - k * cs * dz, ort.z + s * dz + k * cs * dx];
                        const f = r._brandStoff(Math.floor(px / cs), Math.floor(pz / cs));
                        m = Math.min(m, f ? f.leb * f.anteil : 0);
                    }
                    prof.push([s, r3a(m)]);
                }
                aus.bettProfil = prof;
                const ende = (g) => (prof.find((q) => q[1] < g) || [Infinity])[0];
                aus.bettEnde = { unter09: ende(0.9), unterMinStoff: ende(AnazhRealm.BRAND.minStoff) };
            }
        }
        if (A.teil === "m") {
            // Die Mutanten bei U10 7,2, M 0,06: (c) das Wort stormy | sunny, (d) die Welt-Nässe 1. Im Modus "fest" schirmt der Kreis
            // `ortWetter` ab — dann misst die Mutante, ob ein ANDERER Leser das Wort oder die Nässe liest; im Modus "gesetz" (die
            // Welle selbst, kein Kreis) misst sie zusätzlich, ob `ortWetter` am Wort hängt.
            const basis = A.modus === "fest" ? feuchteFuer(7.2, 0.06) : gesetz ? { welle: true } : { wort: S.wort("cloudy") };
            const wort0 = st.weather;
            st.naesse = 0;
            const MH0 = gesetz ? MHerd() : r._brandFeuchte(0);
            const b0 = brand(linie);
            const ab = (m) => {
                const gem = Object.keys(m.Rz).filter((k) => k in b0.Rz && b0.Rz[k] > 0);
                const q = gem.map((k) => m.Rz[k] / b0.Rz[k]);
                return {
                    dR_kopf_pct: r3a((m.R_kopf / b0.R_kopf - 1) * 100),
                    zelleMax_abw_pct: q.length ? r3a(Math.max(...q.map((v) => Math.abs(v - 1))) * 100) : null,
                    zellenGemeinsam: gem.length,
                    dZellen: m.zellen - b0.zellen,
                };
            };
            laeufe.push(Object.assign({ mutante: "basis", wort: wort0, MHerd: MH0 }, basis, b0));
            for (const w of ["stormy", "sunny"]) {
                S.wort(w);
                st.naesse = 0;
                const MH = gesetz ? MHerd() : r._brandFeuchte(0);
                const m = brand(linie);
                laeufe.push(Object.assign({ mutante: "wort:" + w, wort: st.weather, MHerd: MH, dMHerd: MH - MH0 }, ab(m), m));
            }
            S.wort(wort0);
            st.naesse = 1;
            const Mn = gesetz ? MHerd() : r._brandFeuchte(0);
            const mn = brand(linie);
            laeufe.push(Object.assign({ mutante: "naesse:1", MHerd: Mn, dMHerd: Mn - MH0 }, ab(mn), mn));
            st.naesse = 0;
            for (const L of laeufe) (delete L.Rz, delete L.reihe);
        }
        if (A.teil === "p") {
            // (1) Der Preis je Bild in Fall I: Linien-Zündung bei U10 7,2, M 0,06 (vorher: das Wort cloudy, Nässe 0); nach 300 s und
            // nach 900 s (Szene A des Preises) je 120 Bilder zu 1/60 s, der echte `_tickBrand` je Bild
            if (gesetz) aus.basis = feuchteFuer(7.2, 0.06);
            else (S.wort("cloudy"), (st.naesse = 0));
            // die Auflösung der Uhr der Seite (performance.now): die kleinste Stufe > 0
            {
                let [d, a0] = [Infinity, performance.now()];
                for (let i = 0; i < 2e5; i++) {
                    const b1 = performance.now();
                    if (b1 > a0) ((d = Math.min(d, b1 - a0)), (a0 = b1));
                }
                aus.uhrAufloesungUs = r3a(d * 1000);
            }
            const bilder = (n = 120) => {
                const T = [];
                let lag = 0;
                const z0 = S.zaehle();
                const a0 = performance.now();
                for (let i = 0; i < n; i++) {
                    st.spielZeit += 1 / 60;
                    const t1 = performance.now();
                    r._tickBrand();
                    T.push((performance.now() - t1) * 1000);
                    lag = Math.max(lag, st.spielZeit - r._brandUhr);
                }
                const ges = (performance.now() - a0) * 1000;
                T.sort((x, y) => x - y);
                return {
                    saum: z0.brennt + z0.wartet,
                    zaehle: z0,
                    usJeBild_mittel: r3a(ges / n),
                    usJeBild_p95: r3a(T[Math.floor(0.95 * n)]),
                    usJeBild_max: r3a(T[n - 1]),
                    rueckstandMaxS: r3a(lag),
                };
            };
            const bl = brand(linie);
            (delete bl.Rz, delete bl.reihe);
            aus.linie300 = Object.assign({ bilder: bilder() }, bl);
            const nAlt = S.protokoll.length;
            const tA = performance.now();
            S.brennenBis(tIgn + 900);
            aus.linie900 = {
                bilder: bilder(),
                kopf900: r3a(S.kopf(tIgn + 900, ort.x, ort.z, bl.dx, bl.dz)),
                neueZellenJeS_300bis900: r3a((S.protokoll.length - nAlt) / 600),
                msWand_300bis900: Math.round(performance.now() - tA),
                usJeZelleSek_tick: r3a((1000 * S.uhr.tick) / S.uhr.zellSek),
            };
            // (2) Punkt-Zündung (Bericht): L/B nach 300 s
            const b = brand([{ x: ort.x, z: ort.z }]);
            (delete b.Rz, delete b.reihe);
            const P = S.protokoll;
            const pr = (p, ax, az) => (p.ex - ort.x) * ax + (p.ez - ort.z) * az;
            const laengs = P.map((p) => pr(p, b.dx, b.dz)),
                quer = P.map((p) => pr(p, -b.dz, b.dx));
            const L = Math.max(...laengs) - Math.min(...laengs) + cs,
                Bq = Math.max(...quer) - Math.min(...quer) + cs;
            laeufe.push(Object.assign({ art: "punkt", L_m: L, B_m: Bq, LB: L / Bq }, b));
            // (3) je NEUE Zelle: das Bett (50 Zellen längs des Winds, Cache leer) und das frische Fenster `_feuchteAm` (warm: zweiter
            // Durchgang), dazu der Memo-Treffer und der Memo-Schritt
            const zellen = Array.from({ length: 50 }, (_, k) => [Math.floor((ort.x + b.dx * 8 * k) / cs) + (k % 3), Math.floor((ort.z + b.dz * 8 * k) / cs) - (k % 2)]);
            const uhrA = (f) => {
                const t1 = performance.now();
                f();
                return (performance.now() - t1) * 1000;
            };
            const bett = [];
            for (let d = 0; d < 2; d++)
                for (const [cx, cz] of zellen) {
                    r._brandBett = null;
                    const us = uhrA(() => r._brandStoff(cx, cz));
                    if (d === 1) bett.push(us);
                }
            aus.bettJeNeueZelle = { usMedian: r3a(median(bett)), usMittel: r3a(bett.reduce((x, y) => x + y, 0) / bett.length), usMax: r3a(Math.max(...bett)), n: bett.length };
            r._brandBett = null;
            if (gesetz) {
                const fenster = (art) => {
                    const W = [],
                        N = [];
                    for (let d = 0; d < 2; d++)
                        for (const [cx, cz] of zellen) {
                            const y = r._voxelSurfaceY((cx + 0.5) * cs, (cz + 0.5) * cs);
                            r._feuchteFrisch = true;
                            let m;
                            const us = uhrA(() => (m = r._feuchteFenster(cx, cz, y, tIgn, art)));
                            r._feuchteFrisch = false;
                            if (d === 1) (W.push(us), N.push(m.schritte));
                        }
                    const ns = W.map((w, i) => (1000 * w) / N[i]);
                    return {
                        usMedian: r3a(median(W)),
                        usMittel: r3a(W.reduce((x, y) => x + y, 0) / W.length),
                        usMax: r3a(Math.max(...W)),
                        schritte: [Math.min(...N), Math.max(...N)],
                        nsJeSchrittMedian: r3a(median(ns)),
                    };
                };
                aus.fensterJeNeueZelle = { gras: fenster("gras"), laub: fenster("laub") };
                // der Memo-Treffer (dieselbe Zeit) und der Memo-Schritt (+5 s) je Zelle
                const hit = [],
                    schritt = [];
                for (const [cx, cz] of zellen) {
                    const y = r._voxelSurfaceY((cx + 0.5) * cs, (cz + 0.5) * cs);
                    r._feuchteFenster(cx, cz, y, tIgn, "gras");
                    hit.push(uhrA(() => r._feuchteFenster(cx, cz, y, tIgn, "gras")));
                    schritt.push(uhrA(() => r._feuchteFenster(cx, cz, y, tIgn + 5, "gras")));
                }
                aus.memo = { trefferUsMedian: r3a(median(hit)), schrittUsMedian: r3a(median(schritt)) };
                // (4) BITGLEICH: das Memo, das Schritt um Schritt vorschreitet, gegen das frische Fenster zur selben Zeit (Gras, Laub,
                // Film) — 50 Zellen × 41 Zeiten tIgn + 137·k (über Epochen-Grenzen)
                const zeiten = Array.from({ length: 41 }, (_, k) => tIgn + 137 * k);
                let [n, gleich, maxAbw, epochen] = [0, 0, 0, 0];
                for (const art of ["gras", "laub"]) {
                    r._feuchteMerk = null;
                    const kette = new Map();
                    for (const t of zeiten)
                        for (const [cx, cz] of zellen) {
                            const y = r._voxelSurfaceY((cx + 0.5) * cs, (cz + 0.5) * cs);
                            const m = r._feuchteFenster(cx, cz, y, t, art);
                            kette.set(art + cx + "," + cz + "@" + t, [m.M, m.S, m.e]);
                        }
                    for (const t of zeiten)
                        for (const [cx, cz] of zellen) {
                            const y = r._voxelSurfaceY((cx + 0.5) * cs, (cz + 0.5) * cs);
                            r._feuchteFrisch = true;
                            const m = r._feuchteFenster(cx, cz, y, t, art);
                            r._feuchteFrisch = false;
                            const [M0, S0, e0] = kette.get(art + cx + "," + cz + "@" + t);
                            n++;
                            if (Object.is(M0, m.M) && Object.is(S0, m.S)) gleich++;
                            maxAbw = Math.max(maxAbw, Math.abs(M0 - m.M), Math.abs(S0 - m.S));
                            if (e0 !== kette.get(art + cx + "," + cz + "@" + zeiten[0])[2]) epochen++;
                        }
                }
                aus.bitgleich = { proben: n, bitgleich: gleich, maxAbw, probenNachEpochenWechsel: epochen };
                r._feuchteMerk = null;
            }
        }
        return aus;
    },
    (argv) => ({ teil: argv[0] || "a", ort: ORT, spieler: process.env.SPIKE_SPIELER === "mess" ? undefined : ORT, festR: argv[1] ? Number(argv[1]) : undefined, pLauf: argv[2] ? Number(argv[2]) : undefined, sollM: argv[3] ? Number(argv[3]) : undefined })
);
