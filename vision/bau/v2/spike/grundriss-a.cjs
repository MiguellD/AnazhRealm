// grundriss-proto.cjs — ENTWURF A v2 „Grundriss vor Tragwerk“ (BAU-ZENSUS Runde 2), nur Scratch, kein Spiel-Code.
// Kette: Haushalt → Raumprogramm → GRUNDRISS → Tragwerk, das sich ihm fügt.
//   Grundriss: das Haus ist n BÄNDER (Schiffe) quer zur Spannrichtung s, durchschnitten von EINER Querzone (Flur bzw. Diele) mit der
//   Treppe. n = ⌈Ls / L_max⌉ ist der ZWANG der Teilung; die Bandbreiten folgen aus den Räumen des Erdgeschosses (jeder Raum liegt in
//   einem Band; ein Raum, der quer über alle Bänder geht, ist eine HALLE mit Unterzug auf Ständern in seiner Mitte).
//   Tragwerk: Balken spannen s und liegen NUR auf Band-Grenzen (= Raumwänden) oder auf einem Unterzug in der Flucht dieser Wand
//   (Querzone, Halle); das Deckenloch der Treppe liegt per Konstruktion in EINEM Band (oder kreuzt eine Grenze mit Wechsel und
//   Treppenpfosten NEBEN dem Loch); jede Tür ist eine Zwangs-Achse des Ständer-Rasters.
//   Ein UNABHÄNGIGER Prüfer (`pruefe`) liest danach nur die Geometrie und rechnet η vorwärts nach.
// Lauf: node grundriss-proto.cjs   (druckt die Zahlen; schreibt grundriss-lauf.json daneben)
"use strict";
const fs = require("fs"), path = require("path");
// Runde 1 (koordination vision/bau/spike/gesetz-proto.cjs, Kopie sha256 d59dc3b8…): BAU_GESETZ §1.1, HOLZ, GEWERBE (S3), raumProgramm, Statik
const R1 = require("./gesetz-proto-r1.cjs");
const { BAU_GESETZ, HOLZ, GEWERBE, haushalt, raumProgramm, kreuzholz, vierkant, balkenSpann, geschossH } = R1;

// ── Konstanten mit Quelle ────────────────────────────────────────────────────────────────────────
const NORM = { flur: 1.0, treppe: 0.9, auftritt: 0.26, steigung: 0.19, steigungSpar: 0.21, schritt: 0.62, podest: 0.9, eingang: 1.3 }; // belegt FC:254
const POST = 0.16, TUER_AUSSEN = 1.1, BAY = 1.7; // belegt FC:179 post · FC:181 doorW, bayMax
const TUER_INNEN = 1.0, SCHWUNG = 0.8; // belegt FC:897 dW · FC:905 Türschwung 0,8
const LOCH_VOR = 0.22, LOCH_NACH = 0.3; // belegt FC:389 (Schacht-Loch = Lauf −0,22 … +0,30)
const HERD = { bW: 1.5, bD: 1.05 }; // belegt FC:592 hearthBW/hearthBD
const SCHL = Object.freeze({
    eBalken: 0.85, // S1 (Runde 1, gewählt): Balkenabstand
    klar: POST / 2 + 0.05, // G1 gewählt: lichter Abstand Loch/Tür ↔ Ständer-Achse
    bMin: 2.0, // G2 gewählt: schmalstes Band
    raumMin: 1.8, // G3 gewählt: kleinste Raum-Abmessung (die Runde-1-Klasse „Raum < 1,8“)
    sollMin: 0.75, // G4 gewählt: jeder Raum ≥ 75 % seines Programms, sonst KEIN gültiger Grundriss
    roehre: 2.5, // G5 gewählt: Seitenverhältnis, ab dem ein Raum „Röhre“ heißt (Kosten, kein Verbot)
    hofMin: 4, // G6 gewählt: Hof hinter dem Haus
    dZiel: 11, // S4 (Runde 1, gewählt — Bs dMax): größte Haustiefe
    dMin: 4, // belegt FC:2209 untere Klammer der Tiefe
    stMax: 5, // G7 gewählt
});
// Stoff des Orts (S2): nur Eiche 0,258 ist in Runde 1 benannt; nadel/stange sind GEWÄHLT, um den Zwang am Stoff zu zeigen (unsicher)
const STOFF = { eiche: { holz: "eiche", d: 0.258 }, nadel: { holz: "kiefer", d: 0.3 }, stange: { holz: "kiefer", d: 0.2 } };
const KNICK = { fc0k: 21e6, E005: 7400e6, beta: 0.2 }; // EN 1995-1-1 §6.3.2, Werte entwurf-stoff-statik §1.1 (C24, unsicher)
// Räume (gewählt): Rang = Nähe zum Flur; Straße = Band 0 bei Längsbändern; Kammern sind teilbar (OG füllt sie in die Felder)
const RANG = { herdraum: 0, kueche: 0, stube: 1, laden: 1, gaststube: 1, backstube: 1, werkstatt: 1, webstube: 1, sudhaus: 1, werkraum: 1, kontor: 2, stall: 3, lager: 4, kammer: 5, gastkammern: 5, studierstube: 5, mehlkammer: 6 };
const STRASSE = new Set(["stube", "laden", "gaststube", "werkstatt", "kontor", "webstube", "backstube"]);

