# AUGE 2 — die Rechnung des Licht-Gesetzes mit EINEM Zustand je Sicht

Stand: nur gelesen (`git show 2ce8a033d:…`, `git show origin/main:…`, Bilder `spike-licht/main/*.png`, Lagen `sp-licht-*-main.bef`)
und gerechnet: `auge2.cjs` → `auge2.out.txt` (node, 45 s). Keine Änderung im Repo, keine GPU. Das Soll (`SOLL-AUGE2.md`) ist
unverändert.

**Das Urteil in drei Sätzen.**
1. Vier Fälle halten, **Fall 3 (Lava) FÄLLT** an der Ordnung „Ufer fern > Baumlinie": die Baumlinie trägt 6,93 cd/m², das Ufer in
   15 m nur 0,46 cd/m² (×15). Das ist eine Leuchtdichte der Welt, denn K1 und EIN k erhalten die Y-Ordnung exakt. Die Lücke liegt
   also in der Erwartung des Solls an das Licht der Decke, nicht in einer Größe des Auges. Ufer-Saum (Luma 92) und Decke ↔ Saum
   (Δ 148 Code) halten.
2. **Fall 1 hält mit ×3,41, aber nur an der Klemme θ ≥ 1° (Stellwert).** Mit der Klemme bei 0,5° bleibt ×1,12, mit der
   CIE-Allgemeinformel bis 0,1° nur ×0,38. Der Grund: Stiles-Holladay ist bei festem Welt-Abstand zwischen Fixation und Quelle
   abstands-unabhängig (E ∝ 1/d², θ² ∝ 1/d²). Nah und fern trennen sich nur, weil der Blick fern auf dem Feuer liegt und die
   Klemme dort greift.
3. Das Modell trägt **7 Stellwerte**; nur einer ist das erlaubte Datum (L_min 0,005 cd/m² mit τ 120 s). Sein Preis steht als
   Zahl: Nach einem Schwenk um 30° vom Feuer weg braucht das Bild 472 s bis ±0,1 EV.

Nach dem Soll kommt darum **kein GPU-Spike**, sondern dieser Befund.

| # | Ort | Tragende Zahl | Falsifikation (Soll) | Urteil | Zweiter Weg (Abweichung) |
|---|---|---|---|---|---|
| 1 | Herd nah 3 m ↔ fern 25 m | k_fern ÷ k_nah **3,41** (k 0,0103 ↔ 0,0351); Ring-Gras hellster Kanal k·L **0,077** | < 2 oder > 3 | **HÄLT** (an der Klemme 1°) | Pixel-Summe 3,81 (+0,16 EV) · CIE allgemein A 25: **0,38** · Klemme 0,5°: **1,12** |
| 2 | Gasse Nacht, Docht 1 cd | Mondwand Luma **92** gegen die Schattenwand 7: Δ 85 Code, Stäbchen-Kontrast **×2,51** über der Schwelle · Wand unter der Laterne Luma 82, Stäbchen **×1,27** · Zug der Laterne **0,58 EV** | unter der Schwelle, Luma < 8, Zug > 2 EV | **HÄLT** | S/P nur des Monds für den ganzen Zustand: Laternen-Wand **×0,93** (kippt) · Blackwell-Zapfen ×0,04 (Zapfen sehen hier nichts) |
| 3 | Lava nah 3 m, Spiel-Daten | Ufer-Saum Luma **92,2** · Decke ↔ Saum **Δ 148** · Y: Ufer fern **0,46** < Baumlinie **6,93** | Saum < 8, Δ < 2, Ordnung bricht | **FÄLLT** (Ordnung) | L_v Pixel-Summe 117 = geometrisch 117 (0,00 EV) · Decke gleichmäßig 254 (+1,13 EV) · CIE A 25: Saum Luma 39,6 |
| 4 | Mittag, Mess-Wiese | Karte **121/117/118**, Luma 117,9 · Sonne 75,6° von der Achse, L_v = 0 | > 2 Code | **HÄLT** (Eich-Sicht, durch Konstruktion) | Flecke-Gewichte statt Raster: a −0,21 EV · andere Komposition (sonnige Wand 30 %): **−31 Code** |
| 5 | Vollmond-Wiese 0,1–0,3 lx | Wiese 5 m Luma **36,5** (0,1 lx) … 84,0 (0,3 lx) · Baumlinie ↔ Himmel Δ **18,0** … 23,7 | Boden < 12, Baum ↔ Himmel < 2 | **HÄLT** | geschlossen (Grau) 37,2 gegen 36,5 · Baum = Himmel bei Himmel ×1,52 (im Fehler ×2,5 des Himmels) |

