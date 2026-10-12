#!/bin/bash
# 1110-11: eine Sitzung aus <worktree> (save-server 7908, Werkbank 7907 --echt aus DEMSELBEN Worktree), an der Wiese eingeschwungen
#   ./sitzung.sh <name> <worktree>
H=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/birke
N=$1; WT=$2; export WERKBANK_PORT=7907
mkdir -p $H/daten
say() { echo "$(date +%T) $N $*" | tee -a $H/sitzung.log; }
powershell -NoProfile -c "Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | ? { \$_.LocalPort -eq 7907 -or \$_.LocalPort -eq 7908 } | % { Stop-Process -Id \$_.OwningProcess -Force -ErrorAction SilentlyContinue }" > /dev/null 2>&1
powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match '[w]erkbank-profil-7907' | % { Stop-Process -Id \$_.ProcessId -Force }" > /dev/null 2>&1
sleep 2
(cd $WT && PORT=7908 node save-server.js > $H/daten/$N-server.log 2>&1 &)
for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:7908/ 2>/dev/null | grep -q 200 && break; sleep 1; done
say "Seite $(curl -s http://localhost:7908/anazhRealm.js | sha256sum | cut -c1-16) · Baum $(git -C $WT log -1 --format=%h) $(git -C $WT status --short | grep -v '^??' | wc -l) geändert"
(cd $WT && node scripts/werkbank.cjs start --echt --port 7907 --seite http://localhost:7908 > $H/daten/$N-werkbank.log 2>&1 &)
for t in $(seq 1 120); do grep -q "WERKBANK bereit" $H/daten/$N-werkbank.log 2>/dev/null && break; sleep 5; done
W="node $WT/scripts/werkbank.cjs"
$W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null
$W fenster 1920 1080 > /dev/null
$W umstellen --ort wiese > $H/daten/$N-umstellen.txt 2>&1
$W eval "return window.__buehne()" > /dev/null
$W eval "r.state.yaw = 0; r.state.pitch = 0; return 1" > /dev/null
$W lauf 10 --ein 30 --ruhe 300 --tiere frei > $H/daten/$N-lauf.txt 2>&1
say "bereit (Wiese, Gier 0, eingeschwungen)"
