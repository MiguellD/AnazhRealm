# Bericht 2310 Radeon-Runner — der zweite self-hosted Läufer, er trägt die Echt-Gruppe

**Status: ZWISCHENSTAND.** Der Beweis ist der echt-Lauf an integ-probe a97787f4. Der erste an 827d4e88 brach im Hook ab, siehe unten.

- **Steht und lauscht:** `radeon-890m`, Runner-Id 22, Labels `self-hosted, Windows, X64, echt-gpu, radeon-gpu`, API `online`.
- **Quelle:** das offizielle Release github.com/actions/runner v2.338.0, `actions-runner-win-x64-2.338.0.zip`, 104 063 355 Bytes.
  Die SHA-256 `f48e0750a21812bca5f82de5f7f5aeae71abee647fab5a582f1742d07eba455f` ist gleich der OMEN (bericht/1410-runner.md).
- **Ort:** `C:\actions-runner`, Arbeitsordner `_work`.
- **Registriert** mit dem Token des Koordinators. Er steht in keiner Datei.
- **Start:** die geplante Aufgabe „Radeon actions-runner“, bei Anmeldung, Benutzer micha, nicht erhöht, mit 3 Neustarts.
  Sie fährt `conhost --headless cmd /c run.cmd >> run.log`.

## Hooks und Umgebung (Dateien hier)

- **`job-start.sh` / `job-ende.sh` (bash):** die Logik der OMEN-Vorlage `bericht/2210-runner-hook`, in bash, der Sprache von `gpu-lauf.sh`.
  Der erste Lauf 39935664101 zeigte, warum: Windows PowerShell fährt auf diesem Laptop keine Skript-Dateien (Richtlinie
  Restricted, die Sicherheits-Einstellung bleibt unberührt). Der `.ps1`-Hook brach nach 0,4 s mit Exit 1 ab, ohne eine Zeile zu laufen.
  - Vertrauens-Wand: nur push/schedule von MiguellD auf MiguellD/AnazhRealm.
  - GPU-Schloss `C:\Users\micha\AppData\Local\Temp\claude\gpu-schloss` als `ci-runner <run>/<attempt> <job>`.
  - Ein fremdes Schloss gilt nach 60 min Schweigen als verwaist (die Regel von `gpu-lauf.sh`; an der OMEN 30 min je Boot).
  - Selbsttest `selbsttest.sh` S1a–S11 GRÜN.
  - Gegenprobe mit drei eingeschmuggelten Tätern, alle beim Namen ROT: kein Actor-Check (S1b), kein Schweigen (S10), das Ende löst fremd (S3).
  - Die Konstanten stehen fest im Hook. Es gibt keinen Umgebungs-Schalter, den ein Workflow setzen könnte.
- **`runner.env`** (= `C:\actions-runner\.env`): die zwei Hooks und `npm_config_script_shell=C:\Program Files\Git\bin\bash.exe`.
- **`C:\actions-runner\.path`:** `C:\Program Files\Git\bin` vorn (Weg R aus bericht/1610-echt-erstlauf.md).
- **Vorfahrt:** `artifacts/profiband/werkzeug/gpu-lauf.sh` nimmt das Schloss nicht, solange `Runner.Worker.exe` lebt. Ohne diese
  Regel nimmt zwischen zwei Befehlen die nächste Karte das Schloss, und der Hook wartet bis zu seiner Frist.

## Weiche

- check.yml `echt`:
  - `runs-on: [self-hosted, echt-gpu]`, gate:ci-deckung (E) prüft echt-gpu.
  - `defaults.run.shell: bash`: Die Standard-Shell eines run-Schritts wäre powershell und scheiterte an derselben Richtlinie.
  - Zweig `echt-radeon` a97787f4.
- Der Diff gegen main ist reines Werkzeug, also braucht `landen` kein ABAB.
- Der OMEN-Runner (omen-gpu) trägt echt-gpu nicht. Die GTX bleibt dem ABAB und der Punkte-Maschine.
- **Fallback, wenn der Laptop fehlt:** `POST /repos/MiguellD/AnazhRealm/actions/runners/21/labels {"labels":["echt-gpu"]}`. Dann
  übernimmt die OMEN ohne Code-Änderung.