---

## 1. Das Modell und seine Quellen

**Kette.** Zuerst die Brücke x = L·k (L in cd/m², linear sRGB). Dann EIN Zustand je Sicht, L_Z = L_a + L_v, und daraus
k = a / max(L_Z, L_min). Danach folgen K1 (`rechnung2/kurve.js` unverändert), die sRGB-OETF und 8 Bit.

| Glied | Formel | Quelle | Gültigkeit / Bemerkung |
|---|---|---|---|
| Schleier | L_v = 10 · Σ E_i / θ_i² (cd/m², E in lx am Auge senkrecht zur Blickrichtung, θ in Grad) | Holladay 1926 (JOSA 12), Stiles 1929 (Proc. R. Soc. B 105); CIE 146:2002 | **1° ≤ θ ≤ 30°**. Gebraucht wird es auch außerhalb: Herd fern 0,57° (geklemmt), Schwenk ≥ 30°, Mittag 35–76° (verlängert, benannt). |
| Schleier, altersangepasst | L_v/E = 10·[1 + (A/70)⁴] / θ² | CIE 146:2002 (nach Vos & van den Berg, CIE 135/1-1999) | 1°–30°. **UNSICHER in den Ziffern**: aus dem Gedächtnis, nicht am Normtext geprüft. |
| Schleier, allgemein | L_v/E = 10/θ³ + [5/θ² + 0,1·p/θ]·[1 + (A/62,5)⁴] + 0,0025·p | CIE 146:2002 / CIE 135/1-1999 (Vos & van den Berg) | 0,1°–100°, p Pigment (0 dunkel … 1 hell), gerechnet mit A 25/70 und p 0,5. Nur als Zweitweg. **UNSICHER in den Ziffern** wie oben. |
| E_Blend | Punktquelle: I·cos θ / d² mit der Candela des Datums (Herd 248,6 cd im Licht-Ort 0,35 m; Docht 1 cd × kopfSicht zum Auge). Fläche: Σ L·cos α·dA·cos θ / d² über Stücke. Bett: 40 Ringe × 96 Sektoren. Lava-Decke: Zellen 5 cm, L je Zelle aus dem Spiel-Gesetz. Fenster: Zellen 10 × 10 cm. | Photometrie | Der Kern des Spiels (d² + k²) fehlt am Auge, das sind 1,4 % in 3 m. |
| L_a | exp(Mittel ln(Y + δ)) über alle Nicht-Strahler-Pixel des Bilds (Himmel zählt mit, Strahler-Bit aus) | Reinhard et al. 2002 (SIGGRAPH, Gl. 1) | Eine Konvention der Tonabbildung, physiologisch nicht belegt → Stellwert S6 |
| k | k = a / max(L_Z, L_min), a = 0,22 · L_Z(Mess-Wiese, Mittag) / L_Karte | Reinhard et al. 2002 Gl. 2 (Schlüssel a/L̄); Eichung nach Soll | a FOLGT: **0,1399** (κ 1,572) aus dem Raster der Mess-Wiese. Exponent 1 (Weber) bis L_min → Stellwert S5 |
| Untere Anpassungs-Grenze | L_min = 0,005 cd/m², τ_dunkel 120 s | Grenze: CIE 191:2010, Untergrenze des mesopischen Sehens. Darunter tragen die Zapfen nicht mehr; das ist das Ende des Zapfen-Asts der Dunkeladaptation (Hecht, Haig & Chase 1937), und main nutzte denselben Wert (`AUGE.zustandMinLux`). τ: Regeneration des Zapfen-Pigments ≈ 2 min (Rushton & Henry 1968), Stäbchen ≈ 400 s (Rushton 1961), Zapfen-Ast-Plateau nach 5–10 min, Stäbchen-Ast 30–40 min. | **Das EINE gewählte Datum.** Die Grenze sitzt am Ende des Zapfen-Asts, also gilt dessen τ: der Stäbchen-Ast liegt unter L_min und kommt im Spiel nicht vor. Die Zitate von Rushton stehen aus dem Gedächtnis: **UNSICHER** in Wert und Jahr, die Größenordnung (Minuten) ist sicher. |
| τ hell | 0,1 s | Crawford 1947 (Proc. R. Soc. B 134): die Schwelle steigt innerhalb von ≈ 0,1 s nach Licht-Beginn | **UNSICHER** (Größenordnung) |
| Kurve | K1: Neutral auf Y (0,76/0,15/Fuß 0,08·6,25·0,04), Oklab-Farbton der Eingangsfarbe, Gamut bei fester Y | Khronos PBR Neutral (vendor `mT`), Ottosson 2020, rechnung2 §2.5 | unverändert |
| Schirm | sRGB-OETF, 8 Bit; Luma = 0,2126 R + 0,7152 G + 0,0722 B auf Codes | IEC 61966-2-1:1999, Rec. 709 | wie die Abnahme (`pngLesen`) |
| Schwelle (nur Richter von Fall 2) | log ΔL_t: Zapfen −0,72 \| (0,249x + 0,65)^2,7 − 0,72 \| x − 1,255 (Grenzen −2,6/1,9); Stäbchen −2,86 \| (0,405x + 1,6)^2,18 − 2,86 \| x − 0,395 (Grenzen −3,94/−1,44), x = log L_a. Zweitweg ΔL = 0,0594·(1,219 + L_a^0,4)^2,5 | Ferwerda, Pattanaik, Shirley & Greenberg 1996; Blackwell (CIE 19/2.1, 1981) nach Ward 1994 | TVI für kleine Prüfflecke; Wände sind groß (räumliche Summation), die Schwelle liegt dort also eher tiefer. |
| skotopisch | L_s = 1700 ∫B·V′ / 683 ∫B·V je Licht, V′ CIE 1951, V CIE 1924 (Tafel 10 nm) | CIE 1951/1924 | Prüfung CIE A: S/P **1,414** (Soll 1,41). Docht 1 850 K 0,85, Mond 4 100 K 1,90. Das Reflexions-Spektrum fehlt (UNSICHER). |

