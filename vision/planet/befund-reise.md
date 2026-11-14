# Befund Reise-Brücke — wie das Spiel den Planeten liest (14.11., 21:10)

Blatt, kein Schnitt. Gelesen: der Kern `planet-core.js` im Zweig `w28-planet-kern` (d660f478; 1854–2012 die Brücke), `ENTSCHEID.md`,
`BERICHT.md` (voll, auch „Nach dem Angriff“), `REGELN.md`, `meisterkarte-2.json` (Gruppe planet, dazu same.massstab.sprung,
same.kopplung.zeitreise, same.entfaltung.reise), der Skill `anazh-lehren` (Architektur, Quelle je Domäne), das Spiel an main 7f778d44c1
(V18.546.276). Angesehen: `bau4/erde-09-zeit+0-biom.png`. Der Blick des Koordinators stimmt am Bild: Fächer-Keile im Grün, Ellipsen-Kontinente.
Gemessen hat dieses Blatt nur mit node 24 auf dem Laptop. Andere Sitzungen liefen, also gelten die Zeiten unter Last. Die Proben
liegen im Scratch (`mess.cjs`, `mess2.cjs`, `mess3.cjs`).

**Drei Sätze.**
- **Entschieden:** Der Planet bekommt seinen Samen aus `worldMeta.seed` und den Körper aus `PLANET_ERDE`, nur `jahrTage` liest er aus
  `TEMPERATUR`. Er rechnet im Faden der Quelle nach dem ersten Weltbild. Ein Ort reist auf einen eigenen Platz mit einer Ort-Saat, und
  jede Größe am Ziel ist Heimat plus die Differenz des Planeten zum Anker. So bleibt die Heimat byte-gleich, und es gibt keinen Zwilling.
- **Gemessen:** Der Faden zahlt für Stufe A 0,50–0,62 s CPU (Plan 41–58 ms, Scheibe kalt 438–564 ms, Anker 12–17 ms). Ein Atlas in
  Biom-Farben kostet 100 ms bei 64 px, 256–291 ms bei 128 px und 1,0–1,1 s bei 256 px. Entlang einer Linie quer durch die Fächer-Keile
  springt die Abflussspende von `planetOrt` in einem 20-km-Schritt um bis zu 281 mm, der Median liegt bei 0,7 mm.
- **Offen:** Der Preis der Reise (≤ 5 s ohne Ladebild) hängt an PFLICHT-OFFEN B. Die Zeit einer Welt-Tür ist heute ungemessen (`reise.tuer`).
  Die Sonne hat keine Breite. Der Anker ist geographisch, nicht materiell. Der Anker der Saat erde-09 ist nach der Heilung gewandert,
  obwohl `VERSION` gleich blieb.

---

## 1 IST — woher die Welt heute ihre Werte nimmt (Datei:Zeile an main 7f778d44c1)

