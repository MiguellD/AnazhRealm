// SPIKE KOPPLUNG — Fall III: die Regenfront über dem Brand (entscheid.md (7)). Die Kopien des Gesetzes, KEINE Kontroll-Kopie: die
// Welle selbst. Sommer (autoSeason aus, saisonNull 0,375).
//   node fall3.cjs gesetz s            — die Suche: Einsätze t_A eines Bands (tor ≥ 0,9, P ≥ 0,45 mm/h binnen 45 s) an Herd A, davor
//                                        trocken (P = 0 über 482 s, M_Gras < Mgrenz über 300 s); dazu B = A + 2 000 m · θ0 (dasselbe q)
//                                        trocken bis zum Band; A der Ort von Fall I (die Mitte der Linie). Ausgabe: die Zählung und
//                                        die ersten Treffer
//   node fall3.cjs <gesetz|vorher> ab <tA> — Herd A und B, Linien-Zündung (10 Zellen ⊥ θ0) bei tA − 300 s, Brand bis tA + 400 s
//   node fall3.cjs <gesetz|vorher> cd <tC> — Herd C (der Ort von Fall I) und D (1 km quer, außerhalb des Kreises), gezündet bei tC;
//                                        die Tat `wetter` regen r 400 m über C ab tC + 300 s, 600 s; Brand bis tC + 600 s
//   node fall3.cjs vorher vs <ab>     — VORHER-Suche: die trockenen Läufe des Worts am Spieler (Züge zu 120 s) über 200 Tage
// VORHER: die Nässe am Spieler — je Schritt das Wort, das der Wetter-Zug (`_wetterZugZiehen`, dirigent-takt.js:1728) am Spieler
// zur Zeit seines Zugs spräche (`_wetterAmOrt`), und `_naesseTakt(dt)` des Originals; der Spieler steht an A bzw. C. In cd hält
// vorher das Wort „sonnig“ bis zum Op „regen“ (der Zug trägt am Spieler nie 600 s trocken, Teil vs).
// Alle Teile: JSON auf stdout (davor ggf. die Stall-Akte der Bühne).
"use strict";
const { lauf } = require("./buehne.cjs");
const ORT = { x: -1128, z: -984 };

