# 35 Der Haupt-Faden: der Takt ohne Deckel (CPU-Takt p95, Bau-Frist, was jeden Takt läuft)

## Was es den Spieler kostet (kein Bild gesehen; der Bereich ist Takt, die Zahl ersetzt das Bild)
- **Im Gehen ruckt das Spiel mit 12–20 Bildern je Sekunde.** Radeon, main-Tag 13.11. 04:25, Messung `1cd1c408-radeon`:
  - wiese-ego-geht: Frame p95 58,3 ms, Takt p95 39,1 ms.
  - wiese-ego-sprint: Frame p95 83,7 ms, Takt p95 70,5 ms.
  - genesis-third-geht: Frame p95 58,3 ms, Takt p95 43,0 ms.
  - Quelle: PM `messung/roh/1cd1c408-radeon/profiband.K2_2.out` Z. 264, Feld `takt`.
- Am heutigen Kopf ec281422 (Radeon, `roh/ec281422-radeon/profiband.K4_1.json`):
  - k4-geh: Takt p95 80,2 ms, Frame 82,8 ms, max 100,1 ms.
  - k4-fahrt: Takt p95 52,9 ms.
- GTX 1060 (07.11., `roh/185e99bb-gtx/profiband.K2_1.out`):
  - wiese-ego-geht: Takt p95 53,8 ms, Frame 50,0 ms.
  - genesis-third-geht: Takt p95 35,9 ms.
- Im Stehen liegt der Takt über dem Soll:
  - Radeon genesis 12,4 / 15,9 ms.
  - GTX 6,9–12,5 ms.
- **Folge:** Der Takt trägt das Bild. Die GPU ist es nicht: GPU je Bild 13–23 ms an denselben Zellen.

## Was die Quelle sagt
**Was ein Takt tut.**
- Die Schleife ist `stamm/dirigent-takt.js:6–396`, EIN rAF-Rückruf.
- Davon läuft immer:
  - Eingabe, Netz, Physik (`_loopFixedStep` :190).
  - Strom und Planer (`_loopVoxelStreaming` :241).
  - Türen, Genesis-Ort, Rauch, Brand, Funken (:253–263).
  - `tickArchitectureCulling` (:297), Haar (:321).
  - Foundry-Freigabe (:371), die Stand-Wache `_weltStandTakt` → `_weltOffen` (:373, :531–658, je Takt über alle Bewohner aller Siedlungen), `_vorbauBedienung` (:392).
- Mit Bild kommen dazu: Leben (:236), Kamera (:285) und Render (:343–346).

**ZWEI Uhren für dieselbe Bau-Arbeit (der Zwilling).**
1. Der Frame-Budget-Pool `_makeFrameBudget` (:1672), `totalMs = _deferrableBudgetMs()` (:1736–1746).
   - Er rechnet `PERF_TARGET_MS 17` (`dirigent-regler.js:2010`) minus Physik, Render, Culling und Kreaturen.
   - Er startet erst in `_runFrameScheduler` (:2113), also mitten im Takt.
2. `_bauFrist` (:1847–1885).
   - Die Frist läuft `BAU_FRIST_MS = 6` (:2455) ab dem ERSTEN Bauer, der fragt (:1855). Der Takt-Kopf zählt nicht.
   - Der Hungrigste bekommt +`BAU_ALTER_MS 3` (:2459).
   - `_dispatchFrameJobs` nimmt das Minimum beider (:1723).

**Die Frist allein (6 ms) liegt schon über dem ganzen Takt-Soll von 5,8 ms.**
- Davor laufen Eingabe, Physik und die Ringe (~1–2 ms), danach der Render.
- Der Render kostete auf der GTX am 19.10. 3,4–4,6 ms je Takt, 65 % des Takts (`koordination bericht/1910-b-e-gtx.md` Z. 68, `…/e/frames.md` Z. 14).

