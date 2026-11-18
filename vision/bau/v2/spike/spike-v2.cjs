// spike-v2.cjs — SPIKE v2 GEGEN DAS GESETZ (BAU-ZENSUS Runde 2, entscheid-v2.md §5). Ziel: WIDERLEGEN.
// Die GEKOPPELTE Kette (entscheid-v2.md §1): Los, Geschichte, Haushalt (Miete 0,3) aus Entwurf B (stadt-b.cjs = stadt-proto.cjs, nur
// der Pfad zu gesetz-proto.cjs angepasst, Lauf STADT_V2='{"inwohner":0.3}' → stadt-v2-haeuser-m03.json), Grundriss (Tiefe, Grund-Geschosse)
// aus Entwurf A (grundriss-a.cjs = grundriss-proto.cjs + Haken `H.hoch`), Breite mit Torfahrt, Höhe = Σ Geschosse je Jahr + Aufstockungen,
// Druck → Hof (die neue Ursache). Prüfer: linse-v2.cjs (andere Hand als der Bau).
// Aufruf: node spike-v2.cjs [--erschoepfend]   → spike-v2.log (stdout), spike-v2-zahlen.json, spike-v2-hundert.json
"use strict";
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const { laden } = require("./lade.cjs");
const GP = require("./grundriss-a.cjs"), R1 = require("./gesetz-proto-r1.cjs"), LI = require("./linse-v2.cjs");
const D0 = __dirname, ERSCH = process.argv.includes("--erschoepfend");

// ── Werkzeug ──
const q = (a, p) => { const s = a.slice().sort((x, y) => x - y); const i = (s.length - 1) * p, lo = Math.floor(i), hi = Math.ceil(i); return s[lo] + (s[hi] - s[lo]) * (i - lo); };
const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
const r2 = (v) => Math.round(v * 100) / 100, r3 = (v) => Math.round(v * 1000) / 1000, halb = (x) => Math.round(x * 2) / 2;
const pct = (a, b) => (b ? ((100 * a) / b).toFixed(1) : "—") + " %";
const raenge = (a) => { const o = a.map((v, i) => [v, i]).sort((x, y) => x[0] - y[0]), r = new Array(a.length); for (let i = 0; i < o.length;) { let j = i; while (j + 1 < o.length && o[j + 1][0] === o[i][0]) j++; for (let k = i; k <= j; k++) r[o[k][1]] = (i + j) / 2 + 1; i = j + 1; } return r; };
const pearson = (x, y) => { const mx = mean(x), my = mean(y); let a = 0, b = 0, c = 0; for (let i = 0; i < x.length; i++) { a += (x[i] - mx) * (y[i] - my); b += (x[i] - mx) ** 2; c += (y[i] - my) ** 2; } return a / Math.sqrt(b * c); };
const spearman = (x, y) => pearson(raenge(x), raenge(y));
function fnv(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function fmix(h) { let x = h >>> 0; x = Math.imul(x ^ (x >>> 16), 0x85ebca6b) >>> 0; x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35) >>> 0; return (x ^ (x >>> 16)) >>> 0; }
const ax = (...t) => fmix(fnv(t.join("|"))) / 4294967296; // der Strom von B (stadt-proto.cjs:28–30)
const muss = (v, n) => { if (v === undefined || v === null || (typeof v === "number" && !Number.isFinite(v))) throw new Error("spike-v2: es fehlt " + n); return v; };
const sha = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");
const hr = () => process.hrtime.bigint(), ms = (t0) => Number(process.hrtime.bigint() - t0) / 1e6;

// ── 0. Der Kern: byte-gleiche Kopie, SHA gegen das Original im Lese-Baum ──
const KERN = path.join(D0, "kern", "fachwerk-core.js"), ORIG = path.join(D0, "..", "..", "..", "..", "n1011-hg", "fachwerk-core.js");
const shaK = sha(KERN), shaO = sha(ORIG);
if (shaK !== shaO) throw new Error("spike-v2: Kern-Kopie ≠ Original " + shaK + " / " + shaO);

// ── SCHLIESSUNGEN des Spikes (über den Entscheid hinaus; jede benannt, Status im Blatt) ──
const K = Object.freeze({
    reiheBis: 12, torfahrt: 3.5,      // K1 B (stadt-proto.cjs:50–51) — W = Los, auf Losen > 12 m Los − Torfahrt (entscheid-v2 §1 wörtlich)
    T: 30, hofMin: 4, dZiel: 11,      // K2 Los-Tiefe 30 m (Richter, gewählt) · A G6 / S4
    hofK: 1.0,                        // K3 Druck → Hof: EG-Tiefe ≤ dZiel·(1 − hofK·(Druck − 0,5)) … Druck 0,5 → 11 m, Druck 1 → 5,5 m (gewählt); Lauf K: hofK 1,2 → 4,4 m
    stoffVon: { fachwerk: "eiche", block: "nadel", staender: "nadel", stein: "eiche" }, // K4 wie Richter (entscheid-v2 §6)
    mieteM2: 27.3,                    // K5 B V2.inwohnerM2: je Miet-Haushalt ein OG-Raum (Richter MIETE)
    hebbar: ["kontor", "stube", "lager", "webstube", "werkraum"], // K6 nur Variante H: Räume, die der Druck ins OG heben darf (gewählt)
    stab: 2,                          // B: Traufe ≤ 2·Tiefe (FC:3892 STADT_FORM.stab, gelesen FC:4494)
});
const ORT = { mitteleuropa: "fachwerk", alpin: "block", nordisch: "block", fernost: "staender", mediterran: "stein", antik: "stein" }; // stadt-proto.cjs:80–87

