# Stations-Kandidat erleben.spieler.wegfindung#1 — die Landmarke im Bild (landmarken-station, 26.11.)

Basis: `origin/punkte-maschine` (basis.txt). Die Datei `k2-erleben.js` ist die ganze Station und `diff.txt` der Unterschied. Das Spiel kommt aus
`landmarken-geologie-4`: der Kandidat ruft `_landmarkenDesChunks` und `_luftDurchlass`. Fehlen sie, nennt er beide beim Namen (`fehlt`).

## Ursache
- Die Station maß nur die geladene Saat: 1 von 51 Adressen, die anderen 50 „ohne Fähigkeit“. Der Wurf der Landmarke las die geladene
  Welt: `_saatJe`, `_landAt` und `_voxelSurfaceY` in `stamm/vegetation-baum.js` `_landmarkeChunk`.
- Die Sicht-Dämpfung gab es nur als Knoten der Luft (`stamm/bild-himmel.js` `_luftEnsure` → `faktor`). Kein Richter konnte den Durchlass
  zu einer Landmarke in 1–3 km als Zahl lesen.
- Die erste Fassung dieses Kandidaten (2bf58974) maß die Höhe aus dem Bauplan (`_defaultBlueprints`: Turm 16,8 m, Bogen 7,7 m) und jede
  Landmarke, die das Gesetz wirft. Das Bild zeigt beides nicht: das Studio zeichnet Turm und Bogen als `zacken` (Hülle ≤ 1,41 × Welt-Skala
  0,34 = 0,48 m), und die Saat sät nur Chunks des gebauten Voxel-Rings (`_populateVoxelChunkVegetation` hinter `voxelChunks.has`).
  Ihre Zahl 34 von 51 war das Soll des Bauplans, nicht das Bild.

## Schnitt
- Spiel (landmarken-geologie-4):
  - `_landmarkenDesChunks(cx, cz, welt)` wirft für jede gereichte Welt (Lage, Saat, Boden, Land). `_landmarkeChunk` liest den Wurf,
    ohne gereichte Welt gilt die geladene.
  - `_luftDurchlass(auge, punkt)` gibt e^{−τ} je Kanal zurück. Er liest dieselben Uniforms wie `faktor`.
- Station:
  - Je Saat die Lage aus dem Gelände-Kern (`lageAus`) mit Normalform, Ort-Gesetz und Meer der warmen Welt.
  - Das Auge an der Pose der Wiese, gehoben auf den Boden dieser Saat. Der Kegel kommt aus `_frustumVon`.
  - Die Höhe im Bild: Preset (`_foundryPresetFor`) × Welt-Skala (`_foundryWorldScaleMatrix`) × die höchste Hülle seiner Gestalten
    (PHYTO_PRESETS `fx.huellen`). Ohne Preset mit Hülle nennt die Station die Art beim Namen (`fehlt`).
  - Der Wurf im Bild: nur Chunks im Ring (|Δcx|, |Δcz| ≤ Ziel-Ring). Was das Gesetz in 1–3 km wirft, zählt `n13Gesetz` daneben.
  - Je Landmarke im Bild in 1–3 km im Kegel: freie Sicht über dem Gelände-Gesetz zu ihrem Gipfel, der Grund dahinter und der Durchlass.
  - S1 urteilt mit dem Anteil sichtbarer Landmarken (die Obergrenze; der Kontrast fehlt an C₀). Unter 0,9 fällt S1 ROT beim Namen.

## Zahl (Werkbank an der Wiese, Ring 4, swiftshader — Mechanik, nie Bild)
- Gemessen 1 → **51 von 51** Adressen, 870 ms für den ganzen Fächer (je Saat höchstens 35 ms). Messung: `messung-swiftshader.json`.
- Das Gesetz wirft in 1–3 km um jede der 51 Saaten Landmarken: **720** zusammen (`n13Gesetz`).
- Im Bild: **0 von 51**. Gezeichnet ist jede Landmarke ≤ **0,48 m** hoch, geworfen nur bis **275 m** (Ring 4 × 43,2 m, Ecke; Ring 12
  höchstens 764 m). Die Obergrenze ist **0**, S1 **ROT** beim Namen.
- Die Linse des Spiels nennt dieselben Zahlen: `node scripts/diag-phyto-tree.cjs`, Zeile „LANDMARKE IM BILD“.

## Wände
- `node punkte.cjs liste`: Kandidat = Basis (1 976 Stationen · 420 Kriterien · fehlt 15 · Fehler 0, keine neue Rot-Zeile).
- Leiter ≤ 45 s am Gerät: der Fächer braucht 0,87 s für 51 Adressen (swiftshader). Die ganze Leiter am Gerät ist ungemessen, weil die
  Cloud kein Gerät hat.
- Zeuge der geladenen Saat: jede gesetzte Landmarke gegen die Funktion über dem Boden des Gesetzes. An der Wiese ist das 0 von 0: im
  gebauten Ring liegt kein Tafelland. Über der Tafel trägt der Playtest W6.G P3 den Zeugen: 12 Chunks gleich, 0 anders.

## Ehrlich offen (die Täter des Bilds, je mit Messname)
1. **Die Landmarke in Landmarken-Größe.** Das Studio zeichnet Turm und Bogen als Kiesel (`zacken`, ≤ 0,48 m). Die Bänder des Gesetzes
   (Arches, Sächsische Schweiz, Dartmoor) tragen Türme und Bögen von 5 bis 100 m. Der Schnitt gehört ins Studio: eine Gestalt des Turms
   und des Bogens in ihrer Größe, mit Hülle und Stufen-Kette. Messname: „LANDMARKE IM BILD … gezeichnet“.
2. **Die Landmarke in der Ferne.** Die Saat endet am Voxel-Ring (≤ 764 m). Der Wurf ist jetzt eine Funktion der Saat; ein Fern-Wurf kann
   ihn für 1–3 km lesen, ohne Chunk. Messname: „LANDMARKE IM BILD … Wurf bis“.
3. **C₀ der Landmarke.** Der Kontrast ist C₀ · Durchlass (Koschmieder 1924). Für C₀ fehlt die Leuchtdichte des Himmels je Richtung als
   CPU-Leser (welt-licht `himmelTexel` ist ein TSL-Knoten, `_himmelsTafelLesen` liest nur die Bestrahlung).
4. **Der Zeuge am Gerät:** |Kontrast Gesetz − Kontrast Pixel| ≤ 0,03 an ≥ 3 Saaten mit Bild und Maske. Er braucht 1–3 und ein Gerät.
5. **Seen und Flüsse einer fremden Saat:** die Hydrosphäre rechnet der Faden nur für die geladene. Land ist hier der Boden über dem Meer
   + 0,4 m.
