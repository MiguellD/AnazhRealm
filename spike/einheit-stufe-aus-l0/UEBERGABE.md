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

2. **Muster in der Phase der L0** (gelesen, nicht gebaut): der Weber `_verbandStoff` (`stamm/studio-stoff.js:141`) liest u, v an der WELT
   (`dot(positionWorld, t) ÷ lM`), außer die Zeile trägt das Flag `lage` UND der Aufrufer reicht `ecke` (heute nur die Fachwerk-Zeile, im
   Bau-Satz: `stamm/siedlung-satz.js` legt `aLage` in die vierten Stellen von Farbe und Glut). Die L0 legt ihre Steine im HAUS-Raster
   (`infill`: `Math.floor((a0 - ox) / bw) · bw + ox` längs der Wand, Lagen je Gefach gestreckt `rh = yl / nr`) — ein Haus an anderer
   Weltlage webt sein Muster also verschoben gegen seine Steine; die L0 selbst trägt Geometrie-Steine UND das gewebte Muster darüber.
   Plan: `_steinLage` nach dem Vorbild `_wandLage` (`fachwerk-core.js:1939`) schreibt für die Rolle `backstein` je Ecke die Lage in Steinen
   aus demselben Anker wie `infill` (u = a ÷ bw im Haus, v = Lage im Gefach), die Zeile `mauerwerk` bekommt `lage`, die Zonen in
   `muster.js` erben die Lage ihrer Steine. VORHER prüfen: misst der Spike (`_foundryBuildGroup`) und zeichnet die Welt (Bau-Satz) dieselbe
   Kette — reichen beide `ecke` an den Weber?
3. **Relief als Ton:** Kanten unter `s` fallen (`muster.js` Schritt 3); ihr Mittel aus Eigenschatten und Kante soll als Ton in den Stoff
   der Zone (dasselbe Gesetz wie die Farbe). Differenz-Karte: Linien an Balken-Unterkanten und Traufe.
4. **Draws falten in Opak und Glas** (Soll je Haus ≤ heute: 4): die Stufe trägt heute die Netze der L0 (Haus 12). Prüfen, ob der Bau-Satz
   (`_satzStoff`: Rauheit/Metall/Deckkraft je Ecke aus `aRegler`) sie schon faltet; sonst in der Funktion nach Stoff-Klasse zusammenlegen.
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
