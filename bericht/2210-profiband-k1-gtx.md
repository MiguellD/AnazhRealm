# Bericht 2210 Profiband K1 „Flüssig in Bewegung“, GTX-Hälfte: Staffel 1 reißt in Fahrt und Sturm, Gehen und Sprint halten

**Aufbau**
- Kopf main f3865c80 (n2010-b2b, sauber vor und nach der Serie).
- GTX 1060, `start --echt`, 1920×1080, Regler voll, Tiere frei, Dorf-Zug aus.
- Je Zelle 2 frische Boots. Jeder Boot schwingt ein (`lauf 30 --ein 20 --ruhe 300`), dann startet die Bewegung der Zelle.
- Gemessen wird `werkbank lauf 30 --ein 2 --regler voll --tiere frei` IN der Bewegung.
- Wo Frame p95 > 33 ms liegt, zerlegt derselbe Boot `takt 20 --ein 2`, während die Bewegung weiterläuft.
- Schloss je Boot, Nachtruhe.

**Staffel 1:** Frame p95 ≤ 33 ms in jeder Zelle.
- GTX: **ROT in zwei von fünf messbaren Zellen** (GT-Fahrt, Sturm).
- Die sechste Zelle (stadt) hat kein Werkzeug.

## Zellen (je Boot, ms)

| Zelle | Boot | fps | Frame p50 / **p95** / p99 | CPU-Takt p50 / **p95** | Belegung p50 / p95 | GPU p95 | Dreiecke Mittel | Staffel 1 |
|---|---|---|---|---|---|---|---|---|
| Gehen Wiese Ego (4 m/s) | 1 | 61,7 | 16,6 / **25,1** / 33,4 | 10,5 / **19,1** | 14,5 / 22,2 | 2,51 | 326k | grün |
|  | 2 | 62,1 | 16,6 / **25,1** / 33,5 | 10,4 / **17,9** | 14,5 / 21,7 | 2,52 | 326k | grün |
| Gehen Genesis Third (4 m/s) | 1 | 64,9 | 16,6 / **25,1** / 33,4 | 10,8 / **19,4** | 14,1 / 22,1 | 2,22 | 389k | grün |
|  | 2 | 64,6 | 16,6 / **25,1** / 33,4 | 11,2 / **19,1** | 14,2 / 21,8 | 2,18 | 388k | grün |
| Sprint Wiese Ego (sprintSpeed) | 1 | 59,5 | 16,7 / **25,1** / 41,6 | 11,2 / **20,2** | 15,3 / 24,7 | 2,51 | 329k | grün |
|  | 2 | 59,2 | 16,7 / **25,1** / 41,6 | 11,5 / **22,1** | 15,5 / 25,3 | 2,54 | 330k | grün |
| GT-Fahrt Wiese, Third ↔ Ego | 1 | 50,1 | 16,7 / **33,5** / 58,3 | 15,7 / **34,5** | 17,4 / 36,7 | 2,41 | 366k | **ROT** |
|  | 2 | 50,7 | 16,7 / **33,4** / 50,1 | 14,7 / **33,0** | 17,0 / 34,8 | 2,66 | 373k | **ROT** |
| Sturm + 50 Tiere, Wiese Ego, gehend | 1 | 41,4 | 24,9 / **41,6** / 58,3 | 20,9 / **36,7** | 21,8 / 38,4 | 2,48 | 735k | **ROT** |
|  | 2 | 47,4 | 16,7 / **33,3** / 49,9 | 18,9 / **30,1** | 19,7 / 31,4 | 2,34 | 728k | **ROT** |
|  | z1 | 46,9 | 16,8 / **33,4** / 50,1 | 18,8 / **29,7** | – / 31,1 | 2,38 | 702k | **ROT** |
|  | z2 | 42,1 | 24,9 / **33,5** / 58,3 | 21,0 / **35,0** | – / 36,5 | 2,50 | 745k | **ROT** |
| Messort stadt (nH ≥ 120, Dorf-Zug an), gehend | – | – | **Werkzeug fehlt** | | | | | – |

**Wie die Zellen bewegt wurden** (Prüfzahlen nach dem Lauf, je Boot):
- **Gehen und Sprint:** Bodengeher (`geher.js`) auf dem Wegnetz; 128–165 m je 30 s, Abweichung 0.
  - Sprint ging mit `state.sprintSpeed`, 165 m in 30 s.
