#!/bin/bash
# reaktion-lauf.sh <präfix> — Werkbank --echt an der Mess-Wiese, die Seiten-Probe der Station same.physik.reaktion#1, Abbau
K=/c/Users/User/AppData/Local/Temp/e10w/knoten; W=24398; PRE=$1
cd /c/AnazhRealm || exit 1
node scripts/werkbank.cjs start --echt --port $W --seite http://localhost:4398 --ort wiese > $PRE.wb.log 2>&1 &
SP=$!
for i in $(seq 1 120); do node scripts/werkbank.cjs status --port $W > /dev/null 2>&1 && break; sleep 3; done
echo "bereit nach $((i * 3)) s"
node scripts/werkbank.cjs bild -238.1 38.6 -1046.6 -248 26.6 -1064 --uhr 0.5 --datei $PRE-vor.png --w 960 --h 540 --port $W > $PRE.bild.txt 2>&1
node scripts/werkbank.cjs eval "$(cat $K/masse/reaktion-seite2.js)" --port $W > $PRE.json 2>&1; e=$?
node scripts/werkbank.cjs stop --port $W > /dev/null 2>&1
sleep 2; kill $SP 2> /dev/null
echo "EXIT=$e"
