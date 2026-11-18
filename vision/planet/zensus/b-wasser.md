# Zensus PLANET · b — WASSER (unterste Ebene)

Baum: `/home/user/AnazhRealm`, main am Kopf `b7ed8419`. Nur gelesen und gerechnet. Jede Zeile wurde am Baum geprüft (`grep -n` oder `sed -n`).
Die Datei-Pfade sind relativ zur Wurzel, `stamm/…` ist der Stamm. Die Messung steht in `b-mess.cjs` neben diesem Blatt. Sie läuft in reinem Node und lädt den Kern über den absoluten Pfad.
Maschinen-Fassung: `b-wasser.json` mit 99 Zeilen. Die Prüfung: `node /tmp/claude-0/zensus-b/pruef.cjs` meldet gültiges JSON und 0 Fehler.

## §0 Kernantwort

1. Das Wasser hat eine Quelle, den Gelände-Kern. Die Hydrosphäre wird nur im Faden gerechnet (`voxel-worker.js:1717`, der einzige Rufer von `hydrosphaere` `gelaende-core.js:6036`).
   - Von 99 Größen folgen aber nur **27** dem Relief, dem Netz oder dem Planeten.
   - **61** sind gesetzt, **11** gesetzt mit Anker. 17 davon sind Technik, 5 haben keinen Leser.
2. **Das Flussnetz ist eine Funktion der Adresse, kein Vor-Lauf über ein festes Gebiet.**
   - Die erste Höhen-Frage kostet an jeder Adresse 4–12 ms und legt 600–900 Knoten an, gemessen bis 3,6·10⁶ m vom Ursprung.
   - Das Memo der Knoten wird aber nie geräumt. `gelaende-core.js:537` wirft nur ganze Netze ab dem sechsten weg.
   - Es wächst um ~105 Knoten und ~78 KB je km². Ein Kasten von 200 km lief bei 2 GB Heap aus dem Speicher.
3. **Die Hydrosphäre ist ein Sack je Kachel von 2 048 m.** Dazu gehören die Seen, die Ozean-Maske, der Fluss-Spiegel S und die Wasserfälle.
   - Eine Kachel kostet kalt 110–185 ms und im zweiten Lauf 30–114 ms.
   - Sie belegt 0,40 MB typed und 0,28 MB JSON.
   - Bei vierfacher Fläche (4 096 m) steigt die Zeit auf 195–214 ms (×5,8) und der Speicher auf 1,68 + 1,92 MB.
4. Jenseits der geladenen Kacheln liefert `atlasSpiegel` das Meer −3 als Vorgabe (`gelaende-core.js:7756`).
   - 1 000 km fern sind von 4 096 Proben vor der Kachel 0 nass, danach 8.
   - Der Spiegel an der Adresse fällt von −3 auf −∞.
   - Der Fluss-Spiegel springt an der Kachel-Kante: S − Sohle im Mittel um 0,08–0,41 m, höchstens um 1,71 m.
5. Das Meer ist gesetzt: `meerUnterBasis` 3 steht in `gelaende-core.js:5679` und noch einmal in `:2736`.
   - Dem Planeten folgt es nur auf Reisen (`planet-core.js:2331`).
   - Für dieselbe Linie gibt es drei widersprüchliche Vorgaben, +4, −3 und 0, in 23 Zeilen.
   - In der Heimat liegen nur 0,24–0,95 % der Fläche unter dem Meer.
6. Fluss-Tiefe, Strömung und See-Bett sind feste Zahlen. Keine folgt der Breite, dem Gefälle, dem Abfluss oder dem Becken.
   - Die Fluss-Tiefe ist 0,8 m, an 98,4 % der Punkte (`stamm/daten.js:222` × `gelaende-core.js:6152`).
   - Die Strömung ist 1,2 m/s × centerness (`stamm/wasser-hydro.js:365`).
   - Das See-Bett liegt 8 m unter dem Spiegel (`stamm/daten.js:251`).
7. Das Grundwasser ist der Meeresspiegel, auch unter jedem Berg (`stamm/wasser-zellen.js:206`).
   - Quellen sind die Köpfe des Netzes.
   - Gezeiten fehlen ganz.
   - Verdunstung gibt es nur in der See-Bilanz.
8. Die Karte sagt „8 Schreiber, die Seen doppelt (Kern und Stamm)“. Der Code zeigt etwas anderes:
   - **11 Schreiber**, dazu 2 Spiegel-Urteile mit verschiedener Vorgabe und 3 Abschriften im Faden.
   - Die Seen sind doppelt, aber heute **beide im Kern**: die Netz-Senke `gelaende-core.js:670` und der Flut-See `:6417`.

## §1 Tafel

Spalten: U = Urteil (f = folgt, a = gesetzt_anker, g = gesetzt) · T = Technik · oL = ohne Leser · Z = Zwilling.
Die Leser sind gekürzt; die volle Liste steht in `b-wasser.json`.

### Meer (20)

