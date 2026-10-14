#!/bin/bash
# GPU-Schloss nehmen, save-server 8901 + Werkbank --echt 8900 (Radeon) starten
WT=/c/Users/micha/AnazhRealm-profiband/.claude/worktrees/boden-stufen
S=/c/Users/micha/AppData/Local/Temp/claude/boden-stufen
SCHLOSS=/c/Users/micha/AppData/Local/Temp/claude/gpu-schloss; ICH="K51-2 boden-stufen"
cd $WT
while ! mkdir $SCHLOSS 2>/dev/null; do
  alter=$(( $(date +%s) - $(stat -c %Y $SCHLOSS 2>/dev/null || date +%s) ))
  if [ $alter -gt 3600 ]; then echo "Schloss verwaist: $(cat $SCHLOSS/besitzer.txt)"; rm -rf $SCHLOSS; continue; fi
  sleep 15
done
echo "$ICH $1 $(date -Iseconds)" > $SCHLOSS/besitzer.txt; echo "SCHLOSS genommen"
(PORT=8901 node save-server.js > $S/save-8901.log 2>&1 &)
sleep 4
(node scripts/werkbank.cjs start --echt --port 8900 --seite http://localhost:8901 > $S/wb-echt.log 2>&1 &)
for i in $(seq 1 150); do grep -q "WERKBANK bereit" $S/wb-echt.log && break; sleep 2; done
grep 'bereit\|linse-gpu\|Error' $S/wb-echt.log | head -5
