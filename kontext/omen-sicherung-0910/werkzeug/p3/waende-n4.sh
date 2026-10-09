#!/bin/bash
cd /c/Users/micha/Desktop/AnazhRealm-OMEN/welle-m-nexus
P3=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3
LOG=$P3/waende-n4.log; : > $LOG
schritt() { local name=$1; shift; local t0=$(date +%s); "$@" > $P3/wn4-$name.txt 2>&1; echo "$(date +%T) SCHRITT $name EXIT=$? ($(( $(date +%s) - t0 )) s)" | tee -a $LOG; }
schritt check npm run check
schritt lint npm run lint
schritt format npm run format:check
schritt blocker-netz env BLOCKER_NETZ_PORT=7905 npm run gate:blocker-netz
schritt koerper-bewegung env KOERPER_BEWEGUNG_PORT=7906 npm run gate:koerper-bewegung
schritt koerper-stand env KOERPER_STAND_PORT=7907 npm run gate:koerper-stand
schritt kopplung env KOPPLUNG_PORT=7908 npm run gate:kopplung
schritt schritt-klang env SCHRITT_KLANG_PORT=7905 npm run gate:schritt-klang
schritt fahr-leben env FAHR_LEBEN_PORT=7906 npm run gate:fahr-leben
schritt vehicle-drive env DRIVE_PORT=7907 npm run gate:vehicle-drive
schritt kampf-gefuehl env KAMPF_GEFUEHL_PORT=7908 npm run gate:kampf-gefuehl
schritt v1-pfad env V1_PFAD_PORT=7907 npm run gate:v1-pfad
schritt playtest-fast env FAST_PORT=7909 npm run playtest:fast
schritt haus-welt env HAUS_WELT_PORT=7906 npm run gate:haus-welt
echo "$(date +%T) ENDE" | tee -a $LOG
