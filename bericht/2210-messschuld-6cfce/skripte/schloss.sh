#!/bin/bash
# schloss.sh nimm|gib  — GPU-Schloss "messschuld-2"
L="$TEMP/claude/gpu-schloss"
case "$1" in
nimm)
  t=0
  while ! mkdir "$L" 2>/dev/null; do
    if [ $t -ge 2700 ]; then echo "SCHLOSS BLOCKIERT von $(cat "$L/besitzer.txt" 2>/dev/null)"; exit 2; fi
    sleep 15; t=$((t+15))
  done
  echo "messschuld-2" > "$L/besitzer.txt"; echo "SCHLOSS genommen nach ${t}s";;
gib)
  if [ "$(cat "$L/besitzer.txt" 2>/dev/null)" = "messschuld-2" ]; then rm -rf "$L"; echo "SCHLOSS frei"; else echo "SCHLOSS nicht meins: $(cat "$L/besitzer.txt" 2>/dev/null)"; fi;;
esac
