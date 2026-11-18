# Lesen (b) — WETTER

Das Wetter ist im Code EIN globales Wort `state.weather` ∈ {sunny, foggy, cloudy, rainy, stormy} (`stamm/daten.js:52-57`). Jedes Wort zeigt auf eine Zeile von
phyto-core `WX_GESETZ` mit fünf Kanälen {fog, sun, grey, wind, rain} (`phyto-core.js:4287-4293`, `stamm/daten.js:112-125`). Zwischen zwei Wörtern liegt ein Lerp über 45 s
(`stamm/bild-himmel.js:2820-2837`). Das Wort schreibt der Wetter-Zug: je 120 s Welt-Uhr (`stamm/dirigent-takt.js:1714`) liest er die Zeile der Front `wetterAt(saat, x, z, t)`
am Ort des SPIELERS (`stamm/dirigent-takt.js:1733-1734`), außer ein Wunsch-Akt (Nexus, Gemüt, Wesen) oder das Spieler-Wort `wetterWort` steht. Der einzige Setzer im Spiel ist
`_setWeather` (`stamm/bild-himmel.js:3130`); daneben schreiben das Laden (`stamm/speicher-laden.js:331`) und der Boot (`stamm/dirigent-kern.js:284`).
Abgeleitet werden: der Wind `_windAt` (`stamm/stoff-material.js:233-249`), die Temperatur `_temperaturAt` (`stamm/bild-himmel.js:2874-2882` → `gelaende-core.js:1344-1352`),
die Nässe `_naesseTakt` (`stamm/bild-himmel.js:3060-3087`) und der Pegel-Stempel (`stamm/wasser-hydro.js:127-192`).

## 2. DIE GRÖSSEN

Zählregel: Eine Zeile mit eigener gesetzter Konstante zählt als GESETZT. FOLGT steht nur dort, wo der Wert ohne neue Zahl aus Saat, Uhr, Gelände oder anderen Zeilen gerechnet wird.

