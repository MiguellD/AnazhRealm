# Bericht 1910 B-Wald (Macher): der Wald-Plan der Ankunft in EINEM Zug — Zweig b-wald b601e807

**Status: ZWISCHENSTAND.**
- **Geschnitten:** Jede bestellte Zelle reist sofort an den Wald-Faden (Aufträge zu 64, alle im Flug). Der Faden rechnet nah zuerst aus seiner eigenen Schlange. `_waldPlanZusage(x, z)` erfüllt sich, sobald ihr EIGENER Kasten keine Zelle mehr in der Schlange hat; die Leer-Zusage `_waldLeer` stirbt.
- **Gemessen** (GTX kalt 4+4):
  - Wald-Schlange leer: 15,39 → 7,55 s.
  - Die Wald-Zusage ist nie mehr der letzte Wecker (5/16 → 0/16).
  - **t(Weltbild) nur 16,09 → 15,87 s, die Spannweiten überlappen. Das Ziel „deutlich unter 16 s" ist NICHT erreicht.**
  - t(Leib) 5,64 → 5,35 s.
  - Die neue Linse (gate:ankunft L2a 12) ist an main beim Namen rot und am Zweig grün.
  - Volle Zweig-CI 39240094043 grün (18/18); alle lokalen Wände EXIT=0, der volle Playtest eingeschlossen.
  - Das Ankunftsbild ist ganz (selbst angesehen).
- **Ehrlich offen:**
  - Die nächsten letzten Terme sind die Baum-Karten (weide/karst/buche L1/2), die Foundry-Züge außer Blick (gesendet erst ~15,1 s) und die Streu-Kette (der Streu-Takt pausiert 8,5–11,3 s).
  - Der Haupt-Faden bleibt 93–95 % belegt.
