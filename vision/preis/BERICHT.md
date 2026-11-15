# BERICHT: der Preis des Orts (ZWISCHENSTAND)

## Schnitt 1 — VRAM (Zweig w28-preis-ort, Kopf 9fba231b, Basis main ffb005db)

**Geschnitten** (Datei:Zeile am Kopf):
- 1.0 Der Zähler nennt jeden Puffer: `scripts/werkbank.cjs:2616` (`/puffer` liest `__pufferZensus()` VOR `__vramBericht`) · die Akte führt
  jeden Posten ab 0,25 MB und den Rest als EINE Zeile (`meisterkarte-quelle/punkte/punkte.cjs` `POSTEN_MIN_MB`, `postenListe`; Zweig
  koordination). Linse (a): `scripts/lib/band-urteil.cjs` `PUFFER_OHNE_NAMEN_MB` — `buf:?` ab 0,25 MB ist ROT `unbenannt`, Selbsttest S7b
  in `scripts/diag-profiband.cjs` (Mutante „Liste vor Zensus“ 32,4 MB → ROT, 0,1 MB still), 42/42 GRÜN.
- 1.1 Kaskaden auf den Bedarf ihres Gesetzes, auf 16 gerastert: `stamm/bild-schatten.js:1110` (`_kaskadenKarten`, `karteRaster` 16 in
  `SCHATTEN_KASKADE`); k0 1024 → 992, k1 2048 → 1904, k2 2048 → 1840. `gate:schatten-werfer` K5 urteilt die kleinste Seite im Raster.
- 1.2 Feld-Panorama rgba16float (Float16Array, die CPU-Werte bleiben Float32): `stamm/bild-sicht.js:1670`.
- 1.3 Punkt-Schatten depth16 (`WurfSchatten.setupRenderTarget`): `stamm/bild-schatten.js:438`.
- 1.4 (Normale, Farbe) Das Eck-Format der EINEN Pipe: `stamm/studio-gestalt.js:390` `_eckForm` / `_eckDicht` (Normale snorm8 × 4, Farbe
  half × 4), gerufen in `_foundryBuildMesh` (:217), der Haut-Verschmelzung `stamm/koerper-leib.js:1115` und der Kamm-Krone
  `stamm/gelaende-fern.js:837`; der Bau-Satz liest dicht (`stamm/siedlung-satz.js:467`). Haut und Tuch (`seh` haut · stoff) tragen die
  Normale weiter in Float32: das Tuch-Gesetz liest sie dicht (koerper-core `_tuchBind`), three `computeVertexNormals` summiert beim
  Drapieren in das Attribut. Linse (b): `gate:asset-contract` Eck-Wand (E) — 252 Gestalten, 0 Täter, Mutante „Pipe in Float32“ ROT
  beim Namen der Art; der Gate fährt mit `--js-float16array` (Node 22 der CI).

**Gemessen** (Radeon 890M, Preis-Lauf der Karte 2 an der Pose `vegetation.K2#1`, je eine frische Sitzung; Akten
`vision/richter/leben.pflanzen.kraft.1.{ffb005db,9fba231b}-radeon.json`):

| Größe | main ffb005db | Kopf 9fba231b | Δ | Preis |
|---|---|---|---|---|
| VRAM nach zwei GC | 132,8 MB | **124,9 MB** | −7,9 | ≤ 118 — ROT |
| VRAM live (Spitze im Fenster) | 140,3 | 127,5 | −12,8 | |
| Heap nach GC | 371,9 | 369,2 | −2,7 | ≤ 400 |
| Heap live | 417,9 | 411,7 | −6,2 | ≤ 400 — ROT |
| Typed-Arrays (Halter-Zensus) | 129,8 | 120,9 | −8,9 | |
| Bild p95 | 58,33 ms (f 1,298) | 58,68 ms (f 1,389) | — | ungemessen unter Last (f außerhalb der Ruhe) |
| größtes Bild | 125,6 ms | 150,6 ms | — | dito (Schnitt 3) |
| `buf:?` | 30,86 MB | 0 | | Linse (a) |

Posten des Kopfs nach GC (Auszug): Geometrie-Arena 9,19 · Boden-Satz 4,32 · Fuchs 2,31 · Wolf 2,22 · Wesen 2,06 · Spieler 2,00 ·
Kamm-Krone 1,62 · Fern-Ring 1,27 · Bau-Satz 1,23 · Formationen 0,78 — Puffer zusammen ≈ 27,0 (main 30,86 ohne Namen); Kaskaden 1,88 +
6,92 + 6,46 (main 2,0 + 8 + 8); Panorama 0,94 (1,88); Punkt-Schatten 0,75 (1,5). Texturen −4,4 MB, Puffer −3,9 MB.

**Die Annahme fällt nicht:** 124,9 MB > 118, es fehlen 6,9 MB. Ursachen: (1) die Puffer gaben −3,9 statt der gerechneten −5,4 MB
für Normale und Farbe (der Rest der Gestalt-Ecken liegt in Lage, Stempel und verschränkter Ecke); (2) 1.4 Stempel, verschränkte Ecke und
`skinIndex`, 1.3 Anlage beim ersten Wurf und 1.5 Licht-Karte BC5 sind nicht gebaut (siehe ehrlich offen).

