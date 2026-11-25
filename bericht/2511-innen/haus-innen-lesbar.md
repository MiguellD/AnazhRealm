# haus-innen-lesbar — Abgabe (ZWISCHENSTAND)

ZWISCHENSTAND: Geschnitten · Gemessen (Zahl) · Karte 2 gebucht 103 von 1 718 (`vision/karte-2-stand.json` im
Zweig `punkte-maschine`; diese Abgabe bucht keine Sprosse — gebucht wird erst, wenn der Richter sie grün misst).
Zweig `haus-innen-lesbar` auf main 6c210411, Kopf 64f97082, Vorprüf-Kopf c6eeac49 (derselbe Baum). Sprosse
`karte2.mensch.bau.innen#2`, Station `siedlung.K1#2`.

**Geschnitten:** das Auge steht auf dem Raum — `belichtungRaum` im EINEN Baustein `welt-licht.js` gibt die Belichtung im Raum aus
dem Schlüssel seiner Leuchtdichte (Krawczyk, Myszkowski, Seidel 2005: α(L) = 1,03 − 2 ÷ (2 + log10(L + 1)); Bänder 300 lx −0,61
± 0,3 Blenden, 100 lx −0,98 ± 0,35, 10 lx −2,41 ± 0,5), der EINE Schreiber `_raumBlendeTakt` (`stamm/bild-himmel.js`) folgt ihm
mit 0,8 s ins Dunkle und 0,3 s ins Helle; die Linse `raumBlendeUrteil` (`scripts/lib/licht-linsen.cjs`) nennt vier Täter beim
Namen. **Gemessen:** Start-Dorf innen, dunkelster Blick je Haus Median 0,021 → 0,072, Minimum 0,003 → 0,019 (13 Häuser im Paar,
Radeon); draußen bleibt die Belichtung (0,539 ↔ 0,540); Preis der Station p95 25,05 ms, Heap 484,1 MB.

## Nachtrag 25.11. — Haus 16 und der kurze Mittags-Schatten

Die echte Station urteilte am Kopf c6eeac49 mit der ersten Berichtigung ihrer Suche ROT: „Innen-Bild 16 von 17 lesbar (Plan 17),
innen ÷ Außen-Schatten min 0.213 · Median 2.118 (Soll ≥ 0,15) · dunkel: haus_viktorianisch 0.021792763294552535/undefined (kein
Boden im Schatten eines Baus bis 40 m um das Haus)“. Die Frage an der Wurzel: kennt die Welt den Schatten dieses Hauses nicht,
oder irrt die Suche der Station? Gemessen am Haus 16 (haus_viktorianisch, −102,6 / −246,1), Sonne 74,2°, die Schatten-Achse zeigt
nach −z, Abstände längs der Achse vom Haus-Ort:

| Größe                                                           | Zahl (Radeon, Baum 64f97082)                                                                                  |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Körper im Dach-Pool (`dachLage`, `dachMass`)                    | Haupthaus halbe Kanten 4,75 × 4,25 m, Oberkante 98,17 m; Anbau 1,75 × 3 m, Oberkante 90,75 m — beide im Pool |
| Körper des Pools längs der Achse                                | bis 5,25 m                                                                                                    |
| Schatten nach dem Gesetz (`_hausSchatten` > 0)                  | bis 8,25 m: 2,9 m hinter dem Körper (10,2 m über dem Boden, Sonne 74,2°)                                      |
| Grundriss-Kasten (`_grundrissVon`)                              | halbe Kanten 8,08 × 6,24 m um (1,75 / −0,41): 1,6 m bis 2,4 m vor den Körpern                                 |
| `_imGrundriss` mit Rand 1 m (die Suche der Station)             | „haus“ bis 8,5 m                                                                                              |
| `_imGrundriss` mit Rand 0,3 m                                   | „haus“ bis 7,5 m                                                                                              |
| Punkte im Schatten des Gesetzes UND außerhalb Rand 1 m          | keiner, an allen 24 Winkeln des Fächers                                                                       |
| Punkte im Schatten des Gesetzes UND außerhalb Rand 0,3 m        | Achse 7,75 m bis 8,25 m, dazu −15°, ±30°, ±45°, −60°                                                          |
| Boden (`_bodenSichtAt`)                                         | 87,95 m in 5,5 m, 87,58 m in 8,25 m, 84,92 m in 14 m (Hang)                                                   |
| der gezeichnete Schatten (Luma des Bodens im Bild, je 0,25 m)   | 0,019 bis 0,029 von 7,5 m bis 8,25 m, 0,015 bis 0,032 bis 9,25 m, 0,101 in 9,5 m                              |
| der alte Strahl gegen die Schatten-Zwillinge                    | trifft von 1,75 m bis über 14 m ein Netz in 7 m bis 15 m: kein Maß des Schattens                             |

