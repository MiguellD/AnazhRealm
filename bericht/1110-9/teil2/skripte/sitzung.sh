#!/bin/bash
# 1110-9 Teil 2 Bild-Paare: startet eine Sitzung (save-server 7908 aus <worktree>, Werkbank 7907 --echt, Instrument = welle-m-e-tor)
#   ./sitzung.sh <name> <worktree>
B=/c/Users/micha/Desktop/AnazhRealm-OMEN; H=$B/p3/tor/bild; INS=$B/welle-m-e-tor
N=$1; WT=$2; export WERKBANK_PORT=7907
mkdir -p $H/daten
say() { echo "$(date +%T) $N $*" | tee -a $H/sitzung.log; }
powershell -NoProfile -c "Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | ? { \$_.LocalPort -eq 7907 -or \$_.LocalPort -eq 7908 } | % { Stop-Process -Id \$_.OwningProcess -Force -ErrorAction SilentlyContinue }" > /dev/null 2>&1
powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil-7907' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
sleep 2
(cd $WT && PORT=7908 node save-server.js > $H/daten/$N-server.log 2>&1 &)
for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:7908/ 2>/dev/null | grep -q 200 && break; sleep 1; done
say "porta-core served $(curl -s http://localhost:7908/porta-core.js | sha256sum | cut -c1-16) · Baum $(git -C $WT log -1 --format=%h) $(git -C $WT status --short | grep -v '^??' | wc -l) geändert"
(cd $INS && node scripts/werkbank.cjs start --echt --port 7907 --seite http://localhost:7908 > $H/daten/$N-werkbank.log 2>&1 &)
for t in $(seq 1 120); do grep -q "WERKBANK bereit" $H/daten/$N-werkbank.log 2>/dev/null && break; sleep 5; done
say "bereit: $(grep -m1 'WERKBANK bereit' $H/daten/$N-werkbank.log | cut -c1-120)"
