# Bericht 1610 Frost-S5 — Täter: die LINSE misst die Welt-Verdichtung mit, kein Leck je Regler-Wert

**Status: ZWISCHENSTAND.** Frage des Koordinators: „ist es ein echtes Leck je Regler-Wert … oder misst S5 die Einrichtung mit?“

## Urteil

**LINSE. S5 misst die Verdichtung der Welt-Sätze mit (W7), nicht den Werkstatt-Ofen. Ohne einen einzigen Regler-Wert wächst der
Speicher genauso.**

| Lauf (Karte, frost-probe = cee33f91 + PROBE) | 36 Schritte | Puffer vorher → nachher | S5-Urteil (Basis → Ende) |
|---|---|---|---|
| F: nur Welt-Frames (`E.leeren` = 8 × `_loopRender`), kein Regler, kein Ofen | F · F2 · F3 | 179,0 → 190,8 · 176,0 → 187,7 · 174,1 → 184,5 | 291,2 → 301,6 · 287,4 → 298,0 · 287,2 → 298,0 ROT |
| Z: 36 Regler-Züge (wie S5) | Z | 174,9 → 186,9 | 288,5 → 301,1 ROT |
| Leerlauf: 36 Schritte ohne Frame, ohne Zug | leer-1 | 175,5 = 175,5 | flach |

- **Wachstum ohne Ofen:** F (ohne Ofen) und Z (mit Ofen) wachsen gleich: Puffer +10,4 bis +12,0 MB, in Stufen bei einzelnen Schritten.
- **Ofen-Werte grün:** Memo, Geometrie-Zahl, Grafikspeicher und Stoff-Hörer des Ofens bleiben in jedem Lauf grün.
- **Der Mechanismus:**
  - Jeder Schritt zeichnet echte Welt-Frames: `E.leeren` → `F.zeichne(8)` → `_loopRender`.
  - `_loopRender` ruft `_tickChunkSatz` (`stamm/17b.js:1159`) → `_chunkSatzVerdichten` (`17b.js:647`) → `_chunkSatzGeometrie`
    (`17b.js:591`, Neuanlage `:598/601/605`).
  - Ein Satz schrumpft, sobald er `ruheTakte` = 600 Render-Takte über `schwelle` × Ziel liegt (`stamm/26b.js:101/107`).
  - Diese Frist läuft bei den Probe-Takten mitten in S5 ab.
- **Die Sätze im S5-Fenster (F3):**
  - Die Welt-Sätze schrumpfen 47,0 → 27,2 MB: Boden 15,5 → 2,6, Bau-Satz s2|stoff 9,4 → 5,8, glut 3,1 → 2,1, fünf Glas- und
    Glut-Sätze 0,44 → 0,06–0,1.
  - Dafür entstehen ~8 MB neue Arrays.

## Warum der Speicher trotzdem steigt — ein Spiel-Befund am Rand (beschränkt, kein Leck je Wert)

Die ersetzten Satz-Arrays bleiben auf der CPU am Leben. Von 155 Satz-Arrays vor dem Fenster sind danach 85 aktuell, 0 tot und
**70 verwaist (30,2 MB)**. Keines steht noch in r184s Register (`memoryMap` 0), die GPU-Seite ist also frei (`_gpuAbschied`).

| Halter (nach GC) | was | MB |
|---|---|---|
| Boden-Satz: 2 Render-Objekte im Spiel-Register `mesh.__renderObjekte` (`_renderObjektRegister`, `stamm/20c.js:1606`) | Schatten-Kaskade (OrthographicCamera, Kontext 2048², ShadowMaterial), seit dem Tausch nicht neu gezeichnet; nur das RO der Spieler-Kamera trägt die neue Geometrie | 15,5 |
| Bau-Satz `l:2.50 glut`: sein einziges Render-Objekt (Spieler-Kamera) | der Satz zeichnet nicht (unsichtbar) | 0,4 |
| Bau-Sätze glut, s2 glut, s2 stoff, glas, fenster, laterne | kein Pfad über `state`, `r` und `K`: r184-intern (WeakMap, Bündel) | 14,2 |

- **Woher das Plus kommt:** Ein Render-Objekt hält `ro.geometry` = die alte Geometrie, bis es den Mesh wieder zeichnet
  (`needsGeometryUpdate`). Darum kommen die neuen Arrays dazu, und die alten fallen nicht.
- **Beschränkt:** Je hängendem Render-Objekt bleibt eine alte Generation. Im Haken-Lauf mit Zügen überlebten von 216 MB
  Verdichtungs-Arrays nur die aktuellen 8,6 MB.
- **Im laufenden Spiel:**
  - Die Schatten-Kaskade zeichnet alle 2 bzw. 6 Frames neu und löst damit den Boden.
  - Unter der Linse ruht der Spiel-Takt (`setAnimationLoop(null)`); deshalb hängt der Boden dort.
  - Ein unsichtbarer Satz hält seine alte Generation, bis er wieder zeichnet.
- **Mögliche Spiel-Karte:** „W7 gibt die CPU-Kopie erst frei, wenn jedes Render-Objekt des Satzes neu zeichnet“.
  - Fundort: `_chunkSatzGeometrie` tauscht `s.mesh.geometry` (`17b.js:627`).
  - Spannweite: einige MB bis zu einer alten Generation je ungezeichnetem Satz.
  - Klein, keine Eile.

## Vorschlag Linse (Frost-Wand, S5)

Die Basis erst nach der **Satz-Ruhe** nehmen: vor `heapRuhe` Welt-Frames zeichnen, bis kein Satz mehr auf seine Verdichtung wartet
(jedes `s.ueberSeit < 0` in `state.chunkSaetze`). Das dauert höchstens ~600 Takte. Dann misst S5 nur, was der Ofen je Wert tut.

## Nebenbei

- In den Probe-Läufen mit dem Allokations-Haken (Proxy auf die TypedArray-Konstruktoren) wird S6 rot („gießt zehn
  Erscheinungen“). Ohne Haken (s5r, s5s) ist S6 grün. Das ist ein Werkzeug-Artefakt.
- **Berichtigung zu meiner Meldung von 15:5x:** Der Halter liegt nicht im Foundry-iframe, und G4a ist es auch nicht (A = 1185091c
  zeigt dasselbe).

## Status ZWISCHENSTAND + Übergabe

- Kein Code-Commit. Rohdaten: `bericht/1610-s5-taeter/`.
  - F, F2, F3: nur Frames. Z: Züge. `haken.txt`: Allokations-Haken. `leer-1.txt`: Leerlauf.
  - Die Probe-Zeilen stehen in `probe.patch` (gegen cee33f91), das Lauf-Skript in `s5-satz.sh`.
  - Auf dem OMEN: `p3/k1610v/s5v/`.
- Als Nächstes: Bündel 3 (`auftrag/1610-omen-buendel3.md`).