**Kamera** (am Code gelesen): `AnazhRealm.KAM_FOV_GRAD = 75` (vertikal, stamm/koerper-fahrt.js:3251), Seitenverhältnis
`window.innerWidth / innerHeight` (stamm/dirigent-ankunft.js:468), gerechnet mit 16:9 wie die GPU-Bilder 960 × 540. Waagrecht
ergibt das ±53,7°.

**Lagen** (aus den `.bef` von main): Herd nah 4,95 m, fern 22,8 m bei 5,4 m Höhe, das Ziel jeweils 1,0 m unter der Kamera.
Daraus ist die Regel „Ziel 0,6 m über der Mitte des Betts" genommen. Gerechnet ist auf den Abständen des Solls (3 m / 25 m, Ego
1,6 m), die main-Lagen stehen als Gegenprobe daneben. Lava: 3 m vom Rand, Ziel 0,6 m über der Mitte. Wiese: Auge 1,7 m, Blick 1,4°
abwärts (main `mond-frei`/`mittag-wiese`). Gasse: die Ego-Sicht aus r1 (6 m vor dem Kopf) und der Blick die Gasse entlang.
Gegenprobe am Bild: In main herd-nah.png steht das Bett 5,9° unter der Bildmitte, die Rechnung setzt es auf 6,5°.

## 2. Stellwerte dieses Modells — **7**

