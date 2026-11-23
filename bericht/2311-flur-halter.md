# Flur-Halter: wer hält die typed Bytes (OMEN, GTX 1060, Runde 10 am f0a89f7e, 23.11.)

Auftrag des Koordinators (23.11. 06:58/06:59): EIN eval `__heapHalter(r, 7)` in der warmen Welt der Runde. Gemessen wurde einmal am Flur-Ort nach den Acker-Ansprüchen und einmal an der Stadt nach koennen#1. Es gab keinen Schnitt, keinen Umbau der Station und keine weitere Messung.

**So wurde genommen:**
- `p3/n2311/flur/warm.cjs` wacht auf die Zeile „KARTE2 Akte <ziel>“ in der Ausgabe der Sitzung (alle 0,3 s). Danach geht EIN `/eval` an die Werkbank DIESER Sitzung.
- Der Text kommt aus `p3/n2311/flur/liste.cjs`.
- Die Rohdaten liegen auf dem OMEN: `p3/n2311/flur/warm/halter-f0a89f7e.json` (Flur) und `halter-koennen-f0a89f7e.json` (Stadt).

**So ist es zu lesen:**
- `__heapHalter` geht von `r` in Breite und schreibt jeden ArrayBuffer seinem ERSTEN, also kürzesten, Weg zu. Hält ein zweiter Weg denselben Puffer, steht der Puffer nur unter dem ersten.
- `[k]` steht für einen Map-Wert, `[]` für ein Feld-Glied.
- Tiefe 7 kürzt nur die Namen. Gegangen wird der ganze Graph.
- Der JS-Heap ist `performance.memory.usedJSHeapSize` im Augenblick des evals, ohne GC davor. Er ist deshalb nicht der „Heap gehalten“ der Akte.

## 1 · Flur-Ort (dorf): Station k2-mensch-nahrung, nach strom#1 · frucht#1 · hand#2

- **eval:** 09:24:16,7 bis 09:24:18,2 (1 415 ms) an `sitzung-20261123-091501` (:27804).
- **Lage im Strom:** Die letzte Zeile von hand#2 kam um 09:24:16,6. Danach führte der Strom bis 09:24:36 nur „(sitzung)“. Das eval fiel also in keine Probe; die Sitzung endete dort an der Grenze der Runde.
- **Gesamt:** alle typed Bytes ab r 221,58 MB · JS-Heap 634,98 MB.

### r.state.weltMarch: 12,80 MB in 11 Zeilen (Schwelle 0, mehr Zeilen hat die Wurzel nicht)

| # | Pfad (Tiefe 7) | MB |
|---|---|---|
| 1 | `r.state.weltMarch.leibHalter[].userData._tuch` | 8,67 |
| 2 | `r.state.weltMarch.leibFern[].userData._tuchTeile` | 2,59 |
| 3 | `r.state.weltMarch.listeDaten` | 0,50 |
| 4 | `r.state.weltMarch.leibHalter[].userData._tuchTeile` | 0,34 |
| 5 | `r.state.weltMarch.leibFern[].userData._tierBaum` | 0,28 |
| 6 | `r.state.weltMarch.kapselDaten` | 0,25 |
| 7 | `r.state.weltMarch.leibFern[].userData._gelenk` | 0,15 |
| 8 | `r.state.weltMarch.leibHalter[].userData._tuchMeshes` | 0,01 |
| 9 | `r.state.weltMarch.leibHalter[].userData._tuchSatz` | 0,01 |
| 10 | `r.state.weltMarch.leibFern[].userData._revierNetz` | 0,00 |
| 11 | `r.state.weltMarch.leibFern[].userData.dying` | 0,00 |

**Summe je Pfad-Anfang:**

| Pfad-Anfang | MB |
|---|---|
| `halter[]` | 0,00 |
| `leibHalter[]` | 9,03 |
| `leibFern[]` | 3,02 |
| `handles[]` | 0,00 |
| sonst: `listeDaten` 0,50 · `kapselDaten` 0,25 | 0,75 |

### r.state.renderer: 35,47 MB in 5 Zeilen

| # | Pfad (Tiefe 7) | MB |
|---|---|---|
| 1 | `r.state.renderer.info.memoryMap[k].array` | 31,26 |
| 2 | `r.state.renderer.info.memoryMap[k].source` | 2,15 |
| 3 | `r.state.renderer.info.memoryMap[k].data` | 1,47 |
| 4 | `r.state.renderer._nodes.nodeBuilderCache[].bindings` | 0,31 |
| 5 | `r.state.renderer._nodes.nodeBuilderCache[].updateNodes` | 0,28 |

**Summe je Pfad-Anfang:** `info` 34,88 · `_nodes` 0,59 MB

## 2 · Stadt: Station k2-mensch-sport, nach koennen#1 (Messort stadt)

- **eval:** 07:01:24,4 bis 07:01:25,8 (1 165 ms) an `sitzung-20261123-065735` (:27804).
- **Lage im Strom:** Der Strom von koennen#1 endete um 07:01:24,29, der von absicht#1 begann um 07:01:35,98. Das eval lag dazwischen, im neuen Umstellen an die Stadt (10,3 s), und fiel in keine Probe.
- **Gesamt:** alle typed Bytes ab r 200,75 MB · JS-Heap 650,76 MB.
- **Schwelle:** 0,5 MB je Zeile.

### r.state.renderer: 64,70 MB in 5 Zeilen

| # | Pfad (Tiefe 7) | MB |
|---|---|---|
| 1 | `r.state.renderer.info.memoryMap[k].array` | 55,49 |
| 2 | `r.state.renderer._nodes.nodeBuilderCache[].updateNodes` | 7,93 |
| 3 | `r.state.renderer.info.memoryMap[k].source` | 0,57 |
| 4 | `r.state.renderer.info.memoryMap[k].data` | 0,39 |
| 5 | `r.state.renderer._nodes.nodeBuilderCache[].bindings` | 0,32 |

**Summe je Pfad-Anfang:** `info` 56,45 · `_nodes` 8,25 MB

### r._foundry.cache: 27,52 MB in 2 Zeilen

| # | Pfad (Tiefe 7) | MB |
|---|---|---|
| 1 | `r._foundry.cache[].children[].geometry` | 27,28 |
| 2 | `r._foundry.cache[]._foundryFlat.leaves[]` | 0,24 |

## Was die Namen sagen

1. **Unter `r.state.weltMarch` hält am Flur-Ort wenig.** Es sind 12,8 MB, davon 8,7 MB die Tuch-Puffer der nahen Leiber (`leibHalter[].userData._tuch`). `halter[]` und `handles[]` halten auf ihrem ersten Weg keine typed Bytes.
2. **Der größte benannte Halter an beiden Orten ist `renderer.info.memoryMap`,** mit 34,9 MB am dorf und 56,5 MB an der Stadt. Er steht dort, weil er der kürzeste Weg ab r ist. Wer die Puffer sonst noch hält, nennt die Liste nicht. Ist `memoryMap` eine starke Map, hält sie Attribute auch nach dem Abbau ihrer Meshes. Das ist ungeprüft, also eine Vermutung und kein Befund.
3. **Der Rest bleibt hier ungenannt.** Unter den bestellten Wurzeln liegen 48,3 MB von 221,6 MB (dorf) und 92,2 MB von 200,8 MB (Stadt). Der Rest läuft über andere Wege ab r. Bestellt waren nur diese Wurzeln, ein zweites eval wurde nicht genommen.
