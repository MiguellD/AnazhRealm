# Auftrag 0910-3 an den OMEN: die Render-Fehler der Leben-Schau 2 und das Gelb aus host-vram-2 (Werkplatz)

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md. Der Messauftrag V18.538 kommt später und hat dann Vorrang (WIP sichern, Ruhe,
messen). Bis dahin ist das dein Werkplatz. Eigener Worktree, Branch `welle-m-render-fehler` ab **main 7dd944e6** (per ls-remote),
Ports 7900–7909.

## Teil A: die WebGPU-Fehler der Leben-Schau 2 (die Familie „render-fehler“ der Welle Schau-2 geht an dich)

Quelle: `artifacts/profiband/leben-schau-2/befund.md` §6 („kleiner“) auf dem Radeon-PC. Hier das Wesentliche:

1. **`Destroyed texture [Texture "szene:tiefenabbild"] used in a submit (Queue.Submit renderContext_4)`.** 264 warn und 2 error,
   als das Fenster von außen vergrößert wurde (958×512 → 1010×541, später maximiert, DPR 2), in Spur C mit LAUFENDEM Spiel-Loop
   (Chrome headless:false, save-server + index.html, NICHT die Werkbank).
   - Die Gegenprüfung von host-vram-2 konnte das mit der Werkbank NICHT auslösen: die Werkbank hält den Loop an
     (setAnimationLoop(null)), der Lauf war vakuös.
   - Das Tiefen-Abbild ist dein Schnitt aus host-vram (`_tiefenAbbild`/`_szeneTiefe`). Wurzel: welcher Leser hält beim
     Resize die alte Textur in einer Bindung oder in einem Bundle?
   - Die Fenster-Wechsel-Klasse (gate:fenster-wechsel) erweitern: Größenwechsel MIT laufendem Loop, mehrere Schritte, DPR-Wechsel.
     Vorher ROT beim Namen.
2. **`No occlusion queries are active` in EndOcclusionQuery (renderContext_4/_6).** Danach 4× `Invalid CommandBuffer … invalid due
   to a previous error`, 1× console.error THREE „No occlusion queries are active“ und 3× PAGEERROR „Invalid value used in weak set“.
   Das geschah in Spur B (Fahren), beim Aussteigen am Bachufer und beim Hinstellen an den Hang (21:11:42–44 Ortszeit). Das
   Log liegt auf dem Radeon-PC (`%TEMP%\claude\schau2-b-fahren\konsole.log`); die Zeilen stehen hier.
   - Wurzel: wer beginnt/beendet Occlusion-Queries (r184 occlusionQuery an einem Objekt?), und was ändert das Aussteigen
     (Seelen-/Kamera-Wechsel, Wasser-Nähe)?
   - Linse: ein Aussteige-/Seelenwechsel-Ablauf am Wasser, ROT bei jedem WebGPU-Validierungsfehler beim Namen.

Je Fehler gilt: Wurzel, Linse vorher ROT, Schnitt an der EINEN Stelle, CI-Schritt mit Gruppe. Die Familie waende-ci baut gerade
gate:ci-deckung so um, dass jedes Gate einen Workflow braucht.

## Teil B: das Gelb der Gegenprüfung von host-vram-2 (33c47206, merge-reif ja)

1. **Keine Wand bewacht den Rundungs-Ausgleich.** Die Start-Sonde sitzt in `anazhRealm.js:~94972`, der Faktor 2⁻⁷ · 1/(2 ln 2) in
   `~95021`. Geht der Ausgleich verloren (Sonde fällt aus, ein Leser umgeht `bild()`), merkt das keine Wand. Die Klasse
   AUSGABE-FORMAT wird im echten Frame nicht eingeschmuggelt. Baue die Wand (Selbsttest: Ausgleich entfernt → rot).
2. **Echtes Dunkel ist ungeprüft.** Deine Nacht- und Abend-Blicke und die des Prüfers standen unter der Mittags-Bühne
   (Helligkeit 72–81).
   - Ein echtes Nacht-Bild-Paar main ↔ Kopf (Uhr 02:00, Mond) und ein dunkler Wald.
   - Banding im Blau-Kanal mit dem Maß des Prüfers: Sprünge von zwei Stufen in glatten Flächen, Rausch-Boden ±0,001; bei Mittag
     ×1,4 bis ×3,4, nur bei 8-facher Streckung sichtbar.
   - Urteil mit Zahl.

Teil B liegt auf deinem Zweig welle-m-host-vram-2. Er geht als Zusatz-Merge in V18.538, deshalb dort bitte zuerst.

## Bericht
`bericht/0910-3-a-render-fehler.md` und `bericht/0910-3-b-vram-gelb.md`. Inhalt: Kopf, Linse vorher ROT → nachher GRÜN, Zahlen
aus Rohdateien, CI-Lauf, offen mit Zahl. Die Nachricht nennt nur „neue Datei + Urteil“.
