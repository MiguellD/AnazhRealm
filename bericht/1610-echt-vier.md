# Bericht 1610 Echt-Gruppe §3 — die roten GPU-Schritte auf der Karte beim Namen (Zweig `echt-vier`, Auftrag `auftrag/1610-omen-echt-frost.md`)

**Status: ZWISCHENSTAND.**

## Urteil

| Schritt | Täter | Schnitt / Karte | Job `echt` |
|---|---|---|---|
| Verdeckungs-Abfrage | **LINSE** (zwei Wackler) | geschnitten auf `echt-vier` | kommt in die Liste |
| Ziel-Zensus (neu, CI 38889629891) | **LINSE** (Wackler) | geschnitten auf `echt-vier` | stand schon in der Liste |
| Frost-Wand S5 (neu, CI 38892745904) | **LINSE** (Wackler) | geschnitten auf `echt-vier` | stand schon in der Liste |
| Ego-Schatten | **kein Täter:** 12 von 12 grün am Kopf, lauf4 nicht reproduziert | — | kommt in die Liste |
| WebGL2-Rückfall | **SPIEL** (Boden-Stoff mit 17 Samplern > 16), dazu LINSE (W5 schoss vor den Programmen) | W5 geschnitten; das Spiel geht als Karte an den Koordinator | bleibt draußen |
| Albedo-Tafel | **SPIEL** (der Code bewegte `boden` nach dem Mint: L/W 1,04 → 1,126) | Täter-Commit **f6fa9f63** (T2 Laubkrone aus dem Standort) | bleibt draußen |

- **`check.yml`, Job `echt`:** Jeder Wand-Schritt trägt `if: ${{ !cancelled() }}`. Ein Lauf zeigt so jedes Rot beim Namen, der Job
  bleibt rot. `gate:ci-deckung` ist grün.
- **`scripts/` netto 0 Zeilen gegen integ ab5a9f7f.** Gezahlt mit sechs Exporten von `welt-boot`, die kein Leser im Repo nutzt.

## 1. Verdeckungs-Abfrage — LINSE, zwei Wackler

- **V1 (lauf4 ROT „ABLAUF VAKUÖS: kein Stellvertreter gezählt“):**
  - Der Ablauf fährt auf der Karte unter dem Ladeschirm. Die Linse bootet bis zur Hydrosphäre, nicht bis `_weltbildDa`.
  - Unter dem Ladeschirm schickt ein Takt sein Bild nur alle `LADE_BILD_MS` = 500 ms Wanduhr (`_ladeBildFaellig`, `stamm/25a.js:2252`).
    Die Linse taktet mit synthetischer Zeit (+16,7 ms) und so schnell, wie die GTX abgibt.
  - Gemessen mit Instrumentierung (`p3/k1610v/lade/`, Baum `linse-probe`): **8–10 von 29 Takten gerendert, 26–34 Lade-Bilder
    ausgesetzt**. Der Berg-Cull fragt in jedem 10. gerenderten Frame, also 0–1 Mal.
    - `verd-1`: 8 Takte gerendert → ROT.
    - `verd-2`/`verd-3`: 10 Takte → genau 1 Probe → grün.
  - Mit Boot bis `_weltbildDa`: **29/29 gerendert, 0 ausgesetzt**, grün in 3/3 Läufen.
  - Auf swiftshader dauert jeder Takt länger als 500 ms, jeder rendert; die Annahme der Linse stimmte nur dort.
- **V2 (wdh2 `folge1-verdeckung` ROT „SELBSTTEST VAKUÖS: der Bruch ohne Hülle nennt … nicht“):**
  - r184s Fehler-Bereich hält die Validierung bis zum Ende eines offenen Pipeline-Baus. Sie kam später als die feste Pause von
    200 ms und als THREE-Zeile. `welt-boot` zählte sie dann als Fehler der Welt; der Filter `erwartet` kannte nur „weak set“.
