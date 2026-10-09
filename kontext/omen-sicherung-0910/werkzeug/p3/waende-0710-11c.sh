#!/bin/bash
# 0710-11 (3): die Wände des Tür-Schnitts (`_tickHausTueren`: Sekunden-Scan über die Plätze, Linse (H))
# Messfolge (seriell, Ports 7905–7909; der volle Playtest auf seinem :4312)
cd /c/Users/micha/Desktop/AnazhRealm-OMEN/welle-m-boosts
P3=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3
LOG=$P3/waende-0710-11c.log; : > $LOG
schritt() { local name=$1; shift; local t0=$(date +%s); "$@" > $P3/boosts/w3-$name.txt 2>&1; echo "$(date +%T) SCHRITT $name EXIT=$? ($(( $(date +%s) - t0 )) s)" | tee -a $LOG; }
schritt check npm run check
schritt lint npm run lint
schritt format npm run format:check
schritt brennglas-takt env BRENNGLAS_TAKT_PORT=7905 npm run gate:brennglas-takt
schritt haus-welt env HAUS_WELT_PORT=7906 npm run gate:haus-welt
schritt settlement env SETTLEMENT_PORT=7907 npm run gate:settlement
schritt portal-gestalt env PORTAL_GESTALT_PORT=7908 npm run gate:portal-gestalt
schritt playtest-fast env FAST_PORT=7907 npm run playtest:fast
schritt playtest npm run playtest
echo "$(date +%T) ENDE" | tee -a $LOG
