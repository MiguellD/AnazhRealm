# Bericht 2310 Radeon-Runner — der zweite self-hosted Läufer, er trägt die Echt-Gruppe

**Status: ZWISCHENSTAND.** Der Beweis ist der erste echt-Lauf an integ-probe 827d4e88.

- **Steht und lauscht:** `radeon-890m`, Runner-Id 22, Labels `self-hosted, Windows, X64, echt-gpu, radeon-gpu`, API `online`.
- **Quelle:** das offizielle Release github.com/actions/runner v2.338.0, `actions-runner-win-x64-2.338.0.zip`, 104 063 355 Bytes.
  Die SHA-256 `f48e0750a21812bca5f82de5f7f5aeae71abee647fab5a582f1742d07eba455f` ist gleich der OMEN (bericht/1410-runner.md).
- **Ort:** `C:\actions-runner`, Arbeitsordner `_work`.
- **Registriert** mit dem Token des Koordinators. Er steht in keiner Datei.
- **Start:** die geplante Aufgabe „Radeon actions-runner“, bei Anmeldung, Benutzer micha, nicht erhöht, mit 3 Neustarts.
  Sie fährt `conhost --headless cmd /c run.cmd >> run.log`.

## Hooks und Umgebung (Dateien hier)

- **`job-start.ps1` / `job-ende.ps1`:** die OMEN-Vorlage `bericht/2210-runner-hook`.
  - Vertrauens-Wand: nur push/schedule von MiguellD auf MiguellD/AnazhRealm.
  - GPU-Schloss `C:\Users\micha\AppData\Local\Temp\claude\gpu-schloss` als `ci-runner <run>/<attempt> <job>`.
  - Ein fremdes Schloss gilt nach 60 min Schweigen als verwaist (die Regel von `gpu-lauf.sh`; an der OMEN 30 min je Boot).
  - Selbsttest S1a–S11 GRÜN.
- **`runner.env`** (= `C:\actions-runner\.env`): die zwei Hooks und `npm_config_script_shell=C:\Program Files\Git\bin\bash.exe`.
- **`C:\actions-runner\.path`:** `C:\Program Files\Git\bin` vorn (Weg R aus bericht/1610-echt-erstlauf.md).
- **Vorfahrt:** `artifacts/profiband/werkzeug/gpu-lauf.sh` nimmt das Schloss nicht, solange `Runner.Worker.exe` lebt. Ohne diese
  Regel nimmt zwischen zwei Befehlen die nächste Karte das Schloss, und der Hook wartet bis zu seiner Frist.

## Weiche

- check.yml `echt`: `runs-on: [self-hosted, echt-gpu]`, gate:ci-deckung (E) prüft echt-gpu. Das ist der Zweig `echt-radeon` 827d4e88.
- Der Diff gegen main ist reines Werkzeug, also braucht `landen` kein ABAB.
- Der OMEN-Runner (omen-gpu) trägt echt-gpu nicht. Die GTX bleibt dem ABAB und der Punkte-Maschine.
- **Fallback, wenn der Laptop fehlt:** `POST /repos/MiguellD/AnazhRealm/actions/runners/21/labels {"labels":["echt-gpu"]}`. Dann
  übernimmt die OMEN ohne Code-Änderung.
