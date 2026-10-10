#!/bin/bash
# 0910-6: wohin geht der CPU-Takt unter Regler frei? Je Seite (A B A B) eine frische Sitzung wie die Folge: dorf-aus · fenster ·
# wiese · bühne · lauf frei (wie die Serie) · profil 12 --regler frei --top 60. Instrument aus B, Seite :4312, Werkbank :4490.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
INSTR=$BASE/abab-b538
OUT=$BASE/abab538/frei; mkdir -p $OUT
export WERKBANK_PORT=4490
W="node $INSTR/scripts/werkbank.cjs"
stopp() {
  $W stop > /dev/null 2>&1; sleep 2
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  sleep 3
}
i=0
for S in A B A B; do
  i=$((i+1)); N=$i$S
  [ $S = A ] && D=$BASE/abab-b537 || D=$BASE/abab-b538
  stopp
  (cd $D && PORT=4312 node save-server.js > $OUT/$N-save.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
  (cd $INSTR && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 > $OUT/$N-werkbank.log 2>&1 &)
  for t in $(seq 1 120); do grep -q "WERKBANK bereit" $OUT/$N-werkbank.log 2>/dev/null && break; sleep 5; done
  $W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null
  $W fenster 1920 1080 > /dev/null
  $W umstellen --ort wiese > /dev/null
  $W eval "return window.__buehne()" > /dev/null
  $W eval "r.state.yaw = 0; r.state.pitch = 0; return 1" > /dev/null
  $W lauf 30 --ein 20 --ruhe 300 --tiere frei --regler frei > $OUT/$N-lauf.txt 2>&1
  $W profil 12 --regler frei --top 60 > $OUT/$N-profil.txt 2>&1
  echo "$(date +%T) $N gemessen: $(grep -m1 -o '"cpuTaktMs": *{[^}]*}' $OUT/$N-lauf.txt | tr -d ' \n')"
done
stopp
echo "$(date +%T) ENDE"
