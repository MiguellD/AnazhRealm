# biome-hoehenstufen — Stand-Blatt (Macher-Bahn, Welle 27.11.)

## Stand 27.11. früh — ZWISCHENSTAND (oben steht immer der neueste)

**Sprosse:** `karte2.leben.pflanzen.biome#2`. Urteil GTX 1060 an 31ea3847: stufenProzent 56,897 % (Soll ≥ 90 %), kantenProzent
14,765 % (Soll ≤ 10 %). Täter: phyto-core `forestNische`. Die Art folgte dry/wet/clim, eine Höhenstufe kam nicht vor.

**Schnitt (im Gesetz der Nische, kein Filter im Stamm).**

- gelaende-core `waldStufe(L, y, x, z)`: die Höhe am Ort im Maß der EINEN Waldgrenze der Welt. 0 am Meer, 1 am Beginn des
  Schnees, mit derselben Zunge und demselben Band wie `schnee`.
- phyto-core `forestStufe(u)`: die Faktoren Laub · Tanne · Kiefer. `forestNische` liest `ctx.stufe` als KERN-PFLICHT und wirft
  laut, wenn sie fehlt. Leser: der Wirt (`_forestGeborene`) und der Faden (`waldCtx`, der ctx der Fern-Nische, der Kamm), alle
  aus EINER Quelle.
- Das Band (`FOREST_STUFE`): kollin 0,25 · montan 0,83 · Ökoton 0,125. Quellen:
  - DAV „Höhenstufen der Alpen“: kollin bis 800 m (Buche, Eiche); montan bis 1 500 m, „Übergang von Laub-, Misch- und
    Nadelwäldern“; subalpin Fichte–Lärche und Lärche–Zirbe.
  - Schülerlexikon „Die obere Waldgrenze“: am Nordrand 1 600–1 800 m.
  - Die Untergrenze der subalpinen Stufe schwankt um ±150 m (1 500–1 800 m). Über 500 m Vorland bis zur Waldgrenze ergibt
    das kollin 0,25, montan 0,83 und das Ökoton 0,125.
- Montan ist Mischwald (die Tanne dazwischen). Das Ökoton ist die Breite des Übergangs im Gesetz, keine Kante.

**Gemessen.** Rumpf der Station der Leiter `leben.pflanzen.biome` (Zweig punkte-maschine), S2 headless in der Werkbank (kienspan, echter
Renderer, Faden `_voxelWorkerWaldDarts`). Die Kerne von main wurden live getauscht, 90 Transekte × 12 Zellen, 1 080 Antworten.

| Messort | stufenProzent main → Zweig | kantenProzent main → Zweig | Hänge |
|---|---|---|---|
| Wiese −280,4/−1045,6 (Ort der Station) | 58,621 → 96,429 % | 4,624 → 8,000 % | 58 → 56 |
| Genesis (Heimat der Standard-Welt) | 55,6 → 88,7 % | 10,4 → 10,9 % | 62 |
| Dorf | 56,5 → 87,0 % | 6,0 → 8,6 % | 46 |
| hochhaus-dach | 71,7 → 88,9 % | 7,9 → 11,2 % | 54 |
| gipfel-blick | 64,3 → 96,4 % | 6,7 → 8,0 % | 55 |
| Küste | 69,6 → 91,7 % | 2,6 → 7,9 % | 48 |
| Ufer | 61,1 → 89,1 % | 5,4 → 3,5 % | 55 |

Weitere Werte an der Wiese:

- Wechsel 173 → 150, Kanten 8 → 12.
- gipfelBaeume 0 → 0, waermeAussen 0 → 0.
- uferProzent bleibt null (kein Wasserpunkt in der Stichprobe von kienspan, vorher wie nachher).

**Im Bild.** Arten im Radius 150 m vom Messort:

- Wiese: 7 → 7 Arten. Kiefer 315 → 36, Tanne 576 → 564, Eiche 234 → 328, Birke 184 → 276. Der Hang unten wird Laub, oben Nadel.
- Genesis: 5 → 5 Arten (Tanne 610, Kiefer 379, Birke 77, Eiche 30).
- Dorf: 7 → 7 Arten.
- hochhaus-dach: 5 → 5 Arten.
- gipfel-blick: 5 → 4 Arten. Die Laub-Arten fallen aus, es bleiben Kiefer 213 und Tanne 15.
- Küste: 5 → 4 Arten (Erle 80).
- Ufer: 7 → 7 Arten.

**Nachgefahren.**

- kraft#2: S2 laufzeitAbw 11,706 % (Soll ≤ 20 %), Station-Seite an der Wiese, derselbe Wert wie am Kopf von wind-boee-haus.
- biome#1: waermeAussen 0 und gipfelBaeume 0 an der Wiese wie zuvor. uferProzent ist an kienspan nicht messbar.

**Linse.** gate:phyto-core, Block „Höhenstufen“: der mittlere Rang (Laub 1 · Tanne 2 · Kiefer 3) steigt über u 0 → 1,2 von
1,01 auf 2,96, der größte Schritt je Δu 0,02 ist 0,067 (Ökoton ≤ 0,2). Zwei Mutanten fallen beim Namen:

- ohne Stufe: der Rang bleibt bei 1,759 → 1,759.
- ohne Ökoton: ein Schritt springt um 0,385.

**Ehrlich offen.**

- Die Waldgrenze der Welt steht am Schnee, bei einem Sommermittel um 2,5 °C. Die Profis setzen sie bei etwa 10 °C an. Das ist
  nicht Teil dieser Sprosse.
- Genesis und Dorf bleiben unter 90 % (88,7 und 87,0 %). Kanten über 10 % an hochhaus-dach (11,2 %) und Genesis (10,9 %): das
  Rauschen kommt von Zellen mit 1–3 Bäumen und von Totholz-Zellen.
- stadt, stadt-voll und ort-zeichen haben kein festes Ziel (anlauf) und sind nicht gemessen. buehne ist eine eigene Welt.
- Das Urteil der GPU-Probe steht aus.

Karte 2 gebucht: 134 von 1 718.