**Bildpaare** (Radeon, Werkbank im Spiel, identische Kamera je Pose aus dem Stand main, 960 × 540;
`artifacts/profiband/auge/w28-preis-ort/paar-<pose>.png`, oben main, unten Kopf; die Einzelbilder unter `main/` und `kopf/`):

| Pose (Leser) | Pixel > 8 Stufen | max | Luma main → Kopf |
|---|---|---|---|
| wiese-ego (Laub, Halm nah) | 2,23 % | 180 | 81,0 → 81,1 |
| wiese-third-mittag (Kaskaden 1.1) | 2,09 % | 110 | 83,3 → 83,3 |
| wiese-third-tief, Uhr 0,27 (Kaskaden 1.1) | 1,75 % | 217 | 74,5 → 74,5 |
| wiese-third-daemmerung, Uhr 0,76 (Panorama 1.2) | 0,05 % | 59 | 39,6 → 39,6 |
| genesis-ego (Ankunft) | 0,76 % | 59 | 108,2 → 108,2 |
| genesis-third (Tore, Bänke) | 0,61 % | 94 | 109,9 → 109,9 |
| dorf-ego (Haus, Mensch nah) | 2,23 % | 125 | 77,0 → 77,0 |
| dorf-nacht, Uhr 0,97 (Wurf-Tiefe 1.3) | 0,24 % | 33 | 42,1 → 42,2 |

Mein Urteil, selbst angesehen (wiese-ego, wiese-third-tief, dorf-ego, genesis-third): **nicht schlechter als main** — Laub, Halm,
Rinde, Haus, Haut und Schatten-Kanten stehen gleich, die Abweichungen sind Einzel-Pixel an Laub- und Halm-Kanten (zeitliche
Kantenglättung, Wind), das Luma-Mittel gleich bis 0,1. Nicht im Paar: der Glutbrunnen mit werfendem Feuer (das Nacht-Bild zeigt den Ort
ohne Wurf im Blick) und ein Wagen-Lack nah (headless Werk-Blick gt: 0,023 % der Pixel, Glanz-Lichter).
Headless vorab (swiftshader, Werk-Blick, gleiche Bühne): eiche 7 Pixel über 8 Stufen von 930 240 (max 19), gt 216 Pixel (max 84, Glanz-
Lichter des Lacks) — nicht schlechter.

**Ehrlich offen:**
- 1.4 Stempel je Gestalt (`aLodLevel`·`aH0`·`aH0L`): r184 kennt für ein Attribut der Größe 1 keine Halb- oder 8-Bit-Form (`BC`-Tafel des
  Vendors), je Gestalt hieße Uniform je Objekt oder Instanz-Schritt — die Arena und die Fassade (`_lodInstanceFacade`) teilen die
  Puffer der Quelle; ungebaut.
- 1.4 `skinIndex` u8: r184 weitet jedes nicht normierte 8/16-Bit-Attribut beim Anlegen auf 32 Bit (`createAttribute`: Uint16 → Uint32)
  — ohne Vendor-Eingriff nicht erreichbar; der Schnitt fällt aus der Tafel.
- 1.4 verschränkte Ecke 24 → 12 B: ungebaut (der Stoff `_jahrLage` liest die Mitte als Lage).
- 1.3 Anlage beim ersten Wurf: ungebaut (das Wachsen zerstört die gebundene Würfel-Tiefe sofort, `RenderTarget.setSize` → `dispose`;
  die Klasse „Destroyed texture [PointShadowDepthTexture]“, speicher-welten.js:3396) — Linse (c) entfällt mit ihr.
- 1.5 Licht-Karte in zwei BC5: ungebaut (Kodierer der Ablage).
- Bild p95 und größtes Bild beider Läufe stehen unter Last (f 1,30 / 1,39: die GPU war im Wechsel mit zwei Befund-Arbeitern und dem
  CI-echt-Job belegt) — kein Urteil.
- Keine Band-Ratsche bewegt: der Kopf liegt über der Ratsche vom 14.10. (112,5 MB), nach unten fällt nichts.

## Schnitt 2 — HEAP „der Speicher folgt dem Blick“ (Zweig w28-preis-ort, Kopf 1ca0611c, Basis ffb005db + Schnitt 1)

**Geschnitten** (Datei:Zeile am Kopf; Leser-Liste gelesen wie im Entscheid):
- N1 Das Render-Objekt stirbt mit seiner Geometrie: `stamm/stoff-instanz.js:2170` — das Register hängt an jedes Render-Objekt einen
  Geometrie-Hörer, der r184s Hörer ruft und, fällt die Geometrie, die das Objekt NOCH trägt, das Render-Objekt aus der Kette seines
  Renderers nimmt (nur wo die Kette genau dieses hält), aus dem Register und gelöst wie beim Abschied: `_renderObjektLoesen` (:2083,
  der Rumpf von `_renderObjekteLoesen`, nie `ro.dispose()` — die Pipeline bleibt im Cache). Getauscht am lebenden Objekt bleibt r184s
  Hörer allein (`setGeometry` zieht nach). Kein Rufer geflickt; die Kamm-Krone heilt am Register.
