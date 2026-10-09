#!/bin/bash
cd /c/Users/micha/Desktop/AnazhRealm-OMEN/welle-m-nexus
P3=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3
LOG=$P3/waende-n5.log; : > $LOG
schritt() { local name=$1; shift; local t0=$(date +%s); "$@" > $P3/wn5-$name.txt 2>&1; echo "$(date +%T) SCHRITT $name EXIT=$? ($(( $(date +%s) - t0 )) s)" | tee -a $LOG; }
schritt check npm run check
schritt lint npm run lint
schritt format npm run format:check
schritt blocker-netz env BLOCKER_NETZ_PORT=7905 npm run gate:blocker-netz
schritt tier-separation env TIER_SEPARATION_PORT=7906 npm run gate:tier-separation
schritt kreatur-leben npm run gate:kreatur-leben
schritt kreatur-takt env KREATUR_TAKT_PORT=7907 npm run gate:kreatur-takt
schritt kreatur-kosten env KREATUR_KOSTEN_PORT=7908 npm run gate:kreatur-kosten
schritt tier-gang env TIER_GANG_PORT=7909 npm run gate:tier-gang
schritt fahr-leben env FAHR_LEBEN_PORT=7905 npm run gate:fahr-leben
schritt vehicle-drive env DRIVE_PORT=7906 npm run gate:vehicle-drive
schritt playtest-fast env FAST_PORT=7909 npm run playtest:fast
schritt haus-welt env HAUS_WELT_PORT=7906 npm run gate:haus-welt
echo "$(date +%T) ENDE" | tee -a $LOG
