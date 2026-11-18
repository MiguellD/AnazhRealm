# RECHNUNG 2 — die Trennung diffus/leuchtend und die Kurve nach Leuchtdichte

Stand: gelesen über git (`origin/main`, `2ce8a033d`), gerechnet mit node. Kein Bau, keine GPU, keine Änderung im Repo.
Skripte und Ausgaben in diesem Ordner: `r1-trennung.cjs` → `r1-trennung.out.txt`, `r2-kurve.cjs` → `r2-kurve.out.txt`.
Die gewählte Kurve steht in `kurve.js`: `schirm`, `kGrenze`, `WGSL`.

**Urteil.**
1. Die Trennung fällt dem Weg **C** zu. Jeder leuchtende Stoff setzt ein Strahler-Bit in das schon bestehende r8-Glanz-Ziel des
   Szenen-Passes. Dazu kommen der Glanz-Riegel L ≤ ρ_max/π·E_Gesetz und eine volle min-Reduktion der Kappe. C trifft in allen 102
   gerechneten Sichten die wahre Kappe auf 0,00 EV und springt nie. Die anderen Wege fehlen so:
   - A (rein analytisch) liegt immer 1,7–3,2 EV zu dunkel, springt um 5,4 EV, wenn die Quelle das Bild verlässt, und bindet am Mittag
     ohne Grund (Karte 116 → 100).
   - Die alte Probe P0 lässt Glutbett und Kopf-Glas als „diffus“ durch (bis +4,65 EV).
   - Jede ⅛-Probe verfehlt den Steinring aus 25 m (−5,3 EV, Flimmern 1,14 EV).
2. Die Kurve fällt **K1** zu. Y_aus ist die Neutral-Kurve auf Grau, angewandt auf Y. Der Farbton ist der Oklab-Farbton der Eingangsfarbe,
   die Buntheit fällt bei fester Y bis an den sRGB-Rand. Ergebnis:
   - Umkehrungen: 0 in Fließkomma und 0 jenseits der 8-Bit-Rundung, gegen 1 063 der Entscheid-Kurve.
   - Farbton-Drift 0,00°, Grau 0 Code gegen Neutral, Mittags-Karte 118.
3. Offen und mit Preis benannt: Der Satz in §2.0 erzwingt den Fuß des Graus auch für dunkle bunte Flecke, bis −3 EV bei Y 0,02 gegen
   heute. Satt-Orange verlässt sRGB ab Y_aus 0,26 (1 100 K) bzw. 0,40 (2 000 K), deshalb steht die Lava-Scholle unter der Kappe
   fast weiß (255/241/236). Alle Sichten sind gewählte Geometrie, keine Zahl stammt vom Gerät.

---

## RECHNUNG 1 — die Trennung

### 1.0 Die Kappe folgt der Kurve

Unter K1 wird ein Fleck nicht gestaucht, solange zwei Bedingungen gelten: Y' < 0,76 (Y-Schulter) und der hellste Ausgabe-Kanal ≤ 1
(Gamut). Im linearen Teil des Fußes (k·Y ≥ 0,08) heißt das je Pixel:

    kGrenze(L) = min( 0,80 / Y ,  1/R + 0,04 / Y )        (R = hellster Kanal, Y = Leuchtdichte, beide cd/m²)
    k_c        = min über die diffusen Pixel von kGrenze

Für Grau ergibt das 0,80/Y, also dieselbe Grenze wie Neutral (Peak − 0,04 = 0,76).
Weil das Szenen-Ziel x = L·k_alt trägt, gilt kGrenze(L) = k_alt · kGrenze(x). Der Rechen-Durchgang liest also x direkt.

### 1.1 Die Wege

