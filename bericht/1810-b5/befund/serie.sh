#!/bin/bash
# 1810 B5 Finder (OMEN, GTX 1060): die Kalt-Zeile mit Lieferungs-Spur + CPU-Profil (0,5 ms, B4-Instrument byte-gleich).
#   K0 Aufwärm-Lauf (leeres Profil), K1–K3 kalt (leeres Profil),
#   je P1..P3: Pa kalt (neuer Profil-Ordner) · Pb Zweit-Boot (derselbe Ordner) · Versions-Stufe (bump 18.546.90) · Pc · zurück.
# Schloss omen-1710-n NUR um jeden Lauf; Kill-Filter nur auf die eigenen Pfade (n1810/b5/prof, n1810/b5/roh); 60 s Pause.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
WT=$BASE/n1810-b5
OUT=$BASE/p3/n1810/b5; ROH=$OUT/roh; PROF=$OUT/prof; LOG=$OUT/fortschritt.log
mkdir -p $ROH $PROF
say() { echo "$(date +%T) $*" | tee -a $LOG; }
VDATEIEN="package.json package-lock.json stamm/dirigent-kern.js index.html CLAUDE.md $(cd $WT && ls worlds/*/index.html | tr '\n' ' ')"
GEHOBEN=0
zurueck() { if [ $GEHOBEN = 1 ]; then (cd $WT && git -c core.autocrlf=false checkout -- $VDATEIEN); GEHOBEN=0; say "Versions-Stufe zurueck: $(cd $WT && git status --porcelain | tr '\n' ' ')"; fi; }
stopp() {
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | ? { \$_.CommandLine -match 'n1810.b5.prof' } | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  powershell -NoProfile -c "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ? { \$_.CommandLine -match 'diag-boot-stage.*n1810.b5.roh' } | % { Stop-Process -Id \$_.ProcessId -Force }" >/dev/null 2>&1
  sleep 2
}
gpu() { nvidia-smi --query-gpu=temperature.gpu,clocks.gr,clocks.mem,pstate,clocks_throttle_reasons.active --format=csv,noheader 2>/dev/null | tr -d '\n'; }
. $BASE/p3/gpu-schloss.sh
trap 'zurueck; kill $SMI 2>/dev/null; stopp; schloss_loesen omen-1710-n' EXIT
lauf() { # $1 Name, $2 Profil-Ordner
  local N=$1 P=$2
  [ -f $ROH/$N.json ] && { say "$N steht schon"; return; }
  schloss_nehmen omen-1710-n; stopp
  say "$N start profil=$(basename $P) $( [ -d $P ] && echo zweit || echo kalt ) v=$(grep -o 'VERSION = "[0-9.]*"' $WT/stamm/dirigent-kern.js) gpu[$(gpu)]"
  nvidia-smi --query-gpu=timestamp,clocks.gr,clocks.mem,temperature.gpu,power.draw,pstate,clocks_throttle_reasons.active,memory.used --format=csv,noheader -l 1 > $ROH/$N-smi.csv 2>/dev/null & SMI=$!
  (cd $WT && BOOT_STAGE_PORT=7902 timeout 600 node scripts/diag-boot-stage.cjs --kalt --echt --profil $P --json $ROH/$N.json --bild $ROH/$N.png > $ROH/$N.log 2>&1); local ec=$?
  kill $SMI 2>/dev/null; stopp; schloss_loesen omen-1710-n
  say "$N exit=$ec gpu[$(gpu)] $(grep -aE 't\(Weltbild\)' $ROH/$N.log | tail -1 | tr -s ' ')"
  sleep 60
}
say "SERIE START Baum=$(git -C $WT log -1 --format=%h) Instrument: $(git -C $WT status --porcelain | tr '\n' ' ')"
for N in ${KALT:-K0 K1 K2 K3}; do lauf $N $PROF/$N; done
for P in ${PLATTE:-P1 P2 P3}; do [ "$P" = "-" ] && continue
  lauf ${P}a $PROF/$P
  lauf ${P}b $PROF/$P
  if [ ! -f $ROH/${P}c.json ]; then
    (cd $WT && node scripts/bump-version.cjs 18.546.90 > /dev/null) && GEHOBEN=1
    say "Versions-Stufe 18.546.90: $(cd $WT && git status --porcelain | wc -l) Dateien"
    lauf ${P}c $PROF/$P
    zurueck
  fi
done
say "SERIE ENDE"
