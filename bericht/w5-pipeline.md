# w5-pipeline — ZWISCHENSTAND (pipeline.K5 · pipeline.K2)

**Geschnitten:** Der Foundry-Faden rechnet auf der Engine der Welt — `_foundryStart` (stamm/studio-bruecke.js:563) holt
das Manifest per fetch, lädt three r184 per `import()` aus der Import-Karte der Welt (Manifest-Feld `engine`,
cores.manifest.json:7, statt der r128-`lib`), hält jede Nachricht bis Engine und Kerne stehen und bricht bei einer `lib`
im Manifest beim Namen; die Kerne hängen an keinem Addon und keiner Engine-Rundung mehr (phyto-core `geoVerschmelzen` ·
`eckenVerschmelzen`, foundry-core `lerpHex` mit der Arithmetik der Golden-Stufen), Harness, Node-Linsen (welt-boot
`ENGINE_THREE`/`fadenScope(ENGINE)`, ofen · mensch/tier-anatomie · phyto-tree · die Vertrags-Linsen) und der Abdruck
(plattform-probe `abdruckHex`) rechnen auf derselben Engine, und gate:pack-contract misst im `bootLauf` Engine-URL, Revision
und synchrones XHR (Mutante „Manifest mit r128-lib" ROT beim Namen).

**Gemessen:** `pipeline.K5#1` am Baum dieses Zweigs GRÜN — vorher (origin/main, gleiche Station) „worlds/*/lib/three* 603 610 B,
geparst worlds/terrain/lib/three-r128.min.js · synchrones XHR 1 (cores.manifest.json) · THREE im Faden r128 gegen die Welt
r184" → nachher „0 B, geparst nichts · synchrones XHR 0 · THREE im Faden r184 gegen die Welt r184"; über das ganze Buch
(177 Arten × 2 Samen × 4 Stufen) bauen r128 und r184 1 212 von 1 416 Stufen byte-gleich, die 204 übrigen sind
Engine-Drift (applyQuaternion/slerp/invert auf ULP-Ebene, Lathe-Normalen bis 6,7°, Cone-Index, Extrude-Triangulierung) bei
gleicher Form je Fall — Vertrags-Akt: porta v4 18/52, schmiede v5 klingen 38/46 und arena 2/5, ofen 83/510 neu gemünzt,
asset-contract v1 (Pflanzen) 128/128 byte-gleich zu den alten Goldens.

**Ehrlich offen:** `pipeline.K2#1` bleibt ROT (0 → 0): die Karte des Studios backt `bakeImpostorAtlas` im Pflanzen-Labor
auf dessen eigenem r128-WebGLRenderer (worlds/terrain/index.html:85, ein Atlas aus 8 Ansichten je Zelle), die Karte der Welt
`_karteWeltBacken` mit den Stoffen der Welt in Hebungs-Ringe, MRT und BC-Ablage (stamm/stoff-karte.js:692) — EIN Bäcker
verlangt das Labor auf der Engine und den Stoffen der Welt (wie die Garage), darum steht `bakeImpostorAtlas` mit seinem
einen Leser (das Labor) und die r128-Datei mit sechs Labor-Seiten als Lesern.

## FUNDE

- worlds/terrain · fachwerk · koerperstudio · portale · schmiede · tetrapoda `index.html` (Skript `terrain/lib/three-r128.min.js`)
  · die Labore zeichnen auf r128, der Faden baut jetzt auf r184: Labor ≠ Welt um die gemessene Engine-Drift · pipeline.K2,
  studios (Labor = Welt) · je Labor ein Umzug wie die Garage (worlds/garage: Import-Karte + three-bootstrap).
- stamm/dirigent-ankunft.js:115 · der Haupt-Faden fährt `ColorManagement.enabled = true`, der Faden `false`: ein Kern, der eine
  Farbe per Hex setzt (`new THREE.Color(hex)`, `setHex`), backt im Haupt-Faden (Kalt-Start/Headless-Bäcker) anders als im Faden —
  „EIN Gesetz, zwei Scheduler" hält nur, wo der Kern `setRGB` rechnet (foundry-core 6822) · pipeline (Labor = Welt) · klein bis
  mittel (die Farb-Pfade der Kerne auf `setRGB`/FARB-GESETZ, dann die Engine-Kurve überall aus oder überall an).
