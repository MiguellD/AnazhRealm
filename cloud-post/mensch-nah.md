# Vorprüfung mensch-nah 2 — die Haut endet unter dem Saum, ohne Spalt ins Leere

ZWISCHENSTAND: Geschnitten · Gemessen (Zahl) · Karte 2 gebucht 82 von 1 718 (diese Abgabe bucht keine Sprosse; gebucht wird, wenn
der Richter im Zweig `punkte-maschine` sie grün misst). Zweig `mensch-nah`, vereint mit main c2c7ed12 (`docs/README.md` ganz zu main).

**Geschnitten:** `foundry-core.js` `__hautMaske` (Z. 6835, Gesetz `HAUT_SAUM` Z. 6809) blendet jedes Haut-Dreieck aus, das sein EIGENES
Tuch ganz deckt, hält aber ein Band hinter jeder offenen Tuch-Kante (Hals, Ärmel, Bund). Breite √3 · (g + 1,5 · luftM): ein Blick unter
30° in den Saum streift die Kante in der Höhe g und trifft die Haut nach g · cot 30°. Das Band gilt nur für Haut unter EINER Lage, die
zum Tuch blickt. Die Kragen-Hebung (1,5 · luftM) in `__hautUnterTuch` ist ganz gefallen. **Gemessen:** Haut durch ihr eigenes Tuch
576 → 32, Wirt-Hebungen Same 3 758 → 5, Ofen-Golden: 1 von 516 Klassen bewegt. **Offen:** der Rest-Täter `foundry-core.js:6744`
(32 = 2 Ecken × 16 Posen), das Gesicht `leib.gesicht#1` (nicht Teil dieser Abgabe) und die Buchung der Station.

## Sprosse `karte2.mensch.leib.stoff#1`

Werkbank headless, Samen `k2-stoff:0–9`, 16 Posen (8 gehend, 8 laufend), gleiche Bedingungen je Seite:

| Maß | main 9d4319c0 | bb7c53c9 + Maske (08aa22eb) | diese Abgabe |
|---|---|---|---|
| Haut durch ihr EIGENES Tuch (Soll 0) | 576 | 0 | 32 (Same 3: 16, Same 7: 16) |
| heller Rand am Saum im Bild (Mittag) | nein | ja, Kragen + beide Ärmel | nein |
| Wirt-Hebungen Same 3 (`tuchDrapieren`) | 758 | 2 | 5 (Same 9: 12) |
| Haut-Ecken Same 3 (headless) | 1 927 | 1 607 | 1 891 |
| Ofen-Golden | — | — | `mensch-L1\|haut\|mensch` 2113/3773 → 1985/3608 Ecken/Dreiecke, sonst 515 Klassen byte-gleich; Asset-Vertrag grün |

Der Spalt am Saum ist nicht als Strahl-Zählung gebaut. Er ist am Bild geurteilt: Mittagslicht (Uhr 0,5), Werkbank `--echt`, Radeon,
Same 9 und Same 3, frontal 1,5 m und im Profil. Vorher (main) zeigt Same 3 dunkle Durchstich-Flecken auf der Brust des Hemds. Nachher
ist das Hemd glatt, Kragen und Ärmel-Saum tragen keinen hellen Rand, auch im Profil nicht. Bilder im Scratch des Koordinators,
`bild/mensch-nah/licht/` (`vorher-s9|s3-vorn1.5`, `-seite1.5`, `nachher-…`).

Der Stern-Schnitt am Rest-Täter wurde gemessen und verworfen: eine Tuch-Ecke regiert nur Haut, in deren Stern sie seitlich fällt. An
der Täter-Ecke stehen seitlich 29,8 mm gegen einen Stern von 11,8 mm, das Kriterium streicht 170 von 186 Wegen (Same 3) und 179 von
190 (Same 9). Form A (Stern zusätzlich zu `sqrt(bd) + bandM`): 80. Form B (Stern statt des Zuschlags): 512. Die Wege außerhalb des
Sterns halten an anderen Ecken die Haut unter dem Tuch. Es gilt die beste gemessene Zahl, 32.

## Offen, mit Leser

| Was | Ort | Leser |
|---|---|---|
| Rest-Täter: `__hautUnterTuch` misst die Höhe einer Tuch-Ecke über der Tangenten-Ebene einer Haut-Ecke, die bis 3,2 cm seitlich liegt (Tuch über dem alten Haut-Loch am Kragen) — 16,5 mm Scheinweg schiebt die Haut des Bands durch die Schulter-Naht; 2 Ecken × 16 Posen | `foundry-core.js:6744` (Auswahl ab 6724) | Station STOFF (`leib.stoff#1`), Spalte „eigenes Tuch" |
| Die Station zählt heute Haut unter FREMDEM Tuch mit (Paare ohne gemeinsamen Knochen, der hängende Arm neben der Hemd-Flanke) | `meisterkarte-quelle/punkte/stationen/k2-mensch-leib.js` Z. 284–319 (`punkte-maschine`); Diff im Scratch `mensch-nah/station-eigenes-tuch.diff` | Koordinator bucht nach der Landung |
| Gesicht `leib.gesicht#1` 7 von 10, nicht Teil dieser Abgabe; drei Täter benannt: die `haaransatz`-Spanne gegen `KOPF_SOLL`, der Ton der Lippe gegen `KOPF_TON`, der Ton der Augenhöhle gegen `KOPF_TON` | `koerper-core.js` ~5172 (`haaransatz`), 1366 (`KOPF_SOLL`), 1427 (`KOPF_TON`) | Station GESICHT (`leib.gesicht#1`) |
