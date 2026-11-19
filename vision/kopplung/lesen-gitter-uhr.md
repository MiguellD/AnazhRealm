# LESEN (g) — das GITTER und die UHR

Zensus der Kopplung, Thema (g). Gelesen am Arbeitszweig claude/optimistic-johnson-gqo20t (= main b7ed841), 18.11.2026.

## 1. Kopf

- **Das Gitter** ist heute kein eigenes Modul. Es gibt sechs Raster-Familien mit eigener Zellgröße und eigenem Ursprung:
  das 16-m-Gitter der Felder (Leben, Gefühl, Brand, Taten, Wertung, Wind-Form: `Map` mit Schlüssel `floor(x/16),floor(z/16)`),
  die Hydrosphäre (16 m in 2048-m-Kacheln, Ursprung −1024), das Voxel-Gitter (1,8 m in 43,2-m-Chunks, darauf der Wasser-Automat),
  die Bestand-Regionen der Tiere (≈ 200,29 m mit 4 × 4 Zellen ≈ 50,07 m), die Clipmaps um den Spieler (0,25–4 m) und die
  Kacheln der Vegetation (6/12 m, 2,1–3,4 m).
- Wetter, Wind, Temperatur, Nässe und Pegel haben **kein Raster**. Sie sind Funktionen von (Ort, Zeit) oder Skalare der ganzen Welt.
- **Die Uhr**: EINE Welt-Uhr `state.spielZeit` (stamm/dirigent-takt.js:48). Sie läuft nur im rAF-Takt (`setAnimationLoop`,
  dirigent-takt.js:426), je Takt gedeckelt auf 0,1 s (dirigent-takt.js:25, 2699). Brand, Bestand, Wetter-Zug, Pegel, Nässe, Saison
  und der Prozess-Tag laufen auf ihr. Drei Uhren laufen daneben: der Wasser-Automat zählt Bilder, der Sicht-Tag `timeOfDay`
  hängt am Regler, und die Kreatur-Zeit `creatureAnimationTime` zählt Bild-Deltas. Hydro-Kacheln und Region-Takt hängen an der Wanduhr.
- Getickt wird aus `startEternalLoop` (dirigent-takt.js:3-427). Der Planer `_runFrameScheduler` (dirigent-takt.js:2321-2364) läuft in
  jedem Takt und ruft `_tickSeason`, `_tickRain`, `_tickBrand` und `_tickWorldWaterCA` (2346-2351). Der Bestand tickt über
  `tickFaunaLifecycle` (161), der Wetter-Zug über `_loopWeatherAndGrowth` (251, nur in Bild-Takten).

## 2. DIE GRÖSSEN

Spalten: Name | Einheit | Wert/Bereich | Anker | Schreiber | Leser | FOLGT/GESETZT. „GESETZT (abgeleitet)“ heißt: Die Größe ist
aus anderen gesetzten Zahlen gerechnet, nicht aus Same oder Physik.

### Raster (G)

