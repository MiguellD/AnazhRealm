#!/bin/bash
# ABAB der CPU je Zug: ./cpu-zuege.sh  (A = 884111fc auf :7904, B = host-vram Arbeitsbaum auf :7903)
P2=/c/Users/micha/Desktop/AnazhRealm-OMEN/p2
WT=/c/Users/micha/Desktop/AnazhRealm-OMEN/host-vram
export WERKBANK_PORT=7900
W="node $WT/scripts/werkbank.cjs"
for X in A B A B; do
  [ $X = A ] && SEITE=7904 || SEITE=7903
  (cd $WT && node scripts/werkbank.cjs start --echt --port 7900 --seite http://localhost:$SEITE > $P2/werkbank-cpu-$X.log 2>&1 &)
  for t in $(seq 1 120); do grep -q "WERKBANK bereit" $P2/werkbank-cpu-$X.log 2>/dev/null && break; sleep 5; done
  $W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null
  $W fenster 1920 1080 > /dev/null
  $W umstellen --ort wiese > /dev/null
  $W eval "return window.__buehne()" > /dev/null
  $W eval "r.state.yaw = 0; r.state.pitch = 0; return 1" > /dev/null
  echo "$(date +%T) $X :$SEITE $(node $P2/cpu-zuege.cjs 7900 300 | tr -d '\n ')"
  $W stop > /dev/null 2>&1; sleep 4
done
