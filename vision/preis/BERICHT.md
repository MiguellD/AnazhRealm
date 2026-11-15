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
