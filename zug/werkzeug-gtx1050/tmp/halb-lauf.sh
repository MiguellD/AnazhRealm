#!/bin/bash
# übersetzt einen künstlichen Lauf (halb-bau.cjs) n-mal: halb-lauf.sh <werkzeug> <ordner unter gc> <durchgänge …>
W=$1; D=$2; shift 2
for x in "$@"; do FREI_JSON="$W/gc/$D/$x.json" node "$W/gc/uebersetz-sonde.cjs" "$W/gc/$D/lauf.json" > "$W/gc/$D/$x.log" 2>&1; echo "$x EXIT=$? $(head -n 1 "$W/gc/$D/$x.log" | cut -c1-110)"; done
