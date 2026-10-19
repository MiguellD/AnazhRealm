# Bericht 1910 B-Kette auf der GTX (main e93134f4), nur gemessen

**Status: ZWISCHENSTAND. Täter der letzten 5 s: die Wald-Schlange `_waldPlanSchlange`** (Wald-Faden `wald-darts` über `_nebenAuftrag("wald")`).
- **Die Schlange:** Alle 4 Wald-Stücke warten auf die LEERE Schlange (`_waldPlanZusage`); sie ist erst bei 14,83/14,85 s leer.
- **Faden gegen Haupt-Faden:** Der Faden rechnet nur 3,37 s für 42 Aufträge. Seine Antworten liegen aber Σ 12,57 s im Haupt-Faden: 38 von 42 wurden mitten in einer LongTask fertig und kamen erst an deren Ende an.
- **Folge:** eine Plan-Runde (2 × 64 Zellen) je Lade-Bild. Danach folgen Neubau, die letzten Karten und das Weltbild bei 15,22–15,33 s; pflanzung, bauten und karten hängen an derselben Kette.
- **`(program)` 1,66 s hat Namen:** Blink-Erstlayout 0,53 s, eine Aufgabe `widget_base.cc:Shutdown` 0,43 s (Verdacht: der Messrahmen), nativ in Worker- und Bild-Rückrufen 0,22 s. Die Übersetzung trägt nur 7 ms.

Gemessen von einem frischen Messer (3 Kalt-Läufe, dieselbe Kette); sein Bericht wörtlich unten. Rohdaten-Auszug in `bericht/1910-b-kette-gtx/`, alles auf der OMEN in `p3/n1910/kette/`.


**Täter der letzten 5 s: der Gestalt-Plan des Walds — die Wald-Schlange `_waldPlanSchlange` am Wald-Faden.** Faden-Bau `wald-darts` (phyto-core `planForestCell`) über `_waldFadenSchicken` → `_nebenAuftrag("wald")`.
- Jedes der 4 Wald-Stücke wartet ab seiner ersten Scheibe auf die LEERE Schlange (`_waldPlanZusage`, vegetation-wiese.js:1681).
- K1: 4,39 → 14,83 s, die letzte Zusage aller 4 (die nächste 14,75), Abriss 14,83. K2: 6,22 → 14,85 s, binnen 0,07 s mit den Foundry-Zügen außer Blick (Sichthöhe buche L1, Gesetz-Fit blume L0, 14,89–14,92), Abriss 14,93. K3: 5,10 → 18,66 s, danach Karten bis 18,94.
- Sie bremst durch die Rundreise, nicht durch Rechnen: 2 Aufträge × 64 Zellen im Flug (`WALD_PLAN.fadenFlug`/`faden`). K2: der Faden rechnet 3,37 s für 42 Aufträge (2 621 Zellen, 0,01–0,23 s je Auftrag).
- Jede Antwort liegt danach im Haupt-Faden, Σ 12,57 s: 38 von 42 wurden mitten in einer LongTask fertig und kamen an ihrem Ende an. Das ergibt **eine Runde je Lade-Bild**, ~128 Zellen je 0,6–1,0 s.
- Die Spitze liegt bei 1 282 / 1 434 Zellen (K2/K1). „Leer" heißt: auch die fernsten Zellen sind geplant (nah zuerst, zuletzt d 405–467 m).
- Weltbild: K1 15,33 · K2 15,22 · K3 (mit Trace) 19,50 s.

**`(program)` hat einen Namen** (Chrome-Trace K3, ein Lauf, 1 659 ms; `roh/K3-programm.txt`, `roh/K3-layout.txt`):
- 0,53 s Blink-Erstlayout der Seite: Layout 398 + UpdateLayoutTree 107 + PrePaint/Paint 27 ms. Das sind die drei ersten Layouts bei 0,33 / 0,62 / 1,29 s nach dem Commit (254 / 111 / 166 ms, 943 → 2 400 Objekte, nicht erzwungen).
- 0,43 s EINE Aufgabe `widget_base.cc:Shutdown` bei 1,63 s, ohne verschachteltes Ereignis.
- 0,22 s nativ in Rückrufen: three.webgpu `e` 88 · gelaende-chunks `worker.onmessage` 71 · studio-bruecke `w.onmessage` 42 + 20 ms. Dazu 0,05 s ParseHTML.
- Übersetzung ist nur mit 7 ms darin. Das Lazy-Compile (V8.CompileCode Σ 604 ms über 4 598 Funktionen) zählt das Profil zu den JS-Frames.

## Zeitleiste der letzten Terme (s, K1 · K2 · K3; `roh/K{1,2,3}-kette.txt` §Terme)
boden 11,20 · 9,41 · 12,99 — dorf 11,88 · 10,96 · 13,80 — pflanzung 13,16 · 13,01 · 16,54 — horizont 14,48 · 13,58 · 14,49
— bauten 14,67 · 14,89 · 19,26 — karten 14,67 · 14,89 · 18,94 — **streu 15,07 · 15,07 · 19,09** — Weltbild 15,33 · 15,22 · 19,50

