# OMEN-Runner und Messplatz, Stand 23.10.

Kopien der lebenden Dateien. Die Quelle bleibt auf der OMEN: `C:\actions-runner\hooks\`, `p3/`.

- **job-start.ps1**
  - Eine Abweisung oder Frist (25 min) oder ein Hook-Fehler räumt den Arbeitsordner und beendet den Runner.Worker.
  - besitzer.txt trägt in Zeile 1 den Namen, in Zeile 2 `pid=`.
  - Verwaist ist ein Schloss eines ci-runner, eines Halters mit toter pid oder eines Halters ohne pid, der 30 min schweigt. Gelöst wird nur nach erneutem Lesen desselben Besitzers.
- **job-ende.ps1:** räumt den Arbeitsordner immer und löst nur das eigene Schloss (Zeile 1) nach erneutem Lesen.
- **selbsttest.ps1:** S1–S16 GRÜN am 23.10.
  - S12: die Abweisung beendet den Worker.
  - S13: tote pid, sofort verwaist.
  - S14: lebende pid, nie gelöst.
  - S15: Ende räumt immer.
  - S16: eigenes Schloss mit pid-Zeile.
- **gpu-schloss.sh**
  - pid-Zeile (Windows-PID via /proc/$$/winpid).
  - `schloss_erster` und `schloss_verwaist`.
  - `tasklist -FI` statt `//FI`, das unter MSYS2_ARG_CONV_EXCL blind war.
- **gpu-lauf.sh:** am Deckel `taskkill -F -T` auf den ganzen Prozessbaum, Exit 124. Geprüft: Exit-Code wird durchgereicht, Enkel `ping` fällt.
- **messplatz.sh** (Starter)
  - Wächter mit Bereitschaft: Lebt eine Instanz oder eine Schleife, wartet er und übernimmt danach.
  - Geplante Aufgabe „OMEN messplatz“: bei Anmeldung micha, nicht erhöht, ohne Zeitgrenze, 3 Neustarts im Minuten-Takt, conhost --headless. Der Nutzer hat sie am 23.10. in der OMEN-Sitzung freigegeben.
- **messplatz/:** Schleife, Richter und Serie des Dienstes.
