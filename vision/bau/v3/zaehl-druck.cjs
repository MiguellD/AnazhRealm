// zaehl-druck.cjs — BAU-ZENSUS Runde 3, dritter Gang (gesetz-v3-struktur.md, Entscheid 6 des Koordinators 19.11. 01:40):
// PRÜFT die HYPOTHESE „Druck → Geschosse“ an einer Zahl: liegen die heutigen Eingeschosser dort, wo der Zins am niedrigsten wäre?
//
// Aufruf: node zaehl-druck.cjs > zaehl-druck.log      (LESEBAUM=…/n1011-hg; kein git, kein GPU, schreibt nur ZEILEN_JSON)
//
// Menge: dieselben 2 595 Haushalts-Lose der 30 Pläne G (Saat 1–30, nH 90) wie zaehl-hoehe.cjs und zaehl-los.cjs. Die Zeile je Los
// rechnet zaehl-los.cjs am echten Kern (Kind-Prozess mit ZAEHL_JSON; dessen Kopf mit SHA und BYTE-GLEICH wird hier mitgedruckt).
// Eingänge des Drucks (heute gibt es keinen Zins im Kern — geprüft werden die Größen, an denen er hängen würde):
//   (a) Abstand der Front zum Markt (dMarkt, m) und r/Rw (Abstand zur Mitte ÷ Mauer-Radius);
//   (b) ABSOLUTE Breite der Straße an der Front (frontW, m; in Pariser Fuß à 0,3248 m; Klassen Paris 1784: < 24 · 24–29 · ≥ 30 Fuß);
//   (c) Größe der Siedlung (Lose je Plan).
// Je Eingang: Quantile der Eingeschosser gegen alle, Spearman ρ(Geschosse, Eingang) und ρ(eingeschossig 0/1, Eingang); dann der
// Störer: die Rolle/Viertel-Zeile (zensus-hoehe.md: 47,7 % der Varianz) und der Los-Index t (Rang, aus dem Wohlstand UND Lage wachsen,
// FC:4429, 4438, edepth FC:5369) — ρ nur unter Wohnhäusern, und ρ(eingeschossig, dMarkt) innerhalb der t-Dezile (Median).
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { spawnSync } = require("child_process");
const { pathToFileURL } = require("url");
const LESEBAUM = process.env.LESEBAUM || "C:/Users/micha/Desktop/AnazhRealm-OMEN/n1011-hg";
const ZEILEN = process.env.ZEILEN_JSON || "C:/Users/micha/Desktop/AnazhRealm-OMEN/p3/n1811/bau-spike3/druck-zeilen.json";
const FUSS = 0.3248;
const sha = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");

const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
const vari = (a) => { const m = mean(a); return mean(a.map((x) => (x - m) ** 2)); };
const cov = (a, b) => { const ma = mean(a), mb = mean(b); let s = 0; for (let i = 0; i < a.length; i++) s += (a[i] - ma) * (b[i] - mb); return s / a.length; };
const raenge = (a) => { const o = a.map((v, i) => [v, i]).sort((x, y) => x[0] - y[0]), r = new Array(a.length); for (let i = 0; i < o.length; ) { let j = i; while (j + 1 < o.length && o[j + 1][0] === o[i][0]) j++; for (let k = i; k <= j; k++) r[o[k][1]] = (i + j) / 2 + 1; i = j + 1; } return r; };
const spearman = (x, y) => { const rx = raenge(x), ry = raenge(y), v = Math.sqrt(vari(rx) * vari(ry)); return v ? cov(rx, ry) / v : NaN; };
const q = (a, p) => { if (!a.length) return NaN; const s = a.slice().sort((x, y) => x - y); const i = (s.length - 1) * p, lo = Math.floor(i), hi = Math.ceil(i); return s[lo] + (s[hi] - s[lo]) * (i - lo); };
const r2 = (v) => (Number.isFinite(v) ? Math.round(v * 100) / 100 : v), r3 = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : v);
const pz = (n, N) => (N ? ((100 * n) / N).toFixed(1) + " %" : "—");
const Q5 = (a) => [0.1, 0.25, 0.5, 0.75, 0.9].map((p) => r2(q(a, p))).join(" / ");
const zaehle = (S, f) => Object.entries(S.reduce((a, z) => ((a[f(z)] = (a[f(z)] || 0) + 1), a), {})).sort((a, b) => b[1] - a[1]).map(([k, c]) => `${k} ${c}`).join(" · ");

