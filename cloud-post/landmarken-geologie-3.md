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

## Kopf 5 — die Landmarke in ihrer Größe (dieselbe Sprosse, dasselbe Gesetz: das Bild der Landmarke)

| # | Ursache | Schnitt (Datei:Zeile) | Zahl vorher → nachher |
| --- | --- | --- | --- |
| K5-1 | Das Studio zeichnete Felsturm und Felsbogen als `zacken`: ein Block ≤ 1,41 × Welt-Skala 0,34. Der Bauplan sagte 16,8 m, das Bild 0,48 m. | foundry-core.js:701–702 Welt-Skala 1 für beide, in Welt-Metern gebaut; stamm/studio-bruecke.js:3346–3348 jede Art ihr eigenes Preset (statt `zacken`), dasselbe in stamm/bau-vorlagen.js und scripts/playtest/studio.cjs; Sprache in stamm/daten.js. | gezeichnet 0,35–0,48 m → Turm 8,00–68,62 m · Bogen 12,72–19,91 m |
| K5-2 | Der Turm hatte keine Gestalt und kein Band. | phyto-core.js:2087 `buildFelsturmGeometry` (Ringe übereinander, Bänke mit Fugen, Kluft-Querschnitt); foundry-core.js:5632 `deriveParamsTurm`: die Höhe log-normal aus den Klettergipfeln der Sächsischen Schweiz (Listen Brand- und Rathener Gebiet, Wikipedia, Stand 07.02.2026: N = 233, 8–75 m, Median 20 m; Anpassung 22,4 m, σ(ln) 0,60); :4995 das Preset mit exakter Hülle je Gestalt (nach außen auf den Zentimeter, ohne Zuschlag). | Turm: 16 Gestalten 8,00–68,62 m, Median 22,43 m (geometrisches Mittel des Bands 22,4) |
| K5-3 | Der Bogen hatte keine Öffnung. | phyto-core.js:2207 `buildFelsbogenGeometry`: ein Block mit Loch, innen die Ellipse der Öffnung, außen die kantige Superellipse, Füße 0,6 m im Boden; foundry-core.js:5663 `deriveParamsBogen`: Spanne log-gleich 17–26,5 m, lichte Höhe 0,60–0,65 · Spanne, Stärke 0,113 · Spanne (Prebischtor 26,5 / 16 / 3 m, Kuhstall 17 / 11 m; Wikipedia, Stand 2026); :5038 die Hülle als 9 Boxen je Gestalt (Pfeiler je Scheibe, Sturz). | Bogen: lichte Höhe 10,5–16,8 m, Breite 26–40 m, ≤ 1 280 Dreiecke; Öffnung am Boden ≥ 16,7 m in 16 von 16 Gestalten, der Turm Höhe : Breite ≥ 2,49 (Playtest W6.G P3) |
| K5-4 | Die Kollision des Fels kannte nur EINE Box vom Boden: ein Bogen wäre ein Klotz ohne Durchgang. | stamm/gelaende-kollision.js:1362 `_felsBlockerParts` liest die Zeile als eine Box oder als Liste von Boxen, alles andere ist ein Kern-Pflicht-Bruch; der Leser :191 iteriert alle. Linse: scripts/diag-kollision-bild.cjs:25 (D) DURCHGANG (die Mitte der Öffnung in 0,5/1/1,8 m frei) und der Schmuggel :479 (eine Box über den ganzen Bogen wird beim Namen genannt); Selbsttest :239–240. | Box ohne Bild 0,18 / 1,06 m → 0,10 / 0,09 m · (D) frei in 16 von 16 Gestalten · Schmuggel `felsbogen#5` ROT beim Namen |

## Ehrlich halb: wegfindung#1 hat fünf Eingänge, drei tragen jetzt einen Leser des Spiels (60 %)

1. **Der Wurf als Funktion der Saat** — K4-1.
2. **Die Dämpfung als Zahl** — K4-2.
3. **Die Landmarke in Landmarken-Größe** — K5-1 bis K5-4. Ehrlich offen darin: das Band der Bögen steht auf zwei Felstoren (N = 2, kein
   Quantil; der Katalog „List of longest natural arches“ trägt nur Spannen ≥ 54,9 m), die Schlankheit des Turms (3,8 aus dem Bauplan) und die Bank-Stärke haben kein äußeres Band, das Bild auf
   echter GPU fehlt (die Werkbank stürzt in diesem Container; das Bild kam aus dem Rasterer am gebauten Mesh). Messname: „LANDMARKE IM
   BILD … gezeichnet“ (`gate:phyto-core`).
4. **Offen: die Landmarke in der Ferne.** Die Saat endet am gebauten Voxel-Ring (`_populateVoxelChunkVegetation` hinter
   `voxelChunks.has`, ≤ 764 m). Seit K4-1 ist der Wurf eine Funktion; ein Fern-Wurf kann ihn für 1–3 km lesen, ohne Chunk. Messname:
   „LANDMARKE IM BILD … Wurf bis“ (`gate:phyto-core`).
5. **Offen: C₀ der Landmarke.** Der Kontrast ist C₀ · Durchlass (Koschmieder 1924). Für C₀ fehlt die Leuchtdichte des Himmels je
   Richtung als CPU-Leser (welt-licht `himmelTexel` ist ein TSL-Knoten). Messname: der Richter der Karte, S1 „ungemessen: Kontrast“.

Kopf 1 bis 3 (die Feuerstelle setzt nur der Mensch, an 100 Zufalls-Orten Glutbrunnen 299 → 0 je km²; die zehn Roten der Batterie)
stehen mit Ursache, Schnitt und Zahl im Blatt von Kopf 3 (`git show e576d8cc:cloud-post/landmarken-geologie-3.md`).

## Stand (Vorprüfung 4)

- **Geschnitten:** der Wurf der Landmarke als Funktion der Saat (stamm/vegetation-baum.js:2572), die Dämpfung der Luft als Zahl
  (stamm/bild-himmel.js:2683); Felsturm und Felsbogen in ihrer Größe (phyto-core.js:2087 und :2207, foundry-core.js:5632 und :5663),
  die Kollision mit Öffnung (stamm/gelaende-kollision.js:1362); die Linsen in ihren Familien (scripts/diag-phyto-tree.cjs:441 und :493,
  scripts/lib/licht-linsen.cjs:3259, scripts/diag-kollision-bild.cjs:25, scripts/playtest/feld-leben.cjs:1779 und :1878). Goldens nur
  Daten (recipes, render-config, manifest), jedes Mesh der Benchmark byte-gleich.
- **Gemessen (vorher → nachher):** Adressen der Station 1 → 51 von 51 · Durchlass am Ort: kein Leser → 0,4840/0,3744/0,2533 auf 5 km
  = Definition · gezeichnet 0,35–0,48 m → Turm 8,00–68,62 m, Bogen 12,72–19,91 m mit Öffnung · Landmarke im Bild in 1–3 km: 0 von 51
  (Wurf ≤ 275 m) — die Zahl des Richters bleibt ROT bis zum Fern-Wurf.
- **probeUrteil lokal:** PROBEURTEIL
- **Offen:** die Landmarke in der Ferne, C₀, das Band der Bögen aus einem Katalog (oben, mit Messnamen).
- **Kopf:** KOPF40
- **Beanspruchte Sprosse:** `karte2.erleben.spieler.wegfindung#1`.
- Karte 2 gebucht 126 von 1 718. Status ZWISCHENSTAND.
