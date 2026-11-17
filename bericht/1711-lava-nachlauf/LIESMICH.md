# w28-lava-nachlauf — ZWISCHENSTAND zur Abgabe (GTX 1050, 17.11., Abgabe-Kopf 1d835734)

Zwei Wurzeln, EIN Kopf auf main d3ddb51c (V18.546.328): (a) das Bett einer Zelle ist FLÄCHE, die Last bleibt ganz · (b) EINE Prozess-Uhr —
die Uhr des Spielers ist Sicht. Dazu der Umzug des Brands in sein Modul-Teil (`stamm/feld-brand.js`; feld-leben.js stand an der
Decke 3 996 / 4 000 Z.).

## (a) Das Bett ist Fläche — `stamm/feld-brand.js`

Geschnitten: `_brandStoff` misst das Bett zuerst an fünf Punkten (`BRAND.bettGrob`, Mitte und Viertel); nur eine Zelle mit
Brennstoff UND Kahlem misst ihre Maske an 8 × 8 Punkten (`BRAND.bettGitter`: Maske + Anteil; die Zeile = der häufigste
brennbare Stoff), einmal je Brand. Die Last der Flamme ist das volle Bett (`leb` = lebendig, nicht × Anteil). EINE Lese-Stelle `_brandBettFn`
(bilinear, Kante `BRAND.bettKante`): Front (`_brandFront`), Narbe (`_brandZelle`; die Tat trägt die Maske als Hex) und Flammen
(`_brandBild`) stehen nur auf dem Bett.

Gemessen an der Teil-Zelle −248/−1080 (Anteil 0,2, die Stations-Probe wörtlich), vorher 31d156e8 ↔ nachher:

| | vorher | nachher |
| --- | --- | --- |
| Flammen der Zelle | 25, über die ganze Zelle, kaum sichtbar | 4, alle auf dem Gras, volle Höhe |
| Flammen-Pixel der Probe | +0 / +3 | +43 |
| Asche in der Mitte (Kies) | 1 | 0 |
| veränderte Fläche der Zelle | 0,946 | 0,316 |
| Linse L3 (Stein auf der halben Zelle): Flammen auf dem Stein · Asche Gras / Stein | 1 019 · 1 / 1 (Mutante ohne Maske) | 0 · 1 / 0 |

Bildpaar: `nachlauf-teilzelle-vorher-{brennt,erloschen}.png` ↔ `nachlauf-teilzelle-nachher-{brennt,erloschen}.png`.
Kosten: ein `_brandStoff` mit Maske 0,595 ms (fünf Punkte ≈ 0,11 ms wie vorher), nur an der Bett-Kante. Die Stand-Linse
BRAND-ZELLEN nannte die Maske je Zündung beim Namen (4 945 Einheiten bei 16 Zellen, Soll 64 je Zelle); ihr Soll trägt jetzt
64 je Zelle + 64 je Masken-Punkt einer neu gemessenen Kanten-Zelle (gemessen 2 Masken in einem Schritt mit 79 Zellen:
10 882 Einheiten, ≈ 61 je Punkt), Täter „eine Bett-Maske entschuldigt die Welt nicht" im Selbsttest.

## (b) EINE Prozess-Uhr — die Uhr des Spielers ist Sicht

Der erste Bau (der Regler hebt `spielZeit`) fiel am Veto des Koordinators vor dem Commit: `set_time_of_day` ist NON_BROADCASTABLE,
die eigene Tageszeit bleibt. Geschnitten ist die andere Seite:

- `_weltTag()` (`stamm/feld-leben.js`): der Tag der Prozesse = `worldMeta.tagNull` + `spielZeit` ÷ `PEGEL_TAG_S` (3 600 s Welt-Uhr
  je Tag, der Tag des Gesetzes). `_weltTagEichen()` legt einen Stand von vor dem Schnitt beim Laden EINMAL auf den Tag seiner Stempel.
- `_uhrSetzen` / Regler / DSL bewegen keinen Prozess mehr; die Nässe-Dosis `nassTage` schreibt `_naesseTakt` an der Welt-Uhr.
- `_tickBrand`: ein Sprung der Welt-Uhr (> `BRAND.sprungS` 10 s: geladener Stand, Mitspieler) geht von Ereignis zu Ereignis (die
  nächste Ankunft einer wartenden Zelle auf dem Raster der Schritte), nie `schrittS` um `schrittS`.

