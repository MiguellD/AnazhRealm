// zaehl-hoehe.cjs — BAU-ZENSUS Runde 3, ZAHL 2: WORAUS folgen heute Geschosszahl und Traufe — an den 2 595 Haushalts-Losen der
// 30 Pläne G (Saat 1–30, nH 90; dieselbe Menge wie pool.cjs:94–100 und spike-v2), am echten Kern.
//
// Aufruf:  node zaehl-hoehe.cjs                (Kern aus dem Lese-Baum, LESEBAUM=…/n1011-hg)
//          KERN_DIR=…/bau-spike3/kern node zaehl-hoehe.cjs   (byte-gleiche Kopie; SHA-256 beider gedruckt und verglichen)
//
// (1) NACHBAU DER KETTE je Los (jede Stufe ist ein Ruf in den Kern oder eine Zeile des Kerns, keine eigene Formel):
//     S0 = KULTUR[kultur].st                         die Tafel der Kultur (FC:2121–2153)
//     S1 = bauRezept({bauweise:kultur}, null, seed)  + Maß-Würfel st ≥ 4 (FC:2210)
//     S2 = S1 + 1, wenn städtisch ∧ wohl > 0,9 ∧ S1 < 4 (FC:4444; wohl = (1,22 − 0,5·t)·(0,78 + 0,44·Würfel), FC:4438)
//     S3 = die Maß-Zeile der Rolle über S2 (BAU_NUTZUNG FC:2182–2200, angewandt wie bauRezept FC:2227–2228)
//     S3 muss hp.storeys des Plans sein (gezählt). Die Kultur selbst ist ein Würfel im Pool von Region × Ära (FC:4424, 4435).
// (2) ZERLEGUNG: Var(st) = Σ_i Cov(Δ_i, st) mit st = Σ Δ_i (exakt, die Anteile summieren auf 1).
// (3) RANG-KORRELATION (Spearman) und η² (Gruppen-Varianz/Gesamt) je Kandidat: Abstand zum Markt (exportSettlement: slot.x/z ↔ platz),
//     Abstand zur Mitte, Gründungs-Rang t, Front W, Tiefe D, wohl, Baujahr; η² für Rolle, Kultur, Stoff (stil), Region, Plan.
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { pathToFileURL } = require("url");

const LESEBAUM = process.env.LESEBAUM || "C:/Users/micha/Desktop/AnazhRealm-OMEN/n1011-hg";
const KERN_DIR = process.env.KERN_DIR || null;
const sha = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");
async function laden() {
    const fcOrig = path.join(LESEBAUM, "fachwerk-core.js"), fc = KERN_DIR ? path.join(KERN_DIR, "fachwerk-core.js") : fcOrig;
    const three = KERN_DIR ? path.join(KERN_DIR, "three.module.min.js") : path.join(LESEBAUM, "vendor", "three.module.min.js");
    const sO = sha(fcOrig), sK = sha(fc);
    console.log(`Kern ${fc}\n  SHA-256 ${sK}\n  Original SHA-256 ${sO} → ${sO === sK ? "BYTE-GLEICH" : "VERSCHIEDEN"}`);
    if (sO !== sK) throw new Error("zaehl-hoehe: Kern nicht byte-gleich");
    const w = process.emitWarning; process.emitWarning = () => {};
    const T = await import(pathToFileURL(three).href); process.emitWarning = w;
    T.ColorManagement.enabled = false; global.THREE = { ...T }; require(fc);
    return globalThis.__fachwerkCore;
}
const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
const vari = (a) => { const m = mean(a); return mean(a.map((x) => (x - m) ** 2)); };
const cov = (a, b) => { const ma = mean(a), mb = mean(b); let s = 0; for (let i = 0; i < a.length; i++) s += (a[i] - ma) * (b[i] - mb); return s / a.length; };
const raenge = (a) => { const o = a.map((v, i) => [v, i]).sort((x, y) => x[0] - y[0]), r = new Array(a.length); for (let i = 0; i < o.length; ) { let j = i; while (j + 1 < o.length && o[j + 1][0] === o[i][0]) j++; const m = (i + j) / 2 + 1; for (let k = i; k <= j; k++) r[o[k][1]] = m; i = j + 1; } return r; };
const pearson = (x, y) => cov(x, y) / Math.sqrt(vari(x) * vari(y));
const spearman = (x, y) => pearson(raenge(x), raenge(y));
const eta2 = (y, g) => { const G = {}; y.forEach((v, i) => (G[g[i]] ||= []).push(v)); const m = mean(y); let b = 0; for (const k in G) b += G[k].length * (mean(G[k]) - m) ** 2; return b / y.length / vari(y); };
const dezil = (x) => { const r = raenge(x); return r.map((v) => Math.min(9, Math.floor((10 * (v - 1)) / x.length))); };
const q = (a, p) => { const s = a.slice().sort((x, y) => x - y); const i = (s.length - 1) * p, lo = Math.floor(i), hi = Math.ceil(i); return s[lo] + (s[hi] - s[lo]) * (i - lo); };
const r3 = (v) => Math.round(v * 1000) / 1000, r2 = (v) => Math.round(v * 100) / 100;