| # | Name | Einheit | Wert | Anker | Schreiber | Leser | FOLGT/GESETZT |
|---|---|---|---|---|---|---|---|
| G1 | `LIFE_FIELD.cell` | m | 16 | stamm/feld-leben.js:3078 | Literal | `_lifeCellKey` feld-leben.js:2027 (lifeField 2036, Emotion 2724/2748, Brand-Glut 1863, Taten 2669/2686/2703, Lava 2470), Brand feld-brand.js:25/128/151/220/352/383/542/556/587/618, Furcht kreatur-furcht.js:203, Decke siedlung-wege.js:462/495/631/681, Sukzession vegetation-wiese.js:2099/2166/2176/2204/2271/2302, Klang klang.js:375, Kampf kampf.js:2443, dirigent-kern.js:1730/1803, Zell-Register gelaende-fern.js:2569/2575/2581, Bestand-Saum feld-leben.js:2177. Insgesamt 43 Fundstellen in 10 Dateien | GESETZT |
| G2 | `WERTUNG.cell` | m | 16 | stamm/feld-sprache.js:1420 | Literal (der Kommentar 1415 sagt „= LIFE_FIELD.cell“) | `_wohlCellKey` feld-leben.js:1947 | GESETZT (Zwilling von G1) |
| G3 | `HYDROSPHERE.cell` | m | 16 | stamm/daten.js:204 | Literal | gelaende-core.js:6183 (`hydroInit`) | GESETZT (Zwilling von G1) |
| G4 | Zelle der Wind-Form | m | 16 | stamm/stoff-material.js:277-278 | Literal | `_windForm` stoff-material.js:272; Register gelaende-fern.js:2465-2468 | GESETZT (Zwilling von G1) |
| G5 | `GRUND.kachel` = `HYDROSPHERE.regionSize` | m | 2048 | gelaende-core.js:5679; daten.js:203 | Kern-Literal | hydroInit gelaende-core.js:6176-6212; `_hydroKachelZelle` gelaende-fern.js:2588-2590 | GESETZT |
| G6 | Hydro-`dim` | Zellen | 128 | gelaende-core.js:6176-6212 | 2048/16 | Hydro-Felder (Float64Array) | GESETZT (abgeleitet) |
| G7 | Hydro-Ursprung | m | −1024 (= −64 · 16) | gelaende-core.js:6176-6212; gelaende-fern.js:2590 | −regionSize/2 | Kachel-Schlüssel | GESETZT (abgeleitet) |
| G8 | Voxel `step` (LOD0) | m | 1,8 (LOD1–3: 3,6 / 7,2 / 14,4) | stamm/gelaende-boden.js:2727-2740; voxel-worker.js:1988-1991 | Literal, zweimal | Wasser-CA wasser-zellen.js:2126, `_bodenSichtAt` gelaende-boden.js:27-29, Worker-Mesh | GESETZT |
| G9 | Voxel `dim` (LOD0) | ohne Einheit | 24 (12/6/3) | gelaende-boden.js:2740 | Literal | wie G8 | GESETZT |
| G10 | Voxel `span` | m | 43,2 | gelaende-boden.js:2740 | 24 · 1,8 | `_bodenSichtAt` gelaende-boden.js:22, Zell-Register gelaende-fern.js:2456/2462 | GESETZT (abgeleitet) |
| G11 | Voxel `dimY` / Band | Zellen / m | 232 / 417,6 (floorDrop 135) | gelaende-boden.js:2737-2740 | Literal | Wasser-CA wasser-zellen.js:2128 | GESETZT |
| G12 | `BODEN_KARTE_TEILUNG` | ohne Einheit | 4 (also 0,45 m an LOD0; 0,9/1,8/3,6 m an LOD1–3) | stamm/daten.js:463-464 | Literal | `_bodenSichtAt` gelaende-boden.js:28-29 | GESETZT |
| G13 | `BRAND.bettGitter` | ohne Einheit | 8 (also 2 m) | stamm/feld-brand.js:911 | Literal | `_brandStoff` feld-brand.js:128/214-273 | GESETZT |
| G14 | `BRAND.blockZellen` | ohne Einheit | 4 (also 64 m) | feld-brand.js:916 | Literal | `_brandGlutUm` feld-brand.js:542 | GESETZT |
| G15 | Bestand-Seite S | m | 200,2873 (Probe) | kreatur-leben.js:2222, 3732 | revierM · √π | `_bestandKey` 2224-2226, `_bestandNah` 2240-2254, `_lebenImStand` feld-leben.js:2177 | GESETZT (abgeleitet: S² = π · revierM², ein Kreis des Reviers als Quadrat) |
| G16 | `BESTAND_GESETZ.revierM` | m | 113 | tetrapoda-core.js:2199 | Kern-Literal | kreatur-leben.js:2222 | GESETZT |
| G17 | `BESTAND_REGION.zellen` | ohne Einheit | 4 (also 50,0718 m, Probe) | kreatur-leben.js:3733 | Literal | `_bestandFeld` kreatur-leben.js:2318-2340 | GESETZT |
| G18 | `BESTAND_GESETZ.rasterM` | m | 50 | tetrapoda-core.js:2200 | Kern-Literal | nur das Prüf-Tupel kreatur-leben.js:3818; die gerechnete Zelle ist S/4 = 50,07 m | GESETZT (Anker ohne Leser) |
| G19 | `WEGE_KARTE` texelM / fensterM | m | 0,5 / 512 (nah), 2 / 2048 (fern) | stamm/siedlung-wege.js:2922-2923 | Literal | `_wegeKarteEnsure` siedlung-wege.js:16-110, `_wegeBelagAt` 1183 | GESETZT |
| G20 | `LAUB_STREU.texelM` | m | 1 / 4 | siedlung-wege.js:2988 | Literal | Kronen-Streu, Boden-Decke (Asche, Lava): `_deckeMalen` 459 | GESETZT |
| G21 | `TRITT.zelleM` | m | 0,5 | siedlung-wege.js:2908 | Literal | Tritt-Karte; reist gepackt in `worldMeta.tritt` speicher-welten.js:1178 | GESETZT |
| G22 | `NAH_WIESE` kachel | m | 6 (nah) / 12 (fern) | stamm/daten.js:509 / 520 | Literal | Nah-Wiese | GESETZT |
| G23 | Streu-Zellen | m | 3,4 / 2,4 / 2,1 | stamm/vegetation-streu.js:85-87 | Literal | Streu | GESETZT |
| G24 | `FOREST_PACK.cell` | m | 12 | phyto-core.js:3158 | Kern-Literal | Wald-Poisson | GESETZT |
| G25 | `BLOCKER_ZELLE` | m | 8 | stamm/gelaende-kollision.js:1449 | Literal | Blocker-Netz | GESETZT |
| G26 | `BEWOHNER.rasterM` | m | 5 | stamm/siedlung-bewohner.js:3968 | Literal | siedlung-bewohner.js:2054/2886/2910/3168, siedlung-verkehr.js:230/456/1783 | GESETZT |
| G27 | `REGION_CHUNKS` | ohne Einheit | 8 (also 345,6 m) | stamm/netz-p2p.js:3415 | Literal | Region-Takt dirigent-takt.js:189-194 | GESETZT |
| G28 | `FERN_NEIGUNG.texelM` | m | 31,25 | stamm/gelaende-fern.js:2658 | 16 000 m / 512 (Kommentar 2654-2655) | `_fernNeigungTakt` | GESETZT (abgeleitet) |

### Uhren (U)

