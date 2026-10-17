#!/bin/bash
# k0-welt.sh — der k0-Zustand in EINER Welt (Koordinator 17.10.): zuerst B = integ 25f53923 (abab-k0), dann A = main 93539122 (abab-b7a)
# als Gegenprobe im unteren Zustand; danach der Ego-Sprung zusätzlich an 9c8cfab8 (abab-s2b), wo er gesehen wurde. Probe: k0-welt.cjs.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN; H=$BASE/p3/k1710k0w; L=$H/fortschritt.log
. $BASE/p3/gpu-schloss.sh
say() { echo "$(date +%T) $*" | tee -a $L; }
stopp() {
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank|omen-messfolge|k0-welt' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  sleep 3; }
for S in B A S; do
  case $S in B) WT=$BASE/abab-k0;; A) WT=$BASE/abab-b7a;; S) WT=$BASE/abab-s2b;; esac
  schloss_nehmen "omen-k0welt $S"; stopp
  mkdir -p $H/stand-$S; mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $H/stand-$S/ 2>/dev/null
  (cd $WT && PORT=4312 node save-server.js > $H/$S-save.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null http://localhost:4312/ && break; sleep 1; done
  (cd $WT && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 > $H/$S-werkbank.log 2>&1 &)
  for t in $(seq 1 120); do grep -qE "bereit|FEHLER" $H/$S-werkbank.log 2>/dev/null && break; sleep 5; done
  say "K0WELT $S start ($(git -C $WT log -1 --format=%h))"
  (cd $WT && timeout 1800 node $H/k0-welt.cjs --datei C:/Users/micha/Desktop/AnazhRealm-OMEN/p3/k1710k0w/$S.json > $H/$S.txt 2>&1); ec=$?
  say "K0WELT $S exit=$ec"
  (cd $WT && node scripts/werkbank.cjs stop --port 4490 > /dev/null 2>&1); stopp
  schloss_loesen "omen-k0welt $S"; sleep 20
done
say "K0WELT FERTIG"
