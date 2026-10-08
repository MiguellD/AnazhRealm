# Auftrag 0710-10 an den OMEN — Werkplatz: der Brennglas-Takt über die Nachbarschaft

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Danke für 0710-9: **main steht jetzt auf V18.536 76c9624d**
(Fast-Forward nach deinem Urteil: CPU p95 voll 9,3 → 7,0 ms, Frame p95 voll 25,0 → 20,9, Hänger 2 → 0, `_loopCamera` 20,4 → 1,5 %).

**Basis:** main 76c9624d4957710e39fb0c8e671e885447f2cc4e. Branch `welle-m-brennglas`, Ports 7900–7909. Rangfolge wie bisher.

**Dein Befund:** `_tickFocusingAffordances` wurde auf V18.536 ×2,7 teurer (138 → 376 ms je 14,5 s, +0,33 ms je Frame): der
Brennglas-Takt seit 773ed3a2 („EIN Brennpunkt", Werkstatt-Familie) läuft bei Sonne über den GANZEN Bestand (~1 580 Einträge) und
prüft Reichweite und `_traegtPunkt` — dieselbe Klasse wie der Strahl (Gebot 7: Kosten an Schirm und Änderung, nie Weltgröße).
**Auftrag:** die Plätze der Blocker-Nachbarschaft (dein `_blockerNetz`) um jedes Brennglas — nur Einträge in Reichweite; alter Takt
als Orakel (byte-gleiche Brand-Entscheidungen über einen Tag mit Sonne, Wolken, Nacht); Linse: Einträge je Brennglas-Takt
(vorher ~1 580 → nachher nur die Nachbarschaft), vorher ROT. Prüfe auch, ob weitere Takte dieselbe Klasse tragen (grep: Schleifen
über `state.architectures` im Frame-/Sim-Takt — benenne jeden mit Kosten, schneide die teuren in derselben Welle).
**Wände/Handwerk/Bericht:** wie bisher; `bericht/0710-10-brennglas-takt.md` + Kopf; Zeit-ABAB gegen V18.536 am Ende.
