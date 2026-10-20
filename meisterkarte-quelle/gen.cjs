#!/usr/bin/env node
// Meisterkarte 2.0 — Generator.  build: src/*.js -> meisterkarte.json + MEISTERKARTE.md
//                                render [json]: json -> MEISTERKARTE.md   ·   check [json]: Summen, Staffeln, EINE Hebel-Tafel
"use strict";
const fs = require("fs");
const path = require("path");
const DIR = __dirname;

const de = (x, d = 2) => x.toFixed(d).replace(".", ",");
const halb = (x) => { const g = Math.floor(x), r = x - g; if (r === 0) return String(g); if (Math.abs(r - 0.5) < 1e-9) return (g ? String(g) : "") + "½"; return de(x, 1); };
const tage = (t) => (t[0] === t[1] ? halb(t[0]) : halb(t[0]) + "–" + halb(t[1])) + " d";
const mitte = (t) => (t[0] + t[1]) / 2;
const esc = (s) => String(s).replace(/\|/g, "\\|");
const hatPflicht = (pf) => !!pf && !/^\s*—/.test(pf);
const pflichtTraegt = (pf, P) => hatPflicht(pf) && new RegExp("(^|[\\s·(])" + P + "($|[\\s·(;])").test(pf.replace(/Last:[^;]*/g, ""));

function bauen() {
  const meta = require(path.join(DIR, "src/meta.js"));
  const gruppen = ["g1", "g2", "g3", "g4", "g5", "g6"].map((g) => require(path.join(DIR, "src", g + ".js")));
  const bereiche = [];
  const gr = [];
  for (const g of gruppen) {
    gr.push({ key: g.gruppe.key, titel: g.gruppe.titel, intro: g.gruppe.intro, bereiche: g.bereiche.map((b) => b.key) });
    for (const b of g.bereiche) {
      bereiche.push({
        key: b.key, titel: b.titel, gruppe: g.gruppe.key, punkte: b.kriterien.reduce((s, k) => s + k.punkte, 0),
        pfad: b.v1, dateien: b.dom, aaaa: b.aaaa, beste: b.beste,
        kriterien: b.kriterien.map((k) => ({ name: k.name, punkte: k.punkte, staffel: k.staffel, messung: k.messung, beleg: k.beleg, schlupfloch: k.schlupfloch, ...(k.aenderung ? { aenderung: k.aenderung } : {}) })),
        hebel: b.hebel.map((h) => {
          const p = h.k.reduce((s, x) => s + Number(x.split("+")[1]), 0);
          return { name: h.name, bewegt: h.k, punkte: p, tage: h.t, p_je_tag: +(p / mitte(h.t)).toFixed(2), wurzel: h.wurzel, pflicht: h.pflicht, v1: !!h.v1, ...(h.bedingt ? { bedingt: true } : {}), ...(h.oeffnet ? { oeffnet: h.oeffnet } : {}) };
        }),
        feststeck: b.feststeck
      });
    }
  }
  const summe = bereiche.reduce((s, b) => s + b.punkte, 0);
  const j = {
    stand: meta.stand, kopf: meta.kopf, version: meta.version, skala: "2.0", summe, max: bereiche.length * 10,
    gruppen: gr.map((g) => ({ key: g.key, titel: g.titel, summe: bereiche.filter((b) => b.gruppe === g.key).reduce((s, b) => s + b.punkte, 0), max: g.bereiche.length * 10, bereiche: g.bereiche, intro: g.intro })),
    bereiche,
    buergschaft: meta.buergschaft,
    messschuld: meta.messschuld.map(([id, kriterium, messung, erwartung]) => ({ id, kriterium, messung, erwartung })),
    top5: [],
    verlauf: [
      ...meta.verlaufAlt.map((v) => ({ skala: "1.0", max: 90, ...v })),
      { stand: meta.stand, kopf: meta.kopf, summe, max: bereiche.length * 10, skala: "2.0", was: meta.verlaufNeuWas }
    ],
    text: {
      titel: meta.titel, einleitung: meta.einleitung, aaaaKopf: meta.aaaaKopf, regeln: meta.regeln, feststeck: meta.feststeck,
      messschuldErwartung: meta.messschuldErwartung, ohneBereich: meta.ohneBereich, befundeB: meta.befundeB, fehlendB: meta.fehlendB,
      befundeV: meta.befundeV, fehlendV: meta.fehlendV, aenderungen: meta.aenderungen, nachziehen: meta.nachziehen, nichtWeiss: meta.nichtWeiss
    }
  };
  j.top5 = top(j, (h) => h.v1 && !h.bedingt, 5).map((x) => ({ bereich: x.b.key, hebel: x.h.name, bewegt: x.h.bewegt, punkte: x.h.punkte, tage: x.h.tage, p_je_tag: x.h.p_je_tag, pflicht: x.h.pflicht }));
  return j;
}

