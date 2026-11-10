#!/bin/bash
# ci-warte.sh <sha> : wartet, bis kein Lauf dieses Kopfes mehr läuft (und mindestens einer existiert), dann die Jobs.
W=$(dirname "$0")
while true; do
  out=$(bash "$W/ci-lesen.sh" "$1" 2>&1)
  if [ -n "$out" ] && ! echo "$out" | grep -q -E "in_progress|queued|waiting|pending"; then echo "$out"; break; fi
  sleep 60
done
