# Stations-Kandidat erleben.spieler.wegfindung#1 — Kontrast-Leser der Landmarke (landmarken-station, 26.11.)

Basis: `origin/punkte-maschine` (basis.txt). Die Datei `k2-erleben.js` ist die ganze Station und `diff.txt` der Unterschied. Das Spiel kommt aus
`landmarken-geologie-4`: der Kandidat ruft `_landmarkenDesChunks` und `_luftDurchlass`. Fehlen sie, nennt er beide beim Namen (`fehlt`).

## Ursache
- Die Station maß nur die geladene Saat: 1 von 51 Adressen, die anderen 50 „ohne Fähigkeit“. Der Wurf der Landmarke las die geladene
  Welt: `_saatJe`, `_landAt` und `_voxelSurfaceY` in `stamm/vegetation-baum.js` `_landmarkeChunk`.
- Die Sicht-Dämpfung gab es nur als Knoten der Luft (`stamm/bild-himmel.js` `_luftEnsure` → `faktor`). Kein Richter konnte den Durchlass
  zu einer Landmarke in 1–3 km als Zahl lesen.

## Schnitt
- Spiel (landmarken-geologie-4):
  - `_landmarkenDesChunks(cx, cz, welt)` wirft für jede gereichte Welt (Lage, Saat, Boden, Land). `_landmarkeChunk` liest den Wurf,
    ohne gereichte Welt gilt die geladene.
  - `_luftDurchlass(auge, punkt)` gibt e^{−τ} je Kanal zurück. Er liest dieselben Uniforms wie `faktor`.
- Station:
  - Je Saat die Lage aus dem Gelände-Kern (`lageAus`) mit Normalform, Ort-Gesetz und Meer der warmen Welt.
  - Das Auge an der Pose der Wiese, gehoben auf den Boden dieser Saat. Der Kegel kommt aus `_frustumVon`.
  - Je Landmarke in 1–3 km im Kegel: freie Sicht über dem Gelände-Gesetz zu ihrem Gipfel. Die Höhe kommt aus dem Bauplan des Spiels
    (`_defaultBlueprints`: Turm 16,8 m, Bogen 7,7 m).
  - Dazu der Grund hinter dem Gipfel (Hang oder Himmel) und der Durchlass. Die nächste sichtbare Landmarke trägt den Wert.
  - S1 urteilt mit der Obergrenze, dem Anteil sichtbarer Landmarken (das Muster der Station davor). Liegt sie unter 0,9, fällt S1 ROT
    beim Namen.

## Zahl (Werkbank an der Wiese, swiftshader — Mechanik, nie Bild)
- Gemessen 1 → **51 von 51** Adressen, 1 052 ms für den ganzen Fächer (je Saat höchstens 61 ms). Messung: `messung-swiftshader.json`.
- Sichtbare Landmarke im Kegel in 1–3 km: **34 von 51**, Obergrenze **0,667 < 0,9**, S1 **ROT** beim Namen.
  - Die geladene Saat hat 16 Landmarken in 1–3 km. Eine steht im Kegel, aber verdeckt.
  - Von 50 fremden Saaten haben 47 eine Landmarke im Kegel; frei sichtbar ist sie bei 34, davon 12 vor Himmel und 22 vor Hang.
- Durchlass (550 nm) zur nächsten sichtbaren Landmarke: min **0,576**, Mittel **0,705**.

## Wände
- `node punkte.cjs liste`: Kandidat = Basis (1 976 Stationen · 420 Kriterien · fehlt 15 · Fehler 0, keine neue Rot-Zeile).
- Leiter ≤ 45 s am Gerät: der Fächer braucht 1,05 s für 51 Adressen (swiftshader). Die ganze Leiter am Gerät ist ungemessen, weil die
  Cloud kein Gerät hat (`punkte.cjs run --geraet headless`: „keine Station auf headless“).
- Stichprobe durch den Leser des Spiels: der Kandidat fächert nicht im Kern. Jede Adresse ruft in der Seite die Funktion, die
  `_landmarkeChunk` liest.
- Zeuge der geladenen Saat: jede gesetzte Landmarke gegen die Funktion über dem Boden des Gesetzes.
  - An der Wiese ist das 0 von 0: im gebauten Ring liegt kein Tafelland.
  - Über der Tafel trägt der Playtest W6.G P3 den Zeugen: 12 Chunks gleich, 0 anders.

## Ehrlich offen (2 von 3 Eingängen des Kontrast-Gesetzes haben einen Leser des Spiels)
1. **C₀ der Landmarke.** Der Kontrast ist C₀ · Durchlass (Koschmieder 1924; das Bild mischt mit 1 − Durchlass die Himmels-Sicht hinein).
   Für C₀ fehlt die Leuchtdichte des Himmels je Richtung als CPU-Leser: welt-licht `himmelTexel` ist ein TSL-Knoten, und
   `_himmelsTafelLesen` liest nur die Bestrahlung. Das ist der nächste Spiel-Schnitt: die Himmels-Sicht auf die CPU, eine Lesung des
   Sicht-Ziels wie die Bestrahlungs-Tafel. Er braucht ein Gerät, weil der Null-Renderer keinen Himmel malt. Fels × Licht hat Leser:
   `_atmoSonne`, `_himmelsBestrahlung` und der Stoff des Bauplans (Playtest: Felsbogen hex 5d5d5d).
2. **Der Zeuge am Gerät (b):** |Kontrast Gesetz − Kontrast Pixel| ≤ 0,03 an ≥ 3 Saaten mit Bild und Maske. Er braucht C₀ und ein Gerät.
3. **Seen und Flüsse einer fremden Saat:** die Hydrosphäre rechnet der Faden nur für die geladene. Land ist hier der Boden über dem Meer
   + 0,4 m.
