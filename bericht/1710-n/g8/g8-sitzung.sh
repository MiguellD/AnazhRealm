#!/bin/bash
# g8-sitzung.sh <tag> <probe.cjs> [probe-args…] — EINE Werkbank-Sitzung im Baum n1710-g8 unter dem GPU-Schloss (Karte G8, Finder).
# Startet save-server (Windows-PID gemerkt) und Werkbank, fährt die Probe, stoppt beides, löst das Schloss.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN; WT=$BASE/n1710-g8; H=$BASE/p3/n1710/g8; TAG=$1; shift; PROBE=$1; shift
L=$H/fortschritt.log
. $BASE/p3/gpu-schloss.sh
say() { echo "$(date +%T) $*" | tee -a $L; }
schloss_nehmen omen-1710-n
say "SITZUNG $TAG: Schloss genommen ($(git -C $WT log -1 --format=%h))"
cd $WT
PORT=4312 node save-server.js > $H/$TAG-save.log 2>&1 &
SPID=$(cat /proc/$!/winpid 2>/dev/null)
say "save-server PID $SPID"
for t in $(seq 1 30); do curl -s -o /dev/null http://localhost:4312/ && break; sleep 1; done
node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 --ort wiese > $H/$TAG-werkbank.log 2>&1 &
for t in $(seq 1 120); do grep -qE "bereit|FEHLER" $H/$TAG-werkbank.log 2>/dev/null && break; sleep 5; done
say "werkbank: $(grep -E 'bereit|FEHLER' $H/$TAG-werkbank.log | head -1)"
timeout 2400 node $H/$PROBE "$@" > $H/$TAG.txt 2>&1; ec=$?
say "SITZUNG $TAG probe exit=$ec"
node scripts/werkbank.cjs stop --port 4490 > $H/$TAG-stop.log 2>&1
sleep 3
[ -n "$SPID" ] && powershell -NoProfile -c "Stop-Process -Id $SPID -Force" > /dev/null 2>&1
sleep 2
rm -f $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json
schloss_loesen omen-1710-n
say "SITZUNG $TAG Ende, Schloss gelöst"