| id | Name | groesse | Wert | Einheit | Ort | U | woraus | Leser | T | oL | Z |
|---|---|---|---|---|---|---|---|---|---|---|---|
| b1 | Meer unter der Basis (GRUND.meerUnterBasis) | `meeresspiegel` | 3 | m unter terrainBaseHeight (Heimat: −3 m) | `gelaende-core.js:5679` | g | Literal; das Relief (OFFSET_KNOTEN, Küsten-Faktor) ist um diese Linie geeicht, nicht umgekehrt | `gelaende-core.js:5851`, `stamm/bild-himmel.js:485`, `gelaende-core.js:6180` |  |  | `gelaende-core.js:2736` |
| b2 | Meeresspiegel der Welt (state.waterLevel, EIN Schreiber) | `meeresspiegel` | −3 (Heimat) | m | `stamm/bild-himmel.js:485` | f | terrainBaseHeight − ort.meerUnterBasisM (b1 Heimat, b3 Reise); gerufen stamm/bild-himmel.js:280 und stamm/dirigent-ankunft.js:761 | `stamm/wasser-zellen.js:206`, `stamm/wasser-zellen.js:12`, `stamm/wasser-zellen.js:963` +3 |  |  |  |
| b3 | Meer am Reise-Ort (ORT_FELDER.meer waterLevelM, Δ zur Heimat) | `meeresspiegel` | −meerUnterBasisM + sv·(meerKm − meerKm₀)·1000; Heimat Δ = 0 | m | `planet-core.js:2331` | f | meerKm = Σ − Ref aus der Volumenbilanz der Becken (planetMeer, planet-core.js:1618), Stauchung sv = 0,0065 / kuehlungKJeM (planet-core.js:2307); Feldliste gelaende-core.js:5700 | `planet-core.js:2296`, `gelaende-core.js:5910` |  |  |  |
| b4 | Meer-Vorgabe +4 über der Basis (ohne L.waterLevel) | `meeresspiegel` | base + 4 | m | `gelaende-core.js:520` | g | Literal im Rückfall-Zweig | `gelaende-core.js:670`, `gelaende-core.js:707`, `gelaende-core.js:725` +1 |  |  | `gelaende-core.js:7190`, `gelaende-core.js:6180` +1 |
| b5 | Meer-Vorgabe 0 (Stamm, Worker, Kern-Spiegel) | `meeresspiegel` | 0 | m | `stamm/wasser-zellen.js:206` | g | Literal im Rückfall-Zweig | `stamm/wasser-zellen.js:223`, `stamm/wasser-zellen.js:329`, `voxel-worker.js:1732` |  |  | `stamm/wasser-zellen.js:12`, `stamm/wasser-zellen.js:963` +10 |
| b6 | Meer-Vorgabe Basis − GRUND.meerUnterBasis (Kern) | `meeresspiegel` | −3 | m | `gelaende-core.js:6180` | f | b1 | `gelaende-core.js:6240`, `gelaende-core.js:1400` |  |  | `gelaende-core.js:1292`, `gelaende-core.js:1327` +5 |
| b7 | Küsten-Faktor des Reliefs | `kueste` | glatt(−0,28; 0,12; c) | 1 | `gelaende-core.js:578` | g | Kontinentalität c; Schwellen −0,28/0,12 und 0,15/0,85 gesetzt | `gelaende-core.js:579` |  |  |  |
| b8 | Meeresboden (Schelf → Hang → Tiefsee) | `schelf` | depthBelow > 1,5; subMask (d − 3)/6; Hang 0,6; Klemme base − 112; Asymptote −120 | m | `gelaende-core.js:1885` | g | Literale | `gelaende-core.js:1899` |  |  |  |
| b9 | Offset-Knoten des Reliefs (C = −1) | `meer_tiefe` | −48 | m | `gelaende-core.js:405` | g | Spline-Knoten | `gelaende-core.js:472` |  |  |  |
| b10 | Ozean-Maske je Kachel (hydroMarkOcean) | `kueste` | randverbundene Komponente surf < waterLevel | Zellen à 16 m | `gelaende-core.js:6240` | f | Relief surf der Kachel + b2 | `gelaende-core.js:6558`, `gelaende-core.js:6423`, `gelaende-core.js:6980` |  |  |  |
| b11 | atlasSpiegel-Vorgabe jenseits geladener Kacheln | `meeresspiegel` | waterLevel (−3); ohne Heimat-Hydrosphäre −∞ | m | `gelaende-core.js:7756` | g | Vorgabe: das Meer, wo keine Kachel steht | `stamm/wasser-hydro.js:68 → stamm/wasser-zellen.js:260`, `stamm/gelaende-fern.js:356`, `stamm/siedlung-ort.js:13` +2 |  |  | `gelaende-core.js:7697` |
| b12 | wasserSpiegel-Vorgabe (≥ Meer überall) | `meeresspiegel` | max(waterLevel, Körper, Fluss) | m | `gelaende-core.js:7697` | g | Vorgabe: Meer als Untergrenze | `stamm/wasser-hydro.js:58 → stamm/gelaende-boden.js:1554, :1606, :2608`, `stamm/vegetation-wiese.js:1332`, `voxel-worker.js:2067` |  |  | `gelaende-core.js:7756` |
| b13 | Salz und Gefrierpunkt des Meers (EIS.salzMeer, gefrierJeSalz) | `eis` | 35; −0,054 | ‰; K/‰ | `gelaende-core.js:1377` | a | Meerwasser-Salinität 35 ‰, Gefrierpunkt-Erniedrigung ≈ −0,054 K/‰ (Seewasser-Zustand) | `gelaende-core.js:1400` |  |  |  |
| b14 | Eis-Eichung (brack, kopplung, saeule, meerSchicht, uebergang, traegt) | `eis` | [0,8; 2,8]; 25; [0,1; 30]; 50; 20; 0,05 | m bzw. W/m²K bzw. m | `gelaende-core.js:1379` | g | Literale | `gelaende-core.js:1401`, `gelaende-core.js:1406` |  |  |  |
| b15 | Eis-Dicke auf Seen und Meer (eisDicke) | `eis` | Stefan: h²/2k + h/H = ∫Frost dt / ρL | m | `gelaende-core.js:1404` | f | Temperatur-Feld × Wasserkörper (gelaende-core.js:1388) | `stamm/bild-himmel.js:3015`, `stamm/wasser-hydro.js:703`, `stamm/wasser-hydro.js:716` +1 |  |  |  |
| b16 | Fern-Wasser: Senkung und Tauchung (FAR_WATER.drop/dip) | `fern_wasser` | 0,35; 3,5 | m | `stamm/gelaende-fern.js:2346` | g | Anker eigenes Bild | `stamm/gelaende-fern.js:363`, `stamm/gelaende-fern.js:1745` |  |  |  |
| b17 | Fern-Wasser Raster und Reichweite (step, maxRadius, reanchorDist, rebuildDelta, depth) | `fern_wasser` | 10,8; 720; 86,4; 80; 3,5 | m | `stamm/gelaende-fern.js:2346` | g | Literale | `stamm/gelaende-fern.js:295`, `stamm/gelaende-boden.js:647` | T |  |  |
| b18 | Fern-Ring Wasser-Tiefe | `fern_wasser` | drop + _wasserHubM + 0,1 | m | `stamm/gelaende-fern.js:1745` | f | b16 + b94 + Literal 0,1 | `stamm/gelaende-fern.js:1661`, `stamm/gelaende-fern.js:1751` |  |  |  |
| b19 | Ozean-Tor des Chunks (OCEAN_GATE_MARGIN) | `kueste` | 16 | m über waterLevel | `stamm/wasser-zellen.js:80` | g | ≥ Roughness ±12 m | `stamm/wasser-zellen.js:82` | T |  | `voxel-worker.js:3831` |
| b20 | Schelf-Mindesttiefe der Zellen (SHELF_MIN_DEPTH) | `schelf` | 1,0 | m | `stamm/wasser-zellen.js:309` | g | Literal | `stamm/wasser-zellen.js:329` |  |  | `voxel-worker.js:3538` |

### See (15)

