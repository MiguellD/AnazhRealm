# Befund: der Hausschatten ist gesprenkelt

15.11.2026 03:58 (date) · Stand main 01a6714a (V18.546.291, Lese-Baum `lese-schatten`) · Gerät Radeon 890M (`[linse-gpu] amd/rdna-3`), Welt ab dem Boot
1920 × 1080 (`werkbank start --ort dorf --fenster 1920x1080`), EINE Welt, Schloss 03:52:56–03:57:18 · Pose `bild:dorf@0.5`:
-704.22 39.69 -880.02 → -703.03 39.69 -874.96, Bühne summer sunny, Uhr 0,5. Herkunft: [q] Quelle · [m] gemessen · [r] gerechnet.

**Der Täter:** das Himmels-Bild des Mikro-Reliefs — `_mikroStoff` multipliziert in das Himmels-Licht (aoNode) ein zweites, eigenes Bild
derselben Höhe, `exp(−ln(mulde) · s(kavitaet · (h − krume)))` mit mulde 0,38 und kavitaet 12 (`stamm/stoff-material.js:2755–2757`,
`stamm/daten.js:677–679`); bei der Streuung der Höhe 0,142 sättigt es fast immer, das Bild springt zwischen 0,41 und 2,35 (p10/p90 [r]):
im Schatten, wo nur der Himmel leuchtet, ist das ein Hell-Dunkel von 1 : 5,8 je Kiesel, in der Sonne verdeckt es das Richtlicht.

## Die Felder

Schatten S = x 990–1129, y 760–809 (Boden im Wurf des Hauses, 5,5 m Tiefe), S2 = x 760–899, y 700–749 (7,0 m), Licht L = x 1300–1439,
y 880–929 (derselbe Kies, 4,2 m); je 140 × 50 Bildpunkte. Luma Rec. 709 auf sRGB. σ = die Streuung im Feld (mit dem Verlauf der
Kontakt-Verdeckung zur Wand), σ_hp = die Streuung um das 9 × 9-Mittel (nur das Korn). „hell“ = Anteil der Schatten-Punkte über
Mittel(L) − 10. Werkzeug: Ausschnitte und Zahlen aus `abnahme-urteil.pngLesen`, Bilder unter `artifacts/profiband/auge/hausschatten/`.

## 1. Sieht es der Spieler? JA

| Bild | S Mittel · σ · σ_hp | L Mittel · σ · σ_hp | σ_hp S/L relativ | hell |
|---|---|---|---|---|
| CI-Probe 68df6ac0 (GTX) | 15,7 · 12,7 · 9,13 | 94,9 · 10,7 · 8,37 | 0,582 / 0,088 = 6,6 | 0 % |
| Standbild `bild` (a-standbild) | 15,6 · 12,6 · 9,06 | 94,9 · 10,7 · 8,36 | 6,6 | 0 % |
| Loop `schirm` (a-loop1) | 15,8 · 12,5 · 9,03 | 94,6 · 10,6 · 8,24 | 6,6 | 0 % |
| Loop `schirm` (a-loop2, 7,3 s später) | 15,5 · 12,6 · — | 94,2 · 10,6 · — | — | 0 % |

[m] Das Muster steht im laufenden Spiel genauso wie im Standbild (σ_hp 9,03 gegen 9,06); die zeitliche Auflösung glättet nichts, weil
es welt-fest ist: Loop 1 ↔ Loop 2 weichen im Schatten-Feld im Mittel um |ΔL| 0,51 ab (Licht-Feld 0,57) — es kriecht nicht. Die
Radeon trifft die GTX-Probe auf 0,1 Luma. „hell“ ist 0 %: die hellen Sprenkel liegen bei 30–45 Luma, nicht beim Licht-Feld (95) — es
ist ein Hell-Dunkel IM Schatten, kein durchgelassenes Sonnenlicht. r._schirm() je Bild 1920 × 1080, pxJeM 703,7; r._laubRand() 216 m;
Uhr 0,5 (a-standbild, a-loop, f).

## 2. Wer ist es?

