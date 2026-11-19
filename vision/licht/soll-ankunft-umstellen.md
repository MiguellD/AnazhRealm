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