- **Fahrt:** GT bestiegen, Ziel 8–12 m/s, Third ↔ Ego je 120 Takte.
  - Boot 1: 233 m, v50 9,9, 56 % der Takte in 8–12 m/s, 9 Wechsel, Ego-Anteil 0,38.
  - Boot 2: 196 m, v50 4,8, 41 % in 8–12 m/s, 6 Wechsel, Ego-Anteil 0,41. Der Wagen stand länger, Frame p95 trotzdem 33,4.
- **Sturm:** Das Spieler-Wort „stormy“ hält jede Bühne (`__buehne`-Hülle). Nexus und Regeln versuchten mehrmals, auf „rainy“ zu wechseln; das Wetterbuch zeigt jeden Versuch als `verweigert`.
  - Dazu kamen 50 Tiere frei im Ring 15–60 m um den Spieler (`spawnCreatureAt`, Kappe angehoben), insgesamt 59–61 Tiere.
  - Ohne Sturm zählt die Wiese 9–11 Tiere.

**Das 60-Hz-Raster:**
- VSync ist an, also liegt Frame p95 auf dem Raster: 25,1 = 1,5 Intervalle, 33,3–33,5 = 2 Intervalle.
- Die Schwelle 33 ms liegt direkt unter dem 2-Intervall-Strich. Jede Zelle, in der ≥ 5 % der Bilder zwei Intervalle brauchen, ist ROT.
- Fahrt und Sturm-Boot 2/z1/z2 stehen genau dort (33,3–33,5). Der echte Druck zeigt sich am CPU-Takt p95 von 29,7–36,7.
- Die GPU ist in keiner Zelle der Engpass: GPU p95 2,2–2,7 ms je Bild, die Frame-Zeit ist CPU-Takt.

## Zerlegung beim Namen (`takt 20`, Spitze = Mittel der Takte ab p95 / Mitte = p50, ms je Takt; je Zelle 2 Boots)

### GT-Fahrt (fahrt-1 / fahrt-2): CPU-Takt p95 35,4 / 28,2, max 139 / 86
- **Wurzeln** (Spitze · Mitte):
  - `renderer._renderScene`: 18,3 · 8,7 / 13,7 · 9,1
  - `_loopVoxelStreaming`: 17,6 · 4,1 / 15,1 · 4,3
  - `_loopAutoSave`: 4,7 · 0 / 3,2 · 0
- **Spitzen-Täter, in beiden Boots gleich** (Linse ROT):
  - `_finalizeVoxelChunkBuild › _applyCrossLodGeomorph`: 3,29 / 3,23 ms. Darunter `_rebuildLodStitchBand`: 1,52 / 1,24.
  - `_fernRingHoch › computeVertexNormals` (three.core): 2,46 / 2,62 ms, dazu `fromBufferAttribute`: 1,43 / 1,19.
  - `zeichne › P.createBuffer` (Neu-Puffer im Bild): 1,83 / 1,02.
  - `_loopAutoSave › saveToProjectFolder`: 1,52 / 1,06. Dazu `saveState` 1,09 und `buildStateSnapshot › _ueberGrund › _voxelSurfaceY` 1,41 / 1,02.
- **Im Bild selbst** (`_passSicht`, Spitze 8,7 / 7,1):
  - `_chunkSatzPass › _hoehlenSicht › _hoehlenSichtLicht`: 2,72 · 1,61 (Boot 1).
  - `_instanzWahlPass › _arenaTakt › _ordnen › bauen` (die Arena ordnet im Fahrtakt neu): 1,10 · 0,01 (Boot 1), 1,09 Arena-Takt (Boot 2).
- **Lesart:** Die Fahrt zieht mit ~10 m/s neue Chunks in den Ring. Je neuer Chunk zahlen derselbe Takt den Geomorph der LOD-Naht, die Normalen des Fernrings, den Puffer-Upload und der Autosave-Snapshot.
  - Das Streaming steht im Mittel nur bei 4 ms; die Spitze sind die Fertigstellungen.

### Sturm + 50 Tiere (sturmz-1 / sturmz-2): CPU-Takt p50 20,7 / 22,0, p95 29,0 / 31,0
- **Wurzeln** (Spitze · Mitte):
  - `renderer._renderScene`: 15,5 · 10,9 / 16,2 · 11,7
  - `_loopVoxelStreaming`: 9,5 · 4,0 / 10,9 · 4,2
  - `_loopWeatherAndGrowth › updateCreatures`: **4,42 · 3,05 / 4,47 · 3,19**
  - `_loopAutoSave`: 3,1 · 0 / 4,4 · 0