Die Kette am main-Kopf [q]:
- Kaskaden: 3 (`stamm/dirigent-ankunft.js:408–415`, Brüche 0,049 · 0,353 · 1 [m]: k0 bis 15 m `kontaktM`); an der Pose [m] k0 1024² über
  41,5 × 22,6 m = 24,7 Texel/m (0,0405 m je Texel = 5,2 Bildpunkte bei 5,5 m), k1 2048² 6,7 Texel/m, k2 2048² 2,4 Texel/m.
- Bias [m]: k0 bias −1,6e−4, normalBias 0,0203 m; k1 −4,8e−4 / 0,0746 m; k2 −1,2e−3 / 0,204 m (`_schattenBias`, `stamm/bild-schatten.js:23–31`).
- Filter (`_schattenFilter`, `stamm/bild-schatten.js:1041–1088`): k0 5 Such-Abgriffe (Kegel der Sonne) + 5 Vergleichs-Abgriffe (Vogel-Scheibe),
  k1/k2 5 Vergleichs-Abgriffe; die Scheibe dreht `_ditherIGN(T, 2)` mit der Phase der zeitlichen Auflösung. Im Kern des Wurfs sind alle
  fünf Abgriffe verdeckt — der Zitter wirkt nur im Halbschatten.
- Boden-Stoff (`stamm/stoff-material.js:1947` → `_mikroStoff` 2751–2764): die Sonne liest das Korn in der Albedo (1 + 0,6 · h, σ 8,5 %),
  das Himmels-Licht liest `himmel / korn` × Albedo × Korn = Albedo × Himmels-Bild — das Korn kürzt sich, das Himmels-Bild steht allein
  (σ/Mittel 0,67 [r]). Im Schatten ist das Himmels-Licht das ganze Licht: das Korn wird nicht verstärkt, es wird durch ein zweites,
  achtmal stärkeres ersetzt.

Gegenprobe live in derselben Welt (`_mikroStoff` im Prototyp gestellt, das Boden-Material neu, 1 Mesh getauscht, Bild an derselben Pose) [m]:

| Fall | S σ · σ_hp | L σ · σ_hp | Urteil |
|---|---|---|---|
| main, neu gebaut (b-orig-neu, Kontrolle) | 12,6 · 9,05 | 10,7 · 8,36 | gleich a — der Tausch selbst ändert nichts |
| Himmels-Bild aus, Korn bleibt (c-ohneHimmel) | 6,8 · 1,97 | 4,9 · 3,72 | Sprenkel weg; S unter L |
| dasselbe im Loop (c-ohneHimmel-loop) | 6,6 · 1,91 | 4,9 · 3,65 | Spieler sieht es so |
| mulde 0,85 statt 0,38 (d-mulde85) | 6,8 · 2,18 | 5,1 · 3,91 | wie aus |
| Korn und Himmels-Bild aus (e-ohneKorn) | 6,7 · 1,78 | 3,0 · 2,08 | Boden der Messung |
| main zurück (f-orig-zurueck) | 12,6 · 9,07 | 10,7 · 8,36 | A B … A trifft |

Der Schatten fällt auf das Maß des Licht-Felds genau dann, wenn das Himmels-Bild fällt (σ_hp 9,06 → 1,97, der Boden ohne jedes Korn 1,78);
Filter und Kaskaden blieben dabei unberührt — sie sind freigesprochen. Die übrigen 6,7 σ im Schatten-Feld sind der glatte Verlauf der
Kontakt-Verdeckung zur Hauswand (σ_hp 1,8), kein Korn. Filter-Abgriffe hoch / Zittern aus und Kaskade × 2 ließen sich nicht live stellen:
der Filter sitzt im EINEN Knoten der CSM, in jedes Empfänger-Programm gebaut, die Karten-Größe steht ab der Geburt fest
(`stamm/bild-schatten.js:1001–1005`, ein Wechsel reißt die Bündel) — ungemessen als eigener Fall, Messname
`befund-hausschatten:filter-hoch` · `befund-hausschatten:kaskade-x2`; durch die Gegenprobe ohne sie nicht nötig.

## 3. Was kostet der wahre Schatten?

- Abgriffe je Bildpunkt [r]: der Schnitt berührt den Schatten nicht — k0 10 → 10, k1/k2 5 → 5. Am Boden fallen je Pixel ein exp, ein
  inverseSqrt und eine Division (ALU, keine Textur); VRAM ±0.
