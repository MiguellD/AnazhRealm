# Bericht 2310 Radeon-Runner — der zweite self-hosted Läufer, er trägt die Echt-Gruppe

**Status: ZWISCHENSTAND.** Der Beweis steht. Der echt-Lauf 39940354601 an f7dd313c lief auf radeon-890m grün: alle 17 Wände in 17,4 min, das Schloss wurde genommen und gelöst, der Arbeitsordner geräumt. f7dd313c ist auf main gelandet, als Werkzeug-Diff.

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

## Härtung nach der Prüfung (23.10., zwei unabhängige Prüfer)

- **Abweisung beendet den Worker** (`toete_worker`). Ein Exit 1 des Hooks färbte den Job nur, danach liefen alle `always()`- und `!cancelled()`-Schritte und die pre-Schritte fremder Actions weiter. So lief es bei der OMEN mit Lauf 39807843752 und ebenso in Runner v2.338.0 StepsRunner.
- **Frist 25 min** (1500 s): Der Job-Deckel ist 45 min, der Plan höchstens 20 min. Die 120 min konnten nie greifen.
- **Schloss mit `pid=`:** `gpu-lauf.sh` schreibt die PID des Halters.
  - Stirbt der Halter, ist das Schloss sofort verwaist.
  - Gelöst wird nur nach erneutem Lesen desselben Besitzers.
  - Am Deckel fällt der ganze Prozessbaum (`taskkill -F -T`).
  - Der Deckel liegt bei höchstens 3300 s.
  - Die Vorfahrt fragt per `tasklist -FI` und ist damit auch unter `MSYS2_ARG_CONV_EXCL` sehend.
- **Das Ende räumt den Arbeitsordner immer.**
- **echt-Actions am Commit-SHA:** checkout 11d5960a, setup-node 49933ea5.
- **Selbsttest:** S1–S16 GRÜN. Gegenprobe mit acht eingeschmuggelten Tätern, alle beim Namen ROT: Actor, Schweigen, fremdes Ende, Worker-Ende, Frist, tote PID, Räumen, 30-min-Schweigen.
- **Offen (Entscheid des Schöpfers):** Der Runner läuft unter dem Benutzerkonto micha, das Administrator ist und einen gespeicherten GitHub-Token mit `repo` und `workflow` trägt. Ein fremder Job, etwa eine gekaperte Abhängigkeit, erbte beides. Die Abhilfe ist ein eigenes lokales Standard-Konto für den Runner; einrichten muss das der Schöpfer als Administrator.