// ── 1. Die Lose (B, Miete 0,3) ──
const HS = JSON.parse(fs.readFileSync(path.join(D0, "stadt-v2-haeuser-m03.json"), "utf8"));
if (HS.length !== 2595) throw new Error("spike-v2: erwartet 2 595 Lose, gelesen " + HS.length);
const planVon = (adr) => adr.split("#")[0];
const aufstVon = (ev) => { let a = []; for (const e of ev) { const [art, y] = e.split(" "); if (art === "Brand" || art === "Teilung" || art === "Kauf") a = []; else if (art === "Aufstockung") a.push(+y); } return a.slice(0, 2); };
// die URSACHEN eines Hauses — der EINE Eingang der Kette (alles, was sie liest; die Adresse liest nur eine Mutante)
const ursachen = (h) => ({ adr: h.adr, plan: planVon(h.adr), U: h.los.U, f: h.los.f, b: h.los.b, region: h.region, gewerbe: h.H.gewerbe, klasse: h.H.klasse, wohl: h.H.wohl,
    kern: h.H.kern, gesinde: h.H.gesinde, koepfe: h.H.koepfe, inwohner: h.H.inwohner, bau: h.bau, aufst: aufstVon(h.ereignis), druck: r3(0.5 + 0.5 * (1 - h.t)) });

// ── 2. Die gekoppelte Kette ──
const hB = {}; for (const s of Object.keys(GP.STOFF)) hB[s] = R1.kreuzholz(GP.STOFF[s].d).h;
function haushaltA(c) {
    const H = { gewerbe: c.gewerbe, klasse: c.klasse, wohl: c.wohl, kern: c.kern, gesinde: c.gesinde, koepfe: c.koepfe };
    if (c.inwohner > 0) { const key = c.gewerbe + "+miete" + c.inwohner, G = muss(R1.GEWERBE[c.gewerbe], "GEWERBE " + c.gewerbe);
        if (!R1.GEWERBE[key]) R1.GEWERBE[key] = Object.assign({}, G, { raeume: G.raeume.concat(Array.from({ length: c.inwohner }, () => ["miete", K.mieteM2, "og"])) });
        H.gewerbe = key; }
    return H;
}
const fussEins = (c) => { const P = GP.programm(haushaltA(c), c.bau), sm = (a) => a.reduce((x, r) => x + r.soll, 0); return (sm(P.eg) + sm(P.og) + P.kammer.m2) / 0.7; }; // B fuss(1) (stadt-proto.cjs:228) ohne dach
const breite = (c, opt) => { let W = c.b <= K.reiheBis ? halb(c.b) : opt.wB ? Math.min(halb(c.b - K.torfahrt), Math.max(6, halb(fussEins(c) / 8))) : halb(c.b - K.torfahrt); if (opt.mutW) W = Math.max(2, halb(W + (ax("mutW", c.adr) - 0.5) * 2.2)); return W; };
const dGrenze = (c, opt) => Math.min(K.dZiel, K.T - K.hofMin) * (opt.druck ? 1 - (opt.hofK2 ? 1.2 : K.hofK) * (c.druck - 0.5) : 1);
function kette(c, opt) {
    const sn = muss(K.stoffVon[muss(ORT[c.region], "ORT " + c.region)], "Stoff " + c.region), W = breite(c, opt), Dg = dGrenze(c, opt);
    const los = { B: W, T: Dg + K.hofMin };
    const H = haushaltA(c);
    let R = GP.grundrissVon(H, c.bau, los, GP.STOFF[sn]), hoch = [];
    if (opt.hoch && !R.ok) { const egIds = GP.programm(H, c.bau).eg.map((r) => r.id);
        for (const id of K.hebbar) { if (R.ok) break; if (!egIds.includes(id)) continue; hoch.push(id); R = GP.grundrissVon(Object.assign({}, H, { hoch: hoch.slice() }), c.bau, los, GP.STOFF[sn]); } }
    if (!R.ok) return { ok: false, grund: R.grund, W, Dg, sn };
    let D = R.D; if (opt.mutD) D = Math.max(3, D + (ax("mutD", c.adr) - 0.5) * 1.8);
    const js = Array(R.st).fill(c.bau).concat(c.aufst), tr = []; let t = R1.BAU_GESETZ.sockel;
    for (const y of js) { t += R1.geschossH(y, hB[sn]); tr.push(t); }
    let st = js.length; while (st > R.st && tr[st - 1] > K.stab * D) st--;
    return { ok: true, W, D: halb(D), Droh: D, st, st0: R.st, traufe: r2(tr[st - 1]), sn, Dg, hoch, R };
}
// die HÜLLE (entscheid-v2 §3: `huelleVon(programm, los, bauOrt)`, geschlossen, ohne Aufzählung) — vom Spike AUSGESCHRIEBEN (K7, gewählt):
// A's Ausrichtung und Tiefe (grundriss-proto.cjs:121–130) ohne Belegung, st = 1 wenn alles ins EG passt, sonst 2; n = ⌈Ls/L_max⌉
function huelle(c, opt) {
    const sn = K.stoffVon[ORT[c.region]], W = breite(c, opt), Dg = dGrenze(c, opt), H = haushaltA(c), P = GP.programm(H, c.bau), S = GP.SCHL;
    const T = GP.ortTragwerk(GP.STOFF[sn]), gH = R1.geschossH(c.bau, T.h), sum = (a) => a.reduce((s, r) => s + r.soll, 0);
    const Ad = (P.eg.find((r) => r.id === "diele") || { soll: 0 }).soll;
    for (const st of [1, 2]) {
        const tr = GP.treppeVon(gH, st, false), At = sum(P.eg.filter((r) => r.id !== "diele")) + (st === 1 ? sum(P.og) + P.kammer.m2 : 0);
        let wf = Math.max(1.0, 1.1) + tr.breite + 3 * S.klar, Dz = Infinity, wfz = wf;
        for (let i = 0; i < 3; i++) { if (W - wfz <= 0) break; Dz = At / (W - wfz); wfz = Ad ? Math.max(wf, Ad / Math.max(S.dMin, Dz)) : wf; }
        let s, D;
        if (W - wfz > 0 && Math.max(S.dMin, Dz) <= W) { s = "z"; D = Math.max(S.dMin, At / (W - wfz)); } else { s = "x"; if (Ad) wf = Math.max(wf, Ad / W); D = Math.max(S.dMin, wf + At / W); }
        if (D <= Math.min(S.dZiel, Dg) + 1e-9) return { ok: true, s, W, D, st, n: Math.max(1, Math.ceil((s === "z" ? D : W) / T.Lmax - 1e-9)) };
    }
    return { ok: false, W };
}