## Die Kette je Wald-Stück (K2, `roh/K2-kette.txt` §Streu · §Wald; K1 gleich, `roh/K1-kette.txt`)
- **Regionen** im Blick: −1,−1 · 0,−1 · −1,0 · 0,0.
  - Neu 5,72 / 13,30 / 14,08 / 14,42. Erste Scheibe fertig und AUFGESCHOBEN 13,07 / 13,93 / 14,30 / 14,61, mit 20 / 11 / 8 / 4 Zusagen.
  - Der Streuer tickt vor dem Bild nur 29-mal (Lücke 8,15 → 11,10 s, `roh/K2-ticks.txt`). Finish-first: eine offene Scheibe sperrt jede neue Region.
- **Zusagen** (Ankunft):
  - `waldplan#1` 14,85.
  - Karten tanne|2 14,58 · fichte|2 14,66 · karst|1 14,75 · weide|1 14,88.
  - Sichthöhe `zug:buche|1|1` / `|2|1`: bestellt 11,10 außer Blick (d 66–68 m) → gesendet 14,59 / 14,41 → der Faden rechnet 0,23 / 0,44 s → gesetzt 14,88 / 14,92.
  - Gesetz-Fit `zug:blume|1|0` / `|2|0`: bestellt 12,70 außer Blick (d 329/331 m) → gesendet 14,85 / 14,76 → gesetzt 14,92 / 14,89. In K1 wartete blume|1|0 von 5,60 bis 14,04 in der Foundry-Schlange.
- **Abriss** 14,93 (alle 4) → Neubau → neu entdeckte Karten (buche|2 gebacken 14,99, buche|1 15,05) → zweiter Abriss 15,11 → die Regionen stehen 15,11–15,19 → Weltbild 15,22.
  - K1: Abriss 14,83 → Karten buche|1/|2 und karst|1 14,90–15,07 → die Regionen stehen 15,08–15,19.
- **Wald-Faden** je Auftrag (gesendet → [rechnet] → an):
  - 6,00 → [6,02–6,09] → 7,32 · 9,43 → [9,43–9,65] → 10,38 · 14,72 → [14,73–14,78] → 14,85 (d 405–450 m).
  - Belege: `roh/K2-wald-lang.txt`, `roh/K3-wald-lang.txt` (K3: Σ fertig → an 19,29 s bei 3,71 s Rechnen).
- **Wer die Schlange füllt:**
  - `_waldPlanSteht` (Gestalt-Frage ±6 Zellen, vegetation-baum.js:911): 2 243 neue Zellen in 556 Rufen (6,22–14,52 s).
  - `_forestPlantChunk`: 250 Zellen.
  - Schübe von +785 in Sekunde 6 und +637 in Sekunde 13; dort wächst die Schlange von 426 auf 766.
- **bauten = karten** (`roh/K2-kette.txt` §Bauten):
  - Die pflanzung (Ende 13,01) wartet über `_waldPflanzWarten` auf denselben Plan. Danach springen die Bäume auf 120 (13,58 s, :L2 = Karte).
  - Sie stehen mit ihrer Karte: 25 Bakes ab 9,22 s, zuletzt mammut|1 14,76 · weide|1 14,86 · eiche|3 14,89.
  - Die Häuser `schwarzwald|*|3` / `alpenchalet|*|3` gingen 11,36 an w0 und warten 1,8–2,3 s in dessen Studio-Schale (Eingang 12,00, Studio 13,80–14,31). Gesetzt 14,40–14,66.

## Rohpfade und Instrument (relativ zu `p3/n1910/kette/`)
- Läufe: `roh/K{1,2,3}.{json,log,png}` · `fortschritt.log` · `roh/K3.trace.json` (133 MB).
- Auswerter: `kette.cjs` · `programm.cjs` · `wald-lang.cjs`.
- Patches:
  - `lieferung-patch.cjs`: die B5-Kopie. Der Rang liest den Rang-Datensatz `_foundryRang`, dazu der Rang beim Senden.
  - `kette-patch.cjs`: Wecker, Zusagen, Wald, Trace.
  - `faden-patch.cjs` (B5) · `wald-patch.cjs` (Stempel im Wald-Faden, ab K2).
- Zurück mit `git -c core.autocrlf=false checkout`, `git status --porcelain` leer, byte-gleich (`vorher.sha`).

## Entscheidungen und offen
- Entschieden: kein Aufwärm-Lauf; K1 ohne Wald-Stempel. K3 trägt den Trace: 4,3 s langsamer, dieselbe Kette. Kein `--no-lazy`, denn der Trace hat `(program)` benannt.
- Offen: was `widget_base.cc:Shutdown` 430 ms tut. Verdacht: das about:blank-Widget der puppeteer-Seite, also der Messrahmen. Ob der echte Boot es zahlt, ist ungemessen.
- Offen: welche Leser die fernen Zellen (300–467 m) bestellen. Der Stapel endet bei `_waldPlanSteht` < vegetation-baum.js:911.
- Offen: ohne die Wald-Wartezeit hielten die Züge außer Blick und die Karten das Bild bis ~14,9 s. Das ist aus K2 abgeleitet, nicht gemessen. Die Radeon ist ungemessen.
