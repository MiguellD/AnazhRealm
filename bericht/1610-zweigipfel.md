# Bericht 1610 Zweigipfel — Genesis Ego je Boot langsam oder schnell (GTX 1060)

**Status: ZWISCHENSTAND.**

**Ergebnis:**

1. **Der langsame Gipfel ist die Bau-Klasse.** Zerlegung an main 210fe8a7, je ein Boot, dieselbe Kamera:

   | | schnell b2 | langsam b5 | Δ |
   |---|---|---|---|
   | gpu-bank gesamt | 10,66 ms | 11,78 ms | +1,12 |
   | Schalter „bau“ | 1,21 ± 0,09 ms | 2,14 ± 0,06 ms | **+0,93** |

   - Alle übrigen Klassen und Pässe sind gleich: Baum 1,97/1,96, Boden 2,12/2,10, Himmel, Karten, Post, Schatten.
   - Ebenso gleich: Befehle (79), Dreiecke (338k), Haupt-Pass-Dreiecke (289k).
   - Die Bau-Klasse umfasst: `f:gt:L1` (die 7 Tore), `bauSatz`, `bau:start_plattform`, `bau:welt_koerperstudio`,
     `bau:welt_klang`, `bau:welt_tetrapoda`, `bau:esse`, `bauWurf`. Die Membran der Tore liegt nicht darin
     (`portal-membran` zählt zu den Einzelstücken, ohne Unterschied).
2. **Die drei Verdächtigen aus dem Bündel e8a370ad sind es nicht.** Ihr Zustand je Boot ist in beiden Gipfeln gleich:
   - **Tore (K64):** 7× Stufe 1 bei 11 m, Vorschau-Tor Stufe 2.
   - **Bündel-Reihe (K60-T8):** Genesis trägt nur `@global` und `@wahl`, deren Rang fest ist. Die Kinder-Folge im
     `@wahl` ist bei langsamen und schnellen Boots dieselbe.
   - **Regler:** loadScale 1, Schatten-Reichweite 170, maxFar 306, breaks 0,353/1, Intervall 1.
   - **Uhr und Wetter:** Halt bei −999999954, sonnig, Sommer.
3. **Schalten heilt den langsamen Gipfel nicht.** In der langsamen Welt b5 bleiben alle drei Schritte bei 78,2–78,8 fps
   und Durchsatz 12,7–12,8:
   - T1 der Anker der Bündel-Reihe neu;
   - T6 alle Ziele neu angelegt (Fenster 1918 und zurück);
   - T3 die Tore auf Stufe 1.

   Der Zustand ist also keine Lage der Ziel-Zuteilung und keine Bündel-Reihe.
4. **Ein dritter, „leichter“ Zustand: der Fund „Destroyed texture horizont-karte used in a submit“ JE FRAME.**
   - Ein Command-Buffer fällt je Frame aus.
   - Das kostet −10 Befehle und −58k Dreiecke. Die GPU steht im Leerlauf (33 W, 1200–1280 MHz), 120 fps.
   - **Häufigkeit:**

     | Kopf | leichte Boots | Lauf |
     |---|---|---|
     | d5deed14 | 1/1 | Lauf 2 |
     | main 210fe8a7 | 2/5 | Lauf 3b |
     | main 210fe8a7 | 7/8 | Bau-Zerlegung 06:58–07:16 |
     | main 015a3f74 | 0/12 | Läufe 3 und 4 |

   - **Berichtigung:** Ich hatte gemeldet, der Fund komme „nie in d5deed14“. Er steht dort im leichten Boot je Frame;
     er kommt also ab d5deed14, nicht erst mit B2.
   - FW (27ae78bf) zählt ihn 0× (Bericht `1610-fw-27ae78bf.md`).
5. **Häufigkeit des langsamen Gipfels:**

   | Kopf | langsam | Zwischenwert | schnell |
   |---|---|---|---|
   | main 015a3f74 | 2/12 | – | 10/12 |
   | main 210fe8a7 | 1/5 | 1 (81,3 fps) | 1 |

   - Nach der Bau-Zerlegung kam an 210fe8a7 nur noch der leichte Zustand. Die Teil-Klassen der Bau-Klasse sind daher
     noch nicht einzeln gemessen.

