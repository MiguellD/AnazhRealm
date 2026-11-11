@echo off
rem AnazhRealm-Updates-holen.cmd - hebt die Pause von AnazhRealm-Kein-Auto-Neustart.cmd auf, damit DU jetzt Updates holst.
rem ABLAUF: 1 diese Datei klicken  2 in den Einstellungen "Nach Updates suchen", installieren lassen
rem         3 den Rechner SELBST neu starten, wenn es passt (vorher der Sitzung sagen: Zuege und Messungen halten an)
rem         4 nach dem Neustart AnazhRealm-Kein-Auto-Neustart.cmd wieder klicken.
rem Solange die Pause aufgehoben ist, darf Windows ausserhalb der Nutzungszeit wieder von selbst neu starten.

net session >nul 2>&1
if %errorlevel% neq 0 (
    echo Diese Datei braucht Administrator-Rechte - gleich fragt Windows nach.
    powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
    exit /b
)

set "UX=HKLM\SOFTWARE\Microsoft\WindowsUpdate\UX\Settings"
set "AU=HKLM\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate\AU"

echo.
echo Pause aufheben ...
for %%v in (PauseUpdatesStartTime PauseUpdatesExpiryTime PauseFeatureUpdatesStartTime PauseFeatureUpdatesEndTime PauseQualityUpdatesStartTime PauseQualityUpdatesEndTime FlightSettingsMaxPauseDays) do reg delete "%UX%" /v %%v /f >nul 2>&1
echo Richtlinien entfernen ...
for %%v in (NoAutoUpdate AUOptions NoAutoRebootWithLoggedOnUsers) do reg delete "%AU%" /v %%v /f >nul 2>&1

echo.
echo Die Pause ist aufgehoben. Jetzt in den Einstellungen "Nach Updates suchen", installieren,
echo SELBST neu starten - und danach AnazhRealm-Kein-Auto-Neustart.cmd wieder klicken.
start "" ms-settings:windowsupdate
pause