| Weg | Was er liest | Ausschluss der Quelle | Ausschluss von Spiegelungen |
|---|---|---|---|
| **A** analytisch | nur Datum: je Pool-Quelle der nächste erreichbare Punkt außerhalb ihrer eigenen Fläche, ρ_max, Normale zur Quelle. Herd: Bett-Rand, 0,52 m vom Lichtpunkt, 606 lx. Lava: senkrecht am Rand der Decke, 0,5·π·L = 9 780 lx. Laterne: Wand in armM 0,4 m mit kopfSicht, 6,2 lx. Dazu Mond und Himmel. Eine Quelle zählt, wenn ihr naher Punkt im Bildfeld liegt und ≥ ½ Pixel groß ist. | durch Konstruktion | — |
| **P0** Probe des Entscheids | ⅛-Proben (180 × 101), Maximum | keiner; diffus ⇔ L ≤ ρ_max/π·E_Gesetz(p) | dieselbe Schranke |
| **B ⅛ / B voll** | Bild, ⅛-Proben bzw. jedes Pixel | Strahl schneidet die Geometrie einer Pool-Quelle: Bett-Scheibe r 0,38 (Datum), Flammen-Zylinder, Decken-Maske, Kopf-Kiste | Glanz-Riegel L ≤ ρ_max/π·E_Gesetz |
| **C voll** | Bild, jedes Pixel | **Strahler-Bit des Stoffs** im Glanz-Ziel | Glanz-Riegel |

### 1.2 Tafel (Fehler = log2(k_wahr / k_Weg) nach k = min(k_a, k_c); + = Bild zu dunkel, − = diffuse Flecke in der Schulter)

Szenen-Ziel 1 440 × 810 (Skala 0,75), vFOV 75° (KAM_FOV_GRAD). Die wahre Leuchtdichte je Pixel trägt den Schatten des Steinrings.

| Reihe (Sichten) | wahr: k · hellster diffuser Fleck | A | P0 | B ⅛ (Flimmern über 8 TRAA-Phasen) | B voll | C voll |
|---|---|---|---|---|---|---|
| herd-nah 1–3 m, Bett 1 100 K, Bild-Anteil des Betts 2,5 → 0,4 % (11) | 0,0121 · **Ring innen** | +2,10 | +0,26 (Glutbett) | ≤ 0,01 (0,02) | 0,00 | 0,00 |
| herd-nah, Bett 1 200 K (6) | 0,0121 · Ring innen | +2,10 | **+2,31** (Glutbett) | ≤ 0,01 | 0,00 | 0,00 |
| herd-nah, 1 200 K, gezeichnetes Bett 4 cm breiter als das Datum (6) | 0,0121 | +2,10 | +2,31 | +2,24 | **+2,24** | 0,00 |
| herd-nah ohne Schatten des Rings (6) | 0,0121 | +2,10 | +0,26 | ≤ 0,01 | 0,00 | 0,00 |
| herd 2 m, Feuer dreht aus dem Bild (19) | 0,0121 → 0,182 | +2,10 … **−3,28**, Sprung **5,38** | Sprung 0,17 | ≤ 0,03 | 0,00 | 0,00 |
| herd-fern 20–30 m (11) | 0,0121–0,013 · Ring innen | +2,10 … +2,20 | **−3,35 … −5,30**, Sprung 0,53 | −3,32 … −5,72, **Flimmern 1,14** | 0,00 | 0,00 |
| lava-nah 2–4 m, Spiel-Daten (11) | 1,35·10⁻³ · Ufer am Rand | +3,18 | ≤ 0,01 | ≤ 0,01 | 0,00 | 0,00 |
| lava 3 m, Decke dreht aus dem Bild (11) | 1,35·10⁻³ | +3,18 | ≤ 0,01 | ≤ 0,02 | 0,00 | 0,00 |
| gasse-nacht 4–8 m vor dem Kopf (9) | 0,79 · **Wand hinter dem Kopf** | +1,67 | **+4,65** (Kopf-Glas) | −0,32, Sprung 0,30 | 0,00 | 0,00 |
| gasse, Kopf dreht aus dem Bild (13) | 0,79 → 2,15 (Schlüssel) | +1,66, Sprung 1,66 | +4,66 … −0,13, Sprung **4,79** | −0,37 (0,14) | 0,00 | 0,00 |
| Mondwiese ohne Quelle | k_a 2,15; Kappe 35, bindet nicht | bindet nicht | = wahr | = wahr | = wahr | = wahr |
| Mittag, Mess-Wiese | k_a 3,28·10⁻⁵; Kappe 1,19·10⁻⁴, bindet nicht | **bindet: +0,37 EV**, Karte G 116 → 100 | = wahr | = wahr | = wahr | = wahr |

