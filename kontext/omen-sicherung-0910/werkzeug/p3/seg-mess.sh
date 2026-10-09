#!/bin/bash
# 0710-7 (3): der Strahl-Zähler an der Mess-Wiese — Seite $1 (Worktree), Instrument welle-m-nexus, Ports 7901/7902.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
SEITE=${1:-$BASE/abab-b535}
NAME=${2:-A}
OUT=$BASE/p3/seg; mkdir -p $OUT
INSTR=$BASE/welle-m-nexus
export WERKBANK_PORT=7902
W="node $INSTR/scripts/werkbank.cjs"
say() { echo "$(date +%T) $*" | tee -a $OUT/fortschritt.log; }
(cd $SEITE && PORT=7901 node save-server.js > $OUT/$NAME-save.log 2>&1 &)
for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:7901/ 2>/dev/null | grep -q 200 && break; sleep 1; done
say "$NAME Seite $(curl -s http://localhost:7901/anazhRealm.js | sha256sum | cut -c1-16)"
(cd $INSTR && node scripts/werkbank.cjs start --echt --port 7902 --seite http://localhost:7901 > $OUT/$NAME-werkbank.log 2>&1 &)
for t in $(seq 1 120); do grep -q "WERKBANK bereit" $OUT/$NAME-werkbank.log 2>/dev/null && break; sleep 5; done
say "$NAME Werkbank bereit"
$W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null
$W fenster 1920 1080 > /dev/null
$W umstellen --ort wiese > $OUT/$NAME-umstellen.txt 2>&1
$W eval "return window.__buehne()" > /dev/null
say "$NAME an der Wiese, Bühne steht"
$W eval "window.__segCmd = 'an'; $(cat $BASE/p3/seg-zaehler.js)" > /dev/null
$W lauf 20 --ein 10 --regler voll --tiere frei > $OUT/$NAME-lauf.txt 2>&1
$W eval "window.__segCmd = 'aus'; $(cat $BASE/p3/seg-zaehler.js)" > $OUT/$NAME-zaehler.json 2>&1
say "$NAME gezählt"
cat $OUT/$NAME-zaehler.json
