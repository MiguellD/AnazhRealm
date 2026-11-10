@echo off
rem Schaltet den Autostart der AnazhRealm-Dienste AUS: entfernt AnazhRealm-Dienste.cmd aus dem Autostart-Ordner dieses Benutzers.
set "Z=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\AnazhRealm-Dienste.cmd"
if exist "%Z%" del "%Z%"
if not exist "%Z%" echo Autostart AUS.
echo Laufende Dienste bleiben unberuehrt.
pause
