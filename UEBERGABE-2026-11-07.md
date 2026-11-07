# ÜBERGABE 07.11. 16:10 — Notbremse bei 98 % Wochenlimit (Reset 11.11. 08:00)

## Stand
- **main 95ba6fd6** (z294, V18.546.210): mensch-deckel, modul-teil (+kamera-haus), abnahme-sicht-2, leib-takt b3fb016b, pegel-peers, boee-bild, zensus-abbruch.
- **Gebucht 218/330 am 95ba6fd6**: feld.K2 +1 (pegel-peers), leib.K1 −1 (leib.K1#1 an der GTX frisch ROT, der Rückfall vom 03:55). Artifact PzVLsV4EA53UT2VqQ6bgmi Version 9.
- **Läuft ohne Koordinator** (`zug/werkzeug-w3/auslauf.sh`, Protokoll `zug/auslauf-0711.txt`): Radeon-Ernte `--offen` am 95ba6fd6 → buche.sh;
  z295 (Kandidat ef5863a3: abnahme-sicht-3, leib-bau, innen-regen, laub-unten) → bei Landung Kandidaten-Messung → buche.sh; dann aufraeumen.ps1.
- **OMEN**: angewiesen, nach dem laufenden 95ba6fd6-Lauf zu ruhen (keine Voll-Ernte, z295 nicht).
- **ERSTER Schritt der neuen Woche**: `zug/auslauf-0711.txt` lesen, Meisterkarte als Artifact neu veröffentlichen.

## Täter und Lehren des Tages
- **gang-hitch 544d9ee7** brach in z289, z292 und z293 „Die Albedo nah gegen fern“: `umstellen --ort wiese` → „DIE WELT STEHT NICHT … Wald offen 90/116/216“ (swiftshader). `_bauFrist` lässt den Wald-Job verhungern. Ohne ihn grün (z290). Meine frühere Zuschreibung an fern-hang war falsch (berichtigt im Briefkasten). Derselbe Wald-Hänger erklärt die Röte von z288 (Abgabe wiese-fern).
- **Bild-Werkzeug** `bildpaar.sh` + `paar.cjs`/`ausschnitt.cjs`: main gegen Zweig an der echten Radeon, EINE Welt je Zweig, ~1 min je Welt, 6 Welten in 10 min. Der Körper braucht `umstellen --sicht third` und `bild --spieler --gesicht <m>`.
- Verwaiste Prozesse: 5 Warte-Schleifen (seit 06.11. 23:10), 6 Monitor-tails, 1 Sonden-Welt (halte3.sh: taskkill mit MSYS-PID tötet nichts — winpid aus /proc nehmen).

## Offen für die neue Woche (Reihenfolge)
1. Auslauf lesen, Artifact veröffentlichen; nachbuchen, was die OMEN noch pushte.
2. **lack-spiegel e68cfcc7** (material.K4#1 am See 0 → 38 Blöcke): Bild am See prüfen, dann Zug allein.
3. **wald-kosten 8e4c2c79** (Nacharbeit z289, 9 Wände): Zug ALLEIN.
4. **laub-jahr-fern 12433e5d** (Konflikt `scripts/lib/abnahme-urteil.cjs:1354` mit abnahme-sicht-3) und **wiese-fern 7efc4fdb** (Konflikt `stamm/stoff-material.js:74` mit innen-regen): auf main nachziehen; Bilder sind geprüft und gut.
5. **leib-takt f2360c8b** (Instanz-Wahl folgt dem Weg → leib.K1#1), kam nicht in z295.
6. Nacharbeit im Briefkasten: gang-hitch (Wald offen), fern-hang (S0 Feuerkreis, ferne.K4 0,67 → ≤ 0,4), leib-bau (Kinn-Falte, nicht blockierend).
7. ankunft-takt 4a59b38f (Erst-Zeichnungs-Wand UPLOAD-BYTES nur in der CI), fahrt-ziel-2 (Station ≤ 90 s teilen), siedlung.K4#2 an der GTX (Deckel).
- **Cloud**: keine neuen Pings bei 98 %; laufende Sitzungen enden mit ihrer Runde, ihre Abgaben liegen auf den Zweigen.

## Werkzeuge
`zug/werkzeug-w3/` = Kopie aus `%TEMP%\claude\w3`: zug-weiter, kand-weiter, mess-kandidat, radeon-offen2, bildpaar, bild-kette, paar.cjs, ausschnitt.cjs, auslauf.sh, blick.ps1 (Messplatz-Blick, Start: `powershell -NoProfile -ExecutionPolicy Bypass -File …\blick.ps1`), abgabe-wache8, zug-schlange6, zug-sammler7.

## Kontowechsel (die nächste Sitzung startet in einem NEUEN Konto, gleicher Ordner, Radeon-Laptop + OMEN)
- **Meisterkarte**: Das Artifact PzVLsV4EA53UT2VqQ6bgmi gehört dem alten Konto. Das neue Konto veröffentlicht `meisterkarte.html` als NEUES Artifact und gibt dem Schöpfer den neuen Link.
- **Cloud-Sitzungen** (w19-/w20-/w21-…) gehören dem alten Konto: das neue sieht sie nicht in list_sessions/ListAgents und kann ihnen nicht schreiben. Die Arbeit liegt auf den Zweigen (GitHub); die Post in `cloud-post/<zweig>.md`. Nacharbeit = NEUE Cloud-Sitzung auf denselben Zweig, Brief aus der jüngsten Post-Zeile.
- **w20-haar-arm arbeitet noch** (Stand 16:20, letzte Abgabe 0aaf9d31 um 11:32: Locke im Raster 1,4). Vor jedem Zug: haar.K1 an der Radeon messen — am main war haar.K1 arm 0,43 / third 0,56 GRÜN, der alte Zweig fiel auf 0,36 / 0,32 (z290/z291). Erst wenn beide nicht fallen, in den Zug.
- Letzte Abgaben der anderen laufenden Sitzungen: wald-kosten 8e4c2c79, lack-spiegel e68cfcc7, laub-unten f9a116b0 (in z295), leib-takt f2360c8b.
- **OMEN**: ruht seit 16:05 (zug/erledigt.txt b700a42b), der GTX-Dauer-Wächter steht auf HALT, kein Schloss. Ihre Claude-Sitzung („Koordinator-Meldung“, Remote Control) war am alten Konto — die neue Sitzung spricht die OMEN-Sitzung an, die der Schöpfer neu verbindet.
- **auslauf.sh** läuft auf dem Laptop; schläft der Laptop, stirbt er. Dann zuerst prüfen: z295 gelandet? (`git log origin/main`), Buchung in `zug/auslauf-0711.txt`, sonst `BUCHE_KOPF=<main> bash artifacts/profiband/werkzeug/buche.sh` von Hand.
- Der Punkte-Worktree `%TEMP%\claude\w3\pm` (Zweig punkte-maschine) ist nur ein Checkout; fehlt er, neu: `git worktree add <pfad> punkte-maschine`.

## Alle Kandidaten-Stände
`zug/offene-zweige-0711.txt`: 46 Zweige nicht in main (27 offen, 4 in z295, 16 -pm-Zweige der Punkte-Maschine, davon 7 offen), je mit letztem Push, Kopf und Status. Die Arbeit der Cloud-Sitzungen liegt vollständig auf diesen Zweigen (GitHub); nur nie gepushte Reste in den Cloud-Containern fehlen.
## Auslauf-Ergebnis (16:48)
- Radeon-Ernte am 95ba6fd6: 44 GRÜN · 31 ROT · 95 OFFEN. Die Buchung wurde ABGEWIESEN: 8 Rückfälle, die Summe fiele 218 → 215. Gebucht bleiben 218, Artifact v9.
  ERSTER Arbeitsschritt: die 8 benennen (`node punkte.cjs buchen --trocken --kopf 95ba6fd6…` im Worktree der Punkte-Maschine), dann je Station triagieren: Wackler oder echter Rückfall (Täter seit dem letzten GRÜN).
- z295 (ef5863a3) ROT ohne Wackler: echt „Kamera-Leib auf der Karte (K6 — am Prüfplatz wird der Leib beim Seitwärtsgehen nie durchsichtig)“. Verdächtig ist w21-leib-bau: die EINE Haut gegen das Ausblenden des Leibs vor der Kamera. Dazu voll 15/18 Erst-Zeichnungs-Wand Teil 2 (Wackler).
  Nächster Zug: abnahme-sicht-3, innen-regen, laub-unten OHNE leib-bau; leib-bau bekommt die K6-Wand als Nacharbeit.
- Die OMEN schreibt ihre eigene Übergabe nach `zug/omen-uebergabe-0711.md` (erbeten 17:00).
- Das GPU-Schloss am Laptop trägt noch „punkte-radeon-sitzung“ (der Halter ist tot, also verwaist). Die Werkzeuge erkennen das selbst.

## Ordnung der Geräte (Stand 17:10)
- Prozesse: nichts von mir läuft, die Radeon ist frei, die OMEN ruht ohne Schloss. Offen ist nur der Messplatz-Blick (Tab, kein Budget).
- Platte NICHT aufgeräumt: 328 Worktrees, davon 251 in %TEMP%. Etwa 10 tragen alte, nie gepushte Änderungen (u. a. w4-b-himmel-2, w12-g2-proben, ankunft-heim3, stadt-takt6). Der Haupt-Checkout steht auf 18.10. mit einer losen Zeile in scripts/werkbank.cjs.
  Vorschlag für den Nachfolger: Worktrees, deren Kopf auf GitHub liegt und die keine Inhalts-Änderung tragen, entfernen, dann `git worktree prune`. Die ~10 mit Änderungen dem Schöpfer zur Entscheidung vorlegen.
- Cloud: ~290 Sitzungen im alten Konto, fast alle still. Ihre Arbeit liegt auf den Zweigen, der Schöpfer kann sie archivieren.
