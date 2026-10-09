#!/bin/bash
cd /c/Users/micha/Desktop/AnazhRealm-OMEN/welle-m-nexus
P3=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3
LOG=$P3/waende-m1.log; : > $LOG
schritt() { local name=$1; shift; local t0=$(date +%s); "$@" > $P3/wm1-$name.txt 2>&1; echo "$(date +%T) SCHRITT $name EXIT=$? ($(( $(date +%s) - t0 )) s)" | tee -a $LOG; }
schritt check npm run check
schritt lint npm run lint
schritt format npm run format:check
schritt blocker-netz env BLOCKER_NETZ_PORT=7905 npm run gate:blocker-netz
schritt weltakt-wache env WELTAKT_WACHE_PORT=7906 npm run gate:weltakt-wache
schritt wetter-wache env WETTER_WACHE_PORT=7907 npm run gate:wetter-wache
schritt settlement env SETTLEMENT_PORT=7905 npm run gate:settlement
schritt fernwald env FERNWALD_PORT=7908 npm run gate:fernwald
schritt fahr-leben env FAHR_LEBEN_PORT=7906 npm run gate:fahr-leben
schritt vehicle-drive env DRIVE_PORT=7907 npm run gate:vehicle-drive
schritt kampf-gefuehl env KAMPF_GEFUEHL_PORT=7908 npm run gate:kampf-gefuehl
schritt ankunft env ANKUNFT_PORT=7909 npm run gate:ankunft
schritt werkstatt-weg env WERKSTATT_WEG_PORT=7905 npm run gate:werkstatt-weg
schritt gpu-lens env IDLE_GPU_CHURN_PORT=7906 npm run gpu-lens
schritt tier-separation env TIER_SEPARATION_PORT=7907 npm run gate:tier-separation
schritt v1-pfad env V1_PFAD_PORT=7908 npm run gate:v1-pfad
schritt playtest-fast env FAST_PORT=7909 npm run playtest:fast
schritt haus-welt env HAUS_WELT_PORT=7906 npm run gate:haus-welt
echo "$(date +%T) ENDE" | tee -a $LOG