- GPU-Zeit je Bild [m], `werkbank gpu-bank 120` (drei Durchgänge), A B B A in EINER Welt, Radeon, Pose wie oben: main 31,07 · aus 29,56 ·
  aus 27,72 · main 26,92 ms — Mittel main 29,00, aus 28,64; die Drift der Welt (31 → 27) überdeckt den Unterschied, kein messbarer Preis.
  Nur relativ gültig.
- Der Preis-Schwarm (`origin/w28-preis-ort`, 72561da7) ändert das Muster NICHT [q]: Schnitt 1.1 rastert die Kaskaden auf 16 statt auf die
  Zweierpotenz (`stamm/bild-schatten.js:1125`, `karteRaster` :1733; k0 1024 → 992, Texel 0,0405 → 0,0418 m, +3 %, k1 2048 → 1904, k2 → 1840),
  `texelM` bleibt; 1.3 legt nur die Würfel-Tiefe der Punkt-Lichter auf 16 Bit (:438). Beide wirken an Kanten und in der Nacht am Feuer, nicht
  im Kern des Wurfs und nicht im Boden-Stoff — der Sprenkel bleibt gleich, weder besser noch schlechter.

## Der EINE Schnitt

**Das Himmels-Licht liest dasselbe Korn wie die Sonne.** In `_mikroStoff` (`stamm/stoff-material.js:2751–2764`) fallen
`x`/`himmel`/`ao` (2755–2758): der aoNode bleibt die Himmels-Sicht × Kontakt, die Albedo trägt das Korn (1 + korn · h) für beide Lichter.
Es stirbt: `TERRAIN_BUMP.mulde · kavitaet · krume` und ihr Kommentar-Block (`stamm/daten.js:663–679`), der Satz „der aoNode ist
Himmels-Bild / Korn“ (`stamm/stoff-material.js:2739–2750`) — EINE Höhe, EIN Bild.

- Annahme [m in der Gegenprobe]: Schatten σ_hp 9,06 → ≤ 2,2, σ_hp Schatten/Licht absolut 1,08 → ≤ 0,6, Loop wie Standbild.
- Bildpaar: `a-standbild.png` ↔ `c-ohneHimmel.png` (Ausschnitte `crop-a-standbild.png` ↔ `crop-c-ohneHimmel.png`, Loop
  `crop-a-loop1.png` ↔ `crop-c-ohneHimmel-loop.png`).
- Preis: das Kies-Korn in der Sonne wird ruhiger (σ_hp 8,36 → 3,72) — der heutige Kies-Glanz im Licht ist zur Hälfte dasselbe Himmels-Bild.
  Das ist gewollt: σ 8,5 % ist das Korn, die Kopfstein-Eichung für Stein und Kies gesetzt hat (`stamm/daten.js:680–685`).
- Leser-Liste: `_mikroStoff` hat drei Rufer — der Boden (`stoff-material.js:1947`), die Fels-Gestalt `_mikroGestalt` (:2780) und der
  Stein `_steinStoff` (:2914); die Prüfer: `gate:pruefbuehne-licht` (S0 Nacht: Luma 24,1, abgesoffen 0,7 % — das Mittel des Himmels-Bilds
  1,13 fällt auf 1,0, die Nacht-Luma sinkt um ~1 Stufe [r]), die Station material.K2#1 (glatt/nyquist der Mess-Wiese, die diese Zahlen
  einst setzten), die Soll-Tafel-Klassen Boden/Kies/Kopfstein (`werkbank bild --klasse`), die Probe `bild:dorf@0.5`.

## Ehrlich offen

- Filter- und Kaskaden-Fall nicht als eigene Variante gemessen (Messnamen oben); freigesprochen durch die Gegenprobe.
- Die zwei Loop-Schüsse liegen 7,3 s auseinander, nicht wenige Bilder (`schirm` läuft je Ruf 1,5 s); Δ 0,51 zeigt Stillstand.
- material.K2#1 glatt und `gate:pruefbuehne-licht` S0 Nacht unter dem Schnitt ungemessen — der Macher misst sie mit dem Bildpaar.
- Die GTX-Zeit des Schnitts ungemessen (`befund-hausschatten:gtx-abab`); die Radeon zeigt keinen Unterschied über der Drift.
