# w28-tiere-nach-bild 0916311a — die Wiederkehr mit Tieren im Blick

GTX 1050, 13.11. 02:45–02:47, echter Renderer ohne DevTools (`frei-sonde.cjs`), Wiederkehr im vollen Profil, Stand mit 19 Wesen
aus 4 Arten. Vergleichs-Eingriff `tiere-im-blick.js`: die ersten drei Snapshots des Stands (Fuchs, Wesen, Wolf) rücken unmittelbar
vor der Wiederkehr 8 · 11 · 14 m vor den Spieler in Blickrichtung, die Uhr steht auf Mittag; die Sonde bewegt nichts, alle Bilder
dieselbe Pose. (Das Weiß am Boden ist das Wetter dieses Stands, kein Belichtungs-Fehler der Aufnahme.)

| Bild | ms ab Navigation | was es zeigt |
|---|---|---|
| `1-erstbild.jpg` | 10 090 | das erste Weltbild (Bild − Renderer 8,7 s), kein Wesen in der Welt |
| `2-vor.jpg` | 15 603 | das letzte Bild VOR der Wiederkehr |
| `3-nach-0000.jpg` | 15 912 | das erste Bild NACH der Wiederkehr (bei 15 606, 46 ms, 0 Güsse): 19 Wesen in der Welt, Fuchs 8,3 m · Wesen 11,0 m · Wolf 14,2 m vor dem Spieler, `visible` wahr, 11–12 sichtbare Meshes — im Bild steht KEINES |
| `4-nach-2000.jpg` | 17 676 | 2 s danach: der Fuchs ist auf 6,5 m herangelaufen — weiter keines im Bild |
| `5-nach-4000.jpg` | 19 696 | 4 s danach: der Fuchs steht bei 2,9 m im Bild, der Wolf (10,1 m) klein in der Bildmitte |
| `6-nach-8000.jpg` | 23 667 | 8 s danach: Fuchs 1,3 m, Wolf 3,0 m — beide gezeichnet, hinter dem Wolf eine Schliere |
| `7-nach-12000.jpg` | 27 662 | 12 s danach: der Wolf ruhig und scharf |

## Wie sie erscheinen

HART, und SPÄTER als sie da sind. Mit der Wiederkehr stehen die Wesen in der Welt und leben (der Fuchs lief in 2 s von 8,3 auf
6,5 m), gezeichnet wird ein Leib aber erst, wenn sein Programm gebaut ist: der Knoten-Bau in Raten und seine Pipeline kommen je
Stoff einzeln — bestellt 17 038 · 18 506 · 19 024 · 19 616 · 20 307 · 21 269 ms, das ist 1,4–5,7 s NACH der Wiederkehr
(6,8–11,0 s nach dem Bild). Dann steht der Leib in EINEM Bild ganz da, ohne Übergang.

Vor dem Schnitt baute die Sofort-Wiederkehr diese Programme vor dem ersten Weltbild mit (in den 13,4 s). Der Schnitt nimmt den
Guss aus dem Haupt-Faden, den Programm-Bau der Leiber aber hat er nur hinter das Bild verschoben: zwischen Wiederkehr und Bau ist
ein Wesen da, aber unsichtbar.

Die Zahl der Abgabe „die Tiere stehen 4,75–5,16 s nach dem Bild" misst darum das DASEIN, nicht das Bild: sichtbar sind sie
6,8–11,0 s nach dem Bild.

## Der Nachschnitt

Der Vorrat eines Stands (`_ofenStandBestellen`) baut auch die Programme seiner Vorlagen vor (die Maschine dafür steht:
`_vorbauGast`, `_vorbauFehlt`), die Wiederkehr wartet auf sie — dann erscheint ein Wesen in dem Bild, in dem es wiederkehrt.