Der Glanz-Riegel hat in keiner Sicht einen diffusen Pixel fälschlich ausgeschlossen. Seine Bestrahlung ist am Ort des Halms gerechnet,
0,2 m über dem Boden (siehe Signatur).

### 1.3 Urteil je Weg

- **A — fällt.**
  - Fehler +1,7 bis +3,2 EV in jeder Sicht mit Quelle; das Bild ist so viel zu dunkel. Davon trägt log2(0,82/ρ_wahr) allein
    1,6–3,0 EV, den Rest die Geometrie.
  - Er schätzt verdeckte und gar nicht vorhandene Flecke als hell: Er nimmt eine ρ_max-Fläche am Rand der Quelle an, ohne Schatten.
  - Er kippt mit dem Bildfeld: Das Feuer verlässt das Bild, der Ring bleibt drin, und A springt um 5,38 EV auf −3,28 EV.
  - Am Mittag bindet er ohne Grund: Er nimmt eine weiße Fläche im vollen Sonnenlicht an. Das ergibt +0,37 EV, die Karte fällt von
    G 116 auf G 100, die Tag-Eichung reißt.
  - Preis: < 5 µs CPU.
- **P0 — fällt** (die Diffus-Probe des Entscheids, jetzt am Maximum).
  - Die Klasse R2 gilt für jede Quelle, die heller vom eigenen Licht beschienen ist, als sie leuchtet:
    - Glutbett: +0,26 EV bei 1 100 K, +2,31 EV bei 1 200 K.
    - Kopf-Glas: 13,4 cd/m² gegen eine Schranke von 21 cd/m², also +4,65 EV.
  - Dazu verfehlt die ⅛-Probe den Ring aus der Ferne.
- **B ⅛ — fällt.**
  - Der leuchtende Innenrand des Rings ist aus 25 m 2–3 Pixel hoch. Ein Raster im Schritt 8 trifft ihn nicht immer: Fehler bis
    −5,72 EV und Flimmern über die TRAA-Phasen bis 1,14 EV. Die Kurve lässt dann das Gras in 1–2 m bis 5 EV in die Schulter laufen.
  - In der Gasse gibt es Sprünge bis 0,30 EV, weil der helle Fleck hinter dem Kopf klein ist.
  - Die Auflösung ist hier ein Teil des Gesetzes, kein Preis-Regler.
- **B voll — fällt als Zwilling.**
  - Er ist genau, solange die Geometrie des Datums die gezeichnete ist. 4 cm Versatz am Bett (1 200 K) ergeben +2,24 EV.
  - Er kennt nur die ≤ 4 Pool-Plätze und die Decken-Maske, keine Fenster, Tore, Funken oder Augen.
  - Er hält also eine zweite Beschreibung der leuchtenden Fläche neben der, die das Bild malt.
- **C voll — gewählt.**
  - Das Bit schreibt derselbe Stoff, der die Leuchtdichte malt. Ausgeschlossen wird also genau, was leuchtet, ohne Geometrie und ohne
    Liste.
  - 0,00 EV in 102 von 102 Sichten, Sprung 0, Flimmern 0.
  - Verdeckte Flecke schätzt er richtig, weil er das Gezeichnete liest. Verdeckt ist auch das Glutbett ohne Wurf oder das Gras im
    Schatten des Rings: beide mit und ohne Schatten 0,00.

### 1.4 Drei Befunde der Geometrie (G: die Sichten sind gewählt, die Maße aus dem Datum)

- **Herd:** Der hellste diffuse Fleck ist der **Innenrand des Steinrings** auf der fernen Seite. Er ist der Flamme zugewandt, AUS_MASS
  feuerstelle rt 0,58 · hR 0,13, ρ Fels (G). Damit k_c 0,0121.
  - Dreht der Ring aus dem Bild, setzt das Gras in 1,06 m das k: 0,124, also **3,4 EV** heller.
  - Das Bild am Herd hängt damit an Albedo und Sichtbarkeit der Ringsteine; der Spike rechnete ohne Ring.
  - Das Glutbett steht bei k·L 0,24. Unter K1 bleibt es satt: 225/66/0.
