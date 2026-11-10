@echo off
rem AnazhRealm-Dienste.cmd — liegt (nach dem Klick auf Desktop\AnazhRealm-Autostart-an.cmd) im Autostart-Ordner des Benutzers und
rem startet beim Anmelden die Schleifen des Messplatzes (zug, radeon, buche). Entfernen: Desktop\AnazhRealm-Autostart-aus.cmd.
rem Es ruft autostart.sh als KOPIE unter %TEMP% und endet sofort; die Schleifen selbst startet start.sh abgekoppelt ueber WMI.
start "" /min "C:\Program Files\Git\bin\bash.exe" -lc "mkdir -p /tmp/claude/dienst && cp /c/Users/micha/AnazhRealm-profiband/artifacts/profiband/dienst/autostart.sh /tmp/claude/dienst/autostart-lauf.sh && exec bash /tmp/claude/dienst/autostart-lauf.sh"
