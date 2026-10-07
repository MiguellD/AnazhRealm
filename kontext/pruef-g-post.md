# Gegenpruefung welle-g-post

merge-reif: ja

Ich habe nur gelesen und nichts committet. Die Wurzel sitzt am Chokepoint, das Bild ist unverändert, Vendor ist unberührt. Rote Punkte gegen den Code gibt es keine. Die OMEN-Befehlsfolge braucht vor dem Versand zwei Korrekturen, siehe (e).

**(a) Bild:** Alle 16 Paare plus Kontrollen habe ich selbst dekodiert und verglichen.
- Bit-gleich oder höchstens 1 LSB: Armlänge Mittag (0,04 % der Pixel), Armlänge Abend, 8 m Abend mit Godray-Stärke 0,646, und Kontrast 0 (k0 Basis↔Kopf).
- 25/45 m: Basis↔Kopf1 max 8/6/3. Die Wärmekarte zeigt, dass die Abweichung nur an einzelnen Büschen und Bäumen sitzt (Weltdrift). Kopf2↔Kopf1 liegt jeweils höher (max 10–12).
- Die Kontrollen zeigen, dass der Vergleich nicht blind ist: ohne Godrays ändern sich 17 % der Pixel (max 83), ohne Kontrast 61 %.
- Kein Banding, kein Saum, keine Geister, keine Farbverschiebung. Die Lichtschäfte sind gleich.
- Der Bericht verschweigt ein Paar: **Mittag 8 m, Basis↔Kopf1 max 117** (0,35 % der Pixel). Ursache ist eine zusätzliche Streu-Blume nur in Kopf1 (Ausschnitt geprüft). Basis↔Kopf2 ist dort max 1, also keine Verschlechterung. Die Zahl gehört trotzdem in den Bericht.

**(b) Wurzel:**
- `renderer.depth` wird nur noch an einer Stelle gesetzt: `_leinwandTiefe`, anazhRealm.js:89266, aufgerufen von der Weiche in `_loopRender`. Die alte Stelle im Ketten-Bau und die im catch sind weg (Grep bestätigt das).
- Die Vendor-Stellen habe ich nachgelesen: `updateSize` verwirft den Leinwand-Deskriptor, `getDepthBuffer` legt die Tiefe neu an, `destroyTexture` zerstört und vergisst, `_getFrameBufferTarget` übernimmt `depthBuffer=renderer.depth`. `vendor/` ist im Diff nicht enthalten.
- Weder Zwilling noch Flag. Der Rückfall catch→Direktpfad bestand schon vorher; die Welle repariert ihn nur, statt einen neuen zu bauen.
- `nurBeiStaerke`: Die Bedingung ist eine Uniform aus `var<uniform> object`, die Abtastungen im Zweig sind also WGSL-konform. Bei Stärke 0 kann kein NaN·0 mehr entstehen.
- Bloom-Mitte = Bild: In der Basis tastete das Bild über das Quad-Varying ab, jetzt über `screenUV`. Beide sind von oben nach unten ausgerichtet (QuadGeometry flipY=false, `screenCoordinate` gespiegelt unter WebGL), und die Bilder sind bit-gleich.

**(c) FARB-GESETZ und Licht-Kette:** Grading, Entgrauen, ACES und sRGB sind im erzeugten WGSL von Basis und Kopf identisch, bis auf die Nummerierung der Variablen. Das TRAA-Resolve-WGSL ist identisch.

**(d) Struktur-Zahlen:** belegt.
- Ausgabe-WGSL: Basis 34 Abtastungen, alle unbedingt. Kopf 33, davon 9 unbedingt, 20 im Zweig `godrayStrength != 0` und 4 im Zweig `localContrast != 0`. Kopf1 und Kopf2 sind gleich.
- Anatomie: 4,7 Pässe in beiden Ständen, der Post-Pass trägt bgra8 ohne Tiefe, 3 Kopien mit 31,64 MB. Die dritte Kopie heißt jetzt „post: depth → TRAANode.history:tiefe“.
- Der Leser dieser Kopie ist `TRAANode.js` (Zeilen 426/427/539). Die Kopie bleibt also zu Recht.
- Die CI-Läufe 37513372885 und 37518422060 sind über die GitHub-API bestätigt: success, Schritt „Post-Kette“ success.