**„Jeder geht mindestens ein Stück“ (:1831, :1720) — die Pflicht-Stücke stapeln sich ohne Deckel.**
- Es gibt 17 benannte Bauer, und jeder bekommt sein Stück auch bei abgelaufener Frist:
  - Planer-Jobs (:1897–2005): strom, morphFolge, waterIso, waldPlan, bewohner, nahWiese, scatterDeco.
  - knoten (`bild-kosten.js:876`), abraeumen und horizont (`gelaende-fern.js:25`, `:1979`), satz (`siedlung-satz.js:137`, `:1090`), stufen (`siedlung-bauten.js:195`).
  - karte (`stoff-karte.js:891`, `:1207`), huellen (`studio-gestalt.js:106`), pflanz und bau (`vegetation-baum.js:2405`, `:2924`), streuLod (`vegetation-streu.js:1165`).
- Bekannte Stück-Größen:
  - Wasser bis 22 ms bei Rückstau (`dirigent-takt.js:1924`).
  - Streu-Scheibe 6 ms (:2437).
  - Strom „L0 81 ms · L1 27 ms je Bau“ — diese Zahl gilt für den Faden (`gelaende-chunks.js:2797`).

**Ein dritter Zwilling: die Wiese stellt ihre eigene Frist.**
- `vegetation-wiese.js:528`: `bis = deadline || performance.now() + BAU_FRIST_MS`.

**Ohne Frist laufen die festen Ticks in `_runFrameScheduler` (`dirigent-takt.js:2119–2140`).**
- `_tickPendingVegSpawns` (bis 8), `_tickHuellenNach`, `_tickArchitectureLOD(5)`, `_tickWerkAlter`, `_tickImpostorBake`, `_tickScatterLod`, `_tickFernRing`.
- `_tickWegeKarte`, `_wegeRaeumen`, `_tickSeason`, `_tickRain`, `_tickBrand`, `_tickCanopyStreaming`, `_stauFelder`, `_tickWorldWaterCA`, `_tickDirtyVoxelChunks`.
- Ein Teil davon fragt innen die Frist, der Rest geht ohne.

**Wo die Frist richtig sitzt: der Lade-Takt.**
- `LADE_TAKT_MS 100` (:2453) und `_ladeFrist` (:1798) messen ab dem Kopf der Aufgabe.
- Das Spiel-Gegenstück fehlt.

**Was das Gesetz KANN und was die Welt konsumiert.**
- Das Profi-Band verlangt CPU-Takt p95 ≤ 5,8 ms (PFLICHT-OFFEN E). Die Station verlangt Belegung p95 ≤ 5,8 stehend und ≤ 8 bewegt (PM `stationen/g6.js:3276`, `:3293–3294`).
- Das Spiel trägt diese Zahl nirgends: kein Takt kennt sein Soll, nur „17 ms Bild“ und „6 ms Bau ab erster Frage“.

**Belegung gegen Takt.**
- Die Belegung ist der Takt plus Arbeit außer Takt (`scripts/lib/zerlege-linse.cjs:278–302`).
- Außer Takt über dem Boden (`pflicht`) bleibt klein: 1,1–3,2 ms Radeon, 1,1–1,9 ms GTX (dieselben Roh-Dateien).
- Der Täter ist also der Takt selbst. GC und Rückrufe sind es nicht.

## Die EINE begrenzende Entscheidung
**Der Takt hat EINE Frist, gemessen ab seinem Kopf, und ihr Maß ist das Soll des Bands.**
- Die Frist endet bei `Takt-Kopf + TAKT_SOLL_MS − Render-EWMA` (`perfSense.phase.render`).
- TAKT_SOLL_MS ist 5,8 im Stand und 8 in Bewegung, also das Soll aus PFLICHT-OFFEN E, das unverändert bleibt.
- Das Pflicht-Stück nach abgelaufener Frist bekommt nur EIN Bauer je Takt: der mit Vortritt (die Alterung :1859–1862 bleibt). So verhungert keiner, und die Stücke stapeln sich nicht mehr.
- Die Kosten folgen damit dem Bild, nie der Zahl der Bauer oder der Weltgröße.