**Leser des Tags der Prozesse (`_weltTag`), alle umgezogen vom Tag der Sicht (`worldMeta.tag` + `timeOfDay`):**
`_weltStunde` → das Erkalten der Lava (`_lavaZustand`, feld-leben.js) · Stempel `h` und Heilung der Taten (`_tatSchreiben`,
`_narbeAt`, `_tatDauer`) · der Nachwuchs (`_tickScatterRegrow`, dirigent-takt.js) · die Sukzession (`_sukzession`,
vegetation-wiese.js) — `_trittJetzt` und der Tag-Wechsel des Pfads (`_tickWegeKarte`, siedlung-wege.js) — das Alter der Werke
(`_werkAlter`, `_werkeAltern`, Geburt eines Werks; siedlung-satz.js) — die Nässe-Dosis (`_naesseTakt`, bild-himmel.js).
**Am Tag der Sicht bleibt:** `timeOfDay` selbst (Sonne, Himmel, Belichtung, Zeitplan der Lichter, Tagesplan der Bewohner nach der
Sonne des Spielers) und `worldMeta.tag` — den zählt `_uhrSetzen` weiter, es liest ihn nur noch der Playtest (`sprungNimmtTag`).
**Leser der Welt-Uhr `spielZeit` (183 Stellen in 29 Stamm-Dateien):** der Gang der Uhr (`tickDayNight`), Wetter-Zug und Front,
Nässe, Wind, Brand, Leben-Feld und Wuchs, Kreatur-Leben und -Verhalten, Seele, Kampf, DSL-Takte (`everySec`), Nexus, Pegel und
Hydro, Bewohner, Hof, Netz (`pos.w`) und Stand.

Gemessen (Linse `gate:stand-takt --narbe`, Fall L6, auf der Karte; je ein Lauf):

| | vorher (Tag der Sicht) | nachher |
| --- | --- | --- |
| Regler 10 → 14 Uhr: Welt-Stunde · Decke der Lava | +4 h · −875 K | +0 h · +0,1 K (die Luft der Stunde) |
| Regler 10 → 14 Uhr mit laufendem Brand: Welt-Uhr · Brand | 65,1 → 65,1 s · steht | 65,1 → 65,1 s · steht (Sicht) |
| `_weltUhrNimm(+600 s)`: Welt-Stunde · Decke · Uhr des Brands | +0 h · 1 377 → 1 377 °C · +600 s | +4 h · 1 308 → 476 °C · +600 s |
| Schritte des Brands für +600 s | 600 | 108 bei 121 Zündungen |
| ms je `setTimeOfDay` beim Ziehen (16 Schritte, laufender Brand) | 6,6 Median · 9,1 max | 5,4 Median · 6,8 max (Takt des Brands danach 0,41 · 1,43) |

Konsum-Probe im Spiel (Werkbank, Regen): drei Tage am Regler → Tag der Prozesse, Werk-Alter, Pfad-Uhr, `nassTage` je +0; drei Tage
Welt-Uhr (`_weltUhrNimm(+10 800 s)`) → +3 Tage, Werk-Zeit 3, `nassTage` 1,8.

## Die Stationen (heilt der Vorarbeiter 12)

- kaskade am Herd mit Anteil 1 (`f.anteil === 1`), drei Läufe je in eigener Welt: 167 · 287 · 131 Flammen-Pixel, Mittel 195 (7de938ab: 211 · 193, Mittel 202). Das Mittel
  liegt 3 % darunter, die Läufe streuen über den Faktor 2,2 — „nicht unter" ist auf dieser Karte nicht entscheidbar; Asche 1,
  veränderte Fläche 0,881–0,889, erloschen nach 7 s Regen. Bilder `st-n4-kaskade{1,2,3}-{vor,brennt,erloschen}.png`.
- ereignis mit der Prozess-Uhr (`spielZeit` + 60 s je Schritt statt 1 s am 1-min-Tag, Sonne über `setTimeOfDay`): erstarrt r/g 0,988 (Soll ≤ 1,10), Glut-Bild r/g 2,819, dunkel nach 0,4 h, der Brand lief
  20 000 s seiner Uhr mit und lebt. Bilder `st-n4-ereignis-{glut,erstarrt}.png`.
- Die Station stellt Prozess-Zeit über `_weltUhrNimm` (oder `spielZeit`), den Sonnenstand über `setTimeOfDay`; ihr Schritt
  „1 s am 1-min-Tag = 0,4 h" ist jetzt 60 s Welt-Uhr.

