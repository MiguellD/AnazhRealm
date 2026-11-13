#!/bin/bash
# unter sh.exe neu (Grund und Zahlen: zug-dienst.sh „UNTER sh.exe", 13.11.) — als sh gerufen schaltet die Zeile nur POSIX ab
case "$BASH" in */sh | */sh.exe) set +o posix ;; *) [ -x /usr/bin/sh ] && exec /usr/bin/sh "$0" "$@" ;; esac
# ci-warte.sh <sha> : wartet, bis kein Lauf dieses Kopfes mehr läuft (und mindestens einer existiert), dann die Jobs.
W=$(dirname "$0")
while true; do
  out=$(sh "$W/ci-lesen.sh" "$1" 2>&1)
  if [ -n "$out" ] && ! echo "$out" | grep -q -E "in_progress|queued|waiting|pending"; then echo "$out"; break; fi
  sleep 60
done