- **Gasse:** Mit kopfSicht ist die Wand unter dem Kopf dunkel, denn der Boden des Kopfs schneidet unter 51°. Hell ist die **Wand hinter
  dem Kopf** in 0,4 m: 6,2 lx. Die Kappe bindet mit 0,79 gegen die offene Blende 2,15, die Gasse steht also **1,45 EV** dunkler, als
  der Spike rechnete (dort war die Kappe offen).
- **Lava:** Der hellste diffuse Fleck ist der Halm am Rand der Decke: 8 721 lx, exakt in ρ gerechnet. Daraus k 1,35·10⁻³.
  - Die Scholle (1 326 K, 858 cd/m²) steht bei k·L 1,16.
  - Unter K1 ist sie fast weiß, 255/241/236; unter der Entscheid-Kurve wäre sie 251/169/136 (Preis von K1, §2.4).

### 1.5 SIGNATUR — die Kappe (Weg C)

    Stoff (Bahn Q/W):  jeder leuchtende Stoff schreibt glanz' = (127·glanz + 128·s)/255, s = 1, in das r8-Ziel `glanz` des
                       Szenen-Passes (bild-kosten.js:2261 main, `_glanzKnoten` bild-sicht.js:664). Leuchtend sind:
                       M.feuer/Glut, Laternen-Glas, Fenster, Lava-Decke (je Pixel: Decken-Byte > 0, derselbe Leser wie das Bild),
                       Brand-Flamme, Funken, Tor, Fahrzeug-Leuchten, Tier-Augen.
                       Der eine Leser des Glanzes (`_spiegelPass`) dekodiert g = (255·v − 128·s)/127, s = v ≥ 0,5.
    Auge (Bahn A):     _augeKappe(szene: rg11b10, tiefe, glanz: r8, pool, k_alt) → k_c     (ein Rechen-Programm, volle Auflösung)
                       je Pixel: s = 1 oder Tiefe = fern → aus.
                                 p aus der Tiefe; p_licht = p + 0,2·ŷ, wenn der Stoff Halm ist (Volumen-Leser, sonst p).
                                 E = Σ_Platz I·kopfSicht/(d² + k²) + Scheibe |F| + E⊥☉ + E⊥☾ + π·L_Himmel,max
                                     (dieselben Uniforms wie `_lichtPlatz`, ohne Schatten = obere Schranke).
                                 Y(x)/k_alt > ρ_max/π · E → aus (Spiegelung).
                                 sonst kg = k_alt · min(0,80/Y(x), 1/R(x) + 0,04/Y(x)).
                       je 8×8-Kachel min im Gruppenspeicher, dann atomicMin auf die u32-Bits des positiven f32.
                       Rücklesen über einen Ring von 3 Puffern (mapAsync, 1–3 Bilder Verzug).
    _augeTakt:         k = min(k_a, k_c); τ hell 0,3 s / dunkel 0,8 s.
    Preis:             0 Byte VRAM (das Glanz-Ziel besteht, 1,17 MB). Ein Rechen-Durchgang ≈ 0,15 ms auf der GTX 1050
                       (10,5 MB Lesen + ≈ 70 ALU je Pixel, GESCHÄTZT). CPU ≈ 0. Die Zahl der Quellen ist frei: das Bit kennt jede.
    Linse (Bahn L):    Absenz-Grep: jeder Stoff mit Emission ≠ 0 trägt das Bit. Mutant „Bit aus am Glutbett“ → (b) rot an herd-nah.

---

## RECHNUNG 2 — die Kurve

### 2.0 Der Satz, der die Kurve festlegt

(a) verlangt für alle Farbpaare: Y_ein₁ > Y_ein₂ ⇒ Y_aus₁ ≥ Y_aus₂.
1. Hätten zwei Farben gleicher Y_ein verschiedene Y_aus, kehrte eine beliebig kleine Hebung der dunkleren die Ordnung um. Also gilt
   Y_aus = g(Y_ein), mit g monoton.