- **Geschnitten (`scripts/diag-verdeckungs-abfrage.cjs`):**
  - Der Boot wartet auf der Karte (`linsenGpu() === "hardware"`, die EINE Weiche) auch auf `_weltbildDa`.
  - Die Phasen ohne Hülle buchen bis zum Wort der Validierung (höchstens 30 s).
  - S meldet sich per `selbsttest()` von welt-boot. Der Muster-Filter `erwartet: /weak set/` fällt; ein „weak set“ außerhalb von S
    ist jetzt ROT.
  - Auf swiftshader bleibt der Weg gleich: 74 s, grün; der CI-Median der Gruppe 17 war 85 s. Wartete auch swiftshader, käme Gruppe 17 von
    6,1 min über ihren 7-min-Deckel.
- **Gemessen am Schnitt (GTX):**
  - 4/4 grün an e5ea0d10 (`p3/k1610v/beweis/verd-*.txt`), dazu Endstand-Lauf folgt nach dem ABAB (`p3/k1610v/ende.sh`).

## 2. Ziel-Zensus — LINSE, Wackler

- **Befund:** „Destroyed texture [spiegel:strahl] used in a submit — CommandEncoder ziel-zensus:lesen“. Der Encoder gehört der Linse.
  - Die Lese-Liste (`scripts/lib/ziel-zensus.cjs`, `eintraege`) nimmt jede GPU-Textur mit einem Zugriff im Zählfenster (`ev.keys()`).
  - Legt das Spiel ein Größen-Ziel im Fenster neu an (r184 beim ersten Bild des Spiegels), zerstört `_texturAbschied`
    (`stamm/20c.js:1536`) die alte Fassung nach dem Submit. Die Linse liest sie danach.
  - Am selben Kopf im Arbeitsordner des Läufers grün (26 s), im nächsten Echt-Lauf grün (26 s): ein Wackler.
- **Beleg der Mechanik** (`p3/k1610v/zz-mechanik.cjs`, leere Seite auf der Karte, eine lebende und eine zerstörte Textur in der
  Liste, die ECHTE `zielLesen`):
  - **vorher** 1 ungefangene Validierung, wortgleich mit dem CI-Fehler. Die zerstörte Textur gilt dabei als „gelesen“.
  - **nachher** 0 ungefangene, die Textur steht „nicht gelesen: zerstört“.
- **Geschnitten:** `zielLesen` bucht jede Kopie in einem eigenen Fehler-Bereich (`pushErrorScope`/`popErrorScope`). Das Urteil
  übergeht ungelesene Ziele (`if (!x || !l.gelesen) continue`).
- Am Schnitt grün (`beweis/zz-schnitt.txt`, 25 s), dazu Endstand-Lauf folgt nach dem ABAB (`p3/k1610v/ende.sh`).
- **Nebenbefund, nicht geschnitten:** Eine Probe mit echtem Größenwechsel zwischen Zählung und Lesen (`page.setViewport`, +16 px)
  meldete in einem Encoder des Spiels (`copyTextureToTexture_45_78`) „Copy … does not cover the entire subresource“. Der Wechsel
  kam ohne den Takt des Spiels dazwischen; das ist kein belegter Spiel-Fehler, nur benannt (`p3/k1610v/zz2/`).

## 3. Frost-Wand S5 — LINSE, Wackler (CI 38892745904, Schritt 24)

- **Befund:** Rot war nur „S5 der JS-Speicher bleibt beschränkt — 286,3 → 297,2 MB (Soll ≤ +10)“. Ofen-Memo, Geometrien, Stoffe
  und Hörer blieben flach.
- **Kontroll-Probe** (`p3/k1610v/s5/`, Baum `frost-probe`, 2 Läufe):
  - **Ohne einen Zug, 8 s Ruhe:** der Puffer-Speicher hinter dem Heap +10,6 MB (173,8 → 184,4), JS-Heap flach.
  - **Danach die 18 Züge:** +0,9 MB.
  - Die gesammelte Basis lag also im Nachlauf der Einrichtung (Werkstatt, Wolf, drei Züge).
  - `HeapProfiler.collectGarbage` lief schon dreimal vor jeder Probe; die Sammlung war nicht der Wackler.
