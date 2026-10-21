#!/bin/sh
# schloss.sh nimm|gib — GPU-Schloss mk-2110 (atomar mkdir, besitzer.txt; nimm wartet bis frei, verwaist > 60 min)
S=/c/Users/micha/AppData/Local/Temp/claude/gpu-schloss
case "$1" in
nimm)
  while ! mkdir "$S" 2>/dev/null; do
    if [ -n "$(find "$S" -maxdepth 0 -mmin +60 2>/dev/null)" ]; then echo "verwaist: $(cat $S/besitzer.txt)"; rm -rf "$S"; continue; fi
    sleep 5
  done
  printf 'mk-2110 %s' "$(date +%H:%M:%S)" > "$S/besitzer.txt"; echo "SCHLOSS mk-2110 $(date +%H:%M:%S)";;
gib)
  if grep -q '^mk-2110' "$S/besitzer.txt" 2>/dev/null; then rm -rf "$S"; echo "frei $(date +%H:%M:%S)"; else echo "nicht meins: $(cat $S/besitzer.txt 2>/dev/null)"; fi;;
esac