function alleHebel(j) { const out = []; for (const b of j.bereiche) b.hebel.forEach((h, i) => out.push({ b, h, i })); return out; }
function top(j, filt, n) {
  return alleHebel(j).filter((x) => filt(x.h)).sort((a, c) =>
    c.h.p_je_tag - a.h.p_je_tag || (hatPflicht(c.h.pflicht) - hatPflicht(a.h.pflicht)) || ((c.h.oeffnet || 0) - (a.h.oeffnet || 0)) || c.h.punkte - a.h.punkte).slice(0, n);
}

function pruefen(j) {
  const f = [];
  const keys = new Set();
  let sk = 0, sb = 0;
  for (const b of j.bereiche) {
    if (keys.has(b.key)) f.push("Schlüssel doppelt: " + b.key);
    keys.add(b.key);
    if (b.kriterien.length !== 5) f.push(b.key + ": " + b.kriterien.length + " Kriterien statt 5");
    const s = b.kriterien.reduce((x, k) => x + k.punkte, 0);
    if (s !== b.punkte) f.push(b.key + ": Bereich " + b.punkte + " ≠ Σ Kriterien " + s);
    sb += b.punkte; sk += s;
    b.kriterien.forEach((k, i) => {
      if (![0, 1, 2].includes(k.punkte)) f.push(b.key + " K" + (i + 1) + ": Punkte " + k.punkte);
      for (const fld of ["staffel", "messung", "beleg", "schlupfloch"]) if (!k[fld] || String(k[fld]).length < 20) f.push(b.key + " K" + (i + 1) + ": " + fld + " fehlt");
      if (k.staffel && !/1 =/.test(k.staffel)) f.push(b.key + " K" + (i + 1) + ": Staffel ohne 1-Stufe");
    });
    if (!b.aaaa || !b.beste || b.beste.length < 3) f.push(b.key + ": 10/10 oder die Besten fehlen");
  }
  if (sb !== j.summe || sk !== j.summe) f.push("Summe " + j.summe + " ≠ Σ Bereiche " + sb + " / Σ Kriterien " + sk);
  if (j.max !== j.bereiche.length * 10) f.push("max falsch");
  const gsum = j.gruppen.reduce((s, g) => s + g.summe, 0);
  if (gsum !== j.summe) f.push("Σ Gruppen " + gsum + " ≠ Summe");
  // EINE Hebel-Tafel: je Kriterium Σ Δ ≤ 2 − heute
  const delta = {};
  for (const { b, h } of alleHebel(j)) for (const x of h.bewegt) {
    const m = /^([a-z]+)\.K([1-5])\+([12])$/.exec(x);
    if (!m) { f.push(b.key + " Hebel „" + h.name + "“: bewegt unlesbar " + x); continue; }
    const zb = j.bereiche.find((y) => y.key === m[1]);
    if (!zb) { f.push(b.key + " Hebel: unbekannter Bereich " + m[1]); continue; }
    const id = m[1] + ".K" + m[2];
    delta[id] = (delta[id] || 0) + Number(m[3]);
    const heute = zb.kriterien[Number(m[2]) - 1].punkte;
    if (delta[id] > 2 - heute) f.push("Hebel-Tafel: " + id + " bekommt Σ Δ " + delta[id] + " > 2 − " + heute);
  }
  const last = j.verlauf[j.verlauf.length - 1];
  if (last.summe !== j.summe || last.max !== j.max) f.push("Verlauf-Ende ≠ Summe");
  return { fehler: f, delta };
}

