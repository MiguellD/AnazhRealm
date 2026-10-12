#!/bin/bash
# 1110-10: die Wiese zerlegt (GPU je Klasse/Pass, ABBA je Schalter) — A main 2c8deda9 und B a0a05614, je ein frischer Boot
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
INSTR=$BASE/abab-i542; V=$BASE/p3/bk542; OUT=$V/zerlegen; mkdir -p $OUT; LOG=$OUT/fortschritt.log
export WERKBANK_PORT=4490
W="node $INSTR/scripts/werkbank.cjs"
say() { echo "$(date +%T) $*" | tee -a $LOG; }
stopp() { $W stop > /dev/null 2>&1; sleep 2; powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match '[s]ave-server|[w]erkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1; powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match '[w]erkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1; sleep 3; }
for X in A B; do
  [ $X = A ] && WT=$BASE/abab-b541 || WT=$BASE/abab-b542
  stopp
  (cd $WT && PORT=4312 node save-server.js > $OUT/$X-save.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
  say "$X Seite $(curl -s http://localhost:4312/anazhRealm.js | sha256sum | cut -c1-16)"
  (cd $INSTR && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 > $OUT/$X-werkbank.log 2>&1 &)
  for t in $(seq 1 120); do grep -q "WERKBANK bereit" $OUT/$X-werkbank.log 2>/dev/null && break; sleep 5; done
  $W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null
  $W fenster 1920 1080 > /dev/null
  $W umstellen --ort wiese > $OUT/$X-umstellen.txt 2>&1
  $W eval "return window.__buehne()" > /dev/null
  $W eval "r.state.yaw = 0; r.state.pitch = 0; return 1" > /dev/null
  $W lauf 10 --ein 30 --ruhe 300 --tiere frei > $OUT/$X-lauf.txt 2>&1
  $W zerlegen --runden 6 --json "$(cd $OUT && pwd -W)/zerlegen-$X.json" > $OUT/$X-zerlegen.txt 2>&1
  say "$X zerlegen exit=$? $(grep -a -m3 -E 'Σ|Summe|Rest' $OUT/$X-zerlegen.txt | tr '\n' ' ' | cut -c1-200)"
done
stopp
say "ZERLEG ENDE"