| id | Name | groesse | Wert | Einheit | Ort | U | woraus | Leser | T | oL | Z |
|---|---|---|---|---|---|---|---|---|---|---|---|
| b21 | Netz-Senke Ebene 0 (Meer/See) | `see_becken` | senke = h < wl ? 2 (Meer) : 1 (See) | Klasse | `gelaende-core.js:670` | f | Grundhöhe h des Knotens ohne tieferen Nachbarn, gegen N.wl | `gelaende-core.js:707`, `gelaende-core.js:2050`, `gelaende-core.js:6585` +1 |  |  | `gelaende-core.js:6417` |
| b22 | Senken-Sohle unter dem Meer | `muendung` | min(hp, wl − 2) | m | `gelaende-core.js:707` | g | Literal 2 m | `gelaende-core.js:717`, `gelaende-core.js:725` |  |  |  |
| b23 | Benannte Seen (benannteSeen) | `see_becken` | Netz-Senken senke = 1 im Raster | Liste | `gelaende-core.js:1922` | f | b21 | `gelaende-core.js:5595` |  | oL | `gelaende-core.js:6417` |
| b24 | Flut-See je Kachel (hydroExtractLakes) | `see_becken` | filled > surf + TOL, ≥ minLakeCells | Zellen à 16 m | `gelaende-core.js:6417` | f | Priority-Flood (Barnes 2014) auf surf der Kachel | `gelaende-core.js:6041`, `gelaende-core.js:6562`, `gelaende-core.js:6938` +1 |  |  | `gelaende-core.js:670` |
| b25 | See-Spiegel (level) | `see_spiegel` | kleinste Füllhöhe der See-Zellen | m | `gelaende-core.js:6453` | f | Überlauf-Höhe des Beckens aus dem Relief | `gelaende-core.js:6980`, `gelaende-core.js:7688` |  |  |  |
| b26 | See-Bilanz (seeBilanz) | `see_spiegel` | Pegel = surf[bleibt] + 0,05; Anteil bilanz = min(1, verh.decke) | m | `gelaende-core.js:6389` | f | bilanz aus Planet N/PET (gelaende-core.js:5750) | `gelaende-core.js:6041` |  |  |  |
| b27 | See-Toleranz TOL | `see_becken` | 0,02 | m | `gelaende-core.js:6420` | g | Literal | `gelaende-core.js:6417` | T |  |  |
| b28 | Kleinster See (minLakeCells) | `see_becken` | 6 (= 1 536 m²) | Zellen | `stamm/daten.js:206` | g | Literal | `gelaende-core.js:6394`, `gelaende-core.js:6475` |  |  |  |
| b29 | Füll-Epsilon (fillEpsilon) | `see_becken` | 0,01 | m | `stamm/daten.js:205` | a | Barnes et al. 2014 (Priority-Flood + ε) | `gelaende-core.js:6289` | T |  |  |
| b30 | Lag-Klasse des Sees | `pegel` | laufKlasse(A, Weg) | Klasse | `gelaende-core.js:6045` | f | Snyder-Lag aus Einzugsfläche und Weg (gelaende-core.js:1640) | `gelaende-core.js:7688` |  |  |  |
| b31 | See-Bett-Tiefe (carveLakeBedDepth) | `see_tiefe` | 8 | m unter dem Spiegel | `stamm/daten.js:251` | g | Literal | `gelaende-core.js:6950`, `stamm/koerper-bewegung.js:885` |  |  |  |
| b32 | Stau-Spiegel (stauSpiegel, stauFeld, stauFelder) | `stau` | Überlauf der Barriere eines Werks | m | `gelaende-core.js:7514` | f | Werke + atlasSpiegel-Basis (gelaende-core.js:7640), Überlauf gelaende-core.js:7530 | `stamm/wasser-zellen.js:1940`, `voxel-worker.js:1681`, `gelaende-core.js:7728` |  |  |  |
| b33 | Stau-Raster (CA_STAU) | `stau` | REACH 16, WIN_MAX 72, CLUSTER_GAP 4, MIN_EXTENT 1,6 | Zellen / m | `stamm/wasser-zellen.js:2496` | g | Literale | `stamm/wasser-zellen.js:2507`, `stamm/wasser-zellen.js:1875`, `stamm/gelaende-kollision.js:637` | T |  |  |
| b34 | Höhlen-Decke am Wasser | `hoehle` | −24 (Oberfläche < wl + 1), sonst −16 + 24·Mund | m | `gelaende-core.js:7188` | g | Literale; HOEHLEN_MUND gelaende-core.js:2855 | `gelaende-core.js:7184` |  |  |  |
| b35 | Wasser-Band (hydroBand) | `hydro_band` | waterLevel − 10 … top + 10 | m | `gelaende-core.js:6159` | g | Literal ±10 | `stamm/gelaende-boden.js:383`, `voxel-worker.js:1732` | T |  |  |

### Fluss (30)