## Die Läufe (`p3/k1510zg/`, je Boot: `start --ort genesis`, umstellen ego, einschwingen, lauf 30, Zustand)

| Lauf | Kopf | Boots: fps (Durchsatz ms) | Zerlegt |
|---|---|---|---|
| 1 (Pfad-Fehler, verworfen) | d5deed14 | 83,5 | – |
| 2 | d5deed14 | 119,8 (7,8), 217k Dreiecke: leicht | – |
| 3 | 015a3f74 | 84,0 (11,6) · **78,9 (12,6)** · 83,2 · 84,4 · **79,0 (12,6)** · 82,5 | b1 schnell, T4/T3 |
| 4 | 015a3f74 | 84,9 · 84,4 · 84,8 · 83,0 · 84,4 · 83,3 (11,4–11,8) | – |
| 3b | 210fe8a7 | 81,3 (12,2) · 85,1 (11,5) · 119,6 · 119,7 · **78,4 (12,8)** | b2 schnell, b5 langsam |

- **Langsame Boots, je Lauf-Mittel:**
  - Frame p50 16,5 statt 8,4 ms (der 120-Hz-Takt fällt auf 60);
  - Leine 34 % statt 29–31 %;
  - k1 p95 0,39 statt 0,02–0,03;
  - Haupt-Pass p95 0,36–0,44 statt 0,2.
- **Takt und Leistung** (nvidia-smi 250 ms, Lauf 4/3b):

  | Zustand | Takt | Leistung | Leistungsgrenze 0x4 | Temperatur |
  |---|---|---|---|---|
  | schnell | 1712–1733 MHz | 70–72 W | ≈ 47–54 % der Proben | 84–86 °C |
  | langsam (b5) | 1715 MHz | 72,0 W | 48 % | – |
  | leicht | 1200–1280 MHz | 33–34 W | 0 % | – |

  Der langsame Gipfel ist **kein Takt-Gipfel**.
- **Zerlegung schnell (Lauf 3, 015a3f74 b1):** Gesamt 10,90 ms. Boden 2,09, Baum 1,75, Bau 1,06, Himmel 0,65, Karten 0,61.

## Folge

- **Nächster Schritt: die Bau-Klasse in Teil-Klassen zerlegen** (`p3/k1610bau/split.cjs`).
  - Je Täter-Klasse wird an/aus geschaltet (`visible`, Bündel neu), ABBA × 3, gpu-bank 60 × 2. Dazu kommt das Inventar
    der Bau-Objekte: Stoff, durchsichtig/alphaTest, Seiten, Dreiecke, Instanzen, Wurf, Schichten, Bündel.
  - Das läuft in einer langsamen und einer schnellen Welt **an f6fa9f63**: dort ist FW drin, der leichte Zustand fällt weg.
- **Verdacht für die +0,93 ms bei gleichen Draws:** ein Stoff der Bau-Klasse, der je Boot in einer teureren Variante
  baut (Pipeline-Variante, Durchsichtigkeit oder Sortierung). Die Zerlegung nennt die Teil-Klasse.

## Rohdaten

**Pfad:** `bericht/1610-zweigipfel/`

- **Je Lauf ein Ordner:** `lauf1-pfadfehler`, `lauf2-d5d-absage`, `lauf3-main`, `lauf4-main015`, `lauf5-main210`.
- **Je Boot:** `b*-lauf.txt` (lauf 30), `b*-zustand.txt` (Bündel, Tore, Regler, `@wahl`-Folge), `b*-smi.csv`
  (Lauf 4/3b), `b*-ein.txt`, `b*-umstellen.txt`.
- **Zerlegte Boots:** `b*-zerlegen.txt/.json`, `b*-bank.txt`, `b*-zaehl.txt`, `b*-aufloesung.txt`, `b*-t1/t3/t4/t6-*`.
- **Skripte:** je Fassung `zweigipfel-fassung*.sh`.

## Status ZWISCHENSTAND + Übergabe

- **Kein Code-Commit.**
- **Die OMEN misst jetzt T2** (f6fa9f63 gegen 27ae78bf, stehend 2+2). Danach die Bau-Zerlegung an f6fa9f63.
