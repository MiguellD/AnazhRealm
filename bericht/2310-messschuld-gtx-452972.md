# Bericht 2310 Messschuld GTX am Kopf main 452972a6: M39 hält 4/4, M37 hält (20 Tode, 2 im Dorf-Erwachen, Alter max 1,51 s, 0 korrupt, 0 halbe), M42 benannt ausgelassen

GTX 1060, n2010-b2a an main 452972a6 (V18.546.72, sauber), `--echt` 1920×1080. Je Lauf das Schloss, Vorfahrt Runner.Worker, Nachtruhe.

## M39 profiband.K4 — Soll 1 HÄLT
- **Aufbau:** 4 frische Boots, Wiese Ego, Regler **frei** (R8), je `lauf 30 --ein 20 --ruhe 300 --regler frei` und `haenger 60 --regler frei --tiere frei --wandern bahn`.

  | Boot | Frames > 100 ms in 60 s | Frame p50 / p95 / p99 / max | loadScale | Tiere | Chunks |
  |---|---|---|---|---|---|
  | b1 | **0** | 16,6 / 25,1 / 33,3 / 83,3 | 0,35 | 9 | 90 |
  | b2 | **0** | 16,6 / 25,1 / 25,3 / 75,0 | 0,54 | 9 | 56 |
  | b3 | **0** | 16,6 / 25,1 / 25,5 / 83,4 | 0,60 | 9 | 90 |
  | b4 | **0** | 16,6 / 25,1 / 29,1 / 83,2 | 0,46 | 9 | 90 |

- **Urteil:** 4 von 4 ohne Frame > 100 ms (Soll ≥ 3 von 4). TAKT 0 · NEBEN 0 · GC 0 · GPU 0. Gleich wie M34 an b0b2d8ed (22.10.).
- **Roh:** `m39/b*-haenger.out|json`, `m39/b*-lauf.txt`.

## M37 speicher.K1, GTX-Seite — Soll 2 HÄLT an der GTX
- **Aufbau:** `echt-k1.cjs 20` (OMEN-Kopie, Host ohne save-server).
  - 20 harte Tode: 9 an Schreib-Haken (idb 4 · fest 2 · platz 3), 9 zufällig, 2 im Dorf-Erwachen.
  - **Neu im Werkzeug, der Tod im Erwachen:** die nächste Zelle mit Dorf um den Spieler erwacht über `_autoSettlementSpawnCell`. Die Probe wartet, bis der Gang des Erwachens läuft (`_autoSettlementQueue.gang`), dann:
    - Zyklus 1 tötet hart mitten im Gang;
    - Zyklus 2 ruft `saveState` mitten im Gang (er schließt den Gang synchron, be20b015) und tötet am IDB-Schreiben.
  - Nach dem Laden zählt die Zeile Reservierung und Häuser der Zelle, sofort und nach 10 s.
- **Ergebnis:** Alter des geladenen Stands max **1,51 s** (≤ 10), **0 korrupt, 0 halbe Welten** (Blöcke und Edits), 0 Haken verfehlt. saveState je Ruf p50 12,2 / p95 29,1 / max 83,2 ms; je Bild p95 0 / p99 11,9 ms (436 Rufe, 22 633 Bilder). Beweisbild `m37/echt-k1-gtx.png`.

  | Tod im Erwachen | Zelle (nH) | Gang lief beim Tod | Alter nach dem Laden | verloren | Zelle nach dem Laden (sofort / 10 s) |
  |---|---|---|---|---|---|
  | Zyklus 1, hart | −1,0 (11) | ja | 0,21 s | 0 | nicht reserviert / nicht reserviert |
  | Zyklus 2, am IDB-Schreiben des saveState | −1,0 (11) | ja | 0,76 s | 0 | nicht reserviert / nicht reserviert |

  - **Am IDB-Haken:** er tötet vor dem Abschluss der Transaktion (`idb` = beim `put`). Geladen wird also der Stand davor, die Zelle erwacht neu. Dorf halb: keins.
- **Zusatzlauf `m37-fest/`** (3 Tode, derselbe Kopf), damit ein FESTER Stand mit geschlossenem Gang geladen wird:
  - **Zyklus 1, Tod am `fest` eines saveState nach dem Erwachen von 0,0 (nH 17):** Alter 0,003 s, 0 verloren, die Zelle **reserviert, 34 Häuser, nach 10 s weiter 34**. Das Dorf steht ganz. Einschränkung: der Gang lief beim Ruf nicht mehr (`gangAktiv false`).
  - **Zyklus 2, hart im laufenden Gang:** Alter 1,10 s, 0 verloren, Zelle nicht reserviert.
- **Urteil:** Die GTX hält K1, auch beim Tod im Erwachen. Mit der Radeon für die 1 trägt das die 2.
- **Benannt, ohne Wertung:** Das Beweisbild nach einem Boot mit erwachtem Dorf bricht an der Welt-Steht-Wand von `__buehne` („Felder offen 19“ bzw. 32 im ersten Versuch). Die Wege der Zelle bauen nach dem Laden neu. Am Hauptlauf (Zelle nicht reserviert) steht das Bild.
- **Roh:** `m37/echt-k1-gtx.json|png`, `m37/echt-k1.out`, `m37-fest/echt-k1-gtx-fest.json`, `m37-fest/echt-k1.out`; Werkzeug `echt-k1.cjs` (Umschalter `K1_ERW`), `m37.sh`, `m39.sh`.

## M42 tiere.K3 — ausgelassen, benannt
`diag-tier-gang` misst den Schlupf am CPU-Skelett (`_tierBaum`, Null-Renderer). Die Satz-Tiere jenseits `nahLeiber` gehen über gebackene Phasen-Bänder im GPU-Puffer (`_tierSatzGang`). Für den Tastgrad der Satz-Tiere müsste die Linse das Band-Gesetz nachrechnen; laut Koordinator wird das eine eigene Linsen-Karte.

## Buchung (Vorschlag an die Meisterkarte)
- M39 → Profiband K4 1 (4/4, Regler frei).
- M37 → Speicher K1: die GTX-Seite der 2 hält, auch beim Tod im Erwachen. Die 2 bucht mit der Radeon-Seite.
- M42 → keine Buchung (Werkzeug fehlt).

Fehlstarts ohne Wertung (OMEN `p3/n2310/ms/verworfen-3528/`):
- Ein M39-Boot an 3528f2d0 vor dem Landen von Zug 4.
- Drei Läufe, deren Werkbank ein altes „bereit“ im Log las: TaskStop ließ die `m39.sh`-Schleifen unter Windows weiterlaufen.

**Status ZWISCHENSTAND + Übergabe:**
- M39 und M37 an 452972a6 gemessen und gehalten, M42 benannt ausgelassen.
- Die OMEN gehört wieder der abab-stufe (A-gegen-A ab Genesis Ego B3).