function kName(j, id) { const [bk, kk] = id.split(".K"); const b = j.bereiche.find((x) => x.key === bk); return (b ? kurz(b) : bk) + " K" + kk; }
const KURZ = { gelaende: "Gelände", wetter: "Wetter", physik: "Physik", stoffe: "Stoffe", feld: "Feld", vegetation: "Vegetation", tiere: "Tiere", oekologie: "Ökologie", mensch: "Menschen", affekt: "Affekt", haar: "Haar", luftwasser: "Luft/Wasser", licht: "Licht", ferne: "Ferne", material: "Material", schatten: "Schatten", lod: "LOD", studios: "Studios", pipeline: "Pipeline", ki: "KI", bauen: "Bauen", tore: "Tore", fahrzeug: "Fahrzeug", siedlung: "Siedlung", leib: "Leib", halten: "Halten", spielgang: "Spielgang", ultiversum: "Ultiversum", ankunft: "Ankunft", streaming: "Streaming", profiband: "Profiband", klang: "Klang", speicher: "Speicher" };
function kurz(b) { return KURZ[b.key] || b.titel.split(/ — | \(/)[0]; }
function lang(b) { return b.titel.split(/ — | \(/)[0]; }
function bewegtText(j, arr) { const by = {}; for (const x of arr) { const [id, d] = x.split("+"); const [bk, kk] = id.split(".K"); (by[bk] = by[bk] || []).push("K" + kk + " +" + d); } return Object.entries(by).map(([bk, v]) => kurz(j.bereiche.find((y) => y.key === bk)) + " " + v.join(" · ")).join("; "); }

function render(j) {
  const T = j.text;
  const L = [];
  const P = (s = "") => L.push(s);
  const idx = {}; j.bereiche.forEach((b, i) => (idx[b.key] = i + 1));
  P("# " + T.titel); P();
  for (const s of T.einleitung) if (s) { P(s); P(); }
  P("---"); P();
  P("## Was AnazhRealm im AAAA-Zustand ist"); P();
  for (const s of T.aaaaKopf) { P(s); P(); }
  P("## Das Gesetz der Belohnung — die Regeln jedes Kriteriums"); P();
  for (const [r, t] of T.regeln) P("- **" + r + ".** " + t);
  P(); P("---"); P();
  const alt = j.verlauf.filter((v) => v.skala === "1.0");
  const a = alt[alt.length - 1];
  const neu = j.verlauf.filter((v) => v.skala === "2.0");
  const tag = (v) => v.stand.slice(8, 10) + "." + v.stand.slice(5, 7) + ".";
  P("## Punktestand: " + j.summe + " / " + j.max); P();
  P("Verlauf — alte Skala (9 Bereiche, max 90): " + alt.map((v) => tag(v) + " " + v.summe).join(" · ") + " (letzter Stand " + a.summe + "/90 an " + a.kopf + "). Neue Skala (" + j.bereiche.length + " Bereiche, max " + j.max + "): " + neu.map((v, i) => (i === neu.length - 1 ? tag(v) + " **" + v.summe + "/" + v.max + "** an " + v.kopf : tag(v) + " " + v.summe + " an " + v.kopf)).join(" · ") + ". " + T.messschuldErwartung);
  P();
  for (const v of neu.slice(1)) P("- **" + tag(v) + " " + v.kopf + " — " + v.summe + "/" + v.max + ".** " + v.was);
  if (neu.length > 1) P();
  P("| # | Bereich | Punkte | K1 | K2 | K3 | K4 | K5 | Pfad · Pflicht | nächster Hebel (P/d) |");
  P("|---|---|---|---|---|---|---|---|---|---|");
  for (const g of j.gruppen) {
    P("| | **" + esc(g.titel.split(" — ")[0]) + "** | **" + g.summe + "**/" + g.max + " | | | | | | | |");
    for (const bk of g.bereiche) {
      const b = j.bereiche.find((x) => x.key === bk);
      const nh = [...b.hebel].filter((x) => !x.bedingt).sort((x, y) => y.p_je_tag - x.p_je_tag)[0];
      P("| " + idx[b.key] + " | " + esc(lang(b)) + " | **" + b.punkte + "**/10 | " + b.kriterien.map((k) => k.punkte).join(" | ") + " | " + esc(b.pfad) + " | " + (nh ? esc(nh.name.split(":")[0]) + " (+" + nh.punkte + " · " + tage(nh.tage) + " · " + de(nh.p_je_tag) + ")" : "—") + " |");
    }
  }
  P();
  P("Die Summe ist Σ Bereiche = Σ Kriterien = " + j.summe + " (`gen.cjs check`). Die Bürgschaft (Richter, A-Matrix, Spiegel) zählt nicht in die Summe.");
  P(); P("---"); P();
  P("## TOP-5 nach Punkten je Tag"); P();
  P("Auswahl: Hebel mit Welt-Byte auf dem v1-Pfad oder mit Pflicht (Feature-Stopp bis v1.0), ohne bedingte; Rang = Punkte ÷ Mitte des Aufwands; bei Gleichstand zuerst die Pflicht, dann, was mehr Hebel öffnet, dann die höhere Punktzahl. Punkte zählen nur in den Heim-Kriterien (R7). Vor jedem Schnitt steht seine Messschuld am Ort (Gebot 6).");
  P();
  P("| # | Hebel | Bereich | bewegt | Punkte | Aufwand | P/d | Pflicht |");
  P("|---|---|---|---|---|---|---|---|");
  const t5 = top(j, (h) => h.v1 && !h.bedingt, 5);
  t5.forEach((x, i) => P("| " + (i + 1) + " | **" + esc(x.h.name) + "** | " + esc(kurz(x.b)) + " H" + (x.i + 1) + " | " + esc(bewegtText(j, x.h.bewegt)) + " | +" + x.h.punkte + " | " + tage(x.h.tage) + " | **" + de(x.h.p_je_tag) + "** | " + esc(x.h.pflicht) + " |"));
  P();
  P("### Die Pflicht-Sicht: wer A, B und E trägt"); P();
  for (const [Pf, n] of [["A", "AAAA je Klasse"], ["B", "Ankunft ≤ 5 s"], ["E", "Profi-Band"]]) {
    const xs = alleHebel(j).filter((x) => pflichtTraegt(x.h.pflicht, Pf) && !x.h.bedingt).sort((u, v) => v.h.p_je_tag - u.h.p_je_tag);
    P("- **" + Pf + " (" + n + ") — " + xs.length + " Hebel, die fünf stärksten:** " + xs.slice(0, 5).map((x) => kurz(x.b) + " H" + (x.i + 1) + " „" + x.h.name.split(":")[0] + "“ (+" + x.h.punkte + " · " + tage(x.h.tage) + " · " + de(x.h.p_je_tag) + ")").join(" · "));
  }
  P();
  P("### Nach v1.0 (Feature-Stopp): die stärksten Hebel, benannt, nicht in der Reihe"); P();
  for (const x of top(j, (h) => !h.v1, 6)) P("- " + kurz(x.b) + " H" + (x.i + 1) + " — " + x.h.name + " (+" + x.h.punkte + " · " + tage(x.h.tage) + " · " + de(x.h.p_je_tag) + " P/d)");
  P();
  P("**Was offen liegt:** alle " + alleHebel(j).length + " Hebel zusammen bewegen +" + alleHebel(j).reduce((s, x) => s + x.h.punkte, 0) + " Punkte in ≈ " + Math.round(alleHebel(j).reduce((s, x) => s + mitte(x.h.tage), 0)) + " Arbeitstagen (Mitte der Schätzungen, ohne Überlappung gerechnet); dazu die Messschuld. Die letzten Punkte jedes Bereichs verlangen das Bild auf BEIDEN Geräten in Bewegung — dort liegt die eigentliche Arbeit.");
  P(); P("---"); P();
  P("## Messschuld — erst messen, dann schneiden (kein Punkt-Gewinn)"); P();
  P("Eine Messung allein stellt den Ist fest; sie steht hier mit ihrer Erwartung und wird VOR jedem Schnitt am Ort gefahren, weil der Schnitt sein Vorher braucht. Im Verlauf heißt ein so gefundener Punkt „gemessen“, nie „Schnitt“ (R6).");
  P();
  P("| # | Kriterium | Messung | Erwartung |");
  P("|---|---|---|---|");
  for (const m of j.messschuld) P("| " + m.id + " | " + esc(m.kriterium.split(" · ").map((x) => (x.includes(".") ? kName(j, x) : x)).join(" · ")) + " | " + esc(m.messung) + " | " + esc(m.erwartung) + " |");
  P(); P("---"); P();
  P("## Wo wir feststecken — und der andere Weg"); P();
  P("Eingestehen, wo wir nicht weiterkommen, ist Teil der Belohnung: je Ort, was wir versuchten, und welche ANDERE Perspektive jetzt dran ist. Die Einzelheiten stehen je Bereich.");
  P();
  P("| Wo | Was wir versuchten | Der andere Weg |");
  P("|---|---|---|");
  for (const [w, v, an] of T.feststeck) P("| **" + esc(w) + "** | " + esc(v) + " | " + esc(an) + " |");
  P(); P("---"); P();
  for (const g of j.gruppen) {
    P("## " + g.titel + " — " + g.summe + "/" + g.max); P();
    P(g.intro); P();
    for (const bk of g.bereiche) {
      const b = j.bereiche.find((x) => x.key === bk);
      P("### " + idx[b.key] + " " + b.titel + " — " + b.punkte + "/10"); P();
      P("*Dateien:* " + b.dateien + " · *Pfad und Pflicht:* " + b.pfad); P();
      P("**10/10.** " + b.aaaa); P();
      P("**Die Besten**"); for (const s of b.beste) P("- " + s); P();
      P("**Kriterien**");
      b.kriterien.forEach((k, i) => {
        P((i + 1) + ". **" + k.name + " — " + k.punkte + "/2.** *Staffel:* " + k.staffel + ". *Messung:* " + k.messung + " *Beleg:* " + k.beleg + " *Schlupfloch geschlossen:* " + k.schlupfloch + (k.aenderung ? " *Gegen die Karte 1.0:* " + k.aenderung : ""));
      });
      P();
      P("**Hebel** (nach Punkten je Tag)");
      [...b.hebel].map((h, i) => ({ h, i })).sort((u, v) => v.h.p_je_tag - u.h.p_je_tag).forEach(({ h, i }, r) => {
        P((r + 1) + ". **H" + (i + 1) + " " + h.name + "** · " + bewegtText(j, h.bewegt) + " · " + tage(h.tage) + " · **" + de(h.p_je_tag) + " P/d** · Pflicht: " + h.pflicht + (h.v1 ? " · v1-Pfad" : " · nach v1.0") + (h.bedingt ? " · bedingt" : "") + ". *Wurzel:* " + h.wurzel);
      });
      P();
      if (b.feststeck) P("**Wo wir feststecken.** " + b.feststeck.versucht + " **Der andere Weg:** " + b.feststeck.anders);
      P();
    }
    P("---"); P();
  }
  const R = j.buergschaft;
  const rs = R.kriterien.reduce((s, k) => s + k.punkte, 0);
  P("## Bürgschaft — nicht in der Summe"); P();
  P("### " + R.titel + " — " + rs + "/10 (zählt nicht)"); P();
  P("**10/10.** " + R.aaaa); P();
  P("**Kriterien**");
  R.kriterien.forEach((k, i) => P((i + 1) + ". **" + k.name + " — " + k.punkte + "/2.** *Staffel:* " + k.staffel + ". *Messung:* " + k.messung + " *Beleg:* " + k.beleg + " *Schlupfloch geschlossen:* " + k.schlupfloch));
  P();
  P("**Hebel** (Richter-Arbeit, ohne Punkte)");
  R.hebel.forEach(([n, w], i) => P((i + 1) + ". **" + n + ".** " + w));
  P();
  P("### Die Spiegel (ohne Punkte)"); P();
  for (const [n, t] of R.spiegel) P("- **" + n + ".** " + t);
  P(); P("---"); P();
  P("## Benannt, ohne Bereich (mit Grund)"); P();
  for (const [n, t] of T.ohneBereich) P("- **" + n + ".** " + t);
  P(); P("---"); P();
  P("## Die Befunde der Kritiker — eingearbeitet oder verworfen"); P();
  const abw = T.befundeB.filter((x) => /Abweichung|verworfen/.test(x[4])).length + T.befundeV.filter((x) => /Abweichung/.test(x[3])).length;
  P("Belohnungs-Kritiker: " + T.befundeB.length + " Befunde und " + T.fehlendB.length + " fehlende Bereiche; Vollständigkeits-Kritiker: " + T.befundeV.length + " Befunde und " + T.fehlendV.length + " fehlende Bereiche. Jeder ist eingearbeitet; " + abw + " mit Abweichung oder teilweise verworfen, jeweils mit Grund — meist, wo beide Kritiker für dieselbe Messung verschiedene Heime vorschlugen.");
  P();
  P("### Belohnungs-Kritiker"); P();
  P("| # | Bereich | Art | Befund | Entscheidung |"); P("|---|---|---|---|---|");
  for (const [id, b, art, kz, e] of T.befundeB) P("| " + id + " | " + esc(b) + " | " + art + " | " + esc(kz) + " | " + esc(e) + " |");
  P();
  P("Fehlende Bereiche: " + T.fehlendB.map(([n, e]) => "**" + n + "** → " + e).join(" · "));
  P();
  P("### Vollständigkeits-Kritiker"); P();
  P("| # | Bereich | Art | Entscheidung |"); P("|---|---|---|---|");
  for (const [id, b, art, e] of T.befundeV) P("| " + id + " | " + esc(b) + " | " + art + " | " + esc(e) + " |");
  P();
  P("Fehlende Bereiche: " + T.fehlendV.map(([n, e]) => "**" + n + "** → " + e).join(" · "));
  P(); P("---"); P();
  P("## Was sich gegen die Karte 1.0 ändert"); P();
  for (const s of T.aenderungen) P("- " + s);
  P();
  P("## Nachziehen nach jedem Bündel"); P();
  T.nachziehen.forEach((s, i) => P((i + 1) + ". " + s));
  P();
  P("## Was die Karte nicht weiß"); P();
  for (const s of T.nichtWeiss) P("- " + s);
  P();
  return L.join("\n");
}

const [, , mode = "build", arg] = process.argv;
const OUT_JSON = path.join(DIR, "..", "meisterkarte.json");
const OUT_MD = path.join(DIR, "..", "MEISTERKARTE.md");
let j;
if (mode === "build") { j = bauen(); fs.writeFileSync(OUT_JSON, JSON.stringify(j, null, 2) + "\n"); }
else j = JSON.parse(fs.readFileSync(arg || OUT_JSON, "utf8"));
const { fehler, delta } = pruefen(j);
if (fehler.length) { console.error("ROT:\n - " + fehler.join("\n - ")); process.exitCode = 1; }
if (mode !== "check") fs.writeFileSync(OUT_MD, render(j));
console.log("Summe " + j.summe + "/" + j.max + " · Bereiche " + j.bereiche.length + " · Kriterien " + j.bereiche.length * 5 + " · Hebel " + alleHebel(j).length + " · Δ-Kriterien " + Object.keys(delta).length + " · Fehler " + fehler.length);
console.log("Gruppen: " + j.gruppen.map((g) => g.key + " " + g.summe + "/" + g.max).join(" · "));
console.log("TOP-5: " + top(j, (h) => h.v1 && !h.bedingt, 5).map((x) => x.b.key + " H" + (x.i + 1) + " " + de(x.h.p_je_tag)).join(" · "));
