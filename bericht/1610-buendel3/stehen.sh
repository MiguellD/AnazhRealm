#!/bin/bash
# 1610 Bündel 3 (Auftrag 1610-omen-buendel3): A = main 00b99c59 gegen B = integ d9d1db4e (V18.546.4: A2 Wiesen-Farbe, G4a) — stehend
# Wiese Ego/Third je A1 B1 A2 B2, Genesis Ego A1 B1 (Eichung); EIN Instrument abab-pd9d (B-Kopf); GPU-Schloss je Boot (Vorfahrt für CI); nvidia-smi je Boot mit.
# Seiten-Wache vor und nach jedem Boot, 60 s Pause zwischen den Boots.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
A=$BASE/abab-m00b; B=$BASE/abab-pd9d; IA=$BASE/abab-pd9d; IB=$BASE/abab-pd9d
OUT=$BASE/p3/k1610b3; LOG=$OUT/fortschritt.log; K14=$BASE/p3/k14; mkdir -p $OUT/stand
say() { echo "$(date +%T) $*" | tee -a $LOG; }
stopp() {
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank|omen-messfolge' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  sleep 3
}
seite() { # $1 Lauf, $2 Baum
  mkdir -p $OUT/stand/$1; mv $2/anazhRealmState.json $2/anazhRealmState.json.bak $2/anazhRealmPerf.json $OUT/stand/$1/ 2>/dev/null
  (cd $2 && PORT=4312 node save-server.js > $OUT/$1-save.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
  FP=$(node $K14/fingerabdruck.cjs $2 2>>$LOG) || { say "$1 SEITEN-WACHE ROT ($2)"; stopp; schloss_loesen "omen-abab buendel3 $1"; exit 3; }
}
gpu() { nvidia-smi --query-gpu=temperature.gpu,clocks.gr,clocks.mem,pstate,clocks_throttle_reasons.active --format=csv,noheader 2>/dev/null | tr -d '\n'; }
. $BASE/p3/gpu-schloss.sh
say "SERIE START A=$(git -C $A log -1 --format=%h) B=$(git -C $B log -1 --format=%h) Instrument=$(git -C $IB log -1 --format=%h) (EIN Instrument für beide Seiten)"
for K in ${KOMBIS:-w-ego w-third g-ego}; do
  case $K in w-*) ORT=wiese;; g-*) ORT=genesis;; d-*) ORT=dorf;; esac
  SICHT=${K#*-}
  L8="A1 B1 A2 B2"; [ $K = g-ego ] && L8="A1 B1"; for N in ${LAEUFE:-$L8}; do
    [ -f $OUT/$K-$N.json ] && { say "$K-$N steht schon — übersprungen"; continue; }
    while :; do hm=$((10#$(date +%H%M))); if [ $hm -ge 325 ] && [ $hm -lt 415 ]; then sleep 60; else break; fi; done  # Nachtruhe
    case $N in A*) WT=$A; INS=$IA;; B*) WT=$B; INS=$IB;; esac
    NAME=$K-$N
    schloss_nehmen "omen-abab buendel3 $NAME"
    for versuch in 1 2; do
      stopp; seite $NAME $WT
      say "$NAME start gpu[$(gpu)]"
      BASIS=""
      if [ ${N:0:1} = B ] && [ -f $OUT/$K-A${N:1}.json ]; then BASIS="--basis $OUT/$K-A${N:1}.json"; fi
      nvidia-smi --query-gpu=timestamp,clocks.gr,clocks.mem,temperature.gpu,power.draw,pstate,clocks_throttle_reasons.active,memory.used --format=csv,noheader -l 1 > $OUT/$NAME-smi.csv 2>/dev/null & SMI=$!
      (cd $INS && timeout 1500 node scripts/omen-messfolge.cjs --ort $ORT --sicht $SICHT --seite http://localhost:4312 --datei $OUT/$NAME.json $BASIS > $OUT/$NAME.log 2>&1); ec=$?
      kill $SMI 2>/dev/null
      FP2=$(node $K14/fingerabdruck.cjs $WT 2>>$LOG) || FP2=ROT
      [ "$FP2" = "$FP" ] || say "$NAME SEITEN-WACHE NACHHER ROT"
      say "$NAME exit=$ec gpu[$(gpu)] $(grep -aE 'laufVoll|band ' $OUT/$NAME.log | tr -s ' ' | tail -2 | tr '\n' ' ' | cut -c1-220)"
      ROTREST=$(grep -a "^  ROT " $OUT/$NAME.log | grep -v "BAND-LINSE" | head -3)
      { grep -aq "MESS-FOLGE ROT" $OUT/$NAME.log && [ -f $OUT/$NAME.json ]; } || ROTREST="ohne Befund-Zeile (Absturz/Frist)"
      [ $ec -ne 0 ] && [ -z "$ROTREST" ] && say "$NAME rot NUR am Band-Urteil (BAND-LINSE ratsche/weit) — Befund, Messung gilt, kein Neulauf"
      if [ $ec -eq 0 ] || [ -z "$ROTREST" ] || [ $versuch -eq 2 ]; then break; fi
      mv $OUT/$NAME.json $OUT/$NAME-verworfen-$versuch.json 2>/dev/null; mv $OUT/$NAME.log $OUT/$NAME-verworfen-$versuch.log 2>/dev/null
      say "$NAME rot — einmal neu"
      sleep 30
    done
    stopp; schloss_loesen "omen-abab buendel3 $NAME"
    sleep 60
  done
done
stopp
say "SERIE ENDE"
