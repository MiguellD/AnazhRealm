# Befund: wohin die 22 ms GPU der Radeon gehen (Preis des Orts, Schnitt 3)

ZWISCHENSTAND 14.11. 21:05 — Block 1 (Wiese) gemessen, Block 2 (Wiese, stabiler Zustand) und Genesis folgen. Gerät Radeon 890M,
Stand origin/main ffb005db, eigener abgelöster Baum `.claude/worktrees/zerlege-22ms`, Fenster 1920×1080, Skala 0,75, unter dem
GPU-Schloss (zeit, ganz). Rohdaten: `artifacts/profiband/auge/w28-preis-ort/befund-gpu/<block>/` im Mess-Baum (zerlegen.json,
zerlegen.txt, abba.txt, schirm.png).

## Block 1 — Wiese (−280,4, −1045,6), 20:44–20:57, Referenzfahrt f vor 1,08–1,15, nach 1,02–1,10

`werkbank zerlegen --runden 6 --n 12` (n gerundet auf 30, den Schatten-Takt): Gesamt 40,9 ms, Pass-Stempel 0,24 ms (1 %) —
die Stempel dieses Geräts sehen fast nichts (Stempel-Bruch am Hauptbild, Neustart überschreibt den Anfangs-Stempel).
Die iGPU wechselte im Block den Zustand: gpu-bank 41,7 → 49,6 ms (20:45–20:55), dann 31,5 → 24,9 ms (20:56–20:57) bei
derselben Pose und CPU 2,4–3,3 ms; die Referenzfahrt (CPU) sah davon nichts. Darum unten der ANTEIL je Runde, (an − aus)/an.

| Schalter | Anteil (Median 6 Runden) | ± halbe Spannweite | robust |
|---|---|---|---|
| leer (Direktpfad, nichts sichtbar) | 98,3 % fällt → der leere Frame trägt 1,7 % | 0,1 | ja |
| haupt (Szenen-Pass samt Schatten-Auslösung) | 91,0 % | 1,2 | ja |
| baum | 29,8 % | 17,6 | nein |
| karten | 19,5 % | 9,8 | knapp |
| kontakt:verdeckung | 14,3 % | 18,6 | nein |
| k1 · k2 · k0 | 10,7 · 5,0 · 1,9 % | 11,0 · 10,5 · 6,5 | nein |
| nahWieseFern · nahWiese · feldPass | 10,8 · 8,6 · 9,1 % | 11,9 · 11,1 · 12,4 | nein |

ABBA der gpu-bank (je 3 Viererreihen A B B A, n 12, 3 Runden), alle im langsamen Zustand (A ≈ 49 ms):

| Reihe | A | B | B ÷ A |
|---|---|---|---|
| Skala 0,75 ↔ 1,0 | 48,9 · 50,7 · 49,0 · 49,7 · 48,0 · 48,8 | 68,5 · 72,0 · 71,0 · 65,2 · 68,2 · 62,7 | 1,40 |
| Skala 0,75 ↔ 0,5 | 49,0 · 49,2 · 40,5 · 45,6 · 48,5 · 47,6 | 26,7 · 23,7 · 26,5 · 26,3 · 26,6 · 20,9 | 0,54 |
| Fenster 1920×1080 ↔ 960×540 | 40,3 · 49,2 · 49,1 · 50,5 · 47,7 · 48,7 | 13,0 · 18,3 · 20,8 · 20,7 · 20,9 · 20,7 | 0,41 |
| Zeitstempel an ↔ aus | 49,5 · 49,4 · 48,9 · 36,0 · 31,5 · 31,7 | 43,0 · 45,2 · 46,8 · 35,3 · 33,9 · 39,1 | Zustand wechselte mitten in der Reihe — ungemessen |

Gelesen: ein Viertel der Pixel kostet 41 % → ~79 % der GPU-Zeit wachsen mit den Pixeln, ~21 % fest je Bild.

## Block 2 — Wiese, dieselbe Pose, 21:01–21:18, Einlauf bis die gpu-bank steht (138 s: 35,5 · 35,4 · 34,6 ms), Zerlegung 8 Runden

Gesamt 36,3 ms, Pass-Stempel 0,21 ms (1 %). Wiederholt Block 1: haupt 90,3 % ± 1,9 · leer fällt 97,9 % ± 0,6 · baum 29,6 % ·
karten 20,6 % ± 5,3 · nahWieseFern 10,1 % · k2 9,5 % · k1 8,6 % · himmel 7,1 % ± 6,7 · formationen 7,5 %. Der Schalter `post`
(Direktpfad) ist KEIN Posten der Kette: ohne Kette rendert die Szene in voller Ausgabe statt Skala 0,75 (+78 % Pixel) und wird
teurer (−30 … −47 %), dasselbe Vorzeichen wie Skala 1,0. ABBA im langsamen Zustand (A ≈ 47 ms): Skala 1,0 × 1,35 · Skala 0,5
× 0,58 · Fenster 960×540 × 0,41 · Zeitstempel aus × 1,00 (A 46,1 / B 46,3 — das Zeitmaß kostet nichts Messbares).
Der GPU-Zeuge (Leistungszähler je Prozess, `zeuge.txt`): während der Messung nur die eigene Welt (chrome ~90 %), claude 1–6 %,
dwm 1–3 % — keine fremde Karten-Last. Der Zustandswechsel kommt aus der Messung selbst: zwischen den kurzen Bänken ruht die
iGPU und taktet herunter; das „an“ nach einem leichten „aus“ (haupt, leer) liegt im Mittel 45 ms, nach einem schweren 30–35 ms.

## Block G — Genesis (0, 0, Blick −x), 21:36–22:07, f vor 1,11–1,16, nach 1,00–1,03, Zerlegung 6 Runden × 90 Bilder

Der Einlauf stand NIE: 50 gpu-bänke derselben Pose in 13,5 min liegen zwischen 12,8 und 38,5 ms (Median 19,5), ohne fremde
Karten-Last (Zeuge: claude 1–2 %, dwm 1–3 %) — der Zustand der iGPU allein streut × 3. Zerlegung: Gesamt 26,1 ms, Stempel 0,08 ms.

| Schalter | Anteil (6 Runden) | ± Standardfehler |
|---|---|---|
| leer fällt | 96,4 % (leerer Frame 3,6 %) | 0,3 |
| haupt | 78,2 % (Kette + Kontakt in voller Ausgabe: 21,8 %) | 0,2 |
| karten (fimp:atlas:L2 + Wurf) | 30,5 % | 4,8 |
| boden (bodenSatz · fern-ring: das Pflaster) | 21,8 % | 2,9 |
| feldPass | 16,1 % | 5,7 |
| wasser | 15,6 % | 8,3 |
| schatten (alle Kaskaden) | 3,4 % | 0,7 |
| bau | −18,6 % (Verdecker: ohne ihn zeichnet, was dahinter liegt) | 6,6 |

ABBA (Viererreihen): Skala 1,0 × 1,46 · Skala 0,5 × 0,65 · Fenster 960×540 × 0,42 (A 27,4 / B 11,6).
