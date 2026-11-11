@echo off
rem AnazhRealm-OMEN-HP-Dienst-aus.cmd - haelt auf der OMEN den HP-Dienst "HP Omen HSA Service" an (Dienst HPOmenCap, OmenCap.exe).
rem WARUM: seit dem Neustart am 11.11. 16:03 verbrauchte OmenCap.exe 23 463 CPU-Sekunden in 6,5 h - rund EIN Kern ohne Pause.
rem        Die Punkte-Maschine verwirft deshalb Zeit-Stationen als "Fremd-Last: OmenCap.exe", und jede Zeit-Messung der OMEN
rem        steht unter dieser Last. Der Dienst startet nach jedem Neustart von selbst wieder (StartType Automatic).
rem WAS:   1 stoppt den Dienst HPOmenCap   2 stellt seinen Start auf "Manuell" (er kommt nach einem Neustart nicht von selbst).
rem        Es wird nichts deinstalliert und nichts geloescht. Zurueck: AnazhRealm-OMEN-HP-Dienst-an.cmd
rem ACHTUNG: der Dienst gehoert zum OMEN Gaming Hub. Solange er steht, koennen dort Funktionen fehlen (Leistungsmodus,
rem          Luefter-Steuerung, Beleuchtung) - ungeprueft, welche. Fehlt dir etwas: die an-Datei klicken.
rem NUR FUER DIE OMEN. Auf einem Rechner ohne diesen Dienst tut die Datei nichts.

net session >nul 2>&1
if %errorlevel% neq 0 (
    echo Diese Datei braucht Administrator-Rechte - gleich fragt Windows nach.
    powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
    exit /b
)

sc query HPOmenCap >nul 2>&1
if %errorlevel% neq 0 (
    echo Den Dienst HPOmenCap gibt es auf diesem Rechner nicht - nichts zu tun.
    pause
    exit /b
)

echo.
echo 1/2  Dienst HPOmenCap stoppen ...
sc stop HPOmenCap >nul 2>&1
timeout /t 4 /nobreak >nul
echo 2/2  Start auf "Manuell" stellen ...
sc config HPOmenCap start= demand >nul

echo.
echo STAND (so steht es jetzt):
sc query HPOmenCap | find "STATE"
sc qc HPOmenCap | find "START_TYPE"
echo.
echo Erwartet: STATE ... STOPPED und START_TYPE ... DEMAND_START.
echo Steht dort RUNNING, sag es der Sitzung - dann haelt etwas den Dienst am Leben.
echo Zurueck geht es mit AnazhRealm-OMEN-HP-Dienst-an.cmd
pause