| # | Stellwert | Wert | Warum gesetzt | Was er trägt |
|---|---|---|---|---|
| S1 | **untere Anpassungs-Grenze + τ dunkel** (das EINE erlaubte Datum) | 0,005 cd/m² · 120 s | §1 (CIE 191; Zapfen-Pigment) | Fall 5: Wiese Luma 36,5 bei 0,1 lx. Er fällt erst bei L_min > **0,0113**. Gasse: die Grenze bindet bei 0,1 lx. |
| S2 | Klemme θ ≥ θ_min | 1° | Der Wert ist die Gültigkeitsgrenze von Stiles-Holladay; das Klemmen selbst ist gewählt. | **Fall 1 steht auf ihm**: ×3,41. Mit Klemme 0,5° bleibt ×1,12; Fall 1 kippt unter θ_min ≈ 0,77°. |
| S3 | Blend-Feld = Bildfeld (ein Strahler außerhalb des Bilds blendet nicht) | ±37,5° / ±53,7° | Das Spiel zeigt den Schirm, nicht das Gesichtsfeld. | Fall 4: die Sonne bei 75,6° gibt 0, im Gesichtsfeld wären es 45 cd/m² (0,015 EV). Der Schwenk-Sprung bei 60° (Flamme verlässt das Bild) ist 0,51 EV größer als ohne den Schnitt. |
| S4 | Fixation = Bildmitte | — | ohne Blick-Messung | jedes θ; Fall 1 kippt, sobald die Flamme nah mehr als 5,50° neben der Achse steht |
| S5 | Weber-Exponent 1 zwischen L_min und Mittag | k ∝ 1/L_Z | Quelle Reinhard 2002 Gl. 2. Die Physiologie widerspricht: die Zapfen-TVI hat unter 80 cd/m² eine Steigung < 1 (Ferwerda 1996). | jede Nacht- und Feuer-Helligkeit relativ zur Karte. Mit Ward/Blackwell statt Weber stünde die Mondwiese bei Luma 0 (Handrechnung: x ≈ 4·10⁻⁴). |
| S6 | Mittelung von L_a: log-Mittel aller Nicht-Strahler | — | Quelle Reinhard 2002 Gl. 1, Konvention | Fall 4 und die Eichung: Raster gegen Flecke-Gewichte −0,21 EV. Sonnige Wand 30 % → −31 Code. |
| S7 | δ im log-Mittel | 10⁻⁶ cd/m² | Reinhard „klein" | keine Wirkung (alle L_a ≥ 1,7·10⁻³) |

Daten der Szenen (Albedo, Halm, Mond, Glutbett, Himmel, Geometrie) sind keine Stellwerte des Modells. Sie stehen in §4 an ihren
ehrlichen Rändern.

## 3. Die Rechnungen (Zahlen aus `auge2.out.txt`)

### Eichung
Mess-Wiese am Mittag: L_a 4 270 cd/m², Karte 6 710 cd/m², die Sonne 75,6° von der Achse, also außer Bild (L_v 0). Daraus folgt
a = 0,22·4 270/6 710 = **0,1399**, und die Karte steht auf 121/117/118, Luma 117,9. Mit den Flecke-Gewichten des Spikes statt des
Rasters: L_a 3 680, a 0,1208 (−0,21 EV), κ 1,822 wie im Spike.

### Fall 1 — Herd
| Sicht | θ Flamme | E_Blend | L_a | L_v | L_Z | k |
|---|---|---|---|---|---|---|
| nah 3 m | 4,18° | 23,8 lx | 0,135 | 13,4 (Flamme 13,4 · Bett 0,036) | 13,6 | 0,0103 |
| fern 25 m | 0,57° → Klemme 1° | 0,398 lx | 0,0121 | 3,97 | 3,98 | 0,0351 |

**Faktor 3,41 (1,77 EV).**
- Der Schleier setzt den Zustand in beiden Sichten (L_v/L_a = 99 bzw. 330).
- Gras im Ring nah: 0,75 m 36/19/0, Luma 21. Bei 1,75 m Luma 6,3, bei 14 m Luma 0. Der hellste Kanal liegt höchstens bei k·L 0,077,
  weit unter 3.
- Fern trägt dasselbe Gras Luma 77, der Ring innen 132. Das Glutbett steht nah bei 254/102/8 (Oklab-h 43°). Die Farbtöne bleiben die
  der Eingangsfarbe (K1).

**Die Form, die das Urteil trägt** (L_v der Flamme allein):

| Fixation | nah | fern | nah ÷ fern |
|---|---|---|---|
| Ziel 0,6 m über dem Bett (die Sichten) | 4,18° · 13,4 | 0,57° · 3,97 | 3,38 |
| fester Welt-Versatz 1 m über dem Licht | 17,9° · 0,70 | 2,29° · 0,76 | **0,93** |
| fester Welt-Versatz 2 m seitlich | 31,6° · 0,20 | 4,57° · 0,19 | **1,06** |
| fester Bildwinkel 4,2° | 13,4 | 0,225 | 59 |

