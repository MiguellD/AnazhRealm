#!/bin/bash
# 0710-10: die Wände des Brennglas-Schnitts (seriell, Ports 7905–7909; der volle Playtest auf seinem :4312)
cd /c/Users/micha/Desktop/AnazhRealm-OMEN/welle-m-brennglas
P3=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3
LOG=$P3/waende-0710-10.log; : > $LOG
schritt() { local name=$1; shift; local t0=$(date +%s); "$@" > $P3/glas/w-$name.txt 2>&1; echo "$(date +%T) SCHRITT $name EXIT=$? ($(( $(date +%s) - t0 )) s)" | tee -a $LOG; }
schritt brennglas-takt env BRENNGLAS_TAKT_PORT=7905 npm run gate:brennglas-takt
schritt blocker-netz env BLOCKER_NETZ_PORT=7906 npm run gate:blocker-netz
schritt settlement env SETTLEMENT_PORT=7907 npm run gate:settlement
schritt haus-welt env HAUS_WELT_PORT=7908 npm run gate:haus-welt
schritt portal-gestalt env PORTAL_GESTALT_PORT=7909 npm run gate:portal-gestalt
schritt portal-membran env PORTAL_MEMBRAN_PORT=7905 npm run gate:portal-membran
schritt portal-boot env PORTAL_PORT=7906 npm run gate:portal-boot
schritt portal-konformanz env PORTAL_KONFORMANZ_PORT=7907 npm run gate:portal-konformanz
schritt takt env TAKT_PORT=7908 npm run gate:takt
schritt werkstatt-weg env WERKSTATT_WEG_PORT=7909 npm run gate:werkstatt-weg
schritt v1-pfad env V1_PFAD_PORT=7905 npm run gate:v1-pfad
schritt playtest-fast env FAST_PORT=7906 npm run playtest:fast
schritt playtest npm run playtest
echo "$(date +%T) ENDE" | tee -a $LOG