## Der Brand an der Proben-Stelle (Guss −280/−1048, sonnig) — Gesetz, kein Schnitt

600 s 18 brennend / 6 Aschen · 3 600 s 83 / 99 · 7 200 s 116 / 225 (Gipfel) · 14 400 s 57 / 403. Er endet am Brennstoff
(die Ränder des Betts), nicht in vier Spielstunden; Regen löscht in 7 s. Am Gipfel (7 200 s, 112 brennende Zellen) zeichnet
der Schirm 94 Flammen (Deckel `flammenMax` 384 aus höchstens `zellenMax` 32 Zellen, die nächsten zuerst); `_brandBild` kostet
0,50 ms im Median (max 6,3 ms, der erste Ruf baut den Satz) — die Kosten hängen am Schirm, nicht an den 112 Zellen.

Beobachtet, UNGEPRÜFT: in der ereignis-Probe steht nach 20 000 s Brand-Uhr um den Guss wieder grünes Gras, der Brand lebt. Die
Narbe „brand" heilt in 72 Welt-Stunden ÷ Wuchs (`TAT_NARBE`), das sind an der Prozess-Uhr 10 800 s — im Spiel wie vorher (der
Standard-Tag 60 min = `PEGEL_TAG_S`), neu nur auf den eingefrorenen Bühnen. Ob eine geheilte Zelle erneut brennt, ist nicht gemessen.

Lava nah, Tag und Nacht (Pose von lava-z7): `nachlauf-lava-{tag,nacht}.png` ↔ `lava-z7-nah-{tag,nacht}.png` — Risse orange, Flammen
am Saum, Rauch von unten beleuchtet, kein weißer Kern; nicht schlechter.

## Tore am Kopf

Alle am Kopf 14bb921c mit Exit 0 (17.11. 22:31–23:17): format:check · check · gate:welt-boot · playtest · gate:stand-takt (Selbsttest,
Stand, Narbe) · gate:wasser-leben · gate:wetter-wache · gate:gegenstand-stoff · gate:post-kette · `--narbe` auf der Karte (L1–L6
mit Mutanten) · gate:pruefbuehne-licht mit Selbsttest auf der Karte.
Danach kam main d3ddb51c (V18.546.328: Werkzeug und Versions-Stufe, kein Stamm-Code außer der Versions-Zeile) dazu; am Kopf
2cdc633c neu mit Exit 0 (23:32–23:55): format:check · check · gate:welt-boot · playtest, dazu die Atlas-Ratsche. Die Linsen-Tore
sind dort nicht neu gefahren. Schild der Abgabe: `gate:stand-takt`.

## Ehrlich offen

- Kein Tor trägt das Alter der Werke, die Nässe-Dosis und die Erholung des Pfads über Tage — der Umzug dieser drei Leser ist an
  EINER Konsum-Probe im Spiel gemessen, nicht an einer Linse mit Mutante.
- `worldMeta.tag` (der Tag der Sicht) hat im Stamm keinen Leser mehr; er fällt nicht in diesem Kopf (der Playtest liest ihn).
- Im Sprung liest der Brand die Nässe am ENDE des Sprungs: ein Regen, der im übersprungenen Stück fiel und wieder trocknete, löscht nicht.
- Die Front quert in einer Teil-Zelle weiter den kahlen Grund (das Raster 16 m trägt Ankunft und Ende je Zelle); Flammen und
  Narbe stehen dort nicht.
- Der Sprung „gleich der Schleife" steht per Konstruktion (dasselbe Raster der Schritte); gemessen sind aufeinander folgende
  Läufe der Linse (35 Aschen / 74 brennend ↔ Schleife 33 / 94 ↔ dritter Lauf 31 / 89), die sich auch untereinander unterscheiden.
- Das Soll 200 der kaskade hat auf der GTX 1050 keine Luft (Streuung des gleichen Kopfs 131 ↔ 287).
- Das Bildpaar der Teil-Zelle ist mit der 8 × 8 Maske je Zündung geschossen; seit die Maske nur an der Bett-Kante misst, ist es
  nicht neu geschossen (die Teil-Zelle hat eine Kante, ihre Maske ist dieselbe; die Linse L3 ist am Kopf grün).
- Der Merge-Treiber `merge=register` ist in diesem Klon nicht eingerichtet: der Konflikt in index.html ist von Hand auf dem
  Text von main plus dem Tag von `feld-brand.js` gelöst (Atlas-Ratsche grün).