- **Das Mittel trägt den Sturm, nicht eine Spitze:** CPU-Takt p50 ~21 ms gegen 10,5 beim Gehen ohne Sturm. Zwei Posten:
  - **Die Tiere als Einzel-Draws.**
    - haupt: Befehle p50 21 → 63–64, Dreiecke p50 247k → 497k.
    - k0: Befehle 25 → 48–50, Dreiecke 69k → 205–216k.
    - Jedes der 50 Tiere ist ein eigener Draw in haupt UND im Schatten k0.
    - Die Render-Phase (`phasenEwmaMs.render`) steigt von 6,0 auf 11,4–13,0 ms. In der Zerlegung: `_renderObjects` 3,9 · 2,5 / 4,5 · 2,8, `renderObject › zeichne › _diaetRefresh` 0,6–0,8 je Takt.
  - **Die Tier-Seelen:** `updateCreatures` 3,05–3,19 ms im Mittel, gegen 0,36 bei 9–11 Tieren. Darunter `_animateCompoundMotion › _animateTierBaum` 0,6–0,9, `_kreaturHuellenKontakt` 0,37–0,47, `_applyCreatureSeparation` 0,23–0,30.
  - **Die Spitzen auf dem Mittel** sind dieselben Voxel-Fertigstellungen wie bei der Fahrt, beim Gehen kleiner:
    - `_applyCrossLodGeomorph`: 2,35 / 2,55
    - `_rebuildLodStitchBand`: 1,07 / 1,33
    - `_voxelSurfaceY`: 1,22 / 1,43
    - Autosave: 1,1–1,25
- **Sturm ohne Tiere und Tiere ohne Sturm sind nicht getrennt gemessen.** Die Zelle ist wie bestellt „Sturm mit 50 Tieren“. Der Draw- und Seelen-Zuwachs ist den 50 Tieren zugeordnet, über Befehle, Dreiecke und `updateCreatures`.
- **Werkzeug-Fehler in der Serie, beim Namen:**
  - In `serie.sh` endete der Geher (`geher-ende.js`, Haken weg) VOR dem `takt`. Die ersten beiden Sturm-Zerlegungen (sturm-1/-2) standen still und sahen CPU-Takt p95 16,5 / 16,3 statt 30–37.
  - Nachgemessen mit 2 frischen Boots (`sturm-zer.sh`: der Geher läuft durch lauf UND takt; z1, z2 in der Tabelle). Die Stand-Zerlegungen liegen als `sturm-1/-2-takt.out` daneben und sind nicht gewertet.
  - Die Fahrt war nicht betroffen: `fahrt-pruef.js` liest nur, der Fahrer fährt weiter.

## Werkzeug fehlt: Messort stadt
- `spec/profiband/haushalt.json` `messorte` trägt nur `wiese`, `genesis`, `dorf`, `buehne`.
- `dorf` ist das Dorf der Zelle −4,−4 mit **13 Häusern** (Same 4291161376), nicht nH ≥ 120.
- Es gibt keinen Ort, keinen Spieler und keine Blickrichtung für eine Stadt mit ≥ 120 Häusern und laufendem Dorf-Zug. `werkbank umstellen --ort stadt` und `start --ort stadt` kennen sie nicht (Ort-Auflösung `scripts/werkbank.cjs` `START_ORT` → Haushalt `messorte`).
- Gebraucht wird ein Haushalt-Eintrag `stadt` mit Zell-Ort, Same und `dorfZug: true`, der nH ≥ 120 erreicht. Dazu gehören die Einschwing-Bedingung „kein Export unterwegs, keine Siedlung wächst“ (wie `dorf`) und ein Geher-Weg durch die Straßen.
- Die Sturm-Zelle hatte das Werkzeug nicht im Stamm. Sie lief mit `p3/n2210/k1/sturm.js` (Seiten-Code über `werkbank eval`).
  - Eine Bühne „stormy + n Tiere“ gibt es in werkbank/Haushalt nicht.
  - Für eine Wand gehört sie als Ort- oder Bühnen-Option ins Werkzeug.

Roh: OMEN `p3/n2210/k1/` (serie.sh, sturm-zer.sh, sturm.js, geher.js, fahrt.js, roh/). Hier liegt `bericht/2210-profiband-k1-gtx/` ohne die takt-JSON (6,4 MB, auf der OMEN).

