#!/bin/bash
# g7.sh — G7-Bestätigung (Koordinator 17.10.): A = main 93539122 (abab-b7a) gegen B = integ 7f06ebf8 (abab-g7b), Wiese Ego + Genesis Ego,
# je 4 Welten AA/BB abwechselnd, jede Seite mit ihrem Instrument; je Welt lauf voll, gpu-bank, Frame-Anatomie (g7-probe.cjs).
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN; H=$BASE/p3/k1710g7; L=$H/fortschritt.log; mkdir -p $H
. $BASE/p3/gpu-schloss.sh
say() { echo "$(date +%T) $*" | tee -a $L; }
stopp() {
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank|omen-messfolge|g7-probe' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  sleep 3; }
for ORT in wiese genesis; do
  for N in 1 2 3 4; do
    for S in A B; do
      NAME=$ORT-$S$N; case $S in A) WT=$BASE/abab-b7a;; B) WT=$BASE/abab-g7b;; esac
      [ -f $H/$NAME.json ] && { say "$NAME steht schon"; continue; }
      schloss_nehmen "omen-g7 $NAME"; stopp
      mkdir -p $H/stand-$NAME; mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $H/stand-$NAME/ 2>/dev/null
      (cd $WT && PORT=4312 node save-server.js > $H/$NAME-save.log 2>&1 &)
      for t in $(seq 1 30); do curl -s -o /dev/null http://localhost:4312/ && break; sleep 1; done
      (cd $WT && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 > $H/$NAME-werkbank.log 2>&1 &)
      for t in $(seq 1 120); do grep -qE "bereit|FEHLER" $H/$NAME-werkbank.log 2>/dev/null && break; sleep 5; done
      say "$NAME start ($(git -C $WT log -1 --format=%h))"
      (cd $WT && timeout 1200 node $H/g7-probe.cjs --ort $ORT --sicht ego --datei $H/$NAME.json > $H/$NAME.txt 2>&1); ec=$?
      say "$NAME exit=$ec $(grep -a 'bank \|kopien je Bild' $H/$NAME.txt | tr '\n' ' ' | cut -c1-230)"
      (cd $WT && node scripts/werkbank.cjs stop --port 4490 > /dev/null 2>&1); stopp
      schloss_loesen "omen-g7 $NAME"; sleep 20
    done
  done
done
say "G7 FERTIG"
