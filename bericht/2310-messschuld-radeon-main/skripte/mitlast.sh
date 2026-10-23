#!/bin/bash
# mitlast.sh TAG <befehl...> — die Fremdlast IM Schloss: fremd.ps1 (CPU ohne den eigenen Browser-Baum und Node) beim Start, alle 50 s
# und am Ende nach last.txt, dazwischen EIN Befehl
S=$(dirname $0); L=$(dirname $S)/last.txt; TAG=$1; shift
FP=$(cygpath -w $S/fremd.ps1)
f() { echo "$TAG-$1 $(date -Iseconds) $(powershell -NoProfile -ExecutionPolicy Bypass -File "$FP" 2>&1 | tr -d '\r')" >> $L; }
f start
( n=0; while sleep 40; do n=$((n+1)); f t$n; done ) & W=$!
"$@"; rc=$?
kill $W 2>/dev/null
f ende
exit $rc