| Größe | Leser / Quelle | Datei:Zeile | Heute |
|---|---|---|---|
| Samen | `worldMeta.seed`, sonst `"anazh-realm-seed"`: 20 Leser, darunter Lage (`_gelaende`), Chunk-Schlüssel, Inseln, Sterne, Klang, Fauna, Feld | gelaende-boden.js:724 · gelaende-chunks.js:355, 802 · gelaende-boden.js:261 · bild-himmel.js:323 · klang.js:138, 1204 · kreatur-fauna.js:19 · feld-leben.js:1820 | EIN Samen für alles. Er trennt nicht zwischen Ort und Planet. |
| Ort der Ankunft | `worldMeta.genesisOrt {key, x, z, steht}` → `_genesisMitte()` | gelaende-boden.js:463–494 · siedlung-ort.js:1374 | Der Plan steht im Faden fest an 0/0 und rückt bis 240 m auf tragenden Boden (voxel-worker.js:925–960). Der Schlüssel heißt `genesis:<seed>:<x>,<z>:<ortHash>`. |
| Landform-Regler | `LANDFORM_REGLER` (19 Zeilen min/max/def) → Erbgut `[wildnis]` → `_erbgut()` (Hash) | gelaende-core.js:379 · speicher-welten.js:88 (`_weltGesetz`) · gelaende-boden.js:1268 | Ohne Gesetz stehen alle Regler auf `def`. Eine Plan-Welt trägt sie über `_weltAusPlan` (speicher-laden.js:1781). |
| Großform | `grossform(N, x, z)`: Rauschen aus Samen + `":voxel"` | gelaende-core.js:565 | λ 9 km und 3,2 km. Ein Band ≥ 32 km fehlt. |
| Meeresspiegel | `waterLevel = Basis − 3`, mit sechs Rückfall-Stellen `Number.isFinite(L.waterLevel) ? … : …` | gelaende-core.js:2687–2696, 5630 · 1279 · 1309 · 1377 · 1474 · 1519 · 1745 | Eine Konstante, die an sechs Stellen still nachgebildet wird. |
| Temperatur | `TEMPERATUR {sommer 18, winter −4, sommerPhase 0,375, tagAmp 5, tagGipfel 0,625, jahrTage 365}` → `temperaturFeld` | gelaende-core.js:1298–1318 · bild-himmel.js:2780 | EIN Klima für jede Welt und jeden Ort. |
| Schnee | `SCHNEE {start 140, voll 185}` → `schnee`, Tafel, Pegel | gelaende-core.js:1269 · gelaende-boden.js:2499 · voxel-worker.js:1179, 3086 · bild-himmel.js:2805, 2834 | Die Kühlung 18/162,5 = 0,1108 K/m legt s_v = 0,0587 fest. |
| Abflussspende | `PEGEL.spende` 0,0009 m/d | gelaende-core.js:1582 | 328,7 mm im Jahr, an jedem Ort gleich. |
| Wetter | `wetterAt(saat, x, z, t)`, Leitrichtung θ0 aus dem FNV der Saat; die Zeile wählt `WX_GESETZ` | phyto-core.js:3993, 4056–4100 · bild-himmel.js:2758–2761 · dirigent-takt.js:1645 · stoff-material.js:235 | Der Wind hat keine Breite. Die Fronten verteilen sich überall gleich (klar 27 %, regen 25 %, …). |
| Sonnenbahn | `sonnenRichtung(winkel)`: Mittag im Zenit, z = 0,4·sin(w/2) | welt-licht.js:696–715 · bild-himmel.js:1307, 1365 | Ohne Breite. Die Bahn nach Meeus stand gebaut und fiel an gate:tag-achse:echt: der Lichtmesser sprang 0,15–0,18 EV, erlaubt sind 0,1. |
| Sternhimmel | Drehung `rotation.set(0.4, tod·2π, 0.15)` | dirigent-takt.js:2202 · bild-himmel.js:307–323 | Die Polhöhe ist eine Hand-Konstante, 0,4 rad. Mittags ist kein Stern sichtbar (Grenzgröße). |
| Tageslänge | `dayLengthMinutes` (Wort des Spielers, Zeitraffer) · `timeOfDay` 0,5 beim Start | bild-himmel.js:2548, 2695 · dirigent-kern.js:302 | Die Tageslänge ist Spielzeit, keine Physik. Der Tag zählt 24 h. |
| Chunk-Platte (IDB) | Schlüssel `${seed}\|cx,cz\|lod[\|s…][\|p…]`. Der Stempel `VERSION\|genV\|landform\|erbgut.hash\|FORM` gilt für den GANZEN Speicher, bei Abweichung leert der Faden ihn | gelaende-chunks.js:786–806 · voxel-worker.js:732–755 | Der Samen steht im Schlüssel, der Erbgut-Hash im Stempel. |
| Hydro-Kacheln | `_hydroWelt++` räumt `hydroTiles` | gelaende-boden.js:328 | Eine neue Welt räumt sie schon heute. |
| Foundry-Platte | Gesetz-SHA der Kerne + Stempel des Wirts | studio-bruecke.js:721, 955 · stoff-karte.js:1125 | Hängt nicht am Ort. Sie reist warm mit. |
| Welt-Grenze | `_weltBetreten` → `_weltAblegen` → `_weltWechsel` (Abschied, dann Ankunft wie beim Boot). `WELT_GRENZE.ankunft/seite` | speicher-laden.js:1152 · speicher-welten.js:3401 | Die alte Welt geht ganz. Renderer, Szene, Himmel und TRAA bleiben (`seite`). |
| Fäden | `FADEN_QUELLE {faden voxel-worker.js, kerne [simplex, phyto, gelaende], spaet {fachwerk}}` | gelaende-chunks.js:3378 · voxel-worker.js:42, 316 | Jeder Faden kommt aus EINEM Blob. Ein später Kern kommt über `spaet`. |

