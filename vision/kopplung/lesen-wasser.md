# Lesen (c) WASSER — Zensus der untersten Ebene (main-Kopf b7ed841)

Wasser ist heute VIER Dinge auf vier Rastern und drei Uhren: (1) die Hydrosphäre, ein statisches Drainage-Netz aus dem Samen (gelaende-core
`hydrosphaere` gelaende-core.js:6036, im Faden voxel-worker.js:1717, 128² Zellen à 16 m je 2 048-m-Region, einmal je Region); (2) der Pegel,
eine geschlossene Funktion der Welt-Uhr aus den Regen-Stempeln und der Schnee-Schmelze, die den Ruhe-Spiegel um −0,60 … +0,20 m hebt
(gelaende-core.js:1558-1806, Takt je voller Sekunde `_pegelUhr` wasser-hydro.js:261, gerufen dirigent-takt.js:1713); (3) die Voxel-Zellen
und ihr Automat (1,8 m, je Bild, dirigent-takt.js:2351 → wasser-zellen.js:2119); (4) die Nässe, EIN Skalar der Welt (bild-himmel.js:3060).
Eine Boden-Feuchte als Feld (ein Zustand, den Regen füllt und Verdunstung/Versickerung leert) gibt es NICHT.

## 1. Die Kette Regen → Boden → Versickerung/Verdunstung → Abfluss → Pegel

| Glied | existiert? | was es ist |
|---|---|---|
| Regen | ja, als Stellwert je Wort, welt-global | `rain` 0 · 0,12 · 0,6 · 1,0 (phyto-core.js:4300-4305), `state.weather` gilt überall; die Front ist räumlich (phyto-core `wetterAt`, bild-himmel.js:2843), gezogen wird nur ihr Wort am Ort des Zugs |
| Boden-Feuchte | NEIN als Feld | Ersatz 1: `state.naesse` (EIN Film 0…1, räumlich konstant, bild-himmel.js:3080); Ersatz 2: `_feuchteAt` (Geometrie: Abstand zum Fluss + Höhe über Spiegel, gelaende-boden.js:1538-1563, liest keinen Regen); Ersatz 3: `WUCHS.wasserBasis` 0,75 = „der Regen allein" (vegetation-wiese.js:3174) |
| Versickerung | NEIN als Fluss | nur ein Faktor der Trocken-Rate des Films, der rechnerisch 1 ist (stoff-material.js:2239: 1 − 0,3 + 0,3 · `poren.erde` 1) — das Wasser geht nirgendwohin |
| Verdunstung | nur am Film und am Gefäß | Film linear mit (0,6·sun + 0,4·wind + 0,15)/480 s (stoff-material.js:2236-2240), Gefäß 0,0005 m/s × sun (bau-teile.js:3135); Pegel und Automat verdunsten nichts (`CA_EVAP` fiel, wasser-zellen.js:2092-2094) |
| Abfluss | ja, geschlossen, ohne Raum | spezifischer Abfluss q_j (m/Tag) = spende·(B−1) + 0,072·F_j (gelaende-core.js:1665), Beiwert 0,3 fest in `PEGEL.regen` (1579, 1600); Regen geht DIREKT aus den Stempeln in q — nicht über den Boden; kein Volumen wird über das Netz geroutet |
| Pegel Bach/Fluss/See | ja | Hub (m) über dem statischen Ruhe-Spiegel je Lag-Klasse (Manning, gelaende-core.js:1627-1631), gekappt an der Krone +0,20 m, unten −0,60 m |
| Grundwasser | nur als Zahl | Grund B, dimensionsloser linearer Speicher (Maillet, k 20 Tage, gelaende-core.js:1700-1717), EIN Wert für die ganze Welt; der „Wassertisch" der Zellen ist der Meeresspiegel (wasser-zellen.js:206) |

## 2. DIE GRÖSSEN

