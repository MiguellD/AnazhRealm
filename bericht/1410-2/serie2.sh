#!/bin/bash
# 1410-2 (Neustart 10:2x, serie2): ABAB integ-probe 08b57ed8 (B) gegen main 9fb869a5 (A) — Wiese und Genesis, Ego und Third, je 2 Boots je Seite.
# EIN Instrument (omen-messfolge aus 08b57ed8), in zwei Kopien: A misst mit dem Genesis-Anker 36/0 (main), B mit dem lokal
# gepatchten 0/0 (seit K16). Die Seiten-Wache (p3/k14/fingerabdruck.cjs) vor und nach jedem Boot, der Spielstand fällt vor
# jedem Boot beiseite, Takt/Temperatur/P-Zustand je Boot, 60 s Pause zwischen den Boots, ein roter Boot läuft einmal neu.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
A=$BASE/abab-z545; B=$BASE/abab-p546; IA=$BASE/abab-i546a; IB=$BASE/abab-i546b
OUT=$BASE/p3/k1410b; LOG=$OUT/fortschritt.log; K14=$BASE/p3/k14; mkdir -p $OUT/stand
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
  FP=$(node $K14/fingerabdruck.cjs $2 2>>$LOG) || { say "$1 SEITEN-WACHE ROT ($2)"; stopp; exit 3; }
}
gpu() { nvidia-smi --query-gpu=temperature.gpu,clocks.gr,clocks.mem,pstate,clocks_throttle_reasons.active --format=csv,noheader 2>/dev/null | tr -d '\n'; }
say "SERIE START A=$(git -C $A log -1 --format=%h) B=$(git -C $B log -1 --format=%h) Instrument=$(git -C $IB log -1 --format=%h) (B: Genesis-Anker 0/0 lokal)"
for K in ${KOMBIS:-w-ego w-third g-ego g-third}; do
  case $K in w-*) ORT=wiese;; g-*) ORT=genesis;; esac
  SICHT=${K#*-}
  for N in ${LAEUFE:-A1 B1 A2 B2}; do
    [ -f $OUT/$K-$N.json ] && { say "$K-$N steht schon — übersprungen"; continue; }
    case $N in A*) WT=$A; INS=$IA;; B*) WT=$B; INS=$IB;; esac
    NAME=$K-$N
    for versuch in 1 2; do
      stopp; seite $NAME $WT
      say "$NAME start gpu[$(gpu)]"
      BASIS=""
      if [ ${N:0:1} = B ] && [ -f $OUT/$K-A${N:1}.json ]; then BASIS="--basis $OUT/$K-A${N:1}.json"; fi
      (cd $INS && timeout 1500 node scripts/omen-messfolge.cjs --ort $ORT --sicht $SICHT --seite http://localhost:4312 --datei $OUT/$NAME.json $BASIS > $OUT/$NAME.log 2>&1); ec=$?
      FP2=$(node $K14/fingerabdruck.cjs $WT 2>>$LOG) || FP2=ROT
      [ "$FP2" = "$FP" ] || say "$NAME SEITEN-WACHE NACHHER ROT"
      say "$NAME exit=$ec gpu[$(gpu)] $(grep -aE 'laufVoll|band ' $OUT/$NAME.log | tr -s ' ' | tail -2 | tr '\n' ' ' | cut -c1-220)"
      ROTREST=$(grep -a "^  ROT " $OUT/$NAME.log | grep -v "BAND-LINSE weit" | head -3)
      { grep -aq "MESS-FOLGE ROT" $OUT/$NAME.log && [ -f $OUT/$NAME.json ]; } || ROTREST="ohne Befund-Zeile (Absturz/Frist)"
      [ $ec -ne 0 ] && [ -z "$ROTREST" ] && say "$NAME rot NUR an der Ratsche (BAND-LINSE weit) — Messung gilt, kein Neulauf"
      if [ $ec -eq 0 ] || [ -z "$ROTREST" ] || [ $versuch -eq 2 ]; then break; fi
      mv $OUT/$NAME.json $OUT/$NAME-verworfen-$versuch.json 2>/dev/null; mv $OUT/$NAME.log $OUT/$NAME-verworfen-$versuch.log 2>/dev/null
      say "$NAME rot — einmal neu"
      sleep 30
    done
    sleep 60
  done
done
stopp
say "SERIE ENDE"
