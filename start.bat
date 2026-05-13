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

echo Starte Anazh Save-Server (Port 4312)...
start "Anazh Save-Server" cmd /k "cd /d ""%~dp0"" && node save-server.js"

echo Starte Anazh Signaling-Server fuer Multi-User (Port 4313)...
start "Anazh Signaling-Server" cmd /k "cd /d ""%~dp0"" && node signaling-server.js"

echo Warte kurz auf Serverstart...
timeout /t 2 /nobreak >nul

echo Oeffne Spiel im Browser...
start "" "http://127.0.0.1:4312"

echo.
echo Beide Server laufen jetzt:
echo   - Save-Server (Spielstand-Persistenz): http://127.0.0.1:4312
echo   - Signaling-Server (Multi-User V1):    ws://127.0.0.1:4313
echo.
echo Fuer Multi-User: Einstellungen-Drawer im Spiel oeffnen,
echo "Multi-User Sync" aktivieren, dann einen zweiten Browser-Tab
echo derselben Welt-ID oeffnen und ebenfalls aktivieren.
echo.
echo Fertig. Du kannst dieses Fenster schliessen.
exit /b 0