| # | Name | Einheit / Stellwert | Wert / Bereich | Anker | Schreiber | Leser | FOLGT / GESETZT |
|---|------|---------------------|----------------|-------|-----------|-------|-----------------|
| 1 | Wetter-Wort `state.weather` | Stellwert ohne Einheit (5 Wörter) | sunny · foggy · cloudy · rainy · stormy; der Boot setzt „sunny“ | `WETTER_ZEILE` `stamm/daten.js:52-57` | `_setWeather` `stamm/bild-himmel.js:3130` (gerufen vom Zug `stamm/dirigent-takt.js:1740` und von der DSL `stamm/feld-dsl.js:943`); das Laden `stamm/speicher-laden.js:331` (`|| "sunny"`); der Boot `stamm/dirigent-kern.js:284` | `_weatherFieldFor` `stamm/bild-himmel.js:2836` · `_weatherIsWet` `:2862` · `nassTage` `:3074` · Musik `stamm/klang.js:2058` · Brennglas `stamm/koerper-fahrt.js:2294` · Gefühl der Kreaturen `stamm/feld-leben.js:1748-1757` · `_windAt` `stamm/stoff-material.js:239` | FOLGT: Zeile der Front aus Saat × Spieler-Ort × Welt-Uhr; ein Wunsch oder das Spieler-Wort ersetzt sie als Akt |
| 2 | Front-Stärke f | Stellwert | 0..1; Stufen bewoelkt 0,43 · regen 0,6 · sturm 0,79 | `WIND_FELD.front` `phyto-core.js:4319-4326` (Wellen 6600/4100/2500 m, Biegung 600 m auf 21 km) | `wetterAt` `phyto-core.js:4431-4438` | nur intern zur Zeilenwahl `phyto-core.js:4448-4452`; der Wirt liest `.zeile` (`stamm/bild-himmel.js:2852`), f selbst ungelesen | GESETZT (Wellenlängen und Stufen ohne Quelle; die Verteilung 27/15/21/25/13 % steht als Messung im Kommentar `phyto-core.js:4312`) |
| 3 | Front-Feuchte | Stellwert | 0..1; Nebel ab 0,72 | `feuchteM` 31 km `phyto-core.js:4324` | `phyto-core.js:4439` | nur die Nebel-Stufe `phyto-core.js:4452`; Rückgabe `:4453` vom Wirt ungelesen | GESETZT |
| 4 | Zug der Front `zugMS` | m/s | 11 | „850 hPa, 30–50 km/h“ `phyto-core.js:4314` | — | `wetterAt` `phyto-core.js:4431`; Wolken-Zug `stamm/bild-himmel.js:1773` | GESETZT (im Real-Band) |
| 5 | Zug-Takt `WETTER_ZUG_SEK` | s | 120 | `stamm/daten.js:171` (ohne Quelle) | — | `stamm/dirigent-takt.js:1714`, `:1730`; `_regenMittel` `stamm/wasser-hydro.js:255` | GESETZT |
| 6 | Übergang | s | 45 bei Zug und DSL; 8–120 s nach Gefühl nur im Zweig ohne `zug` | `stamm/daten.js:144` („sanft, nicht zu lang“) | `requestWeatherTransition` `stamm/bild-himmel.js:3204`, `:3137` | `_weatherFieldFor` `:2831-2834` · `_weatherBlendedValue` `:2807-2811` | GESETZT |
| 7 | Regen `rain` | Stellwert 0..1; eine Einheit nur im Pegel: rain 1 = 10 mm/h (`gelaende-core.js:1579`) | klar 0 · nebel 0 · bewoelkt 0,12 · regen 0,6 · sturm 1,0 | `WX_GESETZ` `phyto-core.js:4287-4293` | Wort → `WEATHER_FIELD` `stamm/daten.js:112-125`, Lerp `stamm/bild-himmel.js:2820-2837` | Partikel `stamm/bild-himmel.js:1082`, `:1093` · Nässe `:3078` · Temperatur `gelaende-core.js:1351` · Pegel-Stempel `stamm/wasser-hydro.js:127-192` · Klang `stamm/klang.js:487` · Vögel `stamm/kreatur-fauna.js:42` · Bestäuber `:624` · Bewohner `stamm/siedlung-bewohner.js:2223` → `koerper-core.js:5342` · Gefäß `stamm/bau-teile.js:2567` | GESETZT; global (gilt für die ganze Welt, gemessen am Spieler-Ort), dauert je Zug 120 s |
| 8 | Nebel-Kanal `fog` | Stellwert | 0,15 … 1,0 | `WX_GESETZ` | Lerp wie #7 | `_luftBeta` `stamm/bild-himmel.js:2251-2259`; Tönung `:1182` | GESETZT |
| 9 | Sonnen-Kanal `sun` | Stellwert | klar 1,0 · regen 0,55 · nebel 0,48 · bewoelkt 0,32 · sturm 0,15 | `WX_GESETZ` | Lerp | `temperaturAus` `gelaende-core.js:1350` · `_trockenRate` `stamm/stoff-material.js:2238` · `WX_LICHT` `phyto-core.js:4302` | GESETZT |
| 10 | Grau-Kanal `grey` | Stellwert | 0 … 0,88; `WEATHER_GREY_K` 0,7 | `WX_GESETZ`; `stamm/daten.js:130` | Lerp | Licht `stamm/bild-himmel.js:1285-1290` | GESETZT |
| 11 | Wind-Kanal `wind` | Stellwert | klar 0,06 · nebel 0,1 · bewoelkt 0,3 · regen 0,35 · sturm 1,0 | `WX_GESETZ` | Lerp | `_windAt` `stamm/stoff-material.js:239` | GESETZT |
| 12 | Wolken-Deckung `cloudCover` | Stellwert | sunny 0,12 · foggy 0,47 · cloudy 0,74 · rainy 0,9 · stormy 1,17 → 1 | `WOLKEN_SCHICHT.deckung` `welt-licht.js:864-872` × `WEATHER_INTENSITY` | `stamm/bild-himmel.js:1763` | `wolkenFeld` `welt-licht.js:901-944` (fbm-Rauschen; die Deckung senkt die Schwelle für alle Wolken gleich) | GESETZT |
| 13 | `WEATHER_INTENSITY` | Stellwert | 0 · 0,45 · 0,8 · 1 · 1,35 | `stamm/daten.js:42` | — | `stamm/bild-himmel.js:2805`, `:2863` | GESETZT |
| 14 | Regen am Pegel `PEGEL.regen` | m je Prozess-Tag | 0,072 | `gelaende-core.js:1579-1580`, `:1600` (10 mm/h × 24 h × Abfluss 0,3) | — | `pegelLauf` `gelaende-core.js:1658` | GESETZT (10 mm/h und 0,3 gesetzt, 0,072 daraus gerechnet) |
| 15 | Nässe `state.naesse` | Stellwert 0..1 (der Film) | 0..1; Mittel 0,717 (Probe P3) | `NAESSE` `stamm/stoff-material.js:3788-3803` (benetzen 150 s, verdunsten 480 s, Schwelle 0,05) | `stamm/bild-himmel.js:3080`; die Grundstellung einer Mess-Sitzung `stamm/speicher-laden.js:2688` | Brand `stamm/feld-brand.js:284` · Reifen `stamm/koerper-fahrt.js:1811` · Lava `stamm/siedlung-wege.js:626` · Albedo und Pfütze über `atmoUniforms` `stamm/stoff-material.js:2136`, `:2177`, `:2250`, `stamm/stoff-karte.js:1292` | GESETZT |
| 16 | `nassTage` | Prozess-Tage × rain | Summe | — | `stamm/bild-himmel.js:3076` (liest das Wort OHNE Übergang `:3074`) | Werk-Alter `stamm/siedlung-satz.js:797` | FOLGT (Welt-Uhr / `PEGEL_TAG_S` × rain) |
| 17 | Windrichtung | rad (Einheitsvektor) | θ0 ± 0,72 rad (±41°), Perioden 698 s und 244 s; gleich an jedem Ort | `phyto-core.js:4305-4306`, `:4354-4359` | `_windDirAt` `stamm/stoff-material.js:218` | `_windAt` `stamm/stoff-material.js:235` | GESETZT (θ0, φ1, φ2 aus der Saat; Amplituden und Frequenzen gesetzt) |
| 18 | Wind-Stärke `staerke` | Stellwert | wind × Drift × Form, etwa 0,03 … 1,4 | — | `stamm/stoff-material.js:239` | Gras/Krone `stamm/dirigent-takt.js:2470` · Brand `stamm/feld-brand.js:321` · Regen-Drift `stamm/bild-himmel.js:1098` · Wasser `:2556-2561` · Rauch `stamm/siedlung-bewohner.js:116` · Nase `stamm/koerper-seele.js:1628` · Haar `stamm/koerper-leib.js:1869` · Segel `:3166` · Wagen `stamm/koerper-fahrt.js:1851` · Vögel `stamm/kreatur-fauna.js:42` · Bestäuber `:622` | FOLGT (aus #11, #20, #21) |
| 19 | Böe `boe` | Stellwert | 0,25 … 1,15; ω 0,4/s, k 0,0384/m → Wellenlänge 164 m, Lauf 10,4 m/s | `WIND_GESETZ.boe` `phyto-core.js:6597` | `stamm/stoff-material.js:237` | `ms` `:240`; Shader über `WIND_BOE` `stamm/daten.js:141` | GESETZT |
| 20 | Wind-Drift `_windWob` | Stellwert | 1 ± 0,18 | `stamm/stoff-material.js:266` (ohne Quelle) | — | `:239`; der Brand teilt sie heraus `stamm/feld-brand.js:328` | GESETZT |
| 21 | Wind-Form | Stellwert | 0,6 (Lee) … 1,2 (Düse) | gelaende-core `windForm` über `stamm/stoff-material.js:272-295` | `:238` | `:239` | FOLGT (Gelände) |
| 22 | Wind `ms` | m/s | staerke × boe × 24; Sturm frei im Mittel 16,8, Spitze ≈ 39 | `sturmMS` 24 = Beaufort 9–10 `phyto-core.js:4315`, `:4318` | `stamm/stoff-material.js:240` | Brand (ohne Böe und Drift: U = 24 × wind × Form) `stamm/feld-brand.js:327-329` · Bestäuber `stamm/kreatur-fauna.js:622` | GESETZT |
| 23 | Shader-Wind `uWindStrength` | Stellwert | staerke × 0,55; Startwert 0,12 | `WEATHER_WIND_AMP` `stamm/daten.js:134-135` („Browser-tunbar“) | `stamm/dirigent-takt.js:2470` (am AUGE) | Gras- und Kronen-Shader `stamm/stoff-material.js:517` | GESETZT |
| 24 | Luft-Temperatur | °C | am Meer: Sommer 18, Winter −4 (Tagesmittel), Tagesgang ±5 K mit Gipfel 15 Uhr | `TEMPERATUR` `gelaende-core.js:1313-1320` („gemäßigt-kontinental“) | keiner (reine Funktion); `_temperaturAt` `stamm/bild-himmel.js:2874-2882` | Brand `stamm/feld-brand.js:315` · Lava `stamm/feld-leben.js:2484` · Esse `:2509` · Grillen `stamm/klang.js:492` · Zünd-Wärme `stamm/koerper-fahrt.js:2398` · Busch an der Lava `stamm/siedlung-wege.js:581` | GESETZT |
| 25 | Höhen-Kühlung | K/m | 0,1108 | `gelaende-core.js:5850` = 18 °C / Mitte des Schneebands 162,5 m (`:1282-1284`) | — | `temperaturFeld` `gelaende-core.js:1334` | FOLGT (aus #24 und dem Schneeband) |
| 26 | Wolke und Regen an der Temperatur `WOLKE` | K | Tagesgang × (1 − 0,5 · (1 − sun)); −3 K × rain | `gelaende-core.js:1343` (Dämpfung: Dai 1999 `:1339-1340`) | — | `temperaturAus` `gelaende-core.js:1350-1351` | GESETZT |
| 27 | Sicht-Uhr `timeOfDay` | Stellwert 0..1 je Tag | Tageslänge 1–60 min, Vorgabe 60 | `stamm/daten.js:147-161` | `tickDayNight` `stamm/bild-himmel.js:2631`, `_uhrSetzen` `:2712-2750`, DSL `set_time_of_day` `stamm/feld-dsl.js:949` (NON_BROADCASTABLE) | Sonne `stamm/bild-himmel.js:1384` · Temperatur `:2879` · Bewohner-Stunde `stamm/siedlung-bewohner.js:2157` · Tag-Phase der Tiere `stamm/kreatur-leben.js:2063` | GESETZT (Regler des Spielers) |
| 28 | Prozess-Tag `PEGEL_TAG_S` | s | 3600 | `stamm/daten.js:166` (= Vorgabe der Tageslänge) | — | `nassTage` `stamm/bild-himmel.js:3076` · `_weltTag` `stamm/feld-leben.js:2604` | GESETZT |
| 29 | Jahr `seasonYearSeconds` | s | 2400 | `stamm/dirigent-kern.js:311` | — | Anker des Jahrs `stamm/bild-himmel.js:933` · `setSeason` `:970` · Laden `stamm/speicher-laden.js:543` (alle drei mit eigener Ersatz-2400) | GESETZT |
| 30 | Saison-Phase `seasonPhase` | Stellwert 0..1 je Jahr | Sommer-Mitte 0,375 | — | `stamm/bild-himmel.js:908`; Wort `setSeason` `:965-970` | `temperaturAus` über `:2878` · Tönung `:915-918` · Schnee `:921` | FOLGT (Welt-Uhr / Jahr) |
| 31 | Sonnenstand | rad | Mittag 74,2°; ohne Jahr und Breite | `welt-licht.js:699-717` (die Bahn aus Jahr × Breite „bleibt draußen“ `:702-710`) | — | Licht · Brennglas `stamm/koerper-fahrt.js:2294` · Vögel `stamm/kreatur-fauna.js:42` · Bestäuber `:624` · Klang `stamm/klang.js:488` | GESETZT |
| 32 | Einstrahlung des Brennglases | W/m² | 1000, nur bei Wort „sunny“ | `stamm/koerper-fahrt.js:3258` | — | `stamm/koerper-fahrt.js:2294` ff. | GESETZT |

**Gezählt:** 32 Größen, davon 6 FOLGT (#1, #16, #18, #21, #25, #30), 26 GESETZT und 18 ohne Einheit (#1–3, #7–13, #15, #18–21, #23, #27, #30).
Ein Regen in mm/h hat keine eigene Zeile: die Einheit steht nur im Kommentar des Pegels (`gelaende-core.js:1579`). Eine **Luftfeuchte** gibt es als Größe der Welt NICHT (#3 bleibt im Kern).

**Wer erzeugt, wie oft, bootgleich.** Der Zug zieht je 120 s Welt-Uhr (`stamm/dirigent-takt.js:1714-1717`). Das Wort ist eine Funktion von Saat, Spieler-Ort, Welt-Uhr und Akten (Kommentar `:1720-1727`).
Die Welt-Uhr `spielZeit` reist im Stand (`stamm/speicher-welten.js:1305`), das Wort auch (`:1129`).
Die Nässe reist NICHT (`stamm/speicher-welten.js`, kein Eintrag): nach einem Reload startet sie bei 0 (`stamm/bild-himmel.js:3077`).
Bis die Bühne steht, gilt „sunny“ vom Boot (`stamm/dirigent-kern.js:284`, `stamm/dirigent-takt.js:1715`).

## 3. DIE FLÜSSE

- **Wetter → Feuer:** Die Nässe geht in die Brennstoff-Feuchte, M = 0,06 + 0,29 · Boden + 2,5 · Nässe (`stamm/feld-brand.js:284`, `:975`). Liegt M ≥ mx (Gras 0,12, Laub 0,25; `stamm/bau-vorlagen.js:1647-1648`), gibt `_brandTempo` null (`stamm/feld-brand.js:310`) und die Zelle erlischt (`:505-534`).
  Der Brand liest außerdem die Temperatur (`:315`) und den Wind ohne Böe und Drift (`:321`, `:327-329`).
  Gras erstickt ab einer Nässe von 0,024, Laub ab 0,076.
  Bewertet wird je Schritt des Brands (`:505-534`), für alle Zellen gleichzeitig: „der Regen löscht jede Zelle zugleich“ (`:466`).
- **Wetter → Wasser:** `rain` geht in den Pegel-Stempel (`stamm/wasser-hydro.js:127-192`, Nash-Kaskade `gelaende-core.js:1658`).
  Das Klima-Mittel kommt von der Front am Ursprung (0,0), nicht vom Spieler-Ort (`stamm/wasser-hydro.js:255`); die Vergangenheit des Pegels dagegen vom Spieler-Ort (`stamm/dirigent-takt.js:1736`).
- **Wetter → Stoff:** Die Nässe dunkelt die Albedo, gewichtet mit Poren × Himmels-Sicht (`stamm/stoff-material.js:2119-2136`). Sie füllt die Pfützen (`:2155-2177`), macht den Reifen glatt (`stamm/koerper-fahrt.js:1811`) und lässt Werke rosten und bemoosen (`nassTage` → `stamm/siedlung-satz.js:797`).
- **Wetter → Pflanzen:** Nur das Wiegen: `uWindStrength` und `uWindDir` am Auge (`stamm/dirigent-takt.js:2468-2471`). Die Nässe-Albedo gilt auch für die Poren von Laub und Gras (`stamm/stoff-material.js:3798`).
- **Wetter → Tiere und Menschen:** Bewohner bleiben ab rain ≥ 0,3 ± 0,15 daheim (`koerper-core.js:5342`, `TAGES_GESETZ.regen` `:5218`). Kreaturen bekommen einen Gefühls-Impuls (`stamm/feld-leben.js:1748-1757`) und eine Spawn-Stimmung (`stamm/kreatur-verhalten.js:2366`). Vogel-Lied und Bestäuber lesen rain, Wind und Sonnenhöhe (`stamm/kreatur-fauna.js:41-42`, `:622-624`).
- **Wetter → Bild und Klang:** Licht und Tönung (`stamm/bild-himmel.js:1182`, `:1285-1290`), Wolken-Deckung (`:1763`), Luft-Extinktion (`:2251-2259`), Regen-Partikel um das Auge (`:1067-1100`), Kräuseln des Wassers (`:2556-2561`); Klang-Lage (`stamm/klang.js:487-492`) und Musik-Schicht (`:2054-2067`).
- **Uhren:** Die Temperatur liest die SICHT-Uhr `timeOfDay` (`stamm/bild-himmel.js:2879`). Der Zug, die Nässe und der Pegel laufen auf der Welt-Uhr `spielZeit`.

**FEHLENDE Kopplungen** (Absenz im Code, je mit dem Ort, an dem der Leser stattdessen liest):
1. **Regen → Boden-Feuchte:** fehlt. `_feuchteAt` rechnet nur aus Flussnähe und Höhe über dem Spiegel (`stamm/gelaende-boden.js:1538-1563`). Der Brand misst diese Feuchte EINMAL je Brand und hält sie fest (`stamm/feld-brand.js:268`).
2. **Regen → Wuchs:** fehlt. `WUCHS.wasserBasis` 0,75 steht konstant als „Regen“ (`stamm/vegetation-wiese.js:2071-2081`, `:3174`). Auch **Temperatur → Wuchs** fehlt: `stamm/vegetation-*.js` liest weder `weather`, `naesse` noch `_temperaturAt` (Grep: 0 Treffer).
3. **Luftfeuchte → Brennstoff:** fehlt. Die trockene Brennstoff-Feuchte steht fest bei 0,06 (`stamm/feld-brand.js:975`); es gibt kein Gleichgewicht aus Temperatur und Luftfeuchte. Die Front-Feuchte (`phyto-core.js:4439`) erreicht den Wirt nicht.
4. **Temperatur → Niederschlag:** fehlt. Der Regen fällt auch bei Frost (`stamm/bild-himmel.js:1067-1100` liest keine Temperatur). Der Schneefall kommt nicht aus dem Wetter: `SCHMELZE.fall` liegt 1,5 mm je Frosttag (`gelaende-core.js:1458`).
5. **Front → Ort:** fehlt. Die Front ist räumlich (`phyto-core.js:4423-4453`), der Zustand aber global: ein Wort am Spieler-Ort (`stamm/dirigent-takt.js:1733`) gilt für Regen, Nässe, Brand und Wolken der ganzen Welt.
6. **Relief → Wetter:** fehlt. `wetterAt` liest Saat, x, z, t und Ort-Δ, kein Gelände: kein Regenschatten, kein Stau.
7. **Druck und Blitz:** fehlen (Grep „blitz|lightning|donner|luftdruck|hPa“ in `stamm/` und den Kernen: nur der Kommentar „850 hPa“ `phyto-core.js:4314`).
8. **Feuer → Wetter/Luft:** fehlt. Der Brand verdampft keinen Regen und zieht keinen eigenen Wind; der Wind am Brand ist der des Felds (`stamm/feld-brand.js:321`).
9. **Regen-Löschung × Dach/Krone:** fehlt. Der Brand liest die globale Nässe ohne Himmels-Sicht (`stamm/feld-brand.js:284`), der Stoff dagegen mit ihr (`stamm/stoff-material.js:2119-2136`).
10. **Tiere → Schutz:** fehlt. Kreaturen bekommen nur das Gefühl (`stamm/feld-leben.js:1748-1757`); einen Ort-Wechsel bei Regen gibt es nur für Bewohner.
11. **Jahreszeit → Wetter:** fehlt. `wetterAt` liest keine Saison, der Sonnenstand kein Jahr und keine Breite (`welt-licht.js:699-717`).

## 4. DIE BRÜCHE

**Zwillinge**
- **Z1 Bewölkung doppelt:** `cloudCover` folgt der Achse `WEATHER_INTENSITY` (`stamm/daten.js:42` → `stamm/bild-himmel.js:1763`): rainy 0,9 liegt über cloudy 0,74. `grey` und `sun` folgen `WX_GESETZ` (`phyto-core.js:4288-4293`): bei regen grey 0,6 < 0,74 und sun 0,55 > 0,32. Die Wolkenschicht sagt also, Regen sei dichter als bewölkt; das Licht sagt das Gegenteil.
- **Z2 „Regnet es?“ — sechs Antworten:**
  - `_weatherIsWet` mit INTENSITY ≥ 1 (`stamm/bild-himmel.js:2863`): bewölkt gilt als trocken.
  - Nässe-Ziel rain > 0,05 (`:3078`): bewölkt (0,12) gilt als nass und trocknet nie.
  - Partikel bei rain > 0,01 (`:1082`).
  - Bewohner ab 0,3 ± 0,15 (`koerper-core.js:5342`).
  - Brennglas nur bei `=== "sunny"` (`stamm/koerper-fahrt.js:2294`): nebel und bewölkt sperren es, die Sonnenhöhe zählt nicht.
  - Sturm-Gefühl über `=== "stormy"` (`stamm/feld-leben.js:1757`).
  - Ohne Übergang lesen Musik (`stamm/klang.js:2058`) und `nassTage` (`stamm/bild-himmel.js:3074`) das Wort; Nässe und Licht lesen den Lerp.
- **Z3 Windrichtung doppelt:** Gras, Rauch, Feuer und Regen lesen `windRichtung` mit ±41° Mäander (`phyto-core.js:4357`). Wolken und Front ziehen längs θ0 (`stamm/bild-himmel.js:1769`, `phyto-core.js:4428`). Der Abstand erreicht 41°; die Sprosse wetter-welt#2 verlangt ±20°.
- **Z4 Planeten-Wind ist ein toter Schreiber:** `o.wetter = { windX, windZ, … }` (`planet-core.js:2336`). `ORT_FELDER.wetter` trägt nur `regenQuote` und `sturmQuote` (`gelaende-core.js:5701`); windX und windZ liest nur `scripts/diag-planet.cjs`.
- **Z5 Labor-Wind:** Das Labor setzt `uWindDir` fest auf (1, 0, 0,35) (`foundry-core.js:66`). `halmBiegung` hat eine eigene Böe (`_travel = dot·0,030 − uTime·1,15`, `foundry-core.js:809`), der Impostor wiegt mit einer eigenen Welle (`worlds/terrain/phytogenesis.js:2310`). Die Welt dagegen nutzt `WIND_BOE` (`stamm/daten.js:141`).
- **Z6 Wolke ≠ Front:** Die Wolkenschicht ist fbm-Rauschen mit globaler Schwelle (`welt-licht.js:901-944`) auf einer Wolken-Uhr mit 0–3600 s Saat-Versatz (`stamm/dirigent-takt.js:60`, `:1745-1750`). Die Regen-Bänder der Front (`phyto-core.js:4423`) erscheinen nicht am Himmel.
- **Z7 Einstrahlung dreifach:** Brennglas mit 1000 W/m² hinter dem Wort-Tor (`stamm/koerper-fahrt.js:3258`, `:2294`) · `sun`-Kanal für Nässe, Temperatur und Licht · Durchlass der Atmosphäre im Licht.
- **Z8 Zwei Tag-Uhren:**
  - Der Kommentar sagt „die Uhr des Spielers ist SICHT: kein Prozess liest sie“ (`stamm/bild-himmel.js:2746`).
  - Doch `_temperaturAt` liest `timeOfDay` (`:2879`) und speist damit Brand (`stamm/feld-brand.js:315`), Lava, Esse und Zündung.
  - Ebenso lesen sie Brennglas (`:1384` über `_sonnenRichtung`), Bewohner-Stunde (`stamm/siedlung-bewohner.js:2157`) und Tag-Phase der Tiere (`stamm/kreatur-leben.js:2063`).
  - `timeOfDay` ist NON_BROADCASTABLE (`stamm/feld-dsl.js:949`): zwei Mitspieler sehen also zwei Temperaturen.
- **Z9 Jahr kürzer als Tag:** Ein Jahr dauert 2400 s (`stamm/dirigent-kern.js:311`), der Prozess-Tag 3600 s (`stamm/daten.js:166`). Das Eis rechnet mit `jahrTage` 365 (`gelaende-core.js:1319`).
- **Z10 Wind-Form am Auge:** Der Shader bekommt die Form am Auge (`stamm/dirigent-takt.js:2468-2470`), die CPU-Leser die Form am Ort (`stamm/stoff-material.js:238`).
- **Z12 Länge des Jahrs viermal:** 2400 s stehen in `stamm/dirigent-kern.js:311` und noch einmal als Ersatz in `stamm/bild-himmel.js:933`, `:970` und `stamm/speicher-laden.js:543`.
- **Z11 Ort des Regens doppelt:** Das Klima-Mittel des Pegels kommt von (0,0) (`stamm/wasser-hydro.js:255`), das Wetter vom Spieler-Ort (`stamm/dirigent-takt.js:1733`).

**fail-soft**
- Unbekanntes Wort → sunny (`stamm/bild-himmel.js:2823`, `stamm/klang.js:2058`); unbekanntes Wort → Intensität 0 (`stamm/bild-himmel.js:2806`, `:2863`).
- Laden ohne Wort → „sunny“ (`stamm/speicher-laden.js:331`).
- Fehlende Saat → „anazh-realm-seed“ (`stamm/bild-himmel.js:1769`, `:2847`; `stamm/stoff-material.js:215`; `stamm/dirigent-takt.js:1746`).
- Kein Spieler → Ort (0,0) (`stamm/dirigent-takt.js:1733`).
- `timeOfDay` fehlt → 0,5 (`stamm/bild-himmel.js:1384`).
- Brand: Nässe fehlt → 0 (`stamm/feld-brand.js:284`).
- Jahr fehlt → 2400 s (Z12).

**Tote Schreiber und Leser**
- `wetterAt(...).front` und `.feuchte` liest der Wirt nie (`phyto-core.js:4453` gegen `stamm/bild-himmel.js:2852`).
- windX und windZ (Z4) liest im Spiel niemand.
- Der Gefühls-Übergang von 8–120 s (`stamm/bild-himmel.js:3138-3139`) ist ein toter Zweig: beide Rufer von `_setWeather` übergeben `zug` (`stamm/dirigent-takt.js:1740`, `stamm/feld-dsl.js:943`; Grep im Repo: keine weiteren).

**Konstanten ohne Anker**
- `WEATHER_WIND_AMP` 0,55 (`stamm/daten.js:135`)
- `_windWob` 0,18 und seine drei Frequenzen (`stamm/stoff-material.js:266`)
- `NAESSE` benetzen 150 s, verdunsten 480 s, Gewichte 0,6/0,4/0,15, regenAb 0,05 (`stamm/stoff-material.js:3788-3796`)
- `WETTER_ZUG_SEK` 120 (`stamm/daten.js:171`) und Übergang 45 s (`:144`)
- die Tafel `WX_GESETZ` (`phyto-core.js:4287-4293`)
- Front-Wellen und Stufen (`:4319-4326`)
- Mäander 0,5/0,22 rad (`:4357`)
- `seasonYearSeconds` 2400 (`stamm/dirigent-kern.js:311`)
- `BRAND.feuchte` 0,06/0,35/2,5 (`stamm/feld-brand.js:975`)
- `WOLKEN_SCHICHT.deckung` (`welt-licht.js:864-872`)

**Proben (headless, nur der Kern geladen; die Logik des Wirts abgeschrieben, nicht geladen)**
- **P1 Rechnung** `timeout 60 node /tmp/claude-0/-home-user-AnazhRealm/d169edf0-889e-5d2b-b305-7451b621a8b7/scratchpad/wetter/loesch.cjs`. Konstanten aus `NAESSE`, `BRAND.feuchte`, mx und `WX_GESETZ`; Start trocken bei Nässe 0.
  - Regen löscht Gras nach 6,1 s, Laub nach 19,8 s (sofort) oder 23,7 s und 42,3 s (über den 45-s-Übergang).
  - Sturm: 3,6 und 11,8 s, mit Übergang 18,3 und 32,7 s.
  - Bewölkt: 30,4 und 98,8 s, mit Übergang 56,8 und 125,2 s.
  - Wieder brennbar nach Nässe 1: unter klar 605 s, unter nebel 980 s; bewölkt trocknet nie.
  - U am Brand (Form 1): klar 1,44 · nebel 2,4 · bewoelkt 7,2 · regen 8,4 · sturm 24 m/s.
- **P2 Front** `timeout 60 node …/scratchpad/wetter/front.cjs /home/user/AnazhRealm` (0,27 s). Gerechnet für 3 Saaten × 3 Orte × 2000 Züge (66,7 h Welt-Uhr).
  - Anteile der Zeilen: klar 26–27 % · regen 23–28 % · bewoelkt 20–22 % · sturm 11–14 % · nebel 14–15 %.
  - **Gras brennbar 0,0–0,1 % und Laub 0,0–0,1 % der Welt-Zeit.**
  - (0,0) gegen (3000,0): anderes Wort in 71 % der Züge.
- **P3 Trocknen an der Mess-Wiese** `timeout 60 node …/scratchpad/wetter/trocken.cjs /home/user/AnazhRealm`. Ort (−280,4, −1045,6), Saat „anazh-realm-seed“.
  - Gras erstickt 6,5 s nach dem Start; danach dauert das längste brennbare Fenster 64 s.
  - Nässe im Mittel 0,717.
  - 402 trockene Fenster (klar/nebel), im Mittel 248 s, längstes 360 s — das Trocknen bis Gras-brennbar braucht 605 s.

## 5. SPROSSEN AUS meisterkarte-2 (`git show origin/koordination:vision/meisterkarte-2.json`)

| Sprosse | Wortlaut kurz | Was der Code heute bedient |
|---|---|---|
| same.kopplung.kaskade#1 | Regen löscht Brand, hält im Trockenen | Löschen ja: Nässe → M ≥ mx (`stamm/feld-brand.js:284`, `:310`), Rechnung 6,1 s. „Hält im Trockenen“ trägt der natürliche Zug kaum: Gras brennbar 0,0–0,1 % der Zeit (P2). |
| same.kopplung.kaskade#2 | Regen → Nässe → Stoff → Brand → Licht, Festhalte-Probe | Die Glieder Regen→Nässe (`stamm/bild-himmel.js:3080`), Nässe→Stoff (`stamm/stoff-material.js:2136`) und Nässe→Brand (`stamm/feld-brand.js:284`) stehen. Der Brand liest die Nässe der Welt, nicht den Stoff; Brand → Licht nicht gelesen. |
| same.kopplung.gewalt#1 | Blitz-Brand aus Trockenheit × Gewitter des EINEN Wetters | Nicht bedient: kein Blitz (Grep 0). |
| same.kopplung.kohaerenz#3 | Regenschatten Luv/Lee ≥ 2:1 | Nicht bedient: `wetterAt` liest kein Relief. |
| planet.wetter.lagen#1 | Regen an A bei trockenem B ≥ 20 %, Lag ±20 % | Der Kern trägt es (Kommentar `phyto-core.js:4312-4313`: 23–40 %; P2: 71 % verschiedene Wörter). Im Spiel gilt EIN Wort (`stamm/dirigent-takt.js:1733`). |
| planet.wetter.lagen#2 | Frontpassage: Druckfall, Winddrehung | Nicht bedient: kein Druck; die Richtung mäandert ohne Bezug zur Front. |
| planet.wetter.wolken#1 | Schicht 800 m, Schatten ziehen 2–20 m/s | Zug 11 m/s längs θ0 (`stamm/bild-himmel.js:1766-1777`); Schatten am Boden nicht gelesen. |
| planet.wetter.wolken#4 | Phase folgt dem Temperaturprofil | Nicht bedient (fehlende Kopplung 4). |
| planet.wetter.wolken#5 | Sichtweite gegen Feuchte ±30 % | `_luftBeta` aus fog und rain (`stamm/bild-himmel.js:2251-2259`); eine Luftfeuchte gibt es nicht. |
| planet.wetter.klimazonen#1 | 18/−4 °C am Meer, Schneegrenze folgt der Saison | Bedient im Kern (`gelaende-core.js:1313-1320`, `:5850`); die Uhr des Tags ist die Sicht-Uhr (Z8). |
| planet.wetter.vorhersage#1 | Regen kommt aus der Windrichtung | Die Front zieht längs θ0 (`phyto-core.js:4428-4431`), die Wolken-Deckung ist aber global (`stamm/bild-himmel.js:1763`): nicht sichtbar. |
| planet.kopplung.wetter-welt#1 | Front dimmt Sonne, färbt Himmel | Bedient global (`stamm/bild-himmel.js:1285-1290`, `:1763`). |
| planet.kopplung.wetter-welt#2 | jeder Beweger gleiche Richtung ±20°, Lee < frei < Düse | Ein Wind für Gras, Rauch, Wasser, Regen, Tuch und Wagen (`stamm/stoff-material.js:233`). Wolken längs θ0 bis 41° daneben (Z3). Die Form im Shader gilt am Auge (Z10). |
| planet.kopplung.wetter-welt#3 | poröse Stoffe dunkler, Pfützen in Senken | Bedient (`stamm/stoff-material.js:2119-2177`). |
| planet.kopplung.wetter-welt#4 | Tiere suchen Schutz, Bewohner fliehen den Regen | Bewohner ja (`koerper-core.js:5342`), Tiere nein (nur Gefühl). |
| leben.pflanzen.kraft#1/#2 | Böe als wandernde Front; Gras ↔ Krone gekoppelt | `WIND_BOE` wandert mit 10,4 m/s bei 164 m Wellenlänge (`phyto-core.js:6597`, `stamm/stoff-material.js:237`); das Labor nutzt eine eigene Böe (Z5). |
| same.physik.feuer#1/#2 | nass zündet nicht; Front 0,5–2 m/s mit Wind und Hang; Regen löscht | Nässe → η_M (`stamm/feld-brand.js:310`); Wind 1,44–24 m/s am Brand (P1); Hang `phiS` (`:332`). |
| erleben.bild.himmel#3 | Dunst … Schnee als Dichte desselben Mediums | Dunst und Nebel aus fog, Regen aus rain in `_luftBeta`; Schnee in der Luft nicht gelesen. |

## 6. NICHT VERIFIZIERT

- Nicht gelaufen: eine Probe im echten Wirt (Stamm nicht geladen, kein Fenster). P1–P3 rechnen die Logik des Wirts aus abgeschriebenen Konstanten nach. Die Station `karte2.same.kopplung.kaskade#1` habe ich weder gesucht noch laufen lassen.
- Nicht gelesen:
  - die Einzelheiten von `REGEN_GESETZ` und `_offenerHimmel`
  - ob der Gras-Shader die Wind-Form je Ort nachrechnet
  - der Schatten der Wolken am Boden
  - der Klang unter dem Dach
  - Brand → Licht
- Nicht geprüft:
  - die Saat des Nexus-Wunsches (`stamm/feld-nexus.js:194`, `:310`; ist er bootgleich?)
  - die Herkunft der Saat einer neuen Welt
  - wie oft Wunsch-Akte im echten Spiel die Front überschreiben
