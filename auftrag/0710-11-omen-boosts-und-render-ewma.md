# Auftrag 0710-11 an den OMEN — Werkplatz: die Sekunden-Spitze der Boosts + die render-EWMA-Frage

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Danke für 0710-10 (Brennglas-Takt: CPU p50 voll −15 %, frei
−18 %, 1 578 → 1 Einträge je Takt) — die Gegenprüfung läuft hier.

**Basis:** dein Kopf `welle-m-brennglas` 3da7e286 (Folge-Branch `welle-m-boosts` darauf, damit die Nachbarschaft dieselbe bleibt).
Ports 7900–7909. Rangfolge wie bisher.

1. **tickPlayerBoosts (dein Vorschlag (a)):** `computeSpatialTags` ohne Gedächtnis — an der Wiese 10 Rufe je Sekunde (5 Baupläne,
   Haselbusch 112 Teile 1,1 ms), zusammen 8,3 ms, Spitze 10,3 ms: eine CPU-Spitze jede Sekunde (genau die Art Hänger, die das
   Profi-Band bricht). Schnitt: ein Inhalts-Schlüssel je Bauplan (Teile + `state.materials`; `_bpEditTick` zählt
   `updatePartInBlueprint` heute nicht — der Schlüssel muss JEDEN Schreiber eines Bauplans sehen, sonst ist das Gedächtnis
   veraltet: alle Schreiber per AST-Wand finden, wie die Box-Wand), Tags nur bei geändertem Schlüssel neu. Orakel-Wand: die Tags
   gegen die gedächtnislose Rechnung über eine Werkstatt-Sitzung mit Edits (Teil verschieben, Material ändern, Teil löschen,
   Undo/Redo, Bauplan laden) — 0 Abweichungen; Zahl: ms je Sekunde und Spitze vorher → nachher.
2. **render-EWMA (dein offener Punkt (b)):** B misst seit V18.536 +0,31–0,41 ms render-EWMA ohne mehr GPU-Arbeit und ohne
   `_loopRender`-Zuwachs im Profil. Kläre, WAS die EWMA misst (welcher Zeitraum, welche Aufrufe; Datei:Zeile) und was sich zwischen
   V18.535 und V18.536 darin geändert hat (z. B. eine neue Wache/Hülle im Render-Pfad: `_backendGesetz` Index-Wache am Draw,
   GPU-Wache, Erst-Zeichnung `_erstWartet`, Diät-Stempel) — mit ABBA in EINER Welt (Methode live tauschen). Ergebnis: Ursache
   beim Namen und entweder Schnitt (wenn es echte Arbeit ist) oder die Linse misst ehrlich (wenn es Buchhaltung ist).
**Wände/Handwerk/Bericht:** wie bisher; `bericht/0710-11-boosts-render-ewma.md` + Kopf; Zeit-ABAB gegen V18.536 (oder gegen
welle-m-brennglas, wenn das inzwischen auf main ist — frag mich vorher).
