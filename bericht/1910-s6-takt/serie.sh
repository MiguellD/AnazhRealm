#!/bin/bash
# 1910 S6-Takt (Finder, Karte „S6-Takt"): woher kommt das CPU-Takt-p95-Plus des Rudel-Verbands an Genesis Third?
# A = n1910-s6a (ffa8fac8 + lokaler Revert 253869f0 von 475a446a), B = n1910-s6b (ffa8fac8). EIN Instrument: werkbank.cjs aus B;
# die Seite liefert nur die Welt (save-server 4312 aus ihrem Baum). Je Welt (A1 B1 A2 B2 A3 B3 A4 B4, frische Sitzung):
#   start --echt --ort genesis · dorf-aus · fenster 1920 1080 · umstellen --ort genesis --sicht third
#   lauf 30 --ein 20 --ruhe 300 --regler voll --tiere frei   (sauber, vor jeder Hülle)
#   profil 20 --regler voll --top 60 --tiere frei             (CDP-Profiler 200 µs; --tiere frei: der Halte-Griff bliebe sonst, K59)
#   takt 600 --extra …                                        (Render gestubbt, CPU je Loop-Glied)
#   Zensus · Frame-Zerleger fz.js (30 s, echter Loop, Hüllen) · Zensus
# GPU-Schloss omen-1710-n um jede Sitzung; Seiten-Wache (p3/k14/fingerabdruck.cjs) vor und nach; 60 s Pause; fortsetzbar.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
A=$BASE/n1910-s6a; B=$BASE/n1910-s6b; INS=$B
OUT=$BASE/p3/n1910/s6takt; LOG=$OUT/fortschritt.log; K14=$BASE/p3/k14; mkdir -p $OUT/welt $OUT/stand
STOPP=$(cygpath -w $OUT/stopp.ps1)
export WERKBANK_PORT=4490
W="node $INS/scripts/werkbank.cjs"
say() { echo "$(date +%T) $*" | tee -a $LOG; }
stopp() { powershell -NoProfile -ExecutionPolicy Bypass -File "$STOPP" >> $OUT/stopp.log 2>&1; sleep 3; }
gpu() { nvidia-smi --query-gpu=temperature.gpu,clocks.gr,clocks.mem,pstate,clocks_throttle_reasons.active --format=csv,noheader 2>/dev/null | tr -d '\n'; }
beiseite() { mkdir -p $OUT/stand/$1; mv $2/anazhRealmState.json $2/anazhRealmState.json.bak $2/anazhRealmPerf.json $OUT/stand/$1/ 2>/dev/null; return 0; }
. $BASE/p3/gpu-schloss.sh
trap 'stopp; schloss_loesen omen-1710-n' EXIT
FOLGE=${FOLGE:-A1 B1 A2 B2 A3 B3 A4 B4}
say "SERIE START A=$(git -C $A log -1 --format=%h) B=$(git -C $B log -1 --format=%h) Instrument=$(git -C $INS log -1 --format=%h) FOLGE=$FOLGE"
for N in $FOLGE; do
  D=$OUT/welt/$N
  [ -f $D/zensus-1.json ] && { say "$N steht schon"; continue; }
  mkdir -p $D
  case $N in A*) WT=$A;; B*) WT=$B;; esac
  schloss_nehmen omen-1710-n
  stopp; beiseite $N-vor $WT
  (cd $WT && PORT=4312 node save-server.js > $D/save.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
  FP=$(node $K14/fingerabdruck.cjs $WT 2>>$LOG) || { say "$N SEITEN-WACHE ROT ($WT)"; exit 3; }
  say "$N start FP=$FP gpu[$(gpu)]"
  (cd $INS && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 --ort genesis > $D/werkbank.log 2>&1 &)
  ok=0; for t in $(seq 1 120); do grep -qE "WERKBANK bereit" $D/werkbank.log 2>/dev/null && { ok=1; break; }; grep -qE "FEHLER" $D/werkbank.log 2>/dev/null && break; sleep 5; done
  [ $ok = 1 ] || { say "$N Werkbank nicht bereit: $(tail -3 $D/werkbank.log | tr '\n' ' ')"; exit 4; }
  $W eval "window.__anazhAutoSettlement = false; return 1" > $D/dorf.json 2>&1
  $W fenster 1920 1080 > $D/fenster.json 2>&1
  $W umstellen --ort genesis --sicht third > $D/umstellen.json 2>&1; ec=$?
  [ $ec -eq 0 ] || say "$N umstellen exit=$ec $(tail -2 $D/umstellen.json | tr '\n' ' ' | cut -c1-200)"
  $W lauf 30 --ein 20 --ruhe 300 --regler voll --tiere frei > $D/lauf.json 2>&1; ec=$?
  say "$N lauf exit=$ec $(node -e "const j=JSON.parse(require('fs').readFileSync(process.argv[1],'utf8').replace(/^[^{]*/,''));console.log('cpu',JSON.stringify(j.cpuTaktMs),'frame',j.frameMs&&j.frameMs.p95,'ruhe',JSON.stringify(j.ruhe||null))" $(cygpath -m $D/lauf.json) 2>&1 | cut -c1-300)"
  $W profil 20 --regler voll --top 60 --tiere frei > $D/profil.json 2>&1; ec=$?
  say "$N profil exit=$ec"
  $W takt 600 --extra updateCreatures,_kreaturVerbandZug,_tickKreaturZiegel,_animateCompoundMotion,_tickKreaturRuhe > $D/takt.json 2>&1; ec=$?
  say "$N takt exit=$ec"
  $W eval "$(cat $OUT/tiere-zensus.js)" > $D/zensus-0.json 2>&1
  $W eval "window.__fzSek = 30; return 1" > /dev/null 2>&1
  $W eval "$(cat $OUT/fz.js)" > $D/fz.json 2>&1; ec=$?
  say "$N fz exit=$ec $(node -e "const j=JSON.parse(require('fs').readFileSync(process.argv[1],'utf8').replace(/^[^{]*/,'')).ergebnis;console.log('cpu',JSON.stringify(j.cpu),'raten',JSON.stringify(j.raten),'fehler',j.fehler)" $(cygpath -m $D/fz.json) 2>&1 | cut -c1-400)"
  $W eval "$(cat $OUT/tiere-zensus.js)" > $D/zensus-1.json 2>&1
  $W stop > /dev/null 2>&1
  FP2=$(node $K14/fingerabdruck.cjs $WT 2>>$LOG) || FP2=ROT
  [ "$FP2" = "$FP" ] || say "$N SEITEN-WACHE NACHHER ROT ($FP2)"
  say "$N ende gpu[$(gpu)] zensus[$(tr -d '\n ' < $D/zensus-1.json | grep -oE '"gesamt":[0-9]+|"verbaendeAb2":[0-9]+|"wuerfeAb2":[0-9]+' | tr '\n' ' ')]"
  stopp; beiseite $N-nach $WT; schloss_loesen omen-1710-n
  sleep 60
done
say "SERIE ENDE"
