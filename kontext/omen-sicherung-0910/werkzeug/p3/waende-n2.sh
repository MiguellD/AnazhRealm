#!/bin/bash
cd /c/Users/micha/Desktop/AnazhRealm-OMEN/welle-m-nexus
P3=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3
LOG=$P3/waende-n2.log; : > $LOG
schritt() { local name=$1; shift; local t0=$(date +%s); "$@" > $P3/wn2-$name.txt 2>&1; echo "$(date +%T) SCHRITT $name EXIT=$? ($(( $(date +%s) - t0 )) s)" | tee -a $LOG; }
schritt check npm run check
schritt lint npm run lint
schritt format npm run format:check
schritt weltakt-wache env WELTAKT_WACHE_PORT=7906 npm run gate:weltakt-wache
schritt wetter-wache env WETTER_WACHE_PORT=7907 npm run gate:wetter-wache
schritt settlement env SETTLEMENT_PORT=7905 npm run gate:settlement
schritt playtest-fast env FAST_PORT=7909 npm run playtest:fast
echo "$(date +%T) ENDE" | tee -a $LOG
