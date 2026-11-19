# SPIKE — das Gesetz der Kopplung gegen die echten Kerne (Versuch der Widerlegung)

Geprüft: `vision/kopplung/entscheid.md` §(1) DAS GESETZ, §(4) DER PREIS, §(7) DER AUFTRAG. Code auf ff32c2154 (main-Stand der Kerne).
Nichts im Repo außer `vision/kopplung/spike/` und diesem Blatt ist berührt; jede Kern-Änderung ist eine BENANNTE Ersetzung an
einer Kopie in `os.tmpdir()/kopplung-spike-*` (gelöscht nach dem Lauf).

**Die Bühne** (`vision/kopplung/spike/buehne.cjs`): der Null-Renderer-Boot der Linsen (`scripts/lib/welt-boot.cjs` `nullWelt`,
headless Chromium), der Statik-Server liefert an Stelle jedes Originals seine Kopie (`wandle`). Die Seite (`spike/seite.js`) zündet
über den Akt der Seite (`_brandEntfachen`, derselbe Akt wie Fackel und Brennglas) und fährt den ECHTEN `_tickBrand` Schritt um
Schritt an der Welt-Uhr; jede gefangene Zelle wird über einen Hörer an `_brandZuenden` protokolliert. Die Seite rechnet keine
Physik: M, U₁₀, R, I_R lesen die geladenen Module.

**Die Kopien** (`spike/kopien.cjs`; jede Ersetzung: Name, Such-Text, Ersatz, lauter Abbruch, wenn der Such-Text nicht GENAU einmal
trifft; `node spike/kopien.cjs fest` baut und parst alle):

| Datei | Ersetzungen (Name) | Modus |
|---|---|---|
| phyto-core.js | `maeander-0485`, `ortWetter` (WETTER_ORT, REGEN, Tor, 45-s-Kasten, Tat `wetter`), `export-ortWetter` | gesetz, fest |
| phyto-core.js | `kontroll-fest` (im Kreis `__kopplungFest`: Zeile bewoelkt, tor 0, P 0, U₁₀ und feuchte des Versuchs) | nur fest |
| gelaende-core.js | `pegel-regen-0006`, `feuchte-gesetz` (emc Simard, et0 FAO-56, luftFeuchte, feuchteSchritt, filmSchritt), `export-feuchte` | gesetz, fest |
| stamm/bild-himmel.js | `temperatur-am-ort+wetter-am+feuchte-am` (`_temperaturAt(x,z,y,traeg,t)` zur Tag-Phase, `_wetterAm`, `_feuchteAm` mit Epochen-Anker 1.6) | gesetz, fest |
| stamm/feld-leben.js, klang.js, koerper-fahrt.js, siedlung-wege.js | `temperatur-ort-*` (die Rufer tragen den Ort) | gesetz, fest |
| stamm/stoff-material.js | `wind-staerke-am-ort` (`_windAt`: Stärke = `_wetterAm(x, z).mix.wind`) | gesetz, fest |
| stamm/feld-brand.js | `bett-lastAm-ohne-sperre` (Gras: p der Wiese, keine Sperre), `feuchte-je-zelle-tempo`, `temperatur-am-ort-tempo`, `iw-netto`, `kein-erbe`, `feuchte-je-zelle-schritt` | gesetz, fest |
| stamm/feld-brand.js | `diag-tempo-glieder` (MESS-Ersetzung: `_brandTempo` legt I_R, u, Deckel, U₁₀, M ab — keine Physik) | alle, auch vorher |

Nicht gebaut (benannt): `kronenDeckungAm` und das Laub-Bett (kein Fall misst Laub), der Film-Streifen im Bild, die Absage der
Fackel „mit Grund und Zahl“ (kampf.js:2448), der Wetter-Zug als Tat. Beweis, dass `diag-tempo-glieder` keine Zahl ändert: vorher-a
mit ihr gibt R_Kopf 0,003 / 0,238 / 0,238 m/s und dieselben Zellen (79 / 77 / 88) wie der Lauf des Vorgängers ohne sie.

**Modi:** `vorher` = Originale (+ nur die Mess-Ersetzung) · `gesetz` = die Kopien, die Welle selbst · `fest` = die Kopien + die
Kontroll-Kopie im Kreis 1 000 m um die Mess-Wiese (−280,4 | −1 045,6). Jeder Lauf: `cd vision/kopplung/spike && node <fall>.cjs
<modus> <teil>`, JSON auf stdout (davor kann die Stall-Akte der Bühne stehen, wenn die Seite > 20 s rechnet). Wanduhr je Lauf in der
Zeile; Abbruch der Bühne bei 60 s.

---------------------------------------------------------------------------------------------------------------------------
## Fall I — trockene Wiese mit Wind (gelaufen)

**Befehle** (Wanduhr): `node fall1.cjs fest a` (21,6–25,7 s) · `node fall1.cjs vorher a` (15,9 s) · `node fall1.cjs fest m`
(25,5 s) · `node fall1.cjs gesetz m` (23,0 s) · `node fall1.cjs vorher m` (20,7 s) · `node fall1.cjs fest p` (42,2 s) ·
`node fall1.cjs vorher p` (11,3 s) · `node suche.cjs bett ort|mess|fern` (10,5–12,4 s) · `node suche.cjs lauf mess 1500 0.95 0.9 800` (27,5 s).

**Eingaben:**
- Saat „anazh-realm-seed“, Sommer (`autoSeason` aus, saisonNull 0,375), Zündung tIgn = 5 700 s Welt = Tag-Phase 0,5833 (14 Uhr,
  aus `_tagPhaseAm` der Kopie gelesen).
- Ort der Linie (−1 128 | −984), 850 m von der Mess-Wiese, innerhalb des Kontroll-Kreises (0 Zellen außerhalb in jedem Lauf).
  Linie: 10 Punkte im Abstand einer Zelle quer zu θ0 = 37,4°; 9 von 10 fangen (in jedem Lauf dieselben). Der Spieler steht am Ort.
- Wind der Kontroll-Kopie U₁₀ ∈ {2,4; 7,2; 24} m/s; am Ort gelesen (mit der Form des Geländes, ohne Böe) 2,38 / 7,14 / 23,1–23,7.
  Mittlere Richtung 120–300 s: 50,2° (Gesetz, Mäander × 0,485) bzw. 63,8° (vorher).
- feuchte der Kontroll-Kopie per Bisektion so, dass M_Gras am Herd zur Zündung 0,0600 bzw. 0,0900 ist: feuchte 0,0377 bzw. 0,2696.
  Einlauf ≥ 1 Prozess-Tag ist durch den Anker erfüllt (das Fenster beginnt H…2H vor t). Verwirklicht in den gefangenen Zellen:
  M 0,058–0,064 bzw. 0,087–0,098 (der Tagesgang über 300–900 s Welt = 2–6 Prozess-Stunden).
