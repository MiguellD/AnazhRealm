# Bericht 2210 Runner-Hook: echt an f36ab5a1 maß den alten Baum — Täter beim Namen, geheilt

**Täter (meiner):**
- Drei verwaiste `tail -n 0 -F /c/actions-runner/hooks/hook.log` (PID 15064, 5616, 15876, gestartet 15:47 / 16:17 / 16:29) aus abgelaufenen Monitoren der OMEN-Sitzung hielten `hook.log` offen.
- `Add-Content` in der Notiz des Start-Hooks warf („von einem anderen Prozess verwendet“), und `$ErrorActionPreference = 'Stop'` brach den Hook mit Exit 1 ab.
- Checkout und npm ci liefen nicht. Die Gate-Schritte mit `if: !cancelled()` liefen im Arbeitsordner des vorigen Laufs (b9d99b9e).
- Die drei Prozesse sind beendet. Der echt-Lauf an b0b2d8ed (39816505091) nahm um 18:44:56 das Schloss sauber.

**Geheilt** in `C:\actions-runner\hooks` (Kopie hier, das Alte unter `alt/`):
- **Die Notiz scheitert nie.** Sie macht bis zu 20 Versuche mit 250 ms Abstand und schreibt sonst in die eigene Datei des Laufs, `hook.log.<run-id>`. Das gilt in Start und Ende.
- **ROT heißt ROT.** Jeder Abbruch des Start-Hooks (Abweisung, 120-min-Frist, ein unerwarteter Fehler über `try/catch`) räumt zuerst den Arbeitsordner (`GITHUB_WORKSPACE`, nur unter `C:\actions-runner\_work`) und nennt den Grund. So urteilt nie ein alter Baum.
  - Ob der Runner `GITHUB_WORKSPACE` schon im Hook setzt, zeigt die Notiz des nächsten Laufs (`ws=` in „Schloss genommen“).
- **Das schweigende Schloss** (Auftrag abab-stufe): Ein fremdes Schloss, dessen `besitzer.txt` seit 30 min unverändert steht, löst sich beim Namen („verwaistes Schloss '…' geloest - es schweigt seit N min“). Eine OMEN-Serie hält es je Boot höchstens ~12 min.
  - „Tot“ ohne Schweigen ist nicht erkennbar, denn `besitzer.txt` trägt keine PID (die bash-Leser vergleichen byte-genau). Ein verwaistes ci-runner-Schloss löst sich wie bisher sofort.
- **Selbsttest** `selbsttest.ps1`: GRÜN S1a–d, S2–S11. Neu sind:
  - S9: `hook.log` exklusiv gesperrt, der Start nimmt das Schloss trotzdem, die Notiz landet in `hook.log.111`.
  - S10: Ein Schloss `omen-2210-tot` schweigt seit 31 min und wird beim Namen gelöst.
  - S11: Eine Abweisung räumt den Arbeitsordner.

**Lehre der Station:** Kein Monitor mehr mit `tail -F` auf `hook.log` (abgelaufene Monitore lassen ihr `tail` leben). Die Vorfahrt liest `tail -n 1` (kurz) und `Runner.Worker`.

**Offen:** Die Seite in check.yml (Gate-Schritte nur nach erfolgreichem Checkout) baut der Koordinator nach Welle 1.

**Status ZWISCHENSTAND + Übergabe:**
- Hook geheilt, Selbsttest grün.
- Das ABAB am Kopf b0b2d8ed startet nach dessen echt.
