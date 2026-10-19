#!/bin/bash
# 1910 B-Kette (OMEN, GTX 1060, Messer): Kalt-Läufe an main e93134f4 mit dem Ketten-Instrument (lieferung-patch Kopie +
# kette-patch + faden-patch), K1/K2 ohne Trace, K3 mit Chrome-Trace (KETTE_TRACE: devtools.timeline + v8.compile +
# v8.cpu_profiler). Schloss omen-1710-n NUR um jeden Lauf; Kill-Filter nur auf die eigenen Pfade (n1910/kette/prof, n1910/kette/roh).
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
WT=$BASE/n1910-f1b
OUT=$BASE/p3/n1910/kette; ROH=$OUT/roh; PROF=$OUT/prof; LOG=$OUT/fortschritt.log
mkdir -p $ROH $PROF
say() { echo "$(date +%T) $*" | tee -a $LOG; }
stopp() {
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? { \$_.CommandLine -match 'n1910.kette.prof' } | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? { \$_.CommandLine -match 'diag-boot-stage.*n1910.kette.roh' } | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  sleep 2
}
gpu() { nvidia-smi --query-gpu=temperature.gpu,clocks.gr,clocks.mem,pstate --format=csv,noheader 2>/dev/null | tr -d '\n'; }
. $BASE/p3/gpu-schloss.sh
SMI=
trap 'kill $SMI 2>/dev/null; stopp; schloss_loesen omen-1710-n' EXIT
lauf() { # $1 Name, $2 Trace ja/nein
  local N=$1 T=$2 P=$PROF/$1
  [ -f $ROH/$N.json ] && { say "$N steht schon"; return; }
  schloss_nehmen omen-1710-n; stopp
  say "$N start kalt trace=$T sha=$(sha256sum $WT/scripts/diag-boot-stage.cjs | cut -c1-12)/$(sha256sum $WT/stamm/studio-bruecke.js | cut -c1-12) gpu[$(gpu)]"
  nvidia-smi --query-gpu=timestamp,clocks.gr,clocks.mem,temperature.gpu,power.draw,pstate --format=csv,noheader -l 1 > $ROH/$N-smi.csv 2>/dev/null & SMI=$!
  local TR=""; [ "$T" = ja ] && TR=$(cygpath -m $ROH/$N.trace.json)
  (cd $WT && KETTE_TRACE=$TR BOOT_STAGE_PORT=7902 timeout 600 node scripts/diag-boot-stage.cjs --kalt --echt --profil $(cygpath -m $P) --json $(cygpath -m $ROH/$N.json) --bild $(cygpath -m $ROH/$N.png) > $ROH/$N.log 2>&1); local ec=$?
  kill $SMI 2>/dev/null; SMI=; stopp; schloss_loesen omen-1710-n
  rm -rf $P
  say "$N exit=$ec gpu[$(gpu)] $(grep -aE 't\(Weltbild\)' $ROH/$N.log | tail -1 | tr -s ' ') $( [ -f $ROH/$N.trace.json ] && ls -s --block-size=M $ROH/$N.trace.json | cut -d' ' -f1 )"
}
say "SERIE START Baum=$(git -C $WT log -1 --format=%h) Instrument: $(git -C $WT status --porcelain | tr '\n' ' ')"
FOLGE=${FOLGE:-"K1:nein K2:nein K3:ja"}
erst=1
for x in $FOLGE; do
  [ $erst = 1 ] || sleep 60
  erst=0
  lauf ${x%%:*} ${x##*:}
done
say "SERIE ENDE"
