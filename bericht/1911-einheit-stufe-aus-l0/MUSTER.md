# Spike (b): Teile über einem Bildpunkt als Muster im Stoff der Zone (GTX 1050, 19.11.)

Entscheid des Koordinators (b), Soll VOR der Messung, unbewegt: B1 ≤ 1 % · Dreiecke der L2 ≤ heute × 2 = 6 412 · Draw-Einheiten ≤ heute ·
das Auge (Holz, Lehm, Backstein je Zone, Tür, Gauben-Fenster). Wort des Schöpfers: „ja bauen, bei 98% wip sichern und übergabe“.
Leitplanken des Koordinators (E7): die Funktion nimmt die L0 jedes Studios, keine Zweige je Stufe; Messung an Haus UND Wagen.

## Ergebnis

**Das Auge hält, der Preis steht auf der Linie, B1 hält nicht.** alemannisch L2 auf 26 m: aus der L0 B1 4,81 % vorn und 2,98 % hinten
(heute 65,11 % / 45,31 %), 6 414 Dreiecke (Soll ≤ 6 412: zwei darüber). Die Wagen liegen unter heute, aber nicht unter 1 %. Was bleibt,
ist am Haus das Muster des Steins und das Relief der Balken.

## Die Funktion (`werkzeug/muster.js`, ein Mess-Instrument im Main auf der Lieferung des Foundry-Fadens, kein Kern-Schnitt)

Eingabe: die Netze der L0 (je Netz ein Stoff) und der Bildpunkt `s` an der Grenze (d ÷ 703,7 px/m). Kein Wissen über Studio oder Stufe.
1. **Sicht:** ein Tiefen-Raster je Richtung (12 Azimute × 3 Höhen und von oben) in der Zelle `s`; ein Dreieck bleibt, wenn es in einer
   Richtung an einer Pixel-Mitte vorn liegt, oder — unter einem Bildpunkt — wenn sein Schwerpunkt nicht hinter der vordersten Fläche
   seines Pixels liegt (5 mm). Glas verdeckt nichts (die Durchsicht aus dem gebauten Stoff).
2. **Muster:** Ecken mit einer Verband-Zeile ≠ 0 (Backstein `mauerwerk`, Ziegel `deckung`, `naturstein`) werden je Ebene und Zone zur
   Fläche — Steine näher als 6 cm bilden eine Zone; die Zone ist ein Raster in zwei Bildpunkten, ihre größten Rechtecke die Fläche
   (Löcher wie Fenster bleiben offen), 3 mm hinter der Steinfront, mit der mittleren Farbe der Steine und DERSELBEN Verband-Zeile: der
   Stoff webt das Muster (`_verbandStoff`).
3. **Dünnes fällt:** jede andere Fläche, deren kleinste Höhe unter `s` liegt (Balken-Flanken, Pflöcke).

## Tafel (Kamera wie im Spike STUFE; B1 = Maske über 8/255)

| Fall | Dreiecke L0 · heute · aus der L0 | B1 aus der L0 | B1 heute |
|---|---|---|---|
| alemannisch L2, 26 m, vorn | 96 630 · 3 206 · **6 414** | **4,81 %** | 65,11 % |
| alemannisch L2, 26 m, hinten (Gaube, Tür) | dieselben | **2,98 %** | 45,31 % |
| gt L1, 12 m | 21 872 · 7 894 · 11 724 | 13,84 % | 16,83 % |
| suv L1, 12 m | — | 6,72 % | 11,76 % |
| limousine L1, 12 m | — | 5,33 % | 8,52 % |

Rohzahlen `zahlen/b1-muster.json`. Achtung gt: die Zeile „heute“ schwankt zwischen Läufen (11,55 · 11,94 · 16,83 %) — ungeklärt; die
Wagen-Zahlen sind darum nur gegeneinander im selben Lauf zu lesen.

## Der Weg dahin (je Lauf gemessen)

| Schritt | Dreiecke | B1 vorn |
|---|---|---|
| konvexe Hülle je Zone | 20 640 | 9,11 % (der Giebel unter einer Fläche, das Fenster zu) |
| + Sicht, Zone als Raster | 5 195 | 5,38 % |
| + EINE Quelle des Steins (`infill` liest `VERBAND_GESETZ.mauerwerk`) | 5 720 | 4,92 % |
| Zonen-Farbe als Mittel des Gezeigten (Stein + Lehm der Fuge) | — | 14,77 % — verworfen: der Stoff webt die Fuge selbst, die Ecke trägt den Stein |
| + Glas verdeckt nichts, Schwerpunkt-Test für Teile unter einem Bildpunkt | 6 414 | 4,81 % |

## Was das Auge sieht

`bilder/muster-alemannisch-L2-26m-vorn-L0-ausL0-heute.jpg` und `…-hinten-…`: aus der L0 ist es dasselbe Haus — Fachwerk, Lehm-Gefache,
Backstein, Tür, Gauben-Fenster, das Giebel-Fenster; heute ein graues Haus. `bilder/muster-alemannisch-L2-26m-differenz.png`: was bleibt,
sitzt in den Fugen des Steins (der gewebte Stein wirkt gröber als die Stein-Geometrie der L0, die Lagen liegen anders) und als Linie an
den Kanten der Balken und an der Traufe (das Relief: Unterseite und Schatten, die eine flache Fläche nicht trägt — die Vorhersage des
Koordinators).

## Ehrlich offen

- **Preis:** 6 414 gegen 6 412 — zwei Dreiecke über dem Soll; Draw-Einheiten: in meinem Mess-Pfad trägt die Stufe die Netze der L0
  (Haus 12, heute 4); ob der Bau-Satz der Welt sie wie heute in Opak und Glas faltet (Rauheit und Metall je Ecke, `_satzStoff`), ist
  ungeprüft — das Soll „Draws ≤ heute“ ist damit nicht gezeigt.
- **Der Kern-Schnitt Steingröße** (`fachwerk-core.js` `infill` liest `VERBAND_GESETZ.mauerwerk`) liegt nur in diesem Spike-Zweig, ohne
  Re-Mint und ohne Byte-Beweis: er hebt die L0 von 77 526 auf 96 630 Dreiecke (+25 %) — der Preis gehört in den Entscheid.
- Die Funktion läuft im Main als Instrument; ihr Ort im EINEN Stufen-Weg (W6), ihre Laufzeit und die Hi-Z-Hälfte (Zweig `einheit-sicht`)
  sind nicht Teil dieses Spikes. Nur Same 1, eine Haus-Vorlage, Mittag.
- Wagen: die Gründe der verbleibenden 5–14 % sind nicht gelesen.
