#!/bin/bash
# 1310-18: Erst-Bau A gegen B — je Lauf ein frisches Profil: kalt, dann zweit im selben Profil (bau-probe.cjs, echte GPU).
# Vor jedem Boot fällt der Spielstand der Seite beiseite; die Seiten-Wache (p3/k14/fingerabdruck.cjs) vor und nach jedem Boot.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
A=${A:-$BASE/abab-z545}; B=${B:-$BASE/abab-s18}; INSTR=${INSTR:-$BASE/abab-i543}
OUT=$BASE/p3/k18/bau; mkdir -p $OUT/stand; LOG=$OUT/fortschritt.log; K14=$BASE/p3/k14
say() { echo "$(date +%T) $*" | tee -a $LOG; }
stopp() {
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank|bau-probe' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  sleep 3
}
seite() { # $1 Lauf, $2 Baum
  mkdir -p $OUT/stand/$1; mv $2/anazhRealmState.json $2/anazhRealmState.json.bak $2/anazhRealmPerf.json $OUT/stand/$1/ 2>/dev/null
  (cd $2 && PORT=4312 node save-server.js > $OUT/$1-save.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
  FP=$(node $K14/fingerabdruck.cjs $2 2>>$LOG) || { say "$1 SEITEN-WACHE ROT ($2)"; stopp; exit 3; }
}
say "SERIE START A=$(git -C $A log -1 --format=%h) B=$(git -C $B log -1 --format=%h)"
for N in ${LAEUFE:-A1 B1 A2 B2}; do
  case $N in A*) WT=$A;; B*) WT=$B;; esac
  rm -rf $OUT/profil-$N
  for P in kalt zweit; do
    stopp; seite $N-$P $WT
    timeout 300 node $BASE/p3/k18/bau-probe.cjs $INSTR $OUT/$N-$P.json $OUT/profil-$N > $OUT/$N-$P.log 2>&1; ec=$?
    FP2=$(node $K14/fingerabdruck.cjs $WT 2>>$LOG) || FP2=ROT
    [ "$FP2" = "$FP" ] || say "$N-$P SEITEN-WACHE NACHHER ROT"
    say "$N-$P exit=$ec $(tr '\n' ' ' < $OUT/$N-$P.log | cut -c1-330)"
    sleep 10
  done
done
stopp
say "SERIE ENDE"