**Was daraus folgt.**
- Die Trennung kommt nicht aus „E/θ²" allein. Sie kommt aus der Klemme (S2) und aus der Fixation (S4).
- Nah fällt der Faktor unter 2, sobald die Flamme mehr als **5,50°** neben der Achse steht.
- main-Lagen (4,95 m / 22,8 m in 6 m Höhe): Faktor 2,79. Mit CIE allgemein 0,40.
- **CIE allgemein** (A 25, p 0,5, θ bis 0,1°): L_v fern 27,5 > nah 10,4, der Faktor ist **0,38**, die Ordnung kehrt sich um. Das
  Gras in 0,75 m steht dann fern bei Luma 6,6, nah bei 29,5.
- Physikalisch heißt das: wer fern ins Feuer schaut, ist stärker geblendet als nah 4° daneben.

**Schwenk vom Feuer weg** (nah, Gier):

| Gier | θ Flamme | L_Z | k | Sprung | bis ±0,1 EV mit τ 120 s (main-τ 0,8 s) |
|---|---|---|---|---|---|
| 10° | 10,3° | 2,36 | 0,0593 | **+2,52 EV** | 387 s (2,6 s) |
| 30° | 28,4° | 0,389 | 0,36 | **+5,13 EV** | 472 s (3,1 s) |
| 60° | 56,0° (außer Bild) | 0,0973 | 1,44 | **+7,12 EV** | 512 s (3,4 s) |

Zurück zum Feuer (hell, τ 0,1 s) sind es 0,39 s.

### Fall 2 — Gasse
Gerechnet ist die Ego-Sicht aus r1 (Ziel 0,5/2,3/+2, die Laterne 8,2° neben der Achse):
- Zustand: L_a 3,44·10⁻³, L_v 4,02·10⁻³ (Pixel-Weg 5,02·10⁻³), L_Z 7,46·10⁻³, k 18,8.
- Zug je Strahler: Laterne z 0 0,58 EV, Laterne z 10 0,11 EV, Fenster 0,03 EV. Die Fenster decken 4,5 % des Bilds.
- Schwellen: Zapfen 0,192 cd/m², also ×0,04: die Zapfen sehen hier nichts. Stäbchen 5,13·10⁻³ scot cd/m².
- Mondwand 8,86·10⁻³ cd/m² → 153/79/45, Luma 92. Schattenwand 9,9·10⁻⁴ → Luma 6,8. Der Stäbchen-Kontrast liegt **×2,51** über der
  Schwelle, Δ 85 Code.
- Wand unter der Laterne (1,2 m neben, 0,8 m unter dem Kopf) 8,67·10⁻³ → 171/63/8, Luma 82, Stäbchen **×1,27**.

Die Gasse entlang gilt dasselbe: Mondwand Luma 106, Laternen-Wand Luma 94 (×1,27), Zug ≤ 0,09 EV.

**Zug der Laterne gegen θ:**

| θ | 1° | 2° | 4° | 6° | 8° | 10° |
|---|---|---|---|---|---|---|
| Zug | 5,52 EV | 3,58 EV | 1,81 EV | 0,95 EV | 0,47 EV | 0,18 EV |

Über 2 Stufen zieht sie nur innerhalb von **3,70°** um den Kopf. Wer direkt in die Laterne schaut, ist geblendet, und das ist
physikalisch so.

### Fall 3 — Lava (Spiel-Daten)
- Gesetz der Decke: t0 = tSchmelz 1 500 (schmiede-core.js) + Überhitzung 150 (gelaende-core.js:1818) = 1 650 K. Die Scholle trägt
  0,62 → 1 326 K (`LAVA_KRUSTE.platte`, siedlung-wege.js:2955), ε 0,95.
- Leuchtdichten: Riss 31 599 cd/m², Scholle 858, Mittel 6 258.
- Zustand: L_a 0,641, L_v **117** (geometrisch und als Pixel-Summe gleich; die Decke deckt 15,8 % des Bilds), k 1,19·10⁻³.

| Fleck | Y cd/m² | sRGB | Luma |
|---|---|---|---|
| Riss | 31 600 | 255/255/255 | 255 |
| Decke (Scholle) | 858 | 255/237/230 | 240 |
| Ufer-Saum 0,25 m | 145 | 158/82/0 | **92,2** |
| Ufer fern 15 m (jenseits) | **0,462** | 0/0/0 | 0,0 |
| Baumlinie 20 m (jenseits) | **6,93** | 3/1/0 | 1,4 |

