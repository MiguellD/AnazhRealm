#!/bin/bash
# Spike-Schatten: an EINEM Ort (Third) in EINER Welt A/B mit der Sonde. Aufruf: mess.sh <ort> <folge z.B. ABAB> [einschwingen 0|1]
S=/c/Users/micha/AppData/Local/Temp/claude/C--Users-micha-AnazhRealm-profiband/6fa51df3-2aff-4c17-ad6e-f72b9a955836/scratchpad
WT=/c/Users/micha/AnazhRealm-profiband/.claude/worktrees/spike-schatten
cd "$WT"
ORT=$1
FOLGE=${2:-ABAB}
EIN=${3:-1}
OUT=$S/sp/${4:-lauf}; mkdir -p "$OUT"
W() { node scripts/werkbank.cjs "$@" --port 8702; }

if [ "$EIN" = "1" ]; then
    W umstellen --ort "$ORT" --sicht third > "$OUT/umstellen-$ORT.txt" 2>&1; echo "umstellen EXIT=$?"
    tail -3 "$OUT/umstellen-$ORT.txt"
    W methode _loopShadowUpdate --quelle "$S/A" ; echo "methode A EXIT=$?"
    W lauf 15 --ein 30 --ruhe 240 --regler voll --tiere frei > "$OUT/einschwingen-$ORT.json" 2>&1; echo "einschwingen EXIT=$?"
fi
n=0
for seite in $(echo "$FOLGE" | grep -o .); do
    n=$((n + 1))
    if [ "$seite" = "A" ]; then W methode _loopShadowUpdate --quelle "$S/A" > /dev/null; else W methode _loopShadowUpdate > /dev/null; fi
    echo "methode $seite EXIT=$?"
    node "$S/sonde-ruf.cjs" start > /dev/null; echo "sonde start EXIT=$?"
    W lauf 20 --ein 3 --regler voll --tiere frei > "$OUT/lauf-$ORT-$n-$seite.json" 2>&1; echo "lauf $n $seite EXIT=$?"
    node "$S/sonde-ruf.cjs" stop > "$OUT/sonde-$ORT-$n-$seite.json" 2>&1; echo "sonde stop EXIT=$?"
done
echo MESS_EXIT=0
