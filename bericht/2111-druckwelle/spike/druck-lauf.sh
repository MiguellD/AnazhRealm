#!/bin/bash
# druck-lauf.sh <präfix> — Werkbank --echt an der Mess-Wiese: Aufbau · Bild vor · drei Ladungen · Bild nach · Abbau
K=/c/Users/User/AppData/Local/Temp/e10w/knoten; M=$K/druck; W=24398; PRE=$1
cd /c/AnazhRealm || exit 1
node scripts/werkbank.cjs start --echt --port $W --seite http://localhost:4398 --ort wiese > $PRE.wb.log 2>&1 &
SP=$!
for i in $(seq 1 120); do node scripts/werkbank.cjs status --port $W > /dev/null 2>&1 && break; sleep 3; done
echo "bereit nach $((i * 3)) s · $(date '+%H:%M:%S')"
node scripts/werkbank.cjs bild -280.4 31 -1049.6 -272 27.8 -1045.6 --uhr 0.5 --datei $PRE-leer.png --w 960 --h 540 --port $W > $PRE-leer.txt 2>&1
echo "Bild leer · $(date '+%H:%M:%S')"
node scripts/werkbank.cjs eval "$(cat $M/druck-a-aufbau.js)" --port $W > $PRE-a.json 2>&1; ea=$?
echo "A EXIT=$ea · $(date '+%H:%M:%S')"
POSE=$(node -e 'try{const j=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));const b=j.ergebnis&&j.ergebnis.bild;if(b)console.log(b.join(" "))}catch(e){}' $PRE-a.json)
eb=9
if [ -n "$POSE" ]; then
    node scripts/werkbank.cjs bild $POSE --uhr 0.5 --datei $PRE-vor.png --w 960 --h 540 --port $W > $PRE-vor.txt 2>&1
    echo "Bild vor · $(date '+%H:%M:%S')"
    node scripts/werkbank.cjs eval "$(cat $M/druck-b-zuenden.js)" --port $W > $PRE-b.json 2>&1; eb=$?
    echo "B EXIT=$eb · $(date '+%H:%M:%S')"
    node scripts/werkbank.cjs bild $POSE --uhr 0.5 --datei $PRE-nach.png --w 960 --h 540 --port $W > $PRE-nach.txt 2>&1
    echo "Bild nach · $(date '+%H:%M:%S')"
fi
node scripts/werkbank.cjs eval "$(cat $M/druck-c-abbau.js)" --port $W > $PRE-c.json 2>&1; ec=$?
echo "C EXIT=$ec · $(date '+%H:%M:%S')"
node scripts/werkbank.cjs stop --port $W > /dev/null 2>&1
sleep 2; kill $SP 2> /dev/null
echo "EXIT=$ea/$eb/$ec"
