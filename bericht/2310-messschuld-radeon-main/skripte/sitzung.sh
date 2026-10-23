#!/bin/bash
# sitzung.sh TAG SCHRITTE — EINE echte Werkbank-Sitzung auf der Radeon am main-Kopf 452972a6 (save-server :7973, Werkbank :7972);
# je Zeile ein werkbank-Kommando, eine Zeile mit „!" vorn ist ein roher Befehl im Mess-Baum. Ausgaben nach $OUT/<tag>-<n>.txt;
# am Ende immer stop + Ports geräumt. (Kopie von 2210-messschuld-6cfce/skripte/sitzung.sh, nur Pfade neu)
WT=/c/Users/micha/AnazhRealm-profiband/.claude/worktrees/mess-main
OUT=/c/Users/micha/AnazhRealm-profiband/.claude/worktrees/koord-messmain/bericht/2310-messschuld-radeon-main
TAG=$1; SCHRITTE=$2
export WERKBANK_PORT=7972
cd $WT
mkdir -p $OUT/stand-$TAG
(PORT=7973 node save-server.js > $OUT/$TAG-save.log 2>&1 &)
for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:7973/ 2>/dev/null | grep -q 200 && break; sleep 1; done
echo "bedient: $(curl -s http://localhost:7973/stamm/dirigent-kern.js | grep -o 'VERSION = "[0-9.]*"' | head -1)"
(node scripts/werkbank.cjs start --echt --port 7972 --seite http://localhost:7973 $START_OPT > $OUT/$TAG-werkbank.log 2>&1 &)
for t in $(seq 1 120); do grep -qE "bereit|FEHLER|Error" $OUT/$TAG-werkbank.log 2>/dev/null && break; sleep 5; done
echo "start: $(grep -E 'bereit|FEHLER|Error' $OUT/$TAG-werkbank.log | head -2)"
n=0
while IFS= read -r z; do
  [ -z "$z" ] && continue; n=$((n+1))
  if [ "${z:0:1}" = "!" ]; then eval "timeout ${STEP_T:-420} ${z:1}" > $OUT/$TAG-$n.txt 2>&1; e=$?
  else eval "timeout ${STEP_T:-420} node scripts/werkbank.cjs $z" > $OUT/$TAG-$n.txt 2>&1; e=$?; fi
  echo "schritt $n EXIT=$e: ${z:0:120} | $(tail -2 $OUT/$TAG-$n.txt | tr '\n' ' ' | cut -c1-300)"
done < $SCHRITTE
node scripts/werkbank.cjs stop > /dev/null 2>&1; sleep 3
for p in $(netstat -ano | grep -E ":(7971|7972|7973) .*(LISTEN|ABH)" | awk '{print $5}' | sort -u); do taskkill //F //T //PID $p > /dev/null 2>&1; done
mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $OUT/stand-$TAG/ 2>/dev/null
echo "ende $TAG"
