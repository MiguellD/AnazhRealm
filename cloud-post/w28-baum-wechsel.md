# Post an w28-baum-wechsel

## 11.11. 13:50 UTC w28-baum-wechsel — ZWISCHENSTAND 1 (Messung, noch kein Schnitt; main e699a834)
**Wurzel bestätigt:** `LOD_SCHIRM.fehler.tree` ist `je({})` (stamm/vegetation-streu.js:2879), `_wechselAbstand("tree", s, ref)` fragt ohne Vorlage (:1929) → e = 0, es hält der Haushalt.
**1. Fehler am Bau je Art × Stufe** (fehler-am-bau-Modell der Station, in WELT-Metern: Vorlage × Welt-Skala, Abstand = Haushalt × max(H, 12)/12, 1920 × 1080; die Karte als ihre nächste gebackene Ansicht, ohne Relief):

| Vorlage | H m | L1 am Haushalt | Karte am Haushalt | Karte ≤ 1 px ab | Faktor | Zeile (e/H) |
|---|---|---|---|---|---|---|
| eiche | 21,4 | 0,05 px @ 21 m | 2,84 px @ 46 m | 177 m | 3,8 | 0,0118 |
| birke | 16,6 | 0,05 @ 17 | 3,11 @ 36 | 171 | 4,8 | 0,0147 |
| buche | 27,6 | 0,05 @ 28 | 2,56 @ 60 | 180 | 3,0 | 0,0093 |
| weide | 9,9 | 0,20 @ 12 | 5,99 @ 26 (GPU 5,15) | 258 | 9,9 | 0,0306 |
| karst | 11,1 | 0,22 @ 12 | 6,04 @ 26 | 222 | 8,5 | 0,0263 |
| fichte | 32,3 | **1,79 @ 32** | 2,69 @ 70 | 340 | 4,9 | 0,0150 |
| tanne | 31,4 | **1,91 @ 31** | 2,90 @ 68 | 346 | 5,1 | 0,0157 |
| mammut | 48,1 | **1,80 @ 48** | 2,53 @ 104 | 436 | 4,2 | 0,0129 |
| totholz | 8,9 | **3,43 @ 12** | 3,17 @ 26 | 103 | 3,9 | 0,0122 |

Befund dazu: (a) JEDE Baum-Karte trägt am Haushalt 2,5–6 px, nicht nur die Weide der Station; (b) die L1 der Nadel-Arten und des Totholzes reißt das Soll selbst (1,8–3,4 px), die Station sieht es nicht (sie misst nur die Weide); (c) die Schranke ist das Texel: ein Baum ≥ 12 m steht am Haushalt immer 325 px hoch (12 m × 704 / 26 m), die Zelle trägt 256 Texel — die Karte ist dort > 1,27 px je Texel.
**2. Kosten des Hinausschiebens** (Werkbank swiftshader, Mess-Wiese, Zensus der Streu-Zellen: 220 Bäume bis 356 m, Höhen-Median 25–38 m, Skala 0,6–2,08; heute 8 auf L1, 0 auf L0, nächster Baum 65 m): Bäume im Ring Haushalt … k × Haushalt im Blick (107° waagrecht) × L1-Dreiecke samt Wurf: k 2 → 15 Bäume, +33k · k 3 → 35, +76k · k 4 → 56, +124k · k 5 → 76, +168k. Mit den Zeilen oben (k 3,0–9,9) sind das an der Wiese +130–170k Dreiecke im Blick auf p95 548–587k: das Band (680k) reißt. Reines Hinausschieben ist zu teuer.
**3. Der Träger in der Maske** (gelesen): die L1 braucht je Instanz drei Zahlen — die wahre Höhe (der Wind liest `aH0`, stoff-instanz.js:265), die Blatt-Höhe der 01-Grenze (`aH0L`, gekappt) und die gestreckte Höhe der Karten-Grenze —, getragen werden zwei; ein dritter Vertex-Puffer ist nicht frei (WebGPU 8, siedlung-satz.js:1654), und die Arena zeichnet viele Arten in EINEM Zug (kein Stoff-Wert je Art). Frei ist die vierte Zahl der Art-Größen des Winds (`windArt` vec4 im Speicher der Arena, stoff-instanz.js:553) und `fenster.w` des Auftrags der GPU-Wahl.
**Läuft:** die Folge der Station im echten Renderer (swiftshader, Weide + Eiche, Karte bei 1× · 2× · 3,5× Haushalt) — sie entscheidet, wie weit das Relief die Zeilen gegenüber dem Modell senkt. Danach der Schnitt.
