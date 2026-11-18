// ascii.cjs — drei Häuser der 100 (Kaufmann, Hang, Ecke) als ASCII-Grundriss des EG mit Balkenfeldern (aus spike-v2-hundert.json).
// Raster 0,5 m. u nach rechts (s='z': längs der Straße), s nach unten (s = 0 Straße). Zeichen: # Außenwand · = tragende Bandwand ·
// | Querwand · : Flurwand (trägt nicht) · ~ Unterzug · o Ständer · T Treppenloch · Lücke in einer Wand = Tür.
// Darunter die Balkenlage der Decke über dem EG und der obersten Decke: je Balken-Lage u die größte Spannweite (Linse-v2), ! = über L_max.
"use strict";
const fs = require("fs"), path = require("path"), LI = require("./linse-v2.cjs");
const Z = JSON.parse(fs.readFileSync(path.join(__dirname, "spike-v2-hundert.json"), "utf8"));
const r2 = (v) => Math.round(v * 100) / 100, F = 0.5;
for (const rolle of ["Kaufmann", "Hang", "Ecke"]) {
    const z = Z.find((x) => x.rolle === rolle); if (!z) throw new Error("ascii: keine Zeile " + rolle);
    if (!z.ok) { console.log(`\n${rolle} ${z.adr}: OHNE Grundriss — ${z.grund}`); continue; }
    const R = z.R, G = R.geschosse[0], nu = Math.round(R.Lu / F) + 1, ns = Math.round(R.Ls / F) + 1;
    const g = Array.from({ length: ns }, () => Array(nu).fill(" "));
    const set = (u, s, c) => { const i = Math.round(s / F), j = Math.round(u / F); if (i >= 0 && i < ns && j >= 0 && j < nu) g[i][j] = c; };
    for (const r of G.raeume) { const tag = (r.leer ? "--" : r.id.slice(0, 5)); const i = Math.round((r.s0 + r.s1) / 2 / F), j0 = Math.round((r.u0 + r.u1) / 2 / F) - Math.floor(tag.length / 2); for (let k = 0; k < tag.length; k++) if (g[i] && j0 + k > 0 && j0 + k < nu - 1) g[i][j0 + k] = tag[k]; }
    const t = R.treppe; for (let u = t.u0; u <= t.u1 + 1e-6; u += F / 2) for (let s = t.s0; s <= t.s1 + 1e-6; s += F / 2) set(u, s, "T");
    for (const w of G.waende) { const c = w.art === "aussen" ? "#" : w.tragend ? "=" : w.art === "flur" ? ":" : "|"; for (let a = w.a0; a <= w.a1 + 1e-6; a += F / 2) w.dir === "u" ? set(a, w.at, c) : set(w.at, a, c); }
    for (const uz of G.unterzuege) for (let a = uz.u0; a <= uz.u1 + 1e-6; a += F / 2) set(a, uz.s, "~");
    for (const d of G.tueren) for (let a = d.c - d.w / 2 + 0.1; a <= d.c + d.w / 2 - 0.1 + 1e-6; a += F / 2) d.dir === "s" ? set(d.at, a, " ") : set(a, d.at, " ");
    for (const p of G.staender) set(p.u, p.s, "o");
    console.log(`\n${rolle} — ${z.adr} · ${z.region} · Baujahr ${z.bau} · ${z.gewerbe}/Klasse ${z.klasse} · ${z.koepfe} Köpfe · Miete ${z.miete} · Los ${z.los} m · Druck ${z.druck}`);
    console.log(`   Haus ${z.W} × ${z.D} m × ${z.st} Geschosse (Grund ${z.st0}) · Traufe ${z.traufe} m · Stoff ${z.stoff} L_max ${z.Lmax} m · s='${R.s}' · ${R.n} Bänder ${z.b.join(" + ")} m · Treppe ${t.modus}${t.spar ? "-spar" : ""}` + (z.zwilling ? ` · Zwilling ${z.zwilling} ohne Merkmal: ${z.gleichDemZwilling ? "GLEICH" : "verschieden"}` : ""));
    console.log("   EG (Raster 0,5 m; Straße oben, s = 0):");
    for (const row of g) console.log("   " + row.join(""));
    // Balkenfelder je Band: Spannrichtung s, Feld = Bandbreite
    for (let j = 0; j < R.n; j++) console.log(`   Balkenfeld Band ${j}: s ${r2(R.sb[j])}–${r2(R.sb[j + 1])} m · Spann ${r2(R.sb[j + 1] - R.sb[j])} m · Balken in s, e 0,85 m`);
    const RR = Object.assign({}, R, { st: R.geschosse.length }); const Lm = z.Lmax;
    for (const d of LI.ausGrundriss(RR)) {
        if (d.k !== 0 && !d.oben) continue;
        const line = []; for (let u = 0.425; u < R.Lu; u += 0.85) { const js = d.joists.filter((x) => Math.abs(x.u - u) < 1e-6); let sp = 0; for (const j of js) sp = Math.max(sp, LI.spannweiten([j], d.supports, Lm).maxSpann); line.push(sp > Lm + 1e-6 ? "!" : sp > 0 ? "·" : " "); }
        const ueber = LI.spannweiten(d.joists, d.supports, Lm);
        console.log(`   Decke über G${d.k}${d.oben ? " (oberste)" : ""}: ${ueber.stuecke} Balken-Stücke, über L_max ${ueber.ueber}, größte Spannweite ${r2(ueber.maxSpann)} m   [${line.join("")}]`);
    }
}