| # | Name | Einheit | Wert | Anker | Schreiber | Leser | FOLGT/GESETZT |
|---|---|---|---|---|---|---|---|
| U1 | `state.spielZeit` (Welt-Uhr) | s | monoton, ≥ 0 | dirigent-takt.js:48 | Takt `+= delta` dirigent-takt.js:48; `_weltUhrNimm` 1758-1763 (nur vorwärts); Laden speicher-laden.js:525-552; persistiert speicher-welten.js:1305 | 189 Fundstellen in stamm/; die Prozess-Leser: Brand feld-brand.js:486, Bestand kreatur-leben.js:2722, Zug dirigent-takt.js:1714, Pegel wasser-hydro.js:262, Nässe bild-himmel.js:3065, Saison 908, Tag 2634, Leben-Zerfall feld-leben.js:2365, Prozess-Tag 2606 | FOLGT (Σ min(Wanduhr-Δ, 0,1 s) über die rAF-Takte) |
| U2 | `TAKT_DECKEL_S` | s | 0,1 | dirigent-takt.js:2699 | Literal | dirigent-takt.js:25, 100, 102 | GESETZT |
| U3 | `FIXED_DT` | s | 1/60 | stamm/koerper-bewegung.js:2623 | Literal | dirigent-takt.js:1195; netz-p2p.js:2867 | GESETZT |
| U4 | `FIXED_MAX_STEPS` | ohne Einheit | 8 | dirigent-takt.js:2702 | Literal | dirigent-takt.js:1223, 1232 | GESETZT |
| U5 | `WELT_UHR_SPRUNG_S` | s | 60 | dirigent-takt.js:2701 | Literal | dirigent-takt.js:1760 | GESETZT |
| U6 | `BRAND.schrittS` | s | 1 | feld-brand.js:894 | Literal | `_tickBrand` feld-brand.js:487-495 | GESETZT |
| U7 | `BRAND.sprungS` | s | 10 | feld-brand.js:895 | Literal | feld-brand.js:489 | GESETZT |
| U8 | `BRAND.budgetMs` | ms | 0,25 je Bild | feld-brand.js:914 | Literal | feld-brand.js:475 | GESETZT |
| U9 | `BRAND.mindestJeBild` | ohne Einheit | 8 | feld-brand.js:915 | Literal | `_brandArbeit` feld-brand.js:553-583 | GESETZT |
| U10 | `BESTAND_GESETZ.taktS` | s | 10 | tetrapoda-core.js:2198 | Kern-Literal | kreatur-leben.js:2722, 2756, 2766, 2773; Halt der Leben-Stufe feld-leben.js:2364 | GESETZT |
| U11 | `BESTAND_REGION.aufholJeTakt` (`aufholS`) | ohne Einheit (s) | 20 (3600) | kreatur-leben.js:3734-3735 | Literal | kreatur-leben.js:2762 | GESETZT |
| U12 | `FELD_VORLAUF_S` | s | 2 | feld-leben.js:3073 | Literal | `_feldHorizont` feld-leben.js:2298 | GESETZT |
| U13 | `LIFE_FIELD.decayPerSec` | 1/s | 0,008 (Halbwertszeit ≈ 87 s) | feld-leben.js:3079 | Literal | feld-leben.js:2365 (lazy auf spielZeit) | GESETZT |
| U14 | `EMOTION_FIELD.decayPerSec` | 1/s | 0,012 | feld-leben.js:3134 | Literal | `_emotionOverlayAt` feld-leben.js:2746-2763 | GESETZT |
| U15 | `WERTUNG.fieldTau` | s | 120 | feld-sprache.js:1421 | Literal | `_observeFieldWohl` feld-leben.js:1954 | GESETZT |
| U16 | `WETTER_ZUG_SEK` | s | 120 | daten.js:170-171 | Literal | dirigent-takt.js:1714, 1730; wasser-hydro.js:254 (10 Fundstellen) | GESETZT |
| U17 | `WEATHER_TRANSITION_DURATION_MS` | ms | 45 000 | daten.js:143 | Literal | `tickWeatherTransition` bild-himmel.js:3253 (über `wt.duration`) | GESETZT |
| U18 | `DAY_LENGTH_DEFAULT_MINUTES` | min | 60 | daten.js:159-160 | `TAG_SZENE_MINUTEN` (15, daten.js:156-157) · 4 | dirigent-kern.js:312; bild-himmel.js:2639; daten.js:166 | GESETZT (abgeleitet) |
| U19 | `PEGEL_TAG_S` (Prozess-Tag) | s | 3600 | daten.js:165-166 | U18 · 60 | `_weltTag` feld-leben.js:2606, 2615; Nässe-Dosis bild-himmel.js:3076; Pegel wasser-hydro.js:239 (8 Fundstellen) | GESETZT (abgeleitet) |
| U20 | `dayLengthMinutes` (Sicht-Tag) | min | Regler, Vorgabe 60 | dirigent-kern.js:312 | Regler; persistiert speicher-welten.js:1314 | `tickDayNight` bild-himmel.js:2639-2640 (mindestens 60 s) | GESETZT (Spieler) |
| U21 | `timeOfDay` (Sicht-Uhr) | Tag-Bruch [0, 1) | läuft dz/(dayLength · 60) | bild-himmel.js:2648 | `_uhrSetzen` bild-himmel.js:2712-2750 (Takt und Regler); persistiert speicher-welten.js:1306 | Temperatur bild-himmel.js:2879, also Brand-Zündung feld-brand.js:315; `_weltTagEichen` feld-leben.js:2615; 26 Fundstellen in stamm/ | FOLGT aus U1/U20, vom Regler verstellbar |
| U22 | `seasonYearSeconds` (Jahr) | s | 2400 | dirigent-kern.js:311 | Literal; Fallback-Literale bild-himmel.js:933, 970, speicher-laden.js:543 | `_saisonAnkerGilt` bild-himmel.js:931-943, `_saisonPhaseZu` 955-959 | GESETZT |
| U23 | `TEMPERATUR.jahrTage` | d | 365 | gelaende-core.js:1319 | Kern-Literal | Trägheit der Jahres-Welle gelaende-core.js:1335 | GESETZT |
| U24 | Pegel-Sekunde | s | 1 (`Math.floor`) | wasser-hydro.js:262-265 | implizit | `_pegelTakt` wasser-hydro.js:323 | GESETZT |
| U25 | Rate des Wasser-Automaten | ohne Einheit, je Takt | 0,25 | wasser-zellen.js:1641 (Vorgabe), 2191 (Ruf) | Literal | `_tickWaterCA` wasser-zellen.js:1641-1786 | GESETZT, ohne dt |
| U26 | `SETTLE` des Wasser-Automaten | ohne Einheit | 0,25 | wasser-zellen.js:2133 | Literal | `_tickWorldWaterCA` | GESETZT |
| U27 | `CA_REMESH_TICK_INTERVAL` | ohne Einheit (Takte) | 4 | wasser-zellen.js:2494 | Literal | `_tickWorldWaterCA` über `_caTickCount` 2124 | GESETZT |
| U28 | `creatureAnimationTime` | s | monoton | kreatur-verhalten.js:3139 | `+= delta` (deltaBild, nur in Bild-Takten, dirigent-takt.js:251 → 1702) | Furcht-Fristen kreatur-leben.js:808, kreatur-furcht.js:107-155 (26 Fundstellen) | FOLGT (Σ deltaBild), zweite Uhr |
| U29 | Schwelle des Region-Takts | gemeint 1 s, gerechnet 1000 s | 1000 | dirigent-takt.js:189 | Literal | `_regionTickDetectCrossing` dirigent-takt.js:191 | GESETZT (Einheiten-Bruch, siehe B15) |
| U30 | `TRITT.erholTage` | Prozess-Tage | 20 (= 72 000 s Welt-Uhr) | siedlung-wege.js:2912 | Literal | Tritt über `_weltTag` | GESETZT |
| U31 | `TAT_NARBE.brand.stunden` | Prozess-Stunden | 72 (= 10 800 s Welt-Uhr) | feld-leben.js:3102 | Literal | `_narbeAt` feld-leben.js:2689-2691 | GESETZT |
| U32 | `NAESSE.benetzenS` | s | 150 | stoff-material.js:3790 | Literal | `_naesseKurve` stoff-material.js:2232 | GESETZT |
| U33 | `NAESSE.verdunstS` | s | 480 | stoff-material.js:3791 | Literal | stoff-material.js:2239 | GESETZT |

