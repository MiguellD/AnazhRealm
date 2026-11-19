# Die Stufe aus der L0 — Zensus und Spike an alemannisch L2 (GTX 1050, 19.11.)

Soll: `soll.json` (erster Commit, wörtlich vom Koordinator, vor der Messung). Stand der Welt: main 986eff04. Kein Bau, keine Landung.

## Ergebnis

**Der Abzweig ist die Wurzel: die L2 aus der L0 hält B1 (0,68 %, Soll ≤ 1 %), die heutige L2 aus eigenem Rezept reißt (64,90 %).**
**Aber der Preis: nach dem Gesetz fällt auf 26 m kaum etwas.** Die Stufe, die nur Teile unter einem Bildpunkt fallen lässt, trägt
72 748 Dreiecke, die heutige L2 3 206, die L0 77 526. Schon zwei Bildpunkte Zelle geben B1 3,1 %, vier 24,5 %. Die Welle über alle
sechs Vorlagen (Schritt 3) würde die Ferne an den heutigen Grenzen gut 20-mal teurer machen; gebaut ist sie nicht — sie wartet auf das
Wort des Koordinators.

## 1. Zensus (Opus-Arbeiter, am Kern von main gelesen und in Node nachgerechnet) — `zensus-stufe-l0.md`

Gruppiert nach Wurzel:
- **W1 Eigenes Rezept je Stufe** (die Wurzel unter allem): keine Stufe liest die gebaute L0. `fachwerk-core.js:6419/6438`
  `buildInstance` → `buildStufe` (`:6272`): Stufe 0 der volle Bau, 1 und 2 über `massBau`/`fragFuer` (`:3574–3600`) mit eigenen Masken
  (`DESTNUR` `:2306` schaltet Fenster, Gefache, Gerüst, Zimmermann, Türen, Giebel, Dachwerk aus); `P.flaechig` verzweigt den Bau an etwa
  20 Stellen. Wagen: `vehicle-core.js:4898/4906` — dieselbe `baueFahrzeug`, jede Teilung × 0,4.
- **W2 Stoff je Klasse statt je Zone:** die L2-Wand ist EINE Rolle `gefach` (`lod2Koerper` `:3387`, `_wandRolle` `:2947`), 300 m² in
  22 Dreiecken, Ton aus dem Flächen-Mittel der L1 (`_wandFaktor` `:2950`); die L0 trägt Holz 731 m², Lehm 386 m², Backstein 227 m²
  (22 344 Stein-Dreiecke), Gefach 181 m². Das Fachwerk der L2 lebt nur als Muster-Attribut (`aVerband`/`aLage`, gewoben von
  `stamm/siedlung-satz.js:503–521`) — im Bild eine graue Block-Wand. Der Backstein der L1 ist ein Kasten je Gefach in der Mischfarbe
  aus Stein und Lehm (`_baseFor` `:2347`), in der L0 Geometrie (`infill` `:649ff`). Zwilling: die Steingröße steht zweimal
  (0,32 × 0,15 in `infill` `:648`, 0,24 × 0,071 in `VERBAND_GESETZ.mauerwerk` `:1860`).
- **W3 Öffnungen aus anderer Quelle:** die Fenster der L2 sind eigene Geometrie (`fensterFern` `:2800`, Maß-Zwilling `:2795–2798`).
  **Berichtigung meines Satzes aus dem Spike STUFE:** die 13 Fenster liegen an DENSELBEN Stellen wie in der L0 (Zentren und Maße
  zeichengleich, Same 1) — nicht „an anderen Stellen“. Es fehlt das Gauben-Fenster (`fensterAt` `:809`, nie in `windowOpenings`) und die
  Tür (`DESTNUR` `tueren: false`, `lod2Koerper` schneidet keine).
- **W4 Kleinteile fallen nach Volumen, nicht nach Bildpunkt:** `bakeLOD` wirft an der L2 jedes Teil unter `KULLVOL` 0,012 m³ weg
  (`:2299`, `:2454/2459`), ihr Mittel geht in keinen Stoff.
- **W5 Wagen-L1 verliert keine Normalen:** indiziert wie L0, kein `flatShading`; die Facetten kommen aus der gröberen Teilung (× 0,4) —
  der Winkel Ecken- gegen Flächen-Normale verdoppelt sich (gt größtes Blech 1,05° → 2,06°, Flanken 3,3° → 6,7°).
- **W6 Kein gemeinsamer Ort:** der einzige gemeinsame Weg ist `foundry-bruecke.js:888–893` (`presetId, seed, lod` an den Kern); ab
  dort entscheidet jeder Kern selbst.

