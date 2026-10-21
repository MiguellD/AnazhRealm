#!/bin/sh
R=/c/Users/micha/AppData/Local/Temp/claude/mk-2110
cd /c/Users/micha/AnazhRealm-profiband/.claude/worktrees/mk-2110
S=$R/schloss.sh
# 1. ki korpus echt (ollama qwen3:4b-instruct, CPU)
$S nimm >> $R/kette.log
echo "korpus start $(date +%H:%M:%S)" >> $R/kette.log
V1_PFAD_PORT=7935 LINSE_GPU=karte KI_MODELL=qwen3:4b-instruct node scripts/diag-v1-pfad.cjs --korpus --echt > $R/ki-korpus.log 2>&1; echo EXIT=$? >> $R/ki-korpus.log
$S gib >> $R/kette.log
# 2. garage G7
$S nimm >> $R/kette.log
GARAGE_LABOR_PORT=7936 LINSE_GPU=karte node scripts/diag-garage-labor.cjs > $R/garage-labor.log 2>&1; echo EXIT=$? >> $R/garage-labor.log
$S gib >> $R/kette.log
# 3. Welt-Tempo (werkbank --echt)
$S nimm >> $R/kette.log
node scripts/werkbank.cjs start --echt --port 7934 > $R/werkbank.log 2>&1 &
i=0; while ! grep -q "WERKBANK bereit" $R/werkbank.log && [ $i -lt 300 ]; do sleep 2; i=$((i+1)); done
node scripts/werkbank.cjs eval "$(cat $R/tempo.js)" --port 7934 > $R/tempo.json 2>&1; echo EXIT=$? >> $R/kette.log
node scripts/werkbank.cjs stop --port 7934 >> $R/kette.log 2>&1
sleep 3
$S gib >> $R/kette.log
echo "KETTE ENDE $(date +%H:%M:%S)" >> $R/kette.log