| id | Name | groesse | Wert | Einheit | Ort | U | woraus | Leser | T | oL | Z |
|---|---|---|---|---|---|---|---|---|---|---|---|
| b36 | Netz-Kanten (NETZ_KANTE) | `fluss_netz` | [1600, 400, 100] | m | `gelaende-core.js:424` | g | Literal | `gelaende-core.js:544` |  |  |  |
| b37 | Netz-Dichte (netzDichte) | `fluss_netz` | 1 (0,6–1,8) | 1 | `gelaende-core.js:386` | g | Regler | `gelaende-core.js:544` |  |  |  |
| b38 | Flussnetz (Knoten, Abfluss, Einzugsfläche A) | `fluss_netz` | 3 Ebenen, lazy und memoisiert | Knoten | `gelaende-core.js:512` | f | Grundhöhe K, steilster Abstieg je Ebene | `gelaende-core.js:2819`, `gelaende-core.js:1953`, `gelaende-core.js:6521` |  |  |  |
| b39 | Steilheits-Index ks | `fluss_gefaelle` | 6 | m^0,9 | `gelaende-core.js:390` | g | Regler | `gelaende-core.js:724` |  |  |  |
| b40 | Konkavität θ | `fluss_gefaelle` | 0,45 | 1 | `gelaende-core.js:391` | a | Flint-Gesetz, Literaturband 0,35–0,6 | `gelaende-core.js:724` |  |  |  |
| b41 | Fluss-Sohle (Stream-Power) | `fluss_gefaelle` | S = ks·A^−θ | m/m | `gelaende-core.js:724` | f | A aus b38, ks, θ | `gelaende-core.js:725`, `gelaende-core.js:6573` |  |  |  |
| b42 | Mindestgefälle | `fluss_gefaelle` | 0,0004 | m/m | `gelaende-core.js:717` | g | Literal | `gelaende-core.js:725` |  |  | `gelaende-core.js:725` |
| b43 | Mündungs-Sohle | `muendung` | ≥ wl − 0,5 | m | `gelaende-core.js:725` | g | Literal | `gelaende-core.js:6573` |  |  |  |
| b44 | Tal-Querprofil (talForm) | `tal_form` | 1,3 | 1 | `gelaende-core.js:387` | g | Regler | `gelaende-core.js:922` |  |  |  |
| b45 | Aue (aue, AUE_QUER) | `aue` | 1 (∝ A^0,4); 0,006 | 1 | `gelaende-core.js:389` | g | Regler; AUE_QUER Literal gelaende-core.js:425 | `gelaende-core.js:1187`, `gelaende-core.js:1189` |  |  |  |
| b46 | Breiten-Gesetz (FLUSS_BREITE) | `fluss_breite` | min 2, k 4,7, exp 0,37 | m, A in km² | `gelaende-core.js:748` | a | Dunne & Leopold 1978 (hydraulische Geometrie) | `gelaende-core.js:749`, `gelaende-core.js:935`, `gelaende-core.js:3298` +1 |  |  |  |
| b47 | Fluss-Breite je Punkt | `fluss_breite` | voll·quelle | m | `gelaende-core.js:6574` | f | flussBreite(A) × Rinnsal-Faktor | `gelaende-core.js:6152`, `gelaende-core.js:7347` |  |  |  |
| b48 | Bach/Fluss-Grenze (GEWAESSER_ART) | `gewaesser_art` | 100 | km² | `gelaende-core.js:761` | a | LAWA-Typologie, Pottgiesser & Sommerhäuser 2008 | `gelaende-core.js:764`, `stamm/wasser-hydro.js:605`, `stamm/bild-himmel.js:2505` |  |  |  |
| b49 | Mäander (MAEANDER) | `maeander` | λ 11 Breiten, Streuung 0,3, ω 1,2, Gefälle 0,004/0,015, gestreckt 0,25 | 1 | `gelaende-core.js:776` | a | Langbein & Leopold 1966; Leopold & Wolman 1960 | `gelaende-core.js:791`, `gelaende-core.js:937`, `gelaende-core.js:3297` |  |  |  |
| b50 | Kanal-Tiefe (kanalTiefe) | `fluss_tiefe` | 0,8 | m | `stamm/daten.js:222` | g | Literal | `gelaende-core.js:6152`, `gelaende-core.js:1622` |  |  |  |
| b51 | Bett-Formel (carveBedMin, carveBedK) | `fluss_tiefe` | 1,4; 0,16 | m; 1 | `stamm/daten.js:218` | g | Literale | `gelaende-core.js:6152` |  |  |  |
| b52 | Spiegel-Freibord (spiegelFreibord) | `fluss_spiegel` | 0,25 | m | `stamm/daten.js:225` | g | Literal | `gelaende-core.js:6632`, `gelaende-core.js:6676`, `gelaende-core.js:6779` +4 |  |  |  |
| b53 | Ufer (bankNeigung, bankKruemmung, bankWeite, bankRundung) | `ufer` | 0,7; 0,04; 24; 0,6 | 1; 1/m; m; 1 | `stamm/daten.js:233` | g | Literale | `gelaende-core.js:6626`, `gelaende-core.js:6726`, `gelaende-core.js:6754` +6 |  |  |  |
| b54 | Damm (dammBreite, dammFreibord) | `damm` | 2,6; 0,2 | m | `stamm/daten.js:244` | g | Literale | `gelaende-core.js:6754`, `gelaende-core.js:6775`, `gelaende-core.js:6879` +2 |  |  |  |
| b55 | Quelle (Ort) | `quelle` | Knoten ohne Oberlieger | Ort | `gelaende-core.js:2050` | f | Topologie des Netzes (b38) | `gelaende-core.js:1976`, `gelaende-core.js:6569` |  |  |  |
| b56 | Rinnsal (quellBett, quellWeitung) | `quelle` | 1,2; 0,25 | m; m/m | `stamm/daten.js:249` | g | Literale | `gelaende-core.js:6569` |  |  |  |
| b57 | Punkt-Deckel (maxRiverPoints) | `fluss_netz` | 800 | Punkte | `stamm/daten.js:214` | g | Literal | — | T | oL |  |
| b58 | Fluss-Spiegel S (hydroRiverSpiegel) | `fluss_spiegel` | Sohle y + Freibord, ausgeglichen je Kachel | m | `gelaende-core.js:6621` | f | globale Netz-Sohle y (gelaende-core.js:6573) + Ufer der Kachel | `gelaende-core.js:7347`, `gelaende-core.js:7501`, `gelaende-core.js:7714` +1 |  |  |  |
| b59 | Strömungs-Richtung (flowX, flowZ) | `stroemung` | Richtung der Bahn | 1 | `gelaende-core.js:6577` | f | Netz-Bahn | `stamm/wasser-hydro.js:356` |  |  |  |
| b60 | Strömungs-Betrag | `stroemung` | 1,2 × centerness | m/s | `stamm/wasser-hydro.js:365` | g | WASSER_GESETZ.wellen.adv (foundry-core.js:155), die Advektion der Shader-Wellen | `stamm/klang.js:314`, `stamm/klang.js:441`, `stamm/koerper-bewegung.js:947` +3 |  |  | `foundry-core.js:155` |
| b61 | Wasserfall (waterfallSlope, waterfallMinDrop) | `wasserfall` | 0,4; 6 | m/m; m | `stamm/daten.js:212` | g | Anker eigenes Bild (stamm/daten.js:210-213: gegen die echte Voxel-Fläche geeicht) | `gelaende-core.js:6822`, `gelaende-core.js:6850`, `stamm/klang.js:451` |  |  |  |
| b62 | Hydro-Kachel (regionSize, cell) | `kachel` | 2048; 16 | m | `stamm/daten.js:203` | g | GRUND.kachel (gelaende-core.js:5679) | `gelaende-core.js:6176`, `gelaende-core.js:25`, `stamm/gelaende-boden.js:607` | T |  |  |
| b63 | Carve-Eimer (carveBucketSize) | `kachel` | 32 | m | `stamm/daten.js:252` | g | Literal | `gelaende-core.js:6872` | T |  |  |
| b64 | Hydro-Reichweite (_hydroReichweite) | `kachel` | max(Ring, 720, Streu, Siedlung) | m | `stamm/gelaende-boden.js:647` | f | Ring-Maße und FAR_WATER.maxRadius | `stamm/gelaende-boden.js:607` | T |  |  |
| b65 | Hydrosphäre je Kachel (hydrosphaere) | `hydrosphaere` | Init → Ozean → Flood → Seen → Bilanz → Läufe → Spiegel → Fälle → Carve → Feld | Region | `gelaende-core.js:6036` | f | Relief der Kachel + Netz | `voxel-worker.js:1717` |  |  |  |

### Grundwasser · Pegel · Verdunstung · Gezeiten (18)

