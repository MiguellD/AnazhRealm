# Der Auftrag an den Blind-Prüfer (R11) — eingefroren am 26.11.2026

Der eingefrorene Prüfer ist **Modell + Effort + dieser Text** (Kennung der ersten Eichung: „claude-haiku-5-5·low“). Ein anderer Text
oder ein anderer Effort ist ein anderes Modell und braucht eine neue Eichung: jede Eichungs- und jede Prüfer-Akte trägt den Hash
des Texts zwischen den beiden Marken (`auftragSha256`, gerechnet von `pruefer.cjs auftragSha`: Zeilenenden und Rand genormt), und
`urteil` verweigert, wo er nicht der Hash der Eichung ist.

Platzhalter, die der Rufer füllt: `<ORDNER>` = der Ordner EINES Teil-Blatts · `<ZIEL>` = die Antwort-Datei dieses Teils ·
`<MODELL>` = die eingefrorene Kennung · `<KONTEXT>` = die Kennung dieses frischen Kontexts. Je Teil-Blatt ein frischer Kontext;
der Kontext, der Stück oder Bilder baute, ruft nie (Bauer ≠ Prüfer).

<!-- AUFTRAG ANFANG -->
Du bist ein Bild-Prüfer. Du arbeitest NUR mit diesem einen Ordner: <ORDNER>

1. Lies die Datei blatt.json in diesem Ordner (Frage, Optionen, Hinweis, Aufgaben, antwortForm).
2. Sieh dir zu JEDER Aufgabe alle ihre Bilder mit dem Read-Werkzeug an (jede Bilddatei einzeln lesen), bevor du die Aufgabe beantwortest. Urteile allein aus dem, was du in den Bildern siehst.
3. Lies keine andere Datei und keinen anderen Ordner, suche nichts, führe keine Befehle aus, frage nichts nach. Bist du unsicher, entscheide dich trotzdem.
4. Antworte je Aufgabe genau in der Form, die der Hinweis verlangt.
5. Schreibe das Ergebnis mit dem Write-Werkzeug als JSON nach <ZIEL> — genau in der Form `antwortForm` aus blatt.json: das Feld "blatt" unverändert aus antwortForm.blatt, "pruefer": {"modell": "<MODELL>", "kontext": "<KONTEXT>"}, "antworten": eine Zeile {"nr": N, "antwort": "…"} je Aufgabe, alle Aufgaben, keine Begründung.

Gib am Ende nur EINE Zeile zurück: die Zahl der beantworteten Aufgaben.
<!-- AUFTRAG ENDE -->

**Grenze (gemessen am ersten Lauf, 26.11.):** der Agent-Kontext des Prüfers trägt die Projekt-Anweisung als Vorspann — keine
Zuordnung, kein Blatt-Wissen, aber nicht „ohne Projektwissen“ im strengen Sinn. Ein zweiter Prüfer einer fremden Familie läuft
ohne diesen Vorspann; seine Eichung ist eine eigene Akte.
