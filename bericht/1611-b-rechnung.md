# B — die Rechnung der kalten Ankunft auf der GTX 1050 (16.11., ZWISCHENSTAND)

Gerät: i7 950 (4 Kerne / 8 Fäden), GTX 1050, leeres Profil, Genesis-Ort, Schirm 1280×720, Bildwinkel 75° (Blick-Kegel der
Ankunft 137,6° = 38 % des Rundums). Baum: `w28-feld-fuss` 92b819b8 (main 71839b1e + ankunft-faden + feld-fuss).
Richter: `diag-boot-stage --kalt --echt`, t(Kontrolle) 23,6–26,1 s (Soll ≤ 5 s). Zeuge der Tafel: ein Kalt-Lauf mit
Faden-Spur, Weltbild 20,11 s. Zahlen sind Faden-Sekunden (Wand im Faden) vor dem ersten Weltbild, keine CPU-s.

## Die Summe

≈ 130 CPU-s in ≈ 21 s auf 4 Kernen (Messung 15.11., Register f3c74d9d5): GPU-Prozess ≈ 52 (DXC 104 Rufe = 35,7) ·
Haupt-Faden 18,1 · Schmiede zwei Fäden 25 · Fern-Fäden · Brocken · Wald · Streu. Jedes Umordnen ist Nullsumme (Richter
15.11.: die datenfreien Programme 6–9 s früher bestellt, Kalt-Zeile 25,5 ↔ 25,9 s). ≤ 5 s hieße ≈ 20 CPU-s vor dem Bild.

## Die Tafel: Arbeit vor dem ersten Weltbild nach Erzeuger

| Erzeuger | Stufe · Zahl | Faden-s | Besteller | Was der Schirm verlangt | Über-Bestellung |
|---|---|---|---|---|---|
| Fern-Ring „ring“ | 3 Schalen, 13 056 Ecken, 27 Aufträge | 7,46 | stamm/gelaende-fern.js:1983–1990 (Lade-Takt, Index-Folge, kein Blick-Tor) | Masche ≈ 15 px, nicht zu fein; 38 % im Kegel | ≈ 4,6 (hinter dem Kegel) |
| Voxel-Brocken | 9 × L0, 16 × L1 | 4,36 | stamm/gelaende-chunks.js:1556 / :937 (kein Blick-Tor; das Bild wartet nur auf die im Blick, dirigent-ankunft.js:1166) | 11–13 von 25 im Kegel; Zelle ≤ 39 px | ≈ 2,1 |
| Schmiede mensch L1 | 1 Körper | 5,45 (ein Block, 4,97 → 10,42 s) | stamm/koerper-leib.js:1991–2008 (`_leibGrobVorBild`) | im Ego-Bild liest ihn nur sein Wurf | ungemessen, ≤ 5,45 (Schatten-Texel des Leibs in Kaskade 0) |
| Blatt-Atlas | 2048×512 BC3 mit Mips | 3,56 | stamm/studio-bruecke.js:1380–1390 | Leser: Laub der L1-Körper, Karten-Bake 128 Texel je Ansicht | ungemessen, ≤ 3,3 (Pixel je Blatt-Karte am nächsten Laub-Träger) |
| 14 Baum-L1 als Karten-Quelle | L1 | 8,37 | stamm/stoff-karte.js:1184–1189 (`_karteStufe`) | 128 Texel je Ansicht; ein 20-m-Baum misst 63–235 px; das Gesetz kennt keine gröbere Baum-Geometrie (L2 ist die Karte) | keine |
| Fels L0 (zacken, geröll, blume) | ≈ 13, einstufig per Gesetz | 2,29 | Stufen-Wahl am Abstand | — | ungemessen (Pixel je Fels) |
| Feld der Ferne | Spalten im Blick × 48 | 2,28 | stamm/bild-sicht.js:2309, Blick-Tor :2276–2285 | Spalte ≈ 22 px | keine |
| Wald-Darts · Wuchs · Streu · Saat | 27 · 13 · 4 · 3 | 3,89 · 1,27 · 1,30 · 0,17 | Blick-Tor an der Quelle (gelaende-chunks.js:1119, vegetation-streu.js:1708) | — | keine |
| Knoten-Bau (Haupt-Faden) | 71 Bauten | 4,0–4,2 | stamm/bild-kosten.js:870 `_knotenRate` | gehört den Programmen des Bilds | keine |
| DXC (GPU-Prozess) | 44–48 Pipelines, 1,9 MB WGSL; 13 Standard-Programme 1 296 KB, Σ 24,3 s bestellt→bereit | 35,7 CPU-s | die Erst-Zeichnung | 0 von 44 Programmen ohne Leser im ersten Bild (15.11.) | keine |

