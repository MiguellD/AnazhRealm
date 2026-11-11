#!/bin/bash
# Einzel-Übersetzung je Fall eines Baustein-Ordners, mehrere Durchgänge (der Durchgang wechselt außen, die Fälle innen):
#   uebersetz-ordner.sh <werkzeug> <ordner unter gc> "<durchgänge>" <fall> …   → <ordner>/<fall>.uebersetz-<x>.json
W=$1; D=$2; X=$3; shift 3
for x in $X; do for f in "$@"; do FREI_JSON="$W/gc/$D/$f.uebersetz-$x.json" node "$W/gc/uebersetz-sonde.cjs" "$W/gc/$D/$f.json" > "$W/gc/$D/$f.uebersetz-$x.log" 2>&1; echo "$x $f EXIT=$? $(head -n 1 "$W/gc/$D/$f.uebersetz-$x.log" | cut -c1-80)"; done; done
