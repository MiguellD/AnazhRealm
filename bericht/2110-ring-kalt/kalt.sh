#!/bin/bash
# 2010 Ring-Heilung KALT (bbc97d8b gegen 57a9f2ab) (Vorlage p3/n1910/bwald/serie.sh): `diag-boot-stage --kalt --echt` je Seite aus ihrem eigenen Baum
# (A = n2010-b2a bbc97d8b, B = n2010-b2b 57a9f2ab; diag-boot-stage A↔B byte-gleich, beide mit demselben Stations-Patch kalt-patch.cjs:
# Term-Namen + Brunnen je Probe; scripts/lib/welt-boot.cjs B nur um Linsen-Helfer reicher). Je Lauf ein frisches Profil-Verzeichnis
# (der erste Lauf darin ist kalt), danach gelöscht. GPU-Schloss omen-2010 NUR um jeden Lauf, nvidia-smi 1 s, 30 s Pause.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
OUT=$BASE/p3/n2110/ringkalt; ROH=$OUT/kalt; PROF=$OUT/prof; LOG=$OUT/fortschritt.log; mkdir -p $ROH $PROF
STOPP=$(cygpath -w $OUT/stopp.ps1)
say() { echo "$(date +%T) $*" | tee -a $LOG; }
stopp() { powershell -NoProfile -ExecutionPolicy Bypass -File "$STOPP" >> $OUT/stopp.log 2>&1; sleep 3; }
gpu() { nvidia-smi --query-gpu=temperature.gpu,clocks.gr,clocks.mem,pstate,clocks_throttle_reasons.active --format=csv,noheader 2>/dev/null | tr -d '\n'; }
. $BASE/p3/gpu-schloss.sh
say "KALT START A=$(git -C $BASE/n2010-b2a log -1 --format=%h) B=$(git -C $BASE/n2010-b2b log -1 --format=%h) sha=$(sha256sum $BASE/n2010-b2a/scripts/diag-boot-stage.cjs | cut -c1-12)/$(sha256sum $BASE/n2010-b2b/scripts/diag-boot-stage.cjs | cut -c1-12)"
for N in ${KALT:-A1 B1 A2 B2 A3 B3 A4 B4}; do
  [ -s $ROH/$N.json ] && { say "kalt-$N steht schon"; continue; }
  case $N in A*) WT=$BASE/n2010-b2a ;; B*) WT=$BASE/n2010-b2b ;; esac
  P=$PROF/$N; rm -rf $P
  schloss_nehmen omen-2010; stopp
  say "kalt-$N start $(git -C $WT log -1 --format=%h) gpu[$(gpu)]"
  nvidia-smi --query-gpu=timestamp,clocks.gr,clocks.mem,temperature.gpu,power.draw,pstate,clocks_throttle_reasons.active,memory.used --format=csv,noheader -l 1 > $ROH/$N-smi.csv 2>/dev/null & SMI=$!
  (cd $WT && BOOT_STAGE_PORT=7903 timeout 600 node scripts/diag-boot-stage.cjs --kalt --echt --profil $(cygpath -m $P) --json $(cygpath -m $ROH/$N.json) --bild $(cygpath -m $ROH/$N.png) > $ROH/$N.log 2>&1); ec=$?
  kill $SMI 2>/dev/null
  stopp; schloss_loesen omen-2010; rm -rf $P
  say "kalt-$N ende exit=$ec gpu[$(gpu)] $(grep -aE 't\(Weltbild\)' $ROH/$N.log | tail -1 | tr -s ' ' | cut -c1-200)"
  sleep 30
done
say "KALT ENDE"