**Der Kern** (`planet-core.js`, 142 012 B): `planetOrt` (1944) rechnet den Anker immer bei t = 0 (1947) und liefert `wildnis`, `klima` und
`wetter` ABSOLUT. Nur `meer.waterLevelM` und `leit` kommen als Differenz zum Anker. `klima.jahrTage` ist `kp.jahrTage`: 365,25 beim
Erd-Schlüssel, 365 in `TEMPERATUR`. Das wäre ein Zwilling von einem Viertel Tag. `planetKarte` (1504) rechnet nur das ganze
Rechteck-Bild der Welt, einen Ausschnitt kann man nicht abfragen.

## 2 Gemessen (node 24, Laptop unter Last, je einmal)

| Probe | anazh-realm-seed | erde-09 | erde-01 |
|---|---|---|---|
| `planetPlan` (Erd-Schlüssel, `jahrTage` aus TEMPERATUR) | 58 ms | 41–54 ms | 46 ms |
| `planetScheibe(0)` kalt | 564 ms | 438–494 ms | 447 ms |
| `planetAnker` | 13 ms | 12–16 ms | 17 ms |
| Anker | **48,42° N · 160,50°**, Sommer 16,6 °C, Winter −6,1 °C, Küste 299 km | **45,79° N · −178,67°** (BERICHT §4 bau3: −44,51° · 55,12°) | −48,81° · 114,33° |
| `planetOrt` kalt / warm | — | 4,5 / 3,3 ms | 4,9 / 2,3 ms |
| `planetOrt` an 40 Fibonacci-Orten: Median / max | 1,31 / 5,23 ms (10 von 40 auf Land) | 0,99 / 1,57 ms (12 von 40) | — |
| `planetScheibe(−50)` kalt / warm | — | 278 ms / 11,8 ms | 327 ms / 7,1 ms |
| `planetScheibe(−100)` kalt | 390 ms | 311 ms | — |
| Ort des Ankers bei −100 Ma | Meer (land −0,6) | Meer (land −0,6) | — |
| `planetKarte` relief 64 · 128 · 256 px | — | 37 · 81 · 302 ms | 33 · 81 · 306 ms |
| `planetKarte` biom 64 · 128 · 256 px | — | 107 · 291 · 1 129 ms | 100 · 256 · 1 008 ms |
| `planetOrt` quer durch die Fächer (φ 4,5°, λ −130 … −95°, Schritt 20 km, 159 Land-Schritte) | — | Spende 47–1 087 mm; Sprung je 20 km: Median 0,7 · p95 90 · **max 281 mm**; Sommer max 1,23 K | — |

Die Heimat-Saat trägt einen Anker. Am Anker liefert `planetOrt` `land` 0,35, genau `def` des Reglers, und `waterLevelM` −3 exakt. Die
anderen Regler weichen am Anker von `def` ab: `hoehe` 0,63 statt 1, `ks` 3 statt 6, `trog` 0,42 statt 0,7, `tafel` 0,03 statt 0,5 (erde-09).
**Absolut gelesen würde die Heimat also anders aussehen.** Daraus folgt der Entscheid D3.

## 3 Die Entscheide, die alle drei Stufen tragen

- **D1 Ein Samen, zwei Lesarten.** Der Planet nimmt den Samen der Heimat, `worldMeta.seed`. Ein Reise-Ort bekommt die Ort-Saat
  `${planet.samen}@${ortKey}` (ortKey = Breite, Länge und Zeit, quantisiert auf das Netz, das der Atlas wählt) und trägt `worldMeta.planet =
  { samen, kernSha }`. Was am ORT entsteht (Lage, Chunk-Schlüssel, Inseln, Wetter, Fauna, Feld), liest die Ort-Saat und wird dadurch von
  selbst ortseigen. Was dem PLANETEN gehört (Sterne, die Klang-Harmonie `:lofi`, der Planet selbst), liest `planet.samen`. In der Heimat
  gilt `planet.samen === seed`, also bleibt sie byte-gleich.
