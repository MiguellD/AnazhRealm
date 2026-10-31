#!/bin/sh
# lokaler Prüfstand: swiftshader rendert 1080p langsamer als der GPU-Wachhund wartet — ohne ihn verliert die Welt ihr Gerät
exec /usr/bin/google-chrome --disable-gpu-watchdog --disable-gpu-process-crash-limit "$@"
