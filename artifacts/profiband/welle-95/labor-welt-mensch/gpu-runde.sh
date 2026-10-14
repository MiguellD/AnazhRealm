#!/bin/sh
# K45-2 GPU-Runde (Radeon 890M, ANGLE d3d11 / WebGPU): je Lauf das GPU-Schloss.
WT=/c/Users/micha/AnazhRealm-profiband/.claude/worktrees/labor-welt-mensch
S=/c/Users/micha/AppData/Local/Temp/claude/labor-welt-mensch
O=$WT/artifacts/profiband/welle-95/labor-welt-mensch
L=/c/Users/micha/AppData/Local/Temp/claude/gpu-schloss
schloss() { until mkdir $L 2>/dev/null; do sleep 10; done; echo "labor-welt-mensch K45-2 $(date -Iseconds) $1" > $L/besitzer.txt; echo "SCHLOSS $1 $(date +%H:%M:%S)"; }
frei() { grep -q "labor-welt-mensch K45-2" $L/besitzer.txt && rm -rf $L && echo "SCHLOSS GELOEST $(date +%H:%M:%S)"; }
cd $WT
schloss labor-alt; node $O/labor-mensch.cjs . 8911 $O alt --alt $S/alt 2>&1 | tail -2; frei
schloss labor-neu; node $O/labor-mensch.cjs . 8911 $O neu 2>&1 | tail -2; frei
#schloss albedo-labor; ALBEDO_PORT=8918 node scripts/diag-albedo-tafel.cjs --labor --echt --nur koerperstudio --datei $O/albedo-labor-koerperstudio.json > $S/albedo-labor.txt 2>&1; echo "albedo-labor EXIT=$?"; tail -4 $S/albedo-labor.txt; frei
#sh $O/welt-mensch.sh $WT nachher
echo GPU-RUNDE-FERTIG
