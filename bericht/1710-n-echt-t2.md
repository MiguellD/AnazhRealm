# Bericht 1710-n Schritt 1 — echt T2: der Täter beim Namen

**Status: ZWISCHENSTAND.**
- **Geschnitten:** Der erste rote Stand ist **7f41463d** (WIP E2 „der Leib zeichnet als Bündel", über 130ba565 gemergt). Die Wurzel
  liegt zweimal in der LINSE, nicht im Spiel. Schnitt auf `echt-t2` ab 25f53923: f45ee994, nur `scripts/diag-weltbild-frost.cjs`,
  netto −5 Zeilen.
- **Gemessen** auf der GTX, `gate:weltbild-frost:echt`:
  - am Kopf 25f53923 vorher EXIT=1 mit den vier T2-Befunden der CI;
  - mit dem Schnitt EXIT=0 in 2 von 2 Läufen, die Index-Wache nennt den Täter am Bündel-Pfad.
- **Offen:** Merge, Zweig-CI und der echt-Neulauf an integ-probe (Koordinator).

## Nachstellen am Kopf und Gegenprobe main

`p3/n1710/frost.sh` fährt `CI_KLASSE=gpu LINSE_GPU=karte node scripts/diag-weltbild-frost.cjs --echt --bilder …` (wie der Job echt). Um
jeden Lauf liegt das Schloss `omen-1710-n`. Rohdaten: `bericht/1710-n/echt-t2/`.

| Stand | Lauf | Exit | T2 |
|---|---|---|---|
| 25f53923 (Kopf integ) | kopf-25f5-1 | EXIT=1 | ❌ Index-Wache · ❌ GPU-Wache `null` · ❌ Hörer 0 Meldungen · ❌ Bild 89,49 % bewegt — dieselben vier wie CI 39040554053 |
| 1215d560 (main) | bisect-1215d560-1 / -2 | EXIT=0 / EXIT=0 | ✅ `Group/Group/Group/mensch/torso/head/Mesh: 7704 × Uint32Array = 30816 B gebunden, der Puffer trägt 15408 B`, GPU-Wache 286, Bild 0,66 % |

Main ist grün. Es ist also nicht der Platz (Treiber, Chrome nach dem Neustart), sondern der Code.

## Bisektion 1215d560..25f53923

`git bisect run p3/n1710/bisect-t2.sh`: je Stand zwei Läufe; rot nur, wenn beide T2 rot sind. Alle 12 Läufe waren eindeutig, kein
Wackler. Log: `bisect-t2-gitlog.txt`.

| Stand | Lauf 1 | Lauf 2 | Urteil |
|---|---|---|---|
| e3dea1a3 (WIP D3d, `__weltStehtNach`) | EXIT=0 | EXIT=0 | gut (D3d unschuldig) |
| 130ba565 (Merge E2 Leib-Bündel) | EXIT=1, T2 ❌ | EXIT=1, T2 ❌ | schlecht |
| 60256641 (WIP E2) | EXIT=1, T2 ❌ | EXIT=1, T2 ❌ | schlecht |
| 7f41463d (WIP E2 Leib-Hülle) | EXIT=1, T2 ❌ | EXIT=1, T2 ❌ | **schlecht — erster schlechter** |
| b4f0e489 (WIP E2 Objekt-Gang) | EXIT=0 | EXIT=0 | gut |

7f41463d macht den Wrap jeder Gelenk-Gestalt zum Bündel (`_leibHuelle` → `THREE.BundleGroup`, Stand je Aufnahme
`_leibBuendelStand`).

## Die Wurzel: zwei Annahmen der Linse, beide falsch seit E2

1. **T2 weitete einen toten Leib.**
   - In echt hielt `pruefRaum` den Spieler-Leib einmal fest (`F.leib = r.state.playerMesh`).
   - S1 wechselt die Seele sechsmal über `applyPlayerSoul`, und jeder Wechsel ersetzt `state.playerMesh`. Der headless-Weg setzt danach
     `F.leib = neu`, der echt-Weg nie.
   - T2 suchte sein Ziel also im ALTEN Leib, der in keiner Szene mehr hängt (Lehre: `st.playerMesh` wird ersetzt).
   - Bis E2 fiel das nicht auf: Der tote Leib teilt die Vorlagen-Geometrie des Ofens mit dem lebenden, und der lebende zeichnete lose.
     Der nächste Draw band das geweitete Format, die Wachen bissen.
2. **Ein Bündel zeichnet seine Aufnahme, nicht das Array von jetzt.**
   - Seit 7f41463d ist der lebende Leib ein Bündel. r184 spielt es ab, solange seine Version steht (`_renderBundle`, vendor gelesen).
   - `_leibBuendelStand` nimmt neu auf, wenn Objekt, Stoff, Geometrie, Attribut-Versionen oder Gruppe wechseln. Das Weiten setzt nur
     `index.array` und hebt keine Version, genau wie ein fremdes r184-Backend.
   - Die GPU zieht also weiter die schmale, gültige Aufnahme. Kein Draw bindet uint32, keine Validierung entsteht, das Bild folgt
     der Kamera (89,5 %).

**Das Spiel verschluckt nichts.**
- Der Bündel-Replay zeichnet richtig: dieselben Bytes im 16-bit-Puffer, das Format der Aufnahme.
- Sobald das Bündel neu aufnimmt (Stufe, Sicht, Gerät, Kleid, Textur-Abschied), geht jeder Zug durch `backend.draw` mit der
  Index-Wache. Dann nennt die Index-Wache den Täter, die GPU-Wache zählt, und das Bild steht. Genau das zeigt der Schnitt unten.
- Ein echter fremder Weiter-Weg bleibt durch `_backendGesetz` (schmaler Index an jedem Backend) zu. Gefroren wäre die Welt erst bei
  der nächsten Neu-Aufnahme, gemeldet beim Namen.
- Darum kein Schnitt im Spiel und keine Karte.

## Der Schnitt (`echt-t2`, ab 25f53923, nur die Linse)

- `pruefRaum` (echt): `F.leib` ist ein Getter auf `r.state.playerMesh`, also der Leib von JETZT.
- T2: Nach dem Weiten nimmt jedes Bündel über dem Ziel neu auf (`needsUpdate`), wie es jeder Wechsel des Leibs tut. Der Täter ist
  diese Aufnahme.
- Die Ziel-Bedingung ist auf zwei Zeilen verdichtet; die Semantik ist gleich (sichtbar, Index uint16, GPU-Puffer da).
- `git diff --stat`: 1 Datei, +7 −12. scripts/ netto −5 Zeilen.

## Beweis (die finalen Bytes von f45ee994)

| Wand | Stand | Exit | Befund |
|---|---|---|---|
| gate:weltbild-frost:echt (GTX) | 25f53923 ohne Schnitt | EXIT=1 (kopf-25f5-1) | die vier T2-Befunde, Bild 89,49 % bewegt |
| gate:weltbild-frost:echt (GTX) | erster Schnitt (nur Bündel neu, F.leib alt) | EXIT=1 (schnitt-1) | derselbe Befund: der tote Leib — die zweite Wurzel |
| gate:weltbild-frost:echt (GTX) | f45ee994 | **EXIT=0** (schnitt-2) | ✅ `Group/BundleGroup/Group/mensch/torso/head/Mesh: 7704 × Uint32Array = 30816 B gebunden, der Puffer trägt 15408 B` · GPU-Wache 223 · Hörer 444 („Index range … does not fit in index buffer size (15408)") · Bild 0,57 % |
| gate:weltbild-frost:echt (GTX) | f45ee994 | **EXIT=0** (schnitt-3) | ✅ derselbe Pfad · GPU-Wache 226 · Bild 0,66 % |
| gate:weltbild-frost (swiftshader) | f45ee994 | EXIT=0 (final-frost-sw.log, 115 s) | T2 ✅ am Bündel-Pfad |
| npm run check | f45ee994 | EXIT=0 (final-check.log) | |
| npm run playtest:fast | f45ee994 | EXIT=0 (final-playtest-fast.log) | 22 ✅ · 0 ❌ |

Bilder (`bericht/1710-n/echt-t2/`):
- `kopf-taeter-a/b.png`: am Kopf ohne Schnitt dreht sich das Bild weiter.
- `schnitt-taeter-a/b.png`: mit dem Schnitt steht das Bild nach dem Täter.
- `schnitt-ankunft-a.png`: die Welt am Genesis-Ring, kein Ladeschirm.

## Übergabe

- `echt-t2` ist mit `[ci voll]` gepusht. Merge und der echt-Neulauf an integ-probe per API liegen beim Koordinator.
- Die Bisektion lief im Baum `n1710-t2` (danach `git bisect reset`).
- Weiter mit Schritt 2 (B4).

## Nachtrag 23:53 — echt an integ-probe

Der Koordinator spulte integ-probe auf f45ee994 vor. Der Job echt **39071678447** lief auf der OMEN von 23:37 bis 23:53 (hooks/hook.log)
und ist **success**, jeder Schritt einschließlich der Frost-Wand. Die Sperre auf integ-probe ist gefallen. Die B4-Serie gab dem Job
Vorfahrt und wartete danach 180 s CI-Ruhe ab.
