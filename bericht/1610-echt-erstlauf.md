# Bericht 1610 Echt-Gruppe, erster Lauf auf dem Läufer omen-gpu (integ-probe 826717ed)

**Status: ZWISCHENSTAND.**

**Ergebnis:**

1. **CI 38881847786: 21 von 22 Jobs grün. ROT nur `echt`, an Schritt 5 `npm ci` nach 0 s.** Alle 19 Wände wurden
   übersprungen.
2. **Die Wurzel ist die Shell, nicht npm.**
   - Der Läufer löst `shell: bash` auf `C:\Users\micha\AppData\Local\Microsoft\WindowsApps\bash.EXE` auf, den WSL-Starter
     ohne Distribution. Er endet sofort mit Exit 1.
   - Beleg: `C:\actions-runner\_diag\Worker_20261016-093845-utc.log`, die Einträge ScriptHandler „Which2: 'bash'“ und
     „Location: …WindowsApps\bash.EXE“.
   - Schritte ohne `shell:` liefen dort in Windows PowerShell (pwsh fehlt). npm führt seine Skripte dann in cmd.exe aus.
   - Mein Takt-Lauf fuhr dagegen in Git-Bash mit `npm_config_script_shell`. Diese Umgebung fehlte dem Job; ich habe ihn vor
     dem Push nicht auf dem echten Läufer gefahren.
3. **Hook und GPU-Schloss stimmen.**
   - `hooks/hook.log`: 11:38:50 Schloss genommen (integ-probe 826717ed), 11:39:32 gelöst.
4. **Der Fix ist lokal belegt.** In PowerShell mit `C:\Program Files\Git\bin` vorn im PATH und
   `npm_config_script_shell=C:\Program Files\Git\bin\bash.exe` gilt:
   - `bash` löst auf Git-Bash auf;
   - `npm run gate:schatten-bias` und `npm run gate:himmel-tag` laufen auf der Karte mit Exit 0.

## Zwei Wege (Entscheid des nächsten Koordinators)

| Weg | Was | Wirkung auf das Repo |
|---|---|---|
| **R** (Läufer) | `C:\actions-runner\.path` mit `C:\Program Files\Git\bin` vorn; `C:\actions-runner\.env` + `npm_config_script_shell=C:\Program Files\Git\bin\bash.exe` | keine — check.yml bleibt, wie sie ist |
| **W** (Workflow) | im Job `echt` ein PATH-Schritt (`$GITHUB_PATH`) + env `npm_config_script_shell` | gate:ci-deckung (E) müsste den PATH-Schritt als Vorbereitung kennen (Zeilen unter der Decke D3) |

- **Empfehlung: R.** Die Umgebung gehört zum Messplatz, nicht zur Batterie; der Messplatz-Hook steht dort schon.
- Ich ändere den Läufer nicht ohne Wort, weil es eine dauerhafte Einstellung ist.

## Status ZWISCHENSTAND + Übergabe

- **Kein Code-Commit.**
- **Läufer unverändert.** Bis zum Entscheid ist `echt` je Push auf integ-probe/main rot (Schritt 5); die übrigen 21 Jobs
  urteilen.
