#!/bin/sh
# K45-2: der Mensch der Welt auf Armlaenge (Radeon, Ausgabe-Pfad, Wiese, Sicht third, die Labor-Gestalt per Uebergabe).
# sh welt-mensch.sh <worktree> <name>
WT=$1; NAME=$2
L=/c/Users/micha/AppData/Local/Temp/claude/gpu-schloss
D=/c/Users/micha/AppData/Local/Temp/claude/labor-welt-mensch
O=/c/Users/micha/AnazhRealm-profiband/.claude/worktrees/labor-welt-mensch/artifacts/profiband/welle-95/labor-welt-mensch
until mkdir $L 2>/dev/null; do sleep 10; done
echo "labor-welt-mensch K45-2 $(date -Iseconds) welt-mensch $NAME" > $L/besitzer.txt
echo "SCHLOSS $(date +%H:%M:%S)"
cd $WT
PORT=8913 node save-server.js > $D/ss-$NAME.txt 2>&1 &
SS=$!
n=0; until curl -s -o /dev/null http://127.0.0.1:8913/ || [ $n -gt 60 ]; do sleep 1; n=$((n+1)); done
rm -f $D/wb-$NAME.txt
node scripts/werkbank.cjs start --echt --seite http://127.0.0.1:8913 --port 8914 > $D/wb-$NAME.txt 2>&1 &
n=0; until grep -q "WERKBANK bereit" $D/wb-$NAME.txt || [ $n -gt 300 ]; do sleep 2; n=$((n+1)); done
echo "bereit nach $((n*2)) s"
node scripts/werkbank.cjs umstellen --ort wiese --sicht third --port 8914 > $D/umstellen-$NAME.txt 2>&1; echo "umstellen EXIT=$?"
node scripts/werkbank.cjs eval "$(cat $O/x-mensch.js)" --port 8914 > $D/x-$NAME.json 2>&1; sleep 20
node scripts/werkbank.cjs eval "$(cat $O/x-mensch.js)" --port 8914 > $D/x-$NAME.json 2>&1; cat $D/x-$NAME.json
POSE=$(node -e 'const t=require("fs").readFileSync(process.argv[1],"utf8");const j0=JSON.parse(t.slice(t.indexOf("{")));const j=j0.ergebnis||j0;if(!j.cam)process.exit(1);console.log([...j.cam,...j.ziel].map(v=>v.toFixed(3)).join(" "))' $D/x-$NAME.json)
echo "POSE $POSE"
if [ -n "$POSE" ]; then
  node scripts/werkbank.cjs bild $POSE --datei $O/welt-$NAME-armlaenge.png --w 1920 --h 1080 --ziel mensch --port 8914 > $D/bild-$NAME.txt 2>&1; echo "bild EXIT=$?"
fi
node scripts/werkbank.cjs stop --port 8914 > /dev/null 2>&1
kill $SS 2>/dev/null
grep -q "labor-welt-mensch K45-2" $L/besitzer.txt && rm -rf $L && echo "SCHLOSS GELOEST"
echo ECHT-FERTIG
