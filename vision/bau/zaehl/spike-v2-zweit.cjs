// spike-v2-zweit.cjs — ZWEITZÄHLUNG des Spike v2 (vision/bau/v2/spike-v2.md) mit eigenem Code aus den Rohzeilen.
// Liest p3/n1811/bau-spike2/v2spike/spike-v2-laeufe.json (je Lauf und Los: adr, Druck, W, D, st, st0, Traufe, Los-Breite, Grund) und
// stadt-v2-haeuser-m03.json (B, Miete 0,3), zählt S-c, S-f, S-h, S-e, S-i neu und vergleicht mit spike-v2-zahlen.json — wirft bei Abweichung.
// Zusätzlich (nicht im Spike gedruckt): Anteil der Häuser mit aufgestockten Geschossen OHNE Grundriss (st > st0).
// Aufruf (aus AnazhRealm-OMEN): node koordination/vision/bau/zaehl/spike-v2-zweit.cjs
"use strict";
const fs = require("fs"), path = require("path");
const S = path.join(__dirname, "..", "..", "..", "..", "p3", "n1811", "bau-spike2", "v2spike");
const lies = (f) => { const p = path.join(S, f); if (!fs.existsSync(p)) throw new Error("spike-v2-zweit: fehlt " + p); return JSON.parse(fs.readFileSync(p, "utf8")); };
const L = lies("spike-v2-laeufe.json"), Z = lies("spike-v2-zahlen.json"), H = lies("stadt-v2-haeuser-m03.json");
if (H.length !== 2595) throw new Error("spike-v2-zweit: 2 595 Lose erwartet");
// Quantil linear (wie stadt-proto.cjs:20), Ränge mit Bindungen gemittelt
function quantil(werte, p) { const a = [...werte].sort((x, y) => x - y), i = (a.length - 1) * p, u = Math.floor(i), o = Math.ceil(i); return a[u] + (a[o] - a[u]) * (i - u); }
function rang(werte) { const idx = werte.map((v, i) => i).sort((x, y) => werte[x] - werte[y]), r = Array(werte.length); let i = 0;
    while (i < idx.length) { let j = i; while (j + 1 < idx.length && werte[idx[j + 1]] === werte[idx[i]]) j++; for (let k = i; k <= j; k++) r[idx[k]] = (i + j) / 2 + 1; i = j + 1; } return r; }
function korrelation(x, y) { const n = x.length; let sx = 0, sy = 0; for (let i = 0; i < n; i++) { sx += x[i]; sy += y[i]; } const mx = sx / n, my = sy / n;
    let c = 0, vx = 0, vy = 0; for (let i = 0; i < n; i++) { c += (x[i] - mx) * (y[i] - my); vx += (x[i] - mx) ** 2; vy += (y[i] - my) ** 2; } return c / Math.sqrt(vx * vy); }
const gl = (a, b, eps) => Math.abs(a - b) <= eps;
let rot = 0;
for (const [name, zeilen] of Object.entries(L)) {
    if (zeilen.length !== 2595) throw new Error("spike-v2-zweit: Lauf " + name + " hat " + zeilen.length + " Zeilen");
    const ok = zeilen.filter((z) => z[2] !== null), ausfall = 1 - ok.length / zeilen.length;
    const formen = new Set(), breiten = new Set(), jePlan = new Map();
    for (const z of ok) { const f = z[2] + "x" + z[3] + "x" + z[4]; formen.add(f); breiten.add(z[2]); const p = z[0].split("#")[0]; if (!jePlan.has(p)) jePlan.set(p, new Map()); const m = jePlan.get(p); m.set(f, (m.get(f) || 0) + 1); }
    const anteile = [...jePlan.values()].map((m) => { let n = 0, mx = 0; for (const v of m.values()) { n += v; if (v > mx) mx = v; } return mx / n; });
    const tr = ok.map((z) => z[6]), spanne = quantil(tr, 0.9) - quantil(tr, 0.1), modal = quantil(anteile, 0.5);
    const sp = korrelation(rang(tr), rang(ok.map((z) => z[1])));
    const aufg = ok.filter((z) => z[4] > z[5]).length, band = ok.filter((z) => z[2] > 20).length;
    const ref = Z.laeufe.find((x) => x.name.split(" ")[0] === name); if (!ref) throw new Error("spike-v2-zweit: Lauf " + name + " fehlt in spike-v2-zahlen.json");
    const gleich = gl(ausfall, ref.ausfall, 0.0006) && formen.size === ref.V.formen && breiten.size === ref.V.breiten && gl(spanne, ref.V.spanne, 0.006) && gl(modal * 100, ref.V.modalQ50, 0.051) && gl(sp, ref.spearman, 0.0006);
    if (!gleich) rot++;
    console.log(`Lauf ${name.padEnd(2)} ohne Grundriss ${(100 * ausfall).toFixed(1)} % · Formen ${formen.size} · Breiten ${breiten.size} · Traufe-Spanne ${spanne.toFixed(2)} m · häufigste Form Q50 ${(100 * modal).toFixed(1)} % · Spearman(Traufe, Druck) ${sp.toFixed(3)} · aufgestockt ohne Grundriss ${aufg}/${ok.length} · W > 20 m ${band} → ${gleich ? "GLEICH" : "UNGLEICH"} dem Spike`);
}
// S-e und S-i aus der Haus-Liste von B
const imBand = H.filter((h) => h.los.f >= 0.75 && h.los.f <= 2.5).length;
const amRaster = H.filter((h) => { const x = (h.los.b / h.los.U) * 4; return (Math.abs(x - Math.round(x)) * h.los.U) / 4 <= 0.5; }).length;
let k = 0, g = 0, m = 0; for (const h of H) { k += h.H.koepfe; g += h.H.gesinde; m += 3 * h.H.inwohner; }
console.log(`S-e im Band ¾–2½ ${imBand} · am Raster ± 0,5 m ${amRaster} → ${imBand === Z.se.imBand && amRaster === Z.se.amRaster ? "GLEICH" : "UNGLEICH"}`);
const si = { koepfe: k / 2595, gesinde: g / k, miete: m / (m + k) };
console.log(`S-i Köpfe Ø ${si.koepfe.toFixed(2)} · Gesinde ${(100 * si.gesinde).toFixed(1)} % · Miete ${(100 * si.miete).toFixed(1)} % → ${gl(si.koepfe, Z.si.koepfe, 0.006) && gl(si.gesinde, Z.si.gesinde, 0.0006) && gl(si.miete, Z.si.miete, 0.0006) ? "GLEICH" : "UNGLEICH"}`);
if (rot) throw new Error("spike-v2-zweit: " + rot + " Läufe UNGLEICH");
console.log("ZWEITZÄHLUNG GRÜN");
