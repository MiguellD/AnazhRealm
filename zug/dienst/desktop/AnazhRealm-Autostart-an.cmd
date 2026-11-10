@echo off
rem Schaltet den Autostart der AnazhRealm-Dienste EIN: kopiert AnazhRealm-Dienste.cmd in den Autostart-Ordner dieses Benutzers.
rem Wirkung: nach jedem Anmelden starten zug, radeon und buche von selbst. Zurueck: AnazhRealm-Autostart-aus.cmd
set "Q=C:\Users\micha\AnazhRealm-profiband\artifacts\profiband\dienst\AnazhRealm-Dienste.cmd"
set "Z=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\AnazhRealm-Dienste.cmd"
if not exist "%Q%" echo ROT: %Q% fehlt - erst start.sh fahren
if not exist "%Q%" pause
if not exist "%Q%" exit /b 1
copy /Y "%Q%" "%Z%" >nul
if exist "%Z%" echo Autostart EIN: %Z%
echo Beim naechsten Anmelden starten die Dienste von selbst. Laufende Dienste bleiben, wie sie sind.
pause