**Die EINE Zahl:** Über-Bestellung an der Quelle belegt ≈ 6,7 Faden-s (Ring 4,6 + Brocken 2,1); mit den zwei
ungemessenen Zeilen höchstens ≈ 15,5 — 5 bis 12 % der Arbeit. Zwei Drittel der ≈ 130 CPU-s sind das Bild selbst:
44 kalt übersetzte Programme, 14 Baum-Gestalten, Ring, Boden.

## Was gelesen und verworfen ist

- **Früher und im Bündel bestellen:** Richter 15.11. gefallen (Nullsumme, die Schmiede brauchte 14,9 statt 10,4 s).
- **Licht-Kern-Diät an der Stoff-Fabrik:** in den 13 Programmen des ersten Bilds fällt kein Baustein bildgleich — der
  Fern-Ring beginnt bei 21,6 m und teilt den freien Stoff mit den Schalen 1/2, der Licht-Pool reicht bis ≤ 76 m, die
  Kaskaden bis 306 m (Schieber 720 m), die Ferne der Wiese liegt bei 10–40 m. Bildgleich fiele nur Pool + Würfel-Schatten
  in den zwei Bake-Programmen der Karten-Bühne (≈ 13,6 KB, ihr Ausgang wird im MRT nie geschrieben) — nicht gebaut.
- **Blick-Tor beim Bestellen von Ring und Brocken (−6,7 Faden-s):** nicht gebaut — der Gewinn läge unter dem Rauschen des
  Richters (±1 s), und wer sich in den ersten Sekunden umdreht, sähe Ring und Boden entstehen (das halbe Weltbild).
- **Der Licht-Kern EINMAL statt je Programm (verzögertes Licht):** nach den gemessenen Anteilen (Kaskaden 22 % ·
  Umgebung 20 % · Pool 15 % der Übersetzung) ≈ 12 CPU-s — 9 % der Summe.

## Was in dieser Reihe geschnitten ist (Kalt-Zeile, je vier Paare gegen main)

- `w28-ankunft-faden` 49c76cdc: −2,06 s (Lagen-Raster nur am Rand, Talprofil am Knoten, Texel-Abgriff ohne UV-Matrix).
- `w28-feld-fuss` 92b819b8: als Summe −1,2 s gegen main (das Feld fragt das Gesetz mit seiner Masche; Feld-Bau 3,4 → 1,7 s).
- `w28-licht-kern`: das Wasser-Programm 137,8 → 39,3 KB, Knoten-Bau 306 → 93 ms Haupt-Faden; ohne Richter-Anspruch.

## Der Befund

B (≤ 5 s kalt, ohne halbes Weltbild) trägt auf dieser Karte keiner der benannten Hebel: nicht das Umordnen, nicht die
Diät, nicht das Blick-Tor, nicht der Licht-Umbau. Die Arbeit vor dem Bild IST zum größten Teil das ganze Bild in der
Stufe des Schirms. Ungemessen bleiben die Schatten-Texel des Leibs und die Pixel je Blatt-Karte; sie ändern die
Größenordnung nicht.