- **D2 Der Körper ist das Ort-Gesetz.** Der Körper ist `PLANET_ERDE` mit `jahrTage = TEMPERATUR.jahrTage`. Den Wert liest der Aufrufer und
  kopiert ihn nicht. Das schließt den Zwilling 365,25 ↔ 365. `tagStunden` bleibt 24, weil der Tag des Spiels 24 h zählt. Freie Körper aus
  dem Samen (Tag 10–50 h, Jahr 100–800 d) bleiben gesperrt, bis Sonne und Uhr sie lesen.
- **D3 Die Heimat ist der Nullpunkt — jede Ziel-Größe ist Heimat + Δ des Planeten.** Für Klima, Regler, Spende und Windrichtung gilt
  `wert(Ziel) = Heimat-Gesetz + (planet(Ziel) − planet(Anker))`, geklemmt auf die Zeile des Reglers. Bei der Spende gilt das Verhältnis
  statt der Differenz. Am Anker ist Δ ≡ 0, also bleibt die Heimat byte-gleich. Es gibt keine zweite Klima-Tafel, und die Konstanten von
  `gelaende-core` bleiben die eine Quelle. Diese Lesart wandert in den Kern: `planetOrt` liefert `delta`, kein Aufrufer rechnet sie nach.
  Die Ankunft stand schon heute nach diesem Gesetz (§6 des Entscheids, `leit`). Jetzt gilt es für jedes Feld.
- **D4 Der Kern rechnet im Faden.** In `FADEN_QUELLE.spaet` kommt `planet: "planet-core.js"`. Ein Faden der Quelle lädt den Kern erst
  nach `_weltbildSteht` (dem EINEN Schreiber des ersten Weltbilds), also wächst die Ankunft um 0 Bytes Skript im Haupt-Faden. Ins
  Manifest geht `{ id: "planet", scripts: ["planet-core.js"], ns: "__planetCore", funktion: true }`.
- **D5 Der Ort im Speicher trägt den Kern-SHA.** Der Anker von erde-09 ist zwischen bau3 und der Heilung um etwa 90° Breite gewandert,
  und `VERSION` blieb `'planet-bau3-1'`. Ein gespeicherter Reise-Ort braucht deshalb `kernSha` (wie die Foundry-Platte: der Gesetz-SHA der
  Kerne). Ein anderer SHA BRICHT beim Namen, still verschoben wird nichts. Die Heimat speichert keinen Anker, sie rechnet ihn.

## 4 Stufe A — „Die Welt kennt ihren Ort“

**Was der Spieler sieht:** Der Nachthimmel steht über seiner Breite. Der Himmelspol steht 48,4° hoch im Norden (anazh-realm-seed), und
die Sterne kreisen um ihn. Im Atlas-Kopf, ohne Karte, steht eine Zeile: „48,4° N · 160,5° O · Küste 299 km · Dfb“. Die Ankunft am Mittag
bleibt Bit für Bit gleich, weil mittags kein Stern über der Grenzgröße liegt.

