#!/bin/sh
R=/c/Users/micha/AppData/Local/Temp/claude/mk-2110
cd /c/Users/micha/AnazhRealm-profiband/.claude/worktrees/mk-2110
S=$R/schloss.sh
PORT=7938 node save-server.js > $R/save-server.log 2>&1 &
SP=$!
sleep 3
$S nimm >> $R/kette5.log
node scripts/werkbank.cjs start --echt --port 7934 --seite http://localhost:7938 > $R/werkbank5.log 2>&1 &
i=0; while ! grep -q "WERKBANK bereit\|WERKBANK-FEHLER" $R/werkbank5.log && [ $i -lt 150 ]; do sleep 2; i=$((i+1)); done
if grep -q "WERKBANK bereit" $R/werkbank5.log; then
  node scripts/werkbank.cjs eval "$(cat $R/tempo2.js)" --port 7934 > $R/tempo5.json 2>&1; echo "tempo EXIT=$?" >> $R/kette5.log
fi
node scripts/werkbank.cjs stop --port 7934 >> $R/kette5.log 2>&1
sleep 3
$S gib >> $R/kette5.log
kill $SP 2>/dev/null
for i in 4 5; do [ -f $R/kalt-$i.json ] && continue;
  $S nimm >> $R/kette5.log
  BOOT_STAGE_PORT=7937 node scripts/diag-boot-stage.cjs --kalt --echt --sek 60 --json $R/kalt-$i.json > $R/kalt-$i.log 2>&1; echo "kalt $i EXIT=$?" >> $R/kette5.log
  $S gib >> $R/kette5.log
  sleep 2
done
echo "KETTE5 ENDE $(date +%H:%M:%S)" >> $R/kette5.log
