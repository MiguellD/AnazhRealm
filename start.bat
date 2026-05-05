@echo off
setlocal

cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
    echo [Fehler] Node.js wurde nicht gefunden.
    echo Bitte installiere Node.js LTS und starte diese Datei danach erneut.
    pause
    exit /b 1
)

echo Starte Anazh Save-Server...
start "Anazh Save-Server" cmd /k "cd /d ""%~dp0"" && node save-server.js"

echo Warte kurz auf Serverstart...
timeout /t 2 /nobreak >nul

echo Oeffne Spiel im Browser...
start "" "http://127.0.0.1:4312"

echo Fertig. Du kannst dieses Fenster schliessen.
exit /b 0
