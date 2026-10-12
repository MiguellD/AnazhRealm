#!/bin/bash
# 1110-12 Nachtrag: die Ankunft A B A B A B (A = main a0a05614, B = integ-probe bb554abf), je Boot frisches Profil (Erst-Boot)
# und ein Neuladen (Zweit-Boot); die Seiten-Wache prüft den sha256 von anazhRealm.js auf :4312. Startet nach der ABAB-Serie.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
INSTR=$BASE/abab-i543; OUT=$BASE/abab543/ankunft; LOG=$OUT/fortschritt.log
A=$BASE/abab-b542; B=$BASE/abab-b543
mkdir -p $OUT
say() { echo "$(date +%T) $*" | tee -a $LOG; }
stopp() {
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|ankunft\.cjs' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'ankunft-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  sleep 3
}
until grep -q "SERIE ENDE\|SEITEN-WACHE ROT" $BASE/abab543/fortschritt.log 2>/dev/null; do sleep 15; done
sleep 30
shaA=$(sha256sum $A/anazhRealm.js | cut -c1-16); shaB=$(sha256sum $B/anazhRealm.js | cut -c1-16)
say "ANKUNFT START A=a0a05614 ($shaA) B=bb554abf ($shaB)"
for N in kA1 kB1 kA2 kB2 kA3 kB3; do
  case $N in kA*) D=$A; S=$shaA;; *) D=$B; S=$shaB;; esac
  stopp
  (cd $D && PORT=4312 node save-server.js > $OUT/$N-save.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
  ist=$(curl -s http://localhost:4312/anazhRealm.js | sha256sum | cut -c1-16)
  if [ "$ist" != "$S" ]; then say "$N SEITEN-WACHE ROT: $ist, soll $S"; stopp; exit 3; fi
  (cd $INSTR && timeout 900 node $BASE/abab543/ankunft.cjs "$(cd $INSTR && pwd -W)" http://localhost:4312 $OUT/$N.json > $OUT/$N.log 2>&1)
  say "$N exit=$? $(tr '\n' ' ' < $OUT/$N.log | cut -c1-400)"
  sleep 20
done
stopp
say "ANKUNFT ENDE"
