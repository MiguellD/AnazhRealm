#!/bin/bash
# 0910-7 Teil A.1: der Täter-Zweig des CPU-Takts unter Regler frei. Je Stand der ersten Eltern-Linie 7dd944e6..66005ca6 zwei
# frische Sitzungen (zwei Durchgänge über die ganze Liste): dorf-aus · fenster · wiese · bühne · lauf frei (wie die Serie) ·
# profil 12 --regler frei. Instrument EINS: abab-b538 (66005ca6 + Kompat-Zeile `_streuWartet`), Seite :4312 aus takt-bisekt.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
INSTR=$BASE/abab-b538
WT=$BASE/takt-bisekt
OUT=$BASE/p3/tf/bisekt; mkdir -p $OUT
LOG=$OUT/fortschritt.log
export WERKBANK_PORT=4490
W="node $INSTR/scripts/werkbank.cjs"
STAENDE="7dd944e6 d3ebfc79 e65e9208 90307589 e18c1951 c503eaad e3836ce3 70b957f3 76c036b0 66005ca6"
say() { echo "$(date +%T) $*" | tee -a $LOG; }
stopp() {
  $W stop > /dev/null 2>&1; sleep 2
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  sleep 3
}
say "BISEKTION START  Instrument=$(git -C $INSTR log -1 --format=%h)+kompat"
for D in 1 2; do
  for C in $STAENDE; do
    N=$C-$D
    stopp
    git -C $WT -c core.autocrlf=false checkout -q --detach $C || { say "$N checkout ROT"; continue; }
    HASH=$(sha256sum $WT/anazhRealm.js | cut -c1-16)
    (cd $WT && PORT=4312 node save-server.js > $OUT/$N-save.log 2>&1 &)
    for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
    IST=$(curl -s http://localhost:4312/anazhRealm.js | sha256sum | cut -c1-16)
    [ "$IST" != "$HASH" ] && { say "$N SEITEN-WACHE ROT ($IST statt $HASH)"; continue; }
    (cd $INSTR && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 > $OUT/$N-werkbank.log 2>&1 &)
    for t in $(seq 1 120); do grep -q "WERKBANK bereit" $OUT/$N-werkbank.log 2>/dev/null && break; sleep 5; done
    $W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null
    $W fenster 1920 1080 > /dev/null
    $W umstellen --ort wiese > /dev/null
    $W eval "return window.__buehne()" > /dev/null
    $W eval "r.state.yaw = 0; r.state.pitch = 0; return 1" > /dev/null
    $W lauf 30 --ein 20 --ruhe 300 --tiere frei --regler frei > $OUT/$N-lauf.txt 2>&1
    $W profil 12 --regler frei --top 80 > $OUT/$N-profil.txt 2>&1
    say "$N gemessen ($HASH)"
  done
done
stopp
git -C $WT -c core.autocrlf=false checkout -q --detach 66005ca6
say "BISEKTION ENDE"