| | |
|---|---|
| **Erster sichtbarer Leser** | `dirigent-takt.js:2202` (Stern-Achse): Die Polhöhe kommt aus `anker.breite`, nicht mehr aus der Hand-Konstante 0,4. Das ist der erste Leser im 3D-Bild. Daneben steht die Ort-Zeile im Atlas-Kopf. |
| **Warum nicht die Sonne** | Die Sonnenbahn aus der Breite ändert das Mittagsbild der Ankunft (Zenit 90° → im Sommer ~65° bei 48° N) und fiel schon einmal an gate:tag-achse:echt. Sie gehört in Stufe C (dort Pflicht), nicht in A, die die Ankunft nicht verändern darf. |
| **Leser-Liste** | `_fadenQuelle` / `FADEN_QUELLE.spaet.planet` (gelaende-chunks.js:269, 3378) · ein Auftrag `planet-anker` im Faden (voxel-worker.js neben `genesisPlan`, 925) · `_weltbildSteht` bestellt ihn · `starField.rotation` (dirigent-takt.js:2202) · die Ort-Zeile. `ortGesetz` baut der Faden aus `__gelaendeCore` (TEMPERATUR, SCHNEE, LANDFORM_REGLER, PEGEL, die Lage ohne Wirt) wie `diag-planet` 382. |
| **Dateien** | cores.manifest.json · stamm/gelaende-chunks.js (FADEN_QUELLE) · voxel-worker.js (Auftrag) · stamm/dirigent-takt.js (Achse) · stamm/dirigent-ankunft.js (Bestellung) · planet-core.js (Kopf: „im Manifest, Leser: …“) |
| **Annahme-Zahl** | (1) Ankunft byte-gleich: Golden-Sätze und Bildpaar Mittag 0 Pixel Differenz, Byte-Diff von Höhe und Temperatur 0 (gate:worker-dichte `--studio`, gate:settlement Teil O). (2) Nacht-Bildpaar Uhr 0,0 ↔ 0,02: Der Fixpunkt der Drehung liegt bei Höhe = \|φ_Anker\| ± 1°, auf der richtigen Seite (Nord bei φ > 0). (3) `ort.leser` 0 → 1, beim Namen genannt. (4) Kosten: Ankunft kalt vorher ↔ nachher Δ ≤ 0 im Band der Referenzfahrt (der Faden startet nach dem Weltbild). Kein Bild im Haupt-Faden über 100 ms. |
| **Preis** | Faden 0,50–0,62 s CPU einmal je Boot, gemessen. Heap: Plan 45 KB + Scheibe 24,5 KB (BERICHT §3). Bytes über das Netz: +142 KB Skript, einmal, im Faden, nach der Ankunft. |
| **Größte Gefahr** | Der Faden der Quelle teilt sich einen Kern mit dem Boden-Strom. Rechnet `planet-anker` im Voxel-Faden, stehen 0,6 s lang keine Chunks im Nachlauf. Deshalb ein EIGENER Faden aus demselben Blob, in der Rolle „planet“, wie Wald, Streu, Fern und Ort. Zweite Gefahr: Die Stern-Achse aus der Breite widerspricht der Sonne im Zenit. Dieser Zwilling (welt-licht.js:696–715, ENTSCHEID §7) wird in A sichtbarer als heute. Er fällt in C. |
| **Sprosse** | Keine. Ein Kern im Manifest ist ein Weg (Z8), und die Polhöhe hat keine eigene Leiter. A liefert den Ort, den die Richter von B und C lesen. |

## 5 Stufe B — „Die Karte im Spiel“

**Was der Spieler sieht:** Eine Taste öffnet den Atlas: den Planeten in Biom-Farben, ein Fadenkreuz „du bist hier“ und ein Zoom bis zum
Kontinent. Die Bytes sind dieselben wie in `diag-planet --karte`.

