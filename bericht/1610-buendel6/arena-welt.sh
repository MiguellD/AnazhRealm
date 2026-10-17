#!/bin/bash
# arena-welt.sh — G1 als Schalter in EINER Welt am Kopf B (6df9c3d4), Genesis Third, Folge A G G A A G G A (arena-welt.cjs),
# nach dem Ende der Bündel-6-Serie; danach die Ankunfts-Menge (p3/k1610am/serie.sh).
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN; H=$BASE/p3/k1610b6; L=$H/fortschritt.log; B=$BASE/abab-p6df; O=$H/arena-welt
mkdir -p $O; . $BASE/p3/gpu-schloss.sh
say() { echo "$(date +%T) $*" | tee -a $L; }
stopp() {
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank|omen-messfolge|arena-welt' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  sleep 3; }
until grep -q "SERIE ENDE" $L; do sleep 30; done
K=g-third
schloss_nehmen "omen-arena-welt $K"; stopp
mkdir -p $O/stand; mv $B/anazhRealmState.json $B/anazhRealmState.json.bak $B/anazhRealmPerf.json $O/stand/ 2>/dev/null
(cd $B && PORT=4312 node save-server.js > $O/$K-save.log 2>&1 &)
for t in $(seq 1 30); do curl -s -o /dev/null http://localhost:4312/ && break; sleep 1; done
(cd $B && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 > $O/$K-werkbank.log 2>&1 &)
for t in $(seq 1 120); do grep -qE "bereit|FEHLER" $O/$K-werkbank.log 2>/dev/null && break; sleep 5; done
say "ARENA-WELT $K start"
(cd $B && timeout 2400 node $H/arena-welt.cjs --ort genesis --sicht third --datei $O/$K.json > $O/$K.txt 2>&1); ec=$?
say "ARENA-WELT $K exit=$ec $(grep -a 'GPU ms' $O/$K.txt | head -1 | tr -s ' ' | cut -c1-140)"
(cd $B && node scripts/werkbank.cjs stop --port 4490 > /dev/null 2>&1); stopp
schloss_loesen "omen-arena-welt $K"; sleep 30
say "ARENA-WELT FERTIG"
bash $BASE/p3/k1610am/serie.sh > $BASE/p3/k1610am/serie.out 2>&1
