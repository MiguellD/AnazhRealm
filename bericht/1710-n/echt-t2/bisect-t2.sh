#!/bin/bash
# git bisect run fuer echt T2 (1710-n Schritt 1): je Stand ZWEI Laeufe gate:weltbild-frost:echt (frost.sh nimmt das Schloss um
# jeden Lauf). Urteil am T2-Befund, nicht am Exit allein: SCHLECHT nur, wenn BEIDE Laeufe „❌ T2 die Index-Wache“ tragen;
# GUT, wenn keiner ihn traegt; ein Wackler (einer rot, einer gruen) urteilt nie -> GUT (rot nur, wenn beide rot).
# Kein Lauf erreicht T2 (Skript-Fehler, Exit 2, anderer Absturz) -> 125 (skip).
WT=/c/Users/micha/Desktop/AnazhRealm-OMEN/n1710-t2
ROH=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/n1710/roh-t2
LOG=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/n1710/bisect-t2.log
K=$(git -C "$WT" rev-parse --short=8 HEAD)
rot=0; erreicht=0; zeilen=""
for n in 1 2; do
  bash /c/Users/micha/Desktop/AnazhRealm-OMEN/p3/n1710/frost.sh "$WT" "bisect-$K-$n"; ec=$?
  f="$ROH/bisect-$K-$n.log"
  t2=$(grep -c "T2 die Index-Wache" "$f"); t2rot=$(grep -c "❌ T2 die Index-Wache" "$f")
  [ "$t2" -gt 0 ] && erreicht=$((erreicht+1))
  [ "$t2rot" -gt 0 ] && rot=$((rot+1))
  zeilen="$zeilen lauf$n EXIT=$ec T2-Index-Wache-rot=$t2rot;"
done
if [ $erreicht -lt 2 ]; then u=SKIP; rc=125; elif [ $rot -eq 2 ]; then u=SCHLECHT; rc=1; else u=GUT; rc=0; fi
echo "$(date +%T) $K $u ($zeilen)" >> "$LOG"
exit $rc
