---
name: gpu-mess-lehren
description: Wie man auf der echten GPU (Radeon 890M) ehrlich misst — welche Zahlen lügen und welche Werkbank-Befehle der Richter sind
metadata:
  node_type: memory
  type: feedback
  originSessionId: c019394d-5e88-4b23-a069-7e916f3a8967
  modified: 2026-10-16T12:45:36.406Z
---

Gelernt am 03./04.10.2026 an der Mess-Wiese (−900/−850) mit `scripts/werkbank.cjs --echt`:

- **GPU-Zeit nur über `gpu-bank`** (n Frames ohne rAF hintereinander, dann onSubmittedWorkDone). Die
  r184-Pass-Stempel (`gpuJePassMs`, `gpuMs`) unterzählen auf AMD/D3D12 grob (Feld-Pass unsichtbar, 34 statt
  64 ms). Die rAF-Kadenz rastet am VSync ein (33,5 ms „Boden" war CPU 16 ms + VSync).
- **Immer `lauf … --ruhe 300 --tiere frei`**: ohne Ruhe streut die GPU zwischen frischen Welten ±5 ms;
  `__tiereHalten` erzeugt Feld-Raycast-Last (23 % CPU), die das Spiel nie zahlt.
- **Vor jedem Echt-Lauf Port 3000 prüfen** (`curl --max-time 2 127.0.0.1:3000` — `netstat | grep LISTEN` ist auf dem deutschen Windows blind, dort steht „ABHÖREN"): die Desktop-App startete eine zweite Welt (Vorschau,
  `.claude/launch.json`) auf derselben GPU — verfälschte Läufe (1,5 fps).
- Vergleiche in EINER Welt (Methode live tauschen: `werkbank methode`), nicht über Boots — die Welt wird über
  Minuten teurer (57 → 65 ms GPU).
- `setPixelRatio`/`samples` zur Laufzeit zerbrechen den Hauptpass (Depth-View) — keine Halbpixel-/MSAA-Probe
  zur Laufzeit; MSAA nur per Boot messen (HOLZ_PROFILE temporär).
- Commit-Messages: Wortgrenzen-Siegel (`GPU-Fertig` trifft „fertig") — vor jedem Commit greppen.
- CI-YAML vor dem Push mit `js-yaml` laden: ein „: " im ungequoteten Schritt-Namen verwirft die GANZE check.yml
  (Lauf mit 0 Jobs, Name = Dateipfad). Gerade nach Schritt-Einfügungen per Skript.
- **Keine GPU-Messung, während Arbeiter (Workflow-Worktrees) Gates fahren:** puppeteer-headless bekommt die
  ECHTE iGPU, und auf der APU teilen CPU und GPU das Leistungsbudget. 04.10.: Nachher-Bank 40–48 ms gegen
  Vorher 29–33 ms, nur weil `diag-foundry-impostor` eines Arbeiters parallel lief (Lauf-Durchsatz zeigte das
  Gegenteil). Prüfen: `Get-CimInstance Win32_Process` nach node/chrome aus `.claude/worktrees`.
- **Verwaiste Prozesse nur gezielt abräumen:** nach einem Sitzungsende bleiben Werkbank-Welten, save-server und
  headless Chromes der Arbeiter stehen. Ein Pauschal-Kill aller puppeteer-Chromes traf am 04.10. auch die Browser der
  eigenen laufenden Prüfserie (4 Schritte rot mit „Target closed") — erst prüfen, welche Serie läuft, und nur deren
  Fremd-Prozesse beenden; „Target closed" in einem Gate-Log heißt: Browser von außen getötet, kein Code-Befund.
- `npm run check` braucht Port 4312 frei (diag-taille startet den save-server selbst) — eigenen save-server vorher stoppen.
- Der volle `npm run playtest` (~2 min lokal, PLAYTEST_PORT setzen) läuft auch in der CI (Gruppe 1) — der Integrator fährt ihn trotzdem je Merge lokal.
- **Tempo-Regel (16.10.):** eine 4+4-Boot-ABAB kostet am OMEN ~3 h für 5 Orte × Sichten. Was sich in EINER Welt umschalten lässt
  (Reihe, Stoff, Pass, Methode), misst er in einer Welt mit A G G A in Minuten; Boots nur für Boot-, Streaming- und Ankunfts-Änderungen.

**Why:** mehrere Stunden gingen in Zahlen, die sich als Artefakt herausstellten (Stempel, VSync, Tier-Halten,
zweite Welt). **How to apply:** jede Perf-Aussage mit `gpu-bank` + Ruhe belegen; siehe [[lokaler-klon-echte-gpu]].

Und (07.10., OMEN-Trennung cf9a07ba↔251f2f72): die Boot-Streuung DESSELBEN Stands erreicht 2,6 ms gpu-bank (die eingeschwungene
Welt variiert: boden 142k statt 201k Dreiecke). Ein GPU-A/B zählt nur bei IDENTISCHER Szene (Befehle + Dreiecke gleich) oder mit
≥ 4 Boots je Seite; sonst ist ein Abstand < 3 ms keine Zahl. Und `werkbank band` (gpu-bank-Frames ohne rAF, trackTimestamp ohne
resolveTimestampsAsync) lässt den Zeitstempel-Pool überlaufen — die Pass-Stempel (gpuMs, gpuJePassMs) jedes `lauf` NACH `band` im
selben Boot sind ungültig; Frame-Zeit, CPU-Takt und gpu-bank bleiben gültig. Linsen-Defekt in werkbank.cjs (Integrator V18.533).

Und (09.10.): ein `band` NACH `zerlegen` im selben Boot zählt 23,7 MB `tex:r184-ausgabe` — das Rahmen-Ziel (rgba16f + depth24plus), das
r184 `_getFrameBufferTarget` für den Direktpfad des Post-Schalters anlegt und nie entsorgt; im Spiel (RenderPipeline) nie da. Und
`band --ort genesis` ohne eigenes `umstellen --ort genesis` misst die Wiese („NICHT GESTELLT“ in Zeile 2 des Band-Texts lesen!). Die
Genesis-Zahlen der OMEN-ABABs 0710-6/-9 sind deshalb keine Zahl (Auftrag 0910-1 Teil A schneidet die Linse).

**GPU-Takt fälscht Zuordnung (OMEN 1110-7, 11.10.):** Die GTX 1060 läuft unter Last am Leistungs-Deckel (Drossel 0x4, ~70 W) mit
1680–1710 MHz statt 1771 MHz. Ein „Aufschlag ab Merge X“ (+0,19–0,27 ms) war allein dieser Takt-Modus; die Zuordnung kam aus Zeitfenstern
der Serie, nicht aus dem Code. Regel: jedes ms-Urteil trägt Takt + Drossel je Bank, verglichen wird nur bei gleichem Takt (±0,5 %),
ein Merge ist erst Täter nach einem Toggle in EINER Sitzung.