(async () => {
    const t0 = Date.now();
    console.log(`Skript ${__filename}\n  SHA-256 ${sha(__filename)}`);
    // (0) die Zeilen am echten Kern: zaehl-los.cjs als Kind
    const kind = spawnSync(process.execPath, [path.join(__dirname, "zaehl-los.cjs")], { env: Object.assign({}, process.env, { LESEBAUM, ZAEHL_JSON: ZEILEN }), encoding: "utf8", maxBuffer: 64 << 20 });
    if (kind.status !== 0) { console.error(kind.stderr); throw new Error("zaehl-los.cjs Exit " + kind.status); }
    console.log("Kopf des Kinds zaehl-los.cjs:\n" + kind.stdout.split(/\r?\n/).slice(0, 6).map((l) => "  | " + l).join("\n"));
    if (!/BYTE-GLEICH/.test(kind.stdout)) throw new Error("Kern nicht byte-gleich");
    // die Tafel der Kulturen (FC:2121–2153) für den Störer „Kultur-Geschosse“
    const w = process.emitWarning; process.emitWarning = () => {};
    const T = await import(pathToFileURL(path.join(LESEBAUM, "vendor", "three.module.min.js")).href); process.emitWarning = w;
    T.ColorManagement.enabled = false; global.THREE = { ...T }; require(path.join(LESEBAUM, "fachwerk-core.js"));
    const FC = globalThis.__fachwerkCore;
    const L = JSON.parse(fs.readFileSync(ZEILEN, "utf8")), M = L.filter((z) => z.slot != null);
    if (M.length !== 2595) throw new Error("Lose " + M.length);
    const E = M.filter((z) => z.st === 1), WH = M.filter((z) => z.rolle === "wohnhaus"), EW = WH.filter((z) => z.st === 1);
    console.log(`\nMENGE ${M.length} Lose · eingeschossig ${E.length} (${pz(E.length, M.length)}) · Wohnhäuser ${WH.length}, davon eingeschossig ${EW.length} (${pz(EW.length, WH.length)})`);

    // (b) die Breiten der Straßen an der Front, je gen, in m und Pariser Fuß
    console.log(`\n(b) ABSOLUTE STRASSENBREITE AN DER FRONT (Fahrbahn rd.w; Paris 1784 Art. 1: < 24 · 24–29 · ≥ 30 Fuß à ${FUSS} m = < ${r2(24 * FUSS)} · ${r2(24 * FUSS)}–${r2(30 * FUSS)} · ≥ ${r2(30 * FUSS)} m)`);
    for (const g of [0, 1, 2]) { const S = M.filter((z) => z.frontGen === g), ws = [...new Set(S.map((z) => r2(z.frontW)))].sort((a, b) => a - b);
        console.log(`  gen ${g}: ${S.length} Lose · Breiten ${ws.map((v) => `${v} m = ${r2(v / FUSS)} Fuß (${S.filter((z) => r2(z.frontW) === v).length})`).join(" · ")}`); }
    const klasse = (wm) => (wm / FUSS < 24 ? "< 24 Fuß" : wm / FUSS < 30 ? "24–29 Fuß" : "≥ 30 Fuß");
    console.log(`  Paris-Klasse der Front: alle ${zaehle(M, (z) => klasse(z.frontW))} · Eingeschosser ${zaehle(E, (z) => klasse(z.frontW))}`);
    console.log(`  Decke bis Gesims der untersten Klasse 36 Fuß = ${r2(36 * FUSS)} m; heutige Traufe 3,10 + 2,35·(st − 1): über der Decke ${M.filter((z) => 3.1 + 2.35 * (z.st - 1) > 36 * FUSS).length} Lose (${zaehle(M.filter((z) => 3.1 + 2.35 * (z.st - 1) > 36 * FUSS), (z) => z.rolle + " st " + z.st)})`);

    // (a)(b)(c) je Eingang: Quantile, ρ
    const lose = {}; for (const z of M) lose[z.plan] = (lose[z.plan] || 0) + 1;
    const EIN = [
        ["Abstand Front–Markt (m)", (z) => z.dMarkt],
        ["r/Rw (Mitte → Mauer)", (z) => z.rRel],
        ["Straßenbreite an der Front (m)", (z) => z.frontW],
        ["Größe der Siedlung (Lose je Plan)", (z) => lose[z.plan]],
        ["Los-Index t (Rang; Störer)", (z) => z.t],
    ];
    console.log(`\n(a–c) JE EINGANG: Quantile Q10/25/50/75/90 · Eingeschosser gegen alle · ρ(Geschosse, x) · ρ(eingeschossig 0/1, x) — alle | nur Wohnhäuser`);
    for (const [n, f] of EIN) {
        const ok = (S) => S.filter((z) => Number.isFinite(f(z)));
        const A = ok(M), Ae = ok(E), W = ok(WH);
        console.log(`  ${n}:\n    alle ${Q5(A.map(f))} · Eingeschosser ${Q5(Ae.map(f))} · mehrgeschossig ${Q5(A.filter((z) => z.st > 1).map(f))}`);
        console.log(`    ρ(st, x) ${r3(spearman(A.map((z) => z.st), A.map(f)))} · ρ(1G, x) ${r3(spearman(A.map((z) => (z.st === 1 ? 1 : 0)), A.map(f)))} | Wohnhäuser ρ(st, x) ${r3(spearman(W.map((z) => z.st), W.map(f)))} · ρ(1G, x) ${r3(spearman(W.map((z) => (z.st === 1 ? 1 : 0)), W.map(f)))}`);
    }
    // Anteil Eingeschosser je Quintil des Markt-Abstands (Wohnhäuser)
    { const W = WH.filter((z) => Number.isFinite(z.dMarkt)), s = W.map((z) => z.dMarkt).sort((a, b) => a - b), gr = [0.2, 0.4, 0.6, 0.8].map((p) => q(s, p));
      const k = (v) => gr.filter((g) => v > g).length, B = [0, 1, 2, 3, 4].map((i) => W.filter((z) => k(z.dMarkt) === i));
      console.log(`  Wohnhäuser, Anteil eingeschossig je Quintil des Markt-Abstands (nah → fern): ${B.map((b) => pz(b.filter((z) => z.st === 1).length, b.length)).join(" · ")}`); }

    // STÖRER: Rolle/Viertel-Zeile, Kultur-Tafel, Wohl-Stufe, Index
    console.log(`\nSTÖRER`);
    console.log(`  Eingeschosser nach Rolle: ${zaehle(E, (z) => z.rolle)} — Rollen-Zeile setzt 1 Geschoss: schmiede FC:2185, backhaus FC:2196; werkstatt ≤ 2 FC:2195`);
    console.log(`  Eingeschosser nach Viertel: ${zaehle(E, (z) => z.viertel || "—")} · nach Lage: ${zaehle(E, (z) => z.lage)}`);
    const kSt = (z) => (FC.KULTUR[z.kultur] || {}).st;
    console.log(`  eingeschossige Wohnhäuser: Kultur-Tafel st = 1 bei ${EW.filter((z) => kSt(z) === 1).length}/${EW.length} · wohl ≤ 0,9 (keine Wohl-Stufe FC:4444) bei ${EW.filter((z) => z.wohl <= 0.9).length}/${EW.length}`);
    console.log(`  Wohnhäuser mit Kultur-st 1: ${WH.filter((z) => kSt(z) === 1).length}, davon eingeschossig ${WH.filter((z) => kSt(z) === 1 && z.st === 1).length} (die übrigen hob die Wohl-Stufe) · Wohnhäuser mit Kultur-st ≥ 2 und eingeschossig: ${WH.filter((z) => kSt(z) >= 2 && z.st === 1).length}`);
    console.log(`  ρ(t, Abstand Markt) alle ${r3(spearman(M.map((z) => z.t), M.map((z) => z.dMarkt)))} · ρ(t, wohl) ${r3(spearman(M.map((z) => z.t), M.map((z) => z.wohl)))}`);
    // Lage über den Index hinaus: ρ(1G, dMarkt) innerhalb der t-Dezile (Wohnhäuser), Median über die Dezile
    { const W = WH.filter((z) => Number.isFinite(z.dMarkt)), D = {};
      for (const z of W) (D[Math.min(9, Math.floor(z.t * 10))] ||= []).push(z);
      const r = Object.values(D).filter((S) => S.length >= 30 && S.some((z) => z.st === 1) && S.some((z) => z.st > 1)).map((S) => spearman(S.map((z) => (z.st === 1 ? 1 : 0)), S.map((z) => z.dMarkt)));
      console.log(`  Wohnhäuser: ρ(1G, Abstand Markt) innerhalb der t-Dezile: Median ${r3(q(r, 0.5))} (Dezile ${r.length}: ${r.map(r3).join(" · ")})`);
      // und nur unter Wohnhäusern mit Kultur-st 1 (der Rest ist dann allein die Wohl-Stufe: wohl = Rang + Würfel)
      const K1 = W.filter((z) => kSt(z) === 1);
      console.log(`  Wohnhäuser mit Kultur-st 1 (${K1.length}): ρ(1G, Abstand Markt) ${r3(spearman(K1.map((z) => (z.st === 1 ? 1 : 0)), K1.map((z) => z.dMarkt)))} · ρ(1G, t) ${r3(spearman(K1.map((z) => (z.st === 1 ? 1 : 0)), K1.map((z) => z.t)))} · ρ(1G, wohl) ${r3(spearman(K1.map((z) => (z.st === 1 ? 1 : 0)), K1.map((z) => z.wohl)))}`); }
    // ═════ ZUSATZ 19.11. vierter Gang (Entscheid 3 des Koordinators): S8-Zeile „Eingeschosser an Hauptstraßen-Fronten“, Soll 0 ═════
    // Was heute als Hauptstraße zählbar ist, in zwei Lesarten: (I) der Plan selbst — die Stamm-Kanten gen 0 (= die breiteste Breite des
    // Plans 5,0 m, DORF_NORM.strasseW FC:3649), ohne und mit den Markt-Fronten; (II) die absolute Breite gegen das Band der Hauptstraße
    // des Quellen-Blatts quellen-strasse-zins.md (7,5–13,7 m) — und je Klasse-Band, welche Fronten heute überhaupt hineinfallen.
    {
        console.log(`\nZUSATZ S8 — EINGESCHOSSER AN HAUPTSTRASSEN-FRONTEN (Soll 0)`);
        const zeig = (n, S) => { const e = S.filter((z) => z.st === 1); console.log(`  ${n}: Fronten ${S.length} · eingeschossig ${e.length} (${pz(e.length, S.length)})${e.length ? " — " + zaehle(e, (z) => z.rolle) + " · Lage " + zaehle(e, (z) => z.lage) : ""}`); };
        zeig("(I a) gen 0 (Stamm, 5,0 m)", M.filter((z) => z.frontGen === 0));
        zeig("(I b) gen 0 ohne Markt-Fronten (Lage haupt)", M.filter((z) => z.lage === "haupt"));
        zeig("(I c) gen 0 oder Markt-Front", M.filter((z) => z.frontGen === 0 || z.lage === "markt"));
        zeig("(I d) breiteste Breite des Plans (frontW = max)", M.filter((z) => z.frontW === Math.max(...M.map((y) => y.frontW))));
        zeig("(II) absolute Breite im Band der Hauptstraße 7,5–13,7 m", M.filter((z) => z.frontW >= 7.5 && z.frontW <= 13.7));
        const BAND = [["Fußgasse 1,75–2,7", 1.75, 2.7], ["Mindest-Gasse 4,3", 4.3, 4.3], ["Karrenstraße 4,7–7,3", 4.7, 7.3], ["Straße von Rang 5,8–11,0", 5.8, 11.0], ["Hauptstraße 7,5–13,7", 7.5, 13.7]];
        console.log(`  Fronten je Band des Quellen-Blatts (Bänder überlappen): ${BAND.map(([n, a, b]) => `${n} m: ${M.filter((z) => z.frontW >= a - 1e-9 && z.frontW <= b + 1e-9).length}`).join(" · ")} · in keinem Band: ${M.filter((z) => !BAND.some(([, a, b]) => z.frontW >= a - 1e-9 && z.frontW <= b + 1e-9)).length}`);
    }
    console.log(`\nLaufzeit ${((Date.now() - t0) / 1000).toFixed(1)} s`);
})().catch((e) => { console.error(e); process.exit(1); });
