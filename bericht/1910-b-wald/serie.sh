#!/bin/bash
# 1910 B-Wald (OMEN, GTX 1060 + i7-8750H, Schneider): Kalt-ABAB, A = n1910-f1b (main e93134f4), B = n1910-bwald (Zweig b-wald),
# an beiden Seiten byte-gleich das Ketten-Instrument des Messers (p3/n1910/kette: lieferung-patch + kette-patch + faden-patch +
# wald-patch, ohne Trace). Schloss omen-1710-n NUR um jeden Lauf; Kill-Filter nur auf die eigenen Pfade (n1910/bwald/prof|roh).
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
OUT=$BASE/p3/n1910/bwald; ROH=$OUT/roh; PROF=$OUT/prof; LOG=$OUT/fortschritt.log
mkdir -p $ROH $PROF
say() { echo "$(date +%T) $*" | tee -a $LOG; }
stopp() {
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? { \$_.CommandLine -match 'n1910.bwald.prof' } | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? { \$_.CommandLine -match 'diag-boot-stage.*n1910.bwald.roh' } | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  sleep 2
}
gpu() { nvidia-smi --query-gpu=temperature.gpu,clocks.gr,clocks.mem,pstate --format=csv,noheader 2>/dev/null | tr -d '\n'; }
. $BASE/p3/gpu-schloss.sh
trap 'stopp; schloss_loesen omen-1710-n' EXIT
lauf() { # $1 Name (A1, B2, …): A = n1910-f1b, B = n1910-bwald
  local N=$1 P=$PROF/$1 WT
  case $N in A*) WT=$BASE/n1910-f1b ;; B*) WT=$BASE/n1910-bwald ;; esac
  [ -f $ROH/$N.json ] && { say "$N steht schon"; return; }
  schloss_nehmen omen-1710-n; stopp
  say "$N start kalt $(git -C $WT log -1 --format=%h) sha=$(sha256sum $WT/scripts/diag-boot-stage.cjs | cut -c1-12)/$(sha256sum $WT/stamm/studio-bruecke.js | cut -c1-12)/$(sha256sum $WT/voxel-worker.js | cut -c1-12) gpu[$(gpu)]"
  (cd $WT && BOOT_STAGE_PORT=7902 timeout 600 node scripts/diag-boot-stage.cjs --kalt --echt --profil $(cygpath -m $P) --json $(cygpath -m $ROH/$N.json) --bild $(cygpath -m $ROH/$N.png) > $ROH/$N.log 2>&1); local ec=$?
  stopp; schloss_loesen omen-1710-n
  rm -rf $P
  say "$N exit=$ec gpu[$(gpu)] $(grep -aE 't\(Weltbild\)' $ROH/$N.log | tail -1 | tr -s ' ')"
}
say "SERIE START A=$(git -C $BASE/n1910-f1b log -1 --format=%h) B=$(git -C $BASE/n1910-bwald log -1 --format=%h) FOLGE=${FOLGE:-A1 B1 A2 B2 A3 B3 A4 B4}"
erst=1
for x in ${FOLGE:-A1 B1 A2 B2 A3 B3 A4 B4}; do
  [ $erst = 1 ] || sleep 60
  erst=0
  lauf $x
done
say "SERIE ENDE"