| Name | Einheit | Wert/Bereich | Anker | Schreiber | Leser | FOLGT / GESETZT |
|---|---|---|---|---|---|---|
| Regen-Stärke `rain` | Stellwert ohne Einheit (Lesart des Pegels: 1 ≙ 10 mm/h, gelaende-core.js:1579) | klar 0 · bewölkt 0,12 · regen 0,6 · sturm 1,0 | phyto-core.js:4300-4305; WEATHER_FIELD daten.js:112-125 | das Wort: Wetter-Zug `_wetterZugZiehen` dirigent-takt.js:1728; Übergang 45 s daten.js:143-145 | `_naesseTakt` bild-himmel.js:3068/3078; `_regenWeg` wasser-hydro.js:163-164; `_gefaessSchritt` bau-teile.js:2907; `nassTage` bild-himmel.js:3076 | GESETZT (je Wort) |
| Regen-Stempel `state.regenStempel` | Knoten [s, Stellwert] | Fenster 30 Spieltage | wasser-hydro.js:127-143 | `_regenWeg` wasser-hydro.js:154-192 | `pegelLauf` über `_pegelTafel` wasser-hydro.js:93 | FOLGT (der Weg des Worts) |
| Regen-Mittel des Klimas | Stellwert | eine Zahl je Welt | wasser-hydro.js:247-257, `REGEN_KLIMA_ZUEGE` 2000 wasser-hydro.js:935 | `_regenMittel` (nur am Ort 0/0, wasser-hydro.js:254) | Grund B gelaende-core.js:1716 | FOLGT (Mittel der Front) |
| Nässe `state.naesse` | Stellwert 0…1, EIN Skalar je Welt | 0…1 | bild-himmel.js:3054-3086; `NAESSE` stoff-material.js:3788-3803 | `_naesseTakt` bild-himmel.js:3080 (Stand: speicher-laden.js:2688) | Brand feld-brand.js:284; Stoff stoff-material.js:2136; Pfütze 2177; Fahrt koerper-fahrt.js:1811; Wege siedlung-wege.js:626 | GESETZT (benetzenS 150, verdunstS 480, sonne/wind/luft 0,6/0,4/0,15) |
| `NAESSE.versickern` | Stellwert | 0,3 · poren.erde 1 → Faktor 1 | stoff-material.js:3795, 3798 | – | `_trockenRate` stoff-material.js:2239 | GESETZT, wirkungslos |
| Boden-Feuchte `_feuchteAt` | Stellwert 0…1 | 0…1 | gelaende-boden.js:1538-1563; `FEUCHTE` gelaende-boden.js:3220-3233 (26 m · 1,5/7 m · 0,85) | keiner (Funktion, kein Zustand) | Brand feld-brand.js:268; Wuchs vegetation-wiese.js:2081; Streu vegetation-streu.js:19; Wiese vegetation-wiese.js:164/1324/2340/2368/2466; Baum vegetation-baum.js:1342/1492; Boden-Farbe gelaende-boden.js:2570; Werk-Alter siedlung-satz.js:792; Fauna kreatur-fauna.js:715; Faden-Zwilling voxel-worker.js:2097 | GESETZT (Geometrie-Proxy, kein Regen) |
| `WUCHS.wasserBasis` | Stellwert | 0,75 | vegetation-wiese.js:3169-3174 | – | `_wuchsAt` vegetation-wiese.js:2080-2081 | GESETZT (gegen die Linse feld.K4 geeicht) |
| Spende `PEGEL.spende` | m/Tag | 0,0009 (330 mm/a) | gelaende-core.js:1566, 1600 | – | pegelHubVon 1629; pegelAbfluss 1634; pegelLauf 1665; pegelReihe 1792 | GESETZT (Klima) |
| Regen-Abfluss `PEGEL.regen` | m/Tag je rain 1 | 0,072 (10 mm/h · 24 h · Beiwert 0,3) | gelaende-core.js:1579-1580, 1600 | – | pegelLauf 1665 | GESETZT (Beiwert der Wiese, nicht vom Boden) |
| Schnell-Abfluss F_j | Stellwert (gefaltet) | ≥ 0 | gelaende-core.js:1721-1741 | `laufFalte` | pegelLauf 1665 | FOLGT (Nash n = 2) |
| Lag-Klasse j | Stufe 0…23, k = 0,25 h · 2^(j/4) | 0…23 | gelaende-core.js:1601-1611, 1640-1649 | `hydroNetzFluesse` 6579; Seen 6045-6049 | `pegelHub` 1796; `pegelKlassen` 7041 | FOLGT (Snyder, Hack aus A) |
| Grund B | dimensionslos (1 = Klima) | 14 Tage trocken → e^(−0,7) | gelaende-core.js:1581-1584, 1700-1717 | `laufFalte` | pegelLauf 1665; pegelZustand 1683 | FOLGT (Maillet), k GESETZT |
| Pegel-Zustand `state.pegelZustand` | {t s, grund, s[48]} | 50 Zahlen | gelaende-core.js:1674-1684 | `_pegelVergangenheit` wasser-hydro.js:223; `_pegelZustand` 231-243 | `laufFalte` 1688 | FOLGT |
| Schnee-Pegel (SWE) | m Wasser | 0 … Firn 2 + Rest | gelaende-core.js:1458-1490 | Funktion | `abfluss` 1614; `schneeTiefe` 1529 | FOLGT (Grad-Tag); Schneefall `fall` 0,0015 m/Frosttag GESETZT, nicht vom Regen |
| Schmelz-Abfluss | m/Tag | 0,006 m/(K·d) | gelaende-core.js:1612-1618 | `pegelSchmelze` 1761-1772 (je Tag, wasser-hydro.js:95-98) | `pegelTafel` 1773 | FOLGT |
| Hub des Pegels | m | −0,60 … +0,20, Stufe 0,01 | gelaende-core.js:1620-1631, 1796-1806; Bett `HYDROSPHERE` daten.js:222-245 | `_pegelTakt` wasser-hydro.js:323-347 (L.pegel; Faden 329) | `koerperY` gelaende-core.js:7690; `flussAm` 7400/7410/7450; `flussRand` 7497 → `wasserSpiegel`, `atlasSpiegel`, `_feuchteAt` | FOLGT (Manning ^0,6) |
| Meeresspiegel `waterLevel` | m | Basis − 3 (Heimat) | bild-himmel.js:485; `GRUND.meerUnterBasis` gelaende-core.js:5679 | `_buildWaterPlane` bild-himmel.js:485 | jeder Spiegel; `hydroInit` 6178; Aquifer wasser-zellen.js:206 | GESETZT (Ort-Gesetz) |
| See-Spiegel `lake.level` | m | = Füllhöhe (Überlauf) | gelaende-core.js:6417-6508; `seeBilanz` 6389-6416 | `hydrosphaere` im Faden voxel-worker.js:1717 | `hydroBuildWaterField` 6993 → `koerperY` 7688; `hydroBand` 6164 | FOLGT (Priority-Flood, Barnes 2014) |
| Fluss-Spiegel S je Punkt | m | stromab nie steigend | `hydroRiverSpiegel` gelaende-core.js:6621 | `hydrosphaere` | `flussAm` 7347ff; `hydroBand` 6167 | FOLGT |
| Fluss-Breite | m | 2 + 4,7·(A/km²)^0,37 | gelaende-core.js:744-751 | `hydroNetzFluesse` 6549 | Kanal; `gewaesserArt` | FOLGT (Dunne & Leopold) |
| Strömung `_waterFlowAt` | m/s | 1,2 × centerness | wasser-hydro.js:356-367; `WASSER_GESETZ.wellen.adv` foundry-core.js:155 | Funktion | Körper; Fische kreatur-fauna.js:546/573; Klang | GESETZT (ein Wert für jeden Lauf, ohne Abfluss, Pegel, Gefälle) |
| Wasser-Feld der Region (waterY · waterKind · waterLauf) | m / Klasse / j | 128² à 16 m | gelaende-core.js:6980-7000 | `hydrosphaere` | `wasserSpiegel` 7696; `atlasSpiegel` 7728 | FOLGT (statisch aus Samen) |
| Zell-Zustand WATER | Klasse | 1,8 m, 24 × 24 × 232 je 43,2-m-Chunk | gelaende-boden.js:2740; wasser-zellen.js:143 | Chunk-Bau (Faden) | Sheet; Automat-Seed wasser-zellen.js:1794; `_koerperWasserSpiegel` wasser-hydro.js:765 | FOLGT (`atlasSpiegel`) |
| Automat-Füllgrad `waterLevelCells` | Stellwert 0…1 je Zelle | | wasser-zellen.js:1636-1796, 2030-2106 | `_tickWorldWaterCA` wasser-zellen.js:2119-2321 (je Bild) | Sheet-Dach `_caColumnScan` 2437 → `_wasserBildAt` 806 → `_koerperWasser` wasser-hydro.js:748 | GESETZT (rate 0,25 je Bild, KEEP 0,95 wasser-zellen.js:2489, SUPPORT 0,9, SETTLE 0,25) |
| Stau-Spiegel `L.stau` | m | | gelaende-core.js:7514-7528, 7667 | Faden voxel-worker.js:1690-1704, bestellt `_stauFelder` wasser-zellen.js:1940 | `atlasSpiegel` 7757 (nicht `wasserSpiegel`) | FOLGT (Überlauf über dem Werk) |
| Gefäß-Wasser `F.wasser` | m³ | 0 … volumen | bau-teile.js:2902-2910 | `_gefaessSchritt` (bau-teile.js:2574) | `_gefaessWasserZeigen` | GESETZT (regenMproS 0,005, verdunstenMproS 0,0005, bau-teile.js:3135) |
| Nass-Dosis `worldMeta.nassTage` | Spieltage × Stellwert | wächst | bild-himmel.js:3069-3076 | `_naesseTakt` | `_werkAlter` siedlung-satz.js:797 | FOLGT (Integral des Worts) |
| Brand-Feuchte M | kg Wasser / kg trocken | 0,06 + 0,29·boden + 2,5·naesse | feld-brand.js:282-285, 975 | `_brandFeuchte` | `_brandTempo` feld-brand.js:307; `_brandSchritt` 509 | GESETZT (Gewichte; Form Rothermel/Anderson/Matthews) |
| Eis-Dicke | m | 0 … Säule | gelaende-core.js:1404-1442 | Funktion | `_eisAt` wasser-hydro.js:703 | FOLGT (Stefan) |

