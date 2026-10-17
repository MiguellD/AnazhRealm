#!/bin/bash
# s2b.sh — S2b (Koordinator 17.10.): A = 7f06ebf8 (abab-g7b) gegen B = 9c8cfab8 (abab-s2b), jede Seite mit ihrem Instrument.
#  1) ABAB Wiese Ego + Genesis Ego, je 4 Welten AA/BB (g7-probe.cjs: lauf voll + VRAM, gpu-bank, Frame-Anatomie)
#  2) Ankunft kalt, je Seite 4 Starts im Wechsel (Linse des Kopfs + Stations-Patch p3/k1710ak/station-linse.diff)
#  3) Auge an Genesis Ego/Third (s2b-auge.cjs: drei Bilder je Sicht, Sprung, Schwarz-Anteil)
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN; H=$BASE/p3/k1710s2b; L=$H/fortschritt.log; mkdir -p $H/abab $H/ankunft $H/auge
. $BASE/p3/gpu-schloss.sh
say() { echo "$(date +%T) $*" | tee -a $L; }
stopp() {
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? CommandLine -match 'save-server|werkbank|omen-messfolge|g7-probe|s2b-auge|diag-boot-stage' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? CommandLine -match 'werkbank-profil' | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  sleep 3; }
baum() { case $1 in A) echo $BASE/abab-g7b;; B) echo $BASE/abab-s2b;; esac; }
welt() { # $1 Name, $2 Baum, $3 Client-Befehl
  schloss_nehmen "omen-s2b $1"; stopp
  mkdir -p $H/stand/$1; mv $2/anazhRealmState.json $2/anazhRealmState.json.bak $2/anazhRealmPerf.json $H/stand/$1/ 2>/dev/null
  (cd $2 && PORT=4312 node save-server.js > $H/stand/$1/save.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null http://localhost:4312/ && break; sleep 1; done
  (cd $2 && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 > $H/stand/$1/werkbank.log 2>&1 &)
  for t in $(seq 1 120); do grep -qE "bereit|FEHLER" $H/stand/$1/werkbank.log 2>/dev/null && break; sleep 5; done
  say "$1 start ($(git -C $2 log -1 --format=%h))"
  (cd $2 && eval "timeout 1200 $3"); ec=$?
  say "$1 exit=$ec"
  (cd $2 && node scripts/werkbank.cjs stop --port 4490 > /dev/null 2>&1); stopp
  schloss_loesen "omen-s2b $1"; sleep 20
}
# 1) ABAB
for ORT in wiese genesis; do for N in 1 2 3 4; do for S in A B; do
  NAME=$ORT-$S$N; [ -f $H/abab/$NAME.json ] && continue
  welt $NAME $(baum $S) "node $BASE/p3/k1710g7/g7-probe.cjs --ort $ORT --sicht ego --datei $H/abab/$NAME.json > $H/abab/$NAME.txt 2>&1"
  say "  $(grep -a 'bank \|kopien je Bild' $H/abab/$NAME.txt | tr '\n' ' ' | cut -c1-200)"
done; done; done
# 2) Ankunft kalt
for S in A B; do (cd $(baum $S) && git diff --quiet -- scripts/diag-boot-stage.cjs && git apply $BASE/p3/k1710ak/station-linse.diff && echo "Stations-Patch $S gesetzt" >> $L); done
for N in 1 2 3 4; do for S in A B; do
  NAME=K$S$N; [ -f $H/ankunft/$NAME.json ] && continue
  schloss_nehmen "omen-s2b $NAME"; stopp
  (cd $(baum $S) && timeout 600 node scripts/diag-boot-stage.cjs --kalt --echt --sek 180 --json $H/ankunft/$NAME.json --bild $H/ankunft/$NAME.png > $H/ankunft/$NAME.txt 2>&1); ec=$?
  say "$NAME exit=$ec $(grep -a 't(Weltbild)' $H/ankunft/$NAME.txt | tr -s ' ' | cut -c1-120)"
  schloss_loesen "omen-s2b $NAME"; sleep 30
done; done
# 3) Auge
for S in A B; do
  NAME=auge-$S; [ -f $H/auge/$S.json ] && continue
  welt $NAME $(baum $S) "node $H/s2b-auge.cjs --praefix $H/auge/$S > $H/auge/$S.txt 2>&1"
  say "  $(grep -a 'ego:\|third:' $H/auge/$S.txt | tr '\n' ' ' | cut -c1-260)"
done
say "S2B FERTIG"
