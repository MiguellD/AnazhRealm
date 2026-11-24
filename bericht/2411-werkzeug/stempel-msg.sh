#!/bin/bash
# bash stempel-msg.sh <zweig> <kopf40> <satz-datei> <ziel-msg> [stempel-name] — baut die Abgabe-Nachricht: Betreff „Abgabe <name>: <erste Zeile der
# Satz-Datei> <Tags des Kopf-Betreffs>“, Rumpf = Rest der Satz-Datei, Trailer Fable. Die Tags ([gpu-probe: …] [ci voll]) kommen WÖRTLICH vom Kopf.
set -u; cd /c/Users/micha/AnazhRealm-profiband; export MSYS_NO_PATHCONV=1
Z=$1; H=$2; SATZ=$3; ZIEL=$4; N=${5:-w28-$Z}
git fetch -q origin $H
TAGS=$(git log -1 --format=%s $H | grep -o -E '(\[gpu-probe: [^]]*\] )?\[ci voll\]$')
[ -n "$TAGS" ] || { echo "HALT: der Kopf-Betreff trägt kein [ci voll]"; exit 1; }
{ printf 'Abgabe %s: %s %s\n' "$N" "$(head -1 "$SATZ")" "$TAGS"; tail -n +2 "$SATZ"; printf '\nCo-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>\n'; } > "$ZIEL"
head -1 "$ZIEL" | cut -c1-300
