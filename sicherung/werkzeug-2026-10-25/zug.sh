#!/bin/bash
# zug.sh <verb> ... — der Merge-Zug zwischen „Zweig grün" und „main". Hilfe: zug.md daneben. Rumpf: zug.cjs (node-fetch).
# Token wie ci-lesen.sh (git credential). Exit: 0 grün/bereit/gebaut · 1 rot/abbruch · 3 läuft · 2 Fehler.
TOKEN=$(printf 'protocol=https\nhost=github.com\n\n' | git credential fill 2>/dev/null | sed -n 's/^password=//p'); export TOKEN
exec node "$(dirname "$0")/zug.cjs" "$@"
