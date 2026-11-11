@echo off
rem AnazhRealm-Kein-Auto-Neustart.cmd - Windows Update startet diesen Rechner nicht mehr von selbst neu.
rem WARUM: am 11.11. startete Windows Update den Laptop (07:14) und die OMEN (16:03) mitten in der Arbeit neu;
rem        Zuege, Messungen und Sitzungen fielen. Windows 11 Home hat keinen Schalter "nie automatisch neu starten"
rem        (die Nutzungszeit deckt hoechstens 18 von 24 Stunden). Verlaesslich ist nur: Updates bleiben ANGEHALTEN,
rem        bis der Schoepfer sie selbst holt (AnazhRealm-Updates-holen.cmd) und danach selbst neu startet.
rem WAS:   1 haelt Windows Update an bis 2046 (dieselben Werte, die "Updates pausieren" in den Einstellungen setzt,
rem          nur mit spaeterem Ende; HKLM\SOFTWARE\Microsoft\WindowsUpdate\UX\Settings)
rem        2 setzt dazu die zwei alten Richtlinien "vor dem Herunterladen fragen" und "kein Neustart, solange
rem          jemand angemeldet ist" (HKLM\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate\AU) - Windows 11 Home
rem          beachtet sie nicht sicher, sie schaden nicht.
rem        Es wird KEIN Dienst abgeschaltet und KEINE Aufgabe geloescht. Zurueck: AnazhRealm-Updates-holen.cmd
rem ACHTUNG: solange angehalten ist, kommen auch keine Sicherheits-Updates. Hole sie in deinem Takt von Hand.

net session >nul 2>&1
if %errorlevel% neq 0 (
    echo Diese Datei braucht Administrator-Rechte - gleich fragt Windows nach.
    powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
    exit /b
)

set "UX=HKLM\SOFTWARE\Microsoft\WindowsUpdate\UX\Settings"
set "AU=HKLM\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate\AU"
set "ENDE=2046-01-01T00:00:00Z"
for /f %%i in ('powershell -NoProfile -Command "Get-Date ([DateTime]::UtcNow) -Format s"') do set "JETZT=%%iZ"

echo.
echo 1/2  Windows Update anhalten bis %ENDE% ...
reg add "%UX%" /v FlightSettingsMaxPauseDays /t REG_DWORD /d 7300 /f >nul
reg add "%UX%" /v PauseUpdatesStartTime /t REG_SZ /d "%JETZT%" /f >nul
reg add "%UX%" /v PauseUpdatesExpiryTime /t REG_SZ /d "%ENDE%" /f >nul
reg add "%UX%" /v PauseFeatureUpdatesStartTime /t REG_SZ /d "%JETZT%" /f >nul
reg add "%UX%" /v PauseFeatureUpdatesEndTime /t REG_SZ /d "%ENDE%" /f >nul
reg add "%UX%" /v PauseQualityUpdatesStartTime /t REG_SZ /d "%JETZT%" /f >nul
reg add "%UX%" /v PauseQualityUpdatesEndTime /t REG_SZ /d "%ENDE%" /f >nul

echo 2/2  Richtlinien: vor dem Herunterladen fragen, kein Neustart bei angemeldetem Benutzer ...
reg add "%AU%" /v NoAutoUpdate /t REG_DWORD /d 0 /f >nul
reg add "%AU%" /v AUOptions /t REG_DWORD /d 2 /f >nul
reg add "%AU%" /v NoAutoRebootWithLoggedOnUsers /t REG_DWORD /d 1 /f >nul

echo.
echo STAND (so steht es jetzt in der Registrierung):
reg query "%UX%" /v PauseUpdatesExpiryTime 2>nul | find "Pause"
reg query "%AU%" /v AUOptions 2>nul | find "AUOptions"
reg query "%AU%" /v NoAutoRebootWithLoggedOnUsers 2>nul | find "NoAuto"
echo.
echo PRUEFE SELBST: Einstellungen - Windows Update. Dort muss stehen "Updates angehalten bis ...".
echo Steht dort etwas anderes, sag es der Sitzung - dann traegt dieser Rechner die Pause so nicht.
echo.
echo Updates holst du von jetzt an selbst: AnazhRealm-Updates-holen.cmd, danach selbst neu starten,
echo danach diese Datei noch einmal klicken.
start "" ms-settings:windowsupdate
pause
