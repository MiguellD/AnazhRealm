# Bericht 1310-4 — der Flügel-Schnitt

**Status: ZWISCHENSTAND.**

**Urteil:** Der Hinterflügel zeichnet jetzt die Gestalt des Vorderflügels als zweite Instanz derselben Gruppe. Der Schnitt
sitzt am Wirt (`_foundryFluegelInstanz`); die Drehung bleibt eine Instanz-Matrix je Flügel.
- Genesis: 40 → 20 Flügel-Gruppen, Hauptbild-Befehle 122 → 102, Tor-L0-Puffer −1,22 MB.
- CPU-Takt p95 im Toggle EINER Sitzung 6,15 → 5,92 ms (Median 5,9 → 5,7), gehend am Ring in 4 von 4 Paaren niedriger.
- Bild und Schatten gleich (Rauschboden).
- Der erste Weg ist verworfen: alle Flügel eines Stoffs zu EINEM Zug, die Drehung in der Geometrie. Er brachte im Stand −0,4 ms,
  gehend aber +2,9 ms.

Schnitt: **welle-m-e-fluegel 6f264611** `[ci voll]` (ab welle-m-e-genesis d180e3d6).

## Der Befund am Wirt

- porta-core baut je Tor vier Flügel mit `makeLeaf(seite, ±zFace)`, links/rechts × vorne/hinten. Je Flügel × Stoff entstand ein
  Leaf, also eine Gruppe und ein Befehl; am Ring sind das 40.
- In EINER Sitzung ohne alle 40 (unsichtbar) fiel der CPU-Takt p95 von 7,0/6,9/6,9 auf 6,0/6,3 ms (`1310-4/obergrenze/`, vom
  Auftragsbeginn).
- Gebacken sind Vorder- und Hinterflügel einer Seite **bit-gleich, nur um 2·zFace versetzt**: Abweichung von Lage und Normalen 0
  an allen 10 Stoff-Paaren der 7 Genesis-Tore (`1310-4/gleich.txt`, Spalten A/An).
- Links und rechts sind Spiegel mit eigener Teilung. Keine Ecken-Menge deckt sich unter Drehung π oder Spiegel (Spalten
  Bfehlt/Cfehlt), sie bleiben zwei Gestalten.

## Der Schnitt

1. **`_foundryFluegelInstanz`**, im Flatten nach `_foundryFlatVerschmelzen`:
   - Wiederholt ein Tür-Leaf eine frühere Vorlage gleichen Stoffs und Wurf-Rechts nur verschoben, zeichnet es deren Geometrie
     unter deren Schlüssel.
   - Der Vergleich ist `_geoVerschoben`: derselbe Index, dieselben Attribute, die Lage um EINEN Vektor versetzt (1e-5 m).
   - Die Verschiebung reist in `localMatrix` und `tuer.basis`.
2. **Schwenk-Träger je Marke:** Die Slot-Marke trägt den Träger ihres Flügels (`ref.tuer`). `_tickTorFluegel` liest ihn je
   Marke und setzt die Gestalt nach der Drehung an ihren Platz (`· basis`).
3. **Linse** `gate:portal-membran` Block F, zwei neue Prüfungen:
   - „gleiche Flügel-Gestalten teilen ihren Zug“: 2 Züge für 4 Flügel;
   - „jeder Flügel steht, wo seine Gestalt um sein Scharnier schwenkt“: Abweichung 0 m.

   Rot beim Namen (`1310-4/linse/`): ohne Basis im Tick 2,59 m, ohne Instanz 4 Züge für 4 Flügel.

## Gemessen — Toggle in EINER Sitzung

Die Instanz wird an- und ausgeschaltet; dabei fallen die Flats der Tor-Quellen, und jedes Tor baut neu. Daten in
`1310-4/toggle/`, Läufe je 20 s unter Regler voll.

| Genesis | aus (vorher) | an (Schnitt) |
|---|---|---|
| Flügel-Gruppen | 40 | 20 |
| Befehle (Mittel) / Hauptbild | 168,7 / 122 | 148,7 / 102 |
| Stand, ABBA ×3: CPU-Takt p50 | 4,83 [4,7–5,3] | 4,63 [4,5–4,9] |
| Stand: CPU-Takt p95 (Median) | 6,15 [5,8–7,1] (5,9) | 5,92 [5,7–6,7] (5,7) |
| Stand: fps | 52,9 | 53,0 |
| Gehen am Ring, ABBA ×2: CPU-Takt p95 je Paar | 18,9 · 19,1 · 27,7 · 26,9 | 18,3 · 18,4 · 18,4 · 25,6 |
| Tor-L0-Puffer (ohne geleerte Gruppen) | 7,79 MB · 560 Puffer | 6,57 MB · 400 Puffer |