- **Geschnitten (`scripts/diag-weltbild-frost.cjs`):** S5 und S6 nehmen ihre Basis in Ruhe (`heapRuhe`: zwei gesammelte Proben
  ≤ 0,5 MB, höchstens 20). Die Schwelle bleibt +10 MB.
- Gemessen am Schnitt: Endstand-Lauf folgt nach dem ABAB (`p3/k1610v/ende.sh`).

## 4. Ego-Schatten — kein Täter

- lauf4 (16.10. ~10:57, Baum echt-gruppe, codegleich mit 826717ed) war ROT: „LEIB WIRFT NICHT“ (Wurf 0 px) und „AUGE“ (1071 px Leib
  vor dem Auge).
- **Am Kopf 826717ed 12 von 12 grün** (Wurf 646–754 px, IoU ≥ 0,9, Auge 0 px):
  - allein 1 + 4 + 3 Läufe;
  - in der lauf4-Folge (ankunft → gpu-fehler → ego) 2 Läufe;
  - mit Boot bis zum Weltbild 2 Läufe.
- Die Schüsse fallen auf der Karte ebenfalls unter den Ladeschirm (`ladeTakt: true`, 16 s), ohne Folgen; die Linse zeichnet ihre
  eigene Bühne.
- **Offen:** Der Grund des einen Rots ist unbenannt. Der Schritt kommt in die Liste; ein Wackler stünde dort beim Namen.

## 5. WebGL2-Rückfall — SPIEL (Boden-Stoff), dazu LINSE (W5)

- **SPIEL.** Auf der GTX (ANGLE/D3D11, `MAX_TEXTURE_IMAGE_UNITS` 16) linkt das Programm des Boden-Stoffs nie:
  - **17 Sampler** an `MeshStandardNodeMaterial #34`, dem Chunk-Mesh (`userData.inventar`). #33 trägt 16, genau an der Grenze.
  - Die Sampler: `fern-ring-maske`, `kronen-streu:fern`, `kronen-streu:nah`, `rausch-atlas`, `wege-karte:fern`, `wege-karte:nah`,
    `fern-krone-nah`, `fluss-karte:fern`, `fluss-karte:nah`, `himmel-umgebung`, `spiegel:strahl`, `kaskade0:tiefe`, `kaskade1:tiefe`,
    `horizont-karte`, `DFG_LUT`, `PMREM.cubeUv`, `atmo-himmel`.
  - Die Stoff-Stelle: `_buildPbrNodeMaterial` (`stamm/10.js:330`, `new THREE.MeshStandardNodeMaterial` Z. 376), die Geologie über
    `_terrainGeologyAlbedo` (`stamm/10.js:436`, `:1408`).
  - Auf WebGPU trägt das Gerät mehr (G1, `requiredLimits`). Auf WebGL2 der Karte fehlt der Boden: Jeder Rückfall-Spieler mit 16
    Einheiten sieht keinen Boden. Die THREE-Zeile „Shader Error … exceeds MAX_TEXTURE_IMAGE_UNITS(16)“ hält die Wand ROT.
  - Methode: `p3/k1610v/webgl-taeter.cjs`, Haken an `linkProgram` und `createRenderPipeline`, Sampler aus dem Fragment-Shader,
    Texturen aus den Bindungen des RenderObjects.
- **LINSE W5 „keine SUBSTANZ, schwarze Welt?“:**
  - Der Substanz-Schuss kam vor den Programmen; die Karte kompiliert parallel (`KHR_parallel_shader_compile`), swiftshader synchron.
  - Gemessen ohne Haken: sofort 1 Farbe / 0 Pixel, nach `compileAsync` 37 Farben / 684 Pixel.
  - **Geschnitten:** `compileAsync` vor dem Schuss (`scripts/diag-webgl-probe.cjs`, dieselbe Zeile).
  - Am Schnitt: Endstand-Lauf folgt nach dem ABAB (`p3/k1610v/ende.sh`).