- N2 Die Saat geht mit ihrem Chunk: `stamm/gelaende-fern.js:67` `_saatGeht`, gerufen beim Abräumen des Rings (:57, nie beim Neubau
  eines Chunks): die Würfe des Felds (`_ausGesetz` UND `feldWurf`) im Gebiet fallen still, die Pflanz-Schlange verliert sie,
  `voxelPopulatedChunks` · `_saatOffen` · `_waldPflanzWarten` verlieren den Chunk (außer `worldMeta.feldStand`). `stamm/werkstatt-bauen.js:912`:
  der Abbau eines Feld-Wurfs sichert nicht (er stand nie im Stand; die Tat sichert ihr Rufer).
- N3 Der Knoten-Bau fällt mit seinem Stand: `stamm/bild-diaet.js:50` `_knotenBauEntkernen`, der EINE Ausgang
  `_createNodeBuilderState` (Bau am Stück wie in Raten); danach werfen die Felder `AnazhRealm.BAU_GRAPH` (:79, 36 Felder) laut
  „BAU ENTKERNT: <Feld>“; gerufen `stamm/dirigent-ankunft.js:263`; `gate:vendor-anker` pinnt Ausgang und Konstruktor. Der Spike: drei
  Sitzungen (Weg, Preis-Lauf, Bildpaare), 0 Würfe „BAU ENTKERNT“, 0 Brüche.
- Linse: `scripts/lib/draw-zaehler.cjs:648` `wegUrteil` (Preis je Pose ≤ 400, Ratsche je Pose, Zuwachs bis zur Rückkehr ≤ 5 MB/min,
  ROT beim Pfad des Halters), H8 `--weg <weg.json>` in `scripts/diag-profiband.cjs`, Ratsche `spec/profiband/weg-wiese-radeon.json`
  (der gemessene Kopf, Toleranz 10 = die Streuung zweier main-Fahrten 0,7–4,7 MB); Selbsttest je Naht ein Mutant rot beim Pfad
  (43/43). Gegen die Fahrt von main: 10 × ROT; gegen den Kopf GRÜN.

**Gemessen** (Radeon 890M, `--echt` 1920 × 1080).

Der Weg (`heap-weg.cjs`, EINE Sitzung, je Pose `/lauf` 30 s, dann zwei GC; Roh `artifacts/profiband/auge/w28-preis-ort/heap-weg-{main,kopf}/`):

| Pose | main 50564dea | Kopf e00c5cbd | Preis |
|---|---|---|---|
| Wiese | 383,7 | **254,4** | ≤ 400 |
| Wiese-Ost | 429,5 | **282,0** | |
| Dorf | 466,8 | **289,8** | |
| West | 491,1 | **286,7** | |
| Wiese zurück | 506,7 | **297,2** | |
| Zuwachs bis zur Rückkehr | +123,0 MB in 15,3 min = 8,1 MB/min | +42,8 MB in 18,0 min = 2,4 MB/min | ≤ 5 |
| VRAM nach GC (Wiese → zurück) | 132,6 → 125,0 | 125,0 → 121,2 | |
| Bäume `state.architectures` | 2 620 → 7 568 | 2 615 → 2 616 | |

Schnappschuss (Pfad-Zensus ab `window`): Licht-Wurf 46,6 + Nässe 38,7 + PMREM-Kontext 20,8 MB → nicht mehr unter den 40 größten
(N3); `state.scene` an der Rückkehr 132,0 → 81,4 MB, Render-Objekte gehalten 58,1 MB → unter den 40 größten Klassen nicht mehr
(N1); `state.architectures` an der Rückkehr 36,8 → 12,1 MB (N2). Gesamt 526,1 → 311,8 MB.

Preis-Lauf der Karte 2 an der Pose `vegetation.K2#1` (je eine frische Sitzung der Punkte-Maschine; Akten
`vision/richter/leben.pflanzen.kraft.1.{50564dea,1ca0611c}-radeon.json`; Richter beide GRÜN):

| Größe | main 50564dea | Kopf 1ca0611c | Preis |
|---|---|---|---|
| Heap live (Spitze im Fenster) | 413,6 | **297,2** | ≤ 400 — GRÜN |
| Heap nach zwei GC | 373,7 | **258,7** | |
| VRAM live | 135,9 | 132,9 | ≤ 118 — ROT (Schnitt 1) |
| VRAM nach zwei GC | 133,1 | 124,6 | |
| Typed (Renderer · Foundry-Cache) | 38,6 · 19,1 | 34,1 · 16,8 | |
| Bild p95 | 75,58 ms (f 1,926) | 65,67 ms (f 1,372) | ungemessen unter Last (f außerhalb der Ruhe) |
| größtes Bild | 192,52 ms | 133,59 ms | dito (Schnitt 3) |