**Zählung: 61 Größen. Davon 3 FOLGT (U1, U21, U28) und 58 GESETZT; 7 der gesetzten sind aus anderen gesetzten Zahlen abgeleitet
(G6, G7, G10, G15, G28, U18, U19). 12 Größen sind ohne Einheit (G9, G12, G13, G14, G17, G27, U4, U9, U11, U25, U26, U27).**
Keine Zellgröße und kein Takt folgt aus Physik (etwa aus Front-Tempo × Schritt oder einer CFL-Bedingung). Alle sind Literale.

## 3. DIE RASTER (Pflicht-Tabelle)

| Feld | Raster | Zellgröße m | Ausdehnung | Speicher | Lebensdauer | datei:zeile |
|---|---|---|---|---|---|---|
| Leben-Overlay `lifeField` | 16-m-Gitter, Ursprung 0 | 16 | dünn besetzt, unbeschränkt (Zellen über ε) | `Map` „cx,cz“ → {a, t}; Zerfall lazy | `_feldTod` räumt Tote (feld-leben.js:1987-2018). Persistiert werden nur die nahen Bestand-Regionen samt 16-m-Saum (feld-leben.js:2165-2182, speicher-welten.js:1336-1340) | feld-leben.js:2026-2083, 3077-3091 |
| Gefühl `emotionField` | 16-m-Gitter | 16 | dünn besetzt | `Map` | `_feldTod`; nicht im Stand (Grep in stamm/speicher-*.js leer) | feld-leben.js:2718-2763, 3133-3139 |
| Wertung `wohlBaseline` | 16-m-Gitter (eigenes Literal) | 16 | dünn besetzt | `Map` | `pruneAgeSec` 180 s; nicht im Stand | feld-leben.js:1946-1971; feld-sprache.js:1419-1421 |
| Brand `brandFeld` | 16-m-Gitter; Glut-Index in 4 × 4-Blöcken | 16 (Block 64; Bett-Maske 2) | nur brennende Zellen und erwartete Ankünfte | `Map` „cx,cz“ → Zelle {t0, an, ende, glut, stoff, R, kopf, ex, ez, von}; `glutBlock` | nicht persistiert (feld-brand.js:204); Grundstellung leert (speicher-laden.js:2691-2701); die Asche reist als Tat (feld-brand.js:575) | feld-brand.js:195-204, 349-363, 523, 911, 916 |
| Taten, Narbe, Lava | 16-m-Index über einer Liste | 16 | unbeschränkt (Liste) | `worldMeta.taten` (Array) + Index-`Map` | persistiert mit worldMeta (speicher-welten.js:1145) | feld-leben.js:2626-2693, 2460-2488 |
| Wind-Form-Merker | 16-m-Gitter × 64 Richtungen | 16 | bis 4096 Einträge (stoff-material.js:275), Horizont der Streu (gelaende-fern.js:2587) | `Map` Zahl-Schlüssel | Merker, aus Same neu rechenbar | stoff-material.js:272-281 |
| Hydrosphäre | 2048-m-Kacheln, Ursprung −1024 | 16 (128² je Kachel) | Kacheln in Reichweite (Ring + 300 m, dirigent-takt.js:2208-2210) | Float64Array je Größe (gelaende-core.js:6176-6212); `state.hydroTiles` | geht jenseits `_hydroReichweite` (gelaende-fern.js:2436-2441); bootgleich aus Same | daten.js:199-205; gelaende-core.js:6036-6212; voxel-worker.js:1717 |
| Voxel-Zellen | Chunks 43,2 m, Ursprung 0 | 1,8 (LOD0) bis 14,4 (LOD3); Höhe 1,8 × 232 | Ring `chunkRingRadius` (Vorgabe 4, max 12) | Zellen-Arrays je Chunk (`state.voxelChunks`) | Ring; Edits persistiert (`voxelEdits`, speicher-welten.js:1197) | gelaende-boden.js:2712-2741 |
| Wasser-Automat | Voxel-LOD0-Zellen | 1,8 | aktive Chunks (`waterCAActive`) | `waterLevelCells` „cx,cz“ → Float32Array (24 · 24 · 232) | nicht persistiert (wasser-zellen.js:1788-1789); geht mit dem Boden-Ring (gelaende-fern.js:2459-2464); neu aus der statischen Flut (1791-1795) | wasser-zellen.js:1641-1796, 2119-2269 |
| Boden-Karte (`surfMap`) | je geladenem Chunk | step/4 = 0,45 (LOD0) bis 3,6 | geladene Chunks | je Chunk | mit dem Chunk | gelaende-boden.js:19-59 |
| Bestand der Tiere | Regionen S ≈ 200,29 m, Ursprung 0 | 50,07 (4 × 4 je Region) | nahe Regionen, eine bis vier (kreatur-leben.js:2240-2254) | Objekt `faunaBestand.regionen[key]` | nahe Regionen persistiert (`leben`, speicher-welten.js:1336-1340) | kreatur-leben.js:2216-2340, 3731-3737 |
| Wege-Karte | Clipmap um den Spieler | 0,5 / 2 | 512 / 2048 m | Textur | folgt dem Spieler, Umzug 48 / 256 m | siedlung-wege.js:16-110, 2920-2924 |
| Kronen-Streu / Boden-Decke (Laub, Asche, Lava, Glut) | Clipmap | 1 / 4 | nicht gelesen | Textur RGBA | malt die 16-m-Zellen der Taten neu ein (`_deckeMalen` siedlung-wege.js:459-469) | siedlung-wege.js:2987-2995 |
| Tritt | Gitter, Ursprung 0 (nicht geprüft) | 0,5 | besuchte Zellen | `Map` „i,j“ → [n, t] | persistiert gepackt in `worldMeta.tritt` (speicher-welten.js:1141-1178) | siedlung-wege.js:2907-2919 |
| Nah-Wiese / Streu / Wald | Kacheln / Zellen | 6 und 12 / 3,4, 2,4, 2,1 / 12 | Ring | Instanzen | Ring | daten.js:505-530; vegetation-streu.js:85-87; phyto-core.js:3155-3158 |
| Bewohner, Blocker, P2P-Region | Gitter | 5 / 8 / 345,6 | — | `Map` | — | siedlung-bewohner.js:3968; gelaende-kollision.js:1449; netz-p2p.js:3415 |
| Fern-Neigung | Textur um den Anker | 31,25 | ±8 km | rg8 | Neubau nach 1000 m | gelaende-fern.js:2654-2658 |
| Wetter | **kein Raster.** Funktion `wetterAt(saat, x, z, t)` mit Fronten von 2,5–6,6 km Wellenlänge und Zug 11 m/s, **an EINEM Punkt gelesen** | — | Welt | Skalar `state.weather` | persistiert (speicher-welten.js:1129, 1322-1333) | phyto-core.js:4317-4327, 4423-4454; dirigent-takt.js:1733-1735 |
| Wind | **kein Raster.** Funktion `_windAt(x, z, t)`, gemerkt auf G4 | — | — | — | — | stoff-material.js:233-281 |
| Temperatur | **kein Raster.** Funktion von y, Saison, Sicht-Uhr und Wetter | — | — | — | — | gelaende-core.js:1313-1355; bild-himmel.js:2874-2882 |
| Nässe | **kein Raster.** EIN Skalar der Welt | — | Welt | `state.naesse` | nicht im Stand (siehe B6) | bild-himmel.js:3060-3087 |
| Boden-Feuchte | **kein Raster.** Funktion: Abstand zum Fluss + Höhe über dem Wasser | — | — | — | aus Same | gelaende-boden.js:1538-1563 |
| Pegel | EIN Zustand der Welt; die Marke wird je Chunk gelesen | (43,2 je Marke) | Welt | `pegelZustand` (≈ 50 Zahlen) | persistiert (speicher-welten.js:1345) | wasser-hydro.js:226-243, 323-347 |