## 2. Spike: alemannisch L2 auf 26 m

Die Stufe aus der L0 ist für den Spike eine Ecken-Bündelung (`werkzeug/buendel.js`): je Netz (= je Stoff) Zellen der Kante
„n Bildpunkte an der Grenze“ (26 m ÷ 703,7 px/m = 3,7 cm je Bildpunkt) und je Richtung der Normale (sechs Achsen); Lage, Normale,
Farbe, uv mitteln sich in die Zelle (das Mittel der Teile geht in die Fläche, die sie trugen), entartete Dreiecke fallen. Sie läuft im
Main auf der Lieferung des Foundry-Fadens und zeichnet im Stoff der Welt (`_foundryBuildGroup`); Messung wie im Spike STUFE (E nur der
Werfer der Stufe 3 · A L0 · B Stufe an derselben Kamera, Maske A oder B gegen E > 4/255, B1 = Anteil > 8/255).

| Stufe | Dreiecke | B1 |
|---|---|---|
| L0 | 77 526 | — |
| aus der L0, Zelle 1 px | 72 748 | **0,68 %** |
| aus der L0, Zelle 2 px | 60 262 | 3,10 % |
| aus der L0, Zelle 4 px | 29 822 | 24,46 % |
| aus der L0, Zelle 8 px | 16 521 | 34,02 % |
| aus der L0, Zelle 16 px | 6 509 | 35,74 % |
| heute, eigenes Rezept | 3 206 | 64,90 % |

Das Auge (`bilder/alemannisch-L2-26m-L0-1px-4px-16px.jpg`): bei 1 px dasselbe Haus — Stoff je Zone, Fachwerk, Tür, Fenster. Bei 4 px
mischen sich die Backstein-Front und der Lehm dahinter in einer Zelle (die Gefache werden hell), bei 16 px reißt die Form auf.
`bilder/alemannisch-L2-26m-L0-ausL0-heute.jpg`: L0 | aus der L0 (1 px) | heute.

Die Vorhersage des Koordinators („fällt unter 10 %, B1 reißt dort noch“): die erste Hälfte trifft, die zweite nicht — bei 1 px hält B1.
Die Stopp-Regel (nicht unter 30 % → stopp) greift nicht.

## Was das für Schritt 3 heißt (gebaut wird nichts, bevor der Koordinator entscheidet)

- Nach dem Gesetz wörtlich („es fallen nur Teile unter einem Bildpunkt“) ist eine Stufe an den heutigen Grenzen fast so teuer wie die
  L0: Backstein (0,15 m = 4 px auf 26 m), Balken, Fenster-Sprossen stehen über einem Bildpunkt. Billig wird eine Stufe erst, wo diese
  Teile unter einen Bildpunkt fallen (der Backstein bei rund 105 m).
- Ecken-Bündelung allein ist nicht der Weg zur billigen Stufe: ab 2 px mischt sie Flächen hintereinander (Front und Lehm) und bricht
  B1. Was billiger UND gleich aussehen kann, ist die zweite Hälfte des Gesetzes: Teile über einem Bildpunkt wandern als MUSTER in den
  Stoff der Fläche (Backstein, Balken als Muster der Wand — die Welt webt heute schon ein Muster, `aVerband`, aber ein fremdes:
  graue Blöcke auf einer Rolle `gefach`). Das wäre der Schnitt im Kern; sein Preis und sein B1 sind nicht gemessen.
- Die Wagen-L1 (W5) ist dieselbe Frage im Kleinen: ihre Facetten sind gröbere Teilung, keine verlorenen Normalen.

## Ehrlich offen

- Nur alemannisch, Same 1, eine Kamera, Mittag; die übrigen fünf Vorlagen nicht gespiket.
- Die Bündelung ist ein Mess-Instrument im Main, kein Kern-Schnitt; ihre Laufzeit ist nicht gemessen.
- Dreiecke im Blick (B4) und Frame-Zeit (B5) einer Welt aus solchen Stufen: ungemessen.
- Die Stufen sind einzeln gezeichnet (`_foundryBuildGroup`), nicht über die Instanz-Senke der Welt.

## Werkzeug

`werkzeug/buendel.js` (die Stufe aus der L0 im Spike), `werkzeug/spike-bef.cjs` (die Werkbank-Befehle: E · A · B · C je Fall, Zelle in
Bildpunkten). B1 rechnet `einheit-spike-stufe:spike/einheit-stufe/werkzeug/stufe-b1.cjs` (dieselbe Maske und Schwelle).

Karte 2: 3 von 1 718 (gelesen in LAGE auf koordination um 17:35; dieser Spike bucht selbst nichts).
