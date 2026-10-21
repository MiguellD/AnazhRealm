#!/bin/sh
R=/c/Users/micha/AppData/Local/Temp/claude/mk-2110
cd /c/Users/micha/AnazhRealm-profiband/.claude/worktrees/mk-2110
S=$R/schloss.sh
PORT=7938 node save-server.js > $R/save-server.log 2>&1 &
SP=$!
sleep 3
# Garage: FOV und Arm bei vmax
$S nimm >> $R/kette3.log
GARAGE_LABOR_PORT=7936 LINSE_GPU=karte node scripts/diag-garage-mk.cjs > $R/garage-mk.log 2>&1; echo "garage EXIT=$?" >> $R/kette3.log
$S gib >> $R/kette3.log
# Welt-Tempo (werkbank --echt am eigenen save-server)
$S nimm >> $R/kette3.log
node scripts/werkbank.cjs start --echt --port 7934 --seite http://localhost:7938 > $R/werkbank.log 2>&1 &
i=0; while ! grep -q "WERKBANK bereit\|WERKBANK-FEHLER" $R/werkbank.log && [ $i -lt 150 ]; do sleep 2; i=$((i+1)); done
if grep -q "WERKBANK bereit" $R/werkbank.log; then
  node scripts/werkbank.cjs eval "$(cat $R/tempo.js)" --port 7934 > $R/tempo.json 2>&1; echo "tempo EXIT=$?" >> $R/kette3.log
fi
node scripts/werkbank.cjs stop --port 7934 >> $R/kette3.log 2>&1
sleep 3
$S gib >> $R/kette3.log
kill $SP 2>/dev/null
echo "KETTE3 ENDE $(date +%H:%M:%S)" >> $R/kette3.log
$R/kette2.sh
