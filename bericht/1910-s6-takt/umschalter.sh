#!/bin/bash
# 1910 S6-Takt UMSCHALTER: in EINER frischen B-Welt (n1910-s6b, Genesis Third) den Verband an der Daten-Ebene aus- und wieder
# einschalten (vb-aus.js / vb-an.js: userData.verband der Glieder auf undefined und zurück — kein Proxy, keine Hülle) und zeigen,
# ob der CPU-Takt dem Schalter folgt. Folge der Stellungen (ABBA, Drift hebt sich): nach dem Ruhe-Lauf (AN) AUS AN AN AUS AUS AN AN
# AUS AUS AN AN AUS,
# je Stellung `lauf 20 --ein 5 --regler voll --tiere frei` (der erste lauf 30 --ein 20 --ruhe 300 ist die Ruhe), dazu je
# Stellung der Tier-Zensus. Danach je Stellung ein Profil (AN AUS AN AUS, profil 20 --regler voll --top 60 --tiere frei) und der
# Drehzahlmesser tacho.js (AUS AN AUS AN, je 20 s).
# GPU-Schloss omen-1710-n um die Sitzung, Seiten-Wache vor und nach.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
B=$BASE/n1910-s6b; INS=$B; WT=$B
OUT=$BASE/p3/n1910/s6takt; LOG=$OUT/fortschritt.log; K14=$BASE/p3/k14
N=${N:-B7}; D=$OUT/schalter/$N; mkdir -p $D $OUT/stand
STOPP=$(cygpath -w $OUT/stopp.ps1)
export WERKBANK_PORT=4490
W="node $INS/scripts/werkbank.cjs"
say() { echo "$(date +%T) $*" | tee -a $LOG; }
stopp() { powershell -NoProfile -ExecutionPolicy Bypass -File "$STOPP" >> $OUT/stopp.log 2>&1; sleep 3; }
gpu() { nvidia-smi --query-gpu=temperature.gpu,clocks.gr,clocks.mem,pstate,clocks_throttle_reasons.active --format=csv,noheader 2>/dev/null | tr -d '\n'; }
beiseite() { mkdir -p $OUT/stand/$1; mv $2/anazhRealmState.json $2/anazhRealmState.json.bak $2/anazhRealmPerf.json $OUT/stand/$1/ 2>/dev/null; return 0; }
cpuz() { node -e "const j=JSON.parse(require('fs').readFileSync(process.argv[1],'utf8').replace(/^[^{]*/,''));console.log(JSON.stringify(j.cpuTaktMs))" $(cygpath -m $1) 2>&1 | cut -c1-120; }
. $BASE/p3/gpu-schloss.sh
trap 'stopp; schloss_loesen omen-1710-n' EXIT
schloss_nehmen omen-1710-n
stopp; beiseite $N-vor $WT
(cd $WT && PORT=4312 node save-server.js > $D/save.log 2>&1 &)
for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
FP=$(node $K14/fingerabdruck.cjs $WT 2>>$LOG) || { say "$N SEITEN-WACHE ROT"; exit 3; }
say "$N SCHALTER start FP=$FP gpu[$(gpu)]"
(cd $INS && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 --ort genesis > $D/werkbank.log 2>&1 &)
ok=0; for t in $(seq 1 120); do grep -qE "WERKBANK bereit" $D/werkbank.log 2>/dev/null && { ok=1; break; }; grep -qE "FEHLER" $D/werkbank.log 2>/dev/null && break; sleep 5; done
[ $ok = 1 ] || { say "$N Werkbank nicht bereit"; exit 4; }
$W eval "window.__anazhAutoSettlement = false; return 1" > $D/dorf.json 2>&1
$W fenster 1920 1080 > $D/fenster.json 2>&1
$W umstellen --ort genesis --sicht third > $D/umstellen.json 2>&1
$W lauf 30 --ein 20 --ruhe 300 --regler voll --tiere frei > $D/lauf-0-AN.json 2>&1
say "$N ruhe-lauf AN $(cpuz $D/lauf-0-AN.json)"
$W eval "$(cat $OUT/tiere-zensus.js)" > $D/zensus-0.json 2>&1
i=0
for S in AUS AN AN AUS AUS AN AN AUS AUS AN AN AUS; do
  i=$((i+1))
  if [ $S = AUS ]; then $W eval "$(cat $OUT/vb-aus.js)" > $D/schalter-$i-$S.json 2>&1; else $W eval "$(cat $OUT/vb-an.js)" > $D/schalter-$i-$S.json 2>&1; fi
  $W lauf 20 --ein 5 --regler voll --tiere frei > $D/lauf-$i-$S.json 2>&1
  $W eval "$(cat $OUT/tiere-zensus.js)" > $D/zensus-$i-$S.json 2>&1
  say "$N $i $S $(tr -d '\n ' < $D/schalter-$i-$S.json | cut -c1-80) cpu $(cpuz $D/lauf-$i-$S.json)"
done
j=0
for S in AN AUS AN AUS; do
  j=$((j+1))
  if [ $S = AUS ]; then $W eval "$(cat $OUT/vb-aus.js)" > /dev/null 2>&1; else $W eval "$(cat $OUT/vb-an.js)" > /dev/null 2>&1; fi
  $W profil 20 --regler voll --top 60 --tiere frei > $D/profil-$j-$S.json 2>&1
  say "$N profil $j $S exit=$?"
done
k=0
for S in AUS AN AUS AN; do
  k=$((k+1))
  if [ $S = AUS ]; then $W eval "$(cat $OUT/vb-aus.js)" > /dev/null 2>&1; else $W eval "$(cat $OUT/vb-an.js)" > /dev/null 2>&1; fi
  $W eval "window.__tachoSek = 20; return 1" > /dev/null 2>&1
  $W eval "$(cat $OUT/tacho.js)" > $D/tacho-$k-$S.json 2>&1
  say "$N tacho $k $S $(tr -d '\n ' < $D/tacho-$k-$S.json | cut -c1-220)"
done
$W eval "$(cat $OUT/vb-an.js)" > /dev/null 2>&1
$W stop > /dev/null 2>&1
FP2=$(node $K14/fingerabdruck.cjs $WT 2>>$LOG) || FP2=ROT
[ "$FP2" = "$FP" ] || say "$N SEITEN-WACHE NACHHER ROT ($FP2)"
say "$N SCHALTER ende gpu[$(gpu)]"
stopp; beiseite $N-nach $WT; schloss_loesen omen-1710-n
trap - EXIT
say "SCHALTER ENDE"