**Status ZWISCHENSTAND + Übergabe:**
- **K1 an der GTX: Staffel 1 ROT** in GT-Fahrt (2/2 Boots, F95 33,4–33,5, CPU-Takt p95 33,0–34,5) und Sturm + 50 Tiere (4/4 Boots, F95 33,3–41,6, CPU-Takt p95 29,7–36,7).
- Grün sind Gehen Wiese Ego, Gehen Genesis Third und Sprint (F95 25,1, CPU-Takt p95 17,9–22,1).
- Die Täter sind über ≥ 2 Boots stabil:
  - **Fahrt:** Chunk-Fertigstellung im Takt (`_applyCrossLodGeomorph`, `_fernRingHoch › computeVertexNormals`, `createBuffer`) plus der Autosave-Snapshot.
  - **Sturm:** die Tiere als Einzel-Draws in haupt + k0 (+42 / +25 Befehle, Render +5–7 ms) und `updateCreatures` (+2,8 ms).
- Messort stadt: Werkzeug fehlt (Haushalt `messorte`).

## Nachtrag 22.10. 14:30: Werkpaket k1-buehnen (51c2f0be [ci voll]) und die Stadt-Zelle an der GTX

**Geschnitten** (Zweig `k1-buehnen` ab main e3dd2b67, Kopf 51c2f0be [ci voll]; gemessen am selben Baum e2208673, nur die Message trägt jetzt [ci voll]):
- **Bühne „Sturm + n Tiere“:** `werkbank lauf|takt|haenger --wetter <wort> --tiere <n>`.
  - Das Wort hält die Bühne als Spieler-Wort, die Wetter-Wache liest jetzt erst nach der Bühne.
  - `__buehne` stellt n Tiere frei im Ring 15–60 m (`spawnCreatureAt`, EIN Same). Ein zweiter Ruf füllt nur auf; ohne Platz bricht die Bühne laut ab („DIE BÜHNE: x von n Tieren stehen“).
  - Am Ende des Laufs `BÜHNE ROT`, wenn Tiere fehlen.
  - Selbsttest in `lauf --selbsttest` (ohne Welt, im check): 50 im Ring auf Land, Auffüllen, laut ohne Platz. Er feuert gegen drei Mutationen.
- **Messort stadt** in `spec/profiband/haushalt.json`:
  - `gruendung`: Wort `dorf 7 120`, Platz 400/400 mit Blick, Anker 663/423, dazu `bahn` (die Hauptgasse West → Ost, 225 m).
  - `umstellen --ort stadt` sagt das Wort über den Chat (`_chatDispatchLegacyCommand`), wie der Spieler, und wartet über `__deckel`.
  - Die Stadt muss ±1 m am Anker stehen, sonst bricht das Umstellen laut ab.
  - Die Bahn wird Meter für Meter auf der Gasse geprüft (`_aufWeg`).
  - Kein Band-Ort (`istBandOrt`), also keine Ratsche. Das Schema prüft `gruendung` und `bahn`.
  - Gegründet stehen 111 von 127 Slots (Großstadt „Villaalto“); nH 120 ist die Klemme des Kerns.
  - In fünf Proben-Orten setzte keiner ≥ 120 Häuser (89–111), das Gelände nimmt den Rest.
- **Der Geher-Fehler:** `--wandern bahn` geht die Kette des Orts (Wiese: −z 60 m wie bisher).
  - Der Geher lebt IM Lauf; kein Prüf-Skript kann ihn vor dem `takt` beenden.
  - `bahnM` ist jetzt der gemessene Weg des Spielers im Mess-Fenster. `takt` druckt „Weg x m“, eine stehende Zerlegung heißt „Weg 0 m“.
- **Decke:** scripts −146, Prüf gesamt −103 (gate:betriebsgesetz GRÜN). Bezahlt mit:
  - Datums-Gliedern in Chronik-Klammern: 312 Klammern, je Glied mit TT.MM.; Erklärungen und Kennungen (K16 …) bleiben.
  - 15 Existenz-Proben auf Stamm-Methoden, dazu zwei tote else-Zweige dahinter (klang-zensus, schatten-bias).
  - Chronik in drei Haushalt-Titeln.
- **Prüfungen:** `npm run check` EXIT 0, `playtest:fast` 21 ✅ 0 ❌.

**Gemessen: Stadt-Zelle GTX**
- **Aufbau:** Kopf e2208673, 2 frische Boots, 1920×1080, Regler voll, Tiere frei (7 im Bild), Dorf-Zug an.
  - Neben der Stadt wachsen Steintal (18), Steinheim (13) und Westerhausen (13).
  - Gehend: `lauf 30 --ein 2 --wandern bahn`, Weg 120 m je 30 s.

