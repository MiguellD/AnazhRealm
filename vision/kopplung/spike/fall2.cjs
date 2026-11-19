// SPIKE KOPPLUNG — Fall II: die feuchte Wiese stirbt gegen mx (entscheid.md (7)). Der Herd ist der Ort von Fall I (−1 128 | −984);
// die Kontroll-Kopie gibt um die Mess-Wiese feste Eingänge (bewoelkt, tor 0, P 0, U10 7,2, feuchte 0,0377 → M_Gras 0,06 am Herd);
// eine Tat `wetter` {Mitte 550 m windab des Herds, r 400 m, t0 = tIgn − 600 s, dauer 600 s, zeile regen} steht direkt in
// `worldMeta.taten`; Linien-Zündung (10 Zellen quer zu θ0) zur Zeit tIgn = t0 + 600 s (14 Uhr), Brand bis tIgn + 900 s.
//   node fall2.cjs fest     — NACHHER (die Kopien + die Kontroll-Kopie)
//   node fall2.cjs vorher   — VORHER (die Originale: das Wort cloudy, Nässe 0 — die Tat `wetter` hat dort keinen Leser)
// Messgrößen (1)–(4) wie im Auftrag; die Fackel-Reihe zündet über den Akt der Seite (`_brandEntfachen`, derselbe Akt wie
// `_fackelZuenden`) an EINER Zelle im Kreis mit Bett, zu den Zeiten, zu denen das geladene Gesetz dort M = f · mx gibt.
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
        const tIgn = S.zeitZurPhase(14 / 24, 3600);
        const t0 = tIgn - 600;
        const ort = A.ort;
        const mx = r._stoff("gras").brenn.mx;
        const r3 = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : v);
        // die mittlere Wind-Richtung 120–300 s nach der Zündung (die geladene Funktion), wie Fall I
        let [mxx, mzz] = [0, 0];
        for (let t = tIgn + 120; t <= tIgn + 300; t++) {
            const d = __phytoCore.windRichtung(saat, t);
            ((mxx += d.x), (mzz += d.z));
        }
        const l = Math.hypot(mxx, mzz);
        const [dx, dz] = [mxx / l, mzz / l];
        // der Kreis: 550 m windab längs der geladenen Richtung — oder (vorher, gleiche Bedingung) der Kreis des Nachher-Laufs
        const KR = A.kreis ? { x: A.kreis[0], z: A.kreis[1], r: 400 } : { x: ort.x + 550 * dx, z: ort.z + 550 * dz, r: 400 };
        const tat = { tat: "wetter", x: KR.x, z: KR.z, r: KR.r, t0, dauer: 600, zeile: "regen" };
        const aus = { tIgn, t0, mx, kreis: { x: r3(KR.x), z: r3(KR.z), r: KR.r }, wind: [r3(dx), r3(dz)] };
        const rand = (cx, cz) => Math.hypot((cx + 0.5) * cs - KR.x, (cz + 0.5) * cs - KR.z) - KR.r; // < 0: Mitte im Kreis
        const setze = () => {
            // die Tat `wetter` und (nachher) die Kontroll-Kopie; das Gemerkte fällt
            st.worldMeta.taten = st.worldMeta.taten || [];
            st.worldMeta.taten.push(tat);
            r._tatGen = (r._tatGen | 0) + 1;
            if (gesetz) window.__kopplungFest = { x: A.MESS.x, z: A.MESS.z, r: 1000, U10: 7.2, feuchte: 0.03770323051139712 };
            r._wetterAmMerk = null;
            r._feuchteMerk = null;
        };
        if (!gesetz) {
            aus.wort = S.wort("cloudy");
            st.naesse = 0;
        }
        S.leer();
        setze();
        const M = (cx, cz, t) => {
            const [x, z] = [(cx + 0.5) * cs, (cz + 0.5) * cs];
            return gesetz ? r._feuchteAm(x, z, r._voxelSurfaceY(x, z), t).gras : r._brandFeuchte(0);
        };
        const [hx, hz] = [Math.floor(ort.x / cs), Math.floor(ort.z / cs)];
        const [kx, kz] = [Math.floor(KR.x / cs), Math.floor(KR.z / cs)];
        aus.M_herd = r3(M(hx, hz, tIgn));
        aus.M_kreisMitte = { t0m1: r3(M(kx, kz, t0 - 5)), t0p300: r3(M(kx, kz, t0 + 300)), tIgn: r3(M(kx, kz, tIgn)) };
        if (gesetz) aus.P_kreisMitte = r3(r._wetterAm(KR.x, KR.z, t0 + 300).P_mmh);

        // DER BRAND
        const linie = S.linie(ort.x, ort.z, g0.x, g0.z);
        const wand0 = performance.now();
        const n0 = S.zuenden(linie, tIgn);
        S.brennenBis(tIgn + 900);
        aus.brand = { gezuendet: n0, zellen: S.protokoll.length, absagen: S.absagen.length, zaehle: S.zaehle(), ms: Math.round(performance.now() - wand0) };
        const P = S.protokoll;
        // (1) Zellen, die mit M(Ankunft) ≥ mx zündeten — das M, das `_brandTempo` las, und dasselbe frisch nachgerechnet
        let frischAbw = 0;
        let nassGez = 0;
        for (const p of P) {
            if (p.M >= mx) nassGez++;
            if (gesetz) {
                r._feuchteFrisch = true;
                const mf = M(p.cx, p.cz, p.t);
                r._feuchteFrisch = false;
                frischAbw = Math.max(frischAbw, Math.abs(mf - p.M));
            }
        }
        const imKreis = P.filter((p) => rand(p.cx, p.cz) < 0);
        aus.m1 = { nassGezuendet: nassGez, imKreisGezuendet: imKreis.length, frischAbwMax: frischAbw };
        // (3) je Zelle im Kreis, die zündete: ihr t_mx (der erste 5-s-Schritt ab tIgn, an dem das Gesetz dort M < mx gibt)
        const tmx = (cx, cz) => {
            for (let t = tIgn; t <= tIgn + 3600; t += 5) if (M(cx, cz, t) < mx) return t;
            return Infinity;
        };
        const vor = imKreis.filter((p) => p.t < tmx(p.cx, p.cz));
        const tEin = imKreis.length ? Math.min(...imKreis.map((p) => p.t)) : null;
        // t_mx an den Zellen des Kopf-Pfads beim Eintritt (die drei mittleren Spuren am Rand, 150–200 m windab)
        const pfad = [];
        for (let s = 150; s <= 214; s += 16)
            for (const k of [-1, 0, 1]) {
                const [px, pz] = [ort.x + s * dx - k * cs * dz, ort.z + s * dz + k * cs * dx];
                const [cx, cz] = [Math.floor(px / cs), Math.floor(pz / cs)];
                if (rand(cx, cz) < 0) pfad.push(tmx(cx, cz) - tIgn);
            }
        pfad.sort((a, b) => a - b);
        aus.m3 = {
            eintrittS: tEin === null ? null : r3(tEin - tIgn),
            tmxPfadS: pfad.length ? [pfad[0], pfad[pfad.length >> 1], pfad[pfad.length - 1]] : null,
            imKreisVorTmx: vor.length,
            beispielVor: vor.slice(0, 3).map((p) => ({ c: [p.cx, p.cz], t: r3(p.t - tIgn), M: r3(p.M), rand: r3(rand(p.cx, p.cz)) })),
        };
        // (2) die Absagen „nass“ (Bett da, M ≥ mx): der Abstand der Quelle (die letzte verbrannte Zelle) zum Kreisrand; Absagen nass
        // AUSSERHALB des Kreises sind Überlöschen
        const nass = S.absagen.filter((a) => a.bett && a.M >= mx);
        const quelle = nass.map((a) => {
            const v = a.von;
            const [qx, qz] = v ? v.split(",").map(Number) : [NaN, NaN];
            return { a, d: rand(qx, qz), dSelbst: rand(a.cx, a.cz) };
        });
        const dq = quelle.map((q) => q.d).filter(Number.isFinite);
        aus.m2 = {
            absagenNass: nass.length,
            absagenNassAusserhalb: quelle.filter((q) => q.dSelbst > 0).length,
            absagenOhneBett: S.absagen.filter((a) => !a.bett).length,
            absagenTrockenMitBett: S.absagen.filter((a) => a.bett && !(a.M >= mx)).length,
            quelleBis16m: dq.filter((d) => d <= 16).length,
            quelleUeber32m: dq.filter((d) => d > 32).length,
            quelleAbstand: dq.length ? [r3(Math.min(...dq)), r3(dq.sort((a, b) => a - b)[dq.length >> 1]), r3(Math.max(...dq))] : null,
        };
        aus.ausDemFestKreis = P.filter((p) => Math.hypot(p.ex - A.MESS.x, p.ez - A.MESS.z) > 1000).length;
        // das Bett im Kreis (`_brandStoff` des geladenen Moduls): Zellen mit Mitte im Kreis, mit Bett, mit leb·anteil ≥ 0,5
        {
            S.leer();
            setze();
            let [n, b, b5] = [0, 0, 0];
            for (let cz = Math.floor((KR.z - KR.r) / cs); cz <= Math.floor((KR.z + KR.r) / cs); cz++)
                for (let cx = Math.floor((KR.x - KR.r) / cs); cx <= Math.floor((KR.x + KR.r) / cs); cx++) {
                    if (rand(cx, cz) >= 0) continue;
                    n++;
                    const f = r._brandStoff(cx, cz);
                    if (f) (b++, f.leb * f.anteil >= 0.5 && b5++);
                }
            aus.bettImKreis = { zellen: n, mitBett: b, ab05: b5 };
        }

        // (4) DIE FACKEL-REIHE: eine Zelle im Kreis mit Bett (leb·anteil ≥ 0,5), ≥ 48 m innen, nächst dem Kopf-Pfad
        S.leer();
        setze();
        let fz = A.fackelZelle ? { cx: A.fackelZelle[0], cz: A.fackelZelle[1], vorgegeben: true } : null;
        if (fz) {
            const f = r._brandStoff(fz.cx, fz.cz);
            fz.leb = f ? r3(f.leb * f.anteil) : 0;
        }
        for (let s = 200; s <= 700 && !fz; s += 16)
            for (const k of [0, 1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 6, -6]) {
                const [px, pz] = [ort.x + s * dx - k * cs * dz, ort.z + s * dz + k * cs * dx];
                const [cx, cz] = [Math.floor(px / cs), Math.floor(pz / cs)];
                if (rand(cx, cz) > -48) continue;
                const f = r._brandStoff(cx, cz);
                if (f && f.leb * f.anteil >= 0.5) {
                    fz = { cx, cz, s, k, leb: r3(f.leb * f.anteil) };
                    break;
                }
            }
        aus.fackel = { zelle: fz, versuche: [] };
        if (fz) {
            const reihe = [];
            for (let t = tIgn; t <= tIgn + 3600; t += 5) reihe.push([t, M(fz.cx, fz.cz, t)]);
            aus.fackel.M_reihe = reihe.filter((_, i) => i % 12 === 0).slice(0, 25).map(([t, m]) => [t - tIgn, r3(m / mx)]);
            for (const f of [1.1, 1.03, 0.97, 0.9]) {
                // die Zeit, zu der das Gesetz dort zuerst M ≤ f·mx gibt (das Trocknen fällt) — vorher: M steht, der Versuch zur Zeit tIgn
                const q = gesetz ? reihe.find(([, m]) => m <= f * mx) : [tIgn + 60, M(fz.cx, fz.cz, tIgn)];
                if (!q) {
                    aus.fackel.versuche.push({ f, t: null, grund: "M erreicht f·mx nie in 3 600 s" });
                    continue;
                }
                S.leer();
                setze();
                st.spielZeit = q[0];
                const [x, z] = [(fz.cx + 0.5) * cs, (fz.cz + 0.5) * cs];
                const zelle = r._brandEntfachen(x, z);
                const ab = S.absagen[S.absagen.length - 1];
                aus.fackel.versuche.push({
                    f,
                    tS: q[0] - tIgn,
                    M_mx: r3(q[1] / mx),
                    zuendet: !!zelle,
                    grund: zelle ? null : ab ? (ab.bett ? (ab.M >= mx ? "nass: M " + r3(ab.M) + " über mx " + mx : "Bett ohne Tempo") : "kein Bett") : "?",
                });
            }
        }
        return aus;
    },
    // node fall2.cjs vorher <kreisX> <kreisZ> <fackelCx> <fackelCz> — der Kreis und die Fackel-Zelle des Nachher-Laufs
    (argv) => ({
        ort: ORT,
        spieler: ORT,
        kreis: argv[0] ? [Number(argv[0]), Number(argv[1])] : null,
        fackelZelle: argv[2] ? [Number(argv[2]), Number(argv[3])] : null,
    })
);