**Die Lücke beim Namen (Fall 3 FÄLLT):**
- Der Bruch liegt in der Welt-Leuchtdichte, nicht im Auge. K1 und EIN k bilden Y monoton ab; im Bild kehrt sich dieselbe Ordnung
  um (Y_aus).
- Grund: Die Lambert-Decke sieht ein Halm in 15 m bei 0,2 m Höhe unter ≈ 0,5° Erhebung, also cos α ≈ 0,009, und erhält ≈ 14 lx.
  Die senkrechte Laubwand in 0–6 m Höhe sieht die Decke unter 0,5–12° und erhält ≈ 146 lx. Das sind ×15, also 3,9 Stufen.
- Die Ordnung „Ufer fern > Baumlinie" im Soll ist darum eine falsche Erwartung an das Licht der Decke. Kein Stellwert des Auges
  heilt sie, und keiner wurde gesucht.
- Sie bricht unter jeder Empfindlichkeit (§4).

**Schwenk von der Decke weg:**

| Gier | 10° | 30° | 60° | 90° |
|---|---|---|---|---|
| Sprung | −0,05 EV | +0,47 EV | +4,94 EV | +8,43 EV |

Der Ufer-Saum steht dabei auf Luma 90 / 112 / 253 / 255.

### Fall 4 — Mittag
- Karte 117,9 an der Eich-Sicht, durch Konstruktion (a folgt dort). Ohne Sonne im Bild liegt L_v bei 0; im Gesichtsfeld wären es
  45 cd/m² (0,015 EV).
- **Mit Sonne in der Sicht** (die Kamera nickt aufwärts, die Karte gleicher Leuchtdichte unter dem k der Sicht):

| Nicken | θ Sonne | L_v (S-H · CIE) | Karte (Luma) | Δ gegen 118 |
|---|---|---|---|---|
| +30° | 45,6° (außer Bild) | 0 | 114,2 | −3,8 (nur durch mehr Himmel in L_a) |
| +40° | 35,6° | 666 · 588 | 103,9 | −14 |
| +50° | 25,6° | 1 430 · 1 090 | 91,9 | −26 |
| +60° | 15,6° | 4 100 · 2 820 | 68,7 | −49 |
| +70° | 5,6° | 32 700 · 23 600 | 12,2 | −106 |

- Eine andere Komposition (sonnige Wand ρ tor auf 30 % des Bilds) setzt die Karte auf Luma 87, also −31 Code. Weber hält die Karte
  nur an der Eich-Sicht.

### Fall 5 — Vollmond-Wiese ohne Feuer
| Mond E⊥ | L_a | k | Wiese 5 m | Baumlinie / Himmel | Δ |
|---|---|---|---|---|---|
| 0,1 lx | 2,09·10⁻³ (Grenze bindet: 0,005) | 28,0 | 40/38/12 · **36,5** | 49,8 / 31,8 | 18,0 |
| 0,2 lx | 4,17·10⁻³ (bindet) | 28,0 | 79/76/31 · 73,4 | 89,6 / 67,0 | 22,6 |
| 0,3 lx | 6,26·10⁻³ | 22,4 | 90/87/37 · 84,0 | 100,6 / 76,9 | 23,7 |
| 0,3965 (Spiel) | 8,27·10⁻³ | 16,9 | 84,0 | 100,6 / 76,9 | 23,7 |

- Über L_min ist das Bild mond-invariant (Weber). Das ist das Bild des voll angepassten Auges vor dem Stäbchen-Schritt.
- Entsättigt und kühl ist Sache des Stäbchen-Schritts; er ist nicht gerechnet, nur benannt: S/P Mond 1,90.
- Zweiter Weg, geschlossen: x = a·L/L_min = 0,0547 → Code 37,2 gegen 36,5.

## 4. Empfindlichkeit (an den ehrlichen Rändern)