- **Für den Merge:**
  - Zwei Zeilen Wald-Plan liegen in `vegetation-baum.js` (`_voxelWorkerWaldDarts` trägt `rang`, `_ortGestaltSame` ruft die Zusage).
  - Für scripts/ netto 0 löschte der Schneider tote lokale Variablen in 10 fremden Skripten (omen-messfolge, playtest/*, diag-wiese, diag-stand-takt). Das kann Merge-Reibung mit anderen Zweigen geben.

Geschnitten von einem frischen Schneider; sein Bericht wörtlich unten.


**Zweig `b-wald`, Kopf b601e807** (ab main e93134f4; 7a8b89af · cdb06f8e · 2ba780a7 WIP · 7fa4c18c · b601e807 `[ci voll]`).
**CI:** Lauf 39240094043 (Code-Check, voll) — Urteil: GRÜN, success am Kopf b601e807: kopf, puls 2/2, voll 18/18 (echt übersprungen, `ci-39240094043.txt`).
`git diff --stat e93134f4..HEAD`: 16 Dateien, +165 −114. stamm/vegetation-wiese.js 104, voxel-worker.js 112,
stamm/vegetation-baum.js 11, scripts/diag-ankunft.cjs +22, 12 Skripte −1…−7 (scripts/ netto 0, `gate:betriebsgesetz`: „scripts 0 Z.").

## Geschnitten
- **7a8b89af:** Jede bestellte Zelle reist sofort an den Wald-Faden, in Aufträgen zu 64, alle im Flug, nah zuerst
  (`_waldFadenSchicken`; `WALD_PLAN.fadenFlug` und `_waldFlugAuftraege` fallen). `_waldPlanZusage(x, z)` kommt, sobald keine Zelle
  IHRES Kastens mehr in der Schlange steht (`_waldZusagen`, gelöst in `_waldPlanGeplant`). Die Zusage der leeren Schlange (`_waldLeer`) fällt.
- **cdb06f8e:** Der Faden rechnet aus seiner eigenen Schlange nah zuerst (voxel-worker `waldAuftraege`, `rang` = Abstand² der nächsten
  Zelle beim Senden, ein Auftrag je MessageChannel-Takt). Grund gemessen in B0 (alle im Flug, Reihe der Ankunft): die nahen Zellen
  (8–54 m, bestellt 4,41 s) warteten bis 8,19 s hinter 712 fernen (`roh/B0-kette.txt`).
- **Wahl:** Die Antworten landen nur am Ende einer LongTask des Haupt-Fadens, also muss der Faden die ganze Bestellung schon halten.
  Weil er dann die Reihenfolge bestimmt, wählt er selbst nah zuerst; ein Zug allein reihte die nahen Zellen hinter die fernen.
- **Linse:** gate:ankunft L2a (12). Der Plan 30 m vor dem Spieler fällt, ein Kasten 400 m hinter ihm steht mit in der Schlange.
  - An main ROT beim Namen: „kam erst mit der leeren Schlange — sie wartete auf 169 Zellen außerhalb ihres Kastens" (`linse-vorher-A.log`, EXIT=1).
  - An b-wald GRÜN: „kam, 157 von 169 fernen Zellen offen". Dazu 2 Fälle im Selbsttest.
- **Über den Datei-Besitz hinaus (benannt):** vegetation-baum.js an zwei Stellen des Wald-Plans (`_voxelWorkerWaldDarts` trägt `rang`,
  `_ortGestaltSame` ruft `_waldPlanZusage(x, z)`). Die Linse ist bezahlt mit toten Locals in 10 fremden Skripten (sd, savedBuild, SK,
  stammLib, THREE_ ×2, origFps, origVoxel, beforeNames, cxw/czw, cAtomar/cSpatial). Halm und Nah-Wiese sind unberührt.

## Gemessen: Kalt ABAB 4+4 (`diag-boot-stage --kalt --echt`, Port 7902, Schloss omen-1710-n)
A = n1910-f1b e93134f4, B = b-wald cdb06f8e. Instrument byte-gleich (`instrument.sha`, A-Worker = Messer-sha 54d96d04).
Tafel `tafel.txt`, Rohdaten `roh/{A,B}{1..4}.{json,log,png}` und `roh/*-kette.txt`.
- **t(Weltbild):** A 16,09 s (15,52–16,40) → B 15,87 s (15,64–16,23). Die Spannen überlappen.
- **t(Leib)** (erstes applyPlayerSoul): A 5,64 s (4,67–6,45) → B 5,35 s (5,21–5,88).
- **„Wald-Schlange leer" erstmals:** A 15,39 s (14,99–15,58) → B 7,55 s (5,92–10,22). Neubauten bestellen danach neu, zuletzt leer bei B 15,24 s.
- **Die Wald-Zusage war die letzte Zusage eines Region-Weckers:** A 5 von 16 → B 0 von 16 (`wecker.txt`). Der Wald ist nicht mehr der letzte Term.
- **Faden:** A 41–42 Aufträge, rechnet 2,7–4,1 s → B 51–60 Aufträge, rechnet 3,4–5,3 s. Mehr Zellen, weil der Stand des Gedächtnisses
  um ~8 s wechselt und Bestelltes neu rechnet (auch an A). Das kostet den Faden, nicht den Haupt-Faden.

## Wände (lokal, `waende.log`)
check EXIT=0 · lint EXIT=0 · gate:worker-dichte EXIT=0 (Teil W 243/567 Zellen, abweichend 0) · playtest:fast EXIT=0 (22 ✅ 0 ❌) ·
diag-atlas --check EXIT=0 · gate:ankunft EXIT=0 · voller playtest EXIT=0 („Alle Invarianten OK", WECKER und STOFF DES WALDS ✅) ·
stamm:lint EXIT=0 · gate:betriebsgesetz EXIT=0.

## Bild
`roh/B4.png` (Read): die Genesis-Plattform mit den Toren, dahinter Wald mit vollen Kronen, Himmel und Boden ganz. Kein halbes Weltbild,
der Wald ist da und gleich `roh/A4.png`.

## Offen: der nächste letzte Term
- **Karten und Züge:** In B hält jede Region bis 15,4–16,0 s auf
  - den Karten: karte:weide|1, karst|1, buche|1/|2 (buche erst nach dem Neubau entdeckt);
  - den Foundry-Zügen außer Blick: zug:buche|1|1/|2|1 (Sichthöhe), zug:blume|*|0 (Gesetz-Fit, bestellt 12,70, gesendet ~15,1 s).
- **Davor die Streu selbst:** Finish-first reiht die 4 Regionen. Die erste Scheibe von −1,−1 lief 5,8 → 13,1 s mit 8 Ticks, der Takt
  setzte 8,5 → 11,3 s aus (`roh/BX1-kette.txt`).
- **Der Haupt-Faden** ist von 3 bis 14 s zu 93–95 % belegt, an A wie an B (`haupt-faden.txt`). Diese Glieder gehören vegetation-streu, dirigent-takt, studio-bruecke und dem Karten-Bäcker, nicht mir.
- Das Ziel „deutlich unter 16 s" ist nicht erreicht (Median 15,87 s). B ≤ 5 s bleibt offen, die Radeon ist ungemessen.