## Der Schnitt (die Klasse ganz: jede Bau-Uhr des Spiel-Takts)
**Stufen in EINER Welle.**
1. `dirigent-takt.js` `loop` (:6) stempelt den Takt-Kopf (`_taktKopf = performance.now()` vor `_eingabeTakt` :31).
   - `_bauFrist` (:1847) stellt `T.bis` aus dem Kopf und dem Soll.
   - `BAU_FRIST_MS` (:2455) stirbt.
2. `_makeFrameBudget`, `_deferrableBudgetMs` und `B.totalMs` (:1672–1746, :2111–2113) sterben als zweite Uhr.
   - `_dispatchFrameJobs` (:1713–1723) liest nur noch `_bauFrist`.
   - `_frameOverBudget` (:2143) wird zu „die Frist lief ab“.
   - Die Böden `FRAME_SCHED_*_FLOOR_MS` (:2441–2446) fallen in die Pflicht-Stück-Regel.
3. Das Pflicht-Stück je Takt: EINER (Vortritt).
   - Betroffen: `gelaende-chunks.js:2850`, `dirigent-takt.js:1720–1725`, jeder Leser oben mit „mindestens eins“.
4. Die Zwillings-Uhren sterben:
   - `vegetation-wiese.js:528`, `+ BAU_FRIST_MS`.
   - `dirigent-takt.js:1924` (cap 22) und `:1987` (`SCATTER_SLICE_MS`).
5. Die festen Ticks :2119–2140, die ohne Frist bauen (`_tickImpostorBake`, `_tickScatterLod`, `_tickFernRing`, `_tickDirtyVoxelChunks`, `_tickArchitectureLOD`), fragen die Frist mit Namen.

Der Lade-Takt bleibt byte-gleich: `_ladeFrist`, `LADE_TAKT_MS`, die Weiche `_bauFrist` :1875. B wird so nicht langsamer.

**Leser-Liste (wer liest, was sich ändert).**
- Frist-Leser: `bild-kosten.js:876` · `gelaende-chunks.js:2780` · `gelaende-fern.js:25`, `:1979` · `siedlung-satz.js:137`, `:1090` · `siedlung-bauten.js:195` · `stoff-karte.js:891`, `:1207` · `studio-gestalt.js:106` · `vegetation-baum.js:2405`, `:2924` · `vegetation-streu.js:1165` · `vegetation-wiese.js:528`.
- Budget-Leser: `dirigent-takt.js:1723`, `:2143`, `_weltOffenAkte` :682 (Hunger).
- Linsen:
  - `scripts/diag-takt.cjs:304–332` (gate:takt T12/T13: Pflicht-Stück je Bauer und Alterung — T12 ändert sein Soll auf „EIN Stück je Takt“).
  - `scripts/playtest/siedlung.cjs:116–152` (setzt `BAU_FRIST_MS`).
- Die Stand-Wache `_weltSteht` (:685) — mit weniger Bau je Takt steht die Welt später.

**Kosten-Zeile.**
- Der Takt im Gehen sinkt von 39–80 ms Richtung ≤ 8 + Render. Der Haupt-Faden wird frei.
- Die Welt füllt im Gang langsamer: Chunks, Wald und Karten kommen über mehr Takte.
- Der Lade-Takt und die Kalt-Zeile B sind unberührt.
- `_weltSteht` kommt später; jede Linse, die darauf wartet, braucht mehr Takte. Der Deckel bleibt unbewegt.

**Kriterien der Meisterkarte.**

| Id | Ist | Soll | Station |
|---|---|---|---|
| profiband.K2#1 | Radeon genesis-ego/third-steht Belegung p95 32,25 / 31,98 (13.11. 04:25, gedrosselt loadScale 0,78, ROT trotz Last); GTX 9,1–14,8 (07.11.) | ≤ 5,8 | `stationen/g6.js:3266` |
| profiband.K2#2 | Radeon geht 55,2 · sprint 83,0 · third-geht 55,7 | ≤ 8 | `g6.js:3282` |
| profiband.K4 Glätte | Radeon k4-geh max 100,1 · 38/46 Bilder > 33 ms (ec281422) | < 100 ms | — |
| pflicht.E | — | — | — |

