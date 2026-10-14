# Bericht 1410 Runner — der eigene GitHub-Actions-Runner auf der OMEN

**Status: ZWISCHENSTAND.**

- **Steht und lauscht:** `omen-gtx1060`, Runner-Id 21, Labels `self-hosted, Windows, X64, omen-gpu`.
  - API `GET /repos/MiguellD/AnazhRealm/actions/runners`: `online`, `busy false`.
  - `run.log`: „Listening for Jobs“ seit 22:06.
- **Jobs bekommt er erst,** wenn die CI-Diät (ci-diaet, K61) GPU-Gruppen auf `runs-on: [self-hosted, omen-gpu]` stellt.
  Das gilt nur für push.

## Quelle und Prüfsumme

- **Release:** offizielles Release github.com/actions/runner **v2.338.0** (06.10.2026).
- **Datei:** `actions-runner-win-x64-2.338.0.zip`, 104 063 355 Bytes.
- **SHA-256** `f48e0750a21812bca5f82de5f7f5aeae71abee647fab5a582f1742d07eba455f`. Die Summe ist lokal gerechnet und
  gleich der Release-Notes und dem Asset-Digest der API.
- **Ort:** `C:\actions-runner`, außerhalb der Messbäume. Arbeitsordner `C:\actions-runner\_work`; auf C: sind 42 GB frei
  (92 % belegt).
- **Registrierung:** `config.cmd --url https://github.com/MiguellD/AnazhRealm --name omen-gtx1060 --labels omen-gpu
  --work _work --unattended` mit dem Token des Koordinators. Der Token steht in keiner Datei und keinem Commit.

## Konto und Start (statt Dienst)

- **Die OMEN-Shell ist nicht erhöht.** `--runasservice` braucht Admin, also einen UAC-Klick.
- **Darum läuft er unter dem Benutzerkonto** `micha`:
  - Geplante Aufgabe „OMEN actions-runner“, Auslöser bei Anmeldung, 3 Neustarts im Minuten-Takt, ohne Zeitgrenze.
  - Aktion: `conhost.exe --headless cmd.exe /c C:\actions-runner\run.cmd >> C:\actions-runner\run.log 2>&1`, also ohne
    Fenster.
  - Sofort gestartet per `Start-ScheduledTask`.
- **Folge:** Jobs laufen mit den Rechten und Anmeldedaten des Benutzers, auch mit dem git-Credential-Speicher. Darum
  trägt die Job-Start-Wand unten das Vertrauen.
- **Der Dienst** (Konto NETWORK SERVICE, getrennt vom Benutzer) braucht einen Admin-Schritt:
  1. `config.cmd remove`;
  2. `config.cmd … --runasservice` in einer erhöhten Shell, mit neuem Token;
  3. die geplante Aufgabe löschen.

## Hooks (`C:\actions-runner\.env`)

- **`ACTIONS_RUNNER_HOOK_JOB_STARTED` = `hooks\job-start.ps1`:**
  1. **Vertrauens-Wand:** nur Repo `MiguellD/AnazhRealm`, nur Ereignis `push`, nur Actor `MiguellD`. Sonst Exit 1, und
     der Job endet, bevor ein Schritt läuft (Notiz in `hooks\hook.log`). Das ist die zweite Wand neben der
     Fork-Freigabe `all_external_contributors`: Ein Fork-PR, der seine Workflow-Datei auf `omen-gpu` dreht, kommt hier
     nicht durch.
  2. **Messplatz-Schutz:** atomar `mkdir C:\Users\micha\AppData\Local\Temp\claude\gpu-schloss`, darin `besitzer.txt` =
     `ci-runner <run-id>/<attempt> <job>` (ohne BOM).
     - Hält ein anderer das Schloss (ABAB, Ratschen), wartet der Job im 15-s-Takt, höchstens 120 min. Danach ROT mit
       dem Namen des Halters.
     - Ein `ci-runner`-Schloss beim Start gilt als verwaist und wird gelöst. Es gibt einen einzigen Runner, also lief
       der Ende-Hook dann nicht.
- **`ACTIONS_RUNNER_HOOK_JOB_COMPLETED` = `hooks\job-ende.ps1`:** löst das Schloss nur, wenn `besitzer.txt` genau diesen
  Job nennt. Exit immer 0.
- **Selbsttest** `hooks\selbsttest.ps1` arbeitet an einem Test-Schloss im TEMP, das echte Schloss bleibt unberührt.
  **GRÜN, EXIT=0.** Die Fälle:
  - S1a–c: pull_request, fremder Actor und fremdes Repo werden abgewiesen, ohne Schloss.
  - S2: push nimmt das Schloss.
  - S3: Der Ende-Hook eines fremden Jobs löst nicht.
  - S4: Der eigene Ende-Hook löst.
  - S5: Bei einem ABAB-Schloss wartet der Job, wird nach der Frist ROT, und das ABAB-Schloss bleibt.
  - S6: Ein verwaistes ci-runner-Schloss wird übernommen.
  - S7: Wird das Schloss während des Wartens frei, nimmt der Job es.
- **Lehre:** Windows PowerShell 5.1 liest BOM-lose .ps1 als ANSI. Ein Gedankenstrich wird dabei zu einem Anführungszeichen
  und bricht den Parser. Die Hooks sind darum reines ASCII.

## Die andere Richtung: die ABAB wartet auf den Job

- **Helfer** `p3/gpu-schloss.sh` (`schloss_nehmen <name>` wartet, `schloss_loesen <name>` löst nur den eigenen Namen),
  geprüft.
- Jede Mess-Serie der OMEN nimmt ab jetzt das Schloss um jeden echten Lauf. Ein laufender CI-Job endet also, bevor ein
  ABAB-Boot startet.

## Dateien

- **`bericht/1410-runner/`:** `job-start.ps1`, `job-ende.ps1`, `selbsttest.ps1`, `runner.env` (die `.env`) und
  `gpu-schloss.sh`.
- **Nicht im Bericht:** `.runner`, `.credentials` und `.credentials_rsaparams` des Runners (Schlüssel). Sie bleiben in
  `C:\actions-runner`.

## Pflicht-OFFEN Rest

- Der Dienst-Schritt (Admin) steht aus. Bis dahin hängt der Runner an der Anmeldung des Benutzers. Nach einem Neustart
  ohne Anmeldung ist er offline.
- Kein Job ist bisher gelaufen. Die erste echte Probe ist der erste push mit `runs-on: [self-hosted, omen-gpu]`, nach
  ci-diaet.
  - Dann zu prüfen: Hook-Notiz in `hook.log`, Schloss genommen und gelöst.
  - Die Laufzeit der GPU-Gruppe gegen swiftshader.
  - node und Chrome auf dem Runner: Der Job braucht `actions/setup-node`. Chrome bringt Puppeteer mit, oder er nutzt das
    installierte.
- Der Runner aktualisiert sich selbst, wenn GitHub eine neue Version verlangt. Die Hooks liegen außerhalb von `bin`
  und bleiben.

## Status ZWISCHENSTAND + Übergabe

- Kein Code-Commit im Spiel-Repo.
- Runner online. Nächster Schritt der OMEN: K59 takt-kreatur.