| Größe | Fall 1 (Faktor) | Fall 2 | Fall 3 | Fall 5 (0,1 lx: Wiese · Δ) |
|---|---|---|---|---|
| Glutbett 900 / 1 300 K | 3,40 / 3,55: hält | — | — | — |
| Gras-Albedo Y 0,20 (statt 0,124) | 3,42, Ring 0,156: hält | — | Saum 137: Ordnung bricht | 74,4 · 21,8: hält |
| Halm-Faktor Mond ×2 | 3,41: hält | — | bricht | 73,4 · 18,0: hält |
| Mond 0,1 / 0,3 lx | 3,40 / 3,41: hält | Laternen-Wand ×1,73 / ×1,39: hält | bricht | (Fall selbst) |
| Laub senkrecht (0,27 statt 0,5 E⊥) | — | — | — | 36,5 · **7,7**: hält |
| Himmel ×2,5 / ÷2,5 | — | — | — | Δ 30,0 / 42,0: hält, **aber** bei ×1,52 stehen Baum und Himmel gleich: dort Δ < 2, FÄLLT |
| t0 Lava 1 470 K (Basalt ohne Überhitzung) | — | — | L_v 19,9, Saum 238,5, Decke ↔ Saum **Δ 4,4**: bricht (Ordnung) | — |
| θ_min 0,5° · CIE allgemein A 25 / A 70 | **1,12 · 0,38 / 0,58: FÄLLT** | — | Saum 39,6 / 27,5: hält | — |
| Fenster cdM2 20 (2ce8-Datum statt Stube 0,0318) | — | **FÄLLT**: L_Z 0,104, Mondwand Luma 3,0, Stäbchen ×0,35 | — | — |
| S/P nur des Monds im Zustand der Gasse | — | Laternen-Wand **×0,93: FÄLLT** | — | — |

Fall 1 kippt also an S2 und S4, nicht an den Welt-Daten. Fall 2 kippt am Fenster-Datum und an der Spektral-Näherung der Schwelle.
Fall 5 kippt an L_min > 0,0113 und an einem Himmel bei ×1,52.

## 5. Prüfung des Bausteins `r1-trennung.cjs`

Übernommen sind Physik, Herd, Lava und Gasse. Die Kamera dort (vFOV 75°, 16:9) stimmt mit dem Code.
- **Befund:** In der Lava-Szene stand die „Baumlinie 20 m" bei x = +(R + 20), also **hinter** der Kamera; aus der Sicht auf die
  Decke war sie nie im Bild. Hier steht sie jenseits der Decke.
- Die Herd-Szene trägt keine Bäume.
- In der Gasse ist die Wand direkt unter dem Kopf durch kopfSicht dunkel. Die hellste lesbare Laternen-Wand liegt 1,2 m daneben.
- Die Halm-Formel des Monds an der Wiese (Anteil 0,3) bleibt die Wahl des Spikes; ihre Ränder stehen in §4.
- L_a hängt nicht an der Rasterung: 0,135 bei 480², 960² und 1 440².

## 6. UNSICHER und nicht gerechnet

- **Der EINE Skalar und die Zeit:** L_v ist Optik und verschwindet mit dem Schwenk sofort. Erst die Anpassung braucht ihr τ. Mit EINEM
  Zustand und τ 120 s bleibt nach dem Blick vom Feuer weg die Wiese 6–8 min dunkel (387–512 s).
  - Physiologisch erholt sich das Auge nach ≈ 14 cd/m² (Bleichung < 1 %) überwiegend neuronal, also in Sekunden; 2 min gelten nach
    starker Bleichung.
  - Ein Skalar kann beides nicht tragen. Das ist die Lücke der Zeit, kein Fall-Grund des Solls.
- Zitate aus dem Gedächtnis: die CIE-146/135-Ziffern, Rushton, Hecht 1937, Crawford 1947. Belegt aus dem Baum: tag-ref.json,
  CIE 191 (MESOPISCH im Code), die Spiel-Daten.
- Spektren: S/P nur aus dem Licht, ohne die Reflexion; die Wand (HAUS) ist rötlich und senkt S/P. Die Schwellen gelten für kleine
  Prüfflecke; Wände summieren räumlich.
- Nicht gerechnet:
  - der Stäbchen-Schritt (`_nachtAuge`), Bloom, TRAA, `graded`, die Luft-Stelle der Post-Kette;
  - die Mondscheibe und Sterne als Strahler (außer Bild);
  - der Nachthimmel 5·10⁻⁴ lx (unter 10 % des mondhellen Himmels);
  - der Glanz.
- Die Geometrie der Sichten ist gewählt; abgeleitet sind nur die Ziel-Regel und die Abstände aus den main-`.bef`. Gerechnet ist
  ohne GPU und ohne Spiel-Bild; die Bild-Lage des Betts trifft auf 0,6°.
