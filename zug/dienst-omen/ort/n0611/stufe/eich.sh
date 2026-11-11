#!/bin/bash
# eich.sh — Koordinator K10, 10.11. 13:25 (Gesetz der Fremd-Last, w27-fremdlast-gesetz-pm): die EIGENE Eichung der OMEN.
# (a) `punkte.cjs fremdlast --sek 40` im Leerlauf (die Kette steht still), (b) dasselbe neben einer bekannten Last (scripts/playtest-fast.cjs
# des Haupt-Klons in einer Schleife, render-gestubbt, Port 4319), (c) ABAB `run --nur ankunft.K1#1` am jüngsten main: ohne, mit, ohne, mit.
# Nichts wird gepusht außer den Zeilen (die Messungen unter gestellter Last gehören in keine Buchung). Die Last weicht JEDEM CI-Job: sie läuft
# nur, solange kein Runner.Worker lebt und keiner wartet (Prüfung alle 2 s, sonst fällt ihr Baum). HPAppHelperCap ist seit 13:01 angehalten
# (vom Schöpfer), das steht in jeder Zeile.
N=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/n0611; S=$N/stufe; E=$S/eich; L=$E/eich.log; cd $N
M=/c/Users/micha/Desktop/AnazhRealm-OMEN/AnazhRealm-mess; PM=/c/Users/micha/Desktop/AnazhRealm-OMEN/n0611-pm
D=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/messplatz/dienst.log
. /c/Users/micha/Desktop/AnazhRealm-OMEN/p3/gpu-schloss.sh
unset LINSE_SICHTBAR
log() { echo "$(date '+%F %T') $*" >> $L; }
melde() { printf '%s\n' "$1" > $E/zeile.txt; node $S/melde.cjs $E/zeile.txt >> $L 2>&1; }
hp() { sc.exe query HPAppHelperCap 2>/dev/null | grep -ao "RUNNING\|STOPPED" | head -n 1; }
fremd() { (cd $PM/meisterkarte-quelle/punkte && timeout 120 node punkte.cjs fremdlast --sek 40 2>&1) > $1; grep -a "^FREMDLAST" $1 | head -n 1 | cut -c1-300; }
last_an() { rm -f $E/last.aus; ( while [ ! -f $E/last.aus ]; do
    if ci_worker || ci_wartet; then sleep 5; continue; fi
    ( cd $M && PLAYTEST_STRICT=0 exec node scripts/playtest-fast.cjs > $E/last-lauf.out 2>&1 ) & P=$!; W=$(cat /proc/$P/winpid 2>/dev/null)
    while kill -0 $P 2>/dev/null; do
      if ci_worker || ci_wartet || [ -f $E/last.aus ]; then [ -n "$W" ] && taskkill -F -T -PID $W > /dev/null 2>&1; kill -9 $P 2>/dev/null; break; fi
      sleep 2
    done
  done ) & LAST=$!; log "Last an (pid $LAST)"; }
last_aus() { touch $E/last.aus; wait $LAST 2>/dev/null; log "Last aus"; }
station() { # station <teil> -> eine Zeile: Urteil + Zahl der Station und die Fremd-Last des Laufs
  local t=$1 v d0 vd o
  for v in 1 2 3; do
    until gpu_frei; do sleep 10; done
    d0=$(grep -ac "omen-punkte-gtx-sitzung VERDR" $D)
    TEIL=eich-$t-v$v NUR='ankunft.K1#1' node punkte-offen.cjs lauf $K >> $L 2>&1
    vd=$(( $(grep -ac "omen-punkte-gtx-sitzung VERDR" $D) - d0 )); o=$N/punkte-offen-${K:0:8}-eich-$t-v$v.out
    [ "$vd" -eq 0 ] && { grep -a "ankunft.K1#1" $o | grep -av "^Punkte-Maschine" | tail -n 2 | tr -s ' ' | cut -c1-420 | tr '\n' ' '; return 0; }
    log "$t v$v verdraengt - neu"
  done; echo "$t 3x verdraengt"; }
git -C $M fetch -q origin main; K=$(git -C $M rev-parse origin/main)
CPU=$(powershell -NoProfile -Command "(Get-CimInstance Win32_Processor).Name" | tr -d '\r'); KERNE=$(nproc)
log "START (pid $$) Kopf ${K:0:8} · $CPU · $KERNE Kerne · HPAppHelperCap $(hp)"
until gpu_frei; do sleep 10; done
A=$(fremd $E/leer.txt); log "LEER: $A"
melde "gpu-stufe Eichung OMEN (a) Leerlauf: $A · CPU $CPU, $KERNE Kerne · HPAppHelperCap $(hp) (seit 13:01 vom Schöpfer angehalten)"
O1=$(station ohne-1); log "OHNE-1: $O1"
last_an; sleep 25; B=$(fremd $E/last.txt); log "LAST: $B"; M1=$(station mit-1); last_aus; log "MIT-1: $M1"
melde "gpu-stufe Eichung OMEN (b) neben playtest-fast in Schleife: $B · ankunft.K1#1 ohne-1: $O1 · mit-1: $M1"
O2=$(station ohne-2); log "OHNE-2: $O2"
last_an; sleep 25; M2=$(station mit-2); last_aus; log "MIT-2: $M2"
melde "gpu-stufe Eichung OMEN (c) ankunft.K1#1 am ${K:0:8} ABAB ohne/mit Last: ohne-2: $O2 · mit-2: $M2 · Roh p3/n0611/stufe/eich/ und p3/n0611/punkte-offen-${K:0:8}-eich-*.out"
touch $E/EICH.fertig; log "ENDE"
