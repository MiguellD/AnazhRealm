#!/bin/bash
# bisekt.sh — Bündel 7 Bisektion im echten Lauf (Koordinator 17.10.): Wiese Ego, lauf voll, Regler voll, je Seite 4 Welten, jede Seite mit
# IHREM Instrument (der eigene Baum; vor f1e96de5 das alte). Seiten: S0 93539122 (A) · S1 0f86daaf (+B3c) · S2 404d97dd (+D3c-leben, A3b) ·
# S3 f1e96de5 (+48c668ef, A9) · S4 e47ad9f8 (B). Runden gespiegelt: R1 0→4, R2 4→0, R3 0→4, R4 4→0. Probe: instrument-probe.cjs.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN; H=$BASE/p3/k1710b7/bisekt; L=$H/fortschritt.log; mkdir -p $H
. $BASE/p3/gpu-schloss.sh
say() { echo "$(date +%T) $*" | tee -a $L; }
stopp() {
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank|omen-messfolge|instrument-probe' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  sleep 3; }
baum() { case $1 in 0) echo $BASE/abab-b7a;; 1) echo $BASE/abab-b7s1;; 2) echo $BASE/abab-b7s2;; 3) echo $BASE/abab-b7s3;; 4) echo $BASE/abab-b7b;; esac; }
for R in 1 2 3 4; do
  # gekürzt (Koordinator 17.10.): S1 und S4 fallen, B steht aus Bündel 7
  if [ $((R % 2)) -eq 1 ]; then FOLGE="0 2 3"; else FOLGE="3 2 0"; fi
  for S in $FOLGE; do
    NAME=S$S-$R; WT=$(baum $S)
    [ -f $H/$NAME.json ] && { say "$NAME steht schon"; continue; }
    schloss_nehmen "omen-bisekt $NAME"; stopp
    mkdir -p $H/stand-$NAME; mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $H/stand-$NAME/ 2>/dev/null
    (cd $WT && PORT=4312 node save-server.js > $H/$NAME-save.log 2>&1 &)
    for t in $(seq 1 30); do curl -s -o /dev/null http://localhost:4312/ && break; sleep 1; done
    (cd $WT && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 > $H/$NAME-werkbank.log 2>&1 &)
    for t in $(seq 1 120); do grep -qE "bereit|FEHLER" $H/$NAME-werkbank.log 2>/dev/null && break; sleep 5; done
    say "$NAME start ($(git -C $WT log -1 --format=%h))"
    (cd $WT && timeout 1200 node $BASE/p3/k1710b7/instrument-probe.cjs --datei $H/$NAME.json > $H/$NAME.txt 2>&1); ec=$?
    say "$NAME exit=$ec $(grep -a 'lauf \|bank ' $H/$NAME.txt | tr '\n' ' ' | cut -c1-230)"
    (cd $WT && node scripts/werkbank.cjs stop --port 4490 > /dev/null 2>&1); stopp
    schloss_loesen "omen-bisekt $NAME"; sleep 20
  done
done
say "BISEKT FERTIG"
