#!/bin/bash
# 0710-11 (2): die Wände des zweiten Schnitts — Ladeschirm, Brennglas-Linsen (Fernziel, Beweger, Bindungs-Quell-Wand), takt T1/T2,
# Messfolge (seriell, Ports 7905–7909; der volle Playtest auf seinem :4312)
cd /c/Users/micha/Desktop/AnazhRealm-OMEN/welle-m-boosts
P3=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3
LOG=$P3/waende-0710-11b.log; : > $LOG
schritt() { local name=$1; shift; local t0=$(date +%s); "$@" > $P3/boosts/w2-$name.txt 2>&1; echo "$(date +%T) SCHRITT $name EXIT=$? ($(( $(date +%s) - t0 )) s)" | tee -a $LOG; }
schritt check npm run check
schritt lint npm run lint
schritt format npm run format:check
schritt brennglas-takt env BRENNGLAS_TAKT_PORT=7905 npm run gate:brennglas-takt
schritt raum-tags env RAUM_TAGS_PORT=7906 npm run gate:raum-tags
schritt takt env TAKT_PORT=7907 npm run gate:takt
schritt ankunft env ANKUNFT_PORT=7908 npm run gate:ankunft
schritt kreatur-takt env KREATUR_TAKT_PORT=7909 npm run gate:kreatur-takt
schritt blocker-netz env BLOCKER_NETZ_PORT=7905 npm run gate:blocker-netz
schritt v1-pfad env V1_PFAD_PORT=7906 npm run gate:v1-pfad
schritt playtest-fast env FAST_PORT=7907 npm run playtest:fast
schritt playtest npm run playtest
echo "$(date +%T) ENDE" | tee -a $LOG