| id | Name | groesse | Wert | Einheit | Ort | U | woraus | Leser | T | oL | Z |
|---|---|---|---|---|---|---|---|---|---|---|---|
| b66 | Grundwasser-Tisch (aquiferY) | `grundwasser` | = state.waterLevel (−3) | m | `stamm/wasser-zellen.js:206` | g | der Meeresspiegel überall, unter Berg wie Küste | `stamm/wasser-zellen.js:223`, `stamm/wasser-zellen.js:329` |  |  | `voxel-worker.js:3452`, `voxel-worker.js:3534` |
| b67 | Aquifer-Tiefe (AQUIFER_TIEFE_M) | `grundwasser` | 18 | m unter der Makro-Fläche | `stamm/daten.js:425` | g | Literal | `stamm/daten.js:435`, `stamm/wasser-zellen.js:223` |  |  | `voxel-worker.js:3677` |
| b68 | Grundwasser-Speicher im Pegel (LAUF.k0, rho, n, trocken) | `grundwasser` | 0,25; 2^0,25; 24; 20 | 1/d; 1; Stufen; d | `gelaende-core.js:1601` | g | Form: Maillet-Rezession (Kommentar gelaende-core.js:1581-1584); Zahlen gesetzt | `gelaende-core.js:1643`, `gelaende-core.js:1648`, `gelaende-core.js:1700` +1 |  |  |  |
| b69 | Lauf-Gesetz (LAUF.snyder, hack) | `pegel` | 1,125; 1,27 | 1 | `gelaende-core.js:1602` | a | Snyder 1938; Hack 1957 | `gelaende-core.js:1642`, `gelaende-core.js:1638` |  |  |  |
| b70 | Abflussspende (PEGEL.spende) | `abfluss_spende` | 0,0009 (= 328,5 mm/a) | m/d | `gelaende-core.js:1600` | g | Literal; Kommentar „330 mm“ ohne Zitat | `gelaende-core.js:1634`, `gelaende-core.js:1665`, `gelaende-core.js:1792` |  |  |  |
| b71 | Regen-Anteil am Pegel (PEGEL.regen) | `regen_quote` | 0,072 | m/d je Einheit Regen | `gelaende-core.js:1600` | g | Literal | `gelaende-core.js:1665` |  |  |  |
| b72 | Pegel-Raster (PEGEL.unter, ueber, dy, stufe) | `pegel` | 40; 300; 1; 0,01 | m | `gelaende-core.js:1600` | g | Literale | `gelaende-core.js:1628`, `gelaende-core.js:1661`, `gelaende-core.js:1762` +1 | T |  |  |
| b73 | Manning-Exponent des Pegels | `pegel` | 0,6 | 1 | `gelaende-core.js:1634` | a | Manning, breites Rechteck: h ∝ Q^0,6 | `gelaende-core.js:1627` |  |  |  |
| b74 | Schmelze (SCHMELZE.fall, gradTag, deckt) | `schmelze` | 0,0015; 0,006; 0,05 | m/d; m/(K·d); m | `gelaende-core.js:1458` | a | Hock 2003 (gelaende-core.js:1454) | `gelaende-core.js:1494`, `gelaende-core.js:1507`, `gelaende-core.js:1617` |  |  |  |
| b75 | Pegel-Hub (pegelHub) | `pegel` | Hub je Höhe und Lag-Klasse | m | `gelaende-core.js:1796` | f | Schmelze + Regen über Nash/Snyder, Manning | `gelaende-core.js:7400`, `gelaende-core.js:7410`, `gelaende-core.js:7450` +2 |  |  |  |
| b76 | Spende am Reise-Ort (spendeVerh) | `abfluss_spende` | o.spendeMm / a.spendeMm | 1 | `gelaende-core.js:5918` | f | Planet-Klima (planet-core.js:2298) | `gelaende-core.js:1778` |  |  |  |
| b77 | Pegel-Tag (PEGEL_TAG_S) | `zeit_pegel` | 3600 | s | `stamm/daten.js:165` | g | 15·4·60 | `stamm/bild-himmel.js:3076` |  |  |  |
| b78 | Pegel-Rand und Regen-Klima (PEGEL_RAND_M, REGEN_KLIMA_ZUEGE) | `pegel` | 40; 2000 | m; Züge | `stamm/wasser-hydro.js:932` | g | Literale | `stamm/wasser-hydro.js:303`, `stamm/wasser-hydro.js:252` | T |  |  |
| b79 | Verdunstung im Hydro-Gesetz | `verdunstung` | fehlt (0) | m/d | `stamm/wasser-zellen.js:2092` | g | CA_EVAP gefallen; nur die See-Bilanz (b26) trägt N/PET | — |  | oL | `stamm/bau-teile.js:3135`, `stamm/stoff-material.js:3791` |
| b80 | Gefäß-Wasser (GEFAESS) | `verdunstung` | regen 0,005; verdunsten 0,0005 | m/s | `stamm/bau-teile.js:3135` | g | Literale | `stamm/bau-teile.js:2903` |  |  |  |
| b81 | Nässe-Film (verdunstS) | `verdunstung` | 480 | s | `stamm/stoff-material.js:3791` | g | Literal | `stamm/stoff-material.js:2239` |  |  |  |
| b82 | Gezeiten | `gezeiten` | fehlt (0) | m | `— (grep gezeit/tide/ebbe: 0 Treffer)` | g | implizit 0 | — |  | oL |  |
| b99 | Nash-Kaskade (LAUF.nash) | `pegel` | 2 | Speicher | `gelaende-core.js:1607` | a | Nash 1957 (Gamma-Ganglinie, n Speicher) | — |  | oL | `gelaende-core.js:1723` |

### Automat (10)

| id | Name | groesse | Wert | Einheit | Ort | U | woraus | Leser | T | oL | Z |
|---|---|---|---|---|---|---|---|---|---|---|---|
| b83 | Automat-Fluss (rate, EPS, SUPPORT) | `automat` | 0,25; 1e-4; 0,9 | 1 | `stamm/wasser-zellen.js:1641` | g | Literale | `stamm/wasser-zellen.js:1641` |  |  |  |
| b84 | Automat-Halt (CA_FLOW_KEEP) | `automat` | 0,95 | 1 | `stamm/wasser-zellen.js:2489` | g | Literal | `stamm/wasser-zellen.js:1641` |  |  |  |
| b85 | Automat-Ruhe (SETTLE) | `automat` | 0,25 | Zellen-Pegel | `stamm/wasser-zellen.js:2133` | g | Literal | `stamm/wasser-zellen.js:2300` | T |  |  |
| b86 | Automat-Bild (CA_REMESH_TICK_INTERVAL, WASSER_BILD_RAND) | `automat` | 4; 0,6 | Ticks; m | `stamm/wasser-zellen.js:2494` | g | Literale (WASSER_BILD_RAND stamm/wasser-zellen.js:2484) | `stamm/wasser-zellen.js:2119` | T |  |  |
| b87 | Saat-Pegel je Wasser-Zelle (_seedWaterLevel) | `automat` | 1,0 | Zellen-Pegel | `stamm/wasser-zellen.js:1791` | g | Literal | `stamm/wasser-zellen.js:2030` | T |  |  |
| b88 | Wasser-Frist (OHNE_FRIST_MS.wasser) | `automat` | 22 | ms | `stamm/dirigent-takt.js:2667` | g | Literal | `stamm/dirigent-takt.js:2351` | T |  |  |
| b89 | Sim-Zelle (step, dim, dimY, floorDrop) | `voxel` | 1,8; 24; 232; 135 | m; Zellen; Zellen; m | `stamm/gelaende-boden.js:2740` | g | Literale | `stamm/wasser-zellen.js:143` | T |  |  |
| b90 | Zellen-Flood je Chunk (_buildVoxelChunkWaterCells) | `wasser_zellen` | Pegel je Zelle aus Kern-Spiegel, Aquifer, Deck-Zelle | Zellen à 1,8 m | `stamm/wasser-zellen.js:143` | f | schnittSpiegel (stamm/wasser-zellen.js:272), atlasSpiegel (:260), Aquifer (:329) | `stamm/wasser-zellen.js:2030`, `stamm/wasser-zellen.js:952` |  |  | `voxel-worker.js:3402`, `voxel-worker.js:3767` +1 |
| b91 | Wasser-Fläche (Sheet) | `wasser_zellen` | Fläche aus Zellen-Pegel | Mesh | `stamm/wasser-zellen.js:952` | f | b90 | `stamm/wasser-zellen.js:2119` |  |  | `voxel-worker.js:2204` |
| b92 | Körper-Spiegel (_koerperWasserSpiegel) | `wasser_koerper` | Spiegel unter dem Körper | m | `stamm/wasser-hydro.js:746` | f | atlasSpiegel (stamm/wasser-hydro.js:750) + Automat | `stamm/wasser-hydro.js:680` |  |  |  |

