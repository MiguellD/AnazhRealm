#!/bin/bash
# 1310-3: EINE Werkbank-Sitzung an der Genesis (Welt + Instrument = welle-m-e-genesis), bleibt offen für die Toggles.
B=/c/Users/micha/Desktop/AnazhRealm-OMEN; WT=${WT:-$B/welle-m-e-genesis}; H=$B/p3/gen
export WERKBANK_PORT=4490
powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match '[s]ave-server|[w]erkbank' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match '[w]erkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
sleep 2
(cd $WT && PORT=4312 node save-server.js > $H/save.log 2>&1 &)
for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
(cd $WT && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 > $H/werkbank.log 2>&1 &)
for t in $(seq 1 120); do grep -q "WERKBANK bereit" $H/werkbank.log 2>/dev/null && break; sleep 5; done
grep -m1 "WERKBANK bereit" $H/werkbank.log