## 6. Albedo-Tafel — SPIEL

- Auf der GTX reproduziert und deterministisch:
  - `boden` Labor/Welt **1,1258** über der Ratsche 0,04 + Rand.
  - Labor-Y 0,0867 → 0,0832, Welt-Y 0,0833 → 0,0739.
  - Gleiche Zahl in lauf4 und in `p3/k1610v/albedo/`.
  - Die Radeon misst am Kopf dasselbe (A0 des Koordinators).
- **Das Gerät ist es nicht:**
  - Am Mess-Commit cd945ba0 misst die GTX `boden` mit 0,0867/0,0835 = **1,04**, also genau den Wert der Radeon in der Tafel
    (`p3/k1610v/albedo-kontrolle/`; die Abdrücke der Tafel-Kopie dort auf Platzhalter, damit jede Zeile neu misst).
  - Am Kopf misst die GTX fels, haus, tor, lack und klinge auf vier Stellen wie die Radeon.
- **K66 ist es nicht:**
  - Kopf mit `gelaende-core.js` im Stand des Mints (Abdruck `c:47e37b26`): weiter 1,1258 (`p3/k1610v/albedo-ab/`).
- **Bisektion über integ** (`p3/k1610v/bisekt/`):
  - 9003e357 = 1,04 · 210fe8a7 (B2) = 1,04 · 5fb8eb1c (V2) = 1,13 · 826717ed = 1,13.
  - 27ae78bf (FW) = 1,04 · **f6fa9f63 (T2 „Laubkrone aus dem Standort“, laubkrone-partien 02e019d6) = 1,13**.
- **TÄTER: f6fa9f63.** Sein Spielcode: `phyto-core.js` (+104), `foundry-core.js` (+68) und `stamm/26c.js:14–28`.
  - In `stamm/26c.js` liest die EINE Kronen-Tafel des Pflanz-Gesetzes (`AnazhRealm.FOREST.crown`) jetzt die gewachsene Krone
    (`phyto-core FOREST_PACK.crown`) statt fester Radien. Pflanz-Abstand und Kronen-Licht am Boden (K70 `_bodenLichtFeld`,
    Labor-Gauß) folgen ihr.
  - Kandidat innerhalb des Zweigs, nicht einzeln gemessen: 4df309de „der Pflanz-Abstand liest die gewachsene Krone“.
  - Der Zweig hat 5 Commits; eine Bisektion darin kostet 3 Läufe (~10 min) und folgt nach dem ABAB, falls die Karte sie braucht.
- Methode: `p3/k1610v/albedo-punkt.sh <commit>` (Baum `albedo-bisekt`, Tafel-Kopie mit Platzhalter-Abdrücken, `--neu` auf der
  GTX), Rohdaten `p3/k1610v/bisekt/<commit>.txt`.

## Status ZWISCHENSTAND + Übergabe

- Zweig `echt-vier` ab integ ab5a9f7f, WIP-Kopf **559e01e1** (`[skip ci]`), gepusht.
  - Noch NICHT gelaufen am Endstand: frost 2× Karte + 1× swiftshader (S5-Basis), webgl (W5), verdeckung 2+1, ziel-zensus, ego.
  - Sie liefen am Vorstand e5ea0d10 bzw. als Probe; die Reihe `p3/k1610v/ende.sh` folgt direkt nach dem Bündel-ABAB (Vorrang).
  - Danach `npm run check`, Push `[ci voll]`, Merge nach Zweig-CI durch den Koordinator.
- **Karten für den Koordinator (SPIEL):**
  - der Boden-Stoff auf WebGL2 (17 Sampler > 16);
  - `boden` Labor/Welt 1,126 seit f6fa9f63 (T2). Die Ratsche hebt sich nie; der Nachzug von `haus` und `fels` hängt daran (A0).
- Läufer: `GIT_CONFIG_PARAMETERS` aus `.env` entfernen, sobald der integ-Kopf mit `.gitattributes` grün ist (an ab5a9f7f waren
  Schritte 6–23 grün).
