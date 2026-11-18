# Reibellipse am Fenster — OMEN GTX 1060 (ZWISCHENSTAND, 18.11. 16:10)

Kopf `w28-reibellipse-3` **19f5281e** gegen main **1857c808**. Genesis (Werkbank `--ort genesis`, echte GPU), Mittag, GT,
Start 15 m/s, Tasten gehalten, 60 Bilder je s über `_gameLoopTick` (der echte Takt der Welt, Spieler am Steuer). Strecke
(−408 | 72), 2,2 m Höhenspiel auf 120 × 60 m — kein ebener Platz. Treiber `reib.cjs` + `seite.js`, Rohes je Kopf als JSON
(Spur je 0,1 s: Ort, Gier, vlong, vlat, Gier-Rate, Schlupf, aLong, aLat).

## 1 — Shift gehalten, voll eingelenkt

| | Gier 0,5 s | 1,0 s | 1,5 s | 2,0 s | 2,5 s | Gier-Rate Spitze | Verzögerung 0–1 s |
|---|---|---|---|---|---|---|---|
| main | 14,6° | 47,7° | 96,7° | 156,9° | 199,8° | 129,6 °/s | 4,19 m/s² |
| Kopf | 15,1° | 50,9° | 104,2° | 169,0° | 215,4° | 140,2 °/s | 3,40 m/s² |
| Kopf + Gas | 12,5° | 40,7° | 82,5° | 137,4° | 197,7° | 134,6 °/s | 1,16 m/s² |
| nur Lenken (beide) | 7,4° | 13,0° | 19,2° | 27,5° | — | 18,8 °/s | 1,72 m/s² |

Das Heck kommt stetig: 52 → 90 → 122 °/s, kein Sprung in der Gier-Rate, der Wagen gleitet quer (vlat −8,3 m/s bei 1 s) und
rollt ab 1,5 s rückwärts. 120° in 1 s sind es NICHT: 51° nach 1 s, 120° bei rund 1,6 s. Gehalten dreht er über 180° hinaus
(215° nach 2,5 s) — an main ebenso (200°). Am Kopf zählt das Gas unter der Handbremse (an main blieb es ohne Wirkung:
47,4° ↔ 47,7°).

## 2 — Shift geradeaus gegen S geradeaus

| | Verzögerung 0–1 s | aLong bei 0,5 s | Stand nach | Weg |
|---|---|---|---|---|
| main Shift | 4,53 m/s² | −4,04 | 3,52 s | 25,9 m |
| main S | 4,53 m/s² | −4,05 | 3,52 s | 26,3 m |
| Kopf Shift | 2,74 m/s² | −2,43 | 5,70 s | 43,0 m |
| Kopf S | 4,53 m/s² | −4,05 | 3,52 s | 26,3 m |

Shift bremst am Kopf 60 % von S (an main gleich stark), der Bremsweg von S ist unberührt. Am Kopf zieht der Wagen unter
Shift geradeaus bis zum Stand 6,1° aus der Spur (main 0,3°): das gesperrte Heck wandert auf der schrägen Strecke.

## 3 — S im Bogen

Gier nach 2 s: Kopf 30,8°, main 31,0°, nur Lenken 27,5° — der Wagen lenkt weiter, aLat bei 0,5 s 3,30 m/s² an beiden
Köpfen wie ohne Bremse (3,26). Verzögerung 0–1 s: Kopf 2,72, main 2,94 m/s² (geradeaus 4,53).

## 4 — Motor aus im Wasser am Hang (Ansaugung des GT 0,72 m)

Hang 29,5° (Gefälle 0,565) an (−1076 | 1000), Boden 2,0 m unter dem Spiegel, Hülle 2,09 m tief, Nase bergab.

| | Kopf | main |
|---|---|---|
| ohne Taste, 6 s | 0,000 m/s, Weg 0,00 m | 0,000 m/s, Weg 0,00 m |
| Gas gehalten, 6 s | 0,020 m/s stetig, Weg 0,12 m | 0,020 m/s stetig, Weg 0,12 m |
| mit Gas vom Ufer hinein (7,2 m/s) | Stand nach 4,57 s bei 3,12 m Tiefe | Stand nach 4,55 s bei 3,17 m Tiefe |

Er steht. Kein Ruck im Stand; beim Einfahren fällt die Fahrt am Wasser in 0,3 s von 7,2 auf 2,4 m/s (das Wasser an der
Hülle, an beiden Köpfen gleich) und läuft dann in 3 s weich aus. An dieser Stelle zeigt der Kopf KEINEN Unterschied zu
main: auch main hält 0,000 m/s.

## Offen

- Unter gehaltenem Gas kriecht der Wagen im Wasserschlag mit 0,020 m/s den Hang hinab (beide Köpfe) — der Stand 0,000 gilt
  nur ohne Taste.
- Das Rollen OHNE Gas vom Ufer hinein ist nicht gemessen: der Wagen blieb vor dem Wasser am Gegenhang stehen.
- Kein Bild und kein Film: das Urteil steht auf den Spuren, nicht auf dem Auge. Die Strecke ist nicht eben (2,2 m), μ der
  Strecke nicht gelesen — die Zahlen sind m/s², nicht μ·g.
- Zahlen eines Laufs je Kopf (die Fahrt ist deterministisch im Takt, nicht wiederholt).
