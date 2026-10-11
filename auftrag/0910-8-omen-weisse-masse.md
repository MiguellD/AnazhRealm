# Auftrag 0910-8 an den OMEN — O4: die weiße Masse (bodenSatz nah blass, fern oliv)

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Karte O4 der Entscheidung 11.10. (auftrag/karten-1110/entscheidung.md §4.2),
Risiko R1, Kartenkopf wie auftrag/karten-1110/K01.md (WIP alle 45 min mit „[skip ci]“, letzter Push ohne; Kontext-Deckel ~250k mit Übergabe).
Branch `welle-m-weisse-masse` ab **main 66005ca6** (per ls-remote), Ports 7900–7909. Der V18.539-Messauftrag kommt heute Abend und hat dann Vorrang.

## Befund (Auge 10.10., artifacts auf dem Radeon-PC: auge/1010/befund.md, Bilder 08–10)
- Kamera 420 m über (843, −43), Welt „warme-hain“: das Quadrat der Chunk-Ringe (~270 m) ist weiß-grau, das Panorama darum oliv.
- Ausblenden der 36 Chunk-Meshes ändert nichts; Ausblenden von `bodenSatz` (Boden-Satz, MeshStandardNodeMaterial) nimmt das Weiß ganz.
- Auch aus 60 m sieht der Waldboden zwischen den Kronen blass-grau aus; am Boden deckt die Nah-Wiese ihn zu.
- Verdacht: die Boden-Farbe des `bodenSatz` im Wald (Waldboden nach dem Farb-Gesetz, `_kronenStreuAt`) und die Boden-Funktion fern
  (Panorama) sind zwei Farben derselben Stelle.

## Schnitt
EINE Boden-Farbe je Ort: nah (bodenSatz) und fern (Panorama/Feld) lesen dieselbe Quelle; der Wald-Boden folgt dem Farb-Gesetz (Lehre 21:
Paletten-Hex ist sRGB, die Albedo linear). Finde, wo die beiden auseinanderlaufen (Wald-Gewicht, Streu-Karte, Linearisierung,
Licht/Belichtung je Pass), schneide an der Wurzel.

## Linse vorher ROT
`werkbank albedo` / `diag-albedo-zensus` erweitert (bestehende Familie): Albedo nah (bodenSatz) gegen fern (Panorama) an DERSELBEN Stelle
im Wald und auf der Wiese, Täter beim Namen; Selbsttest; CI ≤ 3 min.

## Abnahme
Δ nah ↔ fern im Rausch-Band an ≥ 3 Wald- und ≥ 3 Wiesen-Orten; Makro-Bild aus 420 m nachher ohne weißes Quadrat (Ausgabe-Pfad);
Band unverändert. Bericht `bericht/0910-8-weisse-masse.md`.
