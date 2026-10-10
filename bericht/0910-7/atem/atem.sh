#!/bin/bash
# 0910-7: der Atem-Zähler je Stand: dorf-aus · fenster · wiese · bühne · Zähler · lauf voll → lesen · lauf frei → lesen.
# ./atem.sh <name> <worktree der Seite>   (Instrument abab-b538, Seite :7903, Werkbank :7904)
N=$1; WT=$2
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
INSTR=$BASE/abab-b538
OUT=$BASE/p3/tf/atem; mkdir -p $OUT
export WERKBANK_PORT=7904
W="node $INSTR/scripts/werkbank.cjs"
stopp() {
  $W stop > /dev/null 2>&1; sleep 2
  powershell -NoProfile -c "Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | ? { \$_.LocalPort -ge 7900 -and \$_.LocalPort -le 7909 } | % { Stop-Process -Id \$_.OwningProcess -Force -ErrorAction SilentlyContinue }" > /dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil-790' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
  sleep 2
}
stopp
(cd $WT && PORT=7903 node save-server.js > $OUT/$N-save.log 2>&1 &)
for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:7903/ 2>/dev/null | grep -q 200 && break; sleep 1; done
(cd $INSTR && node scripts/werkbank.cjs start --echt --port 7904 --seite http://localhost:7903 > $OUT/$N-werkbank.log 2>&1 &)
for t in $(seq 1 120); do grep -q "WERKBANK bereit" $OUT/$N-werkbank.log 2>/dev/null && break; sleep 5; done
$W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null
$W fenster 1920 1080 > /dev/null
$W umstellen --ort wiese > /dev/null
$W eval "return window.__buehne()" > /dev/null
$W eval "r.state.yaw = 0; r.state.pitch = 0; return 1" > /dev/null
$W eval "$(cat $BASE/p3/tf/atem-zaehler.js)" > /dev/null
for R in voll frei; do
  $W eval "window.__atem.null(); return 1" > /dev/null
  $W lauf 30 --ein 20 --ruhe 300 --tiere frei --regler $R > $OUT/$N-lauf-$R.txt 2>&1
  $W eval "return window.__atem.lies()" > $OUT/$N-atem-$R.json
  echo "$N $R: $(tr -d '\n ' < $OUT/$N-atem-$R.json | cut -c1-700)"
done
stopp