| Boot | fps | Frame p50 / **p95** / p99 | CPU-Takt p50 / **p95** | Belegung p95 | GPU p95 | Dreiecke Mittel | Befehle haupt / k0 | VRAM | Staffel 1 |
|---|---|---|---|---|---|---|---|---|---|
| stadt-1 | 32,3 | 25,0 / **66,7** / 125 | 21,7 / **65,0** | 69,7 (ROT) | 2,40 | 1,77 M | 46 / 22 | 207,8 MB | **ROT** |
| stadt-2 | 31,9 | 25,0 / **75,0** / 117 | 23,0 / **69,3** | 72,5 (ROT) | 2,49 | 1,75 M | 45 / 22 | 188,4 MB | **ROT** |

Die GPU trägt 2,4–2,5 ms je Bild. Der Faden ist der Engpass: `takt` p95 41,5 / 40,7, max 185 / 239.

**Zerlegung beim Namen** (`takt 20 --wandern bahn`, Weg 83 / 84 m; Spitze · Mitte ms je Takt, über beide Boots stabil):

| Wurzel | stadt-1 | stadt-2 | Darunter (Spitzen-Täter, Linse ROT) |
|---|---|---|---|
| `_loopVoxelStreaming` | 15,7 · 4,0 | 17,4 · 4,1 | Chunk-Fertigstellung `_applyCrossLodGeomorph` 6,1 (Rest 2,7 / 2,2, `_rebuildLodStitchBand` 1,9 / 2,0, `trefferVon` 1,5 / 1,4), `_fernRingHoch › computeVertexNormals` 1,7 / 1,8, `createBuffer` 1,6 / 2,3 |
| `renderer._renderScene` | 15,3 · 9,1 | 15,1 · 9,0 | `_renderObjects` 6,4 · 2,6, `_passSicht` 6,0 · 4,2; im Bild 1,6 M Dreiecke im Hauptpass |
| `_loopRender › _tickChunkSatz › _tickBauSatz` | 8,6 · 0,3 | 9,0 · 0,4 | **das Bau-Satz-Packen der Stadt**: `_chunkSatzEin › _satzPacke` 3,3 / 3,1, `_bauSatzBlock › _satzBlock` 3,0 / 3,0, `_chunkSatzHuelle` 1,1 |
| `_loopWeatherAndGrowth` | 6,3 · 1,5 | 5,9 · 1,6 | **`_tickBewohner`** 5,9 · 1,0 (Rest 2,7); `_kreaturGliederGruppen` 1,2–1,6 |
| `_loopAutoSave` | 4,7 · 0 | 4,8 · 0 | `saveState` 1,9; dazu `_perfSenseFoldFrame › _flightRecorderSave` 3,5 · 0 (`_flightRecorderBuildTrace` 1,7) |

- **Lesart:** Die Stadt kommt mit 1,75 M Dreiecken ins Bild, und der Faden hat schon im Mittel 22 ms je Takt (Gehen Wiese 10,5).
  - Gehend durch die Gasse zieht jeder neue Chunk die Fertigstellung (Geomorph) und das Neu-Packen der Bau-Sätze in den Takt.
  - Die Bewohner, Autosave und Flugschreiber legen ihre Spitzen dazu.
- **Staffel 1 an der GTX:** ROT in drei von sechs Zellen — Fahrt, Sturm und Stadt.

**Offen**
- Die Werkzeug-Lücken der K1-Zellen sind geschlossen (Sturm-Bühne, Messort stadt). Die Sturm-Zelle ist mit dem Stamm-Werkzeug nicht neu gemessen; die Zahlen oben kommen aus `sturm.js`, dieselbe Bühne.
- CI des Kopfs 51c2f0be [ci voll] ist zu lesen.
- Die Belegungs-Linse steht in der Stadt ROT (Pflicht außerhalb des Takts p95 > 1 ms), in Sturm und Stadt gemessen, nicht gejagt.

Roh: OMEN `p3/n2210/kb/` (stadt.sh, roh/), hier `bericht/2210-profiband-k1-gtx/stadt/`.

**Status ZWISCHENSTAND + Übergabe:**
- k1-buehnen 51c2f0be gepusht.
- Die Stadt-Zelle reißt Staffel 1 mit Frame p95 66,7 / 75,0 und CPU-Takt p95 65 / 69.
- Ihre Täter beim Namen: Bau-Satz-Packen, Chunk-Geomorph, Bewohner, Autosave, Flugschreiber.
