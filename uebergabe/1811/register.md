# Stand w28-halter-register (Übergabe 18.11. früh)

- Zweig `vorrat10-register`, Kopf fc83f932 (WIP, [skip ci]), Basis main 08a8397b.
- Was steht: EINE Tafel `ZELL_GEDAECHTNISSE` (stamm/gelaende-fern.js), 26 Gedächtnisse beim Namen. Davon 8 bisher, 7 des Bodens
  aus eigenen Schleifen von `_pruneDistantVoxelChunks`, 7 neu räumbar (Wind-Form, Wald-Kasten, Ort-Same, Bestands-Klassen,
  drei Zell-Merker der Siedlung), 1 mit Schranke (Dart-Gedächtnis) und 3 des Stands mit Grund (Leben-, Gefühls-Feld, Lebens-Stufe).
- Der Räumer `_zellGedaechtnisGeht` räumt in Raten unter der Frist des Abräumens. Er startet an der letzten Rate des Abschieds,
  am Chunk-Wechsel, bei Zuwachs > 256 und 2 s nach dem letzten Gang.
- Die Reichweite der Hydro-Kachel schließt die Stelle des Orts ein (`_zellOrt` bestellte sie 1 248 m fern 27-mal nach).
- Linse `__zellZensus` (scripts/lib/draw-zaehler.cjs) in `werkbank runde`: zählt je Gedächtnis die Einträge außerhalb des Blicks
  und nennt unangemeldete. Selbsttest mit Mutant in gate:profiband (44/44 grün).
- Die Linse ist an main rot (Radeon, nach 1,8 km Sprung und Rückkehr): die Tritte halten 109 von 243 Einträgen außerhalb des
  Blicks; Wald-Kasten, Ort-Same, Bestand und Siedlung sind unangemeldet.

Gemessen an der Radeon, headless, 1920×1080, holz voll, Runde R2 − R1:
- Runde b: Heap +17,7 → +13,5 MB. Tritte R1 → R2 +1 244 → +92 Einträge. Bildpaar: dasselbe Bild.
- Runde reise: Heap +9,9 → +10,3 MB (Kopf de4c0ba2) → +11,2 MB (Kopf fc83f932); Hydro und Siedlung außerhalb des Blicks: 0. Die Wachser Wald-Kasten (+4 477), Siedlung (+395 · +133 · +133),
  Bestand (+128) und Ort-Same (+27) fallen aus dem Urteil.
- Preis (je 3 Fahrten à 500 m hin und zurück, 16 m/s, Last schwankte stark zwischen den Sitzungen):
  - `_pruneDistantVoxelChunks` p95 0,4–1,7 → 3,7–6,7 ms, max 11,6–16,7 → 9,5–15,2 ms (vor dem Raten-Schnitt gemessen).
  - Rückkehr bis das Bild steht: 7,5 → 8,6 / 10,8 s.

Was bis zur Abgabe fehlt:
- Runde reise am Kopf steht: Heap ohne Gewinn (Stopp-Regel: zwei Versuche ohne Gewinn über dem Rauschen, kein dritter).
- Preis nach dem Raten-Schnitt.
- gate:haus-welt (Teil 1 fiel mit „das Buch fehlt“ nach einem Lade-Stau dreier Seiten; die Wiederholung ist im Schloss).
- Die Tritte halten in Runde b 142 Einträge außerhalb (Tiere und Bewohner treten jenseits des Saums).
- Der Rest-Heap in Runde b steckt in Haltern, die keine Zell-Gedächtnisse sind:
  - voxelChunks mesh.geometry +1,1 MB
  - chunkSaetze __renderObjekte +1,8 MB
  - weltMarch.leibHalter +2,4 MB
  - stoff-instanz.js:373 mit 8 verwaisten Geometrien

Nächster Schritt: Runde reise und Preis am Kopf lesen; ist die Tritt-Linse rot, die Tritt-Reichweite an den Lauf-Radius der
Bewohner binden (AUTO_SETTLEMENT.nearM × BEWOHNER.fernFaktor + Reich).

Fallen:
- Das Schloss ist überlaufen: jede Sitzung wartete 30–100 min hinter der Punkte-Maschine und CI. GPU_LAUF_WARTE_S hochsetzen,
  sonst Exit 75.
- Frame-p95 zwischen Sitzungen ist Last-Rauschen (17 / 25 / 45 ms derselben Fahrt): Preis nur in EINER Welt vergleichen.

Bäume: welle3/feuer (Zweig), feuer-mess/vorher-baum (Kopie von main 08a8397b mit neuer Linse), beide im Scratch des Auftrags.
Eigene Läufe: keine mehr (Runden-Sitzung beendet, die Wiederholung von gate:haus-welt abgebrochen vor dem Schloss — sie steht aus).
Entwurf der Abgabe: koord/abgabe-register.txt; das Bildpaar liegt daneben (abgabe-register-b-start.png, -rueckkehr.png).

Lehre:
1. Zeit kostete das Schloss, nicht der Code: rund 4 h Warten für 6 Sitzungen. Die Messung gehört gebündelt in EINE Sitzung,
   mit Vorher und Nachher per `/methode --quelle` in derselben Welt.
2. Getragen hat ein Eval-Haken mit Stapel je Schreiber (wer bestellt die Kachel, wer tritt fern): er nannte den Täter in
   einer Sitzung. Nutzlos war der Frame-Vergleich über Sitzungen.
3. Übersehen habe ich: Räumen ohne ehrliche Reichweite der Leser erzeugt Nachbestell-Schleifen (Hydro-Kachel, Rang-Merker).
   Erst die Leser messen, dann die Reichweite setzen.
4. In einen Auftrag gehören die Halter-Liste mit der Klasse jedes Halters (Zell-Schlüssel oder Objekt-Halter). Nie gehört
   hinein: „eine Runde vorher ↔ nachher“ ohne freies GPU-Fenster.
5. Ungefragter Schnitt mit großem Hebel: das Schloss als Warteschlange mit Zeitfenstern je Arbeiter. Heute verhungert jeder
   Nicht-Punkte-Lauf.

Fremde Zweige: w28-reise-raeumt (Welt-Wechsel, 434 Zeilen in 11 Dateien) trägt einen anderen Schlüssel-Raum (die Welt, nicht
die Zelle) und bleibt außerhalb dieses Schnitts. Auch die heap-zensus-Familie (1 053 Zeilen, Werkzeug) bleibt draußen: das
Register misst mit `__zellZensus`.
