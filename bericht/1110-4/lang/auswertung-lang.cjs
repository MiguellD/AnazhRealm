// 1110-4, lange Serie: je Stand zwei Sitzungen (vor/rück), gpu-bank 240×3 in beiden Blicken, zerlegen 12 Runden je Schalter.
// „netto" = gesamt − baum − karten (der Baum-Inhalt der Sitzung schwankt 1,7–3,1 ms und ist Weltzustand, kein Merge).
const fs = require("fs");
const NAMEN = ["S0-main", "S1-pruefbuehne", "S2-egoschatten", "S3-haus", "S4-koerperbild", "S5-wasser", "S6-werkstatt"];
const KL = ["haupt", "k0", "post", "baum", "karten", "boden", "busch", "nahWiese", "streu", "bau", "einzelstuecke", "wasser", "himmel", "feldPass", "traa", "nachbild", "bloom"];
const bank = (f) => { const t = fs.readFileSync(f, "utf8"); const j = JSON.parse(t.slice(t.indexOf("{"))); return (j.ergebnis || j).gpuJeFrameMs; };
const zl = (f) => { const j = JSON.parse(fs.readFileSync(f, "utf8")); const a = (j.ergebnis || j).auswertung; const o = { gesamt: a.gesamtMs }; for (const z of a.zeilen) o[z.id] = z.deltaMs; return o; };
const m = (a) => a.reduce((x, y) => x + y, 0) / a.length;
const S = {};
for (const N of NAMEN) {
  const s = [1, 2].map((g) => ({ b0: bank(`${N}-l${g}-bank0.txt`), b88: bank(`${N}-l${g}-bank-0.88.txt`), z: zl(`${N}-l${g}-zerlegen.json`) }));
  const o = { b0: s.map((x) => x.b0), b88: s.map((x) => x.b88) };
  for (const k of ["gesamt", ...KL]) o[k] = m(s.map((x) => x.z[k] || 0));
  o.netto = m(s.map((x) => x.z.gesamt - (x.z.baum || 0) - (x.z.karten || 0)));
  o.nettoJe = s.map((x) => x.z.gesamt - (x.z.baum || 0) - (x.z.karten || 0));
  S[N] = o;
}
const f = (v) => (+v).toFixed(2);
let out = "| Stand | gpu-bank 0 (l1 · l2) | gpu-bank −0,88 (l1 · l2) | zerlegen gesamt | baum + karten | netto (l1 · l2) | haupt | k0 | post | boden | einzelstuecke |\n|---|---|---|---|---|---|---|---|---|---|---|\n";
for (const N of NAMEN) { const o = S[N]; out += `| ${N} | ${o.b0.map(f).join(" · ")} | ${o.b88.map(f).join(" · ")} | ${f(o.gesamt)} | ${f(o.baum + o.karten)} | ${f(o.netto)} (${o.nettoJe.map(f).join(" · ")}) | ${f(o.haupt)} | ${f(o.k0)} | ${f(o.post)} | ${f(o.boden)} | ${f(o.einzelstuecke)} |\n`; }
out += "\n| Merge | Δ gpu-bank 0 | Δ −0,88 | Δ netto | Δ haupt−baum−karten | Δ k0 | Δ post | Δ boden | Δ busch | Δ nahWiese | Δ einzelstuecke |\n|---|---|---|---|---|---|---|---|---|---|---|\n";
for (let i = 1; i < NAMEN.length; i++) {
  const a = S[NAMEN[i - 1]], b = S[NAMEN[i]];
  const d = (x, y) => (y - x >= 0 ? "+" : "") + (y - x).toFixed(2);
  out += `| ${NAMEN[i]} | ${d(m(a.b0), m(b.b0))} | ${d(m(a.b88), m(b.b88))} | ${d(a.netto, b.netto)} | ${d(a.haupt - a.baum - a.karten, b.haupt - b.baum - b.karten)} | ${d(a.k0, b.k0)} | ${d(a.post, b.post)} | ${d(a.boden, b.boden)} | ${d(a.busch, b.busch)} | ${d(a.nahWiese, b.nahWiese)} | ${d(a.einzelstuecke, b.einzelstuecke)} |\n`;
}
const a = S[NAMEN[0]], b = S[NAMEN[6]];
out += `\nS0 → S6 gesamt: gpu-bank 0 ${f(m(a.b0))} → ${f(m(b.b0))}, −0,88 ${f(m(a.b88))} → ${f(m(b.b88))}, netto ${f(a.netto)} → ${f(b.netto)}\n`;
fs.writeFileSync("auswertung-lang.md", out); fs.writeFileSync("auswertung-lang.json", JSON.stringify(S, null, 1)); console.log(out);
