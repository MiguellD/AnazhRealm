# flut-aue — Vorprüfung 1 (Sprosse `planet.wetter.extreme#1`)

ZWISCHENSTAND. Geschnitten: Der Deckel an der Krone fiel (main `gelaende-core.js:1630`, `pegelHubVon` klemmte den Hub auf die Krone). Der Regen kennt jetzt seine Extreme aus dem Klima: eine POT-Poisson-Lage mit GEV-Tiefe (`WETTER_LAGE`, `phyto-core.js:4819`, `lageAm` 4847, `wetterAt` 4869), deterministisch aus der Saat und im Kalender des Wirts. Der Überschuss über der Krone steht als HAND-Flut `flutAm` (`gelaende-core.js:7629`) in der Aue; `atlasSpiegel` trägt sie im Land (8015), und Stamm wie Faden zeichnen sie aus EINEM Kern (Quelle `colSrc` am Boden ∞, Trocken-Tor `kanalImFenster` 7210). Gemessen am Bach der Mess-Wiese (−258,4 | −1132,8): regenMax 14,72 → 144 mm (x100 16,3 → 113,8 mm), über der Aue 0 → 1,64 m, gezeichnet 24 → 60 von 60 Proben quer zum Lauf, einen Tag danach 2 = 2 (die Flut fällt). Karte 2 gebucht 58 von 1 718 — die Sprosse bleibt stehen, bis das Bildpaar auf der GPU steht.

- **Wurzel:**
  - main `gelaende-core.js:1630` — `Math.min(krone, h)` in `pegelHubVon`: der Fluss verließ das Bett nie.
  - main `phyto-core.js:4804` — `wetterAt` ohne Lage: der stärkste Regen in 100 Jahren lag bei 14,72 mm.
- **Gesetz heute:**
  - Abfluss: `scsAbfluss` 1625 → `pegelHubVon` 1657 ohne Deckel → doppeltes Profil über der Krone (Aue 10, rauh 0,7).
  - Die Tafel trägt `flut`; `flutAm` liest sie, `atlasSpiegel` gibt sie aus.
  - Stamm (`stamm/wasser-hydro.js` `_pegelTakt`) markiert in der Flut auch trockene Chunks.
  - Das Trocken-Tor in `stamm/wasser-zellen.js` und `voxel-worker.js` ruft `G.kanalImFenster`; vorher waren es zwei Schleifen.
- **Zahlen main → head:**
  - regenMax 14,72 → 144 mm.
  - Über der Aue 0 → 1,64 m.
  - Nasse Proben im Gesetz 2 → 60 von 60.
  - Gezeichnete Wasser-Zellen des Fadens 24 → 60 von 60.
- **Linse:**
  - `gate:wasser-leben` P6 (Probe `__wasserFlut`, `scripts/lib/wasser-linse.cjs:838`).
  - Täter: „P6 FLUT: der Fluss verlässt das Bett nie (pegelHubVon · flutAm)".
  - ROT auf main (P6 REGEN + P6 FLUT), GRÜN auf head, 13 s.
  - Selbsttest: P6 REGEN · FLUT · STEHT · LEER ×2 sowie P4 `see`.
  - Konsum-Leser: `_atlasWaterLevelAt` → `atlasSpiegel` · `flutAm` in Stamm und Faden.
- **Wände:**
  - GRÜN: `gate:worker-dichte`, `npm run check`, `npm run stamm:lint`, `diag-atlas --check`.
  - `gate:asset-contract` 128 von 128 byte-gleich, also kein Vertrags-Akt; §9 von `docs/studio-vertrag.md` nennt `flutAm`.
  - K10 LEER ×2 ist auf main schon rot.
- **head:** der Commit `Vorprüfung flut-aue 1` auf `flut-aue`, der diese Datei trägt (Basis `60edf948557226de3c156844a5d4cda4231e7d99`); die sha40 steht im Bericht des Laufs.
- **Ehrlich offen:**
  - Das Bildpaar: WebGPU verliert im Container das Gerät, auch `diag-blick` selbst. Der Beweis ist hier die Null-Renderer-Konsum-Probe der Faden-Zellen.
  - Bankfull ≈ 1,6 MQ: jede Lage und ein 20-min-Sturm heben den Bach (2,4 m).
  - Der See steigt in der Schmelze 1,05 m (vorher hielt ihn der Deckel bei 0,2 m).
  - Keine Retention der Aue, kein Rückstau an der Mündung.
  - Die Flut-Kosten in ms je Chunk sind ungemessen.
  - Der Stations-Leser `__gelaendeCore.flutAm(r._gelaende(), x, z).ueberAue` ist unverdrahtet.
