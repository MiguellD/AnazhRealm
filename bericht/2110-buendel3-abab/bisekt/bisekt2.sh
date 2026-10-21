#!/bin/bash
# 2110 Bündel 3, das GPU-Minus beim Namen, Runde 2 (Protokoll von Bündel 3: Bank nach lauf 30): gpu-bank an Genesis Third (stehend) über die integ-Schritte 57a9f2ab → fdda7c13 (+ belegung)
# → 9d5e1ca8 (+ ferne-luft) → d3a626ee (+ licht-weg, Versions-Stufe, CI-Zeiten). Seiten: A = n2010-b2a 57a9f2ab · C = n2110-ec fdda7c13
# (Baum des e-bauart-Schneiders, nur geliefert, nie geändert) · F = n2110-bf 9d5e1ca8 (node_modules als Junction auf n2010-b2b) ·
# B = n2010-b2b d3a626ee. EIN Instrument: werkbank.cjs aus B. Je Boot frische Sitzung (--echt, 1920×1080, Regler voll, Tiere frei,
# Dorf aus) · umstellen --ort genesis --sicht third · lauf 30 --ein 20 --ruhe 300 (dasselbe gesetzte Bild wie in Bündel 3; Belegung nebenbei) · gpu-bank 12 --runden 5.
# Folge A1 C1 F1 B1 A2 C2 F2 B2; GPU-Schloss omen-2010 je Boot; Seiten-Wache vor und nach; 20 s Pause.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
INS=$BASE/n2010-b2b
OUT=$BASE/p3/n2110/buendel3/bisekt2; LOG=$OUT/fortschritt.log; K14=$BASE/p3/k14; mkdir -p $OUT/stand
STOPP=$(cygpath -w $OUT/stopp.ps1)
export WERKBANK_PORT=4490; W="node $INS/scripts/werkbank.cjs"
say() { echo "$(date +%T) $*" | tee -a $LOG; }
stopp() { powershell -NoProfile -ExecutionPolicy Bypass -File "$STOPP" >> $OUT/stopp.log 2>&1; sleep 3; }
aufraeumen() { mkdir -p $OUT/stand/$1; mv $2/anazhRealmState.json $2/anazhRealmState.json.bak $2/anazhRealmPerf.json $OUT/stand/$1/ 2>/dev/null; return 0; }
gpu() { nvidia-smi --query-gpu=temperature.gpu,clocks.gr,clocks.mem,pstate,clocks_throttle_reasons.active --format=csv,noheader 2>/dev/null | tr -d '\n'; }
. $BASE/p3/gpu-schloss.sh
say "BISEKT START A=$(git -C $BASE/n2010-b2a log -1 --format=%h) C=$(git -C $BASE/n2110-ec log -1 --format=%h) F=$(git -C $BASE/n2110-bf log -1 --format=%h) B=$(git -C $BASE/n2010-b2b log -1 --format=%h) Instrument=$(git -C $INS log -1 --format=%h)"
for N in ${FOLGE:-A1 C1 F1 B1 A2 C2 F2 B2}; do
  [ -s $OUT/$N-bank.txt ] && { say "$N steht schon"; continue; }
  case $N in A*) WT=$BASE/n2010-b2a;; C*) WT=$BASE/n2110-ec;; F*) WT=$BASE/n2110-bf;; B*) WT=$BASE/n2010-b2b;; esac
  schloss_nehmen omen-2010; stopp; aufraeumen $N-vor $WT
  (cd $WT && PORT=4312 node "$(cygpath -w $WT)\\save-server.js" > $OUT/stand/$N-save.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
  FP=$(node $K14/fingerabdruck.cjs $WT 2>>$LOG) || { say "$N SEITEN-WACHE ROT ($WT)"; stopp; schloss_loesen omen-2010; exit 3; }
  nvidia-smi --query-gpu=timestamp,clocks.gr,clocks.mem,temperature.gpu,power.draw,pstate,clocks_throttle_reasons.active --format=csv,noheader -l 1 > $OUT/$N-smi.csv 2>/dev/null & SMI=$!
  (cd $INS && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 --ort genesis > $OUT/$N-werkbank.log 2>&1 &)
  for t in $(seq 1 120); do grep -qE "bereit|FEHLER" $OUT/$N-werkbank.log 2>/dev/null && break; sleep 5; done
  say "$N start $(git -C $WT log -1 --format=%h) FP=$FP gpu[$(gpu)]"
  $W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null 2>&1
  $W fenster 1920 1080 > /dev/null 2>&1
  $W umstellen --ort genesis --sicht third > $OUT/$N-umstellen.txt 2>&1
  $W lauf 30 --ein 20 --ruhe 300 --regler voll --tiere frei > $OUT/$N-lauf.txt 2>&1
  $W gpu-bank 12 --runden 5 > $OUT/$N-bank.txt 2>&1
  $W stop > /dev/null 2>&1; kill $SMI 2>/dev/null
  FP2=$(node $K14/fingerabdruck.cjs $WT 2>>$LOG) || FP2=ROT
  [ "$FP2" = "$FP" ] || say "$N SEITEN-WACHE NACHHER ROT"
  say "$N ende gpu[$(gpu)] bank[$(tr -d '\n ' < $OUT/$N-bank.txt | cut -c1-120)]"
  stopp; aufraeumen $N-nach $WT; schloss_loesen omen-2010; sleep 20
done
say "BISEKT ENDE"
