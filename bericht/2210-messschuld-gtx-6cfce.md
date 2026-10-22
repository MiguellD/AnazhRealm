# Bericht 2210 Messschuld GTX am Kopf b0b2d8ed (laufzeit-gleich mit 6cfce28a): M34 hält, M15 hält, M30 hält — M36 ROT an nH 300 und unscharf an nH 12

GTX 1060, n2010-b2b an b0b2d8ed (sauber), `--echt`, 1920×1080. Je Boot das Schloss; Vorfahrt für das Schloss und für einen laufenden `Runner.Worker`; Nachtruhe.

## M34 profiband.K4 — Soll 1 HÄLT
- **Aufbau:** 4 frische Boots, Wiese Ego, je `lauf 30 --ein 20 --ruhe 300 --regler frei` und `haenger 60 --regler frei --tiere frei --wandern bahn`.
- **Ergebnis:**

  | Boot | Frames > 100 ms in 60 s | Frame p50 / p95 / p99 / max | loadScale | Tiere | Chunks |
  |---|---|---|---|---|---|
  | b1 | **0** | 16,6 / 25 / 33,4 / 91,7 | 0,08 | 11 | 72 |
  | b2 | **0** | 16,6 / 25 / 33,3 / 83,4 | 0,51 | 9 | 42 |
  | b3 | **0** | 16,7 / 25 / 33,4 / 91,7 | 0,04 | 9 | 42 |
  | b4 | **0** | 16,6 / 25 / 33,3 / 83,3 | 0,32 | 10 | 56 |

- **Urteil:** 4 von 4 ohne Frame > 100 ms (Soll ≥ 3 von 4). TAKT 0 · NEBEN 0 · GC 0 · GPU 0. Der Auto-Speicher-Hänger ist fort.
- **Roh:** `m34/b*-haenger.out|json`, `m34/b*-lauf.txt`.

## M15 klang.K5, GTX-Seite — Soll HÄLT an der GTX
- **Aufbau:** `diag-klang-zensus --takt --echt` (Fenster, echte GPU, Audio-Gerät).
- **Ergebnis:** Klang-ms je Bild p95 gehen **0,11** · Fahrt **0,15** · nachts **0,11**, alle ≤ 0,2 → GRÜN.
  - Ohne Wertung: die Anlauf-Phase „ein“ mit 0,39 ms.
  - Träger der Spitze ist `_lofiPlayGroove` (0,28–0,49).
- **Urteil:** Die GTX-Seite hält. Die Radeon maß am 21.10. nachts 0,5 > 0,2; die Buchung braucht beide Geräte.
- **Roh:** `m15/takt.out`, `m15/takt.json`.

## M30 speicher.K1 Staffel 2 — Soll 2 HÄLT an der GTX
- **Aufbau:** `echt-k1.cjs 20` (OMEN-Kopie, nur die Pfade umgesetzt; Host ohne save-server).
  - 20 harte Tode: 10 zufällig, 10 an Schreib-Haken (idb 4 · fest 3 · platz 3), 0 Haken verfehlt.
- **Ergebnis:** Alter des geladenen Stands max **3,88 s** (≤ 10), **0 korrupt, 0 halbe Welten**; saveState je Ruf p95 28,1 ms, je Bild p95 0 / p99 12,8 ms. Beweisbild `m30/echt-k1-gtx.png`.
- **Urteil:** Die GTX hält. Mit der Radeon (e86600bd, Alter max 1,58 s) hält K1 an beiden Geräten.
- **Roh:** `m30/echt-k1-gtx.json`, `m30/echt-k1.out`.

## M36 siedlung.K5 — ROT an nH 300, an nH 12 ist die Definition zu schärfen
- **Aufbau:**
  - Werkbank `--echt`, Station dorf (Dorf-Zug an), Regler frei.
  - Die Zelle **−4,−6** (Anker −839,5/−1373,1, 512 m südlich des Dorfs) trägt per Zell-Info nH 12 oder nH 300 (Same 29749318).
  - Der Spieler geht im echten Loop mit 4 m/s ab 450 m auf sie zu, durch den Vorlauf-Ring (Export und Ort-Wahl vorab), bis sie bei 260 m erwacht (`_autoSettlementSpawnCell`), und weiter.
  - Gemessen je Bild: wann das erste Haus der Zelle gesetzt ist, wann es im Sichtradius der Bauten (`architectureCullingRadius`, 107–120 m) und im Kegel steht, und wann es gezeichnet ist (`_archIsRendered`). Dazu der Bau-Hash (`m36-erstes-haus.js`).
  - 4 frische Boots, Folge 12 / 300 / 12 / 300.

  | Boot | nH | gesetzt nach dem Erwachen | im Sichtradius | gezeichnet (Erwachen → Bild) | Latenz ab Sichtradius | erstes Haus | Bau-Hash |
  |---|---|---|---|---|---|---|---|
  | b1 | 12 | 4,1 ms | 32 741 ms | **32 880 ms** | **139 ms** | 106,4 m | f5558d2c |
  | b3 | 12 | 11,1 ms | 32 694 ms | **32 866 ms** | **172 ms** | 106,4 m | f5558d2c |
  | b2 | 300 | 7,9 ms | 469 ms (1 Bild) | **653 ms** | **185 ms** | 46,8 m | ae2874f6 |
  | b4 | 300 | 9,7 ms | 461 ms (1 Bild) | **655 ms** | **195 ms** | 49,5 m | 40614f1 |

