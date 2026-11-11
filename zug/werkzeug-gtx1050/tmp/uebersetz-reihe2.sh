#!/bin/bash
# weitere Durchgänge der Einzel-Übersetzung je Fall: uebersetz-reihe2.sh <werkzeug> "<durchgänge>" <fall> …  → <fall>.uebersetz-<x>.json
W=$1; D=$2; shift 2
for x in $D; do for f in "$@"; do FREI_JSON="$W/gc/baustein-kern1/$f.uebersetz-$x.json" node "$W/gc/uebersetz-sonde.cjs" "$W/gc/baustein-kern1/$f.json" > "$W/gc/baustein-kern1/$f.uebersetz-$x.log" 2>&1; echo "$x $f EXIT=$?"; done; done