2. Grau muss Neutral laufen. Daraus folgt: **g ist die Neutral-Kurve auf Grau.**
3. Fuß und Schulter jeder Farbe sind also die des Graus gleicher Leuchtdichte.

Die Entscheid-Kurve E und K2 brechen das mit Peak-Schulter bzw. Min-Fuß; K3 bricht es in Fließkomma (30 Paare, bis 0,11 EV), weil Oklab-L nicht Y ist.

### 2.1 Tafel — Monte Carlo

Gleiche Saat und gleiche 39 607 Paare wie widerleger-annahmen.cjs: Planck 1 100–5 772 K × 7 Albedos × k·L 2⁻⁶ … 2⁴. Die Ausgabe-Y
ist nach 8 Bit gemessen.

| Kurve | Umkehrungen nach 8 Bit | > 0,1 EV | jenseits der Rundung (dunklere ab-, hellere aufgerundet) | größte dort | in Fließkomma | Oklab-Drift max (Fließkomma) | Grau 0…4 gegen Neutral |
|---|---|---|---|---|---|---|---|
| Vendor-Neutral | 1 057 | 798 | 942 | 2,28 EV | 1 064 | 16,5° | 0 Code |
| E Entscheid (Peak-Schulter + Oklab-h) | 1 063 | 776 | 964 | 2,67 EV | 1 064 | 0,0° | 0 Code |
| **K1** Y-Kurve, Oklab-h, σ, Gamut bei fester Y | 31 | 23 | **0** | — | **0** | **0,0°** | **0 Code** |
| K2 Peak-Schulter, Fuß nach Y | 433 | 312 | 365 | 0,58 EV | 394 | 0,0° | 0 Code |
| K3 Y-Kurve, Gamut bei festem Oklab-L | 77 | 40 | 0 | — | 30 (bis 0,11 EV) | 0,0° | 0 Code |

Die 31 Umkehrungen von K1 sind reine Rundung im tiefen Fuß: Die höchste Ausgabe-Y liegt bei 0,0009, und jede verschwindet bei
günstigster Rundung.

Oklab-Drift nach 8 Bit an Planck 1 100/1 326/1 900/2 000 K × Gras/Putz (haus)/weiß × k·L 0,05…16: K1 höchstens 2,3°, jeweils unter
Δh_tol am Pixel (0 von 82 darüber). Neutral liegt an 91 von 132 Pixeln über Δh_tol.

Die Mittags-Karte 0,22 gibt unter jeder Kurve 118/118/118. Im Sonnenlicht (5 772 K) gibt Neutral 125/116/112, K1 123/116/113. Eine
fast graue Fläche (Sonnen-Farbe) im tiefen Fuß (k·L 0,018) weicht um bis 9 Code von Neutral ab; Neutral zieht dort nach dem kleinsten
Kanal ab.

### 2.2 Das Bild der Feuerfarbe (sRGB, Oklab C · h)

| Eingang | k·L 0,3 | 0,76 | 1,5 | 4 | 16 |
|---|---|---|---|---|---|
| Glut 1 100 K, K1 | 253/75/0 (0,22 · 37°) | 255/211/199 (0,05 · 36°) | 255/246/244 | 254/253/252 | 255/255/255 |
| Glut 1 100 K, E | 244/88/39 | 251/145/114 | 253/181/160 | 254/219/209 | 255/244/242 |
| Glut 1 100 K, Neutral | 244/86/48 (35°) | 252/142/128 (28°) | 254/179/171 (26°) | 255/218/215 (23°) | 255/244/243 (24°) |
| Herd 2 000 K, K1 | 210/115/15 (0,15 · 58°) | 255/213/182 (0,06 · 58°) | 255/247/241 | 255/253/252 | 255/255/254 |
| Herd 2 000 K, E | 223/121/4 | 247/159/89 | 249/185/138 | 251/217/193 | 254/243/236 |
| Feuer × Gras, K1 | 195/124/6 (70°) | 254/214/169 (70°) | 255/247/239 | 255/253/251 | 255/255/254 |

