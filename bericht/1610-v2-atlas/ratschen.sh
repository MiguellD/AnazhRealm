#!/bin/bash
# 1610-V2 (2): DIE GTX-RATSCHEN NEU an integ-probe 5fb8eb1c (Seite abab-p5fb, Instrument = Zweig-Baum gtx-ratschen-1610 am selben
# Kopf), Wiese und Genesis je Ego und Third: je Ort × Sicht zwei Serien aus Erst- und Zweit-Boot (`--serie` hält die Platte für den
# Zweit-Boot) = 4 Läufe je Ratsche, dann `werkbank ratsche --neu` (der Re-Mint). Vor jedem Erst-Boot fällt der Spielstand der Seite
# beiseite. Wartet auf die V2-Serie UND die Freigabe mint-frei.txt (nach dem Urteil); kein-mint.txt bricht ab. Unter dem GPU-Schloss.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN; H=$BASE/p3/k1610v2
INSTR=$BASE/gtx-ratschen-1610; WT=$BASE/abab-p5fb; SICHTEN="ego third"; ORTE="wiese genesis"
OUT=$H/mint; LOG=$OUT/fortschritt.log; mkdir -p $OUT
export WERKBANK_PORT=4490
until grep -q "SERIE FERTIG" $H/fortschritt.log 2>/dev/null && [ -f $H/mint-frei.txt ]; do sleep 30; done  # 16.10. 08:20: erst nach dem Urteil über V2 (T2 war an Wiese Ego langsamer), Freigabe = mint-frei.txt
[ -f $H/kein-mint.txt ] && { echo "$(date +%T) kein Mint (kein-mint.txt)" >> $LOG; exit 0; }
say() { echo "$(date +%T) $*" | tee -a $LOG; }
stopp() {
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank|omen-messfolge' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  sleep 3
}
seite() { # $1 Lauf
  (cd $WT && PORT=4312 node save-server.js > $OUT/$1-save.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
  HASH=$(node $BASE/p3/k14/fingerabdruck.cjs $WT 2>>$LOG) || { say "$1 SEITEN-WACHE ROT"; stopp; exit 3; }
}
nachtruhe() { while :; do hm=$((10#$(date +%H%M))); if [ $hm -ge 325 ] && [ $hm -lt 415 ]; then sleep 60; else break; fi; done; }
. $BASE/p3/gpu-schloss.sh; schloss_nehmen "omen-ratschen 1610"; trap 'schloss_loesen "omen-ratschen 1610"' EXIT
say "SERIE START Seite=$(git -C $WT log -1 --format=%h) Instrument=$(git -C $INSTR log -1 --format=%h) Sichten=$SICHTEN Orte=$ORTE"
for SICHT in $SICHTEN; do
for ORT in $ORTE; do
  for S in 1 2; do
    SERIE="k1610-gtx-$ORT-$SICHT-$S"
    rm -rf "$INSTR/artifacts/werkbank/profil-$SERIE"
    for B in erst zweit; do
      N="$ORT-$SICHT-$S-$B"
      [ -f $OUT/$N.json ] && continue
      nachtruhe; stopp
      if [ $B = erst ]; then mkdir -p $OUT/stand-$N; mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $OUT/stand-$N/ 2>/dev/null; fi
      seite $N; h=$HASH
      (cd $INSTR && timeout 1800 node scripts/omen-messfolge.cjs --ort $ORT --sicht $SICHT --serie $SERIE --seite http://localhost:4312 --datei $OUT/$N.json > $OUT/$N.log 2>&1)
      ec=$?
      FP2=$(node $BASE/p3/k14/fingerabdruck.cjs $WT 2>>$LOG) || FP2=ROT
      [ "$FP2" = "$h" ] || say "$N SEITEN-WACHE NACHHER ROT: $FP2 statt $h"
      say "$N fp=$h exit=$ec $(grep -aE 'laufVoll|band ' $OUT/$N.log | tr -s ' ' | tail -2 | tr '\n' ' ' | cut -c1-220)"
      sleep 20
    done
  done
done
done
stopp
cd $INSTR
for o in $ORTE; do for s in $SICHTEN; do
  node scripts/werkbank.cjs ratsche --neu $OUT/$o-$s-1-erst.json $OUT/$o-$s-1-zweit.json $OUT/$o-$s-2-erst.json $OUT/$o-$s-2-zweit.json > $OUT/mint-$o-$s.txt 2>&1
  say "mint $o-$s exit=$? $(tail -2 $OUT/mint-$o-$s.txt | tr '\n' ' ' | cut -c1-200)"
done; done
say "MINT FERTIG"
