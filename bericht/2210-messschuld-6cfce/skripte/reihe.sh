#!/bin/bash
# reihe.sh — die Radeon-Läufe der Mess-Bahn nacheinander, JEDER genau EIN Befehl unter gpu-lauf.sh messbahn (das Schloss je Lauf)
S=/c/Users/micha/AnazhRealm-profiband/.claude/worktrees/koordination/bericht/2210-messschuld-6cfce/skripte
O=$(dirname $S); OW=C:/Users/micha/AnazhRealm-profiband/.claude/worktrees/koordination/bericht/2210-messschuld-6cfce
WT=/c/Users/micha/AnazhRealm-profiband/.claude/worktrees/mess-6cfce
G=/c/Users/micha/AnazhRealm-profiband/artifacts/profiband/werkzeug/gpu-lauf.sh
SP=C:/Users/micha/AppData/Local/Temp/claude/C--Users-micha-AnazhRealm-profiband/bf30ee29-0ba1-482e-ac38-fc10c609d0c3/scratchpad
raeum() { powershell -NoProfile -c "foreach(\$p in 7970..7979){ Get-NetTCPConnection -LocalPort \$p -State Listen -ErrorAction SilentlyContinue | % { Stop-Process -Id \$_.OwningProcess -Force -ErrorAction SilentlyContinue } }"; }
lauf() { local tag=$1; shift; raeum; $S/last.sh $tag-vor >> $O/last.txt; echo "== $tag $(date +%T)"; "$@" > $O/$tag.out 2>&1; echo "$tag EXIT=$?" | tee -a $O/$tag.out; }
for t in ${@:-m32b m31 m33 m15takt m35 m15aus}; do case $t in
  m32b) lauf m32b bash $G messbahn bash $S/sitzung.sh m32b $S/m32b-schritte.txt ;;
  m31) lauf m31 bash $G messbahn bash $S/srv.sh $O/m31-save.log node $S/m2-graben.cjs ;;
  m33) lauf m33 bash $G messbahn bash $S/srv.sh $O/m33-save.log node $S/m15-wind.cjs 60 ;;
  m15takt) lauf m15takt bash $G messbahn bash -c "cd $WT && KLANG_ZENSUS_PORT=7975 node scripts/diag-klang-zensus.cjs --takt --echt --json $OW/m15-klang-takt.json" ;;
  m35) mkdir -p $SP/m35; export GPU_LAUF_MAX_S=1800; lauf m35 bash $G messbahn env OUT_DIR=$SP/m35 ECHT_PORT=7974 node $S/echt-k1.cjs 20 kopf3 ;;
  m15aus) export GPU_LAUF_MAX_S=1500; lauf m15aus bash $G messbahn env GEH1_MIN=4 FAHRT_MIN=3 GEH2_MIN=3 bash $S/srv.sh $O/m15aus-save.log node $S/m14-spielgang.cjs ;;
esac; unset GPU_LAUF_MAX_S; done
raeum
echo "REIHE ENDE $(date +%T)"
