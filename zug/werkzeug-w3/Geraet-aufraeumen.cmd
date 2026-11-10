@echo off
rem Doppelklick: räumt dieses Messgerät auf (nur eigene Waisen + git-fsmonitor), druckt den Stand. Apps nur, wenn hinter -Apps genannt.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0geraet-aufraeumen.ps1" %*
pause