## 4. DIE UHREN (Pflicht-Tabelle)

| Feld | Ticker datei:zeile | dt | Budget | Kappung / bei stehendem Takt |
|---|---|---|---|---|
| Welt-Uhr | `startEternalLoop` dirigent-takt.js:48 (rAF, 426) | min(Wanduhr-Δ, 0,1 s) (24-25) | — | Deckel 0,1 s. Ein offenes Portal friert die Uhr ein (40-47); ebenso der Welt-Tausch (29). **Verdeckter Tab: kein rAF, die Uhr steht.** Bei der Rückkehr kommt höchstens 0,1 s dazu. Mitspieler mit späterer Uhr ziehen vor (`_weltUhrNimm` 1758-1763) |
| Physik | `_loopFixedStep` dirigent-takt.js:205 → 1191-1233 | 1/60 s fest, Akkumulator | — | 8 Schritte; der Rest wird verworfen (1232) |
| Brand (Front) | `_runFrameScheduler` dirigent-takt.js:2348 → `_tickBrand` feld-brand.js:470-499 | 1 s auf der Welt-Uhr. Liegt sie mehr als 10 s vor, geht der Brand von Ereignis zu Ereignis (489-494) | 0,25 ms je Bild, mindestens 8 Stück (475, 914-915) | Der Rest geht ins nächste Bild (`_brandRest`). Jede Zelle fängt zur Zeit ihrer Ankunft (feld-brand.js:201, 457). Läuft in jedem Takt; steht mit der Welt-Uhr |
| Brand (Bild) | dirigent-takt.js:276 `_brandBild(delta)` | delta | — | bis 160 m um das Auge |
| Bestand / Feld-Takt (Tiere, Fraß ins Leben) | `tickFaunaLifecycle` dirigent-takt.js:161 → kreatur-leben.js:2715-2738, `_feldTakt` 2751-2777 | 10 s, auf dem Raster der Welt-Uhr (2722, 2766) | 20 Aufhol-Schritte je verstrichenem Takt (2762), „~0,25 ms je Takt“ (Zitat 3728) | Nur nahe Regionen (2758). Mit Mitspielern bis zum Horizont minus 2 s (feld-leben.js:2292-2299). Läuft nur, wenn `_kreaturenBereit` (2719) und kein Lade-Takt (dirigent-takt.js:115) |
| Leben-Zerfall | kein Ticker: lazy `a · e^(−0,008 · Δt)` auf der Welt-Uhr | exakt | — | — (feld-leben.js:2365) |
| Leben-Stufen malen / Sukzession | Deko-Job `scatterDeco` dirigent-takt.js:2200-2201 | Welt-Uhr / Prozess-Stunde | Frist des Deko-Jobs (prio 2) | **Fällt aus, solange der Boden baut** (`_dekoWartet`, 2179) |
| Hydro-Kacheln | Deko-Job dirigent-takt.js:2204-2210 | **Wanduhr** (`performance.now`) alle 1000 ms | — | ebenfalls hinter `_dekoWartet` |
| Wetter-Zug | `_loopWeatherAndGrowth` dirigent-takt.js:251 (nur Bild-Takte) → 1714-1717 | 120 s auf dem Raster der Welt-Uhr | — | ruht bei Spieler-Wort, ohne Bühne (1715) und bei Mess-Halt (1717) |
| Wetter-Übergang | dirigent-takt.js:157 → bild-himmel.js:3250-3259 | (spielZeit − Start) / 45 s | — | auf [0, 1] geklemmt |
| Nässe | `_tickRain` dirigent-takt.js:2347 → `_naesseTakt` bild-himmel.js:3060-3087 | exakt: spielZeit − `_naesseUhr` (3065) | — | schläft am Fixpunkt (1074-1078) |
| Pegel | `_pegelUhr` dirigent-takt.js:1713 → wasser-hydro.js:261-266; dazu aus Nässe (bild-himmel.js:3085) und Saison (922) | 1 s auf der Welt-Uhr | „Faltung einmal 5,4 ms“ (Zitat wasser-hydro.js:203) | baut nur bei einer neuen Marke (wasser-hydro.js:327) |
| Saison | `_tickSeason` dirigent-takt.js:2346 → bild-himmel.js:898-924 | Phase = Anker + Δt / 2400 s (955-959) | — | Die Drift wartet auf die Bühne (906) |
| Sicht-Tag | `tickDayNight` dirigent-takt.js:153 (nur Bild-Takte) → bild-himmel.js:2631-2650 | dz / (dayLength · 60) | — | Der Regler setzt die Uhr (`_uhrSetzen` 2712-2750) |
| Prozess-Tag | kein Ticker: `_weltTag` feld-leben.js:2604-2607 | spielZeit / 3600 + `tagNull` | — | — |
| Wasser-Automat | `_runFrameScheduler` dirigent-takt.js:2351 → `_tickWorldWaterCA` wasser-zellen.js:2119-2269 | **ein Schritt je Takt, Rate 0,25, ohne dt** (2191); der Zähler zählt Bilder (2124) | kein Zeit-Budget gelesen | `SETTLE` 0,25 nimmt den Chunk aus der aktiven Menge (2133); Neu-Mesh jeden 4. Takt (2494) |
| Kreatur-Zeit | `updateCreatures` kreatur-verhalten.js:3139 | deltaBild (dirigent-takt.js:99-104) | — | nur Bild-Takte; Schuld höchstens 0,1 s (100-102) |
| P2P-Region | dirigent-takt.js:189-194 | Wanduhr | — | Schwelle 1000 s statt 1 s (B15); Vorgabe aus (187) |