| | |
|---|---|
| **Bild in ≤ 0,3 s** | Das Bild rechnet NIE beim Öffnen. Gleich nach dem Anker rechnet der Planet-Faden in Stufen: 64×32 biom (100–107 ms) → 128×64 (256–291 ms) → 256×128 (1,0–1,1 s). Zusammen liegen die drei Stufen ≤ 1,5 s nach dem Weltbild. 512×256 (≈ 4 s, gerechnet ×4) und 1 024×512 rechnen im Leerlauf. Jede Stufe geht als Transfer an den Wirt und liegt auf der Platte unter `(planet.samen, zeitMa, schicht, px, kernSha)`. Das Öffnen lädt nur die beste vorhandene Stufe als Textur (256×128×3 = 98 KB). |
| **Zoom / „du bist hier“** | Die Heimat (64 km) ist kleiner als ein Pixel der 1 024er-Karte (39 km/px). Der Kern bekommt additiv `planetKarteAusschnitt(S, mitte, spanneKm, px, schicht)`: dieselbe Schleife über `planetPunktR`/`planetKlimaR`, nur ein anderes Rechteck, etwa 34 µs je Biom-Pixel. 128² = 0,55 s, 256² = 2,2 s (gerechnet), gekachelt zu 64² (0,14 s je Kachel) im Faden, die Mitte zuerst. Die Position des Spielers ist `planetFlaeche(plan, anker, 0, x, z)` → `planetBreiteLaenge`. |
| **Leser-Liste** | Planet-Faden (Aufträge `karte`, `ausschnitt`) · die Platte des Fadens (der Weg der Chunk-Platte, eigener Store) · ein Atlas-Blatt in der Hülle des Spiels (blittet nur Bytes) · `planetKarteVon` für „du bist hier“. |
| **Dateien** | planet-core.js (`planetKarteAusschnitt`, additiv) · voxel-worker.js (Aufträge) · stamm/ eine Atlas-Methode (Textur, Taste, Fadenkreuz) · index.html (Taste) |
| **Annahme-Zahl** | (1) Erstes Atlas-Bild ≤ 0,3 s nach der Taste, auch 5 s nach der Ankunft. Kein Bild im Haupt-Faden über 100 ms. (2) SHA des Atlas-Puffers = SHA der `diag-planet`-Karte gleicher Saat, Zeit und Größe (Faden ↔ node). (3) Lagefehler von „du bist hier“ ≤ 1 px auf jeder Zoomstufe. (4) Die Bild-Mängel, die der Atlas dem Spieler zeigt, stehen beim Namen: Fächer-Keile, Lineal-Plateaus, Kreisbögen. Der Atlas öffnet erst, wenn Fächer und Lineal-Kante gefallen sind. Die Linse dafür fehlt heute (Gebot 10: `bild.faecher`, z. B. Sprung der Spende je 20 km p99 ≤ 3 × Median gegen heute 90/0,7). |
| **Preis** | Faden ≤ 1,5 s CPU je (Samen, Zeit) bis 256 px, gemessen aus den Stufen. Platte 0,1–1,6 MB je Zeit (RGB 256–1 024 px). Heap ≤ 2 MB. Haupt-Faden: Textur-Upload. |
| **Größte Gefahr** | Eine zweite Farb-Tafel im Stamm. Der Atlas färbt NIE selbst, die Farben sind `biomFarbe` des Kerns. Ein „schöner“ Atlas mit eigenem Schummer wäre der Zwilling der Karte. |
| **Sprosse** | Der Atlas ist das Fenster, das R2 für die Saat-Statistik verlangt (Bild-Stichprobe ≥ 5 Saaten im Fenster, ±10 %). Damit werden richtbar: **planet.geologie.platten 2** (bimodal, 100 Saaten ≥ 90 %; heute 28/30 im Kern), **planet.geologie.platten 1** (Gürtel ≥ 4:1 in ≥ 70 %; heute ROT, gebirge.guertel), **planet.wetter.klimazonen 5** (Flächenanteile ±50 %; heute ROT an E 21,8 %). Ihre Spalte Preis sagt „P im Überflug“ bzw. P. Der Atlas ist kein Überflug, deshalb hebt B allein keine Sprosse. Was B hebt, ist die Mess-Fähigkeit. |

## 6 Stufe C — „Die Reise“

**Was der Spieler tut:** Er tippt im Atlas auf einen Ort (und auf eine Zeit). Dort steht er auf Boden, der aus `planetOrt` wächst: anderes
Relief, anderes Meer, anderes Klima, anderer Wind, die Sonne seiner Breite. Zurück führt ein Tipp auf „Heimat“: das Gebaute steht, wie
er es verließ.

