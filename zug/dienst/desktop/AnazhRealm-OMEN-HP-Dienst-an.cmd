@echo off
rem AnazhRealm-OMEN-HP-Dienst-an.cmd - der Rueckweg von AnazhRealm-OMEN-HP-Dienst-aus.cmd:
rem stellt den HP-Dienst "HP Omen HSA Service" (HPOmenCap) wieder auf "Automatisch" und startet ihn.
rem Danach verbraucht OmenCap.exe wieder Rechenzeit; die Zeit-Messungen der OMEN stehen dann wieder unter dieser Last.

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
echo 1/2  Start auf "Automatisch" stellen ...
sc config HPOmenCap start= auto >nul
echo 2/2  Dienst HPOmenCap starten ...
sc start HPOmenCap >nul 2>&1
timeout /t 4 /nobreak >nul

echo.
echo STAND (so steht es jetzt):
sc query HPOmenCap | find "STATE"
sc qc HPOmenCap | find "START_TYPE"
echo.
echo Der HP-Dienst laeuft wieder. Sag es der Sitzung, damit sie die Zeit-Messungen der OMEN richtig einordnet.
pause
