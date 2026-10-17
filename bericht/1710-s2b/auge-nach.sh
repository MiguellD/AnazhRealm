#!/bin/bash
# auge-nach.sh — der Augen-Check der S2b-Kette neu (erster Versuch: `/bild` ohne feste Kamera), nach der k0-Probe.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN; H=$BASE/p3/k1710s2b; L=$H/fortschritt.log; mkdir -p $H/auge
. $BASE/p3/gpu-schloss.sh
say() { echo "$(date +%T) $*" | tee -a $L; }
stopp() {
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank|omen-messfolge|s2b-auge' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  sleep 3; }
for S in A B; do
  case $S in A) WT=$BASE/abab-g7b;; B) WT=$BASE/abab-s2b;; esac
  NAME=auge-$S; schloss_nehmen "omen-s2b $NAME"; stopp
  mkdir -p $H/stand/$NAME; mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $H/stand/$NAME/ 2>/dev/null
  (cd $WT && PORT=4312 node save-server.js > $H/stand/$NAME/save.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null http://localhost:4312/ && break; sleep 1; done
  (cd $WT && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 > $H/stand/$NAME/werkbank.log 2>&1 &)
  for t in $(seq 1 120); do grep -qE "bereit|FEHLER" $H/stand/$NAME/werkbank.log 2>/dev/null && break; sleep 5; done
  say "$NAME start ($(git -C $WT log -1 --format=%h))"
  (cd $WT && timeout 1200 node $H/s2b-auge.cjs --praefix C:/Users/micha/Desktop/AnazhRealm-OMEN/p3/k1710s2b/auge/$S > $H/auge/$S.txt 2>&1); ec=$?
  say "$NAME exit=$ec $(grep -a 'ego:\|third:\|FEHLER' $H/auge/$S.txt | tr '\n' ' ' | cut -c1-300)"
  (cd $WT && node scripts/werkbank.cjs stop --port 4490 > /dev/null 2>&1); stopp
  schloss_loesen "omen-s2b $NAME"; sleep 20
done
say "AUGE FERTIG"
