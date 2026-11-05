# Streaming am Dorf (streaming.K1#1 / K2#1, headless) — Diagnose-Proben vom 05.11.

Gestartet im Spiel-Baum (Checkout von main f5db8d90): `node <diag>.cjs <name> <port>`.
- `diag4.cjs`: Zustand beim Eintritt in den Kegel.
- `diag7.cjs`: fehlende Plan-Zellen. Gegenprobe mit `ORT=wiese` (ohne Dorf: K2#1 GRÜN 700/708).
- `diag9.cjs`: Fluss des Wald-Fadens.
- `diag11.cjs`: letztes Urteil der Stufen-Wahl.

## Befund (Champion w12-dorf-strom, e7756259)
- Bäume: 572 von 578 unfertigen Bäumen fehlt die Gestalt, weil der Wald-Plan um sie fehlt (`_waldPlanSteht` false). Die Stufen-Wahl fragt jeden Baum binnen 60 Takten ab, Faden, Foundry und Hydro fließen. Warum der Plan fehlt, ist noch nicht benannt: die Zelle eines betroffenen Plan-Kastens verfolgen (bestellt, geschickt, geliefert, fällt sie wieder aus dem Wald-Gedächtnis?). Die Verdächtigen stehen mit Datei:Zeile in der Commit-Message von e7756259.
- Häuser: Das Dorf −4,−4 bereitet sich erst bei 269 m vor (nur ein Export zur Zeit), es erwacht bei 183 m, die Zeugen stehen bei 103 m. Der Vorlauf ist eine Strecke (160 m), keine Zeit bis zum Bedarf.

## Messungen

| Stand | K2#1 baum | K1#1 GT Lücken |
|---|---|---|
| Farm am main f5db8d90 | 53,1 % | 81 |
| lokal am main | 48 % | 27–72 |
| ohne Dorf | 98,9 % | 0 |

## Fortsetzung 23:15 (w12-dorf-strom 60ce90a9)
- Der Verdacht „Plan erst bei der Gestalt-Frage bestellt“ ist WIDERLEGT (d13.cjs am main). 576 von 578 unfertigen Bäumen hatten ihre Gestalt ≥ 5 s vorher in 190–304 m gefragt, der Plan war also bestellt. Dann nahm der ERDBAU eines erwachenden Orts ihn wieder weg (7 Fälle mit 260–615 Zellen), laut Probe im selben Bild wie der Eintritt in den Kegel.
- Nächster Schritt: zuerst prüfen, ob Probe und Spiel dieselbe Uhr lesen. Dann klären, ob der Erdbau eines Orts schon VOR seinem Erwachen im Vorrat liegen kann. Dann verwirft er keinen Wald-Plan mehr im Kegel.
- Im Zweig bleibt nur `_forestDartRaum` (bei Überlauf fallen die fernsten Zellen statt `memo.clear()`). Wirkung, 1 Lauf mit eigener Probe: K1 GT 157–195 → 42 Lücken, K2 baum 47–48 → 52 %.
- Ohne Wirkung zurückgenommen: das Neu-Bestellen nach dem Erdbau und der Dorf-Vorlauf nach Rang.
- Bau bleibt bei 95,1–95,7 %, die Zeugen stehen fest bei 103/112/112 m.

## Stand 23:20 (w12-dorf-strom b625de5b, Code 8613fd46)
- Im Zweig:
  - der Grund des Dorf-Vorrats liegt schon im Vorlauf (`_dorfVorratGrundFaellt`, `_tickAutoSettlement`)
  - der zweite Ring bereitet Dörfer vor, er sperrt nur noch das Erwachen (`_autoSettlementZelle`)
  - die Räumung des Wald-Gedächtnisses (`_forestDartRaum`)
- Gemessen (2 Paare, Probe d9/d13): K2#1 baum 47–50 % → 86–87 %, bau ~95 %.
- K1#1 GT streut auf main zwischen 31 und 232 Lücken-Bildern (8 Läufe, Median ~160), am Kopf zwischen 23 und 260. Diese Linse braucht ≥ 4 Läufe je Seite.
- Ohne Wirkung zurückgenommen: Export nach Bedarf, Zell-Reichweite 420 m, Häuser-Aufbau.
- Nächster Verdacht, erschlossen und ungemessen: Der Vorlauf misst am Zellpunkt `info.x/z` (`_autoSettlementZelle`, siedlung-ort.js ~3393), nicht am Ort, den `_autoSettlementFindSite` wählt. −4,−4 beginnt dadurch erst bei 343 m statt 420 m.
- Erster Schritt: den Abstand Zellpunkt ↔ gewählter Ort messen (d16.cjs). Dann Vorlauf und Erwachen am gewählten Ort messen.
- d15.cjs hält je Erdbau-Fall den Aufrufer fest. d16.cjs misst die Zeiten je Vorrat.
