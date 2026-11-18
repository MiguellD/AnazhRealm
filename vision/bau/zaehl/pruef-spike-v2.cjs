// pruef-spike-v2.cjs — GEGENPRÜFUNG des Spike v2 (BAU-ZENSUS Runde 2). Andere Hand als spike-v2.cjs und linse-v2.cjs.
// Lädt die Kette des Spikes (spike-v2.cjs bis vor den Lauf-Block) aus der Arbeitskopie p3/n1811/bau-spike2/pruef-v2/ und prüft:
//   (1) Kern-SHA · (2) Lauf E nachgezählt · (3) sichtbare Vielfalt mit Sichtbarkeits-Rundung (Breite/Tiefe 0,3 m, Traufe 0,2 m),
//   am GLEICHEN Nenner wie heute · (4) S-a unter der Lesart „die oberste Decke trägt das Loch, wenn A dort eine Treppe zeichnet“
//   · (5) S-b nach dem Wortlaut (Podest 0,9 m ab Lauf-Ende, Wand-Ständer zählen) · (6) 50 eigene Paare mit Eingriffs-Test
//   (je verschiedene Ursache EINZELN von b nach a tauschen: welche ändert das sichtbare Maß?) · (7) drei Häuser Statik.
// Aufruf: node pruef-spike-v2.cjs   (liest nur; schreibt nichts außer stdout)
"use strict";
const fs = require("fs"), path = require("path"), crypto = require("crypto"), Module = require("module");
const DIR = path.join(__dirname, "..", "..", "..", "..", "p3", "n1811", "bau-spike2", "pruef-v2");
process.env.KAP = "1"; // gierig wie Lauf E des Spikes
const src = fs.readFileSync(path.join(DIR, "spike-v2.cjs"), "utf8");
const cut = src.indexOf("(async () => {"); if (cut < 0) throw new Error("pruef: Lauf-Block nicht gefunden");
const m = new Module(path.join(DIR, "spike-v2-mod.cjs"), module); m.filename = path.join(DIR, "spike-v2-mod.cjs"); m.paths = Module._nodeModulePaths(DIR);
m._compile(src.slice(0, cut) + "\nmodule.exports = { kette, huelle, vielfalt, C, HS, K, GP, R1, LI, breite, ursachen, shaK, shaO, ax };\n", m.filename);
const S = m.exports, { kette, C, HS, GP, R1, LI } = S;
const r2 = (v) => Math.round(v * 100) / 100, pct = (a, b) => ((100 * a) / b).toFixed(1) + " %";
const q = (a, p) => { const s = a.slice().sort((x, y) => x - y); const i = (s.length - 1) * p, lo = Math.floor(i), hi = Math.ceil(i); return s[lo] + (s[hi] - s[lo]) * (i - lo); };
function fnv(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
const zz = (...t) => (Math.imul(fnv("PRUEFER|" + t.join("|")), 2654435761) >>> 0) / 4294967296; // EIGENER Strom (nicht ax des Spikes)

// (1) Kern
const sha = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");
console.log(`(1) KERN Kopie ${sha(path.join(DIR, "kern", "fachwerk-core.js")).slice(0, 16)} · Original ${sha(path.join(DIR, "..", "..", "..", "..", "n1011-hg", "fachwerk-core.js")).slice(0, 16)}`);

// (2) Lauf E
const Z = C.map((c) => Object.assign({ c }, kette(c, { druck: true }))), ok = Z.filter((z) => z.ok);
console.log(`(2) LAUF E gültig ${ok.length}/${Z.length}`);

// (3) sichtbare Vielfalt: Klasse = round(x / Schritt) — zwei Werte, die sich um < Schritt unterscheiden, fallen meist in dieselbe Klasse
const kl = (x, s) => Math.round(x / s);
function sicht(L, opt) {
    const form = (h) => kl(h.W, 0.3) + "x" + kl(h.D, 0.3) + "x" + h.st + (opt.traufe ? "x" + kl(h.traufe, 0.2) : ""), pp = {};
    for (const h of L) (pp[h.plan] ||= []).push(form(h));
    const modal = (a) => { const c = {}; for (const x of a) c[x] = (c[x] || 0) + 1; return Math.max(...Object.values(c)) / a.length; };
    const T = L.map((h) => h.traufe);
    return `n ${L.length} · Formen ${new Set(L.map(form)).size} · Breiten ${new Set(L.map((h) => kl(h.W, 0.3))).size} · Spanne ${r2(q(T, 0.9) - q(T, 0.1))} · häufigste Q50 ${(100 * q(Object.values(pp).map(modal), 0.5)).toFixed(1)} %`;
}
const traufeHeute = (st) => 0.55 + 2.55 + 2.35 * (st - 1); // stadt-b.cjs:113 (pool.cjs:103) ohne pilotis
const heuteAlle = HS.map((h) => ({ plan: h.adr.split("#")[0], W: h.heute[0], D: h.heute[1], st: h.heute[2], traufe: traufeHeute(h.heute[2]) }));
const okAdr = new Set(ok.map((z) => z.c.adr));
const heuteGleich = heuteAlle.filter((h, i) => okAdr.has(HS[i].adr));
const kette1 = ok.map((z) => ({ plan: z.c.plan, W: z.W, D: z.D, st: z.st, traufe: z.traufe }));
const ketteVernunft = kette1.filter((h) => h.W <= 20 && h.W / h.D <= 5);
const ketteHeuteBand = kette1.filter((h) => h.W >= 5 && h.W <= 15);
console.log("(3) SICHTBAR (Breite/Tiefe Klasse 0,3 m, Traufe 0,2 m):");
console.log("    heute alle 2 595          " + sicht(heuteAlle, {}));
console.log("    heute an den Losen, die die Kette baut " + sicht(heuteGleich, {}));
console.log("    Kette E (gültig)          " + sicht(kette1, {}));
console.log("    Kette E ohne W>20, W/D>5  " + sicht(ketteVernunft, {}));
console.log("    Kette E nur W 5–15 m      " + sicht(ketteHeuteBand, {}));
console.log("    mit Traufe in der Form: heute " + sicht(heuteAlle, { traufe: true }).split("·")[1] + " · Kette " + sicht(kette1, { traufe: true }).split("·")[1]);
const tVals = new Set(ok.map((z) => kl(z.traufe, 0.2))).size, tRoh = new Set(ok.map((z) => z.traufe)).size;
console.log(`    Traufe-Werte roh ${tRoh} · sichtbar (0,2 m) ${tVals} · heute sichtbar ${new Set(heuteAlle.map((h) => kl(h.traufe, 0.2))).size}`);

// (4) S-a: Lesart „Loch auch in der obersten Decke“ (A zeichnet in JEDEM Geschoss die Treppe, auch bei st = 1; A's pruefe GP:478 so)
let saLinse = 0, saOben1 = 0, saLesartI = 0, st1Treppe = 0;
for (const z of ok) {
    const Lm = GP.ortTragwerk(GP.STOFF[z.sn]).Lmax; let u = 0, uI = 0;
    for (const d of LI.ausGrundriss(z.R)) u += LI.spannweiten(d.joists, d.supports, Lm).ueber;
    const RI = Object.assign({}, z.R, { st: z.R.st + 1 }); // dieselbe Linse, aber jede Decke gilt als „mit Loch“ (G.k < st)
    for (const d of LI.ausGrundriss(RI)) uI += LI.spannweiten(d.joists, d.supports, Lm).ueber;
    if (u) { saLinse++; if (z.R.st === 1) saOben1++; } if (uI) saLesartI++;
    if (z.R.st === 1 && z.R.treppe) st1Treppe++;
}
console.log(`(4) S-a Linse wie Spike ${saLinse} (davon Grund-Geschosse st0 = 1: ${saOben1}) · Lesart „oberste Decke mit Loch“ ${saLinse === 0 ? 0 : saLesartI} · Häuser st0 = 1 mit gezeichneter Treppe ${st1Treppe}/${ok.filter((z) => z.R.st === 1).length}`);

// (5) S-b nach Wortlaut: Treffer ∪ Wand-Ständer im Podest 0,9 m ab Lauf-Ende
let sbSpike = 0, sbWort = 0, podLicht = [];
for (const z of ok) { const k = LI.staenderTreffer(z.R); if (k.treffer) sbSpike++; if (k.treffer || k.wandInsPodest) sbWort++; }
console.log(`(5) S-b Spike ${sbSpike}/${ok.length} = ${pct(sbSpike, ok.length)} · Wortlaut (Wand-Ständer im Podest zählen) ${sbWort}/${ok.length} = ${pct(sbWort, ok.length)}`);

// (6) 50 eigene Paare, Eingriffs-Test
const URS = ["U", "f", "b", "region", "gewerbe", "klasse", "wohl", "kern", "gesinde", "koepfe", "inwohner", "bau", "aufst", "druck"];
const WELT = new Set(["region", "gewerbe", "klasse", "wohl", "druck", "U"]); // aus Plan/Rang/Lage/Lokator; der Rest sind Ströme ax(name, adr) in stadt-b.cjs:205–219
const byPlan = {}; ok.forEach((z) => (byPlan[z.c.plan] ||= []).push(z));
const sichtbarDiff = (A, B) => ["W", "D"].filter((k) => Math.abs(A[k] - B[k]) >= 0.3).concat(A.st !== B.st ? ["st"] : [], Math.abs(A.traufe - B.traufe) >= 0.2 ? ["traufe"] : []);
const paare = []; let j = 0;
while (paare.length < 50) { const a = ok[Math.floor(zz("a", j) * ok.length)], P = byPlan[a.c.plan], b = P[Math.floor(zz("b", j) * P.length)]; j++; if (a.c.adr !== b.c.adr) paare.push([a, b]); }
let sichtbar = 0, unsichtbar = 0, erklaertEinzeln = 0, nurKombi = 0, nichtErklaert = 0, alleTausch = 0, nurStrom = 0, mitWelt = 0; const tr = {}, zeilen = [];
for (const [A, B] of paare) {
    const d = sichtbarDiff(A, B); if (!d.length) { unsichtbar++; continue; } sichtbar++;
    const vers = URS.filter((x) => JSON.stringify(A.c[x]) !== JSON.stringify(B.c[x]));
    const wirk = [];
    for (const x of vers) { const c2 = Object.assign({}, A.c, { [x]: B.c[x] }); const k = kette(c2, { druck: true }); if (!k.ok || sichtbarDiff(A, k).length) wirk.push(x); }
    const ganz = kette(Object.assign({}, B.c, { adr: A.c.adr }), { druck: true }); if (ganz.ok && !sichtbarDiff(B, ganz).length) alleTausch++;
    if (wirk.length) erklaertEinzeln++; else if (ganz.ok && !sichtbarDiff(B, ganz).length) nurKombi++; else nichtErklaert++;
    for (const x of wirk) tr[x] = (tr[x] || 0) + 1;
    if (wirk.length && wirk.every((x) => !WELT.has(x))) nurStrom++; if (wirk.some((x) => WELT.has(x))) mitWelt++;
    if (zeilen.length < 12) zeilen.push(`      ${A.c.adr}↔${B.c.adr}: ${A.W}×${A.D}×${A.st}/${A.traufe} ↔ ${B.W}×${B.D}×${B.st}/${B.traufe} · sichtbar ${d.join(",")} · verschieden ${vers.length} · wirksam einzeln ${wirk.join(",") || "—"}`);
}
console.log(`(6) 50 PAARE (eigener Strom, beide gültig, derselbe Plan): sichtbar verschieden ${sichtbar} · unter der Schwelle ${unsichtbar}`);
console.log(`    Eingriff: ≥ 1 Ursache allein ändert das Sichtbare ${erklaertEinzeln} · nur alle zusammen ${nurKombi} · nicht erklärt ${nichtErklaert} · alle Ursachen getauscht = B ${alleTausch}/${sichtbar}`);
console.log(`    wirksame Ursachen (Häufigkeit): ${JSON.stringify(Object.fromEntries(Object.entries(tr).sort((a, b) => b[1] - a[1])))}`);
console.log(`    Paare, deren wirksame Ursachen NUR Adress-Ströme sind (f, b, bau, aufst, kern, gesinde, koepfe, inwohner): ${nurStrom}/${sichtbar} · mit ≥ 1 Welt-Ursache (region, gewerbe, klasse, wohl, druck, U): ${mitWelt}/${sichtbar}`);
console.log(zeilen.join("\n"));
// Schwellen-Empfindlichkeit: ändert ein Schritt Druck ± 0,01 (die Rundung K8) das Sichtbare?
let kipp = 0; for (const z of ok) { for (const dd of [-0.01, 0.01]) { const k = kette(Object.assign({}, z.c, { druck: Math.min(1, Math.max(0.5, r2(z.c.druck + dd))) }), { druck: true }); if (!k.ok || sichtbarDiff(z, k).length) { kipp++; break; } } }
console.log(`    Druck ± 0,01 kippt das Sichtbare (oder die Gültigkeit) in ${kipp}/${ok.length} = ${pct(kipp, ok.length)} Häusern`);

// (7) Statik von Hand — die Zahlen, gegen die die Hand-Rechnung im Blatt steht
for (const s of ["eiche", "nadel"]) { const T = GP.ortTragwerk(GP.STOFF[s]); console.log(`(7) ${s}: b ${T.b.toFixed(4)} h ${T.h.toFixed(4)} L_max ${T.Lmax.toFixed(3)} (inst ${R1.balkenSpann(T.b, T.h, T.holz, 0.85, 1.5, 2).lInst.toFixed(3)} fin ${R1.balkenSpann(T.b, T.h, T.holz, 0.85, 1.5, 2).lFin.toFixed(3)} bieg ${R1.balkenSpann(T.b, T.h, T.holz, 0.85, 1.5, 2).lBieg.toFixed(3)})`); }
for (const adr of ["G20#28", "G4#10", "G1#24", "G19#82"]) {
    const z = Z.find((x) => x.c.adr === adr); if (!z || !z.ok) { console.log("    " + adr + " ungültig"); continue; }
    const T = GP.ortTragwerk(GP.STOFF[z.sn]);
    console.log(`    ${adr} ${z.c.region} ${z.c.bau} ${z.sn} s=${z.R.s} Lu ${r2(z.R.Lu)} Ls ${r2(z.R.Ls)} b ${z.R.b.map(r2).join("/")} sb ${z.R.sb.map(r2).join("/")} st0 ${z.R.st} st ${z.st} traufe ${z.traufe} D ${z.D} · Treppe ${z.R.treppe.modus} u ${r2(z.R.treppe.u0)}–${r2(z.R.treppe.u1)} s ${r2(z.R.treppe.s0)}–${r2(z.R.treppe.s1)} N ${z.R.treppe.N} rise ${r2(z.R.treppe.rise)} go ${r2(z.R.treppe.go)} · gH ${R1.geschossH(z.c.bau, T.h).toFixed(4)} · aufst ${JSON.stringify(z.c.aufst)}`);
    for (const G of z.R.geschosse) console.log(`       G${G.k} Unterzüge ${G.unterzuege.map((u) => "s " + r2(u.s) + " u " + r2(u.u0) + "–" + r2(u.u1)).join("; ")} · tragende u-Wände ${G.waende.filter((w) => w.dir === "u" && w.tragend).map((w) => r2(w.at) + ":" + r2(w.a0) + "–" + r2(w.a1)).join("; ")}`);
}