const muss = (v, name) => { if (v === undefined || v === null || (typeof v === "number" && !Number.isFinite(v))) throw new Error("grundriss: es fehlt " + name); return v; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const r2 = (v) => Math.round(v * 100) / 100;
const sum = (a) => a.reduce((s, r) => s + r.soll, 0);
const rangVon = (r) => (RANG[r.id] != null ? RANG[r.id] : 4);
const ordne = (a) => a.slice().sort((p, q) => rangVon(p) - rangVon(q) || q.soll - p.soll);

// ── Tragwerk des Orts ────────────────────────────────────────────────────────────────────────────
function ortTragwerk(stoff) {
    muss(stoff, "stoff"); const holz = muss(stoff.holz, "stoff.holz"), d = muss(stoff.d, "stoff.d");
    if (!HOLZ[holz]) throw new Error("grundriss: Holz ohne Zeile " + holz);
    const kh = kreuzholz(d), G = BAU_GESETZ;
    const Lmax = balkenSpann(kh.b, kh.h, holz, SCHL.eBalken, G.gDecke, G.qWohnen).L;
    const Luz = (e) => balkenSpann(kh.b, kh.h, holz, e, G.gDecke, G.qWohnen).L; // Unterzug aus demselben Stamm (gewählt), Last gleichmäßig
    return { holz, d, b: kh.b, h: kh.h, a: vierkant(d), Lmax, Luz };
}
// unabhängiger Nachweis VORWÄRTS (Durchbiegung inst/fin + Biegung) → η
function eta(b, h, holz, e, L) {
    const H = HOLZ[holz], G = BAU_GESETZ, I = (b * h ** 3) / 12, W = (b * h * h) / 6, EI = H.E * I, g = G.gDecke, q = G.qWohnen;
    const wI = (g + q) * 1e3 * e, wF = (g * (1 + G.kdef) + q * (1 + G.psi2 * G.kdef)) * 1e3 * e, wD = (G.gammaG * g + G.gammaQ * q) * 1e3 * e;
    const uI = (5 * wI * L ** 4) / (384 * EI), uF = (5 * wF * L ** 4) / (384 * EI), sig = (wD * L * L) / 8 / W, fmd = (G.kmod * H.fmk) / G.gammaM;
    return Math.max(uI / (L / G.wInst), uF / (L / G.wFin), sig / fmd);
}
function knickEta(a, Lk, N) {
    const G = BAU_GESETZ, i = a / Math.sqrt(12), lr = (Lk / i / Math.PI) * Math.sqrt(KNICK.fc0k / KNICK.E005);
    const k = 0.5 * (1 + KNICK.beta * (lr - 0.3) + lr * lr), kc = Math.min(1, 1 / (k + Math.sqrt(k * k - lr * lr)));
    return N / (a * a) / ((kc * G.kmod * KNICK.fc0k) / G.gammaM);
}
// ── Treppe (FC:361–368 Norm-Gesetz; Loch FC:389) ─────────────────────────────────────────────────
function treppeVon(gH, st, spar) {
    const N = Math.max(3, Math.ceil(gH / (spar ? NORM.steigungSpar : NORM.steigung))), rise = gH / N;
    const go = spar ? clamp(NORM.schritt - 2 * rise, 0.22, 0.3) : clamp(NORM.schritt - 2 * rise, NORM.auftritt, 0.32), run = N * go;
    const spuren = st >= 3 ? 2 : 1; // FC:259 SPUR-GESETZ
    return { N, rise, go, run, loch: run + LOCH_VOR + LOCH_NACH, breite: NORM.treppe * spuren, spuren, spar };
}
// ── Programm (Runde-1-Gesetz) ────────────────────────────────────────────────────────────────────
function programm(H, baujahr) {
    const eg = [], og = [], aussen = []; let kammer = null;
    for (const r of raumProgramm(H, baujahr)) {
        const [id, m2, g, nK] = r;
        if (id === "kammern") { kammer = { n: nK, m2 }; continue; }
        if (g === "eg") eg.push({ id, soll: m2 }); else if (g === "og") og.push({ id, soll: m2 }); else aussen.push({ id, soll: m2, g });
    }
    // SPIKE v2 (Richter-Hand, Variante „Druck hebt Räume“, gewählt): H.hoch = Liste der Raum-ids, die aus dem EG ins OG gehen
    if (H.hoch) for (const id of H.hoch) { const i = eg.findIndex((r) => r.id === id); if (i < 0) throw new Error("grundriss: hoch ohne EG-Raum " + id); og.push(eg.splice(i, 1)[0]); }
    return { eg, og, kammer, aussen };
}
// Geschosse: EG = EG-Räume (st = 1: dazu alles); OG-Räume und Kammern gleichmäßig über st−1 Obergeschosse
function geschosse(P, st) {
    const diele = P.eg.find((r) => r.id === "diele") || null;
    const eg = P.eg.filter((r) => r !== diele).map((r) => ({ ...r })), F = [eg];
    const kam = (n, m2) => Array.from({ length: n }, () => ({ id: "kammer", soll: m2 / P.kammer.n }));
    if (st === 1) { for (const r of P.og) eg.push({ ...r }); eg.push(...kam(P.kammer.n, P.kammer.m2)); return { F, diele, kammerOG: [] }; }
    const kammerOG = [];
    for (let k = 1; k < st; k++) { F.push([]); const nk = Math.floor(P.kammer.n / (st - 1)) + (k - 1 < P.kammer.n % (st - 1) ? 1 : 0); kammerOG.push(nk); }
    for (const r of P.og.slice().sort((a, b) => b.soll - a.soll)) { let m = 1; for (let k = 2; k < st; k++) if (sum(F[k]) < sum(F[m])) m = k; F[m].push({ ...r }); }
    return { F, diele, kammerOG, kammerSoll: P.kammer.m2 / P.kammer.n };
}

// ═══ GRUNDRISS ═══ lokales Gitter (u längs der Bänder, s = Spannrichtung der Balken):
//  s='z': Bänder längs der Straße (u = x, s = z, s=0 Straße) — Querflur von der Straße zum Hof (das Ernhaus).
//  s='x': Bänder in die Tiefe (u = z, u=0 Straße, s = x) — Diele über die ganze Breite vorn (das Giebel-/Dielenhaus).
function grundrissVon(H, baujahr, los, stoff) {
    muss(H, "haushalt"); muss(los, "los"); muss(los.B, "los.B"); muss(los.T, "los.T"); muss(baujahr, "baujahr");
    const T = ortTragwerk(stoff), P = programm(H, baujahr), gH = geschossH(baujahr, T.h), gruende = [];
    for (let st = 1; st <= SCHL.stMax; st++) {
        const GS = geschosse(P, st);
        for (const spar of [false, true]) for (const modus of ["band", "wechsel", "quer"]) {
            const r = versuche(GS, st, spar, modus, los, T, gH);
            if (r.ok) return Object.assign(r, { T, P, gH, haushalt: H, baujahr, versuche: gruende.length + 1 });
            gruende.push({ st, spar, modus, grund: r.grund, stufe: r.stufe || (/^Tiefe/.test(r.grund) ? 0 : 6) });
        }
    }
    // der aussagekräftigste Grund: der erste, der NICHT „Tiefe“ ist, sonst der erste
    let g = gruende[0]; for (const x of gruende) if (x.stufe > g.stufe) g = x;
    return { ok: false, grund: g.grund, gruende, T, gH, P };
}

function versuche(GS, st, spar, modus, los, T, gH) {
    const tr = treppeVon(gH, st, spar), c = SCHL.klar, B = los.B, gang = Math.max(NORM.flur, TUER_AUSSEN);
    const EG = ordne(GS.F[0]), Ad = GS.diele ? GS.diele.soll : 0, Atot = sum(EG);
    let wf = gang + tr.breite + 3 * c;
    if (modus === "quer") wf = Math.max(wf, 2 * NORM.podest + tr.loch + 2 * c);
    const Dgrenze = Math.min(SCHL.dZiel, los.T - SCHL.hofMin);
    // Ausrichtung: breiter als tief → Längsbänder (s='z'); sonst Tiefenbänder (s='x')
    let s, X, Dz = Infinity, wfz = wf;
    for (let i = 0; i < 3; i++) { if (B - wfz <= 0) break; Dz = Atot / (B - wfz); wfz = Ad ? Math.max(wf, Ad / Math.max(SCHL.dMin, Dz)) : wf; }
    if (B - wfz > 0 && Math.max(SCHL.dMin, Dz) <= B) { s = "z"; wf = wfz; X = B - wf; }
    else { s = "x"; if (Ad) wf = Math.max(wf, Ad / B); }
    const D0 = s === "z" ? Math.max(SCHL.dMin, Atot / X) : Math.max(SCHL.dMin, wf + Atot / B);
    if (D0 > Dgrenze + 1e-9) return { ok: false, grund: "Tiefe " + r2(D0) + " > " + r2(Dgrenze) + " (EG-Programm " + Math.round(Atot) + " m² auf Breite " + B + ")" };
    const Ls0 = s === "z" ? D0 : B, nMin = Math.max(1, Math.ceil(Ls0 / T.Lmax - 1e-9));
    const seiten = s === "x" ? ["R"] : ["L", "R"];
    // n = ⌈Ls/L_max⌉ ist das Mindeste; ein Band mehr ist eine erlaubte Antwort der Räume (gewählt G8), die Kosten entscheiden
    let bestN = null;
    for (const n of [nMin, nMin + 1]) {
        if (modus === "wechsel" && n < 2) continue;
        const r = versucheN(n, EG, GS, st, tr, { s, B, wf, Ad, T, modus, seiten, Dgrenze, gH });
        if (r.ok && (!bestN || !bestN.ok || r.kosten < bestN.kosten)) bestN = r; else if (!bestN) bestN = r;
    }
    return bestN || { ok: false, grund: "Wechsel braucht zwei Bänder" };
}
function versucheN(n, EG, GS, st, tr, C) {
    const { s, B, wf, Ad, T, modus, seiten, Dgrenze, gH } = C;
    // ── Aufzählung: jeder EG-Raum in ein Feld (Band j, Seite S) oder als Halle über alle Bänder einer Seite ──
    const opts = []; for (const S of seiten) for (let j = 0; j < n; j++) opts.push({ j, S, halle: false });
    if (n >= 2) for (const S of seiten) opts.push({ j: -1, S, halle: true });
    let best = null; const kap = +(process.env.KAP || 1296); // gewählt: erschöpfend bis 6^4 Belegungen, der Rest gierig
    let kEx = 0; { let z = 1; while (kEx < EG.length && z * opts.length <= kap) { z *= opts.length; kEx++; } }
    const asg = new Array(EG.length);
    const bewerteMit = () => bewerte(EG, asg, { s, n, B, wf, Ad, T, tr, modus, seiten, Dgrenze });
    const rek = (i) => {
        if (i === kEx) {
            // Rest (die kleinsten Räume, meist Kammern bei st = 1) gierig: in das Feld mit der kleinsten belegten Fläche
            for (let r = kEx; r < EG.length; r++) { const fl = new Array(opts.length).fill(0); for (let q = 0; q < r; q++) fl[asg[q]] += EG[q].soll; let bo = -1; for (let o = 0; o < opts.length; o++) if (!opts[o].halle && (bo < 0 || fl[o] < fl[bo])) bo = o; asg[r] = bo; }
            const v = bewerteMit(); if (!best || v.kosten < best.kosten || (!Number.isFinite(v.kosten) && !Number.isFinite(best.kosten) && (v.stufe || 0) > (best.v.stufe || 0))) best = { kosten: v.kosten, v, asg: asg.slice() };
            return;
        }
        for (let o = 0; o < opts.length; o++) {
            if (opts[o].halle && asg.slice(0, i).some((a) => opts[a].halle && opts[a].S === opts[o].S)) continue; // eine Halle je Seite
            asg[i] = o; rek(i + 1);
        }
    };
    rek(0);
    if (!best || !Number.isFinite(best.kosten)) return { ok: false, grund: best ? best.v.grund : "keine Belegung", stufe: best ? best.v.stufe : 0 };
    let r = null;
    for (const seiteT of ["a", "b"]) { const q = baue(EG, best.asg, opts, best.v, GS, st, tr, { s, n, B, wf, T, modus, seiten, gH, seiteT }); if (q.ok || !r || !/zweite Seite/.test(q.grund)) r = q; if (r.ok) break; }
    if (r.ok) r.kosten = best.kosten;
    return r;
}

// Geometrie einer Belegung + Kosten. Für s='z': D = A/X, Hallen-Länge = A_h/D, Felder ℓ_S = Seitenlänge − Halle, b_j = A_j / Σℓ, p über ein Raster.
function bewerte(EG, asg, C) {
    const { s, n, B, wf, T, tr, modus, seiten, Dgrenze } = C, c = SCHL.klar;
    const opts = []; for (const S of seiten) for (let j = 0; j < n; j++) opts.push({ j, S, halle: false });
    if (n >= 2) for (const S of seiten) opts.push({ j: -1, S, halle: true });
    const A = {}, AH = { L: 0, R: 0 }, Aj = new Array(n).fill(0); let Atot = 0;
    for (let i = 0; i < EG.length; i++) { const o = opts[asg[i]], a = EG[i].soll; Atot += a; if (o.halle) AH[o.S] += a; else { const k = o.j + o.S; A[k] = (A[k] || 0) + a; Aj[o.j] += a; } }
    const hatS = (S) => AH[S] > 0 || Object.keys(A).some((k) => k.endsWith(S) && A[k] > 0);
    const versuchP = (D, p, Lu) => {
        const lenH = { L: AH.L / D, R: AH.R / D };
        const len = s === "x" ? { R: Lu - wf } : { L: p, R: Lu - wf - p };
        const ell = {}; for (const S of seiten) ell[S] = len[S] - lenH[S];
        for (const S of seiten) if (ell[S] < -1e-9) return null;
        const sumEll = seiten.reduce((a, S) => a + (Object.keys(A).some((k) => k.endsWith(S)) ? ell[S] : 0), 0);
        let b = Aj.map((a) => (sumEll > 1e-9 ? a / sumEll : D / n));
        if (Aj.every((a) => a === 0)) b = new Array(n).fill((s === "z" ? D : B) / n);
        return { lenH, len, ell, b };
    };
    let bestP = null;
    const stufe = (k, grund) => { if (!bestP || (!Number.isFinite(bestP.kosten) && k > (bestP.stufe || 0))) bestP = { kosten: Infinity, grund, stufe: k }; };
    const Lu0 = s === "z" ? B : null;
    const D = s === "z" ? Math.max(SCHL.dMin, Atot / (B - wf)) : Math.max(SCHL.dMin, wf + Atot / B);
    const pKand = [];
    if (s === "x") pKand.push(0);
    else { const X = B - wf; if (!hatS("L")) pKand.push(0); else if (!hatS("R")) pKand.push(X); else for (let i = 1; i < 24; i++) pKand.push((X * i) / 24); }
    for (const p of pKand) {
        const g = versuchP(s === "z" ? D : B, p, s === "z" ? B : D);
        if (!g) continue;
        // Bänder in [bMin, L_max] ziehen (der ZWANG); s='z': die Tiefe folgt, s='x': die freien Bänder teilen sich den Rest der Breite.
        // Die Abweichung landet als ist/soll in den Räumen und entscheidet dort (G4), nichts wird still verschluckt.
        let b = g.b.map((v) => clamp(v, SCHL.bMin, T.Lmax));
        if (s === "x") {
            for (let it = 0; it < 6; it++) {
                const fest = b.map((v) => v <= SCHL.bMin + 1e-9 || v >= T.Lmax - 1e-9), frei = b.reduce((a, v, j) => a + (fest[j] ? 0 : v), 0), rest = B - b.reduce((a, v, j) => a + (fest[j] ? v : 0), 0);
                if (frei <= 1e-9) break; b = b.map((v, j) => (fest[j] ? v : clamp((v * rest) / frei, SCHL.bMin, T.Lmax)));
            }
            if (Math.abs(b.reduce((a, v) => a + v, 0) - B) > 1e-3) { stufe(1, "Bänder passen nicht in die Breite " + B + " (n " + n + ", L_max " + r2(T.Lmax) + ")"); continue; }
        }
        const geo = { D, Lu: s === "z" ? B : D, Ls: s === "z" ? D : B, p, ...g };
        // Treppe gegen die Bänder (Modus)
        const st = treppeLage(geo, b, n, tr, modus, s, T, c);
        if (!st.ok) { stufe(2, st.grund); continue; }
        b = st.b; geo.b = b; geo.treppe = st.treppe;
        if (s === "z") { geo.D = b.reduce((a, v) => a + v, 0); geo.Ls = geo.D; }
        if (geo.D > Dgrenze + 1e-9) { stufe(3, "Tiefe " + r2(geo.D) + " > " + r2(Dgrenze) + " (Treppe)"); continue; }
        // Bänder: Zwang
        let grund = null;
        for (const v of b) { if (v > T.Lmax + 1e-9) grund = "Band " + r2(v) + " > L_max " + r2(T.Lmax); else if (v < SCHL.bMin - 1e-9) grund = "Band " + r2(v) + " < " + SCHL.bMin; }
        if (grund) { stufe(4, grund); continue; }
        // Programm-Treue, Mindestmaß, Röhren, Straße, Leere
        let maxLn = 0, roehre = 0, durch = 0, strasse = 0, leer = 0; grund = null;
        const lenHD = { L: AH.L / geo.Ls, R: AH.R / geo.Ls }; // Hallenlänge im endgültigen Ls
        const ellD = {}; for (const S of seiten) ellD[S] = geo.len[S] - lenHD[S];
        const proFeld = {};
        for (let i = 0; i < EG.length; i++) {
            const o = opts[asg[i]], r = EG[i];
            if (o.halle) { const l = lenHD[o.S]; if (l < SCHL.raumMin) grund = "Halle " + r.id + " kürzer als " + SCHL.raumMin; continue; }
            const k = o.j + o.S; (proFeld[k] = proFeld[k] || []).push(r);
        }
        for (const S of seiten) for (let j = 0; j < n; j++) {
            const k = j + S, liste = proFeld[k] || [], flaeche = b[j] * ellD[S];
            if (!liste.length) { if (flaeche > 1e-6) { leer += flaeche; if (ellD[S] < SCHL.raumMin && ellD[S] > 1e-6) grund = grund || "Restfeld schmaler als " + SCHL.raumMin; } continue; }
            const q = flaeche / sum(liste); durch += liste.length - 1;
            for (const r of liste) {
                const lu = (ellD[S] * r.soll) / sum(liste); maxLn = Math.max(maxLn, Math.abs(Math.log(q)));
                if (q < SCHL.sollMin) grund = grund || "Raum " + r.id + " nur " + Math.round(q * 100) + " % des Programms";
                if (Math.min(lu, b[j]) < SCHL.raumMin - 1e-9) grund = grund || "Raum " + r.id + " schmaler als " + SCHL.raumMin;
                if (Math.max(lu, b[j]) / Math.min(lu, b[j]) > SCHL.roehre) roehre++;
                if (s === "z" && STRASSE.has(r.id) && j !== 0) strasse++;
            }
        }
        if (grund) { stufe(5, grund); continue; }
        const hallen = (AH.L > 0) + (AH.R > 0);
        for (const S of seiten) if (AH[S] > 0 && Math.max(lenHD[S], geo.Ls) / Math.min(lenHD[S], geo.Ls) > SCHL.roehre) roehre++;
        const kosten = maxLn + 0.3 * roehre + 0.03 * durch + 0.1 * strasse + 0.1 * hallen + (2 * leer) / Math.max(1, Atot); // Gewichte gewählt (G10)
        if (!bestP || kosten < bestP.kosten) bestP = { kosten, geo, lenHD, ellD };
    }
    return bestP || { kosten: Infinity, grund: "keine Lage der Querzone" };
}

// Treppen-Lage je Modus. band: Loch ganz in einem Band (Endband: Antritt/Austritt 0,9 im Band); wechsel: Loch längs s über eine Grenze,
// Unterzug dort unterbrochen, Treppenpfosten neben dem Loch; quer: Loch längs u in der (tieferen) Querzone, s-Lage in einem Band.
function treppeLage(geo, b0, n, tr, modus, s, T, c) {
    let b = b0.slice();
    const sbOf = (bb) => { const a = [0]; for (const v of bb) a.push(a[a.length - 1] + v); return a; };
    const qa = s === "x" ? 0 : geo.p, Ls = () => b.reduce((a, v) => a + v, 0);
    const uLaengs = s === "x" ? null : [qa + c, qa + c + tr.breite]; // s='z': Loch an der linken Flurwand, Gang rechts davon
    if (modus === "band") {
        const need = (j) => tr.loch + 2 * c + (j === 0 || j === n - 1 ? NORM.podest : 0);
        let jT = -1; const ord = [...b.keys()].sort((x, y) => (need(x) - b[x]) - (need(y) - b[y]) || y - x);
        for (const j of ord) if (b[j] + 1e-9 >= need(j)) { jT = j; break; }
        if (jT < 0) {
            const j = ord[0], nd = need(j);
            if (nd > T.Lmax + 1e-9) return { ok: false, grund: "Treppenloch " + r2(nd) + " > L_max " + r2(T.Lmax) };
            if (s === "z") b[j] = nd; // die Tiefe wächst
            else { const rest = geo.Ls - nd, Ao = b.reduce((a, v, k) => (k === j ? a : a + v), 0); if (n < 2 || rest <= 0) return { ok: false, grund: "Treppe passt nicht in die Breite" }; b = b.map((v, k) => (k === j ? nd : (v * rest) / Ao)); }
            jT = j;
        }
        const sb = sbOf(b), s0 = sb[jT] + c + (jT === 0 ? NORM.podest : 0), s1 = s0 + tr.loch;
        const u = s === "x" ? [geo.Lu - geo.ell.R - geo.lenH.R - c - tr.breite, geo.Lu - geo.ell.R - geo.lenH.R - c] : uLaengs; // s='x': hinten in der Diele (u bis wf)
        return { ok: true, b, treppe: { modus, band: jT, u0: u[0], u1: u[1], s0, s1, laengs: true } };
    }
    if (modus === "wechsel") {
        const L = Ls(); if (L < tr.loch + 2 * NORM.podest) return { ok: false, grund: "Wechsel: Tiefe " + r2(L) + " < Loch + 2 Podeste" };
        const sb = sbOf(b), mitte = sb[Math.round(n / 2)], s0 = clamp(mitte - tr.loch / 2, NORM.podest, L - NORM.podest - tr.loch);
        // keine Grenze darf näher als c an einer Loch-Kante liegen (sonst stünde der Pfosten im Loch)
        for (const x of sb.slice(1, -1)) if (Math.abs(x - s0) < c || Math.abs(x - (s0 + tr.loch)) < c) return { ok: false, grund: "Wechsel: Grenze an der Lochkante" };
        const u = s === "x" ? [geo.Lu - geo.ell.R - geo.lenH.R - c - tr.breite, geo.Lu - geo.ell.R - geo.lenH.R - c] : uLaengs;
        return { ok: true, b, treppe: { modus, band: -1, u0: u[0], u1: u[1], s0, s1: s0 + tr.loch, laengs: true } };
    }
    // quer: Loch längs u, in einem Band; bei n = 1 braucht das Band zusätzlich den Gang
    const need = tr.breite + 2 * c + (n === 1 ? Math.max(NORM.flur, TUER_AUSSEN) : 0);
    let jT = -1; for (let j = n - 1; j >= 0; j--) if (b[j] + 1e-9 >= need) { jT = j; break; }
    if (jT < 0) return { ok: false, grund: "Treppe quer: Band " + r2(Math.max(...b)) + " < " + r2(need) };
    const sb = sbOf(b), s1 = sb[jT + 1] - c, wf = s === "x" ? geo.Lu - geo.ell.R - geo.lenH.R : null;
    const u0 = (s === "x" ? 0 : qa) + c + NORM.podest;
    void wf;
    return { ok: true, b, treppe: { modus, band: jT, u0, u1: u0 + tr.loch, s0: s1 - tr.breite, s1, laengs: false } };
}

// ── Bau der gewählten Belegung: Räume aller Geschosse, Türen, Wände, Unterzüge, Ständer, Herd ──
function baue(EG, asgIdx, opts, v, GS, st, tr, C) {
    const { s, n, B, wf, T, seiten } = C, c = SCHL.klar, geo = v.geo, b = geo.b, Ls = geo.Ls, Lu = geo.Lu, p = geo.p;
    const sb = [0]; for (const x of b) sb.push(sb[sb.length - 1] + x);
    const qa = s === "x" ? 0 : p, qb = qa + wf;
    const seite = (S) => (S === "L" ? { id: "L", nahe: qa, dir: -1, ende: 0 } : { id: "R", nahe: qb, dir: 1, ende: Lu });
    // die Treppe lehnt an EINER Wand der Querzone (a: s='z' linke Flurwand / s='x' Dielen-Rückwand; b: die andere) — Türen in dieser
    // Wand dürfen nicht hinter dem Lauf liegen
    const t = Object.assign({}, geo.treppe);
    let tWand = null;
    if (t.laengs) {
        if (s === "z") { if (C.seiteT === "b") { t.u1 = qb - c; t.u0 = t.u1 - tr.breite; tWand = qb; } else tWand = qa; }
        else { if (C.seiteT === "b") { t.u0 = c; t.u1 = c + tr.breite; tWand = 0; } else tWand = qb; }
    } else if (C.seiteT === "b") return { ok: false, grund: "quer: keine zweite Seite" };
    const tuerS = (lo, hi, wand, w, ziel) => {
        // freie Lage der Türmitte in [lo, hi] auf der Wand u = wand: nicht hinter dem Lauf, nicht an einer Band-Grenze
        const sperr = []; if (tWand !== null && Math.abs(wand - tWand) < 1e-6) sperr.push([t.s0 - c - w / 2, t.s1 + c + w / 2]);
        for (const x of sb.slice(1, -1)) sperr.push([x - POST / 2 - w / 2 - 0.01, x + POST / 2 + w / 2 + 0.01]);
        let bestC = null; for (let i = 0; i <= 80; i++) { const cc = lo + ((hi - lo) * i) / 80; if (sperr.some(([a, e]) => cc > a && cc < e)) continue; if (bestC === null || Math.abs(cc - ziel) < Math.abs(bestC - ziel)) bestC = cc; }
        return hi >= lo ? bestC : null;
    };
    const geschosse = [];
    for (let k = 0; k < GS.F.length; k++) {
        const raeume = [];
        if (k === 0) {
            const proFeld = {}, hallen = {};
            for (let i = 0; i < EG.length; i++) { const o = opts[asgIdx[i]]; if (o.halle) hallen[o.S] = EG[i]; else (proFeld[o.j + o.S] = proFeld[o.j + o.S] || []).push(EG[i]); }
            for (const S of seiten) {
                const Sd = seite(S), lh = v.lenHD[S];
                if (hallen[S]) { const a = Sd.nahe, e = Sd.nahe + Sd.dir * lh; raeume.push({ id: hallen[S].id, soll: hallen[S].soll, u0: Math.min(a, e), u1: Math.max(a, e), s0: 0, s1: Ls, halle: true, band: -1, seite: S, amFlur: true }); }
                for (let j = 0; j < n; j++) legeFeld(raeume, ordne(proFeld[j + S] || []), Sd, lh, v.ellD[S], j, sb, !!hallen[S], "vorrat");
            }
        } else {
            // OG: die Räume gehen erst auf die Seiten (nach freier Fläche), dann je Seite: so viele Räume wie Bänder oder mehr → in die
            // Band-Felder (größter zuerst in das freieste Feld, Kammern nach größtem Rest); weniger Räume als Bänder → die Räume liegen
            // quer über alle Bänder hintereinander (OG-Halle; ihr Unterzug steht auf der Band-Wand bzw. dem Unterzug darunter, G9)
            const seitL = seiten.map((S) => ({ S, len: S === "L" ? qa : Lu - qb, liste: [] })).filter((x) => x.len > 1e-6);
            const alleOG = GS.F[k].map((r) => ({ ...r })).concat(Array.from({ length: GS.kammerOG[k - 1] }, () => ({ id: "kammer", soll: GS.kammerSoll })));
            for (const r of alleOG.sort((x, y) => y.soll - x.soll)) { let f = seitL[0]; for (const g of seitL) if (g.len * Ls - sum(g.liste) > f.len * Ls - sum(f.liste)) f = g; f.liste.push(r); }
            for (const SL of seitL) {
                const Sd = seite(SL.S);
                if (SL.liste.length && SL.liste.length < n) { let u = Sd.nahe; const tot = sum(SL.liste); for (const r of ordne(SL.liste)) { const len = (SL.len * r.soll) / tot, e = u + Sd.dir * len; raeume.push({ id: r.id, soll: r.soll, u0: Math.min(u, e), u1: Math.max(u, e), s0: 0, s1: Ls, halle: true, ogHalle: true, band: -1, seite: SL.S, amFlur: u === Sd.nahe }); u = e; } continue; }
                const felder = []; for (let j = 0; j < n; j++) felder.push({ j, cap: b[j] * SL.len, liste: [] });
                for (const r of SL.liste.filter((x) => x.id !== "kammer")) { let f = felder[0]; for (const g of felder) if (g.cap - sum(g.liste) > f.cap - sum(f.liste)) f = g; f.liste.push(r); }
                for (const r of SL.liste.filter((x) => x.id === "kammer")) { let f = felder[0], fv = -Infinity; for (const g of felder) { const v2 = (g.cap - sum(g.liste)) / (g.liste.filter((x) => x.id === "kammer").length + 1); if (v2 > fv) { fv = v2; f = g; } } f.liste.push(r); }
                for (const f of felder) legeFeld(raeume, ordne(f.liste), Sd, 0, SL.len, f.j, sb, false, "boden");
            }
        }
        for (const r of raeume) if (!r.leer) r.q = ((r.u1 - r.u0) * (r.s1 - r.s0)) / r.soll;
        const zuKlein = raeume.find((r) => !r.leer && (r.q < SCHL.sollMin - 1e-9 || Math.min(r.u1 - r.u0, r.s1 - r.s0) < SCHL.raumMin - 1e-9));
        if (zuKlein) return { ok: false, grund: "G" + k + ": Raum " + zuKlein.id + " " + Math.round(zuKlein.q * 100) + " % / " + r2(Math.min(zuKlein.u1 - zuKlein.u0, zuKlein.s1 - zuKlein.s0)) + " m" };
        const leerSchmal = raeume.find((r) => r.leer && Math.min(r.u1 - r.u0, r.s1 - r.s0) < SCHL.raumMin - 1e-9);
        if (leerSchmal) return { ok: false, grund: "G" + k + ": Restfeld schmaler als " + SCHL.raumMin };
        // Türen: am Flur (Flurwand, Bandmitte; Halle: Mitte des breitesten Bands); sonst in der Querwand zum Vorgänger (Durchgang)
        const tueren = [], jBreit = b.indexOf(Math.max(...b));
        for (const r of raeume) {
            const j = r.halle ? jBreit : r.band, uw = r.seite === "L" ? r.u1 : r.u0;
            const cs = tuerS(r.s0 + c + TUER_INNEN / 2, r.s1 - c - TUER_INNEN / 2, uw, TUER_INNEN, (sb[j] + sb[j + 1]) / 2);
            if (cs === null) return { ok: false, grund: "G" + k + ": Tür von " + r.id + " liegt hinter der Treppe" };
            tueren.push({ dir: "s", at: uw, c: cs, w: TUER_INNEN, art: r.amFlur ? "flur" : r.nachHalle ? "halle" : "durchgang", raum: r.id });
            if (!r.amFlur) r.gefangen = true;
        }
        if (k === 0) {
            if (s === "z") {
                const g0 = t.laengs ? (tWand === qa ? t.u1 + c : qa + c) : qa + c, g1 = t.laengs ? (tWand === qa ? qb - c : t.u0 - c) : qb - c, cu = (g0 + g1) / 2;
                if (g1 - g0 < TUER_AUSSEN - 1e-6) return { ok: false, grund: "Gang neben der Treppe schmaler als die Haustür" };
                const frei = (sAt) => !(cu + TUER_AUSSEN / 2 > t.u0 && cu - TUER_AUSSEN / 2 < t.u1 && sAt + SCHWUNG > t.s0 && sAt - SCHWUNG < t.s1);
                if (!frei(0)) return { ok: false, grund: "Haustür geht auf den Lauf" };
                tueren.push({ dir: "u", at: 0, c: cu, w: TUER_AUSSEN, art: "haus", raum: "flur" });
                if (frei(Ls)) tueren.push({ dir: "u", at: Ls, c: cu, w: TUER_AUSSEN, art: "hof", raum: "flur" }); else geschosse.ohneHoftuer = true;
            } else {
                // Stirn u = 0 (die Diele): Ziel Mitte des breitesten Bands; die Treppe vorn sperrt ihre s-Spanne
                let jd = 0; for (let j = 0; j < n; j++) if (b[j] > b[jd]) jd = j;
                const sperrVorn = (tWand === 0) || (!t.laengs && t.u0 < c + NORM.podest + 1e-6);
                const sperr = []; if (sperrVorn) sperr.push([t.s0 - c - TUER_AUSSEN / 2, t.s1 + c + TUER_AUSSEN / 2]);
                for (const x of sb.slice(1, -1)) sperr.push([x - POST / 2 - TUER_AUSSEN / 2 - 0.01, x + POST / 2 + TUER_AUSSEN / 2 + 0.01]);
                let cs = null; const lo = c + TUER_AUSSEN / 2, hi = Ls - c - TUER_AUSSEN / 2, ziel = (sb[jd] + sb[jd + 1]) / 2;
                for (let i = 0; i <= 80; i++) { const cc = lo + ((hi - lo) * i) / 80; if (sperr.some(([a, e]) => cc > a && cc < e)) continue; if (cs === null || Math.abs(cc - ziel) < Math.abs(cs - ziel)) cs = cc; }
                if (cs === null) return { ok: false, grund: "Haustür ohne Platz in der Stirn" };
                tueren.push({ dir: "s", at: 0, c: cs, w: TUER_AUSSEN, art: "haus", raum: "diele" });
            }
        }
        // Wände
        const waende = [];
        waende.push({ dir: "u", at: 0, a0: 0, a1: Lu, art: "aussen", tragend: true }, { dir: "u", at: Ls, a0: 0, a1: Lu, art: "aussen", tragend: true });
        waende.push({ dir: "s", at: 0, a0: 0, a1: Ls, art: "aussen", tragend: true }, { dir: "s", at: Lu, a0: 0, a1: Ls, art: "aussen", tragend: true });
        const qw = [qa, qb].filter((x) => x > 1e-6 && x < Lu - 1e-6);
        for (const u of qw) waende.push({ dir: "s", at: u, a0: 0, a1: Ls, art: "flur", tragend: false });
        const schon = new Set(qw.map((x) => x.toFixed(4)));
        for (const r of raeume) for (const u of [r.u0, r.u1]) if (u > 1e-6 && u < Lu - 1e-6 && !schon.has(u.toFixed(4))) waende.push({ dir: "s", at: u, a0: r.s0, a1: r.s1, art: "quer", tragend: false });
        // Band-Grenzen: Unterzug in Querzone (unterbrochen am Treppenloch, falls es die Grenze kreuzt) und in Hallen; sonst Wand
        const unterzuege = [];
        for (let j = 1; j < n; j++) {
            const sj = sb[j], stuecke = [];
            const kreuzt = t.s0 < sj && t.s1 > sj && t.u1 > qa && t.u0 < qb;
            if (kreuzt) { if (t.u0 - qa > POST + 0.02) stuecke.push([qa, t.u0 - POST / 2 - 0.01, "flur", "pfosten-r"]); if (qb - t.u1 > POST + 0.02) stuecke.push([t.u1 + POST / 2 + 0.01, qb, "flur", "pfosten-l"]); }
            else stuecke.push([qa, qb, "flur", ""]);
            for (const r of raeume) if (r.halle) stuecke.push([r.u0, r.u1, "halle:" + r.id, ""]);
            for (const [a, e, wo, pf] of stuecke) unterzuege.push({ s: sj, u0: a, u1: e, wo, pf, eE: (b[j - 1] + b[j]) / 2 });
            const luecken = stuecke.map((x) => [x[0], x[1]]); if (kreuzt) luecken.push([t.u0 - POST / 2, t.u1 + POST / 2]);
            luecken.sort((x, y) => x[0] - y[0]); let u = 0;
            for (const [a, e] of luecken) { if (a - u > POST) waende.push({ dir: "u", at: sj, a0: u, a1: a, art: "band", tragend: true }); u = Math.max(u, e); }
            if (Lu - u > POST) waende.push({ dir: "u", at: sj, a0: u, a1: Lu, art: "band", tragend: true });
        }
        geschosse.push({ k, raeume, tueren, waende, unterzuege });
    }
    for (let g = 0; g < geschosse.length; g++) { const G = geschosse[g]; G.staender = staenderVon(G, T, g > 0 ? geschosse[g - 1] : null); if (G.fehler) return { ok: false, grund: G.fehler }; }
    // Herd: im Herdraum/der Küche an einer Wand, außerhalb jedes Türschwungs, jedes Ständers und des Lochs (Suche, kein Würfel)
    const kueche = geschosse[0].raeume.find((r) => r.id === "kueche" || r.id === "herdraum");
    const herd = kueche ? herdLage(kueche, geschosse[0], t) : null;
    const felder = b.map((x, j) => ({ band: j, spann: x, e: SCHL.eBalken, eta: eta(T.b, T.h, T.holz, SCHL.eBalken, x) }));
    return { ok: true, s, Lu, Ls, W: s === "z" ? Lu : Ls, D: s === "z" ? Ls : Lu, st, n, b, sb, wf, p, qa, treppe: Object.assign({}, t, { N: tr.N, rise: tr.rise, go: tr.go, run: tr.run, spar: tr.spar, spuren: tr.spuren }), geschosse, herd, felder };
}
function legeFeld(raeume, liste, Sd, lh, ell, j, sb, nachHalle, leerName) {
    if (ell < 1e-6) return;
    const start = Sd.nahe + Sd.dir * lh, tot = sum(liste);
    if (!liste.length) { const a = start, e = start + Sd.dir * ell; raeume.push({ id: leerName, soll: 0, leer: true, u0: Math.min(a, e), u1: Math.max(a, e), s0: sb[j], s1: sb[j + 1], band: j, seite: Sd.id, amFlur: !nachHalle, nachHalle }); return; }
    let u = start;
    for (const r of liste) { const len = (ell * r.soll) / tot, a = u, e = u + Sd.dir * len; raeume.push({ id: r.id, soll: r.soll, u0: Math.min(a, e), u1: Math.max(a, e), s0: sb[j], s1: sb[j + 1], band: j, seite: Sd.id, amFlur: u === start && !nachHalle, nachHalle: u === start && nachHalle }); u = e; }
}
function herdLage(r0, G, t) {
    const m = POST / 2 + 0.02, r = { u0: r0.u0 + m, u1: r0.u1 - m, s0: r0.s0 + m, s1: r0.s1 - m }; // vor der Wandflucht, nicht in ihr
    const zonen = G.tueren.map((d) => (d.dir === "s" ? { u0: d.at - SCHWUNG, u1: d.at + SCHWUNG, s0: d.c - d.w / 2, s1: d.c + d.w / 2 } : { u0: d.c - d.w / 2, u1: d.c + d.w / 2, s0: d.at - SCHWUNG, s1: d.at + SCHWUNG }));
    zonen.push({ u0: t.u0, u1: t.u1, s0: t.s0, s1: t.s1 });
    for (const p of G.staender) zonen.push({ u0: p.u - POST / 2, u1: p.u + POST / 2, s0: p.s - POST / 2, s1: p.s + POST / 2 });
    const frei = (h) => !zonen.some((z) => h.u1 > z.u0 + 1e-3 && h.u0 < z.u1 - 1e-3 && h.s1 > z.s0 + 1e-3 && h.s0 < z.s1 - 1e-3);
    const kand = [];
    for (const [lu, ls] of [[HERD.bW, HERD.bD], [HERD.bD, HERD.bW]]) {
        if (r.u1 - r.u0 < lu || r.s1 - r.s0 < ls) continue;
        for (let i = 0; i <= 20; i++) { const u0 = r.u0 + ((r.u1 - r.u0 - lu) * i) / 20, s0 = r.s0 + ((r.s1 - r.s0 - ls) * i) / 20;
            kand.push({ u0, u1: u0 + lu, s0: r.s0, s1: r.s0 + ls }, { u0, u1: u0 + lu, s0: r.s1 - ls, s1: r.s1 }, { u0: r.u0, u1: r.u0 + lu, s0, s1: s0 + ls }, { u0: r.u1 - lu, u1: r.u1, s0, s1: s0 + ls }); }
    }
    return kand.find(frei) || null;
}

// Ständer: Ecken, Kreuzungen, Raster ≤ BAY; Türkanten sind Zwangs-Achsen (in der Öffnung steht keiner); Unterzug: Felder ≤ L_uz,
// Ständer in der Flucht der Grenze; am Treppenloch die Treppenpfosten NEBEN dem Loch.
function staenderVon(G, T, unten) {
    const out = [], key = new Set();
    const add = (u, s, art) => { const k = Math.round(u * 1000) + ":" + Math.round(s * 1000); if (key.has(k)) return; key.add(k); out.push({ u, s, art }); };
    for (const w of G.waende) {
        const pts = [w.a0, w.a1];
        for (const o of G.waende) if (o.dir !== w.dir && o.at >= w.a0 - 1e-6 && o.at <= w.a1 + 1e-6 && w.at >= o.a0 - 1e-6 && w.at <= o.a1 + 1e-6) pts.push(o.at);
        if (w.dir === "s") for (const z of G.unterzuege) if ((Math.abs(w.at - z.u0) < 1e-6 || Math.abs(w.at - z.u1) < 1e-6) && z.s >= w.a0 && z.s <= w.a1) pts.push(z.s);
        const tue = G.tueren.filter((t) => t.dir === w.dir && Math.abs(t.at - w.at) < 1e-6 && t.c > w.a0 && t.c < w.a1);
        for (const t of tue) { const lo = t.c - t.w / 2, hi = t.c + t.w / 2; if (pts.some((v) => v > lo - POST / 2 + 1e-6 && v < hi + POST / 2 - 1e-6)) G.fehler = "Wand-Kreuzung in der Tür " + t.raum; pts.push(lo - POST / 2, hi + POST / 2); }
        const P = [...new Set(pts.map((v) => +v.toFixed(4)))].sort((a, b) => a - b);
        const istTuer = (a, b) => tue.some((t) => (a + b) / 2 > t.c - t.w / 2 && (a + b) / 2 < t.c + t.w / 2);
        const all = [P[0]];
        for (let i = 1; i < P.length; i++) { const a = P[i - 1], bb = P[i]; if (!istTuer(a, bb)) { const m = Math.max(1, Math.ceil((bb - a) / BAY - 1e-6)); for (let q = 1; q < m; q++) all.push(a + ((bb - a) * q) / m); } all.push(bb); }
        for (const v of all) add(w.dir === "u" ? v : w.at, w.dir === "u" ? w.at : v, w.tragend ? "wand-tragend" : "wand");
    }
    for (const z of G.unterzuege) {
        const L = z.u1 - z.u0, Luz = T.Luz(z.eE);
        // über dem EG: wo darunter keine tragende Wand in der Flucht liegt, stehen die Ständer NUR über den Ständern darunter (G9)
        const wandUnten = unten && unten.waende.some((w) => w.tragend && w.dir === "u" && Math.abs(w.at - z.s) < 1e-6 && w.a0 <= z.u0 + 1e-6 && w.a1 >= z.u1 - 1e-6);
        let innen;
        if (!unten || wandUnten || z.wo === "flur") { const m = Math.max(1, Math.ceil(L / Luz - 1e-9)); innen = []; for (let q = 1; q < m; q++) innen.push(z.u0 + (L * q) / m); }
        else { innen = unten.staender.filter((p) => Math.abs(p.s - z.s) < 1e-6 && p.u > z.u0 + 0.05 && p.u < z.u1 - 0.05).map((p) => p.u).sort((a, b) => a - b); }
        const st = [z.u0, ...innen, z.u1]; let feld = 0; for (let q = 1; q < st.length; q++) feld = Math.max(feld, st[q] - st[q - 1]);
        if (feld > Luz + 1e-9) G.fehler = "OG-Halle " + z.wo + ": Unterzug-Feld " + r2(feld) + " > L_uz " + r2(Luz) + " ohne Ständer darunter";
        z.feld = feld; z.Luz = Luz; z.eta = eta(T.b, T.h, T.holz, z.eE, z.feld);
        for (const u of innen) add(u, z.s, "frei:" + z.wo);
        if (z.pf === "pfosten-r") add(z.u1, z.s, "treppenpfosten"); if (z.pf === "pfosten-l") add(z.u0, z.s, "treppenpfosten");
    }
    return out;
}

// ═══ UNABHÄNGIGER PRÜFER ═══ (liest nur Geometrie; rechnet η vorwärts)
function pruefe(R) {
    const k = { pfosten: 0, ohneAuflager: 0, tuerTreppe: 0, staenderTuer: 0, staenderTreppe: 0, uzTreppe: 0, balkenUeber: 0, uzUeber: 0, linienFrei: 0, herdOhnePlatz: 0, knickUeber: 0, balkenLinien: 0, staender: 0, frei: 0 };
    const half = POST / 2, ein = 1e-3, t = R.treppe, G1 = BAU_GESETZ;
    const inRect = (u, s, a) => u + half > a.u0 + ein && u - half < a.u1 - ein && s + half > a.s0 + ein && s - half < a.s1 - ein;
    for (const G of R.geschosse) {
        const tuerRects = G.tueren.map((d) => (d.dir === "s" ? { u0: d.at - 0.06, u1: d.at + 0.06, s0: d.c - d.w / 2, s1: d.c + d.w / 2 } : { u0: d.c - d.w / 2, u1: d.c + d.w / 2, s0: d.at - 0.06, s1: d.at + 0.06 }));
        for (const d of G.tueren) { const z = d.dir === "s" ? { u0: d.at - SCHWUNG, u1: d.at + SCHWUNG, s0: d.c - d.w / 2, s1: d.c + d.w / 2 } : { u0: d.c - d.w / 2, u1: d.c + d.w / 2, s0: d.at - SCHWUNG, s1: d.at + SCHWUNG }; if (z.u1 > t.u0 + ein && z.u0 < t.u1 - ein && z.s1 > t.s0 + ein && z.s0 < t.s1 - ein) k.tuerTreppe++; }
        for (const p of G.staender) {
            k.staender++; if (p.art.startsWith("frei")) k.frei++; if (p.art === "treppenpfosten") k.pfosten++;
            if (tuerRects.some((a) => inRect(p.u, p.s, a))) k.staenderTuer++;
            if (inRect(p.u, p.s, t)) k.staenderTreppe++;
        }
        for (const z of G.unterzuege) { if (z.s > t.s0 && z.s < t.s1 && z.u1 > t.u0 && z.u0 < t.u1) k.uzTreppe++; if (z.eta > 1 + 1e-9) k.uzUeber++; }
        for (let j = 0; j < R.n; j++) {
            k.balkenLinien++;
            if (eta(R.T.b, R.T.h, R.T.holz, SCHL.eBalken, R.sb[j + 1] - R.sb[j]) > 1 + 1e-9) k.balkenUeber++;
            for (const sl of [R.sb[j], R.sb[j + 1]]) {
                const st = G.waende.filter((w) => w.dir === "u" && w.tragend && Math.abs(w.at - sl) < 1e-6).map((w) => [w.a0, w.a1]).concat(G.unterzuege.filter((z) => Math.abs(z.s - sl) < 1e-6).map((z) => [z.u0, z.u1]));
                if (sl > t.s0 && sl < t.s1) st.push([t.u0 - POST - SCHL.klar, t.u1 + POST + SCHL.klar]); // Loch: Balken gewechselt, Linie dort ohne Last
                st.sort((a, b) => a[0] - b[0]); let u = 0; for (const [a, b] of st) { if (a > u + 1e-6) break; u = Math.max(u, b); }
                if (u < R.Lu - 1e-6) k.linienFrei++;
            }
        }
    }
    // jeder freie Ständer über dem EG braucht darunter eine tragende Wand in seiner Flucht oder einen Ständer (Lastpfad)
    for (let g = 1; g < R.geschosse.length; g++) { const U = R.geschosse[g - 1]; for (const p of R.geschosse[g].staender) { if (p.art.startsWith("wand")) continue;
        const wand = U.waende.some((w) => w.tragend && w.dir === "u" && Math.abs(w.at - p.s) < 1e-6 && p.u >= w.a0 - 1e-6 && p.u <= w.a1 + 1e-6), pf = U.staender.some((q) => Math.abs(q.u - p.u) < 0.02 && Math.abs(q.s - p.s) < 0.02);
        if (!wand && !pf) k.ohneAuflager++; } }
    if (!R.herd && R.geschosse[0].raeume.some((r) => r.id === "kueche" || r.id === "herdraum")) k.herdOhnePlatz = 1;
    const gd = G1.gammaG * G1.gDecke + G1.gammaQ * G1.qWohnen; let maxK = 0;
    for (const G of R.geschosse) for (const z of G.unterzuege) maxK = Math.max(maxK, knickEta(R.T.a, R.gH, gd * 1e3 * z.feld * z.eE * (R.st - G.k + 1)));
    maxK = Math.max(maxK, knickEta(POST, R.gH, gd * 1e3 * BAY * Math.max(...R.b) * (R.st + 1))); // Wand-Ständer 16×16 (FC:179), Dach als eine Decke (gewählt)
    k.knickMax = maxK; if (maxK > 1) k.knickUeber++;
    return k;
}
const welt = (R, u, s) => (R.s === "z" ? { x: u - R.Lu / 2, z: s - R.Ls / 2 } : { x: s - R.Ls / 2, z: u - R.Lu / 2 });

// ═══ LAUF ═══
const EPOCHE = [1250, 1450, 1650, 1850], KLASSE = [0, 1, 2], GEW = Object.keys(GEWERBE);
const LOS = [{ B: 5, T: 20 }, { B: 6.5, T: 14 }, { B: 7.5, T: 30 }, { B: 10, T: 30 }, { B: 13, T: 25 }, { B: 16, T: 30 }];
function fall(gewerbe, klasse, baujahr, los, stoffName) {
    const H = haushalt(gewerbe, klasse), R = grundrissVon(H, baujahr, los, STOFF[stoffName]);
    if (!R.ok) return { gewerbe, klasse, baujahr, los, stoff: stoffName, ok: false, grund: R.grund, egM2: Math.round(sum(R.P.eg)) };
    const k = pruefe(R), alle = R.geschosse.flatMap((G) => G.raeume.filter((r) => !r.leer)), qs = alle.map((r) => r.q);
    return {
        gewerbe, klasse, baujahr, los, stoff: stoffName, ok: true, s: R.s, W: r2(R.W), D: r2(R.D), st: R.st, n: R.n, b: R.b.map(r2), wf: r2(R.wf), Lmax: r2(R.T.Lmax),
        treppe: R.treppe.modus + (R.treppe.spar ? "-spar" : ""), hallen: R.geschosse[0].raeume.filter((r) => r.halle).map((r) => r.id),
        etaMax: Math.max(...R.felder.map((f) => f.eta)), etaUzMax: Math.max(0, ...R.geschosse.flatMap((G) => G.unterzuege.map((z) => z.eta))), k,
        qMin: Math.min(...qs), qMax: Math.max(...qs), gefangen: alle.filter((r) => r.gefangen).length, raeume: alle.length,
        leerM2: R.geschosse.flatMap((G) => G.raeume.filter((r) => r.leer)).reduce((a, r) => a + (r.u1 - r.u0) * (r.s1 - r.s0), 0),
        ohneHoftuer: !!R.geschosse.ohneHoftuer, roehre: alle.filter((r) => Math.max(r.u1 - r.u0, r.s1 - r.s0) / Math.min(r.u1 - r.u0, r.s1 - r.s0) > SCHL.roehre).length, versuche: R.versuche,
    };
}
function zaehle(F, titel) {
    const ok = F.filter((f) => f.ok), n = F.length, z = (fn) => ok.filter(fn).length, sk = (key) => ok.reduce((a, f) => a + f.k[key], 0);
    const q = (arr, p) => { const a = arr.slice().sort((x, y) => x - y); return a.length ? a[Math.min(a.length - 1, Math.floor(p * (a.length - 1) + 0.5))] : NaN; };
    const L = [];
    L.push("── " + titel + ": " + n + " Fälle · gültiger Grundriss " + ok.length + " · OHNE gültigen Grundriss " + (n - ok.length));
    L.push("   Balkenlinien über L_max: " + sk("balkenUeber") + " von " + sk("balkenLinien") + " · Unterzug-Felder über L_uz: " + sk("uzUeber") + " · Auflager-Linie ohne Wand/Unterzug: " + sk("linienFrei"));
    L.push("   Ständer in Tür: " + sk("staenderTuer") + " · Ständer in Treppe: " + sk("staenderTreppe") + " · Unterzug im Treppenloch: " + sk("uzTreppe") + " · Tür vor dem Lauf: " + sk("tuerTreppe") + " · freier Ständer ohne Lastpfad: " + sk("ohneAuflager") + " · Häuser mit einem davon: " + z((f) => f.k.staenderTuer + f.k.staenderTreppe + f.k.uzTreppe + f.k.tuerTreppe + f.k.ohneAuflager > 0) + "/" + ok.length + " (Ständer Σ " + sk("staender") + ", frei " + sk("frei") + ", Treppenpfosten NEBEN dem Loch " + sk("pfosten") + " in " + z((f) => f.k.pfosten > 0) + " Häusern)");
    L.push("   η Balken max " + q(ok.map((f) => f.etaMax), 1).toFixed(3) + " · η Unterzug max " + q(ok.map((f) => f.etaUzMax), 1).toFixed(3) + " · η Knick max " + q(ok.map((f) => f.k.knickMax), 1).toFixed(3) + " · Herd ohne Platz " + sk("herdOhnePlatz"));
    L.push("   ist/soll je Raum: kleinster Q10/Q50/Q90 " + [0.1, 0.5, 0.9].map((p) => q(ok.map((f) => f.qMin), p).toFixed(2)).join("/") + " · größter " + [0.1, 0.5, 0.9].map((p) => q(ok.map((f) => f.qMax), p).toFixed(2)).join("/") + " · Durchgangsräume " + ok.reduce((a, f) => a + f.gefangen, 0) + "/" + ok.reduce((a, f) => a + f.raeume, 0) + " · Röhren " + ok.reduce((a, f) => a + f.roehre, 0) + " · Häuser ohne Hoftür (Lauf davor) " + z((f) => f.ohneHoftuer) + " · Knick > 1: " + z((f) => f.k.knickMax > 1) + " · Leerfläche " + Math.round(ok.reduce((a, f) => a + f.leerM2, 0)) + " m²");
    const typ = {}; for (const f of ok) { const tt = f.s + "·" + f.n + "B·" + f.treppe + (f.hallen.length ? "·Halle" : ""); typ[tt] = (typ[tt] || 0) + 1; }
    L.push("   Typen: " + Object.entries(typ).sort((a, b) => b[1] - a[1]).map(([tt, c]) => tt + " " + c).join(" · "));
    L.push("   Formen W×D×st: " + new Set(ok.map((f) => f.W + "×" + f.D + "×" + f.st)).size + " · Breiten " + new Set(ok.map((f) => f.W)).size + " · Geschosse " + [1, 2, 3, 4, 5].map((x) => x + ":" + z((f) => f.st === x)).join(" "));
    const gr = {}; for (const f of F.filter((f) => !f.ok)) { const g = f.grund.replace(/[0-9]+([.,][0-9]+)?/g, "#").replace(/\(EG.*\)/, ""); gr[g] = (gr[g] || 0) + 1; }
    if (n - ok.length) L.push("   Gründe ohne Grundriss: " + Object.entries(gr).sort((a, b) => b[1] - a[1]).map(([g, c]) => c + "× " + g).join(" | "));
    return L.join("\n");
}
function matrix(F, titel) {
    const L = ["   " + titel + " — gültig/alle je Los-Breite × Wohlstand (arm/mittel/reich):"];
    for (const B of [...new Set(F.map((f) => f.los.B))].sort((a, b) => a - b)) L.push("     B " + String(B).padEnd(4) + KLASSE.map((kl) => { const a = F.filter((f) => f.los.B === B && f.klasse === kl); return a.filter((f) => f.ok).length + "/" + a.length; }).join("  "));
    return L.join("\n");
}
function selbsttest() {
    const T = ortTragwerk(STOFF.eiche);
    const z = [
        Math.abs(T.b - 0.149) < 0.001 && Math.abs(T.h - 0.2107) < 0.001, // Kreuzholz d 0,258 (Runde 1 B1)
        Math.abs(T.Lmax - 4.593) < 0.01, // L_max e 0,85 (Runde 1: 4,59)
        Math.abs(eta(T.b, T.h, "eiche", 0.85, T.Lmax) - 1) < 1e-6, // Vorwärts-Nachweis trifft die Umkehrung
        Math.abs(balkenSpann(0.15, 0.21, "eiche", 1.7, 1.5, 2.0).L - 3.643) < 0.01, // Runde-1-Selbsttest B1
        Math.abs(eta(T.b, T.h, "eiche", 4.17, 2.64) - 0.93) < 0.02, // pruefung-spike (2): Unterzug 2,64 bei Einzug 4,17 → η_fin 0,93
        Math.abs(eta(0.15, 0.21, "eiche", 1.31, 7.46) - 197 / 30) < 0.2, // pruefung-spike (2): heute G29#35 w_fin 197 / l/250 30 mm (maßgebend)
    ];
    let w1 = false; try { grundrissVon(haushalt("weber", 1), 1600, { B: 8 }, STOFF.eiche); } catch (e) { w1 = /los\.T/.test(e.message); }
    let w2 = false; try { grundrissVon(haushalt("weber", 1), 1600, { B: 8, T: 30 }, undefined); } catch (e) { w2 = /stoff/.test(e.message); }
    z.push(w1, w2);
    return { gruen: z.every(Boolean), z, T };
}
if (require.main === module) {
    const t0 = Date.now(), S = selbsttest();
    console.log("Selbsttest " + (S.gruen ? "GRÜN" : "ROT") + " " + JSON.stringify(S.z) + " · L_max Eiche d 0,258 e 0,85 = " + S.T.Lmax.toFixed(3) + " m · L_uz(e 4,17) = " + S.T.Luz(4.17).toFixed(3) + " m");
    for (const sn of Object.keys(STOFF)) { const T = ortTragwerk(STOFF[sn]); console.log("Stoff " + sn + ": " + T.holz + " d " + T.d + " → Balken " + r2(T.b) + "×" + r2(T.h) + " · L_max " + T.Lmax.toFixed(2) + " m · L_uz(e 2,3) " + T.Luz(2.3).toFixed(2) + " · L_uz(e 4,5) " + T.Luz(4.5).toFixed(2)); }
    for (const y of EPOCHE) { const gH = geschossH(y, ortTragwerk(STOFF.eiche).h); const a = treppeVon(gH, 2, false), b = treppeVon(gH, 2, true); console.log("Treppe " + y + ": gH " + gH.toFixed(2) + " · Norm N " + a.N + " Loch " + a.loch.toFixed(2) + " · Spar N " + b.N + " Loch " + b.loch.toFixed(2) + " m"); }
    const F = [];
    const STOFFE = process.env.STOFFE ? process.env.STOFFE.split(",") : Object.keys(STOFF);
    for (const sn of STOFFE) for (const y of EPOCHE) for (const kl of KLASSE) for (const g of GEW) for (const los of LOS) F.push(fall(g, kl, y, los, sn));
    for (const sn of STOFFE) { const Fs = F.filter((f) => f.stoff === sn); console.log(zaehle(Fs, "RASTER " + sn + " (4 Epochen × 3 Wohlstand × 11 Gewerbe × 6 Lose)")); console.log(matrix(Fs, sn)); }
    console.log(zaehle(F, "RASTER gesamt (3 Stoffe)"));
    const H100 = JSON.parse(fs.readFileSync(path.join(__dirname, "../../../koordination/vision/bau/spike/haus100.json"), "utf8")).zeilen.filter((z) => z.gesetz && z.gesetz.gewerbe);
    const F94 = H100.map((z) => fall(z.gesetz.gewerbe, z.gesetz.klasse, z.jahr, { B: z.gesetz.b, T: 30 }, "eiche"));
    console.log(zaehle(F94, "RUNDE-1-HAUSHALTE (" + F94.length + ", Los b der Runde 1 × 30 m, Eiche) — dort 52/94 Konflikt"));
    for (const [g, kl, y, los] of [["weber", 1, 1450, { B: 7.5, T: 30 }], ["kaufmann", 2, 1650, { B: 10, T: 30 }], ["wirt", 1, 1650, { B: 13, T: 25 }], ["tageloehner", 0, 1250, { B: 5, T: 20 }], ["ackerbuerger", 1, 1450, { B: 16, T: 30 }]]) {
        const R = grundrissVon(haushalt(g, kl), y, los, STOFF.eiche);
        if (!R.ok) { console.log("BEISPIEL " + g + "/" + kl + "/" + y + "/B" + los.B + ": OHNE Grundriss — " + R.grund); continue; }
        console.log("BEISPIEL " + g + "/" + ["arm", "mittel", "reich"][kl] + "/" + y + "/Los " + los.B + "×" + los.T + ": s=" + R.s + " W " + r2(R.W) + " D " + r2(R.D) + " st " + R.st + " · Bänder " + R.b.map(r2).join("+") + " (L_max " + r2(R.T.Lmax) + ") · Querzone " + r2(R.wf) + " ab u " + r2(R.qa) + " · Treppe " + R.treppe.modus + (R.treppe.spar ? " spar" : "") + " N " + R.treppe.N + " Loch u " + r2(R.treppe.u0) + "–" + r2(R.treppe.u1) + " s " + r2(R.treppe.s0) + "–" + r2(R.treppe.s1));
        for (const G of R.geschosse) console.log("   G" + G.k + ": " + G.raeume.map((r) => r.id + (r.halle ? "[Halle]" : "[B" + r.band + r.seite + "]") + " " + r2(r.u1 - r.u0) + "×" + r2(r.s1 - r.s0) + (r.leer ? " leer" : " q" + r.q.toFixed(2)) + (r.gefangen ? " ↷" : "")).join(" · ") + " | Unterzüge " + G.unterzuege.map((z) => z.wo + " " + r2(z.u1 - z.u0) + " m, Feld " + r2(z.feld) + ", η " + z.eta.toFixed(2)).join("; ") + " | Ständer " + G.staender.length + " (frei " + G.staender.filter((p) => !p.art.startsWith("wand")).length + ")");
        const k = pruefe(R); console.log("   Prüfer: Tür " + k.staenderTuer + " · Treppe " + k.staenderTreppe + " · UZ-Loch " + k.uzTreppe + " · Balken über " + k.balkenUeber + "/" + k.balkenLinien + " · Linie frei " + k.linienFrei + " · η Balken " + R.felder.map((f) => f.eta.toFixed(2)).join("/") + " · Knick " + k.knickMax.toFixed(2) + " · Herd " + (R.herd ? "u " + r2(R.herd.u0) + "–" + r2(R.herd.u1) + " s " + r2(R.herd.s0) + "–" + r2(R.herd.s1) : "—"));
    }
    const t1 = Date.now();
    if (!process.env.KAP && !process.env.STOFFE) fs.writeFileSync(path.join(__dirname, "grundriss-lauf.json"), JSON.stringify({ raster: F, runde1: F94 }));
    console.log("Zeit " + (t1 - t0) + " ms für " + (F.length + F94.length) + " Häuser (" + ((t1 - t0) / (F.length + F94.length)).toFixed(2) + " ms je Haus inkl. Aufzählung und Prüfer)");
}
module.exports = { grundrissVon, pruefe, ortTragwerk, treppeVon, programm, eta, knickEta, welt, SCHL, STOFF, selbsttest };
