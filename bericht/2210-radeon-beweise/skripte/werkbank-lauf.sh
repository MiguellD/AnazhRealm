#!/bin/bash
# 2210 radeon-beweise: EINE echte Werkbank-Sitzung auf der Radeon (save-server :7903, Werkbank :7902), Schritte aus $@ als Datei
# je Zeile ein werkbank-Kommando (ohne "node scripts/werkbank.cjs"); Ausgaben nach $OUT/<tag>-<n>.txt; immer stop + save-server weg.
WT=/c/Users/micha/AnazhRealm-profiband/.claude/worktrees/radeon-beweise
OUT=/c/Users/micha/AnazhRealm-profiband/.claude/worktrees/koordination/bericht/2210-radeon-beweise
TAG=$1; SCHRITTE=$2
export WERKBANK_PORT=7902
cd $WT
mkdir -p $OUT/stand-$TAG
(PORT=7903 node save-server.js > $OUT/$TAG-save.log 2>&1 &)
for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:7903/ 2>/dev/null | grep -q 200 && break; sleep 1; done
(node scripts/werkbank.cjs start --echt --port 7902 --seite http://localhost:7903 $START_OPT > $OUT/$TAG-werkbank.log 2>&1 &)
for t in $(seq 1 120); do grep -qE "bereit|FEHLER|Error" $OUT/$TAG-werkbank.log 2>/dev/null && break; sleep 5; done
echo "start: $(grep -E 'bereit|FEHLER|Error' $OUT/$TAG-werkbank.log | head -2)"
n=0
while IFS= read -r z; do
  [ -z "$z" ] && continue; n=$((n+1))
  eval "timeout ${STEP_T:-420} node scripts/werkbank.cjs $z" > $OUT/$TAG-$n.txt 2>&1; e=$?
  echo "schritt $n EXIT=$e: $z | $(tail -2 $OUT/$TAG-$n.txt | tr '\n' ' ' | cut -c1-300)"
done < $SCHRITTE
node scripts/werkbank.cjs stop > /dev/null 2>&1; sleep 3
for p in $(netstat -ano | grep -E ":(7902|7903) .*(LISTEN|ABH)" | awk '{print $5}' | sort -u); do taskkill //F //T //PID $p > /dev/null 2>&1; done
mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $OUT/stand-$TAG/ 2>/dev/null
echo "ende $TAG"