- **nH 12:**
  - Das Haus steht 4–11 ms nach dem Erwachen, liegt dann aber 237 m vor dem Spieler, weit hinter dem Sichtradius von 107 m.
  - Ins Bild kommt es erst, wenn der Spieler auf ~106 m heran ist (33 s Gehen), und dann nach 139 / 172 ms.
  - „Erwachen → erstes Haus im Bild ≤ 0,5 s“ kann an nH 12 nur über den Sichtradius gelten: nearM 260 m gegen 107 m Bauten-Radius. Das ist eine Frage der Definition, kein Bau-Verzug. Ab dem Bild, in dem es stehen kann, hält nH 12 (≤ 0,5 s).
- **nH 300:**
  - Das **erste Bild nach dem Erwachen dauert 461–469 ms (2/2 Boots)**, das Haus ist nach **653 / 655 ms** gezeichnet → **ROT** gegen 0,5 s ab dem Erwachen. Ab dem Sichtradius sind es 185 / 195 ms.
  - Die Zerlegung des Erwachens (direkt, ohne Loop, `m36/d-nh300.txt`): `_autoSettlementSpawnCell` kostet synchron **192 ms**.

    | Glied | ms |
    |---|---|
    | `_ortPlanSetzen` | 95,6 |
    | davon `_erdbauWirkt` | 45,4 |
    | `_spawnSettlementErlebnis` | 95,3 |
    | davon `_dorfLaterneSetzen` ×104 | 38,1 |
    | davon `_stlWegeBuild` | 25,1 |
    | `_dorfZug` | 0,7 |

  - Der Rest des 460-ms-Bilds (~270 ms) fällt in das erste Bild mit den neuen Bauten und ist unbenannt.
- **Bau-Hash:**
  - nH 12 ist gleich in 3 Läufen (f5558d2c, auch im Probelauf).
  - **nH 300 ist ungleich** zwischen den Boots: Anker −835,27 gegen −835,10, dasselbe erste Haus (Same 285598) 3,7 m versetzt. Die Ort-Wahl der großen Zelle ist zwischen Boots nicht bit-gleich — ein Befund.
- **Urteil M36:** nicht buchbar.
  - nH 300 ist ROT (0,65 s, Hänger beim Erwachen, Bau-Hash ungleich).
  - nH 12 hält, gemessen ab dem Bild, in dem das Haus stehen kann; ab dem Erwachen bestimmt der Sichtradius die Zeit.
- **Roh:** `m36/b*-nh*.txt`, `m36/d-nh300.txt`, Messcode `m36-erstes-haus.js`, `m36-direkt.js`.

## Buchung (Vorschlag an die Meisterkarte)
- M34 → 1 (Soll 1 hält, 4/4).
- M30 → 2 (GTX hält, Radeon hielt).
- M15 → GTX-Seite hält; die 1 hängt an der Radeon (nachts 0,5).
- M36 → nicht gebucht.
  - nH 300: Hänger beim Erwachen (`_ortPlanSetzen` 96 + `_spawnSettlementErlebnis` 95 ms synchron, ~270 ms Bild-Rest) und eine nicht bit-gleiche Ort-Wahl.
  - nH 12 braucht die Definition „ab dem Bild, in dem das Haus stehen kann“.

Roh: OMEN `p3/n2210/ms/`, hier `bericht/2210-messschuld-gtx-6cfce/` (ohne die `*.roh.json` der Hänger-Linse).

**Status ZWISCHENSTAND + Übergabe:**
- Messschuld GTX an b0b2d8ed gemessen: M34, M15 (GTX) und M30 halten; M36 ist ROT mit den Tätern beim Namen.
- Als Nächstes der Auftrag abab-stufe.