| | |
|---|---|
| **Ablauf** | Faden: `planetScheibe(t)` (kalt 278–564 ms, warm 7–12 ms) → `planetOrt(...).delta` (1–5 ms) → ein Abbild der Lage `{ seed: Ort-Saat, planet {samen, kernSha}, ort {breite, laenge, zeitMa}, gesetz.gelaende: planErbgut(def + Δ), waterLevel: −3 + Δmeer, klima: TEMPERATUR + Δ, spende, wind }`. Der Wirt wechselt über die EINE Tür (`_weltBetreten`, speicher-laden.js:1152), aber ohne Abschied der Seite: Renderer, Foundry-Platte, Shader und Atlas bleiben warm (`WELT_GRENZE.seite`). |
| **Was den Ort im Schlüssel tragen muss** | Chunk-Platte: Der Schlüssel trägt die Ort-Saat von selbst (D1). Der **Erbgut-Hash muss aus dem Stempel in den Schlüssel**. Heute leert jede Reise mit anderen Reglern den GANZEN Speicher (voxel-worker.js:753–755), und der Warm-Start der Heimat stirbt (B wird schlechter). Hydro: `_hydroWelt++` räumt schon heute. Genesis/Erdbau: Der Schlüssel `genesis:<seed>:…` trägt die Ort-Saat. Lage: `_gelaende().seed` und `_voxelNoise` lesen die Ort-Saat. `wetterAt` liest die Ort-Saat, θ0 kommt als Heimat + Δwind. Speicher: `worldMeta.ort` + `kernSha`. |
| **Was NICHT mitreist** | `voxelEdits`, `worldMeta.erdbau[key]`, `genesisOrt`, Dorf-Zellen und Siedlungen, gesetzte Werke und Objekte, Kreaturen, Wasser-Automat und Stau, `hydroTiles`. Sie bleiben auf dem Platz der Heimat (die Welt-Grenze trennt sie heute schon). Mit reisen: Leib, Lebenswerte, Inventar, Journal. Die Liste ist gegen `WELT_GRENZE` zu prüfen; ungelesen ist, ob die Tür heute das Inventar trägt. |
| **Ein Ort ist eine Funktion, kein Platz** | Ein Platz im Welt-Index entsteht erst mit der ersten Tat am Ort (Edit, Bau). Bis dahin ist der Ort nur `(samen, φ, λ, t)`. So wächst der Speicher nicht mit dem Weg (Preis-Treppe, Klasse Planet: „der Speicher wächst nicht mit der Welt“). |
| **Ankunft am Ziel** | `_genesisMitte()` ist am Reise-Ort null. Damit gäbe es dort kein Dorf und keinen Ort (siedlung-ort.js:1374, 1383). Der Genesis-Ort mit seinen zehn Toren ist der Platz der HEIMAT (Pflicht F). Am Ziel trägt `worldMeta.ort.landung` die Mitte: dieselbe Spirale `traegt` aus voxel-worker.js:945 ohne den Plan der Tore. |
| **Die Sonne (Pflicht in C)** | Ein Ort bei 70° N mit der Sonne im Zenit wäre der Zwilling, den C nicht tragen darf. Die Bahn aus Jahr und Breite (Meeus, gebaut in w28-nacht-licht) kommt mit C. Sie ändert die Ankunft der Heimat offen, mit Bildpaar am Mittag. Ihr Hindernis ist benannt: der Sprung des Lichtmessers an der Waldkante, 0,15–0,18 EV gegen 0,1. |
| **Zeitreise** | Der Anker ist geographisch. An beiden gemessenen Ankern liegt bei −100 Ma Meer (land −0,6). Ein „dieser Ort vor 100 Ma“ braucht additiv im Kern `planetOrtDerZeit(plan, φ, λ, t0, t1)`: den Punkt im Rahmen seiner Scholle, gedreht mit ihrer Lage. Ohne diese Funktion landet die Zeitreise fast immer im Meer. |
| **Leser-Liste** | Atlas (Wahl) · Planet-Faden (Scheibe, Ort, Δ) · `_weltBetreten`/`_weltWechsel` (ohne Abschied der Seite) · `_chunkIdbKey`/`_chunkPlatte` (Hash in den Schlüssel) · `_gelaende` (Ort-Saat) · `temperaturFeld` und `schnee` (L.klima als Pflichtfeld, die sechs Rückfälle brechen beim Namen, ENTSCHEID §6 Schritt 1) · `wetterAt` (θ0 + Δ) · `_genesisMitte` (Landung) · `sonnenRichtung` (Breite, Jahr) · Sterne (`planet.samen`). |
| **Dateien** | planet-core.js (`delta`, `planetOrtDerZeit`, beide additiv) · gelaende-core.js (L.klima Pflicht, 1279–1745; Byte-Beweis der Heimat) · phyto-core.js (`wetterAt` mit θ0 aus der Lage; Byte-Beweis: 300 Saaten × 400 Orte, Verteilung gleich) · welt-licht.js (Bahn) · stamm/gelaende-chunks.js · voxel-worker.js · stamm/speicher-laden.js · stamm/siedlung-ort.js · stamm/bild-himmel.js |
| **Annahme-Zahl** | (1) Sprung Atlas-Tipp → ganzes Bild (≤ 2 % Lücke gegen die Ruhe), am Boden und spielbar: ≤ 5 s, ohne Ladebild, an beiden Geräten. Heute ungemessen. Zuerst misst `reise.tuer` die Welt-Tür von heute (Tor „Ersetzen“ → `_weltbildSteht`) als Basis. (2) Heimat → Reise → Heimat: Werk-Pixel ≥ 95 % ↔ 0 % am Ziel ↔ ≥ 95 %, Warm-Start der Heimat danach gleich schnell (Treffer der Platte ≥ 95 %). (3) An 30 Ziel-Orten: Temperatur am Meer = TEMPERATUR + Δ (Byte-Ableitung), Jahresamplitude gegen Meeresabstand Rang ≥ 0,7. (4) Stetigkeit: Zwei Ziele 20 km auseinander dürfen nicht weiter springen als der Kern trägt. Heute springt die Spende um bis zu 281 mm (Fächer). Die Annahme hängt daran, dass `bild.faecher` fällt. |
| **Preis** | Faden 0,3–0,6 s für eine neue Zeit, 1–5 ms für einen neuen Ort derselben Zeit. Der Rest ist Ankunft. Die Ankunft am Ziel kostet, was B heute kostet, abzüglich dessen, was warm bleibt: GTX kalt 16,6 s, Zweit-Boot 12,0 s, Radeon ~11 s, der Haupt-Faden bis zum Bild zu 97 % belegt. Der Anteil, der beim Ortswechsel warm bleibt, ist ungemessen. **≤ 5 s ist damit an PFLICHT-OFFEN B gebunden.** |
| **Größte Gefahr** | Ein Zwilling des Ort-Gesetzes: ein Klima, Regler oder Meer am Ziel, absolut aus dem Planeten gelesen, neben `TEMPERATUR` und `def` in der Heimat. D3 schließt ihn. Die zweite Gefahr ist der still geleerte Chunk-Speicher (Stempel), die dritte ein Ort im Speicher ohne Kern-SHA (D5). |
| **Sprossen** | **same.kopplung.zeitreise 4** (Sprung vor die Tat und zurück, Werk-Pixel 0 % ↔ ≥ 95 %, ≤ 5 s): die Ort-Saat mit der Zeit im Schlüssel trägt sie direkt. **planet.wetter.klimazonen 3** (Jahresamplitude gegen Meeresabstand, 30 Orte) und **4** (Bildpaar Juli/Januar an 3 Breiten: Tageslänge, Sonnenhöhe; braucht die Bahn). **planet.wetter.klimazonen 5** (Köppen aus Spieldaten = aus Lage ≥ 80 % an 50 Orten). **same.massstab.sprung 3/4/5** (≤ 2 s bzw. ≤ 3 s). Ihr Preis liegt unter dem ≤ 5 s von C, also halten sie erst, wenn B weit unter 5 s fällt. **planet.geologie.platten 5** (Plattentempo 1–15 cm/a im Spiel, Zeitsprung ≤ 5 s; im Kern ROT, drift.cm_a p05 0,65). |