- **Neutral wird Rosa:** Der Farbton dreht von 35° nach 23°.
- **K1 bleibt im Farbton und sättigt aus.** Bei 1 100 K ist es lachsrot, bei 2 000 K aprikose, Feuer × Gras bleibt orange-gelb. Am
  Ende steht Weiß, ohne Rosa und ohne Gelb-Stich.
- K1 wird **früher** hell als E, denn die Ordnung verlangt Y_aus = g(Y_ein): Ein Glutfleck mit Y_ein 0,76 muss Y_aus 0,72 tragen, und
  dort hat sRGB für Orange keinen Platz.

### 2.3 Wo die Farbe den Gamut verlässt, und was K1 tut

Der Gamut-Rand liegt bei Y_aus = 1 / (hellster Kanal der Farbe bei Luma 1):

| Farbe | hellster Kanal/Y | Rand bei Y_aus (Y_ein) | σ_aus/σ_ein bei k·L 0,5 · 0,76 · 1 · 2 · 4 |
|---|---|---|---|
| Glut 1 100 K | 3,78 | 0,264 (0,304) | 0,48 · 0,17 · 0,06 · 0,01 · 0,01 |
| Kruste 1 326 K | 3,32 | 0,302 (0,342) | 0,55 · 0,20 · 0,08 · 0,02 · 0,01 |
| Herd 2 000 K | 2,48 | 0,404 (0,444) | 0,82 · 0,30 · 0,12 · 0,03 · 0,01 |
| Feuer × Gras | 2,10 | 0,477 (0,517) | 1,00 · 0,38 · 0,15 · 0,04 · 0,02 |

