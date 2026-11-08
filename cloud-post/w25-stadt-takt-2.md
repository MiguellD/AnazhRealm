# Post an w25-stadt-takt-2

## 09.11. 00:51 — w25-stadt-takt-2 (Cloud-Sitzung)

ABGABE 3fa0892661e2473fbc16a54d05c569ceb3f4c244

Geschnitten: der Satz der Bauten legt unter der EINEN Frist der Bau-Arbeit (`stamm/siedlung-satz.js:101 _tickBauSatz`, `:342 _bauSatzRaten`, `:1095 _satzAltern` fragen `_bauFrist("satz")`, Stücke von `BAU_SATZ_STUECK` 2 048 Ecken `:1656`, mindestens eines je Takt) statt je Takt seines eigenen Deckels von 8 192 Ecken NEBEN der Frist; die Linse gate:takt T12 nennt `_tickBauSatz` und `_satzAltern` beim Namen (an main: 3 Raten und der volle Deckel, ROT; Selbsttest ohne Frist ROT), die Decke ist bezahlt (scripts −59 Atome). main z331 (46128b75) ist eingemischt; am Kopf grün: check, playtest:fast 21/0, gate:takt, gate:welt-boot, gate:stand-takt, gate:foundry-crossfade.

Gemessen (gate:geh-zerlegung, GTX, ABAB am selben Kopf, nur der Satz getauscht — Vorher 8786bdb2 → Nachher f473f648 | c9fb62d9):
- `_tickBauSatz` Stadt Gang 1 ab p95/Mitte 8,2/0,7 → 3,6/1,2 | 4,3/1,0 ms, darin `_bauSatzRaten` 4,8/0,6 → 1,9/0,6 | 1,9/0,9; die Domäne Satz 16,9/4,2 → 12,0/4,6 | 11,1/4,2, Gang 2 14,8/2,9 → 12,5/2,9 | 8,6/3,7. Satz als Täter eines Bilds > 33 ms: Gang 1 1× → 0× | 1×, Gang 2 1× → 0× | 1×. Im kalten Gang, während die Stadt noch baut (90aed4f2, 475 k Dreiecke), trug `_tickBauSatz` 5,3 ms Takt-Mitte und der Satz 5 Bilder (Σ 400 ms).
- Bild p50/p95/max (% > 33 ms): Stadt Gang 1 58,4/125,1/183,3 (98 %) → 66,6/133,4/150 (98 %) | 75/158,4/200 (98 %); Stadt Gang 2 50/108,2/125,1 (99 %) → 58,3/108,4/183,2 (98 %) | 58,4/91,7/158,3 (98 %); Wiese 41,6/91,7/116,7 (87 %) → 33,4/75/100 (76 %) | 41,7/91,6/116,7 (92 %) — die Streuung zweier Läufe am selben Stand (c9fb62d9 ↔ f473f648) ist größer als jeder Satz-Anteil.
- Bild `bild:stadt@0.5` vorher und nachher dieselbe Abnahme: ROT „Vordergrund 26,4 % näher als 8 m: bauSatz 26,4 %“, Luma 59,4 ↔ 59,6, σ 34,9 ↔ 35, schwarz 0,9 ↔ 0,9 % — der Satz zeichnet dasselbe; das ROT steht schon an main (die Kamera des Messorts 609/419 steht vor einem Haus).

Je Bild der Täter (Stadt Gang 1, GTX, f473f648): Sicht 25× Σ 1 708 · Zeichnen 25× Σ 1 575 · Streaming 5× Σ 384 · Bau 3× Σ 283 · Verkehr 1× · Satz 0×.
- Knoten-Bau (w25-pipeline-vorwaermen): kalt 7 Bauten 193,8 ms, 3 Bilder Σ 500 ms (90aed4f2); in den warmen ABAB-Läufen 0.
- Sicht (w25-gpu-wahl): die Domäne Sicht 10,3 ms Takt-Mitte; im Pass des Satzes `_hoehlenSicht`/`_hoehlenSichtLicht` 3,3/0,9 und `_chunkSatzAbschnitt` 1,7/0,6 ms (die Wahl je Pass über alle Bereiche).

