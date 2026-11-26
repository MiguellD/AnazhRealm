# Vorprüfung landmarken-geologie-3 — die Landmarke folgt der Geologie, ihr Wurf ist eine Funktion der Saat

Zweig `landmarken-geologie-3`, Kopf 4 auf main MAIN8 — nach dem Post des Koordinators vom 26.11. 11:22 („hast du nichts Rotes vor
dir: die nächste rote Sprosse derselben Leiter-Familie“). Kopf 3 (e576d8cc) fuhr im Bündel `buendel-mittag` und steht auf main.
Beanspruchte Sprosse: `karte2.erleben.spieler.wegfindung#1`. Status ZWISCHENSTAND.

Der Richter der Karte urteilt an main 64fcf12e (Radeon): „S1 · ROT Leser fehlt: der Wurf der Landmarke ist keine Funktion der Saat:
`_vegetationSampleSpawn` liest die geladene Welt — gemessen 1 von 51 Adressen“. Kopf 4 schneidet genau diesen Grund und misst, was
danach im Bild steht.

## Kopf 4 — der Wurf als Funktion der Saat, die Dämpfung der Luft als Zahl

| # | Ursache | Schnitt (Datei:Zeile) | Zahl vorher → nachher |
| --- | --- | --- | --- |
| K4-1 | Der Wurf der Landmarke las nur die geladene Welt: `_saatJe`, `_landAt` und `_voxelSurfaceY` im Rumpf von `_landmarkeChunk`. Kein Richter konnte eine andere Saat fragen, die Station maß 1 von 51 Adressen. | stamm/vegetation-baum.js:2572 `_landmarkenDesChunks(cx, cz, welt)` wirft für jede gereichte Welt (Lage, Saat, Boden, Land) und ändert nichts; ohne `welt` gilt die geladene. Der eine Leser im Spiel ist `_landmarkeChunk` (:2558). Linse: scripts/diag-phyto-tree.cjs:441 (eine andere Saat der Heimat, zweimal gefragt gleich, nicht wie die geladene; Selbsttest: ein Wurf, der nur die geladene Welt liest, fällt am Glied) und der Zeuge im Playtest scripts/playtest/feld-leben.cjs:1779. | Station: 1 → 51 von 51 Adressen · Linse: Saat „-andere“ 4 000 Tafel-Chunks, Bögen 3 (Gesetz 6,3) · Türme 17 (Gesetz 23,0), 20 Chunks anders als die geladene · Playtest W6.G P3: geladene Welt 12 Chunks wie gesetzt, 0 anders |
| K4-2 | Die Sicht-Dämpfung gab es nur als Knoten der Luft (`_luftEnsure` → `faktor`). Kein Richter konnte den Durchlass zu einer Landmarke in 1–3 km als Zahl lesen. | stamm/bild-himmel.js:2683 `_luftDurchlass(auge, punkt)`: e^{−τ} je Kanal, aus denselben Uniforms wie der Knoten (ohne Szene aus dem Gesetz: `_luftBeta`, `_luftSpektrum`, `LUFT.skalenHoeheM`). Linse: scripts/lib/licht-linsen.cjs:3259 gegen die Definition (das Integral von β(y) längs des Strahls, 4 000 Schritte); Selbsttest ohne Höhen-Term und ohne Weg-Faktor fällt am Glied. | Durchlass waagrecht 5 km 0,4840/0,3744/0,2533 = Definition (Fehler ≤ 10⁻⁴) · vom Hügel 2 km 0,7806/0,7151/0,6258 · zum Grat 3 km 0,7534/0,6816/0,5852 · beide Mutanten ROT beim Namen |
| K4-3 | Die erste Station (Kandidat 2bf58974) maß die Höhe aus dem Bauplan (Turm 16,8 m) und jeden Wurf des Gesetzes — die Zahl 34 von 51 war das Soll, nicht das Bild. | Die Linse misst die Landmarke im Bild mit den Lesern des Spiels (scripts/diag-phyto-tree.cjs:493, Auskunft, kein Urteil): Preset × Welt-Skala × höchste Hülle, gegen den Bauplan, und die Weite des Wurfs am Voxel-Ring. Der Kandidat liest dasselbe (Zweig `landmarken-station` 2096875d). | Linse: „felsturm gezeichnet ≤ 0.48 m (zacken × 0.34) · Bauplan 16.8 m · Wurf bis 275 m (Ring 4 × 43.2 m, höchstens 764 m)“ · Station: das Gesetz wirft in 1–3 km 720 Landmarken um 51 Saaten, im Bild 0 von 51 |

