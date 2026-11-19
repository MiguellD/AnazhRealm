# Übergabe — Welle a „Stufe aus der L0“ (GTX 1050, 19.11. abends; Wochen-Budget an der Grenze)

Auftrag: Entscheid E8 des Koordinators (koordination `vision/einheit/entscheid-einheit.md`), Zweig `einheit-stufe-aus-l0`.
Wort des Schöpfers: „ja bauen, bei 98% wip sichern und übergabe“. Datei-Besitz dieser Welle: `fachwerk-core.js`, `vehicle-core.js`,
`foundry-bruecke.js` (der Spike SICHT am Laptop hält `siedlung-instanz.js` und sein neues Modul — nicht anfassen).

## Stand (was gilt)

- Spike (b) abgegeben (c2b8b8cbd, `MUSTER.md`): die Stufe aus der L0 (`werkzeug/muster.js`) zeigt dasselbe Haus; alemannisch L2 26 m
  B1 4,81 % vorn / 2,98 % hinten (heute 65,11 / 45,31), 6 414 Dreiecke; Wagen L1 12 m unter heute. Urteil: die Wurzel trägt (E8).
- Welle a, Punkt (1) **Zwilling der Steingröße — GRÜN** (WIP 73f317126, Entscheid b des Koordinators): der Stein liest
  `VERBAND_GESETZ.mauerwerk` an allen drei Stellen (`infill`, Giebel, Verband `:1415`) und wird NIE nach dem Budget gestreckt
  (`infill` und Giebel ohne `GROSSFORMAT`, `infill` ohne `UEBER_GROSSFORMAT`; in `buildInstance` zählt der Stein nicht gegen die Zeile
  der Stufe — `ohneStein`). Re-Mint `haeuser.json`: gegen main 109 Fälle in 16 Häusern (L0 33 · L1 32 · L2 21 · L3 23).
  gate:fachwerk-contract GRÜN, Split-Parität 24/24. L0-Dreiecke benannt (kein Tor): alemannisch 77 526 → 105 054 (+35 %; Same 7
  92 994 → 138 678, +49 %), hanseatisch 85 266 → 118 830 (+39 %; Same 7 118 134 → 194 154, +64 %). `__sehne` trägt weiter, unberührt:
  Ziegel/Deckung `:243`, Dielen `:870`, Keilsteine `:1069`, die Giebel-Bänder der Flächen-Stufe `:758` (`_zg > 1`), die Kuppel `:1756`.
  Nicht gemessen: die +35–64 % an der Profi-Band-Pose; gate:asset-contract und gate:haus-fern am Kopf.
- Punkt (5) **Rauschen des gt-Richters** — gelesen, nicht beim Namen: die Lieferungen des Fadens sind über Läufe bitgleich (L0 und L1:
  Lage, Normale, Farbe, FNV); im selben Lauf sind zwei Bauten der L1 bildgleich (0,00 %), zwei Bauten der L0 weichen um 0,82 % ab (116
  verstreute Pixel über das ganze Bild — Grasspitzen, nicht der Wagen). Zwischen zwei Läufen weicht die heutige L1 um 7,29 % ab, die L0 um
  1,0 %, das leere Bild um 0,01 %: sichtbar ist der GLANZ der Haube (`einheit/gt-c-laeufe.jpg` im Werkzeug-Ordner der GTX: mu7 heller,
  mu8 dunkler). Der Zustand sitzt im Zeichnen (Kandidaten: Spiegel-Pass `_spiegelPass`, die Umgebung/IBL zur Bootzeit) — ungelesen.
  Bis er benannt ist: Wagen-Zahlen nur innerhalb EINES Laufs vergleichen (A · B · C im selben Lauf), nie über Läufe.

## Offen in Welle a (nicht begonnen)

2. **Muster in der Phase der L0 — gebaut, headless gemessen, NICHT am Bild** (WIP nach 19:3x):
   - Befund: der Bau-Satz der Welt reicht Zeile je Ecke (`aRegler.w`) und Lage (`ecke` aus `color.w`/`aGlut.w`) an den Weber
     (`stamm/studio-stoff.js:727–740`); der Spike-Pfad (`_foundryBuildGroup`) reicht die Zeile nur als Wert des Stoffs und keine Lage —
     **der Spike hat das Muster auf einem anderen Weg gezeichnet als die Welt** (seine B1-Zahlen gelten für seinen Pfad).
   - Schnitt (a): `_verbandStoff` liest die Lage in der VORLAGE (`positionGeometry`, `normalGeometry`) statt an der Welt — das Muster liegt
     im Raster des Baus, nie am Standort (vorher webte jedes Haus je nach Weltlage verschoben). Betrifft jede Verband-Fläche (Mauerwerk,
     Deckung, Putz, Naturstein) in jedem Haus; die Fachwerk-Zeile mit `lage` liest weiter `ecke`.
   - Schnitt (b): `infill` legt die Lagen im Raster des Hauses (Lage k bei k · bh ab dem Grund, am Gefach geklippt) statt je Gefach gestreckt.
   - Schnitt (c): der Giebel-Backstein (`:743`) und der dritte Bauer (`:1415`, längs zuvor um seine eigene Mitte `uc`) legen Lagen und
     Stoßfugen im selben Raster des Hauses. Die Verteilung der Stein-Ecken zeigte vorher zwei Gruppen (das Raster und eine halbe Zelle
     daneben — der Giebel).
   - Zahl (`werkzeug/phase.cjs`, volle Steine, Abstand Stein-Mitte zu Mitte der gewebten Zelle in Zellen, 0 deckungsgleich, 0,5 auf der
     Fuge; vorher gemessen in der Vorlage — an der Welt lag es zufällig je Standort): alemannisch längs 0,288 → **0,000**, hoch 0,255 →
     **0,000**; hanseatisch 0,315 → **0,000** / 0,194 → **0,000**; fraenkisch und tudor **0,000 / 0,000**.
   - Re-Mint haeuser.json, gate:fachwerk-contract GRÜN (Split-Parität 24/24), diag-atlas --check und Format grün. Nicht gelaufen: das
     Bild (B1 im Bau-Satz der Welt), gate:asset-contract, gate:haus-fern, stamm:lint, check:statik.