**Der Fall: die Messung irrt.** Das Gesetz der Welt kennt den Schatten des Hauses (beide Körper stehen im Pool, der Schatten
reicht 2,9 m hinter den Körper). Die Suche der Station verlangte 1 m Abstand vom Grundriss-Kasten, und der Kasten steht 1,6 m bis
2,4 m vor den Körpern: Kasten und Rand (8,5 m) decken den ganzen Mittags-Schatten des Gesetzes (8,25 m).

**Geschnitten:** nur die Suche der Station, Soll (Quote ≥ 0,15, alle Häuser) und Richter-Text bleiben — findet der Rand 1 m
keinen Fleck, sucht derselbe Fächer mit Rand 0,3 m; die Häuser mit Fleck behalten ihn. Die berichtigte Datei gehört nach
`meisterkarte-quelle/punkte/stationen/g5.js` im Zweig `punkte-maschine`, geschoben wird sie vom Koordinator.

**Gemessen:** die Werkbank am Haus 16 mit der berichtigten Suche (Radeon): Fleck in 7,75 m auf der Achse, die Kamera steht
frei, Luma außen 0,0273, innen 0,0218, Quote 0,797. Die echte Station `siedlung.K1#2` am Kopf c6eeac49 (Radeon, 25.11. 04:50)
urteilt GRÜN, wörtlich: „17 von 17 Häusern des Start-Dorfs Tür → Keller → Dachboden ganz, Hub max 0.20 m · Innen-Bild 17 von 17
lesbar (Plan 17), innen ÷ Außen-Schatten min 0.213 · Median 1.284 (Soll ≥ 0,15)“; ihre Akte: Richter GRÜN, Preis GRÜN (p95
17,08 ms, Heap 495,4 MB gehalten, Spitze 551,1 MB). Das Minimum bleibt 0,213; der Median wandert um einen Rang (2,118 → 1,284),
weil Haus 16 mit 0,797 dazukommt und der alte Median-Wert 2,118 nun einen Rang höher steht.

**Offen:**

- Haus 12 (haus_renaissance): der Außen-Fleck liest Luma 0,0019, die Quote 114,1 — fast schwarz, kein Boden im Schatten (die
  anderen 16 Flecke lesen 0,008 bis 0,126). Das Urteil hängt nicht daran (innen 0,218). Leser: die Station `siedlung.K1#2` (ihr
  Dienst, die Punkte-Maschine) und eine Zeile im FUND-REGISTER.
- Das Gesetz `_hausSchatten` rechnet jeden Körper bis zur Oberkante seiner Decke: am Haus 16 endet sein Schatten in 8,25 m, im
  Bild bleibt der Boden bis 9,25 m dunkel (0,015 bis 0,032) und wird erst in 9,5 m hell (0,101). Die Ursache ist nicht gemessen
  (das Dach über der Traufe oder das Laub daneben). Leser: `planet.kopplung.stadtklima#1` (die Nässe liest dasselbe Gesetz).
