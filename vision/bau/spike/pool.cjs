// pool.cjs — HEUTE und GESETZ an denselben Adressen (Plan-Ebene, ohne Geometrie).
//   Pläne: G = 30 Pläne nH 90 (Saat 1–30, wie entscheid.md Kopf) · E = 9 EPOCHEN × Saat 1–2 · K = 10 Weiler nH 12 (Saat 1–10).
//   Je Haus: die Adresse (Plan, Los i, Rang t, Baujahr, Kultur, u aus dem heutigen wohl zurückgerechnet) → heute (DORF-Export)
//   und Gesetz (gesetz-proto.cjs). Ausgabe: pool.json (die 100 + Plan-Zahlen), Konsole: die Zahlen gegen die Schwellen §5.
"use strict";
const fs = require("fs");
const path = require("path");
const { laden } = require("./lade.cjs");
const GZ = require("./gesetz-proto.cjs");

const q = (a, p) => { const s = a.slice().sort((x, y) => x - y); const i = (s.length - 1) * p, lo = Math.floor(i), hi = Math.ceil(i); return s[lo] + (s[hi] - s[lo]) * (i - lo); };
const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
const sd = (a) => { const m = mean(a); return Math.sqrt(mean(a.map((x) => (x - m) ** 2))); };
const raenge = (a) => { const o = a.map((v, i) => [v, i]).sort((x, y) => x[0] - y[0]), r = new Array(a.length); for (let i = 0; i < o.length; ) { let j = i; while (j + 1 < o.length && o[j + 1][0] === o[i][0]) j++; const m = (i + j) / 2 + 1; for (let k = i; k <= j; k++) r[o[k][1]] = m; i = j + 1; } return r; };
const pearson = (x, y) => { const mx = mean(x), my = mean(y); let a = 0, b = 0, c = 0; for (let i = 0; i < x.length; i++) { a += (x[i] - mx) * (y[i] - my); b += (x[i] - mx) ** 2; c += (y[i] - my) ** 2; } return a / Math.sqrt(b * c); };
const spearman = (x, y) => pearson(raenge(x), raenge(y));
const r2 = (v) => Math.round(v * 100) / 100;

// der erste Wurf von _bauweiseWurf (FC:2205–2207): die rohe Kultur-Neigung VOR der Grenzneigungs-Klemme (FC:2230)
function pitchKultur(KULTUR, kn, seed) {
    let s = (Math.round(seed * 977 + 13) * 2654435761) >>> 0; s = (s * 1664525 + 1013904223) >>> 0;
    return Math.max(8, Math.min(62, Math.round(KULTUR[kn].pitch + (s / 4294967296 - 0.5) * 5)));
}
// die Ständer-Achse des HAUS (FC:418–424) und der Flur fw (FC:254–261) — daraus der größte Einzugs-Abstand e eines Deckenbalkens
function eHeute(hp) {
    const W = hp.W, D = hp.D, st = Math.max(1, Math.min(12, Math.round(hp.storeys || 1)));
    const pitch = Math.max(hp.pitchDeg, 0) * Math.PI / 180, hasAttic = (D / 2) * Math.tan(pitch) > 1.9;
    const mainW = st >= 2 || (st === 1 && hasAttic) ? 0.9 : 0, loftW = (st >= 2 && hasAttic) || hp.keller !== 0 || st >= 3 ? 0.9 : 0;
    const fw = Math.max(W * 0.15, 1.0 + (mainW + loftW) / 2 + 0.06), half = W / 2, bay = 1.7;
    let pts = [-half, -fw, fw, half].filter((v) => Math.abs(v) <= half + 1e-6); pts = [...new Set(pts.map((v) => +v.toFixed(3)))].sort((a, b) => a - b);
    const out = [pts[0]]; for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i], n = Math.max(1, Math.ceil((b - a) / bay - 1e-6)); for (let k = 1; k <= n; k++) out.push(+(a + ((b - a) * k) / n).toFixed(3)); }
    let e = 0; for (let i = 1; i < out.length - 1; i++) e = Math.max(e, (out[i + 1] - out[i - 1]) / 2);
    return { e: e || W / 2, fw, achsen: out };
}

