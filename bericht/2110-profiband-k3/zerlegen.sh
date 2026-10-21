#!/bin/bash
# 2210 profiband-k3 (2): GPU-Zerlegung an Wiese Ego, Kopf main 2160be58 (n2010-b2a, Code = profiband-k3 bis auf spec). EIN Boot --echt
# 1920×1080, Regler voll, Tiere frei: einschwingen (lauf 30 --ein 20 --ruhe 300), gpu-bank, zerlegen --runden 6, gpu-bank. Schloss omen-2210-z.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN; WT=$BASE/n2010-b2a; OUT=$BASE/p3/n2210/pk3/${TAG:-z1}; mkdir -p $OUT/stand
STOPP=$(cygpath -w $BASE/p3/n2210/pk3/stopp.ps1); export WERKBANK_PORT=4490; W="node $WT/scripts/werkbank.cjs"
ORT=${ORT:-wiese}; SICHT=${SICHT:-ego}
say() { echo "$(date +%T) $*" | tee -a $OUT/fortschritt.log; }
stopp() { powershell -NoProfile -ExecutionPolicy Bypass -File "$STOPP" >> $OUT/stopp.log 2>&1; sleep 3; }
gpu() { nvidia-smi --query-gpu=temperature.gpu,clocks.gr,clocks.mem,pstate,clocks_throttle_reasons.active --format=csv,noheader 2>/dev/null | tr -d '\n'; }
. $BASE/p3/gpu-schloss.sh
schloss_nehmen omen-2210-z; stopp
mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $OUT/stand/ 2>/dev/null
(cd $WT && PORT=4312 node "$(cygpath -w $WT)\save-server.js" > $OUT/save.log 2>&1 &)
for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
(cd $WT && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 --ort $ORT > $OUT/werkbank.log 2>&1 &)
for t in $(seq 1 120); do grep -qE "bereit|FEHLER" $OUT/werkbank.log 2>/dev/null && break; sleep 5; done
say "start $ORT $SICHT $(git -C $WT log -1 --format=%h)[$(git -C $WT status --porcelain | wc -l)] gpu[$(gpu)]"
[ $ORT = dorf ] || $W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null 2>&1
$W fenster 1920 1080 > /dev/null 2>&1
$W umstellen --ort $ORT --sicht $SICHT > $OUT/umstellen.txt 2>&1
$W lauf 30 --ein 20 --ruhe 300 --regler voll --tiere frei > $OUT/lauf.txt 2>&1
$W gpu-bank 12 --runden 5 > $OUT/bank-0.txt 2>&1
for S in ${SCHRITTE:-zerlegen}; do case $S in
  zerlegen) $W zerlegen --runden 6 --json $(cygpath -m $OUT/zerlegen.json) > $OUT/zerlegen.txt 2>&1; say "zerlegen EXIT=$?";;
  puffer) $W puffer --top 40 > $OUT/puffer.txt 2>&1; say "puffer EXIT=$?";;
esac; done
$W gpu-bank 12 --runden 5 > $OUT/bank-1.txt 2>&1
$W stop > /dev/null 2>&1; stopp
mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $OUT/stand/ 2>/dev/null
schloss_loesen omen-2210-z; say "ende gpu[$(gpu)] bank $(grep -h gpuJeFrameMs $OUT/bank-0.txt $OUT/bank-1.txt | tr -d ' \n')"
