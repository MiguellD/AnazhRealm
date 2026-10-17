#!/bin/bash
# kristall-welt.sh — die Kristall-Kette in EINER Welt: zuerst B (bd74a171, abab-e1c), dann A (3b66b341, abab-e1a), Genesis Ego.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN; H=$BASE/p3/k1710kr; L=$H/fortschritt.log
. $BASE/p3/gpu-schloss.sh
say() { echo "$(date +%T) $*" | tee -a $L; }
stopp() {
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank|omen-messfolge|kristall-welt' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  sleep 3; }
for S in ${SEITEN:-B A}; do
  case $S in A) WT=$BASE/abab-e1a;; B) WT=$BASE/abab-e1c;; esac
  schloss_nehmen "omen-kristall $S"; stopp
  mkdir -p $H/stand-$S; mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $H/stand-$S/ 2>/dev/null
  (cd $WT && PORT=4312 node save-server.js > $H/$S-save.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null http://localhost:4312/ && break; sleep 1; done
  (cd $WT && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 > $H/$S-werkbank.log 2>&1 &)
  for t in $(seq 1 120); do grep -qE "bereit|FEHLER" $H/$S-werkbank.log 2>/dev/null && break; sleep 5; done
  say "KRISTALL $S start ($(git -C $WT log -1 --format=%h))"
  (cd $WT && timeout 1500 node $H/kristall-welt.cjs --ort genesis --sicht ego --datei $H/$S.json > $H/$S.txt 2>&1); ec=$?
  say "KRISTALL $S exit=$ec"
  (cd $WT && node scripts/werkbank.cjs stop --port 4490 > /dev/null 2>&1); stopp
  schloss_loesen "omen-kristall $S"; sleep 20
done
say "KRISTALL FERTIG"
