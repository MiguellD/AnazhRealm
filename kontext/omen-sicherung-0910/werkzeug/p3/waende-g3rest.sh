#!/bin/bash
# CI 91c44f0f, Gruppe 3: Schritt 40 (Fernwald) rot, die folgenden 21 Schritte übersprungen — lokal auf dem Kopf.
cd /c/Users/micha/Desktop/AnazhRealm-OMEN/welle-m-nexus
P3=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3
LOG=$P3/waende-g3rest.log; : > $LOG
schritt() { local name=$1; shift; local t0=$(date +%s); "$@" > $P3/g3-$name.txt 2>&1; echo "$(date +%T) SCHRITT $name EXIT=$? ($(( $(date +%s) - t0 )) s)" | tee -a $LOG; }
schritt fernwald env FERNWALD_PORT=7900 npm run gate:fernwald
schritt luft-sicht env LUFT_PORT=7901 npm run gate:luft-sicht
schritt asset-inventory env ASSET_INVENTORY_PORT=7902 npm run gate:asset-inventory
schritt place-policy env PLACE_PORT=7903 npm run gate:place-policy
schritt vehicle-drive env DRIVE_PORT=7904 npm run gate:vehicle-drive
schritt garage-labor env GARAGE_LABOR_PORT=7905 npm run gate:garage-labor
schritt kampf-gefuehl env KAMPF_GEFUEHL_PORT=7906 npm run gate:kampf-gefuehl
schritt gegenstand-stoff npm run gate:gegenstand-stoff
schritt nervensystem-fachwerk env NERV_FACHWERK_PORT=7907 npm run gate:nervensystem-fachwerk
schritt fachwerk-contract npm run gate:fachwerk-contract
schritt studio-begehen env STUDIO_BEGEHEN_PORT=7908 npm run gate:studio-begehen
schritt tier-gang env TIER_GANG_PORT=7909 npm run gate:tier-gang
schritt daten-contract npm run gate:daten-contract
schritt foundry-crossfade env CROSSFADE_PORT=7900 npm run gate:foundry-crossfade
schritt v1-pfad env V1_PFAD_PORT=7901 npm run gate:v1-pfad
schritt wasser-leben env WASSER_LEBEN_PORT=7902 npm run gate:wasser-leben
schritt gpu-lens env IDLE_GPU_CHURN_PORT=7903 npm run gpu-lens
schritt analog-nah env ANALOG_NAH_PORT=7904 npm run gate:analog-nah
schritt kamera-treue env KAMERA_TREUE_PORT=7905 npm run gate:kamera-treue
schritt wasser-leben-bild env WASSER_LEBEN_PORT=7906 npm run gate:wasser-leben:bild
schritt look-lens env LOOK_PHYSICS_PORT=7907 npm run look-lens
schritt look-golden env LOOK_GOLDEN_PORT=7908 npm run look-golden
echo "$(date +%T) ENDE" | tee -a $LOG