## Ehrlich halb: wegfindung#1 hat fünf Eingänge, zwei tragen jetzt einen Leser des Spiels (40 %)

1. **Der Wurf als Funktion der Saat** — K4-1.
2. **Die Dämpfung als Zahl** — K4-2.
3. **Offen: die Landmarke in Landmarken-Größe.** Das Studio zeichnet Felsturm und Felsbogen als `zacken` (Hülle ≤ 1,41 × Welt-Skala
   0,34 = 0,48 m; stamm/studio-bruecke.js:3344, foundry-core.js:700). Die Profis der Bänder des Gesetzes: Delicate Arch 18 m hoch,
   Öffnung 14 × 9,8 m; Double Arch Öffnung 45 m weit, 32 m hoch; Landscape Arch 93 m Spanne; ein Bogen zählt ab 0,9 m Öffnung (NPS,
   Stand 2026); die Wände der Sandstein-Türme im Elbsandstein bis 90–100 m (DAV, Stand 2026) — 30- bis 200-mal das gezeichnete Maß.
   Eine Verteilung der Höhen fand sich nicht; das Band der nächsten Welle braucht eine Gipfel-Liste. Der Playtest W6.G P3 prüft „Felsturm ist vertikal (Höhe 16,8)“ am Bauplan
   (scripts/playtest/feld-leben.cjs:1861), den keiner zeichnet. Der Schnitt gehört ins Studio: die Gestalt des Turms und des Bogens in
   ihrer Größe, mit Hülle und Stufen-Kette. Messname: „LANDMARKE IM BILD … gezeichnet“ (`gate:phyto-core`).
4. **Offen: die Landmarke in der Ferne.** Die Saat endet am gebauten Voxel-Ring (`_populateVoxelChunkVegetation` hinter
   `voxelChunks.has`, ≤ 764 m). Seit K4-1 ist der Wurf eine Funktion; ein Fern-Wurf kann ihn für 1–3 km lesen, ohne Chunk. Messname:
   „LANDMARKE IM BILD … Wurf bis“ (`gate:phyto-core`).
5. **Offen: C₀ der Landmarke.** Der Kontrast ist C₀ · Durchlass (Koschmieder 1924). Für C₀ fehlt die Leuchtdichte des Himmels je
   Richtung als CPU-Leser (welt-licht `himmelTexel` ist ein TSL-Knoten). Messname: der Richter der Karte, S1 „ungemessen: Kontrast“.

Kopf 1 bis 3 (die Feuerstelle setzt nur der Mensch, an 100 Zufalls-Orten Glutbrunnen 299 → 0 je km²; die zehn Roten der Batterie)
stehen mit Ursache, Schnitt und Zahl im Blatt von Kopf 3 (`git show e576d8cc:cloud-post/landmarken-geologie-3.md`).

## Stand (Vorprüfung 4)

- **Geschnitten:** der Wurf der Landmarke als Funktion der Saat (stamm/vegetation-baum.js:2572), die Dämpfung der Luft als Zahl
  (stamm/bild-himmel.js:2683); die Linsen in ihren Familien (scripts/diag-phyto-tree.cjs:441 und :493, scripts/lib/licht-linsen.cjs:3259,
  scripts/playtest/feld-leben.cjs:1779). Kein Kern.
- **Gemessen (vorher → nachher):** Adressen der Station 1 → 51 von 51 · Durchlass am Ort: kein Leser → 0,4840/0,3744/0,2533 auf 5 km
  = Definition · Landmarke im Bild in 1–3 km: 0 von 51 (gezeichnet ≤ 0,48 m, Wurf ≤ 275 m) — die Zahl des Richters bleibt ROT.
- **probeUrteil lokal:** PROBEURTEIL
- **Offen:** die Landmarke in Größe und Ferne, C₀ (oben, mit Messnamen).
- **Kopf:** KOPF40
- **Beanspruchte Sprosse:** `karte2.erleben.spieler.wegfindung#1`.
- Karte 2 gebucht 126 von 1 718. Status ZWISCHENSTAND.
