#!/bin/bash
# 1910 F1 Schritt 3: EIN Blick in Fahrt am Steilhang bergab, Third → Ego → Third (blick.js), an B und als Gegenbild an A.
# Je Sitzung: GPU-Schloss omen-1710-n, save-server 4312 aus dem Baum der Seite (absoluter Pfad, Seiten-Wache vor und nach),
# Werkbank --echt aus dem Instrument A (n1910-f1a), dorf-aus · fenster 1920×1080 · umstellen --ort wiese --sicht third ·
# lauf 10 --ein 20 --ruhe 300 (die Welt ruht) · blick.js · die Bilder als JPEG (jpg.cjs). LAEUFE (Vorgabe B1 A1).
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
INS=$BASE/n1910-f1a
F=$BASE/p3/n1910/f1; OUT=$F/blick; LOG=$OUT/fortschritt.log; K14=$BASE/p3/k14; mkdir -p $OUT $F/stand
STOPP=$(cygpath -w $F/stopp.ps1)
export WERKBANK_PORT=4490; W="node $INS/scripts/werkbank.cjs"
say() { echo "$(date +%T) $*" | tee -a $LOG; }
stopp() { powershell -NoProfile -ExecutionPolicy Bypass -File "$STOPP" >> $F/stopp.log 2>&1; sleep 3; }
beiseite() { mkdir -p $F/stand/$1; mv $2/anazhRealmState.json $2/anazhRealmState.json.bak $2/anazhRealmPerf.json $F/stand/$1/ 2>/dev/null; return 0; }
. $BASE/p3/gpu-schloss.sh
for N in ${LAEUFE:-B1 A1}; do
  case $N in A*) WT=$BASE/n1910-f1a;; B*) WT=$BASE/n1910-f1b;; esac
  D=$OUT/$N; mkdir -p $D; DW=$(cd $D && pwd -W)
  schloss_nehmen omen-1710-n; stopp; beiseite blick-$N $WT
  (cd $WT && PORT=4312 node "$(cygpath -w $WT)\\save-server.js" > $D/save.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
  FP=$(node $K14/fingerabdruck.cjs $WT 2>>$LOG) || { say "$N SEITEN-WACHE ROT"; stopp; schloss_loesen omen-1710-n; exit 3; }
  (cd $INS && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 --ort wiese > $D/werkbank.log 2>&1 &)
  for t in $(seq 1 120); do grep -qE "bereit|FEHLER" $D/werkbank.log 2>/dev/null && break; sleep 5; done
  say "$N bereit $(git -C $WT log --oneline -1 | cut -c1-8) FP=$FP gpu[$(nvidia-smi --query-gpu=clocks.gr,temperature.gpu --format=csv,noheader)]"
  $W eval "window.__gf = []; r.state.renderer.backend.device.addEventListener('uncapturederror', (e) => window.__gf.push(String((e.error && e.error.message) || e).slice(0, 200))); return 1" > /dev/null 2>&1
  $W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null 2>&1
  $W fenster 1920 1080 > $D/fenster.txt 2>&1
  $W umstellen --ort wiese --sicht third > $D/umstellen.txt 2>&1
  $W lauf 10 --ein 20 --ruhe 300 --regler voll --tiere frei > $D/lauf-0.txt 2>&1
  $W eval "$(cat $F/blick.js)" > $D/antwort.txt 2>&1
  node $F/jpg.cjs "$DW/antwort.txt" "$DW" > $D/blick.txt 2>&1
  say "$N blick $(tr '\n' ' ' < $D/blick.txt | cut -c1-900)"
  $W stop > /dev/null 2>&1
  FP2=$(node $K14/fingerabdruck.cjs $WT 2>>$LOG) || FP2=ROT
  [ "$FP2" = "$FP" ] || say "$N SEITEN-WACHE NACHHER ROT"
  stopp; beiseite blick-$N-nach $WT; schloss_loesen omen-1710-n
  sleep 20
done
say "BLICK ENDE"
