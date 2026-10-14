#!/bin/bash
cd /c/Users/micha/AnazhRealm-profiband/.claude/worktrees/boden-stufen
WERKBANK_PORT=8900 node scripts/werkbank.cjs stop 2>&1 | tail -1
for p in $(netstat -ano | grep -E ":890[01] .*LISTENING" | awk '{print $5}' | sort -u); do taskkill //F //PID $p > /dev/null 2>&1; done
rm -rf /c/Users/micha/AppData/Local/Temp/claude/gpu-schloss; echo "SCHLOSS frei"