Zählung: **29 Größen, davon 17 FOLGT, 12 GESETZT, 12 ohne Einheit** (Stellwert oder Klasse).

## 3. DIE FLÜSSE

- Regen → Nässe (bild-himmel.js:3068-3080) → Feuer (feld-brand.js:284), Bild (stoff-material.js:2136, 2177), Fahrt (koerper-fahrt.js:1811),
  Wege (siedlung-wege.js:626); → `nassTage` → Werk-Alter (siedlung-satz.js:797).
- Regen → Stempel → Pegel (wasser-hydro.js:85-99) → Spiegel jedes Sees und Flusses (gelaende-core.js:7690, 7450, 7497) → die Chunks mit Wasser,
  deren Marke wechselt, bauen neu (wasser-hydro.js:341-346) → neue Zellen → Kappe und Quellen des Automaten neu (gelaende-chunks.js:1618-1619)
  → Bild und Körper. Und → `_feuchteAt` (über `wasserSpiegel`, gelaende-boden.js:1554) → Pflanzen, Boden-Farbe, Feuer.
- Temperatur → Schnee-Pegel → Schmelze → Pegel (wasser-hydro.js:95-98, gelaende-core.js:1612-1618).
- Hydrosphäre (Samen) → `_feuchteAt` → Wuchs, Spawn, Streu, Boden-Farbe, Feuer, Werk-Alter, Fauna (Leser in Tabelle).
- Wasser → Tiere: `_nassAt` (Trink-Ziel, Revier kreatur-fauna.js:370, Fische 605), Strömung (Fische kreatur-fauna.js:546, 573).
- Wasser → Klang und Kamera-Medium: `_nassAt` (wasser-hydro.js:900-917), `_wasserArtAt` (wasser-hydro.js:605).
- Wasser → Feuer: `_brandStoff` nimmt keine Zelle, deren MITTE nass ist (feld-brand.js:224, 16-m-Zelle `LIFE_FIELD.cell` feld-leben.js:3078);
  der Brand liest die Feuchte über M (feld-brand.js:284). Mit gras mx 0,12 (bau-vorlagen.js:1647) brennt trockenes Gras nur, wo
  `_feuchteAt` < (0,12 − 0,06)/0,29 = **0,207**; Laub (mx 0,25) nur unter 0,655.