(async () => {
    const { FC } = await laden();
    const KULTUR = FC.KULTUR;
    // ── Selbsttest B1 (entscheid §4 B1) am Prototyp ──
    const kh = GZ.kreuzholz(0.258), bs = GZ.balkenSpann(0.15, 0.21, "eiche", 1.7, 1.5, 2.0);
    console.log(`B1-Selbsttest: kreuzholz(0,258) = ${kh.b.toFixed(4)} × ${kh.h.toFixed(4)} · balkenSpann(0,15·0,21, e 1,7) = ${bs.L.toFixed(3)} m (inst ${bs.lInst.toFixed(2)} fin ${bs.lFin.toFixed(2)} bieg ${bs.lBieg.toFixed(2)}) · geschossH(1650, 0,211) = ${GZ.geschossH(1650, 0.211).toFixed(3)} · s(Heimat, 45°) = ${GZ.schneeLast(1.51, 45).toFixed(3)}`);
    const T85 = GZ.tragwerk(GZ.SCHLIESSUNG.ort, 0.85), T17 = GZ.tragwerk(GZ.SCHLIESSUNG.ort, 1.7);
    console.log(`Tragwerk Heimat: Kreuzholz ${T85.b.toFixed(3)}×${T85.h.toFixed(3)} · L_max e 0,85 = ${T85.Lmax.toFixed(2)} m · e 1,70 = ${T17.Lmax.toFixed(2)} m`);

    // ── die Pläne ──
    const plaene = [];
    for (let s = 1; s <= 30; s++) plaene.push({ art: "G", key: `G${s}`, DP: { seed: s, nH: 90 } });
    for (const ep of Object.keys(FC.EPOCHEN)) for (const s of [1, 2]) plaene.push({ art: "E", key: `E-${ep}-${s}`, DP: { seed: s, epoche: ep } });
    for (let s = 1; s <= 10; s++) plaene.push({ art: "K", key: `K${s}`, DP: { seed: s, nH: 12 } });
    // F: 20 Großstädte der frühen Neuzeit (Band FNZ, dichte 250) über das ERBE des Kerns (FC:4414) — nur für Behauptung 4:
    // der Würfel der 30 G-Pläne trifft 1500–1750 nur zweimal (Jahr 880 + 680u, FC:4412)
    const RG = ["mitteleuropa", "mediterran", "alpin", "nordisch"];
    for (let s = 1; s <= 20; s++) plaene.push({ art: "F", key: `F${s}`, DP: { seed: 100 + s, nH: 90, erbe: { region: RG[s % 4], jahr: 1500 + 12 * (s - 1), spanne: 60 } } });

    const alle = [];
    const planZahl = [];
    for (const P of plaene) {
        const pl = FC.DORF(P.DP);
        const band = pl.groesse === "weiler" || pl.groesse === "dorf" ? "dorf" : "stadt";
        const N = pl.houses.filter((h) => h.rolle !== "scheune" && h.rolle !== "burg").length;
        let i = 0;
        const hs = pl.houses.map((hp, a) => {
            const losI = hp.rolle === "scheune" ? null : i++;
            const t = losI == null ? null : Math.min(1, losI / Math.max(1, N - 1));
            const u = t == null || !isFinite(hp.wohl) ? 0.5 : Math.max(0, Math.min(1, (hp.wohl / (1.22 - 0.5 * t) - 0.78) / 0.44));
            return { plan: P.key, art: P.art, region: pl.region, jahr: pl.jahr, groesse: pl.groesse, staedtisch: pl.staedtisch, band, a, losI, t, u, hp };
        });
        // Haushalts-Lose und ihre Klasse (Rang-Quantil von q im Plan, Schließung S6)
        const HH = hs.filter((h) => h.losI != null && !GZ.SONDERBAU.has(h.hp.rolle));
        for (const h of HH) h.qW = (1 - h.t + h.u) / 2;
        const qs = HH.map((h) => h.qW).slice().sort((x, y) => x - y);
        for (const h of HH) {
            const rang = qs.indexOf(h.qW) / Math.max(1, qs.length - 1);
            h.klasse = GZ.SCHLIESSUNG.klasseNachRang ? (rang < GZ.BAU_GESETZ.klasse[0] ? 0 : rang < GZ.BAU_GESETZ.klasse[1] ? 1 : 2) : (h.qW < 0.5 ? 0 : h.qW < 0.9 ? 1 : 2);
            h.klasseWoertlich = h.qW < 0.5 ? 0 : h.qW < 0.9 ? 1 : 2;
        }
        // gewerbeVon: die Rolle des Loses (LAGE) zuerst, dann die Quote über die Wohn-Lose nach q
        // DIE QUOTE sagt WIE VIELE (GEWERBE_ANTEIL × Haushalte), die LAGE sagt WO (entscheid §1.2 gewerbeVon): je Gruppe zuerst die Lose
        // ihrer Lage (das Viertel bzw. der Grund-Satz der Grammatik heute), dann nach q (handel/lebensmittel/handwerk: reich zuerst; acker:
        // der Rand zuerst). Der Pfarrer (pfarrhaus) steht außerhalb der Quote. Bis auf die Grund-Sätze wirt/schmied trägt KEINE heutige Rolle ihr Gewerbe mit.
        const quote = GZ.GEWERBE_ANTEIL[band];
        for (const h of HH) if (h.hp.rolle === "pfarrhaus") h.gewerbe = "geistlich";
        for (const h of HH) if (h.hp.rolle === "gasthaus") h.gewerbe = "wirt";
        for (const h of HH) if (h.hp.rolle === "schmiede") h.gewerbe = "schmied";
        const lageVon = { handel: (h) => h.hp.viertel === "markt" || ["kaufhaus", "kontor", "patrizierhaus", "wohnturm"].includes(h.hp.rolle), lebensmittel: (h) => h.hp.viertel === "markt" || h.hp.rolle === "backhaus", handwerk: (h) => h.hp.viertel === "handwerk" || ["werkstatt", "gerberei"].includes(h.hp.rolle), acker: () => false };
        for (const gr of ["handel", "lebensmittel", "handwerk", "acker"]) {
            const schon = HH.filter((h) => h.gewerbe && GZ.GEWERBE[h.gewerbe].gruppe === gr).length;
            const soll = Math.max(0, Math.round(quote[gr] * HH.length) - schon);
            const kand = HH.filter((h) => !h.gewerbe).sort((x, y) => (lageVon[gr](y) ? 1 : 0) - (lageVon[gr](x) ? 1 : 0) || (gr === "acker" ? y.t - x.t : y.qW - x.qW));
            const L = GZ.GRUPPE_GEWERBE[gr];
            for (let j = 0; j < soll && j < kand.length; j++) kand[j].gewerbe = gr === "handwerk" && kand[j].hp.rolle === "gerberei" ? "gerber" : gr === "lebensmittel" && kand[j].hp.rolle === "backhaus" ? "baecker" : L[(kand[j].hp.seed >>> 0) % L.length];
        }
        for (const h of HH) if (!h.gewerbe) h.gewerbe = "tageloehner";
        // das Haus nach dem Gesetz
        for (const h of HH) {
            const kn = h.hp.kultur, pk = KULTUR[kn] ? pitchKultur(KULTUR, kn, h.hp.seed) : h.hp.pitchDeg;
            h.A = { gewerbe: h.gewerbe, klasse: h.klasse, baujahr: h.hp.baujahr, stil: h.hp.stil, region: pl.region, pitchKultur: pk, kultSt: KULTUR[kn] ? KULTUR[kn].st : h.hp.storeys };
            h.L = GZ.hausVonAdresse(h.A, GZ.SCHLIESSUNG.ort);
        }
        // heute je Haus: Traufe nach HAUS (FC:178/214: 0,55 + 2,55 + 2,35·(st−1), Pilotis +2,6), Leute, Statik des Balkens 0,15×0,21
        for (const h of hs) {
            const p = h.hp, st = Math.max(1, Math.min(12, Math.round(p.storeys || 1)));
            h.traufeHeute = 0.55 + (p.pilotis ? 2.6 : 0) + 2.55 + 2.35 * (st - 1);
            h.leuteHeute = FC.leuteVon(p);
            const E = eHeute(p); h.eHeute = E.e;
            const S = GZ.balkenSpann(0.15, 0.21, "eiche", E.e, 1.5, 2.0), Sn = GZ.balkenSpann(0.15, 0.21, "kiefer", E.e, 1.5, 2.0);
            h.statikHeute = { Lmax: S.L, lBieg: S.lBieg, LmaxC24: Sn.L, lBiegC24: Sn.lBieg, traegt: p.D <= S.L, bruch: p.D > S.lBieg, bruchC24: p.D > Sn.lBieg };
        }
        // Mauer (Behauptung 4): nur städtische Pläne vor MAUER_BIS (FC:5342, 1750)
        let mauer = null;
        if (pl.staedtisch && pl.jahr < FC.MAUER_BIS) {
            const E = HH.reduce((s, h) => s + h.L.H.koepfe, 0), losF = HH.reduce((s, h) => s + h.L.los.b * h.L.los.t, 0), bandM = pl.jahr < 1500 ? 0 : 1;
            const R = GZ.mauerRadius(E, bandM), ring = Math.PI * R * R, Rheute = Math.min(195, 26 + 8.4 * Math.sqrt(pl.nGestalt));
            mauer = { E: r2(E), R: r2(R), Rheute: r2(Rheute), losF: Math.round(losF), ring: Math.round(ring), anteil: losF / ring, dichte: GZ.BAU_GESETZ.dichte[bandM], fussHeute: Math.round(hs.reduce((s, h) => s + h.hp.W * h.hp.D, 0)), anteilHeute: hs.reduce((s, h) => s + h.hp.W * h.hp.D, 0) / (Math.PI * Rheute * Rheute) };
        }
        planZahl.push({ key: P.key, art: P.art, region: pl.region, jahr: pl.jahr, groesse: pl.groesse, n: pl.houses.length, HH: HH.length, mauer });
        alle.push(...hs);
    }

    // ── Behauptungen 2, 3, 5 an den Wohn-Losen der 30 Pläne nH 90 (G) ──
    const G = alle.filter((h) => h.art === "G");
    const wohnHeute = G.filter((h) => h.hp.rolle === "wohnhaus");
    const HHg = G.filter((h) => h.L);
    console.log(`\nG: 30 Pläne nH 90 — Häuser ${G.length}, Wohnhäuser heute ${wohnHeute.length}, Haushalts-Lose Gesetz ${HHg.length}`);
    const W0 = wohnHeute.map((h) => h.hp.W), w0 = wohnHeute.map((h) => h.hp.wohl), T0 = wohnHeute.map((h) => h.traufeHeute), L0 = wohnHeute.map((h) => h.leuteHeute);
    const W1 = HHg.map((h) => h.L.F.W), q1 = HHg.map((h) => h.qW), wl1 = HHg.map((h) => h.L.H.wohl), T1 = HHg.map((h) => h.L.traufe), K1 = HHg.map((h) => h.L.H.koepfe);
    const B3 = {
        spearmanHeute: spearman(W0, w0), spearmanGesetzQ: spearman(W1, q1), spearmanGesetzWohl: spearman(W1, wl1),
        breiteHeute: [q(W0, 0.1), q(W0, 0.5), q(W0, 0.9)], breiteGesetz: [q(W1, 0.1), q(W1, 0.5), q(W1, 0.9)],
        traufeHeute: [q(T0, 0.1), q(T0, 0.9)], traufeGesetz: [q(T1, 0.1), q(T1, 0.9)],
        leuteHeute: mean(L0), koepfeGesetz: mean(K1),
        klassen: [0, 1, 2].map((k) => HHg.filter((h) => h.klasse === k).length / HHg.length), klassenWoertlich: [0, 1, 2].map((k) => HHg.filter((h) => h.klasseWoertlich === k).length / HHg.length),
        gewerbe: Object.fromEntries(Object.keys(GZ.GEWERBE).map((g) => [g, HHg.filter((h) => h.gewerbe === g).length])),
    };
    console.log("B3", JSON.stringify(B3, (k, v) => (typeof v === "number" ? r2(v) : v)));
    // B2
    const b2W = HHg.filter((h) => h.L.F.W < 4.5).length, b2st = HHg.filter((h) => h.L.F.st > h.A.kultSt + 2).length, b2tr = HHg.filter((h) => h.L.traufe > 2 * h.L.F.D).length;
    const b2trHeute = wohnHeute.filter((h) => h.traufeHeute > 2 * h.hp.D).length;
    const b2ue = HHg.filter((h) => h.L.F.ueberZiel).length, b2gl = HHg.filter((h) => h.L.F.groesserAlsLos).length;
    console.log(`B2: W<4,5 ${b2W}/${HHg.length} · st > Kultur-st+2 ${b2st} (${r2((100 * b2st) / HHg.length)} %) · Traufe > 2·D ${b2tr} (heute ${b2trHeute}/${wohnHeute.length}) · EG passt nicht in Breite×dZiel ${b2ue} (${r2((100 * b2ue) / HHg.length)} %) · D > Los-Tiefe 30 ${b2gl}`);
    const proGew = {}; for (const h of HHg) { const g = (proGew[h.gewerbe + "/" + h.klasse] ||= { n: 0, D: [], st: [], ue: 0 }); g.n++; g.D.push(h.L.F.D); g.st.push(h.L.F.st); if (h.L.F.ueberZiel) g.ue++; }
    console.log("  je Gewerbe/Klasse: " + Object.entries(proGew).sort().map(([k, g]) => `${k} n${g.n} D50 ${q(g.D, 0.5)} st50 ${q(g.st, 0.5)} über ${g.ue}`).join(" · "));
    for (const dz of [9, 11, 14]) {
        const LL = HHg.map((h) => GZ.hausVonAdresse(h.A, GZ.SCHLIESSUNG.ort, { dZiel: dz }));
        const st2 = LL.filter((L, j) => L.F.st > HHg[j].A.kultSt + 2).length, tr2 = LL.filter((L) => L.traufe > 2 * L.F.D).length, ue2 = LL.filter((L) => L.F.ueberZiel).length;
        console.log(`  Schließung dZiel ${dz}: EG über Ziel ${r2((100 * ue2) / LL.length)} % · st>Kultur+2 ${r2((100 * st2) / LL.length)} % · Traufe>2D ${r2((100 * tr2) / LL.length)} % · D Q10/50/90 ${r2(q(LL.map((L) => L.F.D), 0.1))}/${r2(q(LL.map((L) => L.F.D), 0.5))}/${r2(q(LL.map((L) => L.F.D), 0.9))} · st Q50/Q90 ${q(LL.map((L) => L.F.st), 0.5)}/${q(LL.map((L) => L.F.st), 0.9)} · Traufe Q10/Q90 ${r2(q(LL.map((L) => L.traufe), 0.1))}/${r2(q(LL.map((L) => L.traufe), 0.9))}`);
    }
    // Statik heute über alle Wohnhäuser G
    const stH = wohnHeute.map((h) => h.statikHeute);
    console.log(`Statik heute (Wohnhäuser G, Balken 0,15×0,21 Eiche D30, e aus dem Ständer-Raster): trägt ${stH.filter((s) => s.traegt).length} · Bruch ${stH.filter((s) => s.bruch).length} · Bruch C24 ${stH.filter((s) => s.bruchC24).length} von ${stH.length}; e Q10/Q90 ${r2(q(wohnHeute.map((h) => h.eHeute), 0.1))}/${r2(q(wohnHeute.map((h) => h.eHeute), 0.9))}`);
    console.log(`Statik Gesetz (G): Schiffe ${JSON.stringify([1, 2, 3, 4].map((n) => HHg.filter((h) => h.L.S.n === n).length))} · spann max ${r2(Math.max(...HHg.map((h) => h.L.S.spann)))} gegen L_max ${r2(HHg[0].L.T.Lmax)}`);
    // Behauptung 4
    const M = planZahl.filter((p) => p.mauer);
    console.log(`\nB4 Mauer: städtische Pläne vor 1750: ${M.length}; Anteil Los/Ring > 0,8: ${M.filter((p) => p.mauer.anteil > 0.8).length}`);
    for (const d of [150, 250]) { const Md = M.filter((p) => p.mauer.dichte === d); if (Md.length) console.log(`  dichte ${d}: ${Md.length} Pläne, > 0,8: ${Md.filter((p) => p.mauer.anteil > 0.8).length}, Anteil Q50 ${r2(q(Md.map((p) => p.mauer.anteil), 0.5))}, Köpfe je Haushalt ${r2(mean(Md.map((p) => p.mauer.E / p.HH)))}`); }
    for (const art of ["G", "E", "F"]) { const Ma = M.filter((p) => p.art === art); if (Ma.length) console.log(`  Art ${art}: ${Ma.length} Pläne, > 0,8: ${Ma.filter((p) => p.mauer.anteil > 0.8).length}`); }
    console.log(`Köpfe ohne Gesinde (nur Kern) G: ${r2(mean(HHg.map((h) => h.L.H.kern)))} · mit Gesinde ${r2(B3.koepfeGesetz)} · Kern/heute ×${r2(mean(HHg.map((h) => h.L.H.kern)) / B3.leuteHeute)}`);
    console.log(`  Anteil Q0/Q50/Q100 ${r2(Math.min(...M.map((p) => p.mauer.anteil)))}/${r2(q(M.map((p) => p.mauer.anteil), 0.5))}/${r2(Math.max(...M.map((p) => p.mauer.anteil)))} · R Gesetz/heute Q50 ${r2(q(M.map((p) => p.mauer.R), 0.5))}/${r2(q(M.map((p) => p.mauer.Rheute), 0.5))}`);
    for (const p of M.filter((p) => p.mauer.anteil > 0.6)) console.log(`  ${p.key} ${p.region} ${p.jahr} ${p.groesse} HH ${p.HH} E ${p.mauer.E} R ${p.mauer.R} (heute ${p.mauer.Rheute}) dichte ${p.mauer.dichte} Lose ${p.mauer.losF} m² Ring ${p.mauer.ring} m² Anteil ${r2(p.mauer.anteil)} (heute Fuß/Ring ${r2(p.mauer.anteilHeute)})`);

    // ── Preis: Rezept je Haus (µs), DORF nH 90 (ms) ──
    const probe = HHg.slice(0, 400), REP = 200;
    const zeit = (f) => { for (let r = 0; r < 20; r++) for (const h of probe) f(h); const t0 = process.hrtime.bigint(); for (let r = 0; r < REP; r++) for (const h of probe) f(h); return Number(process.hrtime.bigint() - t0) / 1e3 / (REP * probe.length); };
    const usNull = zeit((h) => FC.bauRezept({ bauweise: h.hp.kultur }, null, h.hp.seed));
    const usHH = zeit((h) => FC.bauRezept({ bauweise: h.hp.kultur }, { personen: 4, wohl: h.hp.wohl }, h.hp.seed));
    const usG = zeit((h) => GZ.hausVonAdresse(h.A, GZ.SCHLIESSUNG.ort));
    const usGplus = zeit((h) => { FC.bauRezept({ bauweise: h.hp.kultur }, null, h.hp.seed); GZ.hausVonAdresse(h.A, GZ.SCHLIESSUNG.ort); });
    for (let r = 0; r < 2; r++) for (let s = 1; s <= 30; s++) FC.DORF({ seed: s, nH: 90 });
    const t0 = process.hrtime.bigint(); for (let r = 0; r < 5; r++) for (let s = 1; s <= 30; s++) FC.DORF({ seed: s, nH: 90 }); const msDorf = Number(process.hrtime.bigint() - t0) / 1e6 / 150;
    const hhJePlan = HHg.length / 30;
    console.log(`\nPreis: bauRezept heute ohne HH ${usNull.toFixed(2)} µs · mit HH (Packer) ${usHH.toFixed(2)} µs · Gesetz-Prototyp ${usG.toFixed(2)} µs · Kultur-Wurf + Gesetz ${usGplus.toFixed(2)} µs je Haus · DORF nH 90 heute ${msDorf.toFixed(3)} ms → mit Gesetz ≤ ${(msDorf + (hhJePlan * usG) / 1000).toFixed(3)} ms (+${hhJePlan.toFixed(0)} Häuser × ${usG.toFixed(2)} µs, ohne Abzug der fallenden Würfel) · Köpfe Gesetz/heute ${(B3.koepfeGesetz / B3.leuteHeute).toFixed(2)}`);

    // ── die 100: geschichtet über G (40) · E (40) · K (20), je nach Baujahr gereiht, gleich verteilt; Gegenbeispiele erzwungen ──
    const wahl = [];
    const nimm = (liste, n) => { const s = liste.slice().sort((a, b) => a.hp.baujahr - b.hp.baujahr || a.plan.localeCompare(b.plan) || a.a - b.a); for (let j = 0; j < n; j++) wahl.push(s[Math.floor(((j + 0.5) * s.length) / n)]); };
    nimm(alle.filter((h) => h.art === "G" && h.hp.rolle !== "scheune"), 38);
    nimm(alle.filter((h) => h.art === "E" && h.hp.rolle !== "scheune"), 38);
    nimm(alle.filter((h) => h.art === "K" && h.hp.rolle !== "scheune"), 18);
    const HHall = alle.filter((h) => h.L && h.art !== "F");
    const gegen = {
        aermstes: HHall.slice().sort((a, b) => a.qW - b.qW)[0],
        groesstesGewerbe: HHall.filter((h) => h.gewerbe !== "tageloehner" && h.gewerbe !== "ackerbuerger").sort((a, b) => b.L.F.brutto - a.L.F.brutto)[0],
        fruehesteEpoche: HHall.slice().sort((a, b) => a.hp.baujahr - b.hp.baujahr)[0],
        schmalstesLosHeute: alle.filter((h) => h.hp.rolle === "wohnhaus" && h.art !== "F").sort((a, b) => a.hp.W - b.hp.W || a.hp.D - b.hp.D)[0],
        hoechsteTraufeGesetz: HHall.slice().sort((a, b) => b.L.traufe - a.L.traufe)[0],
        meisteKoepfeArm: HHall.filter((h) => h.klasse === 0).sort((a, b) => b.L.H.koepfe - a.L.H.koepfe)[0],
    };
    for (const [k, h] of Object.entries(gegen)) { h.gegen = k; if (!wahl.includes(h)) wahl.push(h); }
    const seen = new Set(), hundert = [];
    for (const h of wahl) { const id = h.plan + "#" + h.a; if (!seen.has(id)) { seen.add(id); hundert.push(h); } }
    console.log(`\ndie 100: ${hundert.length} Häuser (G ${hundert.filter((h) => h.art === "G").length} · E ${hundert.filter((h) => h.art === "E").length} · K ${hundert.filter((h) => h.art === "K").length}), Gegenbeispiele ${Object.keys(gegen).join(", ")}`);
    const aus = hundert.map((h) => ({ plan: h.plan, art: h.art, a: h.a, region: h.region, groesse: h.groesse, staedtisch: h.staedtisch, losI: h.losI, t: h.t, u: h.u, qW: h.qW, klasse: h.klasse, gewerbe: h.gewerbe || null, gegen: h.gegen || null, hp: h.hp, traufeHeute: h.traufeHeute, leuteHeute: h.leuteHeute, eHeute: h.eHeute, statikHeute: h.statikHeute, A: h.A || null, L: h.L || null }));
    fs.writeFileSync(path.join(__dirname, "pool.json"), JSON.stringify({ B3, b2: { W: b2W, st: b2st, tr: b2tr, n: HHg.length }, plaene: planZahl, preis: { usNull, usHH, usG, usGplus, msDorf, hhJePlan }, hundert: aus }, null, 0));
    console.log("geschrieben pool.json", (fs.statSync(path.join(__dirname, "pool.json")).size / 1024).toFixed(0), "KB");
})().catch((e) => { console.error(e); process.exit(1); });