**Die Annahme fällt:** gehaltener Heap ≤ 400 an jeder der fünf Lesungen (254–297 MB), Zuwachs 2,4 ≤ 5 MB/min, der Heap des
Preis-Laufs live 297,2 ≤ 400.

**Bildpaare** (Radeon, Werkbank `--echt` 1920 × 1080, identische Kamera je Pose aus `kam2.txt` = die Kameras von Schnitt 1, je EINE
Sitzung main 50564dea und Kopf 1ca0611c mit derselben Folge Wiese → Genesis → Dorf → West → Wiese; oben main, unten Kopf;
`artifacts/profiband/auge/w28-preis-ort/s2-paar-<pose>.png`, Einzelbilder unter `s2/main/` und `s2/kopf/`):

| Pose | Pixel > 8 Stufen | Luma main → Kopf | Urteil |
|---|---|---|---|
| wiese-ego | 2,39 % | 81,5 → 81,5 | gleich (Halm-Kanten, Wind) |
| wiese-third-mittag | 2,24 % | 83,8 → 83,8 | gleich |
| rueck-wiese-ego (nach Dorf und West) | 4,74 % | 81,7 → 81,4 | gleich: dieselben Bäume, derselbe Stein, kein Loch |
| rueck-wiese-third (die Pose des Entscheids) | 7,36 % | 84,0 → 83,0 | gleich: Kronen und Stämme stehen an ihrem Ort; die Abweichung sind Laub im Wind und die Nah-Wiese |
| dorf-ego | 5,71 % | 78,0 → 77,1 | gleich (Haus, Weg, Schatten); ein anderer Bewohner geht nah vor der Kamera — Leben, kein Bestand |
| genesis-ego / genesis-third (Folge) | 3,73 / 3,80 % | 108,1 → 106,4 | im Paar der Folge fehlen am Kopf die Membranen der Tore |
| genesis-ego nachgeschossen | 1,48 % | 108,1 → 108,0 | gleich, Membranen stehen (`s2-paar-genesis-ego-nachgeschossen.png`) |

Die fehlenden Membranen habe ich nachgemessen, bevor ich urteilte: dieselbe Kamera am Kopf in drei Sitzungen (N3 aus zur Laufzeit,
N3 an mit Spion auf jedes entkernte Feld, N3 an unverändert) zeigt alle drei Membranen gleich (Luma im Fenster des mittleren Tors
85,6 / 85,6 / 85,6), der Spion zählt 0 Lesungen eines entkernten Felds. Es ist das Rennen „das Fenster wartet auf sein Ziel“
(dirigent-takt.js:663, `_tickPortalMembranes`): der Schuss kam vor dem Ziel-Bild, wie es dort für zwei Zweige schon steht.
Rückkehr am Kopf gegen den Anfang am Kopf (`s2-rueckkehr-kopf-wiese-{ego,third}.png`): 2,63 / 5,42 %, Luma 81,5 → 81,4 / 83,8 → 83,0.
**Mein Urteil: nicht schlechter als main.**

**Ehrlich offen:**
- Der Rest des Wegs an der Rückkehr (+42,8 MB, 2,4 MB/min): Tiere (+7,6 MB Typed, 20 Tiere, lebende Menge), Hydro-Kacheln (4,7 → 11,0 MB
  nach dem Schnappschuss; N2 Hydro ungebaut: das Wasser-Band ist global — `_computeHydroBand` liest jede Kachel, ein Räumen nach
  Abstand verschiebt die Schwellen jedes Chunks; ungemessen), Wald-Gedächtnisse (`_forestDartMemo` 1 959 → 7 545 Zellen,
  `scatterLookup`, `_freistandMemo`, `scatterPromoted`, `lifeField`: N2 Gedächtnisse ungebaut), Foundry-Cache +3,3 MB (LRU).