- VORHER: das Wort foggy / cloudy / stormy (Wind-Kanal 0,1 / 0,3 / 1 × 24 m/s), Nässe (a) wie `_naesseTakt(3600)` sie dem Wort gibt,
  (b) der Stub der Linsen: 0 bzw. 0,012 (M = 0,06 + 2,5 · 0,012 = 0,09, feld-brand.js:284).

**Messgröße:** R_Kopf = (Kopf(300 s) − Kopf(120 s)) / 180 s, Kopf = größte Projektion eines Eintritts (ex, ez) einer gefangenen Zelle
auf die mittlere Wind-Richtung. Dazu, weil das Bett endet: R_Stück = Tempo des Kopfs auf DEMSELBEN Stück Bett [40 m, s₁] beider
Läufe eines Paars (s₁ = min(300 m, Reichweite beider)); R_Zelle = Median des Kern-R (`_brandTempo`) an den gemeinsamen Zellen.

**Das Bett längs des Winds** (kleinstes leb·anteil der drei mittleren Zellen quer, `_brandStoff` des geladenen Moduls): NACHHER
≥ 0,9 auf 0–48 m und 112–304 m, 0,45–0,57 auf 320–384 m, unter minStoff ab **400 m**; VORHER (Bett aus `_kontaktStoffAt` +
`auraAt().lebendig`) 0,17–0,70 und unter minStoff ab **112 m**. Mittleres leb der gefangenen Zellen: vorher 0,55–0,59, nachher
0,79–0,90. Innerhalb ±1 500 m um die Mess-Wiese gibt es keinen Lauf > 232 m auf p ≥ 0,9 (`suche.cjs lauf`, 35 721 Zellen gemessen).

**Zahlen — R_Kopf [m/s] VORHER ↔ NACHHER (CSIRO-Soll am selben U₁₀ und verwirklichten M):**

| | U₁₀ 2,4 | U₁₀ 7,2 | U₁₀ 24 |
|---|---|---|---|
| vorher, Nässe aus dem Wort (main) | 0,003 (Nässe 0) | **brennt nicht** (Nässe 0,944, M 2,42) | **brennt nicht** (Nässe 1,0, M 2,56) |
| vorher, Stub M 0,06 | 0,003 | 0,238 | 0,238 (Kopf steht bei 125 m = Bett-Ende) |
| vorher, Stub M 0,09 | 0,000 | 0,258 | 0,298 |
| **nachher M 0,06** | **0,239** | **1,021** | 0,707 — ungültig: Kopf 413 m bei 300 s am Bett-Ende; R_Stück [40, 300 m] 2,385 |
| **nachher M 0,09** | **0,148** | **0,788** | **1,263** (Kopf ab 320 m im Bett p 0,45–0,57) |
| CSIRO M 0,06 / 0,09 | 0,566 / 0,414 | 1,808 / 1,308 | 5,250 / 3,797 |

**Verhältnisse NACHHER** (R_Kopf · R_Stück · R_Zelle; CSIRO; Schwelle der Falsifikation):

| Paar | M 0,06 | M 0,09 | CSIRO | Schwelle |
|---|---|---|---|---|
| Wind 7,2 / 2,4 | 4,27 · 7,25 · 5,68 | 5,32 · 7,26 · 5,46 | 3,16 | ≥ 1,78 |
| Wind 24 / 7,2 | (0,69 ungültig) · **2,36** · 2,46 | **1,60** · 1,705 · **1,67** | 2,90 | ≥ 1,70 |
| Feuchte 0,06/0,09 bei 7,2 | 1,30 · 1,30 · 1,36 | | 1,383 (M 0,059/0,089) | ≥ √1,383 = 1,176 |
| Feuchte bei 2,4 · bei 24 | 1,62 · 1,57 · 1,36 · und (0,56 ungültig) · 1,76 · 1,87 | | 1,383 | — |

VORHER (Stub): Wind 7,2/2,4 R_Stück 5,88 (M 0,06) bzw. 4,61; **Wind 24/7,2 R_Stück 0,977 bzw. 0,879, R_Zelle 0,993 bzw. 0,991** —
der Sturm ändert vorher nichts. Feuchte bei 7,2: R_Stück 1,68, R_Zelle 1,95 (über die Welt-Nässe, nicht über den Ort).

**Der Wind-Deckel** (Anteil der gefangenen Zellen mit u > 0,9·I_R, feld-brand.js:330, `diag-tempo-glieder`): nachher 4 % / 15 % /
**100 %** bei 2,4 / 7,2 / 24 (M 0,06) und 9 % / 24 % / **100 %** (M 0,09); vorher 0 % / 49 % / 76 % bzw. 0 % / 80 % / 84 % (vorher
deckelt schon bei 7,2, weil leb 0,58 die Last und damit I_R senkt).

**Mutanten bei U₁₀ 7,2, M 0,06** (je 300 s, dieselben 9 Zündungen):

| Mutante | vorher | nachher (fest) | nachher (gesetz, die Welle) |
|---|---|---|---|
| (c) Wort „stormy“ | R_Kopf ±0 % (Bett-Ende), Zellen +11, Kern-R je Zelle bis **+724 %** | **0 %**, Zellen ±0, je Zelle 0 % | **0 %** |
| (c) Wort „sunny“ | R_Kopf **−100 %**, Zellen −49 | **0 %** | **0 %** |
| (d) `state.naesse` = 1 | M 0,06 → **2,56**, 0 Zellen | **ΔM 0**, R 0 % | **ΔM 0**, R 0 % |

**Punkt-Zündung nach 300 s (Bericht):** nachher L/B 4,73 (L 299 m, B 63 m, Kasten der Eintritte + 1 Zelle), vorher 1,97 (L 159, B 80).
Unabhängig: FCFDG 1992 (FBP O-1 Gras) L/B = 1,1·U^0,464 = 4,98 bei 25,9 km/h; Alexander 1985 (Wald) 3,33 — nachher 0,95× bzw. 1,42×.
Anderson 1983 steht selbst im Code (feld-brand.js:336) und ist darum kein Soll.

**Der Preis (Fall I, U₁₀ 7,2, M 0,06, 300 s; dieselbe Bühne, derselbe Behälter):**

