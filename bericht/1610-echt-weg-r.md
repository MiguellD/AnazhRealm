# Bericht 1610 Echt-Gruppe, Weg R am Läufer omen-gpu (Auftrag `auftrag/1610-omen-echt-frost.md` §1)

**Status: ZWISCHENSTAND.** Der Läufer ist umgestellt und neu gestartet. Der Beleg aus dem Worker-Log (Which2) folgt mit dem
Re-Run des Jobs `echt`; ich hänge ihn hier an.

## Urteil

**Weg R steht. Der Läufer findet jetzt die Git-Bash (`C:\Program Files\Git\bin\bash.exe`) und npm führt seine Skripte in ihr aus.**
Das Repo ist unverändert.

## Was geändert ist

1. **`C:\actions-runner\.env`** trägt zwei neue Zeilen:
   - `PATH=C:\Program Files\Git\bin;` gefolgt vom bisherigen Pfad (Maschine + Benutzer, Stand 16.10.);
   - `npm_config_script_shell=C:\Program Files\Git\bin\bash.exe`.
   - Die zwei Hook-Zeilen bleiben. Die alte Datei liegt als `p3/k1610r/env-vorher.txt` auf dem OMEN.
2. **Neustart:** Die Aufgabe „OMEN actions-runner“ wurde beendet und neu gestartet.
   - Der Listener läuft seit 12:22:02 Ortszeit.
   - `run.log`: „10:23:41Z Runner reconnected … Listening for Jobs“. Die zwei Minuten davor meldete GitHub „A session for this
     runner already exists“; das ist das bekannte Nachlaufen der alten Sitzung.
   - Vorher geprüft: kein Worker lief, das GPU-Schloss war frei.

## Abweichung vom Wortlaut: `.env` statt `.path`

- **Der Windows-Läufer liest keine Datei `.path`.**
  - Nur das Linux-Dienstskript `bin/runsvc.sh` liest sie (`export PATH=\`cat .path\``).
  - In `bin/Runner.*.dll` kommt die Zeichenkette `.path` nicht vor, `.env` nur im Listener.
  - Der Listener setzt beim Start jede Zeile `Schlüssel=Wert` aus `.env` als Umgebung; der Worker erbt sie.
  - Eine Datei `.path` wäre also tot. Darum steht PATH in `.env`.
- Die Hook-Zeilen in derselben Datei wirkten schon am 16.10. (`hooks/hook.log`, Schloss genommen 11:38:50); der Weg ist also
  derselbe.

## Beleg vor dem Re-Run

1. **Umgebung des laufenden Listeners**, gelesen aus seinem Prozessblock (PID 12840; Werkzeug `p3/k1610r/peb-env.ps1`, Roh
   `p3/k1610r/listener-env.txt`, beide nur lokal):
   - `Path=C:\Program Files\Git\bin;C:\Program Files\Microsoft MPI\Bin\;…`
   - `npm_config_script_shell=C:\Program Files\Git\bin\bash.exe`
2. **Auflösung von `bash` mit diesem PATH und PATHEXT**, nachgebaut wie im WhichUtil des Läufers: erster Treffer
   `C:\Program Files\Git\bin\bash.exe`, Eintrag 1 von 44. Vorher war es `…\WindowsApps\bash.EXE`.

## Offen

- **Which2 im Worker-Log** (`C:\actions-runner\_diag\Worker_*.log`, Einträge „Which2: 'bash'“ und „Location“) kommt mit dem Re-Run
  des Jobs `echt` an integ-probe 826717ed. Den fährt der Koordinator per API.
- **PATH ist ein Schnappschuss.** Eine spätere Änderung des System-PATH erreicht den Läufer erst, wenn `.env` neu geschrieben wird.

## Status ZWISCHENSTAND + Übergabe

- Kein Code-Commit.
- Läufer: `.env` neu, Listener seit 12:22 lokal online, GPU-Schloss frei.
- Weiter mit §2 (Zweig `frost-echt` ab 826717ed ist angelegt).

## Nachtrag 16.10. ~12:40 — Which2 aus dem Re-Run (Lauf 38881847786, Versuch 2)

- `C:\actions-runner\_diag\Worker_20261016-102558-utc.log`, Zeilen 4576–4577 und 4582–4583:
  - `[10:26:15Z INFO ScriptHandler] Which2: 'bash'`
  - `[10:26:15Z INFO ScriptHandler] Location: 'C:\Program Files\Git\bin\bash.EXE'`
- Vorher (Versuch 1, `Worker_20261016-093845-utc.log`) stand dort `…\WindowsApps\bash.EXE`.
- `hooks/hook.log`: 12:26:02 Schloss genommen als `ci-runner 38881847786/2 echt`. Das Ergebnis des Jobs liest der Koordinator per API.