Die Besten: Unity `Application.backgroundLoadingPriority` und UE `s.AsyncLoadingTimeLimit` — die Integration geladener Arbeit im Haupt-Faden in Zeit-Scheiben unter EINEM Budget je Frame, nie eine Menge je Takt.

Ehrlich offen: Stadt Gang 1 und 2 bleiben auf der GTX bei p95 108–158 ms (98 % > 33 ms) — der Satz trägt kein Bild mehr, die Bilder tragen Sicht und Zeichnen. Die Radeon ist ungemessen: alle fünf Proben liefen auf omen-gtx1060, zwei gaben dem echt-Job nach. Die Linse gate:geh-zerlegung lebt in den WIP-Köpfen (c9fb62d9, f473f648); im Kopf kostete sie 2 580 Atome Decke.

FUND: stamm/vegetation-baum.js:2641 `tickArchitectureCulling` · der Bau-Gang zählt Bauten (`architectureBuildBudgetPerFrame` 3), nie die EINE Frist · Stadt Gang 1 Bau p95 16,5–25,1 ms (GTX), 3 Bilder Σ 283 · M
FUND: stamm/siedlung-verkehr.js:1182 `_verkehrSchritt` (aus `dirigent-takt.js:1053`) · ein Schritt der Wagen 110 ms in EINEM Bild (`_loopFixedStep` p95 59,2 ms, c9fb62d9 GTX) · Verkehr ≤ Frist je Schritt · M
FUND: stamm/siedlung-bauten.js:2281 `_chunkSatzVAlloc` → `_chunkSatzGeometrie` · ein Wachsen (×1,5) kopiert den ganzen Satz bis zum Hochwasser, Kosten an der Satz-Größe · 5,5 ms GTX im kalten Stadt-Gang (90aed4f2) · S
FUND: scripts/diag-chunk-satz.cjs (check.yml:689) · in der Cloud an main d3512932 ROT „DIE WELT HÄNGT … Wald: Saat 5 … Frist ohne Ende“, am Zweig gleich · S

## 09.11. 00:36 — GPU-PROBE f473f648 auf omen-gtx1060: ROT in 2086 s (gate:geh-zerlegung ROT 195 s · bild:stadt@0.5 ROT 161 s) → probe-post/w25-stadt-takt-2/f473f648.md

## 09.11. 00:30 — GPU-PROBE 8786bdb2 auf omen-gtx1060: ROT in 1706 s (gate:geh-zerlegung ROT 196 s · bild:stadt@0.5 ROT 162 s) → probe-post/w25-stadt-takt-2/8786bdb2.md

## 08.11. 23:59 — GPU-PROBE ddb12256 auf omen-gtx1060: NACHGEGEBEN in 702 s (gate:geh-zerlegung NACHGEGEBEN 3 s) → probe-post/w25-stadt-takt-2/ddb12256.md

## 08.11. 23:57 — GPU-PROBE 1fc0a161 auf omen-gtx1060: NACHGEGEBEN in 583 s (gate:geh-zerlegung NACHGEGEBEN 3 s) → probe-post/w25-stadt-takt-2/1fc0a161.md

## 08.11. 23:55 — GPU-PROBE c9fb62d9 auf omen-gtx1060: ROT in 1100 s (gate:geh-zerlegung ROT 194 s · bild:stadt@0.5 NACHGEGEBEN 170 s) → probe-post/w25-stadt-takt-2/c9fb62d9.md

## 08.11. 23:30 — GPU-PROBE 90aed4f2 auf omen-gtx1060: ROT in 1295 s (gate:geh-zerlegung ROT 195 s) → probe-post/w25-stadt-takt-2/90aed4f2.md
