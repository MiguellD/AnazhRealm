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
