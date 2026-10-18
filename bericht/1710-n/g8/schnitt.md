# Schnitt G8 (Schneider): der Pass-Leser teilt in zwei Gipfel — Status: ZWISCHENSTAND

**Kopf:** `9b3acc1dcf28a96613afce512e5a84e8913c392b` auf `g8-arena` (über integ-probe f45ee994), gepusht nach `origin/g8-arena`.
**Diff:** `scripts/lib/zerlege-linse.cjs | 72 ++++++---` · `scripts/werkbank.cjs | 114 +++----` · 2 Dateien, +92 / −94 → **scripts/ netto −2 Zeilen**, 0 Dateien (gate:betriebsgesetz: „scripts -2 Z. 0 Dat.").
Gemessene Bytes = Commit-Blobs (werkbank eb92ba47, zerlege-linse 94da65a8; `schnitt/final-bytes.txt`, Log je Sitzung).

## Geschnitten
- `lauf` → `gpuJePassMs` (werkbank.cjs) liest je Pass `window.__zweiGipfel(w)`; je Pass `{p50, p95, frames}` unverändert, dazu `rein`, `anteilOben`, `versatz`. Kommentar am Leser: Befund in 3 Zeilen.
- `zweiGipfel` lebt in der Pass-Uhr-Familie (zerlege-linse.cjs, Export + `ZERLEGE_INSTALL`); Kriterium samt Begründung im Kommentar:
  Lücke = die weiteste Spanne, die ≤ 2 % der Werte überbrückt, geteilt an ihrer Mitte; nur wenn (a) beide Seiten ≥ 2 %, (b) Spanne ≥ 0,1 ms, (c) Spanne ≥ 2 × Breite des unteren Gipfels (p5→p95).
- Selbsttest `node scripts/werkbank.cjs lauf --selbsttest` (die Werkbank-Familie „--selbsttest ohne Welt" wie diaet/haenger/shader), 0,2 s, 8 synthetische Fälle; jede Mutation von (a), (b), (c) und der Brücke macht genau ihren Fall ROT (geprüft).
- Kompaktiert ohne Semantik (gleiche Schlüssel, gleiche Reihenfolge): Literale in `lauf` und `passUhr`. omen-messfolge.cjs `laufKurz` trägt keine Pass-Werte → unberührt. grep `gpuJePassMs`: einziger Leser ist werkbank.cjs.

## Gemessen (GTX 1060, Wiese Ego, 1920×1080, Regler voll, `lauf 30 --ein 20 --tiere frei`, `gpu-bank 120 --runden 3`)
k0 je Boot: alter p50 · rein · anteilOben · versatz · gpu-bank ms — Rohdaten `schnitt/c*-{anfang,genesis}-{lauf,bank}.json`, Tabelle `schnitt/c-tabelle.txt`.

| Boot | Anfang | nach Genesis und zurück |
|---|---|---|
| c1 | 0,62 · 0,25 · 0,53 · 0,41 · 11,80 | 0,26 · 0,25 · 0,45 · 0,41 · 11,86 |
| c2 | 0,61 · 0,25 · 0,52 · 0,41 · 11,81 | 0,26 · 0,25 · 0,48 · 0,41 · 11,74 |
| c3 | 0,26 · 0,25 · 0,43 · 0,41 · 11,97 | 0,26 · 0,25 · 0,40 · 0,42 · 11,88 |
| c4 | 0,26 · 0,25 · 0,45 · 0,41 · 11,87 | 0,26 · 0,25 · 0,47 · 0,41 · 11,74 |
| c5 | 0,27 · 0,25 · 0,50 · 0,41 · 11,79 | 0,26 · 0,25 · 0,47 · 0,41 · 11,84 |

- `rein` 0,25 an allen 10 Stellen (Δ 0,00 ≤ ± 0,02). Der alte p50 kippt in 2/5 Boots (Anteil 0,52–0,53 > 0,5), sonst liegt der Anteil schon am Anfang bei 0,43–0,50 — der Kipp folgt dem Anteil, nicht dem Ort.
- gpu-bank Δ je Boot −0,13 … +0,06 ms (Mittel Anfang 11,85, nach Genesis 11,81, Δ −0,04): **± 0,05 hält im Mittel, nicht je Boot** (Bank-Rauschen 120×3, Vorzeichen wechselt).
- Andere Pässe tragen den Block selten mit, `rein` weicht ≤ 0,01 vom p50: haupt 2–8 % (versatz 0,25–0,33), post/TRAA 0–8 % (0,20–0,34), k1 3–5 % (0,37–0,41).

## Entschieden (ohne Rückfrage)
- **Vorlauf b1–b5 mit dem ersten Kriterium (Einzel-Lücke):** b5 nach Genesis teilte nicht (anteilOben 0 bei p95 0,80) — Werte in der Lücke (in s2 belegt: oberer Gipfel ab 0,481) zerlegen die Einzel-Lücke. Daher die Brücke ≤ 2 %; b-Zahlen in `schnitt/b-tabelle.txt` (rein 0,25–0,26). In s2 zeigt auch haupt ein Tal 0,55–0,65 mit 1–14 Werten (oben 8–13 %) — die Brücke meldet es.
- 2 Stellen wie der alte p50 (ohne Teilung gilt „rein = p50" wörtlich); der Doku-Pfad `p3/…/befund.md` steht nicht im Code (Zitat-Wand ROT, außerhalb des Baums) → „Befund G8, OMEN 18.10.".

## Exit-Zeilen (finale Bytes, unter dem GPU-Schloss, `schnitt/waende.txt`)
- `node scripts/werkbank.cjs lauf --selbsttest` EXIT=0 · `npm run check` EXIT=0 · `npm run playtest:fast` EXIT=0 (13 s, 22 ✅ 0 ❌)
- 10 Werkbank-Sitzungen, jedes Verb exit=0 (`schnitt/fortschritt.log`); Schloss je Sitzung genommen/gelöst; danach kein node/chrome/save-server von mir.

## Offen
- Wer den präsentations-gebundenen Block legt (Compositor, DWM, Dawn) — kein GPU-weiter Trace. Die Radeon ist nicht gemessen.
- Der Selbsttest hat keinen CI-Schritt (Auftrag: kein neuer CI-Schritt); er läuft nur auf Zuruf.
- gpu-bank je Boot streut ± 0,13 ms — ein Bank-Urteil braucht ≥ 4 Boots je Seite (Median).