- Bis zum Rand ist K1 eine reine Skalierung: Farbton und σ = C/L bleiben exakt.
- Über dem Rand hält K1 Y und Farbton und senkt σ, bis der hellste Kanal 1 ist. Kein Kanal fällt unter 0: 0 Fälle im Monte Carlo.
- Über der Y-Schulter (Y' ≥ 0,76) senkt Khronos σ zusätzlich um (1 − g).

### 2.4 Der Preis des Satzes (sRGB Neutral ↔ K1)

| Fleck | Y 0,006 | 0,02 | 0,05 | 0,08 | 0,15 | 0,3 |
|---|---|---|---|---|---|---|
| Laternen-Wand (1 850 K × Putz) | 39/8/0 ↔ 3/0/0 (−4,7 EV) | 74/21/0 ↔ 23/3/0 (−3,0) | 115/38/0 ↔ 65/18/0 (−1,7) | 143/49/0 ↔ 103/33/0 (−1,0) | 190/68/0 ↔ 165/58/0 (−0,45) | 242/95/37 ↔ 242/89/0 (−0,07) |
| Mond-Wand (4 100 K × Putz) | 28/8/0 ↔ 2/1/0 | 55/23/1 ↔ 17/6/2 (−2,5) | 88/41/4 ↔ 52/27/14 (−1,2) | 110/54/11 ↔ 84/47/28 (−0,6) | — | — |

Heute trägt Neutral jede satte dunkle Farbe am Fuß vorbei, weil es nach dem dunkelsten Kanal abzieht; genau das sind die 486
Fuß-Umkehrungen. K1 legt sie auf den Fuß des Graus. Ein orange beleuchteter dunkler Fleck wird darum so dunkel wie ein grauer gleicher
Leuchtdichte. Unter Y 0,08 kostet das 1–5 EV gegen heute.

An den Kappen von Rechnung 1 (Werte K1 · E):
- Glutbett herd-nah 225/66/0 · 237/74/15.
- Lava-Scholle 255/241/236 · 251/169/136.
- Kopf-Glas der Gasse 255/254/254 · 253/238/228.

### 2.5 SIGNATUR — die Kurve (K1)

    JavaScript:  kurve.js  schirm(x: [r,g,b] lineares sRGB × k) → [r,g,b] linear vor der OETF;  kGrenze(Lrgb) → k (Rechnung 1)
    Formel:      Y = 0,2126 r + 0,7152 g + 0,0722 b
                 p = Y − (Y < 0,08 ? Y − 6,25Y² : 0,04)
                 p < 0,76:  Y_aus = p,  g = 0
                 sonst:     Y_aus = 1 − 0,0576/(p − 0,52),  g = 1 − 1/(0,15(p − Y_aus) + 1)
                 (l',m',s') = ∛(M₁·x);  L, a, b = M₂·(l',m',s');  h = (a, b)/C;  σ = (C/L)·(1 − g)
                 rgb₁(σ) = M₃·((1 + σ·k_l·h)³, (1 + σ·k_m·h)³, (1 + σ·k_s·h)³)      [Oklab bei L = 1, geschlossen]
                 passt(σ) ⇔ max(rgb₁)·Y_aus ≤ Y(rgb₁) ∧ min(rgb₁) ≥ 0
                 wenn nicht passt(σ): 8 feste Halbierungen auf [0, σ], dann EINE Sekante auf dem Überschuss des hellsten Kanals
                 aus = rgb₁(σ) · Y_aus / Y(rgb₁(σ))      — Y exakt, Farbton exakt
    WGSL:        kurve.js `WGSL` (fn schirm, okEins, passt; ausgerollt im Knoten-Bau, keine Suche nach L)
    Ort:         der Ausgabe-Knoten (`pp.outputNode`, bild-kosten.js main), renderer.toneMapping = NoToneMapping
    Genauigkeit: 8 Halbierungen + 1 Sekante gegen 40 Halbierungen ≤ 1 Code (300 000 Farben); 7 allein lagen bis 4 Code daneben.
    Preis:       ≈ 70 ALU je Pixel ohne Gamut-Schnitt, ≈ 400 mit; 1,17 Mpx → 0,05 ms bzw. höchstens ≈ 0,26 ms (GESCHÄTZT).
                 Den Schnitt zahlen nur Pixel über dem Gamut-Rand.

---

## UNSICHER und nicht gerechnet (benannt)

- **Geometrie und Stoffe der Sichten sind gewählt (G).**
  - Fels-Albedo des Rings, Asche als ATMO_BODEN.
  - Flamme als undurchsichtiger Zylinder (im Spiel durchsichtig: C braucht das Bit auch im Transparent-Durchgang).
  - Häuser 8 m, Fenster je 4 m, Baumlinie 20 m.
  - Die wahren Leuchtdichten sind Modell, kein Bild. Die Befunde „Ring innen“ und „Wand hinter dem Kopf“ sind zu prüfen.
- Spiegelungen: In meinen Szenen gibt es keinen GGX-Glanz. Für raue Dielektrika gilt nach Abschätzung, nicht im Bild gerechnet:
  Glanz-Spitze ÷ diffus ≈ F0/(4α²ρ). Fels mit Rauheit 0,5 ergibt +0,68 EV, Gras mit 0,6 ergibt +0,82 EV, unter dem Riegel und also
  mitgelesen; am streifenden Blick mehr. Der Riegel schließt nur Spitzen über ρ_max/π·E aus: Sonnen-Glitzer auf Wasser und Metall.
- Nicht am Code geprüft:
  - ob r184-TSL im Rechen-Programm rg11b10, die Tiefe und das r8-Glanz-Ziel zugleich lesen kann und `atomicMin` auf einem
    Speicher-Puffer trägt;
  - ob jeder leuchtende Stoff (Funken, Tor, Augen, Brand) das Glanz-Ziel ohne Mischung schreibt.
- Das Halm-Offset des Riegels: Ohne den Licht-Ort des Volumen-Lesers (p + 0,2 m) fiele die Schranke am Ufer gegen 0, und der Riegel
  schlösse das Gras aus.
- WGSL: `pow(0, 1/3)` ist undefiniert, der Code verlässt sich auf 0. `p − 0,52` → 0 wird weggewählt, erzeugt aber vorher ein Inf.
  Beides ist nicht am Gerät geprüft.
- Bloom, TRAA (außer den 8 Phasen der ⅛-Probe), `graded`, das Nacht-Auge (mesopisch) vor der Kurve: nicht gerechnet. Δh nachts gilt
  nur gegen die mesopische Erwartung.
- Kein Bild, keine Zahl am Gerät; alle ms sind gezählt, nicht gemessen.