lauf(
    async (A) => {
        const S = window.__spike;
        S.lauschen();
        const cs = AnazhRealm.LIFE_FIELD.cell;
        const saat = S.saat();
        const gesetz = S.gesetz();
        const g0 = __phytoCore.windGrund(saat);
        const r3 = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : v);
        const mx = r._stoff("gras").brenn.mx;
        const ORT = A.ort;
        const aus = { teil: A.teil, theta0: [r3(g0.x), r3(g0.z)], tagNull: String(st.worldMeta.tagNull), timeOfDay: st.timeOfDay };
        const Bp = { x: ORT.x + 2000 * g0.x, z: ORT.z + 2000 * g0.z };
        const zelle = (x, z) => [Math.floor(x / cs), Math.floor(z / cs)];
        const yAt = (x, z) => r._voxelSurfaceY(x, z);
        const W = (x, z, t) => r._wetterAm(x, z, t);
        const MG = (x, z, t) => r._feuchteAm(x, z, yAt(x, z), t).gras;
        const bettLinie = (x, z) =>
            S.linie(x, z, g0.x, g0.z).map((q) => {
                const f = r._brandStoff(...zelle(q.x, q.z));
                return f ? r3(f.leb * f.anteil) : 0;
            });

        if (A.teil === "s") {
            if (!gesetz) throw new Error("die Suche liest das Gesetz (Modus gesetz)");
            S.leer();
            aus.bettA = bettLinie(ORT.x, ORT.z);
            aus.bettB = bettLinie(Bp.x, Bp.z);
            aus.B = { x: r3(Bp.x), z: r3(Bp.z) };
            const T0 = A.von || 3600,
                T1 = A.bis || 3600 * 200;
            const Mgrenz = A.Mgrenz || 0.09;
            const t1 = performance.now();
            // P und tor an A je 5 s (der Memo-Raster des Gesetzes)
            const n = Math.floor((T1 - T0) / 5);
            const P = new Float32Array(n),
                TOR = new Float32Array(n);
            for (let i = 0; i < n; i++) {
                const w = W(ORT.x, ORT.z, T0 + 5 * i);
                P[i] = w.P_mmh;
                TOR[i] = w.tor_1;
            }
            aus.msWetter = Math.round(performance.now() - t1);
            let regenAnteil = 0;
            for (let i = 0; i < n; i++) if (P[i] > 0) regenAnteil++;
            aus.regenAnteilA = r3(regenAnteil / n);
            // M_Gras an A je 5 s (das Fenster des Gesetzes, Memo schreitet vor)
            const MA = new Float32Array(n);
            for (let i = 0; i < n; i++) MA[i] = MG(ORT.x, ORT.z, T0 + 5 * i);
            aus.msM = Math.round(performance.now() - t1);
            // die Kopf-Zahl des Entscheids an EINEM Ort (A), Sommer: Gras brennbar (M < mx), dazu U₁₀ ≥ 5 m/s, Regen P ≥ 0,1
            {
                let [b, bw, p01] = [0, 0, 0];
                for (let i = 0; i < n; i++) {
                    const w = W(ORT.x, ORT.z, T0 + 5 * i);
                    if (MA[i] < mx) {
                        b++;
                        if (w.U10_ms >= 5) bw++;
                    }
                    if (P[i] >= 0.1) p01++;
                }
                aus.anteilA = { grasBrennbar: r3(b / n), brennbarUndU5: r3(bw / n), regenP01: r3(p01 / n), M_unter009: r3(MA.filter((m) => m < 0.09).length / n) };
            }
            // (1) der Wortlaut: Einsätze (P > 0 nach P = 0) mit tor ≥ 0,9 und P ≥ 0,45 binnen 45 s, davor 482 s trocken, M < Mgrenz 300 s
            const z = { einsatz: 0, torEinsatz09: 0, tor09_p045_45s: 0, trocken482: 0, M_A: 0 };
            const torEinsatz = [];
            for (let i = 97; i < n - 60; i++) {
                if (!(P[i] > 0 && P[i - 1] === 0)) continue;
                z.einsatz++;
                torEinsatz.push(TOR[i]);
                if (TOR[i] >= 0.9) z.torEinsatz09++;
                let pmax = 0;
                for (let k = 0; k <= 9; k++) pmax = Math.max(pmax, P[i + k]);
                if (!(TOR[i] >= 0.9 && pmax >= 0.45)) continue;
                z.tor09_p045_45s++;
                let trocken = true;
                for (let k = 1; k <= 96; k++) if (P[i - k] > 0) trocken = false;
                if (!trocken) continue;
                z.trocken482++;
                let mA = 0;
                for (let k = 1; k <= 60; k++) mA = Math.max(mA, MA[i - k]);
                if (mA < Mgrenz) z.M_A++;
            }
            torEinsatz.sort((a, b) => a - b);
            aus.torBeimEinsatz = [0.5, 0.9, 0.99, 1].map((q) => r3(torEinsatz[Math.min(torEinsatz.length - 1, Math.floor(q * torEinsatz.length))]));
            aus.zaehlung = z;
            // (2) DIE BRENNFENSTER an A: zusammenhängend P = 0 und M < Mgrenz, ≥ 300 s — was beendet sie?
            const fenster = [];
            for (let i = 0, a = -1; i < n; i++) {
                const ok = P[i] === 0 && MA[i] < Mgrenz;
                if (ok && a < 0) a = i;
                if (!ok && a >= 0) {
                    if ((i - a) * 5 >= 300) {
                        let [p60, p300, t045] = [0, 0, null];
                        for (let k = 0; k < 60 && i + k < n; k++) {
                            if (k < 12) p60 = Math.max(p60, P[i + k]);
                            p300 = Math.max(p300, P[i + k]);
                            if (t045 === null && P[i + k] >= 0.45) t045 = 5 * k;
                        }
                        fenster.push({ tEnde: T0 + 5 * i, laengeS: (i - a) * 5, durchRegen: P[i] > 0, torEnde: r3(TOR[i]), MEnde: r3(MA[i]), P60: r3(p60), P300: r3(p300), bis045S: t045, phase: r3(r._tagPhaseAm(T0 + 5 * i)) });
                    }
                    a = -1;
                }
            }
            const L = fenster.map((f) => f.laengeS).sort((a, b) => a - b);
            const regenEnde = fenster.filter((f) => f.durchRegen);
            aus.brennfenster = {
                zahl: fenster.length,
                laengeMedianS: L.length ? L[L.length >> 1] : null,
                laengeMaxS: L.length ? L[L.length - 1] : null,
                endetDurchRegen: regenEnde.length,
                regenEndeP300ab045: regenEnde.filter((f) => f.P300 >= 0.45).length,
                regenEndeTor09: regenEnde.filter((f) => f.torEnde >= 0.9).length,
                P300max: regenEnde.length ? r3(Math.max(...regenEnde.map((f) => f.P300))) : null,
            };
            // die Kandidaten für den Lauf: Fenster, die durch Regen enden, nach dem größten P der folgenden 300 s
            aus.kandidaten = regenEnde.sort((a, b) => b.P300 - a.P300).slice(0, 6);
            // B = A + 2 000 m · θ0 an den Kandidaten: trocken bis zum Band (P = 0, M < Mgrenz über [tA − 300, tA + 175])
            for (const k of aus.kandidaten) {
                let [pB, mB] = [0, 0];
                for (let t = k.tEnde - 300; t <= k.tEnde + 175; t += 5) {
                    pB = Math.max(pB, W(Bp.x, Bp.z, t).P_mmh);
                    mB = Math.max(mB, MG(Bp.x, Bp.z, t));
                }
                Object.assign(k, { PmaxB: r3(pB), MmaxB: r3(mB) });
            }
            aus.suchMs = Math.round(performance.now() - t1);
            aus.spanne = [T0, T1, Mgrenz];
            return aus;
        }

        // DER TAKT MIT DER UHR DER NÄSSE: vor jedem Schritt `vor(t)` (vorher: das Wort des Zugs am Spieler und `_naesseTakt(dt)`),
        // dann der echte `_tickBrand`; nach jedem Schritt `nach(t)`
        const brennen = (bis, vor, nach) => {
            const sc = AnazhRealm.BRAND.schrittS;
            let ruf = 0;
            while (r._brandUhr < bis - 1e-9 && r._brandLebt()) {
                const t = r._brandUhr + sc;
                if (vor) vor(t);
                st.spielZeit = t;
                r._tickBrand();
                if (nach && r._brandUhr >= t - 1e-9) nach(r._brandUhr);
                if (++ruf > 2e6) throw new Error("brennen: der Takt steht");
            }
        };
        const ZUG = AnazhRealm.WETTER_ZUG_SEK;
        const pm = st.playerMesh.position;
        let nassUhr = null;
        const vorherNaesse = (t) => {
            // der Wetter-Zug des Originals am Spieler (das Wort seines Zugs) und die EINE Welt-Nässe, Schritt um Schritt
            if (!st.__wortGehalten) {
                const w = r._wetterAmOrt(pm.x, pm.z, ZUG * Math.floor(t / ZUG));
                if (w !== st.weather) S.wort(w);
            }
            if (nassUhr !== null) r._naesseTakt(t - nassUhr);
            nassUhr = t;
        };
        const proj = (p) => (p.ex - ORT.x) * g0.x + (p.ez - ORT.z) * g0.z;
        const bereich = (cx, cz, a, h = 700) => {
            const v = ((cx + 0.5) * cs - a.x) * g0.x + ((cz + 0.5) * cs - a.z) * g0.z;
            const q = ((cx + 0.5) * cs - a.x) * -g0.z + ((cz + 0.5) * cs - a.z) * g0.x;
            return Math.abs(v) < 700 && Math.abs(q) < h;
        };
        // der erste 5-s-Schritt ab t mit P > 0 an der Zelle (das Gesetz; vorher: das Wort am Spieler regnet)
        const einsatz = (cx, cz, ab, bis) => {
            for (let t = 5 * Math.ceil(ab / 5); t <= bis; t += 5) {
                const P = gesetz ? W((cx + 0.5) * cs, (cz + 0.5) * cs, t).P_mmh : 0;
                if (P > 0) return t;
            }
            return null;
        };
        // die Massen-Schranke an der Zelle ab t: (mx − M0)·w/(c·P(t)) und die integrierte (∫ c·P dt ≥ (mx − M0)·w, P je 5 s)
        const schranke = (cx, cz, t) => {
            if (!gesetz) return null;
            const b = r._feuchteBett("gras");
            const [x, z] = [(cx + 0.5) * cs, (cz + 0.5) * cs];
            const M0 = MG(x, z, t - 5);
            const soll = (mx - M0) * b.w;
            const P0 = W(x, z, t).P_mmh;
            let [acc, u] = [0, t];
            for (; u < t + 3600 && acc < soll; u += 5) {
                const P = W(x, z, u).P_mmh;
                const d = (b.c * P * 24 * 5) / 3600;
                if (acc + d >= soll) return { M0: r3(M0), P0: r3(P0), wortlautS: r3((soll / (b.c * P0)) * 3600 / 24), integriertS: r3(u - t + (5 * (soll - acc)) / d) };
                acc += d;
            }
            return { M0: r3(M0), P0: r3(P0), wortlautS: r3((soll / (b.c * P0)) * 3600 / 24), integriertS: null };
        };

        // VORHER-SUCHE: das Wort des Zugs am Spieler (`_wetterAmOrt` je 120 s) — die trockenen Läufe (rain ≤ regenAb) ≥ 6 Züge und
        // das erste nasse Wort danach
        if (A.teil === "vs") {
            const Z = AnazhRealm.WETTER_ZUG_SEK;
            const nass = (w) => (AnazhRealm.WEATHER_FIELD[w] || {}).rain > AnazhRealm.NAESSE.regenAb;
            const laeufe = [];
            const [hist, worte] = [{}, {}];
            let a = null;
            for (let k = Math.ceil((A.von || 3600) / Z); k * Z < (A.bis || 3600 * 200); k++) {
                const w = r._wetterAmOrt(ORT.x, ORT.z, k * Z);
                if (!nass(w) && a === null) a = k;
                if (nass(w) && a !== null) {
                    hist[Math.min(10, k - a)] = (hist[Math.min(10, k - a)] || 0) + 1;
                    if (k - a >= 5) laeufe.push({ von: a * Z, bis: k * Z, nassWort: w });
                    a = null;
                }
                worte[w] = (worte[w] || 0) + 1;
            }
            aus.trockenLaufZuege = hist;
            aus.worte = worte;
            aus.laeufe = laeufe.length;
            aus.erste = laeufe.filter((l) => l.von > (A.tA || 0)).slice(0, 6);
            aus.felder = Object.fromEntries(Object.entries(AnazhRealm.WEATHER_FIELD).map(([k, v]) => [k, v.rain]));
            aus.regenAb = AnazhRealm.NAESSE.regenAb;
            return aus;
        }

        if (A.teil === "ab") {
            const tA = A.tA;
            const tIgn = tA - 300;
            S.leer();
            st.__wortGehalten = false;
            const Bq = { x: Bp.x, z: Bp.z };
            aus.bettA = bettLinie(ORT.x, ORT.z);
            aus.bettB = bettLinie(Bq.x, Bq.z);
            if (!gesetz) {
                st.naesse = 0;
                vorherNaesse(tIgn);
            }
            const nA = S.zuenden(S.linie(ORT.x, ORT.z, g0.x, g0.z), tIgn);
            const nB = S.zuenden(S.linie(Bq.x, Bq.z, g0.x, g0.z), tIgn);
            aus.gezuendet = { A: nA, B: nB };
            const reihe = [];
            let [extA, extB] = [null, null];
            const zaehl = () => {
                let [a, b] = [0, 0];
                for (const z of st.brandFeld.values()) if (z.t0 !== null) bereich(z.cx, z.cz, ORT) ? a++ : bereich(z.cx, z.cz, Bq) && b++;
                return [a, b];
            };
            let wortRegen = null;
            brennen(tA + 400, gesetz ? null : vorherNaesse, (t) => {
                const [a, b] = zaehl();
                if (!gesetz && wortRegen === null && (AnazhRealm.WEATHER_FIELD[st.weather] || {}).rain > AnazhRealm.NAESSE.regenAb) wortRegen = t;
                if (t > tIgn + 2 && a === 0 && extA === null) extA = t;
                if (t > tIgn + 2 && b === 0 && extB === null) extB = t;
                if (Math.round(t) % 20 === 0) reihe.push([Math.round(t - tA), a, b, gesetz ? null : r3(st.naesse), gesetz ? null : st.weather]);
            });
            const P = S.protokoll;
            const PA = P.filter((p) => bereich(p.cx, p.cz, ORT)),
                PB = P.filter((p) => bereich(p.cx, p.cz, Bq));
            // die Kopf-Zelle von A zur Zeit des Einsatzes an der Linie: die gefangene Zelle von A mit dem weitesten Eintritt längs θ0
            const kopf = PA.filter((p) => p.t <= tA).sort((a, b) => proj(b) - proj(a))[0];
            const tAk = kopf ? einsatz(kopf.cx, kopf.cz, tIgn, tA + 600) : null;
            const kopfB = PB.filter((p) => p.t <= tA + 182).sort((a, b) => proj(b) - proj(a))[0];
            const tBk = kopfB ? einsatz(kopfB.cx, kopfB.cz, tIgn, tA + 900) : null;
            aus.A = {
                zellen: PA.length,
                kopf: kopf ? { c: [kopf.cx, kopf.cz], weitM: r3(proj(kopf)), M: r3(kopf.M), U10: r3(kopf.U) } : null,
                tEinsatzLinieS: 0,
                tEinsatzKopfS: tAk === null ? null : tAk - tA,
                tExtS: extA === null ? null : r3(extA - tA),
                loeschzeitS: tAk !== null && extA !== null ? r3(extA - tAk) : null,
                schranke: kopf && tAk !== null ? schranke(kopf.cx, kopf.cz, tAk) : null,
                M_U: PA.length ? [r3(Math.min(...PA.map((p) => p.M))), r3(Math.max(...PA.map((p) => p.M))), r3(PA.reduce((s, p) => s + p.U, 0) / PA.length)] : null,
            };
            aus.B = {
                zellen: PB.length,
                tEinsatzKopfS: tBk === null ? null : tBk - tA,
                tExtS: extB === null ? null : r3(extB - tA),
                loeschzeitS: tBk !== null && extB !== null ? r3(extB - tBk) : null,
                schranke: kopfB && tBk !== null ? schranke(kopfB.cx, kopfB.cz, tBk) : null,
                wachsenZwischen: extA !== null ? PB.filter((p) => p.t > extA && p.t <= tA + 150).length : null,
            };
            // die Zündungen je 40 s (A, B) und der Kopf von B längs θ0; das Bett vor dem Kopf von B (16-m-Schritte längs θ0)
            const projB = (p) => (p.ex - Bq.x) * g0.x + (p.ez - Bq.z) * g0.z;
            const fach = [];
            for (let u = tIgn; u < tA + 400; u += 40) {
                const inA = PA.filter((p) => p.t >= u && p.t < u + 40),
                    inB = PB.filter((p) => p.t >= u && p.t < u + 40);
                fach.push([Math.round(u - tA), inA.length, inB.length, inB.length ? r3(Math.max(...PB.filter((p) => p.t < u + 40).map(projB))) : null, inB.length ? r3(inB.reduce((s, p) => s + p.M, 0) / inB.length) : null, inB.length ? r3(inB.reduce((s, p) => s + p.U, 0) / inB.length) : null]);
            }
            aus.zuendFach = fach;
            const kB = PB.length ? PB.reduce((a, p) => (projB(p) > projB(a) ? p : a)) : null;
            if (kB) {
                aus.B.kopfEnde = { weitM: r3(projB(kB)), t: r3(kB.t - tA) };
                aus.B.bettVorKopf = [];
                for (let k = 1; k <= 8; k++) {
                    const [x, z] = [kB.ex + 16 * k * g0.x, kB.ez + 16 * k * g0.z];
                    const f = r._brandStoff(...zelle(x, z));
                    aus.B.bettVorKopf.push(f ? r3(f.leb * f.anteil) : 0);
                }
            }
            aus.vorherWortRegenS = wortRegen === null ? null : r3(wortRegen - tA);
            aus.dt_ext = extA !== null && extB !== null ? r3(extB - extA) : null;
            aus.reihe = reihe;
            return aus;
        }

        if (A.teil === "cd") {
            const tC = A.tA;
            const t0 = tC + 300;
            S.leer();
            st.__wortGehalten = false;
            // D: 1 000–1 400 m quer zu θ0 (dasselbe s bis auf die Biegung), die Linie mit dem meisten Bett
            // (trägt ab 1 km keine Linie ≥ 5 Zellen Bett, dann die fernste ab 424 m, außerhalb des Kreises — benannt im Blatt)
            let D = null;
            const profil = [];
            for (const sgn of [1, -1])
                for (let d = 424; d <= 1400; d += 32) {
                    const c = { x: ORT.x - sgn * d * g0.z, z: ORT.z + sgn * d * g0.x };
                    const b = bettLinie(c.x, c.z);
                    const m = b.filter((v) => v >= 0.5).length;
                    profil.push([sgn * d, m, b.filter((v) => v > 0).length]);
                    const gut = (q) => (q.m >= 5 ? (q.d >= 1000 ? 2 : 1) : 0);
                    const neu = { x: r3(c.x), z: r3(c.z), d, m, bett: b };
                    if (!D || gut(neu) > gut(D) || (gut(neu) === gut(D) && (gut(neu) === 1 ? neu.d > D.d : neu.m > D.m))) D = neu;
                }
            aus.bettProfilQuer = profil.filter((q) => q[1] > 0 || q[2] > 0);
            aus.D = D;
            const hq = Math.min(700, D.d / 2); // die Bereiche von C und D teilen sich nie eine Zelle
            aus.bettC = bettLinie(ORT.x, ORT.z);
            const tat = { tat: "wetter", x: ORT.x + 100 * g0.x, z: ORT.z + 100 * g0.z, r: 400, t0, dauer: 600, zeile: "regen" };
            if (!gesetz) {
                // VORHER: der Zug am Spieler trägt nie 600 s trocken (Teil vs: ≤ 3 Züge) — das Brennfenster ist das gehaltene Wort
                // „sonnig" (der Op `weather`, der Schreiber des Spielers: sein Wort steht), bis der Op „regen" spricht
                S.wort("sunny");
                st.__wortGehalten = true;
                st.naesse = 0;
                vorherNaesse(tC);
            }
            const nC = S.zuenden(S.linie(ORT.x, ORT.z, g0.x, g0.z), tC);
            const nD = S.zuenden(S.linie(D.x, D.z, g0.x, g0.z), tC);
            aus.gezuendet = { C: nC, D: nD };
            let [extC, extD, gesetzt] = [null, null, false];
            const reihe = [];
            const zaehl = () => {
                let [c, d] = [0, 0];
                for (const z of st.brandFeld.values()) if (z.t0 !== null) bereich(z.cx, z.cz, ORT, hq) ? c++ : bereich(z.cx, z.cz, D, hq) && d++;
                return [c, d];
            };
            brennen(
                tC + 600,
                (t) => {
                    if (!gesetzt && t >= t0) {
                        gesetzt = true;
                        if (gesetz) {
                            // die Tat `wetter` (der Op `weather` des Gesetzes): direkt in worldMeta.taten
                            st.worldMeta.taten.push(tat);
                            r._tatGen = (r._tatGen | 0) + 1;
                        } else {
                            // VORHER: der Op `weather` setzt das EINE Wort der Welt (feld-dsl.js:943 `_setWeather`)
                            S.wort("rainy");
                            st.__wortGehalten = true;
                        }
                    }
                    if (!gesetz) vorherNaesse(t);
                },
                (t) => {
                    const [c, d] = zaehl();
                    if (t > t0 && c === 0 && extC === null) extC = t;
                    if (t > t0 && d === 0 && extD === null) extD = t;
                    if (Math.round(t) % 20 === 0) reihe.push([Math.round(t - t0), c, d, gesetz ? null : r3(st.naesse), gesetz ? null : st.weather]);
                }
            );
            const P = S.protokoll;
            const PC = P.filter((p) => bereich(p.cx, p.cz, ORT, hq)),
                PD = P.filter((p) => bereich(p.cx, p.cz, D, hq));
            aus.tat = { x: r3(tat.x), z: r3(tat.z), r: tat.r, t0 };
            aus.C = {
                zellen: PC.length,
                imKreis: PC.every((p) => Math.hypot((p.cx + 0.5) * cs - tat.x, (p.cz + 0.5) * cs - tat.z) < tat.r),
                tExtS: extC === null ? null : r3(extC - t0),
                schranke: (() => {
                    const k = PC.filter((p) => p.t <= t0).sort((a, b) => proj(b) - proj(a))[0];
                    return k ? schranke(k.cx, k.cz, t0) : null;
                })(),
            };
            aus.D = Object.assign(D, {
                zellen: PD.length,
                tExtS: extD === null ? null : r3(extD - t0),
                wachsen300: PD.filter((p) => p.t > t0 && p.t <= t0 + 300).length,
                M_D: PD.length ? r3(Math.max(...PD.map((p) => p.M))) : null,
                abstandZumKreisM: r3(Math.hypot(D.x - tat.x, D.z - tat.z) - tat.r),
            });
            // die Bedingung: D trocken über [t0, t0 + 300] (das Gesetz am Ort von D, mit der Tat) — und C ohne die Tat
            if (gesetz) {
                let [pD, pC] = [0, 0];
                for (let u = tC; u <= t0 + 300; u += 5) {
                    pD = Math.max(pD, W(D.x, D.z, u).P_mmh);
                    pC = Math.max(pC, __phytoCore.ortWetter(saat, ORT.x, ORT.z, u, r._gelaende().ort.wetter, []).P_mmh);
                }
                aus.bedingung = { PmaxD: r3(pD), PmaxC_ohneTat: r3(pC), PimKreis: r3(W(ORT.x, ORT.z, t0 + 10).P_mmh) };
            }
            const projD = (p) => (p.ex - D.x) * g0.x + (p.ez - D.z) * g0.z;
            aus.zuendFach = [];
            for (let u = tC; u < tC + 600; u += 50) {
                const c = PC.filter((p) => p.t >= u && p.t < u + 50),
                    d = PD.filter((p) => p.t >= u && p.t < u + 50);
                aus.zuendFach.push([Math.round(u - t0), c.length, d.length, d.length ? r3(Math.max(...PD.filter((p) => p.t < u + 50).map(projD))) : null, d.length ? r3(d.reduce((s, p) => s + p.U, 0) / d.length) : null]);
            }
            aus.reihe = reihe;
            return aus;
        }
        return aus;
    },
    (argv) => ({ ort: ORT, teil: argv[0] || "s", tA: argv[1] ? Number(argv[1]) : null, von: argv[2] ? Number(argv[2]) : null, bis: argv[3] ? Number(argv[3]) : null, Mgrenz: argv[4] ? Number(argv[4]) : null, spieler: ORT })
);
