#!/bin/bash
# reihe.sh — die Radeon-Läufe der Mess-Bahn am main-Kopf 452972a6 nacheinander, JEDER genau EIN Befehl unter gpu-lauf.sh messbahn
S=/c/Users/micha/AnazhRealm-profiband/.claude/worktrees/koord-messmain/bericht/2310-messschuld-radeon-main/skripte
O=$(dirname $S); OW=C:/Users/micha/AnazhRealm-profiband/.claude/worktrees/koord-messmain/bericht/2310-messschuld-radeon-main
WT=/c/Users/micha/AnazhRealm-profiband/.claude/worktrees/mess-main
G=/c/Users/micha/AnazhRealm-profiband/artifacts/profiband/werkzeug/gpu-lauf.sh
SP=C:/Users/micha/AppData/Local/Temp/claude/C--Users-micha-AnazhRealm-profiband/bf30ee29-0ba1-482e-ac38-fc10c609d0c3/scratchpad
raeum() { powershell -NoProfile -c "foreach(\$p in 7970..7979){ Get-NetTCPConnection -LocalPort \$p -State Listen -ErrorAction SilentlyContinue | % { Stop-Process -Id \$_.OwningProcess -Force -ErrorAction SilentlyContinue } }"; }
lauf() { local tag=$1; shift; raeum; $S/last.sh $tag-vor >> $O/last.txt; echo "== $tag $(date +%T)"; "$@" > $O/$tag.out 2>&1; echo "$tag EXIT=$?" | tee -a $O/$tag.out; $S/last.sh $tag-nach >> $O/last.txt; }
for t in ${@:-m41 m43 m38e m37}; do case $t in
  m37) mkdir -p $SP/m37; export GPU_LAUF_MAX_S=2400; lauf m37 bash $G messbahn bash $S/mitlast.sh m37 env OUT_DIR=$SP/m37 ECHT_PORT=7974 node $S/echt-k1.cjs 20 main ;;
  m37f) mkdir -p $SP/m37f; export GPU_LAUF_MAX_S=1200; lauf m37f bash $G messbahn bash $S/mitlast.sh m37f env K1_ARTEN=erwachen-fest,zufall OUT_DIR=$SP/m37f ECHT_PORT=7977 node $S/echt-k1.cjs 4 main-fest ;;
  m38e) mkdir -p $SP/m38e; lauf m38e bash $G messbahn bash $S/mitlast.sh m38e env OUT_DIR=$SP/m38e ECHT_PORT=7975 node $S/echt-k1.cjs erwachen main-erwachen ;;
  m41) lauf m41 bash $G messbahn bash -c "cd $WT && rm -rf artifacts/haus-welt && HAUS_WELT_PORT=7976 HAUS_WELT_JSON=$OW/m41-grund-bild.json node scripts/diag-haus-welt.cjs --phasen=grund --bild --echt" ;;
  m43b) lauf m43b bash $G messbahn bash $S/sitzung.sh m43b $S/m43b-schritte.txt ;;
  m43) node $S/m43-tafel-patch.cjs $WT/spec/farbe/albedo-tafel.json > $O/m43-patch.txt; lauf m43 bash $G messbahn bash $S/sitzung.sh m43 $S/m43-schritte.txt; git -C $WT checkout spec/farbe/albedo-tafel.json ;;
esac; unset GPU_LAUF_MAX_S; done
raeum
echo "REIHE ENDE $(date +%T)"
