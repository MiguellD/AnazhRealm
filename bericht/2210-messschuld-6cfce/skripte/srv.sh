#!/bin/bash
# srv.sh <log> <befehl...> — save-server :7970 im Mess-Baum 6cfce28a (Pfad des Spielers wie M2/M15), EIN Befehl, Server weg.
WT=/c/Users/micha/AnazhRealm-profiband/.claude/worktrees/mess-6cfce
LOG=$1; shift
for p in $(netstat -ano | grep -E ":7970 .*(LISTEN|ABH)" | awk '{print $5}' | sort -u); do taskkill //F //T //PID $p > /dev/null 2>&1; done
(cd $WT && PORT=7970 node save-server.js > $LOG 2>&1 &)
for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:7970/ 2>/dev/null | grep -q 200 && break; sleep 1; done
curl -s http://localhost:7970/stamm/dirigent-kern.js | grep -o 'VERSION = "[0-9.]*"' | head -1
"$@"; rc=$?
for p in $(netstat -ano | grep -E ":7970 .*(LISTEN|ABH)" | awk '{print $5}' | sort -u); do taskkill //F //T //PID $p > /dev/null 2>&1; done
mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $(dirname $LOG)/ 2>/dev/null
exit $rc
