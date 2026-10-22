#!/bin/bash
# K8 mit gesetzter Sicht (Ego, Third) auf der Radeon, am Kopf des Worktrees; je Sicht Log + EXIT
WT=/c/Users/micha/AnazhRealm-profiband/.claude/worktrees/radeon-beweise
OUT=/c/Users/micha/AnazhRealm-profiband/.claude/worktrees/koordination/bericht/2210-radeon-beweise
cd $WT
for s in ego third; do
  KOERPER_STAND_PORT=7905 KOERPER_STAND_JSON=$(cygpath -m $OUT/k8-$s.json) node scripts/diag-k8-$s.cjs --k8 > $OUT/k8-$s.log 2>&1; echo "EXIT=$?" >> $OUT/k8-$s.log
  echo "$s $(grep -E '^ *K8 wiese' $OUT/k8-$s.log | tail -1 | cut -c1-400) $(tail -1 $OUT/k8-$s.log)"
done
