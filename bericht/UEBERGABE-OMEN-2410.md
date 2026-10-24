# Übergabe OMEN (GTX-Messplatz), 24.10. ~00:35 — vor Konto-Wechsel und Neustart

## Was läuft (ohne LLM)
- **Messplatz-Dienst** (Gesetz `zug/messplatz.md`)
  - Arbeitet `zug/warteschlange.txt` ab.
  - Schreibt `zug/abab.txt`, `zug/erledigt.txt`, `bericht/<id>/` sowie Punkte-Mess-Dateien nach `punkte-maschine`.
  - Starter `p3/messplatz.sh` (Wächter mit Bereitschaft) → Schleife `p3/messplatz/messplatz.sh` → Serie `p3/messplatz/serie.sh`, Richter `p3/messplatz/urteil.cjs`.
  - Log: `p3/messplatz/dienst.log`, laufender Auftrag in `p3/messplatz/laeuft.txt`.
- **Geplante Aufgabe „OMEN messplatz“** (vom Nutzer freigegeben): startet den Starter bei Anmeldung micha, über `conhost --headless`.
- **Geplante Aufgabe „OMEN actions-runner“:** der GitHub-Runner (omen-gpu).

## Stand der Warteschlange
- **Fertig:**
  - z6-punkte: 20 grün / 8 rot.
  - z7-abab: LANGSAMER, Dorf. Täter stadt-k1 haltM, bericht/z7-abab.md.
  - z9-abab: berichtigt zu UNENTSCHIEDEN.
  - z9c-abab und z10b-abab: nicht-langsamer.
  - w6-material-gtx: leer. material.K1#1/#2 haben keine GTX-Station. erledigt.txt sagt irreführend „gemessen … keine Mess-Datei“.
- **Beim Neustart unterbrochen:** z9c-punkte (13c95713), Station für Station.
  - Fortschritt steht in `p3/messplatz/lauf/z9c-punkte.stationen`.
  - Nach dem Neustart macht der Dienst mit der nächsten offenen Station weiter.
- **Danach:** z10b-punkte, dann neue Zeilen.

## Nach dem Neustart prüfen (eine Minute)
```bash
tail -5 /c/Users/micha/Desktop/AnazhRealm-OMEN/p3/messplatz/dienst.log     # „DIENST START pid …“ und der Auftrag
powershell -NoProfile -Command "(Get-ScheduledTask -TaskName 'OMEN messplatz').State"
```
- Steht kein „DIENST START“ nach der Anmeldung: `bash /c/Users/micha/Desktop/AnazhRealm-OMEN/p3/messplatz.sh &`. Der Wächter verhindert eine Doppel-Instanz.
- **Sperren aus der Zeit vor dem Neustart** fallen von selbst. Das sind das GPU-Schloss (`%TEMP%\claude\gpu-schloss`) und die Wächter-Sperre (`p3/messplatz/waechter.lock`). Starter, gpu-schloss.sh und Runner-Hook werten jede Sperre als verwaist, deren besitzer.txt älter als der Systemstart ist (24.10.).

## Die Sitzung handelt nur bei (`MELDEN` in dienst.log)
- **LANGSAMER:**
  - Täter mit `werkbank zaehlen --alle` 2+2 je Klasse.
  - Vorlage `p3/n2310/z7/serie-z.sh`, Zelle `dz` (Dorf) oder Ort anpassen.
  - Eine Zeile mit dem Täter in `bericht/<id>.md`.
- **UNENTSCHIEDEN nach 4+4, Absturz, Seiten-Wache ROT, Schloss älter als 2 h.**

## Regeln, die heute entstanden
- Instrument ist die Werkbank von main (Seite A); Rückfall je Boot auf die Werkbank der eigenen Seite, wenn sie in 3 min nicht bereit wird.
- Ohne Werte keine Entscheidung: Fehlt einer Seite eine Kern-Größe, ist die Zelle UNENTSCHIEDEN. Das ist die z9-Lehre.
- Verlängerung auf 4+4 nur durch einen Kern-Richter-Anschlag oder durch CPU-Takt p95, gpu-bank oder Frame p95 zwischen 1σ und 2σ.
- Punkte laufen Station für Station; eine offene prio-1-Zeile hat Vorfahrt.
- Das ABAB ist Nachwache über main, kein Tor. Ein LANGSAMER nimmt der Koordinator per Revert zurück.
- Laufende `.sh` nie an Ort und Stelle ändern: neue Datei schreiben und per `mv` tauschen.
- Kill-Muster nur aus einer Datei (`p3/messplatz/neustart.ps1`), nie in der eigenen Befehlszeile.

## Runner gehärtet (bericht/2310-omen-runner)
- Rot beendet den Runner.Worker; das Job-Ende räumt immer.
- Frist 25 min.
- besitzer.txt: Zeile 1 der Name, Zeile 2 `pid=`.
- Am Deckel `taskkill -F -T`.
- Selbsttest `C:\actions-runner\hooks\selbsttest.ps1`: S1–S16 GRÜN, nach der Neustart-Prüfung erneut grün.

## Offen
- Die abab-stufe (n2210-as, A-gegen-A) ruht und ist durch den Messplatz-Dienst weitgehend überholt.
- Die Hand-Bäume n2010-b2a/b2b sind ungenutzt. Der Dienst nutzt `p3/mp-baum/<sha8>`, node_modules dort als Junction (vor dem Löschen `rmdir`).

**Status ZWISCHENSTAND + Übergabe:** Der Dienst läuft selbständig weiter; die neue Sitzung prüft nach dem Neustart nur `dienst.log`.
