# Bericht 1310-1 — Gruppe 3: erzeugt `_buendelReihe` mehr Pipeline-Bauten?

**Status: ZWISCHENSTAND.**

**Urteil:** Nein, nicht in den Proben. `_buendelReihe` erzeugt in den Proben der Erst-Zeichnungs-Wand keine weiteren und keine
anderen Pipeline-Bauten.
- Die Laufzeit trägt die Übersetzungs-Streuung von swiftshader an den Proben-Stoffen: je Bau ~42 s, zufällig 97 bis 292 s.
- Der langsamste lokale Lauf war ohne die Reihe, und der K25-Kopf ohne OMEN riss gedrosselt den 600-s-Protokoll-Timeout.
- Beim Boot baut die Seite mit der Reihe 1–3 Pipelines mehr, je 1–4 s. Das ist benannt, aber nicht die Größe der
  14-min-Läufe.

Auftrag: Nachricht des Koordinators (Gruppe 3: 895 s am Merge-Kopf 01958457 gegen 279 s am K25-Kopf 3e5bd68a).

## Aufbau

- **M** = integ-probe 01958457 (mit der Reihe).
- **O** = derselbe Stand ohne den Aufruf `this._buendelReihe(scene);` (eine Zeile, Worktree ip-ohne).
- **K** = 3e5bd68a (K25, ohne OMEN).
- Die Bau-Uhr aus K25 ist lokal um eine Liste je Bau erweitert (Label, Start, Dauer; `HITCH_BAULISTE`,
  `bauliste-instrument.diff`, nicht committet).
- **Drossel:** `start /affinity 3` (2 logische Kerne). Chrome setzt seinen GPU-Prozess, in dem swiftshader übersetzt,
  selbst auf alle Kerne zurück. Ein Wächter zwingt ihn jede Sekunde auf die Maske 3 (`drossel.ps1`).

## Gemessen (`1310-1/hitch/`)

| Lauf | Drossel | Gesamt | Bau-Uhr am Ende | längster Bau / Σ | Bundle-Neubau offene Pipeline | Urteil |
|---|---|---|---|---|---|---|
| M1 | 2 Kerne | 1584 s | 31 angelegt / 31 gebaut | 184,5 s / 1380 s | 550 s | GRÜN |
| O1 | 2 Kerne | 980 s | 30 / 30 | 73,2 s / 802 s | 216 s | GRÜN |
| K1 | 2 Kerne | 853 s | — | — | — | **ROT**: „Neubau nach 600 s: Runtime.callFunctionOn timed out“ (protocolTimeout) |
| M3 | keine | **484 s** | 28 Bauten | 42,8 s | 129 s | GRÜN |
| O3 | keine | **1005 s** | 25 Bauten | **292,6 s** | 299 s | GRÜN |

**Die Bau-Listen M3 gegen O3** (`bauvergleich-M3-O3.txt`):
- **Proben-Phase** (Start nach 66 s): beide Seiten bauen dieselben 12 Pipelines der Proben-Stoffe
  (`MeshBasicNodeMaterial_287…314`), je ~42 s.
  - O3 trägt die Ausreißer: 97 s, 292 s und 212 s für denselben Stoff 293/295.
- **Boot:** M3 baut 3 mehr (`MeshBasicMaterial_17` 4,0 s, je ein `MeshStandardNodeMaterial` und `MeshBasicNodeMaterial`
  ~2 s). M1/O1: 31 gegen 30.
  - Ob das die Reihe ist oder die Streuung des Boots (Streaming), trennen zwei Läufe je Seite nicht.

## Lesart

- Die Wand wartet auf Ereignisse. Ihre Laufzeit ist die Summe der swiftshader-Übersetzungen der Proben-Stoffe, die auf dem
  Runner wie lokal um den Faktor 5–7 streuen.
- Drei Rote nach dem Schnitt gegen drei Grüne davor passen zu dieser Streuung, sind aber kein Beleg gegen die Reihe. Gegen
  die Reihe spricht O3: der langsamste Lauf, ohne sie.

## Pflicht-OFFEN Rest

- Die 1–3 Boot-Bauten mehr mit der Reihe (`MeshBasicMaterial_17`): ihren Stoff beim Namen nennen.
- Die Wand selbst: Die Kosten der Proben-Stoffe (42 s je Bau auf swiftshader, Ausreißer bis 292 s) sprengen das Soll
  ≤ 3 min CI je Linse. Das gehört zu K25, nicht zu diesem Schnitt.
- Danach: Wiese, Genesis und Bühne mit der Satz-Wache neu einschwingen (satz-ruhe).

## Status ZWISCHENSTAND + Übergabe

- Kein Schnitt, kein neuer Zweig: Der Täter ist nicht klein und nicht die Reihe.
- Worktrees ip-mit, ip-ohne, ip-k25 (lokal; ip-mit und ip-ohne mit dem Bau-Listen-Instrument) werden nach dem Lesen entfernt.
