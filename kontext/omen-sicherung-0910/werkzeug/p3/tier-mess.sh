#!/bin/bash
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
INSTR=$BASE/welle-m-nexus
OUT=$BASE/p3/seg; mkdir -p $OUT
export WERKBANK_PORT=7902
W="node $INSTR/scripts/werkbank.cjs"
say() { echo "$(date +%T) $*" | tee -a $OUT/fortschritt.log; }
(cd $INSTR && PORT=7901 node save-server.js > $OUT/T-save.log 2>&1 &)
for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:7901/ 2>/dev/null | grep -q 200 && break; sleep 1; done
say "T Seite $(curl -s http://localhost:7901/anazhRealm.js | sha256sum | cut -c1-16)"
(cd $INSTR && node scripts/werkbank.cjs start --echt --port 7902 --seite http://localhost:7901 > $OUT/T-werkbank.log 2>&1 &)
for t in $(seq 1 120); do grep -q "WERKBANK bereit" $OUT/T-werkbank.log 2>/dev/null && break; sleep 5; done
$W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null
$W fenster 1920 1080 > /dev/null
$W umstellen --ort wiese > $OUT/T-umstellen.txt 2>&1
$W eval "return window.__buehne()" > /dev/null
$W eval "window.__tierCmd = 'an'; $(cat $BASE/p3/tier-zaehler.js)" > /dev/null
$W lauf 20 --ein 5 --regler voll --tiere frei > $OUT/T-lauf.txt 2>&1
$W eval "window.__tierCmd = 'aus'; $(cat $BASE/p3/tier-zaehler.js)" > $OUT/T-zaehler.json 2>&1
$W takt 600 --extra _kreaturHuellenKontakt,updateCreatures > $OUT/T-takt.txt 2>&1
$W stop > /dev/null 2>&1
sleep 3
powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server' | ? { \$_.ProcessId -in (Get-NetTCPConnection -State Listen -LocalPort 7901 -ErrorAction SilentlyContinue | % OwningProcess) } | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
say "T ENDE"
cat $OUT/T-zaehler.json