| | vorher | nachher | Faktor |
|---|---|---|---|
| µs je Zelle und Welt-s, der ganze `_tickBrand` | 2,39–3,57 | 21,7–22,8 | × 6,4–9 |
| davon `_feuchteFenster` (M) | — | 756–764 ms von 854–899 ms (85–89 %) | |
| Front ohne M (Rest je Zelle·s, mit `_brandMalen`) | 2,4–3,6 (der ganze Takt) | 2,5–3,4 | ≈ 1 (Zitat feld-brand.js:458: 3,7) |
| Bett je neue Zelle (`_brandStoff`, 64 Punkte wo gemischt) | Median 50 µs, max 500 | Median 115 µs, Mittel 210, max 1 755 | × 2,3 |
| frisches Fenster je neue Zelle Gras (728–1 434 Schritte) | — | **Median 4,03 ms**, max 7,8 ms | |
| frisches Fenster Laub (1 473–2 874 Schritte) | — | Median 8,45 ms, max 11,2 ms | |
| ns je Schritt im Stamm | — | **3 789** (node-Skript des Entscheids im selben Behälter: 596) | × 6,4 |
| Memo-Treffer · Memo-Schritt +5 s | — | 5 µs · 5 µs (Uhr-Auflösung 5 µs) | |
| µs je Bild nach 300 s (120 Bilder, 1/60 s, Budget 0,25 ms) | Mittel 170, p95 485, max 915 (Saum 97) | **Mittel 197, p95 330, max 4 635** (Saum 207) | |
| µs je Bild nach 900 s | Mittel 107, p95 165, max 365 (Saum 80) | Mittel 170, p95 230, **max 4 150** (Saum 222) | |
| Rückstand der Brand-Uhr | ≤ 0,983 s | ≤ 0,983 s | |

BITGLEICH (Memo gegen frisches Fenster, Gras + Laub + Film, 50 Zellen × 41 Zeiten über Epochen-Grenzen): **4 100 / 4 100**,
größte Abweichung 0, davon 2 081 Proben nach einem Epochen-Wechsel.

**B4 „das Bett ist eine Funktion des Orts“:** dieselben 400 Zellen um den Ort, `_lastAm` der Kopie, der Spieler am Ort ↔ an der
Mess-Wiese (850 m) ↔ 4,2 km fern: **34 bzw. 38 von 400 Zellen ändern p·anteil um > 0,05, größtes |Δp| 0,99**, Mittel +0,036.
Ursache gelesen: das p der Wiese liest das Licht der stehenden Kronen `_bodenLichtFeld` (vegetation-wiese.js:43–72) aus
`wegeKarte.kronen` — einer Karte im Fenster um den Spieler (1 000 Kronen am Ort, 989 an der Mess-Wiese, 785 fern).

**Soll mit Herkunft:** CSIRO-Gras, natürliches Weideland, voll ausgehärtet (Cheney, Gould & Catchpole 1998), aus der Quelle im
Skript (`fall1.cjs` `csiro`): Probe U₁₀ 6, M 0,06 → 1,507 m/s. Schwellen 1,78 / 1,70 / 1,176 = halbe Log-Spanne von CSIRO (gewählt im
Entscheid). Das Feuer-Band R/R_CSIRO ∈ [0,5; 2] bei 7,2 (gewählt im Entscheid).

**Konstanten:**
- belegt: CSIRO-Gleichung (Cheney, Gould & Catchpole 1998); EMC (Simard 1968); τ 1 Prozess-h (Fosberg & Deeming 1971); ET₀
  (Allen et al. 1998, FAO-56 Gl. 53, u₂ = 0,748·U₁₀); M_sat 2,5 (Matthews 2006); FSP 0,35; mx Gras 0,12 (Anderson 1982 FM1 — dieselbe
  Quelle wie der Code: Zirkel für mx); L/B-Vergleich (FCFDG 1992 O-1; Alexander 1985).
- gewählt: U₁₀-Stufen 2,4/7,2/24 (die Zeilen × 24 m/s, EB1 offen); M-Ziele 0,06/0,09; Linie 10 Zellen; Fenster 120–300 s; Kreis
  1 000 m; RH_min 0,3; Tor 0,4/0,6; Mäander 0,485 (Grund: ±20° der Sprosse); `gruenSchwelle` 0,04; die Schwellen der Falsifikation;
  R_Stück [40 m, s₁] (Grund: das Bett endet vor dem Kopf des Sturms — benannte Abweichung vom Fenster 120–300 s).
- unsicher: Wind-Deckel 0,9·I_R (Andrews, Cruz & Rothermel 2013); Rn der ET₀; „Ep des Feinbrennstoffs = ET₀“.
- Keine Konstante wurde verändert, um ein Soll zu treffen.

**FALSIFIKATION (was das Gesetz widerlegt hätte · eingetreten?):**
- (a) Wind fließt nicht durch, R(7,2)/R(2,4) < 1,78 oder R(24)/R(7,2) < 1,70 bei einer Feuchte: **EINGETRETEN an EINER Stelle** —
  24/7,2 bei M 0,09: R_Kopf **1,60 < 1,70** (auf demselben Stück Bett 1,705, je Zelle 1,67). Bei M 0,06 nicht (R_Stück 2,36, je
  Zelle 2,46; R_Kopf 0,69 ist ungültig, der Kopf steht am Bett-Ende). 7,2/2,4 nicht (4,27 / 5,32). Ursache gemessen: der Weg der
  Kopplung bringt den Wind an die Zelle (U₁₀ am Ort 23,1–23,7 m/s), dort deckelt das Gesetz des Feuers in 100 % der Zellen (u >
  0,9·I_R). Gegen vorher: dort ist 24/7,2 = 0,98 (der Sturm wirkt gar nicht), nachher 1,60–2,46.
- (b) Feuchte fließt nicht durch, R(M 0,06)/R(M 0,09) < 1,176 bei 7,2: **nicht eingetreten** — 1,30 (R_Kopf), 1,30, 1,36.
- (c) das Wort ändert R um > 1 %: **nicht eingetreten** — 0,000 % (fest und gesetz); vorher −100 % / +724 % je Zelle.
- (d) die Welt-Nässe ändert R oder M: **nicht eingetreten** — ΔM 0, ΔR 0; vorher M 0,06 → 2,56.
- Ausbreitung hängt < 2× über den Wind-Bereich: nicht eingetreten (2,4 → 24: bei M 0,09 R_Kopf × 8,5; bei M 0,06 4,27 × 2,36 = × 10,1).

**Befund des Feuers (Bericht, kein Urteil über die Kopplung):** R/R_CSIRO bei 7,2 = **0,565 / 0,603** (im Band [0,5; 2], knapp);
bei 2,4 = 0,42 / 0,36 (die Entwürfe erwarteten 0,26); bei 24 = 0,33 (M 0,09; R_Stück bei M 0,06: 0,45) — die Entwürfe erwarteten
0,30–0,61. Vorher bei 7,2 (Stub): 0,13 / 0,20.

**Zirkel-Prüfung:** unabhängig ist CSIRO (nicht im Code) und L/B nach FCFDG/Alexander; aus dem eigenen Modell und darum ohne
Beweiskraft: die M-Werte (die Bisektion setzt sie über das Gesetz), mx (Anderson 1982 = Code), das L/B nach Anderson 1983 (im
Code), die Schwellen 1,78/1,70 (aus CSIRO abgeleitet, aber gewählt). Der Fall beweist den WEG (Wind und M am Ort erreichen R), nicht
die Physik des Feuers.

