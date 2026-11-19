# Soll — Folge-Schnitt Ankunft nach dem Lichtmesser (gesetzt 19.11. VOR der Messung, wird nicht bewegt)

Anlass: der Lichtmesser (`w28-laub-kante-2`, 80471c53) rastet die Belichtung erst mit stehender Sicht des Bildes. Unter dem
Ladeschirm kostet dieses Umstellen +1,1 s (Genesis) bis +3,0 s (Wiese) gegenüber dem Vor-Kopf 6113b27e — gegen Pflicht B.

EIN Schnitt (`stamm/dirigent-ankunft.js`): sobald von den Ankunfts-Termen nur noch „licht“ offen ist, laufen die Lade-Bilder im
vollen Takt, bis die Lesung steht. Kein zweiter Weg, kein Flag, kein Frist-Ablauf, der die Lesung überspringt.

| Zeile | Maß | Soll |
|---|---|---|
| A1 | Kalt-Ankunft bis Weltbild, Kopf gegen Vor-Kopf 6113b27e, ABAB, ≥ 3 kalte Boots je Seite, Wiese und Genesis | Differenz ≤ +0,3 s an beiden Orten |
| A2 | Sprung der Belichtung in den ersten 30 Bildern nach dem Fall des Ladeschirms | ≤ 0,1 EV an beiden Orten |
| A3 | `gate:tag-achse:echt` und die Linsen B9 (Lesung nach 3 Bildern) und B10 (Riegel) aus `scripts/lib/licht-linsen.cjs` | GRÜN |
| A4 | Frame p95 stehend nach der Ankunft, Kopf gegen Vor-Kopf | Differenz ≤ Rauschen der zwei A-Läufe |

Vorhersage des Koordinators: der volle Takt holt mindestens 80 % der verlorenen Zeit zurück; an der Wiese bleibt ein Rest von
höchstens 0,5 s, A1 reißt dort knapp. A2 hält.

Reißt A1 um mehr als 1 s an einem Ort, ist der Schnitt nicht die Wurzel: stopp und Befund, kein zweiter Hebel in derselben Welle.

## Nachtrag 19.11. — der erste Hebel ist gefallen (Zweig `licht-ankunft` 51f6e767, Schnitt 2f185c5c zurückgenommen)

Gemessen an der Radeon 890M, 1920 × 1080, je 3 kalte Boots, Reihenfolge V Z N · N Z V · V Z N (V = 6113b27e, Z = 56777f23, N = Schnitt):

| Zeile | V | Z | N | Urteil |
|---|---|---|---|---|
| A1 Genesis, kalt bis Weltbild | 11,46 / 13,72 / 9,45 s | 15,83 / 28,51 / 18,70 s | 27,89 / 25,85 / 16,15 s | ROT, N − V +11,8 s |
| A1 Wiese, Ankunft unter dem Ladeschirm | 7,83 / 10,62 / 7,26 s | 10,21 / 12,24 / 10,84 s | 11,37 / 16,88 / 16,09 s | ROT, N − V +6,2 s |
| A2 Belichtungs-Sprung nach dem Fall | ≤ 0,001 EV | ≤ 0,006 EV | ≤ 0,007 EV | GRÜN |
| A3 | – | – | nicht gefahren | unbelegt |
| A4 Frame p95 stehend | – | – | im Rauschen der V-Läufe | GRÜN |

Die Vorhersage des Koordinators („der volle Takt holt ≥ 80 % zurück“) ist widerlegt: mehr Lade-Bilder machen es langsamer (Phase „nur
licht offen“ an Genesis Z 7,1 / 12,1 / 8,6 s bei 12 / 24 / 16 Bildern, N 14,0 / 9,7 / 8,1 s bei 364 / 224 / 390 Bildern).
Wurzel beim Namen: die Lesung wartet nicht auf Bilder, sie wartet auf stehendes Licht. Die Sonne wandert in jedem Takt, der ein Bild
zeichnet (`tickDayNight`); `_bildSichtSteht` verwirft jede Lesung, deren Licht-Richtung mehr als `lichtRad` (0,05°) von der aktuellen
abweicht. Und die Zahl im Stempel (+1,1 / +3,0 s) war zu klein: sie maß `umstellen` bis zur stehenden Welt in je EINEM Lauf, nicht
die Zeit bis zum Weltbild — gegen den Vor-Kopf kostet der Lichtmesser an Genesis +9,5 s, an der Wiese +2,5 s.

Folge: der Stempel `w28-laub-kante-2` ist zurückgezogen (Sperr-Zeile in `zug/abab.txt`, der Kopf liegt unter
`refs/archiv/2026-11-19/w28-laub-kante-2-zurueck`). Das Soll A1–A4 bleibt wörtlich; der zweite Hebel ist eine NEUE Welle am
Lichtmesser selbst: **die Lesung gilt in EV, nicht in Grad** — eine Lesung bleibt gültig, solange die Wanderung des Lichts seit der
Lesung die Belichtung um weniger als die Sprung-Schwelle ändert. Vorhersage des Koordinators vor der Messung: die Phase „nur licht
offen“ fällt auf unter 0,5 s an beiden Orten, A1 hält an Genesis, an der Wiese bleibt ein Rest unter 1 s.
