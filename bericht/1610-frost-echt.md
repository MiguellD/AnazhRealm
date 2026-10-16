# Bericht 1610 Frost-Wand auf der Karte — BERICHTIGUNG zum Index-Fund (GTX 1060)

**Status: ZWISCHENSTAND.**

## Berichtigung

**Der gemeldete „Index-Fund“ war kein Fehler des Spiels.**
- Die Meldung lautete „Index range (first: 0, count: 7704, format: Uint32) does not fit in index buffer size (15408)“,
  16-bit gebaut und 32-bit gelesen.
- Sie stammt aus dem **Selbsttest T2 der Frost-Wand**. T2 weitet einen Mensch-Index absichtlich „wie von einem fremden
  Backend“, damit die Wachen beißen. Alle T2-Prüfungen sind grün:
  - Die Index-Wache nennt `Group/Group/Group/mensch/torso/head/Mesh` beim Pfad (7704 × Uint32Array = 30816 B gebunden, der
    Puffer trägt 15408 B).
  - Die GPU-Wache zählt 245 Meldungen.
  - Die Bild-Probe erkennt das stehende Bild (0,85 %).
- **Karte IX `index-breite` hat damit keinen Täter.** Die Wand bewies an allen Schritten das Gegenteil:
  - I: jeder Index-Puffer der Welt-GPU trägt das gebundene Format;
  - G: kein WebGPU-Validierungsfehler;
  - W: die Wachen schweigen.

  Das galt für Ankunft, dritte Person, Werkstatt, Ich- und Hof-Bühne.
- **Dieser Satz in integ-probe 826717ed ist falsch:**
  - die Ausnahme `gate:weltbild-frost:echt` in `scripts/diag-ci-deckung.cjs` („Index-Bereich 7704 × Uint32 …“);
  - ebenso die Commit-Message ad9aa5be.

  Den Fehler habe ich gemacht. Richtig ist nur der Teil „das Bild folgt der Kamera nicht“. Der Satz in `diag-ci-deckung` gehört
  korrigiert, netto 0 Zeilen; das ist eine Entscheidung des nächsten Koordinators.

## Was auf der Karte wirklich rot ist (`npm run gate:weltbild-frost:echt`, CI=true, LINSE_GPU=karte, integ-probe aa74c324)

1. **B „das Bild folgt der Kamera“** an zwei Schritten:
   - **Ankunft** (+15 s nach dem Boot): 2,65 % der 16×16-Blöcke bewegt, Soll ≥ 5 %.
   - **Dritte Person** (+20 s): 2,46 %.
   - Werkstatt, Ich- und Hof-Bühne liegen bei 84–87 %.
   - **Verdacht, nicht gemessen:** Die Schritte fallen VOR das kalte Weltbild der GTX (≈ 20–21 s, Kalt-Läufe des Tages
     20,2–22,3 s). Steht dann noch der Ladeschirm oder das halbe Bild, dreht die Kamera ein Bild, das sich kaum ändert.
   - Die Repro folgt: Bild-Bewegung über die Zeit nach dem Boot, an derselben Drehung.
2. **Der Boot-Wächter (`welt-boot`) zählt die absichtliche T2-Meldung als „1 Fehler der Welt“.** Im `--echt`-Weg ist die Wand
   damit auch ohne B rot; das ist eine Lücke der Linse, kein Spiel-Fehler.

## Rohdaten

- **Pfad:** `bericht/1610-frost-echt/frost-echt.txt`. Darin der volle Lauf, 86 s, Exit 1.

## Status ZWISCHENSTAND + Übergabe

- **Kein Code-Commit.**
- **Erster Echt-Job:** `bericht/1610-echt-erstlauf.md`. B ist nachgemessen (Nachtrag unten).

## Nachtrag 16.10. ~12:45 — DER TÄTER BEIM NAMEN: die Boot-Wartung der Linse, nicht das Spiel

- **Repro an integ-probe 826717ed-Stand (Baum echt-karte, aa74c324-Basis), GTX, `--echt --bilder`:**

  | Schritt | Zeit nach dem Boot | bewegte Blöcke | Urteil |
  |---|---|---|---|
  | Ankunft | +15 s | 3,13 % | ROT |
  | Dritte Person | +19 s | 3,79 % | ROT |
  | Werkstatt, Ich-Bühne, Hof-Bühne | – | 86 %, 86 %, 87 % | grün |

- **Die Bilder** (`bericht/1610-frost-echt/ankunft-a.png`/`-b.png`, `dritte-person-a.png`/`-b.png`) zeigen in beiden
  Schüssen den **Ladeschirm** („Die Welt erwacht …“ mit der Laufzeile „330 Bäume und Bauten wachsen · das Dorf wird
  geplant …“).
  - Die Kamera dreht dahinter. Was sich bewegt, ist nur die Laufzeile, ≈ 3 % der Blöcke.
- **Täter:** `scripts/diag-weltbild-frost.cjs`, die Boot-Wartung vor dem ersten Schritt.
  - Sie wartet auf `rendererReady && playerMesh && voxelChunks.size >= minChunks` (25 Chunks), nicht auf das erste
    Weltbild (`state._weltbildDa`, das Ende des Ladeschirms).
  - Auf der Radeon fällt das Weltbild vor den Schritt, auf der GTX (kaltes Weltbild ≈ 20–21 s) danach.
- **Schnitt-Vorschlag (nicht von mir geschnitten, Decke D3):** Im `--echt`-Weg wartet die Boot-Schleife auch auf
  `st._weltbildDa`, in derselben Zeile, netto 0.
- **Die zweite Lücke bleibt:** `welt-boot` zählt die absichtliche T2-Meldung als Welt-Fehler (siehe oben).
- **Erwartung nach beiden Schnitten:** Die Frost-Wand ist auf der GTX grün und kann in den Job `echt`.
- **Rohdaten:** `bericht/1610-frost-echt/repro-lauf.txt`, die fünf Bilder.
