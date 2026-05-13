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
echo ==========================================================
echo   Beide Server laufen jetzt:
echo     Save-Server (Persistenz):     http://127.0.0.1:4312
echo     Signaling-Server (Multi-User): ws://127.0.0.1:4313
echo.
echo   Multi-User auf einer Maschine (zwei Browser-Tabs):
echo     1. Beide Tabs auf http://127.0.0.1:4312
echo     2. In Einstellungen-Drawer "Multi-User Sync" aktivieren
echo     3. Beide Tabs sollten sich gegenseitig sehen
echo.
echo   Multi-User auf MEHREREN Maschinen im LAN:
echo     1. Diese Maschine hostet den Signaling-Server
echo        Deine LAN-IP findest du mit "ipconfig" (IPv4-Adresse)
echo        Andere Spieler tragen "ws://DEINE-LAN-IP:4313" als
echo        Signaling-URL in ihren Einstellungen ein
echo     2. Welt-Sharing: einer exportiert seine Welt
echo        (Welt-Drawer "Welt teilen"), andere importieren sie
echo        (Welt-Tor) - dann sind beide in derselben worldId
echo     3. Beide aktivieren "Multi-User Sync"
echo
echo   Firewall: Windows fragt evt. ob Node.js Verbindungen
echo   annehmen darf - auf "zulassen" klicken (nur Heim-/Privates
echo   Netzwerk reicht).
echo ==========================================================
echo.
echo Du kannst dieses Fenster schliessen.
exit /b 0