// ── 3. Vielfalt (Maß stadt-proto.cjs:111–118 / zaehl/richter-kopplung.cjs:17–24) ──
function vielfalt(L) {
    const form = (h) => h.W + "x" + h.D + "x" + h.st, pp = {};
    for (const h of L) (pp[h.plan] ||= []).push(form(h));
    const modal = (a) => { const c = {}; for (const x of a) c[x] = (c[x] || 0) + 1; return Math.max(...Object.values(c)) / a.length; };
    const T = L.map((h) => h.traufe);
    return { n: L.length, formen: new Set(L.map(form)).size, breiten: new Set(L.map((h) => h.W)).size, spanne: r2(q(T, 0.9) - q(T, 0.1)), q10: r2(q(T, 0.1)), q90: r2(q(T, 0.9)),
        modalQ50: Math.round(1000 * q(Object.values(pp).map(modal), 0.5)) / 10, st: [1, 2, 3, 4, 5, 6, 7].map((s) => L.filter((h) => h.st === s).length) };
}
const C = HS.map(ursachen);

function lauf(name, opt) {
    const t0 = hr(), Z = C.map((c) => Object.assign({ c }, kette(c, opt))), dt = ms(t0);
    const ok = Z.filter((z) => z.ok), nein = Z.filter((z) => !z.ok);
    const V = vielfalt(ok.map((z) => ({ plan: z.c.plan, W: z.W, D: z.D, st: z.st, traufe: z.traufe })));
    const band = (lo, hi) => { const a = Z.filter((z) => z.W >= lo && z.W < hi); return a.filter((z) => z.ok).length + "/" + a.length; };
    const gr = {}; for (const z of nein) { const g = z.grund.replace(/[0-9]+([.,][0-9]+)?/g, "#").replace(/\(EG.*\)/, "").trim(); gr[g] = (gr[g] || 0) + 1; }
    const sp = spearman(ok.map((z) => z.traufe), ok.map((z) => z.c.druck)), spSt = spearman(ok.map((z) => z.st0), ok.map((z) => z.c.druck));
    const drittel = [0, 1, 2].map((k) => { const a = Z.filter((z) => z.c.druck >= 0.5 + k / 6 && z.c.druck < 0.5 + (k + 1) / 6 + (k === 2 ? 1e-9 : 0)); const o = a.filter((z) => z.ok);
        return `Druck ${(0.5 + k / 6).toFixed(2)}–${(0.5 + (k + 1) / 6).toFixed(2)}: gültig ${o.length}/${a.length}, Traufe Q50 ${o.length ? r2(q(o.map((z) => z.traufe), 0.5)) : "—"}, st0 Ø ${o.length ? r2(mean(o.map((z) => z.st0))) : "—"}`; });
    console.log(`\n── LAUF ${name} (${JSON.stringify(opt)}) — ${(dt / Z.length).toFixed(3)} ms je Haus`);
    console.log(`   gültig ${ok.length}/${Z.length} · OHNE Grundriss ${nein.length} = ${pct(nein.length, Z.length)} · je Breite W <5 ${band(0, 5)} · 5–6,5 ${band(5, 6.5)} · 6,5–8 ${band(6.5, 8)} · 8–12 ${band(8, 12)} · ≥12 ${band(12, 99)}`);
    console.log(`   Vielfalt: Formen ${V.formen} · Breiten ${V.breiten} · Traufe Q10/Q90 ${V.q10}/${V.q90} (Spanne ${V.spanne}) · häufigste Form Q50 ${V.modalQ50} % · Geschosse 1..7 ${V.st.join(" ")}`);
    console.log(`   Höhe ↔ Druck: Spearman(Traufe, Druck) ${r3(sp)} · Spearman(Grund-st, Druck) ${r3(spSt)} · ${drittel.join(" | ")}`);
    console.log(`   Gründe ohne Grundriss: ${Object.entries(gr).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([g, n]) => n + "× " + g).join(" | ")}`);
    console.log(`   Form-Unsinn: W > 20 m ${ok.filter((z) => z.W > 20).length} · W/D > 3 ${ok.filter((z) => z.W / z.D > 3).length} · W/D > 5 ${ok.filter((z) => z.W / z.D > 5).length} von ${ok.length}`);
    if (opt.hoch) console.log(`   gehobene Räume: ${ok.filter((z) => z.hoch.length).length} Häuser (${JSON.stringify(ok.reduce((o, z) => { for (const id of z.hoch) o[id] = (o[id] || 0) + 1; return o; }, {}))})`);
    return { name, opt, Z, ok, V, ausfall: nein.length / Z.length, spearman: sp, spSt, msJeHaus: dt / Z.length, gruende: gr };
}