## 5. SCHREIBER / LESER je Feld (nur Feld-Ebene)

| Feld | Schreiber | Leser |
|---|---|---|
| Leben | `_depositLife` feld-leben.js:2047-2083 (über `_feldAkt` 2096-2118; Fraß des Bestands) | `auraAt` feld-leben.js:1849-1881, also auch `_brandStoff` feld-brand.js:222; `_lebenStufe` feld-leben.js:2350 → Nah-Streu |
| Gefühl | `_depositEmotion` feld-leben.js:2718 | `_emotionOverlayAt` feld-leben.js:2746-2763 → `auraAt`; Furcht kreatur-furcht.js:197-230 |
| Brand | `_brandFangen` feld-brand.js:349-363, `_brandZuenden` 374-451, `_brandSchritt` 505-534 | `auraAt` feld-leben.js:1863; `_brandGlutUm` feld-brand.js:538-548 → Furcht kreatur-furcht.js:87-103, Bild feld-brand.js:651, Ohr bis 256 m (917) |
| Taten | `_tatSchreiben` feld-leben.js:2626-2642 (Asche feld-brand.js:575) | `_tatIndex` feld-leben.js:2648 → `_narbeAt` 2684, Lava 2470, Sukzession vegetation-wiese.js:2204, Asche-Decke siedlung-wege.js:411 |
| Hydrosphäre | voxel-worker.js:1717 (bootgleich) | `_hydroDistAt` gelaende-boden.js:1522 → `_feuchteAt` 1538 → Brand-Bett feld-brand.js:268, Material vegetation-wiese.js:2368 |
| Wasser-Automat | `_seedWaterLevel` wasser-zellen.js:1791, `_tickWorldWaterCA` 2119 | Wasser-Mesh, Stau; weitere Leser nicht vollständig gelesen |
| Nässe | `_naesseTakt` bild-himmel.js:3080 | Brand `_brandFeuchte` feld-brand.js:284; Shader bild-himmel.js:3082 |
| Wetter | `_setWeather` über `_wetterZugZiehen` dirigent-takt.js:1740 | `_weatherFieldFor` bild-himmel.js:2820-2838 → Temperatur 2880, Nässe 3068, Regen 1081 |
| Bestand | `_bestandSchritt` kreatur-leben.js:2389-2400 | `_bestandVerkoerpern` 2737; Stand feld-leben.js:2176 |

## 6. BOOTGLEICH oder VERÄNDERLICH

- **Bootgleich aus Same** (bei jedem Laden neu gerechnet): die Hydrosphäre (gelaende-core.js:6036-6212), die Voxel-Dichte
  (gelaende-boden.js:2712), `worldFieldAt` (feld-leben.js:1793-1843), Wetter und Wind (phyto-core.js:4354, 4423), das
  Temperatur-Feld (gelaende-core.js:1321), die Boden-Feuchte (gelaende-boden.js:1538-1563), die Wind-Form (stoff-material.js:272)
  und das Erkalten der Lava als Funktion der Welt-Stunde (feld-leben.js:2460-2488).
- **Veränderlich und im Stand**: Welt-Uhr (speicher-welten.js:1305), Sicht-Uhr (1306), Saison samt Anker (1311-1313), Tag-Länge
  (1314), Wetter und Zug (1129, 1322-1333), Leben der nahen Regionen samt Saum (1336-1340), Pegel (1345), `worldMeta` (1145) mit
  `taten`, `tritt`, `nassTage`, `tagNull` und `voxelEdits` (1197).
- **Veränderlich, aber NICHT im Stand**: `brandFeld` (feld-brand.js:204), `naesse` (kein Eintrag in der Stand-Tafel), `waterLevelCells`
  (wasser-zellen.js:1788-1789), `emotionField` und `wohlBaseline` (kein Eintrag in stamm/speicher-*.js), das Leben jenseits der nahen
  Regionen (feld-leben.js:2165-2182). Ob `creatureAnimationTime` im Stand reist: nicht gelesen.

## 7. DECKUNGSGLEICH? — gibt es heute EIN Raster?

Probe (headless, < 1 s): `node /tmp/claude-0/-home-user-AnazhRealm/d169edf0-889e-5d2b-b305-7451b621a8b7/scratchpad/gitter-uhr/deckung.cjs`
lädt gelaende-core und tetrapoda-core per vm. Ergebnis: GRUND.kachel 2048 → 128 Zellen, Ursprung −1024 = −64 × 16 m;
Bestand-Seite 200,2873 m, Zelle 50,0718 m, 12,518 Zellen des 16-m-Gitters je Seite; kgV(16 m, 43,2 m) = 432 m;
kgV(16 m, 1,8 m) = 144 m; kgV(16 m, 6 m) = kgV(16 m, 12 m) = 48 m; 2048 / 43,2 = 47,41 Chunks je Hydro-Kachel.

- **Ja, für sechs Felder.** Das 16-m-Gitter mit Ursprung 0 trägt heute Leben, Gefühl, Brand, Taten/Narbe/Lava, Wertung und den
  Wind-Merker. Die Hydrosphäre ist deckungsgleich dazu: 16 m, Ursprung −64 · 16. Diese Felder lesen einander ohne Umrechnung, nur mit
  `_lifeCellKey`. Die Größe kommt aber aus vier Literalen (B1).