**Urteil Fall I: TRÄGT NICHT im Wortlaut** — (a) fällt an der Sturm-Stufe bei M 0,09 (R_Kopf 1,60 < 1,70), Ursache der
Wind-Deckel des Feuer-Gesetzes, nicht die Kopplung; (b), (c), (d) tragen mit Abstand. Dazu zwei Befunde gegen den Entscheid:
das Gras-Bett ist keine reine Funktion des Orts (34/400 Zellen hängen am Spieler), und der Preis von M im Stamm ist × 6,4 des
Entscheids (3,8 µs je Schritt, 4,0 ms je frisches Gras-Fenster, ein Bild bis 4,6 ms).

---------------------------------------------------------------------------------------------------------------------------
## Fall II — die feuchte Wiese stirbt gegen mx (gelaufen)

**Befehle** (Wanduhr): `node fall2.cjs fest` (14,1–20,2 s) · `node fall2.cjs vorher -705.515 -631.855 -61 -54` (16,1 s; der Kreis
und die Fackel-Zelle des Nachher-Laufs, gleiche Bedingung) · `node csiro.cjs` (< 1 s).

**Eingaben:**
- Herd = der Ort von Fall I (−1 128 | −984), der Spieler dort; Linien-Zündung 10 Punkte quer zu θ0 zur Zeit tIgn = 5 700 s (14 Uhr),
  Brand bis tIgn + 900 s.
- NACHHER: die Kopien + die Kontroll-Kopie im Kreis 1 000 m um die Mess-Wiese (bewoelkt, tor 0, P 0, U₁₀ 7,2, feuchte 0,0377 aus
  der Bisektion von Fall I → M_Gras am Herd 0,060). Kein Brand-Eintritt verließ den Kontroll-Kreis (0).
- Die Tat `wetter` direkt in `worldMeta.taten`: {Mitte (−705,5 | −631,9) = 550 m windab des Herds längs der mittleren Richtung
  50,2°, r 400 m, t0 = tIgn − 600 s, dauer 600 s, zeile regen}. Im Kreis gibt das Gesetz P = 0,6 · 0,834 = **0,50 mm/h** (gelesen:
  `_wetterAm` 0,500); M_Gras der Kreis-Mitte 0,068 vor der Tat → 2,166 nach 300 s → **2,454** am Ende (tIgn).
- Fackel-Reihe an der Zelle (−61 | −54) (200 m windab, ≥ 48 m im Kreis, leb·anteil 1,0): die Zeiten, zu denen das geladene Gesetz
  dort zuerst M ≤ f·mx gibt, f = 1,10 / 1,03 / 0,97 / 0,90; je Versuch ein leeres Feld, der Akt der Seite `_brandEntfachen` (der Akt,
  den `_fackelZuenden` ruft, kampf.js:2447).
- VORHER: die Originale, das Wort cloudy (U₁₀ 7,2), Nässe 0 (Stub); dieselbe Tat in `worldMeta.taten` (sie hat dort keinen Leser),
  derselbe Kreis, dieselbe Fackel-Zelle.

**Zahlen VORHER ↔ NACHHER:**

| Messgröße | Soll (Herkunft) | vorher | nachher |
|---|---|---|---|
| M_Gras der Kreis-Mitte am Ende des Regens | — | 0,060 (der Ort kennt keinen Regen) | 2,454 |
| Bett im Kreis (Zellen mit Mitte im Kreis, `_brandStoff`) | — | 32 / 1 958 (1,6 %), 0 mit leb·anteil ≥ 0,5 | 1 441 / 1 958 (74 %), 1 143 ≥ 0,5 |
| Zellen gesamt · Absagen | — | 101 · 34 (alle „kein Bett“) | 258 · 45 (28 kein Bett, 17 nass) |
| (1) Zündungen mit M(Ankunft) ≥ mx | **0** (Kopplung je Zelle und Zeit) | 0 (keine Zelle im Kreis erreicht) | **0**; frisch nachgerechnetes M gegen das gelesene: Abweichung 0 |
| Zellen im Kreis gezündet | — | 0 (das Bett endet bei 112 m, der Rand liegt bei 150 m) | 118 (alle nach ihrem t_mx) |
| (2) Quelle der Absage „nass“ (letzte verbrannte Zelle) ≤ 16 m vom Rand | ≥ 95 % der Randzellen | — | **16 / 17 = 94,1 %**; Abstand 0,7 / 1,8 / 18,3 m (min / Median / max) |
| (2) … > 32 m vor dem Rand · Absagen „nass“ außerhalb des Kreises | Falsifikation: > 5 % · Überlöschen | — | **0 / 17** · **0** |
| (3) Eintritt in den Kreis · t_mx am Kopf-Pfad (15 Zellen 150–214 m) | kein Eintritt vor t_mx | kein Eintritt | Eintritt **tIgn + 481,9 s**; t_mx **445 / 450 / 455 s**; Zellen im Kreis vor ihrem eigenen t_mx gezündet: **0 / 118** |
| (4) Fackel f = 1,10 | Absage „nass“ | „kein Bett“ (M/mx 0,50) | Absage (M/mx **1,089**, tIgn + 425 s) |
| (4) Fackel f = 1,03 | Absage „nass“ | „kein Bett“ | Absage (M/mx **1,015**, + 445 s) |
| (4) Fackel f = 0,97 | zündet | **zündet nicht** („kein Bett“) | **zündet** (M/mx 0,966, + 460 s) |
| (4) Fackel f = 0,90 | zündet | **zündet nicht** („kein Bett“) | **zündet** (M/mx 0,894, + 485 s) |
| Fackel gesamt | 4 / 4 | 2 / 4 im Ergebnis, 0 / 4 im Grund | **4 / 4** |

Der Gang von M/mx an der Fackel-Zelle nach dem Regen (je 60 s): 20,5 · 15,3 · 10,3 · 5,54 · 2,54 · 1,87 · 1,41 · 1,11 · **0,91** (480 s)
· 0,77 · 0,69 · … Tiefpunkt 0,559 bei 900 s, danach steigt M wieder (Abend der Prozess-Uhr). Die Stufe f = 1,03 trifft das 5-s-Raster
bei 1,015 (der nächste Schritt läge unter mx).

**Die Absage „mit Grund und Zahl“** („nass: M 0,131 über mx 0,12“) setzt hier die PROBE aus dem Protokoll zusammen; im Spiel sagt
die Fackel weiter nur `welt.fackel-faengt-nicht` (kampf.js:2448), die Ersetzung ist nicht gebaut. Der Grund ist gemessen, der Satz
an den Spieler nicht.

**Bericht des Feuers (CSIRO, `node csiro.cjs`):** oberhalb 12 % fällt φ_M linear statt auf 0; null wird es erst bei **20,0 %**
(U < 10 km/h) bzw. **24,0 %** (U ≥ 10 km/h). Bei U₁₀ 7,2 läuft Gras nach CSIRO bei MC 12 % noch mit 0,935 m/s, bei 15 % mit 0,70, bei
20 % mit 0,31 m/s — das Modell stoppt bei mx 12 %. Das betrifft das Gesetz des Feuers (die Erlöschungs-Feuchte), nicht die
Kopplung: nach CSIRO stünde t_mx der Fackel-Zelle nicht bei 455 s, sondern früher (M/mx 1,67 = 20 % bei ~330 s).

