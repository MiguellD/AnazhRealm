#!/bin/sh
# K45-2: die Welt-Seite der Albedo-Tafel (werkbank albedo --tafel, Radeon), fuer den Nachzug der Zeile haut
WT=/c/Users/micha/AnazhRealm-profiband/.claude/worktrees/labor-welt-mensch
L=/c/Users/micha/AppData/Local/Temp/claude/gpu-schloss
D=/c/Users/micha/AppData/Local/Temp/claude/labor-welt-mensch
O=$WT/artifacts/profiband/welle-95/labor-welt-mensch
until mkdir $L 2>/dev/null; do sleep 10; done
echo "labor-welt-mensch K45-2 $(date -Iseconds) welt-albedo" > $L/besitzer.txt
cd $WT
PORT=8913 node save-server.js > $D/ss-albedo.txt 2>&1 &
SS=$!
n=0; until curl -s -o /dev/null http://127.0.0.1:8913/ || [ $n -gt 60 ]; do sleep 1; n=$((n+1)); done
rm -f $D/wb-albedo.txt
node scripts/werkbank.cjs start --echt --seite http://127.0.0.1:8913 --port 8914 > $D/wb-albedo.txt 2>&1 &
n=0; until grep -q "WERKBANK bereit" $D/wb-albedo.txt || [ $n -gt 300 ]; do sleep 2; n=$((n+1)); done
echo "bereit nach $((n*2)) s"
node scripts/werkbank.cjs umstellen --ort wiese --sicht third --port 8914 > $D/umstellen-albedo.txt 2>&1; echo "umstellen EXIT=$?"
node scripts/werkbank.cjs albedo --tafel --datei $O/albedo-welt.json --port 8914 > $D/albedo-welt.txt 2>&1; echo "albedo-welt EXIT=$?"
node scripts/werkbank.cjs stop --port 8914 > /dev/null 2>&1
kill $SS 2>/dev/null
grep -q "labor-welt-mensch K45-2" $L/besitzer.txt && rm -rf $L && echo "SCHLOSS GELOEST"