- Die Bauer (`WGSLNodeBuilder`) leben weiter als entkernte Hüllen (59 an der Rückkehr, 9,0 MB gehalten statt 18,5).
- Zusatz 3 „Ferne … reading 'length'“ (gelaende.K2#1, GTX): nicht nachgestellt, nicht gefällt. Gelesen: der Wurf kommt aus der Probe
  `wasserDamm` (scripts/lib/wasser-linse.cjs:955–957 liest `st.worldMeta.voxelEdits.length`; nach dem Zurücksetzen der Welt ohne Edits
  löscht speicher-laden.js:149 die Liste, und schlägt der `voxel_fill` fehl, wirft `ed.length`) — Verdacht ohne Lauf.
- Zusatz 3 Jahreszeiten-Wechsel (Heap-Spitze 883,7 MB ohne GC, ~460 MB Müll): nicht angefasst (der Umbau liegt in
  `stamm/vegetation-*`, die der Koordinator für diesen Baum sperrte).
- Bild p95 und größtes Bild beider Preis-Läufe unter Last (f 1,926 / 1,372) — kein Urteil; GTX ungemessen.
- `stamm/stoff-instanz.js` (Zusatz 5 nennt die Datei für die GPU-Zeit): N1 steht dort am Register, wie der Entscheid es setzt — ein
  Merge mit w28-baum-schirm trifft dieselbe Datei.

Geschnitten: N1 · N2 (Bestand, Pflanzung, Schlange) · N3 und die Weg-Linse H8. Gemessen: Heap nach GC an der Rückkehr 506,7 → 297,2 MB,
Zuwachs 8,1 → 2,4 MB/min, Preis-Lauf Heap live 413,6 → 297,2 MB. Offen: Hydro, Gedächtnisse, Ferne-Wurf, Jahreszeit; VRAM bleibt ROT (Schnitt 1).
Status: ZWISCHENSTAND

## Schnitt 3 — das größte Bild (Zweig w28-preis-ort, Kopf 72561da7 + Wanduhr-Tafel cab90667, Basis 1ca0611c = Schnitt 2)

**Geschnitten** (Datei:Zeile am Kopf):
- Der Vorbau der Bedienung ist ein Bauer der EINEN Frist: der Ruf nach dem Bild fiel (`stamm/dirigent-takt.js` Loop), er geht im Planer
  durch `_bauer("vorbau")` (`_runFrameScheduler`, `TAKT_BAUER.vorbau`), nach der Frist nur als Pflicht-Stück — und nur im Zwischen-Takt
  (`_vorbauDran`, im Bild-Takt erst nach `VORBAU_BILD_HUNGER` 60 Bild-Takten in Folge).
- Das Tuch-Gitter rechnet der Voxel-Faden: `stamm/koerper-fahrt.js` `_tuchGitterFaden` (derselbe Kern `tuchGitter`, Felder als Kopien per
  Transfer), `voxel-worker.js` `tuch-gitter` (koerper-core spät aus der EINEN Quelle, `FADEN_QUELLE.spaet.koerper`), Antwort in
  `stamm/gelaende-chunks.js` `tuch-gitter-result`; fällt der Faden, laut über `_stoffBruch`, der Vorbau geht weiter.
- Rezeptbuch je Bauplan ein Stück: `stamm/werkstatt-hof.js` `_rezeptBau(bis)` (EIN Bau, `renderRecipeBook` = am Stück); Werkstatt je Teil:
  `stamm/werkstatt-vorschau.js` `_werkstattBau(bis)` / `_werkstattSchwanz`; `_uiVorbau` (`stamm/werkstatt-hud.js`) geht Buch · Habe · Werte
  · Werkstatt je Stück bis `_bauFrist("vorbau")`.
- Die Tod-Lage auch im Takt: `stamm/kreatur-leben.js` `_todLageTakt` / `_todLageGang` als Bauer `todLage` der EINEN Frist.
- Der Zähler der Akte (koordination 4ba729e1, `vision/richter-akte.cjs` `SPRUNG_S`): Zusatz 1 — Bild p95 und größtes Bild urteilen die
  Bilder nach der festen Spanne von 5 s ab dem ersten Bild der Probe, die Spanne steht als Lesewert (`einlauf`); Selbsttest 16/16.
- Linse: `gate:takt` T15 (`scripts/diag-takt.cjs`) — 12 echte Takte, jeder Ruf des Vorbaus nennt sein Tor; Rezeptbuch 364 und Werkstatt 9
  Stücke bei abgelaufener Frist; im Bild-Takt 0/30, im Zwischen-Takt 1/1. Selbsttest je Täter ROT (Vorbau neben dem Tor 12 von 24, Buch
  und Werkstatt am Stück, Vorbau in jedem Takt 30/30). Wanduhr-Tafel `spec/uhr/geraetezeit.json` nennt die drei neuen Leser (Anlass „frist“).

**Gemessen** (Radeon 890M, `--echt` 1920 × 1080, `r._schirm()` 1920 × 1080).

Preis-Lauf der Karte 2 an `vegetation.K2#1`, je eine frische Sitzung, alle vier mit DEMSELBEN Zähler (Spanne 5 s; Akten
`vision/richter/leben.pflanzen.kraft.1.<sha8>-radeon.json`, Richter überall GRÜN):

| Größe | main 50564dea | Eltern 1ca0611c | Kopf a 94f2e615 | **Kopf 72561da7** | Preis |
|---|---|---|---|---|---|
| größtes Bild nach der Spanne | 167,3 ms | 167,4 | 125,6 | **100,2** | ≤ 100 |
| Bilder über 100 ms nach der Spanne | 10 | 7 | 1 | **2** (100,2 · 100,2, Takt 14 / 19 ms: GPU-Leine) | 0 |
| größtes Bild der Spanne (Lesewert) | 125,7 | 133,8 | 92,5 | 217,8 | eigenes Soll |
| Bild p95 | 83,62 | 76,73 | 58,67 | 75,24 | ≤ 33 |
| Referenz f | 2,04 | 2,553 | 1,422 | 1,745 | Band |
| Heap live / nach GC | 421,6 / 372,1 | 317,3 / 258,0 | 290,2 / 257,1 | 380,5 / 255,4 | ≤ 400 |
| VRAM live / nach GC | 140,1 / 132,6 | 132,5 / 125,2 | 133,0 / 124,7 | 133,4 / 123,0 | ≤ 118 |

Alle vier unter Last (f außerhalb der Ruhe: zwei Fremd-Agenten am Schloss, Stationen der Radeon) — Zeit-Zahlen UNGEMESSEN unter Last.
Die großen CPU-Takte (main 122 und 118 ms Takt) fehlen am Kopf; was bleibt, sind Bilder der GPU-Leine bei 14–19 ms Takt.

Hänger-Linse stehend 60 s nach 10 s Einlauf (`haenger 60 --ein 10`, Regler voll, Tiere frei; Roh `artifacts/profiband/auge/w28-preis-ort/s3/<stand>/`):

| Ort | main 50564dea | Kopf a 94f2e615 | **Kopf 72561da7** |
|---|---|---|---|
| Wiese | 23 über 100 ms, max 175,6 | 10, max 133,8 | **10, max 117,1** |
| Genesis | 0, max 83,7 | 0, max 75,6 | **0, max 75,6** |
| Dorf | 2, max 175,7 (GC 176, Tod-Lage 159) | 5, max 150,4 (Tod-Lage ×4) | **1, max 419,2 (Tod-Lage)** |

Ehrlich zur Bedingung: der Hänger der main-Wiese lief etwa eine Minute neben meinem eigenen Lint-Lauf (CPU) — er steht damit zu
schwer; die Kopf-Läufe liefen ohne ihn.

**Bildpaare** (Werkbank `--echt`, identische Kamera aus den Posen von Schnitt 2, Uhr 0,5; oben main 50564dea, unten Kopf 72561da7;
`artifacts/profiband/auge/w28-preis-ort/s3-paar-{wiese-ego,genesis-ego,dorf-ego}.png`, Einzelbilder `s3/main/`, `s3/kopf2/`):

| Pose | Pixel > 8 Stufen | Luma main → Kopf | Urteil |
|---|---|---|---|
| wiese-ego | 2,80 % | 81,2 → 81,2 | gleich (Halm- und Laub-Kanten im Wind) |
| genesis-ego (Ankunft) | 0,88 % | 108,1 → 108,1 | gleich, Membranen stehen |
| dorf-ego | 5,47 % | 77,9 → 77,0 | gleich an Haus, Boden, Schatten; die Bewohner gehen anders (Leben, kein Bestand) |

Mein Urteil, selbst angesehen: **nicht schlechter als main.**

**Die Annahme fällt nicht:** größtes Bild 100,2 ms > 100 im Preis-Lauf (Ursache: GPU-Leine unter Last f 1,745, kein CPU-Takt), Hänger
Wiese 10 Bilder über 100 ms, Dorf 1 zu 419 ms.

**Ehrlich offen:**
- Das Auslegen einer verborgenen Schublade (`_uiVorbau`, erzwungenes Layout, 70–80 ms Selbstzeit) und das Werte-Feld der Werkstatt
  (`_workshopRenderStatsPanel`, ~65 ms, `_teilVolumen`) sind je EIN unteilbares Stück: im Zwischen-Takt 108–109 ms Bild statt 118–134.
- Die Tod-Lage (`_todLageFrist`, Fall nach `TOD_LAGE.vorlaufSec` 0,2 s): der Bauer `todLage` trägt in 0,2 s zu wenig Winkel, die Frist
  rechnet den Rest in einem Takt — Dorf 419 ms. Das Gesetz der Ereignis-Zeit hält sie; ungebaut ist eine Tafel, die in 0,2 s steht.
- Gast-Knoten-Bau 100–109 ms (ein Fluss-Knoten am Stück, Vendor) und `computeBoundingSphere` 109–117 ms im ersten Projizieren einer
  Geometrie ohne Kugel (Täter-Geometrie ungelesen).
- GTX ungemessen: `dorfWaechst` 1 166 ms außer dem Takt, das erste Bild 433 ms, der Wechsel der Jahreszeit (Zusatz 3) — Täter ungelesen.
- Bild p95 aller Läufe unter Last; VRAM nach GC 123,0 > 118 (Schnitt 1).

Geschnitten: Vorbau als Bauer der EINEN Frist im Zwischen-Takt, Tuch-Gitter im Faden, Rezeptbuch und Werkstatt je Stück, Tod-Lage im
Takt, Akte mit fester Sprung-Spanne, Linse T15. Gemessen: größtes Bild im Preis-Lauf 167,3 → 100,2 ms, Bilder über 100 ms 10 → 2, Hänger
Wiese 23 → 10 (max 175,6 → 117,1). Offen: Schublade/Werte-Feld als unteilbare Stücke, Tod-Lage 419 ms, Gast-Knoten, GTX-Täter.
Status: ZWISCHENSTAND

## Heilung und Stand (15.11., Zweig w28-preis-ort, Kopf 8ddf3de9; Gegner Bild · Speicher · Gesetz)

Gemessen auf der Radeon 890M, `--echt` 1920 × 1080, je Stand EINE frische Sitzung, dieselbe Fahrt (Wiese → Dorf → West → Wiese, dann
Pendeln ±8 m und ±90 m an der Chunk-Grenze x = −302,4); Roh unter `artifacts/profiband/auge/w28-preis-ort/heilung/`
(`nachher-echt/`, `main-echt/`, `paar-*/`, `geo-vorher/`). Bestand = jeder Eintrag in `state.architectures` binnen 150 m der Wiese.

| Fund | Stand | Schnitt / Grund | Zahl |
|---|---|---|---|
| Bild F1 = Speicher F5 (die Rückkehr zeigt einen anderen Wald) | **halb geheilt** | Die Probe der Saat liest keine Marke mehr (`stamm/vegetation-baum.js` `_vegetationSampleSpawn`), die Gedächtnisse gehen mit dem Chunk (`_saatGedaechtnisGeht`) | Bestand Boot ↔ Rückkehr am Kopf **0 weg · 0 neu** (Gegner 6 Glutbrunnen weg, 7 Bäume neu); ein Headless-Lauf desselben Kopfs zeigte dieselben 6/7 — Ursache ungeklärt. **Offen:** das Bildpaar `rand-ost` am Kopf weicht nach der Rückkehr um 5,46 % der Pixel ab (main 1,30 %): eine Birke fehlt, ein Stamm steht neu — nicht im Bestand, also die Deko-Streu, die die Marke liest (`stamm/vegetation-streu.js:611`, ungelesen) |
| Speicher F1 (der Heap wächst mit dem Weg) | **offen** | Die Halter der Saat fallen, der Rest nicht: Dorf, Hydro-Kacheln, Tiere, Foundry-Cache (ungeschnitten) | Weg-Fahrt nach GC: main 383,5 → 502,3 MB (+118,8 in 3,5 min = 34,3 MB/min), Kopf 254,8 → 308,4 MB (+53,6 in 3,4 min = 15,6 MB/min) — Preis ≤ 5 |
| Speicher F2 (`_trittSchwach` wächst mit dem Weg) | **geheilt** | Fällt mit dem Chunk aus dem Saum (`_saatGedaechtnisGeht`), Linse T16 | Weg-Fahrt: main 1 478 → 7 499 Einträge, Kopf 1 362 → 2 626 |
| Speicher F3 (Wald-Gedächtnisse wachsen) | **geheilt für Marke, Lookup, Freistand, Dart-Gedächtnis, Pegel; offen `lifeField`, `hydroTiles`** | Fallen mit dem Chunk; das Lebensfeld ist Weltzustand mit Zerfall, die Hydro-Kacheln tragen das globale Wasser-Band (Schnitt 2) | Marken main 1 028 → 2 238, Kopf 1 028 → 1 031; Lookup main 2 385 → 5 467, Kopf 2 375 → 2 379 |
| Speicher F4 (der Abschied der Saat liegt außerhalb der Frist) | **geheilt am Mechanismus, ungemessen am Bild** | `_saatGeht` / `_saatGehtZuEnde`: Würfe fallen in Raten unter `_bauFrist("abraeumen")`, je Takt mindestens `SAAT_GEHT_MIN` 4 | T16: nach abgelaufener Frist 4 · 4 · 4 Abbauten je Takt (alte Klasse 12 am Stück); das Bild beim Teleport ist nicht neu gemessen |
| Speicher F6 (Pendeln reißt die Saat ab) | **geheilt für ±8 m, offen für ±90 m** | Der Saum der Saat = Boden ODER Ring + 2 um den Spieler | ±8 m: 0 Abbauten am Kopf (Gegner 115 Chunks, 320 Würfe); ±90 m bei 40 m/s: 2 071 Abbauten, 233 Chunks neu gesät (der Saum reicht 2 Chunks) |
| Speicher F7 (`renderer.info.memory.geometries` steigt) | **als Halter nicht bestätigt** | Der Stamm nimmt r184 den Hörer (`stamm/stoff-instanz.js:2203`); die Zählung zählt jede nie entsorgte Geometrie, auch eingesammelte | Weg-Fahrt: 480 gezeichnete Geometrien, 37 entsorgt, **248 vom GC eingesammelt**, 195 leben (63 in der Szene, 132 außerhalb, Boot 119) — die Zahl 445 zählt Müll; +13 lebende außerhalb der Szene, Halter ungelesen |
| Gesetz F1 (Toleranz 10 > Streuung 4,7) | **geheilt** | `spec/profiband/weg-wiese-radeon.json` Toleranz 4,7 MB (fällt nach unten) | Mutante +5 MB/Pose 0 → 5 ROT, +9 MB 0 → 5 ROT |
| Gesetz F2 (H8 ohne Leser, Erzeuger außer Repo) | **halb geheilt** | Der Erzeuger ist `werkbank weg` (Posen und Orte aus der Ratsche, Urteil H8 im Befehl) | Kopf e00c5cbd GRÜN, main 50564dea ROT 8,1 MB/min; **offen** die Station im Zug (eine Radeon-Station ~18 min, das Register führt der Koordinator) |
| Gesetz F3 (Nähte ohne Linse) | **halb geheilt** | `gate:takt` T16 (N2: Saum, Raten, Gedächtnis, Probe ohne Marke, je Täter rot) und T17 (Tuch-Gitter im Faden = Haupt-Faden) | T17 87 Felder Byte-gleich, Mutante ohne Normale ROT; **offen** N1 und N3: beide brauchen einen WebGPU-Renderer, die Welt von gate:takt ist Null-Renderer |
| Gesetz F4 (der Sprung hat kein Soll) | **als Bruch der Akte nicht bestätigt, als Wortlaut des Berichts bestätigt** | Das Soll des Zusatzes 1 ist die feste Spanne ≤ 5 s (`SPRUNG_S`), nie eine Bild-Zahl in ihr; Schnitt 3 nannte „eigenes Soll“ in der Spalte Preis, das war falsch | Größtes Bild der Spanne (Lesewert): main a6555b12 92,1 ms, Kopf 184,1 ms — der Sprung des Kopfs ist schwerer, Täter ungelesen |
| Gesetz F5 (Akten überschreiben sich) | **geheilt** | `vision/richter-akte.cjs` `schreibe`: eine zweite Fahrt desselben SHA tritt an die Folge (buche-2 liest je Gerät die jüngste); 50564dea und 1ca0611c tragen Schnitt 2 UND 3 | Selbsttest 17/17, Mutante überschreibt ROT |

**End-Tafel** (Preis-Lauf der Karte 2 an `vegetation.K2#1`, Radeon, je eine Sitzung der Punkte-Maschine; Akten
`vision/richter/leben.pflanzen.kraft.1.{a6555b12,8ddf3de9}-radeon.json`; Wachstum aus der Weg-Fahrt oben):

| Größe | main a6555b12 | Kopf 8ddf3de9 | Soll |
|---|---|---|---|
| Bild p95 | 58,59 ms (f 1,30) | 58,68 ms (f 1,24) | ≤ 33 — ROT (beide unter Last, f außerhalb der Ruhe) |
| größtes Bild (nach der Spanne) | 183,91 ms | 108,4 ms | ≤ 100 — ROT |
| Heap nach GC | 398,4 MB (live 441,7) | **256,5 MB** (live 293,8) | ≤ 400 — GRÜN |
| VRAM nach GC | 132,3 MB (live 140,5) | 125,0 MB (live 133,3) | ≤ 118 — ROT |
| Wachstum (Weg-Fahrt, nach GC) | 34,3 MB/min | 15,6 MB/min | ≤ 5 — ROT |

**Bildpaare für den Koordinator** (Radeon `--echt` 1920 × 1080, Uhr 0,5, oben das erste, unten das zweite Bild;
`artifacts/profiband/auge/w28-preis-ort/`):
- `heilung-paar-boot-wiese-nord.png` — Boot main ↔ Kopf: 0,51 % Pixel > 24, Luma 83,6 → 83,6 (die Probe ohne Marke ändert den Boot nicht sichtbar).
- `heilung-paar-boot-rand-ost.png` — Boot main ↔ Kopf: 0,52 %, Luma 48,1 → 48,1.
- `heilung-rueckkehr-kopf-wiese-nord.png` — Kopf Boot ↔ Rückkehr: 0,04 % (main 0,49 %).
- `heilung-rueckkehr-kopf-rand-ost.png` — Kopf Boot ↔ Rückkehr: **5,46 %** (main 1,30 %): die Deko-Streu kehrt anders zurück (offen, siehe Bild F1).
- Die Kamera `glut-sw` stand in einer Eiche (Abnahme ROT, an beiden Ständen), kein Urteil.

Der Preis des Orts hält an der Radeon in einer von fünf Zahlen (Heap nach GC 256,5 MB); es fehlen Bild p95 (58,7 > 33 ms, unter Last f 1,24),
größtes Bild (108,4 > 100 ms), VRAM nach GC (125,0 > 118 MB) und Wachstum (15,6 > 5 MB/min).

Geschnitten: der Saum der Saat, ihr Abschied in Raten, ihre Gedächtnisse mit dem Chunk, die Probe ohne Marke, die Weg-Ratsche auf 4,7 MB, die
Akte als Folge, `werkbank weg`, T16 und T17. Gemessen: Bestand nach der Rückkehr 6/7 → 0/0, Pendeln ±8 m 0 Abbauten, Heap nach GC main
398,4 → Kopf 256,5 MB, Wachstum 34,3 → 15,6 MB/min. Offen: die Deko-Streu der Rückkehr (5,46 %), das Wachstum, VRAM, Bild p95 und größtes Bild,
N1/N3-Linse, die Zug-Station von H8, der Sprung des Kopfs 184 ms.
Status: ZWISCHENSTAND