- Für profiband.K2 stehen alle vier Stationen heute UNGEMESSEN: Absturz 36f9d45a, Fremd-Last dcc33615 (`stand.json:2916–2959`).

**Abgabe.**
- Ein Bildpaar am Dorf der Ankunft im Gang: gleiche Kamera, kein fehlender Chunk und kein leerer Wald im nachher.
- Takt p95 vorher und nachher: `werkbank lauf` an Wiese Ego geht und Genesis Third steht, GTX, je 2 Boots.

## Was schon liegt
- Kein offener Zweig trägt diesen Schnitt.
- Gemergt und ohne Wirkung auf die Frist-Architektur: `w27-takt-gc` 575fcc91, `w27-takt-gc-2` e8aa2307, `w23-geh-takt` cf51c30c, `w28-faden-quelle` def0b704, `w28-sim-takt-eich` 6792f831 (alle in origin/main, `rev-list` 0).
- `w12-takt-band` f5547a39 (05.11.): nicht gelesen. Der FUND nennt dort `_horizontSichtImBild` als Planer-Job im Zwischen-Takt, 0,18 ms je Bild.
- Bis zur Landung fehlt alles: Code, gate:takt T12 neu gefasst, das Bildpaar und die Zahl.

## Ehrlich offen
**Widersprüche.**
- CLAUDE.md und PFLICHT-OFFEN E sagen „CPU-Takt p95 4,7–6,3 ms“ (18.10.). Die Station misst seit November Belegung, und die Zahlen liegen 2- bis 10-fach darüber.
- Auf der Radeon liefen dabei 2,6–3,7 fremde Kerne (`messung/1cd1c408-radeon.json:6914`); auch entlastet sind es ≥ 16 ms.
- Ob der Haken des Stroms und der Hülle `lauf` (`__wetterHalten`, `__ortSchritt`, `zerlege-linse.cjs:557–590`) einen Teil des Takts tragen, ist nicht gemessen.

**Nicht gemessen.**
- Die Zerlegung des GEH-Takts an main: welcher Bauer sein Pflicht-Stück auf 40–80 ms treibt. Die letzte Zerlegung ist GTX stehend vom 19.10.
- Erster Handgriff des Arbeiters: EIN `werkbank haenger` an Wiese Ego geht, GTX, als vorher-Zahl. Das ist kein neuer Apparat.
- Warum der Stand-Takt seit 19.10. von 5,7 auf 12,5 ms (GTX genesis-third) stieg: Render-Weg, Stand-Wache oder eine Welt, die nie steht (FUND 07.11.: `wasser-zellen.js:846–884` vergleicht exakt, am See baut die Nah-Wiese ~13 ms je Takt neu).

**Nicht gelesen.**
- `voxel-worker.js`, `asset-worker*`, `stamm/dirigent-kern.js` (außer `_leuchtTakt` 0,02 ms), `stamm/dirigent-regler.js` (außer :2010).
- Das Tuch des Spielers (`koerper-fahrt.js:160–260`, `koerper-core.js:8852`): 1,1–3,3 ms Kollision je Takt im Third-Gang laut Code-Kommentar :8635. Ungemessen an main.

## Rang
- **Wirkung 5:** Der Takt ist im Gang der Engpass jedes Bilds auf beiden Geräten, und profiband.K1/K2/K4 und pflicht.E hängen daran.
- **Aufwand M:** eine Funktion, zwei Uhren tot, 17 Leser bekommen dieselbe Frage ohne neue Signatur.
- **Risiko:** Die Welt füllt im Gang sichtbar später (Pop-in am Ring-Rand, Wald nach). Darum ist das Bildpaar im Gang die Abgabe-Bedingung, nicht die Zahl allein.
