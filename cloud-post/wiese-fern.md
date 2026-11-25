# wiese-fern — STOPP am Spike (tiere.K5#1 · leben.oeko.vielfalt#1)

**Gesetz (Spike):** `_wieseFernHalm(A, s)` in `stamm/vegetation-wiese.js` → Breite s², Höhe 1; der Stoff `_halmFerne`
(`stamm/stoff-material.js`) liest ihn, kein Zwilling. Band: Nilson 1971 / Ross 1976, Lücke exp(−G·LAI/cos θ), G = 0,5 — die
Deckung hängt nur an der Blattfläche, die Höhe bleibt im Band der Nähe.

**Gemessen** (Werkbank `--echt` am Messort wiese, Radeon, dieselbe Seite und Pose, `bild --abstand --kanten 30,60`, 1280 × 720):

| | alt (gleichförmig s) | nur Höhe (Breite s, Höhe 1) | Spike (Breite s², Höhe 1) |
|---|---|---|---|
| Spitze 20 · 30 · 40 m | 0,91 · 1,37 · 1,85 m | 0,74 m | 0,74 m (1,00 × Nähe) |
| Deckung 20–30 m | 97,8 % | 92,8 % | 94,7 % |
| Deckung 30–60 m | 97,1 % | 67,8 % | **77,7 %** (−19,4 Punkte, Soll ≤ −3) |
| Deckung 60–80 m | 89,1 % | 20,1 % | 30,6 % |
| Dreiecke im Bild | 372 373 | 372 941 | 372 749 |

Kosten ABAB (`lauf 30 --tiere frei`, alt · neu · alt · neu): CPU-Takt p95 10,67 · 12,00 · 11,37 · 11,28 ms; Bild p95
33,44 · 33,49 · 33,18 · 33,42 ms; Zeichen-Rufe p95 122 · 120 · 121 · 121; Dreiecke p95 382 k · 393 k · 404 k · 416 k.
Hirsch-Maske (1280 × 720, ein Hirsch gerade vor dem Auge): 20 m 435 → 470 px, 31 m 256 → 301 px, 40 m 212 → 235 px.

**STOPP:** die Höhe hält, die Deckung nicht — der Spike nimmt ein Drittel des Verlusts zurück, nicht mehr. Befund im Bild
(`cloud-post/wiese-fern-bild/wiese-alt.png` · `wiese-nur-hoehe.png` · `wiese-spike.png`): jenseits 40 m stehen die Büschel als
einzelne Horste mit Boden dazwischen. Die Halme eines Büschels werden breiter, ihre Füße rücken nicht auseinander — sie
decken einander (Nilsons Klumpung Ω < 1), die Fläche s² landet zum Teil auf sich selbst. Kein weiterer Schnitt auf Verdacht.

**Linse:** P-Ferne-Halm in `gate:profiband` (`scripts/diag-profiband.cjs`): der Täter gleichförmige Skala (1,23 · 1,85 · 2,47 ×
der Nähe) → ROT beim Namen `_wieseFernHalm`, Selbsttest 56/56; den Konsum des Stoffs beweist das Bild, kein Quelltext.

**Offen:** Deckung 30–60 m −19,4 Punkte (tiere.K5#1, Messname Deckung der Ferne); Station K5 am Kopf nicht gefahren (STOPP).