FEHLT (ausdrücklich):
- Regen schreibt KEINE Boden-Feuchte am Ort: die Nässe ist EIN Skalar (bild-himmel.js:3080) — Regen erstickt jede Brand-Zelle der Welt zugleich,
  und es gibt keinen nassen Fleck neben einem trockenen.
- `_feuchteAt` liest keinen Regen (gelaende-boden.js:1538-1563); das Wasser des Wuchses ohne Fluss ist eine Konstante (vegetation-wiese.js:3174).
- Keine Versickerung in einen Speicher, kein Abfluss VOM Boden: der Pegel liest die Regen-Stempel direkt (welt-global, Beiwert 0,3 fest), und
  der Hub hängt NICHT an der Fläche des Einzugsgebiets (q ist je Fläche, A wirkt nur über die Lag-Klasse, gelaende-core.js:1640-1645, 1665).
- Kein Grundwasser-Feld (B ist eine Zahl je Welt); kein Überlauf über die Krone (die Aue „nicht gerechnet", gelaende-core.js:1570).
- Regen bringt keine Masse in den Automaten: er wird nur auf das Gesetz zurückgesetzt (wasser-zellen.js:2095-2100).
- Strömung folgt weder Pegel noch Abfluss (wasser-hydro.js:365).
- Verdunstung liest das Wort der Welt (`wf.sun`, `wf.wind`, stoff-material.js:2238), nicht den Wind am Ort (`_windAt`) und nicht die Sonnen-Sicht.
- Schneefall liest den Regen nicht (gelaende-core.js:1459).
- Pflanzen ziehen kein Wasser; Feuer verdampft keins; ein See löscht Feuer nur über die Probe der Zellen-Mitte.

## 4. DIE BRÜCHE

1. **Zwilling der Boden-Feuchte:** `feuchteAt` im Faden (voxel-worker.js:2090-2128, Konstanten von Hand gespiegelt, „bei einer Änderung hier
   mit-ziehen" 2087-2089) neben `_feuchteAt` im Stamm (gelaende-boden.js:1538-1563, `FEUCHTE` 3220-3233) — EINE Funktion in zwei Abschriften, kein Kern.
2. **Zwei Spiegel-Funktionen, einer ohne Stau:** `wasserSpiegel` (gelaende-core.js:7696-7722) kennt den Stau nicht, `atlasSpiegel` (7757-7758)
   schon — ein Stausee zeichnet Wasser, aber tränkt weder Ufer-Band noch `_feuchteAt` (gelaende-boden.js:1554).
3. **Regen-Einheit doppelt:** Pegel 1 ≙ 10 mm/h (gelaende-core.js:1579), Gefäß 1 ≙ 0,005 m/s = 18 000 mm/h (bau-teile.js:3135) — Faktor 1 800.
4. **Grundwasser doppelt:** Grund B (gelaende-core.js:1702-1716) neben dem „Wassertisch" = Meeresspiegel (wasser-zellen.js:206, daten.js:429-436).
5. **Teich-Spiegel des Plans ohne Leser:** `becken.spiegel` = Terrasse − 1,5 m (fachwerk-core.js:12164, 12290) — Grep `becken` in stamm/,
   gelaende-core.js, voxel-worker.js: 0 Treffer. Das Wasser des Teichs kann nur aus der Hydrosphäre (Füllhöhe des Überlaufs) kommen —
   zwei Quellen derselben Höhe, ob sie gleich sind: nicht verifiziert.
6. **fail-soft Meeresspiegel, zwei Ersatz-Werte:** `: 0` (gelaende-core.js:7697, 7756; wasser-zellen.js:12, 206, 963; gelaende-chunks.js:370;
   voxel-worker.js:1732, 2214, 3452, 3772) gegen `baseHeight − GRUND.meerUnterBasis` (gelaende-core.js:1395, 1492, 1537, 1763, 6180); die Welt selbst liest
   `ort.meerUnterBasisM` (bild-himmel.js:485) — in einer Reise-Welt ein dritter Wert.
7. **Drei Uhren für dasselbe Wasser:** der Automat tickt je BILD (dirigent-takt.js:2351; „frame-basiert" wasser-zellen.js:2122-2124; rate 0,25
   je Takt) — sein Fließ-Tempo hängt an der Bildrate; der Pegel rechnet Spieltage zu 3 600 s (daten.js:165); die Nässe Sekunden ohne Tag-Maß
   (benetzenS 150, verdunstS 480): der Film trocknet in 10,3 min Welt-Uhr (= 4 Spielstunden), während der Pegel 1 h als 1 Tag rechnet.
8. **Keine Massen-Erhaltung irgendwo:** Automat Quellen-Pin (wasser-zellen.js:2166-2190) + KEEP 0,95 (1696-1699); Pegel-Krone kappt
   (gelaende-core.js:1630); `seeBilanz` hält einen Flächen-Anteil, kein Volumen (6389-6416); Gefäß läuft über (bau-teile.js:2907).
9. **Tote Konstante:** `NAESSE.versickern` 0,3 wirkt nicht (stoff-material.js:2239, Faktor = 1).
10. **Gemerkte Feuchte am Brand:** das Bett misst `boden` einmal je Brand (feld-brand.js:218-219, 268, 271); ein Pegel, der während des Brands
    steigt, erreicht das Feuer nicht. Die Nachbarin trägt bis zur Zündung `mx`/`boden` ihrer Quelle (feld-brand.js:448).
11. **Regen-Mittel nur am Ursprung:** `_regenMittel` fragt die Front an (0, 0) (wasser-hydro.js:254) — das Klima jedes Orts ist das des Ursprungs.
12. **Hydrosphäre kennt den Erdbau nur, wenn er vor ihr in der Lage steht:** `hydroInit` liest `hoehe` samt `L.erdbau` (gelaende-core.js:2823,
    6194); sie rechnet einmal je Region (voxel-worker.js:1717) — ob ein später gelegter Erdbau (Teich, Graben) die Seen neu fasst: nicht verifiziert.

## 5. Sprossen der Meisterkarte

`origin/koordination` fehlte während des Lesens (`git show origin/koordination:vision/meisterkarte-2.json` → „invalid object name");
die Leitern `same.kopplung.*` und ihr Wortlaut sind **nicht gelesen**. Was der Wasser-Code an Sprossen zitiert (Grep über stamm/ und
gelaende-core.js, Zahl der Zitate), mit dem, was ihn heute bedient:
- **wetter.K3** (17): Regen speist See und Fluss über die Welt-Uhr — `pegelLauf`/`_pegelTakt` (gelaende-core.js:1658, wasser-hydro.js:323).
- **wetter.K2** (21): die Nässe — `_naesseTakt` (bild-himmel.js:3060), ein Skalar.
- **stoffe.K3-2** (33): Schnee, Schmelze, Pegel, Lava — gelaende-core.js:1458-1806.
- **stoffe.K2#2** (17): die Feuchte des Brennstoff-Betts — feld-brand.js:275-285.
- **stoffe.K5 / K5#2** (6 / 11): Wuchs aus Feuchte × Licht × Nährstoff — vegetation-wiese.js:2070-2086 (Wasser = Konstante + `_feuchteAt`).
- **speicher.K3**: der Pegel-Zustand im Stand — gelaende-core.js:1674.
- **feld.K3** (11): „die Ruhe ist der Fixpunkt" — Automat schläft (wasser-zellen.js:2304-2310), Regen schläft (bild-himmel.js:1068-1078).
- **luftwasser.K3/K4** (3/3): Fische lesen die Strömung, Bestäuber die Feuchte — kreatur-fauna.js:458-605, 715.

## 6. Proben und was nicht verifiziert ist

Gelaufen (headless, Kern allein, Skripte im Scratchpad `.../scratchpad/wasser/`):
- `node pegel-probe.cjs` (gelaende-core `pegelLauf`/`pegelTafel`/`pegelHub`, Heimat-Ort, Spiegel y = 10 m; **Annahme** Klima-Mittel 0,12,
  der Wirt mittelt 2 000 Züge): 10 min Regen 0,6 ab t = 1 000 s → nach 300 s Hub **+0,20 m (Krone)** in den Klassen 0/8/16, Klasse 23 +0,16;
  600 s nach dem Regen Klasse 0 wieder +0,01 m; bei t = 20 000 s alle −0,07 … −0,08 m (B = 0,79). 60 min Sturm: B = 1,345, alle Klassen an der Krone.
- Dieselbe Probe, Nässe-Kurve und Brand-Feuchte nachgerechnet aus `NAESSE` und `BRAND.feuchte`: Regen 0,6 nach **7 s Nässe 0,0276 → M = 0,129
  ≥ gras mx 0,12** (erstickt überall zugleich — die gemessenen 7 s der Station); nach 60 s 0,213; nach 600 s 0,909; klar trocknet Nässe 1 in 10,3 min.
- `node hydro-probe.cjs` (gelaende-core `hydrosphaere`, Plan-Welt Saat „anazh-realm-seed", Regler def, OHNE Erdbau — nicht die Heimat):
  128² Zellen à 16 m (2 048 m), **234 ms**, 21 Läufe, 0 Seen, kleinste volle Bett-Breite 4,39 m.

Nicht gelaufen / nicht verifiziert:
- Der Automat (`_tickWorldWaterCA`) im Spielpfad: Bewegung, Settle-Takte, Massen-Verlust je Takt — nicht gemessen.
- `_feuchteAt` am Ort der Kaskaden-Station (ob dort ≥ 0,207 das Gras ersticken lässt) — nicht gemessen.
- Ob der Teich des Genesis-Orts Wasser trägt und auf welcher Höhe (Bruch 5), ob die Hydrosphäre der Heimat den Erdbau enthält (Bruch 12).
- Ob über offenem Wasser innerhalb einer 16-m-Brandzelle Bett gemessen wird: `_kontaktStoffAt` (gelaende-kollision.js:1121-1134) kennt
  „eis", aber keinen Stoff „wasser" — welchen Stoff es über einem Bach liefert, nicht geprüft.
- Die Fern-Ring- und Fern-Kachel-Wasser (gelaende-fern.js:1691) — nicht gelesen.
- `worlds/fluid` ist ein 2D-Stable-Fluids-Portal mit eigener Engine (worlds/fluid/fluid.js:1-17), kein Glied der Hydrologie — nicht weiter gelesen.
- Die Meisterkarte (Abschnitt 5).
