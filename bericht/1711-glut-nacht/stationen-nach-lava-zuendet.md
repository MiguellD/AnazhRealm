# ereignis#1 · kaskade#1 nach w28-lava-zuendet — BEFUND Station ↔ Spiel (GTX 1050, 17.11. 19:20–19:52)

Werkzeug: der Proben-Text der Station, wörtlich aus `messung/roh/31d156e8-gtx/karte2.same.kopplung.{ereignis,kaskade}_1.out`
(`weltGrund` + `lavaSitzungProbe` / `brandSitzungProbe`), als `/eval` in meiner Werkbank (Mess-Wiese, 1280 × 720, echte Karte),
je Probe eine eigene Welt, DERSELBE Proben-Text an jedem Kopf. Kein Aufbau des punkte-Läufers. Je Zelle der Tabelle EIN Lauf.

## Urteil: beide STATION — und der Glut-Endkopf verschiebt keine der beiden Zahlen

| Kopf | ereignis#1 erstarrt R/G (Soll ≤ 1,25) | kaskade#1 Flammen-Pixel (Soll ≥ 200) |
| --- | --- | --- |
| 7de938ab | 0,984 (OMEN 0,979) | +211 bei 32 Flammen, Herd −248/−1064 (OMEN +329) |
| 31d156e8 | Schuss verweigert: „DIE WELT STEHT NICHT nach 1802 Takten" (OMEN 1,271) | +0 bei 25 Flammen, Herd −248/−1080 (OMEN +0) |
| Glut-Endkopf 8d0fe947 | Schuss verweigert, gleich; im ersten Lauf „Sicht verdeckt 69,4 % brand-rauch" | +3 bei 25 Flammen, Herd −248/−1080 |

Beide Schüsse beider Proben stehen am Mittag: das Auge der Nacht trägt dort 0, der Glut-Kopf liest sich wie 31d156e8.

## ereignis#1 — die Probe nimmt an, dass um den Guss nichts brennt

Seit w28-lava-zuendet zündet der Rand der 1 377 °C heißen Decke das Bett daneben (der Auftrag). Gemessen am Guss der Probe
(−268/−1046): 30 s nach dem Guss brennen 8 Zellen (alle acht Nachbarinnen), Tempo der Front 0,076 m/s, Verweilzeit 6,6 s; nach
5 min 12 Zellen, nach 10 min 20 Zellen, 3 Aschen — die Decke bleibt 1 377 °C (die Uhr der Welt steht in der Sitzung).
Der „erstarrt"-Schuss der Probe fällt rund 70 s Spielzeit nach dem Guss: das Feuer steht am Rand des Ausschnitts. Die OMEN
bekam das Bild und las 1,271; meine Karte verweigert es (die Welt steht nicht, solange die Nah-Wiese unter der Front fegt).

Gegenprobe (derselbe Text, EINE Zutat: nach dem Glut-Bild läuft der Brand auf der Brand-Uhr weiter, 20 000 s, bevor die
Weltzeit vorgeht): **erstarrt R/G 0,988**, rgb 0,053 / 0,054 / 0,031 (7de938ab: 0,984, 0,063 / 0,064 / 0,028); Glut-Bild R/G
2,849. Die Decke selbst liest sich wie zuvor; das Rot kam vom Feuer im Bild. Bild `st-var-ereignis-erstarrt.png`.

Für den Vorarbeiter: der Schuss braucht eine Welt ohne lebenden Brand (`_brandLebt()` falsch) — der Regen der kaskade-Probe
löscht in 7 s, oder der Guss liegt, wo kein Bett daneben liegt. Nicht am Soll drehen: 0,988 hat Luft.

## kaskade#1 — die Herd-Wahl der Probe und die Streuung ihrer Zählung

1. **Die Herd-Wahl.** `_brandStoff` liest das Bett seit w28-lava-zuendet an Mitte und vier Viertel-Punkten und gibt den Anteil
   als Last ins Gesetz (bis dahin nur die Mitte — ein Stein dort nahm einer Wiese ihr Bett). Die Probe nimmt die erste Zelle
   mit `zeile.name === "gras"`: früher −248/−1064 (Mitte Gras, Anteil 1), jetzt die in der Reihenfolge frühere −248/−1080 —
   Mitte kahler Kies, Anteil **0,2**. 25 Flammen an einem Fünftel der Last tragen +0 / +3 Pixel. Bild `st-glut-kaskade-brennt.png`.
2. **Mit vollem Bett** (derselbe Text, EINE Zutat in der Wahl: `f.leb ≥ auraAt.lebendig`, also Anteil 1) nimmt die Probe wieder
   −248/−1064, 32 Flammen wie an 7de938ab: Glut-Endkopf **+111 · +248** (zwei Läufe), 31d156e8 **+185**, 7de938ab **+211 · +193**.
   Die Köpfe trennen sich nicht über der Streuung desselben Kopfs (111 ↔ 248); das Soll 200 hat auf der GTX 1050 schon an
   7de938ab keine Luft (193). `rauschenLaufend` 56–99.

Für den Vorarbeiter: (a) der Herd braucht ein volles Bett (Anteil 1), (b) die Zählung „neu warm mit − ohne Satz" streut auf
meiner Karte um den Faktor 2 bei gleicher Flammen-Liste (32) und stehender Bild-Uhr (12,5) — die Quelle der Streuung ist
nicht benannt (Kandidaten: der Rauch vor dem Ring, die Halme im Wind in der warmen Regel).

## Ehrlich offen

- Je Zelle ein Lauf, an zwei Stellen zwei; die Streuung 111 ↔ 248 ist aus zwei Läufen gelesen, keine Verteilung.
- Der Brand einer Zelle mit Anteil 0,2 zeichnet 25 kaum sichtbare Flammen und legt die Narbe über die ganze Zelle
  (`veraendert` 0,946, auch über den kahlen Kies): das ist das Raster des Felds (16 m), es stand vor w28-lava-zuendet
  umgekehrt (Mitte Gras, Rand kahl) genauso. Kein Kopf `w28-lava-nachlauf` daraus ohne Wort.
- Das Lava-Bild nah (Tag/Nacht) ist für diesen Befund nicht neu geschossen; kein Schnitt, kein Vorher ↔ Nachher.