### Welle · Bild (6)

| id | Name | groesse | Wert | Einheit | Ort | U | woraus | Leser | T | oL | Z |
|---|---|---|---|---|---|---|---|---|---|---|---|
| b93 | Dünung (welle.duenung, frequenz) | `welle` | [1,4; 0,7; 0,34]; [0,05; 0,12; 0,23] | m; 1/m | `foundry-core.js:185` | g | Anker eigenes Bild; Wert-Rauschen, kein Wind/Fetch-Gesetz | `stamm/bild-sicht.js:1339`, `stamm/gelaende-fern.js:2680` |  |  |  |
| b94 | Wellen-Hub (_wasserHubM) | `welle` | 4,42 (Sturm) | m | `stamm/gelaende-fern.js:2679` | f | Σ Dünung × Treiber (b93, b95) | `stamm/siedlung-bauten.js:2007`, `stamm/gelaende-fern.js:1745` |  |  |  |
| b95 | Wellen-Treiber und Kräusel (treiber, kraeusel, kraeuselDecke, phase, oktave, mitte) | `welle` | [0,7; 0,9]; 2,2; 1; 4; 0,4; 0,7 | 1; m; m; s; 1; 1 | `foundry-core.js:185` | g | Anker eigenes Bild | `stamm/bild-sicht.js:1251`, `stamm/bild-sicht.js:1382`, `stamm/bild-sicht.js:1400` |  |  |  |
| b96 | Shader-Literale der Welle (Drift, Kräusel-Frequenz) | `welle` | Drift 0,06/0,04, −0,05/0,07, 0,08/−0,06; Kräusel 0,07/0,12, Zeit 0,02 | m/s; 1/m | `stamm/bild-sicht.js:1340` | g | Literale im Shader, am Gesetz vorbei | `stamm/bild-sicht.js:1343`, `stamm/bild-sicht.js:1403` |  |  |  |
| b97 | Normal-Wellen (WASSER_GESETZ.wellen) | `welle` | k0 0,17, a0 1,5, om0 0,55, L 2,2, g 0,6, disp 1,4832, okt 4, adv 1,2; amp [0,16; 0,4], wind [0,7; 0,9] | gemischt | `foundry-core.js:155` | g | Literale | `stamm/bild-sicht.js:1245`, `stamm/wasser-hydro.js:365` |  |  |  |
| b98 | Wasser-Optik je Körper (WASSER_GESETZ.koerper kd, c) | `wasser_optik` | see/fluss/bach je RGB | 1/m | `foundry-core.js:179` | a | Davies-Colley & Smith 2001; Pope & Fry 1997 (foundry-core.js:176-177) | `stamm/bild-himmel.js:2505` |  |  |  |

**Summe:** 99 Zeilen · folgt 27 · gesetzt_anker 11 · gesetzt 61 · Technik 17 · ohne Leser 5 · mit Zwilling 19


## §2 Gerechnet und gemessen

Alle Befehle laufen im Ordner dieses Blatts (`/home/user/zensus-planet/vision/planet/zensus/`) mit reinem Node.

Für die Messung gilt:
- Die Lage kommt aus `lageGrund("anazh-realm-seed")` mit `ortGesetz(null)`.
- Das Hydro-Gesetz ist eine Abschrift der Zahlen in `stamm/daten.js:199-255`.
- `regionSize` kommt aus `GRUND.kachel`.

**(1) Hydrosphäre der Heimat-Kachel** (`node b-mess.cjs haupt`, 3 Läufe)

| Größe | Zahl |
|---|---|
| Kachel 2 048 m, kalt | 109,6 / 120,3 / 184,5 ms |
| zweiter Lauf | 53 / 59,2 / 114,1 ms |
| Speicher | 395 720 B typed + 279 830 B JSON |
| Inhalt | 21 Flüsse, 0 Seen, 0 Meer-Zellen, 0 Fälle |
| Oberfläche | surf 14…135 m |
| Fluss-Punkte | 1 196, Gefälle höchstens 0,14 |
| Netz-Knoten danach | [277, 534, 1003] |

**(2) Bett-Tiefe aller Fluss-Punkte der Heimat** (`haupt`)
- 1 177 von 1 196 Punkten liegen auf `kanalTiefe` 0,8 m, das sind 98,4 %.
- Alle 1 164 vollen Punkte liegen auf 0,8 m.
- Die geringste Tiefe ist 0,386 m. Die Breite reicht von 1,2 bis 10,6 m.
- Rechnung: `flussTiefe = min(0,8; (1,4 + 0,16·w/q)·q)`. Bei q = 1 ist der zweite Term mindestens 1,4 > 0,8. Darum wirken `carveBedMin` und `carveBedK` nur an den 19 Quell-Punkten.

**(3) Die Seen doppelt** (`haupt`)

| Fläche | Netz-Senken | Flut-Seen | Läufe | Mündungen |
|---|---|---|---|---|
| Heimat-Kachel | 0 | 0 | Netz-Laufenden {rand 29, see 5, mündung 39} | Hydro {border 15, zufluss 6} |
| 3×3 Kacheln (519 ms) | 1, deckungsgleich mit dem Flut-See | 1 (9 Zellen), 0 am Rand | 295 Flüsse, 128 enden an der Kachel-Grenze | 19 See-Mündungen |

**(4) Spiegel nah** (`haupt`)

| Adresse | Boden | `atlasSpiegel` | `wasserSpiegel` |
|---|---|---|---|
| (0, 0) | 90,31 | −∞ | −3 |
| Fluss-Punkt (−496,9; −468,0) | 27,06 | 26,82 | 26,82 |
| ohne jede Region | – | −∞, auch über einem Boden auf −50 | −3 |

**(5) Spiegel 1 000 km fern** (`haupt`, Adresse (10⁶, 0), Kachel „488,0“)
- Kosten:
  - `hoehe` kalt 3,7–8,2 ms, warm 0,009–0,015 ms, dabei +271 / +344 / +85 Knoten.
  - Die Kachel kostet 71,6–75,3 ms und belegt 483 888 B typed + 650 465 B JSON.
  - Sie trägt 28 Flüsse und 2 Seen (14 Zellen).
- Raster von 4 096 Proben über die Kachel:
  - vor der Kachel 0 nass, nach der Kachel 8 nass;
  - 8 Urteile wechseln von trocken zu nass;
  - der Spiegel weicht um höchstens 102,86 m ab.
- An der Adresse selbst: vor der Kachel −3, nach der Kachel −∞.

**(6) Wachstum mit der Fläche** (`haupt`, Zelle 16 m)

| Kante | ms | zweiter Lauf | Bytes typed | Bytes JSON | Flüsse | Seen | Netz-Knoten |
|---|---|---|---|---|---|---|---|
| 1 024 m | 27–29 | 6,7–11,4 | 89 552 | 46 717 | 7 | 0 | [253, 442, 498] |
| 2 048 m | 33–50 | 30–35 | 395 720 | 279 830 | 21 | 0 | [277, 534, 1003] |
| 4 096 m | 195–214 | 169–177 | 1 684 892 | 1 921 579 | 104 | 1 | [349, 958, 2639] |

