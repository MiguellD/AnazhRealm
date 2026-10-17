#!/bin/bash
# instrument-probe.sh — Seite × Instrument an der Wiese Ego: AA (Seite A, Instrument A vor A9), AB (Seite A, Instrument B mit Weiche), BB.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN; H=$BASE/p3/k1710b7/instrument; L=$H/fortschritt.log; mkdir -p $H
. $BASE/p3/gpu-schloss.sh
say() { echo "$(date +%T) $*" | tee -a $L; }
stopp() {
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank|omen-messfolge|instrument-probe' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  sleep 3; }
for K in ${KOMBIS:-AA AB BB}; do
  case ${K:0:1} in A) WT=$BASE/abab-b7a;; B) WT=$BASE/abab-b7b;; esac
  case ${K:1:1} in A) INS=$BASE/abab-b7a;; B) INS=$BASE/abab-b7b;; esac
  schloss_nehmen "omen-instrument $K"; stopp
  mkdir -p $H/stand-$K; mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $H/stand-$K/ 2>/dev/null
  (cd $WT && PORT=4312 node save-server.js > $H/$K-save.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null http://localhost:4312/ && break; sleep 1; done
  (cd $INS && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 > $H/$K-werkbank.log 2>&1 &)
  for t in $(seq 1 120); do grep -qE "bereit|FEHLER" $H/$K-werkbank.log 2>/dev/null && break; sleep 5; done
  say "INSTRUMENT $K start (Seite $(git -C $WT log -1 --format=%h), Instrument $(git -C $INS log -1 --format=%h))"
  (cd $INS && timeout 1200 node $BASE/p3/k1710b7/instrument-probe.cjs --datei $H/$K.json > $H/$K.txt 2>&1); ec=$?
  say "INSTRUMENT $K exit=$ec $(grep -a 'bank ' $H/$K.txt | cut -c1-160)"
  (cd $INS && node scripts/werkbank.cjs stop --port 4490 > /dev/null 2>&1); stopp
  schloss_loesen "omen-instrument $K"; sleep 20
done
say "INSTRUMENT FERTIG"
