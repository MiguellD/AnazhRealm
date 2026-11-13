#!/bin/bash
# unter sh.exe neu (Grund und Zahlen: zug-dienst.sh „UNTER sh.exe", 13.11.) — als sh gerufen schaltet die Zeile nur POSIX ab
case "$BASH" in */sh | */sh.exe) set +o posix ;; *) [ -x /usr/bin/sh ] && exec /usr/bin/sh "$0" "$@" ;; esac
# zug.sh <verb> ... — der Merge-Zug zwischen „Zweig grün" und „main". Hilfe: zug.md daneben. Rumpf: zug.cjs (node-fetch).
# Token wie ci-lesen.sh (git credential). Exit: 0 grün/bereit/gebaut · 1 rot/abbruch · 3 läuft · 2 Fehler.
TOKEN=$(printf 'protocol=https\nhost=github.com\n\n' | git credential fill 2>/dev/null | sed -n 's/^password=//p'); export TOKEN
exec node "$(dirname "$0")/zug.cjs" "$@"