**Konstanten:** mx Gras 0,12 belegt (Anderson 1982 FM1 = Code: Zirkel); P_ref 0,834 FOLGT (Masse, Entscheid); zeile regen.rain
0,6 gesetzt (WX_GESETZ); r 400 m, dauer 600 s gewählt (Entscheid); Abstand 550 m und Rand 150 m gewählt (Auftrag); FSP 0,35,
M_sat 2,5 belegt; τ 1 Prozess-h belegt; Ep nach FAO-56 belegt, Rn unsicher; die 16-m-Grenze von (2) gewählt (eine Zelle; die
diagonale Nachbarin liegt 22,6 m entfernt). Keine Konstante verändert.

**FALSIFIKATION (was das Gesetz widerlegt hätte · eingetreten?):**
- eine Zündung mit M(Ankunft) ≥ mx (> 0): **nicht eingetreten** — 0 von 258, und das gelesene M ist bitgleich zur Neurechnung.
- ein Halt > 32 m vor dem Rand in > 5 % der Randzellen (Überlöschen durch Erbe): **nicht eingetreten** — 0 von 17, keine Absage
  „nass“ außerhalb des Kreises.
- Fackel ≤ 3/4: **nicht eingetreten** — 4/4.
- Eintritt vor t_mx: **nicht eingetreten** — Eintritt 481,9 s nach t_mx 445–455 s; 0 von 118 Zellen vor ihrem t_mx.
- Das Soll (2) „≥ 95 % ≤ 16 m“ ist **knapp verfehlt** (94,1 %: 1 von 17 Quellen liegt diagonal, 18,3 m) — das ist das Maß der
  16-m-Grenze gegen ein 16-m-Raster, nicht Überlöschen (die Falsifikations-Grenze 32 m hält mit 0 %).

**Zirkel-Prüfung:** mx ist eine Konstante des Modells, t_mx kommt aus dem Gesetz selbst — beides beweist nur die KOPPLUNG je Zelle
und Zeit (die Zelle liest IHR M zu IHRER Ankunft, die Nachbarin erbt nichts). Unabhängig sind nur die Örtlichkeit (der Halt liegt am
Rand des Kreises, den die Tat setzt, nicht anderswo) und die Ordnung (kein Eintritt vor dem Trocknen). Die Physik der Extinktion
prüft der Fall nicht; CSIRO widerspricht ihr (Bericht oben).

**Urteil Fall II: TRÄGT** — (1) 0, (3) kein Eintritt vor t_mx, (4) 4/4, Überlöschen 0; das Soll (2) ist mit 94,1 % gegen 95 % um
eine diagonale Zelle verfehlt (benannt, kein Bruch der Kopplung). Vorher kennt der Kreis keine Nässe (M 0,060 im Regen), sein Bett
fehlt zu 98 % und die Front erreicht ihn nicht.

---------------------------------------------------------------------------------------------------------------------------
## Fall III — die Regenfront über dem Brand (gelaufen)

**Befehle** (Wanduhr): `node fall3.cjs gesetz s` (12,8–13,7 s) · `node fall3.cjs gesetz ab <t_A>` für sechs t_A (12,3–13,1 s je
Lauf) · `node fall3.cjs vorher ab 538790` (11,4 s) · `node fall3.cjs vorher vs 530000` (10,7 s) · `node fall3.cjs gesetz cd 538140`
(14,0–14,3 s) · `node fall3.cjs vorher cd 538140` (10,6–11,7 s). Keine Seiten-Fehler in einem Lauf.

**Eingaben:**
- Modus `gesetz`: die Kopien, KEINE Kontroll-Kopie (die Welle selbst). Sommer (`autoSeason` aus, saisonNull 0,375), Saat
  „anazh-realm-seed“. θ0 = (0,607 | 0,795).
- A = der Ort von Fall I (−1 128 | −984), 850 m von der Mess-Wiese (≤ 3 km). B = A + 2 000 m · θ0 = (86,4 | 605,1), dasselbe q.
  Bett der Linie (leb·anteil je Zelle): A 0,24 / 0,38 / 0,80 / 0,93 / 1 / 1 / 1 / 1 / 1,00 / 0,39; B 1,00 ×4 / 0,98 / 0,81 / 0,59 / 0,15
  / 0,66 / 0,37. Der Spieler steht an A (bzw. C).
- Die Suche (Teil s): P, tor und M_Gras des geladenen Gesetzes an A je 5 s über [3 600; 720 000] s Welt = 200 Prozess-Tage.
- Herd A und B: Linien-Zündung (10 Punkte quer zu θ0) bei t_A − 300 s, der echte `_tickBrand` bis t_A + 400 s; t_A = Ende eines
  Brennfensters an A (erster 5-s-Schritt mit P > 0). Sechs Ereignisse (die sechs durch Regen beendeten Fenster mit dem größten P der
  folgenden 300 s); Hauptlauf t_A = 538 790 s (Fenster 538 135–538 790, P ≥ 0,45 ab t_A + 70 s).
- Herd C = A, gezündet bei t_C = 538 140 s (im selben Fenster); die Tat `wetter` direkt in `worldMeta.taten`: {Mitte C + 100 m · θ0
  = (−1 067,3 | −904,5), r 400 m, t0 = t_C + 300 s = 538 440, dauer 600 s, zeile regen} → P im Kreis 0,500 mm/h (gelesen). D = die
  Linie quer zu θ0 im Abstand 1 096 m (die nächste ab 1 km mit 10/10 Zellen Bett ≥ 0,5), 700,6 m außerhalb des Kreises. Bedingung
  gelesen: P an D über [t_C; t0 + 300] max **0**; P an C ohne die Tat über dieselbe Zeit max **0** (der Kreis ist der einzige Regen).
- VORHER: die Originale, der Spieler an A bzw. C. Je Brand-Schritt das Wort, das der Wetter-Zug am Spieler zu seinem Zug spräche
  (`_wetterAmOrt(x, z, 120 · ⌊t/120⌋)`, dirigent-takt.js:1734) über `_setWeather`, und `_naesseTakt(dt)` des Originals
  (bild-himmel.js:3060). Für C/D trägt der Zug am Spieler nie 600 s trocken (Teil vs, 200 Tage: trockene Läufe von 1 / 2 / 3 Zügen
  = 191 / 851 / 177, keiner länger als 360 s; Worte rainy 1 626, sunny 1 561, cloudy 1 243, foggy 864, stormy 676 von 5 970 Zügen) —
  das Brennfenster ist darum das gehaltene Wort „sonnig“, bei t0 spricht der Op `weather` „regen“ (feld-dsl.js:943 → das EINE Wort).