- Im Stand ist „an“ in 5 von 6 Paaren niedriger.
- Gehend ist „an“ in allen 4 Paaren niedriger: −0,6 · −0,7 · −1,3 ms. Das dritte Paar trägt einen Sprung des Pegels der Sitzung
  (Streaming unter dem Geher, `p3/fluegel/gehen2.cjs`: Kreis um die Ringmitte, 6 m, 4 m/s).

**Bild** (`1310-4/bilder/`, verkleinert; verglichen in voller Größe):
- EINE Welt, Uhren fest, je Modus zwei Aufnahmen.
- Zwei Tore (drachentor, welt_schmiede), die Flügel zu (Akt 0) und offen (Akt 1) erzwungen.
- Jedes Quer-Paar liegt im Rauschboden: MSSIM drachentor 0,9993–0,9997 bei Rauschen 0,9993–0,9995, schmiede 0,9948–0,9957
  bei 0,9954–0,9957; ΔLuma ≤ 0,02, 0 % Farbton-Blöcke.
- Zwischen zu und offen ändert sich das Bild (drachentor Luma 114,5 → 122,8): Die Flügel sind im Blick, die Hinterflügel stehen
  hinten.
- Die Flügel werfen nicht (castShadow false); der Schatten der Tore ist im Bild gleich.

**Frischer Boot** (`1310-4/boot/`, gegen 1310-3 nachher):
- Band: Befehle 172 → 152, Dreiecke 650k → 642k, GPU 18,57 → 17,92 ms/Frame.
- VRAM 120,1 → 120,8 MB. Dieser Band-VRAM trägt die Einschwing-Streuung der Sätze: bauSatz 2,93 → 4,35 MB bei gleicher
  Zellzahl, wasserSatz +0,49, bauWurf +0,28. Die Satz-Wache c956311e ist nicht in diesem Zweig.
- Die Flügel selbst: Tor-L0-Puffer 6,48 → 5,27 MB über die Boots, 7,79 → 6,57 im Toggle.

## Der verworfene Weg (Verbund)

- Alle Flügel eines Stoffs als EIN Leaf, die Drehung je Takt in einer eigenen Geometrie des Eintrags (Diff
  `1310-4/verbund/verbund-versuch.diff`). Ergebnis 12 statt 40 Gruppen.
- Im Stand CPU-Takt p50/p95 6,30/7,85 → 5,90/7,45 ms (ABBA ×3, `verbund/stand`).
- Gehend am Ring ändert sich die Nähe jedes Tors je Takt. Dort 20,5/27,3 → 23,2/30,2 ms, fps 42,9 → 39,0 (ABBA ×2,
  `verbund/gehen`; ~13 000 Ecken-Drehungen je Lauf à 0,12 ms samt Upload).
- Ein Schwung darf nie die Ecken kosten.

## Wände

Je EXIT=0 (`1310-4/waende.txt`):
- Puls ci-lokal 18/18;
- gate:tor-fern, gate:foundry-crossfade, gate:profiband (die Gates der Zone);
- gate:portal-membran (mit den zwei neuen F-Prüfungen), gate:portal-gestalt, gate:freie-slots;
- gate:haus-fern, gate:haus-welt (Haus-Türen laufen durch denselben Tick), playtest:fast 22/0.

CI: Lauf 38454550049 auf 6f264611 (`[ci voll]`) läuft.

## Pflicht-OFFEN Rest

- **CPU-Takt p95 an der Genesis:** im Toggle Median 5,7, Mittel 5,92 bei Soll 5,8 — damit im Streuband der Sitzung, nicht
  sicher darunter.
  - Die übrigen 20 Flügel-Züge sind links/rechts verschieden geteilt.
  - EIN Zug je Stoff verlangt die Drehung im Vertex-Programm: eine Flügel-Variante des Stoffs mit Winkel je Instanz, vor der
    Instanz-Matrix. Das ist kein kleiner Schnitt.
- **VRAM +2,1 MB:** Die Flügel nehmen 1,22 MB davon. Der Rest ist das Boden-Satz-Gesetz (bis 1,875×), benannt offen wie in 1310-3.

## Status ZWISCHENSTAND + Übergabe

- Branch welle-m-e-fluegel, Kopf 6f264611, gepusht `[ci voll]`, Arbeitsbaum sauber.
- Werkzeug `p3/fluegel`: `sitzung3.sh`, `schalter2.cjs`, `gehen2.cjs`, `gleich.cjs`, `offen.cjs`, `blick.cjs`, `auswertung.cjs`.
- 1310-2 (V18.544-ABAB) hat Vorrang, sobald der Kopf gemeldet ist.