## 7 Ehrlich offen (mit Messnamen)

- `reise.tuer`: die Zeit der Welt-Tür heute, ungemessen. Sie ist die Basis des Preises von C.
- `bild.faecher`: Es gibt keine Linse für die Fächer-Keile. Gemessen ist nur die Probe dieses Blatts (281 mm in 20 km gegen einen Median von 0,7).
- Der Anker wandert mit dem Kern (erde-09 bau3 −44,5°/55,1° → Heilung 45,8°/−178,7°), und `VERSION` blieb gleich. Ob die Wanderung
  aus der Heilung kommt oder aus einer anderen Lesart des Richters, ist nicht getrennt.
- `planetOrt` liefert heute absolut. `delta` (D3), `planetKarteAusschnitt` und `planetOrtDerZeit` sind ungebaut.
- Die Sonne ohne Breite (welt-licht.js:696–715) und `ATMO_GESETZ.erdeM` 6 360 km neben `koerper.radiusKm`: benannte Zwillinge (ENTSCHEID §7).
- Ob die Tür heute das Inventar trägt (`WELT_GRENZE`), ist ungelesen.
- Ein zusammenhängendes Reisen (laufen statt springen, `same.entfaltung.reise`) braucht den Würfel-Rahmen in Spiel-Metern, einen
  wandernden Nullpunkt (es gibt keinen: kein Leser von floating origin in stamm/) und die Bandteilung ≥ 32 km. Keine der drei Stufen trägt das.
- Alle Zeiten stammen von einem belasteten Laptop, je einmal gemessen, ohne Referenzfahrt. Browser und beide Geräte: ungemessen.
