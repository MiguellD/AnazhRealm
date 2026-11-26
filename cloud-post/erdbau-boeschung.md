# erdbau-boeschung — Stand-Blatt (ZWISCHENSTAND)

Zweig `erdbau-boeschung` von origin/main 2da17e2e. Sprosse: wird aus `vision/` im Zweig `punkte-maschine` nachgetragen (Abruf läuft).
Karte 2 gebucht 118 von 1 718.

## Die Täter-Zahl (vorher, main 2da17e2e, node, kein Bild)

Messung `stufe.cjs` (Scratchpad): je Erdbau die größte Höhen-Stufe zwischen Nachbar-Proben im 0,5-m-Raster, abzüglich der Stufe der
Natur an derselben Kante (`|ΔH_erdbau| − |ΔH_natur|`), im Ring 10–24 m Abstand zur nächsten Fläche (Platte/Trasse). 26 Erdbauten:
die Stadt (Ort 836,0867/438,2428, Same 7, 300 Häuser), der Genesis-Ort und 24 Orte (Same 1–24, 8–160 Häuser, trocken, Hang ≤ 0,6).

| Erdbau | größte Stufe je 0,5 m | an (x, z) | Abstand zur Fläche |
|---|---|---|---|
| stadt-voll 7/300 | 16,19 m | 937 / 83,5 | 16,4 m |
| genesis | 19,92 m | 103,5 / −279,5 | 16,3 m |
| ort 8/120 | 23,66 m | 1521,5 / 507 | 16,1 m |
| ort 12/18 | 19,46 m | −1799 / −988 | 15,5 m |
| ort 16/64 | 15,36 m | 522 / 181,5 | 15,9 m |
| ort 20/8 | 12,69 m | −655,5 / −889 | 16,0 m |
| ort 17/96 | 12,47 m | −606,5 / 180 | 15,7 m |
| ort 4/32 | 10,57 m | −985,5 / −132,5 | 15,8 m |
| ort 14/32 | 5,49 m | −1343,5 / 1987,5 | 15,6 m |
| ort 5/48 | 3,11 m | 1031,5 / −589,5 | 15,8 m |
| ort 15/48 | 2,94 m | −363,5 / −2648,5 | 16,1 m |
| ort 18/120 | 2,44 m | 599,5 / −734,5 | 15,1 m |

**12 von 26 = 46,2 % der Erdbauten tragen eine Stufe > 0,6 m je 0,5 m.** Jede dieser Stufen steht bei 15,1–16,4 m Abstand.

**Der Täter ist Kandidat (a), der harte Schnitt der Reichweite:** `gelaende-core.js:2340` `if (d > R) continue;` mit
`R = ERDBAU.reichweiteM = 16` (`gelaende-core.js:2186`, gelesen in `:2306`). Die Böschung `h' = clamp(h, y − 0,6·d, y + 0,6·d)` läuft
bis 16 m und bricht dort ab. Die Platten der Stufen liegen 25–33 m neben der Natur, der Kegel trägt bei 16 m aber nur 9,6 m. Was
fehlt, fällt in einer Probe auf die Natur. Hinter der Platte steigt die Natur mit 0,45–0,9, deshalb trifft der Kegel sie innerhalb
von 16 m nicht. Am Ort 4 träfe er sie erst bei etwa 91 m.

Eine zweite Klasse liegt innen (Ring 0–10 m): 22 von 26 = 84,6 %. Dort stoßen sich Flächen gegenseitig (Platte an Platte oder Trasse):
FF 17 209 Kanten in 21 Orten, max 11,15 m; Fläche an Böschung (BF) 12 759 Kanten, max 9,34 m; Böschung an Böschung (BB) 362 Kanten,
max 8,58 m. Die Stadt hat innen 16,17 m an 979,5 / 138,5 (d 5,2 m). Diese Klasse ist ein Widerspruch der Flächen selbst (die Kegel
zweier Flächen kreuzen sich, |y_i − y_j| > 0,6 · Abstand). Diese Klasse nennt das Blatt getrennt; sie ist nicht der Täter dieses Schnitts.

Kosten vorher (Stadt, 200 000 Zufallspunkte in 600 m): `erdbauY` 9,6–9,8 µs je Frage, `hoehe` mit Erdbau 14,8 µs, ohne 4,4–5,1 µs.
Normalform `erdbauNormal` 30–40 ms (835 Zellen, 70 687 Einträge).

## Profis (das Band)

Ein loser Boden ruht mit einem Böschungswinkel von 25–40°: trockener Sand 34–35°, natürlicher Kies mit Sand 25–30°, Lehm trocken 25–40°
(Tafeln „Angle of repose“: Wikipedia, Engineering Toolbox). Die Regelböschung im Erdbau ist 1 : 1,5 (33,7°, tan 0,667). Die 0,6 des
Kerns (31°) liegt im Band. Das Gesetz des Bauingenieurs heißt „daylight“: die Böschung läuft, bis sie das gewachsene Gelände trifft,
ohne feste Reichweite.