- **Nein, für Wasser, Boden-Stoff und Tiere.** Der Wasser-Automat (1,8 m in 43,2 m) trifft eine 16-m-Kante nur alle 144 m und eine
  Chunk-Kante alle 432 m. Die Hydro-Kachel schneidet Chunks (47,41 je Kachel). Der Bestand (√π-Seite) ist inkommensurabel. Das Bett des
  Brands wird über eine 2-m-Maske aus fünf Quellen gerechnet: Clipmaps 0,5/1/2 m, Boden-Karte 0,45–3,6 m je LOD des Chunks und die
  Funktion `worldFieldAt` (gelaende-kollision.js:1121-1134).
- **Wetter, Nässe und Temperatur haben kein Raster.** Sie werden als Welt-Skalar oder als Funktion gelesen. Ein Feld je Zelle für sie
  gibt es nicht.

## 8. DIE FLÜSSE (Gitter/Uhr → andere Felder)

- **16-m-Gitter →** Feuer (feld-brand.js:352, 383), Pflanzen (feld-leben.js:2350; vegetation-wiese.js:2166, 2204), Tiere
  (kreatur-furcht.js:203, 87-103), Bild und Klang (siedlung-wege.js:462; klang.js:375), Kampf (kampf.js:2443).
- **Welt-Uhr →** Feuer (feld-brand.js:486), Wetter (dirigent-takt.js:1714), Nässe (bild-himmel.js:3065), Pegel (wasser-hydro.js:262),
  Saison (bild-himmel.js:908), Tiere (kreatur-leben.js:2722), Leben-Zerfall (feld-leben.js:2365), Prozess-Tag (feld-leben.js:2606).
- **Sicht-Uhr →** Temperatur (bild-himmel.js:2879), also die Zünd-Wärme des Feuers (feld-brand.js:315), dazu Esse, Lava und Grillen
  (Leser-Liste im Kommentar bild-himmel.js:2869-2870).
- **Bild-Zähler →** Wasser-Automat (wasser-zellen.js:2124, 2191).
- **Wanduhr →** Hydro-Kacheln (dirigent-takt.js:2204-2206), P2P-Region (189).
- **FEHLT**: Der Wasser-Automat schreibt nichts auf das 16-m-Gitter. Die Boden-Feuchte, die Feuer liest, ist allein Abstand zum Fluss
  plus Höhe (gelaende-boden.js:1538-1563). Sie ist aus Same, Regen ändert sie nicht.
- **FEHLT**: Regen schreibt nur den Welt-Skalar `naesse` (bild-himmel.js:3080), keine Nässe je Zelle. Feuer liest an jeder Zelle
  denselben Wert (feld-brand.js:284).
- **FEHLT**: Das Wetter ist eine Feld-Funktion von (x, z, t) (phyto-core.js:4423), wird aber nur am Spieler zur Zeit des Zugs gelesen
  (dirigent-takt.js:1733-1735), das Klima des Pegels am Ursprung (wasser-hydro.js:254). Die Welt hat EIN Wetter.
- **FEHLT**: Feuer schreibt keine Wärme und keinen Wind in ein Feld. Die Temperatur ist eine Funktion, die das Feuer nur liest
  (feld-brand.js:315).
- **FEHLT**: Der Wasser-Automat steht nicht auf der Welt-Uhr. Er holt nach einem Sprung nichts nach und läuft nicht im Lockstep.
- Welche Größe der Bestand an seinen 50-m-Zell-Mitten liest (`_bodenKlasseAt`, `_kreaturNahrung`, kreatur-leben.js:2334, 2337), ob also
  das 16-m-Leben einfließt: nicht gelesen.

## 9. DIE BRÜCHE

- **B1 Vier Quellen der 16-m-Zelle**: feld-leben.js:3078, feld-sprache.js:1420, daten.js:204 und stoff-material.js:277-278. Der
  Kommentar feld-sprache.js:1415 behauptet „= LIFE_FIELD.cell“, rechnet aber mit eigenem Literal.
- **B2 Falscher Anker-Kommentar**: feld-leben.js:3078 nennt 16 m „das Hydrosphäre/Voxel-Raster“. Das Voxel-Raster ist 1,8/43,2 m
  (gelaende-boden.js:2740); 16 m trifft es nur alle 144/432 m (Probe).
- **B3 Zwilling der Chunk-Konfiguration**: Main gelaende-boden.js:2725-2740 und Worker voxel-worker.js:1988-1991. Beide sind Literale,
  der Kommentar 1986 fordert „bit-identisch“.
- **B4 Der Wasser-Automat hängt an der Bildrate**: ein Schritt je Takt, Rate 0,25, ohne dt (wasser-zellen.js:2191, 1641), Zähler
  frame-basiert (2124), Neu-Mesh je 4. Takt (2494). Bei 30 Hz fließt das Wasser in Welt-Zeit halb so schnell wie bei 60 Hz. Er steht
  nicht auf der Welt-Uhr.
- **B5 Der Wasser-Automat ist flüchtig**: nicht persistiert (wasser-zellen.js:1788-1789), mit dem Boden-Ring verworfen
  (gelaende-fern.js:2459-2464), bei Rückkehr neu aus der statischen Flut (wasser-zellen.js:1791-1795).
- **B6 Die Nässe ist nicht im Stand und keine Funktion der Uhr**: Die Stand-Tafel trägt Wetter, Zug und Pegel
  (speicher-welten.js:1129, 1322-1345), aber kein `naesse`. Die Nässe ist ein Integral `_naesseKurve(n0, wf, dt)` über den Pfad
  (bild-himmel.js:3077-3080), keine Funktion. Das widerspricht dirigent-takt.js:1754 („Wetter, Leben, Brand und Nässe folgen ihr als
  Funktion“). Nur `nassTage` reist (bild-himmel.js:3076). Den Reload-Pfad habe ich nicht laufen lassen.
- **B7 Die Temperatur liest die Sicht-Uhr**: bild-himmel.js:2879 (`st.timeOfDay`, vom Regler über `_uhrSetzen` 2712-2750) speist die
  Zünd-Wärme des Brands (feld-brand.js:315). Das widerspricht feld-leben.js:2603: „Die Uhr des Spielers … bewegt jetzt keinen Prozess
  mehr“.
