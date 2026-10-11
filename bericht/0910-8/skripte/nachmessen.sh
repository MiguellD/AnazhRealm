#!/bin/bash
# 0910-8 Nachmessung in EINER Sitzung (Kopf, echte GPU, Mess-Wiese nach lauf 30): Fußabdruck 44/88/132 m, die Deckung des
# Fern-Gesetzes über ±3 km, der nahe Boden ohne Krone gegen den Boden des Gesetzes.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
INSTR=$BASE/welle-m-weisse-masse
OUT=$BASE/p3/wm2/nach
export WERKBANK_PORT=7904
W="node $INSTR/scripts/werkbank.cjs"
stopp() { $W stop > /dev/null 2>&1; sleep 2; powershell -NoProfile -c "Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | ? { \$_.LocalPort -ge 7900 -and \$_.LocalPort -le 7909 } | % { Stop-Process -Id \$_.OwningProcess -Force -ErrorAction SilentlyContinue }" >/dev/null 2>&1; powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil-790' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1; sleep 3; }
stopp
(cd $INSTR && PORT=7903 node save-server.js > $OUT/save.log 2>&1 &)
for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:7903/ 2>/dev/null | grep -q 200 && break; sleep 1; done
(cd $INSTR && node scripts/werkbank.cjs start --echt --port 7904 --seite http://localhost:7903 > $OUT/werkbank.log 2>&1 &)
for t in $(seq 1 120); do grep -q "WERKBANK bereit" $OUT/werkbank.log 2>/dev/null && break; sleep 5; done
$W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null
$W fenster 1920 1080 > /dev/null
$W umstellen --ort wiese > /dev/null
$W eval "return window.__buehne()" > /dev/null
$W lauf 30 --ein 20 --regler frei --tiere halten > $OUT/lauf.txt 2>&1
for HB in 22 44 66; do $W eval "return await window.__nahFernSicht({ halb: $HB });" > $OUT/fuss-$HB.json 2>&1; done
$W eval "$(cat $OUT/deckung.js)" > $OUT/deckung.json 2>&1
$W eval "$(cat $OUT/boden.js)" > $OUT/boden.json 2>&1
stopp
echo NACH-ENDE