**(e) OMEN-Folge:** nicht ausführbar wie geschrieben.
- **Es fehlt `npm ci` in jedem neuen Worktree.** Ein frischer Worktree hat kein `node_modules`, und `werkbank.cjs` lädt `require("puppeteer")`. `werkbank start --echt` bricht deshalb mit MODULE_NOT_FOUND ab.
- Es gibt nur einen Durchgang A→B mit fester Reihenfolge. Die erwartete Differenz „GPU gesamt 20,09 → 19,4“ (−0,6 ms) liegt unter der Streuung zwischen zwei Boots (±2 ms laut OMEN-Grundmessung). Entweder ABAB fahren, oder nur die Zerleg-Deltas innerhalb einer Welt als Richter erklären.
- Kleiner Widerspruch: „shader … beide Stände“, obwohl nur der Kopf den Befehl hat.
- Ehrlich und richtig: `leer` läuft auf der Basis (leere Szene, kein Tiefen-Leser), `post` nur auf dem Kopf, und der Tiefen-Clear im leeren Frame ist offen benannt.

**(f) Technische Kleinigkeiten:**
- Siegel-Wörter: keine in den drei Commit-Messages und keine in den hinzugefügten Zeilen.
- Regex: Die Alternation `Compare|CompareLevel` funktioniert durch Backtracking. Die `RAUSCHEN`-Regex erfasst keine Namen, die mit „noise“ beginnen; eigene Funktionen fängt aber der Aufruf-Pfad ab.
- `typeof`-Prüfungen sind sauber.
- `check.yml` lädt mit js-yaml fehlerfrei, der Schritt liegt im Job playtest.

**(g) Konflikte:**
- `anazhRealm.js` lässt sich mit allen Geschwister-Branches konfliktfrei zusammenführen. Kein Geschwister fasst Weiche, `renderer.depth`, `_ensurePostProcessing` oder `_szeneTiefe` an.
- Textkonflikte:
  - `scripts/werkbank.cjs` gegen welle-g-boden: 4 Stellen.
  - `package.json`, die lange `check`-Zeile, gegen welle-c-sicht und welle-l-wasser.
  - Der Konflikt mit welle-aufloesung in werkbank.cjs (Pass-Uhr) stammt aus der Basis, nicht aus dieser Welle.
- **Bei der Integration entsteht ein Zwilling:** welle-g-boden bringt `scripts/lib/stoff-linse.cjs` mit, einen zweiten WGSL-Zähler (eigene `funktionen()`, eigene Abtast-Regex). Die Integration muss daraus eine einzige Zählquelle machen; wer als Zweiter gemergt wird, baut auf `shader-kosten.cjs` auf.
- welle-l-wasser lässt den Wasser-Stoff zusätzlich `aDepth` und `aSlope` lesen. Die Bühne von `diag-post-kette.cjs` setzt nur aFlow/aShore/aWave. r184 warnt dann und setzt 0 ein, die Wand bleibt grün, aber die Bühne sollte die beiden Attribute mitziehen.

Geschnitten: Prüfung nur lesend; Abweichung im Ausgabe-Pfad Basis↔Kopf in keinem Paar über dem Kopf↔Kopf-Rauschen; Wurzel `_leinwandTiefe` ist die einzige Stelle, Vendor unberührt.
Gemessen: 16 Bildpaare Basis↔Kopf1 selbst diffundiert: 0 Verschlechterungen; mittag-8m max 117 ist Kopf1-Drift (Basis↔Kopf2 max 1); WGSL 34/34/0 → 33/9/24; CI zweimal success.
Pflicht-OFFEN Rest: 4 (A, B, C, E — docs/PFLICHT-OFFEN.md)
Status: ZWISCHENSTAND

Belege:
- C:\Users\micha\AnazhRealm-profiband\.claude\worktrees\vigorous-nash-g-post\artifacts\welle-g-post\bilder\bericht.json
- C:\Users\micha\AnazhRealm-profiband\.claude\worktrees\vigorous-nash-g-post\artifacts\welle-g-post\bilder\kopf1-post_ausgabe.wgsl
- C:\Users\micha\AnazhRealm-profiband\.claude\worktrees\vigorous-nash-g-post\artifacts\welle-g-post\zerlegen-kopf.txt
- C:\Users\micha\AppData\Local\Temp\claude\C--Users-micha-AnazhRealm-profiband\1d8df756-4c3b-4b06-bda2-d7de4eebfeaf\scratchpad\m8crop.png (Mittag 8 m: Basis | Kopf1 | Kopf2)
- C:\Users\micha\AppData\Local\Temp\claude\C--Users-micha-AnazhRealm-profiband\1d8df756-4c3b-4b06-bda2-d7de4eebfeaf\scratchpad\heat-abend25.png