- **B8 Drei Zeitmaße widersprechen sich**: Das Jahr dauert 2400 s (dirigent-kern.js:311), der Prozess-Tag 3600 s (daten.js:165-166). Ein
  Jahr ist also 2/3 eines Prozess-Tags. Der Kern rechnet die Jahres-Trägheit mit 365 Tagen (gelaende-core.js:1319, 1335). Die
  Brand-Narbe hält 72 Prozess-Stunden = 10 800 s = 4,5 Saison-Jahre (feld-leben.js:3102). Der Sicht-Tag ist ein Regler (U20), der
  Prozess-Tag fest.
- **B9 Das Jahr steht viermal als Literal 2400**: dirigent-kern.js:311, dazu die Fallbacks bild-himmel.js:933, 970 und
  speicher-laden.js:543.
- **B10 Das Wetter ist ein Welt-Skalar aus einer Feld-Funktion**: am Spieler gelesen (dirigent-takt.js:1733-1735), das Pegel-Klima am
  Ursprung (wasser-hydro.js:254), die Nässe global (bild-himmel.js:3080). Brand am anderen Ende der Welt liest dieselbe Nässe
  (feld-brand.js:284).
- **B11 Das Brand-Feld ist flüchtig**: nicht persistiert (feld-brand.js:204), von der Grundstellung geleert (speicher-laden.js:2691-2701).
- **B12 Das Brand-Bett hängt an dem, was geladen ist**: Die 2-m-Maske (feld-brand.js:911) liest `_kontaktStoffAt` (feld-brand.js:244).
  Das sind die Clipmaps um den Spieler und `_bodenSichtAt`, das nur `surfMap` geladener Chunks liest, in der Auflösung ihrer LOD
  (gelaende-boden.js:22-29, 51). Sonst fällt es auf `_terrainMaterialAt` zurück (gelaende-kollision.js:1132-1133). Dieselbe 16-m-Zelle
  misst also je nach Lage des Spielers ein anderes Bett.
- **B13 Das Bestand-Raster ist nicht deckungsgleich**: S = 200,29 m, Zelle 50,07 m (Probe). `rasterM` 50 (tetrapoda-core.js:2200) liest
  nur das Prüf-Tupel (kreatur-leben.js:3818), es ist ein toter Anker. Der Stand schneidet einen 16-m-Saum an √π-Kanten
  (feld-leben.js:2182).
- **B14 Die Takte hängen an der Bau-Frist**: Die Leben-Stufen und die Sukzession laufen im Deko-Job (dirigent-takt.js:2200-2201), der
  ausfällt, solange der Boden baut (2179). Die Hydro-Kachel-Prüfung läuft dort auf der Wanduhr (2204-2206).
- **B15 Einheiten-Bruch im Region-Takt**: `wandZeit` ist in Sekunden (dirigent-takt.js:27), wird aber mit 1000 verglichen (189). Der
  Kommentar sagt „1×/s“ (186), gerechnet wird also alle 1000 s. Die Vorgabe ist aus (187).
- **B16 Zweite Welt-Uhr der Tiere**: `creatureAnimationTime` (kreatur-verhalten.js:3139) läuft mit deltaBild nur in Bild-Takten.
  Furcht-Fristen hängen daran (kreatur-leben.js:808), neben `spielZeit`.
- **B17 Hintergrund**: Die Welt-Uhr steht ohne rAF (dirigent-takt.js:48, 426). Ein verdeckter Tab hält alle Prozesse an. Das ist kein
  fail-soft, aber die Welt altert nur, solange sie gezeichnet wird.

## 10. SPROSSEN (meisterkarte-2)

**Nicht gelesen**: `origin/koordination` fehlt lokal (`git rev-parse --verify -q origin/koordination` → Exit 1, zweimal geprüft,
nie gefetcht). Im Code zitierte Sprossen-Ids für dieses Thema, Wortlaut nicht gelesen:
- feld.K2#2 (Welt-Uhr, Lockstep, Zug, Saison): dirigent-takt.js:1709, 1752; bild-himmel.js:901; kreatur-leben.js:2740
- feld.K3 (die Ruhe ist der Fixpunkt): bild-himmel.js:910, 1069
- feld.K3#2 (Brand nur in brennenden Zellen): dirigent-takt.js:2348
- feld.K5 (Leben-Stufe): feld-leben.js:2347
- wetter.K1 bis K4 (Zug, Nässe, Pegel, Temperatur unter Wetter): dirigent-takt.js:1709; bild-himmel.js:1080, 3085; gelaende-core.js:1339
- stoffe.K2#2 (Brand-Budget je Bild): feld-brand.js:455
- oekologie.K2 (Bestand): dirigent-takt.js:159
- w28-welt-uhr: dirigent-takt.js:21
- w28-lava-nachlauf (Prozess-Tag): feld-leben.js:2596

## 11. NICHT VERIFIZIERT

- **Preis je Takt je Feld: nicht gemessen.** Die Probe dafür, `node scripts/diag-stand-takt.cjs --brand`, braucht einen Browser
  (Null-Renderer), und der Auftrag verbietet Fenster und GPU. Sie ist **nicht gelaufen**. Im Code stehen nur Zitate:
  - Brand: 2 000 Zellen kosteten 7,4 ms, bevor der Schritt aufgeteilt wurde (feld-brand.js:458).
  - Wasser: Neu-Mesh „~4 ms“ je Bild (wasser-zellen.js:2491-2493).
  - Bestand: „~0,25 ms je Takt“ (kreatur-leben.js:3728).
  - Pegel: Faltung einmal 5,4 ms (wasser-hydro.js:203).
  - Planer: 10,0 ms Median, 16,4 ms p95 (dirigent-takt.js:1881).
  - Fern-Neigung: 0,6 s im Feld-Faden (gelaende-fern.js:2656-2657).
- Nicht gelesen: der Schnapp-Punkt der Clipmaps (ob ihr Texel-Gitter am Welt-Ursprung ausgerichtet ist), die Ausdehnung der
  Kronen-Streu-Fenster, ob `creatureAnimationTime` im Stand reist, und alle Leser von `waterLevelCells` außer Mesh und Stau.
- Nicht gelaufen: der Reload-Pfad der Nässe (B6), die Bildraten-Abhängigkeit des Wasser-Automaten (B4) als Messung. Beide stehen
  allein aus dem Code.