- Von 2 048 auf 4 096 m (Fläche ×4) steigen die Zeit ×5,8, die Bytes typed ×4,3 und JSON ×6,9.
- Die Kosten wachsen also mindestens linear mit der Fläche, die Zeit überlinear.

**(7) Das Netz als Funktion der Adresse** (`node --max-old-space-size=3000 b-mess.cjs netz`)
- Eine einzelne Höhen-Frage kostet 4–12 ms und legt 600–900 neue Knoten an. Gemessen an (0,0), (5·10³,0), (5·10⁴,0), (10⁶,0), (10⁶,10⁶) und (−3·10⁶, 2·10⁶).
- Fläche um (2·10⁶, 0), Raster 1 km, ineinander liegende Kästen:

| Kasten | neue Knoten | Heap |
|---|---|---|
| 4 km | +3 618 | ~0 MB |
| 10 km | +10 423 | +7,6 MB |
| 20 km | +32 167 | +29,9 MB |
| 40 km | +125 360 (171 568 gesamt) | +91–93 MB |

- Je km² sind das ~105 Knoten, also etwa die Dichte der Ebene 2 mit 100 m Kante.
- Der Speicher wächst um ~0,7 KB je Knoten, also ~78 KB je km² (93,3 MB / 1 200 km²).
- Das Memo wird nie geräumt (`gelaende-core.js:537`).
- Der erste Lauf des Meer-Skripts mit Kästen von 200/100/400 km lief bei 2 GB Heap aus dem Speicher.

**(8) Meer-Anteil** (`node --max-old-space-size=3500 b-mess.cjs meer`, Kriterium `hoehe < −3`)

| Kasten um (0,0) | Anteil unter dem Meer |
|---|---|
| 20 km | 0,24 % |
| 40 km | 0,42 % |
| 100 km | 0,95 % |

- Um (2·10⁶, 0) liegen 0,8 % unter dem Meer.
- Das nächste Meer liegt bei (2 000, 9 000), 9,2 km entfernt, y −4,5.
- Die Küsten-Kachel mit Origin (1024, 7168):
  - kostet 99–139 ms und trägt 969 Meer-Zellen (5,9 %);
  - ihre tiefste Oberfläche liegt bei −6;
  - sie hat 45 Flüsse und 0 Seen;
  - 18 Zellen liegen unter −3 und heißen trotzdem nicht Meer (Binnen-Mulde, `gelaende-core.js:6423`).

**(9) Naht des Fluss-Spiegels an der Kachel-Kante** (`node b-mess.cjs naht`)
- Messung:
  - Heimat gegen ihre vier Nachbarn.
  - Je Fluss-Punkt bis 48 m vor der Kante wird der nächste Punkt der Nachbar-Kachel gesucht, höchstens 24 m entfernt.
  - Verglichen wird S − y, also der Spiegel über der globalen Netz-Sohle. So fällt das Gefälle heraus.

| Nachbar | Paare | Mittel | Max | über 10 cm |
|---|---|---|---|---|
| +x | 3 | 0,282 m | 0,635 m | 2 |
| +z | 9 | 0,075 m | 0,263 m | 2 |
| −x | 10 | 0,409 m | 1,709 m | 5 |
| −z | 8 | 0,108 m | 0,269 m | 4 |

- Ohne die Sohlen-Korrektur, also roh S gegen S, liegt das Mittel bei 0,09–0,22 m und das Maximum bei 0,62 m.
- Grenze der Messung: Zusammenflüsse werden nicht getrennt.

**Rechnungen**
- `PEGEL.spende` 0,0009 m/d × `jahrTage` 365 (`gelaende-core.js:1319`) ergibt 328,5 mm im Jahr. Der Kommentar nennt „330 mm“ ohne Quelle.
- `minLakeCells` 6 × 16² m² ergibt 1 536 m². Kleinere Seen gibt es nicht.
- Der Pegel-Tag ist 15·4·60 = 3 600 s (`stamm/daten.js:165`).
- `_wasserHubM` im Sturm: Σ Dünung (1,4 + 0,7 + 0,34) × Treiber ergibt 4,42 m (`stamm/gelaende-fern.js:2679`).

## §3 Funde

### Die Wasser-Schreiber: die Karte sagt 8, der Code zeigt 11, dazu 2 Spiegel-Urteile und 3 Abschriften im Faden

Die Behauptung steht in `.claude/skills/anazh-lehren/SKILL.md:47`: „8 Schreiber, die Seen doppelt (Gelände-Kern und Stamm)“. Ebenso in der Systemkarte (`origin/koordination:SYSTEMKARTE.md:73`).

Am Code schreiben diese Stellen die Höhe des Wassers an einem Ort:

| # | Was | Wo |
|---|---|---|
| 1 | Meer | `_buildWaterPlane` `stamm/bild-himmel.js:485` |
| 2 | See | Flut-See, Pegel und Bilanz `gelaende-core.js:6417`, `:6453`, `:6389` → Wasser-Feld `:6980` |
| 3 | Fluss | Spiegel S `gelaende-core.js:6621` (gelesen von `flussAm` `:7347`) |
| 4 | Pegel-Hub | `gelaende-core.js:1796` |
| 5 | Stau | `stauSpiegel` / `stauFeld` `gelaende-core.js:7514` / `:7617` |
| 6 | Zellen | Zellen-Flood mit Küsten-Aquifer `stamm/wasser-zellen.js:143`, `:329`; Abschrift `voxel-worker.js:3402`, `:3534` |
| 7 | Automat | `_tickWaterCA` `stamm/wasser-zellen.js:1641` |
| 8 | Sheet | `stamm/wasser-zellen.js:952`; Abschrift `voxel-worker.js:2204` |
| 9 | Fern-Wasser | `stamm/gelaende-fern.js:363` |
| 10 | Fern-Ring | `stamm/gelaende-fern.js:1745` |
| 11 | Körper | `_koerperWasserSpiegel` `stamm/wasser-hydro.js:746` |

Dazu kommen zwei Spiegel-Urteile mit verschiedener Vorgabe. Ohne Kachel liefert `atlasSpiegel` (`gelaende-core.js:7728`) −∞, `wasserSpiegel` (`:7696`) dagegen −3.

**Seen doppelt, aber beide im Kern.**
- Die Netz-Senke der Ebene 0 (`gelaende-core.js:670`, Sohle `:707`, Liste `benannteSeen` `:1922`) entscheidet über 1 600 m Kante.
- Der Flut-See (`gelaende-core.js:6417`) entscheidet je Kachel.
- In der Heimat 3×3 decken sie sich (1 : 1).
- `benannteSeen` liest nur die Linse (`gelaende-core.js:5594-5596`).
- Der Stamm hat keinen eigenen See mehr.

### Zwillinge: 19 Zeilen, 42 Stellen