**Messgröße** (wie §7): Löschzeit = t_ext − t_Einsatz, t_Einsatz = erster 5-s-Schritt mit P > 0 an der Kopf-Zelle (der Zelle des
Herds mit dem weitesten Eintritt längs θ0), t_ext = erster Schritt ohne brennende Zelle im Kasten 1,4 km (A, B) bzw. 1,4 km × der halbe
Abstand C–D (C, D) um den Herd. Δt_ext = t_ext(B) − t_ext(A). „B wächst“ = neue Zündungen in B in (t_ext(A); t_A + 150]. „D wächst“ = neue
Zündungen in D in [t0; t0 + 300]. Die Massen-Schranke (mx − M₀)·w/(c·P) in DREI Lesarten (`schranke` in fall3.cjs): (i) Wortlaut, P
am Einsatz-Schritt der Kopf-Zelle; (ii) P des Bands (sturm 0,834 mm/h); (iii) integriert, der erste t mit ∫ c·P dt ≥ (mx − M₀)·w,
P des geladenen Gesetzes an der Kopf-Zelle je 5 s (dieselbe Erhaltung, für P(t) statt P konstant).

**Die Prämisse (Teil s) — der Wortlaut findet NICHTS:**

| Zählung an A, 200 Sommer-Tage | Zahl |
|---|---|
| Einsätze (P > 0 nach P = 0) · davon tor ≥ 0,9 beim Einsatz | 870 · 580 |
| … davon P ≥ 0,45 binnen 45 s · davon ≥ 482 s trocken davor · davon M < 0,09 | **0** · 0 · 0 |
| Brennfenster (P = 0 und M_Gras < 0,09, ≥ 300 s) · Länge Median / max | 130 · 665 / 855 s |
| … durch Regen beendet · davon P ≥ 0,45 binnen 300 s · davon tor ≥ 0,9 am Ende | 42 · 17 · **0** |
| tor am Ende der sechs Fenster · P der ersten 60 s · P ≥ 0,45 nach | 0,000–0,513 · 0,09–0,33 mm/h · 70–105 s |
| Anteil an A: P > 0 · P ≥ 0,1 · Gras brennbar (M < mx) · brennbar und U₁₀ ≥ 5 m/s · M < 0,09 | 37,1 · 27,1 · **18,7** · **10,0** · 12,4 % |

Grund: P = mix.rain · tor · P_ref und tor steigt stetig mit der feuchte — jedes Fenster endet am Saum des Bands im Niesel (P ab
0,000 mm/h), das Band (P ≥ 0,45) folgt 70–105 s später. Die 580 Einsätze mit tor ≥ 0,9 liegen in feuchter Luft, in der mix.rain
langsam steigt; keiner folgt einem Brennfenster. Gelaufen ist darum das gelockerte, BENANNTE Kriterium „Ende eines Brennfensters
durch Regen, P ≥ 0,45 binnen 300 s“ (gewählt).

**Zahlen VORHER ↔ NACHHER, Herd A und B (Hauptlauf t_A = 538 790):**

| Messgröße | Soll (Herkunft) | vorher | nachher |
|---|---|---|---|
| Zellen A · B | — | 26 · **0** (B: 0/10 Linien-Zellen Bett, 2 km vom Spieler) | 39 · 142 |
| Einsatz an A | — | Wort sunny → cloudy am Zug 538 800 (t_A + 10 s), Nässe 0,063 bei + 90 s | Kopf-Zelle 23 m windab: t_A + 5 s |
| Löschzeit A | [1; 3] × Schranke | 98 s nach dem Wort (t_ext t_A + 108 s) | **35 s** (t_ext t_A + 40 s) |
| Schranke (i) · (ii) · (iii), M₀ 0,089 | — | — | 164,8 s (P 0,006) · 1,12 s · **31,9 s** |
| Verhältnis (i) · (ii) · (iii) | [1; 3] | — | 0,21 · 31 · **1,10** |
| Löschzeit B · (iii) | [1; 3] × Schranke | B brennt nie | 35 s · 32,5 s → **1,08** |
| Δt_ext | 182 ± 20 s (2 000 m / zugMS 11 m/s) | nicht messbar (B ohne Bett) | **195 s** |
| B: neue Zellen in (t_ext(A); t_A + 150] · brennend | wächst | — | **3** · 108 → 97 |
| B erlischt binnen 60 s nach A | Falsifikation | — | nein, 195 s danach |

**Die sechs Ereignisse (nachher, je ein Lauf `gesetz ab <t_A>`):**

| t_A | Einsatz Kopf A | Löschzeit A · (iii) · Verh. | Löschzeit B · (iii) · Verh. | Verh. (i) A | Δt_ext | B neu | P ≥ 0,45 an A | t_ext(A) |
|---|---|---|---|---|---|---|---|---|
| 304 795 | + 10 s | 50 · 44,7 · 1,12 | 50 · 46,7 · 1,07 | 0,010 | 190 | 6 | + 95 | + 60 |
| 344 310 | + 20 | 45 · 39,1 · 1,15 | 45 · 39,7 · 1,13 | 0,165 | 185 | 7 | + 85 | + 65 |
| 369 610 | + 10 | 60 · 54,4 · 1,10 | 55 · 54,6 · 1,01 | 0,008 | 190 | 2 | + 105 | + 70 |
| 409 155 | + 15 | 35 · 32,2 · 1,09 | 35 · 33,5 · 1,04 | 0,226 | 185 | 7 | + 80 | + 50 |
| 434 430 | + 5 | 65 · 57,7 · 1,13 | 60 · 53,5 · 1,12 | 0,001 | 195 | 7 | + 100 | + 70 |
| 538 790 | + 5 | 35 · 31,9 · 1,10 | 35 · 32,5 · 1,08 | 0,212 | 195 | 3 | + 70 | + 40 |

- Δt_ext 185–195 s in 6/6. Mit dem Versatz der Köpfe (B steht 62–226 m weiter windab als A) sagt die Kinematik 187–202 s; gemessen
  liegt 2–7 s darunter (5-s-Raster, die letzte Zelle ist nicht immer der Kopf).
- A erlischt in 6/6 im NIESEL, 20–35 s bevor P ≥ 0,45 die Linie von A erreicht.
- „B wächst“ trägt nur dünn (2–7 Zellen, 1,4–5 % von B): der Kopf von B steht bei 233–264 m vor einer Bett-Lücke (0 Bett 16–48 m
  voraus, derselbe Ort in jedem Ereignis), und U₁₀ an den Zündungen von B fällt 185–345 s vor seinem Regen von 6–8 auf 1,1–2,2 m/s, mit dem
  Band steigt er wieder auf 4–8 m/s (Mittel je 40 s). Die Flaute vor dem Band misst kein Soll (Beobachtung, unsicher; siehe Rückwirkung).

**Zahlen VORHER ↔ NACHHER, Herd C und D (t_C = 538 140, Tat ab t0 = 538 440):**