3. **Relief als Ton:** Kanten unter `s` fallen (`muster.js` Schritt 3); ihr Mittel aus Eigenschatten und Kante soll als Ton in den Stoff
   der Zone (dasselbe Gesetz wie die Farbe). Differenz-Karte: Linien an Balken-Unterkanten und Traufe.
4. **Draws falten in Opak und Glas** (Soll je Haus ≤ heute: 4) — gelesen, wahrscheinlich schon getragen: der Bau-Satz der Welt
   (`_satzStoff`, `stamm/siedlung-satz.js:70`) nimmt Rauheit, Metall, Emissiv, Deckkraft und Verband aus der Identität des Stoffs (sie
   reisen je Ecke in `aRegler`, `_satzRegler :85`), Durchsichtiges trägt eine eigene Marke (Deckkraft 0,5 als Zeichen). Stoffe, die sich nur
   darin unterscheiden, fallen in EINEN Satz — Opak und Glas getrennt; die Identität bleibt Art · Seh-Klasse · Seite · flach · Umgebung ·
   Gewebe · Leucht-Gesetz · Zeitplan · Klarlack. Die „12 Netze“ der Stufe aus der L0 sind ein Maß meines Mess-Pfads (`_foundryBuildGroup`).
   ZU MESSEN in der Welt: die Zahl der Satz-Arten (`st.satzStoffe`) je Haus heute gegen aus der L0.
- **Der Ort:** die Funktion EINMAL im Kern hinter `_foundryWorkerRequest` — der gemeinsame Weg ist `foundry-bruecke.js:888–893`
  (`presetId, seed, lod` → `BAKERS_BY_KIND`/`kern.buildInstance`). Vorschlag: für `lod ≥ 1` baut die Brücke die L0 und reicht sie mit
  `s = grenze(lod) ÷ Brennweite` durch die Funktion (`muster.js` als Kern-Modul, Eingabe nur Netze + `s` + Glas-Flags aus dem Stoff),
  keine Zweige je Stufe (Leitplanke E7). Die Grenzen je Stufe kommen aus der Tafel des Kerns (`foundry-core.js:446`, `vehicle-core.js:40–55`,
  fachwerk `HOST_STUFEN :159`). Kosten der Funktion im Faden (Sicht-Raster aus 37 Richtungen) ungemessen.
- **Tafel B1 an allen 6 Vorlagen** (alemannisch, japanisch, modern, gt, suv, limousine) an 12 m / 26 m, Bildpaare L0 | Lk, Dreiecke,
  Draws; **Linse** in bestehender Familie (`gate:fachwerk-contract` oder `gate:haus-fern`): Mutant „Stufe aus eigenem Rezept“ ROT.

## Werkzeug

- `werkzeug/muster.js` — die Funktion (Sicht · Muster-Zonen · Dünnes fällt); `werkzeug/spike-bef.cjs <bef> <ordner> '<fälle>' muster` —
  die Werkbank-Befehle (E nur Werfer · A L0 · B aus der L0 · C heute; Fall `[typ, preset, werfer, halbDiag, blickHöhe, stufe, d,
  zellePx, [dx, dz]]`); B1 wie im Spike STUFE (`einheit-spike-stufe:spike/einheit-stufe/werkzeug/stufe-b1.cjs`).
- Lauf: `ORT=wiese START_ARGS="--fenster 1920x1080" timeout 520 bash .git/gtx1050-werkzeug/tmp/werkbank-ort.sh stufe <bef>` (unter
  dem GPU-Schloss; vorher `rm -f .git/gtx1050-werkzeug/gc/werkbank-stufe/start.log`). Kommentare am Zeilenende brechen die
  zusammengefügte Werkbank-Zeile — nur ganze Kommentar-Zeilen in `muster.js`; kein Hochkomma.
