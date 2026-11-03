# AUFTRAG AN DIE OMEN-SITZUNG (Koordinator 02.11. ~22:00, Woche des Kontos 6 bei 98 %) — Station sauber übergeben

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md. Die Woche ist zu Ende; der nächste Koordinator soll eine saubere, verständliche OMEN finden.
Nichts davon misst; die Warteschlange ist leer (voll-5fba-gtx erledigt: 21 von 107 geurteilt — das ist der Befund für die nächste Woche).

1. **Prozesse:** keine Browser/node-Waisen der Messungen (nur eigene PIDs des Dienstes beenden, nie fremde). GPU-Schloss frei. Der Dienst
   `p3/messplatz.sh` bleibt als EINE Instanz stehen (geplante Aufgabe „OMEN messplatz“).
2. **Worktrees/Klone der OMEN:** entferne nur, was gelandet (HEAD in origin/main), sauber und älter als 24 h ist; liste den Rest mit Grund.
3. **Prosa verdichten:** die Berichte der OMEN in koordination `bericht/` (ABAB-, Ankunfts-, Eich-, Runner-Befunde seit 20.10.) lesen und in EINE
   Datei `bericht/OMEN-STAND-2026-11-02.md` verdichten (≤ 80 Zeilen): was die GTX misst und wie, wo die Sitzung bricht (warum heute nur 21/107 —
   Fristen? Deckel 10 s? Welt-Brüche? nenne die Stationen), Zeiten je Zelle, bekannte Fallen (Zeitumstellung, Schloss, Vorfahrt), offene Punkte.
   Die alten Einzelberichte NICHT löschen (Geschichte) — nur im Kopf der neuen Datei je Zeile verlinken; Doppeltes und Überholtes als „überholt“ markieren.
4. **zug/:** `warteschlange.txt`, `erledigt.txt`, `abab.txt`, `fortschritt.txt` — Einträge älter als 7 Tage nach `zug/archiv/2026-w44/` verschieben
   (gleiches Format), die aktuellen Dateien behalten nur die letzten 7 Tage. Der Dienst muss danach unverändert lesen können (einmal trocken prüfen).
5. **Ein Satz Lage** am Anfang von `zug/messplatz.md`: was die OMEN heute kann, wie man ihr Aufträge gibt (Zeile, nie Chat), was nicht geht.
6. Commit nach koordination (Autor MiguellD <87209049+MiguellD@users.noreply.github.com>, Trailer "Co-Authored-By: Claude Opus 5.5
   <noreply@anthropic.com>"; nie die Wörter fertig · RUND · vollendet · vollzogen · Schluss · SCOPE ZU), push, und diese Datei am Ende als
   `zug/archiv/2026-w44/AUFRAEUMEN-OMEN.md` ablegen (erledigt).

_Abgearbeitet 02.11. von der OMEN-Sitzung: Ergebnis in bericht/OMEN-STAND-2026-11-02.md (Worktrees, Prozesse, zug/-Archiv, Lage-Satz)._