(async () => {
    const t0 = Date.now();
    const FC = await laden();
    const SB = require("../spike/gesetz-proto.cjs").SONDERBAU; // nur gelesen (pool.cjs:100)
    const L = [];
    const plaene = [];
    for (let s = 1; s <= 30; s++) {
        const pl = FC.DORF({ seed: s, nH: 90 });
        const ex = FC.exportSettlement({ seed: s, nH: 90 }); // dieselbe DORF-Rechnung (FC:9733) + Lage der Lose (dorfLayout FC:5357)
        const slotVon = new Map(); for (const sl of ex.slots) slotVon.set(sl.seed + "|" + sl.rolle, sl); // Slots überspringen Lose ohne Lage (FC:9850)
        const pc = ex.platz ? [ex.platz.cx, ex.platz.cz] : [0, 0];
        const nHaus = pl.houses.length, n = pl.houses.filter((h) => h.rolle !== "burg" && h.rolle !== "scheune").length;
        const Rw = ex.mauer && ex.mauer.R ? ex.mauer.R : 0;
        plaene.push({ s, region: pl.region, jahr: pl.jahr, staedtisch: pl.staedtisch, dichte: Rw ? nHaus / (Math.PI * Rw * Rw) : 0, Rw });
        let i = 0;
        pl.houses.forEach((hp, a) => {
            const losI = hp.rolle === "scheune" ? null : i++;
            if (losI == null || SB.has(hp.rolle)) return;
            const sl = slotVon.get(hp.seed + "|" + hp.rolle) || null;
            const K = FC.KULTUR[hp.kultur];
            const S0 = K.st, S1 = FC.bauRezept({ bauweise: hp.kultur }, null, hp.seed).storeys;
            const S2 = S1 + (pl.staedtisch && hp.wohl > 0.9 && S1 < 4 ? 1 : 0);
            let S3 = S2; const N = FC.BAU_NUTZUNG[hp.rolle];
            if (N && N.mass) for (const o of N.mass) if (o[0] === "storeys") S3 = o[1] === "setze" ? o[2] : o[1] === "mindestens" ? Math.max(S3, o[2]) : o[1] === "hoechstens" ? Math.min(S3, o[2]) : S3 + o[2];
            // der Pool der Kultur (poolAt FC:4424: ohne Epoche und ohne Ringe die REGION_HIST-Ära des Baujahrs)
            let era = 0; FC.REGION_HIST[pl.region].forEach((e, k) => { if (hp.baujahr >= e[0]) era = k; });
            const traufe = 0.55 + (hp.pilotis ? 2.6 : 0) + (hp.egH || 2.55) + (hp.ogH || 2.35) * (hp.storeys - 1); // FC:178, 211–215
            L.push({ adr: "G" + s + "#" + a, plan: "G" + s, region: pl.region, staedtisch: pl.staedtisch, rolle: hp.rolle, kultur: hp.kultur, stil: hp.stil, st: hp.storeys, traufe,
                S0, S1, S2, S3, pool: pl.region + "/" + era, t: losI / Math.max(1, n - 1), wohl: hp.wohl, W: hp.W, D: hp.D, baujahr: hp.baujahr,
                dMarkt: sl ? Math.hypot(sl.x - pc[0], sl.z - pc[1]) : NaN, dMitte: sl ? Math.hypot(sl.x, sl.z) : NaN, ovSt: sl && sl.ov ? sl.ov.storeys : null, egH: hp.egH, ogH: hp.ogH, pilotis: hp.pilotis });
        });
    }
    if (L.length !== 2595) throw new Error("Lose " + L.length);
    const st = L.map((h) => h.st), T = L.map((h) => h.traufe);
    console.log(`\nLose ${L.length} · Pläne: ${plaene.map((p) => p.region[0] + p.jahr).join(" ")} · städtisch ${plaene.filter((p) => p.staedtisch).length}/30`);
    console.log(`Geschosse: ${[1, 2, 3, 4, 5, 6].map((k) => `st ${k}: ${st.filter((v) => v === k).length}`).join(" · ")} · Traufe Q10 ${r2(q(T, 0.1))} · Q90 ${r2(q(T, 0.9))} · SPANNE ${r2(q(T, 0.9) - q(T, 0.1))} m`);
    const linear = L.every((h) => !h.pilotis && h.egH == null && h.ogH == null);
    console.log(`Traufe = 3,10 + 2,35·(st − 1) an allen Losen (kein pilotis, kein egH/ogH im hp): ${linear ? "JA — die Traufe ist die Geschosszahl" : "NEIN"} · Spearman(Traufe, st) ${r3(spearman(T, st))}`);
    console.log(`Gebaut = Plan: slot.ov.storeys = hp.storeys an ${L.filter((h) => h.ovSt === h.st).length}/${L.length}`);
    console.log(`Nachbau der Kette S3 = hp.storeys: ${L.filter((h) => h.S3 === h.st).length}/${L.length}${L.some((h) => h.S3 !== h.st) ? " · abweichend: " + L.filter((h) => h.S3 !== h.st).slice(0, 6).map((h) => `${h.adr} ${h.rolle}/${h.kultur} S1 ${h.S1} S2 ${h.S2} S3 ${h.S3} st ${h.st}`).join(", ") : ""}`);

    // (2) Zerlegung der Varianz: st = Ort/Zeit (Pool-Mittel von S0) + Kultur-Würfel (S0 − Pool-Mittel) + Maß-Würfel (S1 − S0)
    //     + Wohl-Rang (E[Boost | t-Dezil]) + Wohl-Würfel (Boost − E[Boost | t]) + Rolle (S3 − S2) + Rest (st − S3)
    const poolM = {}; for (const h of L) (poolM[h.pool] ||= []).push(h.S0); for (const k in poolM) poolM[k] = mean(poolM[k]);
    const tD = dezil(L.map((h) => h.t)), boost = L.map((h) => h.S2 - h.S1), bM = {}; boost.forEach((b, i) => (bM[tD[i]] ||= []).push(b)); for (const k in bM) bM[k] = mean(bM[k]);
    const komp = {
        "Ort/Zeit (Region × Ära des Pools, FC:4424)": L.map((h) => poolM[h.pool]),
        "Kultur-Würfel im Pool (FC:4435)": L.map((h) => h.S0 - poolM[h.pool]),
        "Maß-Würfel st≥4 (FC:2210)": L.map((h) => h.S1 - h.S0),
        "Wohl → +1, Rang-Teil (FC:4438/4444)": tD.map((d) => bM[d]),
        "Wohl → +1, Würfel-Teil (FC:4438)": boost.map((b, i) => b - bM[tD[i]]),
        "Rolle/Viertel-Zeile (FC:2184–2200)": L.map((h) => h.S3 - h.S2),
        "Rest (Nachbau ≠ Plan)": L.map((h) => h.st - h.S3),
    };
    const V = vari(st); let summe = 0;
    console.log(`\nZERLEGUNG Var(Geschosse) = ${r3(V)} (Var(Traufe) = ${r3(vari(T))} m² = 2,35² · Var(st)) — Anteil = Cov(Δ, st)/Var(st):`);
    for (const [k, d] of Object.entries(komp)) { const a = cov(d, st) / V; summe += a; console.log(`  ${k.padEnd(46)} ${(100 * a).toFixed(1).padStart(6)} %   (Mittel ${r3(mean(d))})`); }
    console.log(`  Summe ${(100 * summe).toFixed(1)} %`);
    // Rolle zerlegt: welche Rolle steht wo (Lage = Los-Index → Viertel FC:4384, Wohl → Patrizier/Wohnturm FC:4340)
    const rollen = {}; for (const h of L) { (rollen[h.rolle] ||= { n: 0, st: [], d: [], t: [] }); rollen[h.rolle].n++; rollen[h.rolle].st.push(h.st); rollen[h.rolle].d.push(h.S3 - h.S2); rollen[h.rolle].t.push(h.t); }
    console.log("  je Rolle: n · st Ø · Δ Rolle Ø · t Ø: " + Object.entries(rollen).sort((a, b) => b[1].n - a[1].n).map(([k, v]) => `${k} ${v.n} · ${r2(mean(v.st))} · ${r2(mean(v.d))} · ${r2(mean(v.t))}`).join(" | "));
    // was am Würfel hängt, zusammengezählt
    const wuerfel = ["Kultur-Würfel im Pool (FC:4435)", "Maß-Würfel st≥4 (FC:2210)", "Wohl → +1, Würfel-Teil (FC:4438)"].reduce((s, k) => s + cov(komp[k], st) / V, 0);
    console.log(`  REINER WÜRFEL (Kultur im Pool + Maß + Wohl-Würfel): ${(100 * wuerfel).toFixed(1)} % · Rolle ${(100 * cov(komp["Rolle/Viertel-Zeile (FC:2184–2200)"], st) / V).toFixed(1)} % · Ort/Zeit ${(100 * cov(komp["Ort/Zeit (Region × Ära des Pools, FC:4424)"], st) / V).toFixed(1)} %`);

    // die Spanne ohne je eine Ursache (Traufe aus S an der Stelle der Ursache = ihr Mittel bzw. 0)
    const tr = (sv) => sv.map((v) => 3.1 + 2.35 * (v - 1)), sp = (a) => r2(q(a, 0.9) - q(a, 0.1));
    const ohneRolle = L.map((h) => h.S2), ohneBoost = L.map((h) => h.S3 - (h.S2 - h.S1) + 0), ohneKulturW = L.map((h, i) => Math.round(poolM[h.pool]) + (h.S3 - h.S0));
    const nurKultur = L.map((h) => h.S0);
    console.log(`\nSPANNE der Traufe (Q90 − Q10) heute ${sp(T)} m · ohne Rolle (S2) ${sp(tr(ohneRolle))} · ohne Wohl-+1 ${sp(tr(ohneBoost))} · ohne Kultur-Würfel (Pool-Mittel gerundet) ${sp(tr(ohneKulturW))} · nur die Kultur-Tafel S0 ${sp(tr(nurKultur))}`);
    const Q = (a) => [0.1, 0.9].map((p) => r2(q(a, p))).join("/");
    console.log(`  Q10/Q90 der Traufe: heute ${Q(T)} · ohne Rolle ${Q(tr(ohneRolle))} · ohne Wohl ${Q(tr(ohneBoost))} · nur S0 ${Q(tr(nurKultur))}`);
    console.log(`  Anteil st=3 heute ${r3(st.filter((v) => v >= 3).length / L.length)} · davon durch die Rolle gehoben (S2 < 3) ${L.filter((h) => h.st >= 3 && h.S2 < 3).length} · durch Wohl gehoben (S1 < 3 ≤ S2) ${L.filter((h) => h.st >= 3 && h.S1 < 3 && h.S2 >= 3).length} · schon aus der Kultur (S1 ≥ 3) ${L.filter((h) => h.st >= 3 && h.S1 >= 3).length}`);
    console.log(`  Anteil st=1 heute ${r3(st.filter((v) => v === 1).length / L.length)} · davon Rolle setzt 1 (S3=1<S2) ${L.filter((h) => h.st === 1 && h.S2 > 1).length} · Kultur st 1 ${L.filter((h) => h.st === 1 && h.S0 === 1).length}`);

    // (3) Kandidaten gegen die heutigen Daten
    console.log(`\nKANDIDATEN (Spearman ρ mit Geschossen · mit Traufe · η² Geschosse nach Dezilen bzw. Gruppen):`);
    const kont = { "Abstand zum Markt (slot ↔ platz)": L.map((h) => h.dMarkt), "Abstand zur Mitte (0,0)": L.map((h) => h.dMitte), "Gründungs-Rang t (Los-Index)": L.map((h) => h.t), "Front-Breite W": L.map((h) => h.W), "Tiefe D": L.map((h) => h.D), "Wohlstand wohl": L.map((h) => h.wohl), "Baujahr": L.map((h) => h.baujahr) };
    const mitLage = L.map((h) => Number.isFinite(h.dMarkt)); console.log(`  Lose mit Lage im Export: ${mitLage.filter(Boolean).length}/${L.length} (ρ der Lage nur über diese)`);
    const sub = (a) => a.filter((_, i) => mitLage[i]);
    for (const [k, x0] of Object.entries(kont)) { const lage = k.startsWith("Abstand"), x = lage ? sub(x0) : x0, y = lage ? sub(st) : st, yT = lage ? sub(T) : T; console.log(`  ${k.padEnd(34)} ρ ${r3(spearman(x, y)).toFixed(3).padStart(7)} · ${r3(spearman(x, yT)).toFixed(3).padStart(7)} · η² ${r3(eta2(y, dezil(x)))}`); }
    for (const k of ["rolle", "kultur", "stil", "region", "plan", "pool"]) console.log(`  η² nach ${k.padEnd(8)} ${r3(eta2(st, L.map((h) => h[k])))} (${new Set(L.map((h) => h[k])).size} Gruppen)`);
    // innerhalb des Plans (die Ursache „Lage“ ist eine Größe IN der Stadt): Spearman je Plan, Median über die 30
    const jePlan = (f) => { const r = []; for (const p of plaene) { const H = L.filter((h) => h.plan === "G" + p.s && Number.isFinite(f(h))); r.push(spearman(H.map(f), H.map((h) => h.st))); } return r3(q(r.filter(Number.isFinite), 0.5)); };
    console.log(`  je Plan (Median der 30 ρ): Abstand Markt ${jePlan((h) => h.dMarkt)} · t ${jePlan((h) => h.t)} · W ${jePlan((h) => h.W)} · wohl ${jePlan((h) => h.wohl)}`);
    // nur Wohnhäuser (die Rolle herausgenommen)
    const WH = L.filter((h) => h.rolle === "wohnhaus");
    console.log(`  nur Wohnhäuser (${WH.length}): ρ(Markt) ${r3(spearman(WH.filter((h) => Number.isFinite(h.dMarkt)).map((h) => h.dMarkt), WH.filter((h) => Number.isFinite(h.dMarkt)).map((h) => h.st)))} · ρ(t) ${r3(spearman(WH.map((h) => h.t), WH.map((h) => h.st)))} · ρ(W) ${r3(spearman(WH.map((h) => h.W), WH.map((h) => h.st)))} · ρ(wohl) ${r3(spearman(WH.map((h) => h.wohl), WH.map((h) => h.st)))} · η²(Kultur) ${r3(eta2(WH.map((h) => h.st), WH.map((h) => h.kultur)))}`);
    // Mauer-Enge: je Plan Häuser je m² Mauerring gegen mittlere Geschosse (30 Pläne)
    const pm = plaene.map((p) => mean(L.filter((h) => h.plan === "G" + p.s).map((h) => h.st)));
    console.log(`  Mauer-Enge (je Plan Häuser/πR², 30 Pläne): ρ mit Ø Geschossen ${r3(spearman(plaene.map((p) => p.dichte), pm))} · Dichte Q10/Q90 ${r3(q(plaene.map((p) => p.dichte), 0.1) * 1e4)}/${r3(q(plaene.map((p) => p.dichte), 0.9) * 1e4)} Häuser je ha · ummauert ${plaene.filter((p) => p.Rw > 0).length}/30`);
    console.log(`\nLaufzeit ${((Date.now() - t0) / 1000).toFixed(1)} s`);
})().catch((e) => { console.error(e); process.exit(1); });