- **Meer-Vorgabe ×3** für dieselbe Linie:
  - +4 an `gelaende-core.js:520` und `:7190`;
  - −3 an `gelaende-core.js:6180`, `:1292`, `:1327`, `:1395`, `:1492`, `:1537`, `:1763` und `stamm/bild-himmel.js:3008`;
  - 0 an `stamm/wasser-zellen.js:12`, `:206`, `:963`, `stamm/gelaende-boden.js:379`, `stamm/gelaende-fern.js:330`, `stamm/gelaende-chunks.js:370`, `voxel-worker.js:58`, `:1732`, `:2214`, `:3452`, `:3772` und `gelaende-core.js:7697`, `:7756`.
- **`meerUnterBasis` 3 ×2:** `GRUND` `gelaende-core.js:5679` ⇄ `LAGE_GRUND` `gelaende-core.js:2736`.
- **Spiegel-Urteil ×2:** `atlasSpiegel` `gelaende-core.js:7756` (−∞) ⇄ `wasserSpiegel` `gelaende-core.js:7697` (−3).
- **See ×2:** `gelaende-core.js:670` ⇄ `gelaende-core.js:6417`.
- **Aquifer 18 ×2:** `stamm/daten.js:425` ⇄ das Literal in `voxel-worker.js:3677`.
- **`aquiferY` ×2:** `stamm/wasser-zellen.js:206` ⇄ `voxel-worker.js:3452`.
- **Stamm ⇄ Faden, je eine Abschrift:**

  | Stamm | Faden |
  |---|---|
  | `OCEAN_GATE_MARGIN` `stamm/wasser-zellen.js:80` | `voxel-worker.js:3831` |
  | `SHELF_MIN_DEPTH` `:309` | `:3538` |
  | Küsten-Aquifer `:304-333` | `:3534-3556` |
  | Zellen-Bau `:143` | `:3402` |
  | Sheet `:952` | `:2204` |
  | `_voxelChunkHasAnyWater` `:8` | `:3767` |
  | `_skyOpenWaterFilter` `:470` | `:3683` |

- **Strömung = Shader-Advektion:** `WASSER_GESETZ.wellen.adv` 1,2 (`foundry-core.js:155`) treibt das Bild (`stamm/bild-sicht.js:1245`) und zugleich den Fluss für Körper, Fische und Klang (`stamm/wasser-hydro.js:365`).
- **Nash-Kaskade:** `LAUF.nash` 2 (`gelaende-core.js:1607`) liest niemand. Die Faltung schreibt n = 2 als Formel fest (`gelaende-core.js:1723-1724`). Das bricht „sage a, tue a“.
- **Kein Zwilling:** `hydroBand` hat zwei Rufer (`stamm/gelaende-boden.js:383`, `voxel-worker.js:1732`), aber dieselbe Kern-Funktion.

### Ohne Leser: 5

| Größe | Stelle | Befund |
|---|---|---|
| `maxRiverPoints` 800 | `stamm/daten.js:214` | kein Leser am Baum |
| `benannteSeen` | `gelaende-core.js:1922` | nur die Linse |
| `LAUF.nash` | `gelaende-core.js:1607` | kein Leser |
| Verdunstung | – | fehlt im Hydro-Gesetz; `CA_EVAP` ist gefallen (`stamm/wasser-zellen.js:2092`) |
| Gezeiten | – | fehlen; `grep gezeit\|tide\|ebbe` liefert 0 Treffer |

Labore in `scripts/` und `worlds/` sind nicht gezählt. `scripts/diag-planet.cjs` liest `PEGEL.spende` über den Planeten-Anker (`gelaende-core.js:5685-5686`).

### Karte ≠ Code

- **`_computeHydrosphere`:**
  - Die Systemkarte nennt `_computeHydrosphere wasser-hydro.js:54` (`SYSTEMKARTE.md:72`).
  - Dort steht heute `_waterLevelAt` (`stamm/wasser-hydro.js:57`).
  - Die Hydrosphäre rechnet nur der Faden (`voxel-worker.js:1717`). Der Name lebt nur in einem Kommentar (`stamm/dirigent-kern.js:185`).
- **„Seen ×2 (`gelaende-core.js:1146` ⇄ `wasser-hydro.js:760`)“** (`SYSTEMKARTE.md:73`, `:186`):
  - `gelaende-core.js:1146` ist heute `flaeche`.
  - `stamm/wasser-hydro.js:760` liegt in `_koerperWasserSpiegel`.
  - Der See-Zwilling liegt heute ganz im Kern, an `:670` ⇄ `:6417`.
- **„Hydro-Zahlen ×2 (`daten.js:166` ⇄ `voxel-worker.js:72-78`)“:**
  - Dieser Zwilling ist gefallen. Der Faden liest `hydroGesetz` aus dem Stand (`voxel-worker.js:65-67`, `:1575`).
  - `stamm/daten.js:166` gehört heute zu `PEGEL_TAG_S`.
- **„8 Wasser-Schreiber“:** am Code 11, dazu 2 Urteile und 3 Faden-Abschriften (siehe oben).

### Die drei schwersten Funde

1. **Die Hydrosphäre ist ein Sack je 2-km-Kachel, kein Gesetz der Adresse.**
   - Seen, Ozean-Maske (`gelaende-core.js:6240`, „mit dem Rand verbunden“ meint den Rand der Kachel), Fluss-Spiegel und Fälle gibt es erst, wenn die Kachel geladen ist.
   - Davor gilt das Meer −3 (`gelaende-core.js:7756`); gemessen: 0 → 8 nasse Proben, Spiegel −3 → −∞.
   - Der Fluss-Spiegel springt an der Kante um bis zu 1,71 m, weil jede Kachel ihren Ausgleich allein rechnet.
   - Das Netz darunter ist dagegen eine Funktion der Adresse. Sein Memo wächst aber ohne Räumung um ~78 KB je km².
2. **Fluss-Tiefe, Strömung und See-Bett sind Konstanten.**
   - Die Fluss-Tiefe ist 0,8 m an 98,4 % der Punkte (`stamm/daten.js:222` × `gelaende-core.js:6152`).
   - Die Strömung ist 1,2 m/s × centerness (`stamm/wasser-hydro.js:365` ← `foundry-core.js:155`).
   - Jedes See-Bett liegt 8 m unter dem Spiegel (`stamm/daten.js:251` → `gelaende-core.js:6950`).
   - Die Breite folgt dem Gesetz (Dunne & Leopold), Tiefe und Geschwindigkeit nicht. Die hydraulische Geometrie ist nur zu einem Drittel eingelöst.
3. **Meer und Grundwasser sind gesetzt, und dreimal verschieden vorbelegt.**
   - `meerUnterBasis` 3 ist ein Literal (`gelaende-core.js:5679` ⇄ `:2736`); dem Planeten folgt es nur auf Reisen (`planet-core.js:2331`).
   - Für dieselbe Linie stehen die Vorgaben +4, −3 und 0 in 23 Zeilen.
   - Der Grundwasser-Tisch ist der Meeresspiegel unter jedem Berg (`stamm/wasser-zellen.js:206` ⇄ `voxel-worker.js:3452`; Tiefe 18 ⇄ Literal `voxel-worker.js:3677`).
   - Quellen sind nur Netz-Köpfe (`gelaende-core.js:2050`), Gezeiten fehlen, Verdunstung lebt nur in der See-Bilanz (`gelaende-core.js:6389`, `bilanz` `:5750`).