(async () => {
    const LS = LI.selbsttest(); if (!LS.gruen) throw new Error("linse-v2 Selbsttest ROT " + JSON.stringify(LS.z));
    const GS = GP.selbsttest(); if (!GS.gruen) throw new Error("grundriss Selbsttest ROT");
    console.log(`SPIKE v2 · Kern-Kopie SHA-256 ${shaK} = Original n1011-hg/fachwerk-core.js (${shaO === shaK ? "GLEICH" : "UNGLEICH"}) · linse-v2 Selbsttest GRÜN ${JSON.stringify(LS.z)} · grundriss Selbsttest GRÜN`);
    process.env.KAP = ERSCH ? "" : "1"; if (ERSCH) delete process.env.KAP;
    console.log(`Belegung: ${ERSCH ? "ERSCHÖPFEND (KAP 1296)" : "GIERIG (KAP 1)"} für die 2 595 Lose`);

    // ── S-c / S-f / S-h an den 2 595 Losen ──
    const LE = lauf("E (Entscheid wörtlich: Druck → EG-Tiefe, A's Geschosse)", { druck: true });
    const L0 = lauf("0 (ohne Druck, Grenze 11 m)", {});
    const LH = lauf("H (Druck hebt Räume ins OG, K6)", { druck: true, hoch: true });
    const LB = lauf("EB (wie E, Breite auf Losen > 12 m nach B: min(Los − Torfahrt, max(6, Fuß/8)), stadt-proto.cjs:229)", { druck: true, wB: true });
    const LK = lauf("K (Druck stärker, hofK 1,2: Grenze bei Druck 1 = 4,4 m — Gegenprobe, ob MEHR Druck die Höhe trägt)", { druck: true, hofK2: true });

    // ── S-f mit Hülle: füllt der Grundriss die Hülle? (Lauf E) ──
    let hOk = 0, fuellt = 0, hOhneG = 0, gOhneH = 0, stUng = 0, dUng = 0;
    for (const z of LE.Z) { const Hh = huelle(z.c, { druck: true }); if (Hh.ok) hOk++;
        if (Hh.ok && !z.ok) hOhneG++; if (!Hh.ok && z.ok) gOhneH++;
        if (Hh.ok && z.ok) { if (Hh.st !== z.st0) stUng++; else if (Math.abs(Hh.D - z.Droh) > 0.5) dUng++; else fuellt++; } }
    console.log(`\nS-f HÜLLE (K7) an den 2 595 (Lauf E): Hülle möglich ${hOk} · Grundriss füllt sie (st gleich, |ΔD| ≤ 0,5 m) ${fuellt} · Hülle ohne Grundriss ${hOhneG} = ${pct(hOhneG, 2595)} · Grundriss ohne Hülle ${gOhneH} · st verschieden ${stUng} · D verschieden ${dUng}`);

    // ── S-b an den 2 595 (Lauf E, Linse) ──
    let sbHaus = 0, sbKurz = 0, sbT = { tuer: 0, loch: 0, podest: 0, pfostenImPodest: 0, wandInsPodest: 0, staender: 0 };
    for (const z of LE.ok) { const k = LI.staenderTreffer(z.R); if (k.treffer) sbHaus++; if (k.wandInsPodest) sbKurz++; for (const x of Object.keys(sbT)) sbT[x] += k[x]; }
    console.log(`S-b (Linse) an den ${LE.ok.length} gültigen: Häuser mit Treffer ${sbHaus} = ${pct(sbHaus, LE.ok.length)} · Häuser, deren Podest an der Außenwand lichte < 0,9 m hat (Wand-Ständer ragt hinein) ${sbKurz} · ${JSON.stringify(sbT)}`);
    // ── S-a an den 2 595 (Prototyp-Geometrie) + Mutante ──
    let saHaus = 0, saUnten = 0, saOben = 0, saMut = 0, saFrei = 0, saStk = 0, saMax = 0, saTyp = {};
    for (const z of LE.ok) { const Lm = GP.ortTragwerk(GP.STOFF[z.sn]).Lmax; let u = 0, uo = 0, m = 0, f = 0;
        for (const d of LI.ausGrundriss(z.R)) { const s = LI.spannweiten(d.joists, d.supports, Lm); if (d.oben) uo += s.ueber; else u += s.ueber; f += s.endeFrei; saStk += s.stuecke; saMax = Math.max(saMax, s.maxSpann / Lm); }
        for (const d of LI.mutanteJederStaender(z.R)) m += LI.spannweiten(d.joists, d.supports, Lm).ueber;
        if (u || uo) { saHaus++; const k = z.R.s + "·" + z.R.treppe.modus; saTyp[k] = (saTyp[k] || 0) + 1; } if (u) saUnten++; if (uo) saOben++; if (m) saMut++; if (f) saFrei++; }
    console.log(`S-a (Linse, Prototyp-Geometrie, Balken als Linie) an den ${LE.ok.length}: Häuser mit Balken > L_max ${saHaus} = ${pct(saHaus, LE.ok.length)} (in einer Decke MIT Treppenloch ${saUnten} · in der obersten Decke ${saOben}) · je Typ ${JSON.stringify(saTyp)} · mit freiem Ende ${saFrei} · Stücke ${saStk} · größte Spannweite/L_max ${r3(saMax)} · MUTANTE „Balken auf jedem Ständer“: ${saMut} Häuser ROT`);

    // ── S-d: Paare in derselben Stadt (Lauf E) — 1 200 Paare, gezogen wie B (stadt-proto.cjs:313–315) ──
    const idx = []; { let j = 0; const byPlan = {}; C.forEach((c, i) => (byPlan[c.plan] ||= []).push(i));
        while (idx.length < 1200) { const a = Math.floor(ax("paar", 1, j, "a") * C.length); j++; const same = byPlan[C[a].plan], b = same[Math.floor(ax("paar", 1, j, "c") * same.length)]; if (a !== b) idx.push([a, b]); } }
    const sd = (opt) => {
        // (i) Gegenwelt: B mit A's Adresse und B's Ursachen gerechnet — gleich B? (kein verborgener Eingang)  (ii) B-Art: Ursachen-Tafel ABH
        const ABH = { W: ["U", "f"], D: ["U", "f", "gewerbe", "klasse", "wohl", "kern", "gesinde", "koepfe", "inwohner", "bau", "druck", "region"], st: ["U", "f", "gewerbe", "klasse", "wohl", "kern", "gesinde", "koepfe", "inwohner", "bau", "druck", "region", "aufst"] };
        ABH.traufe = ABH.st;
        const ABHdiskret = { W: ABH.W, D: ABH.D.filter((x) => x !== "wohl" && x !== "druck"), st: ABH.st.filter((x) => x !== "wohl" && x !== "druck") }; ABHdiskret.traufe = ABHdiskret.st;
        let versch = 0, gegen = 0, abh = 0, abhD = 0; const ur = {};
        for (const [a, b] of idx) {
            const A = kette(C[a], opt), B = kette(C[b], opt); if (!A.ok || !B.ok) continue;
            const diff = ["W", "D", "st", "traufe"].filter((m) => A[m] !== B[m]); if (!diff.length) continue; versch++;
            const G = kette(Object.assign({}, C[b], { adr: C[a].adr }), opt);
            if (G.ok && ["W", "D", "st", "traufe"].every((m) => G[m] === B[m])) gegen++;
            const rueck = (T) => diff.every((m) => T[m].some((x) => JSON.stringify(C[a][x]) !== JSON.stringify(C[b][x])));
            if (rueck(ABH)) abh++; if (rueck(ABHdiskret)) abhD++;
            for (const x of new Set(diff.flatMap((m) => ABH[m]))) if (JSON.stringify(C[a][x]) !== JSON.stringify(C[b][x])) ur[x] = (ur[x] || 0) + 1;
        }
        return { versch, gegen, abh, abhD, ur: Object.fromEntries(Object.entries(ur).sort((x, y) => y[1] - x[1]).map(([k, v]) => [k, r2(v / versch)])) };
    };
    const SD = { kette: sd({ druck: true }), mutW: sd({ druck: true, mutW: true }), mutD: sd({ druck: true, mutD: true }) };
    console.log(`\nS-d PAARE (1 200 in derselben Stadt, Lauf E; beide gültig und Form/Traufe verschieden = Nenner)`);
    for (const [k, s] of Object.entries(SD)) console.log(`   ${k.padEnd(6)} Nenner ${s.versch} · Gegenwelt (B-Ursachen an A-Adresse = B) ${s.gegen} = ${pct(s.gegen, s.versch)} · Ursachen-Tafel wie B ${s.abh} = ${pct(s.abh, s.versch)} · Tafel nur diskrete Ursachen ${s.abhD} = ${pct(s.abhD, s.versch)}`);
    console.log(`   Ursachen je Paar (Anteil, kette): ${JSON.stringify(SD.kette.ur)}`);
    const wohlEinmalig = new Set(C.map((c) => c.plan + "|" + c.wohl)).size, druckEinmalig = new Set(C.map((c) => c.plan + "|" + c.druck)).size;
    console.log(`   stetige Ursachen: (Plan, wohl) ${wohlEinmalig} verschiedene Werte · (Plan, Druck) ${druckEinmalig} auf ${C.length} Häuser`);

    // ── S-e: Los-Breiten gegen den Beleg ──
    const imBand = C.filter((c) => c.f >= 0.75 && c.f <= 2.5).length, amRaster = C.filter((c) => Math.abs((c.b / c.U) * 4 - Math.round((c.b / c.U) * 4)) * c.U / 4 <= 0.5).length;
    console.log(`\nS-e LOS: im Band ¾–2½ Einheiten ${imBand}/2595 = ${pct(imBand, 2595)} (Schwelle ≥ 80 %) · am Viertel-Raster ± 0,5 m ${amRaster}/2595 = ${pct(amRaster, 2595)} (Schwelle 50–80 %)`);
    // ── S-i: Köpfe am Beleg ──
    const KO = C.map((c) => c.koepfe), GE = C.map((c) => c.gesinde), MI = C.reduce((a, c) => a + 3 * c.inwohner, 0), LEU = KO.reduce((a, b) => a + b, 0);
    console.log(`S-i KÖPFE: Haushalt Ø ${r2(mean(KO))} (4,25–5,25) · Gesinde ${pct(GE.reduce((a, b) => a + b, 0), LEU)} der Haushalts-Leute (11–14 %) · Miete ${pct(MI, MI + LEU)} der Leute (5–8 %), Miet-Haushalte je Haus ${r3(MI / 3 / 2595)}`);

    // ── S-g: PREIS, kalt und warm im selben Prozess ──
    const { FC, THREE } = await laden();
    const zeit = (f, n) => { const t = []; for (let i = 0; i < n; i++) { const t0 = hr(); f(i); t.push(ms(t0)); } return t; };
    const dKalt = zeit(() => FC.DORF({ seed: 31, nH: 90 }), 1)[0], dWarm = q(zeit((i) => FC.DORF({ seed: 32 + i, nH: 90 }), 20), 0.5), dWarm1 = q(zeit(() => FC.DORF({ seed: 31, nH: 90 }), 20), 0.5);
    const proben = C.slice(0, 400);
    const hKalt = zeit((i) => huelle(proben[i], { druck: true }), 1)[0], hWarm = q(zeit((i) => huelle(proben[i % 400], { druck: true }), 2000), 0.5);
    process.env.KAP = "1"; const gK = (() => { const c = C[1000]; const t0 = hr(); kette(Object.assign({}, c, { adr: "kalt" }), { druck: true }); return ms(t0); })();
    const gWarm = q(zeit((i) => kette(proben[i], { druck: true }), 400), 0.5), gQ90 = q(zeit((i) => kette(proben[i], { druck: true }), 400), 0.9);
    delete process.env.KAP; const eWarm = q(zeit((i) => kette(proben[i * 20], { druck: true }), 20), 0.5); process.env.KAP = ERSCH ? "" : "1"; if (ERSCH) delete process.env.KAP;
    console.log(`\nS-g PREIS (node, ein Prozess, ms): DORF nH 90 heute kalt ${r3(dKalt)} · warm (neue Saat) Q50 ${r3(dWarm)} · warm (gleiche Saat) Q50 ${r3(dWarm1)}`);
    console.log(`   Hülle (K7) kalt ${r3(hKalt * 1000)} µs · warm Q50 ${r3(hWarm * 1000)} µs · Grundriss-Kette gierig kalt ${r3(gK)} ms · warm Q50 ${r3(gWarm)} ms · Q90 ${r3(gQ90)} ms · erschöpfend warm Q50 ${r3(eWarm)} ms`);
    console.log(`   gerechnet: DORF + 90 Hüllen warm = ${r3(dWarm + 90 * hWarm)} ms (Schwelle 3,5) · DORF + 90 Grundrisse gierig = ${r3(dWarm + 90 * gWarm)} ms`);

    // ── 4. DIE 100: Epoche × Wohlstand × Gewerbe aus dem Samen, dazu ein Kaufmann, ein Haus am Hang, ein Eckhaus ──
    const epo = (y) => (y < 1300 ? "<1300" : y < 1500 ? "1300–1499" : y < 1700 ? "1500–1699" : "≥1700");
    const zellen = {}; for (const z of LE.Z) { const k = epo(z.c.bau) + "·" + z.c.klasse + "·" + z.c.gewerbe; (zellen[k] ||= []).push(z); }
    for (const k of Object.keys(zellen)) zellen[k].sort((a, b) => ax("hundert", a.c.adr) - ax("hundert", b.c.adr));
    const hundert = [], schl = Object.keys(zellen).sort((a, b) => ax("zelle", a) - ax("zelle", b));
    const kaufmann = LE.Z.filter((z) => z.c.gewerbe === "kaufmann" && z.ok).sort((a, b) => ax("hundert", a.c.adr) - ax("hundert", b.c.adr))[0];
    hundert.push(Object.assign({ rolle: "Kaufmann" }, kaufmann));
    for (let r = 0; hundert.length < 98; r++) for (const k of schl) { if (hundert.length >= 98) break; const z = zellen[k][r]; if (z && !hundert.some((h) => h.c.adr === z.c.adr)) hundert.push(z); }
    // Hang und Ecke: die Pläne G tragen weder Gelände noch Block (DORF setzt terrain 0, FC:4436; pl.lose leer) → zwei Lose mit GEWÄHLTEM
    // Merkmal (Hang: Gefälle 15 % quer zur Straße; Ecke: zwei Straßenseiten). Die Kette hat für beide KEINEN Eingang — das ist zu messen.
    const basisHang = LE.Z.find((z) => z.ok && z.c.region === "alpin" && z.c.klasse === 1), basisEck = LE.Z.find((z) => z.ok && z.c.gewerbe === "kraemer" && z.c.klasse >= 1);
    for (const [rolle, z, merk] of [["Hang", basisHang, { gefaelle: 0.15 }], ["Ecke", basisEck, { ecke: true }]]) {
        const c = Object.assign({}, z.c, merk, { adr: z.c.adr + "·" + rolle }), k = kette(c, { druck: true });
        const gleich = k.ok && k.W === z.W && k.D === z.D && k.st === z.st && JSON.stringify(k.R.geschosse.map((G) => G.raeume.map((r) => [r.id, r2(r.u0), r2(r.s0)]))) === JSON.stringify(z.R.geschosse.map((G) => G.raeume.map((r) => [r.id, r2(r.u0), r2(r.s0)])));
        hundert.push(Object.assign({ c, rolle, zwilling: z.c.adr, gleichDemZwilling: gleich }, k));
    }
    // die 100 erschöpfend (A's eigene Belegung), Linse an der Geometrie, HAUS des Kerns mit W/D/st der Kette
    delete process.env.KAP;
    const pl = {}; for (let s = 1; s <= 30; s++) pl["G" + s] = FC.DORF({ seed: s, nH: 90 });
    const nur = Object.assign({}, FC.MASSNUR, { geruest: true });
    const zeilen = []; let a100 = { gueltig: 0, sa: 0, saMut: 0, sb: 0, hausRot: 0, hausGebaut: 0 };
    for (const h0 of hundert) {
        const k = h0.rolle === "Hang" || h0.rolle === "Ecke" ? h0 : Object.assign({ rolle: h0.rolle || null }, kette(h0.c, { druck: true }), { c: h0.c });
        const zl = { adr: k.c.adr, rolle: h0.rolle || null, region: k.c.region, bau: k.c.bau, epoche: epo(k.c.bau), klasse: k.c.klasse, gewerbe: k.c.gewerbe, koepfe: k.c.koepfe, miete: k.c.inwohner, los: k.c.b, druck: k.c.druck, ok: k.ok };
        if (h0.zwilling) { zl.zwilling = h0.zwilling; zl.gleichDemZwilling = h0.gleichDemZwilling; }
        if (!k.ok) { zl.grund = k.grund; zeilen.push(zl); continue; }
        a100.gueltig++;
        const Lm = GP.ortTragwerk(GP.STOFF[k.sn]).Lmax; let su = 0, sm = 0;
        let suO = 0; for (const d of LI.ausGrundriss(k.R)) { const x = LI.spannweiten(d.joists, d.supports, Lm).ueber; if (d.oben) suO += x; else su += x; } su += suO;
        for (const d of LI.mutanteJederStaender(k.R)) sm += LI.spannweiten(d.joists, d.supports, Lm).ueber;
        const sb = LI.staenderTreffer(k.R);
        if (su) a100.sa++; if (sm) a100.saMut++; if (sb.treffer) a100.sb++;
        Object.assign(zl, { W: k.W, D: k.D, st: k.st, st0: k.st0, traufe: k.traufe, stoff: k.sn, Lmax: r2(Lm), n: k.R.n, b: k.R.b.map(r2), s: k.R.s, treppe: k.R.treppe.modus, saUeber: su, saOben: suO, saMutante: sm, sb });
        // das gebaute HAUS (Kern-Kopie) mit W, D, st, gH, Balken der Kette — der Kern kennt keinen Grundriss: er legt heute seine Balken (FC:466–470)
        const plan = pl[planVon(k.c.adr.split("·")[0])], a = +k.c.adr.split("·")[0].split("#")[1], hp = muss(plan.houses[a], "hp " + k.c.adr);
        const T = GP.ortTragwerk(GP.STOFF[k.sn]), gH = R1.geschossH(k.c.bau, T.h);
        const P = Object.assign({}, hp, { W: k.W, D: k.D, storeys: k.st, egH: gH, ogH: gH, foundH: R1.BAU_GESETZ.sockel, balkenB: T.b, balkenH: T.h, keller: 0, annexN: 0, balcony: 0, grundriss: "I", nur });
        const t0 = hr(), HA = FC.HAUS(THREE, FC.mat, P); zl.hausMs = r3(ms(t0));
        const lagen = LI.ausHaus(muss(HA.subsystems && HA.subsystems.geruest, "HAUS.subsystems.geruest"), P); let hu = 0, hs = 0, hmax = 0;
        for (const L of lagen) { const s = LI.spannweiten(L.joists, L.supports, Lm); hu += s.ueber; hs += s.stuecke; hmax = Math.max(hmax, s.maxSpann); }
        zl.haus = { lagen: lagen.length, balken: hs, ueber: hu, maxSpann: r2(hmax) }; a100.hausGebaut++; if (hu) a100.hausRot++;
        zl.R = { s: k.R.s, Lu: k.R.Lu, Ls: k.R.Ls, n: k.R.n, sb: k.R.sb, qa: k.R.qa, wf: k.R.wf, treppe: k.R.treppe, geschosse: k.R.geschosse.map((G) => ({ k: G.k, raeume: G.raeume.map((r) => ({ id: r.id, u0: r.u0, u1: r.u1, s0: r.s0, s1: r.s1, halle: !!r.halle, leer: !!r.leer })), tueren: G.tueren, waende: G.waende, unterzuege: G.unterzuege.map((z) => ({ s: z.s, u0: z.u0, u1: z.u1, wo: z.wo, feld: z.feld })), staender: G.staender })) };
        zeilen.push(zl);
    }
    const n100 = zeilen.length, epoZ = {}, klZ = {}, gwZ = {};
    for (const z of zeilen) { epoZ[z.epoche] = (epoZ[z.epoche] || 0) + 1; klZ[z.klasse] = (klZ[z.klasse] || 0) + 1; gwZ[z.gewerbe] = (gwZ[z.gewerbe] || 0) + 1; }
    console.log(`\nDIE 100 (${n100}; Epoche ${JSON.stringify(epoZ)} · Klasse ${JSON.stringify(klZ)} · Gewerbe ${JSON.stringify(gwZ)})`);
    console.log(`   gültiger Grundriss ${a100.gueltig}/${n100} · S-a Linse am Prototyp: Häuser mit Balken > L_max ${a100.sa} · Mutante „Balken auf jedem Ständer“ ROT in ${a100.saMut} · S-b Treffer ${a100.sb}/${a100.gueltig}`);
    console.log(`   HAUS des Kerns mit den Maßen der Kette: gebaut ${a100.hausGebaut}, Linse ROT (Balken > L_max) in ${a100.hausRot} — das ist die heutige Balkenlage FC:466–470 (die Mutante am Kern)`);
    for (const z of zeilen.filter((z) => z.rolle)) console.log(`   ${z.rolle}: ${z.adr} ${z.region} ${z.bau} ${z.gewerbe}/${z.klasse} Los ${z.los} m Druck ${z.druck} → ${z.ok ? `${z.W}×${z.D}×${z.st} Traufe ${z.traufe} · ${z.s}·${z.n}B·${z.treppe} · S-a ${z.saUeber} · HAUS heute ${z.haus.ueber}/${z.haus.balken} Balken > L_max (max ${z.haus.maxSpann} m)` : "OHNE Grundriss: " + z.grund}${z.zwilling ? ` · Zwilling ${z.zwilling}: ${z.gleichDemZwilling ? "GLEICH (Merkmal ohne Leser)" : "verschieden"}` : ""}`);
    const ohne = zeilen.filter((z) => !z.ok); if (ohne.length) console.log(`   ohne Grundriss in den 100: ${ohne.map((z) => z.adr + " (" + z.grund + ")").join(" · ")}`);
    const hausMs = zeilen.filter((z) => z.hausMs).map((z) => z.hausMs); console.log(`   HAUS (MASSNUR + Gerüst) ms je Haus Q50 ${r3(q(hausMs, 0.5))}`);

    fs.writeFileSync(path.join(D0, "spike-v2-hundert.json"), JSON.stringify(zeilen));
    // die Rohzeilen jedes Laufs (für die Zweitzählung zaehl/spike-v2-zweit.cjs)
    fs.writeFileSync(path.join(D0, "spike-v2-laeufe" + (ERSCH ? "-erschoepfend" : "") + ".json"), JSON.stringify(Object.fromEntries([LE, L0, LH, LB, LK].map((L) => [L.name.split(" ")[0], L.Z.map((z) => z.ok ? [z.c.adr, z.c.druck, z.W, z.D, z.st, z.st0, z.traufe, z.c.b] : [z.c.adr, z.c.druck, null, null, null, null, null, z.c.b, z.grund])]))));
    const aus = { kern: shaK, belegung: ERSCH ? "erschoepfend" : "gierig", laeufe: [LE, L0, LH, LB, LK].map((L) => ({ name: L.name, ausfall: r3(L.ausfall), V: L.V, spearman: r3(L.spearman), spSt: r3(L.spSt), msJeHaus: r3(L.msJeHaus), gruende: L.gruende })),
        huelle: { hOk, fuellt, hOhneG, gOhneH, stUng, dUng }, sb: { haeuser: sbHaus, kurz: sbKurz, n: LE.ok.length, sbT }, sa: { haeuser: saHaus, unten: saUnten, oben: saOben, typ: saTyp, frei: saFrei, mutante: saMut, maxRel: r3(saMax) }, sd: SD,
        se: { imBand, amRaster }, si: { koepfe: r2(mean(KO)), gesinde: r3(GE.reduce((a, b) => a + b, 0) / LEU), miete: r3(MI / (MI + LEU)) },
        sg: { dKalt, dWarm, dWarm1, hKalt, hWarm, gK, gWarm, gQ90, eWarm }, hundert: a100 };
    fs.writeFileSync(path.join(D0, "spike-v2-zahlen" + (ERSCH ? "-erschoepfend" : "") + ".json"), JSON.stringify(aus, null, 1));
})().catch((e) => { console.error(e); process.exit(1); });