| Messgröße | Soll (Herkunft) | vorher | nachher |
|---|---|---|---|
| Zellen C · alle im Kreis | — | 28 · ja | 143 · ja |
| Löschzeit C ab Tat-Beginn | [1; 3] × 3,24 s = [3,2; 9,7] s | 19 s (Wort regen; 5,2–5,9 × Schranke bei M₀ 0,060–0,066) | **5 s** (EIN 5-s-Schritt) |
| Schranke M₀ 0,066, P 0,500 (konstant: (i) = (iii)) · Verhältnis | — | — | 3,24 s · **1,54** |
| Bett von D | — | 0/10; **keine** Linie quer von 424 bis 1 400 m (0 von 62) trägt eine Bett-Zelle | 10/10 ≥ 0,5 |
| D: neue Zellen in [t0; t0 + 300] · am Ende | wächst | nicht zündbar | **67** · 183, brennt weiter |
| D erlischt mit C | Falsifikation | nicht messbar (D ohne Bett) | nein |

**Konstanten:**
- zugMS 11 m/s: gesetzt im Kern (WIND_FELD.front, phyto-core.js:4309–4310) — das Soll 182 s ist aus ihm gerechnet (Modell-intern).
- P_ref 0,834 FOLGT (Masse, Entscheid); zeile regen.rain 0,6 gesetzt (WX_GESETZ).
- c 0,823, w 0,166 kg/m², mx 0,12: belegt (Anderson 1982 FM1, Silhouette σw/(πρp)) — dieselben Zahlen wie im Modell.
- tor = smoothstep(0,4; 0,6; feuchte) gewählt (Entscheid). Das 5-s-Raster von `_wetterAm` und `_feuchteFenster` gewählt (Entscheid
  1.3) — es ist die Auflösung jeder Löschzeit.
- Prozess-Uhr × 24 folgt aus `PEGEL_TAG_S`.
- t0 = t_C + 300 s, Tat-Mitte C + 100 m · θ0, die Kästen 1,4 km, D ≥ 1 km mit ≥ 5 Bett-Zellen, das gelockerte Kriterium der
  Prämisse: gewählt (benannt). Mgrenz 0,09 aus dem Auftrag.
- Keine Konstante verändert.

**FALSIFIKATION (was das Gesetz widerlegt hätte · eingetreten?):**
- B erlischt binnen 60 s nach A: **nicht eingetreten** — 185–195 s danach (6/6).
- D erlischt mit C: **nicht eingetreten** — D wächst 67 Zellen und brennt 300 s nach dem Ende von C weiter.
- Δt_ext weicht > 20 s von 182 s ab: **nicht eingetreten** — 185–195 s, größte Abweichung 13 s (6/6).
- Löschzeit außerhalb [1; 3] × Schranke:
  - C (P konstant, die Formel gilt wörtlich): **nicht eingetreten**, 1,54.
  - A und B in der Wortlaut-Lesart (i): **EINGETRETEN**, 0,001–0,23 (6/6). Mit dem Band-P (ii): 31 (Hauptlauf).
  - In der Integral-Lesart (iii): nicht eingetreten, A 1,09–1,15, B 1,01–1,13. Die Lesart (iii) ist MEINE Lesung der Erhaltung bei
    P(t), keine verstellte Konstante, und sie ist ein Zirkel (unten). Gezählt wird: die SOLL-FORMEL mit konstantem P ist an der
    Rampe widerlegt, das Gesetz nicht.
- Die Prämisse selbst: Ein Band mit tor ≥ 0,9 nach einem Brennfenster kommt in 200 Tagen **0**-mal vor; A erlischt im Niesel vor
  dem Band (6/6).

**Zirkel-Prüfung:**
- Δt_ext: Das Soll 182 s ist die Kinematik des Kerns selbst (zugMS gesetzt). Es ist unabhängig von der Feuchte-Physik, aber nicht vom
  Modell: Es zeigt, dass das Löschen der Front des Kerns folgt, nicht, dass Fronten mit 11 m/s ziehen.
- Massen-Schranke: c, w, mx sind die des Modells. (iii) integriert dasselbe P, das das Modell liest. Das Verhältnis 1,01–1,15 misst
  den Mehrweg von `feuchteSchritt` (Interzeption, 5-s-Raster), nicht die Natur. Eine unabhängige Quelle für Löschzeiten im Regen
  trägt der Spike nicht (CSIRO hat keinen Regen-Term).
- Unabhängig sind die Örtlichkeit (D 700 m neben dem Kreis wächst; B brennt 185–195 s länger als A) und die Ordnung (A vor B,
  C vor D).

**Urteil Fall III: TRÄGT in Örtlichkeit und Kinematik, NICHT im Wortlaut der Prämisse und der Schranke** —
- B lebt 185–195 s länger als A (6/6), D wächst 700 m neben dem Regen-Kreis, die Löschzeit C liegt bei 1,54 × Schranke.
- Das Band mit tor ≥ 0,9 nach einem Brennfenster gibt es nicht (0 in 200 Tagen); A stirbt im Niesel vor dem Band.
- Die Schranke mit konstantem P fällt an der Rampe (0,001–0,23) und hält nur als Integral (1,01–1,15, Zirkel).
- „B wächst“ ist dünn (2–7 Zellen; Flaute 1,1–2,2 m/s vor dem Band und eine Bett-Lücke).
- Vorher lässt sich der Fall nicht einmal stellen: B und D tragen kein Bett (0/10 in 2 km, 0/62 Linien ab 424 m), und C stirbt 19 s
  nach dem Wort, das für die ganze Welt gilt (5,2–5,9 × Schranke).

---------------------------------------------------------------------------------------------------------------------------
## Rückwirkung auf den Entscheid

`entscheid.md` ist NICHT geändert. Zeilen nach dem Stand dieses Spikes.

**Falsch — zu korrigieren:**
- **:95–96, :105, :607 — die Prozess-Uhr beginnt NICHT am Mittag.**
  - Der Entscheid sagt: „Eine neue Welt beginnt bei tagNull 0,5, also am Mittag“, „beginnen beide am Mittag“, „weil die Welt-Uhr
    Mittag trägt“.
  - Der Code sagt: `_weltTag` liest `+tagNull || 0` (feld-leben.js:2604–2607), „Eine neue Welt beginnt bei 0“ (:2611);
    `_weltTagEichen` setzt tagNull nur für einen geladenen Stand.
  - Gemessen: in jedem Boot des Spikes tagNull = undefined, timeOfDay = 0,501. Der Prozess-Tag beginnt um Mitternacht, der
    Sicht-Tag am Mittag — 12 h Versatz in jeder neuen Welt. Die Zündzeiten des Spikes sind darum aus `_tagPhaseAm` der Kopie gelesen
    (5 700 s = 14 Uhr).
