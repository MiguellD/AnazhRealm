@echo off
rem Messplatz-Blick im eigenen Fenster (start.sh --fenster oder Doppelklick). Die Schleife startet ihn neu, wenn er endet:
rem ein neuer Code des Blicks wirkt, sobald sein node-Prozess beendet wird — im selben Fenster.
title Messplatz-Blick
"C:\Program Files\Git\bin\bash.exe" -lc "exec bash /c/Users/micha/AnazhRealm-profiband/artifacts/profiband/dienst/blick-fenster.sh"
