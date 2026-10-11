#!/bin/bash
# 1110-2: eine Werkbank-Sitzung (echte GPU) auf dem Arbeitsbaum $1 (Standard welle-m-nah-fern), Ports 7903/7904.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
WT=${1:-$BASE/welle-m-nah-fern}
INSTR=$BASE/welle-m-nah-fern
OUT=$BASE/p3/nf; mkdir -p $OUT
export WERKBANK_PORT=7904
W="node $INSTR/scripts/werkbank.cjs"
$W stop > /dev/null 2>&1; sleep 2
powershell -NoProfile -c "Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | ? { \$_.LocalPort -ge 7900 -and \$_.LocalPort -le 7909 } | % { Stop-Process -Id \$_.OwningProcess -Force -ErrorAction SilentlyContinue }" >/dev/null 2>&1
powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil-790' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1; sleep 3
(cd $WT && PORT=7903 node save-server.js > $OUT/save.log 2>&1 &)
for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:7903/ 2>/dev/null | grep -q 200 && break; sleep 1; done
(cd $INSTR && node scripts/werkbank.cjs start --echt --port 7904 --seite http://localhost:7903 > $OUT/werkbank.log 2>&1 &)
for t in $(seq 1 120); do grep -q "WERKBANK bereit" $OUT/werkbank.log 2>/dev/null && break; sleep 5; done
$W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null
$W fenster 1920 1080 > /dev/null
$W umstellen --ort buehne --pose ost > $OUT/umstellen.txt 2>&1
$W eval "return window.__buehne()" > /dev/null
echo START-ENDE