- **:472–476, :485–488, :494–496, :916 — der Preis ist × 6–14 zu klein** (Fall I, dieselbe Bühne vorher ↔ nachher):
  - Schritt: 431–554 ns → **3 789 ns** im Stamm. Das node-Skript des Entscheids misst im selben Behälter 596 ns; der Faktor 6,4 ist
    also der Stamm, nicht die Maschine.
  - Neue Gras-Zelle: 0,31–0,80 ms → **Median 4,03 ms, max 7,8 ms**. Laub: 0,62–1,60 ms → Median 8,45 ms, max 11,2 ms.
  - Je Zelle und Welt-s, der ganze Takt: **21,7–22,8 µs**, davon M 85–89 % (Entscheid :495: 10,7–12,7 µs).
  - Szene A nach 900 s (:485): 24–29 µs je Bild → **Mittel 170, p95 230, max 4 150 µs** (Saum 222 statt 134).
  - Ein frisches Fenster ist unteilbar: ein Bild trägt bis 4,6 ms gegen das Budget 0,25 ms. Die „Kappung ohne Verwerfen“ (:497–)
    kappt die Reihe, nicht das Fenster.
  - Kapazität (:496, :916): 15 000 µs je Welt-s / 21,7–22,8 µs = **660–690 Saum-Zellen bei 60 Hz** (330–345 bei 30 Hz) statt
    1 180–1 400 (590–700). Der Saum 2 000 von feuer#2 liegt × 2,9–3,0 darüber.
- **:76 und :401–403 — „27 % brennbar“ ist nicht bestätigt.** Gemessen an EINEM Ort (A), 200 Sommer-Tage, im Stamm:
  - Gras brennbar 18,7 % (Entscheid: 26,7–27,3 %);
  - brennbar und U₁₀ ≥ 5 m/s 10,0 % (Entscheid: 14,9–16,1 %);
  - Regen P > 0 37,1 % (:281: 32,9 %), P ≥ 0,1 27,1 % (:281: 29,0 %).

  Ein Ort ist nicht die Stichprobe des Entscheids. Der Wert bleibt unter `kopplung.anteil_brennbar` offen (:914).
- **:851–852 — die Prämisse von Fall III kommt nicht vor.** Ein Band mit tor ≥ 0,9 nach einem Brennfenster gibt es 0-mal in
  200 Tagen. Die Fenster enden im Niesel bei tor 0,000–0,513, das Band (P ≥ 0,45) folgt 70–105 s später.
- **:672 — A erlischt nicht im Band, sondern im Niesel davor.** Das geschieht 20–35 s, bevor P ≥ 0,45 die Linie erreicht (6/6).
  Δt_ext ist 185–195 s statt 182 s, weil B's Kopf weiter windab steht.
- **:866–868, :876 — die Schranke mit konstantem P passt nicht an der Rampe.**
  - Mit P am Einsatz ergibt sie 0,001–0,23 × (die Falsifikation ist im Wortlaut eingetreten). Mit Band-P ergibt sie 31 ×.
  - Sie muss als ∫ c·P dt = (mx − M₀)·w stehen; so gibt sie 1,01–1,15 (Zirkel).
  - Konstantes P gilt nur unter der Tat (C: 1,54).
- **:878 — die Löschzeiten 3,8 / 2,3 / 18,8 s sind im Stamm nicht sichtbar.** Das 5-s-Raster quantelt: regen gibt **5 s** (C). Jede
  Löschzeit unter 5 s erscheint als 5 s.
- **:317 — „Bett … überall als Funktion (B4 heilt)“ stimmt nur halb.**
  - Das Bett ist überall da: B in 2 km trägt 10/10 Zellen, D in 1,1 km ebenso. Vorher sind es 0/10 und 0/62 Linien ab 424 m quer; B4
    ist in main total.
  - Es ist aber keine reine Funktion des Orts: 34–38 von 400 Zellen ändern p um > 0,05 (max 0,99) mit dem Ort des Spielers, über
    `wegeKarte.kronen` (vegetation-wiese.js:43–72).
- **:800 (a) — fällt an einer Stelle:** R(24)/R(7,2) = 1,60 < 1,70 bei M 0,09.
  - Die Ursache ist der Wind-Deckel des Feuers (feld-brand.js:330, deckelt in 100 % der Zellen), nicht die Kopplung.
  - U₁₀ am Ort ist 23,1–23,7 m/s.
- **:832 (2) — die Grenze „≤ 16 m“ zählt die diagonale Nachbarin (22,6 m) als Verfehlung.** Gemessen sind 94,1 % statt ≥ 95 %;
  die Grenze 32 m der Falsifikation hält mit 0 %.

**Richtig — gemessen bestätigt:**
- :77 „Die Regenkante löscht sie dort, wo sie fällt, und 2 km weiter brennt es weiter“: Δt_ext 185–195 s (6/6). D wächst
  700 m neben dem Kreis um 67 Zellen.
- :808: R/R_CSIRO bei 7,2 liegt bei 0,565 / 0,603 im Band [0,5; 2] (knapp).
- :811: × 0,30–0,61 bei 24 m/s — gemessen 0,33.
- :475: das Zitat Front 3,7 µs. Ohne M misst die Front 2,5–3,4 µs je Zelle und Welt-s.
- Fall II, Kopplung je Zelle und Zeit: 0 Zündungen mit M ≥ mx, kein Eintritt vor t_mx, Fackel 4/4.
- Fall I (b), (c), (d): Feuchte fließt (1,30 ≥ 1,176). Das Wort und die Welt-Nässe ändern R um 0 %.
- Memo ↔ Neurechnung: bitgleich 4 100 / 4 100.

**Offen (mit Messnamen):**
- `kopplung.anteil_brennbar` (:914): die Welt-Stichprobe mit der EINEN Sonnenbahn. Ein Ort gibt 18,7 %.
- `kopplung.preis.us_je_bild` (:915):
  - auf GTX und Radeon im Spiel nicht gemessen; der Spike lief in headless Chromium auf der CPU des Behälters;
  - die Aufteilung des Faktors 6,4 auf `ortWetter`, `temperaturAus` und `et0` im Stamm ist nicht gemessen.
- `kopplung.rueckstand` (:651, :916): nach der Kapazität 660–690 neu zu setzen. In Fall I blieb die Brand-Uhr ≤ 0,983 s zurück.
- `brand.kopf_csiro` bei U₁₀ 24 (:902): der Wind-Deckel 0,9·I_R, unsicher.
- physik.feuer#1 (:714): die Absage „mit Grund und Zahl“ ist nicht gebaut (kampf.js:2448 sagt `welt.fackel-faengt-nicht`).
- Ohne Messnamen im Entscheid:
  - kronenDeckungAm und das Laub-Bett (kein Fall misst Laub);
  - die Erlöschungs-Feuchte mx 12 % gegen CSIRO, wo φ_M erst bei 20 / 24 % null wird (das Gesetz des Feuers);
  - die Flaute vor dem Band (U₁₀ 1,1–2,2 m/s am Herd, 185–345 s vor seinem Regen), für die der Spike kein Soll und keine Quelle
    trägt.
