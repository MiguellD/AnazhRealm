#!/bin/bash
# 1310-15: das Band in Third-Person an der Genesis, vorher (main) gegen nachher (der Leib-Schnitt) — die K26-Messfolge
# (band-leser-gtx) mit --sicht third, A B A B, Seiten-Wache als Fingerabdruck vor und nach jedem Lauf.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN; INSTR=$BASE/band-leser-gtx; A=$BASE/abab-z545; B=$BASE/welle-m-e-leib
OUT=$BASE/p3/k15/band; LOG=$OUT/fortschritt.log; mkdir -p $OUT
export WERKBANK_PORT=4490
say() { echo "$(date +%T) $*" | tee -a $LOG; }
stopp() {
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank|omen-messfolge' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  sleep 3
}
say "START A=$(git -C $A log -1 --format=%h) B=$(git -C $B log -1 --format=%h)+Arbeitsbaum Instrument=$(git -C $INSTR log -1 --format=%h)"
for N in gA1 gB1 gA2 gB2; do
  case $N in ?A*) WT=$A;; ?B*) WT=$B;; esac
  stopp
  mkdir -p $OUT/stand-$N; mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $OUT/stand-$N/ 2>/dev/null
  (cd $WT && PORT=4312 node save-server.js > $OUT/$N-save.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
  FP=$(node $BASE/p3/k14/fingerabdruck.cjs $WT 2>>$LOG) || { say "$N WACHE ROT"; stopp; exit 3; }
  (cd $INSTR && timeout 1800 node scripts/omen-messfolge.cjs --ort genesis --sicht third --seite http://localhost:4312 --datei $OUT/$N.json > $OUT/$N.log 2>&1); ec=$?
  FP2=$(node $BASE/p3/k14/fingerabdruck.cjs $WT 2>>$LOG) || FP2=ROT
  [ "$FP2" = "$FP" ] || say "$N WACHE NACHHER ROT"
  say "$N fp=$FP exit=$ec $(grep -aE 'laufVoll' $OUT/$N.log | tr -s ' ' | tail -1 | cut -c1-160)"
  sleep 15
done
stopp
say "ENDE"
