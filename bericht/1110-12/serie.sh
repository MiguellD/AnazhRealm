#!/bin/bash
# Messauftrag 1110-12: V18.543 (integ-probe bb554abf) gegen main (a0a05614), mit Takt, schlank. EIN Instrument: abab-i543 = B mit der
# Genesis-Folge + Lauf frei + Bank an der Gier des Orts (OMEN 1110-10). Wiese, Genesis, Bühne je ABAB; je Slot ein
# frischer Boot, die Seiten-Wache prüft den sha256 von anazhRealm.js auf :4312.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
INSTR=$BASE/abab-i543
OUT=$BASE/abab543; LOG=$OUT/fortschritt.log
A=$BASE/abab-b542; B=$BASE/abab-b543
export WERKBANK_PORT=4490
say() { echo "$(date +%T) $*" | tee -a $LOG; }
stopp() {
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank|omen-messfolge' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  sleep 3
}
seite() { # $1 Worktree, $2 Soll-Hash, $3 Name
  (cd $1 && PORT=4312 node save-server.js > $OUT/$3-save.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
  local ist; ist=$(curl -s http://localhost:4312/anazhRealm.js | sha256sum | cut -c1-16)
  if [ "$ist" != "$2" ]; then say "$3 SEITEN-WACHE ROT: $ist, soll $2"; stopp; exit 3; fi
}
shaA=$(sha256sum $A/anazhRealm.js | cut -c1-16); shaB=$(sha256sum $B/anazhRealm.js | cut -c1-16)
say "SERIE START A=a0a05614 ($shaA) B=bb554abf ($shaB) Instrument=$(git -C $INSTR log -1 --format=%h)+Genesis-Folge"
lauf() { # $1 Ort, $2 Präfix, $3 Folge der Seiten, $4 Timeout, $5 Pause
  local i=0
  for X in $3; do
    i=$((i+1)); local N=$2$i$X D S
    [ $X = A ] && D=$A && S=$shaA || { D=$B; S=$shaB; }
    stopp; seite $D $S $N
    (cd $INSTR && timeout $4 node scripts/omen-messfolge.cjs --ort $1 --seite http://localhost:4312 --datei $OUT/$N.json > $OUT/$N.log 2>&1)
    local e=$?
    say "$N exit=$e $(node $OUT/kurz.cjs $OUT/$N.json 2>&1 | cut -c1-330)"
    sleep $5
  done
}
lauf wiese w "A B A B" 2700 30
lauf genesis g "A B A B" 2700 30
lauf buehne b "A B A B" 1800 20
stopp
say "SERIE ENDE"
